from flask import Response, Flask, abort, jsonify, request, stream_with_context
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import docker
import boto3
from ProjectManager import ProjectManager
from dotenv import dotenv_values
import os


app = Flask(__name__)
CORS(app)
config = dotenv_values(".env")
# don't need to provide credentials when on EC2 if have IAM role
s3_client = boto3.client(
    service_name='s3',
    aws_access_key_id=config.get('AWS_ACCESS_KEY'),
    aws_secret_access_key=config.get('AWS_SECRET_ACCESS_KEY'),
    region_name=config.get('S3_REGION')
)

docker_client = docker.from_env()
dynamodb = boto3.client(
    'dynamodb',
    aws_access_key_id=config.get('AWS_ACCESS_KEY'),
    aws_secret_access_key=config.get('AWS_SECRET_ACCESS_KEY'),
    region_name=config.get('DYNAMO_REGION')
)

HOME_DIR = '/home/appuser'

PM = ProjectManager(s3_client, dynamodb, docker_client, config.get('DYNAMODB_TABLE_NAME'), config.get('AWS_S3_BUCKET_NAME'), HOME_DIR)

@app.route('/projects', methods=['POST'])
@cross_origin()
def create_project():
    """
    Creates execution environment for new project and uploads default files to AWS

    :project_name: name of the project (should be unique for user)
    :user_id: unique user ID
    :return: ID for the new docker container
    """
    data = request.form
    user_id = secure_filename(data.get('user_id'))
    project_name = secure_filename(data.get('project_name'))

    if not project_name:
        abort(400, description="Project name is required")
    if not user_id:
        abort(400, description="User ID is required")

    try:
        # Project files path on the server file system
        curr_path = os.getcwd()
        host_project_path = os.path.join(curr_path, user_id, project_name)

        os.makedirs(host_project_path, exist_ok=True)

        main_py_content = "print('Hello, World!')"
        requirements_txt_content = ""  # Add necessary python packages here

        # Write main.py and requirements.txt files
        with open(os.path.join(host_project_path, 'main.py'), 'w') as main_py_file:
            main_py_file.write(main_py_content)

        with open(os.path.join(host_project_path, 'requirements.txt'), 'w') as requirements_txt_file:
            requirements_txt_file.write(requirements_txt_content)
    except Exception as e:
        print(e)
        abort(500, description="Failed to create project")

    try:
        # Create Docker container and add the project as a volume
        container = docker_client.containers.run(
            "python-project",
            command='bash -c "pip install --user -r /home/appuser/{}/requirements.txt && tail -f /dev/null"'.format(project_name, project_name),
            user='appuser',
            working_dir='/home/appuser',
            detach=True,
            volumes={host_project_path: {'bind': f'/home/appuser/{project_name}', 'mode': 'rw'}},
            # runtime='runsc', <-- use this in production
        )
    except Exception as e:
        print(e)
        abort(500, description="Failed to create Docker container")


    try:
        # upload files to AWS
        PM.save_file(user_id, project_name, container.id, 'main.py', file_content=main_py_content)
        PM.save_file(user_id, project_name, container.id, 'requirements.txt', file_content=requirements_txt_content)
    except Exception as e:
        print(e)
        abort(500, description="Failed to upload files to AWS")

    return jsonify({"container_id": container.id})



@app.route('/projects/<project_name>', methods=['POST'])
@cross_origin()
def start_project(project_name):
    """
    Creates execution environment for existing project

    project_id: ID of the project to start
    project_name: name of the project (should be unique for user)
    user_id: unique user ID
    :return: ID for the new docker container
    """

    data = request.form
    user_id = secure_filename(data.get('user_id'))
    project_name = secure_filename(project_name)

    if not project_name or not user_id:
        abort(400, description="User ID and Project name are required")

    try:
        files = PM.get_project_files(user_id, project_name)
        if not files:
            abort(400, description="Project does not exist")
    except Exception as e:
        print(e)
        abort(500, description="Failed to get project files")

    try:
        # write file contents to server file system
        host_project_path = os.path.join(os.getcwd(), user_id, project_name)
        os.makedirs(host_project_path, exist_ok=True)

        for file_path, file_content in files.items():
            new_path = os.path.join(host_project_path, file_path)
            os.makedirs(os.path.dirname(new_path), exist_ok=True)  # Ensure directories exist
            with open(new_path, 'w+') as f:
                f.write(file_content['content'])
    except Exception as e:
        print(e)
        abort(500, description="Failed to create project")

    try:
        container = docker_client.containers.run(
                    "python-project",
                    command='bash -c "pip install --user -r /home/appuser/{}/requirements.txt && tail -f /dev/null"'.format(project_name, project_name),
                    user='appuser',
                    working_dir='/home/appuser',
                    detach=True,
                    volumes={host_project_path: {'bind': f'/home/appuser/{project_name}', 'mode': 'rw'}},
                    # runtime='runsc', <-- use this in production
                )
    except Exception as e:
        print(e)
        abort(500, description="Failed to create execution environment")

    return jsonify({'container_id': container.id})


@app.route('/execute/<container_id>', methods=['GET'])
def execute_code(container_id):
    print('executing code')
    # TODO make this more secure; need more than just container_id to execute files
    """
    :file_path: path to file to execute (including file name)
    :container_id: ID of the Docker container where the file is located
    :return: output of the file
    """
    max_execution_time = 20  # in seconds
    try:
        # Get the Docker container
        container = docker_client.containers.get(container_id)
    except Exception as e:
        print(e)
        abort(400, description="Invalid container ID")

    if container.status != 'running':
        print('container not running')
        container.start()
    try:
        # Execute the file
        data = request.args
        path_components = data.get('file_path', '').split('/')  # including file name
        secure_components = [secure_filename(c) for c in path_components]
        if not secure_components or not any(secure_components):
                abort(400, description="Invalid file path")
        file_path = os.path.join(*secure_components)
        exec_command = container.exec_run(f'timeout {max_execution_time} python3 -u /home/appuser/{file_path}',
                                          stream=True,
                                          detach=False,
                                          tty=True)

        def generate():
            for line in exec_command.output:
                yield f"data: {line.decode('utf-8')}\n\n"

        return Response(stream_with_context(generate()), mimetype="text/event-stream")


    except Exception as e:
        print(e)
        abort(500, description="Error while executing file or file does not exist")



@app.route('/projects/<project_name>/files', methods=['PUT'])
@cross_origin()
def update_file(project_name):
    """
    Updates or adds a file to the existing project

    project_name: name of the project (should be unique for user)
    user_id: unique user ID
    file_path: path of the file to update
    file_content: new content for the file
    :return: status message
    """

    data = request.form
    user_id = secure_filename(data.get('user_id'))
    file_content = data.get('file_content')

    path_components = data.get('file_path', '').split('/')  # including file name
    secure_components = [secure_filename(c) for c in path_components]

    if not project_name:
        abort(400, description="Project name is required")
    if not user_id:
        abort(400, description="User ID is required")
    if not secure_components or not any(secure_components):
        abort(400, description="File path is required")
    if file_content is None:  # allow empty strings as valid content
        abort(400, description="File content is required")

    # Path for the specific file to update or add
    host_file_path = os.path.join(user_id, *secure_components)
    # Update or create the file
    try:
        with open(host_file_path, 'w') as file:
            file.write(file_content)
    except Exception as e:
        print(e)
        abort(500, description="Error while updating file")


    return jsonify({"status": "File updated successfully"})



@app.route('/stop/<container_id>', methods=['POST'])
@cross_origin()
def stop_container(container_id):
    try:
        container = docker_client.containers.get(container_id)
        container.stop()
    except Exception as e:
        print(e)
        abort(400, description="Invalid container ID")

    return jsonify({'status': 'success'})


@app.route('/delete/<container_id>', methods=['POST'])
@cross_origin()
def delete_container(container_id):
    try:
        container = docker_client.containers.get(container_id)
        container.remove()
    except Exception as e:
        print(e)
        abort(400, description="Invalid container ID")

    return jsonify({'status': 'success'})


if __name__ == '__main__':

    app.run(debug=True, host='0.0.0.0')
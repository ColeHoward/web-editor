from flask import stream_with_context, Response


@app.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    # Fetch the project files from S3
    # This example assumes each project is stored as a .zip file in S3
    response = s3_client.get_object(Bucket='my-bucket', Key=f'{project_id}.zip')
    project_zip = response['Body'].read()

    # Extract the .zip file
    # This assumes you're running this on a system with the 'zipfile' module available
    # If not, you'll need to find another way to extract the .zip
    with zipfile.ZipFile(io.BytesIO(project_zip), 'r') as zip_ref:
        project_files = {name: zip_ref.read(name) for name in zip_ref.namelist()}

    # Start a new Docker container for the project
    container = docker_client.containers.run('python-project', detach=True)

    # Copy the project files into the Docker container
    # Each file is copied individually to maintain the project's directory structure
    for name, data in project_files.items():
        path, filename = os.path.split(name)
        docker_client.containers.get(container.id).put_archive(f'/home/appuser/{path}', {filename: data})

    # Return the ID of the Docker container to the client
    return jsonify({'container_id': container.id})



@app.route('/execute/<container_id>', methods=['POST'])
def execute_code(container_id):
    # Get the Docker container
    container = docker_client.containers.get(container_id)

    # Get the file to be executed from the request data
    file_name = request.get_json().get('file_name')

    # Execute the file in the Docker container, in detached mode
    result = container.exec_run(f'python {file_name}', detach=True)

    # Define a generator that yields the command's output in real-time
    def generate():
        for output in result.output:
            yield output.decode()

    # Return a streaming response to the client
    return Response(stream_with_context(generate()), mimetype='text/plain')

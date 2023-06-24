from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
import subprocess


app = Flask(__name__)
CORS(app)


@app.route('/execute', methods=['POST'])
@cross_origin()
def execute():
    code = request.get_json().get('code')
    print('code:', code)
    process = subprocess.Popen(['python', '-u', '-c', code], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    def generate():
        for line in iter(process.stdout.readline, ''):
            print('output:', line)
            yield f'data: "{repr(line)[1:-1]}"\n\n'
        for line in iter(process.stderr.readline, ''):
            print('error', line)
            yield f'data: "{repr(line)[1:-1]}"\n\n'
        process.wait()

    return Response(generate(), mimetype='text/event-stream')


@app.route('/', methods=['GET'])
@cross_origin()
def index():
    return "Gunicorn is working"


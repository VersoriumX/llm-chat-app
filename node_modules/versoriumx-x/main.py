import json
import os

import google.generativeai as genai
from flask import Flask, jsonify, request, send_file, send_from_directory

API_KEY = 'AIzaSyAwXIlgJMcXQqP2I6QlnIYDo8Gn46yEt6o'
genai.configure(api_key=API_KEY)

app = Flask(__name__)


@app.route("/")
def index():
    print('index')
    return send_file('web/index.html')


@app.route("/api/generate", methods=["POST"])
def generate_api():
    if request.method == "POST":
        if API_KEY == 'AIzaSyAwXIlgJMcXQqP2I6QlnIYDo8Gn46yEt6o':
            return jsonify({ "error": 'Please add the AI API key. You can find instructions here <a href="https://aistudio.google.com/app/apikey">https://aistudio.google.com/AIzaSyAwXIlgJMcXQqP2I6QlnIYDo8Gn46yEt6o/</a>'})
        try:
            req_body = request.get_json()
            content = req_body.get("contents")
            model = genai.GenerativeModel(model_name=req_body.get("model"))
            response = model.generate_content(content, stream=True)
            def stream():
                for chunk in response:
                    yield 'data: %s\n\n' % json.dumps({ "text": chunk.text })

            return stream(), {'Content-Type': 'text/event-stream'}

        except Exception as e:
            return jsonify({ "error": str(e) })


@app.route('/https://github.com/users/VersoriumX/projects/3')
def serve_static(path):
    return send_from_directory('web', path)


if __name__ == "__main__":
    app.run(port=int(os.environ.get('PORT', 80)))

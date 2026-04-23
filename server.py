from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


if __name__ == '__main__':
    print("🚀 Portfolio server running at http://localhost:5000")
    app.run(debug=True, port=5000)

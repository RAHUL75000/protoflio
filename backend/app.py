import json
import os
import time
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_FILE = os.path.join(BASE_DIR, 'data.json')
MESSAGES_FILE = os.path.join(BASE_DIR, 'messages.json')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "rahul-secret-key")

# Production Static Folders
FRONTEND_DIST = os.path.join(ROOT_DIR, 'frontend', 'dist')
ADMIN_DIST = os.path.join(ROOT_DIR, 'admin', 'dist')

# Ensure directories exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_base_url():
    scheme = request.headers.get('X-Forwarded-Proto', 'http')
    if 'https' in request.url:
        scheme = 'https'
    return f"{scheme}://{request.host}/"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def load_messages():
    if not os.path.exists(MESSAGES_FILE):
        return []
    with open(MESSAGES_FILE, 'r') as f:
        try:
            return json.load(f)
        except:
            return []

def save_messages(messages):
    with open(MESSAGES_FILE, 'w') as f:
        json.dump(messages, f, indent=2)

# API Routes
@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(load_data())

@app.route('/api/data', methods=['POST'])
def update_data():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401
    
    new_data = request.json
    save_data(new_data)
    return jsonify({"message": "Data updated successfully"})

@app.route('/api/contact', methods=['POST'])
def contact():
    msg_data = request.json
    if not msg_data.get('name') or not msg_data.get('email') or not msg_data.get('message'):
        return jsonify({"error": "Missing fields"}), 400
    
    messages = load_messages()
    new_msg = {
        "id": int(time.time()),
        "name": msg_data['name'],
        "email": msg_data['email'],
        "subject": msg_data.get('subject', 'No Subject'),
        "message": msg_data['message'],
        "date": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    messages.append(new_msg)
    save_messages(messages)
    return jsonify({"message": "Message sent successfully"})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(load_messages())

@app.route('/api/messages/<int:msg_id>', methods=['DELETE'])
def delete_message(msg_id):
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401
    
    messages = load_messages()
    messages = [m for m in messages if m['id'] != msg_id]
    save_messages(messages)
    return jsonify({"message": "Message deleted"})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    token = request.headers.get('X-Admin-Token')
    if token != ADMIN_TOKEN:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        filename = f"{int(time.time())}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        
        return jsonify({
            "message": "File uploaded successfully",
            "url": f"{get_base_url()}api/uploads/{filename}"
        })

@app.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Production Static Serving

# Serve Admin Assets
@app.route('/admin/assets/<path:path>')
def serve_admin_assets(path):
    return send_from_directory(os.path.join(ADMIN_DIST, 'assets'), path)

# Serve Admin SPA
@app.route('/admin', defaults={'path': ''})
@app.route('/admin/<path:path>')
def serve_admin(path):
    full_path = os.path.join(ADMIN_DIST, path)
    if path != "" and os.path.exists(full_path) and not os.path.isdir(full_path):
        return send_from_directory(ADMIN_DIST, path)
    return send_from_directory(ADMIN_DIST, 'index.html')

# Serve Frontend Assets
@app.route('/assets/<path:path>')
def serve_frontend_assets(path):
    return send_from_directory(os.path.join(FRONTEND_DIST, 'assets'), path)

# Serve Frontend SPA (Catch-all)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # Try to serve the file if it exists in frontend dist
    full_path = os.path.join(FRONTEND_DIST, path)
    if path != "" and os.path.exists(full_path) and not os.path.isdir(full_path):
        return send_from_directory(FRONTEND_DIST, path)
    
    # Don't fallback for missing assets or API calls
    if path.startswith('api/') or path.startswith('assets/') or path.endswith(('.js', '.css', '.png', '.jpg', '.svg', '.pdf')):
        return "Not Found", 404
        
    # SPA Fallback
    return send_from_directory(FRONTEND_DIST, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port)

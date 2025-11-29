from flask import Flask, request, jsonify
from models import Post
from database import init_db

app = Flask(__name__)

@app.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json()
    
    if not data or not all(k in data for k in ['title', 'content', 'author']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        post_id = Post.create(data['title'], data['content'], data['author'])
        return jsonify({'id': post_id, 'message': 'Post created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/posts', methods=['GET'])
def get_posts():
    try:
        posts = Post.get_all()
        posts_data = [{'id': p.id, 'title': p.title, 'content': p.content, 'author': p.author} 
                     for p in posts]
        return jsonify(posts_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    try:
        post = Post.get_by_id(post_id)
        if post:
            return jsonify({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'author': post.author
            }), 200
        else:
            return jsonify({'error': 'Post not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    try:
        if Post.delete(post_id):
            return jsonify({'message': 'Post deleted successfully'}), 200
        else:
            return jsonify({'error': 'Post not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
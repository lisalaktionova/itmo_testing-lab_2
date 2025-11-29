import sys
import os
import pytest
import json

# Добавляем корневую директорию проекта в Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import init_db, clear_db

@pytest.fixture
def client():
    # Настройка тестовой среды
    app.config['TESTING'] = True
    
    # Инициализация тестовой базы данных
    init_db()
    
    with app.test_client() as client:
        yield client
    
    # Очистка после тестов
    clear_db()

class TestBlogAPIIntegration:
    """Интеграционные тесты для Blog API"""
    
    def test_create_and_retrieve_post(self, client):
        """Тест интеграции: создание поста и его получение"""
        # Создание поста через API
        post_data = {
            'title': 'Test Post',
            'content': 'This is a test content',
            'author': 'Test Author'
        }
        
        # Тест 1: Успешное создание поста
        response = client.post('/posts', 
                             data=json.dumps(post_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'id' in data
        post_id = data['id']
        
        # Тест 2: Получение созданного поста
        response = client.get(f'/posts/{post_id}')
        assert response.status_code == 200
        post = json.loads(response.data)
        
        assert post['id'] == post_id
        assert post['title'] == post_data['title']
        assert post['content'] == post_data['content']
        assert post['author'] == post_data['author']
    
    def test_create_post_validation(self, client):
        """Тест интеграции: проверка валидации данных"""
        # Тест 3: Попытка создания поста с неполными данными
        invalid_data = {
            'title': 'Incomplete Post'
            # Отсутствуют content и author
        }
        
        response = client.post('/posts',
                             data=json.dumps(invalid_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_get_nonexistent_post(self, client):
        """Тест интеграции: попытка получения несуществующего поста"""
        # Тест 4: Запрос несуществующего поста
        response = client.get('/posts/9999')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_post_lifecycle(self, client):
        """Тест интеграции: полный жизненный цикл поста"""
        # Создание поста
        post_data = {
            'title': 'Lifecycle Post',
            'content': 'Testing full lifecycle',
            'author': 'Test User'
        }
        
        response = client.post('/posts',
                             data=json.dumps(post_data),
                             content_type='application/json')
        assert response.status_code == 201
        post_id = json.loads(response.data)['id']
        
        # Получение списка всех постов
        response = client.get('/posts')
        assert response.status_code == 200
        posts = json.loads(response.data)
        assert len(posts) == 1
        assert posts[0]['id'] == post_id
        
        # Тест 5: Удаление поста
        response = client.delete(f'/posts/{post_id}')
        assert response.status_code == 200
        
        # Проверка, что пост удален
        response = client.get(f'/posts/{post_id}')
        assert response.status_code == 404
    
    def test_multiple_posts_operations(self, client):
        """Тест интеграции: работа с несколькими постами"""
        # Создание нескольких постов
        posts_data = [
            {'title': f'Post {i}', 'content': f'Content {i}', 'author': f'Author {i}'}
            for i in range(3)
        ]
        
        created_ids = []
        for post_data in posts_data:
            response = client.post('/posts',
                                 data=json.dumps(post_data),
                                 content_type='application/json')
            assert response.status_code == 201
            created_ids.append(json.loads(response.data)['id'])
        
        # Проверка получения всех постов
        response = client.get('/posts')
        assert response.status_code == 200
        posts = json.loads(response.data)
        assert len(posts) == 3
        
        # Проверка корректности данных
        for i, post in enumerate(posts):
            assert post['title'] == f'Post {i}'
            assert post['content'] == f'Content {i}'
            assert post['author'] == f'Author {i}'
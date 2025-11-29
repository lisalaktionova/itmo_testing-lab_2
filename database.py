import sqlite3
import os

def get_db():
    db_path = os.path.join(os.path.dirname(__file__), 'test_blog.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            author TEXT NOT NULL
        )
    ''')
    db.commit()

def clear_db():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM posts')
    db.commit()
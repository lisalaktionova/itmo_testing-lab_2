from database import get_db

class Post:
    def __init__(self, id, title, content, author):
        self.id = id
        self.title = title
        self.content = content
        self.author = author

    @staticmethod
    def create(title, content, author):
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO posts (title, content, author) VALUES (?, ?, ?)",
            (title, content, author)
        )
        db.commit()
        return cursor.lastrowid

    @staticmethod
    def get_all():
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM posts")
        posts = cursor.fetchall()
        return [Post(*post) for post in posts]

    @staticmethod
    def get_by_id(post_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM posts WHERE id = ?", (post_id,))
        post = cursor.fetchone()
        if post:
            return Post(*post)
        return None

    @staticmethod
    def delete(post_id):
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        db.commit()
        return cursor.rowcount > 0
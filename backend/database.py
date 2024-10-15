from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import LONGTEXT

from datetime import datetime

db = SQLAlchemy()

class Users(db.Model):
    """
    Users table to store user information. Deletion of Users deletes all dependent entries.

    Attributes:
        user_id (int): Primary key, unique identifier for each user.
        user_email (str): Unique email address of the user.
        user_password (str): Password of the user.
        created_at (datetime): Timestamp when the account was created.
        s_text (relationship): Relationship to SearchText table.
        g_images (relationship): Relationship to GenerateImage table.
        sd_images (relationship): Relationship to SavedImage table.
    """
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key = True)
    user_email = db.Column(db.String(255), unique = True)
    user_password = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

    s_text = db.relationship('SearchText', backref='users',cascade='all, delete-orphan')
    g_images = db.relationship('GenerateImage', backref='users', cascade='all, delete-orphan')
    sd_images = db.relationship('SavedImage', backref='users', cascade='all, delete-orphan')

class SearchText(db.Model):
    """
    SearchText table to store text queries users use to search images.

    Attributes:
        s_image_id (int): Primary key, unique identifier for each searched image.
        user_id (int): Foreign key referencing Users table.
        s_text_content (str): Text query used to search images.
        created_at (datetime): Timestamp when the image was searced.
    """
    __tablename__ = 'SearchText'
    s_text_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    s_text_query = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default = datetime.now)

class GenerateImage(db.Model):
    """
    GenerateImage table to store generated images.

    Attributes:
        g_image_id (int): Primary key, unique identifier for each generated image.
        user_id (int): Foreign key referencing Users table.
        g_image_file_path (str): File path of the generated image.
        created_at (datetime): Timestamp when the image was generated.
    """
    __tablename__ = 'GenerateImage'
    g_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    g_image_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)

class SavedImage(db.Model):
    """
    SavedImage table to store information of images users save/like.

    Attributes:
        sd_image_id (int): Primary key, unique identifier for each saved image.
        user_id (int): Foreign key referencing Users table.
        sd_image_file_path (str): File path of the saved image.
        created_at (datetime): Timestamp when the saved image was created.
    """
    __tablename__ = 'SavedImage'
    sd_image_id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id', ondelete = 'CASCADE'))
    sd_image_path = db.Column(LONGTEXT)
    created_at = db.Column(db.DateTime, default = datetime.now)


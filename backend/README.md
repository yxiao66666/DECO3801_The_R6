# Backend

## Dependencies

- flask
- flask_cors
- flask_sqlalchemy
- sqlalchemy

> For the dependencies of the Stable Diffusion model, refer to [this documentation](backend\controlnet\README.md)

## Database

Our database is based on PHPMyAdmin and the application interacts with it using SQL Alchemy. The implementation provides a protection from malicious access requests such as SQL injection. The overview of the relational database is summarised in the below image:

<img src = '..\images\db.png' alt = 'database structure'>
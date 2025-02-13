# secure-file-share-2

First, remove the existing database since we're modifying the User model:
```
docker-compose exec backend rm db.sqlite3
```
Create fresh migrations for the authentication app:
```
docker-compose exec backend python manage.py makemigrations authentication
```
Apply the migrations:
```
docker-compose exec backend python manage.py migrate
```
Restart the Docker container:
```
docker-compose down backend
docker-compose build backend
docker-compose up backend
```

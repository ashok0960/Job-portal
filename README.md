for setup this full stack project
For front end 
  npm install
  npm run dev
For backend:
  python -m venv venv
  venv\Scripts\activate
  pip install -r requirements.txt
  python manage.py makemigrations
  python manage.py migrate
  
  for admin dashboard:
    py manage.py createsuparuser

  To run the system:
    py manage.py runserver

Most important for backend must execute in cmd prompt of system beacuse if you run this cmd in vs code then it show some error type.


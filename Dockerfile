FROM yeboyebo/ybapp:v1.0

COPY ./aqnext/ /app/

WORKDIR /app/clientes/diagnosis/

CMD python manage.py runserver 24100

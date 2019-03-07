ALLOWED_HOSTS = (
    'localhost',
    '192.168.122.1',
    '172.55.0.10'
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'yeboyebo_diagnosis',
        'USER': 'javier',
        'PASSWORD': '555zapato',
        'HOST': 'DB',
        'PORT': '5432',
        'ATOMIC_REQUESTS': False
    }
}

'''
USE_X_FORWARDED_HOST = True
FORCE_SCRIPT_NAME='/PRO/'
STATIC_URL = '/PRO/static/'
TEMPLATE_CONTEXT_PROCESSORS=('django.core.context_processors.request',)
DEBUG=False

'''
# ----------------CELERY---------------------------

BROKER_URL = "amqp://desarrollo:desarrollo@localhost:5672/desarrollo"

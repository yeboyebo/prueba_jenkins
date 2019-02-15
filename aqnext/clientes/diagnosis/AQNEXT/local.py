ALLOWED_HOSTS = (
    'localhost',
    '89.29.153.34'
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'yeboyebo_diagnosis',
        'USER': 'javier',
        'PASSWORD': '555zapato',
        'HOST': 'localhost',
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

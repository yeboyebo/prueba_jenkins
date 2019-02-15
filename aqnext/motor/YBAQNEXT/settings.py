"""
Django settings for AQNEXT project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""
from os import path
from AQNEXT.settings import PROJECT_ROOT

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'p-2uc#5f6$z+f9y@6ui%-w^cyi^ig6(amc($pc&3n17&z!bp1)'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'YBUTILS',
    'YBLEGACY',
    'YBWEB',
    'YBLOGIN',
    'YBSYSTEM'
)

MIDDLEWARE_CLASSES = (
    'YBUTILS.DbRouter.ThreadLocalMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'YBAQNEXT.urls'

WSGI_APPLICATION = 'AQNEXT.wsgi.application'

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'es'

TIME_ZONE = 'Europe/Madrid'

USE_I18N = True

USE_L10N = True

# Comentamos por problemas al sacar la hora actual de la base de datos
# USE_TZ = True

# DEFAULT_CHARSET = 'utf-8'
# FILE_CHARSET = 'utf-8'
# DEFAULT_CHARSET = 'iso-8859-15'
# FILE_CHARSET = 'iso-8859-15'
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/
STATIC_ROOT = path.join(PROJECT_ROOT, 'static').replace('\\', '/')
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
# Additional locations of static files
STATICFILES_DIRS = (
    path.join(PROJECT_ROOT, 'assets').replace('\\', '/'),
)

STATIC_URL = '/static/'

DEFAULT_FROM_EMAIL = True
# CONFIGURACION REST-FRAMEWORK-----------
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'YBUTILS.viewREST.error.YB_exception_handler',
    'NON_FIELD_ERRORS_KEY': '__ALL__',
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'brief': {
            'format': '%(message)s',
        },
        'default': {
            'format': '%(asctime)s %(levelname)-8s %(name)-30s %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'default',
        },
        'log_file_gunicorn': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': path.join(PROJECT_ROOT, 'logs/gunicorn.log'),
            'maxBytes': 1000,
            'formatter': 'default'
        },
        'log_file_django': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': path.join(PROJECT_ROOT, 'logs/django.log'),
            'maxBytes': 10000,
            'formatter': 'default'
        },
        'log_file_YEBOYEBO': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': path.join(PROJECT_ROOT, 'logs/yebo.log'),
            'maxBytes': 10000,
            'formatter': 'default'
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'DEBUG',
        },
        'gunicorn.error': {
            'level': 'INFO',
            'handlers': ['log_file_gunicorn'],
            'propagate': True,
        },
        'YEBOYEBO': {
            'handlers': ['log_file_YEBOYEBO'],
            'level': 'DEBUG',
        },
        'django': {
            'handlers': ['log_file_django'],
            'level': 'DEBUG',
        },
    }
}

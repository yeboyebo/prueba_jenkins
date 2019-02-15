from __future__ import absolute_import

import os

from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'AQNEXT.settings')
app = Celery('yeboyebo')
app.config_from_object('django.conf:settings')

# This linea le dice a celery donde debe buscar los tasks.py que se encuentran en las carpetas de las app
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

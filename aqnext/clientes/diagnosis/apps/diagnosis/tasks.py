from celery.task import periodic_task, task
from celery.schedules import crontab
from AQNEXT.celery import app
from YBLEGACY import qsatype
import time
from YBUTILS import notifications

# Will be running as crontab each 5 minutes
# @periodic_task(run_every=crontab(minute='*/5'))
# def each_5_minutes():
#     qsatype.debug('run task every 5 minute!')
#     return True


@app.task
def pruebacelerytask():
    time.sleep(1)
    qsatype.debug("realizo prueba")
    notifications.sendNotification("title", "body", "admin")

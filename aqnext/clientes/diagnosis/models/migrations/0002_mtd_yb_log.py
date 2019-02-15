# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('models', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='mtd_yb_log',
            fields=[
                ('id', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='id')),
                ('cliente', models.CharField(verbose_name='Cliente', db_column='cliente', max_length=100)),
                ('tipo', models.CharField(verbose_name='Tipo', db_column='tipo', max_length=100)),
                ('texto', models.TextField(verbose_name='Log', db_column='texto')),
                ('timestamp', models.DateTimeField(verbose_name='Ult.Sincro', db_column='timestamp')),
            ],
            options={
                'verbose_name': 'Registros de logs',
                'managed': True,
                'db_table': 'yb_log',
            },
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('models', '0002_mtd_yb_log'),
    ]

    operations = [
        migrations.CreateModel(
            name='mtd_yb_procesos',
            fields=[
                ('id', models.AutoField(db_column='id', primary_key=True, serialize=False, verbose_name='Identificador')),
                ('cliente', models.CharField(db_column='cliente', verbose_name='Cliente', max_length=100)),
                ('proceso', models.CharField(db_column='proceso', verbose_name='Proceso', max_length=100)),
                ('descripcion', models.TextField(db_column='descripcion', verbose_name='Descripción')),
                ('activo', models.BooleanField(db_column='activo', verbose_name='Activo', default=False)),
            ],
            options={
                'db_table': 'yb_procesos',
                'verbose_name': 'Procesos automáticos',
                'managed': True,
            },
        ),
    ]

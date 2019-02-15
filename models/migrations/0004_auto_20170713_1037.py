# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('models', '0003_mtd_yb_procesos'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='mtd_yb_regdiagnosis',
            options={'verbose_name': 'Registros de diagnósis', 'managed': True},
        ),
        migrations.AlterModelOptions(
            name='mtd_yb_subregdiagnosis',
            options={'verbose_name': 'Subregistros de diagnósis', 'managed': True},
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='mtd_clientes',
            fields=[
                ('codcliente', models.CharField(max_length=6, verbose_name='Código', db_column='codcliente', serialize=False, primary_key=True)),
                ('nombre', models.CharField(max_length=100, verbose_name='Nombre', db_column='nombre')),
                ('cifnif', models.CharField(max_length=20, verbose_name='C.I.F./N.I.F', db_column='cifnif')),
                ('nombrecomercial', models.CharField(null=True, verbose_name='Nombre comercial', db_column='nombrecomercial', max_length=100)),
                ('codgrupo', models.CharField(null=True, verbose_name='Grupo clientes', db_column='codgrupo', max_length=6)),
                ('telefono1', models.CharField(null=True, verbose_name='Teléfono 1', db_column='telefono1', max_length=30)),
                ('contacto', models.CharField(null=True, verbose_name='Contacto', db_column='contacto', max_length=100)),
                ('observaciones', models.TextField(null=True, verbose_name='Observaciones', db_column='observaciones')),
                ('codpago', models.CharField(null=True, verbose_name='Forma de pago', db_column='codpago', max_length=10)),
                ('codcuentadom', models.CharField(null=True, verbose_name='Domiciliar en', db_column='codcuentadom', max_length=6)),
                ('codcuentarem', models.CharField(null=True, verbose_name='Remesar en', db_column='codcuentarem', max_length=6)),
                ('coddivisa', models.CharField(null=True, verbose_name='Divisa', db_column='coddivisa', max_length=3)),
                ('codserie', models.CharField(max_length=2, verbose_name='Serie', db_column='codserie')),
                ('regimeniva', models.CharField(max_length=20, verbose_name='Régimen I.V.A.', db_column='regimeniva', default='General')),
                ('recargo', models.NullBooleanField(verbose_name='Aplicar recargo de equivalencia', db_column='recargo')),
                ('ivaincluido', models.NullBooleanField(verbose_name='Facturar con I.V.A. incluido', db_column='ivaincluido')),
                ('riesgomax', models.FloatField(null=True, verbose_name='Riesgo máximo autorizado', db_column='riesgomax')),
                ('riesgoalcanzado', models.FloatField(null=True, verbose_name='Riesgo alcanzado', db_column='riesgoalcanzado')),
                ('capitalimpagado', models.FloatField(null=True, verbose_name='Capital impagado', db_column='capitalimpagado')),
                ('copiasfactura', models.IntegerField(null=True, verbose_name='Copias por factura', db_column='copiasfactura', default=1)),
                ('codtiporappel', models.CharField(null=True, verbose_name='Tipo de rappel', db_column='codtiporappel', max_length=10)),
                ('codagente', models.CharField(null=True, verbose_name='Agente comercial', db_column='codagente', max_length=10)),
                ('telefono2', models.CharField(null=True, verbose_name='Teléfono 2', db_column='telefono2', max_length=30)),
                ('fax', models.CharField(null=True, verbose_name='Fax', db_column='fax', max_length=30)),
                ('email', models.CharField(null=True, verbose_name='E-mail', db_column='email', max_length=100)),
                ('web', models.CharField(null=True, verbose_name='Web', db_column='web', max_length=250)),
                ('codedi', models.CharField(null=True, verbose_name='Código edi (EAN)', db_column='codedi', max_length=17)),
                ('codsubcuenta', models.CharField(null=True, verbose_name='Subcuenta', db_column='codsubcuenta', max_length=15)),
                ('idsubcuenta', models.IntegerField(null=True, verbose_name='ID', db_column='idsubcuenta')),
                ('debaja', models.NullBooleanField(verbose_name='De baja', default=False, db_column='debaja')),
                ('fechabaja', models.DateField(null=True, verbose_name='Desde', db_column='fechabaja', default=None)),
                ('codcontacto', models.CharField(null=True, verbose_name='Contacto', db_column='codcontacto', max_length=6)),
                ('tipoidfiscal', models.CharField(max_length=25, verbose_name='Tipo Id. Fiscal', db_column='tipoidfiscal', default='NIF')),
                ('nombrepila', models.CharField(null=True, verbose_name='N.Pila', db_column='nombrepila', max_length=100)),
                ('apellidos', models.CharField(null=True, verbose_name='Apellidos', db_column='apellidos', max_length=200)),
                ('idusuarioalta', models.CharField(null=True, verbose_name='U.Alta', db_column='idusuarioalta', max_length=50)),
                ('fechaalta', models.DateField(null=True, verbose_name='F.Alta', db_column='fechaalta')),
                ('horaalta', models.TimeField(null=True, verbose_name='H.Alta', db_column='horaalta')),
                ('idusuariomod', models.CharField(null=True, verbose_name='U.Mod.', db_column='idusuariomod', max_length=50)),
                ('fechamod', models.DateField(null=True, verbose_name='F.Mod.', db_column='fechamod')),
                ('horamod', models.TimeField(null=True, verbose_name='H.Mod', db_column='horamod')),
            ],
            options={
                'verbose_name': 'Clientes',
                'managed': True,
                'db_table': 'clientes',
            },
        ),
        migrations.CreateModel(
            name='mtd_sis_acl',
            fields=[
                ('id', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='id')),
                ('usuario', models.CharField(null=True, max_length=20, blank=True)),
                ('grupo', models.TextField(null=True, blank=True)),
                ('tipo', models.CharField(max_length=10, verbose_name='Tipo', db_column='tipo', default='tabla')),
                ('valor', models.CharField(null=True, max_length=50, blank=True)),
                ('permiso', models.CharField(null=True, max_length=2, blank=True)),
            ],
            options={
                'verbose_name': 'Control de acceso',
                'managed': True,
                'db_table': 'sis_acl',
            },
        ),
        migrations.CreateModel(
            name='mtd_sis_gridconf',
            fields=[
                ('id', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='id')),
                ('usuario', models.CharField(null=True, max_length=20)),
                ('table', models.CharField(null=True, max_length=30, blank=True)),
                ('gridname', models.CharField(null=True, max_length=30)),
                ('configuration', models.TextField(null=True, blank=True)),
                ('fechaalta', models.DateField(null=True)),
            ],
            options={
                'verbose_name': 'Configuración de tabla',
                'managed': True,
                'db_table': 'sis_gridconf',
            },
        ),
        migrations.CreateModel(
            name='mtd_sis_usernotifications',
            fields=[
                ('id', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='id')),
                ('usuario', models.CharField(null=True, max_length=20, blank=True)),
                ('token', models.TextField(null=True, blank=True)),
                ('fechaalta', models.DateField(null=True)),
            ],
            options={
                'verbose_name': 'Notificaciones push',
                'managed': True,
                'db_table': 'sis_usernotifications',
            },
        ),
        migrations.CreateModel(
            name='mtd_yb_regdiagnosis',
            fields=[
                ('idreg', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='idreg')),
                ('cliente', models.CharField(max_length=50, verbose_name='Cliente', db_column='cliente')),
                ('tipo', models.CharField(max_length=50, verbose_name='Tipo', db_column='tipo')),
                ('timestamp', models.CharField(max_length=50, verbose_name='Ult.Sincro', db_column='timestamp')),
            ],
            options={
                'verbose_name': 'Registros de diagnosis',
                'managed': True,
                'db_table': 'yb_regdiagnosis',
            },
        ),
        migrations.CreateModel(
            name='mtd_yb_subregdiagnosis',
            fields=[
                ('idsubreg', models.AutoField(verbose_name='Identificador', serialize=False, primary_key=True, db_column='idsubreg')),
                ('idreg', models.IntegerField(verbose_name='Registro', db_column='idreg')),
                ('destino', models.CharField(max_length=50, verbose_name='Destino', db_column='destino')),
                ('timestamp', models.CharField(max_length=50, verbose_name='Ult.Sincro', db_column='timestamp')),
            ],
            options={
                'verbose_name': 'Subregistros de diagnosis',
                'managed': True,
                'db_table': 'yb_subregdiagnosis',
            },
        ),
    ]

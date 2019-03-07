from django.db import models
from YBLEGACY.FLUtil import FLUtil
from YBLEGACY.clasesBase import BaseModel
# from django.contrib.auth.models import User, Group


def _miextend(self, **kwargs):
    self._legacy_mtd = kwargs
    return self


models.Field._miextend = _miextend


class mtd_auth_group(models.Model):
    name = models.CharField(unique=True, max_length=80)

    class Meta:
        managed = False
        verbose_name = "Grupos"
        db_table = 'auth_group'


class mtd_auth_user(models.Model, BaseModel):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    password = models.CharField(max_length=128)._miextend()
    last_login = models.DateTimeField(blank=True, null=True)._miextend()
    is_superuser = models.BooleanField()._miextend()
    username = models.CharField(unique=True, max_length=30)._miextend()
    first_name = models.CharField(max_length=30)._miextend()
    last_name = models.CharField(max_length=30)._miextend()
    email = models.CharField(max_length=254)._miextend()
    is_staff = models.BooleanField()._miextend()
    is_active = models.BooleanField()._miextend()
    date_joined = models.DateTimeField()._miextend()

    class Meta:
        managed = False
        verbose_name = "Usuarios"
        db_table = 'auth_user'


class mtd_auth_user_groups(models.Model, BaseModel):
    user = models.ForeignKey(mtd_auth_user)
    group = models.ForeignKey(mtd_auth_group)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class mtd_sis_usernotifications(models.Model, BaseModel):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    usuario = models.CharField(blank=True, verbose_name=FLUtil.translate(u"Usuario", u"MetaData"), null=True, max_length=20)
    token = models.TextField(blank=True, verbose_name=FLUtil.translate(u"Token", u"MetaData"), null=True)
    fechaalta = models.DateField(null=True, verbose_name=FLUtil.translate(u"Fecha Alta", u"MetaData"))

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Notificaciones push", u"MetaData")
        db_table = 'sis_usernotifications'


class mtd_sis_acl(models.Model, BaseModel):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    usuario = models.CharField(blank=True, null=True, max_length=20)._miextend(OLDTIPO="STRING")
    grupo = models.TextField(blank=True, null=True)._miextend(OLDTIPO="STRING")
    tipo = models.CharField(db_column="tipo", verbose_name=FLUtil.translate(u"Tipo", u"MetaData"), default=u"tabla", max_length=10)._miextend(optionslist=u"tabla,accion,app", OLDTIPO="STRING")
    valor = models.CharField(blank=True, null=True, max_length=50)._miextend(OLDTIPO="STRING")
    # app = models.CharField(db_column="app", verbose_name="app", blank=True, null=True, max_length=50)._miextend(OLDTIPO="STRING")
    permiso = models.CharField(blank=True, null=True, max_length=2)._miextend(OLDTIPO="STRING")

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Control de acceso", u"MetaData")
        db_table = 'sis_acl'


class mtd_sis_gridfilter(models.Model, BaseModel):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    prefix = models.TextField(blank=True, null=True, max_length=100)._miextend(OLDTIPO="STRING")
    template = models.CharField(blank=True, null=True, max_length=50)._miextend(OLDTIPO="STRING")
    descripcion = models.CharField(db_column="descripcion", verbose_name="Descripcion", blank=True, null=True, max_length=150)._miextend(OLDTIPO="STRING")
    usuario = models.CharField(blank=True, null=True, max_length=20)._miextend(OLDTIPO="STRING")
    filtro = models.TextField(db_column="filtro", verbose_name=FLUtil.translate(u"Filtro", u"MetaData"), null=True)._miextend(OLDTIPO="STRINGLIST")
    inicial = models.NullBooleanField(db_column="inicial", verbose_name=FLUtil.translate(u"Inicial", u"MetaData"), default=False, null=True)._miextend(OLDTIPO="BOOL")
    fechaalta = models.DateField(db_column="fechaalta", verbose_name=FLUtil.translate(u"F.Alta", u"MetaData"), null=True)._miextend(OLDTIPO="DATE")

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Grid filter", u"MetaData")
        db_table = 'sis_gridfilter'

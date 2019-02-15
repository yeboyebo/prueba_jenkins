from django.db import models
from YBLEGACY.qsatype import FLUtil


def _miextend(self, **kwargs):
    self._legacy_mtd = kwargs
    return self


models.Field._miextend = _miextend


class mtd_sis_usernotifications(models.Model):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    usuario = models.CharField(blank=True, null=True, max_length=20)
    token = models.TextField(blank=True, null=True)
    fechaalta = models.DateField(null=True)

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Notificaciones push", u"MetaData")
        db_table = 'sis_usernotifications'


class mtd_sis_gridconf(models.Model):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    usuario = models.CharField(blank=False, null=True, max_length=20)
    table = models.CharField(blank=True, null=True, max_length=30)
    gridname = models.CharField(blank=False, null=True, max_length=30)
    configuration = models.TextField(blank=True, null=True)
    fechaalta = models.DateField(null=True)

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Configuración de tabla", u"MetaData")
        db_table = 'sis_gridconf'


class mtd_sis_acl(models.Model):
    id = models.AutoField(db_column="id", verbose_name=FLUtil.translate(u"Identificador", u"MetaData"), primary_key=True)._miextend(visiblegrid=False, OLDTIPO="SERIAL")
    usuario = models.CharField(blank=True, null=True, max_length=20)
    grupo = models.TextField(blank=True, null=True)
    tipo = models.CharField(db_column="tipo", verbose_name=FLUtil.translate(u"Tipo", u"MetaData"), default=u"tabla", max_length=10)._miextend(optionslist=u"tabla,accion,app", OLDTIPO="STRING")
    valor = models.CharField(blank=True, null=True, max_length=50)
    permiso = models.CharField(blank=True, null=True, max_length=2)

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Control de acceso", u"MetaData")
        db_table = 'sis_acl'

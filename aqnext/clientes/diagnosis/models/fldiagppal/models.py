from django.db import models

from YBLEGACY.FLUtil import FLUtil


def _miextend(self, **kwargs):
    self._legacy_mtd = kwargs
    return self


models.Field._miextend = _miextend


class mtd_yb_log(models.Model):

    id = models.AutoField(
        db_column="id",
        verbose_name=FLUtil.translate(u"Identificador", u"MetaData"),
        primary_key=True
    )._miextend(
        visiblegrid=False,
        OLDTIPO="SERIAL"
    )
    cliente = models.CharField(
        db_column="cliente",
        verbose_name=FLUtil.translate(u"Cliente", u"MetaData"),
        max_length=100
    )._miextend(
        OLDTIPO="STRING"
    )
    tipo = models.CharField(
        db_column="tipo",
        verbose_name=FLUtil.translate(u"Tipo", u"MetaData"),
        max_length=100
    )._miextend(
        OLDTIPO="STRING"
    )
    texto = models.TextField(
        db_column="texto",
        verbose_name=FLUtil.translate(u"Log", u"MetaData")
    )._miextend(
        OLDTIPO="STRING"
    )
    timestamp = models.DateTimeField(
        db_column="timestamp",
        verbose_name=FLUtil.translate(u"Ult.Sincro", u"MetaData")
    )._miextend(
        OLDTIPO="DATE"
    )

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Registros de logs", u"MetaData")
        db_table = u"yb_log"
        # app_label = "secondary"


class mtd_yb_regdiagnosis(models.Model):
    _YB_LEGACY = True
    idreg = models.AutoField(
        db_column="idreg",
        verbose_name=FLUtil.translate(u"Identificador", u"MetaData"),
        primary_key=True
    )._miextend(
        visiblegrid=False,
        OLDTIPO="SERIAL"
    )
    cliente = models.CharField(
        db_column="cliente",
        verbose_name=FLUtil.translate(u"Cliente", u"MetaData"),
        max_length=50
    )._miextend(
        OLDTIPO="STRING"
    )
    tipo = models.CharField(
        db_column="tipo",
        verbose_name=FLUtil.translate(u"Tipo", u"MetaData"),
        max_length=50
    )._miextend(
        OLDTIPO="STRING"
    )
    timestamp = models.CharField(
        db_column="timestamp",
        verbose_name=FLUtil.translate(u"Ult.Sincro", u"MetaData"),
        max_length=50
    )._miextend(
        OLDTIPO="STRING"
    )

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Registros de diagnosis", u"MetaData")
        db_table = u"yb_regdiagnosis"
        # app_label = "secondary"


class mtd_yb_subregdiagnosis(models.Model):
    _YB_LEGACY = True
    idsubreg = models.AutoField(
        db_column="idsubreg",
        verbose_name=FLUtil.translate(u"Identificador", u"MetaData"),
        primary_key=True
    )._miextend(
        visiblegrid=False,
        OLDTIPO="SERIAL"
    )
    idreg = models.IntegerField(
        db_column="idreg",
        verbose_name=FLUtil.translate(u"Registro", u"MetaData")
    )._miextend(
        OLDTIPO="UINT"
    )
    destino = models.CharField(
        db_column="destino",
        verbose_name=FLUtil.translate(u"Destino", u"MetaData"),
        max_length=50
    )._miextend(
        OLDTIPO="STRING"
    )
    timestamp = models.CharField(
        db_column="timestamp",
        verbose_name=FLUtil.translate(u"Ult.Sincro", u"MetaData"),
        max_length=50
    )._miextend(
        OLDTIPO="STRING"
    )

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Subregistros de diagnosis", u"MetaData")
        db_table = u"yb_subregdiagnosis"
        # app_label = "secondary"


class mtd_yb_procesos(models.Model):

    id = models.AutoField(
        db_column="id",
        verbose_name=FLUtil.translate(u"Identificador", u"MetaData"),
        primary_key=True
    )._miextend(
        visiblegrid=False,
        OLDTIPO="SERIAL"
    )
    cliente = models.CharField(
        db_column="cliente",
        verbose_name=FLUtil.translate(u"Cliente", u"MetaData"),
        max_length=100
    )._miextend(
        OLDTIPO="STRING"
    )
    proceso = models.CharField(
        db_column="proceso",
        verbose_name=FLUtil.translate(u"Proceso", u"MetaData"),
        max_length=100
    )._miextend(
        OLDTIPO="STRING"
    )
    descripcion = models.TextField(
        db_column="descripcion",
        verbose_name=FLUtil.translate(u"Descripción", u"MetaData")
    )._miextend(
        OLDTIPO="STRING"
    )
    activo = models.BooleanField(
        db_column="activo",
        verbose_name=FLUtil.translate(u"Activo", u"MetaData"),
        default=False,
        null=False
    )._miextend(
        OLDTIPO="BOOL"
    )

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Procesos automáticos", u"MetaData")
        db_table = u"yb_procesos"
        # app_label = "secondary"

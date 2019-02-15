# !/usr/bin/env python
# -*- coding: utf-8 -*-

from django.db import models

from YBLEGACY.FLUtil import FLUtil
from YBLEGACY.clasesBase import BaseModel


def _miextend(self, **kwargs):
    self._legacy_mtd = kwargs
    return self


models.Field._miextend = _miextend


class mtd_clientes(models.Model, BaseModel):
    codcliente = models.CharField(db_column="codcliente", verbose_name=FLUtil.translate(u"Código", u"MetaData"), primary_key=True, blank=False, max_length=6)._miextend(REQUIRED=True, OLDTIPO="STRING", RELATIONS1M=[{"table": "dirclientes", "field": "codcliente"}, {"table": "descuentosclientes", "field": "codcliente"}, {"table": "cuentasbcocli", "field": "codcliente"}, {"table": "articuloscli", "field": "codcliente"}, {"table": "contactosclientes", "field": "codcliente"}, {"table": "pedidoscli", "field": "codcliente"}, {"table": "albaranescli", "field": "codcliente"}, {"table": "facturascli", "field": "codcliente"}, {"table": "co_subcuentascli", "field": "codcliente"}, {"table": "i_facturascli", "field": "i_facturascli_codcliente"}, {"table": "co_operaciones349", "field": "codcliente"}, {"table": "tpv_datosgenerales", "field": "codcliente"}, {"table": "cl_proyectos", "field": "codcliente"}, {"table": "cl_incidencias", "field": "codcliente"}, {"table": "cl_comunicaciones", "field": "codcliente"}])
    nombre = models.CharField(db_column="nombre", verbose_name=FLUtil.translate(u"Nombre", u"MetaData"), blank=False, null=True, max_length=100)._miextend(REQUIRED=True, OLDTIPO="STRING")
    cifnif = models.CharField(db_column="cifnif", verbose_name=FLUtil.translate(u"C.I.F./N.I.F", u"MetaData"), blank=False, null=True, max_length=20)._miextend(REQUIRED=True, OLDTIPO="STRING")
    nombrecomercial = models.CharField(db_column="nombrecomercial", verbose_name=FLUtil.translate(u"Nombre comercial", u"MetaData"), blank=True, max_length=100)._miextend(OLDTIPO="STRING")
    codgrupo = models.CharField(db_column="codgrupo", verbose_name=FLUtil.translate(u"Grupo clientes", u"MetaData"), blank=True, max_length=6)._miextend(OLDTIPO="STRING")
    # codgrupo = models.ForeignKey("mtd_gruposclientes", db_column="codgrupo", verbose_name=FLUtil.translate(u"Grupo clientes", u"MetaData"), blank=True, max_length=6, to_field="codgrupo", on_delete=models.PROTECT, related_name="clientes_codgrupo__fk__gruposclientes_codgrupo")._miextend(OLDTIPO="STRING")
    telefono1 = models.CharField(db_column="telefono1", verbose_name=FLUtil.translate(u"Teléfono 1", u"MetaData"), blank=True, max_length=30)._miextend(OLDTIPO="STRING")
    contacto = models.CharField(db_column="contacto", verbose_name=FLUtil.translate(u"Contacto", u"MetaData"), blank=True, max_length=100)._miextend(visiblegrid=False, OLDTIPO="STRING")
    observaciones = models.TextField(db_column="observaciones", verbose_name=FLUtil.translate(u"Observaciones", u"MetaData"), blank=True)._miextend(OLDTIPO="STRINGLIST")
    codpago = models.CharField(db_column="codpago", verbose_name=FLUtil.translate(u"Forma de pago", u"MetaData"), blank=True, max_length=10)._miextend(OLDTIPO="STRING")
    # codpago = models.ForeignKey("mtd_formaspago", db_column="codpago", verbose_name=FLUtil.translate(u"Forma de pago", u"MetaData"), blank=True, max_length=10, to_field="codpago", on_delete=models.PROTECT, related_name="clientes_codpago__fk__formaspago_codpago")._miextend(OLDTIPO="STRING")
    codcuentadom = models.CharField(db_column="codcuentadom", verbose_name=FLUtil.translate(u"Domiciliar en", u"MetaData"), blank=True, max_length=6)._miextend(OLDTIPO="STRING")
    codcuentarem = models.CharField(db_column="codcuentarem", verbose_name=FLUtil.translate(u"Remesar en", u"MetaData"), blank=True, max_length=6)._miextend(OLDTIPO="STRING")
    # codcuentarem = models.ForeignKey("mtd_cuentasbanco", db_column="codcuentarem", verbose_name=FLUtil.translate(u"Remesar en", u"MetaData"), blank=True, max_length=6, to_field="codcuenta", on_delete=models.PROTECT, related_name="clientes_codcuentarem__fk__cuentasbanco_codcuenta")._miextend(OLDTIPO="STRING")
    coddivisa = models.CharField(db_column="coddivisa", verbose_name=FLUtil.translate(u"Divisa", u"MetaData"), blank=True, max_length=3)._miextend(OLDTIPO="STRING")
    # coddivisa = models.ForeignKey("mtd_divisas", db_column="coddivisa", verbose_name=FLUtil.translate(u"Divisa", u"MetaData"), blank=True, max_length=3, to_field="coddivisa", on_delete=models.PROTECT, related_name="clientes_coddivisa__fk__divisas_coddivisa")._miextend(OLDTIPO="STRING")
    codserie = models.CharField(db_column="codserie", verbose_name=FLUtil.translate(u"Serie", u"MetaData"), blank=False, null=True, max_length=2)._miextend(REQUIRED=True, OLDTIPO="STRING")
    # codserie = models.ForeignKey("mtd_series", db_column="codserie", verbose_name=FLUtil.translate(u"Serie", u"MetaData"), blank=False, null=True, max_length=2, to_field="codserie", on_delete=models.PROTECT, related_name="clientes_codserie__fk__series_codserie")._miextend(REQUIRED=True, OLDTIPO="STRING")
    regimeniva = models.CharField(db_column="regimeniva", verbose_name=FLUtil.translate(u"Régimen I.V.A.", u"MetaData"), default=FLUtil.translate(u"General", u"MetaData"), blank=False, null=True, max_length=20)._miextend(optionslist=FLUtil.translate(u"General", u"MetaData") + "," + FLUtil.translate(u"Exportaciones", u"MetaData") + "," + FLUtil.translate(u"U.E.", u"MetaData") + "," + FLUtil.translate(u"Exento", u"MetaData"), REQUIRED=True, OLDTIPO="STRING")
    recargo = models.NullBooleanField(db_column="recargo", verbose_name=FLUtil.translate(u"Aplicar recargo de equivalencia", u"MetaData"), blank=True)._miextend(OLDTIPO="BOOL")
    ivaincluido = models.NullBooleanField(db_column="ivaincluido", verbose_name=FLUtil.translate(u"Facturar con I.V.A. incluido", u"MetaData"), blank=True)._miextend(OLDTIPO="BOOL")
    riesgomax = models.FloatField(db_column="riesgomax", verbose_name=FLUtil.translate(u"Riesgo máximo autorizado", u"MetaData"), blank=True)._miextend(OLDTIPO="DOUBLE", partI=10, partD=2)
    riesgoalcanzado = models.FloatField(db_column="riesgoalcanzado", verbose_name=FLUtil.translate(u"Riesgo alcanzado", u"MetaData"), blank=True)._miextend(OLDTIPO="DOUBLE", partI=10, partD=2)
    capitalimpagado = models.FloatField(db_column="capitalimpagado", verbose_name=FLUtil.translate(u"Capital impagado", u"MetaData"), blank=True)._miextend(OLDTIPO="DOUBLE", partI=10, partD=2)
    copiasfactura = models.IntegerField(db_column="copiasfactura", verbose_name=FLUtil.translate(u"Copias por factura", u"MetaData"), default=1, blank=True)._miextend(OLDTIPO="UINT")
    codtiporappel = models.CharField(db_column="codtiporappel", verbose_name=FLUtil.translate(u"Tipo de rappel", u"MetaData"), blank=True, max_length=10)._miextend(OLDTIPO="STRING")
    # codtiporappel = models.ForeignKey("mtd_tiposrappel", db_column="codtiporappel", verbose_name=FLUtil.translate(u"Tipo de rappel", u"MetaData"), blank=True, max_length=10, to_field="codtiporappel", on_delete=models.PROTECT, related_name="clientes_codtiporappel__fk__tiposrappel_codtiporappel")._miextend(OLDTIPO="STRING")
    codagente = models.CharField(db_column="codagente", verbose_name=FLUtil.translate(u"Agente comercial", u"MetaData"), blank=True, max_length=10)._miextend(OLDTIPO="STRING")
    # codagente = models.ForeignKey("mtd_agentes", db_column="codagente", verbose_name=FLUtil.translate(u"Agente comercial", u"MetaData"), blank=True, max_length=10, to_field="codagente", on_delete=models.PROTECT, related_name="clientes_codagente__fk__agentes_codagente")._miextend(OLDTIPO="STRING")
    telefono2 = models.CharField(db_column="telefono2", verbose_name=FLUtil.translate(u"Teléfono 2", u"MetaData"), blank=True, max_length=30)._miextend(OLDTIPO="STRING")
    fax = models.CharField(db_column="fax", verbose_name=FLUtil.translate(u"Fax", u"MetaData"), blank=True, max_length=30)._miextend(OLDTIPO="STRING")
    email = models.CharField(db_column="email", verbose_name=FLUtil.translate(u"E-mail", u"MetaData"), blank=True, max_length=100)._miextend(OLDTIPO="STRING")
    web = models.CharField(db_column="web", verbose_name=FLUtil.translate(u"Web", u"MetaData"), blank=True, max_length=250)._miextend(OLDTIPO="STRING")
    codedi = models.CharField(db_column="codedi", verbose_name=FLUtil.translate(u"Código edi (EAN)", u"MetaData"), blank=True, max_length=17)._miextend(OLDTIPO="STRING")
    codsubcuenta = models.CharField(db_column="codsubcuenta", verbose_name=FLUtil.translate(u"Subcuenta", u"MetaData"), blank=True, max_length=15)._miextend(OLDTIPO="STRING")
    idsubcuenta = models.IntegerField(db_column="idsubcuenta", verbose_name=FLUtil.translate(u"ID", u"MetaData"), blank=True)._miextend(visiblegrid=False, OLDTIPO="UINT")
    # idsubcuenta = models.ForeignKey("mtd_co_subcuentas", db_column="idsubcuenta", verbose_name=FLUtil.translate(u"ID", u"MetaData"), blank=True, to_field="idsubcuenta", on_delete=models.PROTECT, related_name="clientes_idsubcuenta__fk__co_subcuentas_idsubcuenta")._miextend(visiblegrid=False, OLDTIPO="UINT")
    debaja = models.NullBooleanField(db_column="debaja", verbose_name=FLUtil.translate(u"De baja", u"MetaData"), default=False, blank=True)._miextend(OLDTIPO="BOOL")
    fechabaja = models.DateField(db_column="fechabaja", verbose_name=FLUtil.translate(u"Desde", u"MetaData"), default=None, blank=True)._miextend(OLDTIPO="DATE")
    codcontacto = models.CharField(db_column="codcontacto", verbose_name=FLUtil.translate(u"Contacto", u"MetaData"), blank=True, max_length=6)._miextend(OLDTIPO="STRING")
    tipoidfiscal = models.CharField(db_column="tipoidfiscal", verbose_name=FLUtil.translate(u"Tipo Id. Fiscal", u"MetaData"), default=u"NIF", blank=False, null=True, max_length=25)._miextend(optionslist=u"NIF,NIF/IVA,Pasaporte,Doc.Oficial País,Cert.Residencia,Otro", REQUIRED=True, OLDTIPO="STRING")
    nombrepila = models.CharField(db_column="nombrepila", verbose_name=FLUtil.translate(u"N.Pila", u"MetaData"), blank=True, max_length=100)._miextend(OLDTIPO="STRING")
    apellidos = models.CharField(db_column="apellidos", verbose_name=FLUtil.translate(u"Apellidos", u"MetaData"), blank=True, max_length=200)._miextend(OLDTIPO="STRING")
    idusuarioalta = models.CharField(db_column="idusuarioalta", verbose_name=FLUtil.translate(u"U.Alta", u"MetaData"), blank=True, max_length=50)._miextend(OLDTIPO="STRING")
    fechaalta = models.DateField(db_column="fechaalta", verbose_name=FLUtil.translate(u"F.Alta", u"MetaData"), blank=True)._miextend(OLDTIPO="DATE")
    horaalta = models.TimeField(db_column="horaalta", verbose_name=FLUtil.translate(u"H.Alta", u"MetaData"), blank=True)._miextend(OLDTIPO="TIME")
    idusuariomod = models.CharField(db_column="idusuariomod", verbose_name=FLUtil.translate(u"U.Mod.", u"MetaData"), blank=True, max_length=50)._miextend(OLDTIPO="STRING")
    fechamod = models.DateField(db_column="fechamod", verbose_name=FLUtil.translate(u"F.Mod.", u"MetaData"), blank=True)._miextend(OLDTIPO="DATE")
    horamod = models.TimeField(db_column="horamod", verbose_name=FLUtil.translate(u"H.Mod", u"MetaData"), blank=True)._miextend(OLDTIPO="TIME")

    class Meta:
        managed = True
        verbose_name = FLUtil.translate(u"Clientes", u"MetaData")
        db_table = u"clientes"
        # app_label = 'models'


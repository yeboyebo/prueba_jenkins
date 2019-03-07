#!/usr/bin/env python
# -*- coding: utf-8 -*-
from django.db import models

from YBLEGACY.FLAux import FLAux


class cteDB(object):
    # DEBUG:: Const Declaration:
    ftSTRING_ = 3
    # DEBUG:: Const Declaration:
    ftUINT_ = 17
    # DEBUG:: Const Declaration:
    ftBOOL_ = 18
    # DEBUG:: Const Declaration:
    ftDOUBLE_ = 19
    # DEBUG:: Const Declaration:
    ftDATE_ = 26
    # DEBUG:: Const Declaration:
    ftTIME_ = 27
    # DEBUG:: Const Declaration:
    ftSERIAL_ = 100
    # DEBUG:: Const Declaration:
    ftUNLOCK_ = 200


class FLFieldMetaData(cteDB):

    def __init__(self, field):
        self._field = field

    # TO DO
    ftSTRING_ = 3
    # DEBUG:: Const Declaration:
    ftUINT_ = 17
    # DEBUG:: Const Declaration:
    ftBOOL_ = 18
    # DEBUG:: Const Declaration:
    ftDOUBLE_ = 19
    # DEBUG:: Const Declaration:
    ftDATE_ = 26
    # DEBUG:: Const Declaration:
    ftTIME_ = 27
    # DEBUG:: Const Declaration:
    ftSERIAL_ = 100
    # DEBUG:: Const Declaration:
    ftUNLOCK_ = 200

    __resolverTIPO = {
        "STRING": 3,
        "INT": 17,
        "UINT": 17,
        "BOOL": 18,
        "DOUBLE": 19,
        "DATE": 26,
        "TIME": 27,
        "SERIAL": 100,
        "UNLOCK": 200
    }

    def type(self):
        try:
            return self.__resolverTIPO[self._field._legacy_mtd['OLDTIPO']]
        except Exception:
            # Intentar deducir tipo
            if self.isString():
                return self.ftSTRING_
            if self.isBoolean():
                return self.ftBOOL_

    def isUNLOCK(self):
        return (self.type() == self.ftUNLOCK_)

    # TO DO
    def alias(self):
        return self._field.verbose_name

    # TO DO
    def isString(self):
        if isinstance(self._field, models.CharField):
            return True
        if isinstance(self._field, models.TextField):
            return True
        return False

    # TO DO
    def isBoolean(self):
        if isinstance(self._field, models.BooleanField):
            return True
        return False

    # TO DO
    def visible(self):
        return True

    # TO DO
    def visibleGrid(self):
        try:
            self._field._legacy_mtd.visiblegrid
        except Exception:
            return True

    # TO DO
    def editable(self):
        try:
            self._field.editable
        except Exception:
            return True

    # TO DO
    def length(self):
        try:
            return self._field.max_length
        except Exception:
            print("error en FLFieldMetaData length")
            return 0

    # TO DO
    def allowNull(self):
        try:
            self._field.null
        except Exception:
            return False

    # TO DO
    def relationM1(self):
        return None

    def foreignFieldM1(self):
        try:
            return self._field.to_field
        except Exception:
            return None


class FLTableMetaData(object):
    """ Simula comportamiento de mtd a partir de model django
    """

    def __init__(self, model):
        self._model = model

    def primaryKey(self, bIncluirTabla=False):
        if bIncluirTabla:
            return self._model._meta.db_table + '.' + self._model._meta.pk.column
        else:
            return self._model._meta.pk.column

    def field(self, sCampo):
        try:
            field = self._model._meta.get_field(sCampo)
            return FLFieldMetaData(field)
        except Exception:
            return None

    def fieldList(self, bIncluirTabla=False):
        lista = []
        for field in self._model._meta.fields:
            if bIncluirTabla:
                lista.append(self._model._meta.db_table + '.' + field.column)
            else:
                lista.append(field.column)
        return ",".join(lista)

    def alias(self):
        try:
            self._model._meta.verbose_name
        except Exception:
            return self._model._meta.db_table

    def name(self):
        return self._model._meta.db_table

    def fieldForeignFieldM1(self, campo):
        try:
            return self.field(campo).foreignFieldM1()
        except Exception:
            return None

    def fieldType(self, campo):
        return self.field(campo).type()

    # TODO
    @property
    def FieldRelationM1(self):
        return None


class FLManager(object):
    """ Simula comportamiento de modelo de BBDD de QSA
    """
    @classmethod
    def metadata(cls, stabla):
        model = FLAux.obtener_modelo_simple(stabla)
        return FLTableMetaData(model)

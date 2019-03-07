#!/usr/bin/env python
# -*- coding: utf-8 -*-
import inspect

from django.forms.models import model_to_dict
from django.db.models.fields import NOT_PROVIDED

from YBUTILS import mylogging as log
from YBUTILS.viewREST import cacheController

from YBLEGACY.constantes import isNaN
from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLTransactional import FLTransactional
from YBLEGACY.FLAux import FLAux
from YBLEGACY.FLManager import FLManager

milog = log.getLogger("YBLEGACY.FLSqlCursor")


class FLSqlCursor(FLTransactional):
    """
    Clase Legacy que implementa cursor Similar al usable dentro de QT
    """
    Browse = 1
    Edit = 2
    Del = 3
    Insert = 4

    # Metodos para la gestion de modelos (Incluye el registro de funciones de evento)

    @classmethod
    def obtener_modelo(cls, stabla):
        return FLAux.obtener_modelo(stabla)

    # Inicializacion
    def __init__(self, stabla=None, cx=None):
        self._modo = 1  # Browse
        if stabla:
            (self._model, self._buffer_changed, self._before_commit, self._after_commit, self._buffer_commited, self._inicia_valores_cursor, self._buffer_changed_label, self._validate_cursor, self._validate_transaction, self._cursor_accepted) = self.obtener_modelo(stabla)
            self._stabla = self._model._meta.db_table
            self._metadata = FLManager.metadata(stabla)
        else:
            self._stabla = None
        # Propiedades para select
        self._select = None
        self._currentregister = None
        self._data = None
        self._dataList = None
        self._posicion = 0
        # Propiedades para Update/create/delete
        self._update = dict()
        self._activatedCommitActions = True
        self._activatedBufferChanged = False
        self._activatedBufferCommited = False
        self._cx = None

    # PUBLICOS
    def select(self, miselect):
        self._select = miselect
        misentencia = 'SELECT * FROM "' + self._stabla + '" WHERE ' + self._select
        try:
            datos = self._model.objects.raw(misentencia)
        except Exception:
            return False
        else:
            self._data = datos.__iter__()
            self._currentregister is None
            self._posicion = -1
            return True

    def first(self, breversed=False):
        if breversed:
            self.__pasarLista(True)
        try:
            self._currentregister = self._data.__next__()
        except Exception:
            self._posicion = -1
            self._data = None
            return False
        else:
            self._posicion = 0
            return True

    def at(self):
        return self._posicion

    def next(self):
        self.refreshBuffer()
        if self._data is None:
            return self.first()
        else:
            self._posicion += 1
            try:
                self._currentregister = self._data.__next__()
            except Exception:
                return False
            else:
                return True

    def previous(self):
        if self._data is None:
            return self.last()
        else:
            return self.next()

    def last(self):
        # Pendiente obtener todos en lista y reverse
        return self.first(True)

    def setModeAccess(self, modo):
        self._modo = modo

    def modeAccess(self):
        return self._modo

    def refreshBuffer(self):
        self._update = dict()
        if self.modeAccess() == self.Insert:
            self._currentregister = None
            # Valores por defecto
            # fs = self._model._meta.get_fields()
            fs = self._model._meta.fields
            for f in fs:
                if f.default != NOT_PROVIDED:
                    self._update[f.db_column] = f.default
            # PK
            if self._model._meta.pk._legacy_mtd["OLDTIPO"] == "SERIAL":
                pk = self._model._meta.pk.name
                q = FLSqlQuery()
                q.setSelect(u"nextval('" + self.table() + "_" + pk + "_seq')")
                q.setFrom("")
                q.setWhere("")
                if not q.exec_():
                    print("not exec sequence")
                    return None
                if q.first():
                    val = q.value(0)
                    self._update[pk] = val
                else:
                    return None

    # tratamiento buffer
    def valueBuffer(self, scampo):
        valor = None
        try:
            if scampo in self._update:
                valor = self._update[scampo]
            else:
                return self.valueBufferCopy(scampo)
        except Exception:
            return self.valueBufferCopy(scampo)

        if valor is not None:
            fd, a, b, c = self._model._meta.get_field_by_name(scampo)
            tipo = fd._legacy_mtd["OLDTIPO"]
            if scampo != "desc" and scampo != "pk" and fd.rel and valor is not None:
                valor = getattr(valor, fd.to_fields[0])
            # No convertimos serial porque se usan para concatenar en cadenas. Quizá tampoco hay que convertir los enteros
            if tipo == "DATE":
                valor = str(valor)
            elif tipo == "DOUBLE" and not isNaN(valor):
                valor = float(valor)
            elif tipo == "UINT" and not isNaN(valor):
                valor = int(valor)

        return valor

    def valueBufferCopy(self, scampo):
        current_reg = False
        try:
            if scampo in self._currentregister:
                valor = self._currentregister[scampo]
                current_reg = True
            else:
                valor = getattr(self._currentregister, scampo, None)
        except Exception:
            try:
                valor = getattr(self._currentregister, scampo)
            except Exception:
                return None

        if valor is not None:
            fd, a, b, c = self._model._meta.get_field_by_name(scampo)
            tipo = fd._legacy_mtd["OLDTIPO"]
            if scampo != "desc" and scampo != "pk" and fd.rel and valor is not None and not current_reg:
                valor = getattr(valor, fd.to_fields[0])
            # No convertimos serial porque se usan para concatenar en cadenas. Quizá tampoco hay que convertir los enteros
            if tipo == "DATE":
                valor = str(valor)
            elif tipo == "DOUBLE" and not isNaN(valor):
                valor = float(valor)
            elif tipo == "UINT" and not isNaN(valor):
                valor = int(valor)

        return valor

    def setValueBuffer(self, scampo, valor):
        if scampo != "desc" and scampo != "pk":
            try:
                f = self._model._meta.get_field(scampo)
            except Exception:
                return

            if f._legacy_mtd["OLDTIPO"] == "BOOL":
                if valor == "true" or valor == "True" or valor is True:
                    valor = True
                else:
                    valor = False
            if f._legacy_mtd["OLDTIPO"] == "DATE" and len(str(valor)) > 10:
                valor = str(valor)[:10]
            if f.rel and valor is not None:
                model = f.related_model
                q = {
                    f.to_fields[0]: valor
                }
                valor = model.objects.get(**q)
            if valor != self.valueBufferCopy(scampo):
                self._update[scampo] = valor
                if self._activatedBufferChanged:
                    self.buffer_changed_signal(scampo)

    def isNull(self, scampo):
        return self.valueBuffer(scampo) is None

    def isCopyNull(self, scampo):
        return self.valueBufferCopy(scampo) is None

    def setNull(self, scampo):
        if self.valueBufferCopy(scampo) is not None:
            self.setValueBuffer(scampo, None)

        # if self._activatedBufferChanged:
        #     self.buffer_changed_signal(scampo)

    def table(self):
        return self._stabla

    def cursorRelation(self):
        return None

    def action(self):
        return None

    def isValid(self):
        return True

    def commitBuffer(self):
        if self.before_commit_signal():
            if self._modo == 2:  # Edit
                try:
                    anterior = model_to_dict(self._currentregister)
                    for k, v in self._update.items():
                        setattr(self._currentregister, k, v)

                    self._currentregister.save(force_update=True)
                    # Forzamos que el valor del buffer sea el anterior para que sea accesible por ValueBufferCopy
                    self._currentregister = anterior
                    if self.after_commit_signal():
                        if self.buffer_commited_signal():
                            return True
                        else:
                            return False
                    else:
                        return False

                    return True
                except Exception as exc:
                    print(exc)
                    milog.error("Error al actualizar en %s ", self._stabla, exc.__str__())
                    milog.debug("Error edit %s %s", self._stabla, exc.__str__())
                    cacheController.setSessionVariable("ErrorHandler", exc.__str__())
                    return False
            elif self._modo == 3:  # Del
                try:
                    # Se guarda anterior porque si borra el registro no es posible acceder a sus datos en el after_commit
                    anterior = model_to_dict(self._currentregister)
                    for k, v in self._update.items():
                        setattr(self._currentregister, k, v)

                    self._currentregister.delete()
                    self._currentregister = anterior
                    if self.after_commit_signal():
                        if self.buffer_commited_signal():
                            return True
                        else:
                            return False
                    else:
                        return False
                except Exception as exc:
                    print(exc)
                    milog.error("Error al borrar en %s ", self._stabla, exc.__str__())
                    milog.debug("Error delete %s %s", self._stabla, exc.__str__())
                    cacheController.setSessionVariable("ErrorHandler", exc.__str__())
                    return False
                return True
            elif self._modo == 4:  # Insert
                try:
                    nuevo = self._model.objects.create(**self._update)
                    self._currentregister = nuevo
                    if self.after_commit_signal():
                        if self.buffer_commited_signal():
                            return True
                        else:
                            return False
                    else:
                        return False
                except Exception as exc:
                    print(exc)
                    milog.error("Error al insertar en %s ", self._stabla, exc.__str__())
                    milog.debug("Error insert %s %s", self._stabla, exc.__str__())
                    cacheController.setSessionVariable("ErrorHandler", exc.__str__())
                    return False
            else:
                return True

    def size(self):
        if not(self.__modolista()):
            if self._data is None:
                return 0

            self.__pasarLista()
        return len(self._dataList)

    def fieldType(self, field_name):
        try:
            return self._metadata.field(field_name).type()
        except Exception:
            return None

    def setUnLock(self, field_name, val):
        self.setValueBuffer(field_name, val)
        # self.refreshBuffer()

    # -----------------------------REVISAR
    def setActivatedCheckIntegrity(self, valor):
        pass

    def setActivatedCommitActions(self, activated_commitactions):
        self._activatedCommitActions = activated_commitactions

    def setActivatedBufferChanged(self, activated_bufferchanged):
        self._activatedBufferChanged = activated_bufferchanged

    def setActivatedBufferCommited(self, activated_buffercommited):
        self._activatedBufferCommited = activated_buffercommited

    def fields(self):
        return self._model._meta.fields

    def isModifiedBuffer(self):
        print("ismodified")
        return True

    # COMPATIBILIDAD---------------------------------------------------
    def primaryKey(self):
        return self._model._meta.pk.column

    def setContext(self, c):
        return True

    # PRIVADOS---------------------------------------------------------
    def __del__(self):
        try:
            del self._dataList
            del self._data
        except Exception:
            pass

    def __modolista(self):
        return not(self._dataList is None)

    def __pasarLista(self, breversed=False):
        lista = list(self._data)
        if breversed:
            self._dataList = lista.reverse_lazy()
        else:
            self._dataList = lista
        self._data = iter(lista)

    def __str__(self):
        return self.table()

    # SEÑALES EMITIDAS---------------------------------------------------------
    def buffer_changed_signal(self, scampo):
        if self._buffer_changed is None:
            return True

        return self._buffer_changed(scampo, self)

    def buffer_commited_signal(self):
        if not self._activatedBufferCommited:
            return True

        if self._buffer_commited is None:
            return True

        try:
            return self._buffer_commited(self)
        except Exception as exc:
            print("Error inesperado", exc)

    def before_commit_signal(self):
        if not self._activatedCommitActions:
            return True

        if self._before_commit is None:
            return True

        return self._before_commit(self)

    def after_commit_signal(self):
        if not self._activatedCommitActions:
            return True

        if self._after_commit is None:
            return True

        return self._after_commit(self)

    def inicia_valores_cursor_signal(self):
        if self._inicia_valores_cursor is None:
            return True

        return self._inicia_valores_cursor(self)

    def buffer_changed_label_signal(self, scampo):
        if self._buffer_changed_label is None:
            return {}

        expected_args = inspect.getargspec(self._buffer_changed_label)[0]
        if len(expected_args) == 3:
            return self._buffer_changed_label(self._model, scampo, self)
        else:
            return self._buffer_changed_label(scampo, self)

    def validate_cursor_signal(self):
        if self._validate_cursor is None:
            return True

        return self._validate_cursor(self)

    def validate_transaction_signal(self):
        if self._validate_transaction is None:
            return True

        return self._validate_transaction(self)

    def cursor_accepted_signal(self):
        if self._cursor_accepted is None:
            return True

        return self._cursor_accepted(self)

#!/usr/bin/env python
# -*- coding: utf-8 -*-
from YBLEGACY import FLManager


class IfaceAux():
    """ Esta clase permite publicar objeto en propiedad iface con metodos publicos
    """

    def __init__(self, miobj, public_methods=None):
        self._miobj = miobj
        for (A, B) in public_methods:
            setattr(self._miobj, A, getattr(self._miobj, B))

    @property
    def iface(self):
        return self._miobj


def dame_heredero_nivel_x(clase, metodo, idx_nivel):
    """Metodo que recibe una ase, el nombre de un metodo y numero de implementaciones
       hacia atras y devuelve el metodo
    """
    if metodo in clase.__dict__.keys():
        if idx_nivel == 0:
            return (clase, clase.__dict__[metodo])
        else:
            idx_nivel -= 1
    for padre in clase.__bases__:
        (miclase, mimetodo) = dame_heredero_nivel_x(padre, metodo, idx_nivel)
        if mimetodo:
            return (miclase, mimetodo)
    return (None, None)


def llama_super(nombre, clase):
    """Funcion(decorador) que permite llamar al metodo super pasandole nombre y clase
    """

    def _wrapper(self, *args, **kwds):
        if isinstance(self, type):
            # Metodo de clase
            return getattr(clase, nombre)(*args, **kwds)
        else:
            # Metodo self
            return getattr(super(), nombre)(*args, **kwds)
    return _wrapper


class MCinheritanceUnderscore(type):
    """Metaclase que permite que se use __ para llamar al metodo padre
    """
    def __new__(cls, name, parents, dct):
        dct2 = dict()
        for attr, item in dct.items():
            if callable(item):
                dct2["__" + attr] = None
        dct.update(dct2)
        miclase = type.__new__(cls, name, parents, dct)
        for attr, item in dct.items():
            if callable(item) and not attr.startswith("__"):
                setattr(miclase, "__" + attr, llama_super(attr, miclase))
        return miclase


class HerenciaUnderscore(object, metaclass=MCinheritanceUnderscore):
    """ Clase que realiza herencia underscore mediante metaclase
        y permite la asignacion de elementos nulos
        Debido al maggling resulta necesario eliminarlo en las funciones que
        empiezan por __
    """

    def __getattr__(self, name):
        aux = None
        # Si hay maggling
        if name.startswith("_") and name.find("__") > 0:
            ilen = name.find("__")
            name = name[ilen:]
            aux = getattr(self, name, None)
        # Para permitir establecer valores a None
        if aux:
            return aux
        else:
            setattr(self, name, None)
            return None


class CambioUnderscore(object):
    # POR LIO REALIZADO ENTRE METODOS SIN Y CON _
    def __init__(self):
        self.__LOCKGETATTR = False

    def __getattr__(self, name):
        if self.__LOCKGETATTR:
            return None
        if name[0] == "_":
            saux = name[1:]
        else:
            saux = "_" + name
        self.__LOCKGETATTR = True
        aux = getattr(self, saux)
        self.__LOCKGETATTR = False
        if aux:
            return aux
        else:
            # Para permitir establecer valores
            self.__LOCKGETATTR = True
            setattr(self, name, None)
            self.__LOCKGETATTR = False
            return None


class ManagerBD(FLManager.cteDB):
    """ Esta clase permite el uso de metodos del manager de BBDD
    """
    @classmethod
    def debug(cls, *args):
        try:
            print(*args)
        except Exception:
            pass

    @classmethod
    def _managerDB(cls):
        try:
            aux = cls.__flManager
        except Exception:
            aux = FLManager.FLManager()
            cls.__flManager = aux
        return cls.__flManager

    @classmethod
    def _dameWhereId(cls, tabla, idt):
        mgr = cls._managerDB()
        table_mtd = mgr.metadata(tabla)
        primary_key = table_mtd.primaryKey()
        where = cls._dameWhereCampo(tabla, idt, primary_key)
        return where

    @classmethod
    def _dameWhereCampo(cls, tabla, val, campo):
        mgr = cls._managerDB()
        table_mtd = mgr.metadata(tabla)
        field_mtd = table_mtd.field(campo)
        where = tabla + "." + campo + " = "
        if field_mtd.isString():
            where += "'" + val + "'"
        else:
            where += str(val)
        return where

    # PENDIENTES, VALORES DEFECTO
    @classmethod
    def _dameAlineacion(cls, field_mtd=None):
        return u"Centro"

    @classmethod
    def _dameLongitud(cls, field_mtd=None):
        return 60

"""
    Esta clases permiten el acceso registrando unas clases con un nombre y la posterior invocacion de metodos.
    Se asegura que la instancia de cada clase es unica (OJO ENTRE LLAMADAS?).
    A su vez permite el registro de factorias para su posterior uso sin
    dependencias cruzadas
"""
from YBUTILS.MetaClases import FlyWeight


class Factoria(object):
    __metaclass__ = FlyWeight
    """
        Registro de objetos unicos ()
        Factoria("PEPE").registrar(nombre,objeto)
    """

    def __init__(self, nombreKey):
        self._setKey(nombreKey)
        super().__init__()

    # PUBLICOS
    def registrar(self, clave, obj):
        self.__damecoleccion()[clave] = obj

    def get(self, clave):
        # claveModulo = self._dameClave(clave)
        return self.__damecoleccion()[clave]

    def invocar(self, clave, metodo, *args, **kwargs):
        met = getattr(self.__damecoleccion()[clave], metodo)
        if args or kwargs:
            return met(*args, **kwargs)
        else:
            return met()

    def invocarAll(self, metodo, *args, **kwargs):
        for value in self.__damecoleccion().values():
            met = None
            try:
                met = getattr(value, metodo)
            except Exception:
                pass
            if met:
                try:
                    if (args) or (kwargs):
                        met(*args, **kwargs)
                    else:
                        met()
                except Exception:
                    pass

    # PRIVADOS---------------------------------------------------
    def _dameClave(self, clave):
        oReg = self.__damecoleccion()["YBRegistros"]

        claveFactoria = clave
        tipoFactoria = "formRecord"
        if clave.startswith("formRecord"):
            tipoFactoria = clave[:10]
            claveFactoria = clave[10:]
        elif clave.startswith("master"):
            tipoFactoria = clave[:10]
            claveFactoria = clave[6:]

        for appName in oReg:
            if claveFactoria in oReg[appName] and not oReg[appName][claveFactoria] is None:
                if clave.startswith(tipoFactoria):
                    if tipoFactoria in oReg[appName][claveFactoria]:
                        return tipoFactoria + oReg[appName][claveFactoria][tipoFactoria]
        return clave

    def __damecoleccion(self):
        try:
            aux = self.__micol_ASD
            return aux
        except Exception:
            self.__micol_ASD = dict()
        return self.__micol_ASD

    @classmethod
    def _setKey(cls, mikey):
        cls.__key = mikey


class _metaFactoria(dict):
    pass


MetaFactoria = _metaFactoria()

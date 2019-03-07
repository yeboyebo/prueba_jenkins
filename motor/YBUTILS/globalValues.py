"""
    Permite el uso de variables globales dentro del proceso
"""
import threading
from YBLEGACY.FLAux import FLAux


def registrarmodulos():
    FLAux.registrarmodulos()


def registra_rest():
    return FLAux.registrar_rest()


miglobals = threading.local()


def setValue(scadena, value):
    try:
        miglobals.__YB_DICT[scadena] = value
    except Exception:
        miglobals.__YB_DICT = dict()
        miglobals.__YB_DICT[scadena] = value


def getValue(scadena, defect=None):
    try:
        return miglobals.__YB_DICT.get(scadena, defect)
    except Exception:
        return defect

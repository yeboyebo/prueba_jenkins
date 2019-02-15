import math

from django.conf import settings

from YBLEGACY import Factorias
from YBUTILS import ObjDictJSON
from YBUTILS.DbRouter import dameConexionDef
from YBUTILS.DbRouter import get_current_user
from YBUTILS.DbRouter import get_current_request
from YBUTILS.DbRouter import get_current_virtualenv


def listaVacia():
    return ObjDictJSON.milista()


def ObjetoVacio():
    return ObjDictJSON.ObjDictJSON()


def ustr(*args):
    try:
        return "".join(args)
    except Exception:
        vacio = []
        for s in args:
            try:
                valor = "" + s
            except Exception:
                valor = str(s)
            vacio.append(valor)
        return "".join(vacio)


def parseInt(valor):
    if valor is None:
        return 0
    else:
        try:
            return int(valor)
        except Exception:
            return 0


def parseFloat(valor):
    if valor is None:
        return 0
    else:
        try:
            return float(valor)
        except Exception:
            return 0


def parseString(objeto):
    try:
        return objeto.toString()
    except Exception:
        return str(objeto)


def isNaN(valor):
    try:
        valor = float(valor)
    except Exception:
        return True

    return math.isnan(valor)


class SysType(object):

    # Se usa en QSA para determinar si hay un cliente con interfaz gráfica activo. En Django no lo hay nunca. Las llamadas en QSA deben tener en cuenta la respuesta "Django" aparte de true o false
    @classmethod
    def interactiveGUI(cls):
        return "Django"

    @classmethod
    def nameUser(cls):
        user = get_current_user()
        if not user or isinstance(user, str):
            return user
        return user.username

    @classmethod
    def userGroups(cls):
        user = get_current_user()
        if not user or isinstance(user, str):
            return user
        groups = []
        for g in user.groups.all():
            groups.append(g.name)
        return groups

    @classmethod
    def isLoadedModule(cls, module):
        try:
            Factorias.FactoriaModulos.get(module)
        except Exception:
            return False

        return True

    @classmethod
    def translate(cls, sCadena, contexto=None):
        return sCadena

    @classmethod
    def nameBD(cls):
        try:
            micon = dameConexionDef()
            return str(micon.settings_dict["NAME"])
        except Exception:
            return ""

    @classmethod
    def isInProd(cls):
        ve = get_current_virtualenv()
        if ve == "/var/www/django/dev" or ve == "/var/www/dev/django":
            return False
        return True

    @classmethod
    def request(cls):
        return get_current_request()

    @classmethod
    def infoMsgBox(cls, a):
        pass

    @classmethod
    def warnMsgBox(cls, a):
        pass

    @classmethod
    def errorMsgBox(cls, a):
        pass

    @classmethod
    def transactionLevel(cls):
        # Mas adelante revisar, ahora parece que devolver 0 es lo mejor (sin transaccion)
        return 0

    @classmethod
    def projectRoot(cls):
        return settings.PROJECT_ROOT

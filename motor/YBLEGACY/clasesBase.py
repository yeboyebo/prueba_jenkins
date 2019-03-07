import re
from datetime import datetime

from YBLEGACY import UtilMIMIX
from YBLEGACY.constantes import *


class BaseModulos(object):

    def debug(*args):
        try:
            print(args)
        except Exception:
            pass

    def desktopUI(self):
        return False


class BaseObjetos(UtilMIMIX.HerenciaUnderscore):

    def debug(*args):
        try:
            print(args)
        except Exception:
            pass

    def desktopUI(self):
        return False

    def initValidation(self, *args, **kwargs):
        return True

    def iniciaValoresLabel(self, *args, **kwargs):
        return {}

    def bChLabel(self, *args, **kwargs):
        return {}

    def getFilters(self, *args, **kwargs):
        return []

    def getForeignFields(self, *args, **kwargs):
        return []

    def getDesc(self, *args, **kwargs):
        return None

    def get_model_info(self, *args, **kwargs):
        return None


class BaseModel():

    def initValidation(model, name, data=None):
        return model.getIface().initValidation(name, data)

    def iniciaValoresLabel(model, template=None, cursor=None, data=None):
        return model.getIface().iniciaValoresLabel(model, template, cursor, data)

    def bChLabel(model, fN=None, cursor=None):
        return model.getIface().bChLabel(fN, cursor)

    def getFilters(model, model_name, filter_name, data=None):
        return model.getIface().getFilters(model_name, filter_name, data)

    def getForeignFields(model, template=None):
        return model.getIface().getForeignFields(model, template)

    def getDesc(model):
        return model.getIface().getDesc()

    def get_model_info(model, data, pag=None, template=None, where_filter=None):
        try:
            return model.getIface().get_model_info(model, data, pag, template, where_filter)
        except AttributeError:
            return None


class miDatetime():

    def init(self, *args):
        try:
            if len(args) >= 6:
                self.obj = miDatetime2(int(args[0]), int(args[1]), int(args[2]), int(args[3]), int(args[4]), int(args[5]))
            elif len(args) >= 3:
                self.obj = miDatetime2(int(args[0]), int(args[1]), int(args[2]))
            elif len(args) > 0:
                if isinstance(args[0], str):
                    aTime = args[0].split("T")
                    if len(aTime) > 1:
                        self.obj = miDatetime2(int(aTime[0][0:4]), int(aTime[0][5:7]), int(aTime[0][8:10]), int(aTime[1][0:2]), int(aTime[1][3:5]), int(aTime[1][6:8]))
                    else:
                        aTime = args[0].split(" ")
                        if len(aTime) > 1:
                            self.obj = miDatetime2(int(aTime[0][0:4]), int(aTime[0][5:7]), int(aTime[0][8:10]), int(aTime[1][0:2]), int(aTime[1][3:5]), int(aTime[1][6:8]))
                        else:
                            self.obj = miDatetime2(int(aTime[0][0:4]), int(aTime[0][5:7]), int(aTime[0][8:10]))
                elif isinstance(args[0], miDatetime2):
                    self.obj = args[0]
                elif isinstance(args[0], datetime):
                    self.obj = miDatetime2(args[0].year, args[0].month, args[0].day, args[0].hour, args[0].minute, args[0].second)
                else:
                    self.obj = False
            else:
                self.obj = miDatetime2.today()
        except Exception:
            self.obj = False

        return self.obj


class miDatetime2(datetime):

    def toString(self):
        return ustr(self.strftime("%Y-%m-%d"), "T", self.strftime("%H:%M:%S"))

    def __str__(self):
        return self.toString()

    def getTime(self):
        epoch = datetime(1970, 1, 1, 0, 0, 0)
        return (self - epoch).total_seconds() * 1000

    def getDate(self):
        return self.day

    def getDay(self):
        return self.day

    def getMonth(self):
        return self.month

    def getYear(self):
        return self.year

    def getHours(self):
        return self.hour

    def getMinutes(self):
        return self.minute

    def getSeconds(self):
        return self.second

    def parse(self, date=None):
        return miDatetime().init(date).toString()

    def now(self):
        n = str(super().now())
        return n[:19]


def RegExp(strRE):
    if strRE[-2:] == "/g":
        strRE = strRE[:-2]

    if strRE[:1] == "/":
        strRE = strRE[1:]

    return qsaRegExp(strRE)


class qsaRegExp(object):

    strRE_ = None
    result_ = None

    def __init__(self, strRE):
        print("Nuevo Objeto RegExp de " + strRE)
        self.strRE_ = strRE

    def search(self, text):
        print("Buscando " + self.strRE_ + " en " + text)
        self.result_ = re.search(self.strRE_, text)

    def cap(self, i):
        if self.result_ is None:
            return None

        try:
            return self.result_.group(i)
        except Exception:
            return None

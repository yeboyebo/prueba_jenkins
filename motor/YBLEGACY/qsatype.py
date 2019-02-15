#!/usr/bin/env python
# -*- coding: utf-8 -*-
from YBLEGACY.clasesBase import BaseModulos
from YBLEGACY.clasesBase import BaseObjetos
from YBLEGACY.clasesBase import miDatetime
from YBLEGACY.clasesBase import RegExp
from YBLEGACY.UtilMIMIX import MCinheritanceUnderscore
from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLSqlCursor import FLSqlCursor
from YBLEGACY.FLManager import FLManager
from YBLEGACY.AQSql import AQSql
from YBLEGACY.FLUtil import FLUtil
from YBLEGACY import Factorias

from YBUTILS import ObjDictJSON
from YBUTILS import mylogging

MC = MCinheritanceUnderscore
milog = mylogging.getLogger("YBLEGACY")
Date = miDatetime().init
Array = ObjDictJSON.milista
Object = ObjDictJSON.ObjDictJSON
FormDBWidget = BaseModulos
AQSql = AQSql
AQSqlQuery = FLSqlQuery
FLSqlCursor = FLSqlCursor
FLSqlQuery = FLSqlQuery
FLManager = FLManager
FLUtil = FLUtil
FactoriaModulos = Factorias.FactoriaModulos
objetoBase = BaseObjetos
# TODO
QDialog = object
QTable = object
QVBoxLayout = object
QLabel = object
FLListViewItem = object
FLDomNode = object
FLReportViewer = object
RegExp = RegExp


def funAux(*args):
    return True


def fun(arg=None, arg2=None):
    return funAux


Function = fun


def Boolean():
    return None


def debug(*args, **kwargs):
    milog.debug(*args, **kwargs)

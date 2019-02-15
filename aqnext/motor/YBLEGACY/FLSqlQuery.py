#!/usr/bin/env python
# -*- coding: utf-8 -*-
import re

from django.db import connections

from YBUTILS import mylogging as log
from YBUTILS.DbRouter import dameConexionDef
from YBLEGACY.FLTransactional import FLTransactional

milog = log.getLogger("YBLEGACY.FLSqlQuery")


class FLSqlQuery(FLTransactional):

    def __init__(self, name='', cx=None):
        self._sSELECT = ""
        self._columns = []
        self._sWHERE = ""
        self._sFROM = ""
        self._sORDER = ""
        self.__tables = []
        self._sTablas = ""
        self._cursor = None
        self._datos = None
        self._posicion = None
        self._row = None
        self._connection = cx

    def setSelect(self, select):
        self._sSELECT = select
        self._columns = []
        # for scolumna in self._sSELECT.split(","):
        for scolumna in re.split(',(?![^(]*\))', self._sSELECT):
            self._columns.append(scolumna.strip().upper())

    def select(self):
        return self._sSELECT

    def setFrom(self, str_from):
        self._sFROM = str_from

    def From(self):
        return self._sFROM

    def setWhere(self, where):
        self._sWHERE = where

    def where(self):
        return self._sWHERE

    def setOrderBy(self, orderby):
        self._sORDER = orderby

    def orderBy(self):
        return self._sORDER

    def setTablesList(self, tablas):
        self._sTablas = tablas
        self._tables = []
        for stable in self._sTablas.split(","):
            self._tables.append(stable.strip().upper())

    def sql(self):
        str_sql = "SELECT " + self._sSELECT
        if self._sFROM:
            str_sql += " FROM " + self._sFROM
        if self._sWHERE:
            str_sql += " WHERE " + self._sWHERE
        if self._sORDER:
            str_sql += " ORDER BY " + self._sORDER
        return str_sql

    def setForwardOnly(self, valor):
        pass

    def exec(self):
        try:
            micursor = self.__damecursor(self._connection)
            micursor.execute(self.sql())
            self._cursor = micursor
        except Exception as exc:
            print("Error FlSqlQuery:", exc)
            milog.debug("Error FlSqlQuery:", exc)
            return False
        else:
            return True

    def exec_(self):
        return self.exec()

    def first(self):
        self._posicion = 0
        if self._datos:
            self._row == self._datos[0]
            return True
        else:
            try:
                self._row = self._cursor.fetchone()
                if self._row is None:
                    return False
                else:
                    return True
            except Exception:
                return False

    def next(self):
        if self._posicion is None:
            self._posicion = 0
        else:
            self._posicion += 1
        if self._datos:
            if self._posicion >= len(self._datos):
                return False
            self._row = self._datos[self._posicion]
            return True
        else:
            try:
                self._row = self._cursor.fetchone()
                if self._row is None:
                    return False
                else:
                    return True
            except Exception:
                return False

    def last(self):
        self.__cargarDatos()
        if self._datos:
            self._posicion = len(self._datos) - 1
            self._row == self._datos[self._posicion]
        else:
            return False

    def prev(self):
        self._posicion -= 1
        if self._datos:
            if self._posicion < 0:
                return False
            self._row == self._datos[self._posicion]
            return True
        else:
            return False

    def size(self):
        self.__cargarDatos()
        if self._datos:
            return len(self._datos)
        else:
            return 0

    def value(self, field_name):
        i = self.__damePosDeCadena(field_name)
        return self._row[i]

    def isNull(self, field_name):
        i = self.__damePosDeCadena(field_name)
        return (self._row[i] is None)

    def __del__(self):
        try:
            del self._datos
            self._cursor.close()
            del self._cursor
        except Exception:
            pass

    def __cargarDatos(self):
        if not self._datos:
            self._datos = self._cursor.fetchall()

    # TODO execSql y __damecursor no pertencen a este fichero
    def execSql(self, sql, connection=None):
        try:
            if not connection:
                connection = self._connection
            micursor = self.__damecursor(connection)
            micursor.execute(sql)

            if "SELECT" in sql or "select" in sql:
                return micursor.fetchall()
        except Exception as exc:
            print("Error execSql:", exc)
            milog.debug("", exc)
            return False
        else:
            return True

    @classmethod
    def __damecursor(cls, connection):
        if connection:
            return connections[connection].cursor()
        else:
            return dameConexionDef().cursor()

    def __damePosDeCadena(self, field_name):
        if isinstance(field_name, int):
            return field_name
        else:
            try:
                return self._columns.index(field_name.strip().upper())
            except Exception as e:
                try:
                    str_aux = field_name.split(".")[-1]
                except Exception:
                    str_aux = field_name
                i = 0
                for x in self._cursor.description:
                    if x.name == str_aux:
                        return i
                    i += 1
                raise NameError("Error columna " + field_name)

    def getQueryHeaders(self):
        columns = []
        for scolumna in self._columns:
            ind = scolumna.lower().strip().split(" as ")
            if len(ind) > 1:
                columns.append(ind[1].strip())
            else:
                columns.append(ind[0].strip())
        return columns

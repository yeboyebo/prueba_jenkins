#!/usr/bin/env python
# -*- coding: utf-8 -*-
from YBLEGACY.FLUtil import FLUtil


class AQSql(FLUtil):
    Browse = 1
    Edit = 2
    Del = 3
    Insert = 4

    @classmethod
    def del_(cls, stabla, swhere):
        return cls.sqlDelete(stabla, swhere)

    @classmethod
    def update(cls, stabla, campos, valores, where):
        # campos y valores se reciben como array hay que convertirlo en string, valores ademas puede contener campos que no son string
        campos = ','.join(campos)
        valores = ','.join(map(str, valores))
        return cls.sqlUpdate(stabla, campos, valores, where)

    @classmethod
    def database(cls, cx):
        return None

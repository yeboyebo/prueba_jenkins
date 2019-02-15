# @class_declaration interna #
from YBLEGACY import qsatype
from django.contrib.auth.models import User, Group


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration oficial #
from YBLEGACY.constantes import *
from YBUTILS.viewREST import clasesBase


class oficial(interna):

    def oficial_changeRule(self, oR, nR):
        if oR == "rw":
            if nR == "write":
                return "r-"
            else:
                return "--"
        elif oR == "r-":
            if nR == "write":
                return "rw"
            else:
                return "--"
        elif oR == "--":
            if nR == "write":
                return "rw"
            else:
                return "r-"
        elif oR == "-w":
            # Este caso nunca se debe dar
            if nR == "write":
                return "--"
            else:
                return "rw"
        return "--"

    def oficial_checkAppPermision(self, tipoAcl, valorAcl, tipo, valor, objPermiso, app):
        # print("hay que ver el padre y cambiar permiso si contrario")
        q = qsatype.FLSqlQuery()
        q.setTablesList(u"sis_acl")
        q.setSelect(u"id, permiso")
        q.setFrom(u"sis_acl")
        q.setWhere(ustr(tipoAcl, u" = '", valorAcl, u"' AND tipo = 'app' AND valor = '", app, "'"))
        if not q.exec_():
            return True

        if q.next():
            # print(q.value(0), q.value(1))
            if q.value("permiso") == "--" and objPermiso == "read":
                if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", "r-", ustr(u"id = '", str(q.value("id")), "'")):
                    return False
            elif q.value("permiso") == "--" and objPermiso == "write":
                if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", "rw", ustr(u"id = '", str(q.value("id")), "'")):
                    return False
            else:
                query = qsatype.FLSqlQuery()
                query.setTablesList(u"sis_acl")
                query.setSelect(u"distinct(permiso)")
                query.setFrom(u"sis_acl")
                query.setWhere(ustr("app  = '", app, "'"))
                if not query.exec_():
                    return False

                # No existe regla para este caso
                elif query.size() == 1:
                    query.next()
                    if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", str(query.value(0)), ustr(u"id = '", str(q.value("id")), "'")):
                        return False
                else:
                    print(query.size())
                    print("este caso no se que es")
        return True

    def oficial_manageAcl(self, tipoAcl, valorAcl, tipo, valor, objPermiso, app, fromApp):
        q = qsatype.FLSqlQuery()
        q.setTablesList(u"sis_acl")
        q.setSelect(u"id, permiso")
        q.setFrom(u"sis_acl")
        q.setWhere(ustr(tipoAcl, u" = '", valorAcl, u"' AND tipo = '", tipo, u"' AND valor = '", valor, "'"))
        if not q.exec_():
            # print("Algo fallo?")
            return False

        # No existe regla para este caso
        if q.size() == 0:
            if objPermiso == "write":
                permiso = "r-"
            else:
                permiso = "--"
            if fromApp:
                permiso = objPermiso
            if not qsatype.FLUtil.execSql(ustr(u"INSERT INTO sis_acl (", tipoAcl, ", tipo, valor, app, permiso) VALUES ('", valorAcl, u"', '", tipo, u"', '", valor, "', '", app, u"', '", permiso, "')")):
                return False

        # Cambiamos la regla actual
        if q.next():
            idSisAcl = q.value("id")
            permisoSisAcl = q.value("permiso")
            if fromApp:
                permiso = objPermiso
            else:
                permiso = self.iface.changeRule(permisoSisAcl, objPermiso)
            # print(permiso)
            # if objPermiso == "write":
            #     permiso = permisoSisAcl[0] + self.iface.changeRule(permisoSisAcl[1], "w")
            # else:
            #     permiso = self.iface.changeRule(permisoSisAcl[0], "r") + permisoSisAcl[1]
            if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", permiso, ustr(u"id = '", str(idSisAcl), "'")):
                return False
            if app and not fromApp:
                # print("hay que ver el padre")
                if not self.iface.checkAppPermision(tipoAcl, valorAcl, tipo, valor, objPermiso, app):
                    return False
        return permiso

    # def oficial_manageAcl(self, tipoAcl, valorAcl, tipo, valor, permiso, app, fromApp):
    #     idSisAcl = qsatype.FLUtil.sqlSelect(u"sis_acl", u"id", ustr(tipoAcl, u" = '", valorAcl, u"' AND tipo = '", tipo, u"' AND valor = '", valor, "'"))
    #     if idSisAcl:
    #         if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", permiso, ustr(u"id = '", str(idSisAcl), "'")):
    #             return False
    #         if app and not fromApp:
    #             print("hay que ver el padre y cambiar permiso si contrario")
    #             q = qsatype.FLSqlQuery()
    #             q.setTablesList(u"sis_acl")
    #             q.setSelect(u"id, permiso")
    #             q.setFrom(u"sis_acl")
    #             q.setWhere(ustr(tipoAcl, u" = '", valorAcl, u"' AND tipo = 'app' AND valor = '", app, "'"))
    #             if not q.exec_():
    #                 print("no tengo regla???")

    #             if q.next():
    #                 print(q.value(0), q.value(1))
    #                 if q.value("permiso") == "--" and permiso == "rw":
    #                     print("hay que cambiar el permiso", permiso)
    #                     if not qsatype.FLUtil.sqlUpdate(u"sis_acl", u"permiso", permiso, ustr(u"id = '", str(q.value("id")), "'")):
    #                         return False
    #     if not idSisAcl:
    #         if not qsatype.FLUtil.execSql(ustr(u"INSERT INTO sis_acl (", tipoAcl, ", tipo, valor, permiso) VALUES ('", valorAcl, u"', '", tipo, u"', '", valor, "', '", permiso, u"')")):
    #             return False
    #     return True

    def oficial_changePermision(self, model, oParam):
        # print(oParam)
        tipo = oParam["tipo"]
        tipoAcl = oParam["tipoAcl"]
        valorAcl = None
        valor = oParam["rule"]
        # permiso = "--" if oParam["valor"] else "rw"
        try:
            if tipoAcl == "usuario":
                user = User.objects.filter(id=oParam["pk"])
                valorAcl = user[0].username
            # user = "usuario1"
            elif tipoAcl == "grupo":
                group = Group.objects.filter(id=oParam["pk"])
                valorAcl = group[0].name
        except Exception:
            return False

        permiso = self.iface.manageAcl(tipoAcl, valorAcl, tipo, valor, oParam["permision"], oParam["app"], False)

        if tipo == "app":
            # TODO Hay que propaga a sus templates...tipoAcl
            templates = clasesBase.getTemplatesFromAplic(valor)
            for t in templates:
                self.iface.manageAcl(tipoAcl, valorAcl, "tabla", t, permiso, valor, True)
        return True

    def __init__(self, context=None):
        super().__init__(context)

    def changePermision(self, model, oParam):
        return self.ctx.oficial_changePermision(model, oParam)

    def changeRule(self, oR, nR):
        return self.ctx.oficial_changeRule(oR, nR)

    def checkAppPermision(self, tipoAcl, valorAcl, tipo, valor, permiso, app):
        return self.ctx.oficial_checkAppPermision(tipoAcl, valorAcl, tipo, valor, permiso, app)

    def manageAcl(self, tipoAcl, valorAcl, tipo, valor, objPermiso, app, fromApp):
        return self.ctx.oficial_manageAcl(tipoAcl, valorAcl, tipo, valor, objPermiso, app, fromApp)


# @class_declaration head #
class head(oficial):

    def __init__(self, context=None):
        super().__init__(context)


# @class_declaration ifaceCtx #
class ifaceCtx(head):

    def __init__(self, context=None):
        super().__init__(context)


# @class_declaration FormInternalObj #
class FormInternalObj(qsatype.FormDBWidget):
    def _class_init(self):
        self.iface = ifaceCtx(self)


form = FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
iface = form.iface

import importlib

from YBUTILS.viewREST import cacheController
from YBUTILS.viewREST import clasesBase


class accessControl:

    @classmethod
    def registraAC(cls):
        print("registra acl")
        """
            Almacenamos las restringiones de acceso del usuario
            Para ello tomamos primero las restringiones del grupo y despues las del propio usuario
            de forma que las restringiones del usuario priman sobre las de su grupo.
            Tipo: app, tabla, accion, template, default
            permisos: --, r-, rw
        """
        # print("registramos acl")
        acl = {}
        modelos = importlib.import_module("YBSYSTEM.models.flsisppal.models")
        sis_acl = getattr(modelos, "mtd_sis_acl", None)
        user = cacheController.getUser()

        # Registra acceso de grupos
        # usuario.groups.filter(name='xxx').exists()
        groups = user.groups.all()
        if sis_acl:
            for g in groups:
                acl_group = sis_acl.objects.filter(grupo=g)
                if acl_group:
                    for obj in acl_group:
                        # print(obj.valor, obj.tipo)
                        app = None
                        if obj.tipo == "tabla":
                            # Sacamos su app
                            app = clasesBase.getAplicFromTemplate(obj.valor)
                        else:
                            app = obj.valor
                        # print(app)
                        acl[obj.valor] = {"tipo": obj.tipo, "permiso": obj.permiso, "app": app}

        # Registra acceso de usuario
        try:
            acl_user = sis_acl.objects.filter(usuario=user)
            for obj in acl_user:
                # print(obj.valor, obj.tipo)
                app = None
                if obj.tipo == "tabla":
                    # Sacamos su app
                    app = clasesBase.getAplicFromTemplate(obj.valor)
                else:
                    app = obj.valor
                # print(app)
                acl[obj.valor] = {"tipo": obj.tipo, "permiso": obj.permiso, "app": app}
            print(acl)
            cacheController.setSessionVariable("acl", acl)
        except Exception:
            pass
        return True

    def getAcl(user, group):
        modelos = importlib.import_module("YBSYSTEM.models.flsisppal")
        sis_acl = getattr(modelos, "mtd_sis_acl", None)
        acl = {}
        if group:
            acl_group = sis_acl.objects.filter(grupo=group)
            if acl_group:
                for obj in acl_group:
                    acl[obj.valor] = {"tipo": obj.tipo, "permiso": obj.permiso}

        if user:
            user = user[0]
            groups = user.groups.all()
            if sis_acl:
                for g in groups:
                    acl_group = sis_acl.objects.filter(grupo=g)
                    if acl_group:
                        for obj in acl_group:
                            acl[obj.valor] = {"tipo": obj.tipo, "permiso": obj.permiso}
                acl_user = sis_acl.objects.filter(usuario=user.username)
                for obj in acl_user:
                    acl[obj.valor] = {"tipo": obj.tipo, "permiso": obj.permiso}
        return acl

    def dameDashboard(user, dashboardDICT):
        # print("aqui")
        acl = cacheController.getSessionVariable("acl")
        deleteItem = []
        # print(acl)
        if acl:
            for db in range(len(dashboardDICT)):
                if "default" in acl and acl['default']['tipo'] == "tabla":
                    if dashboardDICT[db]["NAME"] not in acl:
                        deleteItem.append(db)
                if dashboardDICT[db]["NAME"] in acl:
                    if acl[dashboardDICT[db]["NAME"]]["permiso"] == '--':
                        if not user.groups.filter(name__in=['clientes']).exists():
                            deleteItem.append(db)
            # print(deleteItem)
            if len(deleteItem) > 0:
                leng = len(deleteItem)
                fin = 0
                while fin != leng:
                    del(dashboardDICT[deleteItem[leng - (fin + 1)]])
                    fin = fin + 1

        return dashboardDICT

    def checkAccess(request, name, *args, **kwargs):
        # usuario = request.request.user
        sysmodels = importlib.import_module("YBSYSTEM.models.flsisppal")
        issysmodel = getattr(sysmodels, "mtd_" + request._prefix, None)
        # Solo superusuarios pueden acceder si es una tabla de flsisppal.
        if issysmodel:
            if not request.request.user.is_superuser:
                return False
        if not name == "invocaAQdashboard" and not name == "list":
            template = None
            if "template" in kwargs:
                template = kwargs["template"]
            acl = cacheController.getSessionVariable("acl")
            # print(acl)
            if not acl:
                return True
            # print(acl, "______", request._prefix)
            if request._prefix in acl and acl[request._prefix]["tipo"] == "tabla":
                if acl[request._prefix]['permiso'] == '--':
                    return False
            elif template and template in acl and acl[template]["tipo"] == "template":
                if acl[template]['permiso'] == '--':
                    return False
            else:
                # Si ni prefix ni template estan en acl miramos si hay un default
                if "default" in acl and "accion" not in kwargs:
                    if acl["default"]["tipo"] in ["tabla", "template"] and acl["default"]['permiso'] == '--':
                        return False

        return True

    def checkAction(request, name, *args, **kwargs):
        # accion = kwargs["accion"]
        acl = cacheController.getSessionVariable("acl")
        if not acl:
                return True
        if request._prefix in acl:
            if acl[request._prefix]['permiso'][1] == '-':
                print("no tiene permiso")
                return False
        # if accion in ["update", "create"] and request._prefix in acl:
        #     if acl[request._prefix]['permiso'][1] == '-':
        #         return False
        # elif accion in acl:
        #     if acl[accion]['permiso'][1] == '-':
        #         return False
        return True

# from os import path

# from django.conf import settings
# from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.models import User, Group
# from django.contrib.auth.decorators import login_required, user_passes_test

from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from YBUTILS import mylogging as log
from YBUTILS.viewREST import viewsets as layoutViewsets
from YBUTILS.viewREST import helpers


class YBSystemMIXINCTemplate(object):
    """
        Funcionalidad por defecto
    """
    @classmethod
    def prueba(cls):
        return "hola mundo"


class YBSystemViewSet(viewsets.ViewSet, YBSystemMIXINCTemplate, log.logMixin, layoutViewsets.YBMIXINCTXtemplate, APIView):
    permission_classes = (IsAuthenticated,)
    appLabels = None
    """
        Incluye funcionalidad de administraciond del sistema
    """

    _aplicacion = ""
    _prefix = ""

    # INICIALIZACION
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @helpers.decoradores.checkSystemAuthentication
    def invocaUserTemplate(self, request):
        users = User.objects.exclude(is_staff=True).order_by('-date_joined')
        return render(request, 'users/users.html', {'users': users, 'po': 1, 'pc': 1, 'filtrado': False})

    @helpers.decoradores.checkSystemAuthentication
    def invocaACL(self, request, table, pk):
        aplics = {}
        # si table es auth_user sacar el usuario y sus grupos si es auth_group sacar el grupo y usuario None
        user = None
        group = None
        if table == "auth_user":
            user = User.objects.filter(id=pk)
        # user = "usuario1"
        if table == "auth_group":
            group = Group.objects.filter(id=pk)
            if group:
                group = group[0].name
        # group = "grupo1"
        acl = layoutViewsets.accessControl.accessControl.getAcl(user, group)
        # TODO si hay un default -- hay que marcar por defecto
        defaultAplic = "rw"
        defaultTable = "rw"
        # ----------
        dctMenu = layoutViewsets.templateCTX.cargaMenuJSON('portal/menu_portal.json')
        dctMenu = dctMenu["items"]
        for aplic in dctMenu:
            aplics[aplic["NAME"]] = {}
            aplics[aplic["NAME"]]["permiso"] = acl[aplic["NAME"]]["permiso"] if aplic["NAME"] in acl else defaultAplic
            aplics[aplic["NAME"]]["templates"] = []
            # Cargamos ese menu si existe
            menuItem = layoutViewsets.templateCTX.cargaMenuJSON(aplic["NAME"] + '/menu_' + aplic["NAME"] + '.json')["items"]
            for template in menuItem:
                tempObj = {}
                tempObj["name"] = template["NAME"]
                tempObj["text"] = template["TEXT"]
                tempObj["permiso"] = acl[template["NAME"]]["permiso"] if template["NAME"] in acl else defaultTable
                tempObj["app"] = aplic["NAME"]
                aplics[aplic["NAME"]]["templates"].append(tempObj)
        # print(aplics)
        if request._method == "PUT":
            # history = cacheController.getHistory(request)
            return Response({"acl": aplics})

        return render(request, 'users/acl.html', {"prefix": table, "group": group, "user": user, "acl": aplics, "pk": pk})

from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.conf import settings
from os import path

from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate
from django.contrib.auth import login as login_auth
from django.contrib.auth.models import User, Group
from YBUTILS.viewREST import cacheController, factorias, accessControl

from YBWEB.ctxJSON import DICTJSON, templateCTX
from django.core.paginator import Paginator


def is_admin(user):
    return user.is_superuser


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def system(request):
    history = cacheController.addHistory(request, None, None)
    history = history["list"][history["pos"] - 1] if history["pos"] > 0 else history["list"][history["pos"]]
    usuario = request.user.username
    superuser = request.user.is_superuser
    dctMenu = templateCTX.cargaMenuJSON('YBSYSTEM/menu_users.json')
    dctMenu = dctMenu["items"]
    miMenu = accessControl.accessControl.dameDashboard(request.user, dctMenu)

    return render(request, 'YBWEB/dashboard.html', {'aplic': 'system', 'menuJson': miMenu, 'usuario': usuario, 'superuser': superuser, 'history': history, 'next': '/'})


def forbiddenError(request):
    return render(request, 'YBSYSTEM/403.html')


def signup(request, error):
    return render(request, 'users/signup.html', {'error': error})


def newgroup(request, error):
    return render(request, 'users/newgroup.html', {'error': error})


def addgrouprequ(request, username, error):
    groups = Group.objects.all()
    user = User.objects.get(username=username)
    groupobj = {}
    for g in groups:
        groupobj[g.name] = user.groups.filter(name=g.name).exists()
    return render(request, 'users/addgroup.html', {'error': error, 'username': username, 'groups': groupobj})


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def newgroup_request(request):
    if request.method == 'POST':
        action = request.POST.get('action', None)
        group = request.POST.get('group', None)
        if action == 'newgroup':
            try:
                Group.objects.create(name=group)
                return newgroup(request, ' Añadido')
            except Exception as exc:
                print(exc)
                return newgroup(request, 'El usuario ya existe')
    return newgroup(request, '')


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def userTable(request, po=1):
    users = User.objects.exclude(is_staff=True).order_by('-date_joined')
    count = int(users.count() / 10)
    filtrado = False
    if request.method == 'POST':
        search = request.POST.get('searchuser', None)
        users = users.filter(username__icontains=search)
        if search:
            filtrado = True
        print(users)

    pageSize = 10
    # users = User.objects.all()
    usersData = Paginator(users, pageSize).page(po)
    # print(users[0].__dict__)
    return render(request, 'users/users.html', {'users': usersData, 'po': po, 'pc': count, 'filtrado': filtrado})


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def groupTable(request, po=1):
    groups = Group.objects.all()
    count = int(groups.count() / 10)
    filtrado = False
    if request.method == 'POST':
        search = request.POST.get('searchuser', None)
        groups = groups.filter(username__icontains=search)
        if search:
            filtrado = True
        print(groups)

    pageSize = 10
    groupsData = Paginator(groups, pageSize).page(po)
    return render(request, 'users/groups.html', {'groups': groupsData, 'po': po, 'pc': count, 'filtrado': filtrado})


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def deleteUser(request, user):
    User.objects.filter(username=user).delete()
    return HttpResponseRedirect('/users')


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def deleteUserGroup(request, user, groupname):
    user = User.objects.filter(username=user)
    for g in user[0].groups.all():
        print(g)
    return HttpResponseRedirect('/userGroups/' + groupname)


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def addGroup(request, username):
    if request.method == 'POST':
        action = request.POST.get('action', None)
        group = request.POST.getlist('group')
        if action == 'addGroup':
            try:
                user = User.objects.get(username=username)
                print(user)
                user.groups.clear()
                for g in group:
                    user.groups.add(Group.objects.get(name=g))
                user.save()
            except Exception as e:
                print(e)
    return addgrouprequ(request, username, '')


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def userGroups(request, groupname, po=1):
    users = User.objects.filter(groups__name=groupname)
    count = int(users.count() / 10)
    filtrado = False
    if request.method == 'POST':
        search = request.POST.get('searchuser', None)
        users = users.filter(username__icontains=search)
        if search:
            filtrado = True
        print(users)

    pageSize = 10
    # users = User.objects.all()
    usersData = Paginator(users, pageSize).page(po)
    return render(request, 'users/usergroups.html', {'users': usersData, 'po': po, 'pc': count, 'filtrado': filtrado, 'groupname': groupname})


@user_passes_test(is_admin, login_url='/login')
def permissions_request(request):
    if request.method == 'POST':
        return HttpResponseRedirect("/")

    reg = open(path.join(settings.PROJECT_ROOT, "config/urls.json")).read()
    oReg = DICTJSON.fromJSON(reg)
    models = {}

    for mod in oReg['models']:
        for modelName in oReg['models'][mod]:
            acciones = factorias.FactoriaAccion.getAcciones(modelName, 'I')
            models[modelName] = []
            for a in acciones:
                models[modelName].append(a)
    # miaccion = factorias.FactoriaAccion.getAcciones("telsac", 'I')

    return render(request, 'users/permissions.html', {'models': models})


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def acusers(request):
    return True


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def acgroups(request):
    return True


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def controlUser(request):
    return True


@login_required(login_url='/login')
@user_passes_test(is_admin, login_url='/login')
def controlGroup(request):
    return True

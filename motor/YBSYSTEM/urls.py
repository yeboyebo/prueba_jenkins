from django.conf.urls import patterns, url
# from django.contrib.auth import views as auth_views
from YBSYSTEM import views

# Uncomment the next lines to enable the admin:
# from django.conf.urls import include
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns(
    'YBSYSTEM',
    # url(r'^users/$', views.getUsers, name='getusers'),
    url(r'^system$', views.system, name='system'),
    url(r'^deleteUser/(?P<user>\w+)$', views.deleteUser, name='deleteUser'),
    url(r'^deleteUserGroup/(?P<user>\w+)/(?P<groupname>\w+)$', views.deleteUserGroup, name='deleteUserGroup'),
    url(r'^addGroup/(?P<username>\w+)$', views.addGroup, name='addGroup'),
    # url(r'^users/$', views.userTable, name='getusers'),
    # url(r'^groups/$', views.groupTable, name='getgroups'),
    # url(r'^userGroups/(?P<groupname>\w+)$', views.userGroups, name='userGroups'),
    # url(r'^userGroups/(?P<groupname>\w+)/(?P<po>\w+)$', views.userGroups, name='userGroups'),
    # url(r'^users/(?P<po>\w+)$', views.userTable, name='getusers'),
    url(r'^newgroup/$', views.newgroup_request, name='newgroup'),
    url(r'^403$', views.forbiddenError, name='403'),
    # url(r'^permissions/$', views.permissions_request, name='permissions'),
    # url(r'^acusers/$', views.acusers, name='acusers'),
    # url(r'^acgroups/$', views.acgroups, name='acgroups'),
    # url(r'^acusers/(?P<username>\w+)$', views.controlUser, name='acusers'),
    # url(r'^acgroups/(?P<username>\w+)$', views.controlGroup, name='acgroups'),
)

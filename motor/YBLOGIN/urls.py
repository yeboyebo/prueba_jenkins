from django.conf.urls import patterns, url
from django.contrib.auth import views as auth_views
from YBLOGIN import views

# Uncomment the next lines to enable the admin:
# from django.conf.urls import include
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns(
    'YBLOGIN',
    url(r'^$', views.index, name='index'),
    url(r'^login/$', views.auth_login, name='authentication'),
    url(r'^signup/$', views.signup_request, name='signup'),
    url(r'^account/$', views.account_request, name='account'),
    url(r'^logout$', auth_views.logout, {'next_page': '/'}, name='logout'),
)

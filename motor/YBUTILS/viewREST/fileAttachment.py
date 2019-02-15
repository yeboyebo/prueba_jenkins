import requests
import os

from django.conf import settings
from django.http import HttpResponse

from YBLEGACY import qsatype
from YBLEGACY.FLSqlCursor import FLSqlCursor
from YBLEGACY.constantes import *
from YBUTILS.viewREST import factorias

import csv


def generaCSV(prefix, pk, function, params=None):
    serializador = factorias.FactoriaSerializadoresBase.getRepositorio(prefix)
    mimodel = serializador.Meta.model

    # Genera nombre de fichero con el nombre de la tabla + fecha actual
    date = str(qsatype.Date())
    name = prefix + '' + date[:10]

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="' + name + '.csv"'

    cursor = FLSqlCursor(prefix)
    cursor.select(mimodel._meta.pk.name + "='" + str(pk) + "'")

    # record = prefix
    # if pk != 'master':
    #     record = 'formRecord' + prefix

    if cursor.first():
        fun = getattr(mimodel, function)
        resul = fun(cursor, params)
        # fun = getattr(qsatype.FactoriaModulos.get(record).iface, function)
        # resul = fun(cursor)
        if resul:
            if 'query' in resul:
                query = resul['query']
                columns = resul['columns']
                return generaCSVfromQuery(response, query, columns)

            else:
                # TODO generaCSVfromArray
                return HttpResponse("Error el fichero no existe")
        else:
            return HttpResponse("Error el fichero no existe")

    return HttpResponse("Error el fichero no existe")


def generaCSVfromQuery(response, query, columns):
    writer = csv.writer(response)
    row = []
    i = 0
    for field in columns:
        row.append(field.title())
        i += 1
    writer.writerow(row)
    while query.next():
        row = []
        for field in columns:
            row.append(query.value(field))
        writer.writerow(row)

    return response


def generaJReport(prefix, pk, function):
    disposition = "attachment"
    serializador = factorias.FactoriaSerializadoresBase.getRepositorio(prefix)
    mimodel = serializador.Meta.model.objects.all().get(pk=pk)
    fun = getattr(mimodel, function)
    report = fun()
    params = report['params']
    if "disposition" in report:
        disposition = report["disposition"]
    return getJReport(pk, report['reportName'], disposition, params)


def getJReport(pk, reportName, disposition, params=None):
    report_name = reportName
    if not disposition:
        disposition = "attachment"
    filename = pk
    if not params:
        params = {}
        params["KEY"] = pk
    auth = (settings.JASPER_USER, settings.JASPER_PASSWORD)
    url = '{url}/rest_v2/reports/reports/{report_name}.pdf'.format(url=settings.JASPER_URL, report_name=report_name)
    req = requests.get(url, params=params, auth=auth)
    content = req.content
    response = HttpResponse(content_type='application/pdf')
    # Con attachment descarga documento con inline abre automaticamente
    response['Content-Disposition'] = '{disposition}; filename="{filename}.pdf"'.format(disposition=disposition, filename=filename)
    response.write(content)
    return response


def saveJReport(filename, reportName, params=None, reportDir=None):
    report_name = reportName
    if not params:
        return False
    if not reportDir:
        reportDir = '/tmp'
    # Comprobamos si existe el directorio
    filepath = reportDir + '/' + filename + '.pdf'
    # print("______________")
    # print(os.path.dirname(filepath))
    if not os.path.exists(os.path.dirname(filepath)):
        print("no existe directorio")
        try:
            os.makedirs(os.path.dirname(filepath))
        except OSError:
            reportDir = '/tmp'
            filepath = reportDir + '/' + filename + '.pdf'

    auth = (settings.JASPER_USER, settings.JASPER_PASSWORD)
    url = '{url}/rest_v2/reports/reports/{report_name}.pdf'.format(url=settings.JASPER_URL, report_name=report_name)
    req = requests.get(url, params=params, auth=auth)
    content = req.content
    with open(filepath, 'wb') as f:
        f.write(content)
        # shutil.copyfileobj(content, f)
    return filepath

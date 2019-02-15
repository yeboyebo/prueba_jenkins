# from django.core.cache import cache
from YBLEGACY.constantes import ustr

from YBUTILS.DbRouter import get_current_request, get_current_user


def compareHistoryNodes(node1, node2):
    if node1['aplic'] != node2['aplic']:
        return 0
    if node1['prefix'] != node2['prefix']:
        return 0
    if node1['pk'] != node2['pk']:
        return 0
    if node1['template'] != node2['template']:
        return 2
    return 1


def getUser():
    return get_current_user()


def getHistory(request2):
    return getSessionVariable('history', {'list': [], 'pos': -1})


def getSessionVariable(variable, default=None):
    request = get_current_request()
    if request:
        return request.session.get(variable, default)
    return None


def setSessionVariable(variable, value=None):
    request = get_current_request()
    if request:
        request.session[variable] = value
        return True
    return False


def dropSessionVariable(variable):
    request = get_current_request()
    if request:
        request.session.pop(variable)
        return True
    return False


def addHistory(request2, aplic, prefix, pk=None, template=None):
    request = get_current_request()
    # cacheKey = ustr('history_', request.session._session_key.__str__())
    history = getHistory(request)
    try:
        pos = history['pos']
        lista = history['list']

        objHist = {'aplic': aplic, 'prefix': prefix, 'pk': pk, 'template': template}
        if pos == -1:
            lista.append(objHist)
            pos += 1
        elif objHist == lista[pos]:
            pass
        # elif objHist['aplic'] == lista[pos]['aplic'] and objHist['prefix'] == lista[pos]['prefix'] and objHist['pk'] == lista[pos]['pk'] and objHist['template'] != lista[pos]['template']:
        #     lista[pos]['template'] = objHist['template']
        elif objHist in lista and pos > 0 and objHist == lista[pos - 1]:
            pos -= 1
        elif objHist in lista and pos < len(lista) - 1 and objHist == lista[pos + 1]:
            pos += 1
        else:
            if pos != len(lista) - 1:
                lista = lista[:((len(lista) - pos - 1) * -1)]
            lista.append(objHist)
            pos += 1

        while len(lista) > 50 and pos > 3:
            lista.pop(0)
            pos -= 1
        history['pos'] = pos
        history['list'] = lista

        # cache.set(cacheKey, history, 1800)
        request.session['history'] = history
    except Exception as ex:
        print(ustr("Error inesperado en cacheController", ex))
    return history

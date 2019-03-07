import json
import requests

from django.core.mail import EmailMessage
from django.core.mail import get_connection as mail_get_connection

from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLUtil import FLUtil
from YBLEGACY.constantes import ustr


def get_connectionFromQuery(query, **kwargs):
    return get_connection(query.value("hostcorreosaliente"), query.value("usuariosmtp"), query.value("passwordsmtp"), query.value("puertosmtp"), query.value("tipocxsmtp"))
    # options = {
    #     'host': query.value("hostcorreosaliente"),
    #     'username': query.value("usuariosmtp"),
    #     'password': query.value("passwordsmtp"),
    #     'port': query.value("puertosmtp"),
    #     'use_ssl': True,
    #     'use_tls': False
    # }
    # options.update(kwargs)
    # return mail_get_connection(**options)


def get_connection(host, username, password, port, protocol=None, **kwargs):
    usetls = True
    usessl = False
    if protocol.upper() == "SSL":
        usetls = False
        usessl = True

    options = {
        'host': host,
        'username': username,
        'password': password,
        'port': port,
        'use_ssl': usessl,
        'use_tls': usetls
    }
    options.update(kwargs)
    return mail_get_connection(**options)


def sendSisMail(asunto, cuerpo, receiver, filename=None):
    q = FLSqlQuery()
    q.setTablesList(u"factppal_general")
    q.setSelect(u"usuariosmtp, hostcorreosaliente, passwordsmtp, puertosmtp, tipocxsmtp")
    q.setFrom(u"factppal_general")
    q.setWhere(ustr(u"1=1"))

    if q.exec_():
        if q.next():
            connection = get_connectionFromQuery(q)
            return sendMail(connection, q.value("usuariosmtp"), asunto, cuerpo, receiver, filename)
        else:
            return False
    else:
        return False

    return True


def sendMail(connection, hostUser, asunto, cuerpo, receiver, filename=None):
    if not asunto:
        asunto = "Sin asunto"
    if not cuerpo:
        return False
    if not receiver:
        receiver = [hostUser]
    try:
        connection.open()
        message = "<html>" + cuerpo + "</html>"
        msg = EmailMessage(asunto,
                           message,
                           hostUser,
                           receiver,
                           connection=connection)
        if filename:
            msg.attach_file(filename)
        msg.content_subtype = "html"
        msg.send(fail_silently=False)
        connection.close()
    except Exception as e:
        print("Error envio email", e)
        return False
    return True


def sendNotification(title, body, user=None):
    APIKey = "key=AAAAhBlk57M:APA91bHKxOpG0Od5XqZjzc7Y9ISrTcxUaBwu5Ool-29nrasiI0ofIFUOZTRERVTD_kFwPvt2bQjRO2bLdsw6oGFXmvzJBaUduVc-TLxJxCt4oO9LH7mWHDp1Sc674sOVkagXxmmF1H_W"
    if not user:
        user = FLUtil.nameUser()
    if isinstance(user, (list, tuple)):
        users = "("
        for u in user:
            users = users + "'" + u + "',"
        users = users[:-1]
        users = users + ")"
        where = "usuario in " + users
    else:
        where = "usuario = '" + user + "'"
    q = FLSqlQuery()
    q.setTablesList("sis_usernotifications")
    q.setSelect("token")
    q.setFrom("sis_usernotifications")
    q.setWhere(where)
    iduser = []
    if q.exec_():
        while q.next():
            iduser.append(q.value(0))
    else:
        print("no se encuentra token")
        return False

    if len(iduser) == 0:
        print("no se encuentra token")
        return False
    # TODO hay que sacara el idtoken del usuario activo(puede ser uno o varios)
    # "registration_ids": ["fcm_token1", "fcm_token2"] en lugar de to para varios
    url = 'https://fcm.googleapis.com/fcm/send'
    body = {
        "notification": {
            "title": title,
            "body": body
        },
        "registration_ids": iduser
    }

    headers = {"Content-Type": "application/json",
               "Authorization": APIKey}
    response = requests.post(url, data=json.dumps(body), headers=headers)
    response.raise_for_status()

    return response.json


def sendNotificationToAll(title, body):
    # TODO hay que recorrer la tabla de userNotification y crear array de tokens.
    APIKey = "key=AAAAhBlk57M:APA91bHKxOpG0Od5XqZjzc7Y9ISrTcxUaBwu5Ool-29nrasiI0ofIFUOZTRERVTD_kFwPvt2bQjRO2bLdsw6oGFXmvzJBaUduVc-TLxJxCt4oO9LH7mWHDp1Sc674sOVkagXxmmF1H_W"
    # "registration_ids": ["fcm_token1", "fcm_token2"] en lugar de to para varios
    # iduser = "eAyqT5I3qbE:APA91bHcbYAb9wDn92-oJGNOLQCmRf6OJEoNXAuCI0zn7kRYuTcZpbyHRqeRuKgfsmk86sern5u28hUIY23kYflO-a5grkJMMntQIyNjKi22IMGTGgIqBeZCq_AJuNIpJEUcS1WYeGAp"
    q = FLSqlQuery()
    q.setTablesList("sis_usernotifications")
    q.setSelect("token")
    q.setFrom("sis_usernotifications")
    q.setWhere("1 = 1")

    if not q.exec_():
        print("no se encuentra token")
        return False

    iduser = []
    while q.next():
        iduser.append(q.value(0))
    url = 'https://fcm.googleapis.com/fcm/send'
    body = {
        "notification": {
            "title": "yeboyebo",
            "body": "Cuerpo del mensaje"
        },
        "registration_ids": iduser
    }

    headers = {"Content-Type": "application/json",
               "Authorization": APIKey}
    response = requests.post(url, data=json.dumps(body), headers=headers)
    response.raise_for_status()

    return response.json


def post_request(url, header, data):
    try:
        response = requests.post(url, data=json.dumps(data), headers=header)
        response.raise_for_status()
    except requests.exceptions.ConnectionError as e:
        raise NameError("Error de comunicación con {}".format(url, e))
    except Exception as e:
        raise NameError("Error en la petición a {}: {}".format(url, e))

    return response.json()

from django.conf import settings
from django.contrib.auth.models import User

from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLUtil import FLUtil
from YBLEGACY.constantes import ustr


class wsController:

    @classmethod
    def getWS(cls):
        if getattr(settings, "WEBSOCKET", False):
            ws = settings.WEBSOCKET
            return ws
        return False


class chatController:

    @classmethod
    def getChat(cls, user):
        # Comprobamos en settings si el cliente tiene chat
        if getattr(settings, "CHAT", False):
            apps = list(settings.INSTALLED_APPS)
            if "channels" not in apps:
                return False
            # Sacamos usuarios del sistema
            # Sacamos los mensajes privados del usuario actual
            chatObj = {}
            users = User.objects.all()
            chatObj["sisusers"] = []
            for u in users:
                if u.username != user:
                    chatObj["sisusers"].append(u.username)
            chatObj["chats"] = cls.getChatMessages(user)
            return chatObj
        return False

    @classmethod
    def getChatMessages(cls, user):
        try:
            chats = {}
            qusers = FLSqlQuery()
            qusers.setTablesList(u"sis_chatstatus")
            qusers.setSelect(u"room")
            qusers.setFrom(u"sis_chatstatus")
            qusers.setWhere(ustr(u"1=1"))
            if not qusers.exec_():
                return
            while qusers.next():
                offset = FLUtil.sqlSelect(u"sis_chatmessages", u"COUNT(message)", ustr(u"(sender = '", user, u"' and receiver = '" + qusers.value("room") + "') or (sender = '", qusers.value("room"), u"' and receiver = '" + user + "')"))
                if offset > 200:
                    offset = 100
                else:
                    offset = 0
                q = FLSqlQuery()
                q.setTablesList(u"sis_chatmessages")
                q.setSelect(u"*")
                q.setFrom(u"sis_chatmessages")
                q.setWhere(ustr(u"(sender = '", user, u"' and receiver = '" + qusers.value("room") + "') or (sender = '", qusers.value("room"), u"' and receiver = '" + user + "') ORDER BY fechahora OFFSET " + str(offset)))
                if not q.exec_():
                    return
                while q.next():
                    if q.value("sender") == user:
                        room = user + "_" + q.value("receiver")
                    else:
                        room = user + "_" + q.value("sender")
                    if room not in chats:
                        chats[room] = []
                    chats[room].append({"sender": q.value("sender"), "receiver": q.value("receiver"), "message": q.value("message"), "fechahora": str(q.value("fechahora"))})
            return chats
        except Exception as e:
            print(e)
            pass
        return {}
        # try:
        #     # TODO limitar el numero de mensajes que se pueden recibir
        #     chats = {}
        #     q = FLSqlQuery()
        #     q.setTablesList(u"sis_chatmessages")
        #     q.setSelect(u"*")
        #     q.setFrom(u"sis_chatmessages")
        #     q.setWhere(ustr(u"sender = '", user, u"' or receiver = '" + user + "' ORDER BY fechahora"))
        #     if not q.exec_():
        #         return
        #     while q.next():
        #         if q.value("sender") == user:
        #             room = user + "_" + q.value("receiver")
        #         else:
        #             room = user + "_" + q.value("sender")
        #         if room not in chats:
        #             chats[room] = []
        #         chats[room].append({"sender": q.value("sender"), "receiver": q.value("receiver"), "message": q.value("message"), "fechahora": str(q.value("fechahora"))})
        #     return chats
        # except Exception as e:
        #     print(e)
        #     pass
        # return {}

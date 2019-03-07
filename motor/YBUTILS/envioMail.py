from django.core.mail import EmailMessage
from django.core.mail import get_connection as mail_get_connection


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


# get_connection("hostsmtp", "usuariosmtp", "contraseña", "puerto", "SSL")
# get_connection("smtp.gmail.com", "todos.yeboyebo@gmail.com", "555zapato", "465", "SSL")
# sendSisMail("asunto", "cuerpo", ["nombreCorreo"])

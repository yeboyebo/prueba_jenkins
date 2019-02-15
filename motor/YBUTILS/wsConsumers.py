import json

# from channels import Channel
from channels import Group
from channels.sessions import channel_session


def send_message(room, message):
    # msg = json.loads(message.content['message'])
    # json.dumps({
    #             "sender": message.content["user"],
    #             "message": mensaje
    #         })
    Group("chat-%s" % room).send({
        "text": json.dumps(message),
    })


def msg_consumer(message):
    # print("________Envio___________")
    room = message.content['room']
    Group("chat-%s" % room).send({
        "text": message.content['message'],
    })


@channel_session
def ws_connect(message):
    room = message.content['path'].strip("/")
    # print("_________Conexion__________", room)
    message.channel_session['room'] = room
    Group("chat-%s" % room).add(message.reply_channel)
    message.reply_channel.send({"accept": True})


@channel_session
def ws_message(message):
    room = message.channel_session['room']
    print("_________Recibido__________", room)
    # print(message['text'])
    # Channel("chat-messages").send({
    #     "room": room,
    #     "message": message['text'],
    # })
    # send_message(room, "message")
    # Group("chat-%s" % room).send({
    #     "text": "text",
    # })


@channel_session
def ws_disconnect(message):
    # print("_________Desconecta__________")
    Group("chat-%s" % message.channel_session['room']).discard(message.reply_channel)

var React = require("react");
var YBChatUsersList = require("./YBChatUsersList.jsx");
var YBChatPrivate = require("./YBChatPrivate.jsx");

var Chat = React.createClass({

    getInitialState: function() {
        var activos = this.getActivos();
        var activeusers = {};

        for (var user in activos) {
            activos[user]["expanded"] = false;
            activeusers[user] = true;
        }
        localStorage.setItem("activeChat_status", JSON.stringify(activos));

        return ({
            "websocket": null,
            "active": activeusers,
            "interval": null,
            "readchat_count": null
        });
    },

    getActivos: function() {
        var activos = JSON.parse(localStorage.getItem("activeChat_status"));
        if (!activos || activos == "null") {
            activos = {};
        }
        return activos;
    },

    getReadChatCount: function() {
        var readchat_count = JSON.parse(localStorage.getItem("readchat_count"));
        if (!readchat_count || readchat_count == "null") {
            readchat_count = {};
        }
        return readchat_count;
    },

    _activeChatUser: function(user) {
        var activos = this.getActivos();

        if (user in activos) {
            activos[user]["expanded"] = false;
        }
        else {
            activos[user] = {};
            activos[user]["expanded"] = false;
        }
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
        var activeusers = this.state.active;
        activeusers[user] = true;
        this.setState({active: activeusers});
    },

    _expandChatUser: function(user) {
        $(".YBChat" + user).show();
        $(".YBChat" + user + "Expanded").show();
        $(".YBChat" + user + "Info").hide();

        var activos = this.getActivos();
        activos[user]["expanded"] = true;
        this._setChatCount(user);
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
        $(".YBChatInput" + user).focus();
    },

    _unexpandChatUser: function(user) {
        $(".YBChat" + user).show();
        $(".YBChat" + user + "Expanded").hide();
        $(".YBChat" + user + "Info").show();

        var activos = this.getActivos();
        activos[user]["expanded"] = false;
        this._setChatCount(user);
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
    },

    _receiveChatInfo: function(user, drop) {
        if (drop) {
            if ($(".YBChat" + user).hasClass("receive")) {
                $(".YBChat" + user).toggleClass("receive");
                clearInterval(this.state.interval);
                $("title").text("AQNext");
                this.setState({"interval": null});
            }
        }
        else if (!$(".YBChat" + user).hasClass("receive")) {
            $(".YBChat" + user).toggleClass("receive");
            var blink = true;

            if (this.state.interval) {
                $("title").text("AQNext");
                clearInterval(this.state.interval);
            }

            var interval = setInterval(function() {
                if (blink) {
                    $("title").text(user[0].toUpperCase() + user.slice(1) + " Nuevo mensaje");
                    blink = false;
                }
                else {
                    $("title").text("AQNext");
                    blink = true;
                }
            }, 1000);
            this.setState({"interval": interval});
        }
    },

    _sendChatNotification: function(sender, user, msg) {
        var message = {};
        message["notification"] = {"sender": sender, "user": user, "msg": msg};
        this.state.websocket.send(JSON.stringify(message));
    },

    _infoChat: function(user) {
        this._activeChatUser(user);
        $(".YBChat" + user).show();
        $(".YBChat" + user + "Expanded").hide();
        $(".YBChat" + user + "Info").show();

        var activos = this.getActivos();
        if (user in activos) {
            activos[user]["expanded"] = false;
        }
        else {
            activos[user] = {};
            activos[user]["expanded"] = false;
        }
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
    },

    _getChatCount: function(user) {
        var readchat_count = this.getReadChatCount();
        if (!(user in readchat_count)) {
            return 0;
        }
        else {
            return readchat_count[user];
        }
    },

    _setChatCount: function(user) {
        var readchat_count = this.getReadChatCount();
        if (!(user in readchat_count)) {
            readchat_count[user] = 0;
        }

        var chat = this.props.chatObj.chats[this.props.user + "_" + user];
        readchat_count[user] = chat ? chat.length : 0;
        localStorage.setItem("readchat_count", JSON.stringify(readchat_count));
        this.setState({readchat_count: readchat_count});
    },

    _showChat: function(user) {
        var activechats = Object.keys(this.state.active);
        if (activechats.length >= 3) {
            this._closeChat(activechats[0]);
        }
        this._activeChatUser(user);
        this._expandChatUser(user);
    },

    _closeChat: function(user) {
        var activeusers = this.state.active;
        delete activeusers[user];
        this.setState({active: activeusers});
        $(".YBChat" + user).hide();

        var activos = this.getActivos();
        delete activos[user];
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
    },

    _sendMsg: function(user, msg) {
        var message = {};
        message[user] = msg;
        if (msg && msg != "") {
            this.props.onChatChange(this.props.user, user, msg);
            this.state.websocket.send(JSON.stringify(message));
        }
        this._setChatCount(user);
        //$(".YBChatHistory_" + this.props.room).scrollTop($(".YBChatHistory_" + this.props.room)[0].scrollHeight);
    },

    _onUserListClick: function() {
        $(".YBChatUsersList").toggleClass("active");
    },


    _onWebSocketMessage: function(mensaje) {
        // Mostrar toast solo cuando chat no este activo.
        var content = JSON.parse(mensaje);
        this.props.onChatChange(content.sender, this.props.user, content.message);

        var activos = this.getActivos();
        if (content.sender in activos) {
            if (!activos[content.sender]["expanded"] || (activos[content.sender]["expanded"] && "focus" in activos[content.sender] && !activos[content.sender]["focus"])) {
                this._infoChat(content.sender);
                this._receiveChatInfo(content.sender, false);
                this._sendChatNotification(content.sender, this.props.user, content.message);
            }
            else {
                this._setChatCount(content.sender);
            }
        }
        else {
            this._infoChat(content.sender);
            this._receiveChatInfo(content.sender, false);
            this._sendChatNotification(content.sender, this.props.user, content.message);
        }
    },

    componentWillMount: function() {
        var este = this;
        //console.log(this.props.USER, this.props.GROUP)
        var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        var socket = new WebSocket(ws_scheme + "://" + window.location.host + "/chat/");
        // var socket = new WebSocket(ws_scheme + "://127.0.0.1:24200/chat/");
        socket.onmessage = function(e) {
            este._onWebSocketMessage(e.data);
        }
/*        socket.onopen = function() {
            var message = {};
            message[este.props.user] = "connected";
            socket.send(JSON.stringify(message));
        }*/
        // Call onopen directly if socket is already open
        if (socket.readyState == WebSocket.OPEN) {
            socket.onopen();
        }
        this.setState({"websocket": socket});
        // Mostrar todos los chat que estuviesen abiertos

        var readchat_count = this.getReadChatCount();
        for (var room in this.props.chatObj.chats) {
            var user = room.split("_")[1];
            if (user in readchat_count && readchat_count[user] < this.props.chatObj.chats[room].length) {
                this._activeChatUser(user);
            }
        }
    },

    render: function() {
        var objAtts = {
            "user": this.props.user,
            "sisusers": this.props.chatObj.sisusers
        };
        var objFuncs = {
            "sendMsg": this._sendMsg,
            "showChat": this._showChat
        };
        var usersList = YBChatUsersList.generaYBChatUsersList(objAtts, objFuncs);
        var activeChat = [];

        for (var u in this.state.active) {
            if (this.state.active[u]) {
                var chat = this.props.chatObj.chats[this.props.user + "_" + u];
                var unread = null;
                if (chat) {
                    unread = chat.length - this._getChatCount(u);
                    if (unread == 0) {
                        unread = null;
                    }
                }
                var objAttsP = {
                    "user": u,
                    "chat": chat,
                    "room": this.props.user + "_" + u,
                    "unread": unread
                };
                var objFuncsP = {
                    "sendMsg": this._sendMsg,
                    "closeChat": this._closeChat,
                    "receiveChatInfo": this._receiveChatInfo,
                    "expandChatUser": this._expandChatUser,
                    "unexpandChatUser": this._unexpandChatUser,
                    "getChatCount": this._getChatCount
                };
                activeChat.push(YBChatPrivate.generaYBChatPrivate(objAttsP, objFuncsP));
            }
        }

        return <div className="YBChatComponent">
                    { activeChat }
                    <div ref="ChatList" className="YBChatWindows">
                        <div className="YBChatExpanded YBChatUsersList">
                            { usersList }
                        </div>
                        <div className="YBChatWindowsInner YBChatUsers"  onClick={ this._onUserListClick }>
                            Mensajes
                        </div>
                    </div>
                </div>;
    }
});

module.exports.generaYBChat = function(objAtts, objFuncs)
{
    return  <Chat
                user = { objAtts.user }
                chatObj = { objAtts.chatObj }
                invocaToast = { objFuncs.invocaToast }
                onChatChange = { objFuncs.onChatChange }
            />;
};

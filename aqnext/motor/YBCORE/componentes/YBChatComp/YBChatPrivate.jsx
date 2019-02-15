var React = require("react");
var YBChatPrivateExpanded = require("./YBChatPrivateExpanded.jsx");

var Private = React.createClass({

    _onClick: function() {
        this.props.expandChatUser(this.props.user);
        this.props.receiveChatInfo(this.props.user, true);
        $(".YBChatHistory_" + this.props.room).scrollTop($(".YBChatHistory_" + this.props.room)[0].scrollHeight);
    },

    _renderMsg: function() {
        return null;
    },

    render: function() {
        var objAtts = {
            "user": this.props.user,
            "chat": this.props.chat,
            "room": this.props.room
        };
        var objFuncs = {
            "sendMsg": this.props.sendMsg,
            "closeChat": this.props.closeChat,
            "unexpandChatUser": this.props.unexpandChatUser
        };
        var expandedChat = YBChatPrivateExpanded.generaYBChatPrivateExpanded(objAtts, objFuncs);
        var classname = "YBChatWindows " + "YBChat" + this.props.user;
        var classnameName = "YBChatWindowsInner YBChatPrivate " + "YBChat" + this.props.user + "Info";
        var activos = JSON.parse(localStorage.getItem("activeChat_status"));
        var style;
        if (activos[this.props.user]["expanded"]) {
            style = {"display": "none"};
        }
        else {
            style =  {};
        }
        var unread = this.props.unread;
        if (!unread) {
            unread = "";
        }
        return  <div key={ "Chat_" + this.props.user } className={ classname } >
                    { expandedChat }
                    <div className={ classnameName } onClick={ this._onClick }  style={ style }>
                        { unread } { this.props.user }
                    </div>
                </div>
    }
});

module.exports.generaYBChatPrivate = function(objAtts, objFuncs)
{
    return  <Private
                key = { "private_" + objAtts.user }
                user = { objAtts.user }
                chat = { objAtts.chat }
                room = { objAtts.room }
                unread = { objAtts.unread }
                sendMsg = { objFuncs.sendMsg }
                closeChat = { objFuncs.closeChat }
                receiveChatInfo = { objFuncs.receiveChatInfo }
                expandChatUser = { objFuncs.expandChatUser }
                unexpandChatUser = { objFuncs.unexpandChatUser }
                getChatCount =  { objFuncs.getChatCount }/>;
};

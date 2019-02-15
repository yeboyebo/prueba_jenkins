var React = require("react");

var PrivateHistory = React.createClass({

    _renderUserChat: function() {
        var este = this;
        if (!this.props.chat) {
            return null;
        }

        var i = 0;
        return this.props.chat.map((msg) => {
            i += 1;
            var classname = "YBChatHistoryCont ";
            if (msg['sender'] == este.props.user) {
                classname += "YBChatSender";
            }
            else {
                classname += "YBChatReceiver"
            }
            return <div className={ classname } key={ this.props.user + "ch_" + i }>
                        <div className="YBChatHistoryMsg">{ msg['message'] }</div>
                    </div>;
        });
    },

    componentDidUpdate() {
        $(this.props.roomSelector).scrollTop($(this.props.roomSelector)[0].scrollHeight);
    },

    componentDidMount() {
         $(this.props.roomSelector).scrollTop($(this.props.roomSelector)[0].scrollHeight);
    },

    render: function() {
        var msgList = this._renderUserChat();
        var classname = "YBChatHistory " + " YBChatHistory_" + this.props.room;
        return <div className={ classname }>
                    { msgList }
               </div>;
    }
});

module.exports.generaYBChatPrivateHistory = function(objAtts, objFuncs)
{
    return  <PrivateHistory
                user = { objAtts.user }
                chat = { objAtts.chat }
                room = { objAtts.room }
                roomSelector = { ".YBChatHistory_" + objAtts.room } />;
};

var React = require("react");
var YBChatPrivateHistory = require("./YBChatPrivateHistory.jsx");

var PrivateExpanded = React.createClass({

    getActivos: function() {
        var activos = JSON.parse(localStorage.getItem("activeChat_status"));
        if (!activos || activos == "null") {
            activos = {};
        }
        return activos;
    },

    _onCellEdit: function(event) {
        event.persist();
    },

    _closeChat: function() {
        this.props.closeChat(this.props.user);
    },

    _closeExpanded: function() {
        this.props.unexpandChatUser(this.props.user);
    },

    _onChatFocus: function(event) {
        var activos = this.getActivos();
        if (this.props.user in activos) {
            activos[this.props.user]["focus"] = true;
        }
        else {
            activos[this.props.user] = {};
            activos[this.props.user]["focus"] = true;
        }
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
    },

    _onChatBlur: function(event) {
        var activos = this.getActivos();
        if (this.props.user in activos) {
            activos[this.props.user]["focus"] = false;
        }
        else {
            activos[this.props.user] = {};
            activos[this.props.user]["focus"] = false;
        }
        localStorage.setItem("activeChat_status", JSON.stringify(activos));
    },

    _onKeyDown: function(event) {
        event.persist();
        if (event.which != 13 && event.which != 9) {
            return;
        }
        event.preventDefault();
        this.props.sendMsg(this.props.user, event.target.value);
        $(".YBChatInput"  + this.props.user).val("");
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

        var objFuncs = {};
        var chatHistory = YBChatPrivateHistory.generaYBChatPrivateHistory(objAtts, objFuncs);
        var classnameExpanded = "YBChatExpanded " + "YBChat" + this.props.user + "Expanded";
        var classnameInput = "YBChatInput"  + this.props.user;
        var activos = JSON.parse(localStorage.getItem("activeChat_status"));
        var style;
        if (activos[this.props.user]["expanded"]) {
            style = {};
        }
        else {
            style =  {"display": "none"};
        }
        return  <div className={ classnameExpanded } style={ style }>
                    <div className="YBChatExpandedInfo">
                        <div className="YBChatExpandedInfoName" onClick={this._closeExpanded}>
                            { this.props.user }
                        </div>
                        <div className="YBChatExpandedClose"><i className="material-icons closeC" onClick={this._closeChat}>close</i></div>
                    </div>
                    <div> { chatHistory } </div>
                    <input id="YBChatInput" className={ classnameInput } type="string" onChange={ this._onCellEdit } onKeyDown={ this._onKeyDown } autoFocus={ true } onFocus={ this._onChatFocus } onBlur={ this._onChatBlur }/>
                </div>
    }
});


module.exports.generaYBChatPrivateExpanded = function(objAtts, objFuncs)
{
    return  <PrivateExpanded
                key = { "expanded_" + objAtts.user }
                user = { objAtts.user }
                chat = { objAtts.chat }
                room = { objAtts.room }
                sendMsg = { objFuncs.sendMsg }
                closeChat = { objFuncs.closeChat }
                unexpandChatUser = { objFuncs.unexpandChatUser }/>;
};
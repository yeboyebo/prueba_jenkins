var React = require('react');

var UserList = React.createClass({

    _showChat: function(user) {
        this.props.showChat(user);
    },

    _renderSisUsers: function() {
        var este = this;
        return this.props.sisusers.map((user) => {
            return <div className="YBChatUserElement" key={ user } onClick={ este._showChat.bind(este, user)}>
                        { user }
                    </div>;
        });
    },

    render: function() {
        var userList = this._renderSisUsers();
        return <div>
                    { userList }
               </div>;
    }
});


module.exports.generaYBChatUsersList = function(objAtts, objFuncs)
{
    return  <UserList
                user = { objAtts.user }
                sisusers = { objAtts.sisusers }
                showChat = { objFuncs.showChat }/>;
};
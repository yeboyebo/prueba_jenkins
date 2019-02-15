var React = require("react");

var YBTpvKeyboardDisplayBase = {

    _getClassName: function() {
        let className = "YBTpvKeyboardDisplay";
        return className;
    },

    render: function() {
        let className = this._getClassName();

        return  <div className={ className }>
                    { this.props.value }
                </div>;
    }
};

var YBTpvKeyboardDisplay = React.createClass(YBTpvKeyboardDisplayBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvKeyboardDisplay
                key = { objAtts.name }
                name = { objAtts.name }
                value = { objAtts.value }
                staticurl = { objAtts.staticurl }/>;
};

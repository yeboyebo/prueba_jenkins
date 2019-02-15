var React = require("react");

var YBTpvNumericKeyBase = {

    _onClick: function() {
        this.props.onClick(this.props.value);
    },

    _getClassName: function() {
        let className = "YBTpvNumericKey";
        return className;
    },

    render: function() {
        let className = this._getClassName();

        return  <div className={ className } onClick={ this._onClick }>
                    { this.props.value }
                </div>;
    }
};

var YBTpvNumericKey = React.createClass(YBTpvNumericKeyBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvNumericKey
                key = { objAtts.name }
                name = { objAtts.name }
                value = { objAtts.value }
                staticurl = { objAtts.staticurl }
                onClick = { objAtts.onClick }/>;
};

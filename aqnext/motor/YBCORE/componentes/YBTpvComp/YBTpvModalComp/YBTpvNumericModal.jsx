var React = require("react");
var YBTpvKeyboard = require("../YBTpvKeyboardComp/YBTpvKeyboard.jsx");

var YBTpvNumericModalBase = {

    _renderKeyboard: function() {
        return YBTpvKeyboard.generate({
            "name": this.props.name + "_keyboard",
            "type": "numeric",
            "value": this.props.param.value,
            "staticurl": this.props.staticurl,
            "onChange": this.props.onChange
        });
    },

    _getClassName: function() {
        let className = "YBTpvNumericModal";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let keyboard = this._renderKeyboard();

        return  <div className={ className }>
                    { keyboard }
                </div>;
    }
};

var YBTpvNumericModal = React.createClass(YBTpvNumericModalBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvNumericModal
                key = { objAtts.name }
                name = { objAtts.name }
                param = { objAtts.param }
                staticurl = { objAtts.staticurl }
                onChange = { objAtts.onChange }/>;
};

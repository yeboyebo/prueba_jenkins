var React = require("react");
var YBTpvKeyboardDisplay = require("./YBTpvKeyboardDisplay.jsx");
var YBTpvNumericKeyboard = require("./YBTpvNumericKeyboard.jsx");

var YBTpvKeyboardBase = {

    getInitialState: function() {
        let value = this.props.value;

        if (value == undefined) {
            if (this.props.type == "numeric") {
                value = 0;
            }
            else {
                value = "";
            }
        }

        return {
            "value": value
        };
    },

    _onChange: function(value) {
        this.setState({
            "value": value
        });
        this.props.onChange(value);
    },

    _renderDisplay: function() {
        return YBTpvKeyboardDisplay.generate({
            "name": this.props.name + "_display",
            "staticurl": this.props.staticurl,
            "value": this.state.value
        });
    },

    _renderKeyboard: function() {
        if (this.props.type == "numeric") {
            return YBTpvNumericKeyboard.generate({
                "name": this.props.name + "_keyboard",
                "staticurl": this.props.staticurl,
                "value": this.state.value,
                "onChange": this._onChange
            });
        }
    },

    _getClassName: function() {
        let className = "YBTpvKeyboard";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let display = this._renderDisplay();
        let keyboard = this._renderKeyboard();

        return  <div className={ className }>
                    { display }
                    { keyboard }
                </div>;
    }
};

var YBTpvKeyboard = React.createClass(YBTpvKeyboardBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvKeyboard
                key = { objAtts.name }
                name = { objAtts.name }
                type = { objAtts.type }
                value = { objAtts.value }
                staticurl = { objAtts.staticurl }
                onChange = { objAtts.onChange }/>;
};

var React = require("react");
var YBTpvNumericKey = require("./YBTpvNumericKey.jsx");

var YBTpvNumericKeyboardBase = {

    _onKeyClick: function(value) {
        let nValue = this.props.value;
        let pointIdx = this.props.value.toString().indexOf(".");

        if (!isNaN(value)) {
            if (pointIdx == -1) {
                nValue *= 10;
            }
            nValue += parseInt(value);
        }
        else if (value == "C") {
            nValue = 0;
        }
        else if (value == ".") {
            if (pointIdx == -1) {
                nValue += ".";
            }
            else {
                return;
            }
        }
        else {
            return;
        }
        this.props.onChange(nValue);
    },

    _renderKeys: function() {
        return ["7", "8", "9", "4", "5", "6", "1", "2", "3", "C", ".", "0"].map((k) => {
            return YBTpvNumericKey.generate({
                "name": this.props.name + "_key_" + k,
                "staticurl": this.props.staticurl,
                "value": k,
                "onClick": this._onKeyClick
            });
        });
    },

    _getClassName: function() {
        let className = "YBTpvNumericKeyboard";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let keys = this._renderKeys();

        return  <div className={ className }>
                    { keys }
                </div>;
    }
};

var YBTpvNumericKeyboard = React.createClass(YBTpvNumericKeyboardBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvNumericKeyboard
                key = { objAtts.name }
                name = { objAtts.name }
                value = { objAtts.value }
                staticurl = { objAtts.staticurl }
                onChange = { objAtts.onChange }/>;
};

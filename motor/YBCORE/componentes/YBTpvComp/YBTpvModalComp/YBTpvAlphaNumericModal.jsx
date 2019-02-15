var React = require("react");
var YBFieldDB = require("../../YBFieldDBComp/YBFieldDB.jsx");

var YBTpvAlphaNumericModalBase = {

    _renderField: function() {
    	let objAtts = {
            "layoutName": this.props.name + "_" + this.props.param.name,
            "fieldName": this.props.name + "_" + this.props.param.name,
            "LAYOUT": {
                "label": this.props.param.alias.toUpperCase(),
                "disabled": false
            },
            "SCHEMA": {
                "pk": null
            },
            "DATA": {},
            "modelfield": {
                "tipo": 3
            }
        };
        let objFuncs = {
        	"onChange": this._onChange
        };

        objAtts["DATA"][this.props.name + "_" + this.props.param.name] = this.props.param.value;
        return YBFieldDB.generaYBFieldDB(
            objAtts,
            objFuncs
        );
    },

    _onChange: function(name, prefix, value) {
    	this.props.onChange(value);
    },

    _getClassName: function() {
        let className = "YBTpvAlphaNumericModal";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let field = this._renderField();

        return  <div className={ className }>
                    { field }
                </div>;
    }
};

var YBTpvAlphaNumericModal = React.createClass(YBTpvAlphaNumericModalBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvAlphaNumericModal
                key = { objAtts.name }
                name = { objAtts.name }
                param = { objAtts.param }
                staticurl = { objAtts.staticurl }
                onChange = { objAtts.onChange }/>;
};

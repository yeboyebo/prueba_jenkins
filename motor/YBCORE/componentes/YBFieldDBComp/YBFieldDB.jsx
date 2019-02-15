var React = require("react");
var _ = require("underscore");
var URLResolver = require("../../navegacion/URLResolver.js");
var helpers = require("../../navegacion/helpers.js");
var YBTextAreaInput = require("./YBTextAreaInput.jsx");
var YBStringInput = require("./YBStringInput.jsx");
var YBNumberInput = require("./YBNumberInput.jsx");
var YBCheckBoxInput = require("./YBCheckBoxInput.jsx");
var YBMultiCheckBoxInput = require("./YBMultiCheckBoxInput.jsx");
var YBDateInput = require("./YBDateInput.jsx");
var YBIntervalDateInput = require("./YBIntervalDateInput.jsx");
var YBTimeInput = require("./YBTimeInput.jsx");
var YBRadioButtonInput = require("./YBRadioButtonInput.jsx");
var YBRelatedFieldDB = require("./YBRelatedFieldDB.jsx");
var YBMultiRelatedFieldDB = require("./YBMultiRelatedFieldDB.jsx");
var YBSelectFieldDB = require("./YBSelectFieldDB.jsx");
var YBFileInput = require("./YBFileInput.jsx");

function _funcionreturn(value) { return value; };

var YBFieldDBBase = {
    "propTypes": {
        "VALIDATION": React.PropTypes.func,
        "ONFOCUS": React.PropTypes.func,
        "ONBLUR": React.PropTypes.func,
        "onChange": React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            "ONFOCUS": _funcionreturn,
            "ONBLUR": _funcionreturn
        };
    },

    getInitialState: function() {
        return {
            "default_val": "",
            "suggestions": [],
            "status": true,
            "isRelated": false,
            "modelfield": {}
        };
    },

    _rendercomp: function() {
        var f = this.state.modelfield;
        var auto = f.auto;
        var val = this.props.modeldata;
        var type;

        var disabled = false;
        if ("disabled" in this.props.LAYOUT) {
            disabled = this.props.LAYOUT.disabled;
        }
        if ("disabled" in f) {
            disabled = f.disabled;
        }
        // if ("tipo" in this.props.LAYOUT) {
        //  type = this.props.LAYOUT["tipo"];
        // }
        // else {
        type = f.tipo;
        // }

        var input = {
            "inputKey": this.props.keyc,
            "inputRef": this.props.keyc,
            "inputName": this.props.name,
            "inputVerboseName": this.props.LAYOUT.label ? this.props.LAYOUT.label : f.verbose_name,
            "inputType": type,
            "inputValue": val,
            "inputDisabled": disabled,
            "inputAutoFocus": this.props.modelfocus == this.props.keyc,
            "inputRequired": f.required,
            "inputOpts": this.props.LAYOUT ? this.props.LAYOUT.opts : false
        };

        if (this.state.isRelated && type != 56 && type != 55 && type != 5) {
            var objAtts = {
                "layoutName": this.props.keyc,
                "fieldName": this.props.name,
                "modelfield": f,
                "SCHEMA": this.props.SCHEMA,
                "DATA": this.props.DATA,
                "prefix": this.props.prefix,
                "focus": this.props.modelfocus,
                "LAYOUT": this.props.LAYOUT,
                "calculate": this.props.calculate,
                "maindata": this.props.maindata,
                "disabled": disabled
            };
            var objFuncs = {
                "lanzaraccion": this.props.lanzarAccion,
                "onChange": this.props.onChange,
                "onBufferChange": this.props.onBufferChange,
                "onClientBufferChange": this.props.onClientBufferChange,
                "enterKeyPress": this.props.enterKeyPress
            };
            return YBRelatedFieldDB.generaYBRelatedFieldDB(objAtts, objFuncs);
        }
        else if (type == 5) {
            var objAtts = {
                "layoutName": this.props.keyc,
                "fieldName": this.props.name,
                "modelfield": f,
                "SCHEMA": this.props.SCHEMA,
                "DATA": this.props.DATA,
                "prefix": this.props.prefix,
                "focus": this.props.modelfocus,
                "LAYOUT": this.props.LAYOUT,
                "calculate": this.props.calculate
            };
            var objFuncs = {
                "onChange": this.props.onChange,
                "onBufferChange": this.props.onBufferChange,
                "lanzaraccion": this.props.lanzarAccion,
                "enterKeyPress": this.props.enterKeyPress
            };
            return YBSelectFieldDB.generaYBSelectFieldDB(objAtts, objFuncs);
        }
        else if (type == 55) {
            var objAtts = {
                "layoutName": this.props.keyc,
                "fieldName": this.props.name,
                "modelfield": f,
                "SCHEMA": this.props.SCHEMA,
                "DATA": this.props.DATA,
                "prefix": this.props.prefix,
                "focus": this.props.modelfocus,
                "LAYOUT": this.props.LAYOUT,
                "calculate": this.props.calculate,
                "disabled": disabled
            };
            var objFuncs = {
                "onChange": this.props.onChange,
                "onBufferChange": this.props.onBufferChange,
                "onClientBufferChange": this.props.onClientBufferChange,
                "lanzaraccion": this.props.lanzarAccion,
                "enterKeyPress": this.props.enterKeyPress
            };
            return YBRelatedFieldDB.generaYBRelatedFieldDB(objAtts, objFuncs);
        }
        else if (type == 56) {
           var objAtts = {
                "layoutName": this.props.keyc,
                "fieldName": this.props.name,
                "modelfield": f,
                "SCHEMA": this.props.SCHEMA,
                "DATA": this.props.DATA,
                "prefix": this.props.prefix,
                "focus": this.props.modelfocus,
                "LAYOUT": this.props.LAYOUT,
                "calculate": this.props.calculate
            };
            var objFuncs = {
                "onChange": this.props.onChange,
                "onBufferChange": this.props.onBufferChange,
                "lanzaraccion": this.props.lanzarAccion,
                "enterKeyPress": this.props.enterKeyPress
            };
            return YBMultiRelatedFieldDB.generaYBMultiRelatedFieldDB(objAtts, objFuncs);
        }
        else if (f.subtipo == 6 || type == 6) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBTextAreaInput.generaYBTextAreaInput(objAtts, objFuncs);
        }
        else if (type == 3 || type == 4) {
            return YBStringInput.generate({
                "input": input,
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            });
        }
        else if (type == 16 || type == 19 || type == 37) {
            //input.inputValue = input.inputValue ? input.inputValue : 0;
            var objAtts = {
                "input": input,
                "modelfield": f,
            };
            var objFuncs = {
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "onBlur": this._onBlurNumber,
                "onFocus": this._onFocus
            };
            return YBNumberInput.generaYBNumberInput(objAtts, objFuncs);
        }
        else if (type == 18) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onChange": this._onChecked,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBCheckBoxInput.generaYBCheckBoxInput(objAtts, objFuncs);
        }
        else if (type == 180) {
            var objAtts = {
                "name": this.props.name,
                "input": input
            };
            var objFuncs = {
                "onChange": this._onFieldChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBMultiCheckBoxInput.generaYBMultiCheckBoxInput(objAtts, objFuncs);
        }
        else if (type == 26) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBDateInput.generaYBDateInput(objAtts, objFuncs);
        }
        else if (type == 27) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onChange": this._onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBTimeInput.generaYBTimeInput(objAtts, objFuncs);
        }
        else if (type == 28) {
            var objAtts = {
                "input": input,
                "prefix": this.props.prefix,
                "data": this.props.DATA
            };
            var objFuncs = {
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "propsChange": this.props.onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            };
            return YBIntervalDateInput.generaYBIntervalDateInput(objAtts, objFuncs);
        }
/*        else if (type == 30) {
            let objAtts = {
                "layoutName": this.props.keyc,
                "fieldName": this.props.name,
                "modelfield": f,
                "SCHEMA": this.props.SCHEMA,
                "DATA": this.props.DATA,
                "modeldata": this.props.DATA,
                "relData": {},
                "prefix": this.props.PREFIX,
                "focus": this.props.modelfocus,
                "related": {},
                "LAYOUT": this.props.LAYOUT,
                "actions": this.props.LAYOUT.actions,
                "calculate": this.props.calculate,
                "user": this.props.DATA.idusuario
            };
            let objFuncs = {
                "onChange": this.props.onFieldChange,
                "onClientBufferChange": this.props.onClientBufferChange,
                "lanzarAccion": this.props.lanzarAccion,
                "addPersistentData": {}
            };

            return YBFileInput.generaYBFileInput(objAtts, objFuncs);
        }*/
        else if (type == 90) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onChange": this._onChange,
                "onBufferChange": this.props.onBufferChange
            };
            return YBRadioButtonInput.generaYBRadioButtonInput(objAtts, objFuncs);
        }
        /*else if (type == 62) {
            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onChange": this._onChange,
                "onBufferChange": this.props.onBufferChange
            };
            return YBFileCanvasImageInput.generaYBFileCanvasImageInput(objAtts, objFuncs);
        }*/
        else {
            return YBStringInput.generate({
                "input": input,
                "onKeyDown": this._onKeyDown,
                "onChange": this._onChange,
                "onBlur": this._onBlur,
                "onFocus": this._onFocus
            });
        }
    },

    componentWillMount: function() {
        var f = this.props.modelfield;
        if ("defaultvalue" in f) {
            this.props.onChange(this.props.name, this.props.prefix, f.defaultvalue);
            this.props.addPersistentData(this.props.name, f.defaultvalue, true);
        }
        else if (!this.props.modeldata && this.props.modeldata != 0) {
            if(!this.props.LAYOUT.hasOwnProperty("prefix")) {
                this.props.onChange(this.props.name, this.props.prefix, null);
            }
        }

        var modelfield = this.props.modelfield;
        modelfield.key = this.props.name;
        var isRelated = (modelfield.hasOwnProperty("rel") || this.props.LAYOUT.hasOwnProperty("rel")) && (modelfield.hasOwnProperty("desc") ||  this.props.LAYOUT.hasOwnProperty("desc")) ? true : false;
        if (isRelated && modelfield.tipo != "55" && modelfield.tipo != "5") {
            var ct = _getDataFromRelatedField(modelfield, this.props.LAYOUT);
            var comboLimit = this.props.LAYOUT.combolimit || 10;
            modelfield.tipo = ct > comboLimit ? "55" : "5";
            if (this.props.LAYOUT.hasOwnProperty("function")) {
                modelfield.tipo = "55";
            }
        }
        this.setState({"isRelated": isRelated, "modelfield": modelfield});
    },

    render: function() {
        var rendercomp = this._rendercomp();
        var f = this.props.modelfield;

        var style = {};
        if (this.props.LAYOUT && this.props.LAYOUT.hasOwnProperty("style")) {
            style = this.props.LAYOUT.style;
        }

        var className = "form-group label-floating ";
        if (!this.props.modeldata && f.tipo != 26 && f.tipo != 27 && f.tipo != 28 && f.tipo != 16 && f.tipo != 19 && f.tipo != 37 && f.tipo != 90) {
            className += " is-empty "
        }
        var labelText;

        var hrstyle = {
            "borderTop": "none rgb(255, 64, 129)",
            "borderRight": "none rgb(255, 64, 129)",
            "borderBottom": "1px rgb(255, 64, 129)",
            "borderLeft": "none rgb(255, 64, 129)",
            "borderImage": "initial",
            "bottom": "8px",
            "boxSizing": "content-box",
            "margin": "0px",
            "position": "absolute",
            "width": "96%",
            "transform": "scaleX(1)",
            "transition": "all 450ms"
        };
        var requiredComp = null;

        if (this.state.isRelated || f.tipo == 5 || f.tipo == 55 || f.tipo == 56) {
            hrstyle["borderBottom"] = "1px solid rgb(67, 67, 254)";
            hrstyle["width"] = "96%";
            requiredComp = <hr style={ hrstyle }/>;
        }
        if (f.hasOwnProperty("required") && f.required && !this.props.modeldata && this.props.modeldata != 0) {
            hrstyle["borderBottom"] = "1px solid rgb(255, 64, 129)";
            requiredComp = <hr style={ hrstyle }/>;
        }
        if (f.className) {
            className += f.className;
        }

        if (f.tipo == 6 || f.subtipo == 6) {
            className += " col-md-12 fdtextarea";
        }
        //*********************
        else if (!this.state.isRelated) {
            if (f.tipo == 27 || f.tipo == 16 || f.tipo == 19 || f.tipo == 37) {
                className += " col-sm-4";
            }
            else if (f.tipo == 26) {
                className += " col-sm-4";
            }
            else if (f.tipo == 3 || f.tipo == 4) {
                if (this.state.modelfield.max_length <= 20) {
                    className += " col-sm-2";
                }
                else if (this.state.modelfield.max_length > 20 && this.state.modelfield.max_length < 40) {
                    className += " col-sm-4";
                }
                else if (this.state.modelfield.max_length > 100) {
                    className += " col-sm-8";
                }
                else {
                    className += " col-sm-4";
                }
            }
            else {
                className += " col-sm-6";
            }
        }
        var labelClassName = "control-label";

        if (this.props.LAYOUT) {
            labelText = this.props.LAYOUT.label ? this.props.LAYOUT.label : f.verbose_name;
        }
        else {
            labelText = f.verbose_name;
        }

        if (this.state.isRelated || f.tipo == 5 || f.tipo == 55 || f.tipo == 56) {
            className = " YBRelatedfield";

            if (!this.props.modal) {
                className += " col-sm-4 ";
            }
            if (f.className) {
                className += f.className;
            }
            return  <div
                        className={ className }
                        key={f.key}
                        style={ style }>
                            {rendercomp}
                            { requiredComp }
                    </div>;
        }
        else if (f.tipo == 18 || f.tipo == 180) {
            className = "YBCheckBox ";
            labelText = null;
            if (f.className) {
                className += f.className;
            }
            else {
                className += "col-sm-4";
            }        }
        else if (f.tipo == 90) {
            labelClassName = "";
        }
        else if (f.tipo == 28) {
            return rendercomp;
        }
        if (this.props.newform) {
            className += "td_yb_fielddb";
            return <tr>
                        <td>
                            <label className={ labelClassName }>{ labelText }</label>
                        </td>
                        <td
                            className={ className }
                            key={ f.key }
                            style={ style }>
                                { rendercomp }
                                { requiredComp }
                        </td>
                    </tr>;
        }
        return  <div
                    className={ className }
                    key={ f.key }
                    style={ style }>
                        <label className={ labelClassName } htmlFor={ f.key }>
                            { labelText }
                        </label>
                        { rendercomp }
                        { requiredComp }
                </div>;
    },

    _onBlurNumber: function(event, value) {
        this.props.onChange(this.props.keyc, this.props.prefix, value);
        if (!this.props.onBufferChange) {
            return;
        }
        try {
            this.props.onBufferChange(null, null, this.props.keyc, value, null);
        } catch(ex) {};
    },

    _onBlur: function(event) {
        var val = event.target.value;
        if (!this.props.onBufferChange) {
            return;
        }

        event.persist();
        try {
            if (this.state.modelfield.tipo == 18) {
                val = event.target.checked;
            }

            this.props.onBufferChange(null, null, event.target.name, val, null);
        } catch(ex) {};
    },

    _onFocus: function(event) {
        event.persist();
    },

    _onKeyDown: function(event, v) {
        if (!this.props.enterKeyPress) {
            return;
        }

        event.persist();
        if (event.which == 13) {
            this.props.lanzarAccion(this.props.keyc, this.props.prefix, this.props.enterKeyPress, null, {});
        }
    },

    _onChange: function(event, v) {
        if (event.which != 110) {
            if (!this.props.onChange) {
                return;
            }

            event.persist();
            this.props.onChange(event.target.name, this.props.prefix, event.target.value);
        }
    },

    _onFieldChange: function(name, v) {
        this.props.onChange(name, this.props.prefix, v);
    },

    _onChecked: function(event) {
        if (!this.props.onChange) {
            return;
        }

        event.persist();
        this.props.onChange(event.target.name, this.props.prefix, event.target.checked);
    }
};

function _getFieldFromSchema(SCHEMA, LAYOUT) {
    return Object.keys(SCHEMA).map((sKey) => {
        if (SCHEMA[sKey].key) {
            return {
                "obj": SCHEMA[sKey],
                "key": sKey
            };
        }
    });
};

function _getDataFromField(DATA, name) {
    let nData = null;
    Object.keys(DATA[0]).map((key) => {
        if (key == name) {
            nData = DATA[0][key];
        }
        return true;
    });
    return nData;
};

function _getActions(actions) {
    var enterKeyPress = null;
    for(var i = 0, l = actions.length; i < l; i++) {
        if (actions[i].signal == "enterPressed") {
            enterKeyPress = actions[i];
        }
    }
    return enterKeyPress;
};

function _getDataFromRelatedField(schema, LAYOUT, fieldData) {
    var rel = LAYOUT.rel || schema.rel;
    var clave = LAYOUT.key || schema.to_field;
    var desc = LAYOUT.desc || schema.desc;
    var url = URLResolver.getRESTQuery(rel, '');
    var midata = {
        "p_c": true
    };

    if (fieldData) {
        midata["s_" + clave + "__exact"] = fieldData;
    }
    var aux = helpers.requestGETre(url, midata,
    function(response) {
        if (!fieldData) {
            return response
        }

        if (response.data.length > 0) {
            return response.data[0][desc];
        }
        else {
            return []
        }
    },
    function(xhr, textStatus, errorThrown) {
        console.log(xhr.responseText);
        return "";
    });
    if (!fieldData) {
        return aux.responseJSON.PAG.COUNT;
    }
    if (aux.responseJSON.data.length > 0) {
        return aux.responseJSON.data[0][desc];
    }
    else {
        return "";
    }
};

var YBFieldDB = React.createClass(YBFieldDBBase);

module.exports.generaYBFieldDB = function(objAtts, objFuncs)
{
    var obj = {};
    var enterKeyPress;
    if (objAtts.LAYOUT.hasOwnProperty("actions")) {
        enterKeyPress = _getActions(objAtts.LAYOUT.actions);
    }

    if (objAtts.actions) {
        enterKeyPress = _getActions(objAtts.actions);
    }

    return  <YBFieldDB
                key = { objAtts.layoutName }
                name = { objAtts.fieldName }
                keyc = { objAtts.layoutName }
                DATA = { objAtts.DATA }
                modeldata = { objAtts.DATA[objAtts.fieldName] }
                modelfield = { objAtts.modelfield }
                relData = { objAtts.relData }
                calculate = { objAtts.calculate }
                modelfocus = { objAtts.focus }
                pkSchema = { objAtts.SCHEMA["pk"] }
                SCHEMA = { objAtts.SCHEMA }
                LAYOUT = { objAtts.LAYOUT }
                prefix = { objAtts.prefix }
                combolimit = { objAtts.combolimit }
                onChange = { objFuncs.onChange }
                onBufferChange = { objFuncs.onBufferChange }
                onClientBufferChange = { objFuncs.onClientBufferChange }
                lanzarAccion = { objFuncs.lanzarAccion }
                enterKeyPress = { enterKeyPress }
                addPersistentData = { objFuncs.addPersistentData }
                maindata = { objAtts.modeldata }
                modal = { objAtts.modal }
                newform = { objAtts.newform }
                { ...obj }/>;
};

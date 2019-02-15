var React = require("react");
var _ = require("underscore");
var YBForm = require("./YBForm.jsx");
var YBButton = require("../YBButton.jsx");

var YBMultiFormBase = {

    getInitialState: function() {
        return {
            "ERROR": []
        };
    },

    _onSubmit: function(submitType, e) {
        e.preventDefault();

        var mainPrefix = this.props.layout.mainPrefix;
        var valor = this.props.data;
        valor["multiForm"] = true;
/*        if (!this._validateForm()) {
            return false;
        }*/ 

        for (var rel in this.props.relSchema) {
            var relation = this.props.relSchema[rel];
            if ("fieldRelation" in relation && relation["fieldRelation"]) {
                valor[rel][relation["rel"]] = valor[mainPrefix][relation["fieldRelation"]];
            }
            else if ("rel" in relation && relation["rel"]) {
                valor[rel][relation["rel"]] = valor[mainPrefix][relation["rel"]];
            }
        }

        if (submitType && submitType != "") {
            this.props.lanzarAccion(this.props.layout, mainPrefix, submitType, null, valor);
        }
        else {
            this.props.lanzarAccion(this.props.layout, mainPrefix, "submit", null, valor);
        }
    },

    _validateForm: function() {
        var errores = [];
        for (var f in this.props.layout.forms) {
            var layout = this.props.layout.forms[f];
            this.props.data[layout.prefix]
            this.props.schema[layout.prefix]
            for (var field in this.props.schema[layout.prefix]) {
                if ("required" in this.props.schema[layout.prefix][field] && this.props.schema[layout.prefix][field].required && (this.props.data[layout.prefix][field] === undefined || this.props.data[layout.prefix][field] === null || this.props.data[layout.prefix][field] == "") && this.props.data[layout.prefix][field] != 0) {
                    errores.push("Campo " + this.props.schema[layout.prefix][field].verbose_name + " no puede ser nulo");
                }
            }
        }

        if (errores.length > 0) {
            this.setState({ERROR: errores});
            return false;
        }
        return true;
    },

    _onReturn: function(e) {
        var mainPrefix = this.props.layout.mainPrefix;

        this.props.lanzarAccion(this.props.layout, mainPrefix, "return", null, null);
    },

    _renderSubmits: function() {
        var submits = [];

        if (this.props.layout.saveEdit) {
            submits.push(this._renderSubmit("submit-edit"));
        }
        if (this.props.layout.saveReturn) {
            submits.push(this._renderSubmit("submit-return"));
        }
        if (!submits.length) {
            submits.push(this._renderSubmit());
        }

        return submits;
    },

    _renderSubmit: function(submitType) {
        var disabled = false;
        if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && this.props.name in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][this.props.name] == "disabled") {
            disabled = true;
        }

        var label = false;
        if (submitType == "submit-edit") {
            label = "Guardar y editar";
        }
        else if (submitType == "submit-return") {
            label = "Guardar y volver";
        }
        else {
            label = "Guardar";
        }

        var objAtts = {
            "name": this.props.name + "__" + (submitType || "submit"),
            "layout": {
                "actionType": "submit",
                "label": label,
                "buttonType": "raised",
                "primary": false,
                "secondary": true,
                "style": YBForm.styles.button,
                "action": null,
                "prefix": null,
                "disabled": disabled
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this._onSubmit.bind(this, submitType)
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderReturn: function() {
        if (!this.props.layout.return) {
            return "";
        }

        var objAtts = {
            "name": this.props.name + "__return",
            "layout": {
                "actionType": "button",
                "buttonType": "flat",
                "label": "Volver",
                "primary": false,
                "secondary": true,
                "style": YBForm.styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this._onReturn
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderForms: function() {
        var forms = [];
        for (var f in this.props.layout.forms) {
            var layout = this.props.layout.forms[f];
            var objAtts = {
                "name": f,
                "DATA": this.props.data[layout.prefix],
                "SCHEMA": this.props.schema[layout.prefix],
                "LAYOUT": layout,
                "APLIC": this.props.aplic,
                "drawIf": this.props.drawIf,
                "prefix": layout.prefix,
                "multiForm": true,
                "focus": this.props.FOCUS,
                "disabled": this.props.disabled,
                "bufferChange": this.props.bufferChange,
                "labels": this.props.labels
            };
            var objFuncs = {
                "lanzarAccion": this.props.lanzarAccion,
                "onBufferChange": this.props.onBufferChange,
                "onChange": this.props.onChange,
                "addPersistentData": this.props.addPersistentData
            };
            forms.push(YBForm.generaYBForm(objAtts, objFuncs));
        }
        return forms;
    },

    _renderErrorMsg: function() {
        var errorMsg = [];
        for (var e in this.state.ERROR) {
            errorMsg.push(<p key={ "Erromsg_" + e } style={ {"color": "red"} }>{ this.state.ERROR[e] }</p>);
        }
        return errorMsg;
    },

    render: function() {
        var forms = this._renderForms();
        var submits = this._renderSubmits();
        var bReturn = this._renderReturn();
        var error = null;
        if (this.state.ERROR.length > 0) {
            error = this._renderErrorMsg();
        }

        return  <div className="YBMultiForm" key={ this.props.name }>
                    { error }
                    { forms }
                    { submits }
                    { bReturn }
                </div>;
    }
};

var YBMultiForm = React.createClass(YBMultiFormBase);

module.exports.generaYBMultiForm = function(objAtts, objFuncs)
{
    return  <YBMultiForm
                key = { objAtts.name }
                name = { objAtts.name }
                data = { objAtts.DATA }
                schema = { objAtts.schema }
                layout = { objAtts.LAYOUT }
                aplic = { objAtts.aplic }
                bufferChange = { objAtts.bufferChange }
                drawIf = { objAtts.drawIf }
                focus = { objAtts.focus }
                disabled = { objAtts.disabled }
                labels = { objAtts.labels }
                relSchema = { objAtts.relSchema }
                lanzarAccion = { objFuncs.lanzarAccion }
                onBufferChange = { objFuncs.onBufferChange }
                onChange = { objFuncs.onChange }
                addPersistentData = { objFuncs.addPersistentData }/>;
}

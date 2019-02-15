var React = require("react");
var _ = require("underscore");
var YBFieldDB = require("../YBFieldDBComp/YBFieldDB.jsx");
var YBLabel = require("../YBLabel.jsx");
var YBButton = require("../YBButton.jsx");
var YBFileInput = require("../YBFieldDBComp/YBFileInput.jsx");

function _funcionreturn(value) {
    return value;
}

var styles = {
    "button": {
        "float": "left",
        "marginTop": "10px"
    }
};

module.exports.styles = styles;

var YBFormBase = {

    "propTypes": {
        "VALIDATION": React.PropTypes.func,
        "ONSUBMIT": React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            "ONSUBMIT": _funcionreturn
        };
    },

    getInitialState: function() {
        return {
            "ERROR": [],
            "status": true,
            "changeBuffer": {}
        };
    },

    _onSubmit: function(submitType, e) {
        e.preventDefault();
        var valor = {};
        valor[this.props.LAYOUT.prefix] = this.props.DATA;
        if (!this._validateForm()) {
            return false;
        }
        if (submitType && submitType != "") {
            this.props.lanzarAccion(this.props.LAYOUT, this.props.LAYOUT.prefix, submitType, null, valor);
        }
        else if (this.props.onSubmit) {
            this.props.lanzarAccion(this.props.LAYOUT, this.props.LAYOUT.prefix, this.props.onSubmit, null, valor);
        }
        else {
            this.props.lanzarAccion(this.props.LAYOUT, this.props.LAYOUT.prefix, "submit", null, valor);
        }
    },

    _onReset: function(e) {
        if (this.props.onReset) {
            this.props.onReset();
        }
        else {
            this.props.lanzarAccion(this.props.LAYOUT, this.props.LAYOUT.prefix, "return", null, null);
        }
    },

    _onChange: function(inputKey, prefix, inputVal) {
        // Comentado porque fastidiaba cierta funcionalidad del filterForm (revisar)
        // if (!inputVal) {
        //     inputVal = "";
        // }
        this.props.onChange(this.props.name, this.props.PREFIX, inputKey, inputVal, this.props.DATA.pk);
    },

    _onBufferChange: function(a, b, inputKey, inputVal, e) {
        this.props.onBufferChange(this.props.name, this.props.PREFIX, inputKey, inputVal, this.props.DATA.pk);
        if (this.props.LAYOUT.hasOwnProperty("autoCommit") && this.props.LAYOUT.autoCommit == true) {
            var este = this;
            var valor = {};
            valor[this.props.LAYOUT.prefix] = this.props.DATA;
            setTimeout(function() { 
                    if (!este._validateForm()) {
                        return false;
                    }
                    este.props.lanzarAccion(este.props.LAYOUT, este.props.LAYOUT.prefix, este.props.onSubmit, null, valor);
                }, 400);
        }
    },

    _hideGroupBox: function(title) {
        if (!("groupbox" in this.props.LAYOUT) || this.props.LAYOUT.groupbox != "acordeon") {
            return;
        }

        var nameclass = title;
        nameclass = nameclass.split(" ").join("·");
        nameclass = nameclass.split("(").join("·");
        nameclass = nameclass.split(")").join("·");
        nameclass = "." + nameclass;
        $(nameclass).toggleClass("acordeonYBFormGroupBox");
    },

    _validateForm: function() {
        var errores = [];
        for (var field in this.props.formSchema) {
            if ("required" in this.props.formSchema[field] && this.props.formSchema[field].required && (this.props.DATA[field] === undefined || this.props.DATA[field] === null || this.props.DATA[field] == "") && (this.props.formSchema[field].tipo == 3 || this.props.DATA[field] != 0)) {
                errores.push("Campo " + this.props.formSchema[field].verbose_name + " no puede ser nulo");
            }
        }
        this.setState({ERROR: errores});
        if (errores.length > 0) {
            return false;
        }
        return true;
    },

    _renderErrorMsg: function() {
        var errorMsg = [];
        for (var e in this.state.ERROR) {
            errorMsg.push(<p key={ "Erromsg_" + e } style={ {"color": "red"} }>{ this.state.ERROR[e] }</p>);
        }
        return errorMsg;
    },

    _renderFields: function(lFields, schema, parent, disabled) {
        var form = [];
        var inputs;
        var relData = false;
        var nameClass = "formGroupBox ";
        var first = true;
        var newform = false;

        if ("groupbox" in this.props.LAYOUT) {
            if (this.props.LAYOUT.groupbox == "acordeon") {
                nameClass += "acordeonYBFormGroupBox ";
            }
        }

        if (this.props.LAYOUT.hasOwnProperty("newform") && this.props.LAYOUT.newform) {
            newform = true;
        }
        for (var field in lFields) {
            if (lFields[field].hasOwnProperty("visible") && lFields[field].visible == false) {
                void(0);
                continue;
            }
            if (field.substring(0, 3) == "gb_") {
                if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && field in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][field] == "hidden") {
                    continue;
                }
                if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && field in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][field] == "disabled") {
                    disabled = true;
                }
                if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && parent in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][parent] == "disabled") {
                    disabled = true;
                }

                inputs = [];
                var className = nameClass;
                var titlekey = lFields[field].title || field.split("__")[1];
                var title = lFields[field].title || "";
                if (first) {
                    className = "formGroupBox";
                    first = false;
                }
                className += this.props.filter ? " gbFilterForm" : "";
                inputs = this._renderFields(lFields[field].fields, schema, field, disabled);

                if (titlekey) {
                    var claseGb = titlekey;
                    claseGb = claseGb.split(" ").join("·");
                    claseGb = claseGb.split("(").join("·");
                    claseGb = claseGb.split(")").join("·");
                }

                className += " " + claseGb;
                var filter = titlekey == "Filtros" ? this._renderFilter() : "";
                var reset = titlekey == "Filtros" ? this._renderReset() : "";
                var guardarFiltro = titlekey == "Filtros" ? this._renderSaveFilter() : "";
                //title = claseGb || title;
                if (newform) {
                    form.push(<div className={ className }  ref={ titlekey } key={ titlekey }>
                                    <div className="gbform">
                                        <table className="col-sm-6"> { inputs} </table>
                                    </div>
                                    { filter }
                                    { reset }
                                    { guardarFiltro }
                              </div>)
                }
                else {
                    form.push(
                        <div className={ className }  ref={ titlekey } key={ titlekey }>
                            <h4 className="formGroupBoxTitle" onClick={ this._hideGroupBox.bind(this, title) }>
                                { title }
                            </h4>
                            <div className="gbform">
                                { inputs }
                            </div>
                            { filter }
                            { reset }
                            { guardarFiltro }
                        </div>
                    );
                }
            }
            else {
                if (this.props.drawIf && parent in this.props.drawIf && field in this.props.drawIf[parent] && this.props.drawIf[parent][field] == "hidden") {
                    continue;
                }

                var f = lFields[field];
                if (!this.props.formSchema.hasOwnProperty(field) && !f.hasOwnProperty("componente")) {
                    console.log("El campo no se encuentra en el modelo -->", field);
                }
                if (schema) {
                    relData = this.props.formSchema[field].rel && this.props.formSchema[field].desc ? true : false;
                }
                else if (f.componente != "YBLabel" && (f.rel || this.props.formSchema[field].rel) && this.props.DATA[field]) {
                    relData = true;
                }
                else {
                    relData = false;
                }

                f = _.extend({}, f);
                if (disabled) {
                    f.disabled = true;
                }
                else if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && parent in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][parent] == "disabled") {
                    f.disabled = true;
                }
                else if (this.props.drawIf && parent in this.props.drawIf && field in this.props.drawIf[parent] && this.props.drawIf[parent][field] == "disabled") {
                    f.disabled = true;
                }

                if (f.hasOwnProperty("componente") && f.componente == "YBLabel") {
                    var objAtts = {
                        "name": field,
                        "layout": f,
                        "modelData": this.props.DATA,
                        "relData": relData,
                        "labelData": this.props.labels
                    };
                    var objFuncs = {};
                    var key = "lbl_" + field;
                    var label = <div key={ key } className="col-sm-12">
                                    { YBLabel.generaYBLabel(objAtts, objFuncs) }
                                </div>;
                    form.push(label);
                }
                else if ((schema || !this.props.excludeFields || !this.props.excludeFields[field]) && field != "pk" && field != "desc") {

                    var onBufferChange = this._onBufferChange;
                    if (this.props.name.startsWith("modal_") && !this.props.formSchema[field].clientBch) {
                        onBufferChange = null;
                    }
                    if (this.props.formSchema[field].tipo == 30) {
                        let objAtts = {
                            "layoutName": field,
                            "fieldName": field,
                            "modelfield": this.props.formSchema[field],
                            "SCHEMA": this.props.formSchema,
                            "DATA": this.props.DATA,
                            "relData": relData,
                            "prefix": f.prefix,
                            "focus": this.props.FOCUS,
                            "LAYOUT": f,
                            "actions": null,
                            "calculate": null,
                            "user": this.props.DATA.idusuario
                        };
                        let objFuncs = {
                            "onChange": this._onChange,
                            "onClientBufferChange": this.props.onClientBufferChange,
                            "lanzarAccion": this.props.lanzarAccion,
                            "addPersistentData": null
                        };

                        form.push(YBFileInput.generaYBFileInput(objAtts, objFuncs));
                    }
                    else {

                        var objAtts = {
                            "layoutName": field,
                            "fieldName": field,
                            "modelfield": this.props.formSchema[field],
                            "SCHEMA": this.props.formSchema,
                            "DATA": this.props.DATA,
                            "relData": relData,
                            "prefix": this.props.PREFIX,
                            "focus": this.props.FOCUS,
                            "LAYOUT": f,
                            "actions": null,
                            "calculate": null,
                            "modal": this.props.modal,
                            "newform": newform
                        };
                        var objFuncs = {
                            "onChange": this._onChange,
                            "onBufferChange": onBufferChange,
                            "onClientBufferChange": this.props.onClientBufferChange,
                            "lanzarAccion": this.props.lanzarAccion,
                            "addPersistentData": null
                        };
                        form.push(YBFieldDB.generaYBFieldDB(objAtts, objFuncs));
                    }
                }
            }
        }
        return form;
    },

    _rendercomp: function() {
        var lFields = this.props.layoutFields;
        var form = [];

        if (lFields) {
            form = this._renderFields(lFields, false, this.props.name, this.props.disabled);
            return  <div className="formInputSet" key="formInputSet">
                        { form }
                    </div>;
        }

        form = this._renderFields(this.props.formSchema, true, this.props.name, this.props.disabled);
        return  <div className="formGroupBox">
                    <div className="gbform">
                        { form }
                    </div>
                </div>;
    },

    _renderSubmits: function() {
        var submits = [];
        if (this.props.LAYOUT.saveEdit && this.props.onSubmit == "create") {
            submits.push(this._renderSubmit("submit-edit"));
        }
        if (this.props.LAYOUT.saveReturn && this.props.onSubmit == "create") {
            submits.push(this._renderSubmit("submit-return"));
        }
        if (this.props.LAYOUT.saveNew && this.props.onSubmit == "create") {
            submits.push(this._renderSubmit("submit-new"));
        }
        if (this.props.LAYOUT.saveReturn && this.props.onSubmit == "update") {
            submits.push(this._renderSubmit("update-return"));
        }
        if (this.props.LAYOUT.send == false && this.props.onSubmit == "update") {
            submits = [];
        }
        else if (!submits.length && !this.props.multiForm) {
            submits.push(this._renderSubmit());
        }

        return submits;
    },

    _renderSubmit: function(submitType) {
        if (this.props.filter) {
            return "";
        }

        var disabled = false;
        if (this.props.drawIf && this.props.drawIf["parentGroupBox"] && this.props.name in this.props.drawIf["parentGroupBox"] && this.props.drawIf["parentGroupBox"][this.props.name] == "disabled") {
            disabled = true;
        }

        var label = false;
        if (submitType == "submit-edit") {
            label = "Guardar y editar";
        }
        else if (submitType == "submit-return" || submitType == "update-return") {
            label = "Guardar y volver";
        }
        else if (submitType == "submit-new") {
            label = "Guardar y nuevo"
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
                "style": styles.button,
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

    _renderFilter: function() {
        if (!this.props.filter) {
            return "";
        }

        var objAtts = {
            "name": this.props.name + "__filter",
            "layout": {
                "actionType": "button",
                "label": "Filtrar",
                "buttonType": "raised",
                "primary": false,
                "secondary": true,
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.props.onFilterSubmit
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderSaveFilter: function() {
        if (!this.props.filter || !this.props.onFilterSave) {
            return "";
        }

        var objAtts = {
            "name": this.props.name + "__saveFilter",
            "layout": {
                "actionType": "button",
                "label": "Guardar",
                "buttonType": "flat",
                "primary": false,
                "secondary": true,
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.props.onFilterSave
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderReset: function() {
        if (!this.props.filter) {
            return "";
        }

        var objAtts = {
            "name": this.props.name + "__reset",
            "layout": {
                "actionType": "reset",
                "buttonType": "flat",
                "label": "Limpiar",
                "primary": false,
                "secondary": true,
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.props.onReset || this._onReset
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderReturn: function() {
        if (!this.props.LAYOUT.return) {
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
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.props.onReset || this._onReset
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    render: function() {
        var rendercomp;
        var error;
        if (this.props.DATA) {
            rendercomp = this._rendercomp();
        }
        var submit = this._renderSubmits();
        var volver = this._renderReturn();
        var className = "YBForm " + this.props.name;
        if (this.props.LAYOUT.hasOwnProperty("className")) {
            className += " " + this.props.LAYOUT.className;
        }
        if (this.state.ERROR.length > 0) {
            error = this._renderErrorMsg();
        }

        return  <div className={ className }>
                    { error }
                    { rendercomp }
                    <div className="YBFormSubmit">{ submit }</div>
                    { volver }
                </div>;
    }
};

var YBForm = React.createClass(YBFormBase);

module.exports.generaYBForm = function(objAtts, objFuncs)
{
    if ((!objAtts.LAYOUT || !objAtts.LAYOUT.hasOwnProperty("componente") || objAtts.LAYOUT.componente != "YBForm") && !objAtts.filter) {
        objAtts.LAYOUT = {};
    }

    return  <YBForm
                key = { objAtts.name }
                name = { objAtts.name }
                formSchema = { objAtts.SCHEMA }
                DATA = { objAtts.DATA }
                layoutFields = { objAtts.LAYOUT.fields }
                excludeFields = { objAtts.LAYOUT.exclude }
                lanzarAccion = { objFuncs.lanzarAccion }
                APLIC = { objAtts.APLIC }
                LAYOUT = { objAtts.LAYOUT }
                PREFIX = { objAtts.prefix }
                FOCUS = { objAtts.focus }
                disabled = { objAtts.disabled }
                filter = { objAtts.filter }
                drawIf = { objAtts.drawIf }
                multiForm = { objAtts.multiForm }
                bufferChange = { objAtts.bufferChange }
                onBufferChange = { objFuncs.onBufferChange }
                onClientBufferChange = { objFuncs.onClientBufferChange }
                onChange = { objFuncs.onChange }
                labels = { objAtts.labels }
                addPersistentData = { objFuncs.addPersistentData }
                onSubmit = { objFuncs.onSubmit }
                onFilterSubmit = { objFuncs.onFilterSubmit }
                onFilterSave = { objFuncs.onFilterSave }
                onReset = { objFuncs.onReset }
                modal = { objAtts.modal }/>;
};

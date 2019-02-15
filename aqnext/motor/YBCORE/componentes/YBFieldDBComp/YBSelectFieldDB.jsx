var React = require("react");
var URLResolver = require("../../navegacion/URLResolver.js");
var helpers = require("../../navegacion/helpers.js");

import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

function _funcionreturn(value) {
	return value;
};

var YBSelectFieldDBBase = {

    getInitialState: function() {
        return {
            "val_auto": "",
            "status": true,
            "fields": [],
            "verbose_name": ""
        };
    },

    handleChange: function(event, index, value) {
        //this.props.onChange(this.props.keyc, value);
        var aux = null;
        var este = this;

        if (this.props.LAYOUT.hasOwnProperty("modelName")) {
            aux = this.props.LAYOUT["modelName"];
        }
        this.props.onChange(this.props.name, this.props.prefix, value, aux);

        if (this.props.onBufferChange) {
            this.props.onBufferChange(null, null, this.props.keyc, value, null);
        }
        if (this.props.lanzaraccion && this.props.enterKeyPress) {
            setTimeout(function() {
                este.props.lanzaraccion(este.props.keyc, este.props.prefix, este.props.enterKeyPress, null, {});
            }, 300);
        }
    },

    shouldComponentUpdate: function(np, ns) {
        return this.props.modeldata != np.modeldata;
    },

    componentWillUpdate: function() {
        this.actualizaComponent();
    },

    componentWillMount: function() {
        this.actualizaComponent();
    },

    actualizaComponent: function() {
        var fields = [];
        var verbose_name;

        if ("clientoptionslist" in this.props.LAYOUT) {
            fields = _getFieldsFromLayout(this.props.LAYOUT["clientoptionslist"]);
            if ("verbose_name" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.verbose_name;
            }
            else if ("key" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.key;
            }
        }
        else if (this.props.name in this.props.SCHEMA && "optionslist" in this.props.SCHEMA[this.props.name]) {
            fields = _getFieldsFromModel(this.props.SCHEMA[this.props.name].optionslist);
            verbose_name = this.props.SCHEMA[this.props.name].verbose_name;
            if ("verbose_name" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.verbose_name;
            }
            else if ("key" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.key;
            }
        }
        else {
            fields = _getFieldsFromBD(this.props.LAYOUT, this.props.schemadata, this.props.SCHEMA[this.props.name]);
            if ("auto_name" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.auto_name;
            }
            else if (this.props.name in this.props.SCHEMA && "verbose_name" in this.props.SCHEMA[this.props.name]) {
                verbose_name = this.props.SCHEMA[this.props.name].verbose_name;
            }
            else if ("verbose_name" in this.props.LAYOUT) {
                verbose_name = this.props.LAYOUT.verbose_name;
            }
            else {
                verbose_name = this.props.LAYOUT.key;
            }
        }
        this.setState({"fields": fields, "verbose_name": verbose_name});
    },

    render: function() {
        var f = this.props.modelfield;
        var label = this.state.verbose_name;
        var disabled = false;
        var style = {}

        if ("disabled" in this.props.LAYOUT) {
            disabled = this.props.LAYOUT.disabled;
        }

        return <div style={ style }>
                    <SelectField
                        value={ this.props.modeldata }
                        disabled={ disabled }
                        autoWidth={ true }
                        fullWidth={ true }
                        onChange={ this.handleChange }
                        floatingLabelText={ label }>
                            { this.state.fields }
                    </SelectField>
                </div>;
    }
};

var YBSelectFieldDB = React.createClass(YBSelectFieldDBBase);

function _getFieldsFromBD(jsonmeta, schemadata, schema) {
    var este = this;
    var filtro = {};
    filtro["p_l"] = 27;
    if ("filtro" in jsonmeta) {
        for (var f in jsonmeta["filtro"]) {
            if (f.startsWith("f_")) {
                filtro["f_"] = f.substr(2);
            }
            else if (f.startsWith("r_")) {
                var data = schemadata["pk"];
                filtro["s_" + f.substr(2) + "__icontains"] = data;
            }
            else {
                var data = schemadata[f];
                if (f == "idusuario") {
                    data =  schemadata["usuario"];
                }
                filtro["s_" + f + "__icontains"] = data;
            }
        }
    }

    var rel = jsonmeta.rel || schema.rel;
    var sURL = URLResolver.getRESTQuery(rel, "list");
    var aux = helpers.requestGETre(sURL, filtro, function(response) {}, function(xhr) { console.log(xhr); });
    var campos = aux.responseJSON.data;
    var fields = [];
    var value = null;
    var key, desc;

    fields.push(<MenuItem key="Vacio" value={ null } primaryText="&nbsp;"/>);
    for (var i = 0, l = campos.length; i < l; i++) {
        if (schema && schema.hasOwnProperty("to_field")) {
            key = schema["to_field"];
        }
        else {
            key = jsonmeta["key"];
        }
        //key = schema["to_field"] || jsonmeta["key"];
        desc = jsonmeta["desc"] || schema["desc"];
        fields.push(<MenuItem key={ i } value={ campos[i][key] } primaryText={ campos[i][desc] }/>)
    }
    return fields;
};

function _getFieldsFromModel(ol) {
    var value = null;
    var list = ol.split(",");
    var fields = [
    	<MenuItem key="Vacio" value={ value } primaryText="&nbsp;"/>
    ];

    for (let i = 0, l = list.length; i < l; i++) {
        fields.push(<MenuItem key={ i } value={ list[i] } primaryText={ list[i] }/>)
    }

    return fields;
};

function _getFieldsFromLayout(optionslist) {
    var value = null;
    var fields = [
    	<MenuItem key="Vacio" value={ value } primaryText="&nbsp;"/>
    ];

    for (let i in optionslist) {
        if (i == "null") {
            fields.push(<MenuItem key={ i } value={ value } primaryText={ i }/>);
        }
        else {
            fields.push(<MenuItem key={ i } value={ optionslist[i] } primaryText={ i }/>);
        }
    }

    return fields;
};

module.exports.generaYBSelectFieldDB = function(objAtts, objFuncs)
{
    var modeldata = objAtts.DATA[objAtts.fieldName];

    if (objAtts.LAYOUT.hasOwnProperty("modelName")) {
        modeldata = objAtts.DATA[objAtts.LAYOUT.modelName];
    }

    return  <YBSelectFieldDB
                keyc = { objAtts.modelfield.key }
                key = { objAtts.layoutName }
                name = { objAtts.fieldName }
                keyc = { objAtts.modelfield.key }
                prefix = { objAtts.prefix }
                pkSchema = { objAtts.SCHEMA["pk"]}
                SCHEMA = { objAtts.SCHEMA }
                modelfield = { objAtts.modelfield }
                schemadata = { objAtts.DATA }
                modeldata = { modeldata }
                modelfocus = { objAtts.focus }
                onChange = { objFuncs.onChange }
                LAYOUT = { objAtts.LAYOUT }
                onBufferChange = { objFuncs.onBufferChange }
                enterKeyPress = { objFuncs.enterKeyPress }
                lanzaraccion = { objFuncs.lanzaraccion }/>;
};

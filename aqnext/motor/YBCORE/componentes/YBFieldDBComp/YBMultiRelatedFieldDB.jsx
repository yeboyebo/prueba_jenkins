var React = require('react');
var URLResolver = require('../../navegacion/URLResolver.js');
var helpers = require('../../navegacion/helpers.js');
var YBFieldDB = require('./YBFieldDB.jsx');

import AutoComplete from 'material-ui/AutoComplete';

function _funcionreturn(value) {return value;};

var RelatedFieldBase = {

    getInitialState: function() {
        return {
            descripcion: this.props.modeldata,
            primary: this.props.dataRel,
            dataRel: [],
            suggestions: [],
            errorText: " ",
        };
    },

    _onSuggestionSelected: function(data, pos) {
        var suggestionSelected = undefined;
        var disabledField = this.props.LAYOUT.disabled_field || this.props.LAYOUT.key;
        var descripcion = undefined;
        var primary = undefined;
        var relData;
        //if(typeof data == 'string' && this.state.suggestions.length > 0){
        if(this.state.suggestions.length == 1) {
            relData = this.state.suggestions[0];
            suggestionSelected = this.state.suggestions[0][this.props.LAYOUT.key];
            data = this.state.suggestions[0];
            descripcion = this.state.suggestions[0][disabledField];
        }
        else {
            relData = data;
            suggestionSelected = data[this.props.LAYOUT.key];
            descripcion = data[disabledField];
        }

        var este = this;
        this.props.onChange(this.props.LAYOUT.key, este.props.prefix, suggestionSelected);
        //Settimeout para dar tiempo a que guarde la pk
        if(this.props.onBufferChange)
            este.props.onBufferChange(null, null, este.refs[este.props.keyc].name, suggestionSelected, null);

        if(this.props.lanzaraccion)
            setTimeout(function(){este.props.lanzaraccion(este.props.keyc, este.props.prefix, este.props.enterKeyPress, null, {});}, 300);

        this.setState({suggestions: [], errorText: null, descripcion: descripcion, dataRel: data, primary: suggestionSelected});
    },

    _mierror: function(xhr) {
        console.log(xhr);
    },

    _onSuggestionsUpdateRequested: function(value) {
        var este = this;
        var filtro = {};
        filtro["p_l"] = 7;
        filtro["q_" + this.props.LAYOUT.desc + "__icontains"] = value;
        filtro["q_" + this.props.LAYOUT.key + "__icontains"] = value;

        if("search" in this.props.LAYOUT) {
            for (var s in this.props.LAYOUT["search"]) {
                filtro["q_" + s + "__icontains"] = value;
            }
            // filtro["q_" + this.props.LAYOUT.search[i] + "__icontains"] = value;
        }
        if("filtro" in this.props.LAYOUT) {
            for (var f in this.props.LAYOUT["filtro"]) {
                if (f.startsWith('f_')) {
                    filtro['f_'] = f.substr(2);
                }
                else if(f.startsWith('r_')) {
                    filtro["s_" + f.substr(2) + "__icontains"] = este.props.schemadata['pk'];
                }
                else {
                    filtro["s_" + f + "__icontains"] = este.props.schemadata[f];
                }
            }
            // for(var i = 0, l = this.props.LAYOUT.filtro.length; i < l; i++) {
            // 	if(this.props.LAYOUT.filtro[i].startsWith('f_')) {
	           //      filtro['f_'] = this.props.LAYOUT.filtro[i].substr(2);
	           //  }
	           //  else if(this.props.LAYOUT.filtro[i].startsWith('r_')) {
	           //      filtro["s_" + this.props.LAYOUT.filtro[i].substr(2) + "__icontains"] = este.props.schemadata['pk'];
	           //  }
	           //  else {
	           //      filtro["s_" + this.props.LAYOUT.filtro[i] + "__icontains"] = este.props.schemadata[this.props.LAYOUT.filtro[i]];
	           //  }
            //     // filtro["s_" + this.props.LAYOUT.filtro[i] + "__icontains"] = este.props.schemadata[this.props.LAYOUT.filtro[i]];
            // }
        }
        if(this.props.pkSchema && "tipo" in this.props.pkSchema && this.props.pkSchema.tipo != 3 && !isNaN(parseFloat(value))) {
            filtro["q_pk__exact"] = value;
        }

        var sURL = URLResolver.getRESTQuery(this.props.LAYOUT.rel, 'list');
        var aux = helpers.requestGETre(sURL, filtro, function(response) {
        //helpers.requestGET(sURL, filtro, function(response){
            // if(response.data.length > 0)
            //     console.log("")
                //este.setState({"suggestions": response.data})
        }, function(xhr) {
            console.log(xhr);
        });
        var campos = aux.responseJSON.data;
        // this.props.onChange(this.props.keyc, este.props.prefix, undefined);
        //Settimeout para dar tiempo a que guarde la pk
        //if(this.props.onBufferChange)
        //  este.props.onBufferChange(este.refs[este.props.keyc].name, undefined);
        this.setState({"errorText": " ", "suggestions": campos});
    },

    dameSuggestion: function(filtro) {
        // console.log(filtro);
    },

    _rendercomp: function() {
        var f = this.props.modelfield;
        var val = this.props.modeldata;
    },

    _onKeyPress: function(event) {
        // console.log("key press");
        // console.log(event)
    },

    _onInputFocus: function() {
        // this.refs.autoInput.select();
        $("#" + this.props.modelfield.key).select();
    },

    render: function() {
        var este = this;
        var errorText = this.state.errorText;
        if(this.props.dataRel)
            errorText = null;
        var rendercomp = this._rendercomp();
        var f = this.props.modelfield;
        var type = "text";
        var classname = ' validacion col-sm-6 ';
        if('showpk' in this.props.LAYOUT) {
            if(!this.props.LAYOUT.showpk) {
                type = "hidden";
                classname += 'fieldHidden';
            }
        }
        //var type = "hidden"
        var autoField = this.props.LAYOUT.auto_field || this.props.LAYOUT.desc;
        var disabledField = this.props.LAYOUT.disabled_field || this.props.LAYOUT.desc;

        var dataSourceConfig = {
            text: autoField,
            value: this.props.LAYOUT.desc,
        };
        var label = this.props.LAYOUT.key;
        var descLabel = this.props.LAYOUT.desc;


        if("disabled_name" in this.props.LAYOUT)
            descLabel = this.props.LAYOUT.disabled_name;
        if(this.props.SCHEMA[this.props.LAYOUT.key] && "auto_name" in this.props.SCHEMA[this.props.LAYOUT.key])
            label = this.props.SCHEMA[this.props.LAYOUT.key].auto_name;
        if("auto_name" in this.props.LAYOUT)
            label = this.props.LAYOUT.auto_name;

        var fields = [];
        $.each(this.props.LAYOUT.fields, function(key, obj) {
            var schema = {};
            var related = {"disabled": true};
            schema['verbose_name'] = este.props.related.fields[key].verbose_name;
            schema['required'] = true;
            schema['tipo'] = este.props.related.fields[key].tipo;
            schema['auto'] = null;

            var objAtts = {
                "layoutName": key,
                "fieldName": este.props.related.fields[key]['key'],
                "modelfield": schema,
                "SCHEMA": {},
                "DATA": este.props.calculate,
                "relData": "",
                "prefix": este.props.PREFIX,
                "focus": null,
                "related": related,
                "LAYOUT": null,
                "actions": null,
                "calculate": null
            };
            var objFuncs = {
                "lanzarAccion": null,
                "onChange": null,
                "onBufferChange": null,
                "addPersistentData": null
            };
            fields.push(YBFieldDB.generaYBFieldDB(objAtts, objFuncs))
        });

        return  <div className="YBMultiRelatedFieldDB" key = {this.props.modelfield.key}>
                    <div className="relFields">
                        {fields}
                    </div>
                    <AutoComplete
                        ref = "autoInput"
                        floatingLabelText = { label }
                        filter = { AutoComplete.noFilter }
                        openOnFocus = { true }
                        dataSource = { this.state.suggestions }
                        dataSourceConfig = { dataSourceConfig }
                        maxSearchResults = { 7 }
                        id = { this.props.modelfield.key }
                        autoFocus = { this.props.modelfocus == this.props.modelfield.key }
                        searchText = { this.props.calculate[this.props.LAYOUT.desc] }
                        errorText = { errorText }
                        onKeyPress = { this._onKeyPress }
                        onFocus = { this._onInputFocus }
                        onUpdateInput = { this._onSuggestionsUpdateRequested }
                        onNewRequest = { this._onSuggestionSelected }/>
                </div>;
    },
};

var RelatedField = React.createClass(RelatedFieldBase);

module.exports.generaYBMultiRelatedFieldDB = function(objAtts, objFuncs)
{
	var calculate;
    objAtts.modelfield.key = objAtts.layoutName;

    if(objAtts.layoutName in objAtts.calculate)
        calculate = objAtts.calculate[objAtts.layoutName]
    else
        calculate = "";

    return  <RelatedField
                key = { objAtts.layoutName }
                name = { objAtts.fieldName }
                keyc = { objAtts.modelfield.key }
                prefix = { objAtts.prefix }
                pkSchema = { objAtts.SCHEMA['pk']}
                SCHEMA = { objAtts.SCHEMA }
                modelfield = { objAtts.modelfield }
                schemadata = { objAtts.DATA }
                calculate = { calculate }
                modeldata = { objAtts.DATA[objAtts.fieldName] }
                modelfocus = { objAtts.focus }
                dataRel = { objAtts.dataRel }
                onChange = { objFuncs.onChange }
                onBufferChange = { objFuncs.onBufferChange }
                LAYOUT = { objAtts.LAYOUT }
                enterKeyPress = { objFuncs.enterKeyPress }
                lanzaraccion = { objFuncs.lanzaraccion }/>;
};
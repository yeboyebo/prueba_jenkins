var React = require("react");
var URLResolver = require("../../navegacion/URLResolver.js");
var helpers = require("../../navegacion/helpers.js");

import AutoComplete from "material-ui/AutoComplete";

function _funcionreturn(value) {return value;};

var RelatedFieldBase = {

    getInitialState: function() {
        return {
            "descripcion": "",
            "dataRel": "",
            "suggestions": [],
            "errorText": " ",
            "descValue": false
        };
    },

    onSuggestionSelected: function(data, pos) {
        var suggestionSelected = undefined;
        var clave = this.props.modelfield.to_field || this.props.LAYOUT.key;
        var disabledField = this.props.LAYOUT.disabled_field || clave;
        var autoField = this.props.LAYOUT.auto_field || this.props.LAYOUT.desc || this.props.SCHEMA[this.props.modelfield.key].desc;
        var descripcion = undefined;
        var dataRel = undefined;
        var selectFirstOnEnter = "firstOnEnter" in this.props.LAYOUT ? this.props.LAYOUT.firstOnEnter : true;
        if (typeof data == "string" && this.state.suggestions.length > 0) {
            if (selectFirstOnEnter || this.state.suggestions.length == 1) {
                suggestionSelected = this.state.suggestions[0][clave];
                dataRel = this.state.suggestions[0][autoField];
            }
            else {
                suggestionSelected = data;
                dataRel = data;
            }
        }
        else {
            suggestionSelected = data[clave];
            dataRel = data[autoField];
        }

        var este = this;
        this.props.onChange(this.props.name, este.props.prefix, suggestionSelected);

        if (this.props.onBufferChange) {
            este.props.onBufferChange(null, null, este.props.keyc, suggestionSelected, null);
        }

        if (this.props.lanzaraccion && este.props.enterKeyPress) {
            setTimeout(function() {
                este.props.lanzaraccion(este.props.keyc, este.props.prefix, este.props.enterKeyPress, null, {});
            }, 300);
        }

        if (this.props.LAYOUT.hasOwnProperty("clientBch")) {
            var inputKey = este.props.keyc;
            if (this.props.LAYOUT.clientBch && this.props.LAYOUT.clientBch != true) {
                inputKey = this.props.LAYOUT.clientBch;
            }
            este.props.onClientBufferChange(null, null, inputKey, suggestionSelected, null);
            return;
        }
        this.setState({"suggestions": [], "errorText": null, "dataRel": dataRel, "descValue": false});
    },

    _mierror: function(xhr) {
        console.log(xhr);
    },

    _updateRequest: function(value) {
        var este = this;
        var filtro = {};
        var campos = [];
        var rel = this.props.LAYOUT.rel || this.props.modelfield.rel;
        var clave = this.props.LAYOUT.keyFilter || this.props.LAYOUT.key || this.props.modelfield.to_field;
        
        var desc = this.props.LAYOUT.desc || this.props.modelfield.desc;
        var query = this.props.LAYOUT.query || false;
        if ("function" in this.props.LAYOUT) {
            var oParam = {};
            oParam["oParam"] = {"val": value};
            if (this.props.LAYOUT.hasOwnProperty("params")) {
                for (var p in this.props.LAYOUT["params"]) {
                    if (this.props.LAYOUT["params"][p] in this.props.schemadata) {
                        oParam["oParam"][this.props.LAYOUT["params"][p]] = this.props.schemadata[this.props.LAYOUT["params"][p]];
                    }
                }
            }
            var pk = null;
            if (this.props.maindata && this.props.maindata.hasOwnProperty("pk")) {
                pk = this.props.maindata.pk;
                if (this.props.LAYOUT.hasOwnProperty("relKey")) {
                    var urpk = URLResolver.getRESTQuery(rel, null, "list");
                    var filtro = {"p_l": 1, "p_o": 2};
                    filtro["s_" +  this.props.LAYOUT.relKey + "__exact"] = this.props.maindata[this.props.LAYOUT.relKey];
                    var objPk = helpers.requestGETre(urpk, filtro, function(response) {
                        // console.log(response)
                    });
                    pk = objPk.responseJSON.data[0].pk;
                }
            }
            else {
                var urpk = URLResolver.getRESTQuery(rel, null, "list");
                var objPk = helpers.requestGETre(urpk, {"p_l": 1, "p_o": 2}, function(response) {
                });
                pk = objPk.responseJSON.data[0].pk;
            }
            var url = URLResolver.getRESTAccion(rel, pk, este.props.LAYOUT["function"]);
            var aux = helpers.requestAccion(url, oParam, "PUT");
            campos = aux.responseJSON.resul;
        }
        else {
            filtro["p_l"] = 7;
            if (query) {
                filtro["q_" + query + "__icontains"] = value;
            }
            else {
                filtro["q_" + desc + "__icontains"] = value;
            }

            if (clave.split(".").length == 1) {
              filtro["q_" + clave + "__icontains"] = value;
            }

            if ("search" in this.props.LAYOUT) {
                for (var s in this.props.LAYOUT["search"]) {
                    filtro["q_" + s + "__icontains"] = value;
                }
            }

            if ("filtro" in this.props.LAYOUT) {
                for (var f in this.props.LAYOUT["filtro"]) {
                    if (f.startsWith("f_")) {
                        filtro[f] = value;
                    }
                    else if (f.startsWith("r_")) {
                        filtro["s_" + f.substr(2) + "__icontains"] = este.props.schemadata["pk"];
                    }
                    else {
                        filtro["s_" + f + "__icontains"] = este.props.schemadata[f];
                    }
                }
            }

            if (this.props.pkSchema && "tipo" in this.props.pkSchema && this.props.pkSchema.tipo != 3 && !isNaN(parseFloat(value))) {
                filtro["q_pk__exact"] = value;
            }
            var sURL = URLResolver.getRESTQuery(rel, "list");
            var aux = helpers.requestGETre(sURL, filtro, function(response) {
                //console.log(response)
            }, function(xhr) {
                console.log(xhr);
            });
            campos = aux.responseJSON.data;
            var este = this;
        }
        this.setState({"errorText": " ", "suggestions": campos, "descValue": value});
    },

    onSuggestionsUpdateRequested: function(value) {
        if (this.props.LAYOUT.hasOwnProperty("searchOn")) {
            if (this.props.LAYOUT.searchOn == "dot") {
                if (value.endsWith("  ")) {
                    value = value.slice(0, -2);
                    this._updateRequest(value);
				}
				else {
					this.setState({"errorText": " ", "suggestions": [], "descValue": value});
				}
            }
        }
        else {
            this._updateRequest(value);
        }

        this.props.onChange(this.props.name, this.props.prefix, undefined);
    },

    _onAutoClick: function() {
        $("#" + this.props.modelfield.key).select();
    },

    componentWillUpdate: function(np, ns) {
        if (this.props.modeldata != np.modeldata) {
            this.actualizaComponent(np);

            if (!np.modeldata) {
                if (ns.descValue) {
                    this.setState({"dataRel": ns.descValue});
                }
                else {
                    this.setState({"dataRel": undefined});
                }
            }
        }
    },

    componentWillMount: function() {
        this.actualizaComponent();
    },

    actualizaComponent: function(np) {
        var modelfield = this.props.modelfield;
        var dataRel = undefined;
        var modeldata = np ? np.modeldata : this.props.modeldata;
        if (modeldata) {
            dataRel = _getDataFromRelatedField(modelfield, this.props.LAYOUT, modeldata);
            modelfield.key = this.props.name;
            this.setState({"dataRel": dataRel});
        }
    },

    _onNewRecord: function() {
        this.props.lanzaraccion(this.props.keyc, this.props.SCHEMA[this.props.keyc].rel, "invocaModal", this.props.schemadata.pk, {"tipo": "newRecord"});
    },


    render: function() {
        var errorText = this.state.errorText;
        if (this.state.dataRel) {
            errorText = null;
        }

        var style = {
            "autoOnly": {
                "width": "50%",
                "paddingLeft": 15,
                "position": "relative",
                "float": "left",
                "maxHeight": 73,
                "overflow": "hidden"
            },
            "autoFull": {
                "width": "90%",
                "position": "relative",
                "float": "left",
                "maxHeight": 73
            },
            "newRecordIcon": {
                "width": "10%",
                "position": "relative",
                "float": "left",
                "cursor": "pointer",
                "marginTop": "42px"
            }
        };

        var autoField = this.props.LAYOUT.auto_field || this.props.LAYOUT.desc || this.props.SCHEMA[this.props.modelfield.key].desc;
        var autoValue = this.props.LAYOUT.desc || this.props.SCHEMA[this.props.modelfield.key].desc;
        var dataSourceConfig = {
            "text": autoField,
            "value": autoValue
        };

        var descLabel = this.props.modelfield.verbose_name || this.props.LAYOUT.desc || this.props.SCHEMA[this.props.modelfield.key].verbose_name;
        var descValue = this.props.modeldata || "";

        if ("auto_name" in this.props.LAYOUT) {
            descLabel = this.props.LAYOUT.auto_name;
        }

        if ("label" in this.props.LAYOUT) {
            descLabel = this.props.LAYOUT.label;
        }

        if (descValue) {
            descLabel = descLabel + ": " + descValue
        }

        var disabledField = this._generaDisabledField();
        var estilo = style.autoOnly;
        var onNewRecord = [];
        if (!disabledField) {
            estilo = style.autoFull;
        }

        return  <div className="divhidden" key={ this.props.modelfield.key }>
                    { disabledField }
                    <div style= { estilo }>
                        <AutoComplete
                            onClick = { this._onAutoClick }
                            floatingLabelText = { descLabel }
                            filter = { AutoComplete.noFilter }
                            openOnFocus = { true }
                            fullWidth = { true }
                            dataSource = { this.state.suggestions }
                            dataSourceConfig = { dataSourceConfig }
                            maxSearchResults = { 7 }
                            id = { this.props.modelfield.key + " _related"}
                            disabled = { this.props.disabled }
                            autoFocus = { this.props.modelfocus == this.props.modelfield.key }
                            searchText = { this.state.dataRel }
                            errorText = { errorText }
                            onUpdateInput = { this.onSuggestionsUpdateRequested }
                            onNewRequest = { this.onSuggestionSelected }/>
                    </div>
                    { onNewRecord }
                </div>;
    },

     _generaDisabledField: function() {
        return null;
    }
};

var RelatedField = React.createClass(RelatedFieldBase);

function _getDataFromRelatedField(schema, LAYOUT, fieldData) {
    var rel = LAYOUT.rel || schema.rel;
    var clave = schema.to_field || LAYOUT.key;
    var desc = LAYOUT.desc || schema.desc;
    var url = URLResolver.getRESTQuery(rel, "");
    var midata = {
        "p_c": true
    };

    if (fieldData && clave.split(".").length == 1) {
        midata["s_" + clave + "__exact"] = fieldData;
    }
    var aux = helpers.requestGETre(url, midata,
    function(response) {
        if (!fieldData) {
            return response;
        }

        if (response.data.length > 0) {
            return response.data[0][desc];
        }
        else {
            return [];
        }
    },
    function(xhr, textStatus, errorThrown) {
        console.log(xhr.responseText);
    });

    if (aux.responseJSON.data.length > 0) {
        return aux.responseJSON.data[0][desc];
    }
    else {
        return "";
    }
};


module.exports.generaYBRelatedFieldDB = function(objAtts, objFuncs)
{
    objAtts.modelfield.key = objAtts.layoutName;
    var modeldata =  objAtts.DATA[objAtts.fieldName];
    return (
        <RelatedField
            key = { objAtts.layoutName }
            name = { objAtts.fieldName }
            keyc = { objAtts.modelfield.key }
            prefix = { objAtts.prefix }
            pkSchema = { objAtts.SCHEMA["pk"] }
            SCHEMA = { objAtts.SCHEMA }
            modelfield = { objAtts.modelfield }
            schemadata = { objAtts.DATA }
            modeldata = { modeldata }
            modelfocus = { objAtts.focus }
            onChange = { objFuncs.onChange }
            onBufferChange = { objFuncs.onBufferChange }
            onClientBufferChange = { objFuncs.onClientBufferChange }
            LAYOUT = { objAtts.LAYOUT }
            enterKeyPress = { objFuncs.enterKeyPress }
            lanzaraccion = { objFuncs.lanzaraccion }
            disabled = { objAtts.disabled }
            maindata = { objAtts.maindata }/>
    );
};

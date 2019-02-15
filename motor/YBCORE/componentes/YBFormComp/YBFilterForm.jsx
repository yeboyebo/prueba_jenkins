var React = require("react");
var helpers = require("../../navegacion/helpers.js");
var URLResolver = require("../../navegacion/URLResolver.js");
var _ = require("underscore");
var YBForm = require("./YBForm.jsx");
var YBSelectFieldDB = require("../YBFieldDBComp/YBSelectFieldDB.jsx");
var YBButton = require("../YBButton.jsx");

var styles = {
    "iconSave": {
        "float": "left",
        "marginTop": "12px",
        "marginLeft": "10px",
        "position": "relative",
        "width": "20px",
        "cursor": "pointer"
    },
    "iconEdit": {
        "float": "right",
        "marginTop": "10px",
        "marginRight": "10px",
        "position": "relative",
        "width": "20px",
        "cursor": "pointer"
    }
};

var YBFilterFormBase = {

    getInitialState: function() {
        var aObj = this._getSchemaLayoutFromFilters();
        return {
            "schema": aObj.schema,
            "layout": aObj.layout,
            "filterData": [],
            "activatedFilter": ""
        };
    },

    _getSchemaLayoutFromFilters: function() {

        var fSchema = {}, fLayout = {}, fN, fL, fS;

/*        var fLNombre = {};
        var fSPrueba = {};
        fSPrueba["codcliente1"] = {};
        fSPrueba["codcliente1"]["tipo"] = 55;
        fSPrueba["codcliente1"]["verbose_name"] = "Cliente";
        fSPrueba["codcliente1"]["to_field"] = "codcliente";
        fSPrueba["codcliente1"]["rel"] = "clientes";
        fSPrueba["codcliente1"]["desc"] = "nombre";
        fSPrueba["codcliente1"]["required"] = true;
        fSPrueba["codcliente1"]["visible"] = true;
        fSPrueba["codcliente1"].className = "algo";
        fSchema = fSPrueba;
        fLayout["codcliente1"] = {};
        fLayout["gb__nombre"] = fSchema;*/

/*        var fSPrueba2 = {};
        fSPrueba2 = {};
        fSPrueba2["tipo"] = 55;
        fSPrueba2["verbose_name"] = "Cliente";
        fSPrueba2["to_field"] = "codcliente";
        fSPrueba2["rel"] = "clientes";
        fSPrueba2["desc"] = "nombre";
        fSPrueba2["required"] = true;
        fSPrueba2["visible"] = true;
        fSPrueba2.className = "algo";
        fSchema["codcliente2"] = fSPrueba2;
        fLayout["codcliente2"] = {};
        fLayout["gb__nombre2"] = fSchema["codcliente2"];*/

        if (this.props.customfilter) {
            var fLNombre = {};
            var fSNombre = {};
            fSNombre["filtername"] = {};
            fSNombre["filtername"]["tipo"] = 3;
            fSNombre["filtername"]["verbose_name"] = "Nombre del filtro";
            fSNombre["filtername"]["required"] = true;
            fSNombre["filtername"]["visible"] = true;
            fSNombre["filtername"].className = "algo";
            fSchema = fSNombre;
            fLayout["filtername"] = {};
            fLayout["gb__filternombre"] = fSNombre;
        }

        for (fN in this.props.LAYOUT.filter) {
            fL = _.extend({}, this.props.LAYOUT.filter[fN]);
            fS = _.extend({}, this.props.SCHEMA[fN]);
            if (fL && fL.filterType == "combo") {
                fN = "cb_" + fN;
                fS.key = fN;
                fS.verbose_name = fS.verbose_name;
                fS.tipo = 5;
                fS.clientoptionslist = fL.optionlist;
                fS.fstr = "s_" + fN.substr(3) + "__exact";
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
            else if (fL && fL.filterType == "desde") {
                fN = "d_" + fN;
                fS.verbose_name = "Desde " + fS.verbose_name;
                fS.key = fN;
                fS.tipo = 26;
                fS.fstr = "s_" + fN.substr(2) + "__gte";
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
            else if (fL && fL.filterType == "hasta") {
                fN = "h_" + fN;
                fS.verbose_name = "Hasta " + fS.verbose_name;
                fS.key = fN;
                fS.fstr = "s_" + fN.substr(2) + "__lte";
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
            else if (fL && fL.filterType == "desde-hasta") {
                var fN2 = "h_" + fN;
                var fS2 = _.extend({}, fS);
                fN = "d_" + fN;
                fS.verbose_name = "Desde " + fS.verbose_name;
                fS.key = fN;
                fS.fstr = "s_" + fN.substr(2) + "__gte";
                fS2.verbose_name = "Hasta " + fS2.verbose_name;
                fS2.key = fN2;
                fS2.fstr = "s_" + fN2.substr(2) + "__lte";
                fSchema[fN] = fS;
                fSchema[fN2] = fS2;
                fLayout[fN] = fS;
                fLayout[fN2] = fS2;
            }
            else if (fL && fL.filterType == "interval") {
                // fN = "d_" + fN;
                // fS.tipo = 28;
                // fS.verbose_name = "Desde " + fS.verbose_name;
                // fS.key = fN;
                // fS.fstr = "s_" + fN.substr(2) + "__gte";
                // fSchema[fN] = fS;
                // fLayout[fN] = fS;
                //fN = fN;
                fS.verbose_name = fS.verbose_name;
                fS.key = fN;
                fS.fstr = "s_" + fN + "__icontains";
                fS.tipo = 28;
                var fNH = "h_" + fN;
                var fSH = _.extend({}, fS);
                fSH.tipo = 28;
                fSH.verbose_name = "Hasta " + fSH.verbose_name;
                fSH.key = fNH;
                fSH.fstr = "s_" + fNH.substr(2) + "__lte";
                fSchema[fN] = fS;
                fSchema[fN2] = fSH;
                var fND = "d_" + fN;
                var fSD = _.extend({}, fS);
                fSD.tipo = 28;
                fSD.verbose_name = "Desde " + fSD.verbose_name;
                fSD.key = fND;
                fSD.fstr = "s_" + fND.substr(2) + "__gte";
                var fNI = "i_" + fN;
                var fSI = _.extend({}, fS);
                fSI.tipo = 28;
                fSI.verbose_name = "Intervalo " + fSI.verbose_name;
                fSI.key = fNI;
                fSI.fstr = null;
                //fSchema[fN] = fS;
                fSchema[fNI] = fSI;
                fSchema[fNH] = fSH;
                fSchema[fND] = fSD;
                fLayout[fN] = fS;
            }
            else if (fL && fL.filterType == "multiseleccion") {
                var value, fNAux, fSAux, gbLayout = {};
                for (value in fL.values) {
                    fNAux = "ms_" + fN + "__" + value;
                    fSAux = _.extend({}, fS);

                    fSAux.tipo = 18;
                    fSAux.className = "YBCheckBoxMS col-sm-2";
                    fSAux.verbose_name = fL.values[value] != null ? fL.values[value] : value;
                    fSAux.key = fNAux;
                    fSAux.fstr = "s_" + fN + "__in";
                    gbLayout[fNAux] = fSAux;
                    fSchema[fNAux] = fSAux;
                }
                fLayout["gb__" + fL.title] = {};
                fLayout["gb__" + fL.title].fields = gbLayout;
            }
            else if (fL && fL.filterType == "seleccion") {
                var value, fNAux, fSAux, gbLayout = {};
                // for (value in fL.values) {
                    fNAux = "sel_" + fN;
                    fSAux = _.extend({}, fS);

                    fSAux.tipo = 90;
                    //fSAux.className = "YBRadioButton col-sm-2";
                    fSAux.verbose_name = fL.title;
                    fSAux.key = fNAux;
                    fSAux.fstr = "s_" + fN + "__in";
                    let opts = [];
                    for (let val in fL.values) {
                        opts.push({
                            "key": val,
                            "alias": fL.values[val] != null ? fL.values[val] : val
                        });
                    }
                    fSAux.opts = opts;
                    //gbLayout[fNAux] = fSAux;
                    fLayout[fNAux] = fSAux;
                    fSchema[fNAux] = fSAux;
                // }
                /*fLayout["gb__" + fL.title] = {};
                fLayout["gb__" + fL.title].fields = gbLayout;*/
            }
            else if (fS.hasOwnProperty("rel") && fS.rel) {
                if (fL && fL.rel == false) {
                    delete fS["rel"];
                }
                fS.fstr = "s_" + fN + "__exact";
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
            else if (fL && fL.filterType == "custom") {
                fS["tipo"] = fL.tipo || 3;
                if (fL.hasOwnProperty("max_length")) {
                    fS["max_length"] = fL.max_length;
                }
                fS["verbose_name"] = fL.label || fN;
                fS["key"] = fL.key || fN;
                if(fL.tipo == 55) {
                    fS["fstr"] = fL.fN ? "s_" + fL.fN + "__exact" : "";
                    fS["keyFilter"] = fL.key;
                    fS["to_field"] = fL.tofield;
                    fS["rel"] = fL.rel;
                    fS["desc"] = fL.desc || fL.tofield;
                }

                if (fL.tipo == 5) {
                    fS["clientoptionslist"] = fL.optionlist || {};
                    fS["key"] = fL.label || fN;
                    fS["verbose_name"] = fL.label || fN;
                }

                fS["required"] = false;
                fS["visible"] = true;
                fSchema[fN] = fS;
                fLayout[fN] = fS;                
            }
            else {
                fS.required = false;
                switch(fS.tipo) {
                    case 3:
                    case 4:
                    case 6: {
                        fS.fstr = "s_" + fN + "__icontains";
                        break;
                    }
                    case 16:
                    case 19:
                    case 37:
                    case 26:
                    case 27:
                    case 18: {
                        fS.fstr = "s_" + fN + "__exact";
                        break;
                    }
                    default: {
                        fS.fstr = "s_" + fN + "__exact";
                        break;
                    }
                }
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
            if (fL && fL.hasOwnProperty("label")) {
                fS.verbose_name = fL.label;
                fSchema[fN] = fS;
                fLayout[fN] = fS;
            }
        }
        var layout = {};
        layout["groupbox"] = "acordeon ";
        layout["fields"] = {};
        layout["fields"]["gb__Filtros"] = {};
        layout["fields"]["gb__Filtros"]["fields"] = fLayout;
        return {"schema": fSchema, "layout": layout};
    },

    _onFilterSubmit: function(event) {
        this._onFilter();
    },

    _onFilter: function(searchVal) {
        var filter = this.props.FILTER;
        var multi = {}
        for (var f in this.state.schema) {
            if (f.startsWith("ms_")) {
                var aFilter = f.split("__");
                var campo = aFilter[0].split("_")[1];
                var val = aFilter[1];

                if (!(campo in multi)) {
                    multi[campo] = {
                        "values": [],
                        "fstr": this.state.schema[f].fstr
                    };
                }

                if (this.state.filterData[f] && !(val in multi[campo].values)) {
                    multi[campo].values.push(val);
                }
                else if (!this.state.filterData[f] && val in multi[campo].values) {
                    multi[campo].values.splice(multi[campo].values.indexOf(val), 1);
                }
            }
            else {
                if (!(f in this.state.filterData) || this.state.filterData[f] == undefined || this.state.filterData[f] == "") {
                    delete filter[this.state.schema[f].fstr];
                }
                else {
                    if (this.state.schema[f].fstr) {
                        filter[this.state.schema[f].fstr] = this.state.filterData[f];
                    }
                }
            }
        }

        for (var c in multi) {
            if (multi[c].values.length) {
                filter[multi[c].fstr] = multi[c].values;
            }
            else {
                delete filter[multi[c].fstr];
            }
        }
        if(this.props.LAYOUT.hasOwnProperty("autofilter") && !this.props.LAYOUT.autofilter) {
            console.log("____________")
            console.log(searchVal)
            filter["qr_td"] = {};
            for(var i in this.state.filterData) {
                filter["qr_td"][i] = this.state.filterData[i];
            }
        }
        if (searchVal !== undefined && typeof searchVal === "string"){
            var cols = this.props.ITEMS.fields;
            for (var c in cols) {
                if (cols[c].tipo == "field" && !cols[c].colRel) {
                    var element;
                    if (cols[c].hasOwnProperty("colKey")) {
                        element = cols[c].colKey;
                    }
                    else {
                        element = cols[c].key;
                    }
                    filter["q_" + element + "__icontains"] = searchVal;
                }
            }
        }
        this.props.execFilter(filter);
    },

/*    _onFilterReset: function() {
        var fD = this.state.filterData;

        for (var f in fD) {
            fD[f] = undefined;
        }

        this.props.onFilterReset(fD);
        this.props.execFilter(this.props.MAINFILTER);
    },*/

    _onFilterChange: function(name, prefix, inputKey, inputVal, pk) {
        var fD = this.state.filterData;
        fD[inputKey] = inputVal;
        this.setState({"filterData": fD});
    },

    _onFilterReset: function(fD) {
        var fD = this.state.filterData;

        for (var f in fD) {
            fD[f] = undefined;
        }
        this.setState({"filterData": fD, "activatedFilter": ""});
        this.props.execFilter(this.props.MAINFILTER);
    },

    _onFilterSelected: function(key, prefix, val) {
        let value = val;
        if (val === null) {
            value = "";
        }
        this.setState({"activatedFilter": value});
        var filtro = JSON.parse(this.props.customfilter[val].filtro);


        for (var f in this.state.filterData) {
            this._onFilterChange(null, null, f, null, null);
        }
        for (var f in filtro) {
            this._onFilterChange(null, null, f, filtro[f], null);
        }
        this._onFilterChange(null, null, "filtername", val, null);
        this._onFilter();
    },

    _onSaveFilter: function() {
        var este = this;
        var oParam = {};
        var data = {}

        for (var d in this.state.filterData) {
            data[d] = this.state.filterData[d];
        }
        oParam["sis_gridfilter"] = {};
        oParam["sis_gridfilter"]["filterData"] = data;
        oParam["sis_gridfilter"]["prefix"] = this.props.PREFIX;
        this.props.lanzarAccion("algo", "sis_gridfilter", "newGridFilter", "NF", oParam);
        this._onFilter();
        //this.props.lanzarAccion("algo", "sis_gridfilter", "refrescar", null, null);
/*        var url = URLResolver.getRESTAccion("sis_gridfilter", 1, "nuevoFiltro");
        helpers.requestAccion(url, oParam , "PUT",
            function(response) {
                console.log("bien, tiene oParam", response);
            },
            function(xhr, textStatus, errorThrown) {
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                };
            }
        );*/
    },

    _renderSelectFilter: function() {
        var filtros = {};
        for (var f in this.props.customfilter) {
            filtros[f] = f;
        }
        var layout = {};
        var data = [];
        layout["clientoptionslist"] = filtros;
        layout["key"] = "Filtrar";
        data["customFilter"] = this.state.activatedFilter;

        var objAtts = {
            "layoutName": "YBCustomFilterForm",
            "fieldName": "customFilter",
            "modelfield": "customFilter",
            "SCHEMA": {},
            "DATA": data,
            "LAYOUT": layout,
        };
        var objFuncs = {
            "onChange": this._onFilterSelected
        };
        return YBSelectFieldDB.generaYBSelectFieldDB(objAtts, objFuncs);
    },

/*    _onmasterFilter: function() {
        //window.location.href = "/system/sis_gridfilter/master";
        this.props.lanzarAccion("algo", "sis_gridfilter", "newGridFilter", "NF", oParam);
    },*/

    _onViewFilter: function() {
        $(".YBFilterFormElment").toggleClass("active");
    },

    _onEditFilter: function() {
        let pk = this.props.customfilter[this.state.activatedFilter].pk
        this.props.lanzarAccion("algo", "sis_gridfilter", "newGridFilter", pk, oParam);
    },

    _onFilterSave: function() {
        var oParam = {};
        var data = {}

        for (var d in this.state.filterData) {
            data[d] = this.state.filterData[d];
        }
        oParam["sis_gridfilter"] = {};
        oParam["sis_gridfilter"]["filterData"] = data;
        oParam["sis_gridfilter"]["prefix"] = this.props.PREFIX;
        if(!data["filtername"]){
            $.toaster({"priority": "danger", "title": "", "message": "Nombre del filtro es obligatorio"});
        }
        if(!this.state.activatedFilter){
            this.props.lanzarAccion("algo", "sis_gridfilter", "newGridFilter", "NF", oParam);
        } else {
            let pk = this.props.customfilter[this.state.activatedFilter].pk
            this.props.lanzarAccion("algo", "sis_gridfilter", "updateGridFilter", pk, oParam);
        }
        //let pk = this.props.customfilter[this.state.activatedFilter].pk
    },

/*    _rendermasterFilterButton: function() {
        return <i className="material-icons" style={ styles.iconEdit } onClick={ this._onmasterFilter }>filter_list</i>
    },*/

    _renderViewFilterButton: function() {
        return <i className="material-icons" style={ styles.iconEdit } onClick={ this._onViewFilter }>remove_red_eye</i>
    },

/*    _renderEditFilterButton: function() {
return <i className="material-icons" style={ styles.iconEdit } onClick={ this._onEditFilter }>edit</i>
    },*/

/*    _renderNewFilterButton: function() {
        return <i className="material-icons" style={ styles.iconSave } onClick={ this._onSaveFilter }>add_circle_outline</i>
    },
*/
    _onSearchFilter: function(event) {
        if (event.which != 13) {
            return;
        }
        var val = $("#YBBuscador")[0].value;
        this._onFilter(val);
    },

    _renderSearch: function() {
        if (!this.props.customfilter) {
            return false;
        }

        return  <div className="YBCustomFilterBuscador"><div className="buscador form-group is-empty label-floating" key="buscar">
                    <label className="control-label" htmlFor="buscador">
                        Buscar
                    </label>
                    <input
                        type="text"
                        key="buscador"
                        className="form-control"
                        name="buscador"
                        ref="buscador"
                        id="YBBuscador"
                        onKeyPress={ this._onSearchFilter }/>
                </div></div>;
    },

    _renderCustomFilter: function() {
        if (!this.props.customfilter) {
            return false;
        }
        var selectFilter = this._renderSelectFilter();
        //var newFilter = this._renderNewFilterButton();
        //var editFilter = this._renderEditFilterButton();
        //var masterFilter = this._rendermasterFilterButton();
        var viewFilter = this._renderViewFilterButton();

        //            <div className="YBCustomFilterNew">{ newFilter }</div>
        //            <div className="YBCustomFilterNew">{ editFilter }</div>
        return  <div className="YBCustomFilterForm">
                    <div className="YBCustomFilterSelector">{ selectFilter }</div>
                    <div className="YBCustomFilterEdit">{ viewFilter }</div>
                </div>;

    },

    _renderForm: function() {
        var onFilterSave = this._onFilterSave
        if (!this.props.customfilter) {
            onFilterSave = null;
        }
        var objAtts = {
            "name": this.props.name,
            "DATA": this.state.filterData,
            "filter": true,
            "SCHEMA": this.state.schema,
            "LAYOUT": this.state.layout,
            "focus": this.props.FOCUS,
            "multiForm": false,
            "bufferChange": this.props.bufferChange,
            "labels": this.props.labels
        };
        var objFuncs = {
            "onFilterSubmit": this._onFilterSubmit,
            "onFilterSave": onFilterSave,
            "onReset": this._onFilterReset,
            "lanzarAccion": this.props.lanzarAccion,
            "onBufferChange": this.props.onBufferChange,
            "onChange": this._onFilterChange,
            "addPersistentData": this.props.addPersistentData
        };
        return YBForm.generaYBForm(objAtts, objFuncs);
    },

    componentWillMount: function() {
        if (this.props.customfilter) {
            for (var f in this.props.customfilter) {
                if (this.props.customfilter[f].default) {
                    var filtro = JSON.parse(this.props.customfilter[f].filtro);
                    for (var ff in filtro) {
                        this._onFilterChange(null, null, ff, filtro[ff], null);
                    }
                    this._onFilter();
                    this.setState({"activatedFilter": f});
                }
            }
        }
    },

    render: function() {
        var form = this._renderForm();
        var customfilter = this._renderCustomFilter();
        var customfilterbuscador = this._renderSearch();
        var classname = "YBFilterFormElment"
        if (!this.props.customfilter) {
            classname += " active"
        }

        return  <div className="YBFilterForm" key={ this.props.name }>
                    { customfilterbuscador }
                    { customfilter }
                    <div className={ classname }>{ form }</div>
                </div>;
    }
};

var YBFilterForm = React.createClass(YBFilterFormBase);

module.exports.generaYBFilterForm = function(objAtts, objFuncs)
{
    return  <YBFilterForm
                key = { objAtts.name }
                name = { objAtts.name }
                SCHEMA = { objAtts.SCHEMA }
                lanzarAccion = { objFuncs.lanzarAccion }
                LAYOUT = { objAtts.LAYOUT }
                PREFIX = { objAtts.PREFIX }
                FILTER = { objAtts.IDENT.FILTER }
                MAINFILTER = { objAtts.IDENT.MAINFILTER}
                FOCUS = { objAtts.focus }
                labels = { objAtts.labels }
                bufferChange = { objAtts.bufferChange }
                onBufferChange = { objFuncs.onBufferChange }
                addPersistentData = { objFuncs.addPersistentData }
                execFilter = { objFuncs.execFilter }
                customfilter = { objAtts.customfilter }
                ITEMS = { objAtts.ITEMS }/>;
}

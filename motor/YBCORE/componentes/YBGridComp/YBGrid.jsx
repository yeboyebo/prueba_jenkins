var React = require("react");
var _ = require("underscore");
var URLResolver = require("../../navegacion/URLResolver.js");
var Helpers = require("../../navegacion/helpers.js");
var Formatter = require("../../data/format.js");
var YBTable = require("./YBTable.jsx");
var YBList = require("./YBList.jsx");
var YBTableConfiguration = require("./YBTableConfiguration.jsx");
var YBFilterForm = require("../YBFormComp/YBFilterForm.jsx");
var YBButton = require("../YBButton.jsx");

var YBGridBase = {

    getInitialState: function() {
        return {
            "selecteds": [],
            "allSelecteds": false,
            "selectedsOnly": false,
            "configuration": false,
            "componente": "YBGrid",
            "ITEMS": {}
        };
    },

    _onGetFile: function(pk, name) {
        var prefix = this.props.PREFIX;
        var filter = null;
        this.props.lanzarAccion(this.props.LAYOUT, prefix, "getFiles", pk, filter);
    },

    _onFirstPage: function() {
        var prefix = this.props.PREFIX;
        var filter = null;
        if (this.props.tipoTabla == "query") {
            filter = "qt_" + prefix;
        }
        this.props.lanzarAccion(this.props.LAYOUT, prefix, "firstPag", null, filter);
        this.setState({"allSelecteds": false});
    },

    _onPreviousPage: function() {
        var prefix = this.props.PREFIX;
        var filter = null;
        if (this.props.tipoTabla == "query") {
            filter = "qt_" + prefix;
        }
        this.props.lanzarAccion(this.props.LAYOUT, prefix, "previousPag", null, filter);
        this.setState({"allSelecteds": false});
    },

    _onNextPage: function() {
        var prefix = this.props.PREFIX;
        var filter = null;
        if (this.props.tipoTabla == "query") {
            filter = "qt_" + prefix;
        }
        this.props.lanzarAccion(this.props.LAYOUT, prefix, "nextPag", null, filter);
        this.setState({"allSelecteds": false});
    },

    _onLastPage: function() {
        var prefix = this.props.PREFIX;
        var filter = null;
        if (this.props.tipoTabla == "query") {
            filter = "qt_" + prefix;
        }
        this.props.lanzarAccion(this.props.LAYOUT, prefix, "lastPag", null, filter);
        this.setState({"allSelecteds": false});
    },

    _execFilter: function(filtro) {
        var that = this;
        var filter = null;
        delete filtro["p_o"];
        this.setState({"allSelecteds": false});

        /* if (this.props.tipoTabla == "query")
            filter = "qt_" + this.props.PREFIX; */

        this.props.lanzarAccion(this.props.LAYOUT, this.props.PREFIX, "onsearch", null, filtro);
    },

    _onSearch: function(event) {
        var that = this;
        if (event.which != 13) {
            return;
        }
        var filtro = this.props.IDENT.FILTER;
        //var val = this.refs.buscador.value;
        var val = $("#YBBuscador")[0].value;
        var cols = this.state.ITEMS.fields;
        for (var c in cols) {
            if (cols[c].tipo == "field" && !cols[c].colRel) {
                var element;
                if (cols[c].hasOwnProperty("colKey")) {
                    element = cols[c].colKey;
                }
                else {
                    element = cols[c].key;
                }
                filtro["q_" + element + "__icontains"] = val;
            }
        }
        this._execFilter(filtro);
    },

    _onOrder: function(colName) {
        var that = this;
        var filtro = this.props.IDENT.FILTER;
        var order = [];

        if ("o_1" in filtro && filtro["o_1"] == colName) {
            order.push("-" + colName);
        }
        else {
            order.push(colName);
        }

        for (var f in filtro) {
            if (f.startsWith("o_")) {
                if (this.props.IDENT.FILTER[f] != colName && this.props.IDENT.FILTER[f] != "-" + colName) {
                    order.push(this.props.IDENT.FILTER[f]);
                }
                delete filtro[f];
            }
        }
        order.map((val, ind) => {
            ind = ind + 1;
            filtro["o_" + ind] = val;
            return true;
        });

        this._execFilter(filtro);
    },

    _onSelectedsOnlyChecked: function() {
        var that = this;
        var sOnly = !this.state.selectedsOnly;
        var key = "s_pk__in";

        var filtro = this.props.IDENT.FILTER;
        delete filtro["p_o"];

        if (sOnly) {
            if (!filtro.hasOwnProperty(key)) {
                filtro[key] = [];
            }
            for (var s in this.state.selecteds) {
                filtro[key].push(this.state.selecteds[s]);
            }
        }
        else {
            if (filtro.hasOwnProperty(key)) {
                delete filtro[key];
            }
        }

        var layout = null;
        var prefix = that.props.PREFIX
        this.setState({"allSelecteds": false});

        if (this.props.tipoTabla == "query") {
            layout = "qt_" + prefix;
            var copiafiltro = $.extend({}, filtro);
            copiafiltro["s_pk__in"] = $.extend({}, copiafiltro["s_pk__in"]);
            this.props.lanzarAccion(layout, prefix, "onsearch", null, copiafiltro);
            that.setState({"selectedsOnly": sOnly});
        }
        else {
            if (filtro.hasOwnProperty(key) && filtro[key].length == 0) {
                var response = {};
                response["PAG"] = {"COUNT": 0, "NO": null, "PO": null};
                response["data"] = [];
                that.props.onYBChange(that.props.PREFIX, response);
                that.setState({"selectedsOnly": sOnly});
            }
            else {
                var sURL = URLResolver.getRESTQuery(this.props.PREFIX, "list");
                Helpers.requestGET(sURL, filtro, function(response) {
                    that.props.onYBChange(that.props.PREFIX, response);
                    that.setState({"selectedsOnly": sOnly});
                }, function(xhr) {
                    console.log(xhr);
                });
            }
        }
    },

    _getSelectedsOnly: function() {
        return this.state.selectedsOnly;
    },

    _onActionExec: function(act, pk) {
        var selecteds = this.state.selecteds;
        // Cuando es una tabla de tipo json enviamos el data junto a la accion porque no tiene pk
        // (actualizo, si tiene, la pongo)
        if (this.props.tipoTabla == "json") {
            let nselecteds = {};
            if (pk) {
            	nselecteds[this.props.PREFIX] = pk;
            }
            else {
            	nselecteds[this.props.PREFIX] = this.props.DATA[0];
            }
            selecteds = nselecteds;
        }
        this.props.lanzarAccion(this.props.LAYOUT, this.props.PREFIX, act, pk, selecteds, this.props.acciones);
        this.setState({"selecteds": [], "allSelecteds": false});
    },

    _onListActionExec: function(act, pk) {
        this.props.lanzarAccion(this.props.LAYOUT, this.props.PREFIX, act, pk, this.state.selecteds, this.props.acciones);
    },

    _onGridConfiguration: function() {
        this.setState({"configuration": !this.state.configuration});
    },

    _onRowCheck: function(pk) {
        var selecteds = this.state.selecteds;

        if (!this._isSelected(pk)) {
            selecteds.push(pk);
        }
        else {
            selecteds.splice(selecteds.findIndex((x) => x == pk), 1);
        }

        this.setState({"selecteds": selecteds, "allSelecteds": false});
    },

    _onAllCheck: function(event) {
        if (!this.state.allSelecteds) {
            var selecteds = this.state.selecteds;
            this.props.DATA.map((x) => selecteds.push(x.pk));
            selecteds = $.unique(selecteds);
            this.setState({"selecteds": selecteds, "allSelecteds": true});
        }
        else {
            var selecteds = this.state.selecteds;
            this.props.DATA.map((x) => selecteds.splice(selecteds.findIndex((i) => i == x.pk), 1));
            selecteds = $.unique(selecteds);
            this.setState({"selecteds": selecteds, "allSelecteds": false});
            if (selecteds.length == 0) {
                this.setState({"selectedsOnly": false});
            }
        }
    },

    _onBufferChange: function(index, key, value) {
        this.props.onBufferChange(this.props.name, this.props.PREFIX, key, value, index);
    },

    _isSelected: function(pk) {
        if (pk == "allChecked") {
            return this.state.allSelecteds;
        }
        return this.state.selecteds.findIndex((x) => x == pk) != -1;
    },

    _getGridActionButton: function(keyPrefix, action) {
        var selecteds = this.state.selecteds;
        var objAtts = {
            "name": action.key,
            "layout": {
                "label": action.label,
                "buttonType": "raised",
                "primary": false,
                "secondary": true,
                "action": action
            },
            "data": selecteds
        };
        var objFuncs = {
            "lanzarAccion": this._onActionExec
        };
        var button = YBButton.generaYBButton(objAtts, objFuncs);
        return <div key={ keyPrefix + action.key } className="YBTableGridActionButton">
                    { button }
                </div>;
    },

    _getGridActions: function(keyPrefix) {
        if (!this.props.gridActions) {
            return "";
        }

        var style = {
            "cursor": "pointer"
        };

        keyPrefix = keyPrefix && keyPrefix != "" ? keyPrefix + "__" : "";
        return this.props.gridActions.map((action, ind) => {
            if (action.tipo != "button") {
                return  <div key={ keyPrefix + action.key } className="YBTableGridAction">
                            <i
                                className="material-icons"
                                style={ style }
                                onClick={ this._onActionExec.bind(this, action, ind, true) }>
                                    { this.props.acciones[action.key].icon }
                            </i>
                        </div>;
            }
        });
    },

    _updateFields: function(fields) {
        var items = _.extend({},this.state.ITEMS);
        items.fields = fields;
        this.setState({"ITEMS": items});
        this._onGridConfiguration();
    },

    _renderGridActionsButtons: function(keyPrefix) {
        if (!this.props.gridActions) {
            return "";
        }

        var style = {
            "cursor": "pointer"
        };

        keyPrefix = keyPrefix && keyPrefix != "" ? keyPrefix + "__" : "";
        return this.props.gridActions.map((action, ind) => {
            if (action.hasOwnProperty("tipo") && action.tipo == "button") {
                return this._getGridActionButton(keyPrefix, action);
            }
        });
    },

    _renderGridActions: function() {
        return this._getGridActions();
    },

    _renderDoubleGridActions: function() {
        if (!this.props.doubleGridActions) {
            return "";
        }

        return this._getGridActions("double");
    },

    _renderFilterForm: function() {
        if (!("filter" in this.props.LAYOUT) || typeof(this.props.LAYOUT.filter) != typeof({})) {
            return "";
        }

        var customfilter = this.props.LAYOUT.hasOwnProperty("cansavefilter") && this.props.LAYOUT.cansavefilter == true ? this.props.YB.customfilter : false;
        var objAtts = {
            "name": "filterForm__" + this.props.name,
            "SCHEMA": this.props.YB.SCHEMA,
            "PREFIX": this.props.PREFIX,
            "LAYOUT": this.props.LAYOUT,
            "bufferChange": false,
            "labels": this.props.YB.labels,
            "IDENT": this.props.YB.IDENT,
            "ITEMS": this.state.ITEMS,
            "customfilter": customfilter
        };
        var objFuncs = {
            "execFilter": this._execFilter,
            "lanzarAccion": this.props.lanzarAccion,
            "onBufferChange": () => {},
            "addPersistentData": false
        };
        return YBFilterForm.generaYBFilterForm(objAtts, objFuncs);
    },

    _renderSearch: function() {
        if (this.props.LAYOUT.filter != "buscador") {
            return "";
        }

        return  <div className="buscador form-group label-floating" key="buscar">
                    <label className="control-label col-sm" htmlFor={ this.props.keyc }>
                        Buscar
                    </label>
                    <div className="col-sm">
                        <input
                            type="text"
                            className="form-control"
                            name="buscador"
                            ref="buscador"
                            id="YBBuscador"
                            onKeyPress={ this._onSearch }/>
                    </div>
                </div>
    },

    _renderSelectedsOnly: function() {
        if (!this.props.multiselectable || this.state.selecteds.length == 0) {
            return "";
        }

        var style = {
            "marginRight": "5px"
        };

        return  <div className="selectedsOnly">
                    <label type="checkbox" htmlFor="selectedsOnly">
                        <input type="checkbox"
                            className="selectedsOnlyCheck"
                            name={ "selectedsOnly" }
                            style={ style }
                            checked={ this.state.selectedsOnly }
                            onChange={ this._onSelectedsOnlyChecked }/>
                        Solo seleccionados
                    </label>
                </div>;
    },

    _renderSelectAll: function(){
        if (!this.props.multiselectable) {
            return "";
        }

        var style = {
            "marginRight": "5px"
        };

        return  <div className="allSelecteds">
                    <label type="checkbox" htmlFor="allSelecteds">
                        <input type="checkbox"
                            className="allSelectedsCheck"
                            name={ "allSelecteds" }
                            style={ style }
                            checked={ this.state.allSelecteds }
                            onChange={ this._onAllCheck }/>
                        Seleccionar todos
                    </label>
                </div>;

    },

    _renderPagination: function() {
        if (this.props.LAYOUT.hasOwnProperty("paginacion") && this.props.LAYOUT.paginacion == false) {
            return "";
        }

        var po = parseInt(this.props.IDENT.PAG.NO / this.props.IDENT.FILTER["p_l"]) || 1;
        var totalpags = this.props.IDENT.PAG.COUNT == null ? 0 : (parseInt(this.props.IDENT.PAG.COUNT / this.props.IDENT.FILTER["p_l"]) || 0);
        if (parseInt(this.props.IDENT.PAG.COUNT % this.props.IDENT.FILTER["p_l"])) {
            totalpags++;
        }
        po = this.props.IDENT.PAG.NO === null ? totalpags : po;
        var auxCont = (this.props.IDENT.PAG.COUNT == null) ? " de ..." : " de " + totalpags.toString();
        if (totalpags <= 1) {
            return "";
        }
        var className = "";

        return  <center>
                    <ul className="paginacion pager">
                        <li className={ po == 1 ? "disabled" : "" }>
                            <a className="withripple" onClick={ po != 1 ? this._onFirstPage : () => {} }>
                                Primera
                            </a>
                        </li>
                        <li className={ po == 1 ? "disabled" : "" }>
                            <a className="withripple" onClick={ po != 1 ? this._onPreviousPage : () => {} }>
                                Anterior
                            </a>
                        </li>
                            &nbsp;&nbsp;&nbsp;
                            { po }
                            { auxCont }
                            &nbsp;&nbsp;&nbsp;
                        <li className={ po == totalpags ? "disabled" : "" }>
                            <a className="withripple" onClick={ po != totalpags ? this._onNextPage : () => {} }>
                                Siguiente
                            </a>
                        </li>
                        <li className={ po == totalpags ? "disabled" : "" }>
                            <a className="withripple" onClick={ po != totalpags ? this._onLastPage : () => {} }>
                                Última
                            </a>
                        </li>
                    </ul>
                </center>;
    },

    _renderList: function() {
        var objAtts = {
            "name": this.props.name,
            "tipoTabla": this.props.tipoTabla,
            "STATICURL": this.props.STATICURL,
            "IDENT": this.props.IDENT,
            "PREFIX": this.props.PREFIX,
            "LAYOUT": this.props.LAYOUT,
            "ITEMS": this.state.ITEMS,
            "rowclick": this.props.rowclick,
            "acciones": this.props.acciones,
            "DATA": this.props.DATA,
            "drawIf": this.props.drawIf,
            "multiselectable": this.props.multiselectable,
            "loadSelecteds": this.props.loadSelecteds,
            "colorRowField": this.props.colorRowField || ""
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onActionExec": this._onActionExec,
            "onRowCheck": this._onRowCheck,
            "onAllCheck": this._onAllCheck,
            "isSelected": this._isSelected,
            "onSelectedsOnlyChecked": this._onSelectedsOnlyChecked,
            "getSelectedsOnly": this._getSelectedsOnly,
            "getFiles": this._onGetFile
        };
        return YBList.generaYBList(objAtts, objFuncs);
    },

    _renderTable: function() {
        var objAtts = {
            "name": this.props.name,
            "tipoTabla": this.props.tipoTabla,
            "IDENT": this.props.IDENT,
            "PREFIX": this.props.PREFIX,
            "ITEMS": this.state.ITEMS,
            "rowclick": this.props.rowclick,
            "acciones": this.props.acciones,
            "DATA": this.props.DATA,
            "SCHEMA": this.props.YB.SCHEMA,
            "LAYOUT": this.props.LAYOUT,
            "drawIf": this.props.drawIf,
            "loadSelecteds": this.props.loadSelecteds,
            "multiselectable": this.props.multiselectable,
            "colorRowField": this.props.colorRowField || "",
            "configure": this.props.LAYOUT.configure || false
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onActionExec": this._onActionExec,
            "onRowCheck": this._onRowCheck,
            "onAllCheck": this._onAllCheck,
            "isSelected": this._isSelected,
            "onSelectedsOnlyChecked": this._onSelectedsOnlyChecked,
            "getSelectedsOnly": this._getSelectedsOnly,
            "onListActionExec": this._onListActionExec,
            "onGridConfiguration": this._onGridConfiguration,
            "onOrder": this._onOrder,
            "onBufferChange": this._onBufferChange
        };
        return YBTable.generaYBTable(objAtts, objFuncs);
    },

    _renderConfiguration: function() {
        var objAtts = {
            "name": this.props.name,
            "IDENT": this.props.IDENT,
            "SCHEMA": this.props.YB.SCHEMA,
            "LAYOUT": this.props.LAYOUT
        };
        var objFuncs = {
            "onGridConfiguration": this._onGridConfiguration,
            "getColumnsFromSCHEMAColumns": _getColumnsFromSCHEMAColumns,
            "updateColumns": this._updateFields
        };
        return YBTableConfiguration.generaYBTableConfiguration(objAtts, objFuncs);
    },

    componentWillMount: function() {
        var dimensions = _getDimensions();
        var items = {};
        var componente = "YBTable";

        if (this.props.loadSelecteds.length > 0) {
            this.setState({"selecteds": this.props.loadSelecteds});
        }

        if (this.props.LAYOUT.componente == "YBList" || (this.props.LAYOUT.componente == "YBGrid" && dimensions.width < 800)) {
            items = _getItemsFromSCHEMALayout(this.props.YB.SCHEMA, this.props.LAYOUT.columns || []);
            if (!items.items.primary.title && !items.items.primary.subtitle && items.items.primary.body.length == 0) {
                items = _getColumnsFromSCHEMAColumns(this.props.YB.SCHEMA, this.props.LAYOUT.columns || []);
            }
            else {
                componente = "YBList";
            }
        }
        else {
            items = _getColumnsFromSCHEMAColumns(this.props.YB.SCHEMA, this.props.LAYOUT.columns || []);
        }

        this.setState({"ITEMS": items, "componente": componente})
    },

    render: function() {
        if (!this.state.configuration) {
            var gridActions = this._renderGridActions();
            var gridButtons = this._renderGridActionsButtons();
            var search = this._renderSearch();
            var filterForm = this._renderFilterForm();
            var selectedsOnly = this._renderSelectedsOnly();
            var selectAll = null;
            var pagination = this._renderPagination();
            var doubleGridActions = this._renderDoubleGridActions();
            var grid = {};
            var style = {};
            var classname = "YBGrid " + this.props.name;

            if (this.state.componente == "YBList") {
                grid = this._renderList();
                classname += " YBList";
                if (this.props.IDENT.FILTER["p_l"] > this.props.IDENT.PAG.COUNT && this.props.IDENT.PAG.COUNT > 0) {
                    selectAll = this._renderSelectAll();
                }
            }
            else {
                grid = this._renderTable();
            }

            if (this.props.LAYOUT.hasOwnProperty("class")) {
               classname += " " + this.props.LAYOUT["class"];
            }

            if (this.props.LAYOUT.hasOwnProperty("style")) {
               style = this.props.LAYOUT["style"];
            }

            return  <div className="YBGridComponent">
                        <div className={ classname } style={ style }>
                            { search }
                            { filterForm }
                            <div className="YBGridOverHeader">
                                <div className="YBGridTitle">
                                    <b style={{"display": "none"}}>
                                        { this.props.titulo }
                                    </b>
                                     { gridButtons }
                                </div>
                                <div className="YBGridActions">
                                    { gridActions }
                                </div>
                                { selectedsOnly }
                                { selectAll }
                            </div>

                            <div className="YBGridElement">
                                { grid }
                            </div>
                            <div className="YBTableGridActions">
                                { doubleGridActions }
                            </div>
                            { pagination }
                        </div>
                    </div>;
        }
        else {
            var config = this._renderConfiguration();
            return  <div className={ componente } style={ style }>
                        { config }
                    </div>
        }
    }
};

var YBGrid = React.createClass(YBGridBase);

function _getColumnsFromSCHEMAColumns(SCHEMA, columns) {
    if (columns.length == 0) {
        var fields = [];
        for (var f in SCHEMA) {
            if (SCHEMA[f].visiblegrid) {
                var colAlign = "left";
                if (SCHEMA[f].tipo == 16|| SCHEMA[f].tipo == 17 || SCHEMA[f].tipo == 19 || SCHEMA[f].tipo == 37) {
                    colAlign = "right";
                }
                var tipo = SCHEMA[f].tipo;
                fields.push({
                    "colKey": f,
                    "colType": SCHEMA[f].type ? SCHEMA[f].type : "string",
                    "colName": SCHEMA[f].verbose_name,
                    "colFlex": 1,
                    "colWidth": SCHEMA[f].max_length && SCHEMA[f].max_length > 30 &&  SCHEMA[f].max_length < 150 ? SCHEMA[f].max_length * 7 : SCHEMA[f].max_length &&  SCHEMA[f].max_length > 150 ? SCHEMA[f].max_length * 4 : 100,
                    "colVisible": true,
                    "colAlign": colAlign,
                    "colEditable": false,
                    "colAct": false,
                    "tipo": "field",
                    "colColor": false,
                    "colRel": SCHEMA[f].hasOwnProperty("rel") ? SCHEMA[f].rel : null,
                    "colLink": false,
                    "formatter": Formatter.fromJSONfunc(tipo)
                })
            }
        }
        var actions = [{
            "tipo": "act",
            "key": "delete",
            "label": "Borrar Linea",
            "success": [
                {"slot": "refrescar"}
            ]
        }];
        return {
            "fields": fields,
            "actions": actions
        }
    }
    var fields = columns.filter((item) => {
        return item.tipo == "field" || item.tipo == "foreignfield" || item.tipo == "act";
    }).map((field) => {
        if (field.tipo == "act") {
            return field;
        }
        var colAlign = "left";
        let schema_field = SCHEMA && field.key in SCHEMA ? SCHEMA[field.key] : {"tipo": 3, "verbose_name": field["label"]};
        
        if (schema_field.tipo == 16 || schema_field.tipo == 17 || schema_field.tipo == 19 || schema_field.tipo == 37) {
            colAlign = "right";
        }

        var tipo = field.type ? field.type == "int" ? 16 : schema_field.tipo : schema_field.tipo;
        return {
            "colKey": field.key,
            "colSearch": field.hasOwnProperty("searchField") ? field.searchField : field.key,
            "colType": field.type ? field.type : "string",
            "colName": field.label ? field.label : schema_field.verbose_name,
            "colFlex": field.flex ? field.flex : 1,
            "colWidth": field.width ? field.width : 100,
            "colVisible": field.hasOwnProperty("visible") ? field.visible : true,
            "colAlign": field.align ? field.align : colAlign,
            "colEditable": field.editable && field.editable != "false" ? true : false,
            "colAct": field.act || false,
            "tipo": field.tipo,
            "colRel": schema_field.hasOwnProperty("rel") ? schema_field.rel : null,
            "colLink": field.link ? field.link : false,
            "colEsIcon": field.icon ? field.icon : false,
            "colColor": field.color ? field.color : false,
            "formatter": Formatter.fromJSONfunc(tipo)
        }
    });

    var actions = columns.filter((item) => {
        return item.tipo == "act" || item.tipo == "actList";
    });


    return {
        "fields": fields,
        "actions": actions
    };
};

function _getItemsFromSCHEMALayout(SCHEMA, LAYOUT) {
    var items = {
        "avatar": {},
        "primary": {
            "title": false,
            "subtitle": false,
            "body": []
        },
        "secondary": {
            "item": false,
            "actions": false
        }
    };
    var fields = [];
    var format = {};

    var itemsFiltered = LAYOUT.filter((item) => {
        if ("tipo" in item) {
            return (item.tipo == "field" || item.tipo == "foreignfield");
        }
        return true;
        // Buscar solo por campos con listpost o en todos?
        // return (item.tipo == "field" || item.tipo == "foreignfield") && item.hasOwnProperty("listpos");
    });

    if (itemsFiltered.length == 0) {
        return false;
    }

    itemsFiltered.map((field) => {
        fields.push(field);
        var defTipo = SCHEMA[field.key] && "tipo" in SCHEMA[field.key] ? SCHEMA[field.key].tipo : 3;
        var tipo = field.type ? field.type == "int" ? 16 : defTipo : defTipo;
        format[field.key] = Formatter.fromJSONfunc(tipo);

        switch (field.listpos) {
            case "title": {
                items.primary["title"] = field;
                break;
            }
            case "subtitle": {
                items.primary["subtitle"] = field;
                break;
            }
            case "body": {
                items.primary["body"].push(field);
                break;
            }
            case "secondaryitem": {
                items.secondary["item"] = field;
                break;
            }
        }

        if (field.hasOwnProperty("avatar") && field.avatar) {
            items["avatar"] = field.key;
        }
    });

    if (!Object.keys(items["avatar"]).length) {
        items["avatar"] = items.primary["title"] || items.primary["subtitle"];
    }

    items.secondary.actions = LAYOUT.filter((item) => {
        if ("tipo" in item) {
            return item.tipo == "act" || item.tipo == "actList";
        }
        return false;
    });

    return {
        "items": items,
        "fields": fields,
        "formato": format
    };
};

function _getSelectedsFromBD(prefix, querystring) {
    var este = this;
    var filtro = {};
    filtro = querystring;
    //TODO YBTable no tiene aplic y hay que ver el formato de querystring
    var sURL = URLResolver.getRESTQuery(prefix, "list");
    var aux = Helpers.requestGETre(sURL, filtro, function(response) {}, function(xhr){
        console.log(xhr);
    });
    var fields = [];
    fields = aux.responseJSON.data;
    return fields;
};

function _getDimensions() {
    var w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName("body")[0],
        width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    return {"width": width, "height": height};
};

module.exports.generaYBGrid = function(objAtts, objFuncs)
{
    var tipoTabla = objAtts.LAYOUT.hasOwnProperty("type") ? objAtts.LAYOUT.type : null;

    var loadSelecteds = [];
    if ("loadSelecteds" in objAtts.LAYOUT) {
        if (objAtts.YBparent.DATA[objAtts.LAYOUT.loadSelecteds.key]) {
            loadSelecteds = objAtts.YBparent.DATA[objAtts.LAYOUT.loadSelecteds.key].split(",");
        }
        else if (objAtts.LAYOUT.loadSelecteds.tipo == "query") {
            loadSelecteds = _getSelectedsFromBD(objAtts.LAYOUT.prefix, objAtts.LAYOUT.loadSelecteds.querystring);
        }
    }

    return  <YBGrid
                key = { objAtts.name }
                titulo = { objAtts.LAYOUT.label || "" }
                name = { objAtts.name }
                tipoTabla = { tipoTabla }
                YB = { objAtts.YB }
                LAYOUT = { objAtts.LAYOUT }
                IDENT = { objAtts.YB.IDENT }
                PREFIX = { objAtts.LAYOUT.prefix }
                STATICURL = { objAtts.STATICURL }
                drawIf = { objAtts.drawIf }
                rowclick = { objAtts.LAYOUT.rowclick }
                gridActions = { objAtts.LAYOUT.accionesGrid }
                acciones = { objAtts.acciones }
                lanzarAccion = { objFuncs.lanzarAccion }
                DATA = { objAtts.YB.DATA }
                onDataChange = { objFuncs.onDataChange }
                onYBChange = { objFuncs.onYBChange }
                multiselectable = { objAtts.LAYOUT.multiselectable || false }
                doubleGridActions = { objAtts.LAYOUT.doubleGridActions || false }
                loadSelecteds = { loadSelecteds }
                colorRowField = { objAtts.LAYOUT.colorRowField || "" }
                onBufferChange = { objFuncs.onBufferChange }/>;
};

var React = require("react");
var _ = require('underscore');
var URLResolver = require("../../navegacion/URLResolver.js");
var Helpers = require("../../navegacion/helpers.js");
var YBTableRow = require("./YBTableRow.jsx");
var YBTableHeaderCell = require("./YBTableHeaderCell.jsx");
var YBTableCheckHeaderCell = require("./YBTableCheckHeaderCell.jsx");
var YBTableActionHeaderCell = require("./YBTableActionHeaderCell.jsx");

var YBTableBase = {

    getInitialState: function() {
        return {};
    },

    _onSelectedsOnlyChecked: function() {
    	this.props.onSelectedsOnlyChecked();
    },

    _onActionExec: function(act, pk) {
    	this.props.onActionExec(act, pk);
        //this.props.lanzarAccion(this.props.name, this.props.PREFIX, act, pk, this.state.selecteds);
    },

    _onListActionExec: function(act, pk) {
    	this.props.onListActionExec(act, pk);
        //this.props.lanzarAccion(this.props.name, this.props.PREFIX, act, pk, this.state.selecteds);
    },

    _onRowCheck: function(pk) {
    	this.props.onRowCheck(pk);
    },

    _onAllCheck: function(event) {
        this.props.onAllCheck(event);
    },

    _isSelected: function(pk) {
    	return this.props.isSelected(pk);
    },

    _onGridConfiguration: function() {
        this.props.onGridConfiguration();
        //this.setState({configuration: !this.state.configuration})
    },

    _getGridActions: function(keyPrefix) {
        if (!this.props.gridActions)
            return "";

        var style = {
            cursor: "pointer"
        };

        keyPrefix = keyPrefix && keyPrefix != "" ? keyPrefix + "__" : "";
        return this.props.gridActions.map((action, ind) => {
            return  <div key={ keyPrefix + action.key } className="YBTableGridAction">
                        <i
                            className="material-icons"
                            style={ style }
                            onClick={ this._onActionExec.bind(this, action, ind, true) }>
                                { this.props.acciones[action.key].icon }
                        </i>
                    </div>;
        });
    },

    _renderGridActions: function() {
        return this._getGridActions();
    },

    _renderDoubleGridActions: function() {
        if (!this.props.doubleGridActions)
            return "";

        return this._getGridActions('double');
    },

    _renderActionsHeader: function() {
        return false;
        if (!this.props.rowActions.length)
            return "";
        var objAtts = {
            "col": {
                "colKey": 'actionsHeader',
                "colWidth": 50,
                "colFlex": 0,
                "colName": '',
                "colClass": 'YBTableActionsCell'
            }
        };
        var objFuncs = {
            "onGridConfiguration": this._onGridConfiguration
        };
        if(this.props.rowActions.length >= 2){
            objAtts.col.colWidth = 50 + (this.props.rowActions.length - 1) * 23;
        }
        if(!this.props.configure)
            return YBTableHeaderCell.generaYBTableHeaderCell(objAtts, objFuncs);
        else
            return YBTableActionHeaderCell.generaYBTableActionHeaderCell(objAtts, objFuncs);
    },

    _renderCheckHeader: function() {
        if (!this.props.multiselectable)
            return "";

        let checked = this._isSelected("allChecked");

        var objAtts = {
            "col": {
                "colKey": 'checkHeader',
                "colWidth": 50,
                "colFlex": 0,
                "colName": '',
                "colClass": 'YBTableMultiSelCell'
            },
            "CHECKED": checked
        };
        var objFuncs = {
            "onAllCheck": this._onAllCheck
        };
        //Si no hay paginacion mostramos el multicheck en el header
        if (this.props.IDENT.FILTER["p_l"] > this.props.IDENT.PAG.COUNT && this.props.IDENT.PAG.COUNT > 0) {
            return YBTableCheckHeaderCell.generaYBTableCheckHeaderCell(objAtts, objFuncs);
        }
        else {
            return YBTableHeaderCell.generaYBTableHeaderCell(objAtts, objFuncs);
        }
    },

    _renderHeader: function() {
        if (this.props.LAYOUT.hasOwnProperty("hideheader") && this.props.LAYOUT.hideheader) {
            return false;
        }

        var orderby = this.props.IDENT.FILTER ? "o_1" in this.props.IDENT.FILTER ? this.props.IDENT.FILTER["o_1"] : null : null;
        var headers = this.props.COLUMNS.map((col) => {
            if (this.props.drawIf && this.props.name in this.props.drawIf && col.colKey in this.props.drawIf[this.props.name] && this.props.drawIf[this.props.name][col.colKey] == "hidden") {
                return "";
            }
            if (col.tipo == "act") {
                var objAtts = {
                    "col": {
                        "colKey": col.key + "_Header",
                        "colWidth": 50,
                        "colFlex": 0,
                        "colName": '',
                        "colClass": 'YBTableActionsCell'
                    }
                };
                var objFuncs = {

                };
                return YBTableActionHeaderCell.generaYBTableActionHeaderCell(objAtts, objFuncs);
            }
            var order = col.colSearch == orderby ? 1 : "-" + col.colSearch == orderby ? -1 : 0;
            if(col.colVisible) {
                var objAtts = {
                    "col": col,
                    "order": order
                };
                var objFuncs = {
                    "onClick": this.props.onOrder
                };
                return YBTableHeaderCell.generaYBTableHeaderCell(objAtts, objFuncs);
            }
        });
        var actionsHeader = this._renderActionsHeader();
        var checkHeader = this._renderCheckHeader();

        return  <div className="YBTableRow YBTableHeaderRow" key="headerRow">
                    { checkHeader }
                    { actionsHeader }
                    { headers }
                </div>;
    },

    _renderRows: function() {
        return this.props.DATA.filter((row) => {
            return !this.props.getSelectedsOnly() || this._isSelected(row.pk);
        }).map((row, ind) => {
            let newCols;

            if(row.hasOwnProperty('metadata')) {
                let colsCopy = $.extend(true, [], this.props.COLUMNS);
                newCols = colsCopy.map((col) => {
                    let metadataCols = row['metadata'].filter((metaCol) => {
                        return col.colKey == metaCol.colKey;
                    });
                    return _.extend(col, metadataCols[0])
                });
            }
            else {
                newCols = this.props.COLUMNS;
            }

            let checked = this._isSelected(row.pk);

            var objAtts = {
                "name": this.props.name,
                "i": ind,
                "cols": newCols,
                "data": row,
                "prefix": this.props.PREFIX,
                "drawIf": this.props.drawIf,
                "rowclick": this.props.rowclick,
                "rowActions": this.props.rowActions,
                "gridActions": this.props.gridActions,
                "acciones": this.props.acciones,
                "multiselectable": this.props.multiselectable,
                "checked": checked,
                "colorRowField": this.props.colorRowField,
                "tipoTabla": this.props.tipoTabla,
                "SCHEMA": this.props.SCHEMA,
                "LAYOUT": this.props.LAYOUT
            };
            var objFuncs = {
                "lanzarAccion": this.props.lanzarAccion,
                "onActionExec": this._onActionExec,
                "onListActionExec": this._onListActionExec,
                "onRowCheck": this._onRowCheck,
                "onBufferChange": this.props.onBufferChange
            };
            return YBTableRow.generaYBTableRow(objAtts, objFuncs);
        });
    },

    componentWillMount: function() {
/*        if(this.props.loadSelecteds.length > 0)
            this.setState({selecteds: this.props.loadSelecteds});*/
    },

    render: function() {
        var rows = this._renderRows();
        var header = this._renderHeader();
        return  <div className="YBTableOverGrid">
                    { header }
                    <div>
                        { rows }
                    </div>
                </div>;
    }
};

var YBTable = React.createClass(YBTableBase);

module.exports.generaYBTable = function(objAtts, objFuncs)
{
    return  <YBTable
                key = { objAtts.name }
                name = { objAtts.name }
                tipoTabla = { objAtts.tipoTabla }
                IDENT = { objAtts.IDENT }
                PREFIX = { objAtts.PREFIX }
                COLUMNS = { objAtts.ITEMS.fields }
                rowclick = { objAtts.rowclick }
                rowActions = { objAtts.ITEMS.actions }
                drawIf = { objAtts.drawIf }
                acciones = { objAtts.acciones }
                lanzarAccion = { objFuncs.lanzarAccion }
                DATA = { objAtts.DATA }
                SCHEMA= { objAtts.SCHEMA }
                LAYOUT= { objAtts.LAYOUT }
                className = { objAtts.className }
                onOrder = { objFuncs.onOrder }
                onRowCheck = { objFuncs.onRowCheck }
                onAllCheck = { objFuncs.onAllCheck }
                isSelected = { objFuncs.isSelected }
                onActionExec = { objFuncs.onActionExec }
                onListActionExec = { objFuncs.onListActionExec }
                onSelectedsOnlyChecked = { objFuncs.onSelectedsOnlyChecked }
                getSelectedsOnly = { objFuncs.getSelectedsOnly }
                loadSelecteds = { objAtts.loadSelecteds }
                multiselectable = { objAtts.multiselectable }
                colorRowField = { objAtts.colorRowField || "" }
                onGridConfiguration = { objFuncs.onGridConfiguration }
                configure = { objAtts.configure }
                onBufferChange = { objFuncs.onBufferChange }/>;
};

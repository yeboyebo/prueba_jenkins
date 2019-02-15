var React = require("react");
var _ = require("underscore");
var YBTableCell = require("./YBTableCell.jsx");
var YBTableActionsCell = require("./YBTableActionsCell.jsx");
var YBTableActionCell = require("./YBTableActionCell.jsx");
var YBTableMultiSelCell = require("./YBTableMultiSelCell.jsx");

var YBTableRowBase = {

    getInitialState: function() {
        return {
            editeds: {}
        };
    },

    _onRowClick: function(col) {
        if (this.props.rowclick) {
            this.props.lanzarAccion(this.props.name, this.props.PREFIX, this.props.rowclick, this.props.DATA.pk, {});
        }
    },

    _onCellClick: function() {
        this.props.lanzarAccion(this.props.name, this.props.PREFIX, "link", this.props.DATA.pk, {});
    },

    _onRowCheck: function() {
        this.props.onRowCheck(this.props.DATA.pk);
    },

    _onCellEdit: function(column, value) {
        name = column.colKey;
        var editeds = this.state.editeds;

        if(value == this.props.DATA[name] && name in editeds)
            delete editeds[name];
        else{
            if(column.colType == "number")
                value = value.replace(",", ".");
            editeds[name] = value;
        }
        this.setState({editeds: editeds});
    },

    _onCellEnter: function(name) {
        var i = this.props.COLUMNS.findIndex((col) => col.colKey == name);
        var editeds = {};
        editeds[this.props.PREFIX] = this.state.editeds;
        if(this.props.tipoTabla)
            editeds = _.extend(this.props.DATA, editeds);
        if(this.props.COLUMNS[i].colAct) {
            this.props.lanzarAccion(this.props.name, this.props.PREFIX, this.props.COLUMNS[i].colAct, this.props.DATA.pk, editeds);
            this.setState({editeds: {}});
        }
    },

    _onActionPress: function(accion) {
        //this.props.onActionExec(this.props.rowActions[accion], this.props.DATA.pk);
        this.props.onActionExec(accion, this.props.DATA.pk);
    },

    _onListActionPress: function(accion, event, value) {
        this.props.onListActionExec(this.props.rowActions[accion].layout[value], this.props.DATA.pk);
    },

    _renderCells: function() {
        return this.props.COLUMNS.map((col) => {
            if (this.props.drawIf && this.props.name in this.props.drawIf && col.colKey in this.props.drawIf[this.props.name] && this.props.drawIf[this.props.name][col.colKey] == "hidden")
                return "";

            if (col.tipo == "act") {
                var objAtts = {
                    "accion": col,
                    "acciones": this.props.acciones,
                    "name": this.props.name,
                    "rowActions": this.props.rowActions,
                    "drawIf": this.props.drawIf
                };
                var objFuncs = {
                    "onActionPress": this._onActionPress,
                    "onListActionPress": this._onListActionPress
                };
                return YBTableActionCell.generaYBTableActionCell(objAtts, objFuncs);
            }

            if (col.colVisible) {
                var color = false;
                if (col.colColor) {
                    if (this.props.DATA[col.colColor]) {
                        color = this.props.DATA[col.colColor];
                    }
                }
                var isChanged = col.colKey in this.state.editeds;
                var data = isChanged ? this.state.editeds[col.colKey] : this.props.DATA[col.colKey];

                var objAtts = {
                    "rowPk": this.props.DATA.pk,
                    "col": col,
                    "data": data,
                    "isChanged": isChanged,
                    "index": this.props.index,
                    "color": color
                };
                var objFuncs = {
                    "onRowClick": this._onRowClick,
                    "onCellClick": this._onCellClick,
                    "onCellEdit": this._onCellEdit,
                    "onCellEnter": this._onCellEnter,
                    "onBufferChange":  this.props.onBufferChange
                };
                return YBTableCell.generaYBTableCell(objAtts, objFuncs);
            }
        });
    },

    _renderActionsCell: function() {
        if (!this.props.rowActions.length)
            return "";

        var objAtts = {
            "acciones": this.props.acciones,
            "name": this.props.name,
            "rowActions": this.props.rowActions,
            "drawIf": this.props.drawIf
        };
        var objFuncs = {
            "onActionPress": this._onActionPress,
            "onListActionPress": this._onListActionPress
        };
        return YBTableActionsCell.generaYBTableActionsCell(objAtts, objFuncs);
    },

    _renderMultiSelCell: function() {
        if (!this.props.multiselectable)
            return "";

        var objAtts = {
            "rowPk": this.props.DATA.pk,
            "checked": this.props.checked
        };
        var objFuncs = {
            "onRowCheck": this._onRowCheck
        };
        return YBTableMultiSelCell.generaYBTableMultiSelCell(objAtts, objFuncs);
    },

    render: function() {
        var cells = this._renderCells();
        //var actionsCell = this._renderActionsCell();
        var actionsCell = false;
        var multiSelCell = this._renderMultiSelCell();
        var className = "YBTableRow";
        if(this.props.colorRowField) {
            if(this.props.DATA[this.props.colorRowField] == true)
                className += " cSuccess";
            else if (this.props.DATA[this.props.colorRowField])
                className += " " + this.props.DATA[this.props.colorRowField];
        }
        if (this.props.rowclick)
            className += " YBTableRowClick";

        return  <div className={ className }>
                    { multiSelCell }
                    { actionsCell }
                    { cells }
                </div>;
    }
};

var YBTableRow = React.createClass(YBTableRowBase);

module.exports.generaYBTableRow = function(objAtts, objFuncs)
{
    return  <YBTableRow
                key = { objAtts.i }
                index = { objAtts.i }
                name = { objAtts.name }
                tipoTabla = { objAtts.tipoTabla }
                COLUMNS = { objAtts.cols }
                DATA = { objAtts.data }
                SCHEMA = { objAtts.SCHEMA }
                LAYOUT = { objAtts.LAYOUT }
                PREFIX = { objAtts.prefix }
                rowclick = { objAtts.rowclick }
                drawIf = { objAtts.drawIf }
                lanzarAccion = { objFuncs.lanzarAccion }
                rowActions = { objAtts.rowActions }
                gridActions = { objAtts.gridActions }
                onActionExec = { objFuncs.onActionExec }
                onListActionExec = { objFuncs.onListActionExec }
                acciones = { objAtts.acciones }
                multiselectable = { objAtts.multiselectable }
                checked = { objAtts.checked }
                onRowCheck = { objFuncs.onRowCheck }
                colorRowField = { objAtts.colorRowField }
                onBufferChange = { objFuncs.onBufferChange }/>;
};

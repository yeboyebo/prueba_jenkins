var React = require('react');
var YBTableHeaderCell = require("./YBTableHeaderCell.jsx");
var YBCheckBoxInput = require('../YBFieldDBComp/YBCheckBoxInput.jsx');
var Formatter = require("../../data/format.js");

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

var YBTableConfigurationCellBase = {

    getInitialState: function() {
        return {
            "columns": [],
            "selecteds": []
        };
    },

    _onHeaderClick: function(colname) {
        var columns = this.state.columns;
        columns.map((data, ind) => {
            if (data.colKey == colname) {
                var colAlign = "left";
                if (this.props.SCHEMA['neto'].tipo == 16 || this.props.SCHEMA['neto'].tipo == 19 || this.props.SCHEMA['neto'].tipo == 37) {
                    colAlign = "right";
                }
                columns[ind].colAlign = colAlign,
                columns[ind].colKey = "neto";
                columns[ind].colName = this.props.SCHEMA['neto'].verbose_name;
                columns[ind].colEditable = false;
                columns[ind].tipo = this.props.SCHEMA['neto'].tipo
                columns[ind].formatter = Formatter.fromJSONfunc(this.props.SCHEMA["neto"].tipo)
            }
        });
        this.setState({"columns": columns});
    },

    _onConfigurationSave: function() {
        this.props.updateColumns(this.state.columns);
    },

    _onCheck: function(event) {
        var selecteds = this.state.selecteds;

        if (!this._isSelected(event.target.id)) {
            selecteds.push(event.target.id);
        }
        else {
            selecteds.splice(selecteds.findIndex((x) => x == event.target.id), 1);
        }

        this.setState({"selecteds": selecteds});
    },

    _onRowCheck: function(pk) {
        var selecteds = this.state.selecteds;

        if (!this._isSelected(pk)) {
            selecteds.push(pk);
        }
        else {
            selecteds.splice(selecteds.findIndex((x) => x == pk), 1);
        }

        this.setState({"selecteds": selecteds});
    },
    _isSelected: function(pk) {
        return this.state.columns.findIndex((x) => x.colKey == pk) != -1;
    },

    _renderHeader: function() {
        var header = this.state.columns.map((col) => {
            if (col.colVisible) {
                var objAtts = {
                    "col": col
                };
                var objFuncs = {
                    "onClick": this._onHeaderClick
                };
                return YBTableHeaderCell.generaYBTableHeaderCell(objAtts, objFuncs);
            }
        });

        return  <div className="YBTableRow YBTableHeaderRow" key="headerRow">
                    { header }
                </div>;
    },

    _renderBody: function() {
        var este = this;
        var style = {
            marginRight: "5px"
        };
        var body = "";
/*        var body = this.state.columns.filter((col) => {
            return col.colVisible;
        }).map((field) => {
            var value = este._isSelected(field.colKey);
            var input = {
                "inputKey": field.colKey,
                "inputRef": "conf_"+field.colName,
                "inputName": field.colName,
                "inputVerboseName": field.colName,
                "inputValue": value,
                "inputDisabled": false,
                "inputRequired": true
            };

            var objAtts = {
                "input": input
            };
            var objFuncs = {
                "onChange": this._onCheck
            };
            return <div key={ "chb_"+field.colKey }>
                        { YBCheckBoxInput.generaYBCheckBoxInput(objAtts, objFuncs) }
                    </div>
        });*/
        return  <div className="" key="bodyElement">
                    { body }
                </div>;
    },

    _renderFooter: function() {
        var style = {
            "footer": {

            },
            "btnvolver": {
                "float": "right",
                "bottom": "8px",
                "right": "120px",
                "position": "absolute"
            },
            "btnaceptar": {
                "float": "right",
                "bottom": "8px",
                "right": "8px",
                "position": "absolute"
            }

        };
        return <div className="YBTableConfigurationFooter" style={ style.footer }>
                    <RaisedButton
                        label = "Cancelar"
                        primary = { false }
                        style = { style.btnvolver }
                        onClick = { this.props.onGridConfiguration }/>
                    <RaisedButton
                        label = "Aceptar"
                        primary = { true }
                        style = { style.btnaceptar }
                        onClick = { this._onConfigurationSave }/>
               </div>;
    },

    componentWillMount: function() {
        var items = this.props.getColumnsFromSCHEMAColumns(this.props.SCHEMA, this.props.LAYOUT.columns || []);
        this.setState({"columns": items.fields})
    },

    render: function() {
        var style = {};
        var header = this._renderHeader();
        var body = this._renderBody();
        var footer = this._renderFooter();
        var className = "YBTableConfiguration";

        return  <div className={ className } style={ style }>
                    { header }
                    { body }
                    { footer }
                </div>;
    }
};

var YBTableConfiguration = React.createClass(YBTableConfigurationCellBase);

module.exports.generaYBTableConfiguration = function(objAtts, objFuncs)
{

    return  <YBTableConfiguration
                key = { objAtts.name }
                name = { objAtts.name }
                IDENT = { objAtts.IDENT }
                SCHEMA = { objAtts.SCHEMA }
                LAYOUT = { objAtts.LAYOUT }
                onGridConfiguration = { objFuncs.onGridConfiguration }
                getColumnsFromSCHEMAColumns = { objFuncs.getColumnsFromSCHEMAColumns }
                updateColumns = {objFuncs.updateColumns }/>;
};

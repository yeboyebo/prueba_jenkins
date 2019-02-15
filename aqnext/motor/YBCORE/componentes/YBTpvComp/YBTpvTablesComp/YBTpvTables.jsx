var React = require("react");
var _ = require("underscore");
var YBTpvModal = require("../YBTpvModalComp/YBTpvModal.jsx");
var YBTpvDashBoardItem = require("../YBTpvDashBoardComp/YBTpvDashBoardItem.jsx");
var YBTpvTablesMap = require("./YBTpvTablesMap.jsx");

const newTable = "Nueva Mesa";
const largeNameTable = "Nombre mesa largo";

var noTable = {
    "key": newTable,
    "desc": newTable,
    "uri": newTable,
    "w": 35,
    "h": 35,
    "t": 1,
    "l": 1
};

// var noTables = {
//     "tables": {
//         "Nueva Zona": [
//             _.extend({}, noTable)
//         ]
//     },
//     "maxH": 2,
//     "maxW": 2
// };

var noTables = {
    "tables": {
        "Comedor": [
            {"key": "Mesa1", "desc": "Mesa1", "uri": "Mesa1", "w": 105, "h": 35, "t": 255, "l": 140},
            {"key": "Mesa2", "desc": "Mesa2", "uri": "Mesa2", "w": 105, "h": 35, "t": 175, "l": 35},
            {"key": "Mesa3", "desc": "Mesa3", "uri": "Mesa3", "w": 35, "h": 35, "t": 315, "l": 35},
            {"key": "Mesa4", "desc": "Mesa4", "uri": "Mesa4", "w": 35, "h": 105, "t": 175, "l": 350},
            {"key": largeNameTable, "desc": largeNameTable, "uri": largeNameTable, "w": 70, "h": 70, "t": 245, "l": 420}
        ],
        "Terraza": [
            {"key": "Mesa5", "desc": "Mesa1", "uri": "Mesa1", "w": 35, "h": 35, "t": 255, "l": 140},
            {"key": "Mesa6", "desc": "Mesa2", "uri": "Mesa2", "w": 105, "h": 105, "t": 175, "l": 35},
            {"key": "Mesa7", "desc": "Mesa3", "uri": "Mesa3", "w": 50, "h": 120, "t": 315, "l": 35},
            {"key": "Mesa8", "desc": "Mesa4", "uri": "Mesa4", "w": 35, "h": 155, "t": 175, "l": 350}
        ]
    },
    "maxH": 350,
    "maxW": 490
};

var noZone = "Comedor";

var YBTpvTablesBase = {

    getInitialState: function() {
        // quitar
        localStorage.removeItem("mesasConf");
        let currentzone = localStorage.getItem("zonaActual");
        let tables = localStorage.getItem("mesasConf");

        return {
            "modal": false,
            "tables": tables ? JSON.parse(tables) : _.extend({}, noTables),
            "currentzone": currentzone ? currentzone : noZone,
            "currenttable": false
        };
    },

    _onDrop: function(zone, tablek, left, top) {
        let st = _.extend({}, this.state);

        let objT = st.tables.tables[zone].filter((table) => {
            return table.key == tablek;
        })[0];

        if (!objT) {
            return;
        }
        objT.l = left;
        objT.t = top;
        localStorage.setItem("mesasConf", JSON.stringify(st.tables));
        this.setState(st);
    },

    _onResize: function(zone, tablek, width, height) {
        let st = _.extend({}, this.state);

        if (width == 0 || height == 0) {
            return;
        }

        let objT = st.tables.tables[zone].filter((table) => {
            return table.key == tablek;
        })[0];

        if (!objT) {
            return;
        }
        objT.w = width;
        objT.h = height;
        localStorage.setItem("mesasConf", JSON.stringify(st.tables));
        this.setState(st);
    },

    _onAddClick: function() {
        let st = _.extend({}, this.state);

        let param = {
            "name": "newtable",
            "alias": "Nombre",
            "value": "Nueva mesa"
        };
        return this._invokeModal("alphanumeric", param, (
            (value) => {
                if (value) {
                    let nTable = _.extend({}, noTable);
                    nTable["key"] = value;
                    nTable["desc"] = value;
                    nTable["uri"] = value;
                    st.tables.tables[st.currentzone].push(nTable);
                    st.currenttable = value;
                    localStorage.setItem("mesasConf", JSON.stringify(st.tables));
                    return this.setState(st);
                }
            }
        ));
    },

    _onEditClick: function() {
        let st = _.extend({}, this.state);

        let idx = this._findTable(st.currenttable);
        if (idx == undefined) {
            return;
        }
        let currtable = st.tables.tables[st.currentzone][idx];
        let param = {
            "name": "edittable",
            "alias": "Nombre",
            "value": currtable["key"]
        };
        return this._invokeModal("alphanumeric", param, (
            (value) => {
                if (value) {
                    currtable["key"] = value;
                    currtable["desc"] = value;
                    currtable["uri"] = value;
                    st.currenttable = value;
                    localStorage.setItem("mesasConf", JSON.stringify(st.tables));
                    this.setState(st);
                }
            }
        ));
    },

    _onDeleteClick: function() {
        let st = _.extend({}, this.state);

        let idx = this._findTable(st.currenttable);

        if (idx != undefined) {
            delete st.tables.tables[st.currentzone][idx];
            st.currenttable = false;
        }
        localStorage.setItem("mesasConf", JSON.stringify(st.tables));
        this.setState(st);
    },

    _invokeModal: function(type, param, callback) {
        this.setState({
            "modal": {
                "type": type,
                "param": param,
                "callback": callback
            }
        });
    },

    _acceptedModal: function(value) {
        let modal = _.extend({}, this.state.modal);
        this.setState({"modal": false});
        if (modal.callback) {
            modal.callback(value);
        }
    },

    _canceledModal: function() {
        this.setState({"modal": false});
    },

    _renderModal: function() {
        if (!this.state.modal) {
            return "";
        }
        return YBTpvModal.generate({
            "name": this.props.name + "_modal_" + this.state.modal.param.name,
            "type": this.state.modal.type,
            "param": this.state.modal.param,
            "onAccept": this._acceptedModal,
            "onCancel": this._canceledModal,
            "staticurl": this.props.STATICURL
        });
    },

    _findTable: function(findKey) {
        let idx = undefined;

        if (!findKey) {
            return idx;
        }

        this.state.tables.tables[this.state.currentzone].map((table, ind) => {
            if (table.key == findKey) {
                idx = ind;
            }
        })[0];

        return idx;
    },

    _onTableClick: function(table) {
        this.state.currenttable = table;
        this.setState(this.state);
    },

    _onZoneClick: function(zone) {
        let st = _.extend({}, this.state);

        if (st.currentzone == zone) {
            return;
        }
        st.currentzone = zone;
        st.currenttable = false;
        return this.setState(st);
    },

    _renderAdd: function() {
        if (!this.props.editable) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_add",
            "item": {"uri": "tableadd", "desc": "Añadir mesa"},
            "staticurl": this.props.staticurl,
            "onClick": this._onAddClick
        });
    },

    _renderEdit: function() {
        if (!this.props.editable) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_edit",
            "item": {"uri": "tableedit", "desc": "Editar mesa"},
            "staticurl": this.props.staticurl,
            "onClick": this._onEditClick
        });
    },

    _renderDelete: function() {
        if (!this.props.editable) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_delete",
            "item": {"uri": "tabledelete", "desc": "Eliminar mesa"},
            "staticurl": this.props.staticurl,
            "onClick": this._onDeleteClick
        });
    },

    _renderMap: function() {
        return YBTpvTablesMap.generate({
            "name": this.props.name + "_map",
            "tables": this.state.tables,
            "currentzone": this.state.currentzone,
            "currenttable": this.state.currenttable,
            "editable": this.props.editable,
            "staticurl": this.props.staticurl,
            "onTableClick": this._onTableClick,
            "onDrop": this._onDrop,
            "onResize": this._onResize
        });
    },

    _renderZones: function() {
        let zones = [];

        for (let zone in this.state.tables.tables) {
            zones.push(YBTpvDashBoardItem.generate({
                "name": "zone" + zone,
                "item": {"uri": zone, "desc": zone},
                "staticurl": this.props.staticurl,
                "onClick": this._onZoneClick
            }));
        }
        return zones;
    },

    _rendercomp: function() {
        let tpvTablesAdd = this._renderAdd();
        let tpvTablesEdit = this._renderEdit();
        let tpvTablesDelete = this._renderDelete();
        let tpvTablesMap = this._renderMap();
        let tpvZones = this._renderZones();

        return  <div>
                    { tpvTablesAdd }
                    { tpvTablesEdit }
                    { tpvTablesDelete }
                    { tpvTablesMap }
                    { tpvZones }
                </div>;
    },

    render: function() {
        let modal = this._renderModal();
        let rendercomp = this._rendercomp();

        return  <div className="YBTpvTables">
                    { modal }
                    { rendercomp }
                </div>;
    }
};

var YBTpvTables = React.createClass(YBTpvTablesBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvTables
                key = { objAtts.name }
                name = { objAtts.name }
                editable = { objAtts.editable }
                staticurl = { objAtts.staticurl }/>;
};

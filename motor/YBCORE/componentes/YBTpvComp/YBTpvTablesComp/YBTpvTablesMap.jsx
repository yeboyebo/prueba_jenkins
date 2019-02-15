var React = require("react");
var YBTpvTablesMapItem = require("./YBTpvTablesMapItem.jsx");
// var _ = require("underscore");

var YBTpvTablesMapBase = {

    _onDrop: function(ev) {
        var offset = ev.dataTransfer.getData("text/plain").split("||");
        let nLeft = ev.clientX + parseInt(offset[2]);
        let nTop = ev.clientY + parseInt(offset[3]);
        event.preventDefault();

        this.props.onDrop(offset[0], offset[1], nLeft, nTop);
        return false;
    },

    _onOver: function(ev) {
        ev.preventDefault();
        return false;
    },

    _renderItems: function() {
        return this.props.tables.tables[this.props.currentzone].map((table) => {
            return YBTpvTablesMapItem.generate({
                "name": this.props.name + "_" + this.props.currentzone + "_" + table.key,
                "table": table,
                "currentzone": this.props.currentzone,
                "currenttable": this.props.currenttable,
                "editable": this.props.editable,
                "staticurl": this.props.staticurl,
                "onResize": this.props.onResize,
                "onTableClick": this.props.onTableClick
            });
        });
    },

    _rendercomp: function() {
        let tpvTablesMapItems = this._renderItems();
        // let tpvTablesMapZones = this._renderZones();

        return  <div>
                    { tpvTablesMapItems }
                    {/*{ tpvTablesMapZones }*/}
                </div>;
    },

    render: function() {
        let rendercomp = this._rendercomp();
        let style = {
            "width": this.props.tables.maxW + "px",
            "height": this.props.tables.maxH + "px"
        };

        return  <div className="YBTpvTablesMap" style={ style } onDrop={ this._onDrop } onDragOver={ this._onOver }>
                    { rendercomp }
                </div>;
    }
};

var YBTpvTablesMap = React.createClass(YBTpvTablesMapBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvTablesMap
                key = { objAtts.name }
                name = { objAtts.name }
                tables = { objAtts.tables }
                currentzone = { objAtts.currentzone }
                currenttable = { objAtts.currenttable }
                editable = { objAtts.editable }
                staticurl = { objAtts.staticurl }
                onDrop = { objAtts.onDrop }
                onResize = { objAtts.onResize }
                onTableClick = { objAtts.onTableClick }/>;
};

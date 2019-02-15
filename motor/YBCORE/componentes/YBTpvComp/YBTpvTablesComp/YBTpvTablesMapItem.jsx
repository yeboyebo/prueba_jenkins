var React = require("react");
// var _ = require("underscore");


var YBTpvTablesMapItemBase = {

    componentDidMount: function() {
        let ro = new ResizeObserver((element) => {
            let cr = element[0].contentRect;
            this.props.onResize(this.props.currentzone, this.props.table.key, cr.width, cr.height);
        });
        ro.observe(this.refs[this.props.name]);
    },

    _onClick: function(ev) {
        ev.preventDefault();
        this.props.onTableClick(this.props.table.key);
    },

    _onDrag: function(ev) {
        let style = window.getComputedStyle(ev.target, null);
        let cx = ev.clientX;
        let cy = ev.clientY;

        let dx = parseInt(style.getPropertyValue("left")) - cx;
        let dy = parseInt(style.getPropertyValue("top")) - cy;

        ev.dataTransfer.setData("text/plain", this.props.currentzone + "||" + this.props.table.key + "||" + dx + "||" + dy);
    },

    _rendercomp: function() {
        return  <div>
                    { this.props.table.key }
                </div>;
    },

    render: function() {
        let is_current = this.props.currenttable == this.props.table.key;
        let rendercomp = this._rendercomp();

        let style = {
            "width": this.props.table.w + "px",
            "height": this.props.table.h + "px",
            "top": this.props.table.t + "px",
            "left": this.props.table.l + "px",
            "resize": this.props.editable ? "both" : "none",
            "backgroundColor": is_current ? "blue" : "black",
            "color": is_current ? "black" : "white"
        };

        return  <div ref={ this.props.name } className="YBTpvTablesMapItem" style={ style } draggable="true" onDragStart={ this._onDrag } onClick={ this._onClick }>
                    { rendercomp }
                </div>;
    }
};

var YBTpvTablesMapItem = React.createClass(YBTpvTablesMapItemBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvTablesMapItem
                key = { objAtts.name }
                name = { objAtts.name }
                table = { objAtts.table }
                currentzone = { objAtts.currentzone }
                currenttable = { objAtts.currenttable }
                editable = { objAtts.editable }
                staticurl = { objAtts.staticurl }
                onResize = { objAtts.onResize }
                onTableClick = { objAtts.onTableClick }/>;
};

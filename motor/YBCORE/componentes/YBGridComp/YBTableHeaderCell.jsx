var React = require('react');

var YBTableHeaderCellBase = {

    _onHeaderClick: function() {
        if (this.props.onClick) {
            if (this.props.COLUMN.tipo == "field" || ("colSearch" in this.props.COLUMN && this.props.COLUMN.colSearch != this.props.COLUMN.colKey)) {
                this.props.onClick(this.props.COLUMN["colSearch"]);
            }
        }
    },

    _renderOrder: function() {
        if (!("colSearch" in this.props.COLUMN)) {
            return null
        }

        var style = {
            "position": "relative",
            "float": "right"
        };

        var order = null;
        if (this.props.order == 1) {
            order = <i key="orderHeader" className="material-icons">keyboard_arrow_down</i>
        }
        else if(this.props.order == -1) {
            order = <i key="orderHeader" className="material-icons">keyboard_arrow_up</i>
        }

        return <div style={ style }>
                    { order }
               </div>;
    },

    render: function() {
        var style = {
            "width": this.props.COLUMN.colWidth,
            "flexGrow": this.props.COLUMN.colFlex,
            "cursor": "pointer"
        };

        var className = "YBTableCell YBTableHeaderCell";
        //var order = this.props.order == 1 ? "<" : this.props.order == -1 ? ">" : "";
        var order = this._renderOrder();
        className += "colClass" in this.props.COLUMN ? " " + this.props.COLUMN.colClass : "";

        return  <div onClick={ this._onHeaderClick } className={ className } style={ style }>
                    { this.props.COLUMN.colName }
                    { order }
                </div>;
    }
};

var YBTableHeaderCell = React.createClass(YBTableHeaderCellBase);

module.exports.generaYBTableHeaderCell = function(objAtts, objFuncs)
{
    return  <YBTableHeaderCell
                key = { objAtts.col.colKey }
                name = { objAtts.col.colKey }
                order = { objAtts.order }
                COLUMN = { objAtts.col }
                onClick = { objFuncs.onClick || null }/>;
};

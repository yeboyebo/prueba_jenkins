var React = require("react");
var YBTableEditableCell = require("./YBTableEditableCell.jsx");

var YBTableCellBase = {

    render: function() {
        var style = {
            width: this.props.COLUMN.colWidth,
            flexGrow: this.props.COLUMN.colFlex,
            textAlign: this.props.COLUMN.colAlign
        };
        var styleLink = {
            cursor: "pointer"
        };
        var className = "YBTableCell ";
        var data = this.props.COLUMN.formatter(this.props.DATA);
        if(this.props.COLUMN.formatter(this.props.DATA)){
            data = String(this.props.COLUMN.formatter(this.props.DATA));
        }

        if (this.props.COLUMN.colLink) {
            data = <a onClick = { this.props.onCellClick } className={ this.props.color } style= { styleLink }> { data } </a>
        } else if (this.props.COLUMN.colEsIcon) {
            data = <i key={ this.props.key + "_i" } className="material-icons" onClick={ null }>{ data }</i>
        }

        className += this.props.color;

        return  <div className={ className } style={ style } onClick={ this.props.onRowClick }>
                    { data }
                </div>;
    }
};

var YBTableCell = React.createClass(YBTableCellBase);

module.exports.generaYBTableCell = function(objAtts, objFuncs)
{
	//rowPk, col, data, isChanged, onRowClick, onCellEdit, onCellEnter)
    if(objAtts.col.colEditable)
        return YBTableEditableCell.generaYBTableEditableCell(objAtts, objFuncs);

    return  <YBTableCell
                key = { objAtts.col.colKey + "__" + objAtts.rowPk }
                COLUMN = { objAtts.col }
                DATA = { objAtts.data }
                color = { objAtts.color || "" }
                onRowClick = { objFuncs.onRowClick }
                onCellClick = { objFuncs.onCellClick }/>;
};

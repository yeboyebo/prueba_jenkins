var React = require('react');

var YBTableCheckHeaderCellBase = {

    getInitialState: function() {
        return {
            selected: false
        };
    },

    _onCheck: function(event) {
        this.props.onAllCheck(event);
    },

    render: function() {
        var style = {
            width: this.props.COLUMN.colWidth,
            flexGrow: this.props.COLUMN.colFlex
        };

        var className = "YBTableCell YBTableHeaderCell";
        var label = "";

        return  <div className={ className } style={ style }>
                    <input  type="checkbox"
                            className="AQGridCheckBox"
                            name={ label }
                            checked={ this.props.CHECKED }
                            onChange={ this._onCheck }/>
                </div>;
    }
};

var YBTableCheckHeaderCell = React.createClass(YBTableCheckHeaderCellBase);

module.exports.generaYBTableCheckHeaderCell = function(objAtts, objFuncs)
{
    return  <YBTableCheckHeaderCell
                key = { objAtts.col.colKey }
                COLUMN = { objAtts.col }
                CHECKED = { objAtts.CHECKED }
                onAllCheck = { objFuncs.onAllCheck }/>;
};

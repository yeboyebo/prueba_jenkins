var React = require('react');

var YBTableMultiSelCellBase = {

    render: function() {
        var style = {
            width: 50,
            flexGrow: false,
            textAlign: 'left'
        };
        var disabled = false;
        var label = "";
        return  <div className="YBTableCell" style={ style }>
                    <input  type="checkbox"
                            className="AQGridCheckBox"
                            name={ label }
                            checked={ this.props.CHECKED }
                            onChange={ this.props.onCheck }/>
                </div>;
    }
};

var YBTableMultiSelCell = React.createClass(YBTableMultiSelCellBase);

module.exports.generaYBTableMultiSelCell = function(objAtts, objFuncs)
{
    return  <YBTableMultiSelCell
                key = { "check__" + objAtts.rowPk }
                CHECKED = { objAtts.checked }
                onCheck = { objFuncs.onRowCheck }/>;
};

var React = require('react');

var YBTableActionHeaderCellBase = {

    _onGridConfiguration: function() {
        this.props.onGridConfiguration();
    },

    render: function() {
        var style = {
            width: this.props.col.colWidth,
            flexGrow: false,
            textAlign: 'left',
            cursor: 'pointer'
        };
        //<i key="actionHeader" className="material-icons" onClick={ this._onGridConfiguration }>build</i>

        return  <div className="YBTableCell YBTableActionsCell" style={ style }>
                    
                </div>;
    }
};

var YBTableActionHeaderCell = React.createClass(YBTableActionHeaderCellBase);

module.exports.generaYBTableActionHeaderCell = function(objAtts, objFuncs)
{
    return  <YBTableActionHeaderCell
                key = { objAtts.col.colKey }
                onGridConfiguration = { objFuncs.onGridConfiguration }
                col = { objAtts.col }/>;
};

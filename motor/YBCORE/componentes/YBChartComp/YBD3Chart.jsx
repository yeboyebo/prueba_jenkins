var React = require('react');
var YBD3ProgressBar = require("./YBD3ProgressBar.jsx");

var YBD3Chart = React.createClass({

    _renderD3ProgressBar: function() {
        return YBD3ProgressBar.generaYBD3ProgressBar(this.props.objAtts, this.props.objFuncs);
    },
    
    _renderChart: function() {
        if (this.props.objAtts.layout.d3 == "progressBar") {
            return this._renderD3ProgressBar();
        }
        else {
            return null;
        }
    },

    render: function() {
        var chart = this._renderChart();
        return <div id="YBD3Chart">
                    { chart }
               </div>;
    }
});


module.exports.generaYBD3Chart = function(objAtts, objFuncs)
{
    return  <YBD3Chart
                key = { objAtts.name }
                layout = { objAtts.layout }
                data = { objAtts.data }
                objAtts = { objAtts }
                objFuncs = { objFuncs }/>;
};
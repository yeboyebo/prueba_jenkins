var React = require("react");
var YBChartSimple = require("./YBChartSimple.jsx");
var YBChartMulti = require("./YBChartMulti.jsx");
var YBD3Chart = require("./YBD3Chart.jsx");

var YBChartBase = {

    _renderChartSimple: function() {
        if (this.props.multiple) {
            return "";
        }

        return YBChartSimple.generaYBChartSimple(this.props.objAtts, this.props.objFuncs);
    },

    _renderChartMulti: function() {
        if (!this.props.multiple) {
            return "";
        }

        return YBChartMulti.generaYBChartMulti(this.props.objAtts, this.props.objFuncs);
    },

    _renderD3Chart: function() {
        return YBD3Chart.generaYBD3Chart(this.props.objAtts, this.props.objFuncs);
    },

    _renderChar: function() {
        if (this.props.objAtts.layout.d3) {
            return this._renderD3Chart();
        }
        else if (this.props.multiple) {
            return this._renderChartMulti();
        }
        else {
            return this._renderChartSimple();
        }
    },

    render: function() {
        var renderChar = this._renderChar();
        return  <div
                    className="YBChart">
                    	{ renderChar }
                </div>;
    }
};

var YBChart = React.createClass(YBChartBase);

module.exports.generaYBChart = function(objAtts, objFuncs)
{
    return  <YBChart
                key = { objAtts.name }
                multiple = { objAtts.layout.multiple }
                objAtts = { objAtts }
                objFuncs = { objFuncs }/>;
};

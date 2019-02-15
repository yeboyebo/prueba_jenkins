var React = require('react');
var YBChartSimple = require('./YBChartSimple.jsx');

var YBChartMultiBase = {

    _renderChartSimples: function() {
        var aSimples = [], objAtts, objFuncs;
        this.props.relData.map((d, i) => {
            objAtts = {
                "name": this.props.name + i,
                "data": this.props.data,
                "relData": d,
                "aplic": this.props.aplic,
                "prefix": this.props.layout.subtable,
                "multi": true,
                "layout": {
                    "title": d.destino,
                    "subtitleField": this.props.layout.subtitleField,
                    "subtitleType": this.props.layout.subtitleType,
                    "width": 200,
                    "height": 150,
                    "chartseries": this.props.layout.chartseries,
                    "fieldValue": "value",
                    "fieldName": "name"
                }
            };
            aSimples.push(YBChartSimple.generaYBChartSimple(objAtts, this.props.objFuncs));
        });
        return aSimples;
    },

    render: function() {
        var chartSimples = this._renderChartSimples();
        return  <div
                    className="YBChartMulti"
                >
                    { chartSimples }
                </div>;
    }
};

var YBChartMulti = React.createClass(YBChartMultiBase);

module.exports.generaYBChartMulti = function(objAtts, objFuncs)
{
    return  <YBChartMulti
                key = { objAtts.name }
                name = { objAtts.name }
                aplic = { objAtts.aplic }
                prefix = { objAtts.prefix }
                layout = { objAtts.layout }
                data = { objAtts.data }
                relData = { objAtts.relData }
                objFuncs = { objFuncs }
                />;
};

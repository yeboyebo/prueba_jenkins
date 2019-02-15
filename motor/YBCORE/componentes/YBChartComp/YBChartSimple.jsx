var React = require('react');
var _ = require('underscore');
var URLResolver = require('../../navegacion/URLResolver.js');
var helpers = require('../../navegacion/helpers.js');
var Formatter = require("../../data/format.js");
var YBLabel = require('../YBLabel.jsx');
var Chart = require('react-d3-core').Chart;
var PieChart = require('react-d3-basic').PieChart;

var YBChartSimpleBase = {

    _getValueFunc: function() {
        return function(d) {
            if (this.props.fieldValue)
                return +d[this.props.fieldValue];

            return +d.value;
        };
    },

    _getNameFunc: function() {
        return function(d) {
            if (this.props.fieldName)
                return d[this.props.fieldName];

            return d.name;
        };
    },

    _onClick: function() {
        if (this.props.rowclick)
            this.props.lanzarAccion(this.props.name, this.props.prefix, this.props.rowclick, this.props.pk, {});
    },

    _countNoNulos: function() {
        return this.props.data.filter((d) => {
            return d[this.props.fieldValue] > 0;
        }).length;
    },

    _getNoNulo: function() {
        var nn = this.props.data.filter((d) => {
            return d[this.props.fieldValue] > 0;
        });
        if (nn.length == 1)
            return nn[0].name;
        return nn;
    },

    _renderTitle: function() {
        return YBLabel.generaYBLabel({
            "name": "title" + this.props.name,
            "layout": {
                "text": this.props.title,
                "style": {
                    "fontWeight": "bold"
                }
            }
        }, {});
    },

    _renderSubTitle: function() {
        return YBLabel.generaYBLabel({
            "name": "subtitle" + this.props.name,
            "layout": {
                "text": this.props.subtitle
            }
        }, {});
    },

    render: function() {
        var title = this._renderTitle();
        var subtitle = this._renderSubTitle();
        var radius = this.props.radius == "null" ? 0 : this.props.radius || 20;
        var noNulos = this._countNoNulos();
        var className = "YBChartSimpleBody";
        className += this.props.layout.hideLabels ? " noLabels" : "";
        className += noNulos > 1 ? " YBAutoChart" : " YBIconChart";


        if (noNulos > 1) {
            return  <div
                        className="YBChartSimple"
                        onClick={ this._onClick }
                    >
                        { title }
                        { subtitle }
                        <div className={ className }>
                            <PieChart
                                data={ this.props.data }
                                width={ this.props.width || 400 }
                                height={ this.props.height || 300 }
                                chartSeries={ this.props.chartseries }
                                value={ this._getValueFunc().bind(this) }
                                name={ this._getNameFunc().bind(this) }
                                innerRadius={ radius }
                                showLegend={ this.props.legend || false }
                            />
                        </div>
                    </div>;
        }
        else {
            var nn = this._getNoNulo();
            if (!nn)
                return "";

            var icon = nn == "ok" ? "done" : nn == "warn" ? "warning" : "cancel";
            var style = {
                "color": nn == "ok" ? "#2CA02C" : nn == "warn" ? "#EB7F0E" : "#D62728",
                "fontSize": this.props.multi ? "100px" : "",
                "marginBottom": this.props.multi ? "-50px" : "0px",
                "width": this.props.width ? this.props.width + "px" : "400px",
                "height": this.props.height ? this.props.height + "px" : "300px",
                "lineHeight": this.props.height ? this.props.height + "px" : "300px"
            };
            return  <div
                        className="YBChartSimple"
                        onClick={ this._onClick }
                    >
                        { title }
                        { subtitle }
                        <div className={ className }>
                            <i className="material-icons" style={ style }>{ icon }</i>
                        </div>
                    </div>;
        }
    }
};

var YBChartSimple = React.createClass(YBChartSimpleBase);

function _getDataFromQryString(aplic, prefix, layout, data) {
    var qrystring = layout.querystring;
    var fData = [];
    var table = qrystring && "subtable" in qrystring ? qrystring.subtable : prefix;
    var cData = _.extend({}, {"data": data}).data;
    if (cData.length) {
        cData = cData.filter((d) => {
            for (var t in qrystring.filter) {
                if (qrystring.filter[t] != d[t])
                    return false;
            }
            return true;
        });

        if (!cData)
            return false;

        cData = cData[0];
    }

    for (var c in cData.conditions) {
        var objF = {"name": c, "value": cData.conditions[c]};
        fData.push(objF);
    }
    var format = Formatter.fromJSONfunc(layout.subtitleType);
    return {"data": fData, "subtitle": format(cData[layout.subtitleField]), "pk": cData.pk};
}

function _getDataFromParent(aplic, prefix, layout, relData) {
    var fData = [];

    for (var c in relData.conditions) {
        var objF = {"name": c, "value": relData.conditions[c]};
        fData.push(objF);
    }
    var format = Formatter.fromJSONfunc(layout.subtitleType);
    return {"data": fData, "subtitle": format(relData[layout.subtitleField]), "pk": relData.pk};
}

module.exports.generaYBChartSimple = function(objAtts, objFuncs)
{
    var data, subtitle, pk, nData;

    if(objAtts.data.length)
        nData = _getDataFromQryString(objAtts.aplic, objAtts.prefix, objAtts.layout, objAtts.data);
    else
        nData = _getDataFromParent(objAtts.aplic, objAtts.prefix, objAtts.layout, objAtts.relData);

    data = nData.data;
    subtitle = nData.subtitle;
    pk = nData.pk;

    return  <YBChartSimple
                key = { objAtts.name }
                name = { objAtts.name }
                pk = { pk }
                aplic = { objAtts.aplic }
                prefix = { objAtts.prefix }
                title = { objAtts.layout.title }
                subtitle = { subtitle }
                data = { data }
                chartseries = { objAtts.layout.chartseries }
                rowclick = { objAtts.layout.rowclick }
                width = { objAtts.layout.width }
                height = { objAtts.layout.height }
                fieldName = { objAtts.layout.fieldName }
                fieldValue = { objAtts.layout.fieldValue }
                legend = { objAtts.layout.legend }
                radius = { objAtts.layout.radius }
                multi = { objAtts.multi }
                lanzarAccion = { objFuncs.lanzarAccion }
                layout = { objAtts.layout }/>;
};

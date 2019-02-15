var React = require('react');

var YBD3ProgressBar = React.createClass({

    _renderChart: function() {
    },

/*    componentDidMount() {
        var data = [15, 20, 200];

        var width = 960,
            height = 500;
        // var radius = Math.min(width, height) / 2;
        var radius = 150;

        var color = d3.scaleOrdinal()
            .domain(["lorem", "ipsum", "dolor"])
            .range(["#98abc5", "#8a89a6", "#7b6888"]);

        var arc = d3.arc()
            .outerRadius(radius)
            .innerRadius(0);

        var labelArc = d3.arc()
            .outerRadius(radius - 40)
            .innerRadius(radius - 40);

        var pie = d3.pie()
            .sort(null)
            .value(function(d) { return d; });

        var svg = d3.select("#chart").append("svg")
            .attr("width", width)
            .attr("height", height)
          .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

          var g = svg.selectAll(".arc")
              .data(pie(data))
            .enter().append("g")
              .attr("class", "arc");

          g.append("path")
              .attr("d", arc)
              .style("fill", function(d) { return color(d.data); });

          g.append("text")
              .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
              .attr("dy", ".25em")
              .text(function(d) { return d.data; });

            g.append('text')
              .attr('text-anchor', 'middle')
              .attr('dy', '.35em')
              .text("90%");
    },*/

    componentDidMount: function() {


        var svg = d3.select('#chart')
            .append('svg')
            .attr('height', 100)
            .attr('width', 1000);

        var segmentWidth = this.props.data.value || 80;
        var data = [500,300];
        var width = 400;
        var variance = width / 100;
        var color = this.props.data.mainColor || "yellow";
        var secondaryColor = this.props.data.secondaryColor || "gray";
        var colorScale = d3.scale.ordinal()
            .domain(segmentWidth)
            .range(['yellow', 'orange', 'green']);

        svg.append('rect')
            .attr('class', 'bg-rect')
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', secondaryColor)
            .attr('height', 15)
            .attr('width', function(){
                return width;
            })
            .attr('x', 0);

        var progress = svg.append('rect')
                        .attr('class', 'progress-rect')
                        .attr('fill', function(){
                            return color;
                        })
                        .attr('height', 15)
                        .attr('width', 0)
                        .attr('rx', 10)
                        .attr('ry', 10)
                        .attr('x', 0);

        progress.transition()
            .duration(1000)
            .attr('width', function(){
                return segmentWidth * variance;
            });

          var g = svg.selectAll("progress-rect")
              .data(data)
            .enter().append("g")
              .attr("class", "rect");

            g.append('text')
              .attr('x', 10)
              .attr('y', 10)
              .attr('dy', '.25em')
              .text(segmentWidth + "%");

        function moveProgressBar(state){
            progress.transition()
                .duration(1000)
                .attr('fill', function(){
                    return color;
                })
                .attr('width', function(){
                    return segmentWidth * variance;
                });
        }
    },

    render: function() {
        var chart = this._renderChart();
        return <div>
                    <div id="chart" className="chart-container"></div>
               </div>;
    }
});


module.exports.generaYBD3ProgressBar = function(objAtts, objFuncs)
{
    console.log(objAtts)
    return  <YBD3ProgressBar
                key = { objAtts.name }
                layout = { objAtts.layout }
                data = { objAtts.data }
                objAtts = { objAtts }
                objFuncs = { objFuncs }/>;
};
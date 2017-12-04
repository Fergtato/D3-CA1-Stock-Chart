/*set your variables here*/
var w = 500;
var h = 500;
var padding = 20;

var lineData = [
	{ "x": 1, "y": 5},
	{ "x": 20, "y": 20},
	{ "x": 40, "y": 10},
	{ "x": 60, "y": 30},
	{ "x": 80, "y": 25},
	{ "x": 100, "y": 5}
];

var xMax = d3.max(lineData, function(d) { return d.x });
var yMax = d3.max(lineData, function(d) { return d.y });


var xScale = d3.scaleLinear()
	.domain([0,xMax])
	.range([0,w]);

var yScale = d3.scaleLinear()
	.domain([0,yMax])
	.range([0,h]);


var lineFunction = d3.line()
	.x(function(d) { return xScale(d.x); })
	.y(function(d) { return yScale(d.y); })
	.curve(d3.curveBundle.beta(0.3));


var svgContainer = d3.select("body").append("svg")
	.attr('width', w)
	.attr('height', h);

var lineGraph = svgContainer.append('path')
	.attr('d', lineFunction(lineData))
	.attr('stroke', 'blue')
	.attr('stroke-width', '2')
	.attr('fill', 'none');

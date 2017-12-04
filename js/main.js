/*set your variables here*/


var lineData = [
	{ "x": 1, "y": 5},
	{ "x": 20, "y": 20},
	{ "x": 40, "y": 10},
	{ "x": 60, "y": 30},
	{ "x": 80, "y": 25},
	{ "x": 100, "y": 5}
];

var svg = d3.select("svg"),
    margin = {top: 30, right: 30, bottom: 30, left: 30},
    w = +svg.attr("width") - margin.left - margin.right,
    h = +svg.attr("height") - margin.top - margin.bottom;

//d3 function for parsing a date tring into a readable date
var parseTime = d3.timeParse("%d-%b-%y");

var x = d3.scaleTime().range([0, w]),
    y = d3.scaleLinear().range([h, 0]);

var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(h)
    .y1(function(d) { return y(d.close); });



//??
// svg.append("defs").append("clipPath")
// 	.attr("id", "clip")
// 	.append("rect")
// 	.attr("width", w)
// 	.attr("height", h);


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.csv("aapl.csv", function(error, data) {

	if (error) throw error;

	data.forEach(function(d) {
		d.date = parseTime(d.Date);
		d.close = +d.Close;
	});

	x.domain(d3.extent(data, function(d) { return d.date; }));
  	y.domain([0, d3.max(data, function(d) { return d.close; })]);

	g.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

    g.append("g")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

    g.append("g")
      .call(yAxis);

})
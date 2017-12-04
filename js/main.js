/*set your variables here*/

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

//??
var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .translateExtent([[0, 0], [w, h]])
    .extent([[0, 0], [w, h]])
    .on("zoom", zoomed);


var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(h)
    .y1(function(d) { return y(d.close); });



var defs = svg.append("defs");

defs.append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", w)
	.attr("height", h);

var gradient = defs.append("linearGradient")
   .attr("id", "svgGradient")
   .attr("x1", "0%")
   .attr("x2", "100%")
   .attr("y1", "0%")
   .attr("y2", "100%");
gradient.append("stop")
   .attr('class', 'start')
   .attr("offset", "0%")
   .attr("stop-color", "#00a5ff")
   .attr("stop-opacity", 0.8);
gradient.append("stop")
   .attr('class', 'end')
   .attr("offset", "100%")
   .attr("stop-color", "#004870")
   .attr("stop-opacity", 0.2);


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



d3.csv("aapl.csv", function(error, data) {

	if (error) throw error;

	data.forEach(function(d) {
		d.date = parseTime(d.Date);
		d.close = +d.Close;
		d.event = d.Event;
	});

	x.domain(d3.extent(data, function(d) { return d.date; }));
  	y.domain([0, d3.max(data, function(d) { return d.close; })]);

	g.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("fill", "url(#svgGradient)")
		.attr("d", area);
		// .style('stroke-dasharray', '500');

    g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

    g.append("g")
	    .attr("class", "axis axis--y")
	    .call(yAxis);

	g.selectAll("rect")
    .data(data.filter(function(d){ return d.event; }))
    .enter().append("rect")
      .attr("class", "event-line")
      .attr("x", function(d) { return x(d.date); })
      .attr("y", function(d) { return y(d.close); })
      .attr("width", '2')
      .attr("height", function(d) { return h - y(d.close); });

  //   g.selectAll("text")
		// .data(data)
		// .enter()
		// .append("text")
		// .text(function(d) {
		// 	return d.event;
		// })
		// .attr("x", function(d) { return x(d.date); })
  //     	.attr("y", function(d) { return y(d.close); })
		// .attr("font-size", "10")
		// .attr("font-family", "Arial")
		// .attr("text-anchor", "middle");



    var d0 = new Date(2016, 0, 1),
    	d1 = new Date(2016, 12, 1);

    //??
	svg.call(zoom).transition()
	  	.duration(1500)
	  	.call(zoom.transform, d3.zoomIdentity
	    .scale(w / (x(d1) - x(d0)))
	    .translate(-x(d0), 0));

});



//??
function zoomed() {
	var t = d3.event.transform, xt = t.rescaleX(x);
	g.select(".area").attr("d", area.x(function(d) { return xt(d.date); }));
	g.select(".axis--x").call(xAxis.scale(xt));
}
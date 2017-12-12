var svg = d3.select("svg"),
    margin = {top: 10, right: 10, bottom: 20, left: 40},
    w = +svg.attr("width") - margin.left - margin.right,
    h = +svg.attr("height") - margin.top - margin.bottom;

//d3 function for parsing a date tring into a readable date
var parseTime = d3.timeParse("%d-%b-%y");


//X & Y Scales
var x = d3.scaleTime().range([0, w]),
    y = d3.scaleLinear().range([h, 0]);

//X & Y Axis
var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

function make_y_gridlines() {
  return d3.axisLeft(y);
}

// Used for zoom functionailty which is disabled
// Uncomment code on lines 192-194 to enable
var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .translateExtent([[0, 0], [w, h]])
    .extent([[0, 0], [w, h]])
    .on("zoom", zoomed);


//Calculate data line area
var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y0(h)
    .y1(function(d) { return y(d.close); });


//Set domain of X & Y scale with passed in data
function setScale(data) {

	x.domain(d3.extent(data, function(d) { return d.date; }));
  	y.domain([0, d3.max(data, function(d) { return d.close; })]);

  	console.log('Data');
  	console.log(data);
  	console.log('X Domain - ' + x.domain());
  	console.log('Y Domain - ' + y.domain());
  	console.log('__________________________');
}





//Filters and Styles
var defs = svg.append("defs");

//Clip the line area inside axis when zooming
defs.append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", w)
	.attr("height", h);

//Outer Glow Filter
var filter = defs.append("filter")
		.attr("id","glow");
	filter.append("feGaussianBlur")
		.attr("stdDeviation","3.5")
		.attr("result","coloredBlur");
var feMerge = filter.append("feMerge");
	feMerge.append("feMergeNode")
		.attr("in","coloredBlur");
	feMerge.append("feMergeNode")
		.attr("in","SourceGraphic");

//Gradient Fill
var gradient = defs.append("linearGradient")
		.attr("id", "svgGradient")
		.attr("x1", "0%")
		.attr("x2", "100%")
		.attr("y1", "0%")
		.attr("y2", "100%");
	gradient.append("stop")
		.attr('class', 'start')
		.attr("offset", "0%")
   		.attr("stop-opacity", 0.8);
	gradient.append("stop")
		.attr('class', 'end')
		.attr("offset", "100%")
		.attr("stop-opacity", 0.2);





//Tooltop div element
var div = d3.select("body")
			.append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

//Main parent group
var g = svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    .attr("id", "main-group");


//Load initial Apple csv file and run function with the data
d3.csv("aapl.csv", function(error, data) {

	if (error) throw error;

	//Convert data into a readable format
	data.forEach(function(d) {
		d.date = parseTime(d.Date);
		d.close = +d.Close;
		d.event = d.Event;
	});

	//Set the X & Y scales using this data
	setScale(data);

	//Append the main path to the group
	g.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("fill", "url(#svgGradient)") //Apply a gradient fill
		.style("filter", "url(#glow)") //Apply an outerglow to the edges
		.attr("d", area(data)); //Set d attribute to the area
		// .style('stroke-dasharray', '500');

	//Append the x axis
    g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis);

	//Apend the y axis
    g.append("g")
	    .attr("class", "axis axis--y")
	    .call(yAxis);

	//Append grid lines using axis ticks
	g.append("g")
	    .attr("class", "grid")
	    .call(make_y_gridlines().tickFormat("").tickSize(-w));

	//Append the event marker lines using rectangles
	g.selectAll("rect")
	    .data(data.filter(function(d){ return d.event; })) //Filter the data to only lines with events on them
	    .enter()
	    .append("rect")
		.attr("class", "event-line")
		.attr("x", function(d) { return x(d.date)-1; })
		.attr("y", function(d) { return y(d.close); })
		.attr("width", '2')
		.attr("height", function(d) { return h - y(d.close); });

	//Append the event marker cirlces
	g.selectAll("circle")
	    .data(data.filter(function(d){ return d.event; }))
	    .enter()
	    .append("circle")
		.attr("class", "event-dot")
		.attr("cx", function(d) { return x(d.date); })
		.attr("cy", function(d) { return y(d.close); })
		.attr("r", '4')
		.on("mouseover", function(d) {	//On hover display a previously defined tooltip with the event text at the mouse coordinates
            div.transition()		
               .duration(200)		
               .style("opacity", 1);		
            div.html(d.event)
               .style("text-anchor", "middle")
               .style("left", (d3.event.pageX - (d.event.length*3.8)) + "px") //Position the tooltip corectly 		
               .style("top", (d3.event.pageY - 35) + "px");
            })					
        .on("mouseout", function(d) { //Hide the tooltip on mouse out	
            div.transition()		
               .duration(500)		
               .style("opacity", 0);	
        });


    // ----------------*****--------------------
    // To view zoom functionality uncomment the code below.
    // Lines and dots do not move with the graph when zooming and clicking another 
    // company then zooming will change the input domain and change how the graph is displayed
    // ----------------*****--------------------

	// var d0 = new Date(2016, 0, 1),
	// d1 = new Date(2016, 12, 1);
 	// zoomToDates(d0, d1);
	

});




//Update data with new data csv
function updateData(csv) {

	d3.csv(csv, function(error, data) {

		if (error) throw error;

		data.forEach(function(d) {
			d.date = parseTime(d.Date);
			d.close = +d.Close;
			d.event = d.Event;
		});

		//Set new scale with new csv data
		setScale(data);

		//Set g to be the exsiting main group
	  	var g = d3.select("#main-group");

	  	//Update attributes for the path, x & y axis and grid lines with a transition
		g.select("path")
			.transition()
			.duration(500)
			.attr("d", area(data));
			// .style('stroke-dasharray', '500');

	    g.select(".axis--x")
	    	.transition()
			.duration(500)
			.call(xAxis);

	    g.select(".axis--y")
	    	.transition()
			.duration(500)
		    .call(yAxis);

		g.select(".grid")
			.transition()
			.duration(500)
		    .call(make_y_gridlines().tickFormat("").tickSize(-w));

		//Remove all exsiting event marker lines
		g.selectAll("rect")
			.remove();

		//Add new event marker lines using new data
		g.selectAll("rect")
		    .data(data.filter(function(d){ return d.event; }))
		    .enter()
		    .append("rect")
			.attr("class", "event-line")
			.attr("x", function(d) { return x(d.date)-1; })
			.attr("y", h)
			.attr("width", '2')
			.attr("height", 0);

		g.selectAll("rect")
			.transition()
			.duration(500)
			.attr("y", function(d) { return y(d.close); })
			.attr("height", function(d) { return h - y(d.close); });

		//Do the same for the circles
		g.selectAll("circle")
			.remove();

		//New circles set to position at the bottom of the chart
		g.selectAll("circle")
		    .data(data.filter(function(d){ return d.event; }))
		    .enter()
		    .append("circle")
			.attr("class", "event-dot")
			.attr("cx", function(d) { return x(d.date); })
			.attr("cy", h)
			.attr("r", '4')
			.on("mouseover", function(d) {		
	            div.transition()		
	               .duration(200)		
	               .style("opacity", 1);		
	            div.html(d.event)
	               .style("text-anchor", "middle")
	               .style("left", (d3.event.pageX - (d.event.length*3.8)) + "px")		
	               .style("top", (d3.event.pageY - 35) + "px");
	            })					
	        .on("mouseout", function(d) {		
	            div.transition()		
	               .duration(500)		
	               .style("opacity", 0);	
        	});

	    //Animate the circles to their position
        g.selectAll("circle")
        	.transition()
			.duration(500)
        	.attr("cy", function(d) { return y(d.close); });
	});

}




//Zoom to specific dates
//Used for zoom function which is disabled
function zoomToDates(d0, d1) {
	svg.call(zoom).transition()
	  	.duration(1500)
	  	.call(zoom.transform, d3.zoomIdentity
	    .scale(w / (x(d1) - x(d0)))
	    .translate(-x(d0), 0));
}
function zoomed() {
	var t = d3.event.transform, xt = t.rescaleX(x);
	g.select(".area").attr("d", area.x(function(d) { return xt(d.date); }));
	g.select(".axis--x").call(xAxis.scale(xt));
}



//JQuery for bottom buttons
$(document).ready(function(){

	//Get html element for changing CSS4 variables
	var html = document.getElementsByTagName('html')[0];

	$( ".btn-aapl" ).click(function() {
	  	updateData("aapl.csv"); //Updated chart data
	  	//Set new CSS4 colour variables
        html.style.setProperty("--accent-color", "#00a5ff");
    	html.style.setProperty("--dark-color", "#004870");
	});
	$( ".btn-goog" ).click(function() {
		updateData("goog.csv");

        html.style.setProperty("--accent-color", "#37ff00");
    	html.style.setProperty("--dark-color", "#166600");
	});
	$( ".btn-tsla" ).click(function() {
		updateData("tsla.csv");

        html.style.setProperty("--accent-color", "#ff0000");
    	html.style.setProperty("--dark-color", "#680000");
	});
	$( ".btn-msft" ).click(function() {
		updateData("msft.csv");

        html.style.setProperty("--accent-color", "#fffa00");
    	html.style.setProperty("--dark-color", "#605f00");
	});

    

});

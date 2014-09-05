console.log("hello d3");

var margin = {top: 20, right: 250, bottom: 30, left: 40},
    width = (960 - margin.left - margin.right)/2,
    height = (500 - margin.top - margin.bottom)/2;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width/1.3], .3, .5);
    // (interval[, padding[, outerPadding])
    // range interval (total width, including the bar width and all paddings)
    // outerPadding (L & R outside of outermost bars)
    // padding (width between bars)

var y = d3.scale.linear()
    .rangeRound([height, 0]);

//var color = d3.scale.category20();

 var color = d3.scale.ordinal()
  .domain(['Unreviewed', 'Auto-population complete', 'Manual first-pass complete', 'Manual second-pass complete', 'Panel curation complete', 'No status curated'])
  .range(['AF7781', 'FF5775', 'FFF874', 'B357CC', '0A94CC','EEEBE3']);
  /**
   * 4th color options:
   *   currently: some sort of purple
   *   bright purple F474ED
   *   green 5B9300
   *   bluegreen 19937B
   *   bluegreen2 2C9378
   *   dark/bright green 219357
   */
  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".0%"));

var svg = d3.select("#stacked-bar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("status.csv", function(error, data) {

  //return keys for stat
  color.domain(
    d3.keys(data[0]).filter(
      function(key) { return key !== "Name"; }
  ));

  data.forEach(function(d) {
    var y0 = 0;
    d.status = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.status.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
  });

  data.sort(function(a, b) { return b.status[0].y1 - a.status[0].y1; });

  x.domain(data.map(function(d) { return d.Name; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + x(d.Name) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.status; })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); });

  var legend = svg.selectAll('.legend')
  .data(color.domain().slice().reverse())
  .enter().append('g')
  .attr('class', 'legend')
  .attr('transform', function(d, i){
    console.log("d",d)
    return "translate(0," +i*20 + ")";
    //increasing 20 increases vertical distance b/w legend color squares
  });

  legend.append("rect")
    .attr('x', width+30) //dec makes closer to the bar charts
    .attr('width', 18) //widgth of the rectangle
    .attr('height', 18) //height of the rectangle
    .style('fill', color);

  legend.append('text')
    .attr('x', width+25) // distance from right side to text
    .attr('y', 9) //not sure why this alines it properly but works
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text(function(d) {
      return d;
    });

});

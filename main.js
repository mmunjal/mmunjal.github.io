var projection = d3.geoMercator();
var data = null;

var qualityOfLifeColors = null;

function getDomain(prop) {
	var scale = _.map(data.features, function(node) {
		if (node.properties[prop]) return node.properties[prop];
		else return null;
	});
	scale = _.uniq(scale);
	 return d3.extent(scale);
}

function setScales() {
	qualityOfLifeColors = d3.scaleLinear().domain([11192,9854033,325147121,1386395001]).range(['blue','green','yellow','red']);
}

function loadData(csv, json) {
	var countries = json;
	var csvData = _.indexBy(d3.csvParse(csv), 'Country');
	countries.features = _.map(countries.features, function(node) {
		if (csvData[node.properties.name]) {
			var countryData = csvData[node.properties.name];
			for (var k in countryData) {
				if (k != 'Country') countryData[k] = countryData[k]*1;
			}
			node.properties = countryData;
		} else {
			node.properties = {Country: node.properties.name}
		}
		return node;
	});

	return countries;
}

function Scene1() {
	var svg = d3.select("#slide1 svg");

	var path = d3.geoPath()
		.projection(projection);

	var g = svg.append("g");

	g.selectAll("path")
		.data(data.features)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "country")
		.style("fill-opacity", 0.7)
		.style("fill", function(data){
			if (data.properties['2017']) {
				return qualityOfLifeColors(data.properties['2017']);
			}
			else return "lightgrey";
		}).on('mouseover', function(d, i){
			d3.select(this).style('fill-opacity', 1);
			$('#map-help').hide();
			$('#country-name').text(d.properties['Country']);
			$('#country-properties').text(d.properties['Rank']);
			var prop = $('#country-properties').empty();
			_.each(d.properties, function(v, k) {
				if ( k == '2017' || k == 'Rank' ) (
				prop.append("<li><b>"+k+":</b> " + v + "</li>") )
			});
		}).on('mouseout', function(d, i) {
			g.selectAll("path").style('fill-opacity', 0.7);
			$('#country-name').empty();
			$('#country-properties').empty();
			$('#map-help').show();
		});

}


function loadSlide2() {
	

	
	var svg = d3.select("#slide2 #svg-custom")
	     margin = 200, width = svg.attr("width") - margin,
         height = svg.attr("height") - margin;
         
         svg.append("text")
            .attr("transform", "translate(100,0)")
            .attr("x", 50).attr("y", 50)
            .attr("font-size", "20px")
            .attr("class", "title")
            .text("Population bar chart")
            
         var x = d3.scaleBand().range([0, width]).padding(0.4),
         y = d3.scaleLinear().range([height, 0]);
            
         var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

         d3.csv("data/world_population1.csv", function(error, data) {
            if (error) {
               throw error;
            }
               
            x.domain(data.map(function(d) { return d.year; }));
            y.domain([0, d3.max(data, function(d) { return d.population; })]);
                     
            g.append("g")
               .attr("transform", "translate(0," + height + ")")
               .call(d3.axisBottom(x))
				.selectAll("text")
				.attr("y", 0)
				.attr("x", 9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(90)")
				.style("text-anchor", "start");
						   
            g.append("g")
               .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 6)
               .attr("dy", "-5.1em")
               .attr("text-anchor", "end")
               .attr("font-size", "18px")
               .attr("stroke", "blue");
               
                         
            g.append("g")
               .attr("transform", "translate(0, 0)")
               .call(d3.axisLeft(y))

            g.selectAll(".bar")
               .data(data)
               .enter()
               .append("rect")
               .attr("class", "bar")
               .on("mouseover", onMouseOver) 
               .on("mouseout", onMouseOut)   
               .attr("x", function(d) { return x(d.year); })
               .attr("y", function(d) { return y(d.population); })
               .attr("width", x.bandwidth()).transition()
               .ease(d3.easeLinear).duration(800)
               .delay(function (d, i) {
                  return i * 25;
               })
                  
            .attr("height", function(d) { return height - y(d.population); });
         });
          



}
function onMouseOver(d, i) {
   d3.select(this)
   .attr('class', 'highlight');
      
   d3.select(this)
      .transition()     
      .duration(200)
      .attr('width', x.bandwidth() + 5)
      .attr("y", function(d) { return y(d.population) - 10; })
      .attr("height", function(d) { return height - y(d.population) + 10; });
     
   g.append("text")
      .attr('class', 'val')
      .attr('x', function() {
         return x(d.year);
      })
      
   .attr('y', function() {
      return y(d.value) - 10;
   })
}
 
function onMouseOut(d, i) {
    
   d3.select(this)
      .attr('class', 'bar');
   
   d3.select(this)
      .transition()     
      .duration(200)
      .attr('width', x.bandwidth())
      .attr("y", function(d) { return y(d.population); })
      .attr("height", function(d) { return height - y(d.population); });
   
   d3.selectAll('.val')
      .remove()
}
function type(d) {
  d.population = +d.population;
  return d;

}

function loadViz() {
	Scene1();

	
}

$(function(){
	$.when($.get('data/world_population.csv'), $.getJSON('data/countries.geo.json'))
		.then(function(v1, v2) {
			var csv = v1[0];
			var json = v2[0];
			data = loadData(csv, json);
			setScales();
			loadViz();
		});
});


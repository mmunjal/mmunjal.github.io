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

function loadSlide1() {
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
	var svgBar = d3.select("#slide2 #svg-custom");
	var countries = [];
	var w = 500;
	var h = 100;
	var barPadding = 3;
	d3.csv("data/world_population.csv",
            function(error, rows) {
                rows.forEach(function(r) {
                    countries.push({
                        name: r.Country,
                        values: [r['2001'], r['2002'], r['2003'], r['2004']]
                    })
                });
                countries.forEach(function(b){
                    render(b);
                });
            });
}




function loadViz() {
	loadSlide1();
	loadSlide2();
	
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


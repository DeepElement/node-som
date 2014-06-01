var fs = require('fs'),
	som = require('../../bin/node-som'),
	Stats = require('fast-stats').Stats,
	analyzer = require('../../bin/analyzer');

function random_color() {
	var rint = Math.round(0xffffff * Math.random());
	return [(rint >> 16), (rint >> 8 & 255), (rint & 255)];
}

// generate a bunch of random RBG colors
var sampleColors = [];
for (var i = 0; i <= 100000; i++)
	sampleColors.push(random_color());


var result = analyzer.analyzeTrainingSet({
	inputLength: 3,
	maxClusters: 1000,
	decayRate: 0.96,
	loggingEnabled: true,
	inputPatterns: 5000,
	minAlpha: 0.01,
	alpha: 0.6,
	radiusReductionPoint: 0.023
}, sampleColors, true);


var pageContent = "<html><style>body{padding:100px}.color-block {width: 10px;height: 10px;float:left}h1{clear:both}</style><body>";

for (var groupKey in result.groups) {
	console.log(result.groups[groupKey]);
	pageContent += "<h1>" + groupKey + "</h1>";
	for(var i=0; i<=result.groups[groupKey].inputs.length-1; i++)
	{
		var input = result.groups[groupKey].inputs[i];
		pageContent += "<div class=\'color-block\' style=\'background-color:rgb(" + 
			Math.floor(input[0]) + "," + 
			Math.floor(input[1]) + "," + 
			Math.floor(input[2]) + ")\'></div>";
	}
}

pageContent += "</body>";

var fs = require('fs');
fs.writeFile("./color.html", pageContent, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 

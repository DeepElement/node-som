var fs = require('fs'),
	som = require('../../bin/node-som'),
	Stats = require('fast-stats').Stats;

function random_color() {
	var rint = Math.round(0xffffff * Math.random());
	return [(rint >> 16), (rint >> 8 & 255), (rint & 255)];
}

function analyzeTrainingSet(somConfig, data) {
	var inputSpace = data;
	var network = new som(somConfig);
	network.train();

	var resultSpace = {
		groups: {},
		network: network
	};

	for (var i = 0; i <= inputSpace.length - 1; i++) {
		var inputVector = inputSpace[i];
		var group = network.classify(inputVector);
		if (!resultSpace.groups[group])
			resultSpace.groups[group] = {
				key: group,
				inputs: [],
				inputCount: 0
			};
		resultSpace.groups[group].inputCount++;
		resultSpace.groups[group].inputs.push(inputVector);
	}

	return resultSpace;
}

// generate a bunch of random RBG colors
var sampleColors = [];
for (var i = 0; i <= 100000; i++)
	sampleColors.push(random_color());

var result = analyzeTrainingSet({
	inputLength: 3,
	maxClusters: 1000,
	loggingEnabled: true,
	inputPatterns: 5000,
	scale: {
		min: 0,
		max: 255
	}
}, sampleColors);

var pageContent = "<html><style>body{padding:100px}.color-block {width: 10px;height: 10px;float:left}h1{clear:both}</style><body>";

for (var groupKey in result.groups) {
	pageContent += "<h1>" + groupKey + "</h1>";
	for (var i = 0; i <= result.groups[groupKey].inputs.length - 1; i++) {
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
	if (err) {
		console.log(err);
	} else {
		console.log("The file was saved!");
	}
});
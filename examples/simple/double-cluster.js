var fs = require('fs'),
	som = require('../../bin/node-som'),
	Stats = require('fast-stats').Stats,
	analyzer = require('../../bin/analyzer');

var max = 100;

function getRandomArbitary(min, max) {
	return Math.random() * (max - min) + min;
}

var inputVectors = [];
for (var i = 0; i <= 100; i++)
	inputVectors.push([getRandomArbitary(0, max),getRandomArbitary(0, max)]);

var result = analyzer.analyzeTrainingSet({
	inputLength: 2,
	maxClusters: 100,
	decayRate: 0.96,
	loggingEnabled: true,
	inputPatterns: 10000,
	minAlpha: 0.01,
	alpha: 0.6,
	radiusReductionPoint: 0.023
}, inputVectors, true);

for (var groupKey in result.groups) {
	console.log(result.groups[groupKey]);
}
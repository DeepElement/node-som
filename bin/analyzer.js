var fs = require('fs'),
	som = require('./node-som'),
	Stats = require('fast-stats').Stats;


exports.analyzeTrainingSet = function(somConfig, data, scaleInputs) {
	var scale = scaleInputs || false;

	var inputSpace = data;
	if (scale) {
		inputSpace = [];
		for (var i = 0; i <= data.length - 1; i++) {
			var inputVector = [];
			for (var m = 0; m <= data[i].length - 1; m++) {
				inputVector.push(1 / ((Math.log(data[i][m] + 1) / Math.log(10)) + 1));
			}
			inputSpace.push(inputVector);
		}
	}

	var network = new som(somConfig);
	network.trainRandom();

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


		if (scale) {
			var inputSpaceDescaled = [];
			for (var m = 0; m <= inputVector.length - 1; m++) {
				var input = Math.pow(10, (Math.pow(inputVector[m], -1) - 1))-1;

				inputSpaceDescaled.push(input);
			}

			resultSpace.groups[group].inputs.push(inputSpaceDescaled);
		} else {
			resultSpace.groups[group].inputs.push(inputVector);
		}
	}

	// calculate group deviations
	for (var groupKey in resultSpace.groups) {
		var componentList = [];
		var deviationList = [];
		var deviationSum = 0;
		for (var i = 0; i <= resultSpace.groups[groupKey].inputs.length - 1; i++) {
			var inputSpace = resultSpace.groups[groupKey].inputs[i];
			for (var c = 0; c <= inputSpace.length - 1; c++) {
				var component = inputSpace[c];
				if (componentList.length - 1 < c)
					componentList.push([]);
				componentList[c].push(component);
			}
		}

		for (var i = 0; i <= componentList.length - 1; i++) {
			var cl = componentList[i];
			var componentStats = new Stats().push(cl);
			var deviation = componentStats.σ();
			deviationList.push(deviation);
			deviationSum += deviation;
		}

		resultSpace.groups[groupKey].deviation = deviationSum;
	}

	return resultSpace;
}
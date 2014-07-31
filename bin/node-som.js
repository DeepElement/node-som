var Stats = require('fast-stats').Stats;

var som = function(options) {
	this.loggingEnabled = options.loggingEnabled || false;
	this.maxClusters = options.maxClusters || 100;
	this.created = options.created || new Date();
	this.classificationCount = options.classificationCount || 0;
	this.vecLen = options.vecLen || options.inputLength || 7;
	this.decayRate = options.decayRate || 0.96;
	this.minAlpha = options.minAlpha || 0.01;
	this.radiusReductionPoint = options.radiusReductionPoint || 0.023;
	this.alpha = options.alpha || 0.6;
	this.inputPatterns = options.inputPatterns || 50;
	this.scale = options.scale || {
		min: -10000,
		max: 10000
	};
	this.classificationDomainTrainingCount = options.classificationDomainTrainingCount || 100000;

	this.w = options.w || [];
	if (!options.w) {
		for (var i = 0; i <= this.maxClusters - 1; i++) {
			var weightVector = [];
			for (var j = 0; j <= this.vecLen - 1; j++)
				weightVector.push(som.prototype._getRandomArbitary(0, 1));
			this.w.push(weightVector);
		}
	}

	this._nodeStatistics = options._nodeStatistics || {};
	this.d = options.d || [];
}

som.prototype.scaleInput = function(subject) {
	return (subject - this.scale.min) / (this.scale.max - this.scale.min);
};

som.prototype.descaleInput = function(subject) {
	return (subject * (this.scale.max - this.scale.min)) + this.scale.min;
};


som.prototype.serialize = function() {
	this.d = [];
	return JSON.stringify(this);
}

som.prototype.train = function(inputs) {
	if (!inputs || (inputs && inputs.length == 0)) {
		som.prototype._trainRandom.call(this);
	} else
		som.prototype._training.call(this, inputs);
}

som.prototype.classify = function(inputs) {
	var scaledInputs = [];
	for (var i = 0; i <= inputs.length - 1; i++)
		scaledInputs.push(this.scaleInput(inputs[i]));

	this.classificationCount++;
	som.prototype._computeInput.call(this, [scaledInputs], 0);
	dMin = som.prototype._minimum.call(this, this.d);
	return dMin;
}

som.prototype.extract = function(classification) {
	var r = this._nodeStatistics[classification];
	if(r)
		return r;
	return [];
}

som.prototype._training = function(trainingPattern) {
	var iterations = 0;
	var reductionFlag = false;
	var reductionPoint = 0;
	var dMin = 0;

	som.prototype._log.call(this, 'Neighborhood radius target ' + this.radiusReductionPoint + ' training...');
	do {
		iterations += 1;

		for (vecNum = 0; vecNum <= trainingPattern.length - 1; vecNum++) {
			som.prototype._computeInput.call(this, trainingPattern, vecNum);
			dMin = som.prototype._minimum.call(this, this.d);
			som.prototype._updateWeights.call(this, trainingPattern, vecNum, dMin);
		}

		this.alpha = this.decayRate * this.alpha;
		if (this.alpha < this.radiusReductionPoint) {
			if (reductionFlag == false) {
				reductionFlag = true;
				reductionPoint = iterations;
			}
		}

		som.prototype._log.call(this, 'Neighborhood radius ' + this.alpha + ' after ' + iterations + ' iterations.');
	} while (this.alpha > this.minAlpha);

	som.prototype._log.call(this, 'Iterations: ' + iterations + '');
	som.prototype.iterations = iterations;

	som.prototype._log.call(this, 'Neighborhood radius reduced after ' +
		reductionPoint + ' iterations.');

	som.prototype._buildStatistics.call(this);
}

som.prototype._computeInput = function(vectorArray, vectorNumber) {
	som.prototype._clearArray.call(this, this.d);

	for (i = 0; i <= (this.maxClusters - 1); i++) {
		for (j = 0; j <= (this.vecLen - 1); j++) {
			this.d[i] += Math.pow((this.w[i][j] - vectorArray[vectorNumber][j]), 2);
		}
	}
}

som.prototype._buildStatistics = function() {
	var preClassificationCount = this.classificationCount;
	var sampleClassifications = {};
	for (var i = 0; i <= this.classificationDomainTrainingCount - 1; i++) {
		var inputArray = [];
		for (var m = 0; m <= this.vecLen - 1; m++)
			inputArray.push(this._getRandomArbitary(this.scale.min, this.scale.max));
		var classification = this.classify(inputArray);
		if (!sampleClassifications[classification])
			sampleClassifications[classification] = [];
		sampleClassifications[classification].push(inputArray);
	}
	this._nodeStatistics = {};
	for (var key in sampleClassifications) {
		var group = sampleClassifications[key];
		this._nodeStatistics[key] = [];
		for (var c = 0; c <= this.vecLen - 1; c++) {
			var componentStats = new Stats();
			for (var g = 0; g <= group.length - 1; g++) {
				var component = group[g][c];
				componentStats.push(component);
			}
			this._nodeStatistics[key].push({
				range: componentStats.range(),
				amean : componentStats.amean(),
				gmean : componentStats.gmean(),
				median : componentStats.median(),
				stddev : componentStats.stddev(),
				gstddev : componentStats.gstddev(),
				moe : componentStats.moe()
			});
		}
	}
	this.classificationCount = preClassificationCount;
}

som.prototype._updateWeights = function(trainingPattern, vectorNumber, dMin) {
	for (i = 0; i <= (this.vecLen - 1); i++) {
		this.w[dMin][i] = this.w[dMin][i] + (this.alpha * (trainingPattern[vectorNumber][i] -
			this.w[dMin][i]));

		if (this.alpha > this.radiusReductionPoint) {
			if ((dMin > 0) && (dMin < (this.maxClusters - 1))) {
				this.w[dMin - 1][i] = this.w[dMin - 1][i] +
					(this.alpha * (trainingPattern[vectorNumber][i] - this.w[dMin - 1][i]));
				this.w[dMin + 1][i] = this.w[dMin + 1][i] +
					(this.alpha * (trainingPattern[vectorNumber][i] - this.w[dMin + 1][i]));
			} else {
				if (dMin == 0) {
					this.w[dMin + 1][i] = this.w[dMin + 1][i] +
						(this.alpha * (trainingPattern[vectorNumber][i] - this.w[dMin + 1][i]));
				} else {
					this.w[dMin - 1][i] = this.w[dMin - 1][i] +
						(this.alpha * (trainingPattern[vectorNumber][i] - this.w[dMin - 1][i]));
				}
			}
		}
	}
}

som.prototype._clearArray = function(NodeArray) {
	for (i = 0; i <= (this.maxClusters - 1); i++) {
		NodeArray[i] = 0.0;
	}
}

som.prototype._minimum = function(nodeArray) {
	var winner = 0;
	var foundNewWinner = false;
	var done = false;

	do {
		foundNewWinner = false;
		for (i = 0; i <= (this.maxClusters - 1); i++) {
			if (i != winner) {
				if (nodeArray[i] < nodeArray[winner]) {
					winner = i;
					foundNewWinner = true;
				}
			}
		}
		if (foundNewWinner == false)
			done = true;
	} while (done != true);

	return winner;
}

som.prototype._getRandomArbitary = function(min, max) {
	return Math.random() * (max - min) + min;
}

som.prototype._trainRandom = function() {
	var pattern = [];
	for (var i = 0; i <= this.inputPatterns - 1; i++) {
		var weightVector = [];
		for (var j = 0; j <= this.vecLen - 1; j++)
			weightVector.push(this._getRandomArbitary(this.scale.min, this.scale.max));
		pattern.push(weightVector);
	}
	som.prototype.train.call(this, pattern);
}


som.prototype._log = function(msg) {
	if (this.loggingEnabled) {
		console.log(msg);
	}
}

if (typeof exports === 'object') {
	module.exports = som;
} else if (typeof define === 'function' && define.amd) {
	define(function() {
		return som;
	});
} else {
	this.som = som;
}
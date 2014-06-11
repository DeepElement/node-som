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

	this.w = options.w || [];
	if (!options.w) {
		for (var i = 0; i <= this.maxClusters - 1; i++) {
			var weightVector = [];
			for (var j = 0; j <= this.vecLen - 1; j++)
				weightVector.push(som.prototype.getRandomArbitary(0, 1));
			this.w.push(weightVector);
		}
	}

	this.d = options.d || [];
	this.pattern = options.pattern || [];
}

som.prototype.log = function(msg) {
	if (this.loggingEnabled) {
		console.log(msg);
	}
}

som.prototype.serialize = function() {
	this.d = [];
	return JSON.stringify(this);
}

som.prototype.trainRandom = function() {
	var pattern = [];
	for (var i = 0; i <= this.inputPatterns - 1; i++) {
		var weightVector = [];
		for (var j = 0; j <= this.vecLen - 1; j++)
			weightVector.push(som.prototype.getRandomArbitary(0, 1));
		pattern.push(weightVector);
	}
	som.prototype.training.call(this, pattern);
}

som.prototype.train = function(inputPatterns) {
	this.inputPatterns = inputPatterns;
	som.prototype.training.call(this, inputPatterns);
}

som.prototype.classify = function(inputs) {
	this.classificationCount++;
	som.prototype.computeInput.call(this, [inputs], 0);
	dMin = som.prototype.minimum.call(this, this.d);
	return dMin;
}

som.prototype.training = function(trainingPattern) {
	this.pattern = trainingPattern;
	var iterations = 0;
	var reductionFlag = false;
	var reductionPoint = 0;
	var dMin = 0;

	som.prototype.log.call(this, 'Neighborhood radius target ' + this.radiusReductionPoint + ' training...');
	do {
		iterations += 1;

		for (vecNum = 0; vecNum <= (this.inputPatterns - 1); vecNum++) {
			som.prototype.computeInput.call(this, this.pattern, vecNum);
			dMin = som.prototype.minimum.call(this, this.d);
			som.prototype.updateWeights.call(this, vecNum, dMin);
		}

		this.alpha = this.decayRate * this.alpha;
		if (this.alpha < this.radiusReductionPoint) {
			if (reductionFlag == false) {
				reductionFlag = true;
				reductionPoint = iterations;
			}
		}

		som.prototype.log.call(this, 'Neighborhood radius ' + this.alpha + ' after ' + iterations + ' iterations.');

	} while (this.alpha > this.minAlpha);

	som.prototype.log.call(this, 'Iterations: ' + iterations + '');
	som.prototype.iterations = iterations;

	som.prototype.log.call(this, 'Neighborhood radius reduced after ' +
		reductionPoint + ' iterations.');
}

som.prototype.computeInput = function(vectorArray, vectorNumber) {
	som.prototype.clearArray.call(this, this.d);

	for (i = 0; i <= (this.maxClusters - 1); i++) {
		for (j = 0; j <= (this.vecLen - 1); j++) {
			this.d[i] += Math.pow((this.w[i][j] - vectorArray[vectorNumber][j]), 2);
		}
	}
}

som.prototype.updateWeights = function(vectorNumber, dMin) {
	for (i = 0; i <= (this.vecLen - 1); i++) {
		this.w[dMin][i] = this.w[dMin][i] + (this.alpha * (this.pattern[vectorNumber][i] -
			this.w[dMin][i]));

		if (this.alpha > this.radiusReductionPoint) {
			if ((dMin > 0) && (dMin < (this.maxClusters - 1))) {
				this.w[dMin - 1][i] = this.w[dMin - 1][i] +
					(this.alpha * (this.pattern[vectorNumber][i] - this.w[dMin - 1][i]));
				this.w[dMin + 1][i] = this.w[dMin + 1][i] +
					(this.alpha * (this.pattern[vectorNumber][i] - this.w[dMin + 1][i]));
			} else {
				if (dMin == 0) {
					this.w[dMin + 1][i] = this.w[dMin + 1][i] +
						(this.alpha * (this.pattern[vectorNumber][i] - this.w[dMin + 1][i]));
				} else {
					this.w[dMin - 1][i] = this.w[dMin - 1][i] +
						(this.alpha * (this.pattern[vectorNumber][i] - this.w[dMin - 1][i]));
				}
			}
		}
	}
}

som.prototype.clearArray = function(NodeArray) {
	for (i = 0; i <= (this.maxClusters - 1); i++) {
		NodeArray[i] = 0.0;
	}
}

som.prototype.minimum = function(nodeArray) {
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

		if (foundNewWinner == false) {
			done = true;
		}

	} while (done != true);

	return winner;
}

som.prototype.getRandomArbitary = function(min, max) {
	return Math.random() * (max - min) + min;
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
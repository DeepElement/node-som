var som = require('../bin/node-som'),
    should = require('should'),
    fs = require('fs'),
    path = require('path'),
    Stats = require('fast-stats').Stats;

describe('node-som integration tests', function() {


    describe('options tests', function() {
        it('classificationCount recoverable', function() {
            var somInstance = new som({
                inputLength: 5,
                maxClusters: 1000,
                loggingEnabled: false,
                minAlpha: 0.5
            });
            somInstance.train();
            somInstance.classify([1, 2, 3, 4, 5]);

            should.exist(somInstance.classificationCount);
            somInstance.classificationCount.should.equal(1);

            var somMomento = somInstance.serialize();
            var somRecovered = new som(JSON.parse(somMomento));

            should.exist(somRecovered.classificationCount);
            somRecovered.classificationCount.should.equal(1);
        });

        it('custom property support', function() {
            var keyValue = 'test-key';
            var somInstance = new som({
                inputLength: 5,
                maxClusters: 1000,
                loggingEnabled: false,
                minAlpha: 0.5
            });
            somInstance.train();
            somInstance.key = keyValue;

            var somMomento = somInstance.serialize();

            var parsed = JSON.parse(somMomento);
            var somRecovered = new som(parsed);

            should.exist(somRecovered.key);
            somRecovered.key.should.equal(keyValue);
        });
    });

    describe('scaling', function() {
        it('Standard Case', function() {
            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false,
                minAlpha: 0.5
            });

            var testInput = 20;
            var output = somInstance.scaleInput(testInput);
            var descaledOutput = somInstance.descaleInput(output);

            testInput.should.approximately(descaledOutput, 0.0001);
        });

        it('Larger Domain', function() {
            var domainMin = -1000;
            var domainMax = 1000;
            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false,
                minAlpha: 0.5,
                scale: {
                    min: domainMin,
                    max: domainMax
                }
            });

            for (var i = domainMin; i <= domainMax; i = i + 0.001) {
                var output = somInstance.scaleInput(i);
                var descaledOutput = somInstance.descaleInput(output);
                i.should.approximately(descaledOutput, 0.000001);
            }
        });

        it('Extremely High Range Domain', function() {
            var domainMin = -1000000000;
            var domainMax = 1000000000;

            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false,
                minAlpha: 0.5,
                scale: {
                    min: domainMin,
                    max: domainMax
                }
            });

            for (var i = domainMin; i <= domainMax; i = i + 100) {
                var output = somInstance.scaleInput(i);
                var descaledOutput = somInstance.descaleInput(output);
                i.should.approximately(descaledOutput, 1);
            }
        });
    });

    describe('train - group deviation', function() {
        it('Standard Case', function() {
            this.timeout(60000);

            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false,
                minAlpha: 0.5
            });

            somInstance.train();

            var samplesCount = 1000000;
            var samples = [];
            for (var i = 0; i <= samplesCount - 1; i++) {
                var inputs = [];
                for (var j = 0; j <= inputLength - 1; j++)
                    inputs.push(somInstance._getRandomArbitary(0, 1));
                samples.push(inputs);
            }

            var classificationGroups = {};
            for (var i = 0; i <= samples.length - 1; i++) {
                var sample = samples[i];
                var group = somInstance.classify(sample);
                if (classificationGroups[group] == null)
                    classificationGroups[group] = {
                        count: 0,
                        samples: []
                    };
                classificationGroups[group].count++;
                classificationGroups[group].samples.push(sample);
            }

            // calculate group deviations
            var groupDeviations = {};
            for (var groupKey in classificationGroups) {
                var group = classificationGroups[groupKey];
                var s = new Stats();
                group.samples.forEach(function(sample) {
                    s.push(sample);
                });
                groupDeviations[groupKey] = {
                    amean: s.amean(),
                    gmean: s.gmean(),
                    stddev: s.stddev(),
                    gstddev: s.gstddev(),
                    moe: s.moe(),
                    range: s.range(),
                    median: s.median()
                };
            }

            for (var groupKey in groupDeviations) {
                var groupDeviation = groupDeviations[groupKey];
                groupDeviation.moe.should.be.below(0.5);
            }
        });
    });

    describe('train', function() {
        it('Standard Case', function() {
            this.timeout(60000);

            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false
            });

            somInstance.train();

            var samplesCount = 1000000;
            var samples = [];
            for (var i = 0; i <= samplesCount - 1; i++) {
                var inputs = [];
                for (var j = 0; j <= inputLength - 1; j++)
                    inputs.push(somInstance._getRandomArbitary(0, 1));
                samples.push(inputs);
            }

            var classificationGroups = {};
            for (var i = 0; i <= samples.length - 1; i++) {
                var sample = samples[i];
                var group = somInstance.classify(sample);
                if (classificationGroups[group] == null)
                    classificationGroups[group] = 0;
                classificationGroups[group] ++;
            }
        });
    });


    describe('momento', function() {
        it('Standard Case', function() {
            this.timeout(60000);

            var inputLength = 7;
            var maxClusters = 5;
            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false
            });

            somInstance.train();

            var serialized = somInstance.serialize();

            var deserializedSomInstance = new som(JSON.parse(serialized));
            var momentoDeserialized = deserializedSomInstance.serialize();

            momentoDeserialized.should.equal(serialized);
        });

        it('Training Outputs Equal', function() {
            this.timeout(60000);

            var samplesCount = 1000;
            var samples = [];
            var inputLength = 10;
            var maxClusters = 1000;

            var somInstance = new som({
                inputLength: inputLength,
                maxClusters: maxClusters,
                loggingEnabled: false,
                inputPatterns: 10,
            });

            for (var i = 0; i <= samplesCount - 1; i++) {
                var inputs = [];
                for (var j = 0; j <= inputLength - 1; j++)
                    inputs.push(somInstance._getRandomArbitary(0, 1));
                samples.push(inputs);
            }

            somInstance.train();

            var serialized = somInstance.serialize();

            var deserializedSomInstance = new som(JSON.parse(serialized));
            var momentoDeserialized = deserializedSomInstance.serialize();

            momentoDeserialized.should.equal(serialized);

            var distinctGroups = [];
            samples.forEach(function(sample) {
                var left = somInstance.classify(sample);
                if (distinctGroups.indexOf(left) == -1)
                    distinctGroups.push(left);
                var right = deserializedSomInstance.classify(sample);
                left.should.equal(right);
            });
        });
    });
});

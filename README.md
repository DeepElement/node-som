A Kohonen Network api for Node
=====================================================

## Installation

npm install node-som

## Usage:

```
// Inject the module
var som = require('node-som');

// Create the instance
var somInstance = new som({
	inputLength: 2,
	maxClusters: 5,
	loggingEnabled: true
});

// Train (all automatic)
somInstance.train();

// Create input array. 
// All items features should be normalized to domain [0,1]
var sample = [0.24, 0.34];

// Call classify
var group = somInstance.classify(sample);

// Your result will be a group within the cluster boundaries

```

## Options

__loggingEnabled__ (bool)

__maxClusters__ (Integer) - Max number of Classification groups to use. This is an upper-bound and an optimized network usually contains less than this number.

__created__ (Date) - When the network was initially created

__classificationCount__ (Integer) - Represents the number of classifications run through the network. Used as a metric of maturity.

__inputLength__ (Integer) - Component length of input vectors

__decayRate__ (Double) - TODO

__minAlpha__ (Double) - TODO

__alpha__ (Double) - TODO

__radiusReductionPoint__ (Double) - TODO

__inputPatterns__ (Integer) - Represents the number of random samples to self-train on. Higher numbers cost more, but can result in more granular groups

## Input Scaling
No matter how tricked-out the network, you must collapse your input patterns into a [0,1] domain. Since the result of a Kohonen network for classification is to surface the dominant node, you don't have to worry about descaling the classification result.

__Domain Normalization__

If you have access to all of the input vectors, simply apply: 

	normalizedInput[i] = input[i] - min(inputsAt[i]) / (max(inputsAt[i]) - min(inputsAt[i]));

_Note: for mutlidimensional input vectors, make sure you normalize component by component across all other input samples_

This is a reliable method that keeps unit proportions in-tact, in the event you want to actually validate the normalized array visually. 

__Log Scaling__

TODO: Fill-in example!


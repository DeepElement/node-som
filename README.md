A Kohonen Network API for Node.js
=====================================================

The Self-Organizing Map (commonly also known as Kohonen network) defines an ordered mapping, a kind of projection from a set of given data items onto a regular, usually two-dimensional grid.

[![npm status](https://nodei.co/npm/node-som.png?compact=true)](https://nodei.co/npm/node-som.png?compact=true)


[![Build Status](https://travis-ci.org/DeepElement/node-som.png?branch=master)](https://travis-ci.org/DeepElement/node-som)

## Installation

~~~ sh
$ npm install node-som
~~~

## Color Clustering Example

[This example](https://github.com/DeepElement/node-som/blob/master/examples/colors/colors-cluster.js) shows how the SOM can adaptively cluster a random RGB input space based on the network's training state.

~~~ sh
$ npm install node-som
$ cd node_modules/node-som/
$ node examples/colors/colors-cluster.js
$ open examples/colors/color.html
~~~

## Usage

~~~ js
// Inject the module
var som = require('node-som');

// Create the instance
var somInstance = new som({
	inputLength: 2,
	maxClusters: 5,
	loggingEnabled: true,
	scale: {
		min : 0,
		max : 1000
	}
});

/**
 * Train (all automatic). Optionally, you can include custom input vectors, but 
 * it is recommended that developers allow the automated training (based on the 
 * `scale` configuration) since this results in better networks
 */
 somInstance.train();

/**
 * Create input array. 
 * All items features should be normalized to domain [0,1]
 */
var sample = [0.24, 0.34];

// Call classify to receive your classification group/neuron
var group = somInstance.classify(sample);

/**
 * For the sake of intelligence, you can then extract your
 * domain boundaries from a stored group by component.
 */
var groupDomainBoundaries = somInstance.extract(group);

console.log(groupDomainBoundaries);

~~~

The output is enough to do some pretty hardcore analysis on the cluster domain (wisker plot, etc)

~~~ js
 groupDomainBoundaries = [ 
  { range: [ 0.002023763954639435, 999.9967189505696 ],
    amean: 498.7489069010919,
    gmean: 366.71135268678785,
    median: 498.73221735469997,
    stddev: 287.81665907708333,
    gstddev: 2.7296960810401862,
    moe: 1.7839061347985679 },
  { range: [ 0.0025222543627023697, 999.9986472539604 ],
    amean: 501.4137114080192,
    gmean: 370.21158812427205,
    median: 500.92090992257,
    stddev: 288.3074606679444,
    gstddev: 2.6996348342872674,
    moe: 1.7869481545750234 } ]
~~~

## Options
###loggingEnabled (bool)
Enables/Disables logging on the console

###maxClusters (Integer) 
Max number of Classification groups to use. This is an upper-bound and an optimized network usually contains less than this number.

###created (Date) 
When the network was initially created

###classificationCount (Integer) 
Represents the number of classifications run through the network. Used as a metric of maturity.

###inputLength (Integer) 
Component length of input vectors

###inputPatterns (Integer) 
Represents the number of random samples to self-train on. Higher numbers cost more, but can result in more granular groups

###scale (Complex) 
Tells the SOM how to train to insure high accuracy on the target domain. ex. {min: -1000, max: 1000}

## API

###train 
Accepts an array of unscaled input vectors of ordinal length `inputLength`. The implementation scales itself, based on the `scale` constructor configuration.

If no training vectors are provided, Recommended, a random set is generated and trained based on the `__inputPatterns__` configuration. 

> Note: This results in the most optimized network.

###classify
Given a single unscaled input vector, will return the classification/neuron that best describes the input based on the network state

###extract
Given a classication/neuron, will return component statistics for unscaled input vector extraction. Statistics are in the form of component ranges.

Its up to the developer to use this information to infer about their own domain, since the network doesn't hold on to the entire input domain upon training/classification (for momento purposes).

###serialize
Serialize the network for future use. 

Reloading the network can be done by passing the serialized json into the constructor on instantiation. 

###scaleInput
Scales a vector of `inputLength` based on the SOM's `scale` boundaries. 

> Note: Scaling is done internally. No need to do this unless extending the network implementation.

###descaleInput
 Descales a scalled vector of `inputLength` based on the SOM's `scale` boundaries.

> Note: Descaling is done internally. No need to do this unless extending the network implementation.

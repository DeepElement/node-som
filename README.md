A Self Organizing Map implementation for NodeJS
=====================================================

## Installation

npm install node-som

##Usage:

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
// Hint: just use 1/x
var sample = [0.24, 0.34];

// Call classify
var group = somInstance.classify(sample);

// Your result will be a group within the cluster boundaries

```


In the examples directory is a great set of situations to reveal the powerful nature of the SOM. 

Just run `node <sample script name>` to activate from within each folder.

var Stats = require("fast-stats").Stats;
Math.log10 || (Math.log10 = function(a) {
    return Math.log(a) / Math.LN10;
});
var som = function(a) {
    this.loggingEnabled = a.loggingEnabled || !1;
    this.maxClusters = a.maxClusters || 100;
    this.created = a.created || new Date;
    this.classificationCount = a.classificationCount || 0;
    this.vecLen = a.vecLen || a.inputLength || 7;
    this.decayRate = a.decayRate || .96;
    this.minAlpha = a.minAlpha || .01;
    this.radiusReductionPoint = a.radiusReductionPoint || .023;
    this.alpha = a.alpha || .6;
    this.inputPatterns = a.inputPatterns || 50;
    this.scale = a.scale || {
        min: -1E4,
        max: 1E4
    };
    this.w = a.w || [];
    if (!a.w) {
        for (var b = 0; b <= this.maxClusters - 1; b++) {
            for (var c = [], d = 0; d <= this.vecLen - 1; d++) {
                c.push(som.prototype._getRandomArbitary(0, 1));
            }
            this.w.push(c);
        }
    }
    this.statistics = a.statistics || {};
    this.d = a.d || [];

    for (var propKey in a) {
      if(!this[propKey] && propKey != 'undefined')
        this[propKey] = a[propKey];
    }
};
som.prototype.scaleInput = function(a) {
    var b = Math.min(this.scale.min, this.scale.max),
        c = Math.abs(0 > b ? b : 0) + 1,
        b = Math.log(this.scale.min + c),
        d = Math.log(this.scale.max + c);
    a = Math.log(a + c);
    Math.exp(a);
    return (a - b) / (d - b);
};
som.prototype.descaleInput = function(a) {
    var b = Math.min(this.scale.min, this.scale.max),
        b = Math.abs(0 > b ? b : 0) + 1,
        c = Math.log(this.scale.min + b),
        d = Math.log(this.scale.max + b);
    return Math.exp(a * (d - c) + c) - b;
};
som.prototype.serialize = function() {
    this.d = [];
    return JSON.stringify(this);
};
som.prototype.train = function(a) {
    !a || a && 0 == a.length ? som.prototype._trainRandom.call(this) : som.prototype._training.call(this, a);
};
som.prototype.classify = function(a) {
    for (var b = [], c = 0; c <= a.length - 1; c++) {
        b.push(this.scaleInput(a[c]));
    }
    this.classificationCount++;
    som.prototype._computeInput.call(this, [b], 0);
    dMin = som.prototype._minimum.call(this, this.d);
    if (!this.statistics[dMin]) {
        for (this.statistics[dMin] = {
                c: 0,
                p: 0,
                i: []
            }, b = 0; b <= this.vecLen - 1; b++) {
            this.statistics[dMin].i.push({
                min: Number.MAX_VALUE,
                max: Number.MIN_VALUE
            });
        }
    }
    this.statistics[dMin].c++;
    for (b = 0; b <= this.vecLen - 1; b++) {
        var c = a[b],
            d = this.statistics[dMin].i[b];
        d.min > c && (d.min = c);
        d.max < c && (d.max = c);
    }
    a = 0;
    for (var e in this.statistics) {
        a += this.statistics[e].c;
    }
    for (e in this.statistics) {
        this.statistics[e].p = this.statistics[e].c / a;
    }
    return dMin;
};
som.prototype._training = function(a) {
    this.statistics = {};
    var b = 0,
        c = !1,
        d = 0,
        e = 0;
    som.prototype._log.call(this, "Neighborhood radius target " + this.radiusReductionPoint + " training...");
    do {
        b += 1;
        for (vecNum = 0; vecNum <= a.length - 1; vecNum++) {
            som.prototype._computeInput.call(this, a, vecNum), e = som.prototype._minimum.call(this, this.d), som.prototype._updateWeights.call(this, a, vecNum, e);
        }
        this.alpha *= this.decayRate;
        this.alpha < this.radiusReductionPoint && 0 == c && (c = !0, d = b);
        som.prototype._log.call(this, "Neighborhood radius " + this.alpha + " after " + b + " iterations.");
    } while (this.alpha > this.minAlpha);
    som.prototype._log.call(this, "Iterations: " + b + "");
    som.prototype.iterations = b;
    som.prototype._log.call(this, "Neighborhood radius reduced after " + d + " iterations.");
};
som.prototype._computeInput = function(a, b) {
    som.prototype._clearArray.call(this, this.d);
    for (i = 0; i <= this.maxClusters - 1; i++) {
        for (j = 0; j <= this.vecLen - 1; j++) {
            this.d[i] += Math.pow(this.w[i][j] - a[b][j], 2);
        }
    }
};
som.prototype._updateWeights = function(a, b, c) {
    for (i = 0; i <= this.vecLen - 1; i++) {
        this.w[c][i] += this.alpha * (a[b][i] - this.w[c][i]), this.alpha > this.radiusReductionPoint && (0 < c && c < this.maxClusters - 1 ? (this.w[c - 1][i] += this.alpha * (a[b][i] - this.w[c - 1][i]), this.w[c + 1][i] += this.alpha * (a[b][i] - this.w[c + 1][i])) : 0 == c ? this.w[c + 1][i] += this.alpha * (a[b][i] - this.w[c + 1][i]) : this.w[c - 1][i] += this.alpha * (a[b][i] - this.w[c - 1][i]));
    }
};
som.prototype._clearArray = function(a) {
    for (i = 0; i <= this.maxClusters - 1; i++) {
        a[i] = 0;
    }
};
som.prototype._minimum = function(a) {
    var b = 0,
        c = !1,
        d = !1;
    do {
        c = !1;
        for (i = 0; i <= this.maxClusters - 1; i++) {
            i != b && a[i] < a[b] && (b = i, c = !0);
        }
        0 == c && (d = !0);
    } while (1 != d);
    return b;
};
som.prototype._getRandomArbitary = function(a, b) {
    return Math.random() * (b - a) + a;
};
som.prototype._trainRandom = function() {
    for (var a = [], b = 0; b <= this.inputPatterns - 1; b++) {
        for (var c = [], d = 0; d <= this.vecLen - 1; d++) {
            c.push(this._getRandomArbitary(this.scale.min, this.scale.max));
        }
        a.push(c);
    }
    som.prototype.train.call(this, a);
};
som.prototype._log = function(a) {
    this.loggingEnabled && console.log(a);
};
"object" === typeof exports ? module.exports = som : "function" === typeof define && define.amd ? define(function() {
    return som;
}) : this.som = som;

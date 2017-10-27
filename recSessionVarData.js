
/**
 * this class stores the data that should be recorded.
 * @constructor
 */
var RecSessionVarData = function(recSession) {
    this.recSession = recSession;

    this.browserSpec = ko.observable(null);
    this.versionSpec = ko.observable(null);
    this.systemSpec = ko.observable(null);
    this.agentSpec = ko.observable(null);
    this.fullscreen = ko.observable(null);
    this.timeDelayMean = ko.observable(null);
    this.timeDelayMax = ko.observable(null);

    // dynamically added:
    this.timeDelayMeanTrimed = ko.observable("not measured");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecSessionVarData}
 */
RecSessionVarData.prototype.fromJS = function(data) {

    if (data.hasOwnProperty('browserSpec')){
        this.browserSpec(data.browserSpec);
    }
    if (data.hasOwnProperty('versionSpec')){
        this.versionSpec(data.versionSpec);
    }
    if (data.hasOwnProperty('systemSpec')){
        this.systemSpec(data.systemSpec);
    }
    if (data.hasOwnProperty('agentSpec')){
        this.agentSpec(data.agentSpec);
    }
    if (data.hasOwnProperty('fullscreen')){
        this.fullscreen(data.fullscreen);
    }
    if (data.hasOwnProperty('timeDelayMean')){
        this.timeDelayMean(data.timeDelayMean);
        var trimmed = Math.round(parseFloat(this.timeDelayMean()) * 10) / 10;
        this.timeDelayMeanTrimed(""+trimmed+" ms");
    }
    if (data.hasOwnProperty('timeDelayMax')){
        this.timeDelayMax(data.timeDelayMax);
    }


    return this;
};
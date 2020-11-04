
/**
 * this class stores the data that should be recorded.
 * @constructor
 */
var RecSessionVarData = function (recSession) {

    // parent recSession:
    this.recSession = recSession;

    // new version uses RecData subfields (all data is in these subfields):
    this.subjectData = new RecData();
    this.sessionData = new RecData();

    // these are all deprecated and will be removed in the near future (do not add new to the list):
    this.browserSpec = ko.observable(null);
    this.versionSpec = ko.observable(null);
    this.systemSpec = ko.observable(null);
    this.agentSpec = ko.observable(null);
    this.fullscreen = ko.observable(null);
    this.timeDelayMean = ko.observable(null);
    this.timeDelayMax = ko.observable(null);
    this.crowdsourcingCode = ko.observable(null);
    this.debugData = ko.observable(null);
    this.serverResponseTimes = ko.observable(null);
    this.crowdsourcinSubjId = ko.observable(null);
    this.timeDelayStd = ko.observable(null);
    this.subjCounterGlobal = ko.observable(null);
    this.subjCounterPerGroup = ko.observable(null);
    this.multiUserGroupId = ko.observable(null);
    this.roleId = ko.observable(null);
    this.displayedLanguage = ko.observable(null);
    this.Pixel_Density_PerMM = ko.observable(null);

    // dynamically added:
    this.timeDelayMeanTrimed = ko.observable("not measured");
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RecSessionVarData}
 */
RecSessionVarData.prototype.fromJS = function (data) {

    if (data.hasOwnProperty('subjectData')) {
        this.subjectData.fromJS(data.subjectData);
    }
    if (data.hasOwnProperty('sessionData')) {
        this.sessionData.fromJS(data.sessionData);
    }

    // TODO: add convertion of old recorded data and insert them into this.subjectData or this.sessionData
    if (data.hasOwnProperty('browserSpec')) {
        this.browserSpec(data.browserSpec);
    }
    if (data.hasOwnProperty('versionSpec')) {
        this.versionSpec(data.versionSpec);
    }
    if (data.hasOwnProperty('systemSpec')) {
        this.systemSpec(data.systemSpec);
    }
    if (data.hasOwnProperty('agentSpec')) {
        this.agentSpec(data.agentSpec);
    }
    if (data.hasOwnProperty('fullscreen')) {
        this.fullscreen(data.fullscreen);
    }
    if (data.hasOwnProperty('timeDelayMean')) {
        this.timeDelayMean(data.timeDelayMean);
        var trimmed = Math.round(parseFloat(this.timeDelayMean()) * 10) / 10;
        this.timeDelayMeanTrimed("" + trimmed + " ms");
    }
    if (data.hasOwnProperty('timeDelayMax')) {
        this.timeDelayMax(data.timeDelayMax);
    }

    if (data.hasOwnProperty('crowdsourcingCode')) {
        this.crowdsourcingCode(data.crowdsourcingCode);
    }
    if (data.hasOwnProperty('debugData')) {
        var dati = '';
        data.debugData.forEach(function (trialDat) {
            dati = dati + JSON.stringify(trialDat);
        });
        this.debugData(dati);
    }
    if (data.hasOwnProperty('serverResponseTimes')) {
        this.serverResponseTimes(JSON.stringify(data.serverResponseTimes));
    }
    if (data.hasOwnProperty('crowdsourcinSubjId')) {
        this.crowdsourcinSubjId(JSON.stringify(data.crowdsourcinSubjId));
    }
    if (data.hasOwnProperty('timeDelayStd')) {
        var shortend = Math.round(parseFloat(data.timeDelayStd) * 10) / 10;
        this.timeDelayStd(shortend + " ms");
    }
    if (data.hasOwnProperty('subjCounterGlobal')) {
        this.subjCounterGlobal(data.subjCounterGlobal);
    }
    if (data.hasOwnProperty('subjCounterPerGroup')) {
        this.subjCounterPerGroup(data.subjCounterPerGroup);
    }
    if (data.hasOwnProperty('multiUserGroupId')) {
        this.multiUserGroupId(data.multiUserGroupId);
    }
    if (data.hasOwnProperty('roleId')) {
        this.roleId(data.roleId);
    }
    if (data.hasOwnProperty('displayedLanguage')) {
        this.displayedLanguage(data.displayedLanguage);
    }
    if (data.hasOwnProperty('Pixel_Density_PerMM')) {
        this.Pixel_Density_PerMM(data.Pixel_Density_PerMM);
    }

    return this;
};

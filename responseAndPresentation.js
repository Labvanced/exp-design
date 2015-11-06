// © by Caspar Goeke and Holger Finger


var ResponseAndPresentation= function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "responseAndPresentation";
    this.name = ko.observable("responseAndPresentation");
    this.responseType = ko.observable(0);
    this.responseTime =  ko.observable(0);
    this.infiniteResponseTime =  ko.observable(false);
    this.keybordExitResponses = ko.observableArray(null);
    this.mouseExitResponse = ko.observable(false);
    this.minPresentationTime = ko.observable(this.parentSequence.minPresentationTime());
    this.maxPresentationTime = ko.observable(this.parentSequence.maxPresentationTime());
    this.infinitePresentationTime =  ko.observable(false);
};




ResponseAndPresentation.prototype.fromJS = function(stimulusItem) {
    this.id(stimulusItem.id);
    this.type = stimulusItem.type;
    this.name(stimulusItem.name);
    this.responseType(stimulusItem.responseType);
    this.responseTime(stimulusItem.responseTime);
    this.infiniteResponseTime(stimulusItem.infiniteResponseTime);
    this.keybordExitResponses(stimulusItem.keybordExitResponses);
    this.mouseExitResponse(stimulusItem.mouseExitResponse);
    this.minPresentationTime(stimulusItem.minPresentationTime);
    this.maxPresentationTime(stimulusItem.maxPresentationTime);
    this.infinitePresentationTime(stimulusItem.infinitePresentationTime);

    return this;
};

ResponseAndPresentation.prototype.toJS = function() {

    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        responseType: this.responseType(),
        responseTime: this.responseTime(),
        infiniteResponseTime: this.infiniteResponseTime(),
        keybordExitResponses: this.keybordExitResponses(),
        mouseExitResponse: this.mouseExitResponse(),
        minPresentationTime: this.minPresentationTime(),
        maxPresentationTime: this.maxPresentationTime(),
        infinitePresentationTime: this.infinitePresentationTime()


    };
};


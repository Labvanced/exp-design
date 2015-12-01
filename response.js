// � by Caspar Goeke and Holger Finger


var Response= function(parentSequence) {

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




Response.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    this.responseType(data.responseType);
    this.responseTime(data.responseTime);
    this.infiniteResponseTime(data.infiniteResponseTime);
    this.keybordExitResponses(data.keybordExitResponses);
    this.mouseExitResponse(data.mouseExitResponse);
    this.minPresentationTime(data.minPresentationTime);
    this.maxPresentationTime(data.maxPresentationTime);
    this.infinitePresentationTime(data.infinitePresentationTime);

    return this;
};

Response.prototype.toJS = function() {

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


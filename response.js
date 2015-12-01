// � by Caspar Goeke and Holger Finger


var Response= function(parent) {

    this.parent = parent;

    // serialized
    this.type = "Response";
    this.name = ko.observable("Response");
    this.responseType = ko.observable("keyPress"); // or mouseClick or ...
    this.responseKey = ko.observable(null); // keyboard key or leftClick or RightClick...

    this.minResponseTime =  ko.observable(null);
    this.maxResponseTime =  ko.observable(null);
    this.action = ko.observableArray();
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


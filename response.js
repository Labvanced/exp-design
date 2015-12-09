// � by Caspar Goeke and Holger Finger


var Response= function(parent) {

    this.parent = parent;

    // serialized
    this.type = "Response";
    this.responseType = ko.observable("keyboard"); // or mouse or ...
    this.responseKey = ko.observable(null); // leftArrow or leftClick or RightClick...
    this.minTime =  ko.observable(0);
    this.maxTime =  ko.observable(null);
    this.actions = ko.observableArray();
};

Response.prototype.fromJS = function(data) {
    var self = this;

    this.responseType(data.responseType);
    this.responseKey(data.responseKey);
    this.minTime(data.minTime);
    this.maxTime(data.maxTime);
    this.actions(jQuery.map( data.actions, function( actionData ) {
        var action = actionFactory(self,actionData);
        action.fromJS(actionData);
        return action;
    } ));
    return this;
};

Response.prototype.toJS = function() {
    return {
        type: this.type,
        responseType: this.responseType(),
        responseKey: this.responseKey(),
        minTime: this.minTime(),
        maxTime: this.maxTime(),
        actions: jQuery.map( this.actions(), function( action ) { return action.toJS(); } )
    };
};


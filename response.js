// � by Caspar Goeke and Holger Finger


var Response= function(parent) {
    var self = this;

    this.parent = parent;

    // serialized
    this.type = "Response";
    this.responseType = ko.observable("keyboard"); // or mouse or ...
    this.responseKey = ko.observable(null); // leftArrow or leftClick or RightClick...
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(false);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(false);
    this.actions = ko.observableArray();

    this.isKeyboardResponse = ko.computed(function(){
        return (self.responseType() == "keyboard");
    }, this);
    this.isMouseResponse = ko.computed(function(){
        return (self.responseType() == "mouse");
    }, this);
};

Response.prototype.fromJS = function(data) {
    var self = this;

    this.responseType(data.responseType);
    this.responseKey(data.responseKey);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
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
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        actions: jQuery.map( this.actions(), function( action ) { return action.toJS(); } )
    };
};


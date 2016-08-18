// � by Caspar Goeke and Holger Finger

var TriggerMouse = function(event) {
    this.event = event;

    // serialized
    this.buttonType = ko.observable(undefined);
    this.interactionType = ko.observable(undefined);
    this.elements = ko.observableArray([]);
};

TriggerMouse.prototype.type = "TriggerMouse";
TriggerMouse.prototype.label = "Mouse Trigger";
TriggerMouse.prototype.buttonTypes = ["Left", "Right"];
TriggerMouse.prototype.interactionTypes = ["Click", "PressDown", "PressUp", "Hover", "Position"];

TriggerMouse.prototype.setPointers = function(entitiesArr) {
    this.elements(jQuery.map( this.elements(), function( id ) {
        return entitiesArr.byId[id];
    } ));
};

TriggerMouse.prototype.getParameterSpec = function() {
    return {
        'posX': 'numeric',
        'posY': 'numeric',
        'elementTagUnderMouse': 'string',
        'timeFromFrameOnset': 'numeric'
    };
};

TriggerMouse.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerMouse.prototype.fromJS = function(data) {
    this.buttonType(data.buttonType);
    this.interactionType(data.interactionType);
    this.elements(data.elements);
    return this;
};

TriggerMouse.prototype.toJS = function() {
    return {
        type: this.type,
        buttonType: this.buttonType(),
        interactionType: this.interactionType(),
        elements: jQuery.map( this.elements(), function( element ) { return element.id(); } )
    };
};

////////////////////////



var TriggerKeyboard = function(event) {
    this.event = event;

    // serialized
    this.buttons = ko.observableArray([]);
    this.interactionType = ko.observable(undefined);
};

TriggerKeyboard.prototype.type = "TriggerKeyboard";
TriggerKeyboard.prototype.label = "Keyboard Trigger";
TriggerKeyboard.prototype.interactionTypes = ["Pressed", "PressDown", "PressUp"];

TriggerKeyboard.prototype.setPointers = function(entitiesArr) {

};

TriggerKeyboard.prototype.getParameterSpec = function() {
    return {
        'buttonPressed': 'string',
        'timeFromFrameOnset': 'numeric'
    };
};

TriggerKeyboard.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerKeyboard.prototype.fromJS = function(data) {
    this.buttons(data.buttons);
    this.interactionType(data.interactionType);
    return this;
};

TriggerKeyboard.prototype.toJS = function() {
    return {
        type: this.type,
        buttons: this.buttons(),
        interactionType: this.interactionType()
    };
};

////////////////////////


function triggerFactory(event,type) {
    var trigger = new window[type](event);
    // if (type == "TriggerMouse"){
    //     var trigger = new TriggerMouse(event);
    // }
    // else if(type == "TriggerKeyboard") {
    //     var trigger = new TriggerKeyboard(event);
    // }
    return trigger;
}
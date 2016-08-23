// � by Caspar Goeke and Holger Finger

var TriggerMouse = function(event) {
    this.event = event;

    // serialized
    this.buttonType = ko.observable("Left");
    this.interactionType = ko.observable("Click");
    this.targets = ko.observableArray([]);
};

TriggerMouse.prototype.type = "TriggerMouse";
TriggerMouse.prototype.label = "Mouse Trigger";
TriggerMouse.prototype.buttonTypes = ["Left", "Right"];
TriggerMouse.prototype.interactionTypes = ["Click", "PressDown", "PressUp", "Hover", "Position"];

TriggerMouse.prototype.setPointers = function(entitiesArr) {
    this.targets(jQuery.map( this.targets(), function( id ) {
        return entitiesArr.byId[id];
    } ));
};

TriggerMouse.prototype.getParameterSpec = function() {
    return [
        'elementTag',
        'reactionTime'
    ];
};

TriggerMouse.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerMouse.prototype.fromJS = function(data) {
    this.buttonType(data.buttonType);
    this.interactionType(data.interactionType);
    this.targets(data.targets);
    return this;
};

TriggerMouse.prototype.toJS = function() {
    return {
        type: this.type,
        buttonType: this.buttonType(),
        interactionType: this.interactionType(),
        targets: jQuery.map( this.targets(), function( element ) { return element.id(); } )
    };
};

////////////////////////



var TriggerKeyboard = function(event) {
    this.event = event;

    // serialized
    this.buttons = ko.observableArray([]);
    this.interactionType = ko.observable("Pressed");
};

TriggerKeyboard.prototype.type = "TriggerKeyboard";
TriggerKeyboard.prototype.label = "Keyboard Trigger";
TriggerKeyboard.prototype.buttonTypesArrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
TriggerKeyboard.prototype.buttonTypesNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
TriggerKeyboard.prototype.buttonTypesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
TriggerKeyboard.prototype.interactionTypes = ["Pressed", "PressDown", "PressUp"];

TriggerKeyboard.prototype.setPointers = function(entitiesArr) {

};

TriggerKeyboard.prototype.getParameterSpec = function() {
    return [
        'buttonPressed',
        'reactionTime'
    ];
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
    return trigger;
}
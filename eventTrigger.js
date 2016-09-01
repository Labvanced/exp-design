// � by Caspar Goeke and Holger Finger


////////////////////////

var TriggerMouse = function(event) {
    this.event = event;

    // serialized
    this.buttonType = ko.observable("Left");
    this.interactionType = ko.observable("Click");
    this.targets = ko.observableArray([]);

    var self= this;
    this.isValid = ko.computed(function() {
        if (self.event.trigger() && self.targets().length>0){
            return true
        }
        else{
            return false
        }
    }, this);


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

    var self= this;
    this.isValid = ko.computed(function() {
        if (self.event.trigger() && self.buttons().length>0){
            return true
        }
        else{
            return false
        }
    }, this);
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

var TriggerOnFrameStart = function(event) {
    this.event = event;

    // serialized
    this.timeDelayInMs = ko.observable(0);
};

TriggerOnFrameStart.prototype.type = "TriggerOnFrameStart";
TriggerOnFrameStart.prototype.label = "On Frame Start Trigger";

TriggerOnFrameStart.prototype.setPointers = function(entitiesArr) {

};

TriggerOnFrameStart.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerOnFrameStart.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerOnFrameStart.prototype.fromJS = function(data) {
    this.timeDelayInMs(data.timeDelayInMs);
    return this;
};

TriggerOnFrameStart.prototype.toJS = function() {
    return {
        type: this.type,
        timeDelayInMs: this.timeDelayInMs()
    };
};


////////////////////////



var TriggerOnFrameEnd = function(event) {
    this.event = event;

    // serialized
};

TriggerOnFrameEnd.prototype.type = "TriggerOnFrameEnd";
TriggerOnFrameEnd.prototype.label = "On Frame End Trigger";

TriggerOnFrameEnd.prototype.setPointers = function(entitiesArr) {

};

TriggerOnFrameEnd.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerOnFrameEnd.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerOnFrameEnd.prototype.fromJS = function(data) {
    return this;
};

TriggerOnFrameEnd.prototype.toJS = function() {
    return {
        type: this.type
    };
};


////////////////////////

var TriggerTimerReached = function(event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.timeInMs = ko.observable(0);
};

TriggerTimerReached.prototype.type = "TriggerTimerReached";
TriggerTimerReached.prototype.label = "Timer Reached Trigger";

TriggerTimerReached.prototype.setPointers = function(entitiesArr) {
    if (this.timerVar()){
        this.timerVar(entitiesArr.byId[this.timerVar()]);
    }
};

TriggerTimerReached.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerTimerReached.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerTimerReached.prototype.fromJS = function(data) {
    this.timerVar(data.timerVar);
    this.timeInMs(data.timeInMs);
    return this;
};

TriggerTimerReached.prototype.toJS = function() {
    var timerVarId = null;
    if (this.timerVar()) {
        timerVarId = this.timerVar().id();
    }

    return {
        type: this.type,
        timerVar: timerVarId,
        timeInMs: this.timeInMs()
    };
};


////////////////////////

var TriggerVariableValueChanged = function(event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
};

TriggerVariableValueChanged.prototype.type = "TriggerVariableValueChanged";
TriggerVariableValueChanged.prototype.label = "Variable Value Changed Trigger";

TriggerVariableValueChanged.prototype.setPointers = function(entitiesArr) {
    if (this.variable()){
        this.variable(entitiesArr.byId[this.variable()]);
    }
};

TriggerVariableValueChanged.prototype.reAddEntities = function(entitiesArr) {
    if (this.variable()){
        entitiesArr.push(this.variable());
    }
};

TriggerVariableValueChanged.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerVariableValueChanged.prototype.setupOnFrameView = function(frameView) {
    // TODO: to trigger call function this.event.triggerActions(variables)
};

TriggerVariableValueChanged.prototype.fromJS = function(data) {
    this.variable(data.variable);
    return this;
};

TriggerVariableValueChanged.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        variable: variableId
    };
};

///////////////////////////


function triggerFactory(event,type) {
    var trigger = new window[type](event);
    return trigger;
}
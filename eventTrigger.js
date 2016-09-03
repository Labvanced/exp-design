// � by Caspar Goeke and Holger Finger


////////////////////////

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
TriggerMouse.prototype.interactionTypes = ["Click", "PressDown", "PressUp", "Hover"];

TriggerMouse.prototype.isValid = function() {
    if (this.event.trigger() && this.targets().length>0){
        return true
    }
    else{
        return false
    }
};

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

TriggerMouse.prototype.setupOnFrameView = function(playerFrame) {

    var self = this;

    switch (this.interactionType()){
        case "Click":


            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];

                if (this.buttonType() == "Left"){
                    (function(event,target) {
                        $(playerFrame.frameView.viewElements.byId[target.id()].div).click(function(ev) {
                            self.event.triggerActions([target.name(),playerFrame.getFrameTime()]);
                        });
                    })(event,target);
                }

                else if (this.buttonType() == "Right"){
                    (function(event,target) {
                        $(playerFrame.frameView.viewElements.byId[target.id()].div).contextmenu(function(ev) {
                            self.event.triggerActions([target.name(),playerFrame.getFrameTime()]);
                        });
                    })(event,target);
                }
            }
            break;


        case "PressDown":
            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function(event,target) {
                    $(playerFrame.frameView.viewElements.byId[target.id()].div).on('mousedown',function(ev) {
                        if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                            self.event.triggerActions([target.name(),playerFrame.getFrameTime()]);
                        }
                    });
                })(event,target);
            }
            break;

        case "PressUp":
            for (var i = 0; i<this.targets().length;i++){
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function(event,target) {
                    $(playerFrame.frameView.viewElements.byId[target.id()].div).mouseup(function(ev) {
                        if ((self.buttonType() == "Left" && ev.button==0) || (self.buttonType() == "Right" && ev.button==2)){
                            self.event.triggerActions([target.name(),playerFrame.getFrameTime()]);
                        }
                    });
                })(event,target);
            }
            break;

        case "Hover":
            for (var i = 0; i < this.targets().length; i++) {
                var target = this.targets()[i];
                // closure to make event persistent over loop:
                (function (event, target) {
                    $(playerFrame.frameView.viewElements.byId[target.id()].div).mouseover(function (ev) {
                        self.event.triggerActions([target.name(), playerFrame.getFrameTime()]);
                    });
                })(event, target);
            }
            break;

    }





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
TriggerKeyboard.prototype.buttonTypesArrows = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];
TriggerKeyboard.prototype.buttonTypesNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
TriggerKeyboard.prototype.buttonTypesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
TriggerKeyboard.prototype.buttonTypesSpecial= ["Space","Enter","Ctrl","Tab","Shift"];
TriggerKeyboard.prototype.interactionTypes = ["PressDown", "PressUp"];

TriggerKeyboard.prototype.buttonTypesArrowsCode = [37,38,39,40];
TriggerKeyboard.prototype.buttonTypesNumbersCode = [48,49,50,51,52,53,54,55,56,57];
TriggerKeyboard.prototype.buttonTypesLettersCode = [65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90];
TriggerKeyboard.prototype.buttonTypesSpecialCode= [32,13,17,9,16];


TriggerKeyboard.prototype.isValid = function() {
    if (this.event.trigger() && this.buttons().length>0){
        return true;
    }
    else{
        return false;
    }
};

TriggerKeyboard.prototype.getKeys = function() {
    this.allKeys = this.buttonTypesSpecial.concat(this.buttonTypesLetters.concat(this.buttonTypesArrows.concat(this.buttonTypesNumbers)));
    this.allKeysCode = this.buttonTypesSpecialCode.concat(this.buttonTypesLettersCode.concat(this.buttonTypesArrowsCode.concat(this.buttonTypesNumbersCode)));

    this.validKeyCodes = [];
    this.validKeys = this.buttons();
    for (var i = 0; i<this.buttons().length; i++){
        var index =  this.allKeys.indexOf(this.validKeys[i]);
        this.validKeyCodes.push(this.allKeysCode[index]);
    }
};

TriggerKeyboard.prototype.setPointers = function(entitiesArr) {

};

TriggerKeyboard.prototype.getParameterSpec = function() {
    return [
        'buttonPressed',
        'reactionTime'
    ];
};

TriggerKeyboard.prototype.setupOnFrameView = function(playerFrame) {
    // TODO: to trigger call function this.event.triggerActions(variables)

    var self =this;

    if (this.interactionType() == "PressDown"){
        (function(event) {
            self.getKeys();
            $(document).on("keydown", function (ev){
                var key = self.validKeyCodes.indexOf(ev.keyCode);
                if (key>=0){
                    self.event.triggerActions([self.validKeys[key],playerFrame.getFrameTime()]);
                }

            });
        })(event);
    }

    else if (this.interactionType() == "PressUp"){
        (function(event) {
            self.getKeys();
            $(document).on("keyup", function (ev){
                var key = self.validKeyCodes.indexOf(ev.keyCode);
                if (key>=0){
                    self.event.triggerActions([self.validKeys[key],playerFrame.getFrameTime()]);
                }
            });
        })(event);
    }
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

TriggerOnFrameStart.prototype.isValid = function() {
    return true;
};

TriggerOnFrameStart.prototype.setPointers = function(entitiesArr) {

};

TriggerOnFrameStart.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerOnFrameStart.prototype.setupOnFrameView = function(playerFrame) {
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

TriggerOnFrameEnd.prototype.isValid = function() {
    return true;
};

TriggerOnFrameEnd.prototype.setPointers = function(entitiesArr) {

};

TriggerOnFrameEnd.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerOnFrameEnd.prototype.setupOnFrameView = function(playerFrame) {
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

TriggerTimerReached.prototype.isValid = function() {
    return true;
};

TriggerTimerReached.prototype.setPointers = function(entitiesArr) {
    if (this.timerVar()){
        this.timerVar(entitiesArr.byId[this.timerVar()]);
    }
};

TriggerTimerReached.prototype.getParameterSpec = function() {
    return [
    ];
};

TriggerTimerReached.prototype.setupOnFrameView = function(playerFrame) {
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

TriggerVariableValueChanged.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'Trigger On Variable Change');
};

TriggerVariableValueChanged.prototype.isValid = function() {
    return true;
};

TriggerVariableValueChanged.prototype.setPointers = function(entitiesArr) {
    if (this.variable()){
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
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

TriggerVariableValueChanged.prototype.setupOnFrameView = function(playerFrame) {
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
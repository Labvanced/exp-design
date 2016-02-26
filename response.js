// � by Caspar Goeke and Holger Finger


var Response= function(parent) {
    var self = this;

    this.parent = parent;

    // serialized
    this.type = "Response";
    this.responseType = ko.observable("mouse"); // or mouse or ...
    this.responseKey = ko.observable("leftClick"); // leftArrow or leftClick or RightClick...
    this.onset = ko.observable(0);
    this.onsetEnabled = ko.observable(true);
    this.offset = ko.observable(0);
    this.offsetEnabled = ko.observable(true);
    this.action = ko.observable(null); // default is no action

    // helpers:
    this.isKeyboardResponse = ko.computed(function(){
        return (self.responseType() == "keyboard");
    }, this);
    this.isMouseResponse = ko.computed(function(){
        return (self.responseType() == "mouse");
    }, this);
    this.stimulusOffset= ko.computed(function(){
        return (self.responseType() == "stimulusOff");
    }, this);
    this.stimulusOnset= ko.computed(function(){
        return (self.responseType() == "stimulusOn");
    }, this);

    this.actionType = ko.pureComputed({
        read: function () {
            if (self.action()) {
                return self.action().type;
            }
            else {
                return "undefined";
            }
        },
        write: function (value) {
            if (value === "undefined"){
                self.action(null);
            }
            else if (value == "ActionChangeVar"){
                self.action(new ActionChangeVar(self));
            }
            else if (value == "ActionChangeProp"){
                self.action(new ActionChangeProp(self));
            }
            else if (value == "ActionRecordRespTime"){
                self.action(new ActionRecordRespTime(self));
            }
            else if (value == "ActionNextFrame"){
                self.action(new ActionNextFrame(self));
            }
            else if (value == "ActionRecordElementTag"){
                self.action(new ActionRecordElementTag(self));
            }
            else if (value == "ActionRecordTagAndExitFrame"){
                self.action(new ActionRecordTagAndExitFrame(self));
            }
        },
        owner: this
    });
};

Response.prototype.setPointers = function(entitiesArr) {
    this.action().setPointers(entitiesArr);
};

Response.prototype.fromJS = function(data) {
    var self = this;

    this.responseType(data.responseType);
    this.responseKey(data.responseKey);
    this.onset(data.onset);
    this.onsetEnabled(data.onsetEnabled);
    this.offset(data.offset);
    this.offsetEnabled(data.offsetEnabled);
    if (data.action){
        var action = actionFactory(self,data.action.type);
        action.fromJS(data.action);
        this.action(action);
    }

    return this;
};

Response.prototype.toJS = function() {
    if (this.action()){
        var actionData = this.action().toJS();
    }
    else {
        actionData = null;
    }

    return {
        type: this.type,
        responseType: this.responseType(),
        responseKey: this.responseKey(),
        onset: this.onset(),
        onsetEnabled: this.onsetEnabled(),
        offset: this.offset(),
        offsetEnabled: this.offsetEnabled(),
        action: actionData
    };
};


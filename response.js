// � by Caspar Goeke and Holger Finger

/**
 * @deprecated
 * @param parent
 * @constructor
 */
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
            else if (value == "ActionModifyVariable"){
                self.action(new ActionModifyVariable(self));
            }
            else if (value == "ActionSetElementProp"){
                self.action(new ActionSetElementProp(self));
            }
            else if (value == "ActionRecordRespTime"){
                self.action(new ActionRecordRespTime(self));
            }
            else if (value == "ActionJumpTo"){
                self.action(new ActionJumpTo(self));
            }
            else if (value == "ActionRecord"){
                self.action(new ActionRecord(self));
            }
            else if (value == "ActionRecordTagAndExitFrame"){
                self.action(new ActionRecordTagAndExitFrame(self));
            }
        },
        owner: this
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
Response.prototype.setPointers = function(entitiesArr) {
    if (this.action()) {
        this.action().setPointers(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {Response}
 */
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
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


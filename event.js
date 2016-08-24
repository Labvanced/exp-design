// � by Caspar Goeke and Holger Finger


var Event= function(parent) {
    var self = this;

    this.parent = parent;

    // serialized
    this.id = ko.observable(guid());
    this.type = "Event";
    this.trigger = ko.observable(null);
    this.requirement = ko.observable(null);
    this.actions = ko.observableArray([]);
    this.name =  ko.observable(null);
};

Event.prototype.setPointers = function(entitiesArr) {
    this.trigger().setPointers();
    if (this.requirement()) {
        this.requirement().setPointers();
    }
    var actions = this.actions();
    for (var i=1; i<actions.length; i++) {
        actions[i].setPointers(entitiesArr);
    }
};

Event.prototype.triggerActions = function(parameters) {
    if (this.requirement()!=null || this.requirement().checkIfTrue()) {
        this.runActions(parameters)
    }
};

Event.prototype.runActions = function(variables) {
    var actions = this.actions();
    for (var i=1; i<actions.length; i++) {
        actions[i].run(parameters);
    }
};

Event.prototype.fromJS = function(data) {
    var self = this;

    this.id(data.id);
    this.name(data.name);

    var trigger = triggerFactory(self, data.trigger.type);
    trigger.fromJS(data.trigger);
    this.trigger(trigger);

    if (data.requirement) {
        var requirement = requirementFactory(self, data.requirement.type);
        requirement.fromJS(data.requirement);
        this.requirement(requirement);
    }

    var actions = [];
    for (var i=1; i<data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.action);
        actions.push(action)
    }
    this.actions(actions);

    return this;
};

Event.prototype.toJS = function() {
    var actions = this.actions();
    var actionData = [];
    for (var i=0; i<actions.length; i++) {
        actionData.push(actions[i].toJS());
    }

    return {
        id: this.id(),
        name:this.name(),
        type: this.type,
        trigger: this.trigger().toJS(),
        requirement: this.requirement(),
        actions: actionData
    };
};


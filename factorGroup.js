// � by Caspar Goeke and Holger Finger

var FactorGroup= function(expData, task) {
    var self = this;

    this.expData = expData;
    this.task = task;
    this.factorGroups=  this.task.factorGroups;

    this.name = "factor_group" + (this.factorGroups().length+1);
    this.factors = ko.observableArray([]);

    this.editName =  ko.observable(false);
    this.subLevelEdit = ko.observable(false);
    this.value = ko.observable(null);
};


FactorGroup.prototype.addFactor = function(facGroupIdx) {


    var newName = "factor_" + (this.factors().length+1);
    var globalVar = (new GlobalVar(this.expData)).initProperties('categorical', 'trial', 'nominal', newName);
    globalVar.isFactor(true);
    globalVar.isInteracting(true);
    globalVar.addLevel();

    this.factors.push(globalVar);

    this.expData.entities.push(globalVar);
    return globalVar;
};

FactorGroup.prototype.renameFactor= function(idx,flag) {

    if (flag == "true"){
        this.factors()[idx].editName(true);
    }
    else if (flag == "false"){
        this.factors()[idx].editName(false);
    }
};


FactorGroup.prototype.removeFactor = function(idx) {


     this.factors.splice(idx,1);
};



FactorGroup.prototype.fromJS = function(data) {
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
    for (var i=0; i<data.actions.length; i++) {
        var action = actionFactory(self, data.actions[i].type);
        action.fromJS(data.actions[i]);
        actions.push(action)
    }
    this.actions(actions);

    return this;
};

FactorGroup.prototype.toJS = function() {
    var actions = this.actions();
    var actionData = [];
    for (var i=0; i<actions.length; i++) {
        actionData.push(actions[i].toJS());
    }

    var req = null;
    if (this.requirement()) {
        req = this.requirement().toJS();
    }

    return {
        id: this.id(),
        name:this.name(),
        type: this.type,
        trigger: this.trigger().toJS(),
        requirement: req,
        actions: actionData
    };
};

// � by Caspar Goeke and Holger Finger

////////////////////////

var RequirementOR = function(event) {
    this.event = event;

    // serialized
    this.childRequirements = ko.observableArray([]);
};

RequirementOR.prototype.type = "RequirementOR";
RequirementOR.prototype.label = "OR";

RequirementOR.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

RequirementOR.prototype.checkIfTrue = function(parameters) {
    var childRequirements = this.childRequirements();
    for (var i=0; i<childRequirements.length; i++) {
        if (childRequirements[i].checkIfTrue(parameters)){
            return true;
        }
    }
    return false;
};

RequirementOR.prototype.fromJS = function(data) {
    var childRequirements = [];
    for (var i=1; i<data.childRequirements.length; i++) {
        var requirement = requirementFactory(this.event, data.childRequirements[i].type);
        requirement.fromJS(data.childRequirements[i]);
        childRequirements.push(requirement);
    }
    this.childRequirements(childRequirements);
    return this;
};

RequirementOR.prototype.toJS = function() {
    var data = {
        type: this.type,
        childRequirements: jQuery.map( this.childRequirements(), function( req ) { return req.toJS(); } )
    };
    return data;
};


///////////////////////


var RequirementAND = function(event) {
    this.event = event;

    // serialized
    this.childRequirements = ko.observableArray([]);
};

RequirementAND.prototype.type = "RequirementAND";
RequirementAND.prototype.label = "OR";

RequirementAND.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

RequirementAND.prototype.checkIfTrue = function(parameters) {
    var childRequirements = this.childRequirements();
    for (var i=1; i<childRequirements.length; i++) {
        if (!childRequirements[i].checkIfTrue(parameters)){
            return false;
        }
    }
    return true;
};

RequirementAND.prototype.fromJS = function(data) {
    var childRequirements = [];
    for (var i=0; i<data.childRequirements.length; i++) {
        var requirement = requirementFactory(this.event, data.childRequirements[i].type);
        requirement.fromJS(data.childRequirements[i]);
        childRequirements.push(requirement);
    }
    this.childRequirements(childRequirements);
    return this;
};

RequirementAND.prototype.toJS = function() {
    var data = {
        type: this.type,
        childRequirements: jQuery.map( this.childRequirements(), function( req ) { return req.toJS(); } )
    };
    return data;
};


////////////////////////////

var RequirementVariableHasValue = function(event) {
    this.event = event;

    // serialized
    this.comparisonType = ko.observable("==");
    this.operandLeft = ko.observable(new OperandVariable(event));
    this.operandRight = ko.observable(new OperandVariable(event));
};

RequirementVariableHasValue.prototype.type = "RequirementVariableHasValue";
RequirementVariableHasValue.prototype.label = "Variable Has Value";
RequirementVariableHasValue.prototype.comparisonTypes = ["==", "!=", ">", "<", ">=", "<="];

RequirementVariableHasValue.prototype.setPointers = function(entitiesArr) {
    if (this.operandLeft()){
        this.operandLeft().setPointers(entitiesArr);
    }
    if (this.operandRight()){
        this.operandRight().setPointers(entitiesArr);
    }
};

RequirementVariableHasValue.prototype.checkIfTrue = function(parameters) {

    var operandLeftValue = this.operandLeft().getValue(parameters);
    var operandRightValue = this.operandRight().getValue(parameters);

    switch(this.comparisonType) {
        case "==":
            return (operandLeftValue == operandRightValue);
        case "!=":
            return (operandLeftValue != operandRightValue);
        case ">":
            return (operandLeftValue > operandRightValue);
        case "<":
            return (operandLeftValue < operandRightValue);
        case ">=":
            return (operandLeftValue >= operandRightValue);
        case "<=":
            return (operandLeftValue <= operandRightValue);
    }
    return true;
};

RequirementVariableHasValue.prototype.fromJS = function(data) {
    this.comparisonType(data.comparisonType);
    if (data.operandLeft) {
        this.operandLeft(new OperandVariable(this.event));
        this.operandLeft().fromJS(data.operandLeft);
    }
    if (data.operandRight) {
        this.operandRight(new OperandVariable(this.event));
        this.operandRight().fromJS(data.operandRight);
    }
    return this;
};

RequirementVariableHasValue.prototype.toJS = function() {
    var data = {
        type: this.type,
        comparisonType: this.comparisonType(),
        operandLeft: this.operandLeft(),
        operandRight: this.operandRight()
    };

    if (data.operandLeft){
        data.operandLeft = data.operandLeft.toJS();
    }
    if (data.operandRight){
        data.operandRight = data.operandRight.toJS();
    }

    return data;
};

//////////////////////



var OperandVariable = function(event) {
    this.event = event;

    // serialized
    this.operandType = ko.observable('undefined');
    this.operandValueOrObject = ko.observable(null);
};

OperandVariable.prototype.type = "OperandVariable";
OperandVariable.prototype.label = "Operand";
OperandVariable.prototype.operandTypes = ['undefined', "variable", "triggerParameter", "constantString", "constantNumeric"];

OperandVariable.prototype.setPointers = function(entitiesArr) {
    if (this.operandType() == "variable"){
        this.operandValueOrObject(entitiesArr.byId[this.operandValueOrObject()]);
    }
};

OperandVariable.prototype.getValue = function(parameters) {

    var value = this.operandValueOrObject();

    switch(this.operandType()) {
        case "undefined":
            console.error("operand is undefined");
            return null;
        case "variable":
            return value.getValue();
        case "triggerParameter":
            return parameters[value];
        case "constantString":
            if (typeof value != "string") {
                console.error("operand is not a string");
            }
            return value;
        case "constantNumeric":
            if (typeof value != "number") {
                console.error("operand is not a number");
            }
            return value;
    }
};

OperandVariable.prototype.fromJS = function(data) {
    this.operandType(data.operandType);
    this.operandValueOrObject(data.operandValueOrObject);
    return this;
};

OperandVariable.prototype.toJS = function() {
    var data = {
        type: this.type,
        operandType: this.operandType(),
        operandValueOrObject: this.operandValueOrObject()
    };
    if (data.operandType == "variable" && data.operandValueOrObject) {
        data.operandValueOrObject = data.operandValueOrObject.id();
    }
    return data;
};


///////////////////////


function requirementFactory(event,type) {
    var requirement = new window[type](event);
    return requirement;
}
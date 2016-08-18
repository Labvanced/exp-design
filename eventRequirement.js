// � by Caspar Goeke and Holger Finger

var RequirementVariableHasValue = function(event) {
    this.event = event;

    // serialized
    this.comparisonType = ko.observable("==");
    this.operandLeftType = ko.observable("undefined");
    this.operandLeft = ko.observable(null);
    this.operandRightType = ko.observable("undefined");
    this.operandRight = ko.observable(null);

};

RequirementVariableHasValue.prototype.type = "RequirementVariableHasValue";
RequirementVariableHasValue.prototype.label = "Variable Has Value";
RequirementVariableHasValue.prototype.comparisonTypes = ["==", "!=", ">", "<", ">=", "<="];
RequirementVariableHasValue.prototype.operandTypes = ["undefined", "variable", "triggerParameter", "constantString", "constantNumeric"];

RequirementVariableHasValue.prototype.setPointers = function(entitiesArr) {
    if (this.operandLeftType() == "variable"){
        this.operandLeft(entitiesArr.byId[this.operandLeft()]);
    }
    if (this.operandRightType() == "variable"){
        this.operandRight(entitiesArr.byId[this.operandRight()]);
    }
};

RequirementVariableHasValue.prototype.operandToValue = function(operandType, operand, parameters) {
    switch(operandType) {
        case "undefined":
            console.error("operand is undefined");
            return null;
        case "variable":
            return operand.value();
        case "triggerParameter":
            return parameters[operand];
        case "constantString":
            return operand;
        case "constantNumeric":
            return operand;
    }
};

RequirementVariableHasValue.prototype.checkIfTrue = function(parameters) {

    var operandLeftValue = this.operandToValue(this.operandLeftType, this.operandLeft, parameters);
    var operandRightValue = this.operandToValue(this.operandRightType, this.operandRight, parameters);

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
    this.operandLeftType(data.operandLeftType);
    this.operandLeft(data.operandLeft);
    this.operandRightType(data.operandRightType);
    this.operandRight(data.operandRight);
    return this;
};

RequirementVariableHasValue.prototype.toJS = function() {
    var data = {
        type: this.type,
        comparisonType: this.comparisonType(),
        operandLeftType: this.operandLeftType(),
        operandLeft: this.operandLeft(),
        operandRightType: this.operandRightType(),
        operandRight: this.operandRight()
    };

    if (data.operandLeftType == "variable"){
        data.operandLeft = data.operandLeft.id();
    }
    if (data.operandRightType == "variable"){
        data.operandRight = data.operandRight.id();
    }

    return data;
};

////////////////////////

var RequirementOR = function(event) {
    this.event = event;

    // serialized
    this.childRequirements = ko.observableArray([]);
};

RequirementOR.prototype.type = "RequirementOR";
RequirementOR.prototype.label = "OR";

RequirementOR.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.childRequirements, function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

RequirementOR.prototype.checkIfTrue = function(parameters) {
    var childRequirements = this.childRequirements();
    for (var i=1; i<childRequirements.length; i++) {
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
    jQuery.each( this.childRequirements, function( index, elem ) {
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
    for (var i=1; i<data.childRequirements.length; i++) {
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


///////////////////////


function requirementFactory(event,type) {
    var requirement = new window[type](event);
    // if (type == "RequirementVariableHasValue"){
    //     var requirement = new RequirementVariableHasValue(event);
    // }
    // else if(type == "RequirementOR") {
    //     var requirement = new RequirementOR(event);
    // }
    // else if(type == "RequirementAND") {
    //     var requirement = new RequirementAND(event);
    // }
    return requirement;
}
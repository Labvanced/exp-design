// � by Caspar Goeke and Holger Finger

////////////////////////


/**
 * This class stores several subrequirements and combines them with a logical OR operation.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var RequirementOR = function(event) {
    this.event = event;

    // serialized
    this.childRequirements = ko.observableArray([]);
};

RequirementOR.prototype.type = "RequirementOR";
RequirementOR.prototype.label = "OR";

/**
 * checks if either one of the sub-requriements is true.
 *
 * @param {object} parameters - the parameters passed by the trigger.
 * @returns {boolean}
 */
RequirementOR.prototype.checkIfTrue = function(parameters) {
    var childRequirements = this.childRequirements();
    for (var i=0; i<childRequirements.length; i++) {
        if (childRequirements[i].checkIfTrue(parameters)){
            return true;
        }
    }
    return false;
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementOR.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementOR.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, req ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (req.reAddEntities)
            req.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementOR}
 */
RequirementOR.prototype.fromJS = function(data) {
    var childRequirements = [];
    for (var i=0; i<data.childRequirements.length; i++) {
        var requirement = requirementFactory(this.event, data.childRequirements[i].type);
        requirement.fromJS(data.childRequirements[i]);
        childRequirements.push(requirement);
    }
    this.childRequirements(childRequirements);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RequirementOR.prototype.toJS = function() {
    var data = {
        type: this.type,
        childRequirements: jQuery.map( this.childRequirements(), function( req ) { return req.toJS(); } )
    };
    return data;
};


///////////////////////


/**
 * This class stores several subrequirements and combines them with a logical AND operation.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var RequirementAND = function(event) {
    this.event = event;

    // serialized
    this.childRequirements = ko.observableArray([]);
    this.childRequirements.subscribe(function(newVal) {
        var test = 1;
    });
};

RequirementAND.prototype.type = "RequirementAND";
RequirementAND.prototype.label = "AND";

/**
 * checks if all the sub-requriements are true.
 *
 * @param {object} parameters - the parameters passed by the trigger.
 * @returns {boolean}
 */
RequirementAND.prototype.checkIfTrue = function(parameters) {
    var childRequirements = this.childRequirements();
    for (var i=0; i<childRequirements.length; i++) {
        if (!childRequirements[i].checkIfTrue(parameters)){
            return false;
        }
    }
    return true;
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementAND.prototype.setPointers = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementAND.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.childRequirements(), function( index, req ) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (req.reAddEntities)
            req.reAddEntities(entitiesArr);
    } );
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementAND}
 */
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RequirementAND.prototype.toJS = function() {
    var data = {
        type: this.type,
        childRequirements: jQuery.map( this.childRequirements(), function( req ) { return req.toJS(); } )
    };
    return data;
};


////////////////////////////



/**
 * This class is a requirement that checks a boolean expression.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
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

/**
 * checks if the boolean expression evaluates to true.
 *
 * @param {object} parameters - the parameters passed by the trigger.
 * @returns {boolean}
 */
RequirementVariableHasValue.prototype.checkIfTrue = function(parameters) {

    var operandLeftValue = this.operandLeft().getValue(parameters);
    var operandRightValue = this.operandRight().getValue(parameters);

    switch(this.comparisonType()) {
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

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementVariableHasValue.prototype.setPointers = function(entitiesArr) {
    if (this.operandLeft()){
        this.operandLeft().setPointers(entitiesArr);
    }
    if (this.operandRight()){
        this.operandRight().setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementVariableHasValue.prototype.reAddEntities = function(entitiesArr) {
    if (this.operandLeft() && this.operandLeft().reAddEntities){
        this.operandLeft().reAddEntities(entitiesArr);
    }
    if (this.operandRight() && this.operandRight().reAddEntities){
        this.operandRight().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementVariableHasValue}
 */
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
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


/**
 * This class represents an operand that can be used in logical or boolean expressions. The operand could be either a
 * globalVar, but also object properties or trigger parameters or constants.
 *
 * @param {Event} event - the parent event where this requirements is used.
 * @constructor
 */
var OperandVariable = function(event) {
    this.event = event;

    // serialized
    this.operandType = ko.observable('undefined');
    this.operandValueOrObject = ko.observable(null);
};

OperandVariable.prototype.type = "OperandVariable";
OperandVariable.prototype.label = "Operand";
OperandVariable.prototype.operandTypes = ['undefined', "arithmetic", "variable", "objProperty", "eventParam", "constantString", "constantNumeric", "constantBoolean"];
OperandVariable.prototype.arithmeticOpTypes = ["+", "-", "*", "/", "%"];

/**
 * This function is used to associate a global variable with this operand, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
OperandVariable.prototype.setVariableBackRef = function(variable){
    variable.addBackRef(this, this.event, false, true, 'In Boolean Expression');
};

/**
 * calculates the current value of the operand. This is used in the player to evaluate logical or boolean expressions.
 *
 * @param {object} parameters - the values that are passed by the trigger.
 * @returns {number | string}
 */
OperandVariable.prototype.getValue = function(parameters) {

    var value = this.operandValueOrObject();

    switch(this.operandType()) {
        case "undefined":
            console.error("operand is undefined");
            return null;
        case "arithmetic":
            var left = value.left.getValue();
            var right = value.right.getValue();

            // convert to value if these are GlobalVarValueInstances:
            if (left.hasOwnProperty('parentVar')){
                left = left.toJS();
            }
            if (right.hasOwnProperty('parentVar')){
                right = right.toJS();
            }

            if (value.op=="+") {
                return left + right;
            }
            else if (value.op=="-") {
                return left - right;
            }
            else if (value.op=="*") {
                return left * right;
            }
            else if (value.op=="/") {
                return left / right;
            }
            else if (value.op=="%") {
                return left % right;
            }
            return null;
        case "variable":
            return value.getValue();
        case "objProperty":
            return this.operandValueOrObject().getValue();
        case "frameTime":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getFrameTime();
        case "eventParam":
            var paramNames = this.event.trigger().getParameterSpec();
            var paramIdx = paramNames.indexOf(value);
            return parameters[paramIdx];
        case "constantString":
            if (typeof value != "string") {
                console.error("operand is not a string");
            }
            return value;
        case "constantNumeric":
            if (typeof value !== "number") {
                value = parseFloat(value);
                if (isNaN(value)) {
                    console.error("operand is not a number");
                }
            }
            return value;
        case "constantBoolean":
            if (typeof value !== "boolean") {
                if (typeof value === "string") {
                    value = (value === 'true' || value === 'TRUE' || value === 'True');
                }
                if (isNaN(value)) {
                    console.error("operand is not a boolean");
                }
            }
            return value;
    }
};



OperandVariable.prototype.removeVariable = function(globalVar) {
    if (this.operandType() === "variable") {
        this.operandValueOrObject(null);
    }
};



/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
OperandVariable.prototype.setPointers = function(entitiesArr) {
    if (this.operandType() == "variable"){
        if (this.operandValueOrObject()) {
            var globVar = entitiesArr.byId[this.operandValueOrObject()];
            if (globVar) {
                this.operandValueOrObject(globVar);
                this.setVariableBackRef(globVar);
            }
            else {
                this.operandValueOrObject(null);
            }
        }
    }
    if (this.operandType() == "objProperty") {
        this.operandValueOrObject().setPointers(entitiesArr);
    }
    if (this.operandType() == "arithmetic") {
        this.operandValueOrObject().left.setPointers(entitiesArr);
        this.operandValueOrObject().right.setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
OperandVariable.prototype.reAddEntities = function(entitiesArr) {
    if (this.operandType() == "variable"){
        if (this.operandValueOrObject()) {
            if (!entitiesArr.byId.hasOwnProperty(this.operandValueOrObject().id())) {
                entitiesArr.push(this.operandValueOrObject());
            }
        }
    }
    if (this.operandType() == "arithmetic"){
        this.operandValueOrObject().left.reAddEntities(entitiesArr);
        this.operandValueOrObject().right.reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {OperandVariable}
 */
OperandVariable.prototype.fromJS = function(data) {
    this.operandType(data.operandType);
    if (data.operandType == "objProperty") {
        var refToObjectProperty = new RefToObjectProperty(this.event);
        refToObjectProperty.fromJS(data.operandValueOrObject);
        this.operandValueOrObject(refToObjectProperty);
    }
    else if (data.operandType == "arithmetic") {
        var left = new OperandVariable(this.event);
        var right = new OperandVariable(this.event);
        left.fromJS(data.operandValueOrObject.left);
        right.fromJS(data.operandValueOrObject.right);
        this.operandValueOrObject({
            left: left,
            right: right,
            op: data.operandValueOrObject.op
        });
    }
    else {
        this.operandValueOrObject(data.operandValueOrObject);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
OperandVariable.prototype.toJS = function() {
    var data = {
        type: this.type,
        operandType: this.operandType(),
        operandValueOrObject: this.operandValueOrObject()
    };
    if (data.operandType == "variable" && data.operandValueOrObject) {
        if (data.operandValueOrObject) {
            data.operandValueOrObject = data.operandValueOrObject.id();
        }
    }
    if (data.operandType == "objProperty") {
        if (data.operandValueOrObject) {
            data.operandValueOrObject = data.operandValueOrObject.toJS();
        }
    }
    if (data.operandType == "arithmetic") {
        data.operandValueOrObject = {
            left: data.operandValueOrObject.left.toJS(),
            right: data.operandValueOrObject.right.toJS(),
            op: data.operandValueOrObject.op
        };
    }
    return data;
};

///////////////////////

/**
 * This class represents a specific property of a specific stimulus element. It can be used as an operand variable.
 *
 * @param {Event} event - the parent event where this is used.
 * @constructor
 */
var RefToObjectProperty = function(event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.property = ko.observable(null); // sub properties are separated by dot (.)
};

/**
 * calculate the current value of the object property.
 *
 * @returns {number | string}
 */
RefToObjectProperty.prototype.getValue = function() {

    var propertyPath = this.property().split(".");
    var target = this.target();

    for (var k=0; k < propertyPath.length-1; k++) {
        target = target[propertyPath[k]];
        if (ko.isObservable(target)) {
            target = target();
        }
    }
    return target.modifier().selectedTrialView[propertyPath[propertyPath.length-1]]();

};

/**
 * set the value of the object property
 */
RefToObjectProperty.prototype.setValue = function(newVal) {

    var propertyPath = this.property().split(" ");
    var target = this.target();

    for (var k=0; k < propertyPath.length-1; k++) {
        target = target[propertyPath[k]];
        if (ko.isObservable(target)) {
            target = target();
        }
    }
    target.modifier().selectedTrialView[propertyPath[propertyPath.length-1]](newVal);

};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RefToObjectProperty.prototype.setPointers = function(entitiesArr) {
    if (this.target()) {
        var target = entitiesArr.byId[this.target()];
        this.target(target);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RefToObjectProperty}
 */
RefToObjectProperty.prototype.fromJS = function(data) {
    this.target(data.target);
    this.property(data.property);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RefToObjectProperty.prototype.toJS = function() {
    var target = this.target();
    if (target) { // convert to id if target is set
        target = target.id();
    }
    return {
        target: target,
        property: this.property()
    };
};

///////////////////////

/**
 * Factory method that creates a new requirement based on the given requirement type.
 *
 * @param {Event} event - the parent event of the new action.
 * @param {string} type - the type of the Requirement (i.e. "RequirementOR")
 * @returns {Requirement}
 */
function requirementFactory(event,type) {
    var requirement = new window[type](event);
    return requirement;
}
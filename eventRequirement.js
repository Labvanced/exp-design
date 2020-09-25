// � by Caspar Goeke and Holger Finger

////////////////////////


/**
 * This class stores several subrequirements and combines them with a logical OR operation.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var RequirementOR = function (event) {
    this.event = event;
    this.parent = ko.observable(null);

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
RequirementOR.prototype.checkIfTrue = function (parameters) {
    var childRequirements = this.childRequirements();
    for (var i = 0; i < childRequirements.length; i++) {
        if (childRequirements[i].checkIfTrue(parameters)) {
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
RequirementOR.prototype.setPointers = function (entitiesArr) {
    jQuery.each(this.childRequirements(), function (index, elem) {
        elem.setPointers(entitiesArr);
        elem.setParent(self);
    });
};


RequirementOR.prototype.setParent = function (parent) {
    if (parent) {
        this.parent(parent);
    }
    var self = this;
    jQuery.each(this.childRequirements(), function (index, elem) {
        elem.setParent(self);
    });
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementOR.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.childRequirements(), function (index, req) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (req.reAddEntities)
            req.reAddEntities(entitiesArr);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementOR}
 */
RequirementOR.prototype.fromJS = function (data) {
    var childRequirements = [];
    for (var i = 0; i < data.childRequirements.length; i++) {
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
RequirementOR.prototype.toJS = function () {
    var data = {
        type: this.type,
        childRequirements: jQuery.map(this.childRequirements(), function (req) { return req.toJS(); })
    };
    return data;
};


///////////////////////


/**
 * This class stores several subrequirements and combines them with a logical AND operation.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var RequirementAND = function (event) {
    this.event = event;
    this.parent = ko.observable(null);

    // serialized
    this.childRequirements = ko.observableArray([]);
};

RequirementAND.prototype.type = "RequirementAND";
RequirementAND.prototype.label = "AND";

/**
 * checks if all the sub-requriements are true.
 *
 * @param {object} parameters - the parameters passed by the trigger.
 * @returns {boolean}
 */
RequirementAND.prototype.checkIfTrue = function (parameters) {
    var childRequirements = this.childRequirements();
    for (var i = 0; i < childRequirements.length; i++) {
        if (!childRequirements[i].checkIfTrue(parameters)) {
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
RequirementAND.prototype.setPointers = function (entitiesArr) {
    var self = this;
    jQuery.each(this.childRequirements(), function (index, elem) {
        elem.setPointers(entitiesArr);
        elem.setParent(self);
    });
};

RequirementAND.prototype.setParent = function (parent) {
    if (parent) {
        this.parent(parent);
    }

    var self = this;
    jQuery.each(this.childRequirements(), function (index, elem) {
        elem.setParent(self);
    });
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementAND.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.childRequirements(), function (index, req) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (req.reAddEntities)
            req.reAddEntities(entitiesArr);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementAND}
 */
RequirementAND.prototype.fromJS = function (data) {
    var childRequirements = [];
    for (var i = 0; i < data.childRequirements.length; i++) {
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
RequirementAND.prototype.toJS = function () {
    var data = {
        type: this.type,
        childRequirements: jQuery.map(this.childRequirements(), function (req) { return req.toJS(); })
    };
    return data;
};


////////////////////////////



/**
 * This class is a requirement that checks a boolean expression.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var RequirementVariableHasValue = function (event) {
    this.event = event;
    this.parent = ko.observable(null);

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
RequirementVariableHasValue.prototype.checkIfTrue = function (parameters) {

    var operandLeftValue = this.operandLeft().getRawValue(parameters);
    var operandRightValue = this.operandRight().getRawValue(parameters);

    if ($.isNumeric(operandLeftValue)) {
        operandLeftValue = parseFloat(operandLeftValue);
    }
    if ($.isNumeric(operandRightValue)) {
        operandRightValue = parseFloat(operandRightValue);
    }

    switch (this.comparisonType()) {
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
RequirementVariableHasValue.prototype.setPointers = function (entitiesArr) {
    if (this.operandLeft()) {
        this.operandLeft().setPointers(entitiesArr);
    }
    if (this.operandRight()) {
        this.operandRight().setPointers(entitiesArr);
    }
};

RequirementVariableHasValue.prototype.setParent = function (parent) {
    this.parent(parent);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RequirementVariableHasValue.prototype.reAddEntities = function (entitiesArr) {
    if (this.operandLeft() && this.operandLeft().reAddEntities) {
        this.operandLeft().reAddEntities(entitiesArr);
    }
    if (this.operandRight() && this.operandRight().reAddEntities) {
        this.operandRight().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RequirementVariableHasValue}
 */
RequirementVariableHasValue.prototype.fromJS = function (data) {
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
RequirementVariableHasValue.prototype.toJS = function () {
    var data = {
        type: this.type,
        comparisonType: this.comparisonType(),
        operandLeft: this.operandLeft(),
        operandRight: this.operandRight()
    };

    if (data.operandLeft) {
        data.operandLeft = data.operandLeft.toJS();
    }
    if (data.operandRight) {
        data.operandRight = data.operandRight.toJS();
    }

    return data;
};

//////////////////////


/**
 * This class represents an operand that can be used in logical or boolean expressions. The operand could be either a
 * globalVar, but also object properties or trigger parameters or constants.
 *
 * @param {ExpEvent} event - the parent event where this requirements is used.
 * @constructor
 */
var OperandVariable = function (event) {
    this.event = event;

    // serialized
    this.operandType = ko.observable('undefined');
    this.operandValueOrObject = ko.observable(null);
    this.subParam = ko.observable(null);
};

OperandVariable.prototype.type = "OperandVariable";
OperandVariable.prototype.label = "Operand";

OperandVariable.prototype.nullaryOperandTypes = ['undefined', "variable", "objProperty", "eventParam", "constantString", "constantNumeric", "constantBoolean", "constantDate", "constantTime", "constantCategorical", "constantColor", "eyetracking"];
OperandVariable.prototype.unaryOperandTypes = ["abs", "round0decimal", "round1decimal", "round2decimals", "round3decimals", "floor", "ceil", "sqrt", "toLowercase", "toUppercase", "removeSpaces", "trimSpaces", "toLink"];
OperandVariable.prototype.binaryOperandTypes = ["arithmetic", "arrayvalue"];
OperandVariable.prototype.ternaryOperandTypes = ["strReplace", "dataframevalue"];
OperandVariable.prototype.operandTypes = OperandVariable.prototype.nullaryOperandTypes.concat(OperandVariable.prototype.unaryOperandTypes, OperandVariable.prototype.binaryOperandTypes, OperandVariable.prototype.ternaryOperandTypes);
OperandVariable.prototype.arithmeticOpTypes = ["+", "-", "*", "/", "%"];



/**
 * This function is used to associate a global variable with this operand, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
OperandVariable.prototype.setVariableBackRef = function (variable) {
    var self = this;
    variable.addBackRef(this, this.event, false, true, 'In Equation', function (globalVar) {
        self.removeVariable(globalVar);
    });
};

OperandVariable.prototype.convertToRawValue = function (value) {
    if (value != null) {
        if (value.hasOwnProperty('parentVar')) {
            value = value.toJS();
        }
    }
    return value;
}

/**
 * calculates the current value of the operand and returns it as a js primitive or object (i.e. not GlobalVarValue instance).
 *
 * @param {object} parameters - the values that are passed by the trigger.
 * @returns {number | string}
 */
OperandVariable.prototype.getRawValue = function (parameters) {
    return this.convertToRawValue(this.getValue(parameters));
}

/**
 * calculates the current value of the operand. This is used in the player to evaluate logical or boolean expressions.
 *
 * @param {object} parameters - the values that are passed by the trigger.
 * @returns {number | string | GlobalVarValue}
 */
OperandVariable.prototype.getValue = function (parameters) {

    var value = this.operandValueOrObject();

    var frameScale = 1.0;
    if (player.currentFrame.frameData instanceof FrameData) {
        frameScale = player.currentFrame.frameView.scale();
    }

    switch (this.operandType()) {
        case "undefined":
            console.error("operand is undefined");
            return null;
        case "arithmetic":
            var left = value.left.getRawValue(parameters);
            var right = value.right.getRawValue(parameters);
            if ($.isNumeric(right)) {
                right = parseFloat(right);
            }
            if ($.isNumeric(left)) {
                left = parseFloat(left);
            }

            if (value.op == "+") {
                return left + right;
            }
            else if (value.op == "-") {
                return left - right;
            }
            else if (value.op == "*") {
                return left * right;
            }
            else if (value.op == "/") {
                if (right == 0) {  // in oder to avoid NaN
                    return right;
                }
                else {
                    return left / right;
                }

            }
            else if (value.op == "%") {
                return left % right;
            }
            return null;
        case "arrayvalue":
            var arrVarValue = value.left.getValue(parameters);
            var arrIndex = value.right.getRawValue(parameters);
            if (!(arrVarValue instanceof GlobalVarValueArray)) {
                console.error("wrong array variable type");
                return null;
            }
            if ($.isNumeric(arrIndex)) {
                arrIndex = parseInt(arrIndex);
            }
            return arrVarValue.getValueAt(arrIndex);
        case "dataframevalue":
            var dfVarValue = value.param1.getValue(parameters);
            if (!(dfVarValue instanceof GlobalVarValueDataFrame)) {
                console.error("wrong dataframe variable");
                return null;
            }
            var rowIndex = value.param2.getRawValue(parameters);
            var colIndexOrName = value.param3.getRawValue(parameters);
            var value = dfVarValue.getValueAt(rowIndex, colIndexOrName);
            return value;
        case "variable":
            return value.value();
        case "objProperty":
            return this.operandValueOrObject().getValue();
        case "unixTimestamp":
            return new Date().getTime();
        case "frameTime":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getFrameTime();
        case "frameName":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getFrameName();
        case "MouseX":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getMouseX();
        case "MouseY":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getMouseY();
        case "MouseXY_Array":
            var playerFrame = this.event.parent.playerFrame;
            return playerFrame.getMouseXY_Array();
        case "eventParam":
            var paramNames = this.event.trigger().getParameterSpec();
            var paramIdx = paramNames.indexOf(value);
            return parameters[paramIdx];
        case "eyetracking":
            if (value === 'eyeLastCoordinateX') {
                return player.currentFrame.frameLastEyeCoordX;
            } else if (value === 'eyeLastCoordinateY') {
                return player.currentFrame.frameLastEyeCoordY;
            } else if (value === 'eyeLastCoordinateXYArr') {
                return [player.currentFrame.frameLastEyeCoordX, player.currentFrame.frameLastEyeCoordY];
            } else if (value === 'eyeErrorMain2D') {
                return player.eyetrackingCalibrationAccuracy.meanAbsErrorInPixels2D / frameScale;
            } else if (value === 'eyeErrorMainX') {
                return player.eyetrackingCalibrationAccuracy.meanAbsErrorInPixelsX / frameScale;
            } else if (value === 'eyeErrorMainY') {
                return player.eyetrackingCalibrationAccuracy.meanAbsErrorInPixelsY / frameScale;
            } else if (value === 'eyeErrorTrial2D') {
                return player.eyetrackingValidationAccuracy.meanAbsErrorInPixels2D / frameScale;
            } else if (value === 'eyeErrorTrialX') {
                return player.eyetrackingValidationAccuracy.meanAbsErrorInPixelsX / frameScale;
            } else if (value === 'eyeErrorTrialY') {
                return player.eyetrackingValidationAccuracy.meanAbsErrorInPixelsY / frameScale;
            }
            else {
                return null;
            }
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

        case "constantDate":
            var regexp = new RegExp("\\d{4}-\\d{2}-\\d{2}");
            if (!(Array.isArray(value.match(regexp)))) {
                console.error("operand is not a Date");
            }
            return value;

        case "constantTime":
            var indSep = value.split(":");
            if (!(indSep.length == 2 && parseInt(indSep[0]) >= 0 && parseInt(indSep[0]) <= 23 && parseInt(indSep[1]) >= 0 && parseInt(indSep[1]) <= 59)) {
                console.error("operand is not a Time");
            }
            return value;
        case "constantColor":
            return value;
        case "constantCategorical":
            return this.subParam();

        case "toLowercase":
            var inputStrValue = value.left.getRawValue(parameters);
            if (typeof inputStrValue === 'string' || inputStrValue instanceof String) {
                return inputStrValue.toLowerCase();
            }
            else {
                return "";
            }
        case "toUppercase":
            var inputStrValue = value.left.getRawValue(parameters);
            if (typeof inputStrValue === 'string' || inputStrValue instanceof String) {
                return inputStrValue.toUpperCase();
            }
            else {
                return "";
            }
        case "removeSpaces":
            var inputStrValue = value.left.getRawValue(parameters);
            if (typeof inputStrValue === 'string' || inputStrValue instanceof String) {
                return inputStrValue.replace(/\s/g, '')
            }
            else {
                return "";
            }
        case "trimSpaces":
            var inputStrValue = value.left.getRawValue(parameters);
            if (typeof inputStrValue === 'string' || inputStrValue instanceof String) {
                return inputStrValue.trim();
            }
            else {
                return "";
            }

        case "toLink":
            var inputStrValue = value.left.getRawValue(parameters);
            if (typeof inputStrValue === 'string' || inputStrValue instanceof String) {
                if (inputStrValue.indexOf('http') == -1) {
                    inputStrValue = "https://" + inputStrValue;
                }
                return '<a href="' + inputStrValue + '" target="_blank">' + inputStrValue + '</a>';
            } else {
                return "";
            }

        case "strReplace":
            var inputStrValue = value.param1.getRawValue(parameters);
            var substrReplaceRegexp = value.param2.getRawValue(parameters);
            var replacementStr = value.param3.getRawValue(parameters);
            if (!(typeof inputStrValue === 'string' || inputStrValue instanceof String)) {
                return "";
            }
            if (!(typeof substrReplaceRegexp === 'string' || substrReplaceRegexp instanceof String)) {
                return "";
            }
            if (!(typeof replacementStr === 'string' || replacementStr instanceof String)) {
                return "";
            }
            return inputStrValue.replace(new RegExp(substrReplaceRegexp, 'gm'), replacementStr);

        case "round0decimal":
            return Math.round(value.left.getRawValue(parameters));

        case "round1decimal":
            return Math.round(value.left.getRawValue(parameters) * 10) / 10;

        case "round2decimals":
            return Math.round(value.left.getRawValue(parameters) * 100) / 100;

        case "round3decimals":
            return Math.round(value.left.getRawValue(parameters) * 1000) / 1000;

        case "floor":
            return Math.floor(value.left.getRawValue(parameters));

        case "ceil":
            return Math.ceil(value.left.getRawValue(parameters));

        case "abs":
            return Math.abs(value.left.getRawValue(parameters));

        case "sqrt":
            return Math.sqrt(value.left.getRawValue(parameters));
    }
};



OperandVariable.prototype.removeVariable = function (globalVar) {
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
OperandVariable.prototype.setPointers = function (entitiesArr) {
    if (this.operandType() == "variable" || this.operandType() == "constantCategorical") {
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
    if (this.operandType() == "arithmetic" || this.operandType() == "arrayvalue") {
        this.operandValueOrObject().left.setPointers(entitiesArr);
        this.operandValueOrObject().right.setPointers(entitiesArr);
    }
    if (OperandVariable.prototype.ternaryOperandTypes.indexOf(this.operandType()) > -1) {
        this.operandValueOrObject().param1.setPointers(entitiesArr);
        this.operandValueOrObject().param2.setPointers(entitiesArr);
        this.operandValueOrObject().param3.setPointers(entitiesArr);
    }
    if (OperandVariable.prototype.unaryOperandTypes.indexOf(this.operandType()) > -1) {
        this.operandValueOrObject().left.setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
OperandVariable.prototype.reAddEntities = function (entitiesArr) {
    if (this.operandType() == "variable" || this.operandType() == "constantCategorical") {
        if (this.operandValueOrObject()) {
            if (!entitiesArr.byId.hasOwnProperty(this.operandValueOrObject().id())) {
                entitiesArr.push(this.operandValueOrObject());
            }
        }
    }
    if (this.operandType() == "arithmetic" || this.operandType() == "arrayvalue") {
        this.operandValueOrObject().left.reAddEntities(entitiesArr);
        this.operandValueOrObject().right.reAddEntities(entitiesArr);
    }
    if (OperandVariable.prototype.ternaryOperandTypes.indexOf(this.operandType()) > -1) {
        this.operandValueOrObject().param1.reAddEntities(entitiesArr);
        this.operandValueOrObject().param2.reAddEntities(entitiesArr);
        this.operandValueOrObject().param3.reAddEntities(entitiesArr);
    }
    if (OperandVariable.prototype.unaryOperandTypes.indexOf(this.operandType()) > -1) {
        this.operandValueOrObject().left.reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {OperandVariable}
 */
OperandVariable.prototype.fromJS = function (data) {
    this.operandType(data.operandType);
    if (data.operandType == "objProperty") {
        var refToObjectProperty = new RefToObjectProperty(this.event);
        refToObjectProperty.fromJS(data.operandValueOrObject);
        this.operandValueOrObject(refToObjectProperty);
    }
    else if (data.operandType == "arithmetic" || data.operandType == "arrayvalue") {
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
    else if (OperandVariable.prototype.ternaryOperandTypes.indexOf(this.operandType()) > -1) {
        var param1 = new OperandVariable(this.event);
        var param2 = new OperandVariable(this.event);
        var param3 = new OperandVariable(this.event);
        param1.fromJS(data.operandValueOrObject.param1);
        param2.fromJS(data.operandValueOrObject.param2);
        param3.fromJS(data.operandValueOrObject.param3);
        this.operandValueOrObject({
            param1: param1,
            param2: param2,
            param3: param3,
        });
    }
    else if (OperandVariable.prototype.unaryOperandTypes.indexOf(this.operandType()) > -1) {
        var left = new OperandVariable(this.event);
        left.fromJS(data.operandValueOrObject.left);
        var deserializedObj = {
            left: left
        };
        if (data.operandValueOrObject.hasOwnProperty("op")) {
            deserializedObj.op = data.operandValueOrObject.op;
        }
        this.operandValueOrObject(deserializedObj);
    }
    else {
        this.operandValueOrObject(data.operandValueOrObject);
    }
    if (data.hasOwnProperty("subParam")) {
        this.subParam(data.subParam);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
OperandVariable.prototype.toJS = function () {
    var data = {
        type: this.type,
        operandType: this.operandType(),
        operandValueOrObject: this.operandValueOrObject()
    };
    if ((data.operandType == "variable" && data.operandValueOrObject) || (data.operandType == "constantCategorical" && data.operandValueOrObject)) {
        if (data.operandValueOrObject) {
            data.operandValueOrObject = data.operandValueOrObject.id();
        }
    }
    if (data.operandType == "objProperty") {
        if (data.operandValueOrObject) {
            data.operandValueOrObject = data.operandValueOrObject.toJS();
        }
    }
    if (data.operandType == "arithmetic" || data.operandType == "arrayvalue") {
        data.operandValueOrObject = {
            left: data.operandValueOrObject.left.toJS(),
            right: data.operandValueOrObject.right.toJS(),
            op: data.operandValueOrObject.op
        };
    }
    if (OperandVariable.prototype.ternaryOperandTypes.indexOf(this.operandType()) > -1) {
        data.operandValueOrObject = {
            param1: data.operandValueOrObject.param1.toJS(),
            param2: data.operandValueOrObject.param2.toJS(),
            param3: data.operandValueOrObject.param3.toJS()
        };
    }
    if (OperandVariable.prototype.unaryOperandTypes.indexOf(this.operandType()) > -1) {
        data.operandValueOrObject = {
            left: data.operandValueOrObject.left.toJS()
        };
        if (data.operandValueOrObject.hasOwnProperty("op")) {
            data.operandValueOrObject.op = data.operandValueOrObject.op;
        }
    }
    data.subParam = this.subParam();
    return data;
};

///////////////////////

/**
 * This class represents a specific property of a specific stimulus element. It can be used as an operand variable.
 *
 * @param {ExpEvent} event - the parent event where this is used.
 * @constructor
 */
var RefToObjectProperty = function (event) {
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
RefToObjectProperty.prototype.getValue = function () {


    var target = this.target();
    if (target) {
        if (this.property() == "content.file") {
            var fileID = target.content().modifier().selectedTrialView["file_id"]();
            var name = target.content().modifier().selectedTrialView["file_orig_name"]();
            var obj = { id: fileID, name: name };
            return obj
        }
        else {
            var propertyPath = this.property().split(".");
            for (var k = 0; k < propertyPath.length - 1; k++) {
                target = target[propertyPath[k]];
                if (ko.isObservable(target)) {
                    target = target();
                }
            }
            return target.modifier().selectedTrialView[propertyPath[propertyPath.length - 1]]();
        }
    }
    else {
        return null;
    }

};

/**
 * set the value of the object property
 */
RefToObjectProperty.prototype.setValue = function (newVal) {

    var target = this.target();
    if (target) {
        if (this.property() == "content.file") {
            target.content().modifier().selectedTrialView["file_id"](newVal.id());
            target.content().modifier().selectedTrialView["file_orig_name"](newVal.name());
        }
        else {
            var propertyPath = this.property().split(".");
            for (var k = 0; k < propertyPath.length - 1; k++) {
                target = target[propertyPath[k]];
                if (ko.isObservable(target)) {
                    target = target();
                }
            }
            if (newVal != null) {
                if (newVal.hasOwnProperty('parentVar')) {
                    newVal = newVal.value();
                }
            }
            target.modifier().selectedTrialView[propertyPath[propertyPath.length - 1]](newVal);
        }
    }
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RefToObjectProperty.prototype.setPointers = function (entitiesArr) {
    if (this.target()) {
        var target = entitiesArr.byId[this.target()];   
        if (target) {
            this.target(target);
        }
        else{
            this.target(null);
        }
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
RefToObjectProperty.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {RefToObjectProperty}
 */
RefToObjectProperty.prototype.fromJS = function (data) {
    this.target(data.target);
    this.property(data.property);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
RefToObjectProperty.prototype.toJS = function () {
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
 * @param {ExpEvent} event - the parent event of the new action.
 * @param {string} type - the type of the Requirement (i.e. "RequirementOR")
 * @returns {Requirement}
 */
function requirementFactory(event, type) {
    var requirement = new window[type](event);
    return requirement;
}
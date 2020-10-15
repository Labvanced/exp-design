// Copyright by Scicovery GmbH

/////////////////////////////////////////////////  ActionRunJavascript  /////////////////////////////////////////////////// // depreciated!

/**
 * This action can record values (i.e. elementTag or reactiontime) into variables and sends them to the server.
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionRunJavascript = function (event) {
    this.event = event;
    this.jsCode = ko.observable(ActionRunJavascript.prototype.defaultCode);
};

ActionRunJavascript.prototype.type = "ActionRunJavascript";
ActionRunJavascript.prototype.label = "Run JavaScript";
ActionRunJavascript.prototype.defaultCode = "";
ActionRunJavascript.prototype.defaultCode += 'var nr = getValue("Trial_Nr");\n';
ActionRunJavascript.prototype.defaultCode += 'if (nr < 3) {\n';
ActionRunJavascript.prototype.defaultCode += '    console.log("nr = " + nr);\n';
ActionRunJavascript.prototype.defaultCode += '}';
ActionRunJavascript.prototype.defaultCode += 'else {\n';
ActionRunJavascript.prototype.defaultCode += '    setValue("VariableName", nr);\n';
ActionRunJavascript.prototype.defaultCode += '}';

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionRunJavascript.prototype.isValid = function () {
    return true;
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionRunJavascript.prototype.setupOnPlayerFrame = function (playerFrame) {
    if (!window.hasOwnProperty('Interpreter')) {
        var script = document.createElement('script');
        script.src = "assets/js/acorn_interpreter.js";
        document.head.appendChild(script);
    }
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It creates the RecData and
 * sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRunJavascript.prototype.run = function (triggerParams) {
    var self = this;
    if (window.hasOwnProperty('Interpreter')) {
        console.log("************* starting custom js code *****************")
        this.runInterpreter();
        console.log("************* finished custom js code *****************")
    }
    else {
        console.warn("need to wait until interpreter loading and parsing is finished...");
        setTimeout(function () {
            self.run();
        }, 300);
    }
};

ActionRunJavascript.prototype.runInterpreter = function () {
    var self = this;

    var code = "";
    code += "function getValue(varName) { return JSON.parse(getValueWrapper(varName)); }\n";
    code += "function setValue(varName, value) { setValueWrapper(varName, JSON.stringify(value)); }\n";
    code += this.jsCode();

    var myInterpreter = new Interpreter(code, function (interpreter, globalObject) {
        self.interpreterInitFunc(interpreter, globalObject);
    });
    myInterpreter.run();
}

ActionRunJavascript.prototype.interpreterInitFunc = function (interpreter, globalObject) {
    var self = this;

    var getValueWrapper = function (varName) {
        var myVariable = self.event.parent.expData.getVarByName(varName);
        if (myVariable) {
            var myValue;
            if (myVariable.dataFormat() == "array") {
                // need to use inner function such that scalar values within array are converted to primitive types:
                myValue = myVariable.value().getValue();
            }
            else {
                myValue = myVariable.getValue();
            }
            return JSON.stringify(myValue);
        }
        else {
            console.warn("no variable with name was found! varName = " + varName)
            return null;
        }
    };
    interpreter.setProperty(globalObject, 'getValueWrapper', interpreter.createNativeFunction(getValueWrapper));

    var setValueWrapper = function (varName, valueJSON) {
        var value = JSON.parse(valueJSON);
        var myVariable = self.event.parent.expData.getVarByName(varName);
        if (myVariable) {
            myVariable.setValue(value);
        }
        else {
            console.warn("setValue was not able to find variable with name " + varName)
        }
    };
    interpreter.setProperty(globalObject, 'setValueWrapper', interpreter.createNativeFunction(setValueWrapper));

    // Create 'console' global object and methods log, warn, error.
    var consoleObj = interpreter.nativeToPseudo({});
    interpreter.setProperty(globalObject, 'console', consoleObj);
    var consoleLog = function () {
        for (var i = 0; i < arguments.length; i++) {
            console.log("************* " + arguments[i]);
        }
    };
    interpreter.setProperty(consoleObj, 'log', interpreter.createNativeFunction(consoleLog));
    interpreter.setProperty(consoleObj, 'warn', interpreter.createNativeFunction(consoleLog));
    interpreter.setProperty(consoleObj, 'error', interpreter.createNativeFunction(consoleLog));

}

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRunJavascript.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRunJavascript.prototype.setPointers = function (entitiesArr) {
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRunJavascript.prototype.reAddEntities = function (entitiesArr) {
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRunJavascript}
 */
ActionRunJavascript.prototype.fromJS = function (data) {
    this.jsCode(data.jsCode);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRunJavascript.prototype.toJS = function () {
    return {
        type: this.type,
        jsCode: this.jsCode()
    };
};


////////////////////////////////////////  ActionSetElementProp  ///////////////////////////////////////////////////

/**
 * This action changes properties of a contentElement.
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionSetElementProp = function (event) {
    this.event = event;
    this.target = ko.observable(null);
    this.changes = ko.observableArray([]);
    this.animate = ko.observable(false);
    this.animationTime = ko.observable(0);
};


ActionSetElementProp.prototype.type = "ActionSetElementProp";
ActionSetElementProp.prototype.label = "Set Stimulus Property";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetElementProp.prototype.isValid = function () {
    return true;
};

/**
 * adds a new property that shall be changed.
 */
ActionSetElementProp.prototype.addProperty = function () {
    var newChange = new ActionSetElementPropChange(this);
    this.changes.push(newChange);
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetElementProp.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, false, true, 'Action Set Element Prop');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It reads out the desired
 * changes and applies them to the properties.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */

ActionSetElementProp.prototype.run = function (triggerParams) {

    var changes = this.changes();
    var target = this.target();
    for (var i = 0; i < changes.length; i++) {
        var property = changes[i].property();
        var operatorType = changes[i].operatorType();
        var changeType = changes[i].changeType();
        var variable = changes[i].variable();

        // make sure to calculate on numeric
        var value = changes[i].value();

        //var oldValue = target[property]();
        var oldValue = target.modifier().selectedTrialView[property]();

        if (typeof oldValue === 'string') {
            oldValue = Number(oldValue);
        }
        if (typeof value === 'string') {
            value = Number(value);
        }

        var newValue;
        var changeValue;

        if (changeType == 'value') {
            changeValue = value;
        }
        else if (changeType == '%') {
            changeValue = (oldValue * (value / 100));
        }
        else if (changeType == 'variable') {
            changeValue = parseFloat(variable.value().value());
        }

        if (operatorType == '=') {
            newValue = changeValue;
        }
        else if (operatorType == '+') {
            newValue = oldValue + changeValue;
        }
        else if (operatorType == '-') {
            newValue = oldValue - changeValue;
        }
        else if (operatorType == '*') {
            newValue = oldValue * changeValue;
        }
        else if (operatorType == '/') {
            newValue = oldValue / changeValue;
        }

        target.modifier().selectedTrialView[property](newValue);
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementProp.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.setPointers = function (entitiesArr) {
    if (this.target()) {
        var target = entitiesArr.byId[this.target()];
        this.target(target);
    }


    var changes = this.changes();
    for (var i = 0; i < changes.length; i++) {
        changes[i].setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementProp.prototype.reAddEntities = function (entitiesArr) {
    var changes = this.changes();
    for (var i = 0; i < changes.length; i++) {
        var variable = changes[i].variable();
        if (variable) {
            if (!entitiesArr.byId.hasOwnProperty(variable.id())) {
                entitiesArr.push(variable);
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetElementProp}
 */
ActionSetElementProp.prototype.fromJS = function (data) {
    this.animate(data.animate);
    this.animationTime(data.animationTime);
    this.target(data.target);

    var changes = [];
    for (var i = 0; i < data.changes.length; i++) {
        var tmp = data.changes[i];
        var obj = new ActionSetElementPropChange(this);
        obj.fromJS(tmp);
        changes.push(obj);
    }
    this.changes(changes);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetElementProp.prototype.toJS = function () {

    var changes = [];
    var origChanges = this.changes();
    for (var i = 0; i < origChanges.length; i++) {
        var obj = origChanges[i].toJS();
        changes.push(obj);
    }

    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }

    return {
        type: this.type,
        target: targetId,
        animate: this.animate(),
        animationTime: this.animationTime,
        changes: changes
    };
};


////////////////////////////////////////  ActionSetElementPropChange  ///////////////////////////////////////////////////

var ActionSetElementPropChange = function (parentAction) {
    this.parentAction = parentAction;

    this.property = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(0);
    this.variable = ko.observable(null);
};

ActionSetElementPropChange.prototype.operatorTypes = ["=", "+", "-", "*", "/"];
ActionSetElementPropChange.prototype.changeTypes = ["value", "%", "variable"];

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetElementPropChange.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

ActionSetElementPropChange.prototype.setPointers = function (entitiesArr) {
    if (this.changeType() == "variable") {
        var varId = this.variable();
        var globVar = entitiesArr.byId[varId];
        if (globVar) {
            this.variable(globVar);
            this.parentAction.setVariableBackRef(globVar);
        }
        else {
            this.variable(null);
        }
    }
    else {
        this.variable(null);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetElementPropChange.prototype.reAddEntities = function (entitiesArr) {

};

ActionSetElementPropChange.prototype.fromJS = function (data) {
    this.property(data.property);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    if (data.variable) {
        this.variable(data.variable);
    }
};

ActionSetElementPropChange.prototype.toJS = function () {
    var variable = this.variable();
    if (variable) {
        variable = variable.id();
    }

    return {
        property: this.property(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: this.value(),
        variable: variable
    };
};




////////////////////////////////////////  ActionSetProp (new version) ///////////////////////////////////////////////////

var ActionSetProp = function (event) {
    this.event = event;

    // serialized
    this.operand = ko.observableArray([new OperandVariable(event)]);
    this.refToObjectProperty = ko.observableArray([new RefToObjectProperty(event)]);
};

ActionSetProp.prototype.type = "ActionSetProp";
ActionSetProp.prototype.label = "Set Object Property"
ActionSetProp.prototype.addProperty = function () {
    this.action.operand.push(new OperandVariable(this.action.event));
    this.action.refToObjectProperty.push(new RefToObjectProperty(this.action.event));
}


ActionSetProp.prototype.removeProperty = function (index) {
    var operand = this.operand();
    var refToObjectProperty = this.refToObjectProperty();

    operand.splice(index, 1);
    refToObjectProperty.splice(index, 1);

    this.operand(operand);
    this.refToObjectProperty(refToObjectProperty);
}

ActionSetProp.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 */
ActionSetProp.prototype.setVariableBackRef = function () {
    variable.addBackRef(this, this.event, false, true, 'Action Set Prop');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetProp.prototype.run = function (triggerParams) {

    for (var i = 0; i < this.refToObjectProperty().length; i++) {
        var rValue = this.operand()[i].getValue(triggerParams);
        this.refToObjectProperty()[i].setValue(rValue);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetProp.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetProp.prototype.setPointers = function (entitiesArr) {
    var refToObjectProperty = this.refToObjectProperty();
    for (var i = 0; i < refToObjectProperty.length; i++) {
        refToObjectProperty[i].setPointers(entitiesArr);
    }
    var operand = this.operand();
    for (var i = 0; i < operand.length; i++) {
        operand[i].setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetProp.prototype.reAddEntities = function (entitiesArr) {
    var refToObjectProperty = this.refToObjectProperty();
    for (var i = 0; i < refToObjectProperty.length; i++) {
        var variable = refToObjectProperty[i].variable;
        if (variable) {
            if (!entitiesArr.byId.hasOwnProperty(variable.id())) {
                entitiesArr.push(variable);
            }
        }
    }
    var operand = this.operand();
    for (var i = 0; i < operand.length; i++) {
        if (operand[i] && operand[i].reAddEntities) {
            operand[i].reAddEntities(entitiesArr);
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetProp}
 */
ActionSetProp.prototype.fromJS = function (data) {
    var refToObjectProperty = [];
    if (data.refToObjectProperty.constructor.name == 'Array') {
        for (var i = 0; i < data.refToObjectProperty.length; i++) {
            var tmp = data.refToObjectProperty[i];
            var obj = new RefToObjectProperty(this.event);
            obj.fromJS(tmp);
            refToObjectProperty.push(obj);
        }
    }
    else {
        var obj = new RefToObjectProperty(this.event);
        obj.fromJS(data.refToObjectProperty);
        refToObjectProperty.push(obj);
    }
    this.refToObjectProperty(refToObjectProperty);

    var operand = [];
    if (data.operand.constructor.name == 'Array') {
        for (var i = 0; i < data.operand.length; i++) {
            var tmp = data.operand[i];
            var obj = new OperandVariable(this.event);
            obj.fromJS(tmp);
            operand.push(obj);
        }
    } else {
        var obj = new OperandVariable(this.event);
        obj.fromJS(data.operand);
        operand.push(obj);
    }
    this.operand(operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetProp.prototype.toJS = function () {
    var origChanges = this.refToObjectProperty();
    var refToObjectProperty = [];
    for (var i = 0; i < origChanges.length; i++) {
        var obj = origChanges[i].toJS();
        refToObjectProperty.push(obj);
    }

    var operand = [];
    for (var i = 0; i < this.operand().length; i++) {
        var obj = this.operand()[i].toJS();
        operand.push(obj);
    }

    return {
        type: this.type,
        operand: operand,
        refToObjectProperty: refToObjectProperty
    };
};










////////////////////////////////////////  ActionRecordData ///////////////////////////////////////////////////

var ActionRecordData = function (event) {
    this.event = event;
};

ActionRecordData.prototype.type = "ActionRecordData";
ActionRecordData.prototype.label = "Record Variables Instantly";

ActionRecordData.prototype.isValid = function () {
    return true;
};


/**s
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionRecordData.prototype.run = function (triggerParams) {
    var isDuringTrial = true;
    player.recordData(isDuringTrial);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionRecordData.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordData.prototype.setPointers = function (entitiesArr) {
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionRecordData.prototype.reAddEntities = function (entitiesArr) {
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordData}
 */
ActionRecordData.prototype.fromJS = function (data) {
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionRecordData.prototype.toJS = function () {
    return { type: this.type };
};





////////////////////////////////////////  ActionSelectFromArray ///////////////////////////////////////////////////

var ActionSelectFromArray = function (event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.inVarIndex = ko.observable(null);
    this.InsertOption = ko.observable("variable"); // either variable or fixed or end
    this.indexFixedVal = ko.observable(1);
    this.outVar = ko.observable(null);
};

ActionSelectFromArray.prototype.type = "ActionSelectFromArray";
ActionSelectFromArray.prototype.label = "Select From Array (Read)";

ActionSelectFromArray.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setInVarArrBackRef = function () {
    this.inVarArr().addBackRef(this, this.event, false, true, 'array to select from');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setInVarIndexBackRef = function () {
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSelectFromArray.prototype.setOutVarBackRef = function () {
    this.outVar().addBackRef(this, this.event, true, false, 'selected from array');
};

ActionSelectFromArray.prototype.removeInArrVariable = function () {
    this.inVarArr(null);
};

ActionSelectFromArray.prototype.removeInVariable = function () {
    this.inVarIndex(null);
};

ActionSelectFromArray.prototype.removeOutVariable = function () {
    this.outVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSelectFromArray.prototype.run = function (triggerParams) {
    if (this.InsertOption() == 'fixed') {
        var index = parseInt(this.indexFixedVal());
    }
    else if (this.InsertOption() == 'end') {
        var index = this.inVarArr().value().value().length;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value());
    }

    var value = this.inVarArr().value().getValueAt(index);
    if (this.outVar()) {
        this.outVar().value().setValue(value);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSelectFromArray.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSelectFromArray.prototype.setPointers = function (entitiesArr) {
    if (this.inVarArr()) {
        var inVarArr = entitiesArr.byId[this.inVarArr()];
        if (inVarArr) {
            this.inVarArr(inVarArr);
            this.setInVarArrBackRef();
        }
    }

    if (this.inVarIndex()) {
        var inVarIndex = entitiesArr.byId[this.inVarIndex()];
        if (inVarIndex) {
            this.inVarIndex(inVarIndex);
            this.setInVarIndexBackRef();
        }
    }
    if (this.outVar()) {
        var outVar = entitiesArr.byId[this.outVar()];
        if (outVar) {
            this.outVar(outVar);
            this.setOutVarBackRef();
        }
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSelectFromArray.prototype.reAddEntities = function (entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    if (this.outVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVar().id())) {
            entitiesArr.push(this.outVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSelectFromArray}
 */
ActionSelectFromArray.prototype.fromJS = function (data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.outVar(data.outVar);
    if (data.hasOwnProperty('InsertOption')) {
        this.InsertOption(data.InsertOption)
    }
    if (data.hasOwnProperty('indexFixedVal')) {
        this.indexFixedVal(data.indexFixedVal)
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSelectFromArray.prototype.toJS = function () {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var outVar = null;
    if (this.outVar()) {
        if (typeof this.outVar().id == 'function') {
            outVar = this.outVar().id();
        }
    }
    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        outVar: outVar,
        InsertOption: this.InsertOption(),
        indexFixedVal: this.indexFixedVal()
    };
};



////////////////////////////////////////  ActionWriteToArray ///////////////////////////////////////////////////

var ActionWriteToArray = function (event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.inVarIndex = ko.observable(null);
    this.InsertOption = ko.observable("fixed");
    this.indexFixedVal = ko.observable(1);
    this.inVar = ko.observable(null);
};

ActionWriteToArray.prototype.type = "ActionWriteToArray";
ActionWriteToArray.prototype.label = "Change Array Entry (Replace)";

ActionWriteToArray.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarArrBackRef = function () {
    this.inVarArr().addBackRef(this, this.event, false, true, 'write to array');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarIndexBackRef = function () {
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionWriteToArray.prototype.setInVarBackRef = function () {
    this.inVar().addBackRef(this, this.event, true, false, 'selected from array');
};

ActionWriteToArray.prototype.removeInArrVariable = function () {
    this.inVarArr(null);
};

ActionWriteToArray.prototype.removeIndexVariable = function () {
    this.inVarIndex(null);
};

ActionWriteToArray.prototype.removeInVariable = function () {
    this.inVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionWriteToArray.prototype.run = function (triggerParams) {
    if (this.InsertOption() == 'fixed') {
        var index = parseInt(this.indexFixedVal()) - 1;
    }
    else if (this.InsertOption() == 'end') {
        var index = this.inVarArr().value().value().length - 1;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value()) - 1;
    }

    if (index < 0) {
        index = 0;
    }

    var value = this.inVar().value().value();
    if (this.inVarArr) {
        this.inVarArr().value().setValueAt(index, value);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionWriteToArray.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionWriteToArray.prototype.setPointers = function (entitiesArr) {
    if (this.inVarArr()) {
        var inVarArr = entitiesArr.byId[this.inVarArr()];
        if (inVarArr) {
            this.inVarArr(inVarArr);
            this.setInVarArrBackRef();
        }
    }

    if (this.inVarIndex()) {
        var inVarIndex = entitiesArr.byId[this.inVarIndex()];
        if (inVarIndex) {
            this.inVarIndex(inVarIndex);
            this.setInVarIndexBackRef();
        }
    }

    if (this.inVar()) {
        var inVar = entitiesArr.byId[this.inVar()];
        if (inVar) {
            this.inVar(inVar);
            this.setInVarBackRef();
        }
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionWriteToArray.prototype.reAddEntities = function (entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    if (this.inVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVar().id())) {
            entitiesArr.push(this.inVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionWriteToArray}
 */
ActionWriteToArray.prototype.fromJS = function (data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.inVar(data.inVar);
    this.InsertOption(data.InsertOption);
    this.indexFixedVal(data.indexFixedVal);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionWriteToArray.prototype.toJS = function () {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var inVar = null;
    if (this.inVar()) {
        if (typeof this.inVar().id == 'function') {
            inVar = this.inVar().id();
        }
    }
    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        inVar: inVar,
        InsertOption: this.InsertOption(),
        indexFixedVal: this.indexFixedVal()
    };
};








////////////////////////////////////////  ActionModifyArray ///////////////////////////////////////////////////

var ActionModifyArray = function (event) {
    this.event = event;

    // serialized
    this.inVarArr = ko.observable(null);
    this.InsertOption = ko.observable("fixed");
    this.indexFixedVal = ko.observable(1);
    this.inVarIndex = ko.observable(null);
    this.insertVarList = ko.observableArray([]);
    this.insertVarLinkedOrNew = ko.observableArray([]);
    this.nrOfDeletions = ko.observable(0);
};

ActionModifyArray.prototype.type = "ActionModifyArray";
ActionModifyArray.prototype.label = "Add / Remove Array Entries";

ActionModifyArray.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyArray.prototype.setInVarArrBackRef = function () {
    this.inVarArr().addBackRef(this, this.event, false, true, 'modify to array');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyArray.prototype.setInVarIndexBackRef = function () {
    this.inVarIndex().addBackRef(this, this.event, false, true, 'as index');
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */

ActionModifyArray.prototype.setOutVarBackRefForOne = function (newVar) {

    newVar.addBackRef(this, this.event, true, false, 'modify array');
};

ActionModifyArray.prototype.setOutVarBackRef = function () {
    var list = this.insertVarList();
    for (var i = 0; i < list.length; i++) {
        list[i].addBackRef(this, this.event, true, false, 'modify array');
    }
};

ActionModifyArray.prototype.removeInArrVariable = function () {
    this.inVarArr(null);
};

ActionModifyArray.prototype.removeInVariable = function () {
    this.inVarIndex(null);
};

ActionModifyArray.prototype.removeOutVariable = function () {
    this.insertVarList([]);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionModifyArray.prototype.run = function (triggerParams) {
    if (this.InsertOption() == 'fixed') {
        var index = parseInt(this.indexFixedVal()) - 1;
    }
    else if (this.InsertOption() == 'end') {
        var index = this.inVarArr().value().value().length - 1;
    }
    else {
        var index = parseInt(this.inVarIndex().value().value()) - 1;
    }

    if (index < 0) {
        index = 0;
    }

    var valueList = [];
    for (var i = 0; i < this.insertVarList().length; i++) {
        // if value is linked put the variable inside
        if (this.insertVarLinkedOrNew()[i]()) {
            valueList.push(this.insertVarList()[i].value());
        }
        // if if should not be linked add a new variable inside
        else {
            var newVar = new GlobalVar(this.insertVarList()[i].expData).fromJS(this.insertVarList()[i].toJS());
            if (this.insertVarList()[i].value() instanceof GlobalVarValueFile) {
                newVar.value().value(this.insertVarList()[i].value().convert(this.insertVarList()[i].value().toJS()));
            }
            else {
                newVar.value().value(this.insertVarList()[i].value().toJS());
            }
            valueList.push(newVar.value());
        }

    }

    if (this.inVarArr()) {
        this.inVarArr().value().value.splice(index, parseInt(this.nrOfDeletions()));
        for (var i = 0; i < valueList.length; i++) {
            if (this.InsertOption() == 'end') {
                this.inVarArr().value().value.splice(index + 1, 0, valueList[i]);
            }
            else {
                this.inVarArr().value().value.splice(index, 0, valueList[i]);
            }

        }

    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionModifyArray.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyArray.prototype.setPointers = function (entitiesArr) {
    if (this.inVarArr()) {
        var inVarArr = entitiesArr.byId[this.inVarArr()];
        if (inVarArr) {
            this.inVarArr(inVarArr);
            this.setInVarArrBackRef();
        }
    }

    if (this.inVarIndex()) {
        var inVarIndex = entitiesArr.byId[this.inVarIndex()];
        if (inVarIndex) {
            this.inVarIndex(inVarIndex);
            this.setInVarIndexBackRef();
        }
    }


    var list = this.insertVarList();
    var newList = [];
    for (var i = 0; i < list.length; i++) {
        newList.push(entitiesArr.byId[list[i]]);
    }
    this.insertVarList(newList);
    this.setOutVarBackRef();

    var insertVarLinkedOrNew = [];
    for (var i = 0; i < this.insertVarLinkedOrNew().length; i++) {
        insertVarLinkedOrNew.push(ko.observable(this.insertVarLinkedOrNew()[i]));
    }
    this.insertVarLinkedOrNew(insertVarLinkedOrNew);

    this.optionConverter();

};

ActionModifyArray.prototype.optionConverter = function () {
    if (this.insertVarLinkedOrNew().length == 0) {
        var l = this.insertVarList().length;
        for (var i = 0; i < l; i++) {
            this.insertVarLinkedOrNew.push(ko.observable(true));
        }
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyArray.prototype.reAddEntities = function (entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }
    if (this.inVarIndex()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarIndex().id())) {
            entitiesArr.push(this.inVarIndex());
        }
    }
    var list = this.insertVarList();
    for (var i = 0; i < list.length; i++) {
        if (!entitiesArr.byId.hasOwnProperty(list[i].id())) {
            entitiesArr.push(list[i]);
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionModifyArray.prototype.fromJS = function (data) {
    this.inVarArr(data.inVarArr);
    this.inVarIndex(data.inVarIndex);
    this.insertVarList(data.insertVarList);
    this.nrOfDeletions(data.nrOfDeletions);
    this.InsertOption(data.InsertOption);
    this.indexFixedVal(data.indexFixedVal);

    if (data.hasOwnProperty("insertVarLinkedOrNew")) {
        this.insertVarLinkedOrNew(data.insertVarLinkedOrNew);
    }

    return this;

};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionModifyArray.prototype.toJS = function () {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }
    var inVarIndex = null;
    if (this.inVarIndex()) {
        if (typeof this.inVarIndex().id == 'function') {
            inVarIndex = this.inVarIndex().id();
        }
    }
    var insertVarList = null;
    if (this.insertVarList()) {
        var list = this.insertVarList();
        var insertVarList = [];
        for (var i = 0; i < list.length; i++) {
            insertVarList.push(list[i].id());
        }
    }

    var insertVarLinkedOrNew = [];
    for (var i = 0; i < this.insertVarLinkedOrNew().length; i++) {
        insertVarLinkedOrNew.push(this.insertVarLinkedOrNew()[i]());
    }

    return {
        type: this.type,
        inVarArr: inVarArr,
        inVarIndex: inVarIndex,
        insertVarList: insertVarList,
        nrOfDeletions: this.nrOfDeletions(),
        InsertOption: this.InsertOption(),
        indexFixedVal: this.indexFixedVal(),
        insertVarLinkedOrNew: insertVarLinkedOrNew

    };
};







////////////////////////////////////////  ActionShuffleArray ///////////////////////////////////////////////////

var ActionShuffleArray = function (event) {
    this.event = event;
    // serialized
    this.inVarArr = ko.observable(null);
};

ActionShuffleArray.prototype.type = "ActionShuffleArray";
ActionShuffleArray.prototype.label = "Shuffle Array Entries";

ActionShuffleArray.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionShuffleArray.prototype.setInVarArrBackRef = function () {
    this.inVarArr().addBackRef(this, this.event, false, true, 'shuffle array');
};


ActionShuffleArray.prototype.removeInArrVariable = function () {
    this.inVarArr(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionShuffleArray.prototype.run = function (triggerParams) {

    if (this.inVarArr()) {
        this.inVarArr().value().setValue(ExpTrialLoop.prototype.reshuffle(this.inVarArr().value().value()));
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionShuffleArray.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionShuffleArray.prototype.setPointers = function (entitiesArr) {

    if (this.inVarArr()) {
        var inVarArr = entitiesArr.byId[this.inVarArr()];
        if (inVarArr) {
            this.inVarArr(inVarArr);
            this.setInVarArrBackRef();
        }
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionShuffleArray.prototype.reAddEntities = function (entitiesArr) {
    if (this.inVarArr()) {
        if (!entitiesArr.byId.hasOwnProperty(this.inVarArr().id())) {
            entitiesArr.push(this.inVarArr());
        }
    }

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionShuffleArray.prototype.fromJS = function (data) {
    this.inVarArr(data.inVarArr);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionShuffleArray.prototype.toJS = function () {
    var inVarArr = null;
    if (this.inVarArr()) {
        if (typeof this.inVarArr().id == 'function') {
            inVarArr = this.inVarArr().id();
        }
    }

    return {
        type: this.type,
        inVarArr: inVarArr

    };
};







////////////////////////////////////////  ActionLoadFileIds ///////////////////////////////////////////////////

var ActionLoadFileIds = function (event) {
    this.event = event;

    // serialized
    this.files = ko.observableArray([]);
    this.outVarFileIds = ko.observable(null);
    this.outVarFileNames = ko.observable(null);
};

ActionLoadFileIds.prototype.type = "ActionLoadFileIds";
ActionLoadFileIds.prototype.label = "Load File Ids";

ActionLoadFileIds.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionLoadFileIds.prototype.setOutVarBackRef = function () {
    this.outVarFileIds().addBackRef(this, this.event, true, false, 'set file ids');
};
ActionLoadFileIds.prototype.setOutVarFileNamesBackRef = function () {
    this.outVarFileNames().addBackRef(this, this.event, true, false, 'set file names');
};

ActionLoadFileIds.prototype.removeOutVariable = function () {
    this.outVarFileIds(null);
};

ActionLoadFileIds.prototype.removeOutVariableFileNames = function () {
    this.outVarFileIds(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionLoadFileIds.prototype.run = function (triggerParams) {
    if (this.outVarFileIds()) {
        // clear array:
        var arrVarValue = this.outVarFileIds().value();
        arrVarValue.value([]);

        // fill values:
        jQuery.each(this.files(), function (idx, file) {
            arrVarValue.pushValue(file.id);
        });
    }
    if (this.outVarFileNames()) {
        // clear array:
        var arrVarNamesValue = this.outVarFileNames().value();
        arrVarNamesValue.value([]);

        // fill values:
        jQuery.each(this.files(), function (idx, file) {
            arrVarNamesValue.pushValue(file.name_original);
        });
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionLoadFileIds.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionLoadFileIds.prototype.setPointers = function (entitiesArr) {
    var outVarFileIds = entitiesArr.byId[this.outVarFileIds()];
    if (outVarFileIds) {
        this.outVarFileIds(outVarFileIds);
        this.setOutVarBackRef();
    }
    var outVarFileNames = entitiesArr.byId[this.outVarFileNames()];
    if (outVarFileNames) {
        this.outVarFileNames(outVarFileNames);
        this.setOutVarFileNamesBackRef();
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionLoadFileIds.prototype.reAddEntities = function (entitiesArr) {
    if (this.outVarFileIds()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVarFileIds().id())) {
            entitiesArr.push(this.outVarFileIds());
        }
    }
    if (this.outVarFileNames()) {
        if (!entitiesArr.byId.hasOwnProperty(this.outVarFileNames().id())) {
            entitiesArr.push(this.outVarFileNames());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionLoadFileIds}
 */
ActionLoadFileIds.prototype.fromJS = function (data) {
    this.files(data.files);
    this.outVarFileIds(data.outVarFileIds);
    if (data.hasOwnProperty('outVarFileNames')) {
        this.outVarFileNames(data.outVarFileNames);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionLoadFileIds.prototype.toJS = function () {
    var outVarFileIds = null;
    if (this.outVarFileIds()) {
        if (typeof this.outVarFileIds().id == 'function') {
            outVarFileIds = this.outVarFileIds().id();
        }
    }
    var outVarFileNames = null;
    if (this.outVarFileNames()) {
        if (typeof this.outVarFileNames().id == 'function') {
            outVarFileNames = this.outVarFileNames().id();
        }
    }
    return {
        type: this.type,
        files: this.files(),
        outVarFileIds: outVarFileIds,
        outVarFileNames: outVarFileNames
    };
};


////////////////////////////////////////////   ActionJumpTo   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionJumpTo = function (event) {
    this.event = event;
    this.jumpType = ko.observable(null);
    this.frameToJump = ko.observable(null);
    this.taskToJumpId = ko.observable(null);
    this.trialToJumpId = ko.observable(null);
    this.blockToJumpId = ko.observable(null);
    this.conditionGroupIdx = ko.observable(null);
    this.checkRequired = ko.observable(null);
    this.jumpTrailType = ko.observable('id');

    this.alreadyTriggered = false;
};

ActionJumpTo.prototype.type = "ActionJumpTo";
ActionJumpTo.prototype.label = "Jump To";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionJumpTo.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionJumpTo.prototype.run = function (triggerParams) {

    if (this.alreadyTriggered) {
        // Prevent Bug due to double clicking leading to duplicate execution and jumping over trials etc.
        return;
    }

    // check validity only if the jump is to next frame
    if (this.checkRequired()) {
        var isValid = true;
        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function (element) {
            if (typeof element.content().isInputValid == "function") {
                if (!element.content().isInputValid()) {
                    isValid = false;
                }
            }
        });
        // now display error message at navigation element
        var elements = player.currentFrame.frameData.elements();
        elements.forEach(function (element) {
            if (element.content() instanceof NaviElement) {
                element.content().showSubmitError(!isValid);
            }
        });
    }

    if (isValid || !this.checkRequired()) {
        this.alreadyTriggered = true;

        if (this.jumpType() == "previousFrame") {
            player.currentFrame.endFrameAndGoBack();
        }
        else if (this.jumpType() == "nextFrame") {
            player.currentFrame.endFrame();
        }
        else if (this.jumpType() == "nextTrial") {
            player.currentFrame.finishFrame();
            player.startNextTrial(player.trialIndex + 1)
        }
        else if (this.jumpType() == "nextTask") {
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToNextTask();
        }
        else if (this.jumpType() == "nextBlock") {
            player.currentFrame.finishFrame();
            player.recordData();
            player.startNextBlock();
        }

        else if (this.jumpType() == "specificFrame") {
            player.currentFrame.goToCustomFrame(this.frameToJump());
        }
        else if (this.jumpType() == "specificTrial") {
            player.currentFrame.finishFrame();
            player.recordData();

            var trialIds = [];
            for (var j = 0; j < player.randomizedTrials.length; j++) {
                trialIds.push(player.randomizedTrials[j].trialVariation.uniqueId());
            }
            var indexOfNewTrial = trialIds.indexOf(parseInt(this.trialToJumpId()));
            if (indexOfNewTrial instanceof Array) {
                var trialIndex = indexOfNewTrial[0];
            }
            else if (indexOfNewTrial >= 0) {
                var trialIndex = indexOfNewTrial;
            }
            else {
                var trialIndex = player.trialIter + 1;
            }

            player.startNextTrial(trialIndex);
        }

        else if (this.jumpType() == "specificTrialVar") {
            player.currentFrame.finishFrame();
            player.recordData();

            var trialIds = [];
            for (var j = 0; j < player.randomizedTrials.length; j++) {
                trialIds.push(player.randomizedTrials[j].trialVariation.uniqueId());
            }
            var indexOfNewTrial = trialIds.indexOf(parseInt(this.trialToJumpId()));
            if (indexOfNewTrial instanceof Array) {
                var trialIndex = indexOfNewTrial[0];
            }
            else if (indexOfNewTrial >= 0) {
                var trialIndex = indexOfNewTrial;
            }
            else {
                var trialIndex = player.trialIter + 1;
            }

            player.startNextTrial(trialIndex);
        }

        else if (this.jumpType() == "specificTask") {
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToSpecificTask(this.taskToJumpId());
        }
        else if (this.jumpType() == "specificBlock") {
            player.currentFrame.finishFrame();
            player.recordData();
            player.jumpToSpecificBlock(this.blockToJumpId());
        }

        else if (this.jumpType() == "conditionGroup") {
            // Todo
        }
    }

};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionJumpTo.prototype.setupOnPlayerFrame = function (playerFrame) {
    this.alreadyTriggered = false;
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionJumpTo.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

ActionJumpTo.prototype.reAddEntities = function (entitiesArr) {
    if (this.jumpType() == "specificFrame") {
        if (this.frameToJump()) {
            if (!entitiesArr.byId.hasOwnProperty(this.frameToJump().id())) {
                entitiesArr.push(this.frameToJump());
            }
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
ActionJumpTo.prototype.setPointers = function (entitiesArr) {
    if (this.frameToJump()) {
        var frame = entitiesArr.byId[this.frameToJump()];
        this.frameToJump(frame);
    }
    // converter for old studies
    if (this.checkRequired() === null && this.jumpType() == "nextFrame") {
        this.checkRequired(true);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionJumpTo}
 */
ActionJumpTo.prototype.fromJS = function (data) {
    this.jumpType(data.jumpType);
    this.frameToJump(data.frameToJump);
    if (data.hasOwnProperty('taskToJumpId')) {
        this.taskToJumpId(data.taskToJumpId);
    }
    if (data.hasOwnProperty('trialToJumpId')) {
        this.trialToJumpId(data.trialToJumpId);
    }
    if (data.hasOwnProperty('conditionGroupIdx')) {
        this.conditionGroupIdx(data.conditionGroupIdx);
    }
    if (data.hasOwnProperty('blockToJumpId')) {
        this.blockToJumpId(data.blockToJumpId);
    }

    if (data.hasOwnProperty('checkRequired')) {
        this.checkRequired(data.checkRequired);
    }
    if (data.hasOwnProperty('jumpTrailType')) {
        this.jumpTrailType(data.jumpTrailType);
    }



    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionJumpTo.prototype.toJS = function () {
    var frameToJump;
    if (this.frameToJump()) {
        frameToJump = this.frameToJump().id();
    }
    else {
        frameToJump = null;
    }


    return {
        type: this.type,
        jumpType: this.jumpType(),
        frameToJump: frameToJump,
        taskToJumpId: this.taskToJumpId(),
        trialToJumpId: this.trialToJumpId(),
        conditionGroupIdx: this.conditionGroupIdx(),
        blockToJumpId: this.blockToJumpId(),
        checkRequired: this.checkRequired(),
        jumpTrailType: this.jumpTrailType()

    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




function PausableSetTimeout(callback, delay) {
    this.timerId = null;
    this.startTime = null;
    this.remainingTime = delay;
    this.callback = callback;
    this.resume();
}

PausableSetTimeout.prototype.pause = function () {
    if (this.timerId) {
        window.clearTimeout(this.timerId);
        this.remainingTime -= new Date() - this.startTime;
        this.timerId = null;
        this.startTime = null;
        //console.log("paused PausableSetTimeout with remainingTime=" + this.remainingTime);
    }
};

PausableSetTimeout.prototype.stop = function () {
    //console.log("stopping PausableSetTimeout with remainingTime=" + this.remainingTime);
    if (this.timerId) {
        window.clearTimeout(this.timerId);
    }
    this.timerId = null;
    this.startTime = null;
    this.callback = null;
    this.remainingTime = null;
};

PausableSetTimeout.prototype.resume = function () {
    var self = this;
    if (!this.timerId) {
        //console.log("resuming PausableSetTimeout with remainingTime=" + this.remainingTime);
        this.startTime = new Date();
        this.timerId = window.setTimeout(function () {
            self.callback();
            self.stop();
        }, this.remainingTime);
    }
};


////////////////////////////////////////////   ActionDelayedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDelayedActions = function (event) {
    this.event = event;
    this.pausableTimeouts = [];

    // serialized:
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);

    this.delayType = ko.observable('fixed');
    this.variable = ko.observable(null);
};

ActionDelayedActions.prototype.type = "ActionDelayedActions";
ActionDelayedActions.prototype.label = "Delayed Actions (Time Callback)";

ActionDelayedActions.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'Delayed Action');
};


ActionDelayedActions.prototype.removeVariable = function () {
    this.variable(null);
};


/**
 * recursively fill arr with all nested sub actions
 */
ActionDelayedActions.prototype.getAllActions = function (arr) {
    var actions = this.subActions();
    for (var i = 0; i < actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDelayedActions.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDelayedActions.prototype.run = function (triggerParams) {
    var self = this;
    if (this.delayType() == 'variable') {
        var delayInMs = parseInt(this.variable().getValue());
    }
    else {
        var delayInMs = parseInt(this.delayInMs());
    }

    var pausableTimeout = new PausableSetTimeout(function () {
        var idx = self.pausableTimeouts.indexOf(pausableTimeout);
        if (idx > -1) {
            self.pausableTimeouts.splice(idx, 1);
        }
        self.delayedRun(triggerParams);
    }, delayInMs);
    this.pausableTimeouts.push(pausableTimeout);
};

ActionDelayedActions.prototype.delayedRun = function (triggerParams) {
    var actions = this.subActions();
    for (var i = 0; i < actions.length; i++) {
        actions[i].run(triggerParams);
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionDelayedActions.prototype.setupOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.subActions(), function (index, action) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    });
};

ActionDelayedActions.prototype.startPause = function (playerFrame) {
    for (var i = 0; i < this.pausableTimeouts.length; i++) {
        this.pausableTimeouts[i].pause();
    }
};

ActionDelayedActions.prototype.stopPause = function (playerFrame) {
    for (var i = 0; i < this.pausableTimeouts.length; i++) {
        this.pausableTimeouts[i].resume();
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDelayedActions.prototype.destroyOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.pausableTimeouts, function (index, pausableTimeout) {
        pausableTimeout.stop();
    });
    this.pausableTimeouts = [];
    jQuery.each(this.subActions(), function (index, action) {
        action.destroyOnPlayerFrame(playerFrame);
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
            this.setVariableBackRef(varToSet);
        }
    }

    jQuery.each(this.subActions(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDelayedActions.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.subActions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDelayedActions}
 */
ActionDelayedActions.prototype.fromJS = function (data) {
    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i = 0; i < data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    if (data.hasOwnProperty("variable")) {
        this.variable(data.variable);
    }
    if (data.hasOwnProperty("delayType")) {
        this.delayType(data.delayType);
    }


    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDelayedActions.prototype.toJS = function () {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i = 0; i < subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var varId = null;
    if (this.variable()) {
        if (typeof this.variable().id == 'function') {
            varId = this.variable().id();
        }
    }

    return {
        type: this.type,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData,
        variable: varId,
        delayType: this.delayType()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////   ActionStartRepeatedActions   /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionStartRepeatedActions = function (event) {
    this.event = event;
    this.pausableTimeouts = [];

    // serialized:
    this.allowMultiple = ko.observable(false); // should it be possible to start this repeatedAction again even if it is still running?
    this.startWithoutDelay = ko.observable(false); // should the subActions be run for the first time directly without waiting for the first delay?
    this.stopConditionEnabled = ko.observable(false); // is a stop condition enabled?
    this.stopCondition = ko.observable(null); // checked before each repetition, if enabled.
    this.delayInMs = ko.observable(1000);
    this.subActions = ko.observableArray([]);

    this.executionType = ko.observable('time');
};

ActionStartRepeatedActions.prototype.type = "ActionStartRepeatedActions";
ActionStartRepeatedActions.prototype.label = "Repeated Actions (While Loop)";

/**
 * recursively fill arr with all nested sub actions
 */
ActionStartRepeatedActions.prototype.getAllActions = function (arr) {
    var actions = this.subActions();
    for (var i = 0; i < actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionStartRepeatedActions.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionStartRepeatedActions.prototype.run = function (triggerParams) {


    if (this.executionType() == 'time') {
        var self = this;
        var start = new Date().getTime();
        var nextAt = start;
        var timeoutIdx = this.pausableTimeouts.length;

        if (!this.allowMultiple()) {
            if (timeoutIdx > 0) {
                // this repeated action is already running, therefore do nothing:
                return;
            }
        }

        this.pausableTimeouts.push(null);

        var scheduleNextRepetition = function () {

            // calculate time when next repetition should be scheduled:
            nextAt += self.delayInMs();
            var currTime = new Date().getTime();
            var waitingTime = nextAt - currTime;
            self.pausableTimeouts[timeoutIdx] = new PausableSetTimeout(runRepetition, waitingTime);

            if (waitingTime < 0) {
                console.warn("warning: ActionStartRepeatedActions cannot keep up with the desired delayInMs (" + self.delayInMs() + ")")
            }

            // var drift = (currTime - start) % self.delayInMs();
            // console.log("drift: "+drift);

        };

        var runRepetition = function () {

            // check stopCondition.
            if (self.stopConditionEnabled()) {
                if (self.stopCondition().checkIfTrue(triggerParams)) {
                    return;
                }
            }

            // run all subActions:
            var actions = self.subActions();
            for (var i = 0; i < actions.length; i++) {
                actions[i].run(triggerParams);
            }

            // schedule next repetition:
            scheduleNextRepetition();

        };

        if (this.startWithoutDelay()) {
            runRepetition();
        }
        else {
            scheduleNextRepetition();
        }
    }
    else {
        var stopping = this.stopCondition().checkIfTrue(triggerParams);
        var actions = this.subActions();
        while (!stopping) {
            for (var i = 0; i < actions.length; i++) {
                actions[i].run(triggerParams);
            }
            stopping = this.stopCondition().checkIfTrue(triggerParams)
        }
    }


};


/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionStartRepeatedActions.prototype.setupOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.subActions(), function (index, action) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    });
};

ActionStartRepeatedActions.prototype.startPause = function (playerFrame) {
    for (var i = 0; i < this.pausableTimeouts.length; i++) {
        this.pausableTimeouts[i].pause();
    }
};

ActionStartRepeatedActions.prototype.stopPause = function (playerFrame) {
    for (var i = 0; i < this.pausableTimeouts.length; i++) {
        this.pausableTimeouts[i].resume();
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionStartRepeatedActions.prototype.destroyOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.pausableTimeouts, function (index, pausableTimeout) {
        pausableTimeout.stop();
    });
    this.pausableTimeouts = [];
    jQuery.each(this.subActions(), function (index, action) {
        action.destroyOnPlayerFrame(playerFrame);
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.setPointers = function (entitiesArr) {
    jQuery.each(this.subActions(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });

    if (this.stopCondition()) {
        this.stopCondition().setPointers(entitiesArr);
    }
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionStartRepeatedActions.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.subActions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });

    if (this.stopCondition()) {
        this.stopCondition().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionStartRepeatedActions}
 */
ActionStartRepeatedActions.prototype.fromJS = function (data) {
    this.allowMultiple(data.allowMultiple);
    this.startWithoutDelay(data.startWithoutDelay);
    this.stopConditionEnabled(data.stopConditionEnabled);

    if (data.stopCondition) {
        var stopCondition = requirementFactory(this.event, data.stopCondition.type);
        stopCondition.fromJS(data.stopCondition);
        this.stopCondition(stopCondition);
    }

    this.delayInMs(parseInt(data.delayInMs));

    var subActions = [];
    for (var i = 0; i < data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    if (data.hasOwnProperty('executionType')) {
        this.executionType(data.executionType);
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionStartRepeatedActions.prototype.toJS = function () {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i = 0; i < subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var stopCondition = null;
    if (this.stopCondition()) {
        stopCondition = this.stopCondition().toJS();
    }

    return {
        type: this.type,
        allowMultiple: this.allowMultiple(),
        startWithoutDelay: this.startWithoutDelay(),
        stopConditionEnabled: this.stopConditionEnabled(),
        stopCondition: stopCondition,
        delayInMs: parseInt(this.delayInMs()),
        subActions: subActionsData,
        executionType: this.executionType()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionConditional   /////////////////////////////////////////////////////

/**
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */



var ActionConditional = function (event) {
    this.event = event;

    // serialized:
    this.ifElseConditions = ko.observableArray([new ActionIfCondition(this.event)]);
    this.defaultSubActions = ko.observableArray([]);
    this.defaultConditionActive = ko.observable(false);

};

ActionConditional.prototype.type = "ActionConditional";
ActionConditional.prototype.label = "Requirement Actions (If...Then)";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionConditional.prototype.isValid = function () {
    return true;
};

ActionConditional.prototype.deleteIfCondition = function (index) {
    this.ifElseConditions.splice(index, 1);
};


ActionConditional.prototype.copyIfCondition = function (index) {
    var copyData = this.ifElseConditions()[index].toJS();
    var newCondition = new ActionIfCondition(this.event);
    newCondition.fromJS(copyData);
    var entiriesArr = this.event.parent.expData.entities;
    newCondition.setPointers(entiriesArr);
    this.ifElseConditions.push(newCondition);
};



ActionConditional.prototype.addIfCondition = function () {
    this.ifElseConditions.push(new ActionIfCondition(this.event));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionConditional.prototype.run = function (triggerParams) {
    var ifElseConditions = this.ifElseConditions();
    var foundTrueCase = false;
    var caseIndex = 0;
    while (foundTrueCase == false && caseIndex < ifElseConditions.length) {
        var requirement = ifElseConditions[caseIndex].requirement();
        var actionList = ifElseConditions[caseIndex].subActions();
        if (requirement == null || requirement.checkIfTrue(triggerParams)) {
            foundTrueCase = true;
            for (var j = 0; j < actionList.length; j++) {
                actionList[j].run(triggerParams);
            }
        }
        caseIndex++;
    }
    if (foundTrueCase == false && this.defaultConditionActive()) {
        var actionList = this.defaultSubActions();
        for (var j = 0; j < actionList.length; j++) {
            actionList[j].run(triggerParams);
        }
    }
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionConditional.prototype.setupOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.defaultSubActions(), function (index, action) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    });
    jQuery.each(this.ifElseConditions(), function (index, condition) {
        if (typeof condition.setupOnPlayerFrame === "function") {
            condition.setupOnPlayerFrame(playerFrame);
        }
    });
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionConditional.prototype.destroyOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.defaultSubActions(), function (index, action) {
        action.destroyOnPlayerFrame(playerFrame);
    });
    jQuery.each(this.ifElseConditions(), function (index, ifElseCond) {
        ifElseCond.destroyOnPlayerFrame(playerFrame);
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.setPointers = function (entitiesArr) {
    jQuery.each(this.defaultSubActions(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });
    jQuery.each(this.ifElseConditions(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionConditional.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.defaultSubActions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });
    jQuery.each(this.ifElseConditions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionConditional}
 */
ActionConditional.prototype.fromJS = function (data) {

    var defaultSubActions = [];
    for (var i = 0; i < data.defaultSubActions.length; i++) {
        var subAction = actionFactory(this.event, data.defaultSubActions[i].type);
        subAction.fromJS(data.defaultSubActions[i]);
        defaultSubActions.push(subAction);
    }
    this.defaultSubActions(defaultSubActions);

    var ifElseConditions = [];
    for (var i = 0; i < data.ifElseConditions.length; i++) {
        var ifCondition = new ActionIfCondition(this.event);
        ifCondition.fromJS(data.ifElseConditions[i]);
        ifElseConditions.push(ifCondition);
    }
    this.ifElseConditions(ifElseConditions);



    this.defaultConditionActive(data.defaultConditionActive);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionConditional.prototype.toJS = function () {
    var defaultSubActions = this.defaultSubActions();
    var defSubActions = [];
    for (var i = 0; i < defaultSubActions.length; i++) {
        defSubActions.push(defaultSubActions[i].toJS());
    }
    var ifElseConditions = this.ifElseConditions();
    var ifConditions = [];
    for (var i = 0; i < ifElseConditions.length; i++) {
        ifConditions.push(ifElseConditions[i].toJS());
    }

    return {
        type: this.type,
        defaultSubActions: defSubActions,
        ifElseConditions: ifConditions,
        defaultConditionActive: this.defaultConditionActive()
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////   ActionIfCondition  /////////////////////////////////////////////////////

/**
 * This action jumps to another frame or next trial.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionIfCondition = function (event) {
    this.event = event;
    this.requirement = ko.observable(new RequirementAND(this.event));
    this.requirement().setParent(this);
    this.subActions = ko.observableArray([]);
};

ActionIfCondition.prototype.type = "ActionIfCondition";
ActionIfCondition.prototype.label = "If Condition";

/**
 * recursively fill arr with all nested sub actions
 */
ActionIfCondition.prototype.getAllActions = function (arr) {
    var actions = this.subActions();
    for (var i = 0; i < actions.length; i++) {
        arr.push(actions[i]);
        if (typeof actions[i].getAllActions === "function") {
            actions[i].getAllActions(arr);
        }
    }
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionIfCondition.prototype.isValid = function () {
    return true;
};


/**
 * deletes all requirements.
 */
ActionIfCondition.prototype.deleteRequirement = function () {
    this.requirement(new RequirementAND(this));
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It either jumps to the
 * next frame or to specific frame or next trial.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionIfCondition.prototype.run = function (triggerParams) {
    var self = this;
};

/**
 * this function is called in the player when the frame starts. It sets up the knockout subscribers at the globalVars.
 *
 * @param {PlayerFrame} playerFrame - the corresponding playerFrame
 */
ActionIfCondition.prototype.setupOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.subActions(), function (index, action) {
        if (typeof action.setupOnPlayerFrame === "function") {
            action.setupOnPlayerFrame(playerFrame);
        }
    });
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionIfCondition.prototype.destroyOnPlayerFrame = function (playerFrame) {
    jQuery.each(this.subActions(), function (index, action) {
        action.destroyOnPlayerFrame(playerFrame);
    });
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.setPointers = function (entitiesArr) {
    jQuery.each(this.subActions(), function (index, elem) {
        elem.setPointers(entitiesArr);
    });
    this.requirement().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionIfCondition.prototype.reAddEntities = function (entitiesArr) {
    jQuery.each(this.subActions(), function (index, elem) {
        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    });
    this.requirement().reAddEntities(entitiesArr);
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionIfCondition}
 */
ActionIfCondition.prototype.fromJS = function (data) {

    var requirement = requirementFactory(this.event, data.requirement.type);
    requirement.fromJS(data.requirement);
    this.requirement(requirement);
    this.requirement().setParent(this);

    var subActions = [];
    for (var i = 0; i < data.subActions.length; i++) {
        var subAction = actionFactory(this.event, data.subActions[i].type);
        subAction.fromJS(data.subActions[i]);
        subActions.push(subAction);
    }
    this.subActions(subActions);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionIfCondition.prototype.toJS = function () {
    var subActions = this.subActions();
    var subActionsData = [];
    for (var i = 0; i < subActions.length; i++) {
        subActionsData.push(subActions[i].toJS());
    }

    var requirement = this.requirement().toJS();

    return {
        type: this.type,
        subActions: subActionsData,
        requirement: requirement
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////   ActionSetVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */

var ActionSetVariable = function (event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.operand = ko.observable(new OperandVariable(event));
};
ActionSetVariable.prototype.type = "ActionSetVariable";
ActionSetVariable.prototype.label = "Set / Record Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionSetVariable.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionSetVariable.prototype.setVariableBackRef = function (variable) {
    var self = this;
    variable.addBackRef(this, this.event, true, false, 'set variable', function (globalVar) {
        self.removeVariable();
    });
};

ActionSetVariable.prototype.removeVariable = function () {
    this.variable(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionSetVariable.prototype.run = function (triggerParams) {
    var rValue = this.operand().getValue(triggerParams);
    if (this.variable()) {
        this.variable().setValue(rValue);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionSetVariable.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetVariable.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
            this.setVariableBackRef(varToSet);
        }
        else {
            console.log("warning: missing variable!")
            this.variable(null);
        }
    }
    this.operand().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionSetVariable.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    if (this.operand() && this.operand().reAddEntities) {
        this.operand().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionSetVariable}
 */
ActionSetVariable.prototype.fromJS = function (data) {
    this.variable(data.variable);
    var operand = new OperandVariable(this.event);
    operand.fromJS(data.operand);
    this.operand(operand);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionSetVariable.prototype.toJS = function () {
    var varId = null;
    if (this.variable()) {
        if (typeof this.variable().id == 'function') {
            varId = this.variable().id();
        }
    }
    return {
        variable: varId,
        operand: this.operand().toJS(),
        type: this.type
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////   ActionMovingAvgFilter    ////////////////////////////////////////////////

/**
 * This action sets the value of a variable to a random number drawn from a specified distribution.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionMovingAvgFilter = function (event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.filterType = ko.observable('Uniform');
    this.numSamples = ko.observable(5).extend({ numeric: 1 });
    this.emaAlpha = ko.observable(0.1).extend({ numeric: 4 });
    this.operand = ko.observable(new OperandVariable(event));

    // not serialized:
    this.hist_samples = [];
    this.current_output = "uninitialized";
};
ActionMovingAvgFilter.prototype.type = "ActionMovingAvgFilter";
ActionMovingAvgFilter.prototype.label = "Moving Average Filter";
ActionMovingAvgFilter.prototype.filterTypes = [
    {
        key: "sma",
        label: "Simple Moving Average"
    },
    {
        key: "lwma",
        label: "Linear Weighted Moving Average"
    },
    {
        key: "ema",
        label: "Exponential Moving Average"
    }];

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionMovingAvgFilter.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionMovingAvgFilter.prototype.setVariableBackRef = function (variable) {
    if (variable) {
        variable.addBackRef(this, this.event, true, false, 'Moving Avg Filter');
    }
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionMovingAvgFilter.prototype.run = function (triggerParams) {

    if (this.variable()) {
        var rValue = this.operand().getRawValue(triggerParams);
        if (this.filterType() == "sma") {
            this.hist_samples.push(rValue);
            if (this.hist_samples.length > this.numSamples()) {
                this.hist_samples.shift();
            }
            var sum = 0;
            for (var k = 0; k < this.hist_samples.length; k++) {
                sum += this.hist_samples[k];
            }
            this.current_output = sum / this.hist_samples.length;
        }
        else if (this.filterType() == "lwma") {
            this.hist_samples.push(rValue);
            if (this.hist_samples.length > this.numSamples()) {
                this.hist_samples.shift();
            }
            var weighted_sum = 0;
            var total_weights = 0;
            for (var k = 0; k < this.hist_samples.length; k++) {
                weighted_sum += this.hist_samples[k] * (k + 1);
                total_weights += (k + 1);
            }
            this.current_output = weighted_sum / total_weights;
        }
        else if (this.filterType() == "ema") {
            if (this.current_output == "uninitialized") {
                // initialize filter:
                this.current_output = rValue;
            }
            else {
                this.current_output = this.current_output * (1 - this.emaAlpha()) + rValue * this.emaAlpha();
            }
        }
        this.variable().setValue(this.current_output);
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionMovingAvgFilter.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMovingAvgFilter.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
            this.setVariableBackRef(varToSet);
        }
        else {
            console.log("warning: missing variable!");
            this.variable(null);
        }
    }
    this.operand().setPointers(entitiesArr);
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMovingAvgFilter.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    if (this.operand() && this.operand().reAddEntities) {
        this.operand().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionMovingAvgFilter}
 */
ActionMovingAvgFilter.prototype.fromJS = function (data) {
    this.variable(data.variable);
    var operand = new OperandVariable(this.event);
    operand.fromJS(data.operand);
    this.operand(operand);
    this.filterType(data.filterType);
    this.numSamples(data.numSamples);
    this.emaAlpha(data.emaAlpha);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionMovingAvgFilter.prototype.toJS = function () {
    var varId = null;
    if (this.variable()) {
        if (typeof this.variable().id == 'function') {
            varId = this.variable().id();
        }
    }
    return {
        variable: varId,
        operand: this.operand().toJS(),
        filterType: this.filterType(),
        numSamples: this.numSamples(),
        emaAlpha: this.emaAlpha(),
        type: this.type
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////////////////   ActionModifyVariable    ////////////////////////////////////////////////

/**
 * This action allows to change the value of a variable.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionModifyVariable = function (event) {
    this.event = event;

    this.variable = ko.observable(null);
    this.operatorType = ko.observable(null);
    this.changeType = ko.observable(null);
    this.value = ko.observable(null);
    this.operatorTypes = ko.observableArray(["=", "+", "-", "*", "/"]);
    this.changeTypes = ko.observableArray(["value", "%", "variable"]);

    var self = this;

    this.variable.subscribe(function (newVal) {
        if (self.variable() != newVal) {
            self.operatorType(null);
            self.changeType(null);
            self.value(null);
        }
    });



    this.operatorType.subscribe(function (newVal) {
        if (newVal == "=") {
            self.changeTypes(["value", "%", "variable"]);
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
        else if (newVal == "*" || newVal == "/") {
            self.changeTypes(["value", "variable"]);
            self.value(1);
        }
        else if (newVal) {
            self.changeTypes(["value", "%", "variable"]);
            self.value(0);
        }

    });

    this.changeType.subscribe(function (newVal) {
        if (newVal == "%" && self.operatorType() == "=") {
            self.value(100);
        }
        else if (newVal == "value" && self.operatorType() == "=") {
            if (self.variable() && self.variable() instanceof GlobalVar) {
                self.value(self.variable().startValue().value());
            }
        }
    });

};
ActionModifyVariable.prototype.type = "ActionModifyVariable";
ActionModifyVariable.prototype.label = "Modify Variable";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionModifyVariable.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionModifyVariable.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'modify variable');
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionModifyVariable.prototype.run = function (triggerParams) {


    var operatorType = this.operatorType();
    var changeType = this.changeType();
    // make sure to calculate on numeric
    var value = this.value();

    // make sure to calculate on numeric
    var oldValue = this.variable().value();
    if (typeof oldValue === 'string') {
        oldValue = Number(oldValue);
    }
    if (typeof value === 'string') {
        value = Number(value);
    }
    var newValue;

    if (operatorType == '=') {
        if (changeType == 'value') {
            newValue = value;
        }
        else if (operatorType == '%') {
            newValue = oldValue * (value / 100);
        }
        else if (operatorType == 'variable') {
            newValue = parseFloat(value.value());
        }
    }
    else if (operatorType == '+') {
        if (changeType == 'value') {
            newValue = oldValue + value;
        }
        else if (operatorType == '%') {
            newValue = oldValue + (oldValue * (value / 100));
        }
        else if (operatorType == 'variable') {
            newValue = oldValue + parseFloat(value.value());
        }
    }
    else if (operatorType == '-') {
        if (changeType == 'value') {
            newValue = oldValue - value;
        }
        else if (operatorType == '%') {
            newValue = oldValue - (oldValue * (value / 100));
        }
        else if (operatorType == 'variable') {
            newValue = oldValue - parseFloat(value.value());
        }
    }
    else if (operatorType == '*') {
        if (changeType == 'value') {
            newValue = oldValue * value;
        }
        else if (operatorType == '%') {
            newValue = oldValue * (oldValue * (value / 100));
        }
        else if (operatorType == 'variable') {
            newValue = oldValue * parseFloat(value.value());
        }
    }
    else if (operatorType == '/') {
        if (changeType == 'value') {
            newValue = oldValue / value;
        }
        else if (operatorType == '%') {
            newValue = oldValue / (oldValue * (value / 100));
        }
        else if (operatorType == 'variable') {
            newValue = oldValue / parseFloat(value.value());
        }
    }
    this.variable().value(newValue);
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionModifyVariable.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyVariable.prototype.setPointers = function (entitiesArr) {

    if (this.variable()) {
        var mainVariable = entitiesArr.byId[this.variable()];
        this.variable(mainVariable);
    }


    if (entitiesArr.byId[this.value()]) {
        var valueVariable = entitiesArr.byId[this.value()];
        this.value(valueVariable);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionModifyVariable.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    if (this.value()) {
        if (!entitiesArr.byId.hasOwnProperty(this.value().id())) {
            entitiesArr.push(this.value());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyVariable}
 */
ActionModifyVariable.prototype.fromJS = function (data) {

    this.variable(data.variable);
    this.operatorType(data.operatorType);
    this.changeType(data.changeType);
    this.value(data.value);
    this.operatorTypes(data.operatorTypes);
    this.changeTypes(data.changeTypes);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionModifyVariable.prototype.toJS = function () {
    var value = null;
    if (this.value() && this.value().hasOwnProperty("id")) {
        value = this.value.id();
    }
    else {
        value = this.value();
    }
    return {
        variable: this.variable().id(),
        operatorType: this.operatorType(),
        changeType: this.changeType(),
        value: value,
        operatorTypes: this.operatorTypes(),
        changeTypes: this.changeTypes(),
        type: this.type

    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////   ActionReadParamFromURL    ////////////////////////////////////////////////

/**
 * This action sets the value of a variable to a random number drawn from a specified distribution.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionReadParamFromURL = function (event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.paramName = ko.observable('');

};
ActionReadParamFromURL.prototype.type = "ActionReadParamFromURL";
ActionReadParamFromURL.prototype.label = "Get URL Parameter";


/**
 * This function is called when the parent event was triggered and the requirements are true. It draws a random number
 * and saves it into the globalVar.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionReadParamFromURL.prototype.run = function () {
    this.variable().value().setValue(this.getParameterByName());
};
ActionReadParamFromURL.prototype.getParameterByName = function () {
    var name = this.paramName();
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionReadParamFromURL.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionReadParamFromURL.prototype.setVariableBackRef = function (variable) {
    if (variable) {
        variable.addBackRef(this, this.event, true, false, 'Save URL Param');
    }
};


/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionReadParamFromURL.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionReadParamFromURL.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionReadParamFromURL.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDrawRandomNumber}
 */
ActionReadParamFromURL.prototype.fromJS = function (data) {
    this.variable(data.variable);
    this.paramName(data.paramName);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionReadParamFromURL.prototype.toJS = function () {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        variable: variableId,
        paramName: this.paramName()
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////











/////////////////////////////////////////////   ActionDrawRandomNumber    ////////////////////////////////////////////////

/**
 * This action sets the value of a variable to a random number drawn from a specified distribution.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDrawRandomNumber = function (event) {
    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.discrete = ko.observable(false);
    this.multiple = ko.observable(false);
    this.replacement = ko.observable(false);
    this.numDraws = ko.observable(1);
    this.distribution = ko.observable('Uniform');
    this.distributionParam1 = ko.observable(0).extend({ numeric: 4 }); // i.e. lower bound of Uniform or mean of Gaussian
    this.distributionParam2 = ko.observable(1).extend({ numeric: 4 }); // i.e. upper bound of Uniform or std of Gaussian
};
ActionDrawRandomNumber.prototype.type = "ActionDrawRandomNumber";
ActionDrawRandomNumber.prototype.label = "Draw Random Number";
ActionDrawRandomNumber.prototype.continousDistributions = ["Uniform", "Gaussian"];
ActionDrawRandomNumber.prototype.discreteDistributions = ["Uniform"];


/**
 * This function is called when the parent event was triggered and the requirements are true. It draws a random number
 * and saves it into the globalVar.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionDrawRandomNumber.prototype.run = function (triggerParams) {
    var value;
    if (this.discrete()) { // draw from discrete distribution

        if (this.multiple()) { // draw multiple values at the same time

            if (this.replacement()) { // draw with replacement

                var numDraws = this.numDraws();
                var randNums = [];
                if (this.distribution() == "Uniform") {
                    for (var k = 0; k < numDraws; k++) {
                        var min = this.distributionParam1();
                        var max = this.distributionParam2();
                        max += 1;
                        value = Math.floor(Math.random() * (max - min) + min);
                        if (value > max) {
                            value = max;
                        }
                        randNums.push(value);
                    }
                }
                this.variable().value().setValue(randNums);

            }
            else { // without replacement

                var randNums = [];
                if (this.distribution() == "Uniform") {
                    var min = this.distributionParam1();
                    var max = this.distributionParam2();
                    var randNumsPossible = [];
                    for (var k = min; k <= max; k++) {
                        value = k;
                        randNumsPossible.push(value);
                    }
                    var numDraws = this.numDraws();
                    while (randNums.length < numDraws) {
                        var randNumsTmp = ExpTrialLoop.prototype.reshuffle(randNumsPossible);
                        randNums = randNums.concat(randNumsTmp);
                    }
                    randNums = randNums.slice(0, numDraws);
                }
                this.variable().value().setValue(randNums);

            }

        }
        else { // single

            if (this.distribution() == "Uniform") {
                var min = this.distributionParam1();
                var max = this.distributionParam2();
                max += 1;
                value = Math.floor(Math.random() * (max - min) + min);
                if (value > max) {
                    value = max;
                }
                this.variable().value().setValue(value);
            }

        }
    }
    else { // continuous

        if (this.multiple()) { // draw multiple values at the same time
            var randNums = [];
            for (var k = 0, len = this.numDraws(); k < numDraws; k++) {
                randNums.push(this.drawFromContinous());
            }
            this.variable().value().setValue(randNums);
        }
        else {
            this.variable().value().setValue(this.drawFromContinous());
        }

    }

};

/**
 * draw a single value from a continous distribution.
 * @returns {*}
 */
ActionDrawRandomNumber.prototype.drawFromContinous = function () {
    var value = null;
    if (this.distribution() == "Uniform") {
        var min = this.distributionParam1();
        var max = this.distributionParam2();
        value = Math.random() * (max - min) + min;
    }
    else if (this.distribution() == "Gaussian") {
        var mean = this.distributionParam1();
        var std = this.distributionParam2();
        value = mean + randn_marsaglia_polar() * std;
    }
    return value;
};

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionDrawRandomNumber.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionDrawRandomNumber.prototype.setVariableBackRef = function (variable) {
    if (variable) {
        variable.addBackRef(this, this.event, true, false, 'Save Random Num');
    }
};

/**
 * draws a Gaussian distributed random number (randn) using Box-Muller transform.
 *
 * @returns {number}
 */
function randn_bm() {
    var u = 1 - Math.random(); // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * creates a Gaussian random number generator (randn) with marsaglia_polar algorithm.
 *
 * randn_marsaglia_polar is a function that generates and returns new randn numbers.
 */
var randn_marsaglia_polar = (function () {
    var y2;
    var isSpareReady = false;

    /**
     * draws a gaussian distributed random number (randn) with marsaglia_polar algorithm
     *
     * @returns {number}
     */
    function randn_mp() {
        var y1;
        if (isSpareReady) {
            y1 = y2;
            isSpareReady = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            isSpareReady = true;
        }
        return y1;
    }

    return randn_mp;
})();

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionDrawRandomNumber.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDrawRandomNumber.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var globVar = entitiesArr.byId[this.variable()];
        this.variable(globVar);
        this.setVariableBackRef(globVar);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionDrawRandomNumber.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionDrawRandomNumber}
 */
ActionDrawRandomNumber.prototype.fromJS = function (data) {
    this.variable(data.variable);
    if (data.hasOwnProperty('discrete')) {
        this.discrete(data.discrete);
    }
    if (data.hasOwnProperty('multiple')) {
        this.multiple(data.multiple);
    }
    if (data.hasOwnProperty('replacement')) {
        this.replacement(data.replacement);
    }
    if (data.hasOwnProperty('numDraws')) {
        this.numDraws(data.numDraws);
    }
    this.distribution(data.distribution);
    this.distributionParam1(data.distributionParam1);
    this.distributionParam2(data.distributionParam2);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionDrawRandomNumber.prototype.toJS = function () {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        variable: variableId,
        discrete: this.discrete(),
        multiple: this.multiple(),
        replacement: this.replacement(),
        numDraws: this.numDraws(),
        distribution: this.distribution(),
        distributionParam1: this.distributionParam1(),
        distributionParam2: this.distributionParam2()
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////  ActionControlWebGazer/  //////////////////////////////////////////////

/**
 * This action allows to clear WG's data.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlWebGazer = function (event) {
    this.event = event;

    // serialized
    this.actionType = ko.observable("clear");

};


ActionControlWebGazer.prototype.type = "ActionControlWebGazer";
ActionControlWebGazer.prototype.label = "Control Eyetracking";
ActionControlWebGazer.prototype.actionTypes = ["start", "pause", "end", "clear"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlWebGazer.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlWebGazer.prototype.run = function (triggerParams) {

    if (this.actionType() == 'start') {
        if (!player.eyetrackerLoaded) {
            player.eyetrackerLoaded = true;

            function startupWebgazer() {
                // now start webgazer:
                function ridgeNoMouseReg() {
                    tmp = new webgazer.reg.RidgeReg();
                    tmp.trailTime = -Infinity;
                    tmp.trailDataWindow = 0;
                    return tmp;
                }
                webgazer.addRegressionModule("ridgeNoMouse", ridgeNoMouseReg);
                webgazer.setRegression('ridgeNoMouse') /* currently must set regression and tracker   use ridge or weightedRidge*/
                    .setTracker('clmtrackr')
                    .setGazeListener(function (data, clock) {
                        if (data) {
                            player.currentFrame.triggerEyetracking(data);
                        }
                    })
                    .begin();
                //.showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
            }

            if (window.hasOwnProperty('webgazer')) {
                startupWebgazer();
            }
            else {
                // first dynamically load webgazer.js:
                var script = document.createElement('script');
                script.onload = function () {
                    startupWebgazer();
                };
                script.src = "assets/js/webgazer.js";
                document.head.appendChild(script);
            }
        }
    }
    else if (this.actionType() == 'end') {
        if (player.eyetrackerLoaded) {
            webgazer.clearGazeListener();
            webgazer.end();
            player.eyetrackerLoaded = false;
        }
    }
    else if (this.actionType() == 'pause') {
        webgazer.pause();
    }
    else if (this.actionType() == 'clear') {
        webgazer.clearData();
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlWebGazer.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlWebGazer.prototype.setPointers = function (entitiesArr) {
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlWebGazer.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlWebGazer}
 */
ActionControlWebGazer.prototype.fromJS = function (data) {
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlWebGazer.prototype.toJS = function () {
    return {
        type: this.type,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////






/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlAV = function (event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.actionType = ko.observable(null);

};


ActionControlAV.prototype.type = "ActionControlAV";
ActionControlAV.prototype.label = "Control Audio/Video Obj";
ActionControlAV.prototype.actionTypes = ["start", "pause", "end"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlAV.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlAV.prototype.run = function (triggerParams) {
    if (this.target()) {
        if (this.actionType() == 'start') {

            if (this.target().content() instanceof VideoElement &&
                (this.event.parent.expData.varBrowserSpec().value().value().indexOf("Safari") >= 0 ||
                    this.event.parent.expData.varSystemSpec().value().value().indexOf("iOS") >= 0)) {

                if (this.event.hasUserGestureTrigger()) {
                    // need to unmute again, in case an experiment uses auto play OnFrameStart but also allows to later manually start the video:
                    this.target().content().executeAction("Unmute");
                }
                else {
                    this.target().content().executeAction("Mute");
                }
            }

            this.target().content().executeAction("StartPlayback");
        }
        else if (this.actionType() == 'end') {
            this.target().content().executeAction("StopPlayback");

        }
        else if (this.actionType() == 'pause') {
            this.target().content().executeAction("PausePlayback");
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlAV.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlAV.prototype.setPointers = function (entitiesArr) {
    if (this.target()) {
        this.target(entitiesArr.byId[this.target()]);
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlAV.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlAV}
 */
ActionControlAV.prototype.fromJS = function (data) {
    this.target(data.target);
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlAV.prototype.toJS = function () {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////  ActionControlAV/  //////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlElement = function (event) {
    this.event = event;

    // serialized
    this.target = ko.observable(null);
    this.actionType = ko.observable(null);

};


ActionControlElement.prototype.type = "ActionControlElement";
ActionControlElement.prototype.label = "Control Object";

/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlElement.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlElement.prototype.run = function (triggerParams) {
    if (this.target()) {
        var viewElem = player.currentFrame.frameView.viewElements.byId[this.target().id()];
        if (viewElem) {
            viewElem.dataModel.executeAction(this.actionType());
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlElement.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlElement.prototype.setPointers = function (entitiesArr) {
    if (this.target()) {
        this.target(entitiesArr.byId[this.target()]);
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlElement.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlElement}
 */
ActionControlElement.prototype.fromJS = function (data) {
    this.target(data.target);
    this.actionType(data.actionType);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlElement.prototype.toJS = function () {
    var targetId = null;
    if (this.target()) {
        targetId = this.target().id();
    }
    return {
        type: this.type,
        target: targetId,
        actionType: this.actionType()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////////////  ActionControlTimer ///////////////////////////////////////////////

/**
 * This action allows to start or stop the playback of audio or video elements.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionControlTimer = function (event) {
    this.event = event;

    // serialized
    this.timerVar = ko.observable(null);
    this.actionType = ko.observable(null);
    this.updateRate = ko.observable(50);// in milli seconds
    this.updateValue = ko.observable(null);

    // not serialized
    this.referencesToTriggers = [];

};


ActionControlTimer.prototype.type = "ActionControlTimer";
ActionControlTimer.prototype.label = "Control Timer";
ActionControlTimer.prototype.actionTypes = ["countUp", "countDown", "set", "pause"];



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionControlTimer.prototype.isValid = function () {
    return true;
};

ActionControlTimer.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'control timer');
};


ActionControlTimer.prototype.removeVariable = function () {
    this.timerVar(null);
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It starts or stops
 * playback of audio or video files in the player.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionControlTimer.prototype.run = function (triggerParams) {
    if (this.timerVar()) {
        if (this.actionType() == 'countUp') {
            this.timerVar().value().startCountup();
        }
        else if (this.actionType() == 'countDown') {
            this.timerVar().value().startCountdown();
        }
        else if (this.actionType() == 'set') {
            var updateValue = parseInt(this.updateValue());
            this.timerVar().value().setValue(updateValue);
        }
        else if (this.actionType() == 'pause') {
            this.timerVar().value().pause();
        }
    }
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionControlTimer.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlTimer.prototype.setPointers = function (entitiesArr) {
    if (this.timerVar()) {
        var timerVar = entitiesArr.byId[this.timerVar()];
        if (timerVar) {
            this.timerVar(timerVar);
            this.setVariableBackRef(timerVar);
        }
    }

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionControlTimer.prototype.reAddEntities = function (entitiesArr) {
    if (this.timerVar()) {
        if (!entitiesArr.byId.hasOwnProperty(this.timerVar().id())) {
            entitiesArr.push(this.timerVar());
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionControlTimer}
 */
ActionControlTimer.prototype.fromJS = function (data) {
    this.timerVar(data.timerVar);
    this.actionType(data.actionType);
    this.updateValue(data.updateValue);
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionControlTimer.prototype.toJS = function () {
    var timerVar = null;
    if (this.timerVar()) {
        timerVar = this.timerVar().id();
    }
    return {
        type: this.type,
        timerVar: timerVar,
        actionType: this.actionType(),
        updateValue: this.updateValue()
    };
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




//////////////////////////////////////  ActionEndSession  //////////////////////////////////////////

/**
 * This action end the session, sends end session time and leaves the fullscreen.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionEndSession = function (event) {
    this.event = event;
    this.showEndPage = ko.observable(true);
    this.recordDataBeforeFinish = ko.observable(true);

};
ActionEndSession.prototype.type = "ActionEndSession";
ActionEndSession.prototype.label = "End Session";



/**
 * returns true if all settings are valid (used in the editor).
 * @returns {boolean}
 */
ActionEndSession.prototype.isValid = function () {
    return true;
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It records the answers
 * of a questionaire and directly sends them to the server.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionEndSession.prototype.run = function (triggerParams) {
    if (this.recordDataBeforeFinish) {
        player.recordData();
    }
    player.finishSession(this.showEndPage());
};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionEndSession.prototype.destroyOnPlayerFrame = function (playerFrame) {
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionEndSession.prototype.setPointers = function (entitiesArr) {

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionEndSession.prototype.reAddEntities = function (entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionRecordQuestionaireResponse}
 */
ActionEndSession.prototype.fromJS = function (data) {
    this.showEndPage(data.showEndPage);
    if (data.hasOwnProperty('recordDataBeforeFinish')) {
        this.recordDataBeforeFinish(data.recordDataBeforeFinish);
    }
    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionEndSession.prototype.toJS = function () {
    return {
        type: this.type,
        showEndPage: this.showEndPage(),
        recordDataBeforeFinish: this.recordDataBeforeFinish()
    };
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////





//////////////////////////////////////  ActionDistributeVariable  //////////////////////////////////////////

/**
 * This action distributes variables to other players within a joint experiment.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionDistributeVariable = function (event) {
    var self = this;

    this.event = event;

    // serialized
    this.variable = ko.observable(null);
    this.operand = ko.observable(new OperandVariable(event));
    this.playersToDistributeToMode = ko.observable("All");
    this.playersToDistributeTo = this.initPlayersToDistributeTo();
    this.blockVarUntilDone = ko.observable(true);
    this.isInitialized = false;

};

ActionDistributeVariable.prototype.type = "ActionDistributeVariable";
ActionDistributeVariable.prototype.label = "Distribute Variable";

/**
 * If an array is passed to this function, it is assumed to contain only playerIds of players who are selected (for fromJS)
 * @param playerArray
 */
ActionDistributeVariable.prototype.initPlayersToDistributeTo = function (playerArray) {

    var observableArray = ko.observableArray([]);

    for (var i = 0; i < this.event.parent.expData.numPartOfJointExp(); i++) {
        var isSelected;
        if (!playerArray || playerArray.indexOf(i) > -1) {
            isSelected = true;
        } else {
            isSelected = false;
        }
        observableArray.push({
            playerId: i + 1,
            isSelected: ko.observable(isSelected)
        });
    }
    return observableArray;
};

ActionDistributeVariable.prototype.isValid = function () {
    return true;
};

ActionDistributeVariable.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'dist variable');
};

// like ActionSetVariable
ActionDistributeVariable.prototype.fromJS = function (data) {
    this.variable(data.variable);
    this.operand(null);
    this.playersToDistributeTo(null);
    this.playersToDistributeToMode(null);
    this.blockVarUntilDone(null);

    if (data.operand) {
        var operand = new OperandVariable(this.event);
        operand.fromJS(data.operand);
        this.operand(operand);
    }

    if (data.playersToDistributeTo) {
        this.playersToDistributeTo = this.initPlayersToDistributeTo(data.playersToDistributeTo);
    }

    if (data.playersToDistributeToMode) {
        this.playersToDistributeToMode(data.playersToDistributeToMode);
    }

    if (data.hasOwnProperty('blockVarUntilDone')) { // because of boolean value
        this.blockVarUntilDone(data.blockVarUntilDone);
    }

    return this;
};

// like ActionSetVariable
ActionDistributeVariable.prototype.toJS = function (data) {
    var varId = null;
    var operand = null;
    var playersToDistributeTo = null;
    var playersToDistributeToMode = null;
    var blockVarUntilDone = false;

    if (this.variable()) {
        varId = this.variable().id();
    }

    if (this.operand()) {
        operand = this.operand().toJS();
    }

    if (this.playersToDistributeTo()) {
        var playersToDistributeToArray = [];
        // jQuery mapping?
        for (var i = 0; i < this.playersToDistributeTo().length; i++) {
            if (this.playersToDistributeTo()[i].isSelected()) {
                playersToDistributeToArray.push(i);
            }
        }
        playersToDistributeTo = playersToDistributeToArray;
    }

    if (this.playersToDistributeToMode()) {
        playersToDistributeToMode = this.playersToDistributeToMode();
    }

    if (this.hasOwnProperty('blockVarUntilDone')) { // because of boolean value
        blockVarUntilDone = this.blockVarUntilDone();
    }

    return {
        variable: varId,
        operand: operand,
        playersToDistributeTo: playersToDistributeTo,
        playersToDistributeToMode: playersToDistributeToMode,
        blockVarUntilDone: blockVarUntilDone,
        type: this.type
    };
};

ActionDistributeVariable.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
        }
    }
    this.operand().setPointers(entitiesArr);
};

ActionDistributeVariable.prototype.reAddEntities = function (entitiesArr) {
    // add operand:
    if (this.operand() && this.operand().reAddEntities) {
        this.operand().reAddEntities(entitiesArr);
    }

    // add variable:
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};

ActionDistributeVariable.prototype.run = function (triggerParams) {
    var self = this;

    var operandValueToSend = null;
    if (self.operand()) {
        operandValueToSend = self.operand().getRawValue();
    }

    // jQuery mapping?
    var playersToDistributeToArray = [];
    for (var i = 0; i < self.playersToDistributeTo().length; i++) {
        if (self.playersToDistributeToMode() == "All" || self.playersToDistributeTo()[i].isSelected()) {
            playersToDistributeToArray.push(self.playersToDistributeTo()[i].playerId);
        }
    }

    //console.log("try to distribute variable '" + self.variable().name() + "'");

    player.jointExpLobby.distributeVariable(self.variable(), operandValueToSend, playersToDistributeToArray, self.blockVarUntilDone());

};

ActionDistributeVariable.prototype.destroyOnPlayerFrame = function () {
};






//////////////////////////////////////  ActionSendExternalTrigger  //////////////////////////////////////////

/**
 * This action distributes variables to other players within a joint experiment.
 *
 * @param {ExpEvent} event - the parent event
 * @constructor
 */
var ActionSendExternalTrigger = function (event) {
    var self = this;

    this.event = event;
    // serialized
    this.variable = ko.observable(null);
    this.message = ko.observable('');
};

ActionSendExternalTrigger.prototype.type = "ActionSendExternalTrigger";
ActionSendExternalTrigger.prototype.label = "Send External Trigger";


ActionSendExternalTrigger.prototype.isValid = function () {
    return true;
};

ActionSendExternalTrigger.prototype.setVariableBackRef = function (variable) {
    variable.addBackRef(this, this.event, true, false, 'dist variable');
};

// like ActionSetVariable
ActionSendExternalTrigger.prototype.fromJS = function (data) {
    this.variable(data.variable);
    this.message(data.message);
    return this;
};

// like ActionSetVariable
ActionSendExternalTrigger.prototype.toJS = function (data) {
    var varId = null;
    if (this.variable()) {
        varId = this.variable().id();
    }
    return {
        variable: varId,
        message: this.message(),
        type: this.type
    };
};

ActionSendExternalTrigger.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        var varToSet = entitiesArr.byId[this.variable()];
        if (varToSet) {
            this.variable(varToSet);
        }
    }
};

ActionSendExternalTrigger.prototype.reAddEntities = function (entitiesArr) {

    // add variable:
    if (this.variable()) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
};


ActionSendExternalTrigger.prototype.run = function (triggerParams) {
    var value = null;
    if (this.variable()) {
        value = this.variable().getValue();
    }
    var data = {
        msg: this.message(),
        value: value
    };
    player.externalWebsocket.send(JSON.stringify(data));

};

ActionSendExternalTrigger.prototype.destroyOnPlayerFrame = function () {
};









////////////////////////////////////////  ActionMathAndStats ///////////////////////////////////////////////////

var ActionMathAndStats = function (event) {
    var self = this;
    this.event = event;

    // serialized
    this.operationType = ko.observable('Array Operations');
    this.inputs = ko.observableArray([]);
    this.outputs = ko.observableArray([]);
    this.functionKey = ko.observable(ActionMathAndStats.prototype.arrayOperations[9].key); // sum as start value

    // computed
    this.currentFunctions = ko.computed(function () {
        if (self.operationType() == "Array Operations") {
            return ActionMathAndStats.prototype.arrayOperations;
        }
        else if (self.operationType() == "Linear Algebra") {
            return ActionMathAndStats.prototype.algebraOerations;
        }
        else if (self.operationType() == "Statistical Tests") {
            return ActionMathAndStats.prototype.statisticalOerations;
        }
    });

    // not serialized
    this.backRefsIn = {};
    this.backRefsOut = {};

    this.resetValues();
    this.testOutcome = ko.observable(null);

};

ActionMathAndStats.prototype.resetValues = function () {
    var self = this;

    // remove old variable references
    this.inputs().forEach(function (entry, idx) {
        if (entry() instanceof GlobalVar) {
            self.removeInVariable(idx);
        }
    });

    this.outputs().forEach(function (entry, idx) {
        if (entry() instanceof GlobalVar) {
            self.removeOutVariable(idx);
        }
    });

    // reset values
    var function_spec = this.getFcnSpec();
    if (function_spec) {
        var inp = [];
        function_spec.inputs.forEach(function (entry) {
            inp.push(ko.observable(entry.value));
        });
        this.inputs(inp);

        var out = [];
        function_spec.outputs.forEach(function (entry) {
            out.push(ko.observable(entry.value));
        });
        this.outputs(out);
    }
    else {
        this.inputs([]);
        this.outputs([]);
    }

};

ActionMathAndStats.prototype.isValid = function () {
    return true;
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionMathAndStats.prototype.setInVarBackRef = function (idx) {
    if (this.inputs()[idx] instanceof GlobalVar) {
        this.backRefsIn[idx] = this.inputs()[idx].addBackRef(this, this.event, false, true, 'math & statistics');
    }
};

/**
 * This function is used to associate a global variable with this action, so that the variable knows where it is used.
 * @param {GlobalVar} variable - the variable which is recorded.
 */
ActionMathAndStats.prototype.setOutVarBackRef = function (idx) {
    if (this.outputs()[idx] instanceof GlobalVar) {
        this.backRefsOut[idx] = this.outputs()[idx].addBackRef(this, this.event, true, false, 'math & statistics');
    }
};

ActionMathAndStats.prototype.removeInVariable = function (idx) {
    if (this.inputs()[idx] instanceof GlobalVar && this.backRefsIn[idx]) {
        this.inputs()[idx].removeBackRef(this.backRefsIn[idx]);
        delete this.backRefsIn[idx]
    }
};

ActionMathAndStats.prototype.removeOutVariable = function (idx) {
    if (this.outputs()[idx] instanceof GlobalVar && this.backRefsOut[idx]) {
        this.outputs()[idx].removeBackRef(this.backRefsOut[idx]);
        delete this.backRefsOut[idx]
    }
};

/**
 * This function is called when the parent event was triggered and the requirements are true. It sets a specific
 * globalVar to a specific value.
 *
 * @param {object} triggerParams - Contains some additional values that are specifically passed through by the trigger.
 */
ActionMathAndStats.prototype.run = function (triggerParams) {
    var self = this;
    var func_spec = this.getFcnSpec();
    if (func_spec) {
        var inputData = [];
        this.inputs().forEach(function (input) {
            var inp = input();
            if (inp instanceof GlobalVar) {
                inp = inp.getValueAsJS();
            }
            if ($.isNumeric(inp)) {
                inp = parseFloat(inp);
            }
            inputData.push(inp);
        });
        if (inputData.length > 0) {
            var globalVarOutput = self.outputs()[0]();// ToDo  change outcome to more variables in the future
            var outcome = func_spec.operation.apply(self, inputData);
            globalVarOutput.setValue(outcome);
            self.testOutcome(globalVarOutput.getValueAsJS());
        }
        else {
            console.log("Warning: No input data specified for Math & Stats Action")
        }
    }

};

/**
 * cleans up the subscribers and callbacks in the player when the frame ended.
 * @param playerFrame
 */
ActionMathAndStats.prototype.destroyOnPlayerFrame = function (playerFrame) {

};

ActionMathAndStats.prototype.getFcnSpec = function () {
    return ActionMathAndStats.prototype.allOperationsByKey[this.functionKey()];
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMathAndStats.prototype.setPointers = function (entitiesArr) {

    var self = this;

    // reset values
    var function_spec = this.getFcnSpec();
    if (function_spec) {
        var inputs_orig = self.inputs();
        function_spec.inputs.forEach(function (entry, idx) {
            var inputObs = inputs_orig[idx];
            var inputVal = inputObs();
            if (inputVal && inputVal.hasOwnProperty("globalVarId")) {
                inputObs(entitiesArr.byId[inputVal.globalVarId]);
            }
        });
        this.inputs().forEach(function (entry, idx) {
            if (entry instanceof GlobalVar) {
                self.setInVarBackRef(idx);
            }
        });

        var out_original = self.outputs();
        function_spec.outputs.forEach(function (entry, idx) {
            var outputObs = out_original[idx];
            var outputVal = outputObs();
            if (outputVal && outputVal.hasOwnProperty("globalVarId")) {
                outputObs(entitiesArr.byId[outputVal.globalVarId]);
            }
        });
        this.outputs().forEach(function (entry, idx) {
            if (entry instanceof GlobalVar) {
                self.setOutVarBackRef(idx);
            }
        });
    }
    else {
        this.inputs([]);
        this.outputs([]);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ActionMathAndStats.prototype.reAddEntities = function (entitiesArr) {

    this.inputs().forEach(function (entry) {
        if (entry instanceof GlobalVar) {
            if (!entitiesArr.byId.hasOwnProperty(entry.id())) {
                entitiesArr.push(entry);
            }
        }
    });

    this.outputs().forEach(function (entry) {
        if (entry instanceof GlobalVar) {
            if (!entitiesArr.byId.hasOwnProperty(entry.id())) {
                entitiesArr.push(entry);
            }
        }
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ActionModifyArray}
 */
ActionMathAndStats.prototype.fromJS = function (data) {
    this.inputs(jQuery.map(data.inputs, function (val) {
        return ko.observable(val);
    }));
    this.outputs(jQuery.map(data.outputs, function (val) {
        return ko.observable(val);
    }));
    this.operationType(data.operationType);
    this.functionKey(data.functionKey);

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ActionMathAndStats.prototype.toJS = function () {
    var inputs = [];
    this.inputs().forEach(function (entry) {
        if (entry() instanceof GlobalVar) {
            inputs.push({
                globalVarId: entry().id()
            });
        }
        else {
            inputs.push(entry());
        }
    });

    var outputs = [];
    this.outputs().forEach(function (entry) {
        if (entry() instanceof GlobalVar) {
            outputs.push({
                globalVarId: entry().id()
            });
        }
        else {
            outputs.push(entry());
        }
    });

    return {
        type: this.type,
        operationType: this.operationType(),
        functionKey: this.functionKey(),
        inputs: inputs,
        outputs: outputs
    };
};



ActionMathAndStats.prototype.type = "ActionMathAndStats";
ActionMathAndStats.prototype.label = "Math & Statistics";
ActionMathAndStats.prototype.operationTypes = ["Array Operations", "Linear Algebra", "Statistical Tests"];


ActionMathAndStats.prototype.statisticalOerations = [

    {
        key: "zscore",
        name: 'zscore',
        inputs: [
            {
                name: "Input Array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "Input Value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "stdSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "Use Sample Standard Deviation",
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }

        ],
        outputs: [
            {
                name: "output Z-score",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            var arrIn = arguments[0];
            var val = arguments[1];
            var stdSelection = arguments[2];
            var result = jStat(arrIn).zscore(val, stdSelection);
            return result;
        }
    },
    {
        key: "ztest",
        name: 'ztest',
        inputs: [
            {
                name: "Input Array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "Input Value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "twoSided",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "two sided",
                relationGlobalVar: "cannotBeGlobalVar",
                required: true,
                value: false,
                formType: "boolean"
            },
            {
                name: "stdSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "Use Sample Standard Deviation",
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }

        ],
        outputs: [
            {
                name: "output p-value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            var arrIn = arguments[0];
            var val = arguments[1];
            var sided = arguments[2] ? 2 : 1;
            var stdSelection = arguments[3];
            var result = jStat(arrIn).ztest(val, sided, stdSelection);
            return result;
        }
    },


    {
        key: "tscore",
        name: 'tscore',
        inputs: [
            {
                name: "Input Array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "Input Value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            }
        ],
        outputs: [
            {
                name: "output t-score",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            var arrIn = arguments[0];
            var val = arguments[1];
            var result = jStat(arrIn).tscore(val);
            return result;
        }
    },
    {
        key: "ttest",
        name: 'ttest',
        inputs: [
            {
                name: "Input Array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "Input Value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "twoSided",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "two sided",
                relationGlobalVar: "cannotBeGlobalVar",
                required: true,
                value: false,
                formType: "boolean"
            }
        ],
        outputs: [
            {
                name: "output p-value",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            var arrIn = arguments[0];
            var val = arguments[1];
            var sided = arguments[2] ? 2 : 1;
            var result = jStat(arrIn).ttest(val, sided);
            return result;
        }
    },
];


ActionMathAndStats.prototype.algebraOerations = [
    // with parameters
    {
        key: "add",
        name: 'add',
        inputs: [
            {
                name: "input array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "input scalar",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).add(arguments[1]);
            return result[0];
        }
    },
    {
        key: "subtract",
        name: 'subtract',
        inputs: [
            {
                name: "input array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "input scalar",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).subtract(arguments[1]);
            return result[0];
        }
    },
    {
        key: "divide",
        name: 'divide',
        inputs: [
            {
                name: "input array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "input scalar",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).divide(arguments[1]);
            return result[0];
        }
    },
    {
        key: "multiply",
        name: 'multiply',
        inputs: [
            {
                name: "input array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "input scalar",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).multiply(arguments[1]);
            return result[0];
        }
    },
    {
        key: "dot",
        name: 'dot',
        inputs: [
            {
                name: "vector 1",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "vector 2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).dot(arguments[1]);
            return result[0];
        }
    },
    {
        key: "pow",
        name: 'pow',
        inputs: [
            {
                name: "input array",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "input scalar",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).pow(arguments[1]);
            return result[0];
        }
    },
    {
        key: "exp",
        name: 'exp',
        inputs: [
            {
                name: "input",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            if (arguments[0] instanceof Array) {
                var result = jStat(arguments[0]).exp();
                return result[0];
            }
            else {
                var result = jStat([arguments[0]]).exp();
                return result[0][0];
            }
        }
    },
    {
        key: "log",
        name: 'log (natural log)',
        inputs: [
            {
                name: "input",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            if (arguments[0] instanceof Array) {
                var result = jStat(arguments[0]).log();
                return result[0];
            }
            else {
                var result = jStat([arguments[0]]).log();
                return result[0][0];
            }
        }
    },
    {
        key: "abs",
        name: 'abs',
        inputs: [
            {
                name: "input",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array", "scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            if (arguments[0] instanceof Array) {
                var result = jStat(arguments[0]).abs();
                return result[0];
            }
            else {
                var result = jStat([arguments[0]]).abs();
                return result[0][0];
            }
        }
    },
    {
        key: "norm",
        name: 'norm',
        inputs: [
            {
                name: "input",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).norm();
            return result[0];
        }
    },
    {
        key: "angle",
        name: 'angle',
        inputs: [
            {
                name: "vector 1",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            },
            {
                name: "vector 2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true
            }
        ],
        operation: function () {
            var result = jStat(arguments[0]).angle(arguments[1]);
            return result[0];
        }
    },
];


ActionMathAndStats.prototype.arrayOperations = [

    // with parameters
    {
        key: "variance",
        name: 'variance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
            },
            {
                name: "varianceSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: 'Use Sample Variance',
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.variance.apply(null, arguments)
        }

    },

    {
        key: "stdev",
        name: 'stdev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            },
            {
                name: "stdSelection",
                dataFormats: ["scalar"],
                dataTypes: ["boolean"],
                booleanText: "Use Sample Standard Deviation",
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: false,
                formType: "boolean"
            }

        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.stdev.apply(null, arguments)
        }
    },


    {
        key: 'quantiles',
        name: 'quantiles',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.quantiles.apply(null, arguments)
        }
    },

    {
        key: "percentile",
        name: 'percentile',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "percentileScore",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: 1,
                relationGlobalVar: "canBeGlobalVar",
                required: true,
                value: 0.5,
                formType: "numericInput"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.percentile.apply(null, arguments)
        }
    },

    {
        key: "percentileOfScore",
        name: 'percentileOfScore',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "percentileScore",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: 1,
                relationGlobalVar: "canBeGlobalVar",
                required: false,
                value: 0.5,
                formType: "numericInput"
            },
            {
                name: "percentileComparison",
                dataFormats: ["scalar"],
                dataTypes: ["string"],
                selectionValues: ['less or equal', 'less'],
                relationGlobalVar: "cannotBeGlobalVar",
                required: false,
                value: 'less or equal',
                formType: "categorical"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.percentileOfScore.apply(null, arguments);
        }
    },

    {
        key: "histogram",
        name: 'histogram',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "numberOfBins",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                minimumValue: 0,
                maximumValue: Infinity,
                relationGlobalVar: "canBeGlobalVar",
                required: false,
                value: 5,
                formType: "numericInput"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.histogram.apply(null, arguments);
        }
    },

    {
        key: "covariance",
        name: 'covariance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.covariance.apply(null, arguments);
        }
    },

    {
        key: "corrcoeff",
        name: 'corrcoeff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.corrcoeff.apply(null, arguments);
        }
    },

    {
        key: "spearmancoeff",
        name: 'spearmancoeff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            },
            {
                name: "inputArray2",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.spearmancoeff.apply(null, arguments);
        }
    },
    //////////////////////////////////////
    // without parameters


    {
        key: "sum",
        name: 'sum',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sum.apply(null, arguments);
        }
    },

    {
        key: "sumsqrd",
        name: 'sumsqrd',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumsqrd.apply(null, arguments);
        }
    },

    {
        key: "sumsqerr",
        name: 'sumsqerr',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumsqerr.apply(null, arguments);
        }
    },

    {
        key: "sumrow",
        name: 'sumrow',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.sumrow.apply(null, arguments);
        }
    },

    {
        key: "product",
        name: 'product',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.product.apply(null, arguments);
        }
    },

    {
        key: "min",
        name: 'min',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.min.apply(null, arguments);
        }
    },


    {
        key: "max",
        name: 'max',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.max.apply(null, arguments);
        }
    },

    {
        key: "mean",
        name: 'mean',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.mean.apply(null, arguments);
        }
    },

    {
        key: "meansqerr",
        name: 'meansqerr',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meansqerr.apply(null, arguments);
        }
    },

    {
        key: "geomean",
        name: 'geomean',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.geomean.apply(null, arguments);
        }
    },

    {
        key: "median",
        name: 'median',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.median.apply(null, arguments);
        }
    },

    {
        key: "cumsum",
        name: 'cumsum',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.cumsum.apply(null, arguments);
        }

    },

    {
        key: "cumprod",
        name: 'cumprod',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.cumprod.apply(null, arguments);
        }
    },

    {
        key: "diff",
        name: 'diff',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.diff.apply(null, arguments);
        }
    },

    {
        key: "rank",
        name: 'rank',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.rank.apply(null, arguments);
        }
    },

    {
        key: "mode",
        name: 'mode',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar", "array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.mode.apply(null, arguments);
        }
    },

    {
        key: "range",
        name: 'range',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.range.apply(null, arguments);
        }
    },

    {
        key: "pooledvariance",
        name: 'pooledvariance',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.pooledvariance.apply(null, arguments);
        }
    },

    {
        key: "deviation",
        name: 'deviation',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.deviation.apply(null, arguments);
        }

    },

    {
        key: "pooledstdev",
        name: 'pooledstdev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.pooledstdev.apply(null, arguments);
        }
    },

    {
        key: "meandev",
        name: 'meandev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meandev.apply(null, arguments);
        }
    },

    {
        key: "meddev",
        name: 'meddev',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.meddev.apply(null, arguments);
        }
    },

    {
        key: "skewness",
        name: 'skewness',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.skewness.apply(null, arguments);
        }
    },

    {
        key: "kurtosis",
        name: 'kurtosis',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null
            }
        ],
        operation: function () {
            return jStat.kurtosis.apply(null, arguments);
        }
    },

    {
        key: "coeffvar",
        name: 'coeffvar',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "output",
                dataFormats: ["scalar"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null

            }
        ],
        operation: function () {
            return jStat.coeffvar.apply(null, arguments);
        }
    },

    {
        key: "quartiles",
        name: 'quartiles',
        inputs: [
            {
                name: "inputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null,
                formType: "array"
            }
        ],
        outputs: [
            {
                name: "outputArray",
                dataFormats: ["array"],
                dataTypes: ["numeric"],
                relationGlobalVar: "mustBeVariable",
                required: true,
                value: null

            }
        ],
        operation: function () {
            return jStat.quartiles.apply(null, arguments);
        }
    }
];


ActionMathAndStats.prototype.allOperations = ActionMathAndStats.prototype.statisticalOerations.concat(
    ActionMathAndStats.prototype.algebraOerations,
    ActionMathAndStats.prototype.arrayOperations);

ActionMathAndStats.prototype.allOperationsByKey = {};
for (var i = 0; i < ActionMathAndStats.prototype.allOperations.length; i++) {
    var op = ActionMathAndStats.prototype.allOperations[i]
    ActionMathAndStats.prototype.allOperationsByKey[op.key] = op;
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Factory method that creates a new action based on the given action type.
 *
 * @param {ExpEvent} event - the parent event of the new action.
 * @param {string} type - the type of the Action (i.e. "ActionRecordQuestionaireResponse")
 * @returns {Action}
 */
function actionFactory(event, type) {
    var action = new window[type](event);
    return action;
}

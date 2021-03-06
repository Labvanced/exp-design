
var InputElement = function (expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "InputElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.inputType = ko.observable('number');
    this.isFocused = ko.observable(false);

    this.variable = ko.observable(null);
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(true);

    this.minValue = ko.observable(null);
    this.maxValue = ko.observable(null);

    this.maxNrChars = ko.observable(null);

    this.executeByKeyCode = ko.observableArray([]);

    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.triggerRefernce = null;
    /////
};


InputElement.prototype.label = "Input";
InputElement.prototype.iconPath = "/resources/icons/tools/tool_input.svg";
InputElement.prototype.dataType = ["boolean"];
InputElement.prototype.modifiableProp = ["isFocused"];
InputElement.prototype.displayNames = ["Focused"];
InputElement.prototype.typeOptions = ["number", "text", "date", "time", "color"];
InputElement.prototype.initWidth = 300;
InputElement.prototype.initHeight = 100;
InputElement.prototype.numVarNamesRequired = 1;
InputElement.prototype.dataTypePerInputType = {
    "number": 'numeric',
    "text": 'string',
    "date": 'datetime',
    "time": 'time',
    "color": 'string'
};

InputElement.prototype.init = function (variableName) {
    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType("numeric");
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(variableName);
    globalVar.isObjectVar(true);
    globalVar.resetStartValue();
    globalVar.includeInGlobalVarList(false);
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

};

InputElement.prototype.setVariableBackRef = function () {
    if (this.variable() instanceof GlobalVar) {
        this.variable().addBackRef(this, this.parent, true, true, 'Input');
    }
};









/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
InputElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
    this.questionText().getAllModifiers(modifiersArr);
};

InputElement.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }
    this.modifier().setPointers(entitiesArr);
    this.questionText().setPointers(entitiesArr);
};

InputElement.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable() instanceof GlobalVar) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    this.modifier().reAddEntities(entitiesArr);
    this.questionText().reAddEntities(entitiesArr);
};

InputElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    this.questionText().selectTrialType(selectionSpec);
};

InputElement.prototype.dispose = function () {
    this.questionText().dispose();
    if (this.variable() instanceof GlobalVar) {
        this.variable().removeBackRef(this);
    }

};

InputElement.prototype.getTextRefs = function (textArr, label) {
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};

InputElement.prototype.onKeyPress = function (event) {
    if (this.executeByKeyCode().indexOf(event.keyCode) >= 0) {
        this.triggerRefernce.trigger(event);
    }
};

InputElement.prototype.isInputValid = function () {
    this.triedToSubmit(true);
    if (this.isRequired() == false) {
        this.dataIsValid(true);
        return true
    }
    else {
        if (this.variable().value().value() === null || this.variable().value().value() === '' || this.variable().value().value() === this.variable().startValue().value()) {
            this.dataIsValid(false);
            return false;
        }
        else {
            this.dataIsValid(true);
            return true
        }
    }
};


InputElement.prototype.toJS = function () {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        inputType: this.inputType(),
        variable: variableId,
        isRequired: this.isRequired(),
        enableTitle: this.enableTitle(),
        minValue: this.minValue(),
        maxValue: this.maxValue(),
        maxNrChars: this.maxNrChars(),
        executeByKeyCode: this.executeByKeyCode(),
        isFocused: this.isFocused(),
        modifier: this.modifier().toJS()

    };
};


InputElement.prototype.fromJS = function (data) {
    this.type = data.type;
    if (data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else {
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('inputType')) {
        this.inputType(data.inputType);
    }
    if (data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if (data.hasOwnProperty('enableTitle')) {
        this.enableTitle(data.enableTitle);
    }
    if (data.hasOwnProperty('minValue')) {
        this.minValue(data.minValue);
    }
    if (data.hasOwnProperty('maxValue')) {
        this.maxValue(data.maxValue);
    }
    if (data.hasOwnProperty('maxNrChars')) {
        this.maxNrChars(data.maxNrChars);
    }
    if (data.hasOwnProperty('executeByKeyCode')) {
        this.executeByKeyCode(data.executeByKeyCode);
    }

    if (data.hasOwnProperty('isFocused')) {
        this.isFocused(data.isFocused);
    }

    if (data.hasOwnProperty('modifier')) {
        this.modifier(new Modifier(this.expData, this));
        this.modifier().fromJS(data.modifier);
    }


};


function createInputComponents() {
    ko.components.register('input-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    var self = this;

                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    this.inputType = ko.pureComputed({
                        read: function () {
                            return self.dataModel.inputType();
                        },
                        write: function (inputType) {
                            // switch dataType of variable:
                            var newDataType = InputElement.prototype.dataTypePerInputType[inputType];
                            self.dataModel.variable().changeDataType(newDataType);
                            self.dataModel.inputType(inputType);
                        },
                        owner: this
                    });

                    this.allowedDataTypes = ko.computed(function () {
                        var allowedDataType = InputElement.prototype.dataTypePerInputType[self.dataModel.inputType()];
                        return [allowedDataType];
                    });

                    this.relinkCallback = function () {
                        var frameData = self.dataModel.parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            if (self.dataModel.variable()) {
                                self.dataModel.variable().removeBackRef(self.dataModel);
                            }
                            self.dataModel.variable(newVariable);
                            self.dataModel.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                return new viewModel(dataModel);
            }

        },
        template: { element: 'input-editview-template' }
    });


    ko.components.register('input-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    var self = this;

                    this.value = ko.pureComputed({
                        read: function () {
                            if (self.dataModel.variable()) {
                                if (self.dataModel.variable().startValue() instanceof GlobalVarValueDatetime) {
                                    if (self.dataModel.variable().startValue().value() != null) {
                                        return self.dataModel.variable().startValue().value().toISOString().substring(0, 10);
                                    }
                                    else {
                                        return null
                                    }
                                }
                                else {
                                    return self.dataModel.variable().startValue().value();
                                }
                            }
                            else {
                                return null;
                            }
                        },
                        write: function (value) {
                            if (self.dataModel.inputType() == 'number') {
                                // prevent resetting to 0 when starting to enter a negative number:
                                if (value === "-") {
                                    return;
                                }
                                else if (value === "") {
                                    value = null;
                                }
                            }
                            // setValue will convert to the correct datatype:
                            if (self.dataModel.variable()) {
                                self.dataModel.variable().startValue().setValue(value);
                            }
                        },
                        owner: this
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'input-preview-template' }
    });


    ko.components.register('input-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var InputElementPlayerViewModel = function (dataModel) {
                    var self = this;
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;

                    // find parent playerFrame:
                    var parent = this.dataModel.parent;
                    var playerFrame = null;
                    for (var k = 0; k < 8; k++) {
                        if (parent.hasOwnProperty("playerFrame")) {
                            // found:
                            playerFrame = parent.playerFrame;
                            break;
                        }
                        else {
                            parent = parent.parent;
                        }
                    }

                    if (!playerFrame) {
                        console.log("could not find playerFrame in input-playerview component... do not set focus computed...");
                    }

                    // The computed isRenderedDeferred uses deferred update because hasFocus binding only works when element is already visible.
                    this.isRenderedDeferred = ko.computed(function () {
                        if (playerFrame && playerFrame.stateObs() == "displaying") {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }).extend({ deferred: true }); // i.e. it is switched to true only AFTER the playerFrame was switch to "display: block"...

                    // use pureComputed for two-way binding:
                    this.isFocusedPure = ko.pureComputed({
                        read: function () {
                            if (self.isRenderedDeferred()) {
                                return self.dataModel.modifier().selectedTrialView.isFocused();
                            }
                            else {
                                return false;
                            }
                        },
                        write: function (value) {
                            if (self.isRenderedDeferred()) {
                                self.dataModel.modifier().selectedTrialView.isFocused(value);
                            }
                        },
                        owner: this
                    });

                    this.value = ko.pureComputed({
                        read: function () {
                            if (self.dataModel.variable().value() instanceof GlobalVarValueDatetime) {
                                if (self.dataModel.variable().value().value() != null) {
                                    return self.dataModel.variable().value().value().toISOString().substring(0, 10);
                                }
                                else {
                                    return null;
                                }
                            }
                            else {
                                return self.dataModel.variable().value().value();
                            }
                        },

                        write: function (value) {
                            if (self.dataModel.inputType() == 'number') {
                                // prevent resetting to 0 when starting to enter a negative number:
                                if (value === "-") {
                                    return;
                                }
                                else if (value === "") {
                                    value = null;
                                }
                            }
                            // setValue will convert to the correct datatype:
                            self.dataModel.variable().value().setValue(value);
                        },
                        owner: this
                    });
                };

                InputElementPlayerViewModel.prototype.dispose = function () {
                    if (typeof player != 'undefined') {
                        if (this.isRenderedDeferred) {
                            this.isRenderedDeferred.dispose();
                        }
                    }
                };

                return new InputElementPlayerViewModel(dataModel);
            }
        },
        template: { element: 'input-playerview-template' }
    });
}



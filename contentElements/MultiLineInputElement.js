
var MultiLineInputElement = function (expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "MultiLineInputElement";
    this.questionText = ko.observable(null); // EditableTextElement

    this.variable = ko.observable();
    this.isRequired = ko.observable(false);
    this.enableTitle = ko.observable(true);
    this.customHeight = ko.observable(100);
    this.customWidth = ko.observable(100);

    this.isFocused = ko.observable(false);
    this.modifier = ko.observable(new Modifier(this.expData, this));


    this.isFocused = ko.observable(false);
    this.modifier = ko.observable(new Modifier(this.expData, this));


    this.outerHeight = ko.observable(50);
    this.executeByKeyCode = ko.observableArray([]);

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.triggerRefernce = null;

};

MultiLineInputElement.prototype.label = "Paragraph";
MultiLineInputElement.prototype.iconPath = "/resources/icons/tools/textInput.svg";
MultiLineInputElement.prototype.modifiableProp = ["isFocused"];
MultiLineInputElement.prototype.displayNames = ["Focused"];
MultiLineInputElement.prototype.dataType = ["boolean"];
MultiLineInputElement.prototype.initWidth = 500;
MultiLineInputElement.prototype.initHeight = 100;
MultiLineInputElement.prototype.numVarNamesRequired = 1;






MultiLineInputElement.prototype.recalcHeight = function () {
    if (this.parent.hasOwnProperty('editorHeight')) {
        this.outerHeight((this.parent.editorHeight() - 50));
    }

};

MultiLineInputElement.prototype.init = function (variableName) {

    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();


    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[0]);
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(variableName);
    globalVar.isObjectVar(true);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.recalcHeight();

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */

MultiLineInputElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
    this.questionText().getAllModifiers(modifiersArr);
};

MultiLineInputElement.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        if (this.variable() instanceof GlobalVar) {
            this.setVariableBackRef();
        }
    }
    this.modifier().setPointers(entitiesArr);
    this.questionText().setPointers(entitiesArr);
    this.recalcHeight();
};

MultiLineInputElement.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable() instanceof GlobalVar) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }
    this.modifier().reAddEntities(entitiesArr);
    this.questionText().reAddEntities(entitiesArr);
};

MultiLineInputElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    this.questionText().selectTrialType(selectionSpec);
};

MultiLineInputElement.prototype.setVariableBackRef = function () {
    if (this.variable() instanceof GlobalVar) {
        this.variable().addBackRef(this, this.parent, true, true, 'multiLineInput');
    }
};

MultiLineInputElement.prototype.dispose = function () {
    this.questionText().dispose();
    if (this.variable() instanceof GlobalVar) {
        this.variable().removeBackRef(this);
    }

};

MultiLineInputElement.prototype.getTextRefs = function (textArr, label) {
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    return textArr;
};

MultiLineInputElement.prototype.isInputValid = function () {
    this.triedToSubmit(true);
    if (this.isRequired() == false) {
        this.dataIsValid(true);
        return true
    }
    else {
        if (this.variable() instanceof GlobalVar) {
            if (this.variable().value().value() == null || this.variable().value().value() == '' || this.variable().value().value() == this.variable().startValue().value()) {
                this.dataIsValid(false);
                return false;
            }
            else {
                this.dataIsValid(true);
                return true
            }
        }
        else {
            return true
        }

    }
};


MultiLineInputElement.prototype.onKeyPress = function (event) {
    if (this.executeByKeyCode().indexOf(event.keyCode) >= 0) {
        this.triggerRefernce.trigger(event);
    }
};


MultiLineInputElement.prototype.toJS = function () {
    var variableId = null;
    if (this.variable() && this.variable() instanceof GlobalVar) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        isRequired: this.isRequired(),
        enableTitle: this.enableTitle(),
        customHeight: this.customHeight(),
        customWidth: this.customWidth(),
        outerHeight: this.outerHeight(),
        executeByKeyCode: this.executeByKeyCode(),
        isFocused: this.isFocused(),
        modifier: this.modifier().toJS()

    };
};



MultiLineInputElement.prototype.fromJS = function (data) {


    this.type = data.type;
    if (data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else {
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);
    if (data.hasOwnProperty('isRequired')) {
        this.isRequired(data.isRequired);
    }
    if (data.hasOwnProperty('enableTitle')) {
        this.enableTitle(data.enableTitle);
    }
    if (data.hasOwnProperty('customHeight')) {
        this.customHeight(data.customHeight);
    }
    if (data.hasOwnProperty('customWidth')) {
        this.customWidth(data.customWidth);
    }
    if (data.hasOwnProperty('outerHeight')) {
        this.outerHeight(data.outerHeight);
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

function createMultiLineInputComponents() {
    ko.components.register('multi-line-input-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    var self = this;

                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;

                    this.relinkCallback = function () {
                        var frameData = self.dataModel().parent.parent;
                        var variableDialog = new AddNewVariable(self.dataModel().expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            if (self.dataModel().variable()) {
                                self.dataModel().variable().removeBackRef(self.dataModel());
                            }
                            self.dataModel().variable(newVariable);
                            self.dataModel().setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'multi-line-input-editview-template' }
    });

    ko.components.register('multi-line-input-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'multi-line-input-preview-template' }
    });

    ko.components.register('multi-line-input-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {

                    var self = this;
                    this.dataModel = ko.observable(dataModel);

                    this.questionText = dataModel.questionText;
                    this.answer = dataModel.answer;

                    // find parent playerFrame:
                    var parent = dataModel.parent;
                    // Deleted from this from dataModel
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
                        console.log("could not find playerFrame in MultiLineInput-playerview component... do not set focus computed...");
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

                                return dataModel.modifier().selectedTrialView.isFocused();
                            }
                            else {
                                return false;
                            }
                        },
                        write: function (value) {
                            if (self.isRenderedDeferred()) {
                                dataModel.modifier().selectedTrialView.isFocused(value);
                            }
                        },
                        owner: this
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'multi-line-input-playerview-template' }
    });
}

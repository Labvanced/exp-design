
var ProgressBarElement = function (expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "ProgressBarElement";
    this.progressValue = ko.observable(50);
    this.variable = ko.observable(null);
    this.progressType = ko.observable('fixed');
    this.showPercentAsText = ko.observable(true);


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

ProgressBarElement.prototype.label = "ProgressBar";
ProgressBarElement.prototype.iconPath = "/resources/icons/tools/progressBar.svg";
ProgressBarElement.prototype.modifiableProp = ["progressValue"];
ProgressBarElement.prototype.dataType = ["numeric"];
ProgressBarElement.prototype.displayNames = ["progressValue"];
ProgressBarElement.prototype.initWidth = 500;
ProgressBarElement.prototype.initHeight = 40;
ProgressBarElement.prototype.numVarNamesRequired = 0;


ProgressBarElement.prototype.init = function () {


};

ProgressBarElement.prototype.dispose = function () {
    if (this.variable() instanceof GlobalVar) {
        this.variable().removeBackRef(this);
    }

};

ProgressBarElement.prototype.getProgressValue = function (type) {
    if (this.progressType() == "fixed") {
        return parseFloat(this.progressValue());
    }
    else if (this.progressType() == "variable") {
        if (this.variable()) {
            if (type == "editor") {
                return parseFloat(this.variable().startValue().getValue());
            }
            else if (type == "player") {
                return parseFloat(this.variable().value().getValue());
            }
        }
        else {
            return 0;
        }
    }
};


ProgressBarElement.prototype.bindToVariable = function (variable) {

    this.variable(variable);
    this.setVariableBackRef();
};

ProgressBarElement.prototype.setVariableBackRef = function () {
    if (this.variable() instanceof GlobalVar) {
        this.variable().addBackRef(this, this.parent, true, true, 'Progress Bar');
    }
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ProgressBarElement.prototype.getAllModifiers = function (modifiersArr) {
    modifiersArr.push(this.modifier());
};

ProgressBarElement.prototype.setPointers = function (entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
        this.setVariableBackRef();
    }

    this.modifier().setPointers(entitiesArr);
};

ProgressBarElement.prototype.reAddEntities = function (entitiesArr) {
    if (this.variable() instanceof GlobalVar) {
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }

    this.modifier().reAddEntities(entitiesArr);
};

ProgressBarElement.prototype.selectTrialType = function (selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ProgressBarElement.prototype.toJS = function () {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        progressValue: this.progressValue(),
        variable: variableId,
        modifier: this.modifier().toJS(),
        progressType: this.progressType(),
        showPercentAsText: this.showPercentAsText(),
    };
};

ProgressBarElement.prototype.fromJS = function (data) {
    this.type = data.type;
    this.progressValue(data.progressValue);
    this.modifier(new Modifier(this.expData, this));
    this.variable(data.variable);
    this.modifier().fromJS(data.modifier);
    if (data.hasOwnProperty("progressType")) {
        this.progressType(data.progressType);
    }

    if (data.hasOwnProperty("prshowPercentAsTextogressType")) {
        this.showPercentAsText(data.showPercentAsText);
    }


};

function createProgressBarComponents() {
    ko.components.register('progress-bar-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    var self = this;
                    this.dataModel = ko.observable(dataModel);
                    this.progressValue = dataModel.progressValue;

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
        template: { element: 'progress-bar-editview-template' }
    });

    ko.components.register('progress-bar-preview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    var self = this;
                    this.dataModel = ko.observable(dataModel);
                    this.progress = ko.computed(function () {
                        return self.dataModel().getProgressValue('editor');
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'progress-bar-preview-template' }
    });


    ko.components.register('progress-bar-playerview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function (dataModel) {
                    var self = this;
                    this.dataModel = ko.observable(dataModel);
                    this.progress = ko.computed(function () {
                        return self.dataModel().getProgressValue('player');
                    });
                };
                return new viewModel(dataModel);
            }
        },
        template: { element: 'progress-bar-playerview-template' }
    });
}

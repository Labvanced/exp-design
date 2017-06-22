
var ProgressBarElement = function(expData) {
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type = "ProgressBarElement";
    this.progressValue =  ko.observable(50);
    this.variable = ko.observable(null);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

ProgressBarElement.prototype.label = "ProgressBar";
ProgressBarElement.prototype.iconPath = "/resources/icons/tools/progressBar.svg";
ProgressBarElement.prototype.modifiableProp = ["progressValue"];
ProgressBarElement.prototype.dataType =      [ "numeric"];
ProgressBarElement.prototype.initWidth = 500;
ProgressBarElement.prototype.initHeight = 40;


ProgressBarElement.prototype.init = function() {


};


ProgressBarElement.prototype.bindToVariable = function(variable) {

    this.variable(variable);
    this.setVariableBackRef();
};

ProgressBarElement.prototype.setVariableBackRef = function() {

    this.variable().addBackRef(this, this.parent, true, true, 'Progress Bar');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ProgressBarElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
};

ProgressBarElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }

    this.modifier().setPointers(entitiesArr);
};

ProgressBarElement.prototype.reAddEntities = function(entitiesArr) {
    if (this.variable()){
        if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
            entitiesArr.push(this.variable());
        }
    }

    this.modifier().reAddEntities(entitiesArr);
};

ProgressBarElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ProgressBarElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        progressValue: this.progressValue(),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

ProgressBarElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.progressValue(data.progressValue);
    this.modifier(new Modifier(this.expData, this));
    this.variable(data.variable);
    this.modifier().fromJS(data.modifier);
};

function createProgressBarComponents() {
    ko.components.register('progress-bar-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.progressValue = dataModel.progressValue;
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };
                };

                viewModel.prototype.selectVar = function (target) {
                    var self = this;

                    this.varTarget = target;
                    var variableDialog = new AddNewVariable(this.dataModel().expData, function (newVariable) {
                        self.dataModel().parent.parent.addVariableToLocalWorkspace(newVariable);
                        self.dataModel().bindToVariable(newVariable);
                    }, this.dataModel().parent.parent,true);
                    variableDialog.show();
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'progress-bar-editview-template'}
    });

    ko.components.register('progress-bar-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = ko.observable(dataModel);


                    this.progressbar = $('#progressBarPrev');
                    var varNewId  = guid();
                    this.progressbar.attr("id",varNewId);

                    this.progressbar.css(
                        "width", self.dataModel().progressValue()+'%'
                    );

                    if (this.progressBarSubscription){
                        this.progressBarSubscription.dispose()
                    }
                    this.progressBarSubscription = this.dataModel().progressValue.subscribe(function(val){
                        self.progressbar.css(
                            "width", self.dataModel().progressValue()+'%'
                        );
                    });

                };



                return new viewModel(dataModel);
            }
        },
        template: {element: 'progress-bar-preview-template'}
    });


    ko.components.register('progress-bar-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = ko.observable(dataModel);

                    this.progressbar = $('#progressBarPlayer');
                    var varNewId  = guid();
                    this.progressbar.attr("id",varNewId);

                    this.progressbar.css(
                        "width", self.dataModel().progressValue()+'%'
                    );


                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'progress-bar-playerview-template'}
    });
}

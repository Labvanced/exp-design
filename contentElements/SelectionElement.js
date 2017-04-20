
var SelectionElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Selection";

    //serialized
    this.type = "SelectionElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');

    this.availableOptions = ko.observableArray([]);
    this.variable = ko.observable();

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

SelectionElement.prototype.modifiableProp = ["questionText"];
SelectionElement.prototype.dataType =      [ "categorical"];
SelectionElement.prototype.initWidth = 300;
SelectionElement.prototype.initHeight = 100;



SelectionElement.prototype.addEntry = function(newInput) {
    this.availableOptions.push(newInput);
};

SelectionElement.prototype.removeEntry = function(idx) {
    this.availableOptions.splice(idx,1);
};


SelectionElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[3]);
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[0]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
    this.availableOptions.push('please choose...');

};

SelectionElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Selection');
};

SelectionElement.prototype.setPointers = function(entitiesArr) {
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    this.modifier().setPointers(entitiesArr);
};

SelectionElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

SelectionElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

SelectionElement.prototype.toJS = function() {
    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    return {
        type: this.type,
        questionText: this.questionText(),
        variable: variableId,
        availableOptions: this.availableOptions(),
        modifier: this.modifier().toJS()
    };
};

SelectionElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.variable(data.variable);
    this.availableOptions(data.availableOptions);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};



function createSelectionElementComponents() {
    // TODO: @Holger Add image FileManager
    ko.components.register('selection-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.currentEntry = ko.observable('');
                    this.focus = function () {
                        this.dataModel().ckInstance.focus()
                    };
                };

                viewModel.prototype.addEntry = function() {
                  this.dataModel().addEntry(this.currentEntry());
                  this.currentEntry('');
                };
                viewModel.prototype.removeEntry = function(idx) {
                    this.dataModel().removeEntry(idx);
                };

                return new viewModel(dataModel);
            }

        },
        template: {element: 'selection-editview-template'}
    });


    ko.components.register('selection-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);

                    this.focus = function () {
                        this.dataModel().ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: { element: 'selection-preview-template' }
    });


    ko.components.register('selection-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);

                    this.focus = function () {
                        this.dataModel().ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'selection-playerview-template'}
    });
}



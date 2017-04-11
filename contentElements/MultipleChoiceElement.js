
var MultipleChoiceElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Multiple Choice";

    //serialized
    this.type= "MultipleChoiceElement";
    this.questionText= ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');

   // this.openQuestion=  ko.observable(false);

    // content
    this.elements = ko.observableArray([]);
    this.variable = ko.observable();

    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

MultipleChoiceElement.prototype.modifiableProp = ["questionText"];
MultipleChoiceElement.prototype.dataType =      [ "string"];



MultipleChoiceElement.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[3]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.name() +'_'+ this.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.addEntry();
    this.addEntry();
};

MultipleChoiceElement.prototype.addEntry = function() {
    var multChoice = new MultipleChoiceEntry(this);
    multChoice.init();
    this.elements.push(multChoice);
};

MultipleChoiceElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};

MultipleChoiceElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'multipleChoice');
};

MultipleChoiceElement.prototype.setPointers = function(entitiesArr) {

    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }

    this.modifier().setPointers(entitiesArr);
};

MultipleChoiceElement.prototype.reAddEntities = function(entitiesArr) {


    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.modifier().reAddEntities(entitiesArr);
};

MultipleChoiceElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec)
    } );
    this.modifier().selectTrialType(selectionSpec);
};

MultipleChoiceElement.prototype.toJS = function() {


    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }

    return {
        type: this.type,
        questionText: this.questionText(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        variable: variableId,
        modifier: this.modifier().toJS()
    };
};

MultipleChoiceElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.elements(jQuery.map( data.elements, function( elemData ) {
        return (new CheckBoxEntry(self)).fromJS(elemData);
    } ));
    this.variable(data.variable);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};




var MultipleChoiceEntry= function(multChoiceParent) {
    this.multChoiceParent = multChoiceParent;
    var nrEntries = '<span style="font-size:22px;"><span style="font-family:Arial,Helvetica,sans-serif;">option_' +this.multChoiceParent.elements().length+'</span></span>'
    this.multChoiceText= ko.observable( nrEntries);
    this.recValue = ko.observable();
    this.modifier = ko.observable(new Modifier(this.multChoiceParent.expData, this));
};

MultipleChoiceEntry.prototype.modifiableProp = ["multChoiceText"];
MultipleChoiceEntry.prototype.dataType =[ "categorical"];

MultipleChoiceEntry.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

MultipleChoiceEntry.prototype.init = function() {

};


MultipleChoiceEntry.prototype.fromJS = function(data) {
    this.multChoiceText(data.multChoiceText);
    this.recValue(data.recValue);
    return this;
};

MultipleChoiceEntry.prototype.toJS = function() {
    return {
        recValue:  this.recValue(),
        multChoiceText:  this.multChoiceText()
    };
};











function createMultipleChoiceComponents() {
    ko.components.register('choice-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.margin = dataModel.margin;
                    this.name = dataModel.parent.name;

                    this.addChoice = function() {
                        this.choices.push(ko.observable("choice"));
                    };

                    this.removeChoice = function(idx) {
                        this.choices.splice(idx,1);
                    };

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'choice-editview-template'}
    });

    ko.components.register('choice-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.choices = dataModel.choices;
                    this.margin = dataModel.margin;
                    this.count = dataModel.count;

                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'choice-preview-template'}
    });

    ko.components.register('choice-playerview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function (dataModel) {
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                   // this.openQuestion = dataModel.openQuestion;
                    this.newChoice = dataModel.newChoice;
                    this.choices = dataModel.choices;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'choice-playerview-template'}
    });
};

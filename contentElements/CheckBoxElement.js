
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Checkbox";

    //serialized
    this.type= "CheckBoxElement";
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');

    // content
    this.elements = ko.observableArray([]);

    // style
    this.margin = ko.observable('5pt');

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

CheckBoxElement.prototype.modifiableProp = ["questionText"];
CheckBoxElement.prototype.initWidth = 180;
CheckBoxElement.prototype.initHeight = 90;

CheckBoxElement.prototype.init = function() {
    this.addEntry();
};


CheckBoxElement.prototype.addEntry = function() {
     var checkBoxEntry = new CheckBoxEntry(this);
     checkBoxEntry.init();
     this.elements.push(checkBoxEntry);
};

CheckBoxElement.prototype.removeEntry = function() {
    var idx = this.elements().length-1;
    var entry =  this.elements()[idx];
    // delete associated global vars
    this.parent.parent.localWorkspaceVars.remove(entry.variable());
    this.elements.splice(idx,1);
};

CheckBoxElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
    }
    this.modifier().setPointers(entitiesArr);
};

CheckBoxElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr)
    } );
    this.modifier().reAddEntities(entitiesArr);
};

CheckBoxElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec)
    } );
    this.modifier().selectTrialType(selectionSpec);
};

CheckBoxElement.prototype.toJS = function() {

    return {
        type: this.type,
        questionText: this.questionText(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        modifier: this.modifier().toJS()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    this.questionText(data.questionText);
    if (data.elements) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new CheckBoxEntry(self)).fromJS(elemData);
        }));
    }
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};





var CheckBoxEntry= function(checkBoxParent) {
    this.checkBoxParent = checkBoxParent;
    this.checkBoxText= ko.observable( '<span style="font-size:16px;"><span style="font-family:Arial,Helvetica,sans-serif;">check</span></span>');
    this.variable=ko.observable(null);
    this.modifier = ko.observable(new Modifier(this.checkBoxParent.expData, this));
};

CheckBoxEntry.prototype.modifiableProp = ["checkBoxText"];
CheckBoxEntry.prototype.dataType =[ "string"];

CheckBoxEntry.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

CheckBoxEntry.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.checkBoxParent.parent.name() +'_'+ this.checkBoxParent.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.checkBoxParent.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

CheckBoxEntry.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.checkBoxParent.parent, true, true, 'checkbox');
};

CheckBoxEntry.prototype.setPointers = function(entitiesArr) {
    this.variable(entitiesArr.byId[this.variable()]);
    this.setVariableBackRef();
};

CheckBoxEntry.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

CheckBoxEntry.prototype.fromJS = function(data) {
    this.checkBoxText(data.checkBoxText);
    this.variable(data.variable);
    return this;
};

CheckBoxEntry.prototype.toJS = function() {
    return {
        variable:  this.variable().id(),
        checkBoxText:  this.checkBoxText()
    };
};




function createCheckBoxComponents() {
    ko.components.register('checkbox-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                    this.name = dataModel.parent.name;

                    this.addChoice = function() {
                        this.dataModel().addEntry();
                    };

                    this.removeChoice = function() {
                        this.dataModel().removeEntry();
                    };

                    this.focus = function () {
                        this.dataModel().ckInstance.focus()
                    }

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-editview-template'}
    });

    ko.components.register('checkbox-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-preview-template'}
    });

    ko.components.register('checkbox-playerview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo) {

                var viewModel = function (dataModel) {
                    this.dataModel = ko.observable(dataModel);
                    this.questionText = dataModel.questionText;
                    this.margin = dataModel.margin;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'checkbox-playerview-template'}
    });
};


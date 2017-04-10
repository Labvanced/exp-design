
var CheckBoxElement= function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Checkbox";

    //serialized
    this.type= "CheckBoxElement";
    this.questionText= ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');

    this.elements = ko.observableArray([]);

    this.margin = ko.observable('5pt');
    this.count = 0;

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));


    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

CheckBoxElement.prototype.modifiableProp = ["questionText"];

CheckBoxElement.prototype.addEntry = function() {
     var checkBoxEntry = new CheckBoxEntry(this);
     this.elements.push(checkBoxEntry);
};

CheckBoxElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};



CheckBoxElement.prototype.setPointers = function(entitiesArr) {


    // relink variables:
    var elements = this.elements();
    var elems = [];
    for (var i=0; i<elements.length; i++) {
        var obj ={
            variable: ko.observable(entitiesArr.byId[elements[i].variable]),
            checkBoxText :  ko.observable(elements[i].checkBoxText)
        };
        elems.push(obj);
    }
    this.elements(elems);



    this.modifier().setPointers(entitiesArr);
};

CheckBoxElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.variable().id())) {
            entitiesArr.push(elem.variable());
        }
        // recursively make sure that all deep tree nodes are in the entities list:
    } );


    this.modifier().reAddEntities(entitiesArr);
};

CheckBoxElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

CheckBoxElement.prototype.toJS = function() {

    var elems = [];

    for (var i = 0; i< this.elements().length; i++){
        var obj = {
            variable :  this.elements()[i].variable().id(),
            checkBoxText :  this.elements()[i].checkBoxText()
        };
        elems.push(obj);
    }


    return {
        type: this.type,
        questionText: this.questionText(),
        elements: elems,

        modifier: this.modifier().toJS()
    };
};

CheckBoxElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.elements(data.elements);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};



var CheckBoxEntry= function(checkBoxParent) {
    this.checkBoxParent = checkBoxParent;
    this.checkBoxText= ko.observable( '<span style="font-size:22px;"><span style="font-family:Arial,Helvetica,sans-serif;">check</span></span>');
    this.variable =ko.observable(this.addVar());
};


CheckBoxEntry.prototype.dataType =[ "string"];

CheckBoxEntry.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[2]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.checkBoxParent.parent.name() +'_'+ this.checkBoxParent.elements().length;
    globalVar.name(name);
    return globalVar;
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
                        this.dataModel.addEntry();
                    };

                    this.removeChoice = function(idx) {
                        this.dataModel.removeEntry(idx);
                    };

                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
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
                    this.count = dataModel.count;
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


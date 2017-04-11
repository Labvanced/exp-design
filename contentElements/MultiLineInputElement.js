
var MultiLineInputElement = function(expData) {
    this.expData = expData;
    this.parent = null;
    this.label = "Paragraph";

    //serialized
    this.type= "MultiLineInputElement";
    this.questionText= ko.observable('<span style="font-size:24px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.elements = ko.observableArray([]);


    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};

MultiLineInputElement.prototype.modifiableProp = ["questionText"];
MultiLineInputElement.prototype.dataType =      [ "string"];


MultiLineInputElement.prototype.init = function() {
    this.addEntry();
};



MultiLineInputElement.prototype.addEntry = function() {
    var multLineEntry = new CheckBoxEntry(this);
    multLineEntry.init();
    this.elements.push(multLineEntry);
};

MultiLineInputElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};



MultiLineInputElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers();
    }

    this.modifier().setPointers(entitiesArr);
};

MultiLineInputElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr)
    } );


    this.modifier().reAddEntities(entitiesArr);
};


MultiLineInputElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

MultiLineInputElement.prototype.toJS = function() {
    return {
        type: this.type,
        questionText: this.questionText(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),

        modifier: this.modifier().toJS()
    };
};

MultiLineInputElement.prototype.fromJS = function(data) {
    this.type=data.type;
    this.questionText(data.questionText);
    this.elements(jQuery.map( data.elements, function( elemData ) {
        return (new CheckBoxEntry(self)).fromJS(elemData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};





MultiLineInputElement.prototype.addVar = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[4]);
    globalVar.scale(GlobalVar.scales[1]);
    globalVar.name(this.parent.name());

    this.variable(globalVar);

    this.answer.subscribe(function (newValue) {
        this.variable().setValue(newValue);
    }, this);
};



function createMultiLineInputComponents() {
    ko.components.register('multi-line-input-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.questionText = dataModel.questionText;
                    this.name = dataModel.parent.name;

                    this.focus = function () {
                        dataModel.ckInstance.focus()
                    }
                };
                return new viewModel(dataModel);
            }
        } ,
        template: {element: 'multi-line-input-editview-template'}
    });

    ko.components.register('multi-line-input-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'multi-line-input-preview-template'}
    });

    ko.components.register('multi-line-input-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = dataModel;
                    this.questionText = dataModel.questionText;
                    this.answer = dataModel.answer;
                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'multi-line-input-playerview-template'}
    });
}

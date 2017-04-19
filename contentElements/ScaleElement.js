
var ScaleElement= function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;
    this.label = "Scale";

    //serialized
    this.type= "ScaleElement";
    this.id = ko.observable(guid());

    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.addDeleteFromCol = ko.observable(this.addDeleteOptionsCol[1]);

    this.labels = ko.observableArray([]);

    this.nrChoices = ko.computed(function() {
        return self.labels().length;
    }, this);

    this.elements = ko.observableArray([]);
    this.nrRows = ko.computed(function() {
        return self.elements().length;
    }, this);

    this.margin = ko.observable('2pt');



    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    ///// not serialized
    this.selected = ko.observable(false);
    /////
};
ScaleElement.prototype.addDeleteOptionsCol = ["left","right"];

ScaleElement.prototype.modifiableProp = ["questionText","labels"];
ScaleElement.prototype.dataType =      [ "string","string"];
ScaleElement.prototype.initWidth = 750;
ScaleElement.prototype.initHeight = 170;

ScaleElement.prototype.init = function() {
    this.addEntry();

    this.labels([
        ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">totally agree</span></span></p>'),
        ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">mostly agree</span></span></p>'),
        ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">undecided</span></span></p>'),
        ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">mostly disagree</span></span></p>'),
        ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">totally disagree</span></span></p>')
    ]);
};


ScaleElement.prototype.calculateWidth = function() {
    var inter = 100/this.nrChoices()-2;
    return inter +'%';
};

ScaleElement.prototype.addEntry = function() {
    var scaleEntry = new ScaleEntry(this);
    scaleEntry.init();
    this.elements.push(scaleEntry);
};

ScaleElement.prototype.removeEntry = function(idx) {
    this.elements.splice(idx,1);
};


ScaleElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
    }
    this.modifier().setPointers(entitiesArr);
};

ScaleElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr)
    } );
    this.modifier().reAddEntities(entitiesArr);
};

ScaleElement.prototype.selectTrialType = function(selectionSpec) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec)
    } );
    this.modifier().selectTrialType(selectionSpec);
};

ScaleElement.prototype.toJS = function() {


    var labels = jQuery.map( this.labels(), function( elem ) {return elem();});

    return {
        type: this.type,
        questionText: this.questionText(),
        labels: labels,
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        modifier: this.modifier().toJS()
    };
};

ScaleElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    this.questionText(data.questionText);
    this.labels(jQuery.map( data.labels, function( elem ) {return ko.observable(elem);}));
    this.elements(jQuery.map( data.elements, function( elemData ) {
        return (new ScaleEntry(self)).fromJS(elemData);
    } ));
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};




var ScaleEntry= function(scaleParent) {
    var self = this;
    this.scaleParent = scaleParent;
    this.rowText= ko.observable( '<span style="font-size:14px;"><span style="font-family:Arial,Helvetica,sans-serif;">your question</span></span>');
    this.variable=ko.observable(null);
    this.modifier = ko.observable(new Modifier(this.scaleParent.expData, this));
};

ScaleEntry.prototype.modifiableProp = ["rowText"];
ScaleEntry.prototype.dataType =[ "categorical"];

ScaleEntry.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};

ScaleEntry.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.scaleParent.parent.name() +'_'+ this.scaleParent.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.scaleParent.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

ScaleEntry.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.scaleParent.parent, true, true, 'scale');
};

ScaleEntry.prototype.setPointers = function(entitiesArr) {
    this.variable(entitiesArr.byId[this.variable()]);
    this.setVariableBackRef();
};

ScaleEntry.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

ScaleEntry.prototype.fromJS = function(data) {
    this.rowText(data.rowText);
    this.variable(data.variable);
    return this;
};

ScaleEntry.prototype.toJS = function() {
    return {
        variable:  this.variable().id(),
        rowText:  this.rowText()
    };
};




function createScaleComponents() {
    ko.components.register('scale-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){

                var viewModel = function(dataModel){

                    this.dataModel = ko.observable(dataModel);
                    this.focus = function () {
                        this.dataModel.ckInstance.focus()
                    };
                };

                viewModel.prototype.addColumn = function() {
                    if (this.dataModel().addDeleteFromCol()=='left'){
                        this.dataModel().labels.splice(0,0,ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">new option</span></span></p>'));
                    }
                    else{
                        this.dataModel().labels.push(ko.observable('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">new option</span></span></p>'));
                    }

                    // force refresh of observable array to trigger refresh of view:
                    var tmp = this.dataModel().labels();
                    this.dataModel().labels([]);
                    this.dataModel().labels(tmp);
                };

                viewModel.prototype.removeColumn = function() {
                    if (this.dataModel().addDeleteFromCol()=='left'){
                        this.dataModel().labels.splice(0,1);
                    }
                    else{
                        this.dataModel().labels.splice(this.dataModel().nrChoices()-1,1);
                    }

                    // force refresh of observable array to trigger refresh of view:
                    var tmp = this.dataModel().labels();
                    this.dataModel().labels([]);
                    this.dataModel().labels(tmp);
                };

                viewModel.prototype.addRow = function() {
                    this.dataModel().addEntry();
                };

                viewModel.prototype.removeRow = function() {
                    this.dataModel().removeEntry();
                };


                return new viewModel(dataModel);
            }
        },
        template: {element: 'scale-editview-template'}

    });

    ko.components.register('scale-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    this.dataModel = ko.observable(dataModel);

                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'scale-preview-template'}
    });

    ko.components.register('scale-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function (dataModel) {
                    this.dataModel = ko.observable(dataModel);

                };
                return new viewModel(dataModel);
            }
        },
        template: {element: 'scale-playerview-template'}
    });
};

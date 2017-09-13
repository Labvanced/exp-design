
var ScaleElement= function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "ScaleElement";
    this.id = ko.observable(guid());
    this.questionText = ko.observable(new EditableTextElement(expData, this, '<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>'));
    this.addDeleteFromCol = ko.observable(this.addDeleteOptionsCol[1]);
    this.margin = ko.observable(2);
    this.labels = ko.observableArray([]);
    this.elements = ko.observableArray([]);
    this.leftRightRatio = ko.observable(75); // in percent



    ///// not serialized
    this.nrChoices = ko.computed(function() {
        return self.labels().length;
    }, this);

    this.leftRightRatio2 = ko.computed(function() {
        100-self.leftRightRatio();
    }, this);

    this.nrRows = ko.computed(function() {
        return self.elements().length;
    }, this);
    this.selected = ko.observable(false);
    this.converting = false;
    /////
};


ScaleElement.prototype.label = "Matrix";
ScaleElement.prototype.iconPath = "/resources/icons/tools/matrix.svg";
ScaleElement.prototype.initWidth = 750;
ScaleElement.prototype.initHeight = 170;
ScaleElement.prototype.addDeleteOptionsCol = ["left","right"];

ScaleElement.prototype.init = function() {
    this.addEntry();

    for(var i = 0; i<5; i++){
        this.labels.push(new ScaleLabel(this));
    }

    this.labels()[0].labelText().setText('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">totally agree</span></span></p>');
    this.labels()[1].labelText().setText('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">mostly agree</span></span></p>');
    this.labels()[2].labelText().setText('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">undecided</span></span></p>');
    this.labels()[3].labelText().setText('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">mostly disagree</span></span></p>');
    this.labels()[4].labelText().setText('<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;">totally disagree</span></span></p>');
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

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ScaleElement.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    jQuery.each( this.labels(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    this.questionText().getAllModifiers(modifiersArr);
};

ScaleElement.prototype.setPointers = function(entitiesArr) {

    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
    }
    for (var i=0; i<this.labels().length; i++) {
        this.labels()[i].setPointers(entitiesArr);
    }

    if (this.converting) {
        // if we need to convert from old scale element format, we create the first entry here.
        this.addEntry();
        this.converting = false;
    }

    this.questionText().setPointers(entitiesArr);
};

ScaleElement.prototype.reAddEntities = function(entitiesArr) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    jQuery.each( this.labels(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    this.questionText().reAddEntities(entitiesArr);
};

ScaleElement.prototype.selectTrialType = function(selectionSpec) {

    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    jQuery.each( this.labels(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

ScaleElement.prototype.dispose = function () {
    this.questionText().dispose();
    jQuery.each( this.elements(), function( index, elem ) {
        elem.dispose();
    } );
    jQuery.each( this.labels(), function( index, elem ) {
        elem.dispose();
    } );
};

ScaleElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    jQuery.each( this.labels(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Label' + ind);
    } );
    jQuery.each( this.elements(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    } );
    return textArr;
};

ScaleElement.prototype.toJS = function() {

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        labels: jQuery.map( this.labels(), function( elem ) {
            return elem.toJS();
        }),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        leftRightRatio:this.leftRightRatio()
    };
};

ScaleElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
        this.labels(jQuery.map( data.labels, function( elem ) {
            return new ScaleLabel(self).fromJS(elem);
        }));
        this.elements(jQuery.map( data.elements, function( elemData ) {
            return (new ScaleEntry(self)).fromJS(elemData);
        } ));
    }
    else{
        this.questionText = ko.observable(new EditableTextElement(this.expData, this, data.questionText));
        // check if new or old format:
        if (data.hasOwnProperty('labels')) {
            // already has the correct new format
            this.labels(jQuery.map( data.labels, function( elem ) {
                return new ScaleLabel(self).fromJS(elem);
            }));
            this.elements(jQuery.map( data.elements, function( elemData ) {
                return (new ScaleEntry(self)).fromJS(elemData);
            } ));
        }
        else {
            // we need to convert:
            this.converting = true;
            var nrChoices = data.choices.length;
            for (var i=0; i<nrChoices; i++) {
                var label = '<p style="text-align: center;"><span style="font-size:16px"><span style="font-family:Arial,Helvetica,sans-serif;"></span></span></p>';
                if (i==0) {
                    label = data.startLabel;
                }
                if (i==nrChoices-1) {
                    label = data.endLabel;
                }
                var labelElement = new ScaleLabel(self);
                labelElement.labelText().setText(label);
                this.labels.push(labelElement);
            }
        }
    }
    if(data.hasOwnProperty('leftRightRatio')) {
        this.leftRightRatio(data.leftRightRatio);
    }


};




var ScaleEntry= function(scaleParent) {
    var self = this;
    this.parent = scaleParent;
    this.rowText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, '<span style="font-size:14px;"><span style="font-family:Arial,Helvetica,sans-serif;">your question</span></span>'));
    this.variable=ko.observable(null);
};

ScaleEntry.prototype.selectTrialType = function(selectionSpec) {
    this.rowText().selectTrialType(selectionSpec);
};

ScaleEntry.prototype.init = function() {
    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.parent.name() +'_'+ this.parent.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();
};

ScaleEntry.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent.parent, true, true, 'scale');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ScaleEntry.prototype.getAllModifiers = function(modifiersArr) {
    this.rowText().getAllModifiers(modifiersArr);
};

ScaleEntry.prototype.setPointers = function(entitiesArr) {
    this.variable(entitiesArr.byId[this.variable()]);
    this.setVariableBackRef();
    this.rowText().setPointers(entitiesArr);
};

ScaleEntry.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
};

ScaleEntry.prototype.dispose = function () {
    this.rowText().dispose();
};

ScaleEntry.prototype.getTextRefs = function(textArr, label){
    this.rowText().getTextRefs(textArr, label);
    return textArr;
};

ScaleEntry.prototype.fromJS = function(data) {
    if(data.rowText.hasOwnProperty('rawText')) {
        this.rowText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.rowText().fromJS(data.rowText);
    }
    else{
        this.rowText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, data.rowText));
    }
    this.variable(data.variable);
    return this;
};

ScaleEntry.prototype.toJS = function() {
    return {
        variable:  this.variable().id(),
        rowText:  this.rowText().toJS()
    };
};


/**
 * Element for the labels of the Matrix columns
 * @param {ScaleElement} scaleParent - parent datamodel of the ScaleLabel
 */
var ScaleLabel= function(scaleParent) {
    var self = this;
    this.parent = scaleParent;
    this.labelText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
};

ScaleLabel.prototype.selectTrialType = function(selectionSpec) {
    this.labelText().selectTrialType(selectionSpec);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
ScaleLabel.prototype.getAllModifiers = function(modifiersArr) {
    this.labelText().getAllModifiers(modifiersArr);
};

ScaleLabel.prototype.setPointers = function(entitiesArr) {
    this.labelText().setPointers(entitiesArr);
};

ScaleLabel.prototype.reAddEntities = function(entitiesArr) {
    this.labelText().reAddEntities(entitiesArr);
};

ScaleLabel.prototype.dispose = function () {
    this.labelText().dispose();
};

ScaleLabel.prototype.getTextRefs = function(textArr, label){
    this.labelText().getTextRefs(textArr, label);
};

ScaleLabel.prototype.fromJS = function(data) {
    if(data.labelText.hasOwnProperty('rawText')){
        this.labelText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.labelText().fromJS(data.labelText);
    }
    else{
        this.labelText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, data.labelText));
    }
    return this;
};

ScaleLabel.prototype.toJS = function() {
    return {
        labelText:  this.labelText().toJS()
    };
};



function createScaleComponents() {

    var ScaleEditViewModel = function(dataModel){
        this.dataModel = dataModel;
    };

    ScaleEditViewModel.prototype.focus = function() {
        this.dataModel.ckInstance.focus();
    };

    ScaleEditViewModel.prototype.relinkCallback = function(index) {
        var frameData = this.dataModel.parent.parent;
        var checkboxEntry = this.dataModel.elements()[index];
        var variableDialog = new AddNewVariable(this.dataModel.expData, function (newVariable) {
            frameData.addVariableToLocalWorkspace(newVariable);
            checkboxEntry.variable(newVariable);
            checkboxEntry.setVariableBackRef(newVariable);
        }, frameData);
        variableDialog.show();
    };

    ScaleEditViewModel.prototype.addColumn = function() {
        if (this.dataModel.addDeleteFromCol()=='left'){
            this.dataModel.labels.splice(0,0,new ScaleLabel(this));
        }
        else{
            this.dataModel.labels.push(new ScaleLabel(this));
        }

        // force refresh of observable array to trigger refresh of view:
        var tmp = this.dataModel.labels();
        this.dataModel.labels([]);
        this.dataModel.labels(tmp);
    };

    ScaleEditViewModel.prototype.removeColumn = function() {
        if (this.dataModel.addDeleteFromCol()=='left'){
            this.dataModel.labels.splice(0,1);
        }
        else{
            this.dataModel.labels.splice(this.dataModel.nrChoices()-1,1);
        }

        // force refresh of observable array to trigger refresh of view:
        var tmp = this.dataModel.labels();
        this.dataModel.labels([]);
        this.dataModel.labels(tmp);
    };

    ScaleEditViewModel.prototype.addRow = function() {
        this.dataModel.addEntry();
    };

    ScaleEditViewModel.prototype.removeRow = function() {
        this.dataModel.removeEntry();
    };


    ko.components.register('scale-editview', {
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new ScaleEditViewModel(dataModel);
            }
        },
        template: {element: 'scale-editview-template'}

    });


    var ScalePreviewViewModel = function(dataModel){
        this.dataModel = dataModel;
    };

    ko.components.register('scale-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new ScalePreviewViewModel(dataModel);
            }
        },
        template: {element: 'scale-preview-template'}
    });

    var ScalePlayerViewModel = function(dataModel){
        this.dataModel = dataModel;
    };

    ko.components.register('scale-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                return new ScalePlayerViewModel(dataModel);
            }
        },
        template: {element: 'scale-playerview-template'}
    });
};

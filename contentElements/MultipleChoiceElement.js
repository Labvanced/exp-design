
var MultipleChoiceElement = function(expData) {
    var self = this;
    this.expData = expData;
    this.parent = null;

    //serialized
    this.type= "MultipleChoiceElement";
    this.questionText = ko.observable(null); // EditableTextElement
    this.isRequired = ko.observable(false);

    this.altAnswerActive = ko.observable(false);
    this.altAnswerOnlyWhenLastSelected = ko.observable(false);
    this.enableTitle= ko.observable(true);

   // this.openQuestion=  ko.observable(false);

    // content
    this.elements = ko.observableArray([]);
    this.variable = ko.observable();
    this.subInputElement = ko.observable(null);


    this.margin = ko.observable('5pt');

    ///// not serialized
    this.selected = ko.observable(false);
    this.triedToSubmit = ko.observable(false);
    this.dataIsValid = ko.observable(false);
    this.altAnswer = ko.observable('');
    // update variable
    this.altAnswer.subscribe(function(val) {
     self.variable().value().value(val)
    });



};

MultipleChoiceElement.prototype.label = "Multiple Choice";
MultipleChoiceElement.prototype.iconPath = "/resources/icons/tools/tool_multiplechoice.svg";
MultipleChoiceElement.prototype.dataType =      [ ];
MultipleChoiceElement.prototype.modifiableProp = [ ];
MultipleChoiceElement.prototype.initWidth = 180;
MultipleChoiceElement.prototype.initHeight = 120;



MultipleChoiceElement.prototype.init = function() {
    this.questionText(new EditableTextElement(this.expData, this, '<p><span style="font-size:20px;">Your Question</span></p>'));
    this.questionText().init();

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType('string');
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[0]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.addEntry();
    this.addEntry();
    this.addSubscriptions();
};

MultipleChoiceElement.prototype.addEntry = function() {
    var multChoice = new MultipleChoiceEntry(this);
    multChoice.init();
    this.elements.push(multChoice);
};

MultipleChoiceElement.prototype.removeEntry = function() {
    var idx = this.elements().length-1;
    this.elements.splice(idx,1);
};

MultipleChoiceElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'multipleChoice');
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultipleChoiceElement.prototype.getAllModifiers = function(modifiersArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
    this.questionText().getAllModifiers(modifiersArr);
};

MultipleChoiceElement.prototype.setPointers = function(entitiesArr) {
    var self = this;
    if (this.variable()) {
        this.variable(entitiesArr.byId[this.variable()]);
    }
    jQuery.each( this.elements(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );
    if (this.variable().dataType() == "categorical") {
        // convert to string type:
        this.variable().changeDataType("string");
    }
    this.questionText().setPointers(entitiesArr);
    if ( this.subInputElement()){
        this.subInputElement().setPointers(entitiesArr);
    }

    this.addSubscriptions();
};



MultipleChoiceElement.prototype.addSubscriptions = function() {
    var self = this;
    if (this.activateAltSubscription){
        this.activateAltSubscription.dispose();
    }
    this.activateAltSubscription = this.altAnswerActive.subscribe(function(val) {
        if (val){
            var newElem = new InputElement(self.expData);
            newElem.parent = self.parent;
            newElem.init();
            newElem.variable().name(self.parent.name()+'_altInput');
            newElem.inputType("text");
            newElem.variable().scale("nominal");
            newElem.variable().dataType("string");
            newElem.variable().resetStartValue();
            newElem.enableTitle(false);
            self.expData.entities.push(self.variable());
            self.subInputElement(newElem);
            self.expData.notifyChanged();
            //self.addEntry()
        }
        else{
            var vari = self.subInputElement().variable();
            if(vari.backRefs().length==2 && vari.backRefs()[1].refLabel == 'Input' ){
                if (self.expData.entities.byId[vari.id()]){
                    vari.backRefs()[0].entity.deleteChildEntity(vari);
                    self.expData.deleteGlobalVar(vari);
                }
                else{
                    console.log('error deleting variable')
                }
            }
            else{
                console.log('variable not deleted, other backrefs exist')
            }
            self.subInputElement(null);
        }
    });
};

MultipleChoiceElement.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    this.questionText().reAddEntities(entitiesArr);
    if ( this.subInputElement()){
        this.subInputElement().reAddEntities(entitiesArr);
    }

};

MultipleChoiceElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

MultipleChoiceElement.prototype.dispose = function () {
    this.questionText().dispose();
    jQuery.each( this.elements(), function( index, elem ) {
        elem.dispose();
    } );
};

MultipleChoiceElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    jQuery.each( this.elements(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    } );
    return textArr;
};


MultipleChoiceElement.prototype.isInputValid = function() {
    this.triedToSubmit(true);

    var isValid = true;
    if (this.isRequired()){
        if (this.variable().value().value() === this.variable().startValue().value()){
            isValid = false;
        }
    }

    // up to here, already mark as invalid if radio option is not start value:
    this.dataIsValid(isValid);

    // now also check the sub element validity if it is active:
    if (this.altAnswerActive()){
        var allElem = this.elements();
        var lastOptionValue = allElem[allElem.length - 1].multChoiceValue();
        // only check validity if the last option selected:
        if (this.variable().value().value() === lastOptionValue) {
            if (!this.subInputElement().isInputValid()) {
                isValid = false;
            }
        }
    }

    return isValid;
};


MultipleChoiceElement.prototype.toJS = function() {

    var variableId = null;
    if (this.variable()) {
        variableId = this.variable().id();
    }
    var subInputElement = null;
    if (this.subInputElement()) {
        subInputElement = this.subInputElement().toJS();
    }

    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        variable: variableId,
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem.toJS();
        }),
        isRequired: this.isRequired(),
        altAnswerActive: this.altAnswerActive(),
        altAnswerOnlyWhenLastSelected: this.altAnswerOnlyWhenLastSelected(),
        enableTitle: this.enableTitle(),
        subInputElement: subInputElement
    };
};

MultipleChoiceElement.prototype.fromJS = function(data) {
    var self = this;
    this.type=data.type;
    if(data.questionText.hasOwnProperty('rawText')){
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else{
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.variable(data.variable);

    if (data.elements) {
        this.elements(jQuery.map(data.elements, function (elemData) {
            return (new MultipleChoiceEntry(self)).fromJS(elemData);
        }));
    }
    if(data.hasOwnProperty('isRequired')){
        this.isRequired(data.isRequired);
    }
    if(data.hasOwnProperty('altAnswerActive')){
        this.altAnswerActive(data.altAnswerActive);
    }
    if(data.hasOwnProperty('altAnswerOnlyWhenLastSelected')){
        this.altAnswerOnlyWhenLastSelected(data.altAnswerOnlyWhenLastSelected);
    }
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }

    if(data.hasOwnProperty('subInputElement')){
        if (data.subInputElement){
            var elem =  new InputElement(self.expData);
            elem.fromJS(data.subInputElement);
            this.subInputElement = ko.observable(elem);
        }
    }




};





//////////////////////////////////////////////
////// MultipleChoiceEntry
//////////////////////////////////////////////


var MultipleChoiceEntry= function(multChoiceParent) {
    this.parent = multChoiceParent;

    this.multChoiceText = ko.observable(null); // EditableTextElement
    this.multChoiceValue = ko.observable(null);

};



MultipleChoiceEntry.prototype.getIndex = function() {
   return this.parent.elements.indexOf(this);
};
MultipleChoiceEntry.prototype.nrElems = function() {
    return this.parent.elements().length-1;
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
MultipleChoiceEntry.prototype.getAllModifiers = function(modifiersArr) {
    this.multChoiceText().getAllModifiers(modifiersArr);
};

MultipleChoiceEntry.prototype.selectTrialType = function(selectionSpec) {
    this.multChoiceText().selectTrialType(selectionSpec);
};

MultipleChoiceEntry.prototype.init = function() {
    var nr = this.parent.elements().length;
    this.multChoiceText(new EditableTextElement(this.parent.expData, this.parent, '<p><span style="font-size:16px;">option_' +nr+'</span></p>'));
    this.multChoiceText().init();
    this.multChoiceValue( 'option_' +nr );
};

MultipleChoiceEntry.prototype.reAddEntities = function (entitiesArr) {
    this.multChoiceText().reAddEntities(entitiesArr);
};

MultipleChoiceEntry.prototype.setPointers = function(entitiesArr) {
    if (this.multChoiceValue() == null) {
        // convert from old categorical format to string format:
        var nr = this.parent.elements().indexOf(this);
        this.multChoiceValue( $($.parseHTML(this.multChoiceText())).text() );
    }
    this.multChoiceText().setPointers(entitiesArr);
};

MultipleChoiceEntry.prototype.dispose = function () {
    this.multChoiceText().dispose();
};

MultipleChoiceEntry.prototype.getTextRefs = function(textArr, label){
    this.multChoiceText().getTextRefs(textArr, label);
};

MultipleChoiceEntry.prototype.fromJS = function(data) {
    if(data.multChoiceText.hasOwnProperty('rawText')) {
        this.multChoiceText(new EditableTextElement(this.parent.expData, this.parent, ''));
        this.multChoiceText().fromJS(data.multChoiceText);
    }
    else{
        this.multChoiceText(new EditableTextElement(this.parent.expData, this.parent, data.multChoiceText));
    }
    if (data.hasOwnProperty('multChoiceValue')) {
        this.multChoiceValue(data.multChoiceValue);
    }
    return this;
};

MultipleChoiceEntry.prototype.toJS = function() {
    return {
        multChoiceText:  this.multChoiceText().toJS(),
        multChoiceValue: this.multChoiceValue()
    };
};


function createMultipleChoiceComponents() {
    ko.components.register('choice-editview', {
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){

                var viewModel = function(multipleChoiceElement){
                    var self = this;

                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;

                    this.addChoice = function() {
                        self.multipleChoiceElement.addEntry();
                    };

                    this.removeChoice = function() {
                        self.multipleChoiceElement.removeEntry();
                    };

                    this.focus = function () {
                        self.multipleChoiceElement.ckInstance.focus();
                    };

                    this.relinkCallback = function() {
                        var frameData = self.multipleChoiceElement.parent.parent;
                        var variableDialog = new AddNewVariable(self.multipleChoiceElement.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            self.multipleChoiceElement.variable(newVariable);
                            self.multipleChoiceElement.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };
                };

                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-editview-template'}
    });

    ko.components.register('choice-preview',{
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){
                var viewModel = function(multipleChoiceElement){
                    var self = this;

                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;

                    this.altAnswerVisible = ko.computed(function() {
                        if (!self.multipleChoiceElement.altAnswerActive()){
                            return false;
                        }

                        if (!self.multipleChoiceElement.altAnswerOnlyWhenLastSelected()){
                            return true;
                        }

                        var allElem = self.multipleChoiceElement.elements();
                        var lastOptionValue = allElem[allElem.length - 1].multChoiceValue();
                        if (self.multipleChoiceElement.variable().startValue().value() === lastOptionValue){
                            return true;
                        }
                        return false;
                    });
                };
                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-preview-template'}
    });

    ko.components.register('choice-playerview', {
        viewModel: {
            createViewModel: function(multipleChoiceElement, componentInfo){

                var viewModel = function (multipleChoiceElement) {
                    var self = this;

                    this.multipleChoiceElement = multipleChoiceElement;
                    this.questionText = multipleChoiceElement.questionText;
                    this.margin = multipleChoiceElement.margin;

                    this.altAnswerVisible = ko.computed(function() {
                        if (!self.multipleChoiceElement.altAnswerActive()){
                            return false;
                        }

                        if (!self.multipleChoiceElement.altAnswerOnlyWhenLastSelected()){
                            return true;
                        }

                        var allElem = self.multipleChoiceElement.elements();
                        var lastOptionValue = allElem[allElem.length - 1].multChoiceValue();
                        if (self.multipleChoiceElement.variable().value().value() === lastOptionValue){
                            return true;
                        }
                        return false;
                    });
                };
                return new viewModel(multipleChoiceElement);
            }
        },
        template: {element: 'choice-playerview-template'}
    });
};

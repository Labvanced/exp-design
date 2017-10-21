
var SortableElement = function(expData) {
    var self = this;

    this.expData = expData;
    this.parent = null;

    //serialized

    this.type = "SortableElement";
    this.margin = ko.observable('0pt');

    this.elements =  ko.observableArray([]).extend({sortById: null});
    this.elementIds =  ko.observableArray([]).extend({sortById: null});
    this.questionText = ko.observable(new EditableTextElement(expData, this, '<span style="font-size:20px;">Your Question</span>'));
    this.enableTitle= ko.observable(true);

    ///// not serialized
    this.selected = ko.observable(false);
    this.activeSorting = ko.observable(false);
    this.elementIdMap = {};
    /////
};

SortableElement.prototype.label = "Sortable";
SortableElement.prototype.iconPath = "/resources/icons/tools/sort.svg";
SortableElement.prototype.dataType =      [ ];
SortableElement.prototype.modifiableProp = [ ];
SortableElement.prototype.initWidth = 350;
SortableElement.prototype.initHeight = 100;

SortableElement.prototype.init = function() {

    this.addElem('id1');
    this.addElem('id2');
    this.addElem('id3');

};

SortableElement.prototype.addElem = function (elemId) {
    if (elemId){
        var text = 'element' + (this.elements().length+1);
        var elem = new SortableEntry(this);
        elem.init();
        elem.sortableText().setText('<span style="font-size:20px;">'+text+'</span>');
        this.elements.push(elem);
        this.elementIds.push(elemId);
        this.elementIdMap[elemId] = elem;
    }

};

SortableElement.prototype.removeElem = function () {
    var idx = this.elements().length-1;
    delete this.elementIdMap[this.elementIds()[idx]];
    this.elements.splice(idx,1);
    this.elementIds.splice(idx,1);

};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
SortableElement.prototype.getAllModifiers = function(modifiersArr) {
    this.questionText().getAllModifiers(modifiersArr);
    jQuery.each( this.elements(), function( index, elem ) {
        elem.getAllModifiers(modifiersArr);
    } );
};

SortableElement.prototype.setPointers = function(entitiesArr) {
//    var array = [];
    for (var i=0; i<this.elements().length; i++) {
        this.elements()[i].setPointers(entitiesArr);
//        array[i] = ko.observable(this.elements()[i]);
    }
//    this.elements(array);

    for (var i=0; i<this.elementIds().length; i++) {
        this.elementIdMap[this.elementIds()[i]] = this.elements()[i];
    }

    this.questionText().setPointers(entitiesArr);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SortableElement.prototype.reAddEntities = function(entitiesArr) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.reAddEntities(entitiesArr);
    } );
    this.questionText().reAddEntities(entitiesArr);
};

SortableElement.prototype.selectTrialType = function(selectionSpec) {
    jQuery.each( this.elements(), function( index, elem ) {
        elem.selectTrialType(selectionSpec);
    } );
    this.questionText().selectTrialType(selectionSpec);
};

SortableElement.prototype.dispose = function () {
    this.questionText().dispose();
    jQuery.each( this.elements(), function( index, elem ) {
        elem.dispose();
    } );
};

SortableElement.prototype.getTextRefs = function(textArr, label){
    var questlabel = label + '.Question';
    this.questionText().getTextRefs(textArr, questlabel);
    jQuery.each( this.elements(), function( index, elem ) {
        var ind = index + 1;
        elem.getTextRefs(textArr, label + '.Entry' + ind);
    } );
    return textArr;
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {PageData}
 */
SortableElement.prototype.fromJS = function(data) {
    var self = this;
    this.type = data.type;
    if(data.questionText.hasOwnProperty('rawText')) {
        this.questionText(new EditableTextElement(this.expData, this, ''));
        this.questionText().fromJS(data.questionText);
    }
    else {
        this.questionText(new EditableTextElement(this.expData, this, data.questionText));
    }
    this.elements(jQuery.map(data.elements, function (elemData) {
        return (new SortableEntry(self)).fromJS(elemData);
    }));
    this.elementIds(data.elementIds);
    if(data.hasOwnProperty('enableTitle')){
        this.enableTitle(data.enableTitle);
    }
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SortableElement.prototype.toJS = function() {
    var self = this;
    return {
        type: this.type,
        questionText: this.questionText().toJS(),
        elements: jQuery.map( this.elementIds(), function( elem ) {
            return self.elementIdMap[elem].toJS();
        }),
        elementIds: this.elementIds(),
        enableTitle:this.enableTitle
    };
};


//////////////////////////////////////////////
////// SortableEntry
//////////////////////////////////////////////


var SortableEntry= function(selectionParent) {
    this.parent = selectionParent;
    this.sortableText = ko.observable(new EditableTextElement(this.parent.expData, this.parent, ''));
    this.variable = ko.observable(null);
};

SortableEntry.prototype.init = function() {
    var globalVar = new GlobalVar(this.parent.expData);
    globalVar.dataType(GlobalVar.dataTypes[1]);
    globalVar.scope('trial');
    globalVar.scale(GlobalVar.scales[1]);
    var name = this.parent.parent.name() +'_'+ this.parent.elements().length;
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.name = 'element' + this.parent.elements().length;
    this.variable().startValue().value(this.parent.elements().length);

};

SortableEntry.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent.parent, true, true, 'sortable');
};


SortableEntry.prototype.reAddEntities = function(entitiesArr) {
    if (!entitiesArr.byId.hasOwnProperty(this.variable().id())) {
        entitiesArr.push(this.variable());
    }
    this.sortableText().reAddEntities(entitiesArr);

};

SortableEntry.prototype.getIndex = function() {
    return this.parent.elements.indexOf(this);
};

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
SortableEntry.prototype.getAllModifiers = function(modifiersArr) {
    this.sortableText().getAllModifiers(modifiersArr);
};

SortableEntry.prototype.selectTrialType = function(selectionSpec) {
    this.sortableText().selectTrialType(selectionSpec);
};

SortableEntry.prototype.setPointers = function(entitiesArr) {
    var variable = entitiesArr.byId[this.variable()];
    if (variable) {
        this.variable(variable);
        this.setVariableBackRef();
    }
    else {
        this.init();
    }
    this.sortableText().setPointers(entitiesArr);
};

SortableEntry.prototype.dispose = function () {
    this.sortableText().dispose();
};

SortableEntry.prototype.getTextRefs = function(textArr, label){
    this.sortableText().getTextRefs(textArr, label);
};

SortableEntry.prototype.fromJS = function(data) {
    if (typeof data == "string") {
        this.sortableText(new EditableTextElement(this.parent.expData, this.parent, data));
    }
    else {
        if (data.sortableText.hasOwnProperty('rawText')) {
            this.sortableText(new EditableTextElement(this.parent.expData, this.parent, ''));
            this.sortableText().fromJS(data.sortableText);
        }
        else {
            this.sortableText(new EditableTextElement(this.parent.expData, this.parent, data.sortableText));
        }
        this.variable(data.variable);
    }
    return this;
};

SortableEntry.prototype.toJS = function() {
    return {
        variable:  this.variable().id(),
        sortableText:  this.sortableText().toJS()
    };
};


function createSortableElementComponents() {
    ko.components.register('sortable-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.currentEntry = ko.observable('');
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();
                    };


                    if (this.enableSortingSubscription){
                        this.enableSortingSubscription.dispose();
                    }
                    this.enableSortingSubscription = this.dataModel.activeSorting.subscribe(function(val){
                        self.sortableElement = $('#'+self.dataModel.tempId);
                        if (val){
                            self.sortableElement.sortable("enable");
                        }
                        else{
                            self.sortableElement.sortable("disable");
                        }
                    });

                    this.relinkCallback = function(index) {
                        var frameData = self.dataModel.parent.parent;
                        var sortableEntry = self.dataModel.elements()[index];
                        var variableDialog = new AddNewVariable(self.dataModel.expData, function (newVariable) {
                            frameData.addVariableToLocalWorkspace(newVariable);
                            sortableEntry.variable(newVariable);
                            sortableEntry.setVariableBackRef(newVariable);
                        }, frameData);
                        variableDialog.show();
                    };

                };

                viewModel.prototype.addElem= function() {
                    this.dataModel.addElem(this.currentEntry());
                    this.currentEntry('');
                };

                viewModel.prototype.removeElem= function() {
                    this.dataModel.removeElem();
                };


                return new viewModel(dataModel);
            }

        },
        template: {element: 'sortable-editview-template'}
    });


    ko.components.register('sortable-preview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.startPosition = ko.observable(null);
                    this.stopPosition = ko.observable(null);
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();

                    };

                    this.sortableElement = $('#sortableElementPrev');
                    var varNewId  = guid();
                    this.dataModel.tempId = varNewId;
                    this.sortableElement.attr("id",varNewId);

                    this.sortableElement.sortable({
                        disabled: true,
                        scrollSpeed: 20,
                        scrollSensitivity: 10,
                        start: function( event, ui ) {
                            self.startPosition(ui.item.index());
                        },
                        stop: function( event, ui ) {
                            self.stopPosition(ui.item.index());
                            if (self.startPosition()!=null){
                                var elem =  self.dataModel.elementIds()[self.startPosition()];
                                self.dataModel.elementIds.splice(self.startPosition(),1);
                                self.dataModel.elementIds.splice(self.stopPosition(),0,elem);
                                self.startPosition(null);
                                self.stopPosition(null);

                                var entry =  self.dataModel.elementIdMap[elem];
                                entry.variable().value().value(self.stopPosition);
                            }
                        }
                    });

                };


                return new viewModel(dataModel);
            }
        },
        template: { element: 'sortable-preview-template' }
    });


    ko.components.register('sortable-playerview',{
        viewModel: {
            createViewModel: function(dataModel, componentInfo){
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = dataModel;
                    this.startPosition = ko.observable(null);
                    this.stopPosition = ko.observable(null);
                    this.focus = function () {
                        this.dataModel.ckInstance.focus();

                    };

                    this.sortableElement = $('#sortableElementPlayer');
                    var varNewId  = guid();
                    this.sortableElement.attr("id",varNewId);

                    this.sortableElement.sortable({
                        scrollSpeed: 20,
                        scrollSensitivity: 10,
                        start: function( event, ui ) {
                            self.startPosition(ui.item.index());
                        },
                        stop: function( event, ui ) {
                            self.stopPosition(ui.item.index());
                            if (self.startPosition()!=null){
                                var elem =  self.dataModel.elementIds()[self.startPosition()];
                                self.dataModel.elementIds.splice(self.startPosition(),1);
                                self.dataModel.elementIds.splice(self.stopPosition(),0,elem);
                                self.startPosition(null);
                                self.stopPosition(null);
                                var entry =  self.dataModel.elementIdMap[elem];
                                entry.variable().value().value(self.stopPosition);
                            }
                        }
                    });

                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'sortable-playerview-template'}
    });
}




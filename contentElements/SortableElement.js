
var SortableElement = function(expData) {
    var self = this;

    this.expData = expData;
    this.parent = null;

    //serialized

    this.type = "SortableElement";
    this.margin = ko.observable('0pt');

    this.elements =  ko.observableArray([]).extend({sortById: null});
    this.elementIds =  ko.observableArray([]).extend({sortById: null});
    this.questionText= ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">Your Question</span></span>');
    this.variable = ko.observable();

    this.modifier = ko.observable(new Modifier(this.expData, this));


    ///// not serialized
    this.elementIdsCombined = ko.computed(function() {
        var elems = self.elementIds();
        var output = '/***/';
        for (var i =0; i<elems.length;i++){
            output += self.elementIds()[i] + '/***/'
        }
        return output;
    });

    this.selected = ko.observable(false);
    this.activeSorting = ko.observable(false);

    /////
};

SortableElement.prototype.label = "Sortable";
SortableElement.prototype.iconPath = "/resources/icons/tools/sort.svg";
SortableElement.prototype.modifiableProp = ["questionText"];
SortableElement.prototype.dataType =   [ "categorical"];
SortableElement.prototype.initWidth = 350;
SortableElement.prototype.initHeight = 100;

SortableElement.prototype.init = function() {

    var globalVar = new GlobalVar(this.expData);
    globalVar.dataType(GlobalVar.dataTypes[0]);
    globalVar.scope(GlobalVar.scopes[2]);
    globalVar.scale(GlobalVar.scales[0]);
    var name = this.parent.name();
    globalVar.name(name);
    globalVar.resetStartValue();
    this.variable(globalVar);

    var frameOrPageElement = this.parent;
    frameOrPageElement.parent.addVariableToLocalWorkspace(globalVar);
    this.setVariableBackRef();

    this.addElem('id1');
    this.addElem('id2');
    this.addElem('id3');

    this.variable().startValue().value(this.elementIdsCombined());
};

SortableElement.prototype.setVariableBackRef = function() {
    this.variable().addBackRef(this, this.parent, true, true, 'Sortable');
};

SortableElement.prototype.addElem = function (elemId) {
    if (elemId){
        var text = 'element' + (this.elements().length+1);
        var  elem = ko.observable('<span style="font-size:20px;"><span style="font-family:Arial,Helvetica,sans-serif;">'+text+'</span></span>');
        this.elements.push(elem);
        this.elementIds.push(elemId);
    }

};

SortableElement.prototype.removeElem = function () {
    var idx = this.elements().length-1;
    this.elements.splice(idx,1);
    this.elementIds.splice(idx,1);
};


SortableElement.prototype.setPointers = function(entitiesArr) {
    var array = [];
    for (var i=0; i<this.elements().length; i++) {
        array[i] = ko.observable(this.elements()[i])
    }
    this.elements(array);
    this.modifier().setPointers(entitiesArr);
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
SortableElement.prototype.reAddEntities = function(entitiesArr) {

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {PageData}
 */
SortableElement.prototype.fromJS = function(data) {
    this.type = data.type;
    this.questionText(data.questionText);
    this.elements(data.elements);
    this.elementIds(data.elementIds);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
SortableElement.prototype.toJS = function() {
    return {
        type: this.type,
        questionText: this.questionText(),
        elements: jQuery.map( this.elements(), function( elem ) {
            return elem();
        }),
        elementIds: this.elementIds(),
        modifier: this.modifier().toJS()
    };
};




function createSortableElementComponents() {
    ko.components.register('sortable-editview', {
        viewModel: {
            createViewModel: function (dataModel, componentInfo) {
                var viewModel = function(dataModel){
                    var self = this;
                    this.dataModel = ko.observable(dataModel);
                    this.currentEntry = ko.observable('');
                    this.focus = function () {
                        this.dataModel().ckInstance.focus();
                    };


                    if (this.enableSortingSubscription){
                        this.enableSortingSubscription.dispose()
                    }
                    this.enableSortingSubscription = this.dataModel().activeSorting.subscribe(function(val){
                        self.sortableElement = $('#'+self.dataModel().tempId);
                        if (val){
                            self.sortableElement.sortable("enable");
                        }
                        else{
                            self.sortableElement.sortable("disable");
                        }
                    });
                };

                viewModel.prototype.addElem= function() {
                    this.dataModel().addElem(this.currentEntry());
                    this.currentEntry('');
                };

                viewModel.prototype.removeElem= function() {
                    this.dataModel().removeElem()
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
                    this.dataModel = ko.observable(dataModel);
                    this.startPosition = ko.observable(null);
                    this.stopPosition = ko.observable(null);
                    this.focus = function () {
                        this.dataModel().ckInstance.focus();

                    };

                    this.sortableElement = $('#sortableElementPrev');
                    var varNewId  = guid();
                    this.dataModel().tempId = varNewId;
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
                                var elem =  self.dataModel().elementIds()[self.startPosition()];
                                self.dataModel().elementIds.splice(self.startPosition(),1);
                                self.dataModel().elementIds.splice(self.stopPosition(),0,elem);
                                self.startPosition(null);
                                self.stopPosition(null);
                            }
                        }
                    });

                    if (this.setVarSubscription){
                        this.setVarSubscription.dispose();
                    }
                    this.setVarSubscription = this.dataModel().elementIdsCombined.subscribe(function(val){
                       self.dataModel().variable().startValue().value(val)
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
                    this.dataModel = ko.observable(dataModel);
                    this.startPosition = ko.observable(null);
                    this.stopPosition = ko.observable(null);
                    this.focus = function () {
                        this.dataModel().ckInstance.focus();

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
                                var elem =  self.dataModel().elementIds()[self.startPosition()];
                                self.dataModel().elementIds.splice(self.startPosition(),1);
                                self.dataModel().elementIds.splice(self.stopPosition(),0,elem);
                                self.startPosition(null);
                                self.stopPosition(null);
                            }
                        }
                    });

                    if (this.setVarSubscription){
                        this.setVarSubscription.dispose();
                    }
                    this.setVarSubscription = this.dataModel().elementIdsCombined.subscribe(function(val){
                        self.dataModel().variable().value().value(val)
                    });
                };

                return new viewModel(dataModel);
            }
        },
        template: {element: 'sortable-playerview-template'}
    });
}




// � by Caspar Goeke and Holger Finger


var PageView = function(divContainer,pageData,parent,type) {
    var self = this;

    this.divContainer = divContainer;
    this.pageData = pageData;
    this.parent = parent;
    this.type= type;


    //this.viewElements= ko.observableArray([]).extend({sortById: null});
  //  this.currSelectedElement = ko.observable(this.pageData.elements()[0]);

    this.width = 0;
    this.height = 0;

    this.scale = ko.observable(1);

    this.selectedTrialType = ko.observable({ type: 'default'});

};


PageView.prototype.setDiv= function(div) {
    this.divContainer = div;
};


PageView.prototype.init = function(size) {

    this.width = size[0];
    this.height = size[1];

    // resize once and set dataModel
    this.resize(size);
    if (this.type != "playerView") {
        this.setDataModel(this.pageData);
    }
    else{
        this.dataElements = this.pageData.elements;
        this.renderElements();
    }
};

PageView.prototype.setDataModel = function(pageData) {

    var self = this;
    this.pageData = pageData;
    this.dataElements = this.pageData.elements;

    if(this.elementChangeSubscription) {
        this.elementChangeSubscription.dispose();
    }
    this.elementChangeSubscription =this.dataElements.subscribe(function(changes){
        for (var i =0; i<changes.length;+i++){
            var obj = changes[i];
            if (obj.status=="added"){
                self.addElem(obj.value,obj.index);
                self.updateElements();
                self.updateStages();
            }
            else if(obj.status=="deleted"){
                console.log("removing object with index "+obj.index);
                self.removeElemFromView(obj.value,obj.index);
                self.updateElements();
                self.updateStages();
            }
        }
    },null, "arrayChange");


    if(this.bgColorSubscription) {
        this.bgColorSubscription.dispose();
    }
    this.bgColorSubscription =  this.pageData.bgColor.subscribe(function(newVal){
        self.renderElements();
    });

    this.renderElements();
};





PageView.prototype.resize = function(size) {

    if (size){
        this.width = size[0];
        this.height = size[1];
    }

    this.updateElements();
    this.updateStages();
};




PageView.prototype.renderElements = function() {

    $(this.divContainer).children().remove();
    this.viewElements = ko.observableArray([]).extend({sortById: null});


    var elements =this.pageData.elements();
    for (var i= 0, len=elements.length; i<len; i++) {
        var elem = elements[i];
        this.addElem(elem,i);
    }

    this.updateElements();
    this.updateStages();
};


PageView.prototype.setSize = function(size) {

    if (size){
        this.width = size[0];
        this.height = size[1];
    }

};

PageView.prototype.removeElemFromView = function(elementData,index) {

    console.log("this.viewElements().length = "+this.viewElements().length);
    var elemDiv = this.viewElements()[index].div;

    // remove div from DOM:
    elemDiv.remove();

    // remove from viewElements:
    this.viewElements.splice(index,1);
};

PageView.prototype.addElem = function(elementData,index) {

    // TODO what should go here add view model for single elements but how?
    this.viewElements.splice(index, 0, elementData);
};

PageView.prototype.selectElement = function(index){
    if(this.currSelectedElement() != this.currentPage().elements()[index]) {
        if (typeof(this.currSelectedElement()) !== 'undefined') {
            this.currSelectedElement().selected(false);
        }

        this.currSelectedElement(this.currentPage().elements()[index]);

        if (typeof(this.currSelectedElement()) !== 'undefined') {
            this.currSelectedElement().selected(true);
        }
    }
};


PageView.prototype.updateElements = function() {


    // var elements = this.viewElements();
    // for (var i = 0; i< elements.length; i++){
    //     elements[i].update(true,true);
    // }
};

PageView.prototype.updateStages = function() {
    // for (var i = 0; i< this.viewElements().length; i++){
    //     if (this.viewElements()[i].hasOwnProperty("stage")){
    //         this.viewElements()[i].stage.update();
    //     }
    // }
};

PageView.prototype.setSelectedElement = function(elem) {

    // change selection state of previously selected canvas element:
    var prevSelectedElem = this.pageData.currSelectedElement();

    if (prevSelectedElem){
        var formerIndex = this.dataElements.indexOf(prevSelectedElem);
        if (formerIndex>=0) {
            this.viewElements()[formerIndex].isSelected(false);
        }
    }

    if (elem) {
        if (elem.type == "Event") {
            // element is an event
            // check if element is really a child of this frame:
            if (this.pageData.events.byId[elem.id()]) {
                // change currently selected element:
                this.pageData.currSelectedElement(elem);
            }
        }
        else if (elem.type == "GlobalVar") {
            this.pageData.currSelectedElement(elem);
        }
        else {
            // element is an object
            // check if element is really a child of this frame:
            if (this.pageData.elements.byId[elem.id()]) {
                var index = this.dataElements.indexOf(elem);

                // change selection state of newly selected canvas element:
                this.viewElements()[index].isSelected(true);

                // change currently selected element:
                this.pageData.currSelectedElement(elem);
            }
        }
    }
    else {// deselect:
        // change currently selected element:
        this.pageData.currSelectedElement(null);
    }

};



PageView.prototype.removeElement = function(elem) {
    //this.currentPage().elements.remove(elem);
    this.currentPage().elements.remove(elem);
    this.selectElement(0);
};

PageView.prototype.moveUpElement = function (index) {
    if(index > 0){

        var array = this.currentPage().elements;
        array.splice(index-1, 2, this.currentPage().elements()[index], this.currentPage().elements()[index-1]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

PageView.prototype.moveDownElement = function (index) {
    if(index < this.currentPage().elements().length - 1){

        var array = this.currentPage().elements;
        array.splice(index, 2, this.currentPage().elements()[index+1], this.currentPage().elements()[index]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

PageView.prototype.selectElement = function(index){
    if(this.currSelectedElement() != this.currentPage().elements()[index]) {
        if (typeof(this.currSelectedElement()) !== 'undefined') {
            this.currSelectedElement().selected(false);
        }

        this.currSelectedElement(this.currentPage().elements()[index]);

        if (typeof(this.currSelectedElement()) !== 'undefined') {
            this.currSelectedElement().selected(true);
        }
    }
};



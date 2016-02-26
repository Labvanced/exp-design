// � by Caspar Goeke and Holger Finger


var FrameView = function(divContainer,frameData,parent,type) {
    var self = this;

    this.divContainer = divContainer;
    this.frameData = frameData;
    this.parent = parent;
    this.type= type;
    this.dataElements = this.frameData.elements;
    this.viewElements= ko.observableArray([]);
    this.width = 0;
    this.height = 0;

    this.scale = ko.observable(1);



    this.selectedTrialType = ko.observable({ type: 'default'});
    // 4 types possible: COMMENT
    // { type: 'default' }
    // { type: 'interacting', trialTypesInteractingIdx: 8, factors: [factor1_obj, factor2_obj], levels: [4 2] } // the index of array ExpTrialLoop.trialTypesInteracting
    // { type: 'noninteract', factor: noninteracting_factor2_obj, level: 5}
    // { type: 'wildcard', factor: factor1_obj, level: 3}
};


FrameView.prototype.init = function(size) {

    this.width = size[0];
    this.height = size[1];

    // resize once and set dataModel
    this.resize(size);
    if (this.type != "playerView") {
        this.setDataModel(this.frameData);
    }
    else{
        this.dataElements = this.frameData.elements;
        this.renderElements();
    }
};

FrameView.prototype.setDataModel = function(frameData) {

    var self = this;
    this.frameData = frameData;
    this.dataElements = this.frameData.elements;

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
                // ToDo include remove fucntion
                // self.removeElem(obj.value,obj.index);
            }
        }
    },null, "arrayChange");

    if(this.frameWidthSubscription) {
        this.frameWidthSubscription.dispose();
    }
    this.frameWidthSubscription =  this.frameData.frameWidth.subscribe(function(newVal){
        self.resize();
    });

    if(this.frameHeightSubscription) {
        this.frameHeightSubscription.dispose();
    }
    this.frameHeightSubscription =  this.frameData.frameHeight.subscribe(function(newVal){
        self.resize();
    });

    if(this.bgColorSubscription) {
        this.bgColorSubscription.dispose();
    }
    this.bgColorSubscription =  this.frameData.bgColor.subscribe(function(newVal){
        self.renderElements();
    });

    this.renderElements();
};


FrameView.prototype.setupBackground = function() {
    var bgFrameElement = new BgFrameElement(this.frameData,this);
    this.viewElements.push(bgFrameElement);
    $(this.divContainer).append(bgFrameElement.div);
};




FrameView.prototype.resize = function(size) {

    if (size){
       this.width = size[0];
       this.height = size[1];
    }

    this.updateElements();
    this.updateStages();
};




FrameView.prototype.renderElements = function() {

    $(this.divContainer).children().remove();
    this.viewElements= ko.observableArray([]);

    if (this.type== "editorView") {
        this.setupBackground();
    }

    var elements =this.frameData.elements();
    for (var i= 0, len=elements.length; i<len; i++) {
        var elem = elements[i];
        this.addElem(elem,i);
    }

    this.updateElements();
    this.updateStages();
};


FrameView.prototype.addElem= function(elementData,index) {

    if (elementData.type == "ImageData") {
        var canvasFrameElement = new CanvasFrameElement(elementData,this);
        var callbacks = null;
        if (this.type=="editorView"){
            var callbacks = new EditorCallbacks(canvasFrameElement,this);
        }
        else if (this.type=="playerView"){
            var callbacks = new PlayerCallbacks(canvasFrameElement,this);
        }
        this.viewElements.splice(index+1,0,canvasFrameElement);
        $(this.divContainer).append(canvasFrameElement.div);
    }

    else if (elementData.type == "VideoData") {

        var htmlFrameElement = new HtmlFrameElement(elementData,this);
        var callbacks = null;
        if (this.type=="editorView"){
            var callbacks = new EditorCallbacks(htmlFrameElement,this);
        }
        else if (this.type=="playerView"){
            var callbacks = new PlayerCallbacks(htmlFrameElement,this);
        }
        this.viewElements.splice(index+1,0,htmlFrameElement);
        $(this.divContainer).append(htmlFrameElement.div);
    }
};

FrameView.prototype.updateElements = function() {

    this.scale(Math.min(this.width/ this.frameData.frameWidth(),this.height/ this.frameData.frameHeight()));
    var elements = this.viewElements();
    for (var i = 0; i< elements.length; i++){
        elements[i].update(true,true);
    }
};

FrameView.prototype.updateStages = function() {
    for (var i = 0; i< this.viewElements().length; i++){
        if (this.viewElements()[i].hasOwnProperty("stage")){
            this.viewElements()[i].stage.update();
        }

    }
};

FrameView.prototype.setSelectedElement = function(elem) {

    // change selection state of previously selected canvas element:
    var prevSelectedElem = this.frameData.currSelectedElement();

    if (prevSelectedElem){
        var formerIndex =this.dataElements.indexOf(prevSelectedElem)+1;
        this.viewElements()[formerIndex].isSelected(false);
    }

    if (elem) {
        // check if element is really a child:
        if (this.frameData.elements.byId[elem.id()]) {
            var index =this.dataElements.indexOf(elem)+1;

            // change selection state of newly selected canvas element:
            this.viewElements()[index].isSelected(true);

            // change currently selected element:
            this.frameData.currSelectedElement(elem);
        }
    }
    else {// deselect:
        // change currently selected element:
        this.frameData.currSelectedElement(null);
    }

};
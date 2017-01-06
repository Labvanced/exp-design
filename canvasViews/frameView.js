// � by Caspar Goeke and Holger Finger


var FrameView = function(divContainer,frameData,parent,type) {
    var self = this;

    this.divContainer = divContainer;

    this.parent = parent;
    this.type= type;
    this.frameData = frameData;
    this.dataElements = null;

    this.bgElement = null;
    this.viewElements= ko.observableArray([]).extend({sortById: null});

    this.width = 0;
    this.height = 0;

    this.scale = ko.observable(1);

    this.scale.subscribe(function(scale){
        if (self.type== "editorView") {
            $(self.divContainer).css({
                "width": self.frameData.frameWidth() * scale + 4,
                "height": self.frameData.frameHeight() * scale + 4
            });
        }
    });


    this.selectedTrialType = ko.observable({ type: 'default'});
    // 4 types possible: COMMENT
    // { type: 'default' }
    // { type: 'interacting', factors: [factor1_obj, factor2_obj], levels: [4 2] } // the index of array ExpTrialLoop.trialTypesInteracting
    // { type: 'noninteract', factor: noninteracting_factor2_obj, level: 5}
    // { type: 'wildcard', factor: factor1_obj, level: 3}
};


FrameView.prototype.init = function(size) {
    var self =this;

    if (this.type=="editorView") {
        function MouseWheelHandler(e) {

            // cross-browser wheel delta
            var e = window.event || e; // old IE support
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
            var oldScale = self.scale();
            if (delta>0){
                var newScale = oldScale * (1+delta/20.0);
            }
            else {
                var newScale = oldScale / (1-delta/20.0);
            }
            self.scale( newScale );

            e.preventDefault();

            return false;
        }

        if (this.divContainer.addEventListener) {
            // IE9, Chrome, Safari, Opera
            this.divContainer.addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            this.divContainer.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
        }
        else {
            // IE 6/7/8
            this.divContainer.attachEvent("onmousewheel", MouseWheelHandler);
        }

    }

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
                console.log("removing object with index "+obj.index);
                self.removeElemFromView(obj.value,obj.index);
                self.updateElements();
                self.updateStages();
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
    this.bgElement = bgFrameElement;
    $(this.divContainer).append(bgFrameElement.div);
};

FrameView.prototype.setSize = function(size) {

    if (size){
        this.width = size[0];
        this.height = size[1];
    }

};

FrameView.prototype.setDiv= function(div) {
    this.divContainer = div;
};


FrameView.prototype.resize = function(size) {

    this.setSize(size);

    this.updateElements();
    this.updateStages();
};




FrameView.prototype.renderElements = function() {

    $(this.divContainer).children().remove();
    this.viewElements = ko.observableArray([]).extend({sortById: null});

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


FrameView.prototype.removeElemFromView = function(elementData,index) {

    console.log("this.viewElements().length = "+this.viewElements().length);
    var elemDiv = this.viewElements()[index].div;

    // remove div from DOM:
    elemDiv.remove();

    // remove from viewElements:
    this.viewElements.splice(index,1);
};

FrameView.prototype.addElem = function(elementData,index) {

    var elemView = new FrameElementView(elementData,this);
    // var elemView = new CanvasFrameElementView(elementData,this); // deprecated easeljs canvas elements

    var callbacks = null;
    if (this.type=="editorView") {
        var callbacks = new EditorCallbacks(elemView,this);
    }
    else if (this.type=="playerView") {
        var callbacks = new PlayerCallbacks(elemView,this);
    }
    this.viewElements.splice(index, 0, elemView);
    $(this.divContainer).append(elemView.div);

};

FrameView.prototype.updateElements = function() {

    if (this.type!="sequenceView"){
        this.scale(Math.min(this.width/ this.frameData.frameWidth(),this.height/ this.frameData.frameHeight()));
    }
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
    if (this.bgElement && this.bgElement.hasOwnProperty("stage")) {
        this.bgElement.stage.update();
    }
};

FrameView.prototype.setSelectedElement = function(elem) {

    // change selection state of previously selected canvas element:
    var prevSelectedElem = this.frameData.currSelectedElement();

    if (prevSelectedElem){
        var formerIndex = this.dataElements.indexOf(prevSelectedElem);
        if (formerIndex>=0) {
            this.viewElements()[formerIndex].isSelected(false);
        }
    }

    if (elem) {
        if (elem.type == "Event") {
            // element is an event
            // change currently selected element:
            this.frameData.currSelectedElement(elem);
        }
        else if (elem.type == "GlobalVar") {
            this.frameData.currSelectedElement(elem);
        }
        else {
            // element is an object
            // check if element is really a child of this frame:
            if (this.frameData.elements.byId[elem.id()]) {
                var index = this.dataElements.indexOf(elem);

                // change selection state of newly selected canvas element:
                this.viewElements()[index].isSelected(true);

                // change currently selected element:
                this.frameData.currSelectedElement(elem);
            }
        }
    }
    else {// deselect:
        // change currently selected element:
        this.frameData.currSelectedElement(null);
    }

};
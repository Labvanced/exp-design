// � by Caspar Goeke and Holger Finger


var FrameView = function(divContainer,parent,type) {
    var self = this;

    this.divContainer = divContainer;

    this.parent = parent;
    this.type = type;

    this.frameData = null;
    this.frameDataObs = ko.observable(null);

    this.bgElement = null;
    this.viewElements= ko.observableArray([]).extend({sortById: null});

    this.width = 0;
    this.height = 0;

    this.subElemSelected = false;

    this.scale = ko.observable(1);
    this.scaleSubscription = this.scale.subscribe(function(scale){
        if (self.type== "editorView") {
            $(self.divContainer).css({
                "width": self.frameData.frameWidth() * scale + 4,
                "height": self.frameData.frameHeight() * scale + 4
            });
            $(self.backgroundDiv).css({
                "width":self.frameData.frameWidth() *   self.scale(),
                "height": self.frameData.frameHeight()  * self.scale()
            });
        }
    });

    this.selectedTrialType = ko.observable({ type: 'default'});
    this.isInitialized = false;
};

/**
 * this init function should only be called after setDataModel was called!
 * @param size
 */
FrameView.prototype.init = function(size) {

    if (!this.isInitialized) {
        var self = this;

        this.setSize(size);

        if (this.type == "editorView") {
            function MouseWheelHandler(e) {

                // cross-browser wheel delta
                var e = window.event || e; // old IE support
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                var oldScale = self.scale();
                if (delta > 0) {
                    var newScale = oldScale * (1 + delta / 20.0);
                }
                else {
                    var newScale = oldScale / (1 - delta / 20.0);
                }
                self.scale(newScale);

                e.preventDefault();

                return false;
            }


            var outerDiv = $('#editorFrameView')[0];
            $(outerDiv).css({
                "overflow": "auto"
            });

            if (outerDiv.addEventListener) {
                // IE9, Chrome, Safari, Opera
                outerDiv.addEventListener("mousewheel", MouseWheelHandler, false);
                // Firefox
                outerDiv.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
            }
            else {
                // IE 6/7/8
                outerDiv.attachEvent("onmousewheel", MouseWheelHandler);
            }

        }
        this.isInitialized = true;
    }
};

FrameView.prototype.dispose = function() {
    // dispose all previous view elements (removing ko components and other clean up):
    var viewElements = this.viewElements();
    for (var i= 0, len=viewElements.length; i<len; i++) {
        viewElements[i].dispose();
    }
    this.scaleSubscription.dispose();


    // remove complete div
    ko.cleanNode(this.divContainer[0]);
    this.divContainer[0].remove();
};

FrameView.prototype.setDataModel = function(frameData) {

    var self = this;
    this.frameData = frameData;
    this.frameDataObs(frameData);

    if(this.elementChangeSubscription) {
        this.elementChangeSubscription.dispose();
    }
    this.elementChangeSubscription = this.frameData.elements.subscribe(function(changes){
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
    this.frameWidthSubscription = this.frameData.frameWidth.subscribe(function(newVal){
        self.recalcScale();
    });

    if(this.frameHeightSubscription) {
        this.frameHeightSubscription.dispose();
    }
    this.frameHeightSubscription =  this.frameData.frameHeight.subscribe(function(newVal){
        self.recalcScale();
    });

    /**
    if(this.bgColorSubscription) {
        this.bgColorSubscription.dispose();
    }
    this.bgColorSubscription =  this.frameData.bgColor.subscribe(function(newVal){
        self.renderElements();
    });
     **/

    // initialize the scale of the frame:
    this.recalcScale();
    this.renderElements();
};

FrameView.prototype.recalcScale = function() {
    // can only be done if frameData is set:
    var self = this;
    if (this.frameData) {
        this.scale(Math.min(this.width/ this.frameData.frameWidth(),this.height/ this.frameData.frameHeight()));
        if (this.type== "editorView" && this.bgElement){
            this.bgElement.update();

            $(this.backgroundDiv).css({
                "width":self.frameData.frameWidth() * self.scale(),
                "height": self.frameData.frameHeight() * self.scale()
            });
        }
        if (this.type === "playerView") {
            var task = this.frameData.parent.parent;
            switch (task.zoomMode()) {
                case "fullscreen":
                    this.scale(Math.min(this.width/ this.frameData.frameWidth(),this.height/ this.frameData.frameHeight()));
                    break;
                case "visualDegree":
                    var distToScreenInMM = 500;
                    var designUnitsPerDegree = task.visualDegreeToUnit();
                    var mmPerDegree = 2 * Math.PI * distToScreenInMM / 360; // at the center of the screen in mm/deg
                    var pxPerDeg = this.parent.player.PixelDensityPerMM * mmPerDegree;
                    this.scale(pxPerDeg / designUnitsPerDegree);  // scale is in px/designUnits
                    break;
                case "pixel":
                    this.scale(1);
                    break;
                case "millimeter":
                    this.scale(this.parent.player.PixelDensityPerMM);
                    break;
            }
        }
    }
};

FrameView.prototype.setupBackground= function() {
    var self = this;
    this.backgroundDiv = document.createElement('div');
    this.backgroundDiv.id = "background";
    $(this.backgroundDiv).css({
        "position": "absolute",
        "left": 0,
        "top": 0,
        "width": self.frameData.frameWidth() * self.scale(),
        "height": self.frameData.frameHeight() * self.scale(),
        "background-color": self.frameData.bgColor()
    });

    if (this.colorSubscription ){
        this.colorSubscription.dispose();
    }
    this.colorSubscription = this.frameData.bgColor.subscribe(function(val){
        $(self.backgroundDiv).css({
            "background-color":val
        });
    });


    $(this.divContainer).append(this.backgroundDiv);
};

FrameView.prototype.setupGrid = function() {
    var bgFrameElement = new BgFrameElement(this.frameData,this);
    this.bgElement = bgFrameElement;
    $(this.divContainer).append(bgFrameElement.div);
};

FrameView.prototype.setSize = function(size) {
    this.width = size[0];
    this.height = size[1];
    this.recalcScale();
};

FrameView.prototype.setDiv= function(div) {
    this.divContainer = div;
};

FrameView.prototype.resize = function(size) {
    console.log('set FrameView size to '+size);
    this.setSize(size);
    this.updateElements();
};

FrameView.prototype.renderElements = function() {
    console.log("renderElements on this frame...");
    var i,len;

    // dispose all previous view elements (removing ko components and other clean up):
    var viewElements = this.viewElements();
    for (i= 0, len=viewElements.length; i<len; i++) {
        viewElements[i].dispose();
    }

    $(this.divContainer).children().remove();
    this.viewElements([]);

    if (this.type== "editorView") {
        this.setupBackground();
        this.setupGrid();
    }
    else {
        this.setupBackground();
    }

    var elements =this.frameData.elements();
    for (i= 0, len=elements.length; i<len; i++) {
        var elem = elements[i];
        this.addElem(elem,i);
    }

    this.updateElements();
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

    var elemView = new FrameElementView(elementData, this);

    if (this.type == "editorView") {
       var cbs =  new EditorCallbacks(elemView, this,'editor',true,true,true);
        elemView.editorCallbacks = cbs;
    }
    else if (this.type == "playerView") {
        if ( elementData.canBeResized() || elementData.canBeDragged() || elementData.canBeSelected()){
            var cbs = new EditorCallbacks(elemView, this,'player',elementData.canBeResized(),elementData.canBeDragged(),elementData.canBeSelected());
            elemView.editorCallbacks = cbs;
        }

    }
    this.viewElements.splice(index, 0, elemView);

    $(this.divContainer).append(elemView.div);
};

FrameView.prototype.updateElements = function() {
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

    if (!this.frameData) {
        return;
    }

    // change selection state of previously selected canvas element:
    var prevSelectedElem = this.frameData.currSelectedElement();
    if (prevSelectedElem){
         if (!(prevSelectedElem instanceof Event || prevSelectedElem instanceof GlobalVar )){
             this.viewElements.byId[prevSelectedElem.id()].isSelected(false);
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
                this.viewElements.byId[elem.id()].isSelected(true);

                // change currently selected element:
                this.frameData.currSelectedElement(elem);
            }
        }
    }
    else { // deselect:
        // change currently selected element:
        this.frameData.currSelectedElement(null);
    }

};
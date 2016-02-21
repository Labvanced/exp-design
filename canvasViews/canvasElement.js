// � by Caspar Goeke and Holger Finger

var CanvasElement = function(dataModel, activeElement,editor) {
    var self = this;


    this.dataModel = dataModel;
    this.activeElement = activeElement;
    this.editor = editor;

    // set height and width and subscirve
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.width = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorWidth();
        }, this);
        this.height = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorHeight();
        }, this);
    }
    else {

        this.width = ko.computed(function() {
            return this.dataModel.editorWidth();
        }, this);
        this.height = ko.computed(function() {
            return this.dataModel.editorHeight();
        }, this);
    }





    this.radius1 = ko.observable(20);
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);

    this.gridSpaceInPixels = 10;
    this.isSelected = ko.observable(false);

    // creating containers
    this.container = new createjs.Container();
    this.elem = new createjs.Container();
    this.elem.name = "elem";
    this.container.addChild(this.elem);


    // add shape
    function recreateShape(){
        var shape = new createjs.Shape();
        if (self.isSelected()) {
            var fillColor = "#dddddd";
            var borderColor = "#3baae3";
            var strokeWidth = 6;
        }
        else {
            var fillColor = "#dddddd";
            var borderColor = "black";
            var strokeWidth = 2;
        }
        if (self.dataModel.shape =="circle"){
            shape.graphics.setStrokeStyle(strokeWidth).beginStroke(borderColor).beginFill(fillColor).drawCircle(0, 0, self.radius1());
        }
        else if (self.dataModel.shape =="square") {
            shape.graphics.setStrokeStyle(strokeWidth).beginStroke(borderColor).beginFill(fillColor).drawRect(0, 0, self.width(), self.height());
        }
        shape.name = "placeholderBox";

        // readd to elem:
        var oldShape = self.elem.getChildByName("placeholderBox");
        if (oldShape) {
            self.elem.removeChild(oldShape);
        }
        self.elem.addChildAt(shape, 0);
    }
    recreateShape();
    this.isSelected.subscribe(function(){
        recreateShape();
    });
    this.width.subscribe(function(){
        recreateShape();
    });
    this.height.subscribe(function(){
        recreateShape();
    });

    // label and resize Element
    var label = new createjs.Text(this.dataModel.name(), "12px Arial", "black");
    label.textAlign = 'center';
    label.name = "label";
    label.y = (this.height()/2)-7;
    label.x = this.width()/2;
    this.dataModel.name.subscribe(function(newValue) {
        label.text = newValue;
    });
    this.elem.addChild(label);

    // add activation state as small icon:
    if (this.dataModel.type== "ExpTrialLoop" || this.dataModel.type== "TextEditorData"|| this.dataModel.type== "QuestionnaireEditorData"){
        // checkboxes for containers
        this.iconSheet = new Image();
        this.iconSheet.src = '/resources/yesno.png';
        var self=this;
        if (this.iconSheet.complete) {
            this.onImageLoad();
        }
        else {
            this.iconSheet.addEventListener('load', function() {
                self.onImageLoad();
            });
            this.iconSheet.addEventListener('error', function() {
                alert('error')
            })
        }
    }

    else{
     //   this.elem.x = 0.5*this.width();
     //  this.elem.y = 0.5*this.height();
    }

    // add Callbacks
    this.addCallbacks(this.elem);

    // set initial position and subscribe:
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.container.x = this.dataModel.modifier().selectedTrialView.editorX();
        this.dataModel.modifier().selectedTrialView.editorX.subscribe(function(x) {
            self.container.x = x;
        });
        this.container.y = this.dataModel.modifier().selectedTrialView.editorY();
        this.dataModel.modifier().selectedTrialView.editorY.subscribe(function(y) {
            self.container.y = y;
        });
    }
    else {
        this.container.x = this.dataModel.editorX();
        this.dataModel.editorX.subscribe(function(x) {
            self.container.x = x;
        });
        this.container.y = this.dataModel.editorY();
        this.dataModel.editorY.subscribe(function(y) {
            self.container.y = y;
        });
    }

    this.width.subscribe(function(){
        self.updateSize();
    });
    this.height.subscribe(function(){
        self.updateSize();
    });


    this.drawAllPorts();

    this.container.canvasElement = this;
};


CanvasElement.prototype.onImageLoad = function() {

    var data = {
        images: [this.iconSheet],
        frames: {width: 32, height: 32},
        animations: {no: 0}
    };

    var spriteSheet = new createjs.SpriteSheet(data);
    var icon1 = new createjs.Sprite(spriteSheet);
    icon1.x = this.width()-16;
    icon1.y = this.height()-16;
    icon1.scaleX = 0.5;
    icon1.scaleY = 0.5;
    icon1.name = "icon";

    var self = this;

    function renderIcon(){
        var icon =  self.container.getChildByName("icon");
        if (self.dataModel.isActive()){
            icon1.gotoAndStop(1);
        }
        else{
            icon1.gotoAndStop(0);
        }
    }

    icon1.addEventListener("click", function (ev) {
        if (self.dataModel.isActive()){
            self.dataModel.isActive(false);
        }
        else{
            self.dataModel.isActive(true);
        }
        renderIcon();
    });
    renderIcon();

    this.container.addChild(icon1);

};



CanvasElement.prototype.addCallbacks = function(elem) {
    var self = this;

    // defining double click callback
    if (typeof this.dataModel.doubleClick === "function") {
        elem.addEventListener("dblclick", function (ev) {
            if (self.dataModel.type== "ExpTrialLoop" || self.dataModel.type== "TextEditorData"|| self.dataModel.type== "QuestionnaireEditorData"){
                if (self.dataModel.isActive()){
                    self.dataModel.doubleClick();
                }
            }
            else{
                self.dataModel.doubleClick();
            }
        });
    }


    // defining pressmove callbacks
    if (this.activeElement) {


        if (this.dataModel.type =="ImageData" || this.dataModel.type =="VideoData"){


            elem.addEventListener("stagemousemove", function(evt){

                var xPos = self.dataModel.editorX();
                var yPos = self.dataModel.editorY();
                var mouseAt = self.container.parent.globalToLocal(evt.stageX, evt.stageY);
                var currDistanceX = xPos - mouseAt.x;
                var currDistanceY = yPos - mouseAt.y;
                if( Math.abs(currDistanceX) >=self.gridSpaceInPixels || Math.abs(currDistanceY) >=self.gridSpaceInPixels ){
                    self.setCoord(mouseAt.x+self.editor.clickOffsetX, mouseAt.y+self.editor.clickOffsetY);
                }

            });

        }
        else{
            elem.addEventListener("stagemousemove", function (ev) {
                var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
                self.setCoord( mouseAt.x, mouseAt.y  );
            });
        }

    }
};


CanvasElement.prototype.drawAllPorts = function() {
    var self = this;

    // only execute if the element has a portHandler
    if (this.dataModel.portHandler){

        // first remove all previous port shapes:
        for(var i = this.container.children.length-1; i >= 0; i--){
            if(this.container.children[i].isPort) {
                this.container.removeChildAt(i);
            }
        }

        // now draw all ports:
        var ports = this.dataModel.portHandler.ports();

        var executeInPorts = [];
        var executeOutPorts = [];
        for (var i= 0, len=ports.length; i<len; i++) {
            if (ports[i].portType() == 'executeIn'){
                executeInPorts.push(ports[i]);
            }
            else if(ports[i].portType() == 'executeOut'){
                executeOutPorts.push(ports[i]);
            }
        }

        var width;
        var height;
        if (this.dataModel.shape =="circle"){
            width = this.radius1()*2;
            height = this.radius1()*2;
        }
        else if (this.dataModel.shape =="square") {
            width = this.width();
            height = this.height();
        }

        function createPortShape(portDataModel) {
            var elem = new createjs.Shape();
            elem.graphics.beginFill("#414141").drawCircle(0, 0, 5);
            elem.isPort = true;
            elem.portDataModel = portDataModel;
            //console.log('creating port shape for element '+self.dataModel.id()+' and portId '+elem.portDataModel.id());
            elem.addEventListener("click", function (ev) {
                // start creating a connection:
                //console.log('start creating connection from element '+self.dataModel.id()+' and port '+elem.portDataModel.id());
                var connSpec = {
                    id: self.dataModel.id(),
                    portId: elem.portDataModel.id()
                };
                uc.currentEditorView.sequenceView.createConnection(connSpec);
            });
            portDataModel.canvasShape = elem;
            return elem;
        }

        var executeInOffsets = height / (executeInPorts.length+1);
        for (var i= 0, len=executeInPorts.length; i<len; i++) {
            var elem = createPortShape(executeInPorts[i]);
            elem.x = 0;
            elem.y = this.height()/2;
            this.container.addChild(elem);
        }

        var executeOutOffsets = height / (executeOutPorts.length+1);
        for (var i= 0, len=executeOutPorts.length; i<len; i++) {
            var elem = createPortShape(executeOutPorts[i]);
            elem.x = this.width();
            elem.y = this.height()/2;
            this.container.addChild(elem);
        }
    }
};


CanvasElement.prototype.replaceWithImage = function(imgSource) {
    var self = this;

    if (imgSource) {
        var img = new Image;
        img.src = imgSource;
        img.onload = function () {

            // remove placeholder
            var placeHolder = self.container.getChildByName("elem");
            if (placeHolder) {
                self.container.removeChild(placeHolder);
            }
            // remove previously set image and resize elements:
            var oldImage = self.container.getChildByName("image");
            if (oldImage) {
                self.container.removeChild(oldImage);
            }
            var oldResizeElem = self.container.getChildByName("resize");
            if (oldResizeElem) {
                self.container.removeChild(oldResizeElem);
            }

            // initialize original size:
            self.fullWidth(this.width);
            self.fullHeight(this.height);

            var bitmap = new createjs.Bitmap(imgSource);
            bitmap.x = 0;
            bitmap.y = 0;
            bitmap.name = "image";
            self.container.addChild(bitmap);

            self.makeResizeElem();
            self.updateSize();
            self.addCallbacks(bitmap);
        }
    }
    else {
        // set the box drawing to visible:
        self.container.getChildByName("elem").visible = true;

        // remove previously set image and resize elements:
        var oldImage = self.container.getChildByName("image");
        if (oldImage) {
            self.container.removeChild(oldImage);
        }
        var oldResizeElem = self.container.getChildByName("resize");
        if (oldResizeElem) {
            self.container.removeChild(oldResizeElem);
        }
    }
};


CanvasElement.prototype.makeResizeElem = function() {
    var edgeLength = 20;
    this.resizeElem= new createjs.Shape();

    this.resizeElem.x = this.width();
    this.resizeElem.y = this.height();
    this.resizeElem.graphics.beginFill("black").moveTo(edgeLength/2, -edgeLength/2).lineTo(edgeLength/2,edgeLength/2).lineTo(-edgeLength/2, edgeLength/2).lineTo(edgeLength/2, -edgeLength/2);
    this.resizeElem.visible= true;
    this.resizeElem.name = "resize";

    var self = this;
    this.resizeElem.addEventListener("stagemousemove", function (ev) {
        var mouseAt = ev.currentTarget.globalToLocal(ev.stageX, ev.stageY);
        var scaleChangeInPixel = mouseAt.x;
        if (self.width()>= 10  || scaleChangeInPixel>0 ){
            var sizeRatio = (self.width()+scaleChangeInPixel) /self.fullWidth();
            var w = self.fullWidth()*sizeRatio;
            var h = self.fullHeight()*sizeRatio;
            self.setWidthAndHeight(w,h);
        }
    });
    self.container.addChild(this.resizeElem);
};



CanvasElement.prototype.updateSize = function(){

    if (this.resizeElem){
        this.resizeElem.x = this.width()+20;
        this.resizeElem.y = this.height()+20;
    }

    if (this.dataModel.type == "ImageData"){
        var image = this.container.getChildByName("image");
        if (image) {

            image.scaleX =  this.width() / this.fullWidth();
            image.scaleY =  this.height() / this.fullHeight();
        }
    }
    else if (this.dataModel.type == "VideoData"){

        var video = $(document.getElementById(this.divId())).children()[0];

        if (this.editor.type == "editorView") {
            $(video).css(
                "height", this.height()
            );
            $(video).css(
                "width",   this.width()
            );
        }

        else if (this.editor.type == "sequenceView"){
            var  viewSizeEditor = this.editor.parent.trialEditor.mediaEditor.getViewSize()
            var  ratioX = this.width()/ viewSizeEditor[0];
            var  ratioY = this.height()/ viewSizeEditor[1];
            var canvasRatio = this.editor.parent.trialEditor.mediaEditor.dataModel.frameWidth()/this.editor.parent.trialEditor.mediaEditor.dataModel.frameHeight();
            var cropRatio = (this.editor.parent.slideWidth/ this.editor.parent.slideHeight) /canvasRatio;

            if (canvasRatio <=1.77778){ // 16:9 or smaller
                var width= (this.editor.parent.slideWidth/cropRatio)*ratioX;
                var height = (this.editor.parent.slideHeight)*ratioY;

            }
            else{
                var width = (this.editor.parent.slideWidth)*ratioX;
                var height= (this.editor.parent.slideHeight*cropRatio)*ratioY;
            }

        }

        $(video).css(
            "height", height
        );
        $(video).css(
            "width",   width
        );

    }




};


CanvasElement.prototype.setActiveElement = function(isActive) {
    // set current resize active
    if (this.container.getChildByName("resize")){
        this.container.getChildByName("resize").visible= isActive;
    }
};

CanvasElement.prototype.setWidthAndHeight = function(w,h) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.dataModel.modifier().selectedTrialView.editorWidth(w);
        this.dataModel.modifier().selectedTrialView.editorHeight(h);
    }
    else {
        this.dataModel.editorWidth(w);
        this.dataModel.editorHeight(h);
    }

};

CanvasElement.prototype.setCoord = function(x,y) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.dataModel.modifier().selectedTrialView.editorX(x);
        this.dataModel.modifier().selectedTrialView.editorY(y);
    }
    else {
        this.dataModel.editorX(x);
        this.dataModel.editorY(y);
    }

    return this;
};








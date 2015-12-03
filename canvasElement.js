// � by Caspar Goeke and Holger Finger

var CanvasElement = function(dataModel) {
    this.dataModel = dataModel;

    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.width = ko.observable(140);
    this.height = ko.observable(70);
    this.radius1 = ko.observable(30);
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);

    this.gridSpaceInPixels = 25;

    this.isSelected = ko.observable(false);


    // creating containers
    this.container = new createjs.Container();
    var elem = new createjs.Shape();
    var self = this;

    // drawing of elements
    if (this.dataModel.shape =="circle"){
        elem.graphics.beginStroke("black").beginFill("gray").drawCircle(this.x(), this.y(), this.radius1());
    }
    else if (this.dataModel.shape =="square") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-this.width()/2, -this.height()/2, this.width(), this.height());
    }
    elem.name = "placeholderBox";

    // add Callbacks
    this.addCallbacks(elem);

    // label and resize Element
    var label = new createjs.Text(this.dataModel.name(), "14px Arial", "#FFF");
    label.textAlign = 'center';
    label.name = "label";
    label.y = -7;
    this.tabelBoxSubscription = this.dataModel.name.subscribe(function(newValue) {
        self.container.getChildByName("label").text = newValue;
    });


    // add element to container
    this.container.addChild(elem);
    this.container.addChild(label);

    self.setCoord(550, 300);

    this.drawAllPorts();
};

CanvasElement.prototype.addCallbacks = function(elem) {
    var self = this;

    // define click callback for all elements:
    elem.addEventListener("click", function (ev) {
        //self.setActiveElement();
        uc.currentEditorView.setActiveElement(self.dataModel);
    });

    // defining double click callback
    if (typeof this.dataModel.doubleClick === "function") {
        elem.addEventListener("dblclick", function (ev) {
            self.dataModel.doubleClick();
        });
    }

    // defining pressmove callbacks
    if (this.dataModel.type =="ImageData" || this.dataModel.type =="VideoData"){

        elem.addEventListener("pressmove", function (ev) {
            var xPos = self.x();
            var yPos = self.y();
            var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
            var currDistanceX = xPos - mouseAt.x;
            var currDistanceY = yPos - mouseAt.y;
            if( Math.abs(currDistanceX) >=self.gridSpaceInPixels || Math.abs(currDistanceY) >=self.gridSpaceInPixels ){
                self.setCoord(mouseAt.x, mouseAt.y);
            }
        });
    }
    else{
        elem.addEventListener("pressmove", function (ev) {
            var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
            self.setCoord( mouseAt.x, mouseAt.y  );
        });
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
            elem.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(0, 0, 3);
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
                uc.currentEditorView.createConnection(connSpec);
            });
            portDataModel.canvasShape = elem;
            return elem;
        }

        var executeInOffsets = height / (executeInPorts.length+1);
        for (var i= 0, len=executeInPorts.length; i<len; i++) {
            var elem = createPortShape(executeInPorts[i]);
            elem.x = -width/2;
            elem.y = -height/2 + executeInOffsets * (i+1);
            this.container.addChild(elem);
        }

        var executeOutOffsets = height / (executeOutPorts.length+1);
        for (var i= 0, len=executeOutPorts.length; i<len; i++) {
            var elem = createPortShape(executeOutPorts[i]);
            elem.x = width/2;
            elem.y = -height/2 + executeOutOffsets * (i+1);
            this.container.addChild(elem);
        }
    }
};


CanvasElement.prototype.replaceWithImage = function(imgSource) {
    var self = this;
    var img = new Image;
    img.src = imgSource;

    this.tabelBoxSubscription.dispose();

    img.onload = function() {

        self.container.removeAllChildren();
        self.fullWidth(this.width);
        self.fullHeight(this.height);
        var sizeRatio = self.width() /self.fullWidth();
        var xyRatio =  self.fullWidth() /self.fullHeight();

        var w = self.fullWidth()*sizeRatio;
        var h = self.fullHeight()*sizeRatio;
        self.setWidthAndHeight(w,h);

        var bitmap = new createjs.Bitmap(imgSource);
        bitmap.x = -self.width()/2;
        bitmap.y = -self.height()/2;
        bitmap.scaleX = sizeRatio;
        bitmap.scaleY = sizeRatio;
        bitmap.name = "image";

        self.addCallbacks(bitmap);

        var resizeElem = self.makeResizeElem();

        self.container.addChild(bitmap);
        self.container.addChild(resizeElem);
    }
};


CanvasElement.prototype.makeResizeElem = function() {
    var edgeLength = 20;
    var resizeElem = new createjs.Shape();

    resizeElem.x = this.width()/2;
    resizeElem.y = this.height()/2;
    resizeElem.graphics.beginFill("black").moveTo(edgeLength/2, -edgeLength/2).lineTo(edgeLength/2,edgeLength/2).lineTo(-edgeLength/2, edgeLength/2).lineTo(edgeLength/2, -edgeLength/2);


    resizeElem.visible= true;
    resizeElem.name = "resize";
    var self = this;
    resizeElem.addEventListener("pressmove", function (ev) {

        var mouseAt = ev.currentTarget.globalToLocal(ev.stageX, ev.stageY);
        var scaleChangeInPixel = mouseAt.x;
        if (self.width()>= 10  || scaleChangeInPixel>0 ){

            var scaleChangeInPercent = scaleChangeInPixel/self.width();
            var scaleChangeAbsolute = self.container.getChildByName("image").scaleX*scaleChangeInPercent;

            var sizeRatio = (self.width()+scaleChangeInPixel) /self.fullWidth();
            var w = self.fullWidth()*sizeRatio;
            var h = self.fullHeight()*sizeRatio;
            self.setWidthAndHeight(w,h);

            ev.currentTarget.x = self.width()/2;
            ev.currentTarget.y = self.height()/2;
            self.container.getChildByName("image").x = -self.width()/2;
            self.container.getChildByName("image").y = -self.height()/2;

            self.container.getChildByName("image").scaleX += scaleChangeAbsolute;
            self.container.getChildByName("image").scaleY += scaleChangeAbsolute;
        }
    });

    return resizeElem
};


CanvasElement.prototype.setActiveElement = function() {
    uc.currentEditorView.setActiveElement();

    if (this.dataModel.parentSequence){
        this.dataModel.parentSequence.currSelectedElement(this.dataModel.id());
        // hide all  resize elements
        for (var i = 0;i<this.dataModel.parentSequence.elements().length;i++){
            var elem = this.dataModel.parentSequence.elements()[i];
            if (elem.hasOwnProperty("canvasElement")){
                if (elem.canvasElement.container.getChildByName("resize")){
                    elem.canvasElement.container.getChildByName("resize").visible= false;
                }
            }
        }
        // set current resize active
        if (this.container.getChildByName("resize")){
            this.container.getChildByName("resize").visible= true;
        }
    }
};


CanvasElement.prototype.setWidthAndHeight = function(w,h) {
    this.width(w);
    this.height(h);
};


CanvasElement.prototype.addPorts = function(ports) {
    // add all port containers to this container:
    for (var i= 0, len=ports.length; i<len; i++) {
        this.container.addChild(ports[i].container);
    }
};


CanvasElement.prototype.fromJS = function(data) {
    this.x(data.x);
    this.y(data.y);
    this.setCoord(data.x, data.y);
    this.drawAllPorts();
    return this;
};


CanvasElement.prototype.toJS = function() {
    return {
        x: this.x(),
        y: this.y()
    };
};



CanvasElement.prototype.setCoord = function(x,y) {
    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;
    return this;
};








var CanvasElement = function(dataModel) {
    this.dataModel = dataModel;

    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.width = ko.observable(200);
    this.height = ko.observable(100);
    this.radius1 = ko.observable(40);

    this.gridSpaceInPixels = 25;


    // creating containers
    this.container = new createjs.Container();
    var elem = new createjs.Shape();
    var self = this;

    // drawing of elements
    if (dataModel.shape =="circle"){
        elem.graphics.beginStroke("black").beginFill("gray").drawCircle(this.x(), this.y(), this.radius1());
    }
    else if (dataModel.shape =="square") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-this.width()/2, -this.height()/2, this.width(), this.height());
    }

    // add Callbacks
    this.addCallbacks(elem);

    // add element to container
    this.container.addChild(elem);
    var label = new createjs.Text(dataModel.label, "14px Arial", "#FFF");
    label.textAlign = 'center';
    this.container.addChild(label);

    self.setCoord(550, 300);

    this.drawAllPorts();
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
                uc.experimentEditor.createConnection(connSpec);
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

    img.onload = function() {

        self.container.removeAllChildren();
        var sizeRatio = self.width() /this.width;
        var xyRatio = this.width /this.height;

        var w = this.width*sizeRatio;
        var h = this.height*sizeRatio;
        self.setWidthAndHeight(w,h);

        var bitmap = new createjs.Bitmap(imgSource);
        bitmap.x = -self.width()/2;
        bitmap.y = -self.width()*xyRatio/2;
        bitmap.scaleX = sizeRatio;
        bitmap.scaleY = sizeRatio;

        self.addCallbacks(bitmap);

        var edgeLength = 20;
        var resizeElem = new createjs.Shape();
        resizeElem.graphics.beginFill("black").moveTo(self.width()/2+(edgeLength/2), self.height()/2-(edgeLength/2)).lineTo(self.width()/2+(edgeLength/2),self.height()/2+edgeLength-(edgeLength/2)).lineTo(self.width()/2-edgeLength+(edgeLength/2), self.height()/2+edgeLength-(edgeLength/2)).lineTo(self.width()/2+(edgeLength/2), self.height()/2-(edgeLength/2));

        self.container.addChild(bitmap);
        self.container.addChild(resizeElem);

        //self.setCoord(550, 300);
    }

};

CanvasElement.prototype.setWidthAndHeight = function(w,h) {
    this.width(w);
    this.height(h);
};


CanvasElement.prototype.addCallbacks = function(elem) {
    var self = this;

    // define click callback for all elements:
    elem.addEventListener("click", function (ev) {
        self.dataModel.parentSequence.currSelectedElement(self.dataModel.id());
    });

    // defining double click callback
    if (typeof this.dataModel.doubleClick === "function") {
        elem.addEventListener("dblclick", function (ev) {
            self.dataModel.doubleClick();
        });
    }

    // defining pressmove callbacks
    if (this.dataModel.type =="ImageData"){

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



CanvasElement.prototype.addPorts = function(ports) {
    // add all port containers to this container:
    for (var i= 0, len=ports.length; i<len; i++) {
        this.container.addChild(ports[i].container);
    }
};


CanvasElement.prototype.fromJS = function(canvasElement) {
    this.x(canvasElement.x);
    this.y(canvasElement.y);
    this.setCoord(canvasElement.x, canvasElement.y);
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








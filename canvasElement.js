var CanvasElement = function(dataModel) {
    this.dataModel = dataModel;

    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.width = ko.observable(200);
    this.height = ko.observable(100);
    this.radius1 = ko.observable(40);

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



    // define click callback for all elements:
    elem.addEventListener("click", function (ev) {
        self.dataModel.parentSequence.currSelectedElement = self.id;
    });



    // defining double click callback
    if (typeof dataModel.doubleClick === "function") {
        elem.addEventListener("dblclick", function (ev) {
            dataModel.doubleClick();
        });
    }


    // defining pressmove callbacks
    if (dataModel.type =="ImageData"){
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








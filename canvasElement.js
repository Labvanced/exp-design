var CanvasElement = function(dataModel) {
    this.editor = dataModel;

    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.width = ko.observable(200);
    this.height = ko.observable(100);
    this.radius = ko.observable(40);


    this.container = new createjs.Container();
    var elem = new createjs.Shape();
    var self = this;

    if (dataModel.shape =="circle"){
        elem.graphics.beginStroke("black").beginFill("gray").drawCircle(this.x(), this.y(), this.radius());
    }

    else if (dataModel.shape =="square") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-this.width()/2, -this.height()/2, this.width(), this.height());
    }

    else if (dataModel.type =="Sequence") {
        elem.addEventListener("dblclick", function (ev) {
            uc.experimentEditor.setDataModel(self);
        });
    }

    else if (dataModel.type =="ImageEditorData") {
        elem.addEventListener("dblclick", function (ev) {
            uc.imageEditorData = self;
            page("/page/imageEditor");
        });
    }

    else if (dataModel.type =="QuestionnaireEditorData") {
        elem.addEventListener("dblclick", function (ev) {
            uc.questionnaireEditorData = self;
            page("/page/questionnaireEditor");
        });
    }

    else if (dataModel.type =="TextEditorData") {
        elem.addEventListener("dblclick", function (ev) {
            uc.textEditorData = self;
            page("/page/textEditor");
        });
    }

    else if (dataModel.type =="ImageData") {
        elem.addEventListener("mousedown", function (ev) {
            self.parentSequence.currSelectedElement = self.id;
        });

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

    else if (dataModel.type =="Port") {

        elem.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(0, 0, 3);
        elem.addEventListener("click", function (ev) {
            // start creating a connection:
            var connSpec = {
                id: self.element.id(),
                portId: self.id()
            };
            uc.experimentEditor.createConnection(connSpec);
        });
        this.x.subscribe(function(x){
            self.container.x = x;
        });

        this.y.subscribe(function(y){
            self.container.y = y;
        });
    }

    this.container.addChild(elem);

    if (dataModel.type !="Port"){
        var label = new createjs.Text(dataModel.label, "16px Arial", "#FFF");
        label.textAlign = 'center';
        this.container.addChild(label);
    }

    if (!dataModel.type =="Port" || !dataModel.type=="ImageData"){
        elem.addEventListener("pressmove", function (ev) {
            var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
            self.setCoord( mouseAt.x, mouseAt.y  );
        });
    }

    self.setCoord(550, 300);
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








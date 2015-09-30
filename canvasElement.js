var CanvasElement = function(editor) {
    this.editor = editor;

    this.x = ko.observable(0);
    this.y = ko.observable(0);

    this.container = new createjs.Container();
    var elem = new createjs.Shape();
    var self = this;

    if (editor.type =="StartBlock"){
        elem.graphics.beginStroke("black").beginFill("gray").drawCircle(0, 0, 40);
        var prelabel = "Start";
    }

    else if (editor.type =="EndBlock") {
        elem.graphics.beginStroke("black").beginFill("gray").drawCircle(0, 0, 40);
        var prelabel = "End";
    }

    else if (editor.type =="Sequence") {

        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
        var prelabel = "Block";

        elem.addEventListener("dblclick", function (ev) {
            uc.experimentEditor.setDataModel(self);
        });
    }


    else if (editor.type =="ImageEditorData") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
        var prelabel = "Image-Editor";

        elem.addEventListener("dblclick", function (ev) {
            uc.imageEditorData = self;
            page("/page/imageEditor");
        });
    }

    else if (editor.type =="QuestionnaireEditorData") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
        var prelabel = "Questionnaire";

        elem.addEventListener("dblclick", function (ev) {
            uc.questionnaireEditorData = self;
            page("/page/questionnaireeditor");
        });

    }


    else if (editor.type =="TextEditorData") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
        var prelabel = "Text-Editor";

        elem.addEventListener("dblclick", function (ev) {
            uc.textEditorData = self;
            page("/page/texteditor");
        });
    }

    else if (editor.type =="ImageData") {
        elem.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
        var prelabel = "Image";

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

    else if (editor.type =="execute") {

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

    if (editor.type !="execute"){
        var label = new createjs.Text(prelabel, "16px Arial", "#FFF");
        label.textAlign = 'center';
        this.container.addChild(label);
    }

    if (!editor.type =="execute" || !editor.type=="ImageData"){
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








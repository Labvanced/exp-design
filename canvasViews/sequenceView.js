/**
 * Created by cgoeke on 06.12.2015.
 */



var SequenceView = function(dataModel,canvasId,activeElements) {
    var self = this;

    this.dataModel = dataModel;
    this.stage = null;
    this.elementContainer = null;
    this.activeElements = activeElements;
    this.canvas = document.getElementById(canvasId);
    this.tempConnection = null;
    this.renderCanvas();
};

SequenceView.prototype.renderCanvas = function() {
    var self=this;

    this.stage = new createjs.Stage(this.canvas);
    this.bgImg = new Image();
    this.bgImg.src = '/resources/bgGrid.png';

    // draw background grid into canvas:
    if (this.bgImg.complete) {
        // if the image is already loaded then render it directly:
        this.drawBg();
    }
    else {
        // if the image still has to be loaded, then add callback to render it later:
        this.bgImg.addEventListener('load', function() {
            self.drawBg();
        });
        this.bgImg.addEventListener('error', function() {
            alert('error')
        })
    }

    // add a tick function to update the stage:
    createjs.Ticker.addEventListener("tick", function() {
        self.stage.update();
        if(self.tempConnection) {
            // currently creating a connection, so update the coordinates:
            var pt = self.elementContainer.globalToLocal(self.stage.mouseX, self.stage.mouseY);
            self.tempConnection.connectionView.xEnd(pt.x);
            self.tempConnection.connectionView.yEnd(pt.y);
        }
    });
};

SequenceView.prototype.setCanvasSize = function(width, height) {
    this.canvas.height = height;
    this.canvas.width = width;

    // redraw the background:
    if (this.bgImg.complete) {
        this.drawBg();
    }

    this.stage.update();
};


SequenceView.prototype.createConnection = function(connSpec) {

    if (this.tempConnection) {
        // already creating a connection, therefore finish it:
        this.tempConnection.conn2(connSpec);
        this.dataModel.elements.push(this.tempConnection);
        this.tempConnection = null;
        this.renderElements();
    }
    else {
        // start creating a new connection:
        this.tempConnection = new Connection(this.dataModel.expData);
        this.tempConnection.setPointers();
        this.tempConnection.conn1(connSpec);
        this.renderElements();
    }
};


SequenceView.prototype.drawBg = function() {
    var self = this;

    this.stage.removeChild(this.bgShape);
    this.bgShape = new createjs.Shape();
    this.bgShape.graphics.beginBitmapFill(this.bgImg);
    this.bgShape.graphics.drawRect(0,0,this.canvas.width, this.canvas.height);
    this.stage.addChildAt(this.bgShape, 0);

    this.bgShape.addEventListener("click", function (ev) {
        // deselect because user clicked on background:
        self.setSelectedElement(null);
    });

    this.stage.update();
};


SequenceView.prototype.renderElements = function() {

    var self = this;

    this.elementContainer = new createjs.Container();
    this.elementContainer.name = "canvasContainer";
    this.elementContainer.removeAllChildren();

    var allElem = this.dataModel.elements();

    var skippedElementsIds = [];

    // first draw all elements, so that the port locations are known:
    for (var i= 0, len=allElem.length; i<len; i++) {
        if (allElem[i].type != "Connection") {

            if (!this.activeElements){
                if (allElem[i].type == "StartBlock" || allElem[i].type == "EndBlock"){
                    skippedElementsIds.push(allElem[i].id());
                    continue;
                }
            }

            var canvasElement = this.createRenderElement(allElem[i]);
            canvasElement.container.name = allElem[i].id();
            this.elementContainer.addChild(canvasElement.container);
        }
    }

    // now we can draw all connections:
    for (var i= 0, len=allElem.length; i<len; i++) {
        if (allElem[i].type == "Connection") {
            if (!this.activeElements){
                if ((skippedElementsIds.indexOf(allElem[i].conn1().id) > -1) || (skippedElementsIds.indexOf(allElem[i].conn2().id) > -1) ){
                    continue;
                }
            }
            var canvasElement = new ConnectionView(allElem[i]);
            canvasElement.container.name = allElem[i].id();
            this.elementContainer.addChild(canvasElement.container);
        }
    }

    // draw temporary connection:
    if (this.tempConnection) {
        this.tempConnection.connectionView = new ConnectionView(this.tempConnection);
        this.elementContainer.addChild(this.tempConnection.connectionView.container);
    }

    this.stage.removeChild(this.stage.getChildByName("canvasContainer"));
    this.stage.addChild(this.elementContainer);
    this.stage.update();

};

SequenceView.prototype.createRenderElement = function(elem) {
    var self = this;

    var canvasElement = new CanvasElement(elem, this.activeElements,this);

    // define click callback:
    canvasElement.container.addEventListener("click", function (ev) {
        self.setSelectedElement(elem);
    });

    return canvasElement;
}

SequenceView.prototype.setSelectedElement = function(elem) {

    if (elem) {
        // check if element is really a child:
        if (this.dataModel.elements.byId[elem.id()]) {

            // change selection state of previously selected canvas element:
            var prevSelectedElem = this.dataModel.currSelectedElement();
            if (prevSelectedElem){
                this.elementContainer.getChildByName(prevSelectedElem.id()).canvasElement.isSelected(false);
            }

            // change currently selected element:
            this.dataModel.currSelectedElement(elem);

            // change selection state of newly selected canvas element:
            this.elementContainer.getChildByName(elem.id()).canvasElement.isSelected(true);
        }  
    }
    else {// deselect:
        
        // change selection state of previously selected canvas element:
            var prevSelectedElem = this.dataModel.currSelectedElement();
            if (prevSelectedElem){
                this.elementContainer.getChildByName(prevSelectedElem.id()).canvasElement.isSelected(false);
            }

            // change currently selected element:
            this.dataModel.currSelectedElement(null);
    }
        
};
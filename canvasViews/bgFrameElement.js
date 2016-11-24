var BgFrameElement = function(frameData,editor) {

    var self=this;
    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "left": 0,
        "top": 0
    });
    this.canvas = document.createElement('canvas');
    $(this.div).append(this.canvas);
    this.canvas.id = "canvasBG";
    this.stage = new createjs.Stage(this.canvas);
    this.bgImg = new Image();
    this.bgImg.src = '/resources/bgGrid.png';

    this.dataModel= frameData;
    this.editor = editor;
    this.width= this.dataModel.frameWidth;
    this.height= this.dataModel.frameHeight;
    this.x= ko.observable(0);
    this.y= ko.observable(0);

    this.scale = ko.computed(function() {
        return this.editor.scale();
    }, this);

    this.scale.subscribe(function() {
        self.update();
    });

    this.update();

    if (this.bgImg.complete) {
        this.drawBg();
    }
    else {
        this.bgImg.addEventListener('load', function() {
            self.drawBg();
        });
        this.bgImg.addEventListener('error', function() {
            alert('error')
        })
    }

    createjs.Ticker.addEventListener("tick", function() {
        self.stage.update();
    });

    this.addCallback();

};

BgFrameElement.prototype.update = function() {

    var self = this;

    this.canvas.height = this.height()* this.scale();
    this.canvas.width = this.width()* this.scale();

    $(this.div).css({
        "width":this.width() * self.scale(),
        "height": this.height() * self.scale()
    });

    if (this.bgImg.complete) {
        this.drawBg();
    }

};

BgFrameElement.prototype.drawBg = function() {
    var child= this.stage.getChildByName("background");
    if (child){
        this.stage.removeChild(child);
    }

    var bgShape = new createjs.Shape();
    bgShape.name = "background";
    bgShape.graphics.beginBitmapFill(this.bgImg).drawRect(0,0,this.width(), this.height());

    var container = new createjs.Container();
    container.name = "background";
    container.addChild(bgShape);

    this.stage.addChildAt(container, 0);
    this.stage.update();
};


BgFrameElement.prototype.addCallback = function() {

    var self = this;
    $(this.div).click(function() {
        self.editor.setSelectedElement(null);
    });

};
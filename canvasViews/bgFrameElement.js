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
    this.bgImgSubgrid10 = new Image();
    this.bgImgSubgrid10.src = '/resources/bgGridSubgrid10.png';
    this.bgImgSubgrid2 = new Image();
    this.bgImgSubgrid2.src = '/resources/bgGridSubgrid2.png';
    this.bgImgSubgrid5 = new Image();
    this.bgImgSubgrid5.src = '/resources/bgGridSubgrid5.png';

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


    this.drawBg();

    this.bgImgSubgrid10.addEventListener('load', function() {
        self.drawBg();
    });
    this.bgImgSubgrid5.addEventListener('load', function() {
        self.drawBg();
    });
    this.bgImgSubgrid2.addEventListener('load', function() {
        self.drawBg();
    });

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

    this.drawBg();

};

BgFrameElement.prototype.drawBg = function() {

    if (this.bgImgSubgrid10.complete && this.bgImgSubgrid5.complete && this.bgImgSubgrid2.complete) {

        var child = this.stage.getChildByName("background");
        if (child) {
            this.stage.removeChild(child);
        }

        //console.log(this.scale());
        var grid_scale = null;
        var gridImgType = null;
        if (this.scale() > 37) { // very zoomed in
            grid_scale = 0.01;
            gridImgType = this.bgImgSubgrid2;
        }
        else if (this.scale() > 17.2) {
            grid_scale = 0.1;
            gridImgType = this.bgImgSubgrid10;
        }
        else if (this.scale() > 8) {
            grid_scale = 0.1;
            gridImgType = this.bgImgSubgrid5;
        }
        else if (this.scale() > 3.7) {
            grid_scale = 0.1;
            gridImgType = this.bgImgSubgrid2;
        }
        else if (this.scale() > 1.72) {
            grid_scale = 1;
            gridImgType = this.bgImgSubgrid10;
        }
        else if (this.scale() > 0.8) {
            grid_scale = 1;
            gridImgType = this.bgImgSubgrid5;
        }
        else if (this.scale() > 0.37) {
            grid_scale = 1;
            gridImgType = this.bgImgSubgrid2;
        }
        else if (this.scale() > 0.172) {
            grid_scale = 10;
            gridImgType = this.bgImgSubgrid10;
        }
        else if (this.scale() > 0.08) {
            grid_scale = 10;
            gridImgType = this.bgImgSubgrid5;
        }
        else { // this.scale() <= 0.08 // very zoomed out
            grid_scale = 10;
            gridImgType = this.bgImgSubgrid2;
        }

        var bgShape = new createjs.Shape();
        bgShape.name = "background";
        bgShape.graphics.beginBitmapFill(gridImgType).drawRect(0, 0, this.width() / grid_scale, this.height() / grid_scale);

        var container = new createjs.Container();
        container.scaleX = this.scale() * grid_scale;
        container.scaleY = this.scale() * grid_scale;
        container.name = "background";
        container.addChild(bgShape);

        this.stage.addChildAt(container, 0);
        this.stage.update();
    }
};


BgFrameElement.prototype.addCallback = function() {

    var self = this;
    $(this.div).click(function() {
        self.editor.setSelectedElement(null);
    });

};
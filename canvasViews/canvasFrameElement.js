// � by Caspar Goeke and Holger Finger

var CanvasFrameElement = function(dataModel,editor) {
    this.dataModel = dataModel;
    this.editor = editor;

    // default values
    this.radius1 = ko.observable(20);
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.gridSpaceInPixels = 10;
    this.isSelected = ko.observable(false);
    this.div= null;

    this.scale = ko.computed(function() {
        return this.editor.scale();
    }, this);

    // setup canvas, stage and subscriber
    this.setupCanvasAndStage();
    this.setupSubscriber();

    // replace with image
    this.renderShapeOrImage(this.dataModel.imgSource());
};


CanvasFrameElement.prototype.setupCanvasAndStage = function() {
    var self = this;
    // setup canvas, stage and container
    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "backgroundColor": "transparent"
    });

    this.canvas = document.createElement('canvas');
    $(this.div).append(this.canvas);

    if (this.editor.type == "editorView") {
        this.canvas.id = "editorView"+this.dataModel.id();
    }
    else if (this.editor.type == "sequenceView") {
        this.canvas.id = "sequenceView"+this.dataModel.id();
    }
    else if (this.editor.type == "playerView") {
        this.canvas.id = "playerView"+this.dataModel.id();
        $(this.div).hide();
    }

    this.stage = new createjs.Stage(this.canvas);
    this.stage.name = this.dataModel.id();
    this.placeHolderBox = new createjs.Container();
    this.placeHolderBox.name = "placeholderBox";
    this.stage.addChild(this.placeHolderBox);
    this.stage.x = 0;
    this.stage.y = 0;

    createjs.Ticker.addEventListener("tick", function() {
        self.stage.update();
    });
};


CanvasFrameElement.prototype.recreatePlaceHolderBoxAndLabel = function() {
    // create box
    var shape = new createjs.Shape();
    if (this.isSelected()) {
        var fillColor = "#dddddd";
        var borderColor = "#3baae3";
        var strokeWidth = 6;
    }
    else {
        var fillColor = "#dddddd";
        var borderColor = "black";
        var strokeWidth = 2;
    }
    if (this.dataModel.shape =="circle"){
        shape.graphics.setStrokeStyle(strokeWidth).beginStroke(borderColor).beginFill(fillColor).drawCircle(0, 0, this.radius1());
    }
    else if (this.dataModel.shape =="square") {
        shape.graphics.setStrokeStyle(strokeWidth).beginStroke(borderColor).beginFill(fillColor).drawRect(0, 0, this.width(), this.height());
    }
    shape.name = "box";

    // create label
    this.label = new createjs.Text(this.dataModel.name(), "12px Arial", "black");
    this.label .textAlign = 'center';
    this.label .y = (this.height()/2)-7;
    this.label .x = this.width()/2;
    this.label .name = "label";

    // remove old box and label is exists
    var oldShape = this.placeHolderBox.getChildByName("box");
    if (oldShape) {
        this.placeHolderBox.removeChild(oldShape);
    }
    var oldName = this.placeHolderBox.getChildByName("label");
    if (oldName) {
        this.placeHolderBox.removeChild(oldName);
    }

    // add again to placeHolderBox
    this.placeHolderBox.addChildAt(shape, 0);
    this.placeHolderBox.addChild(this.label);
};


CanvasFrameElement.prototype.setupSubscriber = function() {
    var self = this;
    // set height and width and subscirve
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.x = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorX();
        }, this);
        this.y = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorY();
        }, this);
        this.width = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorWidth();
        }, this).extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
        this.height = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorHeight();
        }, this).extend({ rateLimit: { timeout: 100, method: "notifyWhenChangesStop" } });
        this.keepAspectRatio = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.keepAspectRatio();
        }, this);

    }
    else {
        this.x = ko.computed(function() {
            return this.dataModel.editorX();
        }, this);
        this.y = ko.computed(function() {
            return this.dataModel.editorY();
        }, this);
        this.width = ko.computed(function() {
            return this.dataModel.editorWidth();
        }, this).extend({ rateLimit: { timeout: 200, method: "notifyWhenChangesStop" } });
        this.height = ko.computed(function() {
            return this.dataModel.editorHeight();
        }, this).extend({ rateLimit: { timeout: 200, method: "notifyWhenChangesStop" } });
        this.keepAspectRatio = ko.computed(function() {
            return this.dataModel.keepAspectRatio();
        }, this);
    }

    this.x.subscribe(function (x) {
        self.update(false,true);
    });

    this.y.subscribe(function (y) {
        self.update(false,true);
    });

    this.width.subscribe(function (w) {
        self.update(true,false);
        self.recreatePlaceHolderBoxAndLabel();
    });

    this.height.subscribe(function(h) {
        self.update(true,false);
        self.recreatePlaceHolderBoxAndLabel();
    });

    this.keepAspectRatio.subscribe(function(){
        self.update(true,false);
    });

    this.isSelected.subscribe(function(){
        self.recreatePlaceHolderBoxAndLabel();
    });


    this.dataModel.name.subscribe(function(newValue) {
        self.label.text = newValue;
    });

    this.dataModel.imgSource.subscribe(function(imgSource) {
        self.renderShapeOrImage(imgSource);
    });
};


CanvasFrameElement.prototype.renderShapeOrImage = function(imgSource) {
    var self = this;

    if (imgSource) {
        var img = new Image;
        img.src = imgSource;
        img.onload = function () {

            // remove placeholder
            var placeHolder = self.stage.getChildByName("placeholderBox");
            if (placeHolder) {
                self.stage.removeChild(placeHolder);
            }
            // remove previously set image and resize elements:
            var oldImage = self.stage.getChildByName("image");
            if (oldImage) {
                self.stage.removeChild(oldImage);
            }

            // initialize original size:
            self.fullWidth(this.width);
            self.fullHeight(this.height);

            var bitmap = new createjs.Bitmap(imgSource);
            bitmap.x = 0;
            bitmap.y = 0;
            bitmap.name = "image";
            self.stage.addChild(bitmap);
            self.stage.update();
            self.update(true,false);
            if(self.editor.type== "playerView"){
                $(self.div).show();
            }

        }
    }
    else {
        // remove previously set image and resize elements:
        var oldImage = self.stage.getChildByName("image");
        if (oldImage) {
            self.stage.removeChild(oldImage);
        }
        this.recreatePlaceHolderBoxAndLabel();
        this.stage.addChild(this.placeHolderBox);
    }
};





CanvasFrameElement.prototype.update = function(size,position){

    var self = this;

    if (size){
        if (this.dataModel.type == "ImageData"){
            var image = this.stage.getChildByName("image");
            if (image) {

                // this.width is the bounding box in virtual frame coordinates
                // this.fullWidth is the raw image width
                if (this.dataModel.keepAspectRatio()) {
                    var scale = Math.min(this.width() / this.fullWidth(), this.height() / this.fullHeight());
                    image.scaleX = scale;
                    image.scaleY = scale;
                    image.x = (this.width() - (this.fullWidth() * scale))/2;
                    image.y = (this.height() - (this.fullHeight() * scale))/2;
                }
                else {
                    image.scaleX = this.width() / this.fullWidth();
                    image.scaleY = this.height() / this.fullHeight();
                    image.x = 0;
                    image.y = 0;
                }
            }
        }

        this.stage.scaleX = this.scale();
        this.stage.scaleY = this.scale();

        this.canvas.height = this.height()*this.scale();
        this.canvas.width = this.width()* this.scale();

        $(this.div).css({
            "width":self.width() * self.scale(),
            "height": self.height() * self.scale()
        });
    }

    if (position){
        $(this.div).css({
            "left": self.x() * self.scale(),
            "top": self.y() * self.scale()
        });

    }

};

CanvasFrameElement.prototype.setWidthAndHeight = function(w,h) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.dataModel.modifier().selectedTrialView.editorWidth(w);
        this.dataModel.modifier().selectedTrialView.editorHeight(h);
    }
    else {
        this.dataModel.editorWidth(w);
        this.dataModel.editorHeight(h);
    }

};

CanvasFrameElement.prototype.setCoord = function(x,y) {

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








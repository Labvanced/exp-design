
var FrameElementView = function(dataModel, editor) {

    this.dataModel = dataModel;
    this.editor = editor;

    // default values
    this.id = dataModel.id();
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.isSelected = ko.observable(false);
    this.div = document.createElement('div');
    this.content = null;
    this.scale = ko.computed(function() {
        return this.editor.scale();
    }, this);

    // setup canvas, stage and subscriber
    this.setupDiv();
    this.setupSubscriber();

    // create box, label and resizeIcon
   // this.recreatePlaceHolderBoxAndLabel();

    // render Elements
    this.renderElements(this.dataModel.content());

    this.replaceWithContent(this.dataModel.content());
};


FrameElementView.prototype.setupDiv = function() {
    var self = this;

    $(this.div).css({
        "position": "absolute",
        //"opacity": this.dataModel.visibility()
        //"backgroundColor": "white"
    });
    this.content = document.createElement('div');
    $(this.content).css({
        "position": "absolute",
        "opacity": this.dataModel.visibility(),
        "overflow": "hidden"
    });

    this.text = document.createElement('p');
    $(this.text).css({
        "position": "absolute",
        //"backgroundColor": "white",
        "textAlign": "center",
        "border": " 1px solid black"
    });
    $(this.text).text(this.dataModel.name());
    this.dataModel.name.subscribe(function(newName) {
        $(self.text).text(newName);
    });

    $(this.content).append($(this.text));
    $(this.div).append($(this.content));

};


FrameElementView.prototype.recreatePlaceHolderBoxAndLabel = function() {
    /*this.contentScaling = $("<div></div>");
    this.contentInside = document.createElement('p');
    $(this.contentInside).text(this.dataModel.name());
    $(this.contentScaling).append(this.contentInside);
    $(this.content).children().remove();
    $(this.content).append(this.contentScaling);*/

    $(this.div).children().remove();
    this.setupDiv();
};


FrameElementView.prototype.setupSubscriber = function() {
    var self = this;
    // set height and width and subscirbe
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.x = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorX();
        }, this);
        this.y = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorY();
        }, this);
        this.visibility = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.visibility();
        }, this);
        this.width = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorWidth();
        }, this);
        this.height = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorHeight();
        }, this);
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
        this.visibility = ko.computed(function() {
            return this.dataModel.visibility();
        }, this);
        this.width = ko.computed(function() {
            return this.dataModel.editorWidth();
        }, this);
        this.height = ko.computed(function() {
            return this.dataModel.editorHeight();
        }, this);
        this.keepAspectRatio = ko.computed(function() {
            return this.dataModel.content().keepAspectRatio();
        }, this);
    }

    if (this.dataModel.content().hasOwnProperty('stretchImageToFitBoundingBox')) {
        this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox.subscribe(function(newVal) {
            self.update(true, false);
        });
    }

    this.scale.subscribe(function() {
        self.update(true,true);
    });

    this.x.subscribe(function(x) {
        self.update(false,true);
    });

    this.y.subscribe(function(y) {
        self.update(false,true);
    });

    this.visibility.subscribe(function(a) {
        $(self.div).css({
            "opacity": self.visibility()
        });
        $(self.content).css({
            "opacity": self.visibility()
        });
    });

    this.width.subscribe(function(w) {
        self.update(true,false);
    });

    this.height.subscribe(function(h) {
        self.update(true,false);
    });

    this.dataModel.contentScaling.subscribe(function(newValue){
        self.update(true,false);
    });

    this.dataModel.anchorPointX.subscribe(function(newVal) {
        self.update(false,true);
    });

    this.dataModel.anchorPointY.subscribe(function(newVal) {
        self.update(false,true);
    });

    this.isSelected.subscribe(function(newVal){
        if (newVal) {
            $(self.div).css({
                "outline": "1px dashed black"
            });
        }
        else {
            $(self.div).css({
                "outline": "0px"
            });
        }
    });

    this.dataModel.content.subscribe(function(newValue){
        self.renderElements(newValue)
    });

    if(this.dataModel.content().vidSource){
        this.dataModel.content().vidSource.subscribe(function(vidSource) {
            self.replaceWithContent(self.dataModel.content());
        });
    }

    if(this.dataModel.content().imgSource) {
        this.dataModel.content().imgSource.subscribe(function(imgSource) {
            self.replaceWithContent(self.dataModel.content);
        });
    }
};


FrameElementView.prototype.update = function(size, position){

    var self = this;

    if (size){

        $(this.div).css({
            "width":self.width() * self.scale(),
            "height": self.height() * self.scale()
        });

        $(this.content).css({
            "width": self.width() * self.scale(),
            "height": self.height() * self.scale(),
            "position": "absolute"
        });

        var scale = self.dataModel.contentScaling() * self.scale();
        $(this.contentScaling).css({
            "position": "absolute",
            '-webkit-transform': 'scale(' + scale + ')',
            '-moz-transform': 'scale(' + scale + ')',
            '-ms-transform': 'scale(' + scale + ')',
            '-o-transform': 'scale(' + scale + ')',
            'transform': 'scale(' + scale + ')'
        });

        $(this.contentInside).css({
            "width": self.width(),
            "height": self.height(),
            "position": "absolute"
        });

        $(this.text).css({
            "width":self.width() * self.scale(),
            "height":  self.height() * self.scale()
        });

        if (this.dataModel.content().type == "ImageElement"){
            var image = this.contentInside;
            if (image) {
                // this.width is the bounding box in virtual frame coordinates
                // this.fullWidth is the raw image width
                if (!this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox()) {
                    var scale = Math.min(self.width() / this.fullWidth(), self.height() / this.fullHeight());
                    var w = this.fullWidth() * scale * self.scale();
                    var h = this.fullHeight() * scale * self.scale();

                    $(image).css({
                        "width": w,
                        "height": h,
                        "position": 'absolute',
                        "left": (self.width() * self.scale() - w)/2,
                        "top": (self.height() * self.scale() - h)/2
                    });
                }
                else {
                    $(image).css({
                        "width": self.width() * self.scale(),
                        "height": self.height() * self.scale(),
                        "left": 0,
                        "top": 0
                    });
                }
            }
        }

    }

    if (position || size){

        var left = 0;
        if (this.dataModel.anchorPointX() == 'low'){
            left = self.x();
        }
        else if(this.dataModel.anchorPointX() == 'high'){
            left = self.x() - self.width();
        }
        else { // center
            left = self.x() - self.width()/2;
        }

        var top = 0;
        if (this.dataModel.anchorPointY() == 'low'){
            top = self.y();
        }
        else if(this.dataModel.anchorPointY() == 'high'){
            top = self.y() - self.height();
        }
        else { // center
            top = self.y() - self.height()/2;
        }

        $(this.div).css({
            "left": left * self.scale(),
            "top": top * self.scale()
        });

    }

};



FrameElementView.prototype.setWidthAndHeight = function(w, h) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.dataModel.modifier().selectedTrialView.editorWidth(w);
        this.dataModel.modifier().selectedTrialView.editorHeight(h);
    }
    else {
        this.dataModel.editorWidth(w);
        this.dataModel.editorHeight(h);
    }

};

FrameElementView.prototype.setCoord = function(left, top) {

    var x = 0;
    if (this.dataModel.anchorPointX() == 'low'){
        x = left;
    }
    else if(this.dataModel.anchorPointX() == 'high'){
        x = left + this.width();
    }
    else { // center
        x = left + this.width()/2;
    }

    var y = 0;
    if (this.dataModel.anchorPointY() == 'low'){
        y = top;
    }
    else if(this.dataModel.anchorPointY() == 'high'){
        y = top + this.height();
    }
    else { // center
        y = top + this.height()/2;
    }

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

FrameElementView.prototype.renderElements = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type != "ImageElement" && data.type !="VideoElement"){
        $(this.content).children().remove();
        this.contentScaling = $("<div></div>");

        if (this.editor.type == "editorView") {
            this.contentInside = $("<div data-bind='component: {name : \"contentElementPreview\", params : $data}'></div>");
        }
        else {
            this.contentInside = $("<div data-bind='component: {name : \"contentElementPlayerview\", params : $data}'></div>");
        }

        $(this.contentScaling).append(this.contentInside);
        $(this.content).append(this.contentScaling);
        ko.applyBindings(data, $(this.content)[0]);
        this.update(true, false);
        $(this.div).append(this.content);
    }
};


FrameElementView.prototype.replaceWithContent = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "VideoElement") {

        if (data.vidSource()){
            $(this.content).remove();

            var dispWidth = self.width() * self.scale();
            var dispHeight = self.height() * self.scale();

            this.content = document.createElement('video');
            $(this.content).css({
                "width": dispWidth,
                "height": dispHeight,
                "position": "absolute"
            });
            $(this.div).append(this.content);

            this.content.src = data.vidSource();
            this.content.oncanplaythrough = function () {
                // initialize original size:
                self.fullWidth($(this).width());
                self.fullHeight($(this).height());
                self.update(true,true);
            };
            $(this.content).append(this.content);

            if (this.editor.type == "editorView") {
                this.content.controls = true;
            }
            else if (this.editor.type == "sequenceView") {
                this.content.controls = false;
            }
            else if(this.editor.type == "playerView"){
                this.content.controls = false;
                this.content.preload = "auto";
            }
        }
        else {
            this.recreatePlaceHolderBoxAndLabel();
        }
    }
    else if (data.type == "ImageElement") {
        if (data.imgSource()){

            this.contentInside = new Image;

            $(this.contentInside).css({
                "width":self.width() * self.scale(),
                "height": self.height() * self.scale(),
                "position": "absolute",
                "backgroundColor": "transparent"
            });

            this.contentInside.src = data.imgSource();
            this.contentInside.onload = function () {
                // initialize original size:
                self.fullWidth(this.naturalWidth);
                self.fullHeight(this.naturalHeight);
                self.update(true,true);
            };

            $(this.content).children().remove();
            $(this.content).append(this.contentInside);

        }
        else {
            this.recreatePlaceHolderBoxAndLabel();
        }
    }
};
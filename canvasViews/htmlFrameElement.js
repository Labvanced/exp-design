/**
 * Created by cgoeke on 1/29/16.
 */



var HtmlFrameElement = function(dataModel,editor) {



    this.dataModel = dataModel;
    this.editor = editor;

    // default values
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.isSelected = ko.observable(false);
    this.div = null;
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


HtmlFrameElement.prototype.setupDiv = function() {
    var self = this;
    // setup canvas, stage and container
    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        //"backgroundColor": "white"
    });
    this.content = document.createElement('div');
    $(this.content).css({
        "position": "absolute"
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
    })

    $(this.content).append($(this.text));
    $(this.div).append($(this.content));

};


HtmlFrameElement.prototype.recreatePlaceHolderBoxAndLabel = function() {
    // create box
    $(this.content).children().remove();

    var self = this;
    var text = document.createElement('p');
    $(text).text(this.dataModel.name());
    if (this.scale){
        $(text).css({
            "width":this.width() * self.scale,
            "height":  this.height() * self.scale,
            "backgroundColor": "white",
            "textAlign": "center",
            "border": " 1px solid black"
        })
    }

    $(this.content).append(text);

};


HtmlFrameElement.prototype.setupSubscriber = function() {
    var self = this;
    // set height and width and subscirbe
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.x = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorX();
        }, this);
        this.y = ko.computed(function() {
            return this.dataModel.modifier().selectedTrialView.editorY();
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

    this.x.subscribe(function(x) {
        self.update(false,true);
    });

    this.y.subscribe(function(y) {
        self.update(false,true);
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

HtmlFrameElement.prototype.update = function(size,position){

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

        if (this.dataModel.content().type == "ImageHtmlData"){
            var image = this.content;
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

    if (position){

        $(this.div).css({
            "left": self.x() * self.scale(),
            "top": self.y() *self.scale()
        });

    }

};



HtmlFrameElement.prototype.setWidthAndHeight = function(w,h) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.dataModel.modifier().selectedTrialView.editorWidth(w);
        this.dataModel.modifier().selectedTrialView.editorHeight(h);
    }
    else {
        this.dataModel.editorWidth(w);
        this.dataModel.editorHeight(h);
    }

};

HtmlFrameElement.prototype.setCoord = function(x,y) {

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

HtmlFrameElement.prototype.renderElements = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "CheckBoxElement" ||data.type =="MChoiceElement"||data.type =="ParagraphElement"||data.type =="RangeElement"||data.type =="ScaleElement"||data.type =="TextElement"||data.type =="ButtonElement"){

        $(this.content).remove();
        this.content = $("<div></div>");
        this.contentScaling = $("<div></div>");
        if (data instanceof CheckBoxElement) {
            this.contentInside = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'></div>");
        }
        else if (data instanceof MChoiceElement) {
            this.contentInside = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'></div>");
        }
        else if (data instanceof ParagraphElement) {
            this.contentInside = $("<div data-bind='component: {name : \"paragraph-playerview\", params : $data}'></div>");
        }
        else if (data instanceof RangeElement) {
            this.contentInside = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'></div>");
        }
        else if (data instanceof ScaleElement) {
            this.contentInside = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'></div>");
        }
        else if (data instanceof TextElement) {
            this.contentInside = $("<div data-bind='component: {name : \"text-playerview\", params : $data}'></div>");
        }
        else if (data instanceof ButtonElement) {
            this.contentInside = $("<div data-bind='component: {name : \"button-playerview\", params : $data}'></div>");
        }
        $(this.contentScaling).append(this.contentInside);
        $(this.content).append(this.contentScaling);
        ko.applyBindings(data, $(this.content)[0]);
        this.update(true, false);
        $(this.div).append(this.content);
    }
    else if(data.type == "textArea"){
        $(this.content).remove();
        this.content = document.createElement('text');
    }
};


HtmlFrameElement.prototype.replaceWithContent = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "VideoData") {

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

    }
    else if (data.type == "ImageHtmlData") {
        if (data.imgSource()){
            $(this.content).remove();

            this.content = new Image;

            $(this.content).css({
                "width":self.width() * self.scale(),
                "height": self.height() * self.scale(),
                "position": "absolute",
                "backgroundColor": "transparent"
            });

            this.content.src = data.imgSource();
            this.content.onload = function () {
                // initialize original size:
                self.fullWidth(this.naturalWidth);
                self.fullHeight(this.naturalHeight);
                self.update(true,true);
            };

            $(this.div).append(this.content);



        }
    }
};
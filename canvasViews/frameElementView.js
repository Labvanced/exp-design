
var FrameElementView = function(dataModel, editor) {

    this.dataModel = dataModel;
    this.editor = editor;

    // default values
    this.id = dataModel.id();
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.isSelected = ko.observable(false);

    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "opacity": this.dataModel.visibility()
    });

    this.divContent = document.createElement('div');
    $(this.divContent).css({
        "position": "absolute",
        "overflow": "hidden"
    });
    $(this.div).append(this.divContent);

    // setup canvas, stage and subscriber
    this.setupSubscriber();
    this.renderContent(this.dataModel.content());
};


FrameElementView.prototype.setupSubscriber = function() {
    var self = this;

    this.scale = ko.computed(function() {
        return this.editor.scale();
    }, this);

    var selectedTrialView = this.dataModel.modifier().selectedTrialView;

    // set height and width and subscirbe
    if (this.dataModel.hasOwnProperty('modifier')) {
        this.x = ko.computed(function() {
            return selectedTrialView.editorX();
        }, this);
        this.y = ko.computed(function() {
            return selectedTrialView.editorY();
        }, this);
        this.visibility = ko.computed(function() {
            return selectedTrialView.visibility();
        }, this);
        this.width = ko.computed(function() {
            return selectedTrialView.editorWidth();
        }, this);
        this.height = ko.computed(function() {
            return selectedTrialView.editorHeight();
        }, this);
        this.keepAspectRatio = ko.computed(function() {
            return selectedTrialView.keepAspectRatio();
        }, this);
    }
    else {
        console.error("where is the modifier??????????");
        // TODO: remove this else block?
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

    this.dataModel.contentRotation.subscribe(function(newValue){
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
        self.renderContent(newValue)
    });

    if(this.dataModel.content().imgSource) {
        this.dataModel.content().imgSource.subscribe(function(imgSource) {
            self.renderContent(self.dataModel.content);
        });
    }
};

FrameElementView.prototype.update = function(size, position){

    var self = this;

    if (size){

        $(this.div).css({
            "width": self.width() * self.scale(),
            "height": self.height() * self.scale()
        });

        var contentRotation = self.dataModel.contentRotation();
        if (contentRotation) {
            $(this.div).css({
                '-webkit-transform': 'rotate(' + contentRotation + 'deg)',
                '-moz-transform': 'rotate(' + contentRotation + 'deg)',
                '-ms-transform': 'rotate(' + contentRotation + 'deg)',
                '-o-transform': 'rotate(' + contentRotation + 'deg)',
                'transform': 'rotate(' + contentRotation + 'deg)'
            });
        }
        else {
            $(this.div).css({
                '-webkit-transform': '',
                '-moz-transform': '',
                '-ms-transform': '',
                '-o-transform': '',
                'transform': ''
            });
        }

        $(this.divContent).css({
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

        $(this.divContentInside).css({
            "width": self.width(),
            "height": self.height(),
            "position": "absolute"
        });

        $(this.text).css({
            "width": self.width() * self.scale(),
            "height": self.height() * self.scale()
        });

        if (this.dataModel.content().type == "ImageElement"){
            var image = this.divContentInside;
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

FrameElementView.prototype.renderContent = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "ImageElement") {
        if (data.imgSource()){

            this.divContentInside = new Image;

            $(this.divContentInside).css({
                "width":self.width() * self.scale(),
                "height": self.height() * self.scale(),
                "position": "absolute",
                "backgroundColor": "transparent"
            });

            this.divContentInside.src = data.imgSource();
            this.divContentInside.onload = function () {
                // initialize original size:
                self.fullWidth(this.naturalWidth);
                self.fullHeight(this.naturalHeight);
                self.update(true,true);
            };

            $(this.divContent).children().remove();
            $(this.divContent).append(this.divContentInside);

        }
        else {
            this.renderPlaceHolderBoxAndLabel();
        }
    }
    else {
        $(this.divContent).children().remove();

        this.contentScaling = $("<div></div>");

        if (this.editor.type == "editorView") {
            this.divContentInside = $("<div data-bind='component: {name : \"contentElementPreview\", params : $data}'></div>");
        }
        else {
            this.divContentInside = $("<div data-bind='component: {name : \"contentElementPlayerview\", params : $data}'></div>");
        }

        $(this.contentScaling).append(this.divContentInside);
        $(this.divContent).append(this.contentScaling);
        ko.applyBindings(data, $(this.divContent)[0]);
        this.update(true, false);
    }
};

FrameElementView.prototype.renderPlaceHolderBoxAndLabel = function() {
    var self = this;
    $(this.divContent).children().remove();

    this.text = document.createElement('p');
    $(this.text).css({
        "position": "absolute",
        "textAlign": "center",
        "border": " 1px solid black"
    });
    $(this.text).text(this.dataModel.name());
    this.dataModel.name.subscribe(function(newName) {
        $(self.text).text(newName);
    });

    $(this.divContent).append($(this.text));
    this.update(true,true);
};

/**
 * dispose ko component and remove dom div...
 */
FrameElementView.prototype.dispose = function() {
    var componentDiv = $(this.divContentInside)[0];
    if (componentDiv) {
        ko.cleanNode(componentDiv);
    }
    $(this.div).remove();
};

var FrameElementView = function(dataModel, parentView) {

    this.dataModel = dataModel;
    this.parentView = parentView;

    // default values
    this.id = dataModel.id();
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.isSelected = ko.observable(false);

    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "opacity": this.dataModel.modifier().selectedTrialView.visibility()
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
        return this.parentView.scale();
    }, this);

    var selectedTrialView = this.dataModel.modifier().selectedTrialView;

    this.editorX = ko.computed(function() {
        return selectedTrialView.editorX();
    }, this);
    this.editorY = ko.computed(function() {
        return selectedTrialView.editorY();
    }, this);
    this.visibility = ko.computed(function() {
        return selectedTrialView.visibility();
    }, this);
    this.editorWidth = ko.computed(function() {
        return selectedTrialView.editorWidth();
    }, this);
    this.editorHeight = ko.computed(function() {
        return selectedTrialView.editorHeight();
    }, this);
    this.keepAspectRatio = ko.computed(function() {
        return selectedTrialView.keepAspectRatio();
    }, this);

    if (this.dataModel.content().hasOwnProperty('stretchImageToFitBoundingBox')) {
        this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox.subscribe(function(newVal) {
            self.update(true, false);
        });
    }

    this.scale.subscribe(function() {
        self.update(true,true);
    });

    this.editorX.subscribe(function(x) {
        self.update(false,true);
    });

    this.editorY.subscribe(function(y) {
        self.update(false,true);
    });

    this.visibility.subscribe(function(a) {
        $(self.div).css({
            "opacity": self.visibility()
        });
    });

    this.editorWidth.subscribe(function(w) {
        self.update(true,false);
    });

    this.editorHeight.subscribe(function(h) {
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
                "outline": "3px #74c9d6 solid"
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
            "width": self.editorWidth() * self.scale(),
            "height": self.editorHeight() * self.scale()
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
            "width": self.editorWidth() * self.scale(),
            "height": self.editorHeight() * self.scale(),
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
            "width": self.editorWidth(),
            "height": self.editorHeight(),
            "position": "absolute"
        });

        $(this.text).css({
            "width": self.editorWidth() * self.scale(),
            "height": self.editorHeight() * self.scale()
        });

        if (this.dataModel.content().type == "ImageElement"){
            var image = this.divContentInside;
            if (image) {
                // this.editorWidth is the bounding box in virtual frame coordinates
                // this.fullWidth is the raw image width
                if (!this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox()) {
                    var scale = Math.min(self.editorWidth() / this.fullWidth(), self.editorHeight() / this.fullHeight());
                    var w = this.fullWidth() * scale * self.scale();
                    var h = this.fullHeight() * scale * self.scale();

                    $(image).css({
                        "width": w,
                        "height": h,
                        "position": 'absolute',
                        "left": (self.editorWidth() * self.scale() - w)/2,
                        "top": (self.editorHeight() * self.scale() - h)/2
                    });
                }
                else {
                    $(image).css({
                        "width": self.editorWidth() * self.scale(),
                        "height": self.editorHeight() * self.scale(),
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
            left = self.editorX();
        }
        else if(this.dataModel.anchorPointX() == 'high'){
            left = self.editorX() - self.editorWidth();
        }
        else { // center
            left = self.editorX() - self.editorWidth()/2;
        }

        var top = 0;
        if (this.dataModel.anchorPointY() == 'low'){
            top = self.editorY();
        }
        else if(this.dataModel.anchorPointY() == 'high'){
            top = self.editorY() - self.editorHeight();
        }
        else { // center
            top = self.editorY() - self.editorHeight()/2;
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
        x = left + this.editorWidth();
    }
    else { // center
        x = left + this.editorWidth()/2;
    }

    var y = 0;
    if (this.dataModel.anchorPointY() == 'low'){
        y = top;
    }
    else if(this.dataModel.anchorPointY() == 'high'){
        y = top + this.editorHeight();
    }
    else { // center
        y = top + this.editorHeight()/2;
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
                "width":self.editorWidth() * self.scale(),
                "height": self.editorHeight() * self.scale(),
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

        if (this.parentView.type == "editorView") {
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
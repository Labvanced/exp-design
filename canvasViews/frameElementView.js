
var FrameElementView = function(dataModel, parentView) {

    this.dataModel = dataModel;
    this.parentView = parentView;

    this.disposables = [];

    // default values
    this.id = dataModel.id();
    this.fullWidth = ko.observable(0);
    this.fullHeight = ko.observable(0);
    this.isSelected = ko.observable(false);

    this.selectedTrialView = this.dataModel.modifier().selectedTrialView;

    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "opacity": this.selectedTrialView.visibility()
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

    if (this.dataModel.content().hasOwnProperty('stretchImageToFitBoundingBox')) {
        this.disposables.push(this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox.subscribe(function(newVal) {
            self.update(true, false);
        }));
    }

    this.disposables.push(this.scale.subscribe(function() {
        self.update(true,true);
    }));

    this.disposables.push(this.selectedTrialView.editorX.subscribe(function(x) {
        self.update(false,true);
    }));

    this.disposables.push(this.selectedTrialView.editorY.subscribe(function(y) {
        self.update(false,true);
    }));

    this.disposables.push(this.selectedTrialView.visibility.subscribe(function(a) {
        $(self.div).css({
            "opacity": self.selectedTrialView.visibility()
        });
    }));

    this.disposables.push(this.selectedTrialView.editorWidth.subscribe(function(w) {
        self.update(true,false);
    }));

    this.disposables.push(this.selectedTrialView.editorHeight.subscribe(function(h) {
        self.update(true,false);
    }));

    this.disposables.push(this.selectedTrialView.contentScaling.subscribe(function(newValue){
        self.update(true,false);
    }));

    this.disposables.push(this.selectedTrialView.contentRotation.subscribe(function(newValue){
        self.update(true,false);
    }));

    this.disposables.push(this.dataModel.anchorPointX.subscribe(function(newVal) {
        self.update(false,true);
    }));

    this.disposables.push(this.dataModel.anchorPointY.subscribe(function(newVal) {
        self.update(false,true);
    }));

    this.disposables.push(this.isSelected.subscribe(function(newVal){
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
    }));

    this.disposables.push(this.dataModel.content.subscribe(function(newValue){
        self.renderContent(newValue);
    }));

    if(this.dataModel.content().imgSource) {
        this.disposables.push(this.dataModel.content().imgSource.subscribe(function(imgSource) {
            self.renderContent(self.dataModel.content);
        }));
    }
};

FrameElementView.prototype.update = function(size, position){

    var self = this;

    if (size){

        $(this.div).css({
            "width": self.selectedTrialView.editorWidth() * self.scale(),
            "height": self.selectedTrialView.editorHeight() * self.scale()
        });

        var contentRotation = self.selectedTrialView.contentRotation();
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
            "width": self.selectedTrialView.editorWidth() * self.scale(),
            "height": self.selectedTrialView.editorHeight() * self.scale(),
            "position": "absolute"
        });

        var scale = self.selectedTrialView.contentScaling() * self.scale();
        $(this.divContentScaling).css({
            "position": "absolute",
            '-webkit-transform': 'scale(' + scale + ')',
            '-moz-transform': 'scale(' + scale + ')',
            '-ms-transform': 'scale(' + scale + ')',
            '-o-transform': 'scale(' + scale + ')',
            'transform': 'scale(' + scale + ')'
        });

        $(this.divContentInside).css({
            "width": self.selectedTrialView.editorWidth(),
            "height": self.selectedTrialView.editorHeight(),
            "position": "absolute"
        });

        $(this.text).css({
            "width": self.selectedTrialView.editorWidth() * self.scale(),
            "height": self.selectedTrialView.editorHeight() * self.scale()
        });

        if (this.dataModel.content().type == "ImageElement"){
            var image = this.divContentInside;

            if (image) {

                // this.selectedTrialView.editorWidth is the bounding box in virtual frame coordinates
                // this.fullWidth is the raw image width
                if (!this.dataModel.content().modifier().selectedTrialView.stretchImageToFitBoundingBox()) {
                    var scale = Math.min(self.selectedTrialView.editorWidth() / this.fullWidth(), self.selectedTrialView.editorHeight() / this.fullHeight());
                    var w = this.fullWidth() * scale * self.scale();
                    var h = this.fullHeight() * scale * self.scale();

                    $(image).css({
                        "width": w,
                        "height": h,
                        "position": 'absolute',
                        "left": (self.selectedTrialView.editorWidth() * self.scale() - w)/2,
                        "top": (self.selectedTrialView.editorHeight() * self.scale() - h)/2,
                        "-webkit-user-drag": 'none'
                    });
                }
                else {
                    $(image).css({
                        "width": self.selectedTrialView.editorWidth() * self.scale(),
                        "height": self.selectedTrialView.editorHeight() * self.scale(),
                        "left": 0,
                        "top": 0,
                        "-webkit-user-drag": 'none'
                    });
                }

            }
        }

    }

    if (position || size){

        var left = 0;
        if (this.dataModel.anchorPointX() == 'low'){
            left = self.selectedTrialView.editorX();
        }
        else if(this.dataModel.anchorPointX() == 'high'){
            left = self.selectedTrialView.editorX() - self.selectedTrialView.editorWidth();
        }
        else { // center
            left = self.selectedTrialView.editorX() - self.selectedTrialView.editorWidth()/2;
        }

        var top = 0;
        if (this.dataModel.anchorPointY() == 'low'){
            top = self.selectedTrialView.editorY();
        }
        else if(this.dataModel.anchorPointY() == 'high'){
            top = self.selectedTrialView.editorY() - self.selectedTrialView.editorHeight();
        }
        else { // center
            top = self.selectedTrialView.editorY() - self.selectedTrialView.editorHeight()/2;
        }

        $(this.div).css({
            "left": left * self.scale(),
            "top": top * self.scale()
        });

    }

};

FrameElementView.prototype.setWidthAndHeight = function(w, h) {

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.selectedTrialView.editorWidth(w);
        this.selectedTrialView.editorHeight(h);
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
        x = left + this.selectedTrialView.editorWidth();
    }
    else { // center
        x = left + this.selectedTrialView.editorWidth()/2;
    }

    var y = 0;
    if (this.dataModel.anchorPointY() == 'low'){
        y = top;
    }
    else if(this.dataModel.anchorPointY() == 'high'){
        y = top + this.selectedTrialView.editorHeight();
    }
    else { // center
        y = top + this.selectedTrialView.editorHeight()/2;
    }

    if (this.dataModel.hasOwnProperty('modifier')) {
        this.selectedTrialView.editorX(x);
        this.selectedTrialView.editorY(y);
    }
    else {
        this.dataModel.editorX(x);
        this.dataModel.editorY(y);
    }

    return this;
};


FrameElementView.prototype.setNaturalImageSize = function(naturalWidth, naturalHeight) {
    console.log("initialize original size");
    // initialize original size:
    this.fullWidth(naturalWidth);
    this.fullHeight(naturalHeight);
    this.update(true,true);
};

FrameElementView.prototype.renderContent = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "ImageElement") {
        if (data.imgSource()){

            // check if we have it preloaded:
            var imgElem;
            var htmlObjectUrl;
            if (typeof queue !== 'undefined') {
                var file_id = data.modifier().selectedTrialView.file_id();
                htmlObjectUrl = preloadedObjectUrlsById[file_id];
                imgElem = queue.getResult(file_id);
            }

            if (imgElem instanceof Image && htmlObjectUrl) {
                this.divContentInside = new Image;
                this.divContentInside.src = htmlObjectUrl;
            }
            else {
                this.divContentInside = new Image;
                this.divContentInside.src = data.imgSource();
            }

            $(this.divContentInside).css({
                "width": self.selectedTrialView.editorWidth() * self.scale(),
                "height": self.selectedTrialView.editorHeight() * self.scale(),
                "position": "absolute",
                "backgroundColor": "transparent"
            });

            $(this.divContent).children().remove();
            $(this.divContent).append(this.divContentInside);

            if (imgElem instanceof Image) {
                self.setNaturalImageSize(imgElem.naturalWidth, imgElem.naturalHeight);
            }
            else {
                this.divContentInside.onload = function () {
                    self.setNaturalImageSize(this.naturalWidth, this.naturalHeight);
                };
            }
        }
        else {
            this.renderPlaceHolderBoxAndLabel();
        }
    }
    else {
        $(this.divContent).children().remove();

        this.divContentScaling = $("<div></div>");

        if (this.parentView.type == "editorView") {
            this.divContentInside = $("<div data-bind='component: {name : \"contentElementPreview\", params : $data}'></div>");
        }
        else {
            this.divContentInside = $("<div data-bind='component: {name : \"contentElementPlayerview\", params : $data}'></div>");
        }

        $(this.divContentScaling).append(this.divContentInside);
        $(this.divContent).append(this.divContentScaling);
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
    this.disposables.push(this.dataModel.name.subscribe(function(newName) {
        $(self.text).text(newName);
    }));

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

    ko.utils.arrayForEach(this.disposables, function (disposable) {
        disposable.dispose();
    });
};
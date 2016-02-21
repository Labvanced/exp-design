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
    this.div= null;
    this.scale = ko.computed(function() {
        return this.editor.scale();
    }, this);

    // setup canvas, stage and subscriber
    this.setupDiv();
    this.setupSubscriber();

    // create box, label and resizeIcon
   // this.recreatePlaceHolderBoxAndLabel();

    // replace with image
    this.replaceWithVideo(this.dataModel.vidSource());

};


HtmlFrameElement.prototype.setupDiv = function() {
    var self = this;
    // setup canvas, stage and container
    this.div = document.createElement('div');
    $(this.div).css({
        "position": "absolute",
        "backgroundColor": "transparent"
    });
    this.video = document.createElement('div');
    $(this.video).css({
        "position": "absolute",
        "backgroundColor": "transparent"
    });

    this.text = document.createElement('p');
    $(this.text).css({
        "position": "absolute",
        "backgroundColor": "white",
        "textAlign": "center",
        "border": " 1px solid black"
    });
    $(this.text).text(this.dataModel.name());

    $(this.video).append(this.text);
    $(this.div).append(this.video);

};


HtmlFrameElement.prototype.recreatePlaceHolderBoxAndLabel = function() {
    // create box
    $(this.video).children().remove();

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

    $(this.video).append(text);

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
    }




    this.x.subscribe(function(x) {
        self.update(false,true);
    });

    this.y.subscribe(function(y) {
        self.update(false,true);
    });


    this.width.subscribe(function(w) {
        self.update(true,false);
      //  self.recreatePlaceHolderBoxAndLabel();
    });

    this.height.subscribe(function(h) {
        self.update(true,false);
     //   self.recreatePlaceHolderBoxAndLabel();
    });


    this.isSelected.subscribe(function(){
    //    self.recreatePlaceHolderBoxAndLabel();
    });


    this.dataModel.name.subscribe(function(newValue) {
        self.label.text = newValue;
    });

    this.dataModel.vidSource.subscribe(function(vidSource) {
        self.replaceWithVideo(vidSource);
    });
};



HtmlFrameElement.prototype.update = function(size,position){

    var self = this;

    if (size){

        $(this.text).css({
            "width":self.width() * self.scale(),
            "height":  self.height() * self.scale()
        });

        $(this.video).css({
            "width":self.width() * self.scale(),
            "height": self.height() * self.scale()
        });

        $(this.div).css({
            "width":self.width() * self.scale(),
            "height": self.height() * self.scale()
        });
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


HtmlFrameElement.prototype.replaceWithVideo = function(videoSource) {
    var self = this;

    if (videoSource) {


        $(this.div).children().remove();
        this.video = document.createElement('video');
        this.video.src = videoSource;
        $(this.video).css({
            "width":self.width() * self.scale(),
            "height": self.height() * self.scale(),
            "position": "absolute",
            "backgroundColor": "transparent"
        });
        $(this.div).append(this.video);

        if (this.editor.type == "editorView") {
            this.video.controls = true;
        }
        else if (this.editor.type == "sequenceView") {
            this.video.controls = false;
        }

        this.video.oncanplaythrough = function () {

            // initialize original size:
            self.fullWidth($(this).width());
            self.fullHeight($(this).height());
            self.update(true,true);

           if (self.editor.type == "editorView"){
               $(self.div).resizable( "destroy" );
               self.callbacks.addResize();
           }

        }


    }
};
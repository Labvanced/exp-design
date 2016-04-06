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
    $(this.text).text(this.dataModel.content().name());

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

    this.dataModel.content.subscribe(function(newValue){
        self.replaceWithContent(newValue)
    });

    if(this.dataModel.content().type == "VideoData"){
        this.dataModel.content().vidSource.subscribe(function(vidSource) {
            self.replaceWithContent(self.dataModel.content());
        });
    }

};

HtmlFrameElement.prototype.update = function(size,position){

    var self = this;

    if (size){

        $(this.text).css({
            "width":self.width() * self.scale(),
            "height":  self.height() * self.scale()
        });

        $(this.content).css({
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



HtmlFrameElement.prototype.renderElements = function(data) {
    var self = this;
    if (ko.isObservable(data)){
        data = data();
    }

    if (data.type == "CheckBoxElement" ||data.type =="MChoiceElement"||data.type =="ParagraphElement"||data.type =="RangeElement"||data.type =="ScaleElement"||data.type =="TextElement"){

        $(this.div).children().remove();
        this.content = document.createElement('questionnaire');
        if (data instanceof CheckBoxElement) {
            this.content = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'</div>");
        }
        else if (data instanceof MChoiceElement) {
            this.content = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'</div>");
        }
        else if (data instanceof ParagraphElement) {
            this.content = $("<div data-bind='component: {name : \"paragraph-playerview\", params : $data}'</div>");
        }
        else if (data instanceof RangeElement) {
            this.content = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'</div>");
        }
        else if (data instanceof ScaleElement) {
            this.content = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'</div>");
        }
        else if (data instanceof TextElement) {
            this.content = $("<div data-bind='component: {name : \"text-playerview\", params : $data}'</div>");
        }

        ko.applyBindings(data, $(this.content)[0]);
        $(this.content).css({
            "width": self.width() * self.scale(),
            "height": self.height() * self.scale(),
            "position": "absolute",
            "backgroundColor": "transparent"
        });
        $(this.div).append(this.content);
    }
    else if(data.type == "textArea"){
        $(this.div).children().remove();
        this.content = document.createElement('text');
    }

};


HtmlFrameElement.prototype.replaceWithContent = function(data) {
    var self = this;

    if (data.type == "VideoData") {

        if (data.vidSource()){
            $(this.div).children().remove();

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
};

var ImageElement= function(expData) {

    var self = this; 
    this.expData = expData;
    this.parent = null;

    // serialized

    this.type = "ImageElement";
    //this.name = ko.observable("ImageHtml");
    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);

    this.stimulusInformation  = ko.observable(null);
    
    this.shortName = ko.computed(function() {
        if (self.file_orig_name()){
            return (self.file_orig_name().length > 10 ? self.file_orig_name().substring(0, 9) + '...' : self.file_orig_name());
        }
        else return ''

    });
    
    this.stretchImageToFitBoundingBox = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

    this.shape = "square";
    this.label = "Image";

    // not serialized
    this.imgSource = ko.computed( function() {
        if (this.modifier().selectedTrialView.file_id() && this.modifier().selectedTrialView.file_orig_name()) {
            return "/files/" + this.modifier().selectedTrialView.file_id() + "/" + this.modifier().selectedTrialView.file_orig_name();
        }
        else {
            return false;
        }
    }, this);


    ///// not serialized
    this.selected = ko.observable(false);
    /////
};


ImageElement.prototype.dataType =      [ "string", "string", "boolean", "string"];
ImageElement.prototype.modifiableProp = ["file_id","file_orig_name", "stretchImageToFitBoundingBox","stimulusInformation" ];
ImageElement.prototype.initWidth = 300;
ImageElement.prototype.initHeight = 200;

ImageElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

ImageElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ImageElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};


ImageElement.prototype.fromJS = function(data) {
    var self = this;
    this.type = data.type;
    this.dataType = data.dataType;
    if (data.hasOwnProperty('stimulusInformation')){
        this.stimulusInformation(data.stimulusInformation);
    }
    //this.name(data.name);
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    if (data.stretchImageToFitBoundingBox) {
        this.stretchImageToFitBoundingBox(data.stretchImageToFitBoundingBox);
    }
    return this;
};

ImageElement.prototype.toJS = function() {

    return {
        type: this.type,
        dataType: this.dataType,
        stimulusInformation: this.stimulusInformation(),
        //name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        stretchImageToFitBoundingBox: this.stretchImageToFitBoundingBox(),
        modifier: this.modifier().toJS()
    };
};

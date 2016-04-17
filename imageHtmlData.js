/**
 * Created by kstandvoss on 06/04/16.
 */

var ImageHtmlData= function(expData) {

    this.expData = expData;
    this.parent = null;

    // serialized

    this.type = "ImageHtmlData";
    this.name = ko.observable("ImageHtml");
    this.file_id = ko.observable(null);
    this.file_orig_name = ko.observable(null);
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
            return false
        }
    }, this);

};


ImageHtmlData.prototype.modifiableProp = ["name","file_id","file_orig_name", "stretchImageToFitBoundingBox"];

ImageHtmlData.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);
};

ImageHtmlData.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);
};

ImageHtmlData.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
};


ImageHtmlData.prototype.fromJS = function(data) {
    var self = this;
    this.type = data.type;
    this.name(data.name);
    this.file_id(data.file_id);
    this.file_orig_name(data.file_orig_name);
    this.modifier(new Modifier(this.expData, this));
    this.modifier().fromJS(data.modifier);
    if (data.stretchImageToFitBoundingBox) {
        this.stretchImageToFitBoundingBox(data.stretchImageToFitBoundingBox);
    }
    return this;
};

ImageHtmlData.prototype.toJS = function() {

    return {
        type: this.type,
        name: this.name(),
        file_id: this.file_id(),
        file_orig_name: this.file_orig_name(),
        stretchImageToFitBoundingBox: this.stretchImageToFitBoundingBox(),
        modifier: this.modifier().toJS()
    };
};

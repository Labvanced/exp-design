/**
 * Created by kstandvoss on 25/04/16.
 */

var QuestionnaireElement = function(dataModel) {


    this.dataModel = dataModel;
    this.id = ko.observable(guid());
    this.selected = ko.observable(false);
    this.div = null;
    this.renderElements();
};


QuestionnaireElement.prototype.renderElements = function() {
    var self = this;

    $(this.div).children().remove();
    this.div = document.createElement('div');
    var content = null;
    if (this.dataModel instanceof CheckBoxElement) {
        content = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof MChoiceElement) {
        content = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof ParagraphElement) {
        content = $("<div data-bind='component: {name : \"paragraph-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof RangeElement) {
        content = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof ScaleElement) {
        content = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof TextElement) {
        content = $("<div data-bind='component: {name : \"text-playerview\", params : $data}'</div>");
    }
    else if (this.dataModel instanceof NewPageElement) {
        content = $("<div data-bind='component: {name : \"newPage-element-preview\", params : $data}'</div>");
    }
    ko.applyBindings(this.dataModel, $(content)[0]);
    $(this.div).append(content);
};

QuestionnaireElement.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    if(data.dataModel){
        var dataModel = new window[data.dataModel.type]();
        dataModel.fromJS(data.content);
        this.dataModel = content;
    }
    return this;
};


QuestionnaireElement.prototype.toJS = function() {
    return {
        id: this.id(),
        dataModel: this.dataModel.toJS()
    };
};


/**
 * Created by kstandvoss on 25/04/16.
 */

var QuestionnaireElement = function(expData) {

    this.expData = expData;
    this.type = "QuestionnaireElement";
    this.content = ko.observable();
    this.parent = null;
    this.name = ko.observable("questionnaire");
    this.id = ko.observable(guid());
    this.selected = ko.observable(false);
    this.div = null;

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

QuestionnaireElement.prototype.addContent = function(element){
    this.content(element);
    element.parent = this;
    this.renderElements();
};

QuestionnaireElement.prototype.modifiableProp = ["name"];

QuestionnaireElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    if(this.content().setPointers){
        this.content().setPointers(entitiesArr);
    }

};

QuestionnaireElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);

    if(this.content().reAddEntities){
        this.content().reAddEntities(entitiesArr);
    }

};

QuestionnaireElement.prototype.renderElements = function() {
    var self = this;

    $(this.div).children().remove();
    this.div = document.createElement('div');
    var elem = null;
    if (this.content() instanceof CheckBoxElement) {
        elem = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof MChoiceElement) {
        elem = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof ParagraphElement) {
        elem = $("<div data-bind='component: {name : \"paragraph-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof RangeElement) {
        elem = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof ScaleElement) {
        elem = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof TextElement) {
        elem = $("<div data-bind='component: {name : \"text-playerview\", params : $data}'</div>");
    }
    else if (this.content() instanceof NewPageElement) {
        elem = $("<div data-bind='component: {name : \"newPage-element-preview\", params : $data}'</div>");
    }
    ko.applyBindings(this.content(), $(elem)[0]);
    $(this.div).append(elem);
};

QuestionnaireElement.prototype.fromJS = function(data) {
    var self = this;
    this.id(data.id);
    this.type = data.type;
    if(data.content){
        var content = new window[data.content.type]();
        content.fromJS(data.content);
        this.content(content);
    }
    this.renderElements();
    return this;
};


QuestionnaireElement.prototype.toJS = function() {
    if(this.content()){
        var contentData = this.content().toJS();
    }
    else{
        contentData = null
    }
    return {
        id: this.id(),
        type: this.type,
        content: contentData
    };
};


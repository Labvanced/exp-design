
var PageElement = function(expData) {

    this.expData = expData;
    this.type = "PageElement";
    this.content = ko.observable();
    this.parent = null;
    this.name = ko.observable("questionnaire");
    this.id = ko.observable(guid());
    this.selected = ko.observable(false);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));
};

PageElement.prototype.addContent = function(element){
    this.content(element);
    element.parent = this;
};

PageElement.prototype.modifiableProp = ["name"];

PageElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    this.content().parent = this;
    if(this.content().setPointers){
        this.content().setPointers(entitiesArr);
    }

};

PageElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);

    if(this.content().reAddEntities){
        this.content().reAddEntities(entitiesArr);
    }

};


PageElement.prototype.fromJS = function(data) {
    this.id(data.id);
    this.type = data.type;
    this.name(data.name);
    if(data.content){
        var content = new window[data.content.type]();
        content.fromJS(data.content);
        this.content(content);
    }
    return this;
};


PageElement.prototype.toJS = function() {
    if(this.content()){
        var contentData = this.content().toJS();
    }
    else{
        contentData = null
    }
    return {
        id: this.id(),
        type: this.type,
        content: contentData,
        name: this.name()
    };
};



/**
 * A page element is a wrapper for different content elements that are placed on a page (pageData).
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var PageElement = function(expData) {

    this.expData = expData;
    this.type = "PageElement";
    this.content = ko.observable();
    this.parent = null;
    this.name = ko.observable("pageElement");
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
PageElement.prototype.dataType =      [ "string"];

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
PageElement.prototype.setPointers = function(entitiesArr) {
    this.modifier().setPointers(entitiesArr);

    this.content().parent = this;
    if(this.content().setPointers){
        this.content().setPointers(entitiesArr);
    }
};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
PageElement.prototype.reAddEntities = function(entitiesArr) {
    this.modifier().reAddEntities(entitiesArr);

    if(this.content().reAddEntities){
        this.content().reAddEntities(entitiesArr);
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {PageElement}
 */
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

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
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


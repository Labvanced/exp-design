
/**
 * A page element is a wrapper for different content elements that are placed on a page (pageData).
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var PageElement = function(expData) {

    var self = this;
    this.expData = expData;
    this.type = "PageElement";
    this.content = ko.observable();
    this.parent = null;
    this.name = ko.observable("pageElement");
    this.id = ko.observable(guid());
    this.selected = ko.observable(false);
    this.includeInPageShuffle  = ko.observable(false);

    // new
    this.stimulusInformation  = ko.observable(null);


    this.isActive = ko.observable(true);
    this.isVisible = ko.observable(true);

    this.shortName = ko.computed(function() {
        if (self.name()){
            return (self.name().length > 13 ? self.name().substring(0, 12) + '...' : self.name());
        }
        else return ''

    });

    // not serialized
    this.activeOptions = ko.observableArray([false,true]);

    // modifier:
    this.modifier = ko.observable(new Modifier(this.expData, this));

};

PageElement.prototype.dispose = function() {
    if (this.content()){
        this.content().dispose();
    }
};


PageElement.prototype.addContent = function(element){
    this.content(element);
    element.parent = this;
};

PageElement.prototype.selectTrialType = function(selectionSpec) {
    this.modifier().selectTrialType(selectionSpec);
    if  (typeof this.content().selectTrialType === "function"){
        this.content().selectTrialType(selectionSpec);
    }
};


PageElement.prototype.modifiableProp = ["isVisible","isActive"];
PageElement.prototype.dataType =    [ "boolean", "boolean"];
PageElement.prototype.subElementProp = ["content"];

/**
 * This function is used recursively to retrieve an array with all modifiers.
 * @param {Array} modifiersArr - this is an array that holds all modifiers.
 */
PageElement.prototype.getAllModifiers = function(modifiersArr) {
    modifiersArr.push(this.modifier());
    if(this.content() && this.content().getAllModifiers){
        this.content().getAllModifiers(modifiersArr);
    }
};

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
 * Recursively gathers path of entities until EditableText
 * @param {ko.observableArray} textArr - contains element label and rawText
 * @param {String} label - to be added to the path
 * @returns textArr on highes level
 */
PageElement.prototype.getTextRefs = function(textArr, label){
    var content = this.content();
    if (content.getTextRefs instanceof Function) {
        content.getTextRefs(textArr, this.name());
    }
    return textArr;
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

    this.modifier(new Modifier(this.expData, this));
    if (data.hasOwnProperty('modifier')) {
        this.modifier().fromJS(data.modifier);
    }
    if(data.hasOwnProperty('stimulusInformation')) {
        this.stimulusInformation(data.stimulusInformation);
    }
    if(data.hasOwnProperty('includeInPageShuffle')) {
        this.includeInPageShuffle(data.includeInPageShuffle);
    }
    if(data.hasOwnProperty('isActive')) {
        this.isActive(data.isActive);
    }
    if(data.hasOwnProperty('isVisible')) {
        this.isVisible(data.isVisible);
    }


    if(data.content){
        var classObj = window[data.content.type];
        if (!classObj) {
            console.log('error: type does not exist: '+data.content.type);
            if (data.content.type == "TextInputElement") {
                // convert type name:
                data.content.type = "InputElement";
                classObj = window[data.content.type];
            }
            else {
                return this;
            }
        }
        var content = new classObj(this.expData);
        content.fromJS(data.content);
        content.parent = this;
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
        contentData = null;
    }
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        stimulusInformation: this.stimulusInformation(),
        modifier: this.modifier().toJS(),
        content: contentData,
        includeInPageShuffle: this.includeInPageShuffle(),
        isActive:this.isActive(),
        isVisible:this.isVisible()
    };
};


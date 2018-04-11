// � by Caspar Goeke and Holger Finger


var QuestionnaireEditorData = function(expData) {

    var self = this;
    this.expData = expData;
    this.parent = null;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);
    this.id = ko.observable(guid());
    this.type = "QuestionnaireEditorData";
    this.name = ko.observable("Questionnaire");
    this.isActive = ko.observable(false);

    // not serialized
    this.shape = "square";
    this.label = "Questionnaire";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.progressBar = ko.observable(false);

    this.portHandler = new PortHandler(this);

};

QuestionnaireEditorData.prototype.addNewSubElement = function(elem) {
    this.elements.push(elem);
    this.expData.entities.insertIfNotExist(elem);
    elem.parent = this;
};

QuestionnaireEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.questionnaireEditorData = this;
    page("/page/editors/questionnaireEditor/" + uc.experiment.exp_id() + "/" + this.id());
};

QuestionnaireEditorData.prototype.setPointers = function(entitiesArr) {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        var elem = entitiesArr.byId[id];
        elem.parent = self;
        return elem;
    } ));
};

QuestionnaireEditorData.prototype.getElementById = function(id) {
    return  this.elements.byId[id];
};


QuestionnaireEditorData.prototype.reAddEntities = function(entitiesArr) {
    var self = this;

    // add the direct child nodes:
    jQuery.each( this.elements(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id()))
            entitiesArr.push(elem);

        // recursively make sure that all deep tree nodes are in the entities list:
        if (elem.reAddEntities)
            elem.reAddEntities(entitiesArr);
    } );

};

QuestionnaireEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    this.isActive(data.isActive);
    this.elements(data.elements);
    return this;
};


QuestionnaireEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        portHandler:this.portHandler.toJS(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        isActive:  this.isActive(),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};



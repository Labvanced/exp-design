// � by Caspar Goeke and Holger Finger


var QuestionnaireEditorData = function(expData) {

    var self = this;
    this.expData = expData;

    // serialized
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
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
    this.portHandler = new PortHandler(this);

};

QuestionnaireEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.questionnaireEditorData = this;
    page("/page/editors/questionnaireEditor");
};

QuestionnaireEditorData.prototype.setPointers = function() {
    var self = this;

    // convert ids to actual pointers:
    this.elements(jQuery.map( this.elements(), function( id ) {
        return self.expData.entities.byId[id];
    } ));
};


QuestionnaireEditorData.prototype.fromJS = function(data) {
    this.id(data.id);
    this.name(data.name);
    this.portHandler.fromJS(data.portHandler); // order is important: first portHandler then canvasElement!
    this.editorX(data.editorX);
    this.editorY(data.editorY);
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
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};



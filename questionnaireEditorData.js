// � by Caspar Goeke and Holger Finger


var QuestionnaireEditorData = function(expData) {

    var self = this;
    this.expData = expData;

    // serialized
    this.id = ko.observable(guid());
    this.type = "QuestionnaireEditorData";
    this.name = ko.observable("Questionnaire");

    // not serialized
    this.shape = "square";
    this.label = "Questionnaire";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]).extend({sortById: null});
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

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
    this.portHandler.fromJS(data.portHandler);
    this.canvasElement.fromJS(data.canvasElement);
    this.elements(data.elements);
    return this;
};


QuestionnaireEditorData.prototype.toJS = function() {
    return {
        id: this.id(),
        type: this.type,
        name: this.name(),
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: jQuery.map( this.elements(), function( elem ) { return elem.id(); } )
    };
};



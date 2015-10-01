


var QuestionnaireEditorData = function(parentSequence) {

    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "QuestionnaireEditorData";

    // not serialized
    this.shape = "square";
    this.label = "Questionnaire";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]);
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

};

QuestionnaireEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.questionnaireEditorData = this;
    page("/page/questionnaireEditor");
};

QuestionnaireEditorData.prototype.setPointers = function() {

};


QuestionnaireEditorData.prototype.fromJS = function(questionnaireData) {
    this.id(questionnaireData.id);
    this.type = questionnaireData.type;
    this.canvasElement.fromJS(questionnaireData);
    this.portHandler.fromJS(questionnaireData.canvasElement);

    var data = questionnaireData.elements;
    var elements = [];
    for (var i= 0, len=data.length; i<len; i++) {
        if (data[i].type == 'text'){
            elements[i] = new TextElement(this);
        }
        else if (data[i].type == 'paragraph'){
            elements[i] = new ParagraphElement(this);
        }
        else if (data[i].type == 'mChoice'){
            elements[i] = new MChoiceElement(this);
        }
        else if (data[i].type == 'checkBox'){
            elements[i] = new CheckBoxElement(this);
        }
        else if (data[i].type == 'scale'){
            elements[i] = new ScaleElement(this);
        }
        elements[i].fromJS(data[i]);
    }
    this.elements(elements);

    return this;
};


QuestionnaireEditorData.prototype.toJS = function() {

    var questionnaireData = this.elements();
    var questionnaireDataSerialized = [];
    for (var i= 0, len=questionnaireData.length; i<len; i++) {
        questionnaireDataSerialized.push(questionnaireData[i].toJS());
    }

    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: questionnaireDataSerialized
    };
};



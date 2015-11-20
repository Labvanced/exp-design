// � by Caspar Goeke and Holger Finger


var QuestionnaireEditorData = function(parentSequence) {

    var self = this;
    this.parentSequence = parentSequence;

    // serialized
    this.id = ko.observable(guid());
    this.type = "QuestionnaireEditorData";
    this.name = ko.observable("Questionnaire");

    // not serialized
    this.shape = "square";
    this.label = "Questionnaire";
    this.portTypes = ["executeIn", "executeOut"];

    // sub-Structures (serialized below)
    this.elements = ko.observableArray([]);
    this.portHandler = new PortHandler(this);
    this.canvasElement = new CanvasElement(this);

    // ordered Elements by Id:
    this.elementsById = {};
    this.elements.subscribe(function() {
        self.elementsById = {};
        var elements = self.elements();
        for (var i= 0, len=elements.length; i<len; i++) {
            self.elementsById[elements[i].id()] = elements[i];
        }
    });

};

QuestionnaireEditorData.prototype.doubleClick = function() {
    // this block was double clicked in the parent Experiment editor:
    uc.questionnaireEditorData = this;
    page("/page/editors/questionnaireEditor");
};

QuestionnaireEditorData.prototype.setPointers = function() {
    this.canvasElement.setActiveElement();
};


QuestionnaireEditorData.prototype.fromJS = function(questionnaireData) {
    this.id(questionnaireData.id);
    this.type = questionnaireData.type;

    this.name(questionnaireData.name);
    this.portHandler.fromJS(questionnaireData.portHandler);
    this.canvasElement.fromJS(questionnaireData.canvasElement);


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

        name: this.name(),
        canvasElement: this.canvasElement.toJS(),
        portHandler:this.portHandler.toJS(),
        elements: questionnaireDataSerialized
    };
};



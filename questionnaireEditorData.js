


var QuestionnaireEditorData = function(parentSequence) {

    var self = this;

    this.parentSequence = parentSequence;
    this.type = "QuestionnaireEditorData";
    this.id = ko.observable(guid());

    this.questionnaireData = ko.observableArray([]);

    this.ports = ko.observableArray();
    this.portsById = {};
    this.ports.subscribe(function() {
        self.portsById = {};
        var ports = self.ports();
        for (var i= 0, len=ports.length; i<len; i++) {
            self.portsById[ports[i].id()] = ports[i];
        }
    });


    // add input port
    this.inPort = new Port(this);
    this.inPort.x(-100);
    this.inPort.type = "executeIn";
    this.ports.push(this.inPort);


    // add output port
    this.outPort = new Port(this);
    this.outPort.x(100);
    this.outPort.type = "executeOut";
    this.ports.push(this.outPort);

    this.canvasElement = new CanvasElement(this);
    this.canvasElement.addPorts(this.ports());

};



QuestionnaireEditorData.prototype.setPointers = function() {

};


QuestionnaireEditorData.prototype.fromJS = function(questionaire) {
    this.id(questionaire.id);
    this.canvasElement.fromJS(questionaire);
    this.canvasElement.setCoord(questionaire.x, questionaire.y);
    for (var i= 0, len=questionaire.ports.length; i<len; i++) {
        var port = new Port(this);
        port.fromJS(questionaire.ports[i]);
        this.ports.push(port);
    }
    var data = questionaire.questionnaireData;
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
    this.questionnaireData(elements);
    return this;

};


QuestionnaireEditorData.prototype.toJS = function() {
    var self = this;
    var ports = self.ports();
    var portsSerialized = [];
    for (var i= 0, len=ports.length; i<len; i++) {
        portsSerialized.push(ports[i].toJS());
    }
    var questionnaireData = this.questionnaireData();
    var questionnaireDataSerialized = [];
    for (var i= 0, len=questionnaireData.length; i<len; i++) {
        questionnaireDataSerialized.push(questionnaireData[i].toJS());
    }

    return {
        id: this.id(),
        type: this.type,
        canvasElement: this.canvasElement.toJS(),
        questionnaireData: questionnaireDataSerialized,
        ports: portsSerialized

    };
};



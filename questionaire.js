


var QuestionaireBlock = function(sequence) {

    var self = this;

    this.sequence = sequence;
    this.type = "QuestionaireBlock";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
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

    this.container = new createjs.Container();


    var rect = new createjs.Shape();
    rect.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);

    rect.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord(mouseAt.x, mouseAt.y);
    });
    var self = this;
    rect.addEventListener("dblclick", function (ev) {
        uc.questionaireEditing = self;
        page("/page/questionnaireeditor");
    });
    this.container.addChild(rect);


    var txt = new createjs.Text("Questionaire", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);




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



    // add all port containers to this container:
    for (var i= 0, len=this.ports().length; i<len; i++) {
        this.container.addChild(this.ports()[i].container);
    }


    self.setCoord(550, 300);

};



QuestionaireBlock.prototype.setPointers = function() {

};


QuestionaireBlock.prototype.fromJS = function(questionaire) {
    this.id(questionaire.id);
    this.setCoord(questionaire.x, questionaire.y);
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


QuestionaireBlock.prototype.toJS = function() {
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
        x: this.x(),
        y: this.y(),
        questionnaireData: questionnaireDataSerialized,
        ports: portsSerialized

    };
};


QuestionaireBlock.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};



var QuestionaireBlock = function(sequence) {

    var self = this;

    this.sequence = sequence;
    this.type = "QuestionaireBlock";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.id = ko.observable(guid());
    this.questionData = null;
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
    rect.addEventListener("dblclick", function (ev) {
        uc.questionaireEditing = this;
        location.hash= "#questionnaireeditor";
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
    this.questionData = questionaire.questionData;
    return this;
};


QuestionaireBlock.prototype.toJS = function() {
    var self = this;
    var ports = self.ports();
    var portsSerialized = [];
    for (var i= 0, len=ports.length; i<len; i++) {
        portsSerialized.push(ports[i].toJS());
    }
    return {
        id: this.id(),
        type: this.type,
        x: this.x(),
        y: this.y(),
        questionData: this.questionData,
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



var QuestionaireBlock = function() {

    var self = this;

    this.type = "QuestionaireBlock";
    this.x = ko.observable(0);
    this.y = ko.observable(0);
    this.container = new createjs.Container();



    var rect = new createjs.Shape();
    rect.graphics.beginStroke("black").beginFill("gray").drawRect(-100, -50, 200, 100);
    rect.addEventListener("pressmove", function (ev) {
        var mouseAt = self.container.parent.globalToLocal(ev.stageX, ev.stageY);
        self.setCoord( mouseAt.x, mouseAt.y  );
    });
    rect.addEventListener("dblclick", function (ev) {
        location.hash= "#questionnaireeditor";
    });
    this.container.addChild(rect);



    var txt = new createjs.Text("Questionaire", "16px Arial", "#FFF");
    txt.textAlign = 'center';
    this.container.addChild(txt);



    var inputCirc = new createjs.Shape();
    inputCirc.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(-100, 0, 3);
    this.container.addChild(inputCirc);


    var outputCirc = new createjs.Shape();
    outputCirc.graphics.setStrokeStyle(8).beginStroke("red").drawCircle(100, 0, 3);
    this.container.addChild(outputCirc);



    self.setCoord(330, 200);

};


QuestionaireBlock.prototype.fromJS = function(questionaire) {
    this.setCoord(questionaire.x, questionaire.y);
    return this;
};


QuestionaireBlock.prototype.toJS = function() {
    return {
        x: this.x(),
        y: this.y()
    };
};


QuestionaireBlock.prototype.setCoord = function(x,y) {

    this.x(x);
    this.y(y);
    this.container.x = x;
    this.container.y = y;


    return this;
};
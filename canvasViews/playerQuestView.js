
// � by Caspar Goeke and Holger Finger

var PlayerQuestView = function(questionnaireData,questDiv,player) {

    this.questionnaireData = questionnaireData;
    this.questionnairePages = this.questionnaireData.elements();
    this.questDiv  = questDiv;
    this.player = player;
    this.startedTime = null;
    this.divContainerPerPage = [];
    this.nrOfPages = this.questionnairePages.length;

    this.currentPage = ko.observable(null);
    var self = this;
    this.currentPage.subscribe(function(currentPage){
        self.showCurrentPage(currentPage);
    });
};

PlayerQuestView.prototype.init = function() {
    for (var p = 0; p<this.nrOfPages; p++) {
        var page = this.questionnairePages[p];

        // add new page:
        this.addNewPage(page);

        // add questions of this page:
        var questions = page.elements();
        for (var q=0; q<questions.length; q++) {
            var newDiv = $("<div data-bind='component: {name : \"contentElementPlayerview\", params : $data}'</div>");
            this.divContainerPerPage[p].append(newDiv);
            ko.applyBindings(questions[q].content(), newDiv[0]);
        }

        // add confirm button:
        var newDiv = $("<div data-bind='component: {name : \"page-playerview\", params : $data}'</div>");
        this.divContainerPerPage[p].append(newDiv);
        ko.applyBindings(page, newDiv[0]);
        this.addNewPage();
    }
};

PlayerQuestView.prototype.addNewPage= function(page) {
    var div = $(document.createElement('div'));
    var header = $("<h3>Questionnaire</h3>");
    $(header).css({
        "color":"black",
        "text-align": "center"
    });
    $(div).append(header);
    var height = window.innerHeight-150;

    $(div).css({
        "position": "absolute",
        "backgroundColor": "white",
        "left": "20%",
        "height": height,
        "width": "60%",
        "top": "100px",
        "display": "none",
        "overflow-y":"scroll"
    });
    this.divContainerPerPage.push(div);

    $(div).css({
        "position": "absolute",
        "overflow-y":"scroll"
    });

    this.questDiv.append(div);
};


PlayerQuestView.prototype.showCurrentPage= function(currentPage) {
    $(this.questDiv.children()[currentPage]).css({
        "display": "block"
    });
};

PlayerQuestView.prototype.hide= function() {

    $(this.questDiv.children()[this.currentPage()]).css({
        "display": "none"
    });
};


PlayerQuestView.prototype.start= function() {
    this.currentPage(0);
    this.questDiv.css('display','block');
};

PlayerQuestView.prototype.submitQuestionnaire = function() {

    var answers = [];
    var varIds = [];
    for (var p = 0; p<this.nrOfPages; p++) {
        var questions = this.questionnairePages[p].elements();
        for (var q=0; q<questions.length; q++) {
            varIds.push(questions[q].content().variable().id());
            answers.push(questions[q].content().answer());
        }
    }

    var recData = new RecData(varIds,answers);
    this.player.addRecording(this.player.currentBlockIdx, 0, recData.toJS());

    this.player.currentSequence.selectNextElement();
    // empty div and make new frame
    this.questDiv.remove();
    this.player.parseNextElement();

};

PlayerQuestView.prototype.nextPage = function() {
    this.hide();
    this.currentPage(this.currentPage()+1);
};

PlayerQuestView.prototype.previousPage = function() {
    this.hide();
    this.currentPage(this.currentPage()-1);
};
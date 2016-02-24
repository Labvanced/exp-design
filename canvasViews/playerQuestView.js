
// � by Caspar Goeke and Holger Finger


var PlayerQuestView = function(questionnaireData,questDiv,player) {

    this.questionnaireData = questionnaireData;
    this.questionElements = this.questionnaireData.elements();
    this.questDiv  = questDiv;
    this.player = player;
    this.startedTime= null;
    this.divContainer = [];

    this.currentPage = ko.observable(null);
    var self = this;
    this.currentPage.subscribe(function(currentPage){
        self.setCurrentPage(currentPage);
    });
};

PlayerFrame.prototype.init = function() {

    var pageCount = 0;
    this.divContainer.push($(document.createElement('div')));

    for (var i = 0; i < this.questionElements.length; i++) {
        if (this.questionElements[i] instanceof NewPageElement) {
            this.divContainer.push($(document.createElement('div')));
            pageCount++;
        }
        else{
            this.divContainer[pageCount]
            // ToDo add divs for all elements
        }
    }

};

PlayerQuestView.prototype.setCurrentPage= function(currentPage) {

    this.questDiv.removeAllChildren();
    var currentDiv= this.divContainer[currentPage];
    this.questDiv.append(currentDiv);

};


PlayerQuestView.prototype.start= function() {

    this.currentPage(0);
    this.questDiv.css('display','block');
};


PlayerQuestView.prototype.end = function() {
    // set next frame
    this.player.currentSequence.selectNextElement();
    // empty div and make new frame
    this.questDiv.remove();
    this.player.parseNextElement();

};


PlayerQuestView.prototype.nextPage = function() {
    this.currentPage(this.currentPage()+1);
};


PlayerQuestView.prototype.previousPage = function() {
    this.currentPage(this.currentPage()-1);
};

// � by Caspar Goeke and Holger Finger


var PlayerQuestView = function(questionnaireData,questDiv,player) {

    this.questionnaireData = questionnaireData;
    this.questionElements = this.questionnaireData.elements();
    this.questDiv  = questDiv;
    this.player = player;
    this.startedTime= null;
    this.divContainer = [];
    this.nrOfPages= 1;

    this.currentPage = ko.observable(null);
    var self = this;
    this.currentPage.subscribe(function(currentPage){
        self.showCurrentPage(currentPage);
    });
};

PlayerQuestView.prototype.init = function() {

    var pageCount = 0;
    this.addNewPage();

    for (var i = 0; i < this.questionElements.length; i++) {
        if (this.questionElements[i] instanceof NewPageElement){
            this.nrOfPages++;
        }
    }

    for (var i = 0; i < this.questionElements.length; i++) {

        var elem = this.questionElements[i];

        if (!(elem.content() instanceof NewPageElement)){
            var newDiv = elem.div;
/*            if (elem.content() instanceof CheckBoxElement) {
                var newDiv = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'</div>");
            }
            else if (elem.content() instanceof MChoiceElement) {
                var newDiv = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'</div>");
            }
            else if (elem.content() instanceof ParagraphElement) {
                var newDiv = $("<div data-bind='component: {name : \"paragraph-playerview\", params : $data}'</div>");
            }
            else if (elem.content() instanceof RangeElement) {
                var newDiv = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'</div>");
            }
            else if (elem instanceof ScaleElement) {
                var newDiv = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'</div>");
            }
            else if (elem instanceof TextElement) {
                var newDiv = $("<div data-bind='component: {name : \"text-playerview\", params : $data}'</div>");
            }*/
            this.divContainer[pageCount].append(newDiv);
            $(newDiv).css({
                "color":"black"
            });

            //ko.applyBindings(elem.content(),newDiv);
        }
        else  {
            var newDiv = $("<div data-bind='component: {name : \"newpage-playerview\", params : $data.content()}'</div>");
            this.divContainer[pageCount].append(newDiv);
            elem.currPage =  pageCount+1;
            elem.totalPages =  this.nrOfPages;
            ko.applyBindings(elem,newDiv[0]);
            this.addNewPage();
            pageCount++;
        }
    }

    // append end page if not last element
    if (!(elem instanceof NewPageElement)){
        var elem =  new NewPageElement(this.player.experiment.exp_data);
        var newDiv = $("<div data-bind='component: {name : \"newpage-playerview\", params : $data}'</div>");
        this.divContainer[pageCount].append(newDiv);
        elem.currPage =  pageCount+1;
        elem.totalPages =  this.nrOfPages;
        ko.applyBindings(elem,newDiv[0]);
    }

    // make scrollbars and add divs to DOM
    for (var i = 0; i <this.divContainer.length; i++) {
        var div = this.divContainer[pageCount];
        $(div).height()
        $(div).css({
            "position": "absolute",
            "overflow-y":"scroll"
        });
        this.questDiv.append(this.divContainer[i][0]);
    }

};

PlayerQuestView.prototype.addNewPage= function() {
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
    this.divContainer.push(div);
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
    for (var i = 0; i<this.questionElements.length;i++){
        if (!(this.questionElements[i].content() instanceof NewPageElement)){
            varIds.push(this.questionElements[i].content().variable().id());
            answers.push(this.questionElements[i].content().answer());
        }
    }

    var recData = new RecData(varIds,answers);
    this.player.addRecording(this.player.currentBlock, 0, recData.toJS(), this.questionnaireData.name());

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
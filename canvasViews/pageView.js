// � by Caspar Goeke and Holger Finger


var PageView = function(pageData,parent,type) {

    this.pageData = pageData;
    this.pageDataObs = ko.observable(pageData);

    this.parent = parent;
    this.type= type;

    this.width = 0;
    this.height = 0;

    this.scale = ko.observable(1);

    this.selectedTrialType = ko.observable({ type: 'default'});

};



PageView.prototype.init = function(size) {

    this.width = size[0];
    this.height = size[1];

    // resize once and set dataModel
    this.resize(size);
    if (this.type != "playerView") {
        this.setDataModel(this.pageData);
    }
};

PageView.prototype.setDataModel = function(pageData) {

    this.pageData = pageData;
    this.pageDataObs(pageData);

    if(this.bgColorSubscription) {
        this.bgColorSubscription.dispose();
    }
};





PageView.prototype.resize = function(size) {

    if (size){
        this.width = size[0];
        this.height = size[1];
    }

};


PageView.prototype.setSize = function(size) {

    if (size){
        this.width = size[0];
        this.height = size[1];
    }

};

PageView.prototype.removeElemFromView = function(elementData,index) {
    // TODO
};

PageView.prototype.setSelectedElement = function(elem) {

    // change selection state of previously selected canvas element:
    //var prevSelectedElem = this.pageData.currSelectedElement();

    if (elem) {
        if (elem.type == "Event") {
            // element is an event
            // change currently selected element:
            this.pageData.currSelectedElement(elem);
        }
        else if (elem.type == "GlobalVar") {
            this.pageData.currSelectedElement(elem);
        }
        else {
            // element is an object
            // check if element is really a child of this frame:
            if (this.pageData.elements.byId[elem.id()]) {
                //var index = this.pageData.elements.indexOf(elem);

                // change selection state of newly selected canvas element:
                //this.viewElements()[index].isSelected(true);

                // change currently selected element:
                this.pageData.currSelectedElement(elem);
            }
        }
    }
    else {// deselect:
        // change currently selected element:
        this.pageData.currSelectedElement(null);
    }

};



PageView.prototype.removeElement = function(elem) {
    //this.currentPage().elements.remove(elem);
    this.currentPage().elements.remove(elem);
    this.selectElement(0);
};

PageView.prototype.moveUpElement = function (index) {
    if(index > 0){

        var array = this.currentPage().elements;
        array.splice(index-1, 2, this.currentPage().elements()[index], this.currentPage().elements()[index-1]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

PageView.prototype.moveDownElement = function (index) {
    if(index < this.currentPage().elements().length - 1){

        var array = this.currentPage().elements;
        array.splice(index, 2, this.currentPage().elements()[index+1], this.currentPage().elements()[index]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

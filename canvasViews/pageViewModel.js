// � by Caspar Goeke and Holger Finger


var PageView = function (divContainer, parent, type) {
    var self = this;

    this.divContainer = divContainer;

    this.parent = parent;
    this.type = type;

    this.pageData = null;
    this.pageDataObs = ko.observable(null);

    this.bgElement = null;

    this.viewElements = {
        byId: {}
    };

    this.width = 0;
    this.height = 0;

    this.scale = ko.observable(1);

    this.selectedTrialType = ko.observable({ type: 'default' });
    this.isInitialized = false;
};

/**
 * this init function should only be called after setDataModel was called!
 * @param size
 */
PageView.prototype.init = function (size) {
    if (!this.isInitialized) {
        this.width = size[0];
        this.height = size[1];

        if (this.type == "editorView") {
            this.divContentInside = $("<div style='position: relative; height: 100%;' data-bind='component: {name : \"page-preview\", params : $data}'></div>");
        }
        else {
            this.divContentInside = $("<div style='position: relative; height: 100%;' data-bind='component: {name : \"page-playerview\", params : $data}'></div>");
        }

        $(this.divContainer).append(this.divContentInside);
        ko.cleanNode($(this.divContainer)[0]);
        ko.applyBindings(this, $(this.divContainer)[0]);

        // resize once and set dataModel
        this.resize(size);

        this.isInitialized = true;
    }
};

PageView.prototype.dispose = function () {
    var self = this;

    // remove complete div
    ko.cleanNode($(this.divContainer)[0]);
    $(this.divContainer).remove();

    // remove all view elements and related things
    Object.keys(this.viewElements.byId).forEach(function (key, index) {
        self.viewElements.byId[key].dispose();
    });

};



PageView.prototype.setDataModel = function (pageData) {

    this.pageData = pageData;
    this.pageDataObs(pageData);

};


PageView.prototype.resize = function (size) {
    if (size) {
        this.width = size[0];
        this.height = size[1];
    }
};

PageView.prototype.setSize = function (size) {
    if (size) {
        this.width = size[0];
        this.height = size[1];
    }
};

PageView.prototype.setSelectedElement = function (elem) {
    if (elem) {
        if (elem.type == "ExpEvent") {
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

PageView.prototype.removeElement = function (elem) {
    //this.currentPage().elements.remove(elem);
    this.currentPage().elements.remove(elem);
    this.setSelectedElement(null);
};

PageView.prototype.moveUpElement = function (index) {
    if (index > 0) {

        var array = this.currentPage().elements;
        array.splice(index - 1, 2, this.currentPage().elements()[index], this.currentPage().elements()[index - 1]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

PageView.prototype.moveDownElement = function (index) {
    if (index < this.currentPage().elements().length - 1) {

        var array = this.currentPage().elements;
        array.splice(index, 2, this.currentPage().elements()[index + 1], this.currentPage().elements()[index]);
        this.currentPage().elements(array());

        this.renderElements();
    }
};

function createPageComponents() {

    ko.components.register('page-preview', {
        viewModel: {
            createViewModel: function (pageView, componentInfo) {
                var viewModel = function (pageView) {
                    this.pageView = pageView;
                };
                return new viewModel(pageView);
            }
        },
        template: { element: 'page-preview-template' }
    });


    ko.components.register('page-playerview', {
        viewModel: {
            createViewModel: function (pageView, componentInfo) {
                var viewModel = function (pageView) {
                    this.pageView = pageView;
                };
                return new viewModel(pageView);
            }
        },
        template: { element: 'page-playerview-template' }
    });

}



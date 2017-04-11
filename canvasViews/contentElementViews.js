/**
 * Wrapper class for different kinds of content elements.
 *
 * @param {ContentElement} contentElement - the content element (i.e. CheckBoxElement)
 * @constructor
 */
function ContentElementPreviewViewModel (contentElement) {
    this.contentElement = contentElement;
    this.isSelected = ko.observable(false);
}
ContentElementPreviewViewModel.prototype.dispose = function() {
    console.log("disposing ContentElementPreviewViewModel");
};

ko.components.register('contentElementPreview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var viewModel = new ContentElementPreviewViewModel(contentElement);

            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-element-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof VideoElement) {
                elem = $("<div data-bind='component: {name : \"video-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof AudioElement) {
                elem = $("<div data-bind='component: {name : \"audio-preview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof NaviElement) {
                elem = $("<div data-bind='component: {name : \"navigation-preview\", params : $data.contentElement}'></div>");
            }
            $(divElem).append(elem);
            return viewModel;
        }
    },
    template:
        '<div></div>'
});


/**
 * Wrapper class for different kinds of content elements.
 *
 * @param {ContentElement} contentElement - the content element (i.e. CheckBoxElement)
 * @constructor
 */
function ContentElementPlayerViewModel (contentElement) {
    this.contentElement = contentElement;
}
ContentElementPlayerViewModel.prototype.dispose = function() {
    console.log("disposing ContentElementPlayerViewModel");
};

ko.components.register('contentElementPlayerview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var viewModel = new ContentElementPlayerViewModel(contentElement);

            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-element-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof VideoElement) {
                elem = $("<div data-bind='component: {name : \"video-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof AudioElement) {
                elem = $("<div data-bind='component: {name : \"audio-playerview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof NaviElement) {
                elem = $("<div data-bind='component: {name : \"navigation-playerview\", params : $data.contentElement}'></div>");
            }
            $(divElem).append(elem);

            return viewModel;
        }
    },
    template:
        '<div></div>'
});

/**
 * Wrapper class for different kinds of content elements.
 *
 * @param {ContentElement} contentElement - the content element (i.e. CheckBoxElement)
 * @constructor
 */
function ContentElementEditViewModel (contentElement) {
    this.contentElement = contentElement;
}
ContentElementEditViewModel.prototype.dispose = function() {
    console.log("disposing ContentElementEditViewModel");
};

ko.components.register('contentElementEditview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var viewModel = new ContentElementEditViewModel(contentElement);

            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof VideoElement) {
                elem = $("<div data-bind='component: {name : \"video-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof AudioElement) {
                elem = $("<div data-bind='component: {name : \"audio-editview\", params : $data.contentElement}'></div>");
            }
            else if (contentElement instanceof NaviElement) {
                elem = $("<div data-bind='component: {name : \"navigation-editview\", params : $data.contentElement}'></div>");
            }
            $(divElem).append(elem);

            return viewModel;
        }
    },
    template:
        '<div></div>'
});
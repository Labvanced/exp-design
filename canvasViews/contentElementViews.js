ko.components.register('contentElementPreview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {
            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-element-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-preview\", params : $data}'></div>");
            }
            $(divElem).append(elem);
            return contentElement;
        }
    },
    template:
        '<div></div>'
});

ko.components.register('contentElementPlayerview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-element-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-playerview\", params : $data}'></div>");
            }
            $(divElem).append(elem);
            return contentElement;
        }
    },
    template:
        '<div></div>'
});


ko.components.register('contentElementEditview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var divElem = $(componentInfo.element)[0];
            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div data-bind='component: {name : \"checkbox-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div data-bind='component: {name : \"choice-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div data-bind='component: {name : \"multi-line-input-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div data-bind='component: {name : \"range-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div data-bind='component: {name : \"scale-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div data-bind='component: {name : \"text-input-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div data-bind='component: {name : \"display-text-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ButtonElement) {
                elem = $("<div data-bind='component: {name : \"button-editview\", params : $data}'></div>");
            }
            else if (contentElement instanceof InvisibleElement) {
                elem = $("<div data-bind='component: {name : \"invisible-editview\", params : $data}'></div>");
            }
            $(divElem).append(elem);
            return contentElement;
        }
    },
    template:
        '<div></div>'
});
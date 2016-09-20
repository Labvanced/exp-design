ko.components.register('contentElementPreview', {
    viewModel: {
        createViewModel: function (contentElement, componentInfo) {

            var divElem = $(componentInfo.element)[0];
            divElem.style.display = 'inline-block';
            divElem.style.margin = '5pt';
            divElem.style.width = '70%';

            var elem = null;
            if (contentElement instanceof CheckBoxElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"checkbox-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"choice-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"paragraph-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"range-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"scale-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div style='margin-left: 5%;' data-bind='component: {name : \"text-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div style='margin-left: 5%;' data-bind='component: {name : \"display-text-element-preview\", params : $data}'></div>");
            }
            else if (contentElement instanceof PageData) {
                elem = $("<div data-bind='component: {name : \"newPage-element-preview\", params : $data}'></div>");
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
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"checkbox-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultipleChoiceElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"choice-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof MultiLineInputElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"paragraph-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof RangeElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"range-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof ScaleElement) {
                elem = $("<div style='margin-left: 5%' data-bind='component: {name : \"scale-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof TextInputElement) {
                elem = $("<div style='margin-left: 5%;' data-bind='component: {name : \"text-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof DisplayTextElement) {
                elem = $("<div style='margin-left: 5%;' data-bind='component: {name : \"display-text-element-playerview\", params : $data}'></div>");
            }
            else if (contentElement instanceof PageData) {
                elem = $("<div data-bind='component: {name : \"newPage-element-playerview\", params : $data}'></div>");
            }
            $(divElem).append(elem);
            return contentElement;
        }
    },
    template:
        '<div></div>'
});
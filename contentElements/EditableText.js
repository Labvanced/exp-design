
function createEditableTextComponents() {
    ko.components.register('editable-text-component',{
        viewModel: {
            createViewModel: function(textObs, componentInfo){
                return textObs;
            }
        },
        template: {element: 'editable-text-template'}
    });
}

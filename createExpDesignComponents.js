
var createExpDesignComponents = (function() {
    var expDesignComponentsLoaded = false;

    return function (callback) {
        var self = this;
        if (expDesignComponentsLoaded) {
            callback();
        }
        else {
            var templates = [
                {
                    filepath: "/html_views/TextInputElement.html",
                    createCompFcn: createTextInputComponents
                },
                {
                    filepath: "/html_views/VideoElement.html",
                    createCompFcn: createVideoComponents
                },
                {
                    filepath: "/html_views/AudioElement.html",
                    createCompFcn: createAudioComponents
                },
                {
                    filepath: "/html_views/ScaleElement.html",
                    createCompFcn: createScaleComponents
                },
                {
                    filepath: "/html_views/RangeElement.html",
                    createCompFcn: createRangeComponents
                },
                {
                    filepath: "/html_views/MultiLineInputElement.html",
                    createCompFcn: createMultiLineInputComponents
                },
                {
                    filepath: "/html_views/MultipleChoiceElement.html",
                    createCompFcn: createMultipleChoiceComponents
                },
                {
                    filepath: "/html_views/InvisibleElement.html",
                    createCompFcn: createInvisibleElementComponents
                },
                {
                    filepath: "/html_views/DisplayTextElement.html",
                    createCompFcn: createDisplayTextComponents
                },
                {
                    filepath: "/html_views/CheckBoxElement.html",
                    createCompFcn: createCheckBoxComponents
                },
                {
                    filepath: "/html_views/ButtonElement.html",
                    createCompFcn: createButtonElementComponents
                },
                {
                    filepath: "/html_views/EditableText.html",
                    createCompFcn: createEditableTextComponents
                },
                {
                    filepath: "/html_views/SectionElement.html",
                    createCompFcn: createSectionElementComponents
                },
                {
                    filepath: "/html_views/NaviElement.html",
                    createCompFcn: createNaviElementComponents
                }
            ];

            var numRemainingItems = templates.length;
            for (var i = 0; i < templates.length; ++i) {
                var newContent = jQuery('<div/>', {
                    style: 'display:none;'
                }).prependTo('#koTemplates');
                (function (i) {
                    newContent.load(templates[i].filepath, function () {
                        templates[i].createCompFcn();
                        numRemainingItems--;
                        if (numRemainingItems==0) {
                            console.log('finished loading all knockout ExpDesign components and templates.');
                            expDesignComponentsLoaded = true;
                            callback();
                        }
                    });
                })(i);
            }
        }

    };

})();

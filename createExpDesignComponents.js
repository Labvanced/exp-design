
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
                    filepath: "/html_views/pageView.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createPageComponents
                },
                {
                    filepath: "/html_views/pageElementView.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createPageElementComponents
                },
                {
                    filepath: "/html_views/InputElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createInputComponents
                },
                {
                    filepath: "/html_views/VideoElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createVideoComponents
                },
                {
                    filepath: "/html_views/AudioElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createAudioComponents
                },
                {
                    filepath: "/html_views/ScaleElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createScaleComponents
                },
                {
                    filepath: "/html_views/RangeElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createRangeComponents
                },
                {
                    filepath: "/html_views/MultiLineInputElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createMultiLineInputComponents
                },
                {
                    filepath: "/html_views/MultipleChoiceElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createMultipleChoiceComponents
                },
                {
                    filepath: "/html_views/InvisibleElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createInvisibleElementComponents
                },
                {
                    filepath: "/html_views/DisplayTextElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createDisplayTextComponents
                },
                {
                    filepath: "/html_views/CheckBoxElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createCheckBoxComponents
                },
                {
                    filepath: "/html_views/ButtonElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createButtonElementComponents
                },
                {
                    filepath: "/html_views/EditableText.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createEditableTextComponents
                },
                {
                    filepath: "/html_views/SectionElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createSectionElementComponents
                },
                {
                    filepath: "/html_views/NaviElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createNaviElementComponents
                },
                {
                    filepath: "/html_views/LikertElement.html",
                    createCompFcn: createLikertElementComponents
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

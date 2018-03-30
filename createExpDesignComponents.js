
globalCountryData =  ko.observableArray([]);
globalLanguageData = ko.observableArray([]);

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
                    filepath: "/html_views/EyetrackerVideoStream.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createEyetrackerVideoStreamComponents
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
                    filepath: "/html_views/NaviElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createNaviElementComponents
                },
                {
                    filepath: "/html_views/LikertElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createLikertElementComponents
                },
                {
                    filepath: "/html_views/SelectionElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createSelectionElementComponents
                },
                {
                    filepath: "/html_views/SectionElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createSectionElementComponents
                },
                {
                    filepath: "/html_views/SortableElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createSortableElementComponents
                },
                {
                    filepath: "/html_views/ProgressBarElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createProgressBarComponents
                },
                {
                    filepath: "/html_views/FileUploadElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createFileUploadElementComponents
                },
                {
                    filepath: "/html_views/AudioRecordingElement.html?FILE_VERSION_PLACEHOLDER",
                    createCompFcn: createAudioRecordingComponents
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

                            // now load languages and countries:
                          //  globalCountryData = ko.observableArray([]);
                          //  globalLanguageData = ko.observableArray([]);
                            $.ajax({
                                url: "/api/1/countries",
                                type: 'GET',
                                async: true
                            }).done(function (result) {
                                globalCountryData(result);

                                $.ajax({
                                    url: "/api/1/languages",
                                    type: 'GET',
                                    async: true
                                }).done(function (result) {
                                    globalLanguageData(result);
                                    callback();
                                });

                            });

                        }
                    });
                })(i);
            }
        }

    };

})();

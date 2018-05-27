
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

                            globalCountryData([{"code":"AF","name":"Afghanistan"},{"code":"AL","name":"Albania"},{"code":"DZ","name":"Algeria"},{"code":"DS","name":"American Samoa"},{"code":"AD","name":"Andorra"},{"code":"AO","name":"Angola"},{"code":"AI","name":"Anguilla"},{"code":"AQ","name":"Antarctica"},{"code":"AG","name":"Antigua and Barbuda"},{"code":"AR","name":"Argentina"},{"code":"AM","name":"Armenia"},{"code":"AW","name":"Aruba"},{"code":"AU","name":"Australia"},{"code":"AT","name":"Austria"},{"code":"AZ","name":"Azerbaijan"},{"code":"BS","name":"Bahamas"},{"code":"BH","name":"Bahrain"},{"code":"BD","name":"Bangladesh"},{"code":"BB","name":"Barbados"},{"code":"BY","name":"Belarus"},{"code":"BE","name":"Belgium"},{"code":"BZ","name":"Belize"},{"code":"BJ","name":"Benin"},{"code":"BM","name":"Bermuda"},{"code":"BT","name":"Bhutan"},{"code":"BO","name":"Bolivia"},{"code":"BA","name":"Bosnia and Herzegovina"},{"code":"BW","name":"Botswana"},{"code":"BV","name":"Bouvet Island"},{"code":"BR","name":"Brazil"},{"code":"IO","name":"British Indian Ocean Territory"},{"code":"BN","name":"Brunei Darussalam"},{"code":"BG","name":"Bulgaria"},{"code":"BF","name":"Burkina Faso"},{"code":"BI","name":"Burundi"},{"code":"KH","name":"Cambodia"},{"code":"CM","name":"Cameroon"},{"code":"CA","name":"Canada"},{"code":"CV","name":"Cape Verde"},{"code":"KY","name":"Cayman Islands"},{"code":"CF","name":"Central African Republic"},{"code":"TD","name":"Chad"},{"code":"CL","name":"Chile"},{"code":"CN","name":"China"},{"code":"CX","name":"Christmas Island"},{"code":"CC","name":"Cocos (Keeling) Islands"},{"code":"CO","name":"Colombia"},{"code":"KM","name":"Comoros"},{"code":"CG","name":"Congo"},{"code":"CK","name":"Cook Islands"},{"code":"CR","name":"Costa Rica"},{"code":"HR","name":"Croatia (Hrvatska)"},{"code":"CU","name":"Cuba"},{"code":"CY","name":"Cyprus"},{"code":"CZ","name":"Czech Republic"},{"code":"DK","name":"Denmark"},{"code":"DJ","name":"Djibouti"},{"code":"DM","name":"Dominica"},{"code":"DO","name":"Dominican Republic"},{"code":"TP","name":"East Timor"},{"code":"EC","name":"Ecuador"},{"code":"EG","name":"Egypt"},{"code":"SV","name":"El Salvador"},{"code":"GQ","name":"Equatorial Guinea"},{"code":"ER","name":"Eritrea"},{"code":"EE","name":"Estonia"},{"code":"ET","name":"Ethiopia"},{"code":"FK","name":"Falkland Islands (Malvinas)"},{"code":"FO","name":"Faroe Islands"},{"code":"FJ","name":"Fiji"},{"code":"FI","name":"Finland"},{"code":"FR","name":"France"},{"code":"FX","name":"France, Metropolitan"},{"code":"GF","name":"French Guiana"},{"code":"PF","name":"French Polynesia"},{"code":"TF","name":"French Southern Territories"},{"code":"GA","name":"Gabon"},{"code":"GM","name":"Gambia"},{"code":"GE","name":"Georgia"},{"code":"DE","name":"Germany"},{"code":"GH","name":"Ghana"},{"code":"GI","name":"Gibraltar"},{"code":"GK","name":"Guernsey"},{"code":"GR","name":"Greece"},{"code":"GL","name":"Greenland"},{"code":"GD","name":"Grenada"},{"code":"GP","name":"Guadeloupe"},{"code":"GU","name":"Guam"},{"code":"GT","name":"Guatemala"},{"code":"GN","name":"Guinea"},{"code":"GW","name":"Guinea-Bissau"},{"code":"GY","name":"Guyana"},{"code":"HT","name":"Haiti"},{"code":"HM","name":"Heard and Mc Donald Islands"},{"code":"HN","name":"Honduras"},{"code":"HK","name":"Hong Kong"},{"code":"HU","name":"Hungary"},{"code":"IS","name":"Iceland"},{"code":"IN","name":"India"},{"code":"IM","name":"Isle of Man"},{"code":"ID","name":"Indonesia"},{"code":"IR","name":"Iran (Islamic Republic of)"},{"code":"IQ","name":"Iraq"},{"code":"IE","name":"Ireland"},{"code":"IL","name":"Israel"},{"code":"IT","name":"Italy"},{"code":"CI","name":"Ivory Coast"},{"code":"JE","name":"Jersey"},{"code":"JM","name":"Jamaica"},{"code":"JP","name":"Japan"},{"code":"JO","name":"Jordan"},{"code":"KZ","name":"Kazakhstan"},{"code":"KE","name":"Kenya"},{"code":"KI","name":"Kiribati"},{"code":"KP","name":"Korea, Democratic People's Republic of"},{"code":"KR","name":"Korea, Republic of"},{"code":"XK","name":"Kosovo"},{"code":"KW","name":"Kuwait"},{"code":"KG","name":"Kyrgyzstan"},{"code":"LA","name":"Lao People's Democratic Republic"},{"code":"LV","name":"Latvia"},{"code":"LB","name":"Lebanon"},{"code":"LS","name":"Lesotho"},{"code":"LR","name":"Liberia"},{"code":"LY","name":"Libyan Arab Jamahiriya"},{"code":"LI","name":"Liechtenstein"},{"code":"LT","name":"Lithuania"},{"code":"LU","name":"Luxembourg"},{"code":"MO","name":"Macau"},{"code":"MK","name":"Macedonia"},{"code":"MG","name":"Madagascar"},{"code":"MW","name":"Malawi"},{"code":"MY","name":"Malaysia"},{"code":"MV","name":"Maldives"},{"code":"ML","name":"Mali"},{"code":"MT","name":"Malta"},{"code":"MH","name":"Marshall Islands"},{"code":"MQ","name":"Martinique"},{"code":"MR","name":"Mauritania"},{"code":"MU","name":"Mauritius"},{"code":"TY","name":"Mayotte"},{"code":"MX","name":"Mexico"},{"code":"FM","name":"Micronesia, Federated States of"},{"code":"MD","name":"Moldova, Republic of"},{"code":"MC","name":"Monaco"},{"code":"MN","name":"Mongolia"},{"code":"ME","name":"Montenegro"},{"code":"MS","name":"Montserrat"},{"code":"MA","name":"Morocco"},{"code":"MZ","name":"Mozambique"},{"code":"MM","name":"Myanmar"},{"code":"NA","name":"Namibia"},{"code":"NR","name":"Nauru"},{"code":"NP","name":"Nepal"},{"code":"NL","name":"Netherlands"},{"code":"AN","name":"Netherlands Antilles"},{"code":"NC","name":"New Caledonia"},{"code":"NZ","name":"New Zealand"},{"code":"NI","name":"Nicaragua"},{"code":"NE","name":"Niger"},{"code":"NG","name":"Nigeria"},{"code":"NU","name":"Niue"},{"code":"NF","name":"Norfolk Island"},{"code":"MP","name":"Northern Mariana Islands"},{"code":"NO","name":"Norway"},{"code":"OM","name":"Oman"},{"code":"PK","name":"Pakistan"},{"code":"PW","name":"Palau"},{"code":"PS","name":"Palestine"},{"code":"PA","name":"Panama"},{"code":"PG","name":"Papua New Guinea"},{"code":"PY","name":"Paraguay"},{"code":"PE","name":"Peru"},{"code":"PH","name":"Philippines"},{"code":"PN","name":"Pitcairn"},{"code":"PL","name":"Poland"},{"code":"PT","name":"Portugal"},{"code":"PR","name":"Puerto Rico"},{"code":"QA","name":"Qatar"},{"code":"RE","name":"Reunion"},{"code":"RO","name":"Romania"},{"code":"RU","name":"Russian Federation"},{"code":"RW","name":"Rwanda"},{"code":"KN","name":"Saint Kitts and Nevis"},{"code":"LC","name":"Saint Lucia"},{"code":"VC","name":"Saint Vincent and the Grenadines"},{"code":"WS","name":"Samoa"},{"code":"SM","name":"San Marino"},{"code":"ST","name":"Sao Tome and Principe"},{"code":"SA","name":"Saudi Arabia"},{"code":"SN","name":"Senegal"},{"code":"RS","name":"Serbia"},{"code":"SC","name":"Seychelles"},{"code":"SL","name":"Sierra Leone"},{"code":"SG","name":"Singapore"},{"code":"SK","name":"Slovakia"},{"code":"SI","name":"Slovenia"},{"code":"SB","name":"Solomon Islands"},{"code":"SO","name":"Somalia"},{"code":"ZA","name":"South Africa"},{"code":"GS","name":"South Georgia South Sandwich Islands"},{"code":"ES","name":"Spain"},{"code":"LK","name":"Sri Lanka"},{"code":"SH","name":"St. Helena"},{"code":"PM","name":"St. Pierre and Miquelon"},{"code":"SD","name":"Sudan"},{"code":"SR","name":"Suriname"},{"code":"SJ","name":"Svalbard and Jan Mayen Islands"},{"code":"SZ","name":"Swaziland"},{"code":"SE","name":"Sweden"},{"code":"CH","name":"Switzerland"},{"code":"SY","name":"Syrian Arab Republic"},{"code":"TW","name":"Taiwan"},{"code":"TJ","name":"Tajikistan"},{"code":"TZ","name":"Tanzania, United Republic of"},{"code":"TH","name":"Thailand"},{"code":"TG","name":"Togo"},{"code":"TK","name":"Tokelau"},{"code":"TO","name":"Tonga"},{"code":"TT","name":"Trinidad and Tobago"},{"code":"TN","name":"Tunisia"},{"code":"TR","name":"Turkey"},{"code":"TM","name":"Turkmenistan"},{"code":"TC","name":"Turks and Caicos Islands"},{"code":"TV","name":"Tuvalu"},{"code":"UG","name":"Uganda"},{"code":"UA","name":"Ukraine"},{"code":"AE","name":"United Arab Emirates"},{"code":"GB","name":"United Kingdom"},{"code":"US","name":"United States"},{"code":"UM","name":"United States minor outlying islands"},{"code":"UY","name":"Uruguay"},{"code":"UZ","name":"Uzbekistan"},{"code":"VU","name":"Vanuatu"},{"code":"VA","name":"Vatican City State"},{"code":"VE","name":"Venezuela"},{"code":"VN","name":"Vietnam"},{"code":"VG","name":"Virgin Islands (British)"},{"code":"VI","name":"Virgin Islands (U.S.)"},{"code":"WF","name":"Wallis and Futuna Islands"},{"code":"EH","name":"Western Sahara"},{"code":"YE","name":"Yemen"},{"code":"YU","name":"Yugoslavia"},{"code":"ZR","name":"Zaire"},{"code":"ZM","name":"Zambia"},{"code":"ZW","name":"Zimbabwe"}]);
                            globalLanguageData([{"code":"ab","name":"Abkhazian"},{"code":"om","name":"(Afan)/Oromoor/Oriya"},{"code":"aa","name":"Afar"},{"code":"af","name":"Afrikaans"},{"code":"sq","name":"Albanian"},{"code":"am","name":"Amharic"},{"code":"ar","name":"Arabic"},{"code":"hy","name":"Armenian"},{"code":"as","name":"Assamese"},{"code":"ay","name":"Aymara"},{"code":"az","name":"Azerbaijani"},{"code":"ba","name":"Bashkir"},{"code":"eu","name":"Basque"},{"code":"be","name":"Belarusian"},{"code":"bn","name":"Bengali/Bangla"},{"code":"dz","name":"Bhutani"},{"code":"bh","name":"Bihari"},{"code":"bi","name":"Bislama"},{"code":"br","name":"Breton"},{"code":"bg","name":"Bulgarian"},{"code":"my","name":"Burmese"},{"code":"km","name":"Cambodian"},{"code":"ca","name":"Catalan"},{"code":"zh","name":"Chinese"},{"code":"co","name":"Corsican"},{"code":"hr","name":"Croatian"},{"code":"cs","name":"Czech"},{"code":"da","name":"Danish"},{"code":"nl","name":"Dutch"},{"code":"en","name":"English"},{"code":"eo","name":"Esperanto"},{"code":"et","name":"Estonian"},{"code":"fo","name":"Faeroese"},{"code":"fj","name":"Fiji"},{"code":"fi","name":"Finnish"},{"code":"fr","name":"French"},{"code":"fy","name":"Frisian"},{"code":"gl","name":"Galician"},{"code":"ka","name":"Georgian"},{"code":"de","name":"German"},{"code":"el","name":"Greek"},{"code":"kl","name":"Greenlandic"},{"code":"gn","name":"Guarani"},{"code":"gu","name":"Gujarati"},{"code":"ha","name":"Hausa"},{"code":"iw","name":"Hebrew"},{"code":"hi","name":"Hindi"},{"code":"hu","name":"Hungarian"},{"code":"is","name":"Icelandic"},{"code":"in","name":"Indonesian"},{"code":"ia","name":"Interlingua"},{"code":"ie","name":"Interlingue"},{"code":"ik","name":"Inupiak"},{"code":"ga","name":"Irish"},{"code":"it","name":"Italian"},{"code":"ja","name":"Japanese"},{"code":"jw","name":"Javanese"},{"code":"kn","name":"Kannada"},{"code":"ks","name":"Kashmiri"},{"code":"kk","name":"Kazakh"},{"code":"rw","name":"Kinyarwanda"},{"code":"ky","name":"Kirghiz"},{"code":"rn","name":"Kirundi"},{"code":"ko","name":"Korean"},{"code":"ku","name":"Kurdish"},{"code":"lo","name":"Laothian"},{"code":"la","name":"Latin"},{"code":"lv","name":"Latvian/Lettish"},{"code":"ln","name":"Lingala"},{"code":"lt","name":"Lithuanian"},{"code":"mk","name":"Macedonian"},{"code":"mg","name":"Malagasy"},{"code":"ms","name":"Malay"},{"code":"ml","name":"Malayalam"},{"code":"mt","name":"Maltese"},{"code":"mi","name":"Maori"},{"code":"mr","name":"Marathi"},{"code":"mo","name":"Moldavian"},{"code":"mn","name":"Mongolian"},{"code":"na","name":"Nauru"},{"code":"ne","name":"Nepali"},{"code":"no","name":"Norwegian"},{"code":"oc","name":"Occitan"},{"code":"ps","name":"Pashto/Pushto"},{"code":"fa","name":"Persian"},{"code":"pl","name":"Polish"},{"code":"pt","name":"Portuguese"},{"code":"pa","name":"Punjabi"},{"code":"qu","name":"Quechua"},{"code":"rm","name":"Rhaeto-Romance"},{"code":"ro","name":"Romanian"},{"code":"ru","name":"Russian"},{"code":"sm","name":"Samoan"},{"code":"sg","name":"Sangro"},{"code":"sa","name":"Sanskrit"},{"code":"gd","name":"Scots/Gaelic"},{"code":"sr","name":"Serbian"},{"code":"sh","name":"Serbo-Croatian"},{"code":"st","name":"Sesotho"},{"code":"tn","name":"Setswana"},{"code":"sn","name":"Shona"},{"code":"sd","name":"Sindhi"},{"code":"si","name":"Singhalese"},{"code":"ss","name":"Siswati"},{"code":"sk","name":"Slovak"},{"code":"sl","name":"Slovenian"},{"code":"so","name":"Somali"},{"code":"es","name":"Spanish"},{"code":"su","name":"Sundanese"},{"code":"sw","name":"Swahili"},{"code":"sv","name":"Swedish"},{"code":"tl","name":"Tagalog"},{"code":"tg","name":"Tajik"},{"code":"ta","name":"Tamil"},{"code":"tt","name":"Tatar"},{"code":"te","name":"Telugu"},{"code":"th","name":"Thai"},{"code":"bo","name":"Tibetan"},{"code":"ti","name":"Tigrinya"},{"code":"to","name":"Tonga"},{"code":"ts","name":"Tsonga"},{"code":"tr","name":"Turkish"},{"code":"tk","name":"Turkmen"},{"code":"tw","name":"Twi"},{"code":"uk","name":"Ukrainian"},{"code":"ur","name":"Urdu"},{"code":"uz","name":"Uzbek"},{"code":"vi","name":"Vietnamese"},{"code":"vo","name":"Volapuk"},{"code":"cy","name":"Welsh"},{"code":"wo","name":"Wolof"},{"code":"xh","name":"Xhosa"},{"code":"ji","name":"Yiddish"},{"code":"yo","name":"Yoruba"},{"code":"zu","name":"Zulu"}]);
                            callback();

                        }
                    });
                })(i);
            }
        }

    };

})();

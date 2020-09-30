// � by Caspar Goeke and Holger Finger

/**
 * Stores all specifications of an experiment.
 * @constructor
 */
var ExpData = function (parentExperiment) {
    var self = this;
    this.parentExperiment = parentExperiment;

    this.expData = this; // self reference for consistency with other classes..

    // entities hold all instances that have an id field:
    this.entities = ko.observableArray([]).extend({ sortById: null });

    this.availableTasks = ko.observableArray([]);
    this.availableBlocks = ko.observableArray([]);
    this.availableSessions = ko.observableArray([]);
    this.availableGroups = ko.observableArray([]);
    this.availableVars = ko.observableArray([]).extend({ sortById: null });

    this.isJointExp = ko.observable(false);    // needs to be placed before initialize studySettings!
    this.numPartOfJointExp = ko.observable(2); // needs to be placed before initialize studySettings!
    this.jointOptionModified = ko.observable(false);

    //serialized
    this.studySettings = new StudySettings(this.expData);
    this.confirmedVariables = ko.observable(false);

    this.translations = ko.observableArray([]);
    this.translatedLanguages = ko.observableArray([]);

    // customizedStaticStrings stores a map with the same structure as ExpData.prototype.staticTranslations but with values being the index of the TranslationEntry in this.translations
    this.customizedStaticStrings = {

    };

    this.translationsEnabled = ko.computed(function () {
        return true;
    });

    // not serialized
    this.allVariables = {};
    this.staticStrings = ko.observable(ExpData.prototype.staticTranslations["English"]);
    this.currentLanguage = ko.observable(0);
    this.currentLanguageSubscription = this.currentLanguage.subscribe(function (newLang) {
        self.updateLanguage();
    });

    this.translatedLanguagesSubscription = this.translatedLanguages.subscribe(function (newLang) {
        self.updateLanguage();
    });


    this.variableSubscription = null;

    this.dateLastModified = ko.observable(getCurrentDate(this.studySettings.timeZoneOffset()));

    for (var i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        this[ExpData.prototype.fixedVarNames[i]] = ko.observable();
    }



    this.vars = ko.computed(function () {
        var varArray = [];
        for (var i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
            varArray.push(this[ExpData.prototype.fixedVarNames[i]]());
        }
        return varArray;
    }, this);

    this.errorString = ko.computed(function () {
        var errorString = "";
        if (this.availableGroups().length == 0) {
            errorString += "No Group, ";
        }
        if (this.availableSessions().length == 0) {
            errorString += "No Session, ";
        }
        if (this.availableBlocks().length == 0) {
            errorString += "No Block, ";
        }
        if (this.availableTasks().length == 0) {
            errorString += "No Task, ";
        }

        // remove last comma:
        if (errorString != "") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);

};

ExpData.prototype.oldFixedVarNames = [
    'varSubjectId',
    'varSubjectIndex',
    'varSubjectNrPerSubjGroupEMPTY',
    'varGroupId',
    'varSessionTimeStamp',
    'varSessionTimeStampEnd',
    'varSessionId',
    'varSessionIndex',
    'varBlockId',
    'varBlockIndex',
    'varTaskId',
    'varTaskIndex',
    'varTrialId',
    'varTrialIndex',
    'varCondition',

    'varBrowserSpecEMPTY',
    'varSystemSpecEMPTY',
    'varAgentSpecEMPTY',
    'varBrowserVersionSpecEMPTY',
    'varFullscreenSpecEMPTY',
    'varTimeMeasureSpecMeanEMPTY',
    'varTimeMeasureSpecStdEMPTY',

    'varCrowdsourcingCodeEMPTY',
    'varCrowdsourcingSubjIdEMPTY',

    'varRoleIdEMPTY',
    'varvarMultiUserGroupIdEMPTY',

    'varDisplayedLanguageEMPTY',
    'varPixelDensityPerMMEMPTY',

    // 'varTimeMeasureSpecMaxEMPTY',
];

ExpData.prototype.fixedVarNames = [

    //recorded and global by default
    'varSubjectNr',
    'varTrialNr',
    'varTrialId',
    'varConditionId',

    //recorded not global by default
    'varSubjectCode',
    'varGroupName',
    'varSessionTimeStamp',
    'varSessionTimeStampEnd',
    'varSessionName',
    'varSessionNr',
    'varBlockName',
    'varBlockNr',
    'varTaskName',
    'varTaskNr',
    'varTimeMeasureSpecMean',
    'varTimeMeasureSpecStd',
    'varCrowdsourcingCode',
    'varCrowdsourcingSubjId',

    // dynamically adjusted
    'varSubjectNrPerSubjGroup',
    'varRoleId',
    'varMultiUserGroupId',
    'varDisplayedLanguage',
    'varDisplayWidthX',
    'varDisplayWidthY',
    'varScreenTotalWidthX',
    'varScreenTotalWidthY',
    'varPixelDensityPerMM',

    //not recorded and not global by default
    'varBrowserSpec',
    'varSystemSpec',
    'varAgentSpec',
    'varBrowserVersionSpec',
    'varFullscreenSpec',


    // 'varTimeMeasureSpecMax',

];


ExpData.prototype.varDescriptions = {
    'varSubjectCode': 'The variable "Subject_Code" is a unique string for each subject / session across all experiments running on Labvanced. This can be used to uniquely identify each participant or session.',
    'varSubjectNr': 'The variable "Subject_Nr" is a global counter of participants in a study. This can be used to do custom between subject randomization and to infer the overall number of participants in a study.',
    'varSubjectNrPerSubjGroup': 'The variable "Subject_Nr_Per_Group" is a counter per subject group in a study. This can be used to do custom between subject randomization and to infer the current number of participants within each subject group.',
    'varGroupName': 'The variable "Group_Name" holds the value of the "subject group name" for each participant. This can be used to infer to which subject group each participant is assigned to.',
    'varSessionTimeStamp': 'The variable "Session_Start_Time" records the start time of the current participant session in UNIX time.',
    'varSessionTimeStampEnd': 'The variable "Session_End_Time" records the end time of the current participant session in UNIX time.',
    'varSessionName': 'The variable "Session_Name" holds the value of the "session name" for the current session. This can be used to infer which session is currently performed by the participant.',
    'varSessionNr': 'The variable "Session_Nr" holds the current value of the "session nr" for the current session. This can be used to infer whether the participant currently performs the first, second, third,(and so on) session.',
    'varBlockName': 'The variable "Block_Name" holds the current value of the "block name" for the current session. This can be used to infer which block is currently performed by the participant.',
    'varBlockNr': 'The variable "Bock_Nr" holds the current value of the "block nr" for the current session. This can be used to infer whether the participant currently performs the first, second, third,(and so on) block in this session.',
    'varTaskName': 'The variable "Task_Name" holds the current value of the "task name" for the current block. This can be used to infer which task is currently performed by the participant.',
    'varTaskNr': 'The variable "Task_Nr" holds the current value of the "task nr" for the current block. This can be used to infer whether the participant currently performs the first, second, third,(and so on) task in this block.',
    'varTrialId': 'The variable "Trial_Id" holds the current value of the "trial id" for the current task. This can be used to infer which Trial is currently performed by the participant.',
    'varTrialNr': 'The variable "Trial_Nr" holds the current value of the "trial nr" for the current task. This can be used to infer whether the participant currently performs the first, second, third,(and so on) trial in this task.',
    'varRoleId': 'The variable "Role_ID" is used for multi user/multi participant studies to refer uniquely to one of the participants of the study. This can be used to present different frames and roles to different participants within the same task/experiment.',
    'varConditionId': 'The variable "Condition_Id" holds the current value of the "condition id" for the current trial. This can be used to infer which condition is currently performed by the participant.',
    'varBrowserSpec': 'The variable "Browser_Spec" holds the value of the browser used by the participant to perform the experiment. This can be used to later analyze possible differences between browsers. Allowing/forbidding certain browsers can be done via the study settings.',
    'varSystemSpec': 'The variable "System_Spec" holds the value of the operating system/device used by the participant to perform the experiment. This can be used to later analyze possible differences between operating systems/devices. Allowing/forbidding certain operating systems/devices can be done via the study settings.',
    'varAgentSpec': 'The variable "Agent_Spec" holds the complete String of the "User-Agent-Browser-Specification". This can be used to get some more detailed information about the participants system specifications.',
    'varTimeMeasureSpecMean': 'The variable "TimeMeasure_Mean" provides an estimate of the mean value of how precise callback functions work on the participants device. Hence this is a measure of how precise stimuli are be presented temporally, but not a measure of reaction time reliability (which is usually better).',
    'varTimeMeasureSpecStd': 'The variable "TimeMeasure_Std" provides an estimate of the standard deviation of how precise callback functions work on the participants device. Hence this is a measure of how variable stimuli presentation is temporally.',
    'varFullscreenSpec': 'The variable "Always_Fullscreen", is a boolean value, which is true as long as the participant keeps the experiment running in fullscreen mode. This can be used to pause/quit the experiment when a participant leaves the fullscreen mode.',
    'varBrowserVersionSpec': 'The variable "BrowserVersion_Spec" holds the value of the browser version used by the participant to perform the experiment. This can be used to later analyze possible differences between browser versions.',
    'varCrowdsourcingCode': 'The variable "Crowdsourcing_Code" holds the value of the unique "crowdsourcing code", typically shown to the subject at end of the experiment to complete the crowdsourcing session and claim the payment.',
    'varCrowdsourcingSubjId': 'The variable "Crowdsourcing_SubjId" holds the value of the unique "identification code" for each crowdsourcing participant. This can be used to later on create a reference between crowdsourcing data on Labvanced and the external crowdsourcing service (e.g Mechanical Turk).',
    'varDisplayedLanguage': 'The variable "Displayed Language" holds the value of the selected display language, only if there were 2 or more languages to select from. This value can be used to show different content, i.e. texts for different language settings.',
    'varPixelDensityPerMM': 'This variable hold the number of pixels per millimeter of the screen.',
    'varDisplayWidthX': 'This variable holds the number of pixels in the X-dimension of the experiment window in pixels.',
    'varDisplayWidthY': 'This variable holds the number of pixels in the Y-dimension of the experiment window in pixels.',
    'varScreenTotalWidthX': 'This variable holds the number of pixels in the X-dimension of the computer screen in pixels.',
    'varScreenTotalWidthY': 'This variable holds the number of pixels in the Y-dimension of the computer screen in pixels.',
    'varMultiUserGroupId': 'This variable holds a unique group ID for multi user studies.',



    // {'varTimeMeasureSpecMax':''},
};


ExpData.prototype.staticTranslations = {
    English: {
        start: {
            library: "Library",
            langSelect: "This study is available in multiple languages.",
            studyLanguage: "Study Language:",
            continue: "Continue",
            submit: "Submit",
            refresh: "Refresh",
            initialSurvey: "Please fill out the fields below (required fields are marked with *):",
            yourGender: "Gender",
            yourGenderMale: "Male",
            yourGenderFemale: "Female",
            yourAge: "Your Age",
            years: "years",
            yourCountry: "Country/Location",
            yourFirstLang: "First Language",
            yourEmail: "Email",
            missing: "missing",
            askEmailConsent1: "Why do we ask for your Email: ",
            askEmailConsent2: "This is a longitudinal study, consisting of several participation sessions. Your email will only be recoded in order to invite/remind you to take part in the next session. Your Email will not be stored together with other kinds of data, and is accessible only internally to the Labvanced platform. We will not give away " +
                "your email or use it for different purposes.",
            yourCrowdsourcingID: "Your worker / crowdsourcing ID (*):",
            loading2: "Loading, please wait",
            loading3: "This might take a while.",
            loadingComplete: "Loading Complete!",
            canStart: "You can now start the experiment. This will switch your browser into fullscreen mode.",
            keepFullscreen: "Please note that during the experiment you should not press escape or use the \"backward\" button in your browser.",
            startButton: "Start",
            startingExp: "Starting Experiment...",
            startingIn: "Starting in ",
            participationAgreement1: " I agree that all the personal data, which I provide here and all my responses will be recorded, and can be used for research purposes in a pseudonymised way. I also agree to the",
            participationAgreement2: "of the Scicovery GmbH for recording, storing, and handling, participant data.",
            customRequirement: "Hereby I confirm that I accept the terms and conditions of this study and fulfill the following participation requirements as stated below:",
            requestPermissionHeader: "Device permissions required",
            requestPermissionBody: "This experiment requires access to your webcam or microphone. In the following screen, please allow access to your webcam or microphone device to continue.",
        },
        errors: {
            errorSessionNotReady: "You can currently not take part in this experiment because this study can only be started at certain times.",
            errorSessionStartIn: "You can start this session in",
            errorSessionOver: "You can currently not take part in this experiment because there is no starting time window defined for this study.",
            playerErrorNoSubjGroup: "Error: there is no subject group defined in the experiment.",
            playerErrorNoSession: "Error: there is no session defined in the subject group in the experiment.",
            playerErrorNoBlock: "Error: there is no block defined in this experiment session.",
        },
        multiUser: {
            multiUserExpLobby: "Multiple Participant Experiment",
            participantsInLobby: "Participants in lobby:",
            readyToStart: "Ready to start?",
            waitingForOtherParticipants: "Waiting for more participants...",
            experimentStartsShortly: "Your experiment will start shortly...",
            successfullyMatched_1: "Successfully matched. Press ",
            successfullyMatched_2: " to proceed to experiment!",
            continueJointExpLobby: "continue",
            jointExpTestConnection: "Testing your internet connection. please wait for 30 seconds...",
            inviteFriendMultiUser1: "Need another player? Invite a friend!",
            inviteFriendMultiUser2: "Your Name:",
            inviteFriendMultiUser3: "Your Friends' Email:",
            inviteFriendMultiUser4: "Invite",
        },
        screenCalibration: {
            confirm: "Confirm",
            calibrateIntro: "Distance and screen size are needed for the calibration:",
            calibrateMethod1: "Specify your screen size manually if you know the size of your monitor.",
            calibrateScreenSize: "Screen size (diagonal):",
            calibrateInches: "inches",
            calibrateMethod2: "Use a standardized ID card (85.60 × 53.98 mm) or any other card of the same size against the screen and try to match the size of the displayed card. " +
                "You can change the size of the image by dragging the arrow. The calibration is correct if the image exactly matches the size of the card.",
            calibDistance1: "Your distance to the screen (in cm) is: ",
            calibDistance2: "centimeter",
        },
        content: {
            chooseSelection: "Please Choose...",
            answerPlaceholder: "Participant Answer...",
        },
        end: {
            endExpMsg: "Thank you! The experiment session is finished.",
            goToLib: "Go to experiment library",
            endExpMsgTest: "The test recording of this task is over. To test the whole experiment or to record data, start the study under 'Run' in the navigation panel.",
            moreExperiments: "Take part in more behavioral experiments:",
            registerAndBuild: "OR register and build your own study for free:",
        },
        eyetracking: {
            previousCalib1: "Use Previous Calibration Data",
            previousCalib2: "Rerun Calibration",
            calibLoading: "loading calibration... please wait...",
            headPoseBlueMesh: "<p>Please position your head such that the blue mesh is aligned with the green target mesh:</p>",
            feedbackHeadpose1: "Please make sure that your face is visible in your webcam.",
            feedbackHeadpose2: "Please move closer to cam.",
            feedbackHeadpose3: "Please face the webcam and place the webcam near the monitor.",
            feedbackHeadpose4: "Please make sure that your head is oriented upright.",
            feedbackHeadpose5: "Please move further to the left.",
            feedbackHeadpose6: "Please move further to the right.",
            feedbackHeadpose7: "Please move further down.",
            feedbackHeadpose8: "Please move further up.",
            feedbackHeadpose9: "Please shift your head up.",
            feedbackHeadpose10: "Please shift your head down.",
            feedbackHeadpose11: "Please shift your head right.",
            feedbackHeadpose12: "Please shift your head left.",
            feedbackHeadpose13: "Please tilt your head down.",
            feedbackHeadpose14: "Please tilt your head up.",
            feedbackHeadpose15: "Please turn your head left.",
            feedbackHeadpose16: "Please turn your head right.",
            feedbackHeadpose17: "Please move closer to cam.",
            feedbackHeadpose18: "Please move away from cam.",
            countdown1: "Great! Now, please keep this head pose... Start in ",
            poseError: "<p>You lost the head pose. Please realign your head pose to the green mesh:</p>",
            screenResolutionError: "Screen resolution was changed. Please restart the calibration.",
            instructionsExistingCalibDataFoundAdult: "<h3>Eye-Tracking Calibration</h3>" +
                "<p>We found previous calibration data in your browser cache. You can skip calibration if:" +
                "<ul>" +
                "<li>you are the same person that calibrated in the previous session.</li>" +
                "<li>the environment and lighting conditions did not change.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>Calibration of eye tracker</h3>" +
                "<p><b>Please read carefully</b></p>" +
                "<p>To use your webcam for eye tracking, it needs to " +
                "be calibrated for your specific environment. This will take about 3-4 minutes. " +
                "Before starting the calibration, please make sure that:</p>" +
                "<ul>" +
                "<li>You are in a quiet room.</li>" +
                "<li>You have enough time.</li>" +
                "<li>You do not wear glasses.</li>" +
                "<li>Your webcam is as near as possible to the center of your screen (if it is not integrated in your monitor anyway).</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>Step 1: Setup illumination</h3>" +
                "<p>Please make sure that:</p>" +
                "<li>There is no bright light source (window, lamp) behind you visible in the image.</li>" +
                "<li>Your face and eyes should be well illuminated from the front.</li>" +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>Step 2: Set Center Pose</h3>" +
                "<p><b>Please read carefully</b></p>" +
                "<p>The eye tracker will be calibrated for a specific pose (position and orientation) of your head in front of the camera. " +
                "In the next step, you will define this 'center' pose. " +
                "Please make sure that:</p>" +
                "<ul>" +
                "<li>This head pose is comfortable for you to keep for a long duration.</li>" +
                "<li>Please pay attention, that also the tilt and yaw orientation of your head is comfortable.</li>" +
                "<li>Please adjust your screen and webcam on the following screen, so that your webcam can easily detect your eye movements when you look at the screen. </li>" +
                "</ul>",
            instructionsPositioningAdult: "<h3>Step 2: Set Center Pose</h3>" +
                "<ul>" +
                "<li>Make sure that you are facing the screen in a comfortable pose.</li>" +
                "<li>Be close enough to the camera such that your face and eyes are well detected and visible.</li>" +
                "<li>This is the last time to adjust the camera and screen position.</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>Step 2: Set Center Pose</h3>" +
                "<p>Do you want to use this pose (green mesh) or go back?</p>" +
                "<ul>" +
                "<li>Is the pose facing the screen and comfortable for you?</li>" +
                "<li>Is the pose close enough to the camera such that your eyes are well detected?</li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>Step 3: Calibration</h3>" +
                "<p><b>Please read carefully</b></p>" +
                "<p>Now the real calibration will start. Please, DO NOT move the webcam or screen anymore, because doing so results in a failed calibration.</p>" +
                "<ul>" +
                "<li>Each calibration step has 2 parts: " +
                "<ul>" +
                "<li>Position your head in a specified pose (position and orientation).</li>" +
                "<li>Keep that pose and fixate on the points that are shown on the screen.</li>" +
                "</ul></li>" +
                "<li>To position your head correctly on each step, the best option is to try to overlap the face meshes, blue (current postion) and green (target position).</li>" +
                "<li>If your head pose is not recocknized at any time, relax, sit straight again, and follow the instructions.</li>" +
                "<li>After the calibration is done DO NOT move away from the screen and avoid strong head movements.</li>" +
                "</ul>",

            instructionsExistingCalibDataFoundInfant: "<h3>Eye-Tracking Calibration</h3>" +
                "<p>We found previous calibration data in your browser cache. You can skip calibration if:" +
                "<ul>" +
                "<li>you are the same person that calibrated in the previous session.</li>" +
                "<li>the environment and lighting conditions did not change.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Calibration of eye tracker</h3>" +
                "<p><b>Instruction for parents: Please read carefully</b></p>" +
                "<p>To use your webcam for eye tracking, it needs to " +
                "be calibrated for your specific environment. This will take about 1-2 minutes. " +
                "Before starting, please make sure that:</p>" +
                "<ul>" +
                "<li>Your child sits comfortably on your lap.</li>" +
                "<li>There is no bright light source (window, lamp) behind you visible in the image.</li>" +
                "<li>Your child does not wear glasses.</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Step 1: Set Center Pose</h3>" +
                "<p><b>Instruction for parents: The eye tracker will be calibrated for a specific head pose. " +
                "Please make sure that:</b></p>" +
                "<ul>" +
                "<li>Your child's face is visible in the video and detected with a blue mesh, while looking at the screen (not yours).</li>" +
                "<li>The position / head pose is comfortable for you and your child to keep for the rest of the study without much movement.</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>Step 2: Set Center Pose</h3>" +
                "<p><b>Instruction for parents: Please read carefully</b></p>" +
                "<p>Do you want to use this pose (green mesh) or go back?</p>" +
                "<ul>" +
                "<li>Is the pose facing the screen and comfortable for your child?</li>" +
                "<li>Is the pose roughly centered horizontally and the face well visible?</li>" +
                "<li>If not to back and re-define the center pose.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Step 3: Calibration</h3>" +
                "<p><b>Instruction for parents: Please read carefully</b></p>" +
                "<ul>" +
                "<li>Now the calibration will start. Please, DO NOT move the webcam or screen anymore, otherwise calibration will fail.</li>" +
                "<li>We will present animals at different positions on the screen and record your child's gaze when looking at these animals.</li>" +
                "<li>For the calibration to work, your child will need to look at these animals, and sit in a stable position on your lab without strong head movements during and after the calibration.</li>" +
                "</ul>",
            countdownMessage1: "keep fixating the red circle",
            countdownMessage2: "Keep fixating the animal",
            loadingCalib: "Please wait for calibration to complete:<br>",
            moveForward: "continue",
            moveBackward: "back"
        }
    },
    German: {
        start: {
            library: "Experimente",
            langSelect: "Diese Studie ist in mehreren Sprachen verfügbar.",
            studyLanguage: "Studiensprache:",
            continue: "Weiter",
            submit: "Ok",
            refresh: "Aktualisieren",
            initialSurvey: "Bitte füllen Sie die untenstehenden Felder aus (Pflichtfelder sind mit * gekennzeichnet):",
            yourGender: "Geschlecht",
            yourGenderMale: "Männlich",
            yourGenderFemale: "Weiblich",
            yourAge: "Dein Alter",
            years: "Jahre",
            yourCountry: "Land / Aufenthaltsort",
            yourFirstLang: "Muttersprache",
            yourEmail: "Email",
            missing: "fehlt",
            askEmailConsent1: "Warum fragen wir nach Ihrer E-Mail: ",
            askEmailConsent2: "Dies ist eine Längsschnittstudie, die aus mehreren Teilnahme-Sitzungen besteht. Ihre E-Mail wird nur neu erfasst, um Sie zur Teilnahme an der nächsten Sitzung einzuladen. Ihre E-Mail wird nicht zusammen mit anderen Arten von Daten gespeichert und ist nur intern für die Labvanced-Plattform zugänglich. Wir geben Ihre E-Mail nicht weiter oder verwenden sie für andere Zwecke.",
            yourCrowdsourcingID: "Ihre Worker / Crowdsourcing Id (*):",
            loading2: "Lade, bitte warten",
            loading3: "Dies kann eine Weile dauern.",
            loadingComplete: "Fertig geladen!",
            canStart: "Sie können nun das Experiment starten. Dies schaltet Ihren Browser in den Vollbildmodus um.",
            keepFullscreen: "Bitte beachten Sie, dass Sie während des Experiments nicht die Escape-Taste drücken oder die Schaltfläche \"Zurück\" in Ihrem Browser verwenden sollten.",
            startButton: "Start",
            startingExp: "Experiment wird gestartet...",
            startingIn: "Start in ",
            participationAgreement1: "Ich stimme zu, dass alle persönlichen Daten, die ich hier zur Verfügung stelle, und alle meine Antworten aufgezeichnet werden und zu Forschungszwecken pseudonymisiert verwendet werden dürfen. Zudem stimme ich den",
            participationAgreement2: "der Scicovery GmbH bzgl Datenaufnahme, Datenspeicherung, und Datenverwaltung von Teilnehmerdaten zu.",
            customRequirement: "Ich bestätige hiermit, dass ich mit den folgenden Regeln und Bedingungen der Studie einverstanden bin und folgende Teilnahmebedingungen vollständig erfülle:",
            requestPermissionHeader: "Geräteberechtigungen erforderlich",
            requestPermissionBody: "Die Teilnahme an diesem Experiment benötigt Zugriff auf Ihre Webcam oder Ihr Microphone. Um fortzufahren, erlauben Sie bitte auf dem folgenden Bildschirm den Zugriff auf Ihre Webcam oder Ihr Mikrofon.",
        },
        errors: {
            errorSessionNotReady: "Sie können derzeit nicht an diesem Experiment teilnehmen, da diese Studie nur zu bestimmten Zeiten gestartet werden kann.",
            errorSessionStartIn: "Sie können diese Sitzung starten in",
            errorSessionOver: "Sie können derzeit nicht an diesem Experiment teilnehmen, da für diese Studie kein Startzeitfenster definiert ist.",
            playerErrorNoSubjGroup: "Fehler: Im Experiment ist keine Versuchspersonengruppe definiert.",
            playerErrorNoSession: "Fehler: in der Versuchspersonengruppe ist keine Experimentssitzung definiert.",
            playerErrorNoBlock: "Fehler: In dieser Experimentssitzung ist kein Versuchsblock definiert.",
        },
        multiUser: {
            multiUserExpLobby: "Experiment mit mehreren Teilnehmern",
            participantsInLobby: "Teilnehmer in der Lobby:",
            readyToStart: "Bereit zum Start?",
            waitingForOtherParticipants: "Warte auf weitere Teilnehmer...",
            experimentStartsShortly: "Das Experiment startet in Kürze...",
            successfullyMatched_1: "Sie wurden erfolgreich einem Experiment zugeteilt. Drücken Sie",
            successfullyMatched_2: "um zu dem Experiment zu gelangen!",
            continueJointExpLobby: "Weiter,",
            jointExpTestConnection: "Ihre Internet-Verbindung wird getestet. Bitte warten Sie ca. 30 Sekunden...",
            inviteFriendMultiUser1: "Brauchen Sie einen Mitspieler? Landen Sie doch einen Freund ein!",
            inviteFriendMultiUser2: "Ihr Name:",
            inviteFriendMultiUser3: "Die Email Adresse Ihres Freundes:",
            inviteFriendMultiUser4: "Einladen",
        },
        screenCalibration: {
            confirm: "Bestätigen",
            calibrateIntro: "Sitzabstand und Bildschirmgröße sind notwendig für die Kalibrierung:",
            calibrateMethod1: "Geben Sie Ihre Bildschirmgröße manuell an, wenn Sie die Größe Ihres Monitors kennen.",
            calibrateScreenSize: "Bildschirmgröße (Diagonal):",
            calibrateInches: "Inch",
            calibrateMethod2: "Halten Sie einen standardisierten Ausweis (85.60 × 53.98 mm) oder eine andere Karte der gleichen Größe gegen den Bildschirm und versuchen Sie, die Größe der angezeigten Karte anzupassen. " +
                "Sie können die Größe des Bildes durch Ziehen des Pfeils ändern. Die Kalibrierung ist korrekt, wenn das Bild genau der Größe der Karte entspricht.",
            calibDistance1: "Ihre Distanz zum Bildschirm beträgt:",
            calibDistance2: "Centimeter",
        },
        content: {
            chooseSelection: "Bitte Auswählen...",
            answerPlaceholder: "Teilnehmer Antwort",
        },
        end: {
            endExpMsg: "Vielen Dank! Die Experimentssitzung ist beendet.",
            goToLib: "Gehe zur Experiment-Bibliothek",
            endExpMsgTest: "Die Test-Aufnahme dieses Taks ist beendet. Um das ganze Experiment zu testen, oder um Daten aufzunehmen, starten Sie die Studie unter 'Run' in der Navigationsleite.",
            moreExperiments: "Nehmen Sie an weiteren spannenden Online Verhaltensstudien teil:",
            registerAndBuild: "Oder registrieren Sie sich und erstellen komplett gratis Ihre eigene Studie:",
        },
        eyetracking: {
            previousCalib1: "Vorherige Kalibrierdaten verwenden",
            previousCalib2: "Kalibrierung erneut durchführen",
            calibLoading: "Kalibrierung laden... bitte warten...",
            headPoseBlueMesh: "<p>Bitte positionieren Sie Ihren Kopf so, dass das blaue Netz auf das grüne Zielnetz ausgerichtet ist:</p>",
            feedbackHeadpose1: "Bitte stellen Sie sicher, dass Ihr Gesicht in Ihrer Webcam sichtbar ist",
            feedbackHeadpose2: "Bitte gehen Sie näher an die Kamera heran.",
            feedbackHeadpose3: "Bitte schauen Sie mit dem Gesicht zur Webcam und platzieren Sie die Webcam in der Nähe des Monitors.",
            feedbackHeadpose4: "Bitte stellen Sie sicher, dass Ihr Kopf aufrecht ausgerichtet ist.",
            feedbackHeadpose5: "Bitte bewegen Sie sich weiter nach links.",
            feedbackHeadpose6: "Bitte bewegen Sie sich weiter nach rechts.",
            feedbackHeadpose7: "Bitte gehen Sie weiter nach unten.",
            feedbackHeadpose8: "Bitte gehen Sie weiter nach oben.",
            feedbackHeadpose9: "Bitte bewegen Sie Ihren Kopf nach oben.",
            feedbackHeadpose10: "Bitte bewegen Sie Ihren Kopf nach unten.",
            feedbackHeadpose11: "Bitte bewegen Sie Ihren Kopf nach rechts.",
            feedbackHeadpose12: "Bitte bewegen Sie Ihren Kopf nach links.",
            feedbackHeadpose13: "Bitte neigen Sie Ihren Kopf nach unten.",
            feedbackHeadpose14: "Bitte neigen Sie Ihren Kopf nach oben.",
            feedbackHeadpose15: "Bitte drehen Sie Ihren Kopf nach links.",
            feedbackHeadpose16: "Bitte drehen Sie Ihren Kopf nach rechts.",
            feedbackHeadpose17: "Bitte gehen Sie näher zur Kamera.",
            feedbackHeadpose18: "Bitte gehen Sie von der Kamera weg.",
            countdown1: "Gut! Behalten Sie jetzt bitte diese Kopfhaltung bei... Beginnen Sie in ",
            poseError: "<p>Sie haben die Kopfhaltung verloren. Bitte richten Sie Ihre Kopfhaltung wieder auf das grüne Netz aus:</p>",
            screenResolutionError: "Die Bildschirmauflösung wurde geändert. Bitte starten Sie die Kalibrierung neu",
            instructionsExistingCalibDataFoundAdult: "<h3>Blickbewegungs-Kalibrierung</h3>" +
                "<p>Wir haben frühere Kalibrierungsdaten in Ihrem Browser-Cache gefunden. Sie können die Kalibrierung überspringen, wenn:" +
                "<ul>" +
                "<li>Sie sind dieselbe Person, die sich in der vorherigen Sitzung kalibriert hat.</li>" +
                "<li>sich die Umwelt- und Lichtbedingungen nicht geändert haben. </li>" +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>Kalibrierung des Eyetrackers</h3>" +
                "<p><b>Bitte sorgfältig lesen</b></p>" +
                "<p>Um Ihre Webcam für die Blickverfolgung zu verwenden, muss sie " +
                "für Ihre spezifische Umgebung kalibriert werden. Dies wird etwa 3-4 Minuten dauern. " +
                "Bevor Sie die Kalibrierung starten, stellen Sie bitte folgendes sicher:</p>" +
                "<ul>" +
                "<li>Sie befinden sich in einem ruhigen Raum. </li>" +
                "<li>Sie haben genug Zeit. </li>" +
                "<li>Sie tragen keine Brille.</li>" +
                "<li>Ihre Webcam befindet sich so nah wie möglich an der Mitte Ihres Bildschirms (falls sie nicht ohnehin in Ihren Monitor integriert ist).</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>Schritt 1: Beleuchtung einrichten</h3>" +
                "<p>Bitte stellen Sie folgendes sicher:</p>" +
                "<li>Es ist keine helle Lichtquelle (Fenster, Lampe) hinter Ihnen im Bild sichtbar.</li>" +
                "<li>Das Gesicht und die Augen sollten von vorne gut ausgeleuchtet sein.</li>" +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>Schritt 2: Mittelposition setzen</h3>" +
                "<p><b>Bitte sorgfältig lesen</b></p>" +
                "<p>Der Eyetracker wird für eine bestimmte Pose (Position und Ausrichtung) Ihres Kopfes vor der Kamera kalibriert. " +
                "Im nächsten Schritt werden Sie diese 'Center'-Pose definieren. " +
                "Bittes stellen Sie folgendes sicher: </p>" +
                "<ul>" +
                "<li>Diese Kopfhaltung ist bequem für Sie, um sie lange beizubehalten.</li>" +
                "<li>Bitte achten Sie darauf, dass auch die Neigung- und Orientierung Ihres Kopfes angenehm ist.</li>" +
                "<li>Bitte stellen Sie Ihren Bildschirm und Ihre Webcam auf dem folgenden Bildschirm so ein, dass Ihre Webcam Ihre Augenbewegungen leicht erkennen kann, wenn Sie auf den Bildschirm blicken. </li>" +
                "</ul>",
            instructionsPositioningAdult: "<h3>Schritt 2: Mittelposition setzen</h3>" +
                "<ul>" +
                "<li>Vergewissern Sie sich, dass Sie in einer bequemen Pose auf den Bildschirm schauen.</li>" +
                "<li>Seien Sie nahe genug an der Kamera, so dass Ihr Gesicht und Ihre Augen gut erkannt werden und sichtbar sind.</li>" +
                "<li>Dies ist das letzte Mal, dass die Kamera- und Bildschirmposition eingestellt wird.</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>Schritt 2: Mittelposition setzen</h3>" +
                "<p>Wollen Sie diese Pose (grünes Netz) verwenden oder zurückgehen?</p>" +
                "<ul>" +
                "<li>Ist die Pose dem Bildschirm zugewandt und für Sie bequem?</li>" +
                "<li>Ist die Pose nahe genug an der Kamera, so dass Ihre Augen gut erkannt werden?</li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>Schritt 3: Kalibrierung</h3>" +
                "<p><b>Bitte sorgfältig lesen</b></p>" +
                "<p>Jetzt beginnt die eigentliche Kalibrierung. Bitte bewegen Sie die Webcam oder den Bildschirm NICHT mehr, da dies zu einer fehlgeschlagenen Kalibrierung führt.</p>" +
                "<ul>" +
                "<li>Jeder Kalibrierungsschritt besteht aus 2 Teilen: " +
                "<ul>" +
                "<li>Positionieren Sie Ihren Kopf in einer bestimmten Pose (Position und Ausrichtung).</li>" +
                "<li>Behalten Sie diese Pose bei und fixieren Sie auf die Punkte, die auf dem Bildschirm angezeigt werden.</li>" +
                "</ul></li>" +
                "<li>Um Ihren Kopf immer richtig zu positionieren, ist es am besten, wenn Sie versuchen, die Gesichtsmasken, blau (aktuelle Position) und grün (Zielposition), zu überlappen.</li>" +
                "<li>Wenn Ihre Kopfhaltung zu irgendeinem Zeitpunkt nicht erkannt wird, entspannen Sie sich, setzen Sie sich wieder gerade hin und folgen Sie den Anweisungen.</li>" +
                "<li>Nach erfolgter Kalibrierung bewegen Sie sich NICHT vom Bildschirm weg und vermeiden Sie starke Kopfbewegungen.</li>" +
                "</ul>",
            instructionsExistingCalibDataFoundInfant: "<h3>Augenverfolgungs-Kalibrierung</h3>" +
                "<p>Wir haben frühere Kalibrierungsdaten in Ihrem Browser-Cache gefunden. Sie können die Kalibrierung überspringen, wenn:" +
                "<ul>" +
                "<li>Sie sind dieselbe Person, die sich in der vorherigen Sitzung kalibriert hat.</li>" +
                "<li>die Umgebungsbedingungen sich nicht nicht verändert haben. </li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Kalibrierung des Eyetrackers</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b></p>" +
                "<p>Um Ihre Webcam für die Blickverfolgung zu verwenden, muss sie " +
                "für Ihre spezifische Umgebung kalibriert werden. Dies wird etwa 1-2 Minuten dauern. " +
                "Bevor Sie beginnen, vergewissern Sie sich bitte, dass:</p>" +
                "<ul>" +
                "<li>Ihr Kind bequem auf ihrem Schoß sitzt.</li>" +
                "<li>Keine helle Lichtquelle (Fenster, Lampe) hinter Ihnen im Bild sichtbar ist.</li>" +
                "<li>Ihr Kind keine Brille trägt.</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Schritt 1: Mittelposition setzen</h3>" +
                "<p><b>Unterweisung für Eltern: Der Eyetracker wird für eine bestimmte Kopfhaltung kalibriert. " +
                "Bitte stellen Sie sicher, dass:</b><</p>" +
                "<ul>" +
                "<li>Das Gesicht Ihres Kindes ist auf dem Video sichtbar ist und von der blauen Maske erkannt wird während es auf den Bildschirm schaut (und nicht Ihr Gesicht).</li>" +
                "<li>Die Position / Kopfhaltung ist für Sie und Ihr Kind bequem und kann für den Rest der Studie ohne viel Bewegung beibehalten werden.</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>Schritt 2: Mittelposition setzen</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b></p>" +
                "<p>Wollen Sie diese Pose (grüne Maske) verwenden oder zurückgehen?</p>" +
                "<ul>" +
                "<li>Ist die Pose dem Bildschirm zugewandt und für Ihr Kind bequem?</li>" +
                "<li>Ist die Pose ungefähr horizontal zentriert und das Gesicht gut sichtbar?</li>" +
                "<li>Falls nicht, bitte zurückgehen und die Mittelposition neu definieren.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Schritt 3: Kalibrierung</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b></p>" +
                "<ul>" +
                "<li>Jetzt beginnt die Kalibrierung. Bitte bewegen Sie die Webcam oder den Bildschirm NICHT mehr, sonst wird die Kalibrierung fehlschlagen.</li>" +
                "<li>Wir präsentieren Tiere an verschiedenen Positionen auf dem Bildschirm und zeichnen den Blick Ihres Kindes auf, wenn es diese Tiere ansieht.</li>" +
                "<li> Damit die Kalibrierung funktioniert, muss Ihr Kind diese Tiere anschauen und in einer stabilen Position auf Ihrem Labor sitzen, ohne starke Kopfbewegungen während und nach der Kalibrierung.</li>" +
                "</ul>",
            countdownMessage1: "Fixieren Sie den roten Kreis",
            countdownMeldung2: "Fixieren Sie das Tier Bild",
            LadenCalib: "Bitte warten Sie, bis die Kalibrierung abgeschlossen ist:<br>",
            moveForward: "weiter",
            moveBackward: "zurück",
        }
    },
    Spanish: {
        start: {
            library: "Biblioteca",
            langSelect: "Este estudio está disponible en varios idiomas.",
            studyLanguage: "Idioma del estudio:",
            continue: "Seguir",
            submit: "Enviar",
            refresh: "Actualizar",
            initialSurvey: "Por favor, rellene los siguientes campos (los campos obligatorios están marcados con un *): ",
            yourGender: "Género",
            yourGenderMale: "Masculino",
            yourGenderFemale: "Femenino",
            yourAge: "Tu Edad",
            years: "años",
            yourCountry: "País / Ubicación",
            yourFirstLang: "Primer Idioma",
            yourEmail: "Correo Electrónico",
            missing: "esta perdido",
            askEmailConsent1: "Por qué solicitamos su correo electrónico: ",
            askEmailConsent2: "Este es un estudio longitudinal, que consta de varias sesiones.Su correo electrónico solo será recodificado para invitarle / recordarle que participe en la próxima sesión.Su correo electrónico no se almacenará junto con otro tipo de datos, y solo es accesible internamente a la plataforma Labvanced.No se lo revelaremos a nadie" +
                "su correo electrónico o úselo para diferentes propósitos.",
            yourCrowdsourcingID: "Su identificación de trabajador / crowdsourcing(*): ",
            loading2: "Cargando, por favor espere",
            loading3: "Esto aún puede tardar.",
            loadingComplete: "Carga completada!",
            canStart: "Ahora puede comenzar el experimento. Esto cambiará su navegador al modo de pantalla completa.",
            keepFullscreen: "Tenga en cuenta que durante el experimento nunca debe presionar escape o usar el botón \"hacia atrás\" en su navegador.",
            startButton: "Comience",
            startingExp: "Iniciando el experimento...",
            startingIn: "Comenzando en ",
            participationAgreement1: " Acepto que todos los datos personales que proporciono aquí y todas mis respuestas se registrarán y se podrán utilizar para fines de investigación de forma seudónima. También estoy de acuerdo con el",
            participationAgreement2: "de Scicovery GmbH para el registro, almacenamiento y manejo de los datos de los participantes.",
            customRequirement: "Por la presente confirmo que acepto los términos y condiciones de este estudio y cumplo con los siguientes requisitos de participación como se indica a continuación: ",
            requestPermissionHeader: "Requiere permiso del dispositivo",
            requestPermissionBody: "Este experimento requiere el acceso a su cámara web o micrófono. En la siguiente pantalla, permite el acceso a tu cámara web o al micrófono para continuar.",
        },
        errors: {
            errorSessionNotReady: "Actualmente no puede participar en este experimento porque este estudio solo puede iniciarse en un horario concreto",
            errorSessionStartIn: "Puedes comenzar esta sesión en",
            errorSessionOver: "Actualmente no puede participar en este experimento porque aun no se ha definido la hora de inicio del estudio.",
            playerErrorNoSubjGroup: "Error: no hay un grupo de sujetos definido en el experimento.",
            playerErrorNoSession: "Error: no hay una sesión definida en el grupo de sujetos en el experimento.",
            playerErrorNoBlock: "Error: no hay un bloque definido en esta sesión de experimento.",
        },
        multiUser: {
            multiUserExpLobby: "Experimento de participantes múltiples",
            participantsInLobby: "Participantes en el lobby:",
            readyToStart: "¿Listo para comenzar?",
            waitingForOtherParticipants: "Esperando a más participantes...",
            experimentStartsShortly: "Su experimento comenzará en breve....",
            successfullyMatched_1: "Emparejado correctamente. Continúe",
            successfullyMatched_2: " para continuar con el experimento!",
            continueJointExpLobby: "Continuar",
            jointExpTestConnection: "Compruebe su conexión a internet. Por favor, espere 30 segundos...",
            inviteFriendMultiUser1: "¿Necesitas otro jugador? Invite a un amigo!",
            inviteFriendMultiUser2: "Su nombre:",
            inviteFriendMultiUser3: "El correo electrónico de sus amigos:",
            inviteFriendMultiUser4: "Invite",
        },
        screenCalibration: {
            confirm: "Confirmar",
            calibrateIntro: "La distancia y el tamaño de la pantalla son necesarios para la calibración: ",
            calibrateMethod1: "Especifique el tamaño de su pantalla manualmente si conoce el tamaño de su monitor.",
            calibrateScreenSize: "Tamaño de pantalla (diagonal):",
            calibrateInches: "pulgadas",
            calibrateMethod2: "Utilice una tarjeta de identificación estandarizada(85.60 × 53.98 mm) o cualquier otra tarjeta del mismo tamaño contra la pantalla e intente hacerla coincidir con el tamaño de la tarjeta que se muestra. " +
                "Puede cambiar el tamaño de la imagen arrastrando la flecha.La calibración será correcta si la imagen coincide exactamente con el tamaño de la tarjeta.",
            calibDistance1: "Su distancia a la pantalla (en cm) es: ",
            calibDistance2: "centímetro",
        },
        content: {
            chooseSelection: "Por favor elija...",
            answerPlaceholder: "Respuesta del participante...",
        },
        end: {
            endExpMsg: "¡Gracias! La sesión experimental ha finalizado.",
            goToLib: "Ir a la biblioteca de experimentos",
            endExpMsgTest: "La grabación de prueba de esta tarea ha terminado.Para probar todo el experimento o registrar datos, comience el estudio en 'Ejecutar' en el panel de navegación.",
            moreExperiments: "Participe en más experimentos comportamentales:",
            registerAndBuild: "O regístrese y cree su propio estudio gratis: ",
        },
        eyetracking: {
            previousCalib1: "Usar los datos de calibración anteriores",
            previousCalib2: "Reejecutar la calibración",
            calibLoading: "Calibración de carga... por favor espere...",
            headPoseBlueMesh: "<p>Por favor posicione su cabeza de tal manera que la malla azul esté alineada con la malla verde del objetivo:</p>",
            feedbackHeadpose1: "Por favor, asegúrese de que su cara sea visible en su cámara web",
            feedbackHeadpose2: "Por favor, acérquese a la cámara",
            feedbackHeadpose3: "Por favor, mire hacia la cámara web y coloque la cámara web cerca del monitor",
            feedbackHeadpose4: "Por favor, asegúrese de que su cabeza está orientada hacia arriba",
            feedbackHeadpose5: "Por favor, muévase más a la izquierda",
            feedbackHeadpose6: "Por favor, muévase más a la derecha",
            feedbackHeadpose7: "Por favor, muévase más hacia abajo",
            feedbackHeadpose8: "Por favor, muévase más arriba",
            feedbackHeadpose9: "Por favor, mueve la cabeza hacia arriba",
            feedbackHeadpose10: "Por favor, mueva su cabeza hacia abajo",
            feedbackHeadpose11: "Por favor, mueve la cabeza hacia la derecha",
            feedbackHeadpose12: "Por favor, mueve la cabeza hacia la izquierda",
            feedbackHeadpose13: "Por favor, incline la cabeza hacia abajo",
            feedbackHeadpose14: "Por favor, incline su cabeza hacia arriba",
            feedbackHeadpose15: "Por favor, gire la cabeza hacia la izquierda",
            feedbackHeadpose16: "Por favor, gire la cabeza hacia la derecha",
            feedbackHeadpose17: "Por favor, acérquese a la cámara",
            feedbackHeadpose18: "Por favor, aléjese de la cámara",
            countdown1: "¡Genial! Ahora, por favor mantén esta pose de cabeza... Empieza en ",
            poseError: "<p>Perdió la pose de la cabeza. Por favor, realinee su pose de cabeza a la malla verde:</p>",
            screenResolutionError: "La resolución de la pantalla fue cambiada. Por favor, reinicie la calibración",
            instructionsExistingCalibDataFoundAdult: "<h3> Calibración de seguimiento de ojos</h3>" +
                "<p>Encontramos datos de calibración anteriores en la caché de su navegador. Puedes saltarte la calibración si:" +
                "<ul>" +
                "<li>usted es la misma persona que calibró en la sesión anterior.</li>" +
                "El ambiente y las condiciones de iluminación no cambiaron." +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>Calibración del rastreador ocular</h3>" +
                "<p><b>Por favor, lea cuidadosamente</b></p>" +
                "<p>Para usar su cámara web para el seguimiento de los ojos, necesita " +
                "...estar calibrado para su entorno específico. Esto llevará unos 3 o 4 minutos. " +
                "Antes de comenzar la calibración, por favor asegúrese de que:</p>" +
                "<ul>" +
                "<li>Estás en una habitación tranquila.</li>" +
                "<li>Tienes suficiente tiempo.</li>" +
                "<li>No usas gafas.</li>" +
                "<li>Su cámara web está lo más cerca posible del centro de su pantalla (si no está integrada en su monitor de todos modos).</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>Paso 1: Configurar la iluminación</h3>" +
                "<p>Por favor, asegúrese de que:</p>" +
                "No hay ninguna fuente de luz brillante (ventana, lámpara) detrás de ti visible en la imagen." +
                "Su cara y sus ojos deben estar bien iluminados desde el frente." +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>Paso 2: Establecer la posición central</h3>" +
                "<p><b>Por favor, lea cuidadosamente</b></p>" +
                "<p>El rastreador de ojos se calibrará para una posición específica (posición y orientación) de su cabeza frente a la cámara. " +
                "En el siguiente paso, definirás esta pose 'central'. " +
                "Por favor, asegúrese de que:</p>" +
                "<ul>" +
                "Esta postura de la cabeza es cómoda para que la mantengas durante mucho tiempo." +
                "Por favor, preste atención, que también la inclinación y orientación de su cabeza es cómoda." +
                "<li>Por favor, ajuste su pantalla y su webcam en la siguiente pantalla, para que su webcam pueda detectar fácilmente los movimientos de sus ojos al mirar la pantalla. </li> </ul>",
            instructionsPositioningAdult: "<h3>Paso 2: Establecer la posición central</h3>" +
                "<ul>" +
                "<li>Asegúrese de que está frente a la pantalla en una posición cómoda.</li>" +
                "<li>Estén lo suficientemente cerca de la cámara para que su cara y sus ojos sean bien detectados y visibles.</li>" +
                "<li>Esta es la última vez que se ajusta la posición de la cámara y la pantalla.</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>Paso 2: Establecer la posición central</h3>" +
                "<p>¿Quieres usar esta pose (malla verde) o volver? </p>" +
                "<ul>" +
                "<li>¿Es la pose de cara a la pantalla y cómoda para ti?</li>" +
                "<li>¿Está la pose lo suficientemente cerca de la cámara como para que sus ojos sean bien detectados?</li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>Paso 3: Calibración</h3>" +
                "<p><b>Por favor, lea cuidadosamente</b></p>" +
                "<p>Ahora comenzará la verdadera calibración. Por favor, no mueva más la webcam o la pantalla, porque al hacerlo se producirá un fallo en la calibración.</p>" +
                "<ul>" +
                "<li>Cada paso de calibración tiene 2 partes: " +
                "<ul>" +
                "<li>Posicione su cabeza en una posición específica (posición y orientación).</li>" +
                "<li>Manténganse en posición y fijación en los puntos que se muestran en la pantalla.</li>" +
                "</ul></li>" +
                "<li>Para posicionar la cabeza correctamente en cada paso, la mejor opción es tratar de superponer las mallas de la cara, azul (posición actual) y verde (posición del objetivo).</li>" +
                "<li>Si la postura de la cabeza no es reconocida en cualquier momento, relájate, siéntate derecho de nuevo, y sigue las instrucciones.</li>" +
                "<li>Después de la calibración NO se aleje de la pantalla y evite los movimientos fuertes de la cabeza.</li>" +
                "</ul>",
            instructionsExistingCalibDataFoundInfant: "<h3> Calibración de seguimiento de ojos</h3>" +
                "<p>Encontramos datos de calibración anteriores en la caché de su navegador. Puedes saltarte la calibración si:" +
                "<ul>" +
                "<li>usted es la misma persona que calibró en la sesión anterior.</li>" +
                "El ambiente y las condiciones de iluminación no cambiaron." +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Calibración del rastreador de ojos</h3>" +
                "<p><b>Instrucción para los padres: Por favor, lea con atención </b></p>" +
                "<p>Para usar su cámara web para el seguimiento de los ojos, necesita " +
                "...estar calibrado para su entorno específico. Esto tomará alrededor de 1-2 minutos. " +
                "Antes de empezar, por favor asegúrese de que:</p>" +
                "<ul>" +
                "Su hijo se sienta cómodamente en su regazo." +
                "No hay ninguna fuente de luz brillante (ventana, lámpara) detrás de ti visible en la imagen." +
                "Su hijo no lleva gafas." +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Paso 1: Establecer la posición central</h3>" +
                "<p><b>Instrucción para los padres: El rastreador de ojos se calibrará para una postura específica de la cabeza. " +
                "Por favor, asegúrese de que:</b></p>" +
                "<ul>" +
                "<li>La cara de su hijo es visible en el video y se detecta con una malla azul, mientras mira la pantalla (no la suya).</li>" +
                "La posición / postura de la cabeza es cómoda para que usted y su hijo la mantengan durante el resto del estudio sin mucho movimiento." +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>Paso 2: Establecer la posición central</h3>" +
                "<p><b>Instrucción para los padres: Por favor, lea con atención </b></p>" +
                "<p>¿Quieres usar esta pose (malla verde) o volver? </p>" +
                "<ul>" +
                "<li>¿Es la postura frente a la pantalla y cómoda para su hijo?</li>" +
                "<li>¿Es la pose aproximadamente centrada horizontalmente y la cara bien visible?</li>" +
                "<li>Si no retroceder y redefinir la postura del centro.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Paso 3: Calibración</h3>" +
                "<p><b>Instrucción para los padres: Por favor, lea con atención </b></p>" +
                "<ul>" +
                "<li>Ahora comenzará la calibración. Por favor, no mueva más la webcam o la pantalla, de lo contrario la calibración fallará. </li>" +
                "<li>Presentaremos los animales en diferentes posiciones en la pantalla y grabaremos la mirada de su hijo cuando mire estos animales.</li>" +
                "<li>Para que la calibración funcione, su hijo tendrá que mirar a estos animales, y sentarse en una posición estable en su laboratorio sin fuertes movimientos de cabeza durante y después de la calibración.</li>" +
                "</ul>",
            countdownMessage1: "sigue fijando el círculo rojo",
            countdownMessage2: "Sigue fijando al animal",
            loadingCalib: "Por favor, espere a que se complete la calibración:<br>",
            moveForward: "Continuar",
            moveBackward: "atrás"
        }
    },
    Portuguese: {
        start: {
            library: "Biblioteca",
            langSelect: "Este estudo está disponível em vários idiomas.",
            studyLanguage: "Lingua do estudo:",
            continue: "Continuar",
            submit: "Submeter",
            refresh: "Atualizar",
            initialSurvey: "Preencha os campos abaixo (os campos obrigatórios estão marcados com *):",
            yourGender: "Sexo",
            yourGenderMale: "Masculino",
            yourGenderFemale: "Feminino",
            yourAge: "Sua idade",
            years: "anos",
            yourCountry: "País/Localização",
            yourFirstLang: "Língua materna",
            yourEmail: "Email",
            missing: "ausente",
            askEmailConsent1: "Por que pedimos seu e-mail: ",
            askEmailConsent2: "Este é um estudo longitudinal, constituído por várias sessões de participação. Seu e-mail será recodificado somente para convidar / lembra-lo de participar da próxima sessão. Seu e-mail não será armazenado junto com outros tipos de dados e está acessível apenas internamente na plataforma Labvanced. Não vamos dar " +
                "seu e-mail ou usa-lo para finalidades diferentes.",
            yourCrowdsourcingID: "Seu ID de trabalho/ crowdsourcing ID (*):",
            loading2: "Carregando, por favor espere",
            loading3: "Isto pode levar um tempo.",
            loadingComplete: "Carregamento Completo!",
            canStart: "Agora você pode iniciar o experimento. Isso mudará seu navegador para o modo de tela inteira.",
            keepFullscreen: "Observe que, durante a experiência, você nunca deve pressionar escape ou usar o botão \"voltar \" do seu navegador.",
            startButton: "Começar",
            startingExp: "Iniciando Experimento...",
            startingIn: "Iniciando em ",
            participationAgreement1: " Concordo que todos os dados pessoais que forneço aqui e todas as minhas respostas serão registrados e podem ser usados ​​para fins de pesquisa de forma pseudonimizada. Eu também concordo com o",
            participationAgreement2: "da Scicovery GmbH para registro, armazenamento e tratamento de dados de participantes.",
            customRequirement: "Por meio deste, eu confirmo que aceito os termos e condições deste estudo e cumpro os seguintes requisitos de participação conforme declarado abaixo:",
            requestPermissionHeader: "Permissão de Dispositivo Necessária",
            requestPermissionBody: "Este experimento requer acesso à sua webcam ou microfone. Permita o acesso à sua webcam ou microfone para continuar.",
        },
        errors: {
            errorSessionNotReady: "No momento, você não pode participar deste experimento porque este estudo só pode ser iniciado em determinados momentos.",
            errorSessionStartIn: "Você pode iniciar esta sessão em",
            errorSessionOver: "No momento, você não pode participar deste experimento porque não há uma janela de tempo de início definida para este estudo.",
            playerErrorNoSubjGroup: "Erro: não há grupo de assuntos definido no experimento.",
            playerErrorNoSession: "Erro: não há sessão definida no grupo de sujeitos no experimento.",
            playerErrorNoBlock: "Erro: não há bloco definido nesta sessão de experimento.",
        },
        multiUser: {
            multiUserExpLobby: "Experimento de Múltiplos Participantes",
            participantsInLobby: "Participantes presentes:",
            readyToStart: "Pronto para começar?",
            waitingForOtherParticipants: "Esperando por mais participantes...",
            experimentStartsShortly: "Seu experimento começará em breve...",
            successfullyMatched_1: "Combinação realizada com sucesso. Pressione ",
            successfullyMatched_2: " para prosseguir com a experiência!",
            continueJointExpLobby: "continuar",
            jointExpTestConnection: "Testando sua conexão com a Internet. Por favor aguarde 30 segundos ...",
            inviteFriendMultiUser1: "Precisa de outro jogador? Convidar um amigo!",
            inviteFriendMultiUser2: "Seu Nome:",
            inviteFriendMultiUser3: "O E-mail de seu colega:",
            inviteFriendMultiUser4: "Convidar",
        },
        screenCalibration: {
            confirm: "Confirmar",
            calibrateIntro: "A distância e o tamanho da tela são necessários para a calibração:",
            calibrateMethod1: "Especifique o tamanho da tela manualmente se você souber o tamanho do seu monitor.",
            calibrateScreenSize: "Tamanho da tela (diagonal):",
            calibrateInches: "polegadas",
            calibrateMethod2: "Use um cartão de identificação padronizado (85,60 × 53,98 mm) ou qualquer outro cartão do mesmo tamanho contra a tela e tente corresponder ao tamanho do cartão exibido. " +
                "Você pode alterar o tamanho da imagem arrastando a seta. A calibração estará correta se a imagem corresponder exatamente ao tamanho do cartão.",
            calibDistance1: "Sua distância da tela (em cm) é: ",
            calibDistance2: "centímetros",
        },
        content: {
            chooseSelection: "Por favor escolha...",
            answerPlaceholder: "Resposta do participante ...",
        },
        end: {
            endExpMsg: "Obrigado! A sessão de experimento terminou.",
            goToLib: "Vá para a biblioteca de experimentos",
            endExpMsgTest: "A gravação de teste desta tarefa acabou. Para testar todo o experimento ou registrar dados, inicie o estudo em 'Executar' no painel de navegação.",
            moreExperiments: "Participe de experiências comportamentais mais emocionantes:",
            registerAndBuild: "OU registre-se e crie seu próprio estudo gratuitamente:",
        },
        eyetracking: {
            previousCalib1: "Utilizar Dados de Calibração Anteriores",
            previousCalib2: "Re-executar a calibração.",
            calibLoading: "calibragem de carga... por favor aguarde...",
            headPoseBlueMesh: "<p>Posicione por favor a cabeça de forma a que a malha azul esteja alinhada com a malha alvo verde:</p>",
            feedbackHeadpose1: "Por favor, certifique-se de que o seu rosto está visível na sua webcam",
            feedbackHeadpose2: "Por favor, aproxime-se da câmara.",
            feedbackHeadpose3: "Por favor, dirija-se à webcam e coloque a webcam perto do monitor",
            feedbackHeadpose4: "Por favor, certifique-se de que a sua cabeça está virada para cima",
            feedbackHeadpose5: "Por favor, mova-se mais para a esquerda",
            feedbackHeadpose6: "Por favor, avance mais para a direita",
            feedbackHeadpose7: "Por favor, avance mais para baixo",
            feedbackHeadpose8: "Por favor, avancem mais para cima",
            feedbackHeadpose9: "Por favor, levantem a cabeça",
            feedbackHeadpose10: "Por favor desloque a cabeça para baixo",
            feedbackHeadpose11: "Por favor, desloque a sua cabeça para a direita",
            feedbackHeadpose12: "Por favor, desloque a sua cabeça para a esquerda",
            feedbackHeadpose13: "Por favor incline a cabeça para baixo",
            feedbackHeadpose14: "Por favor incline a cabeça para cima",
            feedbackHeadpose15: "Por favor, incline a cabeça para a esquerda",
            feedbackHeadpose16: "Por favor, incline a cabeça para a direita",
            feedbackHeadpose17: "Por favor, aproxime-se da câmara.",
            feedbackHeadpose18: "Por favor afaste-se da came.",
            countdown1: "Óptimo! Agora, por favor mantenha esta pose de cabeça... Comece em ",
            poseError: "<p>Perdeste a pose da cabeça. Por favor realinhar a sua pose da cabeça para a malha verde:</p>",
            screenResolutionError: "A resolução do ecrã foi alterada. Por favor, reinicie a calibração",
            instructionsExistingCalibDataFoundAdult: "<h3>Calibração do rastreador ocular</h3>" +
                "<p> Encontrámos dados de calibração anteriores na cache do seu navegador. Pode saltar a calibração se:" +
                "<ul>" +
                "<li>é a mesma pessoa que calibrou na sessão anterior.</li>" +
                "<li>o ambiente e as condições de iluminação não mudaram.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>Calibração do rastreador ocular</h3>" +
                "<p><b>Por favor leia com atenção</b></p>" +
                "<p>Para usar a sua webcam para localizar os olhos, precisa de " +
                "ser calibrado para o seu ambiente específico. Isto demorará cerca de 3-4 minutos. " +
                "Antes de iniciar a calibração, certifique-se por favor que:</p>" +
                "<ul>" +
                "<li>Você está numa sala calma.</li>" +
                "<li>Você tem tempo suficiente.</li>" +
                "<li>Você não usa óculos.</li>" +
                "<li>A sua webcam está o mais perto possível do centro do seu ecrã (se não estiver integrada no seu monitor de qualquer forma).</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>Passo 1: Iluminação de configuração</h3>" +
                "<p>Por favor, certifique-se de que:</p>" +
                "<li>Não há nenhuma fonte de luz brilhante (janela, lâmpada) atrás de si visível na imagem.</li>" +
                "<li>Sua cara e olhos devem ser bem iluminados de frente.</li>" +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>Passo 2: Definir Centro de Posicionamento</h3>" +
                "<p><b>Por favor leia com atenção</b></p>" +
                "<p>O visualizador será calibrado para uma pose específica (posição e orientação) da sua cabeça em frente da câmara. " +
                "No passo seguinte, definirá esta pose de 'centro'. " +
                "Por favor certifique-se de que:</p>" +
                "<ul>" +
                "<li>Esta pose de cabeça é confortável para você manter por muito tempo.</li>" +
                "<li>Please pay attention, that also the tilt and yaw orientation of your head is comfortable.</li>" +
                "<li>Por favor ajuste o seu ecrã e a sua webcam no ecrã seguinte, para que a sua webcam possa detectar facilmente os movimentos dos seus olhos quando olha para o ecrã. </li>" +
                "</ul>",
            instructionsPositioningAdult: "<h3>Passo 2: Definir Centro de Posicionamento</h3>" +
                "<ul>" +
                "<li>Certifique-se de que está de frente para o ecrã numa pose confortável.</li>" +
                "<li>Se aproxime o suficiente da câmara para que o seu rosto e olhos sejam bem detectados e visíveis.</li>" +
                "<li>Esta é a última vez para ajustar a posição da câmara e do ecrã.</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>Passo 2: Definir Centro de Posicionamento</h3>" +
                "<p>Quer usar esta pose (malha verde) ou voltar atrás?</p>" +
                "<ul>" +
                "<li>É a pose virada para o ecrã e confortável para si?</li>" +
                "<li>É a pose suficientemente próxima da câmara de modo a que os seus olhos sejam bem detectados?</li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>Passo 3: Calibração</h3>" +
                "<p><b>Por favor leia com atenção</b></p>" +
                "<p>Agora a verdadeira calibração começará. Por favor, NÃO mova mais a webcam ou o ecrã, porque isso resulta numa calibração falhada.</p>." +
                "<ul>" +
                "<li>Cada passo de calibração tem 2 partes: " +
                "<ul>" +
                "<li>Posicione a sua cabeça numa pose especificada (posição e orientação).</li>" +
                "<li>Keep que posam e fixam nos pontos que são mostrados no ecrã.</li>" +
                "</ul></li>" +
                "<li>Para posicionar correctamente a cabeça em cada passo, a melhor opção é tentar sobrepor as malhas do rosto, azul (posição actual) e verde (posição alvo).</li>" +
                "<li>Se a sua pose de cabeça não for recocalizada em nenhum momento, relaxe, sente-se novamente direito, e siga as instruções.</li>" +
                "<li>Após a calibração ser feita NÃO se afaste do ecrã e evite movimentos fortes da cabeça.</li>" +
                "</ul>",
            instructionsExistingCalibDataFoundInfant: "<h3>Calibração do rastreador ocular</h3>" +
                "<p> Encontrámos dados de calibração anteriores na cache do seu navegador. Pode saltar a calibração se:" +
                "<ul>" +
                "<li>é a mesma pessoa que calibrou na sessão anterior.</li>" +
                "<li>o ambiente e as condições de iluminação não mudaram.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Calibração do rastreador ocular</h3>" +
                "<p><b>Instrução para os pais: Por favor leia com atenção</b></p>" +
                "<p>Para usar a sua webcam para localizar os olhos, precisa de " +
                "ser calibrado para o seu ambiente específico. Isto demorará cerca de 1-2 minutos. " +
                "Antes de começar, por favor certifique-se que:</p>" +
                "<ul>" +
                "<li>Sua criança senta-se confortavelmente no seu colo.</li>" +
                "<li>Não há nenhuma fonte de luz brilhante (janela, lâmpada) atrás de si visível na imagem.</li>" +
                "<li>Sua criança não usa óculos.</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Passo 1: Definir Centro de Posicionamento</h3>" +
                "<p><b>Instrução para os pais: O rastreador ocular será calibrado para uma posição específica da cabeça. " +
                "Por favor certifique-se de que:</b></p>" +
                "<ul>" +
                "<li>O seu rosto de criança é visível no vídeo e detectado com uma malha azul, enquanto olha para o ecrã (não o seu).</li>" +
                "<li>A posição / posição da cabeça é confortável para si e para o seu filho, para manter durante o resto do estudo sem muito movimento.</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>Passo 2: Definir Centro de Posicionamento</h3>" +
                "<p><b>Instrução para os pais: Por favor leia com atenção</b></p>" +
                "p>Quer usar esta pose (malha verde) ou voltar atrás?</p>" +
                "<ul>" +
                "<li>É a pose virada para o ecrã e confortável para o seu filho?</li>" +
                "<li>É a pose mais ou menos centrada horizontalmente e o rosto bem visível?</li>" +
                "<li>Se não voltar atrás e redefinir a pose central.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Passo 3: Calibração</h3>" +
                "<p><b>Instrução para os pais: Por favor leia com atenção</b></p>" +
                "<ul>" +
                "<li>Agora a calibração começará. Por favor, NÃO mova mais a webcam ou o ecrã, caso contrário a calibração falhará.</li>" +
                "<li>Apresentaremos animais em diferentes posições no ecrã e registaremos o olhar do seu filho ao olhar para estes animais.</li>" +
                "<li> Para a calibração funcionar, o seu filho terá de olhar para estes animais, e sentar-se numa posição estável no seu laboratório sem movimentos fortes da cabeça durante e após a calibração.</li>" +
                "</ul>",
            countdownMessage1: "continuar a fixar o círculo vermelho",
            countdownMessage2: "Continuar a fixar o animal",
            loadingCalib: "Por favor aguarde a calibração para completar:<br>",
            moveForward: "continuar",
            moveBackward: "para trás"
        }
    },

    French: {
        start: {
            library: "Bibliothèque",
            langSelect: "Cette étude est disponible en plusieurs langues.",
            studyLanguage: "Etude Langage:",
            continue: "Continuer",
            submit: "Envoyer",
            refresh: "Rafraîchir",
            initialSurvey: "Veuillez remplir les champs ci-dessous (les champs obligatoires sont marqués d'un *) :",
            yourGender: "Sexe",
            yourGenderMale: "Homme",
            yourGenderFemale: "Femme",
            yourAge: "Votre âge",
            years: "ans",
            yourCountry: "Pays/Localité",
            yourFirstLang: "Langue première",
            yourEmail: "Email",
            missing: "manquant",
            askEmailConsent1: "Pourquoi nous vous demandons votre adresse électronique: ",
            askEmailConsent2: "Il s'agit d'une étude longitudinale, composée de plusieurs sessions de participation. Votre courriel sera uniquement recodé afin de vous inviter/rappeler à participer à la session suivante. Votre courriel ne sera pas stocké avec d'autres types de données et n'est accessible qu'en interne à la plateforme Labvanced. Nous ne donnerons pas votre e-mail et ne l'utiliserons pas à d'autres fins",
            yourCrowdsourcingID: "Votre ID de crowdsourcing / worker (*):",
            loading2: "Chargement en cours, veuillez patienter",
            loading3: "Cela peut prendre un certain temps",
            loadingComplete: "Chargement terminé !",
            canStart: "Vous pouvez maintenant commencer l'expérience. Cela fera passer votre navigateur en mode plein écran.",
            keepFullscreen: "Veuillez noter que pendant l'expérience, vous ne devez pas appuyer sur la touche Echap ni utiliser le bouton 'retour' de votre navigateur.",
            startButton: "Commencer",
            startingExp: "Lancement de l'expérience...",
            startingIn: "Commencement dans ",
            participationAgreement1: " J'accepte que toutes les données personnelles que je fournis ici et toutes mes réponses soient enregistrées et puissent être utilisées à des fins de recherche sous une forme pseudonyme. J'accepte également ",
            participationAgreement2: "de la société Scicovery GmbH pour l'enregistrement, le stockage et le traitement des données des participants.",
            customRequirement: "Par la présente, je confirme que j'accepte les termes et conditions de cette étude et que je remplis les conditions de participation suivantes, comme indiqué ci-dessous:",
            requestPermissionHeader: "Autorisation requise de l'appareil",
            requestPermissionBody: "Cette expérience nécessite l'accès à votre webcam ou à votre microphone. Dans l'écran suivant, veuillez autoriser l'accès à votre webcam ou à votre microphone pour continuer.",
        },
        errors: {
            errorSessionNotReady: "Vous ne pouvez actuellement pas participer à cette expérience car cette étude ne peut être lancée qu'à certains moments",
            errorSessionStartIn: "Vous pouvez commencer cette session dans",
            errorSessionOver: "Vous ne pouvez actuellement pas participer à cette expérience car la fenêtre temporelle de départ n'est pas définie pour cette étude",
            playerErrorNoSubjGroup: "Erreur : il n'y a pas de groupe de sujets défini dans l'expérience.",
            playerErrorNoSession: "Erreur : il n'y a pas de session définie dans le groupe de sujets de l'expérience.",
            playerErrorNoBlock: "Erreur : il n'y a pas de bloc défini dans cette session de l'expérience.",
        },

        multiUser: {
            multiUserExpLobby: "Expérience à plusieurs participants",
            participantsInLobby: "Participants en attente :",
            readyToStart: "Prêt à commencer ?",
            waitingForOtherParticipants: "En attente d'autres participants...",
            experimentStartsShortly: "Votre expérience va bientôt commencer...",
            successfulMatched_1: "Appairage réussi. Appuyez sur ",
            successfulMatched_2: " commencer l'expérience !",
            continueJointExpLobby: "continuer",
            jointExpTestConnection: "Test de votre connexion internet. Veuillez patienter 30 secondes...",
            inviteFriendMultiUser1: "Besoin d'un autre joueur ? Invitez un ami !",
            inviteFriendMultiUser2: "Votre nom :",
            inviteFriendMultiUser3: "L'e-mail de vos amis :",
            inviteFriendMultiUser4: "Inviter",
        },

        screenCalibration: {
            confirm: "Confirmer",
            calibrateIntro: "La mesure de distance et la taille de l'écran sont nécessaires pour le calibrage :",
            calibrateMethod1: "Veuillez spécifier manuellement la taille de votre écran si vous la connaissez",
            calibrateScreenSize: "Taille de l'écran (diagonale) :",
            calibrateInches: "pouces",
            calibrateMethod2: "Veuillez utiliser une carte à puce / magnétique standardisée (85,60 × 53,98 mm) ou toute autre carte de même taille contre l'écran et essayez de faire correspondre la taille de la carte affichée. " +
                "Vous pouvez modifier la taille de l'image en faisant déplaçant la flèche. Le calibrage est correct si l'image correspond exactement à la taille de la carte",
            calibDistance1: "Votre distance à l'écran (en cm) est de : ",
            calibDistance2: "centimètre",
        },
        content: {
            chooseSelection: "Veuillez choisir...",
            answerPlaceholder: "Réponse du participant...",
        },
        end: {
            finExpMsg: "Merci ! La session d'expérimentation est terminée.",
            goToLib: "Aller à la bibliothèque d'expériences",
            endExpMsgTest: "L'enregistrement du test de cette tâche est terminé. Pour tester l'ensemble de l'expérience ou pour enregistrer des données, démarrez l'étude sous Exécuter dans le panneau de navigation",
            moreExperiments: "Participer à d'autres expériences comportementales :",
            registerAndBuild: "OU inscrivez-vous et construisez votre propre étude gratuitement :",
        },
        eyetracking: {
            précédentCalib1: "Utiliser les données de la calibration précédente",
            previousCalib2: "Refaire une calibration",
            calibLoading: "Chargement de la calibration... veuillez patienter...",
            headPoseBlueMesh: "<p>Veuillez positionner votre tête de manière à ce que le maillage bleu soit aligné avec le maillage cible (en vert):</p>",
            FeedbackHeadpose1: "Veuillez vous assurer que votre visage est visible (capté par la webcam)",
            feedbackHeadpose2: "Veuillez vous rapprocher de la webcam.",
            FeedbackHeadpose3: "Veuillez faire face à la webcam et placer la webcam près du moniteur (si possible).",
            feedbackHeadpose4: "Veuillez vous assurer que votre tête est orientée vers le haut.",
            FeedbackHeadpose5: "Veuillez vous déplacer vers la gauche.",
            FeedbackHeadpose6: "Veuillez vous déplacer vers la droite.",
            FeedbackHeadpose7: "Veuillez vous déplacer vers le bas.",
            FeedbackHeadpose8: "Veuillez vous déplacer vers le haut.",
            FeedbackHeadpose9: "Veuillez lever la tête.",
            FeedbackHeadpose10: "Veuillez baisser la tête.",
            FeedbackHeadpose11: "Veuillez tourner la tête vers la droite.",
            FeedbackHeadpose12: "Veuillez tourner la tête vers la gauche.",
            FeedbackHeadpose13: "Penchez la tête vers le bas.",
            FeedbackHeadpose14: "Veuillez incliner votre tête vers le haut.",
            FeedbackHeadpose15: "Veuillez tourner la tête vers la gauche.",
            FeedbackHeadpose16: "Veuillez tourner la tête à droite.",
            FeedbackHeadpose17: "Rapprochez-vous de la caméra.",
            FeedbackHeadpose18: "Veuillez vous éloigner de la caméra.",
            countdown1: "Parfait ! Maintenant, veuillez garder cette pose... Commencement dans ",
            poseError: "<p>Vous avez perdu la pose correcte de la tête. Veuillez réaligner votre pose de tête sur le maillage vert :</p>",
            screenResolutionError: "La résolution de l'écran a été modifiée. Veuillez recommencer la calibration",
            instructionsExistingCalibDataFoundAdult: "<h3>Calibrage du traceur oculaire</h3>" +
                "<p>Nous avons trouvé des données de calibration antérieures dans le cache de votre navigateur. Vous pouvez ne pas faire de nouvelle calibration si :" +
                "<ul>" +
                "<li>vous êtes la même personne que celle qui a réalisé la calibration lors de la session précédente.</li>" +
                "<li>l'environnement et les conditions d'éclairage n'ont pas changé.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>Calibrage du traceur oculaire</h3>" +
                "<p><b>Veuillez lire attentivement</b></p>" +
                "<p>Pour utiliser votre webcam pour le suivi des yeux, elle doit " +
                "être calibrée pour votre environnement spécifique. Cela prendra environ 3 à 4 minutes. " +
                "Avant de commencer la calibration, veuillez vous assurer que:</p>" +
                "<ul>" +
                "<li>Vous êtes dans une pièce calme.</li>" +
                "<li>Vous avez assez de temps.</li>" +
                "<li>Vous ne portez pas de lunettes.</li>" +
                "<li>Votre webcam est aussi proche que possible du centre de votre écran (si elle n'est pas intégrée à votre moniteur).</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>Etape 1 : Réglage de l'éclairage</h3>" +
                "<p>Veuillez vous assurer que:</p>" +
                "<li>Il n'y a pas de source de lumière vive (fenêtre, lampe) derrière vous visible dans l'image.</li>" +
                "<li>Votre visage et vos yeux doivent être bien éclairés de face.</li>" +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>Etape 2 : Définir la position centrale</h3>" +
                "<p><b>Veuillez lire attentivement</b></p>" +
                "<p>L'oculomètre sera calibré pour une pose spécifique (position et orientation) de votre tête devant la caméra. " +
                "Dans la prochaine étape, vous définirez cette pose centrale" +
                "Veuillez vous assurer que:</p>" +
                "<ul>" +
                "<li>Cette pose de la tête est confortable pour vous de la garder pendant une longue durée.</li>" +
                "<li>Veuillez noter que l'inclinaison et l'orientation de votre tête sont également confortables.</li>" +
                "<li>Veuillez régler votre écran et votre webcam sur l'écran suivant, afin que votre webcam puisse facilement détecter les mouvements de vos yeux lorsque vous regardez l'écran. </li>" +
                "</ul>",
            instructionsPositioningAdult: "<h3>Etape 2 : Positionner la pose centrale</h3>" +
                "<ul>" +
                "<li>Assurez-vous que vous êtes face à l'écran dans une pose confortable.</li>" +
                "<li>Soyez suffisamment proche de la caméra pour que votre visage et vos yeux soient bien détectés et visibles.</li>" +
                "<li>C'est la dernière fois qu'il faut ajuster la position de la caméra et de l'écran.</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>Etape 2 : Définir la position centrale</h3>" +
                "<p>Vous voulez utiliser cette pose (maillage vert) ou revenir en arrière ?</p>" +
                "<ul>" +
                "<li>La pose est-elle face à l'écran et confortable pour vous ? </li>" +
                "<li>Est-ce que la pose est suffisamment proche de la caméra pour que vos yeux soient bien détectés ? </li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>Etape 3 : Calibration</h3>" +
                "<p><b>Veuillez lire attentivement</b></p>" +
                "<p>Maintenant, la vraie calibration va commencer. Veuillez ne plus déplacer la webcam ou l'écran, car cela entraînerait un échec de la calibration. </p>" +
                "<ul>" +
                "<li>Chaque étape de la calibration comporte 2 parties : " +
                "<ul>" +
                "<li>Positionnez votre tête dans une pose spécifiée (position et orientation).</li>" +
                "<li>Maintenez cette pose et fixez les points qui sont affichés à l'écran.</li>" +
                "</ul></li>" +
                "<li>Pour positionner correctement votre tête à chaque étape, la meilleure option est d'essayer de faire se chevaucher les maillages du visage, le bleu (position actuelle) et le vert (position cible).</li>" +
                "<li>Si à certains moments votre visage n'est plus détecté, détendez-vous, asseyez-vous à nouveau droit et suivez les instructions. </li>" +
                "<li>Une fois la calibation effectuée, NE vous éloignez PAS de l'écran et évitez les mouvements forts de la tête.</li>" +
                "</ul>",
            instructionsExistingCalibDataFoundInfant: "<h3>Calibrage du traceur oculaire</h3>" +
                "<p>Nous avons trouvé des données de calibration antérieures dans le cache de votre navigateur. Vous pouvez ne pas faire la calibration si :" +
                "<ul>" +
                "<li>vous êtes la même personne que celle qui a réalisé la calibration lors de la session précédente.</li>" +
                "<li>l'environnement et les conditions d'éclairage n'ont pas changé.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Calibrage du traceur oculaire</h3>" +
                "<p><b>Instruction pour les parents : Veuillez lire attentivement </b></p>" +
                "<p>Pour utiliser votre webcam pour le suivi des yeux, elle doit " +
                "être calibré pour votre environnement spécifique. Cela prendra environ 1 à 2 minutes. " +
                "Avant de commencer, veuillez vous assurer que:</p>" +
                "<ul>" +
                "<li>Votre enfant est assis confortablement sur vos genoux.</li>" +
                "<li>Il n'y a pas de source de lumière vive (fenêtre, lampe) derrière vous visible dans l'image.</li>" +
                "<li>Votre enfant ne porte pas de lunettes.</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Etape 1 : Fixer la position centrale</h3>" +
                "<p><b>Instruction pour les parents : L'oculomètre sera calibré pour une pose spécifique de la tête. " +
                "Veuillez vous assurer que:</b></p>" +
                "<ul>" +
                "<li>Le visage de votre enfant est visible dans la vidéo et détecté par un maillage bleu, tout en regardant l'écran (pas le vôtre).</li>" +
                "<li>La position / la pose de la tête est confortable pour vous et votre enfant, vous pouvez la garder pour le reste de l'étude sans trop bouger.</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>étape 2 : Définir la position centrale</h3>" +
                "<p><b>Instruction pour les parents : Veuillez lire attentivement </b></p>" +
                "<p>Vous voulez utiliser cette pose (maillage vert) ou revenir en arrière ? </p>" +
                "<ul>" +
                "<li>La pose est-elle face à l'écran et confortable pour votre enfant ? </li>" +
                "<li>Est-ce que la pose est à peu près centrée horizontalement et le visage bien visible ?  </li>" +
                "<li>Si ce n'est pas pour reculer et redéfinir la pose centrale.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Etape 3 : Calibration</h3>" +
                "<p><b>Instruction pour les parents : Veuillez lire attentivement </b></p>" +
                "<ul>" +
                "<li>Maintenant, la calibration va commencer. Veuillez ne plus déplacer la webcam ou l'écran, sinon la calibration échouera.  </li>" +
                "<li>Nous présenterons des animaux à différentes positions sur l'écran et enregistrerons le regard de votre enfant lorsqu'il regardera ces animaux.</li>" +
                "<li>Pour que la calibration fonctionne, votre enfant devra regarder ces animaux, et s'asseoir dans une position stable sur vos genoux sans faire de grands mouvements de tête pendant et après la calibration.</li>" +
                "</ul>",
            countdownMessage1: "continuez à fixer le cercle rouge",
            countdownMessage2: "Continuez à fixer l'animal",
            loadingCalib: "Veuillez attendre la fin de la calibration:<br>",
            moveForward: "continuer",
            moveBackward: "retour"
        }
    },
    Chinese: {
        start: {
            library: "图书馆",
            langSelect: "本研究报告有多种语言版本",
            studyLanguage: "研究语言：",
            continue: "继续",
            submit: "提交",
            refresh: "刷新",
            initialSurvey: "请填写下面的字段（带*号的为必填字段）：",
            yourGender: "性别",
            yourGenderMale: "男性",
            yourGenderFemale: "女",
            yourAge: "你的年龄",
            years: "年",
            yourCountry: "国家/地点",
            yourFirstLang: "第一语言",
            yourEmail: "电子邮件",
            missing: "失踪",
            askEmailConsent1: "我们为什么要索取你的Email: ",
            askEmailConsent2: "这是一项纵向研究，包括几个参与环节。您的电子邮件将被重新编码，以便邀请/提醒您参加下一个环节。您的电子邮件不会与其他类型的数据一起存储，并且只能在Labvanced平台内部访问。我们不会将 泄露给您 您的电子邮件或用于不同的目的",
            yourCrowdsourcingID: "您的工作者/众包ID（*）：",
            loading2: "正在加载，请等待",
            loading3: "这可能需要一段时间。",
            loadingComplete: "加载完成",
            canStart: "你现在可以开始实验了: 你现在可以开始实验了. 这将把你的浏览器切换到全屏模式",
            keepFullscreen: "请注意，在实验过程中，你不应该按escape键或者使用浏览器中的 后退 键。",
            startButton: "开始",
            startingExp: "开始实验...",
            startingIn: "开始实验...",
            participationAgreement1: "我同意我在这里提供的所有个人数据和我的所有回答都将被记录，并可以以假名的方式用于研究目的。我也同意",
            participationAgreement2: "Scicovery GmbH记录、存储和处理参与者数据的协议",
            CustomRequirement: "我在此确认，我接受本研究的条款和条件，并满足以下参与要求。我在此确认我接受本研究的条款和条件并满足以下参与要求：",
            requestPermissionHeader: "需要设备权限",
            requestPermissionBody: "本实验需要访问您的网络摄像头或麦克风。在下面的屏幕中，请允许访问您的网络摄像头或麦克风设备以继续进行。",




        },
        errors: {
            errorSessionNotReady: "你目前不能参加这个实验，因为这个研究只能在特定时间开始。",
            errorSessionStartIn: "你可以在以下时间段开始这个环节",
            errorSessionOver: "你目前不能参加这个实验，因为没有为这个研究定义起始时间窗口。",
            playerErrorNoSubjGroup: "错误：实验中没有定义课题组。",
            playerErrorNoSession: "错误：实验中课题组没有定义环节。",
            playerErrorNoBlock: "错误：在这个实验环节中没有定义块。",
        },
        multiUser: {
            multiUserExpLobby: "多人参与实验",
            participantsInLobby: "大厅里的与会者。",
            readyToStart: "准备好开始了吗？",
            waitingForOtherParticipants: "等待更多的参与者...",
            experimentStartsShortly: "你的实验很快就会开始...",
            successfullyMatched_1: "成功匹配。按 ",
            successfullyMatched_2: " 继续实验!",
            continueJointExpLobby: "继续",
            jointExpTestConnection: "测试您的网络连接，请等待30秒......",
            inviteFriendMultiUser1: "需要其他玩家吗？邀请朋友吧!",
            inviteFriendMultiUser2: "你的名字。",
            inviteFriendMultiUser3: "你朋友的邮箱。",
            inviteFriendMultiUser4: "邀约",
        },
        screenCalibration: {
            confirm: "确认",
            calibrateIntro: "校验时需要距离和屏幕尺寸。",
            calibrateMethod1: "如果您知道显示器的尺寸，请手动指定屏幕尺寸。",
            calibrateScreenSize: "屏幕尺寸（对角线）：",
            calibrateInches: "英寸",
            calibrateMethod2: "使用标准身份证（85.60×53.98毫米）或其他任何相同尺寸的卡片对着屏幕，并尝试与显示的卡片尺寸一致。您可以通过拖动箭头来改变图像的尺寸。如果图像与卡的大小完全一致，则校准是正确的。",
            calibDistance1: "您与屏幕的距离（单位：厘米）为：。 ",
            calibDistance2: "公分",
        },
        content: {
            chooseSelection: "请选择...",
            answerPlaceholder: "参与者回答...",
        },
        end: {
            endExpMsg: "谢谢你！实验环节结束。",
            goToLib: "进入实验库",
            endExpMsgTest: "这个任务的测试记录已经结束。要测试整个实验或记录数据，请在导航面板的 运行 下开始研究。",
            moreExperiments: "多参加行为实验：",
            registerAndBuild: "或免费注册并建立自己的学习。",
        },
        eyetracking: {
            previousCalib1: "使用以前的校准数据",
            previousCalib2: "重新运行校准",
            calibLoading: "加载校准，请等待... ...",
            headPoseBlueMesh: "<p>将你的头定位在蓝色网格与绿色目标网格对齐的位置。</p>",
            feedbackHeadpose1: "请确保你的脸在你的网络摄像头中是可见的。",
            feedbackHeadpose2: "请靠近摄像头",
            feedbackHeadpose3: "请面对网络摄像头，并将网络摄像头放在显示器附近。",
            feedbackHeadpose4: "请确保你的头是直立的。",
            feedbackHeadpose5: "请再往左边走。",
            feedbackHeadpose6: "请再往右走。",
            feedbackHeadpose7: "请再往下走。",
            feedbackHeadpose8: "请再往上走。",
            feedbackHeadpose9: "请把头抬起来",
            feedbackHeadpose10: "请把头低下。",
            feedbackHeadpose11: "请把你的头往右移。",
            feedbackHeadpose12: "请把头向左移。",
            feedbackHeadpose13: "请把头往下仰。",
            feedbackHeadpose14: "请把头仰起。",
            feedbackHeadpose15: "请向左转头。",
            feedbackHeadpose16: "请向右转头。",
            feedbackHeadpose17: "请靠近摄像头。",
            feedbackHeadpose18: "请远离摄像头。",
            countdown1: "很好！ 现在，请保持这个头型... 现在，请保持这个头部姿势... ... 开始 ",
            poseError: "<p>你失去了头部的姿势。请将你的头部姿势重新调整到绿色的网格上。</p>",
            screenResolutionError: "屏幕分辨率被改变。请重新开始校准。",
            instructionsExistingCalibDataFoundAdult: "<h3>眼动跟踪校准</h3>" +
                "<p>我们在您的浏览器缓存中找到了以前的校准数据。您可以跳过校准，如果：" +
                "<ul>" +
                "<li>你是上一节课校准的那个人。</li>" +
                "<li>环境和照明条件没有改变。</li>" +
                "</ul></p>",
            instructionsPreEnvironmentAdult: "<h3>眼动跟踪校准</h3>" +
                "<p><b>请仔细阅读</b></p>" +
                "<p>要使用网络摄像头进行眼球跟踪，它需要 针对你的特定环境进行校准。这将需要大约3-4分钟。在开始校准之前，请确保：</p>" +
                "<ul>" +
                "<li>你在一个安静的房间里。</li>" +
                "<li>你有足够的时间。</li>" +
                "<li>你不戴眼镜。</li>" +
                "<li>您的网络摄像头尽可能地靠近您的屏幕中心（如果它没有集成在您的显示器中的话）.</li>" +
                "</ul>",
            instructionsEnvironmentAdult: "<h3>第一步：设置照明</h3>" +
                "<p>请确保：</p>" +
                "<li>图像中看不到您身后的明亮光源（窗户、灯）。</li>" +
                "<li>你的脸和眼睛要从正面照好。</li>" +
                "</ul>",
            instructionsPrePositioningAdult: "<h3>第二步：设置中心姿势</h3>" +
                "<p><b>请仔细阅读</b></p>" +
                "<p>眼球追踪器将根据您的头部在相机前的特定姿势（位置和方向）进行校准。" +
                "在下一步，你将定义这个'中心'的姿势。" +
                "请确认：</p>" +
                "<ul>" +
                "<li>这个头部姿势很舒服，你可以长时间保持。</li>" +
                "<li>请注意，您的头部的倾斜和偏航方向也是舒适的。</li>" +
                "<li>请在下面的屏幕上调整您的屏幕和网络摄像头，这样您的网络摄像头在看屏幕时就可以很容易地检测到您的眼球运动。</li>" +
                "</ul>",
            instructionsPositioningAdult: "<h3>第二步：设置中心姿势</h3>" +
                "<ul>" +
                "<li>确保以舒适的姿势面对屏幕。</li>" +
                "<li>要离摄像机足够近，这样你的脸和眼睛就能很好地被发现和看到。</li>" +
                "<li>这是最后一次调整摄像头和屏幕位置。</li>" +
                "</ul>",
            instructionsPositioningCheckAdult: "<h3>第二步：设置中心姿势</h3>" +
                "<p>你是要用这个姿势（绿网）还是回去？</p>" +
                "<ul>" +
                "<li>面对屏幕的姿势，你觉得舒服吗？</li>" +
                "<li>这个姿势是否离摄像头足够近，以至于你的眼睛能很好地被发现？</li>" +
                "</ul>",
            instructionsPreCalibAdult: "<h3>步骤3：校准</h3>" +
                "<p><b>请仔细阅读</b></p>" +
                "<p>现在将开始真正的校准。请不要再移动摄像头或屏幕，因为这样做会导致校准失败。</p>" +
                "<ul>" +
                "<li>每个校准步骤有两个部分。" +
                "<ul>" +
                "<li>以指定的姿势（位置和方向）摆放你的头。</li>" +
                "<li>保持这个姿势，固定在屏幕上显示的点上。</li>" +
                "</ul></li>" +
                "<li>为了在每一步上正确定位你的头部，最好的选择是尝试将脸部网格、蓝色（当前位置）和绿色（目标位置）重叠起来。</li>" +
                "<li>如果你的头部姿势随时没有重新调整，请放松，重新坐直，然后按照指示进行。</li>" +
                "<li>校准完成后，不要离开屏幕，避免头部剧烈运动。</li>" +
                "</ul>",
            instructionsExistingCalibDataFoundInfant: "<h3>眼球跟踪器的校准</h3>" +
                "<p>我们在您的浏览器缓存中找到了以前的校准数据。您可以跳过校准，如果：" +
                "<ul>" +
                "<li>你是上一节课校准的那个人。</li>" +
                "<li>环境和照明条件没有改变。</li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>眼球跟踪器的校准</h3>" +
                "<p><b>家长须知。请仔细阅读</b></p>" +
                "<p>要使用网络摄像头进行眼球跟踪，它需要" +
                "针对你的特定环境进行校准。这将需要大约1-2分钟。" +
                "在开始之前，请确保：</p>" +
                "<ul>" +
                "<li>您的孩子舒适地坐在您的腿上。</li>" +
                "<li>图像中看不到您身后的明亮光源（窗户、灯）。</li>" +
                "<li>您的孩子没有戴眼镜。</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>步骤1：设置中心姿势</h3>" +
                "<p><b>给家长的说明。眼球追踪器将根据特定的头部姿势进行校准。" +
                "请确认：</b></p>" +
                "<ul>" +
                "<li>您的孩子的脸在视频中可见，用蓝色的网状物检测，同时看着屏幕（不是您的）。</li>" +
                "<li>位置/头部姿势对您和您的孩子来说很舒服，可以在接下来的学习中保持，不需要太多动作。</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>第二步：设置中心姿势</h3>" +
                "<p><b>家长须知。请仔细阅读</b></p>" +
                "<p>你是要用这个姿势（绿网）还是回去？</p>" +
                "<ul>" +
                "<li>面对屏幕的姿势是否让您的孩子感到舒服？</li>" +
                "<li>姿势是否大致水平居中，面部是否清晰可见？</li>" +
                "<li>如果不退，重新定义中心姿势。</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Step 3: Calibration</h3>" +
                "<p><b>家长须知。请仔细阅读</b></p>" +
                "<ul>" +
                "<li>现在将开始校准。请不要再移动摄像头或屏幕，否则校准将失败。</li>" +
                "<li>我们会在屏幕上呈现不同位置的动物，并记录孩子看这些动物时的目光。</li>" +
                "<li>为了校准工作，您的孩子需要看着这些动物，并在校准期间和之后以稳定的姿势坐在您的实验室上，没有强烈的头部运动。</li>" +
                "</ul>",
            countdownMessage1: "盯着红圈",
            countdownMessage2: "继续盯着动物",
            loadingCalib: "请等待校准完成。<br>",
            moveForward: "继续",
            moveBackward: "后面"
        }
    },



};

ExpData.prototype.mergeStaticStrings = function (sourceStaticStrings, assembledStrings) {

    var translations = this.translations();

    for (var categoryKey in sourceStaticStrings) {
        if (Object.prototype.hasOwnProperty.call(sourceStaticStrings, categoryKey)) {
            if (!Object.prototype.hasOwnProperty.call(assembledStrings, categoryKey)) {
                assembledStrings[categoryKey] = {};
            }
            var sourceStrings = sourceStaticStrings[categoryKey]
            for (var stringKey in sourceStrings) {
                if (Object.prototype.hasOwnProperty.call(sourceStrings, stringKey)) {

                    var rawString = sourceStrings[stringKey];

                    // if it is a number, then it refers to a translation entry:
                    if (typeof rawString == 'number') {
                        var translationIdx = rawString;
                        if (translations[translationIdx]) {
                            if (translations[translationIdx].hasOwnProperty("languages")) {
                                rawString = translations[translationIdx].languages()[this.currentLanguage()]();
                                if (rawString == null || rawString == "") {
                                    // if displayed language was not defined in translation, then use default study language (first entry):
                                    rawString = translations[translationIdx].languages()[0]();
                                }
                            }
                        }
                    }
                    assembledStrings[categoryKey][stringKey] = rawString;
                }
            }
        }
    }

}

ExpData.prototype.getStaticStringsInLanguage = function (langStr) {

    // assemble the final object:
    var assembledStrings = {};

    // start with english as default (in case some language is missing a string key):
    this.mergeStaticStrings(ExpData.prototype.staticTranslations["English"], assembledStrings);

    // if current language is not english, then overwrite with the corresponding static strings of the language:
    if (langStr != "English" && ExpData.prototype.staticTranslations.hasOwnProperty(langStr)) {
        this.mergeStaticStrings(ExpData.prototype.staticTranslations[langStr], assembledStrings);
    }

    return assembledStrings;
}

ExpData.prototype.updateLanguage = function () {
    var langIdx = this.currentLanguage();
    var langStr = this.translatedLanguages()[langIdx];

    var assembledStrings = this.getStaticStringsInLanguage(langStr);

    // merge in the custom user modifications of static strings (and their translations):
    this.mergeStaticStrings(this.customizedStaticStrings, assembledStrings);

    this.staticStrings(assembledStrings);
};

ExpData.prototype.markAllTextsTranslatable = function () {
    $.each(this.availableTasks(), function (index, task) {
        $.each(task.subSequence().elements(), function (index, frame) {
            $.each(frame.elements(), function (index, elem) {
                var allTextRefs = elem.getTextRefs([], '');
                $.each(allTextRefs, function (index, textRef) {
                    textRef[2].markTranslatable();
                });
            });
        });
    });
};

ExpData.prototype.disableTranslations = function () {
    if (this.translationsEnabled()) {
        $.each(this.availableTasks(), function (index, task) {
            $.each(task.subSequence().elements(), function (index, frame) {
                $.each(frame.elements(), function (index, elem) {
                    var allTextRefs = elem.getTextRefs([], '');
                    $.each(allTextRefs, function (index, textRef) {
                        textRef[2].disableTranslatable();
                    });
                });
            });
        });

        this.translatedLanguages([this.translatedLanguages()[0]]);
        this.translations([]);
        this.customizedStaticStrings = {};
    }
};

ExpData.prototype.initVars = function () {


    for (var i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {

        if (this[ExpData.prototype.fixedVarNames[i]]().startValue() == null) {
            this[ExpData.prototype.fixedVarNames[i]]().resetStartValue();
        }

        this[ExpData.prototype.fixedVarNames[i]]().initValue();
    }
};

/**
 * creates all predefined (fixed) variables
 */


ExpData.prototype.createVars = function () {

    if (!this.varSubjectNr()) {
        this.varSubjectNr((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'ordinal', 'Subject_Nr'));
        this.varSubjectNr().setDescription(ExpData.prototype.varDescriptions["varSubjectNr"]);
    }
    if (!this.varTrialNr()) {
        this.varTrialNr((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Nr'));
        this.varTrialNr().setDescription(ExpData.prototype.varDescriptions["varTrialNr"]);
    }
    if (!this.varTrialId()) {
        this.varTrialId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Id'));
        this.varTrialId().setDescription(ExpData.prototype.varDescriptions["varTrialId"]);
    }
    if (!this.varConditionId()) {
        this.varConditionId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Condition_Id'));
        this.varConditionId().setDescription(ExpData.prototype.varDescriptions["varConditionId"]);
    }

    if (!this.varSubjectCode()) {
        this.varSubjectCode((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Subject_Code'));
        this.varSubjectCode().setDescription(ExpData.prototype.varDescriptions["varSubjectCode"]);
        this.varSubjectCode().includeInGlobalVarList(false);
    }
    if (!this.varSubjectNrPerSubjGroup()) {
        this.varSubjectNrPerSubjGroup((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'ordinal', 'Subject_Nr_Per_Group'));
        this.varSubjectNrPerSubjGroup().setDescription(ExpData.prototype.varDescriptions["varSubjectNrPerSubjGroup"]);
        this.varSubjectNrPerSubjGroup().includeInGlobalVarList(false);
    }
    if (!this.varGroupName()) {
        this.varGroupName((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Group_Name'));
        this.varGroupName().setDescription(ExpData.prototype.varDescriptions["varGroupName"]);
        this.varGroupName().includeInGlobalVarList(false);
    }
    if (!this.varSessionTimeStamp()) {
        this.varSessionTimeStamp((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_Start_Time'));
        this.varSessionTimeStamp().setDescription(ExpData.prototype.varDescriptions["varSessionTimeStamp"]);
        this.varSessionTimeStamp().includeInGlobalVarList(false);
    }
    if (!this.varSessionTimeStampEnd()) {
        this.varSessionTimeStampEnd((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_End_Time'));
        this.varSessionTimeStampEnd().setDescription(ExpData.prototype.varDescriptions["varSessionTimeStampEnd"]);
        this.varSessionTimeStampEnd().includeInGlobalVarList(false);
    }
    if (!this.varSessionName()) {
        this.varSessionName((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Session_Name'));
        this.varSessionName().setDescription(ExpData.prototype.varDescriptions["varSessionName"]);
        this.varSessionName().includeInGlobalVarList(false);
    }
    if (!this.varSessionNr()) {
        this.varSessionNr((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Session_Nr'));
        this.varSessionNr().setDescription(ExpData.prototype.varDescriptions["varSessionNr"]);
        this.varSessionNr().includeInGlobalVarList(false);
    }
    if (!this.varBlockName()) {
        this.varBlockName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Block_Name'));
        this.varBlockName().setDescription(ExpData.prototype.varDescriptions["varBlockName"]);
        this.varBlockName().includeInGlobalVarList(false);
    }
    if (!this.varBlockNr()) {
        this.varBlockNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Block_Nr'));
        this.varBlockNr().setDescription(ExpData.prototype.varDescriptions["varBlockNr"]);
        this.varBlockNr().includeInGlobalVarList(false);
    }
    if (!this.varTaskName()) {
        this.varTaskName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Task_Name'));
        this.varTaskName().setDescription(ExpData.prototype.varDescriptions["varTaskName"]);
        this.varTaskName().includeInGlobalVarList(false);
    }
    if (!this.varTaskNr()) {
        this.varTaskNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Task_Nr'));
        this.varTaskNr().setDescription(ExpData.prototype.varDescriptions["varTaskNr"]);
        this.varTaskNr().includeInGlobalVarList(false);
    }

    if (!this.varTimeMeasureSpecMean()) {
        this.varTimeMeasureSpecMean((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Mean'));
        this.varTimeMeasureSpecMean().setDescription(ExpData.prototype.varDescriptions["varTimeMeasureSpecMean"]);
        this.varTimeMeasureSpecMean().includeInGlobalVarList(false);
    }
    if (!this.varTimeMeasureSpecStd()) {
        this.varTimeMeasureSpecStd((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Std'));
        this.varTimeMeasureSpecStd().setDescription(ExpData.prototype.varDescriptions["varTimeMeasureSpecStd"]);
        this.varTimeMeasureSpecStd().includeInGlobalVarList(false);
    }
    if (!this.varCrowdsourcingCode()) {
        this.varCrowdsourcingCode((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Crowdsourcing_Code'));
        this.varCrowdsourcingCode().setDescription(ExpData.prototype.varDescriptions["varCrowdsourcingCode"]);
        this.varCrowdsourcingCode().includeInGlobalVarList(false);
    }
    if (!this.varCrowdsourcingSubjId()) {
        this.varCrowdsourcingSubjId((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Crowdsourcing_SubjId'));
        this.varCrowdsourcingSubjId().setDescription(ExpData.prototype.varDescriptions["varCrowdsourcingSubjId"]);
        this.varCrowdsourcingSubjId().includeInGlobalVarList(false);
    }


    if (!this.varBrowserSpec()) {
        this.varBrowserSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Browser_Spec'));
        this.varBrowserSpec().setDescription(ExpData.prototype.varDescriptions["varBrowserSpec"]);
        this.varBrowserSpec().isRecorded(false);
        this.varBrowserSpec().includeInGlobalVarList(false);
    }
    if (!this.varSystemSpec()) {
        this.varSystemSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'System_Spec'));
        this.varSystemSpec().setDescription(ExpData.prototype.varDescriptions["varSystemSpec"]);
        this.varSystemSpec().isRecorded(false);
        this.varSystemSpec().includeInGlobalVarList(false);
    }
    if (!this.varAgentSpec()) {
        this.varAgentSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Agent_Spec'));
        this.varAgentSpec().setDescription(ExpData.prototype.varDescriptions["varAgentSpec"]);
        this.varAgentSpec().isRecorded(false);
        this.varAgentSpec().includeInGlobalVarList(false);
    }
    if (!this.varBrowserVersionSpec()) {
        this.varBrowserVersionSpec((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'BrowserVersion_Spec'));
        this.varBrowserVersionSpec().setDescription(ExpData.prototype.varDescriptions["varBrowserVersionSpec"]);
        this.varBrowserVersionSpec().isRecorded(false);
        this.varBrowserVersionSpec().includeInGlobalVarList(false);
    }
    if (!this.varFullscreenSpec()) {
        this.varFullscreenSpec((new GlobalVar(this.expData)).initProperties('boolean', 'session', 'nominal', 'Always_Fullscreen'));
        this.varFullscreenSpec().resetStartValue();
        this.varFullscreenSpec().startValue().value(true);
        this.varFullscreenSpec().setDescription(ExpData.prototype.varDescriptions["varFullscreenSpec"]);
        this.varFullscreenSpec().isRecorded(false);
        this.varFullscreenSpec().includeInGlobalVarList(false);
    }
    if (!this.varRoleId()) {
        this.varRoleId((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Role_Id'));
        this.varRoleId().setDescription(ExpData.prototype.varDescriptions["varRoleId"]);
        this.varRoleId().isRecorded(false);
        this.varRoleId().includeInGlobalVarList(false);
    }

    if (!this.varMultiUserGroupId()) {
        this.varMultiUserGroupId((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Multi_User_Group_Id'));
        this.varMultiUserGroupId().setDescription(ExpData.prototype.varDescriptions["varMultiUserGroupId"]);
        this.varMultiUserGroupId().isRecorded(false);
        this.varMultiUserGroupId().includeInGlobalVarList(false);
    }
    if (!this.varDisplayedLanguage()) {
        this.varDisplayedLanguage((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Displayed_Language'));
        this.varDisplayedLanguage().setDescription(ExpData.prototype.varDescriptions["varDisplayedLanguage"]);
        this.varDisplayedLanguage().isRecorded(false);
        this.varDisplayedLanguage().includeInGlobalVarList(false);
    }
    if (!this.varPixelDensityPerMM()) {
        this.varPixelDensityPerMM((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Pixel_Density_PerMM'));
        this.varPixelDensityPerMM().setDescription(ExpData.prototype.varDescriptions["varPixelDensityPerMM"]);
        this.varPixelDensityPerMM().isRecorded(false);
        this.varPixelDensityPerMM().includeInGlobalVarList(false);
    }

    if (!this.varDisplayWidthX()) {
        this.varDisplayWidthX((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Window_Width_In_Pixels'));
        this.varDisplayWidthX().setDescription(ExpData.prototype.varDescriptions["varDisplayWidthX"]);
        this.varDisplayWidthX().isRecorded(false);
        this.varDisplayWidthX().includeInGlobalVarList(false);
    }

    if (!this.varDisplayWidthY()) {
        this.varDisplayWidthY((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Window_Height_In_Pixels'));
        this.varDisplayWidthY().setDescription(ExpData.prototype.varDescriptions["varDisplayWidthY"]);
        this.varDisplayWidthY().isRecorded(false);
        this.varDisplayWidthY().includeInGlobalVarList(false);
    }

    if (!this.varScreenTotalWidthX()) {
        this.varScreenTotalWidthX((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Screen_Width_In_Pixels'));
        this.varScreenTotalWidthX().setDescription(ExpData.prototype.varDescriptions["varScreenTotalWidthX"]);
        this.varScreenTotalWidthX().isRecorded(false);
        this.varScreenTotalWidthX().includeInGlobalVarList(false);
    }

    if (!this.varScreenTotalWidthY()) {
        this.varScreenTotalWidthY((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Screen_Height_In_Pixels'));
        this.varScreenTotalWidthY().setDescription(ExpData.prototype.varDescriptions["varScreenTotalWidthY"]);
        this.varScreenTotalWidthY().isRecorded(false);
        this.varScreenTotalWidthY().includeInGlobalVarList(false);
    }

    this.reAddEntities();

};


ExpData.prototype.checkForUnusedTasks = function () {

    var availableTasks = this.availableTasks();
    var taskByIds = {};
    $.each(availableTasks, function (index, task) {
        taskByIds[task.id()] = task;
    });

    var unused_task_found = false;
    var entities = this.entities();
    $.each(entities, function (index, entity) {
        if (entity instanceof ExpTrialLoop) {
            if (!taskByIds[entity.id()]) {
                console.log("unused task " + entity.name());
                unused_task_found = true;
            }
        }
    });

    if (unused_task_found) {
        this.deleteUnusedEntities();
    }

};


ExpData.prototype.deleteUnusedEntities = function () {
    this.entities([]);
    this.reAddEntities();
};

ExpData.prototype.isSystemVar = function (globalVar) {
    if (this.vars().indexOf(globalVar) >= 0) {
        return true;
    }
    else {
        return false;
    }
};


ExpData.prototype.deleteEntity = function (entity) {
    var idx = this.entities().indexOf(entity);
    if (idx >= 0) {
        this.entities.splice(idx, 1);
    }
};

ExpData.prototype.deleteGlobalVar = function (globalVar) {
    // allow deletion only if all back refs were removed:
    if (globalVar.backRefs().length == 0) {
        this.deleteEntity(globalVar);
    }
};

ExpData.prototype.addTranslation = function (translationEntry) {
    this.translations.push(translationEntry);
};

ExpData.prototype.getTaskFromFrameId = function (frameId) {

    var found = false;
    var taskName = "";
    var entities = this.entities();

    for (var i = 0; i < entities.length && found == false; i++) {
        var entity = entities[i];
        if (entity instanceof ExpTrialLoop) {
            var currTaskName = entity.name();
            var sequences = entity.subSequencePerFactorGroup();
            for (var k = 0; k < sequences.length && found == false; k++) {
                if (sequences[k] instanceof Sequence) {
                    var sequence = sequences[k];
                } else {
                    var sequence = this.entities.byId[sequences[k]];
                }
                var elements = sequence.elements();
                for (var j = 0; j < elements.length && found == false; j++) {
                    if (elements[j] instanceof FrameData || elements[j] instanceof PageData) {
                        var frame = elements[j];
                    } else {
                        var frame = this.entities.byId[elements[j]];
                    }

                    if (frame.id() === frameId) {
                        taskName = currTaskName;
                        found = true;
                    }
                }

            }

        }
    }
    return taskName;

};

ExpData.prototype.getFrameFromFrameElementId = function (frameElemId) {

    var found = false;
    var frameOrPage = null;
    var entities = this.entities();

    for (var i = 0; i < entities.length && found == false; i++) {
        var entity = entities[i];
        if (entity instanceof FrameData || entity instanceof PageData) {

            var elements = entity.elements();
            for (var j = 0; j < elements.length && found == false; j++) {
                if (elements[j] instanceof FrameElement || elements[j] instanceof PageElement) {
                    var element = elements[j];
                } else {
                    var element = this.entities.byId[elements[j]];
                }

                if (element.id() === frameElemId) {
                    frameOrPage = element;
                    found = true;
                }
            }



        }
    }
    return frameOrPage;

};



/**
 * should be called by the ui classes after a change was made to some sub datamodels of this expData.
 */
ExpData.prototype.notifyChanged = function () {
    this.parentExperiment.notifyChanged();
};

/**
 * adds a new subject group to the experiment.
 * @param group
 */
ExpData.prototype.addGroup = function (group) {
    this.availableGroups.push(group);
    this.addEntity(group);
    if (this.availableGroups().length > 1) {
        this.varSubjectNrPerSubjGroup().includeInGlobalVarList(true);
    }

    this.notifyChanged();
};

ExpData.prototype.addEntity = function (entity) {
    this.entities.insertIfNotExist(entity);
    if (entity.hasOwnProperty("reAddEntities")) {
        entity.reAddEntities(this.entities);
    }
};

ExpData.prototype.addNewSubjGroup = function () {
    var group = new SubjectGroup(this);
    var name = "group_" + (this.availableGroups().length + 1);
    group.name(name);
    this.addGroup(group);
};

ExpData.prototype.addTask = function (taskName, pageOrFrame, withFactor) {

    var expTrialLoop = new ExpTrialLoop(this);
    if (taskName) {
        expTrialLoop.name(taskName);
    }
    expTrialLoop.initNewInstance(pageOrFrame, withFactor);
    expTrialLoop.isInitialized(true);
    this.availableTasks.push(expTrialLoop);
    this.addEntity(expTrialLoop);
    this.notifyChanged();
};


ExpData.prototype.addNewBlock = function () {

    // add fixed instances of block into sequence
    var block = new ExpBlock(this);
    var name = "block_" + (this.availableBlocks().length + 1);
    block.name(name);
    this.availableBlocks.push(block);
    this.addEntity(block);
    this.notifyChanged();
};

ExpData.prototype.addNewSession = function () {

    // add fixed instances of block into sequence
    var session = new ExpSession(this);
    var name = "session_" + (this.availableSessions().length + 1);
    session.name(name);
    this.availableSessions.push(session);
    this.addEntity(session);
    this.notifyChanged();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.setPointers = function () {
    var self = this;
    var i;
    var allEntitiesArray = this.entities();

    // recursively call all setPointers:
    jQuery.each(allEntitiesArray, function (index, elem) {
        elem.setPointers(self.entities);
    });
    jQuery.each(allEntitiesArray, function (index, elem) {
        if (typeof elem.onFinishedLoading === "function") {
            elem.onFinishedLoading();
        }
    });

    // relink availableTasks:
    var availableTaskIds = this.availableTasks();
    var availableTasks = [];
    for (i = 0; i < availableTaskIds.length; i++) {
        availableTasks.push(this.entities.byId[availableTaskIds[i]]);
    }
    this.availableTasks(availableTasks);

    // relink availableBlocks:
    var availableBlockIds = this.availableBlocks();
    var availableBlocks = [];
    for (i = 0; i < availableBlockIds.length; i++) {
        availableBlocks.push(this.entities.byId[availableBlockIds[i]]);
    }
    this.availableBlocks(availableBlocks);

    // relink availableSessions:
    var availableSessionIds = this.availableSessions();
    var availableSessions = [];
    for (i = 0; i < availableSessionIds.length; i++) {
        availableSessions.push(this.entities.byId[availableSessionIds[i]]);
    }
    this.availableSessions(availableSessions);

    // relink availableGroups:
    var availableGroupIds = this.availableGroups();
    var availableGroups = [];
    for (i = 0; i < availableGroupIds.length; i++) {
        availableGroups.push(this.entities.byId[availableGroupIds[i]]);
    }
    this.availableGroups(availableGroups);

    // relink availableVars:
    var availableVarIds = this.availableVars();
    var availableVars = [];
    for (i = 0; i < availableVarIds.length; i++) {
        var variable = this.entities.byId[availableVarIds[i]];
        if (variable) {
            availableVars.push(variable);
        }
    }
    this.availableVars(availableVars);

    // relink variables
    var missingVar = false;
    for (i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        var varId = this[ExpData.prototype.fixedVarNames[i]]();
        var description = ExpData.prototype.varDescriptions[ExpData.prototype.fixedVarNames[i]];
        if (varId) {
            var varInstance = this.entities.byId[varId];
            varInstance.setDescription(description);
            this[ExpData.prototype.fixedVarNames[i]](varInstance);
        }
        else {
            missingVar = true;
        }
    }
    if (missingVar) {
        this.createVars();
    }

    // relink translations:
    jQuery.each(this.translations(), function (index, elem) {
        if (elem instanceof TranslationEntry) {
            elem.setPointers(self.entities);
        }
    });

    this.updateLanguage();

    // update current variable List
    var allEntities = this.entities();
    for (var i = 0; i < allEntities.length; i++) {
        if (allEntities[i].type == "GlobalVar") {

            this.availableVars.insertIfNotExist(allEntities[i]);

            if (allEntities[i].name()) {
                if (!(this.allVariables.hasOwnProperty(allEntities[i].name().toLowerCase()))) {
                    this.allVariables[allEntities[i].name().toLowerCase()] = allEntities[i];
                }
                else if (this.allVariables[allEntities[i].name().toLowerCase()] instanceof Array) {
                    this.allVariables[allEntities[i].name().toLowerCase()].push(allEntities[i]);
                }
                else {
                    var temp = this.allVariables[allEntities[i].name().toLowerCase()];
                    this.allVariables[allEntities[i].name().toLowerCase()] = [temp, allEntities[i]];
                }

            }

        }
    }
    if (this.variableSubscription) {
        this.variableSubscription.dispose();
    }
    this.variableSubscription = this.entities.subscribe(function (changes) {
        ko.utils.arrayForEach(changes, function (change) {
            if (change.value instanceof GlobalVar) {
                if (change.status == "added") {
                    self.addVarToHashList(change.value);
                    self.availableVars.insertIfNotExist(change.value);
                }
                else if (change.status == "deleted") {
                    self.deleteVarFromHashList(change.value, null);
                }

            }

        });
    }, null, "arrayChange");

    this.checkForUnusedTasks();
    // bugFix for event which are in entity list with undefined entry // TODO @ holger you might check this
    if (this.entities.byId["undefined"] != undefined) {
        delete this.entities.byId["undefined"];
    }

    // bug fix for wrong trial id variable name:
    if (this.varTrialId().name() != "Trial_Id") {
        this.varTrialId().name("Trial_Id");
    }

};


ExpData.prototype.getAllFactorsVars = function () {
    var Gvs = [];
    var self = this;
    Object.keys(this.allVariables).forEach(function (key, index) {
        var elem = self.allVariables[key];
        if (elem instanceof Array) {
            elem.forEach(function (subElem) {
                if (subElem.isFactor() && Gvs.indexOf(subElem) == -1) {
                    Gvs.push(subElem);
                }
            })
        }
        else {
            if (elem.isFactor() && Gvs.indexOf(elem) == -1) {
                Gvs.push(elem);
            }

        }
    });
    return Gvs;
};

ExpData.prototype.addVarToHashList = function (variable) {
    if (variable.name()) {
        if (!(this.allVariables.hasOwnProperty(variable.name().toLowerCase()))) {
            this.allVariables[variable.name().toLowerCase()] = variable;
        }
        else if (this.allVariables[variable.name().toLowerCase()] instanceof Array) {
            var idx = this.allVariables[variable.name().toLowerCase()].indexOf(variable);
            if (idx == -1) {
                this.allVariables[variable.name().toLowerCase()].push(variable);
            }

        }
        else {
            var temp = this.allVariables[variable.name().toLowerCase()];
            if (temp !== variable) {
                this.allVariables[variable.name().toLowerCase()] = [temp, variable];
            }

        }
    }
};

ExpData.prototype.getVarByName = function (varName) {
    var nameCaseInsensitive = varName.toLowerCase();
    var varCandidates = this.allVariables[nameCaseInsensitive];
    if (!varCandidates) {
        return null;
    }
    else if (varCandidates instanceof Array) {
        // check for case sensitive perfect match:
        var perfectMatches = varCandidates.filter(function (globVar) {
            return (globVar.name() == varName);
        });
        if (perfectMatches.length > 0) {
            // return the first found perfect match:
            return perfectMatches[0];
        }
        else {
            // no perfect match, so return first case insensitive match:
            return varCandidates[0];
        }
    }
    else if (varCandidates instanceof GlobalVar) {
        return varCandidates;
    }
    else {
        console.error("found invalid value in varName hashlist! return null...");
        return null;
    }
};

ExpData.prototype.deleteVarFromHashList = function (variable, oldName) {
    if (oldName) {
        var name = oldName;
    }
    else {
        var name = variable.name();
    }
    if (name && name != "") {
        if (this.allVariables.hasOwnProperty(name.toLowerCase())) {
            if (this.allVariables[name.toLowerCase()] instanceof Array) {
                var idx = this.allVariables[name.toLowerCase()].indexOf(variable);
                if (idx >= 0) {
                    this.allVariables[name.toLowerCase()].splice(idx, 1);
                }
            }
            else {
                delete this.allVariables[name.toLowerCase()];
            }
        }
    }


};


ExpData.prototype.varNameValid = function (varName) {
    if (varName == "" || this.allVariables.hasOwnProperty(varName)) {
        return false;
    }
    else {
        return true;
    }
};

ExpData.prototype.varNameValidExisting = function (varName) {
    if (this.allVariables.hasOwnProperty(varName)) {
        if (this.allVariables[varName] instanceof Array) {
            if (this.allVariables[varName].length <= 1) {
                return true
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
    else {
        return true;
    }
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.reAddEntities = function () {
    var entitiesArr = this.entities;

    jQuery.each(this.availableTasks(), function (index, task) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(task.id())) {
            entitiesArr.push(task);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        task.reAddEntities(entitiesArr);
    });

    jQuery.each(this.availableBlocks(), function (index, block) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(block.id())) {
            entitiesArr.push(block);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        block.reAddEntities(entitiesArr);
    });

    jQuery.each(this.availableSessions(), function (index, session) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(session.id())) {
            entitiesArr.push(session);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        session.reAddEntities(entitiesArr);
    });

    jQuery.each(this.availableGroups(), function (index, group) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(group.id()))
            entitiesArr.push(group);

        // recursively make sure that all deep tree nodes are in the entities list:
        group.reAddEntities(entitiesArr);
    });

    jQuery.each(this.availableVars(), function (index, globVar) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(globVar.id()))
            entitiesArr.push(globVar);

        // recursively make sure that all deep tree nodes are in the entities list:
        //  globVar.reAddEntities(entitiesArr);
    });

    for (var i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        var varInstance = this[ExpData.prototype.fixedVarNames[i]]();
        if (varInstance) {
            if (!entitiesArr.byId.hasOwnProperty(varInstance.id())) {
                entitiesArr.push(varInstance);
            }
        }
    }
};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpData}
 */
ExpData.prototype.fromJS = function (data) {
    var self = this;

    if (data.hasOwnProperty('dateLastModified')) {
        this.dateLastModified(data.dateLastModified);
    }

    if (data.hasOwnProperty('isJointExp')) {
        this.isJointExp(data.isJointExp);
    }

    if (data.hasOwnProperty('numPartOfJointExp')) {
        this.numPartOfJointExp(data.numPartOfJointExp);
    }

    if (data.hasOwnProperty('jointOptionModified')) {
        this.jointOptionModified(data.jointOptionModified);
    }

    if (data.hasOwnProperty('entities')) {
        this.entities([]);
        jQuery.each(data.entities, function (idx, entityJson) {
            var entity = entityFactory(entityJson, self);
            if (entity instanceof ExpEvent) {
                return; // bug fix for old experiments... ExpEvent's are not saved seperated, but are always saved as part of their parent.
            }
            if (entity) {
                self.entities.insertIfNotExist(entity);
            }
        })
    }

    if (data.studySettings) {
        this.studySettings = new StudySettings(this.expData);
        this.studySettings.fromJS(data.studySettings);

    }

    this.availableTasks(data.availableTasks);
    this.availableBlocks(data.availableBlocks);
    this.availableSessions(data.availableSessions);
    this.availableGroups(data.availableGroups);
    if (data.hasOwnProperty("availableVars")) {
        this.availableVars(data.availableVars);
    }

    if (data.hasOwnProperty('translations')) {
        this.translations(jQuery.map(data.translations, function (entryData) {
            if (entryData == "removedEntry") {
                return "removedEntry";
            }
            else {
                var entry = new TranslationEntry(self);
                entry.fromJS(entryData);
                return entry;
            }
        }));
    }

    if (data.hasOwnProperty('availableTranslations')) {
        this.translatedLanguages(data.availableTranslations);
    }
    else if (data.hasOwnProperty('translatedLanguages')) {
        this.translatedLanguages(data.translatedLanguages);
    }
    if (data.hasOwnProperty('customizedStaticStrings')) {
        this.customizedStaticStrings = data.customizedStaticStrings;
    }
    if (data.hasOwnProperty('confirmedVariables')) {
        this.confirmedVariables(data.confirmedVariables);
    }



    for (var i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        var varName = ExpData.prototype.fixedVarNames[i];
        // varTimeMeasureSpecMax
        if (varName === undefined) {
            var oldVarName = ExpData.prototype.oldFixedVarNames[i];
            this[varName](data[oldVarName]);
        }
        else {
            this[varName](data[varName]);
        }
    }

    return this;
};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpData.prototype.toJS = function () {
    var i;

    var sessionsPerGroup = [];
    var groups = this.availableGroups();
    for (i = 0; i < groups.length; i++) {
        sessionsPerGroup.push(groups[i].sessions().length);
    }

    var studySettings = null;
    if (this.studySettings) {
        studySettings = this.studySettings.toJS();
    }

    this.dateLastModified(getCurrentDate(this.studySettings.timeZoneOffset()));

    var data = {
        dateLastModified: this.dateLastModified(),
        isJointExp: this.isJointExp(),
        numPartOfJointExp: this.numPartOfJointExp(),
        jointOptionModified: this.jointOptionModified(),
        availableTasks: jQuery.map(this.availableTasks(), function (task) { return task.id(); }),
        availableBlocks: jQuery.map(this.availableBlocks(), function (block) { return block.id(); }),
        availableSessions: jQuery.map(this.availableSessions(), function (session) { return session.id(); }),
        availableGroups: jQuery.map(this.availableGroups(), function (group) { return group.id(); }),
        availableVars: jQuery.map(this.availableVars(), function (globVar) { return globVar.id(); }),
        numGroups: this.availableGroups().length,
        sessionsPerGroup: sessionsPerGroup,
        translations: jQuery.map(this.translations(), function (entry) {
            if (entry == null || entry == "removedEntry") {
                return "removedEntry";
            }
            else if (typeof entry.namedEntity === 'undefined') {
                return "removedEntry";
            }
            else {
                return entry.toJS();
            }
        }),
        translatedLanguages: this.translatedLanguages(),
        studySettings: studySettings,
        customizedStaticStrings: this.customizedStaticStrings,
        entities: jQuery.map(this.entities(), function (entity) { return entity.toJS(); }),
        confirmedVariables: this.confirmedVariables(),
    };

    // add all variable ids:
    for (i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        var varName = ExpData.prototype.fixedVarNames[i];
        data[varName] = this[varName]().id();
    }

    return data;
};
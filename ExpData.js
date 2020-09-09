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

    this.translations = ko.observableArray([]);
    this.translatedLanguages = ko.observableArray([]);
    this.languageTransferOption = ko.observable('empty');

    this.translationsEnabled = ko.computed(function () {
        if (self.translations().length > 0) {
            return true;
        }
        else {
            return false;
        }
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
    'varGazeXEMPTY',
    'varGazeYEMPTY',
    'varRoleIdEMPTY',
    'varDisplayedLanguageEMPTY',
    'varPixelDensityPerMMEMPTY',

    // 'varTimeMeasureSpecMaxEMPTY',
];

ExpData.prototype.fixedVarNames = [
    'varSubjectCode',
    'varSubjectNr',
    'varSubjectNrPerSubjGroup',
    'varGroupName',
    'varSessionTimeStamp',
    'varSessionTimeStampEnd',
    'varSessionName',
    'varSessionNr',
    'varBlockName',
    'varBlockNr',
    'varTaskName',
    'varTaskNr',
    'varTrialId',
    'varTrialNr',
    'varConditionId',

    'varBrowserSpec',
    'varSystemSpec',
    'varAgentSpec',
    'varBrowserVersionSpec',
    'varFullscreenSpec',
    'varTimeMeasureSpecMean',
    'varTimeMeasureSpecStd',

    'varCrowdsourcingCode',
    'varCrowdsourcingSubjId',
    'varGazeX',
    'varGazeY',
    'varRoleId',
    'varDisplayedLanguage',
    'varPixelDensityPerMM',

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
    'varGazeX': 'The variable "GazeX" is used for webcam based Eyetracking stduies. The value holds the current estimated value of the Gaze/Eye Position in X coordinates. This value can be used for calibration and as a "fixation trigger".',
    'varGazeY': 'The variable "GazeY" is used for webcam based Eyetracking stduies. The value holds the current estimated value of the Gaze/Eye Position in Y coordinates. This value can be used for calibration and as a "fixation trigger".',
    'varDisplayedLanguage': 'The variable "Displayed Language" holds the value of the selected display language, only if there were 2 or more languages to select from. This value can be used to show different content, i.e. texts for different language settings.',
    'varPixelDensityPerMM': 'This variable hold the number of pixels per millimeter of the screen.',

    // {'varTimeMeasureSpecMax':''},
};


ExpData.prototype.staticTranslations = {
    English: {
        library: "Library",
        langSelect: "This study is available in multiple languages.",
        studyLanguage: "Study Language:",
        continue: "Continue",
        submit: "Submit",
        confirm: "Confirm",
        initialSurvey: "Please fill out the fields below (required fields are marked with *):",
        yourGender: "Gender",
        yourGenderMale: "Male",
        yourGenderFemale: "Female",
        yourAge: "Your Age",
        years: "years",
        yourCountry: "Country/Location",
        yourFirstLang: "First Language",
        yourEmail: "Email",
        errorGender: "Gender missing",
        errorAge: "Age missing",
        errorCountry: "Country missing",
        errorLanguage: "Language missing",
        errorEmail: "Email missing",
        errorSessionNotReady: "You can currently not take part in this experiment because this study can only be started at certain times.",
        errorSessionStartIn: "You can start this session in",
        refresh: "Refresh",
        errorSessionOver: "You can currently not take part in this experiment because there is no starting time window defined for this study.",
        loading1: "Loading experiment...",
        loading2: "Loading, please wait",
        loading3: "This might take a while.",
        loadingComplete: "Loading Complete!",
        canStart: "You can now start the experiment. This will switch your browser into fullscreen mode.",
        keepFullscreen: "Please note that during the experiment you should never press escape or use the \"backward\" button in your browser.",
        start: "Start",
        playerErrorNoSubjGroup: "Error: there is no subject group defined in the experiment.",
        playerErrorNoSession: "Error: there is no session defined in the subject group in the experiment.",
        playerErrorNoBlock: "Error: there is no block defined in this experiment session.",
        startingExp: "Starting Experiment...",
        startingIn: "Starting in ",
        calibrateIntro: "Distance and screen size are needed for the calibration:",
        calibrateMethod1: "Specify your screen size manually if you know the size of your monitor.",
        calibrateScreenSize: "Screen size (diagonal):",
        calibrateInches: "inches",
        calibrateMethod2: "Use a standardized ID card (85.60 × 53.98 mm) or any other card of the same size against the screen and try to match the size of the displayed card. " +
            "You can change the size of the image by dragging the arrow. The calibration is correct if the image exactly matches the size of the card.",
        endExpMsg: "Thank you! The experiment session is finished.",
        goToLib: "Go to experiment library",
        chooseSelection: "Please Choose...",
        answerPlaceholder: "Participant Answer...",
        endExpMsgTest: "The test recording of this task is over. To test the whole experiment or to record data, start the study under 'Run' in the navigation panel.",
        participationAgreement1: " I agree that all the personal data, which I provide here and all my responses will be recorded, and can be used for research purposes in a pseudonymised way. I also agree to the",
        participationAgreement2: "of the Scicovery GmbH for recording, storing, and handling, participant data.",
        multiUserExpLobby: "Multiple Participant Experiment",
        participantsInLobby: "Participants in lobby:",
        readyToStart: "Ready to start?",
        waitingForOtherParticipants: "Waiting for more participants...",
        experimentStartsShortly: "Your experiment will start shortly...",
        successfullyMatched_1: "Successfully matched. Press ",
        successfullyMatched_2: " to proceed to experiment!",
        continueJointExpLobby: "continue",
        jointExpTestConnection: "Testing your internet connection. please wait for 30 seconds...",
        yourCrowdsourcingID: "Your worker / crowdsourcing ID (*):",
        AdLibraryEndOfStudy: "Take part in more exiting behavioral experiments:",
        AdRegisterEndOfStudy: "OR register and build your own study for free:",
        inviteFriendMultiUser1: "Need another player? Invite a friend!",
        inviteFriendMultiUser2: "Your Name:",
        inviteFriendMultiUser3: "Your Friends' Email:",
        inviteFriendMultiUser4: "Invite",
        customRequirement: "Hereby I confirm that I accept the terms and conditions of this study and fulfill the following participation requirements as stated below:",
        askEmailConsent1: "Why do we ask for your Email: ",
        askEmailConsent2: "This is a longitudinal study, consisting of several participation sessions. Your email will only be recoded in order to invite/remind you to take part in the next session. Your Email will not be stored together with other kinds of data, and is accessible only internally to the Labvanced platform. We will not give away " +
            "your email or use it for different purposes.",
        calibDistance1: "Your distance to the screen (in cm) is: ",
        calibDistance2: "centimeter",
        requestPermissionHeader: "Device permissions required",
        requestPermissionBody: "This experiment requires access to your webcam or microphone. In the following screen, please allow access to your webcam or microphone device to continue.",
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
                "<li>the environment and lightning conditions did not change.</li>" +
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
                "<li>the environment and lightning conditions did not change.</li>" +
                "</ul></p>",
            instructionsPreEnvironmentInfant: "<h3>Calibration of eye tracker</h3>" +
                "<p><b>Instruction for parents: Please read carefully</b></p>" +
                "<p>To use your webcam for eye tracking, it needs to " +
                "be calibrated for your specific environment. This will take about 1-2 minutes. " +
                "Before starting, please make sure that:</p>" +
                "<ul>" +
                "<li>Your child sits comfortably on your lab.</li>" +
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
                "</ul>"
        }
    },
    German: {
        library: "Experimente",
        langSelect: "Diese Studie ist in mehreren Sprachen verfügbar.",
        studyLanguage: "Studiensprache:",
        continue: "Weiter",
        submit: "Ok",
        confirm: "Bestätigen",
        initialSurvey: "Bitte füllen Sie die untenstehenden Felder aus (Pflichtfelder sind mit * gekennzeichnet):",
        yourGender: "Geschlecht",
        yourGenderMale: "Männlich",
        yourGenderFemale: "Weiblich",
        yourAge: "Dein Alter",
        years: "Jahre",
        yourCountry: "Land / Aufenthaltsort",
        yourFirstLang: "Muttersprache",
        yourEmail: "Email",
        errorGender: "Geschlecht fehlt",
        errorAge: "Age fehlt",
        errorCountry: "Land fehlt",
        errorLanguage: "Sprache fehlt",
        errorEmail: "Email fehlt",
        errorSessionNotReady: "Sie können derzeit nicht an diesem Experiment teilnehmen, da diese Studie nur zu bestimmten Zeiten gestartet werden kann.",
        errorSessionStartIn: "Sie können diese Sitzung starten in",
        refresh: "Aktualisieren",
        errorSessionOver: "Sie können derzeit nicht an diesem Experiment teilnehmen, da für diese Studie kein Startzeitfenster definiert ist.",
        loading1: "Lade experiment...",
        loading2: "Lade, bitte warten",
        loading3: "Dies kann eine Weile dauern.",
        loadingComplete: "Fertig geladen!",
        canStart: "Sie können nun das Experiment starten. Dies schaltet Ihren Browser in den Vollbildmodus um.",
        keepFullscreen: "Bitte beachten Sie, dass Sie während des Experiments niemals die Escape-Taste drücken oder die Schaltfläche \"Zurück\" in Ihrem Browser verwenden sollten.",
        start: "Start",
        playerErrorNoSubjGroup: "Fehler: Im Experiment ist keine Versuchspersonengruppe definiert.",
        playerErrorNoSession: "Fehler: in der Versuchspersonengruppe ist keine Experimentssitzung definiert.",
        playerErrorNoBlock: "Fehler: In dieser Experimentssitzung ist kein Versuchsblock definiert.",
        startingExp: "Experiment wird gestartet...",
        startingIn: "Start in ",
        calibrateIntro: "Sitzabstand und Bildschirmgröße sind notwendig für die Kalibrierung:",
        calibrateMethod1: "Geben Sie Ihre Bildschirmgröße manuell an, wenn Sie die Größe Ihres Monitors kennen.",
        calibrateScreenSize: "Bildschirmgröße (Diagonal):",
        calibrateInches: "Inch",
        calibrateMethod2: "Halten Sie einen standardisierten Ausweis (85.60 × 53.98 mm) oder eine andere Karte der gleichen Größe gegen den Bildschirm und versuchen Sie, die Größe der angezeigten Karte anzupassen. " +
            "Sie können die Größe des Bildes durch Ziehen des Pfeils ändern. Die Kalibrierung ist korrekt, wenn das Bild genau der Größe der Karte entspricht.",
        endExpMsg: "Vielen Dank! Die Experimentssitzung ist beendet.",
        goToLib: "Gehe zur Experiment-Bibliothek",
        chooseSelection: "Bitte Auswählen...",
        answerPlaceholder: "Teilnehmer Antwort",
        endExpMsgTest: "Die Test-Aufnahme dieses Taks ist beendet. Um das ganze Experiment zu testen, oder um Daten aufzunehmen, starten Sie die Studie unter 'Run' in der Navigationsleite.",
        participationAgreement1: "Ich stimme zu, dass alle persönlichen Daten, die ich hier zur Verfügung stelle, und alle meine Antworten aufgezeichnet werden und zu Forschungszwecken pseudonymisiert verwendet werden dürfen. Zudem stimme ich den",
        participationAgreement2: "der Scicovery GmbH bzgl Datenaufnahme, Datenspeicherung, und Datenverwaltung von Teilnehmerdaten zu.",
        multiUserExpLobby: "Experiment mit mehreren Teilnehmern",
        participantsInLobby: "Teilnehmer in der Lobby:",
        readyToStart: "Bereit zum Start?",
        waitingForOtherParticipants: "Warte auf weitere Teilnehmer...",
        experimentStartsShortly: "Das Experiment startet in Kürze...",
        successfullyMatched_1: "Sie wurden erfolgreich einem Experiment zugeteilt. Drücken Sie",
        successfullyMatched_2: "um zu dem Experiment zu gelangen!",
        continueJointExpLobby: "Weiter,",
        jointExpTestConnection: "Ihre Internet-Verbindung wird getestet. Bitte warten Sie ca. 30 Sekunden...",
        yourCrowdsourcingID: "Ihre Worker / Crowdsourcing Id (*):",
        AdLibraryEndOfStudy: "Nehmen Sie an weiteren spannenden Online Verhaltensstudien teil:",
        AdRegisterEndOfStudy: "Oder registrieren Sie sich und erstellen komplett gratis Ihre eigene Studie:",
        inviteFriendMultiUser1: "Brauchen Sie einen Mitspieler? Landen Sie doch einen Freund ein!",
        inviteFriendMultiUser2: "Ihr Name:",
        inviteFriendMultiUser3: "Die Email Adresse Ihres Freundes:",
        inviteFriendMultiUser4: "Einladen",
        customRequirement: "Ich bestätige hiermit, dass ich mit den folgenden Regeln und Bedingungen der Studie einverstanden bin und folgende Teilnahmebedingungen vollständig erfülle:",
        askEmailConsent1: "Warum fragen wir nach Ihrer E-Mail: ",
        askEmailConsent2: "Dies ist eine Längsschnittstudie, die aus mehreren Teilnahme-Sitzungen besteht. Ihre E-Mail wird nur neu erfasst, um Sie zur Teilnahme an der nächsten Sitzung einzuladen. Ihre E-Mail wird nicht zusammen mit anderen Arten von Daten gespeichert und ist nur intern für die Labvanced-Plattform zugänglich. Wir geben Ihre E-Mail nicht weiter oder verwenden sie für andere Zwecke.",
        calibDistance1: "Ihre Distanz zum Bildschirm beträgt:",
        calibDistance2: "Centimeter",
        requestPermissionHeader: "Geräteberechtigungen erforderlich",
        requestPermissionBody: "Die Teilnahme an diesem Experiment benötigt Zugriff auf Ihre Webcam oder Ihr Microphone. Um fortzufahren, erlauben Sie bitte auf dem folgenden Bildschirm den Zugriff auf Ihre Webcam oder Ihr Mikrofon.",
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

            Countdown1: "Gut! Behalten Sie jetzt bitte diese Kopfhaltung bei... Beginnen Sie in ",
            poseError: "<p>Sie haben die Kopfhaltung verloren. Bitte richten Sie Ihre Kopfhaltung wieder auf das grüne Netz aus:</p>",
            screenResolutionError: "Die Bildschirmauflösung wurde geändert. Bitte starten Sie die Kalibrierung neu",


            instructionsExistingCalibDataFoundAdult: "<h3>Augenverfolgungs-Kalibrierung</h3>" +
                "<p>Wir haben frühere Kalibrierungsdaten in Ihrem Browser-Cache gefunden. Sie können die Kalibrierung überspringen, wenn:" +
                "<ul>" +
                "<li>Sie sind dieselbe Person, die sich in der vorherigen Sitzung kalibriert hat.</li>" +
                "<li>die Umwelt- und Blitzbedingungen haben sich nicht verändert. </li>" +
                "</ul><</p>",
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
                "<li>Bitte achten Sie darauf, dass auch die Neigungs- und Orientierung Ihres Kopfes angenehm ist.</li>" +
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
                "<li>die Umwelt- und Blitzbedingungen haben sich nicht verändert. </li>" +
                "</ul><</p>",
            instructionsPreEnvironmentInfant: "<h3>Kalibrierung des Eyetrackers</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b><</p>" +
                "<p>Um Ihre Webcam für die Blickverfolgung zu verwenden, muss sie " +
                "für Ihre spezifische Umgebung kalibriert werden. Dies wird etwa 1-2 Minuten dauern. " +
                "Bevor Sie beginnen, vergewissern Sie sich bitte, dass:</p>" +
                "<ul>" +
                "<li>Ihr Kind sitzt bequem auf Ihrem Labor. </li>" +
                "<li>Es ist keine helle Lichtquelle (Fenster, Lampe) hinter Ihnen im Bild sichtbar.</li>" +
                "<li>Ihr Kind trägt keine Brille.</li>" +
                "</ul>",
            instructionsEnvironmentInfant: "",
            instructionsPrePositioningInfant: "<h3>Schritt 1: Mittelposition setzen</h3>" +
                "<p><b>Unterweisung für Eltern: Der Eyetracker wird für eine bestimmte Kopfhaltung kalibriert. " +
                "Bitte stellen Sie sicher, dass:</b><</p>" +
                "<ul>" +
                "<li>Das Gesicht Ihres Kindes ist auf dem Video sichtbar und wird mit einem blauen Netz erkannt, während es auf den Bildschirm schaut (nicht auf Ihr Gesicht).</li>" +
                "<li>Die Position / Kopfhaltung ist für Sie und Ihr Kind bequem und kann für den Rest der Studie ohne viel Bewegung beibehalten werden.</li>" +
                "</ul>",
            instructionsPositioningInfant: "",
            instructionsPositioningCheckInfant: "<h3>Schritt 2: Mittelposition setzen</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b><</p>" +
                "<p>Wollen Sie diese Pose (grünes Netz) verwenden oder zurückgehen?</p>" +
                "<ul>" +
                "<li>Ist die Pose dem Bildschirm zugewandt und für Ihr Kind bequem?</li>" +
                "<li>Ist die Pose ungefähr horizontal zentriert und das Gesicht gut sichtbar?</li>" +
                "<li>Wenn man nicht zurückgehen und die Mittelstellung neu definieren will.</li>" +
                "</ul>",
            instructionsPreCalibInfant: "<h3>Schritt 3: Kalibrierung</h3>" +
                "<p><b>Unterweisung für Eltern: Bitte lesen Sie sorgfältig </b><</p>" +
                "<ul>" +
                "<li>Jetzt beginnt die Kalibrierung. Bitte bewegen Sie die Webcam oder den Bildschirm NICHT mehr, sonst wird die Kalibrierung fehlschlagen.</li>" +
                "<li>Wir präsentieren Tiere an verschiedenen Positionen auf dem Bildschirm und zeichnen den Blick Ihres Kindes auf, wenn es diese Tiere ansieht.</li>" +
                "<li> Damit die Kalibrierung funktioniert, muss Ihr Kind diese Tiere anschauen und in einer stabilen Position auf Ihrem Labor sitzen, ohne starke Kopfbewegungen während und nach der Kalibrierung.</li>" +
                "</ul>"

        }

    },
    Spanish: {
        library: "Biblioteca",
        langSelect: "Este estudio está disponible en varios idiomas.",
        studyLanguage: "Idioma del estudio:",
        continue: "Seguir",
        submit: "Enviar",
        confirm: "Confirmar",
        initialSurvey: "Por favor, rellene los siguientes campos (los campos obligatorios están marcados con un *): ",
        yourGender: "Género",
        yourGenderMale: "Masculino",
        yourGenderFemale: "Femenino",
        yourAge: "Tu Edad",
        years: "años",
        yourCountry: "País / Ubicación",
        yourFirstLang: "Primer Idioma",
        yourEmail: "Correo Electrónico",
        errorGender: "Falta el género",
        errorAge: "Falta la edad",
        errorCountry: "Falta el país",
        errorLanguage: "Falta el idioma",
        errorEmail: "Falta el correo electrónico",
        errorSessionNotReady: "Actualmente no puede participar en este experimento porque este estudio solo puede iniciarse en un horario concreto",
        errorSessionStartIn: "Puedes comenzar esta sesión en",
        refresh: "Actualizar",
        errorSessionOver: "Actualmente no puede participar en este experimento porque aun no se ha definido la hora de inicio del estudio.",
        loading1: "Cargando el experimento...",
        loading2: "Cargando, por favor espere",
        loading3: "Esto aún puede tardar.",
        loadingComplete: "Carga completada!",
        canStart: "Ahora puede comenzar el experimento. Esto cambiará su navegador al modo de pantalla completa.",
        keepFullscreen: "Tenga en cuenta que durante el experimento nunca debe presionar escape o usar el botón \"hacia atrás\" en su navegador.",
        start: "Comience",
        playerErrorNoSubjGroup: "Error: no hay un grupo de sujetos definido en el experimento.",
        playerErrorNoSession: "Error: no hay una sesión definida en el grupo de sujetos en el experimento.",
        playerErrorNoBlock: "Error: no hay un bloque definido en esta sesión de experimento.",
        startingExp: "Iniciando el experimento...",
        startingIn: "Comenzando en ",
        calibrateIntro: "La distancia y el tamaño de la pantalla son necesarios para la calibración: ",
        calibrateMethod1: "Especifique el tamaño de su pantalla manualmente si conoce el tamaño de su monitor.",
        calibrateScreenSize: "Tamaño de pantalla (diagonal):",
        calibrateInches: "pulgadas",
        calibrateMethod2: "Utilice una tarjeta de identificación estandarizada(85.60 × 53.98 mm) o cualquier otra tarjeta del mismo tamaño contra la pantalla e intente hacerla coincidir con el tamaño de la tarjeta que se muestra. " +
            "Puede cambiar el tamaño de la imagen arrastrando la flecha.La calibración será correcta si la imagen coincide exactamente con el tamaño de la tarjeta.",
        endExpMsg: "¡Gracias! La sesión experimental ha finalizado.",
        goToLib: "Ir a la biblioteca de experimentos",
        chooseSelection: "Por favor elija...",
        answerPlaceholder: "Respuesta del participante...",
        endExpMsgTest: "La grabación de prueba de esta tarea ha terminado.Para probar todo el experimento o registrar datos, comience el estudio en 'Ejecutar' en el panel de navegación.",
        participationAgreement1: " Acepto que todos los datos personales que proporciono aquí y todas mis respuestas se registrarán y se podrán utilizar para fines de investigación de forma seudónima. También estoy de acuerdo con el",
        participationAgreement2: "de Scicovery GmbH para el registro, almacenamiento y manejo de los datos de los participantes.",
        multiUserExpLobby: "Experimento de participantes múltiples",
        participantsInLobby: "Participantes en el lobby:",
        readyToStart: "¿Listo para comenzar?",
        waitingForOtherParticipants: "Esperando a más participantes...",
        experimentStartsShortly: "Su experimento comenzará en breve....",
        successfullyMatched_1: "Emparejado correctamente. Continúe",
        successfullyMatched_2: " para continuar con el experimento!",
        continueJointExpLobby: "Continuar",
        jointExpTestConnection: "Compruebe su conexión a internet. Por favor, espere 30 segundos...",
        yourCrowdsourcingID: "Su identificación de trabajador / crowdsourcing(*): ",
        AdLibraryEndOfStudy: "Participe en más experimentos comportamentales:",
        AdRegisterEndOfStudy: "O regístrese y cree su propio estudio gratis: ",
        inviteFriendMultiUser1: "¿Necesitas otro jugador? Invite a un amigo!",
        inviteFriendMultiUser2: "Su nombre:",
        inviteFriendMultiUser3: "El correo electrónico de sus amigos:",
        inviteFriendMultiUser4: "Invite",
        customRequirement: "Por la presente confirmo que acepto los términos y condiciones de este estudio y cumplo con los siguientes requisitos de participación como se indica a continuación: ",
        askEmailConsent1: "Por qué solicitamos su correo electrónico: ",
        askEmailConsent2: "Este es un estudio longitudinal, que consta de varias sesiones.Su correo electrónico solo será recodificado para invitarle / recordarle que participe en la próxima sesión.Su correo electrónico no se almacenará junto con otro tipo de datos, y solo es accesible internamente a la plataforma Labvanced.No se lo revelaremos a nadie" +
            "su correo electrónico o úselo para diferentes propósitos.",
        calibDistance1: "Su distancia a la pantalla (en cm) es: ",
        calibDistance2: "centímetro",
        requestPermissionHeader: "Requiere permiso del dispositivo",
        requestPermissionBody: "Este experimento requiere el acceso a su cámara web o micrófono. En la siguiente pantalla, permite el acceso a tu cámara web o al micrófono para continuar.",
    },

    Portuguese: {
        library: "Biblioteca",
        langSelect: "Este estudo está disponível em vários idiomas.",
        studyLanguage: "Lingua do estudo:",
        continue: "Continuar",
        submit: "Submeter",
        confirm: "Confirmar",
        initialSurvey: "Preencha os campos abaixo (os campos obrigatórios estão marcados com *):",
        yourGender: "Sexo",
        yourGenderMale: "Masculino",
        yourGenderFemale: "Feminino",
        yourAge: "Sua idade",
        years: "anos",
        yourCountry: "País/Localização",
        yourFirstLang: "Língua materna",
        yourEmail: "Email",
        errorGender: "Sexo ausente",
        errorAge: "Idade ausente",
        errorCountry: "País ausente",
        errorLanguage: "Língua ausente",
        errorEmail: "Email ausente",
        errorSessionNotReady: "No momento, você não pode participar deste experimento porque este estudo só pode ser iniciado em determinados momentos.",
        errorSessionStartIn: "Você pode iniciar esta sessão em",
        refresh: "Atualizar",
        errorSessionOver: "No momento, você não pode participar deste experimento porque não há uma janela de tempo de início definida para este estudo.",
        loading1: "Carregando experimento...",
        loading2: "Carregando, por favor espere",
        loading3: "Isto pode levar um tempo.",
        loadingComplete: "Carregamento Completo!",
        canStart: "Agora você pode iniciar o experimento. Isso mudará seu navegador para o modo de tela inteira.",
        keepFullscreen: "Observe que, durante a experiência, você nunca deve pressionar escape ou usar o botão \"voltar \" do seu navegador.",
        start: "Começar",
        playerErrorNoSubjGroup: "Erro: não há grupo de assuntos definido no experimento.",
        playerErrorNoSession: "Erro: não há sessão definida no grupo de sujeitos no experimento.",
        playerErrorNoBlock: "Erro: não há bloco definido nesta sessão de experimento.",
        startingExp: "Iniciando Experimento...",
        startingIn: "Iniciando em ",
        calibrateIntro: "A distância e o tamanho da tela são necessários para a calibração:",
        calibrateMethod1: "Especifique o tamanho da tela manualmente se você souber o tamanho do seu monitor.",
        calibrateScreenSize: "Tamanho da tela (diagonal):",
        calibrateInches: "polegadas",
        calibrateMethod2: "Use um cartão de identificação padronizado (85,60 × 53,98 mm) ou qualquer outro cartão do mesmo tamanho contra a tela e tente corresponder ao tamanho do cartão exibido. " +
            "Você pode alterar o tamanho da imagem arrastando a seta. A calibração estará correta se a imagem corresponder exatamente ao tamanho do cartão.",
        endExpMsg: "Obrigado! A sessão de experimento terminou.",
        goToLib: "Vá para a biblioteca de experimentos",
        chooseSelection: "Por favor escolha...",
        answerPlaceholder: "Resposta do participante ...",
        endExpMsgTest: "A gravação de teste desta tarefa acabou. Para testar todo o experimento ou registrar dados, inicie o estudo em 'Executar' no painel de navegação.",
        participationAgreement1: " Concordo que todos os dados pessoais que forneço aqui e todas as minhas respostas serão registrados e podem ser usados ​​para fins de pesquisa de forma pseudonimizada. Eu também concordo com o",
        participationAgreement2: "da Scicovery GmbH para registro, armazenamento e tratamento de dados de participantes.",
        multiUserExpLobby: "Experimento de Múltiplos Participantes",
        participantsInLobby: "Participantes presentes:",
        readyToStart: "Pronto para começar?",
        waitingForOtherParticipants: "Esperando por mais participantes...",
        experimentStartsShortly: "Seu experimento começará em breve...",
        successfullyMatched_1: "Combinação realizada com sucesso. Pressione ",
        successfullyMatched_2: " para prosseguir com a experiência!",
        continueJointExpLobby: "continuar",
        jointExpTestConnection: "Testando sua conexão com a Internet. Por favor aguarde 30 segundos ...",
        yourCrowdsourcingID: "Seu ID de trabalho/ crowdsourcing ID (*):",
        AdLibraryEndOfStudy: "Participe de experiências comportamentais mais emocionantes:",
        AdRegisterEndOfStudy: "OU registre-se e crie seu próprio estudo gratuitamente:",
        inviteFriendMultiUser1: "Precisa de outro jogador? Convidar um amigo!",
        inviteFriendMultiUser2: "Seu Nome:",
        inviteFriendMultiUser3: "O E-mail de seu colega:",
        inviteFriendMultiUser4: "Convidar",
        customRequirement: "Por meio deste, eu confirmo que aceito os termos e condições deste estudo e cumpro os seguintes requisitos de participação conforme declarado abaixo:",
        askEmailConsent1: "Por que pedimos seu e-mail: ",
        askEmailConsent2: "Este é um estudo longitudinal, constituído por várias sessões de participação. Seu e-mail será recodificado somente para convidar / lembra-lo de participar da próxima sessão. Seu e-mail não será armazenado junto com outros tipos de dados e está acessível apenas internamente na plataforma Labvanced. Não vamos dar " +
            "seu e-mail ou usa-lo para finalidades diferentes.",
        calibDistance1: "Sua distância da tela (em cm) é: ",
        calibDistance2: "centímetros",
        requestPermissionHeader: "Permissão de Dispositivo Necessária",
        requestPermissionBody: "Este experimento requer acesso à sua webcam ou microfone. Permita o acesso à sua webcam ou microfone para continuar."
    },
};


ExpData.prototype.updateLanguage = function () {
    var langIdx = this.currentLanguage();
    var langStr = this.translatedLanguages()[langIdx];

    // use static translations if they exist for the selected language or otherwise use english for static texts:
    if (ExpData.prototype.staticTranslations.hasOwnProperty(langStr)) {
        this.staticStrings(ExpData.prototype.staticTranslations[langStr]);
    }
    else {
        this.staticStrings(ExpData.prototype.staticTranslations["English"]);
    }
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
    if (!this.varSubjectCode()) {
        this.varSubjectCode((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Subject_Code'));
        this.varSubjectCode().setDescription(ExpData.prototype.varDescriptions["varSubjectCode"]);
    }
    if (!this.varSubjectNr()) {
        this.varSubjectNr((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'ordinal', 'Subject_Nr'));
        this.varSubjectNr().setDescription(ExpData.prototype.varDescriptions["varSubjectNr"]);
    }
    if (!this.varSubjectNrPerSubjGroup()) {
        this.varSubjectNrPerSubjGroup((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'ordinal', 'Subject_Nr_Per_Group'));
        this.varSubjectNrPerSubjGroup().setDescription(ExpData.prototype.varDescriptions["varSubjectNrPerSubjGroup"]);
    }
    if (!this.varGroupName()) {
        this.varGroupName((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Group_Name'));
        this.varGroupName().setDescription(ExpData.prototype.varDescriptions["varGroupName"]);
    }
    if (!this.varSessionTimeStamp()) {
        this.varSessionTimeStamp((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_Start_Time'));
        this.varSessionTimeStamp().setDescription(ExpData.prototype.varDescriptions["varSessionTimeStamp"]);
    }
    if (!this.varSessionTimeStampEnd()) {
        this.varSessionTimeStampEnd((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_End_Time'));
        this.varSessionTimeStampEnd().setDescription(ExpData.prototype.varDescriptions["varSessionTimeStampEnd"]);
    }
    if (!this.varSessionName()) {
        this.varSessionName((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Session_Name'));
        this.varSessionName().setDescription(ExpData.prototype.varDescriptions["varSessionName"]);
    }
    if (!this.varSessionNr()) {
        this.varSessionNr((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Session_Nr'));
        this.varSessionNr().setDescription(ExpData.prototype.varDescriptions["varSessionNr"]);
    }
    if (!this.varBlockName()) {
        this.varBlockName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Block_Name'));
        this.varBlockName().setDescription(ExpData.prototype.varDescriptions["varBlockName"]);
    }
    if (!this.varBlockNr()) {
        this.varBlockNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Block_Nr'));
        this.varBlockNr().setDescription(ExpData.prototype.varDescriptions["varBlockNr"]);
    }
    if (!this.varTaskName()) {
        this.varTaskName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Task_Name'));
        this.varTaskName().setDescription(ExpData.prototype.varDescriptions["varTaskName"]);
    }
    if (!this.varTaskNr()) {
        this.varTaskNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Task_Nr'));
        this.varTaskNr().setDescription(ExpData.prototype.varDescriptions["varTaskNr"]);
    }
    if (!this.varTrialId()) {
        this.varTrialId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Id'));
        this.varTrialId().setDescription(ExpData.prototype.varDescriptions["varTrialId"]);
    }
    if (!this.varTrialNr()) {
        this.varTrialNr((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Nr'));
        this.varTrialNr().setDescription(ExpData.prototype.varDescriptions["varTrialNr"]);
    }
    if (!this.varConditionId()) {
        this.varConditionId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Condition_Id'));
        this.varConditionId().setDescription(ExpData.prototype.varDescriptions["varConditionId"]);
    }
    if (!this.varBrowserSpec()) {
        this.varBrowserSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Browser_Spec'));
        this.varBrowserSpec().setDescription(ExpData.prototype.varDescriptions["varBrowserSpec"]);
    }
    if (!this.varSystemSpec()) {
        this.varSystemSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'System_Spec'));
        this.varSystemSpec().setDescription(ExpData.prototype.varDescriptions["varSystemSpec"]);
    }
    if (!this.varAgentSpec()) {
        this.varAgentSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Agent_Spec'));
        this.varAgentSpec().setDescription(ExpData.prototype.varDescriptions["varAgentSpec"]);
    }
    if (!this.varBrowserVersionSpec()) {
        this.varBrowserVersionSpec((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'BrowserVersion_Spec'));
        this.varBrowserVersionSpec().setDescription(ExpData.prototype.varDescriptions["varBrowserVersionSpec"]);
    }
    if (!this.varFullscreenSpec()) {
        this.varFullscreenSpec((new GlobalVar(this.expData)).initProperties('boolean', 'session', 'nominal', 'Always_Fullscreen'));
        this.varFullscreenSpec().resetStartValue();
        this.varFullscreenSpec().startValue().value(true);
        this.varFullscreenSpec().setDescription(ExpData.prototype.varDescriptions["varFullscreenSpec"]);
    }
    if (!this.varTimeMeasureSpecMean()) {
        this.varTimeMeasureSpecMean((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Mean'));
        this.varTimeMeasureSpecMean().setDescription(ExpData.prototype.varDescriptions["varTimeMeasureSpecMean"]);
    }
    if (!this.varTimeMeasureSpecStd()) {
        this.varTimeMeasureSpecStd((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Std'));
        this.varTimeMeasureSpecStd().setDescription(ExpData.prototype.varDescriptions["varTimeMeasureSpecStd"]);
    }
    if (!this.varCrowdsourcingCode()) {
        this.varCrowdsourcingCode((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Crowdsourcing_Code'));
        this.varCrowdsourcingCode().setDescription(ExpData.prototype.varDescriptions["varCrowdsourcingCode"]);
    }
    if (!this.varCrowdsourcingSubjId()) {
        this.varCrowdsourcingSubjId((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Crowdsourcing_SubjId'));
        this.varCrowdsourcingSubjId().setDescription(ExpData.prototype.varDescriptions["varCrowdsourcingSubjId"]);
    }
    if (!this.varGazeX()) {
        this.varGazeX((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'interval', 'GazeX'));
        this.varGazeX().setDescription(ExpData.prototype.varDescriptions["varGazeX"]);
    }
    if (!this.varGazeY()) {
        this.varGazeY((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'interval', 'GazeY'));
        this.varGazeY().setDescription(ExpData.prototype.varDescriptions["varGazeY"]);
    }
    if (!this.varRoleId()) {
        this.varRoleId((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Role_Id'));
        this.varRoleId().setDescription(ExpData.prototype.varDescriptions["varRoleId"]);
    }
    if (!this.varDisplayedLanguage()) {
        this.varDisplayedLanguage((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Displayed_Language'));
        this.varDisplayedLanguage().setDescription(ExpData.prototype.varDescriptions["varDisplayedLanguage"]);
    }
    if (!this.varPixelDensityPerMM()) {
        this.varPixelDensityPerMM((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'Pixel_Density_PerMM'));
        this.varPixelDensityPerMM().setDescription(ExpData.prototype.varDescriptions["varPixelDensityPerMM"]);
    }

    //  if (!this.varTimeMeasureSpecMax()) {
    //      this.varTimeMeasureSpecMax((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Max'));
    //  }

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

    // make sure that if translations are eneabled, that all text elements are in translation table:
    if (this.translationsEnabled()) {
        this.markAllTextsTranslatable();
    }

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
    if (data.hasOwnProperty('languageTransferOption')) {
        this.languageTransferOption(data.languageTransferOption);
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
        languageTransferOption: this.languageTransferOption(),
        studySettings: studySettings,
        entities: jQuery.map(this.entities(), function (entity) { return entity.toJS(); })
    };

    // add all variable ids:
    for (i = 0; i < ExpData.prototype.fixedVarNames.length; i++) {
        var varName = ExpData.prototype.fixedVarNames[i];
        data[varName] = this[varName]().id();
    }

    return data;
};
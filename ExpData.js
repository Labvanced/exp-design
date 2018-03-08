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
    this.entities = ko.observableArray([]).extend({sortById: null});

    this.availableTasks  = ko.observableArray([]);
    this.availableBlocks = ko.observableArray([]);
    this.availableSessions = ko.observableArray([]);
    this.availableGroups = ko.observableArray([]);

    this.isJointExp = ko.observable(false);    // needs to be placed before initialize studySettings!
    this.numPartOfJointExp = ko.observable(2); // needs to be placed before initialize studySettings!
    this.jointOptionModified = ko.observable(false);

    //serialized
    this.studySettings = new StudySettings(this.expData);

    this.translations = ko.observableArray([]);
    this.translatedLanguages = ko.observableArray([]);
    this.languageTransferOption = ko.observable('empty');

    this.translationsEnabled = ko.computed(function() {
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
    this.currentLanguageSubscription = this.currentLanguage.subscribe(function(newLang) {
            self.updateLanguage();
    });

    this.variableSubscription = null;

    this.dateLastModified = ko.observable(getCurrentDate(this.studySettings.timeZoneOffset()));

    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        this[ExpData.prototype.fixedVarNames[i]] = ko.observable();
    }



    this.vars = ko.computed(function() {
        var varArray = [];
        for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
            varArray.push( this[ExpData.prototype.fixedVarNames[i]]());
        }
        return varArray;
    }, this);

    this.errorString = ko.computed(function() {
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
        if (errorString!="") {
            errorString = errorString.substring(0, errorString.length - 2);
        }
        return errorString;
    }, this);

};

ExpData.prototype.oldFixedVarNames = [
    'varSubjectId',
    'varSubjectIndex',
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
    'varRoleId',
    'varCondition',
    'varBrowserSpecEMPTY',
    'varSystemSpecEMPTY',
    'varAgentSpecEMPTY',
    'varTimeMeasureSpecMeanEMPTY',
    'varFullscreenSpecEMPTY',
    'varBrowserVersionSpecEMPTY',
    'varTimeMeasureSpecMaxEMPTY',
    'varCrowdsourcingCodeEMPTY',
    'varGazeXEMPTY',
    'varGazeYEMPTY'
];

ExpData.prototype.fixedVarNames = [
    'varSubjectCode',
    'varSubjectNr',
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
    'varRoleId',
    'varConditionId',
    'varBrowserSpec',
    'varSystemSpec',
    'varAgentSpec',
    'varTimeMeasureSpecMean',
    'varFullscreenSpec',
    'varBrowserVersionSpec',
    'varTimeMeasureSpecMax',
    'varCrowdsourcingCode',
    'varGazeX',
    'varGazeY',
    'varCrowdsourcingSubjId'
];

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
        yourCountry: "Country of Origin",
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
        calibrateIntro: "You have the following two options to calibrate your screen size:",
        calibrateMethod1: "1) Specify your screen size manually if you know the size of your monitor.",
        calibrateScreenSize: "Screen size (diagonal):",
        calibrateInches: "inches",
        calibrateMsgOr: "OR",
        calibrateMethod2: "2) Use a standardized ID card (85.60 × 53.98 mm) or any other card of the same size against the screen and try to match the size of the displayed card. " +
        "You can change the size of the image by dragging the arrow. The calibration is correct if the image is no longer visible and the image exactly matches the size of the card.",
        endExpMsg: "Thank you! The experiment session is finished.",
        goToLib: "Go to experiment library",
        chooseSelection: "Please Choose...",
        answerPlaceholder: "Participant Answer...",
        endExpMsgTest:  "The test recording of this tak is over. To test the whole experiment or to record data, start the study under 'Run' in the navigation panel.",
        participationAgreement1: " I agree that all the personal data, which I provide here and all my responses will be recorded, and can be used for research purposes in a pseudonymised way. I also agree to the",
        participationAgreement2: "of the Scicovery GmbH for recording, storing, and handling, participant data.",
        multiUserExpLobby: "Multiple Participant Experiment",
        participantsInLobby: "Participants in lobby:",
        readyToStart: "Ready to start?",
        waitingForOtherParticipants: "Waiting for other participants...",
        experimentStartsShortly: "Your experiment will start shortly...",
        successfullyMatched_1: "Successfully matched. Press ",
        successfullyMatched_2: " to proceed to experiment!",
        continueJointExpLobby: "continue",
        yourCrowdsourcingID: "Your worker / crowdsourcing ID (*):"

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
        yourCountry: "Herkunftsland",
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
        calibrateIntro: "Sie haben die folgenden zwei Optionen, um Ihre Bildschirmgröße zu kalibrieren:",
        calibrateMethod1: "1) Geben Sie Ihre Bildschirmgröße manuell an, wenn Sie die Größe Ihres Monitors kennen.",
        calibrateScreenSize: "Bildschirmgröße (Diagonal):",
        calibrateInches: "Inch",
        calibrateMsgOr: "ODER",
        calibrateMethod2: "2) Halten Sie einen standardisierten Ausweis (85.60 × 53.98 mm) oder eine andere Karte der gleichen Größe gegen den Bildschirm und versuchen Sie, die Größe der angezeigten Karte anzupassen. " +
        "Sie können die Größe des Bildes durch Ziehen des Pfeils ändern. Die Kalibrierung ist korrekt, wenn das Bild nicht mehr sichtbar ist und das Bild genau der Größe der Karte entspricht.",
        endExpMsg: "Vielen Dank! Die Experimentssitzung ist beendet.",
        goToLib: "Gehe zur Experiment-Bibliothek",
        chooseSelection: "Bitte Auswählen...",
        answerPlaceholder: "Teilnehmer Antwort",
        endExpMsgTest:  "Die Test-Aufnahme dieses Taks ist beendet. Um das ganze Experiment zu testen, oder um Daten aufzunehmen, starten Sie die Studie unter 'Run' in der Navigationsleite.",
        participationAgreement1: "Ich stimme zu, dass alle persönlichen Daten, die ich hier zur Verfügung stelle, und alle meine Antworten aufgezeichnet werden und zu Forschungszwecken pseudonymisiert verwendet werden dürfen. Zudem stimme ich den",
        participationAgreement2: "der Scicovery GmbH bzgl Datenaufnahme, Datenspeicherung, und Datenverwaltung von Teilnehmerdaten zu.",
        multiUserExpLobby: "Experiment mit mehreren Teilnehmern",
        participantsInLobby: "Teilnehmer in der Lobby:",
        readyToStart: "Bereit zum Starten?",
        waitingForOtherParticipants: "Warte auf andere Teilnehmer...",
        experimentStartsShortly: "Das Experiment startet in Kürze...",
        successfullyMatched_1: "Sie wurden erfolgreich einem Experiment zugeteilt. Drücken Sie",
        successfullyMatched_2: "um zu dem Experiment zu gelangen!",
        continueJointExpLobby: "Weiter,",
        yourCrowdsourcingID: "Ihre Worker / Crowdsourcing Id (*):"
        }

};


ExpData.prototype.updateLanguage = function() {
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

ExpData.prototype.markAllTextsTranslatable = function() {
    $.each(this.availableTasks(), function(index, task) {
        $.each(task.subSequence().elements(), function(index, frame) {
            $.each(frame.elements(), function(index, elem) {
                var allTextRefs = elem.getTextRefs([], '');
                $.each(allTextRefs, function(index, textRef) {
                    textRef[2].markTranslatable();
                });
            });
        });
    });
};

ExpData.prototype.initVars = function() {


    for (var i=0; i<ExpData.prototype.fixedVarNames.length; i++) {

        if (this[ExpData.prototype.fixedVarNames[i]]().startValue() == null) {
            this[ExpData.prototype.fixedVarNames[i]]().resetStartValue();
        }

        this[ExpData.prototype.fixedVarNames[i]]().initValue();
    }
};

/**
 * creates all predefined (fixed) variables
 */
ExpData.prototype.createVars = function() {
    if (!this.varSubjectCode()) {
        this.varSubjectCode((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Subject_Code'));
    }
    if (!this.varSubjectNr()) {
        this.varSubjectNr((new GlobalVar(this.expData)).initProperties('numeric', 'subject', 'ordinal', 'Subject_Nr'));
    }
    if (!this.varGroupName()) {
        this.varGroupName((new GlobalVar(this.expData)).initProperties('string', 'subject', 'nominal', 'Group_Name'));
    }
    if (!this.varSessionTimeStamp()) {
        this.varSessionTimeStamp((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_Start_Time'));
    }
    if (!this.varSessionTimeStampEnd()) {
        this.varSessionTimeStampEnd((new GlobalVar(this.expData)).initProperties('datetime', 'session', 'interval', 'Session_End_Time'));
    }
    if (!this.varSessionName()) {
        this.varSessionName((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Session_Name'));
    }
    if (!this.varSessionNr()) {
        this.varSessionNr((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Session_Nr'));
    }
    if (!this.varBlockName()) {
        this.varBlockName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Block_Name'));
    }
    if (!this.varBlockNr()) {
        this.varBlockNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Block_Nr'));
    }
    if (!this.varTaskName()) {
        this.varTaskName((new GlobalVar(this.expData)).initProperties('string', 'task', 'nominal', 'Task_Name'));
    }
    if (!this.varTaskNr()) {
        this.varTaskNr((new GlobalVar(this.expData)).initProperties('numeric', 'task', 'ordinal', 'Task_Nr'));
    }
    if (!this.varTrialId()) {
        this.varTrialId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Id'));
    }
    if (!this.varTrialNr()) {
        this.varTrialNr((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'ordinal', 'Trial_Nr'));
    }
    if (!this.varConditionId()) {
        this.varConditionId((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'nominal', 'Condition_Id'));
    }
    if (!this.varBrowserSpec()) {
        this.varBrowserSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Browser_Spec'));
    }
    if (!this.varSystemSpec()) {
        this.varSystemSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'System_Spec'));
    }
    if (!this.varAgentSpec()) {
        this.varAgentSpec((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Agent_Spec'));
    }
    if (!this.varTimeMeasureSpecMean()) {
        this.varTimeMeasureSpecMean((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Mean'));
    }
    if (!this.varTimeMeasureSpecMax()) {
        this.varTimeMeasureSpecMax((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'interval', 'TimeMeasure_Max'));
    }
    if (!this.varFullscreenSpec()) {
        this.varFullscreenSpec((new GlobalVar(this.expData)).initProperties('boolean', 'session', 'nominal', 'Always_Fullscreen'));
        this.varFullscreenSpec().resetStartValue();
        this.varFullscreenSpec().startValue().value(true);
    }
    if (!this.varBrowserVersionSpec()) {
        this.varBrowserVersionSpec((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'BrowserVersion_Spec'));
    }
    if (!this.varRoleId()){
        this.varRoleId((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'ordinal', 'Role_Id'));
    }
    if (!this.varCrowdsourcingCode()) {
        this.varCrowdsourcingCode((new GlobalVar(this.expData)).initProperties('numeric', 'session', 'nominal', 'Crowdsourcing_Code'));
    }
    if (!this.varGazeX()) {
        this.varGazeX((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'interval', 'GazeX'));
    }
    if (!this.varGazeY()) {
        this.varGazeY((new GlobalVar(this.expData)).initProperties('numeric', 'trial', 'interval', 'GazeY'));
    }
    if (!this.varCrowdsourcingSubjId()) {
        this.varCrowdsourcingSubjId((new GlobalVar(this.expData)).initProperties('string', 'session', 'nominal', 'Crowdsourcing_SubjId'));
    }

};







ExpData.prototype.isSystemVar = function(globalVar) {
    if (this.vars().indexOf(globalVar)>=0 || globalVar.isFactor()){
        return true;
    }
    else{
        return false;
    }
};



ExpData.prototype.deleteGlobalVar = function(globalVar) {
    var idx = this.entities().indexOf(globalVar);
    if (idx>=0){
        this.entities.splice(idx,1);
    }
};

ExpData.prototype.addTranslation = function(translationEntry){
    this.translations.push(translationEntry);
};


/**
 * should be called by the ui classes after a change was made to some sub datamodels of this expData.
 */
ExpData.prototype.notifyChanged = function() {
    this.parentExperiment.notifyChanged();
};

/**
 * adds a new subject group to the experiment.
 * @param group
 */
ExpData.prototype.addGroup = function(group) {
    this.availableGroups.push(group);
    this.notifyChanged();
};

ExpData.prototype.rebuildEntities = function() {
    // first empty the entities list:
    this.entities([]);
    this.reAddEntities();
};

ExpData.prototype.addNewSubjGroup = function() {
    var group = new SubjectGroup(this);
    var name = "group_" + (this.availableGroups().length+1);
    group.name(name);
    this.addGroup(group);
};

ExpData.prototype.addTask = function(taskName,pageOrFrame,withFactor) {

    var expTrialLoop = new ExpTrialLoop(this);
    if (taskName){
        expTrialLoop.name(taskName);
    }
    expTrialLoop.initNewInstance(pageOrFrame,withFactor);
    expTrialLoop.isInitialized(true);
    this.availableTasks.push(expTrialLoop);
    this.reAddEntities();
    this.notifyChanged();
};


ExpData.prototype.addNewBlock_Refactored = function() {
    
    // add fixed instances of block into sequence
    var block = new ExpBlock(this);
    var name= "block_"+(this.availableBlocks().length+1);
    block.name(name);
    this.availableBlocks.push(block);
    this.notifyChanged();
};

ExpData.prototype.addNewSession = function() {

    // add fixed instances of block into sequence
    var session = new ExpSession(this);
    var name= "session_"+(this.availableSessions().length+1);
    session.name(name);
    this.availableSessions.push(session);
    this.notifyChanged();
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.setPointers = function() {
    var self = this;
    var i;
    var allEntitiesArray = this.entities();

    // recursively call all setPointers:
    jQuery.each( allEntitiesArray, function( index, elem ) {
        elem.setPointers(self.entities);
    } );
    jQuery.each( allEntitiesArray, function( index, elem ) {
         if (typeof elem.onFinishedLoading === "function"){
             elem.onFinishedLoading();
         }
    } );

    // relink availableTasks:
    var availableTaskIds = this.availableTasks();
    var availableTasks = [];
    for (i=0; i<availableTaskIds.length; i++) {
        availableTasks.push(this.entities.byId[availableTaskIds[i]]);
    }
    this.availableTasks(availableTasks);

    // relink availableBlocks:
    var availableBlockIds = this.availableBlocks();
    var availableBlocks = [];
    for (i=0; i<availableBlockIds.length; i++) {
        availableBlocks.push(this.entities.byId[availableBlockIds[i]]);
    }
    this.availableBlocks(availableBlocks);

    // relink availableSessions:
    var availableSessionIds = this.availableSessions();
    var availableSessions = [];
    for (i=0; i<availableSessionIds.length; i++) {
        availableSessions.push(this.entities.byId[availableSessionIds[i]]);
    }
    this.availableSessions(availableSessions);

    // relink availableGroups:
    var availableGroupIds = this.availableGroups();
    var availableGroups = [];
    for (i=0; i<availableGroupIds.length; i++) {
        availableGroups.push(this.entities.byId[availableGroupIds[i]]);
    }
    this.availableGroups(availableGroups);

    // relink variables
    var missingVar = false;
    for (i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varId = this[ExpData.prototype.fixedVarNames[i]]();
        if (varId) {
            var varInstance = this.entities.byId[varId];
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
    jQuery.each( this.translations(), function( index, elem ) {
        if (elem instanceof TranslationEntry) {
            elem.setPointers(self.entities);
        }
    } );

    // make sure that if translations are eneabled, that all text elements are in translation table:
    if (this.translationsEnabled()) {
        this.markAllTextsTranslatable();
    }

    this.updateLanguage();

    // update current variable List
    var allEntities = this.entities();
    for (var i=0; i<allEntities.length; i++){
        if (allEntities[i].type == "GlobalVar") {
            if (allEntities[i].name()){
                if (!(this.allVariables.hasOwnProperty(allEntities[i].name().toLowerCase()))){
                    this.allVariables[allEntities[i].name().toLowerCase()] = allEntities[i];
                }
                else if (this.allVariables[allEntities[i].name().toLowerCase()] instanceof Array){
                    this.allVariables[allEntities[i].name().toLowerCase()].push(allEntities[i]);
                }
                else{
                    var temp =  this.allVariables[allEntities[i].name().toLowerCase()];
                    this.allVariables[allEntities[i].name().toLowerCase()] = [temp,allEntities[i]];
                }

            }

        }
    }
    if (this.variableSubscription){
        this.variableSubscription.dispose();
    }
    this.variableSubscription = this.entities.subscribe(function(changes) {
        ko.utils.arrayForEach(changes, function (change) {
            if (change.value instanceof GlobalVar){
                if (change.status =="added"){
                    self.addVarToHashList(change.value);
                }
                else if (change.status =="deleted"){
                    self.deleteVarFromHashList(change.value,null);
                }

            }

        });
    }, null, "arrayChange");

};


ExpData.prototype.addVarToHashList = function(variable) {
    if (variable.name()){
        if (!(this.allVariables.hasOwnProperty(variable.name().toLowerCase()))){
            this.allVariables[variable.name().toLowerCase()] = variable;
        }

        else if (this.allVariables[variable.name().toLowerCase()] instanceof Array){
            var idx = this.allVariables[variable.name().toLowerCase()].indexOf(variable);
            if (idx==-1){
                this.allVariables[variable.name().toLowerCase()].push(variable);
            }

        }

        else {
            var temp =  this.allVariables[variable.name().toLowerCase()];
            if (temp !==variable) {
                this.allVariables[variable.name().toLowerCase()] =  [temp,variable];
            }

        }
    }

};

ExpData.prototype.deleteVarFromHashList = function(variable,oldName) {
    if (oldName){
        var name = oldName;
    }
    else{
        var name = variable.name();
    }
    if (name && name !=""){
        if (this.allVariables.hasOwnProperty(name.toLowerCase())){
            if (this.allVariables[name.toLowerCase()] instanceof Array){
                var idx = this.allVariables[name.toLowerCase()].indexOf(variable);
                if (idx >=0){
                 this.allVariables[name.toLowerCase()].splice(idx,1);
                }
            }
            else{
             delete this.allVariables[name.toLowerCase()];
            }
        }
    }


};


ExpData.prototype.varNameValid = function(varName) {
    if (varName=="" || this.allVariables.hasOwnProperty(varName)){
        return false;
    }
    else{
        return true;
    }
};

ExpData.prototype.varNameValidExisting = function(varName) {
    if (this.allVariables.hasOwnProperty(varName)){
       if(this.allVariables[varName] instanceof Array){
           if (this.allVariables[varName].length <=1){
               return true
           }
           else{
               return false;
           }
       }
       else{
           return true;
       }
    }
    else{
        return true;
    }
};


/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpData.prototype.reAddEntities = function() {
    var entitiesArr = this.entities;

    jQuery.each( this.availableTasks(), function( index, task ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(task.id())) {
            entitiesArr.push(task);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        task.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableBlocks(), function( index, block ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(block.id())) {
            entitiesArr.push(block);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        block.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableSessions(), function( index, session ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(session.id())) {
            entitiesArr.push(session);
        }
        // recursively make sure that all deep tree nodes are in the entities list:
        session.reAddEntities(entitiesArr);
    } );

    jQuery.each( this.availableGroups(), function( index, group ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(group.id()))
            entitiesArr.push(group);

        // recursively make sure that all deep tree nodes are in the entities list:
        group.reAddEntities(entitiesArr);
    } );

    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
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
ExpData.prototype.fromJS = function(data) {
    var self = this;

    if (data.hasOwnProperty('dateLastModified')) {
        this.dateLastModified(data.dateLastModified);
    }

    if(data.hasOwnProperty('isJointExp')) {
        this.isJointExp(data.isJointExp);
    }

    if(data.hasOwnProperty('numPartOfJointExp')) {
        this.numPartOfJointExp(data.numPartOfJointExp);
    }

    if(data.hasOwnProperty('jointOptionModified')){
        this.jointOptionModified(data.jointOptionModified);
    }

    if (data.hasOwnProperty('entities')) {
        this.entities(jQuery.map(data.entities, function (entityJson) {
            return entityFactory(entityJson, self);
        }));
    }
    
    if (data.studySettings) {
        this.studySettings = new StudySettings(this.expData);
        this.studySettings.fromJS(data.studySettings);

    }

    this.availableTasks(data.availableTasks);
    this.availableBlocks(data.availableBlocks);
    this.availableSessions(data.availableSessions);
    this.availableGroups(data.availableGroups);

    if(data.hasOwnProperty('translations')){
        this.translations(jQuery.map(data.translations, function (entryData) {
            if (entryData=="removedEntry") {
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


    for (var i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varName = ExpData.prototype.fixedVarNames[i];
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
ExpData.prototype.toJS = function() {
    var i;

    // TODO: @Caspar: Remove this rebuildEntities and TEST if all elements and Events can still be saved and later loaded again:
    // TODO: @Holger:: I removed all other places where rebuildEntities was used. However this cannot be removed, otherwise many errors occur. In fact this is the only place where rebuild entities is still executed.
    // TODO: @Holger: Also this was in here for a ver long time, and it has nothing to do with my recent commit about variable names etc. I suggest keep it here or change it later.
    this.rebuildEntities();

    var sessionsPerGroup = [];
    var groups = this.availableGroups();
    for (i=0; i<groups.length; i++){
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
        entities: jQuery.map( this.entities(), function( entity ) { return entity.toJS(); }),
        availableTasks: jQuery.map( this.availableTasks(), function( task ) { return task.id(); }),
        availableBlocks: jQuery.map( this.availableBlocks(), function( block ) { return block.id(); }),
        availableSessions: jQuery.map( this.availableSessions(), function( session ) { return session.id(); }),
        availableGroups: jQuery.map( this.availableGroups(), function( group ) { return group.id(); }),
        numGroups: this.availableGroups().length,
        sessionsPerGroup: sessionsPerGroup,
        translations: jQuery.map( this.translations(), function( entry ) {
            if (entry==null || entry=="removedEntry") {
                return "removedEntry";
            }
            else {
                return entry.toJS();
            }
        }),
        translatedLanguages: this.translatedLanguages(),
        languageTransferOption: this.languageTransferOption(),
        studySettings:studySettings
    };

    // add all variable ids:
    for (i=0; i < ExpData.prototype.fixedVarNames.length; i++){
        var varName = ExpData.prototype.fixedVarNames[i];
        data[varName] = this[varName]().id();
    }

    return data;
};
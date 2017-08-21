// � by Caspar Goeke and Holger Finger

/**
 * This class stores all informations of a task. Most importantly, it has one or more sequences of frames and pages.
 * It stores the factorGroups and per factorGroup one subSequence.
 *
 * @param {ExpData} expData - The global ExpData, where all instances can be retrieved by id.
 * @constructor
 */
var ExpTrialLoop = function (expData) {
    this.expData = expData;
    this.parent = null;

    // serialized:
    this.editorX = ko.observable(0);
    this.editorY = ko.observable(0);
    this.editorWidth = ko.observable(120);
    this.editorHeight = ko.observable(60);

   
    this.id = ko.observable(guid());
    this.displayInitialCountdown = ko.observable(true);
    
    this.zoomMode = ko.observable('fullscreen'); // fullscreen or visualDegree or pixel or millimeter
    this.visualDegreeToUnit = ko.observable(20);

    //properties
    this.name = ko.observable("New Task");
    this.type = "ExpTrialLoop";
    this.subSequence = ko.observable(null);
    this.subSequencePerFactorGroup = ko.observableArray([]);
    this.factorGroups = ko.observableArray([]);
    this.eventVariables = ko.observableArray([]); // still needed?

    //properties
    this.repsPerTrialType = ko.observable(1).extend({ numeric: 0 });
    this.isActive = ko.observable(false);


    // randomization settings
    this.randomizationOverview = ko.observable("standard");
    this.blockFixedFactorConditions = ko.observable(false);
    this.orderOfConditions = ko.observable("fixed");
    this.trialRandomization = ko.observable("permute");
    this.fixedTrialOrder = ko.observableArray([]);

    this.randomizationConstraint = ko.observable("none");
    this.minIntervalBetweenRep = ko.observable(0).extend({ numeric: 0 });
    this.maxIntervalSameCondition = ko.observable(3).extend({ numeric: 3 });

    this.allTrialsToAllSubjects = ko.observable(true);
    this.numberTrialsToShow = ko.observable(null);
    this.balanceAmountOfConditions = ko.observable(true);

    // external devices
    this.webcamEnabled = ko.observable(false);


    // not serialized
    this.isInitialized = ko.observable(false);
    this.shape = "square";
    this.label = "Experiment";
    this.portTypes = ["executeIn", "executeOut"];
    this.selectionSpec = ko.observable(null);

    var self = this;
    
    this.totalNrTrials = ko.computed(function() {
        var l = 0;
        for (var i = 0; i<self.factorGroups().length; i++){
            var facGroup = self.factorGroups()[i];
            for (var k = 0; k<facGroup.conditionsLinear().length; k++){
                l = l+ facGroup.conditionsLinear()[k].trials().length;
            }
        }
        // update random factors, as soon as amount of trials changes

      //  var condGroups = self.getCondGroups();
     //   self.numberTrialsToShow(condGroups.totalNrTrialsMin);


        return l
    }, this);


    this.vars = ko.computed(function() {
        var array = [];

        var eventList = this.eventVariables();

        for (var i = 0; i< eventList.length;i++ ){
            array.push(eventList[i]);
        }
        return array;

    }, this);


};

/**
 * Is called to initialize a newly created exp trial loop (instead of initialization via loadJS)
 */
ExpTrialLoop.prototype.initNewInstance = function(pageOrFrame,withFactor) {
    this.addFactorGroup(pageOrFrame,withFactor);
};

ExpTrialLoop.prototype.addNewFrame = function() {
    var frame = new FrameData(this.expData);
    this.subSequence().addNewSubElement(frame);
    frame.parent = this.subSequence();
};

ExpTrialLoop.prototype.addFactorGroup = function(pageOrFrame,withFactor) {
    var factorGroup = new FactorGroup(this.expData, this);
    var nr_in_task = this.factorGroups().length+1;
    var nr_in_exp = this.expData.availableTasks().indexOf(this);
    if (nr_in_exp <= 0) {
        nr_in_exp = this.expData.availableTasks().length + 1;
    }
    factorGroup.name("trial_group_" + nr_in_task);

    // add a new subSequence for the new group (if there are not already enough subSequences):
    var subsequence = new Sequence(this.expData);
    subsequence.parent = this;
    subsequence.setFactorGroup(factorGroup);

    // add new frame or page
    if(pageOrFrame=='frame'){
        var elem = new FrameData(this.expData);
        elem.name('frame_1');
    }
    else if(pageOrFrame=='page'){
        var elem = new PageData(this.expData);
        elem.name('page_1');
    }
    subsequence.addNewSubElement(elem);
    subsequence.currSelectedElement(elem);

    // new factor
    if(withFactor){
        newFactor = new Factor(this.expData, factorGroup);
        newFactor.init("factor1_tg"+nr_in_task+"_task"+nr_in_exp);
        newFactor.updateLevels();
        factorGroup.addFactor(newFactor);
    }

    this.factorGroups.push(factorGroup);
    this.subSequencePerFactorGroup.push(subsequence);
    this.subSequence(subsequence);
    this.expData.notifyChanged();

};


ExpTrialLoop.prototype.removeFactorGroup = function(facGroupIdx) {

    this.factorGroups.splice(facGroupIdx,1);
    this.subSequencePerFactorGroup.splice(facGroupIdx,1);
    this.subSequence(this.subSequencePerFactorGroup()[0]);
    this.expData.notifyChanged();

};


ExpTrialLoop.prototype.renameGroup = function(facGroupIdx,flag) {

    if (flag == "true"){
        this.factorGroups()[facGroupIdx].editName(true);
    }
    else if (flag == "false"){
        this.factorGroups()[facGroupIdx].editName(false);
    }
};



ExpTrialLoop.prototype.getCondGroups = function () {
    var factorGroups = this.factorGroups();
    var fixedFactorConds =  [];
    var totalNrTrialsMin = 0;
    var totalNrTrialsMax = 0;

    for (var i = 0; i < factorGroups.length; i++) {
        var obj = this.getCondGroupsOneTrialGroup(factorGroups[i]);
        for (var k = 0; k<obj.fixedFactorConds.length;k++){
            fixedFactorConds.push(obj.fixedFactorConds[k]);
        }
        totalNrTrialsMin += obj.totalNrTrialsMin;
        totalNrTrialsMax += obj.totalNrTrialsMax;

    }

    var obj2 = {
        fixedFactorConds: fixedFactorConds,
        totalNrTrialsMax: totalNrTrialsMax,
        totalNrTrialsMin: totalNrTrialsMin

    };
    return obj2;

};


ExpTrialLoop.prototype.getCondGroupsOneTrialGroup = function (factorGroup) {

    var conditions = factorGroup.conditionsLinear();
    var arrOfOneFacGroup = factorGroup.getFixedFactorConditions();
    var fixedFactorConds =  [];

    var count = 0;
    var totalNrTrialsMin = 0;
    var totalNrTrialsMax = 0;

    for (var k = 0; k < arrOfOneFacGroup.length; k++) {
        count++;
        var condArray = arrOfOneFacGroup[k];
        var totalVariations = 0;
        var varArray = [];

        for (var j = 0; j < condArray.length; j++) {
            totalVariations += conditions[condArray[j]].trials().length;
            varArray.push(conditions[condArray[j]].trials().length);
        }

        var minVar = Math.min.apply(null, varArray);
        var maxVar = Math.max.apply(null, varArray);
        totalNrTrialsMin += minVar;
        totalNrTrialsMax += maxVar;

        var obj = {
            nrOfCondition: count,
            nameOfFactorGroup: factorGroup.name(),
            nrOfVariations:totalVariations,
            minNrOfTrials: minVar,
            maxNrOfTrials: maxVar
        };
        fixedFactorConds.push(obj);
    }


    var obj2 = {
        fixedFactorConds: fixedFactorConds,
        totalNrTrialsMax: totalNrTrialsMax,
        totalNrTrialsMin: totalNrTrialsMin

    };
    return obj2;

};


ExpTrialLoop.prototype.getTrialRandomizationOneRun = function() {
    var allTrials = [];
    for (var facGroupIdx =0; facGroupIdx <  this.factorGroups().length; facGroupIdx++) {
        var factorGroup = this.factorGroups()[facGroupIdx];
        var outArr = this.getFactorLevels(factorGroup);
        var factorLevels = outArr[0];
        var factorIndicies = outArr[1];
        var conditions = this.getConditionFromFactorLevels(factorIndicies,factorLevels,facGroupIdx);
        var trials = this.drawTrialsFromConditions(conditions,facGroupIdx);
        allTrials.push(trials);
    }
    var trialsRandomized = this.getRandomizedTrials(allTrials);
    return trialsRandomized;
};


ExpTrialLoop.prototype.doTrialRandomization = function() {

    if (this.allTrialsToAllSubjects()) {
        return this.getTrialRandomizationOneRun();
    }
    else {

        var condGroups = this.getCondGroups();
        var numberTrialsToShow = this.numberTrialsToShow();

        if (condGroups.totalNrTrialsMin < numberTrialsToShow) {

            var trialsRandomizedAll = [];

            // do new random draws until we have the number trials requested:
            while (trialsRandomizedAll.length < numberTrialsToShow) {
                $.merge( trialsRandomizedAll, this.getTrialRandomizationOneRun() );
            }

            // reduce number to amount requested:
            if (trialsRandomizedAll.length > numberTrialsToShow) {
                trialsRandomizedAll = trialsRandomizedAll.slice(0, numberTrialsToShow);
            }

            return trialsRandomizedAll;

        }
        else {

            var trialsRandomized = this.getTrialRandomizationOneRun();

            // TODO: filter trialsRandomized based on defined proportions between conditions
            if (trialsRandomized.length > numberTrialsToShow) {
                trialsRandomized = trialsRandomized.slice(0, numberTrialsToShow);
            }

            return trialsRandomized;

        }

    }
};


ExpTrialLoop.prototype.drawTrialsFromConditions = function(conditions,facGroupIdx) {

    var ffConds = this.factorGroups()[facGroupIdx].getFixedFactorConditions();

    var excludedTrialsPerCondGroup = [];
    for (var condGroup =0; condGroup < ffConds.length; condGroup++) {
        excludedTrialsPerCondGroup.push([]);
    }

    var Trials = [];
    for (var trialIndex=0; trialIndex < conditions.length; trialIndex++) {
        var condition = conditions[trialIndex];

        var condGroup = this.getCondGroup(condition.conditionIdx()-1,ffConds);
        var nrExistingTrials =  condition.trials().length;

        var options = [];
        for (var i=0; i <nrExistingTrials; i++) {
            if (excludedTrialsPerCondGroup[condGroup].indexOf(i)<0){
                options.push(i);
            }
        }

         if (options.length<1){
             console.log("WARNING, too less trials for repeating condition");
         }
        var randValue = Math.floor(Math.random()*options.length);
        var trialRandIdx = options[randValue];
        excludedTrialsPerCondGroup[condGroup].push(trialRandIdx);
        var chosenTrial = condition.trials()[trialRandIdx];
        Trials.push(chosenTrial);

    }

    // sanity check
    var trialRepIdx = [];
    for (var trialIndex=0; trialIndex < Trials.length; trialIndex++) {
        trialRepIdx.push(Trials[trialIndex].nr());
    }
    var checkSortArray = trialRepIdx.slice().sort();
    var results = [];
    for (var i = 0; i < checkSortArray.length - 1; i++) {
        if (checkSortArray[i + 1] == checkSortArray[i]) {
            console.log("error double trial entry");

        }
    }



    return Trials
};


ExpTrialLoop.prototype.getCondGroup = function(conditionIdx,ffConds) {

    var ffGroup = null;
    for (var condGroup =0; condGroup < ffConds.length; condGroup++) {
        var group = ffConds[condGroup];
        if (group.indexOf(conditionIdx)>=0){
            ffGroup = condGroup;
            break
        }
    }

    return ffGroup
};


ExpTrialLoop.prototype.getFactorLevels= function(factorGroup) {

    var arr = factorGroup.getFixedFactorLevels();
    var allConds = arr[0];
    var factorNames = arr[1];
    var ffConds =factorGroup.getFixedFactorConditions();
    var factors = factorGroup.factors();
    var factorLevels = [];

    var obj= this.getCondGroupsOneTrialGroup(factorGroup);
    var fixedFactorConds = obj.fixedFactorConds;

    var globalVarNames = [];
    for (var facIdx=0; facIdx < factors.length; facIdx++) {
        globalVarNames.push(factors[facIdx].globalVar().name());
    }


    for (var i=0; i < ffConds.length; i++) {
        for (var k=0; k < fixedFactorConds[i].minNrOfTrials; k++) {
           var temp =  allConds[ffConds[i][0]].slice(0);
           factorLevels.push(temp)
        }
    }

    for (var facIdx=0; facIdx < factors.length; facIdx++) {
        factor = factors[facIdx];
        if (factor.factorType()=='random') {

            var factor = factors[facIdx];
            var facName = factor.globalVar().name();
            var levels = factor.globalVar().levels();
            var nrLevels = levels.length;


            if (factor.randomizationType()=='unbalanced'){
                factorNames.push(facIdx);
                for (var trialIdx =0; trialIdx < factorLevels.length; trialIdx++) {factorLevels
                    var randValue = Math.floor(Math.random()*nrLevels);
                    factorLevels[trialIdx].push(levels[randValue].name());
                }
            }

            else if (factor.randomizationType()=='balancedTask'){
                factorNames.push(facIdx);
                var trialSplit = Math.floor(factorLevels.length/nrLevels);
                var remainder = factorLevels.length%nrLevels;


                var randIdx = [];
                for (var trialIdx=0; trialIdx <factorLevels.length; trialIdx++) {
                    randIdx.push(trialIdx);
                }
                var randIndicies = this.reshuffle(randIdx);

                var trialIdx = 0;
                for (var lvlIndex=0; lvlIndex <levels.length; lvlIndex++) {
                    for (var repIndex=0; repIndex <trialSplit; repIndex++) {
                        factorLevels[randIndicies[trialIdx]].push(levels[lvlIndex].name());
                        trialIdx ++;
                    }
                }

                for (var remain=0; remain < remainder; remain++) {
                    factorLevels[randIndicies[trialIdx]].push(levels[remain].name());
                    trialIdx ++;
                }

            }

            else if(factor.randomizationType()=='balancedConditions') {
                factorNames.push(facIdx);
                var startOfConditionIndex = 0;
                var endOfConditionIndex = 0;

                for (var k = 0; k < fixedFactorConds.length; k++) {

                    endOfConditionIndex += fixedFactorConds[k].minNrOfTrials;

                    if (endOfConditionIndex > startOfConditionIndex) {
                        var nrTrials = endOfConditionIndex - startOfConditionIndex;

                        var repsPerLvl = Math.floor(nrTrials / nrLevels);
                        var remainder = nrTrials % nrLevels;

                        var counter = startOfConditionIndex;
                        for (var repetition = 0; repetition < repsPerLvl; repetition++) {
                            for (var l = 0; l < levels.length; l++) {
                                factorLevels[counter].push(levels[l].name());
                                counter++;
                            }
                        }
                        for (var l = 0; l < remainder; l++) {
                            factorLevels[counter].push(levels[l].name());
                            counter++;
                        }
                        startOfConditionIndex = endOfConditionIndex;
                    }
                }
            }
        }
    }

   var arr=  this.getResolutionOrder(factors,factorNames);
   var resolutionOrder= arr[0];
   var factorDependencies= arr[1];


    for (var facIndx=0; facIndx < resolutionOrder.length; facIndx++) {
        var factor = resolutionOrder[facIndx];
        var dependencies = factorDependencies[facIndx];

        /**
        if (factor.factorType()=='random' && factor.randomizationType()=='balancedInFactor') {

            var facName = factor.globalVar().name();
            var levels = factor.globalVar().levels();
            var facIdx = factors.indexOf(factor);
            var nrLevels = levels.length;
            var balanceInFactor = null;

            if (factor.balancedInFactor()){
                var idx = globalVarNames.indexOf(factor.balancedInFactor().globalVar().name());
                if (idx >=0 ){
                    factorNames.push(facIdx);
                    balanceInFactor = factors[idx];
                    var lvls = [];
                    var countLvl = [];

                    for (var lvl =0; lvl < balanceInFactor.globalVar().levels().length; lvl++) {
                        lvls.push(balanceInFactor.globalVar().levels()[lvl].name());
                        countLvl.push(0);
                    }

                    var indexInFacLevel=  factorNames.indexOf(idx);

                    var factorLevelsToBalance = [];
                    for (var trial=0; trial < factorLevels.length; trial++) {
                        var facValu = factorLevels[trial][indexInFacLevel];
                        var inder = lvls.indexOf(facValu);
                        var value = levels[countLvl[inder]].name();
                        factorLevels[trial].push(value);
                        countLvl[inder]++;
                        if(countLvl[inder]>levels.length-1){
                            countLvl[inder] = 0;
                        }

                    }

                }
                else{
                    console.log("error: the factor which should be used for balancing is does not exist, or is identical to the balancing factor.")
                }

            }
        }
         **/


        if (factor.factorType()=='random' && factor.randomizationType()=='balancedInFactors') {

            if (dependencies.length==0){ //if their are no dependencies just balance this factor in the task
                var facName = factor.globalVar().name();
                var levels = factor.globalVar().levels();
                var facIdx = factors.indexOf(factor);
                var nrLevels = levels.length;

                factorNames.push(facIdx);
                var trialSplit = Math.floor(factorLevels.length/nrLevels);
                var remainder = factorLevels.length%nrLevels;


                var randIdx = [];
                for (var trialIdx=0; trialIdx <factorLevels.length; trialIdx++) {
                    randIdx.push(trialIdx);
                }
                var randIndicies = this.reshuffle(randIdx);

                var trialIdx = 0;
                for (var lvlIndex=0; lvlIndex <levels.length; lvlIndex++) {
                    for (var repIndex=0; repIndex <trialSplit; repIndex++) {
                        factorLevels[randIndicies[trialIdx]].push(levels[lvlIndex].name());
                        trialIdx ++;
                    }
                }

                for (var remain=0; remain < remainder; remain++) {
                    factorLevels[randIndicies[trialIdx]].push(levels[remain].name());
                    trialIdx ++;
                }
            }

            else{

                var levelLegthes= [];
                var levelNames= [];
                var facNames= [];
                for (var depIdx=0; depIdx < dependencies.length; depIdx++) {
                    levelLegthes.push(dependencies[depIdx].globalVar().levels().length);
                    facNames.push(dependencies[depIdx].globalVar().name());
                    levelNames.push([]);
                    for (var k=0; k < dependencies[depIdx].globalVar().levels().length; k++) {
                        levelNames[depIdx].push(dependencies[depIdx].globalVar().levels()[k].name());
                    }
                }


                var count = 1;
                var existingNames = [];
                for (var i=0; i < levelLegthes.length; i++) {
                    count*=levelLegthes[i];

                    var facName = facNames[i];
                    var newNames = levelNames[i];

                    var existingNamesCopy = existingNames.slice();
                    existingNames=[];
                    for (var k=0; k < newNames.length; k++) {
                        var newName = '/'+ facName +'_' +newNames[k]+'/';
                        if (i>0){
                            for (var j=0; j < existingNamesCopy.length; j++) {
                                var newEntry = existingNamesCopy[j]+newName;
                                existingNames.push(newEntry);
                            }
                        }
                        else{
                            existingNames.push(newName);
                        }
                    }
                }
                var counterArr = new Array(count);
                counterArr.fill(0);

                var levels = factor.globalVar().levels();

                for (var trial=0; trial < factorLevels.length; trial++) {
                    var combinedVal ='';
                    for (var facneedIdx=0; facneedIdx < facNames.length; facneedIdx++) {
                        var idx1=  globalVarNames.indexOf(facNames[facneedIdx]);
                        var idx2 = factorNames.indexOf(idx1);
                        var levelVal = factorLevels[trial][idx2];
                        combinedVal+= '/'+ facNames[facneedIdx] +'_' +levelVal+'/';
                    }
                    var conditionIndex = existingNames.indexOf(combinedVal);
                    if (conditionIndex>=0){
                        var currentLevelVal = counterArr[conditionIndex];
                        var value = levels[currentLevelVal].name();
                        factorLevels[trial].push(value);
                        counterArr[conditionIndex]++;
                        if( counterArr[conditionIndex]>levels.length-1){
                            counterArr[conditionIndex] = 0;
                        }
                    }
                    else{
                        console.log("error: the factor combination could not be found.")
                    }
                }

                var facIdx = factors.indexOf(factor);
                factorNames.push(facIdx);

            }
        }
    }


    return [factorLevels,factorNames]

};


ExpTrialLoop.prototype.getResolutionOrder = function(factors,factorNames) {

    // get nested dependencies
    var resolvedFactors = [];
    for (var facIdx=0; facIdx < factorNames.length; facIdx++) {
        resolvedFactors.push(factors[factorNames[facIdx]].globalVar().id());
    }
    var unresolvedFactors = [];
    for (var facIdx=0; facIdx < factors.length; facIdx++) {
        if (factorNames.indexOf(facIdx)<0){
            unresolvedFactors.push(factors[facIdx]);
        }
    }

    var factorDependencies = [];
    for (var facIdx=0; facIdx < unresolvedFactors.length; facIdx++) {
        factorDependencies.push([]);
        var dependencies  = unresolvedFactors[facIdx].balancedInFactors();
        for (var k=0; k < dependencies.length; k++) {

            if (dependencies[k].hasDependency()){
                var factor = this.expData.entities.byId[dependencies[k].id];
                factorDependencies[facIdx].push(factor);
            }
        }
    }

    var newFactorDependencies = [];
    var resolutionOrder= [];
    var outerIdx = 0;
    var l = unresolvedFactors.length;
    while(unresolvedFactors.length>0 && outerIdx<=l){
        var found = false;
        var idx = 0;
        while(!found && idx<=factorDependencies.length){
            var depFactors = factorDependencies[idx];
            var unresFactor = unresolvedFactors[idx];

            var ok = true;
            for (var d = 0;d< depFactors.length; d++){
                var depFactor =  depFactors[d];
                if(resolvedFactors.indexOf(depFactor.globalVar().id())==-1){
                    ok = false;
                }
            }
            if (ok ==true){
                found = true;
                resolutionOrder.push(unresFactor);
                newFactorDependencies.push(depFactors);
                resolvedFactors.push(unresFactor.globalVar().id());
                unresolvedFactors.splice(idx,1);
                factorDependencies.splice(idx,1);
            }
            else{
                idx++;
            }

        }
        outerIdx++;
    }
    return [resolutionOrder,newFactorDependencies];
};



ExpTrialLoop.prototype.getConditionFromFactorLevels = function(factorIndicies,factorLevels,factorGroup) {


    var conditions = this.factorGroups()[factorGroup].conditionsLinear();

    var allCondLevels = [];
    for (var condIdx = 0; condIdx < conditions.length; condIdx++) {
        var facLevels = conditions[condIdx].factorLevels();


        var concatStr= '';
        for (var facIndex = 0; facIndex <facLevels.length; facIndex++) {
            if (facIndex <(facLevels.length-1)){
                concatStr += facLevels[facIndex].name() +',';
            }
            else{
                concatStr += facLevels[facIndex].name();
            }

        }
        allCondLevels.push(concatStr);
    }

    var reIndexed = [];
    for (var i = 0; i < factorIndicies.length; i++) {
        reIndexed.push(factorIndicies.indexOf(i))
    }

    var presentedConditions  = [];
    for (var trialIdx = 0; trialIdx < factorLevels.length; trialIdx++) {
        var temp = factorLevels[trialIdx];
        var temp2 = [];
        for (var i = 0; i < temp.length; i++) {
            temp2.push(temp[reIndexed[i]])
        }

        var searchStr = temp2.join();
        var condIdx =  allCondLevels.indexOf(searchStr);
        if(condIdx>=0 &&condIdx<=conditions.length-1){
            presentedConditions.push(conditions[allCondLevels.indexOf(searchStr)]);
        }
        else{
            console.log("error condition not found in randomization procedure");
        }
    }

  return presentedConditions

};





ExpTrialLoop.prototype.reshuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};



ExpTrialLoop.prototype.getTrialWithConstraint = function(trialArray,conditionsExcluded) {
    var n = trialArray.length;
    var trial = null;


    if (conditionsExcluded){
        var found = false;
        var maxIter = trialArray.length*10;
        var i = 0;
        while (i<maxIter && found == false){
            var randValue = Math.floor(Math.random()*n);
            var trial = trialArray[randValue];
            if (conditionsExcluded.indexOf(trial.condition.conditionIdx())==-1){
                trial = trialArray.splice(randValue,1)[0];
                found = true;
            }
            i++;
        }
    }
    else{
        var randValue = Math.floor(Math.random()*n);
        var trial = trialArray[randValue];
        trial = trialArray.splice(randValue,1)[0];
        found = true;
    }

    if (!found){
        trial = null;
    }
    return trial;

};



ExpTrialLoop.prototype.checkConstraint = function(currentArray,ffConds) {

    var maxInterval = this.maxIntervalSameCondition();
    var constraint = null;

    if (currentArray.length>= maxInterval){
        var lastEntries = [];
        for (var j = currentArray.length-maxInterval; j < currentArray.length; j++) {
            lastEntries.push(currentArray[j].condition.conditionIdx()-1);
        }

        for (var cond = 0; cond < ffConds.length; cond++) {
            var match = 0;
            for (var t = 0; t < lastEntries.length; t++) {
               if(ffConds[cond].indexOf(lastEntries[t])>=0){
                   match++;
               }
            }
            if (match==maxInterval){
                constraint = ffConds[cond];
            }
        }
    }

    return constraint

};

ExpTrialLoop.prototype.sortTrialBasedOnInputArray = function(sortedArray) {

    var trialOrder = this.fixedTrialOrder();

    try {
        var StringArray = trialOrder.split(',');
        var numberArray = [];
        for (var i = 0; i<StringArray.length; i++){
            var value = parseInt(StringArray[i]);
            if (isNaN(value)){
                console.log("bad input sequence, trial id is not a number.")
            }
            else{
                numberArray.push(value-1);
            }

        }
        var outArray = [];

        for (var t = 0; t<numberArray.length; t++){
            var trial = sortedArray[numberArray[t]];
            if (trial){
                outArray.push(trial)
            }
            else{
                console.log("bad input sequence, trial number not specified.")
            }

        }

        return outArray;
    }
    catch(err){
        console.log(err.message);
        return sortedArray;
    }


};


ExpTrialLoop.prototype.sortTrialBasedOnUniqueId = function(trials) {

    var sortedArray = [];
    var idArray = [];

    for (t = 0; t<trials.length; t++){
        idArray.push(trials[t].uniqueId());
    }
    for (t = 0; t<idArray.length; t++){
        var idx = idArray.indexOf(Math.min.apply(null, idArray));
        idArray.splice(idx,1,Infinity);
        sortedArray.push(trials[idx]);
    }

    return sortedArray;
};





ExpTrialLoop.prototype.getRandomizedTrials = function(allTrials) {

    console.log("get randomization...");

    if (!this.blockFixedFactorConditions()){ // all conditions  combined, not blocked
        if (this.trialRandomization()=="permute"){ // all trials permuted
            if (this.randomizationConstraint()=="maximum"){
                // do trial ordering with constraint for each factor group
                preOutArray = [];
                for (var facGroup = 0; facGroup < allTrials.length; facGroup++) {
                    var out = [];
                    var ffConds = this.factorGroups()[facGroup].getFixedFactorConditions();
                    var trials =  allTrials[facGroup];
                    var trialOrig = trials.slice(0);
                    var iter = 0;
                    while(trials.length>0 && iter <100) {
                        var constraint = this.checkConstraint(out,ffConds);
                        var trial = this.getTrialWithConstraint(trials,constraint);
                        if(trial){
                            out.push(trial);
                        }
                        else{
                            out = [];
                            trials = trialOrig.slice(0);
                            iter++;
                        }
                    }
                    preOutArray.push(out);
                }
                // find longest factor group and copy it to output array
                var lengthArr = [];
                for (var l = 0; l < preOutArray.length; l++) {
                    lengthArr.push(preOutArray[l].length);
                }
                maxi = lengthArr.indexOf(Math.max.apply(null, lengthArr));
                var copy = preOutArray[maxi].slice(0);
                outArray = preOutArray[maxi];


                // loop through the other factors groups and inset their trial in the first (biggest) one
                for (var facGroup = 0; facGroup < preOutArray.length; facGroup++) {

                    if (facGroup!=maxi){

                        var solution = false;
                        var discount = 0;
                        var iter = 0;
                        var fac = outArray.length /trials.length;
                        while (solution ==false && iter<100) {
                            var trials =  preOutArray[facGroup];
                            var insertPosition = 0;
                            while (trials.length>0 && insertPosition<=outArray.length) {
                                var increment = Math.ceil(Math.random()*fac)+1-discount;
                                insertPosition += increment;
                                var trial = trials.splice(0,1)[0];
                                outArray.splice(insertPosition,0,trial);
                            }
                            if (insertPosition<=outArray.length && trials.length==0){
                                copy = outArray.slice(0);
                                solution =true;
                            }
                            else{
                                iter++;
                                discount = Math.floor(fac);
                                outArray=copy;
                            }
                        }
                    }
                }
            }
            else if (this.randomizationConstraint()=="minimum"){
                // Todo
                var mergedArray = [].concat.apply([], allTrials);
                var outArray = this.reshuffle(mergedArray);

                // TODO: make sure that there is spacing between repetitions:
                /*var minIntervalBetweenRep = this.minIntervalBetweenRep();
                 if (minIntervalBetweenRep>0) {
                 console.log("try to satify all constraints...");
                 for (var j = 0; j < 1000; j++) {
                 var constraintsSatisfied = true;
                 for (var i = 0; i < this.trial_randomization.length; i++) {
                 var stepsToLookBack = Math.min(i, minIntervalBetweenRep);
                 for (var k = 1; k <= stepsToLookBack; k++) {
                 // look back k steps:
                 if (this.trial_randomization[i] == this.trial_randomization[i-k]) {
                 constraintsSatisfied = false;
                 // permute trial i with any random other trial:
                 var permuteWithIdx = Math.floor(Math.random() * this.trial_randomization.length);
                 var temp1 = this.trial_randomization[i];
                 this.trial_randomization[i] = this.trial_randomization[permuteWithIdx];
                 this.trial_randomization[permuteWithIdx] = temp1;
                 }
                 }
                 }
                 if (constraintsSatisfied) {
                 console.log("all constraints were satisfied in iteration "+j);
                 break;
                 }
                 else {
                 console.log("not all constraints were satisfied in iteration "+j);
                 }
                 }
                 if (!constraintsSatisfied){
                 console.log("constraints could not be satisfied!");
                 }
                 }*/
            }
            else if (this.randomizationConstraint()=="none"){
                var mergedArray = [].concat.apply([], allTrials);
                var outArray = this.reshuffle(mergedArray);

            }

        }

        else if (this.trialRandomization()=="fixedAsInEditor") {
            var mergedTrials  = [].concat.apply([], allTrials);
            var outArray = this.sortTrialBasedOnUniqueId(mergedTrials);
        }

        else if (this.trialRandomization()=="fixedByHand") {
            var mergedTrials  = [].concat.apply([], allTrials);
            var sortedArray = this.sortTrialBasedOnUniqueId(mergedTrials);
            var outArray = this.sortTrialBasedOnInputArray(sortedArray);
        }
    }

    else{ // conditions  blocked

        preOutArray = [];
        for (var facGroup = 0; facGroup < allTrials.length; facGroup++) {
            preOutArray.push([]);
            var ffConds = this.factorGroups()[facGroup].getFixedFactorConditions();

            var trialsPerCondGroup = [];
            for (var i = 0; i <ffConds.length; i++) {
                trialsPerCondGroup.push([]);
            }

            for (var trialIdx =0; trialIdx < allTrials[facGroup].length; trialIdx++) {
                var trial = allTrials[facGroup][trialIdx];
                var condGroup = this.getCondGroup(trial.condition.conditionIdx()-1,ffConds);
                trialsPerCondGroup[condGroup].push(trial);
            }

            if (this.trialRandomization()=="permute"){

                for (var condGroupIdx =0; condGroupIdx < trialsPerCondGroup.length; condGroupIdx++) {
                    preOutArray[facGroup][condGroupIdx] = this.reshuffle(trialsPerCondGroup[condGroupIdx]);
                }

            }

            else if (this.trialRandomization()=="fixedAsInEditor") {
                for (var condGroupIdx =0; condGroupIdx < trialsPerCondGroup.length; condGroupIdx++) {
                    preOutArray[facGroup][condGroupIdx] = this.sortTrialBasedOnUniqueId(trialsPerCondGroup[condGroupIdx]);
                }
            }


            else if (this.trialRandomization()=="fixedByHand") {
                var mergedTrials  = [].concat.apply([], allTrials);
                var sortedArray = this.sortTrialBasedOnUniqueId(mergedTrials);
                var outArray = this.sortTrialBasedOnInputArray(sortedArray);
            }
        }

        if (this.orderOfConditions()=="fixed"){
            //  put conditions together in  numerical order
            var mergedConditions = [].concat.apply([], preOutArray);
            var outArray = [].concat.apply([], mergedConditions);

        }
        else if (this.orderOfConditions()=="permuteUnbalanced"){
            var mergedConditions = [].concat.apply([], preOutArray);
            var mergedReshuffled = this.reshuffle(mergedConditions);
            var outArray = [].concat.apply([], mergedReshuffled);
        }
        else if (this.orderOfConditions()=="balanceBetweenSubjects"){
            // ToDo
        }
    }






    // convert to full trial specification:
    for (var trialIdx=0; trialIdx < outArray.length; trialIdx++) {
        outArray[trialIdx] = {
            type: 'trialVariation',
            trialVariation: outArray[trialIdx]
        };
        this.completeSelectionSpec(outArray[trialIdx]);
    }

    return outArray;
};

ExpTrialLoop.prototype.removeGroup = function(facGroupIdx,idx) {
    this.factorGroups.splice(facGroupIdx,1);
    this.subSequencePerFactorGroup().splice(facGroupIdx,1);
};

ExpTrialLoop.prototype.completeSelectionSpec = function(selectionSpec) {
    // add some meta data to the specification to make later calculations easier:
    if (selectionSpec.type == 'factorLevel') {
        selectionSpec.factorGroup = selectionSpec.factor.factorGroup;

        // add level index for later use:
        selectionSpec.levelIdx = selectionSpec.factor.globalVar().levels().indexOf(selectionSpec.level);
    }
    if (selectionSpec.type == 'condition' || selectionSpec.type == 'trialVariation') {
        if (selectionSpec.type == 'trialVariation') {
            selectionSpec.condition = selectionSpec.trialVariation.condition;
        }

        selectionSpec.factorGroup = selectionSpec.condition.factorGroup;

        // add the selected factors and levels and level indices for later use...
        selectionSpec.allFactors = selectionSpec.factorGroup.factors();
        selectionSpec.allLevels = selectionSpec.condition.factorLevels();
        selectionSpec.allLevelIdx = [];
        for (var i = 0; i < selectionSpec.allLevels.length; i++) {
            var levelIdx = selectionSpec.allFactors[i].globalVar().levels().indexOf(selectionSpec.allLevels[i]);
            selectionSpec.allLevelIdx.push(levelIdx);
        }
    }
};

/**
 * Select a specific or multiple trial types.
 *
 * @param {object} selectionSpec - the specification of the trials that are selected:
 * 4 types possible:
 * { type: 'allTrials', factorGroup: facGroup_obj }
 * { type: 'factorLevel', factor: factor_obj, level: level_obj}
 * { type: 'condition', condition: condition_obj }
 * { type: 'trialVariation', trialVariation: trialVariation_obj }
 */
ExpTrialLoop.prototype.selectTrialType = function(selectionSpec) {

    this.completeSelectionSpec(selectionSpec);

    var factorGroupIdx = this.factorGroups().indexOf( selectionSpec.factorGroup );
    var selectedSubSequence = this.subSequencePerFactorGroup()[factorGroupIdx];
    if (selectedSubSequence != this.subSequence()) {
        this.subSequence(selectedSubSequence);
    }
    this.subSequence().selectTrialType(selectionSpec);
    this.selectionSpec(selectionSpec);
};

/**
 * This function initializes all internal state variables to point to other instances in the same experiment. Usually
 * this is called after ALL experiment instances were deserialized using fromJS(). In this function use
 * 'entitiesArr.byId[id]' to retrieve an instance from the global list given some unique id.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpTrialLoop.prototype.setPointers = function(entitiesArr) {
    var self = this;

    var factorGroups = this.factorGroups();
    var subSequences = this.subSequencePerFactorGroup();

    var subSequencesObj = [];
    for (var i=0; i<subSequences.length; i++) {
        var subSequence = entitiesArr.byId[subSequences[i]];
        subSequence.parent = self;
        subSequence.setFactorGroup(factorGroups[i]);
        subSequencesObj.push(subSequence);
    }
    this.subSequencePerFactorGroup(subSequencesObj);
    this.subSequence(subSequencesObj[0]);

    this.eventVariables(jQuery.map( this.eventVariables(), function( id ) {
        return entitiesArr.byId[id];
    } ));
    this.isInitialized(true);

    jQuery.each( this.factorGroups(), function( index, elem ) {
        elem.setPointers(entitiesArr);
    } );

};

/**
 * Recursively adds all child objects that have a unique id to the global list of entities.
 *
 * @param {ko.observableArray} entitiesArr - this is the knockout array that holds all instances.
 */
ExpTrialLoop.prototype.reAddEntities = function(entitiesArr) {
    // add the direct child nodes:
    // check if they are not already in the list:

    jQuery.each(this.eventVariables(), function( index, elem ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(elem.id())) {
            entitiesArr.push(elem);
        }
    });

    jQuery.each(this.factorGroups(), function( index, factorGroup ) {
        factorGroup.reAddEntities(entitiesArr);
    });

    // recursively make sure that all deep tree nodes are in the entities list:
    jQuery.each(this.subSequencePerFactorGroup(), function( index, subSequence ) {
        // check if they are not already in the list:
        if (!entitiesArr.byId.hasOwnProperty(subSequence.id())) {
            entitiesArr.push(subSequence);
        }
        subSequence.reAddEntities(entitiesArr);
    });

};

/**
 * load from a json object to deserialize the states.
 * @param {object} data - the json description of the states.
 * @returns {ExpTrialLoop}
 */
ExpTrialLoop.prototype.fromJS = function(data) {
    var self = this;

    this.id(data.id);
    this.name(data.name);
    this.editorX(data.editorX);
    this.editorY(data.editorY);
    this.editorWidth(data.editorWidth);
    this.editorHeight(data.editorHeight);
    if (data.hasOwnProperty('displayInitialCountdown')) {
        this.displayInitialCountdown(data.displayInitialCountdown);
    }
    this.type =  data.type;

    if (data.hasOwnProperty('subSequence')){
        // convert from old version:
        this.subSequencePerFactorGroup([data.subSequence]);
    }
    else {
        // new version:
        this.factorGroups(jQuery.map(data.factorGroups, function (factorGroup) {
            return (new FactorGroup(self.expData,self)).fromJS(factorGroup);
        }));
        this.subSequencePerFactorGroup(data.subSequencePerFactorGroup);
    }

    this.repsPerTrialType(data.repsPerTrialType);
    this.isActive(data.isActive);

    if (data.hasOwnProperty('randomizationOverview')){
        this.randomizationOverview(data.randomizationOverview);
    }
    if (data.hasOwnProperty('blockFixedFactorConditions')){
        this.blockFixedFactorConditions(data.blockFixedFactorConditions);
    }
    if (data.hasOwnProperty('trialRandomization')){
        this.trialRandomization(data.trialRandomization);
    }
    if (data.hasOwnProperty('minIntervalBetweenRep')){
        this.minIntervalBetweenRep(data.minIntervalBetweenRep);
    }
    if (data.hasOwnProperty('orderOfConditions')){
        this.orderOfConditions(data.orderOfConditions);
    }
    if (data.hasOwnProperty('fixedTrialOrder')){
        this.fixedTrialOrder(data.fixedTrialOrder);
    }
    if (data.hasOwnProperty('allTrialsToAllSubjects')){
        this.allTrialsToAllSubjects(data.allTrialsToAllSubjects);
    }
    if (data.hasOwnProperty('numberTrialsToShow')){
        this.numberTrialsToShow(data.numberTrialsToShow);
    }
    if (data.hasOwnProperty('balanceAmountOfConditions')){
        this.balanceAmountOfConditions(data.balanceAmountOfConditions);
    }
    if (data.hasOwnProperty('maxIntervalSameCondition')){
        this.maxIntervalSameCondition(data.maxIntervalSameCondition);
    }
    if (data.hasOwnProperty('randomizationConstraint')){
        this.randomizationConstraint(data.randomizationConstraint);
    }

    if (data.hasOwnProperty('zoomMode')){
        this.zoomMode(data.zoomMode);
    }
    if (data.hasOwnProperty('visualDegreeToUnit')){
        this.visualDegreeToUnit(data.visualDegreeToUnit);
    }

    this.webcamEnabled(data.webcamEnabled);
    this.eventVariables(data.eventVariables);

    return this;

};

/**
 * serialize the state of this instance into a json object, which can later be restored using the method fromJS.
 * @returns {object}
 */
ExpTrialLoop.prototype.toJS = function() {
    return {
        id: this.id(),
        name: this.name(),
        editorX:  this.editorX(),
        editorY:  this.editorY(),
        editorWidth: this.editorWidth(),
        editorHeight: this.editorHeight(),
        displayInitialCountdown: this.displayInitialCountdown(),
        type: this.type,
        factorGroups: jQuery.map( this.factorGroups(), function( factorGroup ) { return factorGroup.toJS(); }),
        subSequencePerFactorGroup: jQuery.map( this.subSequencePerFactorGroup(), function( subSequence ) { return subSequence.id(); }),

        repsPerTrialType:  this.repsPerTrialType(),
        isActive:  this.isActive(),

        randomizationOverview:this.randomizationOverview(),
        minIntervalBetweenRep: this.minIntervalBetweenRep(),
        blockFixedFactorConditions: this.blockFixedFactorConditions(),
        trialRandomization: this.trialRandomization(),
        orderOfConditions: this.orderOfConditions(),
        fixedTrialOrder: this.fixedTrialOrder(),
        allTrialsToAllSubjects: this.allTrialsToAllSubjects(),
        numberTrialsToShow: this.numberTrialsToShow(),
        balanceAmountOfConditions: this.balanceAmountOfConditions(),
        maxIntervalSameCondition: this.maxIntervalSameCondition(),
        randomizationConstraint: this.randomizationConstraint(),

        zoomMode: this.zoomMode(),
        visualDegreeToUnit: this.visualDegreeToUnit(),

        webcamEnabled: this.webcamEnabled(),
        eventVariables: jQuery.map( this.eventVariables(), function( eventVariables ) { return eventVariables.id(); })
    };
};
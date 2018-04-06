function entityFactory(entityJson, expData,params) {

    var entity;

    switch (entityJson.type) {
        case 'StartBlock':
            entity = new StartBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'EndBlock':
            entity = new EndBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'QuestionnaireEditorData':
            entity = new QuestionnaireEditorData(expData);
            entity.fromJS(entityJson);
            break;
        case 'Connection':
            entity = new Connection(expData);
            entity.fromJS(entityJson);
            break;
        case 'Sequence':
            entity = new Sequence(expData);
            entity.fromJS(entityJson);
            break;
        case 'TextEditorData':
            entity = new TextEditorData(expData);
            entity.fromJS(entityJson);
            break;
        case 'FrameData':
            entity = new FrameData(expData);
            entity.fromJS(entityJson);
            break;
        case 'SubjectGroup':
            entity = new SubjectGroup(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpSession':
            entity = new ExpSession(expData);
            entity.fromJS(entityJson);
            break;
        case 'ImageData':
            entity = new ImageData(expData);
            entity.fromJS(entityJson);
            break;
        case 'VideoElement':
            entity = new VideoElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpBlock':
            entity = new ExpBlock(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpTrialLoop':
            entity = new ExpTrialLoop(expData);
            entity.fromJS(entityJson);
            break;
        case 'GlobalVar':
            entity = new GlobalVar(expData);
            entity.fromJS(entityJson);
            break;
        case 'CheckBoxElement':
            var elem = new CheckBoxElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'MultipleChoiceElement':
            var elem = new MultipleChoiceElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'MultiLineInputElement':
            var elem = new MultiLineInputElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'RangeElement':
            var elem = new RangeElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'ScaleElement':
            var elem = new ScaleElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'InputElement':
            var elem = new InputElement(expData);
            elem.fromJS(entityJson);
            entity = new PageElement(expData);
            entity.id(entityJson.id);
            entity.name(entityJson.name);
            entity.addContent(elem);
            break;
        case 'PageData':
            entity = new PageData(expData);
            entity.fromJS(entityJson);
            break;
        case 'FrameElement':
            entity = new FrameElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'PageElement':
            entity = new PageElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'Event':
            // WARNING: This needs to stay here for backwards compatibility to old experiments!
            entity = new ExpEvent(expData);
            entity.fromJS(entityJson);
            break;
        case 'ExpEvent':
            entity = new ExpEvent(expData);
            entity.fromJS(entityJson);
            break;
        case 'Factor':
            if (params){
                entity = new Factor(expData,params[0]);
            }
            else{
                entity = new Factor(expData);
            }
            entity.fromJS(entityJson);
            break;
        case 'FactorGroup':
            entity = new FactorGroup(expData,params[0]);
            entity.fromJS(entityJson);
            break;
        case 'SessionTimeSettings':
            entity = new SessionTimeData(expData);
            entity.fromJS(entityJson);
            break;
        default:
            console.error("type " + entityJson.type + " is not defined in factory method.")
    }

    return entity;
}
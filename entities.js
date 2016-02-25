function entityFactory(entityJson, expData) {

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
        case 'VideoData':
            entity = new VideoData(expData);
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
        case 'checkBox':
            entity = new CheckBoxElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'mChoice':
            entity = new MChoiceElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'paragraph':
            entity = new ParagraphElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'range':
            entity = new RangeElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'scale':
            entity = new ScaleElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'text':
            entity = new TextElement(expData);
            entity.fromJS(entityJson);
            break;
        case 'newPage':
            entity = new NewPageElement(expData);
            entity.fromJS(entityJson);
            break;
        default:
            console.error("type " + entityJson.type + " is not defined in factory method.")
    }

    return entity;
}
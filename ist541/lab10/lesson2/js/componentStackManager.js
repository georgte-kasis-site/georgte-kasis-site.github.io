function ComponentStackManager(objectReference, containerElement, dataObj, navigationCallback, viewMode)
{
    var me = this;
    this.assignmentId = (typeof(assignment) != "undefined" && assignment ? assignment.id : 0);
    this.studentAssignmentId = (typeof (studentAssignment) != "undefined" && studentAssignment ? studentAssignment.id : 0)
    this.studentId = (typeof (studentAssignment) != "undefined" && studentAssignment ? studentAssignment.studentId : 0)
    this.gradingProtocolId = (typeof (gradingProtocolId) != "undefined" ? gradingProtocolId : 0);
    this.currentSectionSortKey = (typeof (currentSectionSortKey) != "undefined" ? currentSectionSortKey : 0);
    this.currentActivitySortKey = (typeof (currentActivitySortKey) != "undefined" ? currentActivitySortKey : 0);
    this.componentStackRunCount = (typeof (componentStackRunCount) != "undefined" ? componentStackRunCount : 0);
    //    this.streamSupport = typeof (EventLoop) != "undefined";
    this.streamSupport = false;
    this.stackExecuting = false;
    this.objectReference = objectReference;
    this.containerElement = containerElement;
    this.viewMode = (typeof (viewMode) != "undefined" ? viewMode : "print");
    this.moduleFeatures = {
        info: false, print: false, source: false, copyright: false, notes: false, studentNotes: false, answerKey: false, glossary: false, toolbar:false, header: false, timer: true, rating: false, limitBrowserFunctionality: true, triggerHiddenActivities:false, mediaOptions: copyGlobalVariable(defaultUcatMediaOptions) };
    this.dataCollectionComplete = false;
    this.data =
    {
        module:(typeof(dataObj.module) != "undefined" ? dataObj.module : false),
        correctAnswers: (typeof (dataObj.correctAnswers) != "undefined" ? dataObj.correctAnswers : false),
        feedback: (typeof (dataObj.feedback) != "undefined" ? dataObj.feedback : false),
        lexicalItems: (typeof (dataObj.lexicalItems) != "undefined" ? dataObj.lexicalItems : false),
        gradingProtocolValues: (typeof (dataObj.gradingProtocolValues) != "undefined" ? dataObj.gradingProtocolValues : false),
        studentAnswers: (typeof (dataObj.studentAnswers) != "undefined" ? dataObj.studentAnswers : false),
        comments: (typeof (dataObj.comments) != "undefined" ? dataObj.comments : false),
        aggregateStudentAnswers: (typeof (dataObj.aggregateStudentAnswers) != "undefined" ? dataObj.aggregateStudentAnswers : false),
    };
    this.requiredData =
    {
        module:true,
        correctAnswers: false,
        feedback: false,
        lexicalItems: false,
        gradingProtocolValues: false,
        studentAnswers: false,
        comments: false,
        aggregateStudentAnswers: false
    };
    this.streamData =
    {
        module: false,
        correctAnswers: false,
        feedback: false,
        lexicalItems: false,
        gradingProtocolValues: false,
        studentAnswers: false,
        comments: false,
        aggregateStudentAnswers: false
    }
    this.streamProcess =
    {
        module: false,
        correctAnswers: false,
        feedback: false,
        lexicalItems: false,
        gradingProtocolValues: false,
        studentAnswers: false,
        comments: false,
        aggregateStudentAnswers: false
    }
    this.navigationCallback = navigationCallback;

    this.init = function ()
    {
        me.setDataDefaults();
        me.setDataRequirements();
        me.loadData();
    }

    this.setDataDefaults = function ()
    {
        me.dataCollectionComplete = false;
        me.requiredData.module = false;
        me.requiredData.correctAnswers = false;
        me.requiredData.feedback = false;
        me.requiredData.lexicalItems = false;
        me.requiredData.notes = false;
        me.requiredData.gradingProtocolValues = false;
        me.requiredData.studentAnswers = false;
        me.requiredData.comments = false;
        me.streamData.module = false;
        me.streamData.correctAnswers = false;
        me.streamData.feedback = false;
        me.streamData.lexicalItems = false;
        me.streamData.notes = false;
        me.streamData.gradingProtocolValues = false;
        me.streamData.studentAnswers = false;
        me.streamData.comments = false;
        me.moduleFeatures.mediaOptions.audio.limitPlays = 0;
        me.moduleFeatures.mediaOptions.audio.transcript = false;
        me.moduleFeatures.mediaOptions.video.limitPlays = 0;
        me.moduleFeatures.mediaOptions.video.transcript = false;
        if (me.streamProcess.module)
            me.streamProcess.module.terminate();
        me.streamProcess.module = false;
        if (me.streamProcess.correctAnswers)
            me.streamProcess.correctAnswers.terminate();
        me.streamProcess.correctAnswers = false;
        if (me.streamProcess.feedback)
            me.streamProcess.feedback.terminate();
        me.streamProcess.feedback = false;
        if (me.streamProcess.lexicalItems)
            me.streamProcess.lexicalItems.terminate();
        me.streamProcess.lexicalItems = false;
        if (me.streamProcess.notes)
            me.streamProcess.notes.terminate();
        me.streamProcess.notes = false;
        if (me.streamProcess.gradingProtocolValues)
            me.streamProcess.gradingProtocolValues.terminate();
        me.streamProcess.gradingProtocolValues = false;
        if (me.streamProcess.studentAnswers)
            me.streamProcess.studentAnswers.terminate();
        me.streamProcess.studentAnswers = false;
        if (me.streamProcess.comments)
            me.streamProcess.comments.terminate();
        me.streamProcess.comments = false;
        if (me.streamProcess.aggregateStudentAnswers)
            me.streamProcess.aggregateStudentAnswers.terminate();
        me.streamProcess.aggregateStudentAnswers = false;
    }

    this.setDataRequirements = function ()
    {
        me.requiredData.module = true;
        if ((me.viewMode == "gradingProtocol")||(me.viewMode == "teacherEdition"))
        {
            me.requiredData.correctAnswers = true;
            me.requiredData.gradingProtocolValues = true;
            me.moduleFeatures.notes = true;
        }
        if (me.viewMode == "teacherReview")
        {
            if (typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.initiateDate)
            {
                me.requiredData.studentAnswers = true;
                me.requiredData.feedback = true;
                me.requiredData.lexicalItems = true;

                me.streamData.studentAnswers = me.streamSupport;

                me.moduleFeatures.info = true;
                me.moduleFeatures.source = true;
                me.moduleFeatures.glossary = true;
                me.moduleFeatures.notes = true;
                me.moduleFeatures.studentNotes = assignment.allowStudentNotes;

                if (studentAssignment.submitDate)
                {
                    me.requiredData.correctAnswers = true;
                    me.requiredData.gradingProtocolValues = true;
                    me.requiredData.comments = true;
                    me.streamData.comments = me.streamSupport;
                }
            }
        }
        if (me.viewMode == "studentView")
        {
            if ((typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.initiateDate) && (studentAssignment.authorizationToken.canDo || studentAssignment.authorizationToken.canReview))
            {
                if(studentAssignment.signatureDate)
                {
                    me.requiredData.studentAnswers = true;
                    me.requiredData.lexicalItems = true;
                    me.moduleFeatures.notes = true;
                    me.moduleFeatures.studentNotes = (studentAssignment.studentNotes !== false);
                    me.moduleFeatures.glossary = true;
                    me.moduleFeatures.triggerHiddenActivities = true;
                    if (studentAssignment.authorizationToken && studentAssignment.authorizationToken.canReview)
                    {
                        me.requiredData.correctAnswers = true;
                        me.requiredData.gradingProtocolValues = true;
                        me.requiredData.comments = true;
                        me.requiredData.feedback = true;
                        me.streamData.studentAnswers = me.streamSupport;
                        me.streamData.comments = me.streamSupport;


                        me.moduleFeatures.info = true;
                        me.moduleFeatures.source = true;
                        me.moduleFeatures.rating = !studentAssignment.authorizationToken.allowAssessment;
                        me.moduleFeatures.answerKey = true;
                        me.moduleFeatures.triggerHiddenActivities = false;
                        me.moduleFeatures.mediaOptions.audio.transcript = true;
                        me.moduleFeatures.mediaOptions.video.transcript = true;
                    }

                    if (studentAssignment.authorizationToken && !studentAssignment.authorizationToken.allowAssessment)
                    {
                        me.moduleFeatures.info = true;
                        me.moduleFeatures.source = true;
                        me.moduleFeatures.rating = true;
                    }
                }
            }
            me.moduleFeatures.toolbar = ((me.moduleFeatures.studentNotes) || (me.moduleFeatures.answerKey));
        }
        if (me.viewMode == "selfStudyPreview")
        {
            me.requiredData.correctAnswers = true;
            me.requiredData.feedback = true;
            me.moduleFeatures.timer = false;
            me.moduleFeatures.limitBrowserFunctionality = false;
            me.moduleFeatures.triggerHiddenActivities = true;
            me.moduleFeatures.mediaOptions.audio.transcript = true;
            me.moduleFeatures.mediaOptions.video.transcript = true;
        }
        if (me.viewMode == "selfStudy")
        {
            me.requiredData.correctAnswers = true;
            me.requiredData.feedback = true;
            me.requiredData.lexicalItems = true;
            me.requiredData.studentAnswers = ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.initiateDate && studentAssignment.authorizationToken && studentAssignment.authorizationToken.canDo);
            me.moduleFeatures.studentNotes = ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.studentNotes !== false);
            me.moduleFeatures.info = true;
            me.moduleFeatures.print = true;
            me.moduleFeatures.rating = true;
            me.moduleFeatures.source = true;
            me.moduleFeatures.notes = true;
            me.moduleFeatures.glossary = true;
            me.moduleFeatures.header = true;
            me.moduleFeatures.timer = false;
            me.moduleFeatures.limitBrowserFunctionality = false;
            me.moduleFeatures.triggerHiddenActivities = true;
            me.moduleFeatures.mediaOptions.audio.transcript = true;
            me.moduleFeatures.mediaOptions.video.transcript = true;
        }
        if (me.viewMode == "sharedAssignment")
        {
            me.requiredData.correctAnswers = true;
            me.requiredData.feedback = true;
            me.requiredData.lexicalItems = true;
            me.requiredData.studentAnswers = ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.initiateDate);
            me.moduleFeatures.studentNotes = ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.studentNotes !== false);
            me.moduleFeatures.info = true;
            me.moduleFeatures.print = true;
            me.moduleFeatures.rating = true;
            me.moduleFeatures.source = true;
            me.moduleFeatures.notes = true;
            me.moduleFeatures.glossary = true;
            me.moduleFeatures.header = false;
            me.moduleFeatures.timer = false;
            me.moduleFeatures.limitBrowserFunctionality = false;
            me.moduleFeatures.triggerHiddenActivities = true;
            me.moduleFeatures.mediaOptions.audio.transcript = true;
            me.moduleFeatures.mediaOptions.video.transcript = true;
        }
        if (me.viewMode == "reports")
        {
            if (typeof (assignment) != "undefined" && assignment && assignment.completeDate)
            {
                me.requiredData.aggregateStudentAnswers = true;
                me.requiredData.gradingProtocolValues = true;
                me.requiredData.correctAnswers = true;
            }
        }
    }

    this.loadData = function ()
    {
        if (!me.dataCollectionComplete && me.requiredData.module)
            me.loadModuleData();
        if (!me.dataCollectionComplete && me.requiredData.correctAnswers)
            me.loadCorrectAnswersData();
        if (!me.dataCollectionComplete && me.requiredData.feedback)
            me.loadFeedbackData();
        if (!me.dataCollectionComplete && me.requiredData.lexicalItems)
            me.loadLexicalItemsData();
        if (!me.dataCollectionComplete && me.requiredData.gradingProtocolValues)
            me.loadGradingProtocolValuesData();
        if (!me.dataCollectionComplete && me.requiredData.studentAnswers)
            me.loadStudentAnswersData();
        if (!me.dataCollectionComplete && me.requiredData.comments)
            me.loadCommentsData();
        if (!me.dataCollectionComplete && me.requiredData.aggregateStudentAnswers)
            me.loadAggregateStudentAnswersData();
    }

    this.reconcileRequiredData = function ()
    {
        me.dataCollectionComplete = true;
        for (var key in me.requiredData)
        {
            if (me.requiredData[key] && !me.data[key])
                me.dataCollectionComplete = false;
        }
        if (me.dataCollectionComplete)
        {
            me.mergeRequiredData();
            me.navigationCallback(me);
        }
    }

    this.mergeRequiredData = function ()
    {
        if (me.data.module.length > 0)
        {
            //this might not be necessary
//            for(var m=0; m<me.data.module.length; m++)
//                me.mergeRequiredModuleData(me.data.module[m]);
        }
        else
        {
            me.mergeRequiredModuleData();
        }
    }

    this.mergeRequiredModuleData = function()
    {
        me.data.module.moduleFeatures = me.moduleFeatures;
        if (!me.data.module.locked)
        {
            me.data.module.maxValue = 0;
            me.data.module.maxBonusValue = 0;
            me.data.module.lexicalItems = me.data.lexicalItems;
            if ((!me.moduleFeatures.triggerHiddenActivities) && (typeof (me.data.module.hiddenActivities) != "undefined"))
            {
                for (var ha = 0; ha < me.data.module.hiddenActivities.length; ha++)
                {
                    me.data.module.activities.splice(me.data.module.hiddenActivities[ha].sortKey - 1, 0, me.data.module.hiddenActivities[ha]);
                }
                me.data.module.hiddenActivities = new Array();
            }
            if (me.data.module.activities)
            {
                for (var a = 0; a < me.data.module.activities.length; a++)
                {
                    var activity = me.data.module.activities[a];
                    me.mergeRequiredActivityData(activity);
                }
            }
            if ((typeof (me.data.module.hiddenActivities) != "undefined")&&(me.data.module.hiddenActivities))
            {
                var studentAssignmentSessionObject = false;
                if ((typeof (studentAssignment) != "undefined") && (studentAssignment.sessionState))
                {
                    if (typeof (studentAssignment.sessionState) == "object")
                        studentAssignmentSessionObject = studentAssignment.sessionState;
                    else
                        studentAssignmentSessionObject = $.parseJSON(htmlDecode(studentAssignment.sessionState));
                }
                for (var h = 0; h < me.data.module.hiddenActivities.length; h++)
                {
                    var activity = me.data.module.hiddenActivities[h];
                    activity.triggerData = false;
                    if (studentAssignmentSessionObject && studentAssignmentSessionObject.activityTriggers)
                    {
                        for (var at = 0; at < studentAssignmentSessionObject.activityTriggers.length; at++)
                        {
                            if (studentAssignmentSessionObject.activityTriggers[at].activityId == activity.id)
                                activity.triggerData = studentAssignmentSessionObject.activityTriggers[at];
                        }
                    }
                    me.mergeRequiredActivityData(activity);
                }
            }
        }
    }

    this.mergeRequiredActivityData = function (activity)
    {
        activity.maxValue = 0;
        activity.maxBonusValue = 0;
        if (activity.activityComponents)
        {
            for (var ac = 0; ac < activity.activityComponents.length; ac++)
            {
                var activityComponent = activity.activityComponents[ac];
                if (typeof (assignment) != "undefined" && assignment && assignment.shared)
                    activityComponent.randomizePrompts = false;
                activityComponent.maxValue = 0;
                activityComponent.maxBonusValue = 0;
                if (activityComponent.prompts)
                {
                    for (var p = 0; p < activityComponent.prompts.length; p++)
                    {
                        var prompt = activityComponent.prompts[p];
                        prompt.componentTitle = activityComponent.componentTitle;
                        if (activityComponent.componentTitle.toLowerCase() == "speaking")
                        {
                            switch (me.viewMode)
                            {
                                case "studentView":
                                    if ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.authorizationToken)
                                    {
                                        if (studentAssignment.authorizationToken.canDo)
                                        {
                                            prompt.recorder = { record: true, download: false, submit: true };
                                        }
                                        else if (studentAssignment.authorizationToken.canView)
                                        {
                                            prompt.recorder = { record: false, download: false, submit: false };
                                        }
                                    }
                                    break;
                                case "selfStudyPreview":
                                case "selfStudy":
                                case "sharedAssignment":
                                    prompt.recorder = { record: true, download: true, submit: true };
                                    break;
                                default:
                                    prompt.recorder = { record: false, download: false, submit: false };
                                    break;
                            }
                        }
                        else
                            prompt.recorder = false;
                        if (activityComponent.componentTitle.toLowerCase() == "writing")
                        {
                            switch (me.viewMode)
                            {
                                case "studentView":
                                    if ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.authorizationToken)
                                    {
                                        if (studentAssignment.authorizationToken.canDo)
                                        {
                                            prompt.sketchpad = { drawTools: true, stepControls: true, submit: true };
                                        }
                                        else if (studentAssignment.authorizationToken.canView)
                                        {
                                            prompt.sketchpad = { drawTools: false, stepControls: true, submit: false };
                                        }
                                    }
                                    break;
                                case "selfStudyPreview":
                                case "selfStudy":
                                case "sharedAssignment":
                                    prompt.sketchpad = { drawTools: true, stepControls: true, submit: true };
                                    break;
                                default:
                                    prompt.sketchpad = { drawTools: false, stepControls: true, submit: false };
                                    break;
                            }
                        }
                        else
                            prompt.sketchpad = false;
                        if (me.data.correctAnswers != false)
                        {
                            var createNewResponsesArray = typeof (prompt.responses) == "undefined";
                            if (createNewResponsesArray)
                                prompt.responses = new Array();
                            prompt.correctResponseCount = 0;
                            prompt.maxValue = 0;
                            prompt.maxBonusValue = 0;
                            for (var c = 0; c < me.data.correctAnswers.length; c++)
                            {
                                var correctAnswer = me.data.correctAnswers[c];
                                correctAnswer.text = htmlDecode(correctAnswer.text);
                                if ((correctAnswer.activityId == activity.id) && (correctAnswer.activityComponentId == activityComponent.id) && (correctAnswer.promptId == prompt.id))
                                {
                                    correctAnswer.maxValue = 0;
                                    correctAnswer.maxBonusValue = 0;
                                    correctAnswer.value = 0;
                                    correctAnswer.bonusValue = 0;
                                    if (me.data.gradingProtocolValues != false)
                                    {
                                        for (var g = 0; g < me.data.gradingProtocolValues.length; g++)
                                        {
                                            var gradingProtocolValue = me.data.gradingProtocolValues[g];
                                            if ((gradingProtocolValue.moduleId == me.data.module.id) && (gradingProtocolValue.activityId == activity.id) && (gradingProtocolValue.activityComponentId == activityComponent.id) && (gradingProtocolValue.promptId == prompt.id))
                                            {
                                                if (gradingProtocolValue.responseId == correctAnswer.id)
                                                {
                                                    correctAnswer.value = gradingProtocolValue.value;
                                                    correctAnswer.bonusValue = typeof (gradingProtocolValue.bonusValue) == "undefined" ? 0 : gradingProtocolValue.bonusValue;
                                                    if (gradingProtocolValue.value > 0)
                                                    {
                                                        correctAnswer.maxValue = gradingProtocolValue.value;
                                                        prompt.maxValue += gradingProtocolValue.value;
                                                        activityComponent.maxValue += gradingProtocolValue.value;
                                                        activity.maxValue += gradingProtocolValue.value;
                                                        module.maxValue += gradingProtocolValue.value;
                                                    }
                                                    if ((typeof (gradingProtocolValue.bonusValue) != "undefined") && (gradingProtocolValue.bonusValue > 0))
                                                    {
                                                        correctAnswer.maxBonusValue = gradingProtocolValue.bonusValue;
                                                        prompt.maxBonusValue += gradingProtocolValue.bonusValue;
                                                        activityComponent.maxBonusValue += gradingProtocolValue.bonusValue;
                                                        activity.maxBonusValue += gradingProtocolValue.bonusValue;
                                                        module.maxBonusValue += gradingProtocolValue.bonusValue;
                                                    }
                                                }
                                                else if (typeof (correctAnswer.alternateResponses) != "undefined")
                                                {
                                                    for (var ar = 0; ar < correctAnswer.alternateResponses.length; ar++)
                                                    {
                                                        correctAnswer.alternateResponses[ar].text = htmlDecode(correctAnswer.alternateResponses[ar].text);
                                                        if (gradingProtocolValue.responseId == correctAnswer.alternateResponses[ar].id)
                                                        {
                                                            correctAnswer.alternateResponses[ar].value = gradingProtocolValue.value;
                                                            correctAnswer.alternateResponses[ar].bonusValue = typeof (gradingProtocolValue.bonusValue) == "undefined" ? 0 : gradingProtocolValue.bonusValue;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (createNewResponsesArray)
                                        prompt.responses.push(correctAnswer);
                                    else
                                    {
                                        for (var r = 0; r < prompt.responses.length; r++)
                                        {
                                            if (prompt.responses[r].id == correctAnswer.id)
                                            {
                                                prompt.responses[r].activityComponentId = correctAnswer.activityComponentId;
                                                prompt.responses[r].activityId = correctAnswer.activityId;
                                                prompt.responses[r].correct = correctAnswer.correct;
                                                prompt.responses[r].parentResponseId = correctAnswer.parentResponseId;
                                                prompt.responses[r].promptId = correctAnswer.promptId;
                                                prompt.responses[r].sortKey = correctAnswer.sortKey;
                                                prompt.responses[r].text = correctAnswer.text;
                                                prompt.responses[r].maxValue = correctAnswer.maxValue;
                                                prompt.responses[r].maxBonusValue = correctAnswer.maxBonusValue;
                                                prompt.responses[r].value = correctAnswer.value;
                                                prompt.responses[r].bonusValue = correctAnswer.bonusValue;
                                                prompt.responses[r].alternateResponses = correctAnswer.alternateResponses;
                                            }
                                        }
                                    }
                                    if (correctAnswer.correct == true)
                                        prompt.correctResponseCount++;
                                }
                            }
                        }
                        if (me.data.feedback != false)
                        {
                            prompt.feedback = new Array();
                            for (var f = 0; f < me.data.feedback.length; f++)
                            {
                                var feedback = me.data.feedback[f];
                                feedback.read = false;
                                if (feedback.promptId == prompt.id)
                                {
                                    prompt.feedback.push(feedback);
                                }
                                for (var r = 0; r < prompt.responses.length; r++)
                                {
                                    var response = prompt.responses[r];
                                    if (typeof (response.feedback) == "undefined")
                                        response.feedback = new Array();
                                    if (feedback.responseId == response.id)
                                    {
                                        response.feedback.push(feedback);
                                    }
                                }
                            }
                        }
                        if (typeof (prompt.resources) == "undefined")
                            prompt.resources = new Array();
                        for (var r = 0; r < prompt.resources.length; r++)
                        {
                            var resourceMediaOptions = copyGlobalVariable(defaultUcatAudioOptions);
                            if (typeof (prompt.resources[r].jsonData) == "string")
                            {
                                prompt.resources[r].jsonData = $.parseJSON(htmlDecode(prompt.resources[r].jsonData));
                            }
                            else if (typeof (prompt.resources[r].attemptsAllowed) != "undefined")
                            {
                                //Legacy support from before jsonData was added in Dec 2019
                                //Currently only matters for transcription components, even if this changes, new promptResource objects will have jsonData
                                resourceMediaOptions.limitplays = parseInt(prompt.resources[r].attemptsAllowed);
                                resourceMediaOptions.allowloop = true;
                                resourceMediaOptions.allowpause = true;
                                resourceMediaOptions.allowplaybackspeed = true;
                                resourceMediaOptions.autoplay = false;
                                resourceMediaOptions.showduration = true;
                                resourceMediaOptions.showplaybacktime = true;
                                resourceMediaOptions.showseekslider = true;
                                resourceMediaOptions.showvolumecontrol = true;
                                resourceMediaOptions.transcript = false;
                                resourceMediaOptions.transcriptionplayer = true;
                            }
                            if (prompt.resources[r].jsonData && typeof (prompt.resources[r].jsonData) == "object")
                            {
                                resourceMediaOptions.allowloop = prompt.resources[r].jsonData.allowloop;
                                resourceMediaOptions.allowpause = prompt.resources[r].jsonData.allowpause;
                                resourceMediaOptions.allowplaybackspeed = prompt.resources[r].jsonData.allowplaybackspeed;
                                resourceMediaOptions.autoplay = prompt.resources[r].jsonData.autoplay;
                                resourceMediaOptions.limitplays = prompt.resources[r].jsonData.limitplays;
                                resourceMediaOptions.showduration = prompt.resources[r].jsonData.showduration;
                                resourceMediaOptions.showplaybacktime = prompt.resources[r].jsonData.showplaybacktime;
                                resourceMediaOptions.showseekslider = prompt.resources[r].jsonData.showseekslider;
                                resourceMediaOptions.showvolumecontrol = prompt.resources[r].jsonData.showvolumecontrol;
                                resourceMediaOptions.transcript = prompt.resources[r].jsonData.transcript;
                                resourceMediaOptions.transcriptionplayer = prompt.resources[r].jsonData.transcriptionplayer;
                            }
                            prompt.resources[r].jsonData = resourceMediaOptions;
                        }
                    }
                }
            }
        }
    }

    this.runComponentStackSequence = function ()
    {
        if (!me.stackExecuting)
        {
            me.stackExecuting = true;
            if(typeof(me.data.module.length) != "undefined")
            {
                loadSequenceSummaryPanel(me.containerElement);
                switch (me.viewMode)
                {
                    case "gradingProtocol":
                    case "teacherEdition":
                        loadGradingProtocolSequenceSummary(me.data.module);
                        break;
                    case "teacherReview":
                        if (typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.submitDate) //Review Submitted
                        {
                            loadReviewSequenceSummary(me.data.module, me.data.correctAnswers, me.data.gradingProtocolValues, me.data.studentAnswers);
                            loadTeacherReviewButton();
                        }
                        else //Review In Progress
                        {
                            loadStudentProgressSequenceSummaryPage(me.data.module, me.data.studentAnswers)
                        }
                        break;
                    case "studentView":
                        if ((typeof (studentAssignment) != "undefined") && studentAssignment && studentAssignment.authorizationToken && studentAssignment.authorizationToken.canReview)
                        {
                            loadReviewSequenceSummary(me.data.module, me.data.correctAnswers, me.data.gradingProtocolValues, me.data.studentAnswers);
                        }
                        break;
                    case "selfStudy":
                    case "selfStudyPreview":
                    case "sharedAssignment":
                        console.log("SELF STUDY DONE?");
                        break;
                    case "reports":
                        loadReportSequenceSummary(me.data.module, me.data.aggregateStudentAnswers);
                        break;
                    default:
                        break;
                }
                me.containerElement.show();
            }
            else if (!me.data.module.locked)
            {
                loadModule(me.containerElement, me.data.module);
                switch (me.viewMode)
                {
                    case "gradingProtocol":
                    case "teacherEdition":
                        loadCorrectAnswers(me.data.correctAnswers);
                        loadGradingProtocolValues(me.data.gradingProtocolValues);
                        loadGradingProtocolSummary();
                        if (typeof (loadGradingProtocolUpdateControls) == "function")
                            loadGradingProtocolUpdateControls();
                        break;
                    case "teacherReview":
                        loadStudentAnswers(me.data.studentAnswers);
                        if (typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.submitDate) //Review Submitted
                        {
                            loadStudentScores(me.data.studentAnswers);
                            var status = deriveAssignmentStatus(assignment, false);
                            if ((status.toLowerCase() != "archived") && (typeof (loadUpdateScoreControls) == "function"))
                                loadUpdateScoreControls();
                            loadReviewSummary();
                            loadStudentAnswersSummary();
//                            loadTeachersEdition(me.data.correctAnswers, me.data.gradingProtocolValues);
                            loadComments(me.data.comments);
                        }
                        else //Review In Progress
                        {
                            loadStudentProgressSummaryPage();
                        }
                        break;
                    case "studentView":
                        if ((typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.initiateDate) && (studentAssignment.authorizationToken.canDo || studentAssignment.authorizationToken.canReview))
                        {
                            loadStudentAnswers(me.data.studentAnswers);
                            if (!studentAssignment.submitDate)
                            {
//                                getStudentSessionData();
                                loadStudentSummaryPage();
                            }
                            else if (studentAssignment.authorizationToken && studentAssignment.authorizationToken.canReview)
                            {
                                loadStudentScores(me.data.studentAnswers);
                                loadReviewSummary();
//                                loadTeachersEdition(me.data.correctAnswers, me.data.gradingProtocolValues);
                                loadComments(me.data.comments);
                                loadStudentReviewControls();
                            }
                        }
                        break;
                    case "selfStudy":
                    case "selfStudyPreview":
                    case "sharedAssignment":
                        if ((typeof (studentAssignment) != "undefined" && studentAssignment && studentAssignment.initiateDate) && (studentAssignment.authorizationToken.canDo || studentAssignment.authorizationToken.canReview))
                        {
                            if (typeof (me.data.studentAnswers != "undefined"))
                            {
                                loadStudentAnswers(me.data.studentAnswers);
                                var checkAnswerActivityComponentIds = new Array();
                                for (var sa = 0; sa < me.data.studentAnswers.length; sa++)
                                {
                                    if ((me.data.studentAnswers[sa].graded) && ($.inArray(me.data.studentAnswers[sa].activityComponentId, checkAnswerActivityComponentIds) < 0))
                                        checkAnswerActivityComponentIds.push(me.data.studentAnswers[sa].activityComponentId);
                                }
                                if (checkAnswerActivityComponentIds.length > 0)
                                {
                                    for (a = 0; a < checkAnswerActivityComponentIds.length; a++)
                                    {
                                        loadStudentScores(studentAnswers, checkAnswerActivityComponentIds[a]);
                                    }
                                }
                            }
                            if (studentAssignment.authorizationToken.completed)
                            {
                                loadReviewSummary();
                            }
                            else
                            {
                                loadCheckAnswers();
                                loadCheckAnswersSummary();
                            }
                        }
                        else
                        {
                            loadCheckAnswers();
                            loadCheckAnswersSummary();
                        }
                        setModuleCompletionData();
                        break;
                    case "reports":
                        loadCorrectAnswers(me.data.correctAnswers);
                        loadReports(me.data.correctAnswers, me.data.gradingProtocolValues, me.data.aggregateStudentAnswers);
                        loadReportSummary();
                        break;
                    default:
                        break;
                }
            }
            else
            {
                if(typeof(studentAssignment) != "undefined" && !studentAssignment.signatureDate && studentAssignment.initiateDate && !studentAssignment.submitDate)
                {
                    loadStudentDisclaimer();
                }
                else
                    console.log("LIMBO");
            }

//            me.navigationCallback(me.data);
            me.stackExecuting = false;
        }
    }

    this.loadModuleData = function()
    {
        if(me.data.module)
        {
            var serverResponseObj = { module: me.data.module };
            var requestObj = { jsonpCallback: me.objectReference + ".loadModuleDataCallback", action: "listModules", assignmentId: me.assignmentId };
            me.loadModuleDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
            {
                type: "POST",
                dataType: "jsonp",
                url: domainRootPath + "WebServices/Assignment.aspx",
                data:
                {
                    "jsonpCallback": me.objectReference+".loadModuleDataCallback",
                    "action": "listModules",
                    "assignmentId": me.assignmentId
                }
            });
        }
    }

    this.loadModuleDataCallback = function(serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadModuleData in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        else if ((serverResponseObj.module)||(serverResponseObj.modules))
        {
            if (serverResponseObj.modules)
            {
                if (me.currentSectionSortKey >= serverResponseObj.modules.length)
                    me.data.module = serverResponseObj.modules;
                else
                    me.data.module = serverResponseObj.modules[me.currentSectionSortKey];
            }
            else if (serverResponseObj.module)
                me.data.module = serverResponseObj.module;
            if ((me.viewMode == "selfStudy")||(me.viewMode == "selfStudyPreview")||(me.viewMode == "sharedAssignment"))
                me.data.module.locked = false;
            if ((me.streamData.module) && (!me.streamProcess.module))
            {
                me.streamProcess.module = new EventLoop(me.objectReference + ".streamProcess.module", domainRootPath + "WebServices/Assignment.aspx", { action: "listModules", assignmentId: assignmentId }, function (serverResponseObj, requestObj) { me.loadModuleDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.module.interval = 10000;
                me.streamProcess.module.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadCorrectAnswersData = function ()
    {
        if (me.data.correctAnswers)
        {
            var serverResponseObj = { correctAnswers: me.data.correctAnswers };
            var requestObj = false;
            if(me.assignmentId > 0)
                requestObj = { jsonpCallback: me.objectReference + ".loadCorrectAnswersDataCallback", action: "listCorrectAnswers", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey };
            else
                requestObj = { jsonpCallback: me.objectReference + ".loadCorrectAnswersDataCallback", action: "listCorrectAnswers", id: me.data.module.id };
            me.loadCorrectAnswersDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            if(me.assignmentId > 0)
            {
                $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/Assignment.aspx",
                    data:
                    {
                        "jsonpCallback": me.objectReference + ".loadCorrectAnswersDataCallback",
                        "action": "listCorrectAnswers",
                        "assignmentId": me.assignmentId,
                        "sectionSortKey":me.currentSectionSortKey
                    }
                });
            }
            else if(me.data.module && me.data.module.id > 0)
            {
                $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/Module.aspx",
                    data:
                    {
                        "jsonpCallback": me.objectReference + ".loadCorrectAnswersDataCallback",
                        "action": "listCorrectAnswers",
                        "id": me.data.module.id
                    }
                });
            }
        }
    }

    this.loadCorrectAnswersDataCallback = function(serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadCorrectAnswers in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        else if ((serverResponseObj.correctAnswersArray)||(serverResponseObj.correctAnswers))
        {
            if (serverResponseObj.correctAnswersArray)
            {
                if (me.currentSectionSortKey >= serverResponseObj.correctAnswersArray.length)
                    me.data.correctAnswers = serverResponseObj.correctAnswersArray;
                else
                    me.data.correctAnswers = serverResponseObj.correctAnswersArray[me.currentSectionSortKey];
            }
            else
                me.data.correctAnswers = serverResponseObj.correctAnswers;
            if ((me.streamData.correctAnswers) && (!me.streamProcess.correctAnswers))
            {
                me.streamProcess.correctAnswers = new EventLoop(me.objectReference + ".streamProcess.correctAnswers", domainRootPath + "WebServices/Assignment.aspx", { action: "listCorrectAnswers", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadCorrectAnswersDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.correctAnswers.interval = 10000;
                me.streamProcess.correctAnswers.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadFeedbackData = function ()
    {
        if (me.data.feedback)
        {
            var serverResponseObj = { feedback: me.data.feedback };
            var requestObj = { jsonpCallback: me.objectReference + ".loadFeedbackDataCallback", action: "listFeedback", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey };
            me.loadFeedbackDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
            {
                type: "POST",
                dataType: "jsonp",
                url: domainRootPath + "WebServices/Assignment.aspx",
                data:
                {
                    "jsonpCallback": me.objectReference + ".loadFeedbackDataCallback",
                    "action": "listFeedback",
                    "assignmentId": me.assignmentId,
                    "sectionSortKey": me.currentSectionSortKey
                }
            });
        }
    }

    this.loadFeedbackDataCallback = function (serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadFeedbackData in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if ((serverResponseObj.feedback) || (serverResponseObj.feedbackArray))
        {
            if (serverResponseObj.feedbackArray)
            {
                if (me.currentSectionSortKey >= serverResponseObj.feedbackArray.length)
                    me.data.feedback = serverResponseObj.feedbackArray;
                else
                    me.data.feedback = serverResponseObj.feedbackArray[me.currentSectionSortKey];
            }
            else if (serverResponseObj.feedback)
                me.data.feedback = serverResponseObj.feedback;
            if ((me.streamData.feedback) && (!me.streamProcess.feedback))
            {
                me.streamProcess.feedback = new EventLoop(me.objectReference + ".streamProcess.feedback", domainRootPath + "WebServices/Assignment.aspx", { action: "listFeedback", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadFeedbackDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.feedback.interval = 10000;
                me.streamProcess.feedback.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadLexicalItemsData = function ()
    {
        if (me.data.lexicalItems)
        {
            var serverResponseObj = { lexicalItems: me.data.lexicalItems };
            var requestObj = { jsonpCallback: me.objectReference + ".loadLexicalItemsDataCallback", action: "listLexicalItems", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey };
            me.loadLexicalItemsDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/Assignment.aspx",
                    data:
                    {
                        "jsonpCallback": me.objectReference + ".loadLexicalItemsDataCallback",
                        "action": "listLexicalItems",
                        "assignmentId": me.assignmentId,
                        "sectionSortKey": me.currentSectionSortKey
                    }
                });
        }
    }

    this.loadLexicalItemsDataCallback = function (serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadLexicalItemsData in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if ((serverResponseObj.lexicalItems) || (serverResponseObj.lexicalItemsArray))
        {
            if (serverResponseObj.lexicalItemsArray)
            {
                if (me.currentSectionSortKey >= serverResponseObj.lexicalItemsArray.length)
                    me.data.lexicalItems = serverResponseObj.lexicalItemsArray;
                else
                    me.data.lexicalItems = serverResponseObj.lexicalItemsArray[me.currentSectionSortKey];
            }
            else if (serverResponseObj.lexicalItems)
                me.data.lexicalItems = serverResponseObj.lexicalItems;

            if ((me.streamData.lexicalItems) && (!me.streamProcess.lexicalItems))
            {
                me.streamProcess.lexicalItems = new EventLoop(me.objectReference + ".streamProcess.lexicalItems", domainRootPath + "WebServices/Assignment.aspx", { action: "listLexicalItems", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadLexicalItemsDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.lexicalItems.interval = 10000;
                me.streamProcess.lexicalItems.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadGradingProtocolValuesData = function ()
    {
        if (me.data.gradingProtocolValues)
        {
            var serverResponseObj = { gradingProtocolValues: me.data.gradingProtocolValues };
            var requestObj = { jsonpCallback: me.objectReference + ".loadGradingProtocolValuesDataCallback", action: "listGradingProtocolValues", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey };
            me.loadGradingProtocolValuesDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            if(me.assignmentId > 0)
            {
                $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/Assignment.aspx",
                    data:
                    {
                        "jsonpCallback": me.objectReference + ".loadGradingProtocolValuesDataCallback",
                        "action": "listGradingProtocolValues",
                        "assignmentId": me.assignmentId,
                        "sectionSortKey": me.currentSectionSortKey
                    }
                });
            }
            else if(me.gradingProtocolId > 0)
            {
                $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/GradingProtocol.aspx",
                    data:
                    {
                        "jsonpCallback": me.objectReference + ".loadGradingProtocolValuesDataCallback",
                        "action": "listValues",
                        "id": me.gradingProtocolId
                    }
                });
            }
            else if ((me.data.module)&&(me.data.module.id > 0))
            {
                $.ajax(
                    {
                        type: "POST",
                        dataType: "jsonp",
                        url: domainRootPath + "WebServices/GradingProtocol.aspx",
                        data:
                        {
                            "jsonpCallback": me.objectReference + ".loadGradingProtocolValuesDataCallback",
                            "action": "listValues",
                            "moduleId": me.data.module.id
                        }
                    });
            }
        }
    }

    this.loadGradingProtocolValuesDataCallback = function(serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadGradingProtocolValues in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if ((serverResponseObj.gradingProtocolValues) || (serverResponseObj.gradingProtocolValuesArray))
        {
            if (serverResponseObj.gradingProtocolValuesArray)
            {
                if (me.currentSectionSortKey >= serverResponseObj.gradingProtocolValuesArray.length)
                    me.data.gradingProtocolValues = serverResponseObj.gradingProtocolValuesArray;
                else
                    me.data.gradingProtocolValues = serverResponseObj.gradingProtocolValuesArray[me.currentSectionSortKey];
            }
            else if (serverResponseObj.gradingProtocolValues)
                me.data.gradingProtocolValues = serverResponseObj.gradingProtocolValues;
            if ((me.streamData.gradingProtocolValues) && (!me.streamProcess.gradingProtocolValues))
            {
                me.streamProcess.gradingProtocolValues = new EventLoop(me.objectReference + ".streamProcess.gradingProtocolValues", domainRootPath + "WebServices/Assignment.aspx", { action: "listGradingProtocolValues", assignmentId: me.assignmentId, sectionSortKey: me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadGradingProtocolValuesDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.gradingProtocolValues.interval = 10000;
                me.streamProcess.gradingProtocolValues.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadStudentAnswersData = function ()
    {
        if (me.data.studentAnswers)
        {
            var serverResponseObj = { studentAnswers: me.data.studentAnswers };
            var requestObj = { jsonpCallback: me.objectReference + ".loadStudentAnswersDataCallback", action: "listStudentAnswers", assignmentId: me.assignmentId, studentId: me.studentId, sectionSortKey: me.currentSectionSortKey };
            me.loadStudentAnswersDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
            {
                type: "POST",
                dataType: "jsonp",
                url: domainRootPath + "WebServices/Assignment.aspx",
                data:
                {
                    "jsonpCallback": me.objectReference + ".loadStudentAnswersDataCallback",
                    "action": "listStudentAnswers",
                    "assignmentId": me.assignmentId,
                    "studentId": me.studentId,
                    "sectionSortKey": me.currentSectionSortKey
                }
            });
        }
    }

    this.loadStudentAnswersDataCallback = function(serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadStudentAnswers in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if (serverResponseObj.studentAnswers)
        {
            me.data.studentAnswers = serverResponseObj.studentAnswers;
            if ((me.streamData.studentAnswers) && (!me.streamProcess.studentAnswers))
            {
                me.streamProcess.studentAnswers = new EventLoop(me.objectReference + ".streamProcess.studentAnswers", domainRootPath + "WebServices/Assignment.aspx", { action: "listStudentAnswers", assignmentId: me.assignmentId, studentId: me.studentId, sectionSortKey: me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadStudentAnswersDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.studentAnswers.interval = 10000;
                me.streamProcess.studentAnswers.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadCommentsData = function ()
    {
        if (me.data.comments)
        {
            var serverResponseObj = { comments: me.data.comments };
            var requestObj = { jsonpCallback: me.objectReference + ".loadCommentsDataCallback", action: "listStudentAssignmentComments", studentAssignmentId: me.studentAssignmentId };
            me.loadCommentsDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
            {
                type: "POST",
                dataType: "jsonp",
                url: domainRootPath + "WebServices/Assignment.aspx",
                data:
                {
                    "jsonpCallback": me.objectReference + ".loadCommentsDataCallback",
                    "action": "listStudentAssignmentComments",
                    "studentAssignmentId": me.studentAssignmentId
                }
            });
        }
    }

    this.loadCommentsDataCallback = function(serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadCommentsData in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if (serverResponseObj.comments)
        {
            me.data.comments = serverResponseObj.comments;
            if ((me.streamData.comments) && (!me.streamProcess.comments))
            {
                me.streamProcess.comments = new EventLoop(me.objectReference + ".streamProcess.comments", domainRootPath + "WebServices/Assignment.aspx", { action: "listStudentAssignmentComments", studentAssignmentId: me.studentAssignmentId }, function (serverResponseObj, requestObj) { me.loadCommentsDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.comments.interval = 10000;
                me.streamProcess.comments.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.loadAggregateStudentAnswersData = function ()
    {
        if (me.data.aggregateStudentAnswers)
        {
            var serverResponseObj = { studentAnswers: me.data.aggregateStudentAnswers };
            var requestObj = { jsonpCallback: me.objectReference + ".loadAggregateStudentAnswersDataCallback", action: "listAggregateStudentAnswers", assignmentId: me.assignmentId, sectionSortKey:me.currentSectionSortKey };
            me.loadAggregateStudentAnswersDataCallback(serverResponseObj, requestObj);
        }
        else
        {
            $.ajax(
            {
                type: "POST",
                dataType: "jsonp",
                url: domainRootPath + "WebServices/Reports/Assignment.aspx",
                data:
                {
                    "jsonpCallback": me.objectReference + ".loadAggregateStudentAnswersDataCallback",
                    "action": "listAggregateStudentAnswers",
                    "assignmentId": me.assignmentId,
                    "sectionSortKey": me.currentSectionSortKey
                }
            });
        }
    }

    this.loadAggregateStudentAnswersDataCallback = function (serverResponseObj, requestObj)
    {
        if (serverResponseObj.error)
        {
            console.log("Failed to loadAggregateStudentAnswers in componentStack: " + serverResponseObj.error + " - " + new Date().toString());
        }
        if (serverResponseObj.studentAnswers)
        {
            me.data.aggregateStudentAnswers = serverResponseObj.studentAnswers;
            if ((me.streamData.aggregateStudentAnswers) && (!me.streamProcess.aggregateStudentAnswers))
            {
                me.streamProcess.aggregateStudentAnswers = new EventLoop(me.objectReference + ".streamProcess.aggregateStudentAnswers", domainRootPath + "WebServices/Reports/Assignment.aspx", { action: "listAggregateStudentAnswers", assignmentId: me.assignmentId, sectionSortKey:me.currentSectionSortKey }, function (serverResponseObj, requestObj) { me.loadAggregateStudentAnswersDataCallback(serverResponseObj, requestObj); });
                me.streamProcess.aggregateStudentAnswers.interval = 10000;
                me.streamProcess.aggregateStudentAnswers.init();
            }
            me.reconcileRequiredData();
        }
    }

    this.init();
}

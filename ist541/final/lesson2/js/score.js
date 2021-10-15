var selectedResponseElement = null;//used to fire a click event if panel is closed

$(document).ready(function ()
{
    $(document).bind("aggregateStudentAnswerElementLoaded", function (event) {
        savedEventData = event;
        loadAggregateStudentAnswerElementControls(event);
    });

    $(document).bind("navigationTriggered", function (event) {
        if(typeof(selectedStudentId) != "undefined"){
            if(selectedStudentId == "allStudents"){
                toggleOffAllStudents();
            }
        }
    });

    $("#id_toolBarBtn_1").bind("click", function(){
        if(typeof(selectedStudentId) != "undefined"){
            if(selectedStudentId == "allStudents" && !$(this).hasClass("toolBarBtnEnabled")){
                toggleOffAllStudents();
            }
        }
    })
});

function loadAggregateStudentAnswerElementControls(event)
{
    //Constructed responses only. FNB, Short Answer, Transcription
    var allowAggregateAnswers = false;
    switch (event.componentTitle.toUpperCase())
    {
        case "TRANSCRIPTION":
        case "FILLINTHEBLANK":
            allowAggregateAnswers = true;
            if(event.element.hasClass("scoreCorrect")){
                event.element.removeClass("scoreCorrect");
                event.element.addClass("btnGreen");
                event.element.css({"line-height":"1em", "font-size":"1em","width":"auto","padding":0,"margin":0})
            } else {
                event.element.removeClass("scoreIncorrect")
                event.element.addClass("btnRed");
                event.element.css({"padding":0,"margin":0})
            }
            break;
        case "SHORTANSWER":
            allowAggregateAnswers = true;
            if (event.element.parent().hasClass("scoreCorrect"))
            {
                event.element.parent().removeClass("scoreCorrect");
                event.element.parent().addClass("btnGreen");
                event.element.parent().css({ "width": "auto", "padding": 0, "margin": 0 })
            } else
            {
                event.element.parent().removeClass("scoreIncorrect")
                event.element.parent().addClass("btnRed");
                event.element.parent().css({ "padding": 0, "margin": 0 })
            }
            break;
        case "SPEAKING":
            allowAggregateAnswers = true;
            if (event.element.parent().hasClass("scoreCorrect"))
            {
                event.element.parent().removeClass("scoreCorrect");
                event.element.parent().addClass("btnGreen");
                event.element.parent().css({ "width": "auto", "padding": 0, "margin": 0 })
            } else
            {
                event.element.parent().removeClass("scoreIncorrect")
                event.element.parent().addClass("btnRed");
                event.element.parent().css({ "padding": 0, "margin": 0 })
            }
            break;
        case "TRANSCRIPTION":
            allowAggregateAnswers = true;
            break;
        case "WRITING":
            allowAggregateAnswers = true;
            if (event.element.parent().hasClass("scoreCorrect"))
            {
                event.element.parent().removeClass("scoreCorrect");
                event.element.parent().addClass("btnGreen");
                event.element.parent().css({ "width": "auto", "padding": 0, "margin": 0 })
            } else
            {
                event.element.parent().removeClass("scoreIncorrect")
                event.element.parent().addClass("btnRed");
                event.element.parent().css({ "padding": 0, "margin": 0 })
            }
            break;
    }

    if(allowAggregateAnswers){
        event.element.append('<span class="" style="margin: 0 .25em; font-size:.8em;"><i class="fa fa-users"></i></span>');
        event.element.on("click", function ()
        {
            if($("#id_frameworkCol_3").css("display") != "none"){//Only run if side panel is open
                //Toggle off or switch to newly sekected response
                if(selectedStudentId == "allStudents" && selectedResponseElement.attr("id") == $(this).attr("id")){
                    toggleOffAllStudents();
                } else {
                    selectedResponseElement = $(this)
                    activateSelectedResponse(selectedResponseElement, event)
                }
            } else {
                toggleSidebar(1);
                $("#toolbarClassAssignmentDiv").hide();
                selectedResponseElement = $(this)
                activateSelectedResponse(selectedResponseElement, event)
            }
        });
    }
}

function activateSelectedResponse(selectedResponseElement, event){
    //Cases to highlight the selected response depending on DOM structure of component.
    $(".selectedForGrading").removeClass("selectedForGrading").attr("style","width:auto;cursor:default;");
    
    switch (event.componentTitle.toUpperCase())
    {
        case "TRANSCRIPTION":
        case "FILLINTHEBLANK":
            selectedResponseElement.next().addClass("selectedForGrading");
            selectedResponseElement.next().css("border","1px solid #4bb6f5");
            break;
        case "SHORTANSWER":
            var highlightElement = $("#promptFeedbackToolBox_" + event.promptId).parent();
            highlightElement.addClass("selectedForGrading");
            highlightElement.css("border", "none");
            break;
        case "SPEAKING":
            var highlightElement = $("#promptFeedbackToolBox_" + event.promptId).parent();
            highlightElement.addClass("selectedForGrading");
            highlightElement.css("border", "none");
            break;
        case "WRITING":
            var highlightElement = $("#promptFeedbackToolBox_" + event.promptId).parent();
            highlightElement.addClass("selectedForGrading");
            highlightElement.css("border", "none");
            break;
    }
    listAggregateStudentAnswers(event);
}

function listAggregateStudentAnswers(event)
{
    $.ajax(
    {
        type: "POST",
        dataType: "jsonp",
        url: domainRootPath + "WebServices/Assignment.aspx",
        data:
        {
            "jsonpCallback": "listAggregateStudentAnswersCallback",
            "action": "listAggregateStudentAnswers",
            "id": assignment.id,
            "promptId": event.promptId,
            "componentTitle": event.componentTitle,
            "sortKey": event.responseSortKey,
            "maxValue": event.maxValue,
            "maxBonusValue": event.maxBonusValue,
            "responses": JSON.stringify(event.responses)
        }
    });
}

function listAggregateStudentAnswersCallback(serverResponseObj, requestObj)
{
    if (serverResponseObj.error)
    {
        inlineSystemErrorMessaging(serverResponseObj, requestObj);
    }
    if (serverResponseObj.studentAnswers)
    {
        var allStudentResponsesContainer = $("#allStudentResponsesContainer");
        selectedStudentId = "allStudents";
        if (allStudentResponsesContainer.length > 0){
            allStudentResponsesContainer.remove();
        }
        var aggregateStudentAnswersHTML = '<div id="allStudentResponsesContainer" class="assessmentPanelWrapper">' 
        aggregateStudentAnswersHTML += '<div class="displayTable themeBgrColor_1" style="color:#ffffff;"><div class="displayTableCell "style="width:100%; white-space:nowrap; padding:.25em .5em; font-weight:600;">Student Responses</div><div title="Back to Assignment" class="displayTableCell" onclick="toggleOffAllStudents();" style="min-width:1.875em; cursor:pointer; text-align:center;"><i class="fa fa-times"></i></div></div>';
    
        selectedPromptId = requestObj.promptId;
        aggregateStudentAnswersHTML += "<div id=\"aggregateStudentAnswersDiv\" class=\"displayTable\">";
        if (serverResponseObj.studentAnswers.length == 0)
        {
            aggregateStudentAnswersHTML += "<div class=\"studentAssignmentSummaryDiv displayTableRow\">";
            aggregateStudentAnswersHTML += "No students have answered this item.";
            $("#toolbarClassAssignmentDiv").prepend(aggregateStudentAnswersHTML)
        }
        else
        {
            //Headers for the aggregate table
            
            aggregateStudentAnswersHTML += '<div class="displayTableRow">';
            aggregateStudentAnswersHTML += '<div class="displayTableCell studentSummaryHeader" style="min-width: 2.500em;"></div>';
            aggregateStudentAnswersHTML += '<div class="displayTableCell studentSummaryHeader" style="min-width: 2.500em;"></div>';
            aggregateStudentAnswersHTML += '<div class="displayTableCell studentSummaryHeader" style="min-width: 12.500em;text-align:left;">Student</div>';
            aggregateStudentAnswersHTML += '<div class="displayTableCell studentSummaryHeader" style="width:100%; padding:0 .5em; text-align:left;">Response</div>';
            aggregateStudentAnswersHTML += '<div class="displayTableCell studentSummaryHeader" style="padding:0 .5em; min-width:4em; text-align:left;">Score</div>';
            aggregateStudentAnswersHTML += '</div>';
            aggregateStudentAnswersHTML += '</div>';
            //Containers for submitted or unsubmitted
            aggregateStudentAnswersHTML += '<div id="submittedAssignment" class="displayTable"></div>';//Submitted by the student
            var anyUnsubmitted = false;
            for (var i = 0; i < serverResponseObj.studentAnswers.length; i++){
                if(!serverResponseObj.studentAnswers[i].submitted)
                    anyUnsubmitted = true;
            }
            if(anyUnsubmitted){
                aggregateStudentAnswersHTML += '<div style="border:1px solid #848484;">';
                aggregateStudentAnswersHTML += '<div style="padding:0 0 .25em .5em; margin-top:.5em; font-size:.8em; color:#848484;">*The following student(s) have not yet submitted the assignment</div>';
                aggregateStudentAnswersHTML += '<div id="unsubmittedAssignment" class="displayTable"></div>';
                aggregateStudentAnswersHTML += '</div>';
            }


            var anyTeacherSubmitted = false;
            for (var i = 0; i < serverResponseObj.studentAnswers.length; i++){
                if(serverResponseObj.studentAnswers[i].teacherSubmitted)
                    anyTeacherSubmitted = true;
            }


            if(anyTeacherSubmitted){
                aggregateStudentAnswersHTML += '<div style="border:1px solid #555555;">';
                aggregateStudentAnswersHTML += '<div style="padding:0 0 .25em .5em; margin-top:.5em; font-size:.8em; color:#848484;">*The following student(s) final grades have been submitted by the teacher. Scores may not be changed.</div>';
                aggregateStudentAnswersHTML += '<div id="teacherSubmitted" class="displayTable"></div>';
                aggregateStudentAnswersHTML += '</div>';
            }

            aggregateStudentAnswersHTML += "</div>";
            $("#toolbarClassAssignmentDiv").prepend(aggregateStudentAnswersHTML)


            var responses = false;
            if (requestObj.responses)
                responses = $.parseJSON(htmlDecode(requestObj.responses));
            for (var i = 0; i < serverResponseObj.studentAnswers.length; i++)
            {
                var studentAnswer = serverResponseObj.studentAnswers[i];
                var teacherSubmitted = studentAnswer.teacherSubmitted;//Did the teacher submit the final grade?
                var aggregateStudentAnswersHTML = "<div class=\"studentAssignmentSummaryDiv displayTableRow\">";
                aggregateStudentAnswersHTML += '<div title="Open/Close" class="displayTableCell iconLeft viewStudentAssignmentBtn" onclick="toggleStudentAssignmentView('+studentAnswer.student.id+')"><i class="fa fa-folder" style="width:2em;"></i></div>';
                aggregateStudentAnswersHTML += "<div class=\"displayTableCell\" style=\"white-space:nowrap;\" title=\"" + studentAnswer.student.status + "\"><span class=\"" + userIcon + "\"></span><span class=\"" + eval("user" + studentAnswer.student.status + "Icon") + "\"></span></div>";
                aggregateStudentAnswersHTML += "<div class=\"displayTableCell iconCell studentNameCell\" style=\"text-align: left; padding:0 .5em; min-width:12.5em\" onclick=\"toggleStudentAssignmentView("+studentAnswer.student.id+")\"><span>" + studentAnswer.student.username + "</span></div>";
                var studentResponseText = htmlDecode(studentAnswer.responseText);
                if ((studentResponseText.length == 0) && (responses))
                {
                    for (var r = 0; r < responses.length; r++)
                    {
                        if (studentAnswer.responseId == responses[r].id)
                            studentResponseText = htmlDecode(responses[r].text);
                    }
                }
                if (requestObj.componentTitle.toUpperCase() == "SPEAKING")
                {
                    aggregateStudentAnswersHTML += "<div class=\"displayTableCell\" style=\"width:100%; text-align: left; padding:0 .5em;\"><audio src=\"" + studentResponseText + "\" data-allowloop=\"true\" data-allowpause=\"true\" data-allowplaybackspeed=\"true\" data-autoplay=\"false\" data-limitplays=\"0\" data-showduration=\"true\" data-showplaybacktime=\"true\" data-showseekslider=\"true\" data-showvolumecontrol=\"true\" data-transcript=\"false\" data-transcriptionplayer=\"false\"></audio></div>";
                }
                else if (requestObj.componentTitle.toUpperCase() == "WRITING")
                {
                    //Container for populating with canvases
                    aggregateStudentAnswersHTML += "<div class=\"displayTableCell\" style=\"width:100%; text-align: left; padding:0 .5em;\"><div id=\"writingResponseContent_"+studentAnswer.id+"\"></div></div>";  
                }
                else
                {
                    aggregateStudentAnswersHTML += "<div class=\"displayTableCell\" style=\"width:100%; text-align: left; padding:0 .5em;\"><span>" + studentResponseText + "</span></div>";
                }
                var maxValue = requestObj.maxValue;
                if (maxValue == 0)
                    maxValue = 1;
                var maxBonusValue = requestObj.maxBonusValue;
                var studentValue = 0;
                if (maxBonusValue > 0)
                {
                    studentValue = studentAnswer.bonusValue;
                    if (studentValue < 0)
                        studentValue = 0;
                    scoreClass = studentValue > 0 ? "scoreCorrect" : "scoreIncorrect";
                    scoreIcon = "fa fa-plus";
                }
                else
                {
                    studentValue = studentAnswer.latestGrade;
                    if (studentValue == maxValue)
                    {
                        scoreClass = "scoreCorrect";
                        scoreIcon = "fa fa-check";
                    }
                    else if (studentValue > 0)
                    {
                        scoreClass = "scorePartiallyCorrect";
                        scoreIcon = "fa fa-check";
                    }
                    else
                    {
                        scoreClass = "scoreIncorrect";
                        scoreIcon = "fa fa-times";
                    }
                }
                scoreClass = serverResponseObj.studentAnswers[i].submitted ? scoreClass +' scoreEditable' : scoreClass;
                var scoreStyle = serverResponseObj.studentAnswers[i].submitted ? '' : 'cursor:default;';
                aggregateStudentAnswersHTML += '<div class="displayTableCell iconCell" style="padding:0 .5em; min-width:4em;'+scoreStyle+'">';
                switch (requestObj.componentTitle.toUpperCase())
                {
                    case "FILLINTHEBLANK":
                    case "TRANSCRIPTION":
                    case "SHORTANSWER":
                    case "SPEAKING":
                    case "WRITING":
                        aggregateStudentAnswersHTML += '<div id="scoreToken_' + serverResponseObj.studentAnswers[i].id + '" style="'+scoreStyle+'" class="'+scoreClass+'" data-studentanswerid="' + serverResponseObj.studentAnswers[i].id + '" data-maxvalue="' + requestObj.maxValue + '" data-maxbonusvalue="' + requestObj.maxBonusValue + '" data-value="' + studentValue + '" data-teachersubmitted="'+teacherSubmitted+'"><div class="displayTableCell"><i class="' + scoreIcon + '"></i></div><div class="displayTableCell" id="scoreSpan_' + serverResponseObj.studentAnswers[i].id + '">' + studentValue + '</div></div>';
                        break;
                    default:
                        aggregateStudentAnswersHTML += "<span class=\"" + scoreClass + "\"><i class=\"" + scoreIcon + "\"></i><span>" + studentValue + "</span></span>";
                        break;
                }
                aggregateStudentAnswersHTML += "</div>";
                aggregateStudentAnswersHTML += "</div>";
                if(studentAnswer.submitted){
                    if(studentAnswer.teacherSubmitted){
                        $("#teacherSubmitted").append(aggregateStudentAnswersHTML);
                    } else {
                        $("#submittedAssignment").append(aggregateStudentAnswersHTML);
                    }
                } else {
                    $("#unsubmittedAssignment").append(aggregateStudentAnswersHTML);;
                }
            }
        }
        allStudentResponsesContainer = $("#allStudentResponsesContainer");
        //setup ,edia player for recorded responses
        if (requestObj.componentTitle.toUpperCase() == "SPEAKING")
        {
            setupUcatMedia(allStudentResponsesContainer);
        }

        //Setup writing canvases
        if (requestObj.componentTitle.toUpperCase() == "WRITING"){
            
            for (var i = 0; i < serverResponseObj.studentAnswers.length; i++){
                var response = serverResponseObj.studentAnswers[i];
                if (response && response.responseText && response.responseText.length > 0)
                {
                    var writingResponseContent = $("#writingResponseContent_" + response.id);
                    var responseData = $.parseJSON(htmlDecode(response.responseText));
                    if (!responseData)
                    {
                        responseData = copyGlobalVariable(defaultCanvas);
                    }
                    if (writingResponseContent.length > 0)
                    {
                        writingResponseContent.ucatCanvas({ drawTools: false,  stepControls:true, submit: false }, responseData);
                        $("#writingResponseContent_" + response.id + "_canvas").css({width:"100%",height:"100%"});
                    }
                }
            }

        }
        

        $("#assignmentHeader").hide();
        $("#assignmentSettings").hide();

        //Add Striping across all the containers
        var i = 0;
        allStudentResponsesContainer.find(".studentAssignmentSummaryDiv").each(function(){
            var stripeClass = (i % 2 == 0) ? "even" : "odd" + "Row";
            $(this).addClass(stripeClass);
            i++
        })

        // openAggregateStudentAnswersDialog(aggregateStudentAnswersHTML);

        var aggregateStudentAnswersLoadedEvent = $.Event("aggregateStudentAnswersLoaded");
        aggregateStudentAnswersLoadedEvent.containerElement = $("#submittedAssignment");
        $(document).trigger(aggregateStudentAnswersLoadedEvent);        

    }
}

function toggleOffAllStudents(){
    $(".selectedForGrading").removeClass("selectedForGrading").attr("style","width:auto;cursor:default;");
    selectedResponseElement = null;
    selectedStudentId = 0;
    $("#allStudentResponsesContainer").remove();
    $("#assignmentHeader").show();
    $("#assignmentSettings").show();
}

function loadStudentScores(studentAnswers, activityComponentId)
{
    for (var i = 0; i < module.activities.length; i++)
    {
        var activity = module.activities[i];
        for (var j = 0; j < activity.activityComponents.length; j++)
        {
            var activityComponent = activity.activityComponents[j];
            if ((typeof (activityComponentId) == "undefined") || (activityComponentId == activityComponent.id))
            {
                $("#componentContainer_" + activityComponent.id).find("[id^='promptFeedbackToolBox_']").each(function ()
                { $(this).hide(); });
                for (var k = 0; k < activityComponent.prompts.length; k++)
                {
                    var prompt = activityComponent.prompts[k];
                    var inlineToolBox = $("#promptFeedbackToolBox_" + prompt.id);
                    inlineToolBox.html("");
                    inlineToolBox.prepend(generatePromptScoreSpan(prompt));
                    $("#componentContainer_"+activityComponent.id).find(".inlineToolBoxBuffer").css("visibility", "hidden")//Only used in Matching
                    $("#componentContainer_" + activityComponent.id).find(".inlineToolBoxBuffer").show()//Only used in Matching
                    if (prompt.responses)
                    {
                        for (var l = 0; l < prompt.responses.length; l++)
                        {
                            var response = prompt.responses[l];
                            switch (activityComponent.componentTitle.toUpperCase())
                            {
                                case "CATEGORIZATION":
                                    var responseFeedbackContainer = $("#responseFeedbackContainer_" + response.id);
                                    var scoreSpanHTML = generateResponseScoreSpan("ridResponseToken_" + response.id, prompt.id, response.id, response.sortKey, response.correct, response.maxValue, response.bonusValue, false);
                                    responseFeedbackContainer.html(scoreSpanHTML);
                                    break;
                                case "FILLINTHEBLANK":
                                    if (response.correct)
                                    {
                                        var responseFeedbackContainer = $("#inlineFeedbackContainer_" + prompt.id + "_" + response.sortKey);
                                        if (responseFeedbackContainer.length == 0)
                                        {
                                            $("#response_" + prompt.id + "_" + response.sortKey).before('<span id="inlineFeedbackContainer_' + prompt.id + '_' + response.sortKey + '" class="feedbackContainer inlineFeedbackContainer"></span>');
                                            responseFeedbackContainer = $("#inlineFeedbackContainer_" + prompt.id + "_" + response.sortKey);
                                        }
                                        var scoreSpan = $("#skResponseToken_" + prompt.id + "_" + response.sortKey);
                                        var scoreSpanHTML = generateResponseScoreSpan("skResponseToken_" + prompt.id + "_" + response.sortKey, prompt.id, 0, response.sortKey, response.correct, response.maxValue, response.bonusValue, true );
                                        if (scoreSpan.length > 0)
                                            scoreSpan.replaceWith(scoreSpanHTML);
                                        else
                                            responseFeedbackContainer.prepend(scoreSpanHTML);
                                        responseFeedbackContainer.css({"min-height":"auto", "height":"auto","cursor":"default"});
                                        responseFeedbackContainer.hide();//have to hide this or it will display an empty area. It will be shown if correct or incorrrect or partial further donw below
                                    }
                                    break;
                                case "FINDANDCLICK":
                                    for (var sa = 0; sa < studentAnswers.length; sa++)
                                    {
                                        if (studentAnswers[sa].responseId == response.id)
                                        {
                                            loadResponseHotspot(activityComponent, response, false);
                                        }
                                    }

                                    var responseFeedbackContainer = $("#responseHotspot_" + response.id);
                                    responseFeedbackContainer.addClass(response.correct ? "hotspotCorrect" : "hotspotIncorrect");
                                    responseFeedbackContainer.hide();
                                    var scoreSpan = $("#responseToken_" + prompt.id + "_" + response.id);
                                    var scoreSpanHTML = generateResponseScoreSpan("responseToken_" + prompt.id + "_" + response.id, prompt.id, response.id, response.sortKey, response.correct, response.value, response.bonusValue, false);
                                    if (scoreSpan.length > 0)
                                        scoreSpan.replaceWith(scoreSpanHTML);
                                    else
                                        responseFeedbackContainer.prepend(scoreSpanHTML);
                                    break;
                                case "MATCHING":
                                    if (response.correct)
                                    {
                                        var matchingPromptDropArea = $("#matchingPromptDropArea_" + prompt.id);
                                        var promptIndex = matchingPromptDropArea.data("promptindex");
                                        var responseFeedbackContainer = $("#matchingColumnDivider_" + activityComponent.id + "_" + promptIndex);
                                        var matchingLock = $("#matchingLock_" + activityComponent.id + "_" + promptIndex);
                                        var responseToken = $("#pidResponseToken_" + prompt.id);
                                        matchingLock.show();
                                        responseToken.hide();
                                        var responseTokenHTML = generateResponseScoreSpan("pidResponseToken_" + prompt.id, prompt.id, response.id, response.sortKey, response.correct, prompt.maxValue, response.bonusValue, false);
                                        if (responseToken.length > 0)
                                            responseToken.replaceWith(responseToken)
                                        else
                                            responseFeedbackContainer.append(responseTokenHTML);
                                    }
                                    break;
                                case "ORDERING":
                                    var responseFeedbackContainer = $("#responseFeedbackContainer_" + response.id);
                                    responseFeedbackContainer.siblings(".orderingDragHandle").hide();
                                    var scoreSpan = $("#responseToken_" + prompt.id + "_" + response.id);
                                    var scoreSpanHTML = generateResponseScoreSpan("responseToken_" + prompt.id + "_" + response.id, prompt.id, response.id, response.sortKey, response.correct, response.maxValue, response.bonusValue, false);
                                    if (scoreSpan.length > 0)
                                        scoreSpan.replaceWith(scoreSpanHTML);
                                    else
                                        responseFeedbackContainer.append(scoreSpanHTML);
                                    break;
                                case "SHORTANSWER":
                                    if (l == 0)
                                    {
                                        $("#shortAnswerResponseContainer_" + prompt.id).children(".displayTable").first().css("table-layout", "auto")

                                        var scoreSpan = $("#pidResponseToken_" + prompt.id);
                                        var scoreSpanHTML = generateResponseScoreSpan("pidResponseToken_" + prompt.id, prompt.id, 0, 0, response.correct, response.maxValue, response.bonusValue, true, false);
                                        if (scoreSpan.length > 0)
                                        {
                                            scoreSpan.replaceWith(scoreSpanHTML);
                                        }
                                        else
                                        {
                                            $("#shortAnswerResponseFeedbackContainer_" + prompt.id).prepend(scoreSpanHTML);
                                        }
                                    }
                                    break;
                                case "SPEAKING":
                                    if (l == 0)
                                    {
                                        var scoreSpan = $("#pidResponseToken_" + prompt.id);
                                        var scoreSpanHTML = generateResponseScoreSpan("pidResponseToken_" + prompt.id, prompt.id, 0, 0, response.correct, response.maxValue, response.bonusValue, true, false);
                                        if (scoreSpan.length > 0)
                                        {
                                            scoreSpan.replaceWith(scoreSpanHTML);
                                        }
                                        else
                                        {
                                            $("#speakingResponseFeedbackContainer_" + prompt.id).prepend(scoreSpanHTML);
                                        }
                                    }
                                    break;
                                case "TEXTSELECTOR":
                                    var responseItem = $("#response_" + response.id);
                                    responseItem.attr("class", "response");
                                    for (var sa = 0; sa < studentAnswers.length; sa++)
                                    {
                                        if (studentAnswers[sa].responseId == response.id)
                                        {
                                            responseItem.addClass(response.correct ? "correct" : "incorrect");
                                        }
                                    }
                                    var responseFeedbackContainer = $("#inlineFeedbackContainer_" + response.id);
                                    var scoreSpan = $("#responseToken_" + prompt.id + "_" + response.id);
                                    var scoreSpanHTML = generateResponseScoreSpan("responseToken_" + prompt.id + "_" + response.id, prompt.id, response.id, response.sortKey, response.correct, response.value, response.bonusValue, false);
                                    if (scoreSpan.length > 0)
                                        scoreSpan.replaceWith(scoreSpanHTML);
                                    else
                                        responseFeedbackContainer.prepend(scoreSpanHTML);
                                    responseFeedbackContainer.css({"min-height":"auto", "height":"auto","cursor":"default"});
                                    responseFeedbackContainer.hide();//have to hide this or it will display an empty area. It will be shown if correct or incorrrect or partial further donw below
                                    break;
                                case "TRANSCRIPTION":
                                    if (response.correct)
                                    {
                                        var responseFeedbackContainer = $("#inlineFeedbackContainer_" + prompt.id + "_" + response.sortKey);
                                        if (responseFeedbackContainer.length == 0)
                                        {
                                            $("#response_" + prompt.id + "_" + response.sortKey).before('<span id="inlineFeedbackContainer_' + prompt.id + '_' + response.sortKey + '" class="feedbackContainer inlineFeedbackContainer"></span>');
                                            responseFeedbackContainer = $("#inlineFeedbackContainer_" + prompt.id + "_" + response.sortKey);
                                        }
                                        var scoreSpan = $("#skResponseToken_" + prompt.id + "_" + response.sortKey);
                                        var scoreSpanHTML = generateResponseScoreSpan("skResponseToken_" + prompt.id + "_" + response.sortKey, prompt.id, 0, response.sortKey, response.correct, response.maxValue, response.bonusValue, true);
                                        if (scoreSpan.length > 0)
                                            scoreSpan.replaceWith(scoreSpanHTML);
                                        else
                                            responseFeedbackContainer.prepend(scoreSpanHTML);
                                        responseFeedbackContainer.css({"min-height":"auto", "height":"auto","cursor":"default"});
                                        responseFeedbackContainer.hide();//have to hide this or it will display an empty area. It will be shown if correct or incorrrect or partial further donw below
                                    }
                                    break;
                                case "WRITING":
                                    if (l == 0)
                                    {
                                        var scoreSpan = $("#pidResponseToken_" + prompt.id);
                                        var scoreSpanHTML = generateResponseScoreSpan("pidResponseToken_" + prompt.id, prompt.id, 0, 0, response.correct, response.maxValue, response.bonusValue, true, false);
                                        if (scoreSpan.length > 0)
                                        {
                                            scoreSpan.replaceWith(scoreSpanHTML);
                                        }
                                        else
                                        {
                                            $("#writingResponseFeedbackContainer_" + prompt.id).prepend(scoreSpanHTML);
                                        }
                                    }
                                    break;
                                default:
                                    var responseFeedbackContainer = $("#responseFeedbackContainer_" + response.id);
                                    var scoreSpan = $("#responseToken_" + prompt.id + "_" + response.id);
                                    var scoreSpanHTML = generateResponseScoreSpan("responseToken_" + prompt.id + "_" + response.id, prompt.id, response.id, response.sortKey, response.correct, response.value, response.bonusValue, false);
                                    if (scoreSpan.length > 0)
                                        scoreSpan.replaceWith(scoreSpanHTML);
                                    else
                                        responseFeedbackContainer.append(scoreSpanHTML);
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }
    for (var i = 0; i < studentAnswers.length; i++)
    {
        var studentScore = studentAnswers[i];
        if ((typeof (activityComponentId) == "undefined") || (activityComponentId == studentScore.activityComponentId))
        {
            $("#promptFeedbackToolBox_" + studentScore.promptId).show();
            var scoreToken = $("#responseToken_" + studentScore.promptId + "_" + studentScore.responseId);
            if (scoreToken.length == 0)
                scoreToken = $("#skResponseToken_" + studentScore.promptId + "_" + studentScore.sortKey);
            if (scoreToken.length == 0)
                scoreToken = $("#pidResponseToken_" + studentScore.promptId);
            if (scoreToken.length == 0)
                scoreToken = $("#ridResponseToken_" + studentScore.responseId);
            if (scoreToken.length > 0)
            {
                scoreToken.removeClass("score");
                // var responseScoreIcon = scoreToken.children("i.fa").first();
                var responseScoreIcon;
                scoreToken.find(".fa").each(function(){
                    responseScoreIcon = $(this)
                });
                // scoreIcon_
                var maxScore = parseFloat(scoreToken.data("maxscore"));
                // var notIncorrect = parseBoolean(scoreToken.data("notincorrect"));
                var maxBonusScore = parseFloat(scoreToken.data("maxbonusscore"));
                var scoreSpan = scoreToken.children("[id*='ScoreSpan']").first();
                //if there is a point value associated then show the students score,
                //else only display the icon for correct or incorrect,
                //only show if a student has an answer otherwise hide the entire thing
                //var showScore = false;//No longer used, always show a score even if zero. need this span to be displayed for inPlaceEditor 
                if (maxScore != 0)
                {
                    scoreSpan.html(Math.abs(studentScore.latestGrade));
                    scoreSpan.attr("data-value", studentScore.latestGrade);
                }
                else if ((maxBonusScore != 0)&&(studentScore.bonusValue > 0))
                {
                    scoreSpan.html(Math.abs(studentScore.bonusValue));
                    scoreSpan.attr("data-bonusvalue", studentScore.bonusValue);
                }
                scoreToken.removeClass("score");
                scoreToken.removeClass("scoreCorrect");
                scoreToken.removeClass("scoreIncorrect");
                scoreToken.removeClass("scorePartiallyCorrect");
                responseScoreIcon.attr("class", "fa");
                if ((maxBonusScore <= 0)&&((studentScore.latestGrade > 0) || studentScore.correct))
                {
                    if (studentScore.latestGrade < maxScore)
                        scoreToken.addClass("scorePartiallyCorrect");
                    else
                        scoreToken.addClass("scoreCorrect");
                    
                    responseScoreIcon.addClass("fa-check");
                    //showScore = studentScore.latestGrade != 0;
                }
                else if (studentScore.bonusValue > 0)
                {
                    scoreToken.addClass("scoreCorrect");
                    responseScoreIcon.addClass("fa-plus");
                    //showScore = studentScore.bonusValue != 0;
                }
                else
                {
                    scoreToken.addClass("scoreIncorrect");
                    responseScoreIcon.addClass("fa-times");
                    //No longer showing triangle for these. Cannot tell the difference between a zero and a not scored item.
                    /*
                    if (notIncorrect)
                    {
                        scoreToken.addClass("scorePartiallyCorrect");
                        responseScoreIcon.addClass("fa-exclamation-triangle");
                        scoreToken.attr("title","Pending Teacher Grade");
                    }
                    else
                    {
                        scoreToken.addClass("scoreIncorrect");
                        responseScoreIcon.addClass("fa-times");
                    }
                    */
                    //showScore = studentScore.latestGrade != 0;
                }
                /*
                if (showScore)
                    scoreSpan.show();
                else
                    scoreSpan.hide();
                */

                if(scoreToken.parent().hasClass("inlineFeedbackContainer")){
                    scoreToken.parent().css("display","inline-block");
                    //scoreSpan.show();//must show the scoreSpan to be able to edit zero score on contructed responses
                } else {
                    scoreToken.parent().show();
                }

                scoreToken.show();


                var responseScoreTokenLoadedEvent = $.Event("responseScoreTokenLoaded");
                responseScoreTokenLoadedEvent.scoreToken = scoreToken;
                responseScoreTokenLoadedEvent.studentScore = studentScore;
                responseScoreTokenLoadedEvent.activityComponent = getActivityComponent(studentScore.activityComponentId);
                $(document).trigger(responseScoreTokenLoadedEvent);
            }
            var matchingPromptDropArea = $("#matchingPromptDropArea_" + studentScore.promptId);
            if (matchingPromptDropArea.length > 0)
            {
                var promptIndex = matchingPromptDropArea.data("promptindex");
                var matchingLock = $("#matchingLock_" + studentScore.activityComponentId + "_" + promptIndex);
                matchingLock.hide();
                var responseToken = $("#pidResponseToken_" + prompt.id);

            }
        }
    }
    reconcilePromptScoreSpans(activityComponentId);
}

function generatePromptScoreSpan(prompt)
{
    //console.log("generatePromptScoreSpan")
    var promptScoreSpanHTML = "<div class=\"displayTableCell\" style=\"vertical-align: middle !important; padding:0 0.25em;\">";
    promptScoreSpanHTML += "<span id=\"promptScoreTotalSpan_" + prompt.id + "\" class=\"score\" data-promptid=\"" + prompt.id + "\" data-maxscore=\"" + prompt.maxValue + "\" data-maxbonusscore=\"" + prompt.maxBonusValue + "\">";
    if (prompt.maxValue > 0)
        promptScoreSpanHTML += "<span id=\"promptScoreSpan_" + prompt.id + "\" data-maxscore=\"" + prompt.maxValue + "\" data-maxbonusscore=\"" + prompt.maxBonusValue + "\">0</span><span>/</span><span id=\"promptMaxScoreSpan_" + prompt.id + "\">" + prompt.maxValue + "</span>";
    else if (prompt.maxBonusValue > 0)
    {
        promptScoreSpanHTML += "<i id=\"promptScoreIcon_" + prompt.id + "\" class=\"fa\"></i>"
        promptScoreSpanHTML += "<span id=\"promptScoreSpan_" + prompt.id + "\" style=\"margin-left:0.5em;\" data-maxscore=\"" + prompt.maxValue + "\" data-maxbonusscore=\"" + prompt.maxBonusValue + "\">0</span>";
    }
    else
        promptScoreSpanHTML += "  <i id=\"promptScoreIcon_"+prompt.id+"\" class=\"fa\"></i>"
    promptScoreSpanHTML += "</span> ";
    promptScoreSpanHTML += "</div>";
    return promptScoreSpanHTML;
}

function generateResponseScoreSpan(elementId, promptId, responseId, sortKey, correct, maxScore, bonusValue, editable, notIncorrect)
{
    //console.log("generateResponseScoreSpan")
    var scoreSpanElementId = elementId.replace("Token", "ScoreSpan");
    var responseScoreSpanHTML = "<div id=\"" + elementId + "\" style=\"display:none;\" class=\"score " + (editable ? "scoreEditable" : "") + "\" data-promptid=\"" + promptId + "\" data-responseid=\"" + responseId + "\" data-sortkey=\"" + sortKey + "\" data-maxscore=\"" + maxScore + "\" data-maxbonusscore=\"" + bonusValue + "\" data-correct=\"" + correct + "\"  " + ((notIncorrect==true) ? "data-notincorrect=\"true\"" : "")+">";
    responseScoreSpanHTML += "  <div class=\"displayTableCell\"><i id=\"scoreIcon_"+elementId+"\" class=\"fa\"></i></div>"
    if (maxScore != 0)
        responseScoreSpanHTML += "  <div class=\"displayTableCell\" id=\"" + scoreSpanElementId + "\" data-promptid=\"" + promptId + "\" data-responseid=\"" + responseId + "\" data-sortkey=\"" + sortKey + "\" data-maxscore=\"" + maxScore + "\" data-maxbonusscore=\"" + bonusValue + "\" data-value=\"0\" data-bonusvalue=\"0\">0</div>"
    else if (bonusValue != 0)
        responseScoreSpanHTML += "  <div class=\"displayTableCell\" id=\"" + scoreSpanElementId + "\" data-promptid=\"" + promptId + "\" data-responseid=\"" + responseId + "\" data-sortkey=\"" + sortKey + "\" data-maxscore=\"" + maxScore + "\" data-maxbonusscore=\"" + bonusValue + "\" data-value=\"0\" data-bonusvalue=\"0\">0</div>"
    responseScoreSpanHTML += "</div>";
    return responseScoreSpanHTML;
}

function reconcilePromptScoreSpans(activityComponentId)
{
    var rootElement = (typeof(activityComponentId) == "undefined" ? $(document) : $("#componentContainer_"+activityComponentId));
    rootElement.find("[id*='promptScoreTotalSpan_']").each(function ()
    {
        reconcilePromptTotalScoreSpan($(this));
    });
}

function reconcilePromptTotalScoreSpan(promptScoreTotalSpan)
{
    var promptId = parseInt(promptScoreTotalSpan.data("promptid"));
    var promptMaxScore = parseFloat(promptScoreTotalSpan.data("maxscore"));
    var promptMaxBonusScore = parseFloat(promptScoreTotalSpan.data("maxbonusscore"));
    var promptTotal = 0;
    var promptBonusTotal = 0;
    var promptScoreSpan = promptScoreTotalSpan.children("[id*='promptScoreSpan_']").first();
    var studentResponseCorrectCount = 0;
    var studentResponseIncorrectCount = 0;
    var responseCorrectCount = 0;
    $(document).find("[id*='Token_'][data-promptid=" + promptId + "]").each(function ()
    {
        var responseToken = $(this);
        if (responseToken.hasClass("scoreCorrect"))
            studentResponseCorrectCount++;
        else if(responseToken.hasClass("scoreIncorrect"))
            studentResponseIncorrectCount++;
        if ((promptMaxScore > 0)||(promptMaxBonusScore > 0))
        {
            var responseScoreSpan = responseToken.children("[id*='ScoreSpan_']").first();
            var responseValue = parseFloat(responseScoreSpan.attr("data-value"));
            var responseBonusValue = parseFloat(responseScoreSpan.attr("data-bonusvalue"));
            if (!isNaN(responseValue))
                promptTotal += responseValue;
            if (!isNaN(responseBonusValue))
                promptBonusTotal += responseBonusValue;
        }
        else if(responseToken.data("correct"))
        {
            responseCorrectCount++;
        }
    });
    if (promptTotal < 0)
        promptTotal = 0;
    if (promptMaxScore > 0)
        promptScoreSpan.text(promptTotal);
    else if (promptMaxBonusScore > 0)
    {
        promptScoreSpan.text(promptBonusTotal);
    }
    else
    {
        promptScoreTotalSpan.data("studentResponseCorrectCount", studentResponseCorrectCount);
        promptScoreTotalSpan.data("studentResponseIncorrectCount", studentResponseIncorrectCount);
        promptScoreTotalSpan.data("responseCorrectCount", responseCorrectCount);
    }
    updatePromptScoreTotalSpanClass(promptScoreTotalSpan);
    var promptScoreTokenLoadedEvent = $.Event("promptScoreTokenLoaded");
    promptScoreTokenLoadedEvent.scoreToken = promptScoreTotalSpan;
    promptScoreTokenLoadedEvent.promptId = promptId;
    promptScoreTokenLoadedEvent.total = promptTotal;
    promptScoreTokenLoadedEvent.maxScore = promptMaxScore;
    $(document).trigger(promptScoreTokenLoadedEvent);

}

function updatePromptScoreTotalSpanClass(promptScoreTotalSpan)
{
    if (promptScoreTotalSpan.css("display") != "none")
    {
        var promptScoreSpan = promptScoreTotalSpan.children("[id*='promptScoreSpan_']").first();
        var promptMaxScoreSpan = promptScoreTotalSpan.children("[id*='promptMaxScoreSpan_']").first();
        // var promptScoreIcon = promptScoreTotalSpan.children(".fa").first();
        
        var promptScoreIcon;
        promptScoreTotalSpan.find(".fa").each(function(){
            promptScoreIcon = $(this)
        });

        var score = parseFloat(promptScoreSpan.text());
        var maxScore = parseFloat(promptScoreTotalSpan.data("maxscore"));
        var maxBonusScore = parseFloat(promptScoreTotalSpan.data("maxbonusscore"));
        promptScoreTotalSpan.removeClass("score");
        promptScoreTotalSpan.removeClass("scoreCorrect");
        promptScoreTotalSpan.removeClass("scorePartiallyCorrect");
        promptScoreTotalSpan.removeClass("scoreIncorrect");
        if (maxScore > 0)
        {
            if (score >= maxScore)
                promptScoreTotalSpan.addClass("scoreCorrect");
            else if (score > 0)
                promptScoreTotalSpan.addClass("scorePartiallyCorrect");
            else
                promptScoreTotalSpan.addClass("scoreIncorrect");
            promptMaxScoreSpan.text(Math.abs(maxScore));
        }
        else if (maxBonusScore > 0)
        {
            promptScoreIcon.removeClass("fa-check");
            promptScoreIcon.removeClass("fa-plus");
            promptScoreIcon.removeClass("fa-times");
            if (score > 0)
            {
                promptScoreTotalSpan.addClass("scoreCorrect");
                promptScoreIcon.addClass("fa-plus");
            }
            else
                promptScoreTotalSpan.addClass("scoreIncorrect");
        }
        else
        {
            promptScoreIcon.removeClass("fa-check");
            promptScoreIcon.removeClass("fa-plus");
            promptScoreIcon.removeClass("fa-times");
            var studentResponseCorrectCount = promptScoreTotalSpan.data("studentResponseCorrectCount");
            var studentResponseIncorrectCount = promptScoreTotalSpan.data("studentResponseIncorrectCount");
            var responseCorrectCount = promptScoreTotalSpan.data("responseCorrectCount");
            var studentAnswerCount = studentResponseCorrectCount - studentResponseIncorrectCount;
            if (studentAnswerCount >= responseCorrectCount)
            {
                promptScoreTotalSpan.addClass("scoreCorrect");
                promptScoreIcon.addClass("fa-check");
            }
            else if (studentAnswerCount > 0)
            {
                promptScoreTotalSpan.addClass("scorePartiallyCorrect");
                promptScoreIcon.addClass("fa-check");
            }
            else
            {
                promptScoreTotalSpan.addClass("scoreIncorrect");
                promptScoreIcon.addClass("fa-times");
            }
        }
    }
}

function updateResponseScoreTokenClass(responseScoreToken)
{
    if (responseScoreToken.css("display") != "none")
    {
        var responseScoreSpan = responseScoreToken.children("[id*='ScoreSpan_']").first();
        // var responseScoreIcon = responseScoreToken.children(".fa").first();
        var responseScoreIcon;
        responseScoreToken.find(".fa").each(function(){
            responseScoreIcon = $(this)
        });
        var responseMaxScore = parseFloat(responseScoreSpan.data("maxscore"));
        var responseMaxBonusScore = parseFloat(responseScoreSpan.data("maxbonusscore"));
        var promptId = responseScoreSpan.data("promptid");
        var responseId = responseScoreSpan.data("responseid");
        var sortKey = responseScoreSpan.data("sortkey");
        var score = parseFloat(responseScoreSpan.text());
        responseScoreToken.removeClass("score");
        responseScoreToken.removeClass("scoreCorrect");
        responseScoreToken.removeClass("scorePartiallyCorrect");
        responseScoreToken.removeClass("scoreIncorrect");
        responseScoreIcon.removeClass("fa-exclamation-triangle");
        responseScoreIcon.removeClass("fa-check");
        responseScoreIcon.removeClass("fa-times");
        responseScoreIcon.removeClass("fa-plus");
        if (responseMaxBonusScore > 0)
        {
            if (score > 0)
            {
                responseScoreToken.addClass("scoreCorrect");
                responseScoreIcon.addClass("fa-plus");
                responseScoreSpan.show();
            }
            else
            {
                responseScoreToken.addClass("scoreIncorrect");
                responseScoreIcon.addClass("fa-times");
                responseScoreSpan.show();
            }
        }
        else
        {
            if (score >= responseMaxScore)
            {
                responseScoreToken.addClass("scoreCorrect");
                responseScoreIcon.addClass("fa-check");
            }
            else if (score > 0)
            {
                responseScoreToken.addClass("scorePartiallyCorrect");
                responseScoreIcon.addClass("fa-check");
            }
            else
            {
                responseScoreToken.addClass("scoreIncorrect");
                responseScoreIcon.addClass("fa-times");
            }
            responseScoreSpan.show();
        }
        responseScoreIcon.parent().show();
        updatePromptScoreTotalSpanClass($("#promptScoreTotalSpan_" + promptId));
    }
}
var pingTimer = false;
var pingFailureTimeout = 7500;
var pingStatusIcons = [userLoggedOnIcon, userIdleIcon, userLoggedOffIcon, userUnavailableIcon];
var pingFailures = 0;

var studentAnswers = false;

$(document).ready(function ()
{
    studentAnswers = new Array();
    $(document).bind("responseInteraction", function (event)
    {
        updateStudentAnswers(event.action, event.componentTitle, event.activityComponentId, event.promptId, event.responseId, event.responseIds, event.responseIndex, event.responseText);
    });
    $(document).bind("speakingSubmitButtonClick", function (event) { submitStudentSpeakingAnswer(event.containerElement, event.file); });
    $(document).bind("writingSubmitButtonClick", function (event) { submitStudentWritingAnswer(event.containerElement, event.sketchPad); });
});

function loadStudentAnswers(sa)
{
    studentAnswers = sa;
    for (var a = 0; a < module.activities.length; a++)
    {
        loadStudentActivityAnswers(module.activities[a]);
    }
    if (module.hiddenActivities)
    {
        for (var ha = 0; ha < module.hiddenActivities.length; ha++)
        {
            loadStudentActivityAnswers(module.hiddenActivities[ha]);
        }
    }
    if (typeof (studentAssignment) != "undefined")
    {
        $("#id_headerNavName").html(studentAssignment.studentName);
        $("#id_headerNavName").show();
        $("#summaryPanelName").html(studentAssignment.studentName);
        $("#summaryPanelName").show();
    }
    else
    {
        $("#id_headerNavName").hide();
        $("#summaryPanelName").hide();
    }
    setModuleCompletionData();
}

function loadStudentActivityAnswers(activity)
{
    for (var j = 0; j < activity.activityComponents.length; j++)
    {
        var activityComponent = activity.activityComponents[j];
        for (var k = 0; k < activityComponent.prompts.length; k++)
        {
            var prompt = activityComponent.prompts[k];
            for (var s = 0; s < studentAnswers.length; s++)
            {
                var studentAnswer = studentAnswers[s];
                if (studentAnswer.promptId == prompt.id)
                {
                    switch (activityComponent.componentTitle.toUpperCase())
                    {
                        case "CATEGORIZATION":
                            var responseDivToMove = $("#response_" + studentAnswer.responseId);
                            $("#responsesContainer_" + studentAnswer.promptId).append(responseDivToMove);
                            break;
                        case "FILLINTHEBLANK":
                            var responsePool = $("#responsePool_" + activityComponent.id);
                            var responseBlank = $("#response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            var blankAnchor = $("#blankAnchor_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);

                            if (responsePool.length > 0)
                            {
                                var draggableResponse = $("#response_" + studentAnswer.responseId);
                                if (draggableResponse.length > 0)
                                {
                                    responseBlank.prepend(draggableResponse);
                                    responseBlank.removeClass("dropTarget");
                                    responseBlank.css("width", "");
                                    draggableResponse.show();
                                }
                            }
                            else if (blankAnchor.length > 0)
                            {
                                blankAnchor.html(studentAnswer.responseText);
                            }
                            else if (responseBlank.hasClass("response"))
                            {
                                $("#responseInputBox_" + studentAnswer.promptId + "_" + studentAnswer.sortKey).html(studentAnswer.responseText);
                            }
                            else if (responseBlank.hasClass("blank"))
                            {
                                var blankHtml = "<span id=\"response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" type=\"text\" class=\"response\" style=\"width:auto;\" data-promptid=\"" + studentAnswer.promptId + "\" data-index=\"" + studentAnswer.sortKey + "\">";
                                blankHtml += "<span id=\"responseInputBox_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" class=\"customInputBox\" data-promptid=\"" + studentAnswer.promptId + "\" data-index=\"" + studentAnswer.sortKey + "\">" + studentAnswer.responseText + "</span>";
                                blankHtml += "</span>";
                                responseBlank.replaceWith(blankHtml);
                                responseBlank = $("#response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            }
                            var inlineFeedbackContainer = $("#inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            if (inlineFeedbackContainer.length <= 0)
                            {
                                responseBlank.before("<span id=\"inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" class=\"feedbackContainer inlineFeedbackContainer\"></span>");
                                inlineFeedbackContainer = $("#inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            }
                            inlineFeedbackContainer.show();
                            responseBlank.show();
                            break;
                        case "FINDANDCLICK":
                            var response = false;
                            for (var l = 0; l < activityComponent.prompts.length; l++)
                            {
                                if (studentAnswer.promptId == activityComponent.prompts[l].id)
                                {
                                    var prompt = activityComponent.prompts[l];
                                    for (var m = 0; m < prompt.responses.length; m++)
                                    {
                                        if (prompt.responses[m].id == studentAnswer.responseId)
                                            response = prompt.responses[m];

                                    }
                                }
                            }
                            if (response)
                                loadResponseHotspot(activityComponent, response);
                            break;
                        case "MATCHING":
                            var dropArea = $("#matchingPromptDropArea_" + studentAnswer.promptId);
                            var promptIndex = dropArea.data("promptindex");
                            var matchingResponseDiv = $("#matchingResponseDiv_" + studentAnswer.responseId);
                            dropArea.append(matchingResponseDiv).find(".dropTargetIcon").hide();
                            matchingResponseDiv.data("selectedpromptid", studentAnswer.promptId);
                            var currentResponse = $("#matchingResponseContainer_" + activityComponent.id + "_" + promptIndex).find(".responseContainer").first();
                            var studentAnswerResponse = $("#matchingResponse_" + studentAnswer.responseId).first();
                            swapElements(currentResponse[0], studentAnswerResponse[0]);
                            $("#matchingPrompt_" + studentAnswer.promptId).data("matchingstudentresponseid", studentAnswer.responseId);
                            toggleMatchingLink(activityComponent.id, studentAnswer.promptId, promptIndex);
                            break;
                        case "ORDERING":
                            var counter = 0;
                            var responseDivToMove = $("#response_" + studentAnswer.responseId);
                            $("#responsesContainer_" + studentAnswer.promptId).children("[id^='response_']").each(function ()
                            {
                                counter++;
                                var responseDiv = $(this);
                                if ((studentAnswer.sortKey == counter) && (responseDiv.attr("id") != responseDivToMove.attr("id")))
                                    responseDivToMove.insertBefore(responseDiv);
                            });
                            break;
                        case "SHORTANSWER":
                            $("#responseInputBox_" + studentAnswer.promptId).html(htmlDecode(studentAnswer.responseText));
                            $("#responseInputBox_" + studentAnswer.promptId).data("text", htmlDecode(studentAnswer.responseText));
                            break;
                        case "SPEAKING":
                            var speakingResponseContentAudio = $("#speakingResponseContent_" + studentAnswer.promptId + "_audio");
                            if (speakingResponseContentAudio.length > 0)
                            {
                                speakingResponseContentAudio.attr("src", studentAnswer.responseText);
                                setupUcatMedia(speakingResponseContentAudio.parent());
                            }
                            break;
                        case "TEXTSELECTOR":
                            for (var l = 0; l < activityComponent.prompts.length; l++)
                            {
                                for (var m = 0; m < activityComponent.prompts[l].responses.length; m++)
                                {
                                    var response = activityComponent.prompts[l].responses[m];
                                    if (response.id == studentAnswer.responseId)
                                    {
                                        var selectedResponse = $("#response_" + studentAnswer.responseId);
                                        selectedResponse.addClass("selectable selectableHighlight");
                                    }
                                }
                            }
                            break;
                        case "TRANSCRIPTION":
                            var responseBlank = $("#response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);

                            if (responseBlank.hasClass("response"))
                            {
                                $("#responseInputBox_" + studentAnswer.promptId + "_" + studentAnswer.sortKey).html(studentAnswer.responseText);
                            }
                            else if (responseBlank.hasClass("blank"))
                            {
                                var blankHtml = "<span id=\"response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" type=\"text\" class=\"response\" style=\"width:auto;\" data-promptid=\"" + studentAnswer.promptId + "\" data-index=\"" + studentAnswer.sortKey + "\">";
                                blankHtml += "<span id=\"responseInputBox_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" class=\"customInputBox\" data-promptid=\"" + studentAnswer.promptId + "\" data-index=\"" + studentAnswer.sortKey + "\">" + studentAnswer.responseText + "</span>";
                                blankHtml += "</span>";
                                responseBlank.replaceWith(blankHtml);
                                responseBlank = $("#response_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            }
                            var inlineFeedbackContainer = $("#inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            if (inlineFeedbackContainer.length <= 0)
                            {
                                responseBlank.before("<span id=\"inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey + "\" class=\"feedbackContainer inlineFeedbackContainer\"></span>");
                                inlineFeedbackContainer = $("#inlineFeedbackContainer_" + studentAnswer.promptId + "_" + studentAnswer.sortKey);
                            }
                            inlineFeedbackContainer.show();
                            responseBlank.show();
                            break;
                        case "WRITING":
                            for (var l = 0; l < activityComponent.prompts.length; l++)
                            {
                                if (studentAnswer.promptId == activityComponent.prompts[l].id)
                                {
                                    var studentAnswerJSON = $.parseJSON(htmlDecode(studentAnswer.responseText));
                                    $("#writingResponseContent_" + prompt.id).ucatCanvas(prompt.sketchpad, studentAnswerJSON);
                                }
                            }
                            break;
                        default:
                            for (var l = 0; l < activityComponent.prompts.length; l++)
                            {
                                if (studentAnswer.promptId == activityComponent.prompts[l].id)
                                {
                                    toggleInput(studentAnswer.promptId, studentAnswer.responseId, activityComponent.prompts[l].radioButton, activityComponent.renderModeLayout);
                                }
                            }
                            break;
                    }
                }
            }
        }
    }
}

function loadStudentSummaryPage()
{
    var incompleteActivityComponentCount = 0;
    for (var i = 0; i < module.activities.length; i++)
    {
        var activity = module.activities[i];
        var displayActivityComponentCount = 0;
        for (var j = 0; j < activity.activityComponents.length; j++)
        {
            var activityComponent = activity.activityComponents[j];
            var displayActivityComponent = true;
            for (var k = 0; k < activityComponent.prompts.length; k++)
            {
                var prompt = activityComponent.prompts[k];
                switch (activityComponent.componentTitle.toUpperCase())
                {
                    case "CATEGORIZATION":
                        displayActivityComponentCount++;
                        break;
                    case "PRESENTATION":
                        displayActivityComponent = false;
                        break;
                    case "TRANSCRIPTION":
                    case "FILLINTHEBLANK":
                        displayActivityComponentCount++;
                        break;
                    default:
                        displayActivityComponentCount++;
                        break;
                }
            }
            if (displayActivityComponent)
            {
                if (activityComponent.complete)
                {
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<i class=\"fa fa-check\" style=\"color:#4ecf3b; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "','" + activityComponent.id + "');\"></i>");
                }
                else
                {
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<i class=\"fa fa-exclamation-triangle\" style=\"color:#e5882e; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "','" + activityComponent.id + "');\"></i>");
                    incompleteActivityComponentCount++;
                }
            }
        }
        if (displayActivityComponentCount > 0)
        {
            if (activity.complete)
                $("#activitySummaryData_" + activity.id).html("<i class=\"fa fa-check\" style=\"color:#4ecf3b; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "');\"></i>");
            else
                $("#activitySummaryData_" + activity.id).html("<i class=\"fa fa-exclamation-triangle\" style=\"color:#e5882e; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "');\"></i>");
        }
    }
    $("#moduleSummaryData_" + module.id).data("incompleteActivityComponentCount", incompleteActivityComponentCount);
    var studentSummaryPageLoadedEvent = $.Event("studentSummaryPageLoaded");
    $(document).trigger(studentSummaryPageLoadedEvent);
}

function loadPingConnectionStatus()
{
    var pingStatusIcon = $("#pingStatusIcon");
    if (pingStatusIcon.length == 0)
    {
        var pingStatusIconHTML = "<div id=\"pingStatusIconCell\" class=\"themeBgrColor_1 interfacePaddingLeft\" style=\"display:table-cell;vertical-align:middle;\"><i id=\"pingStatusIcon\"></i></div>";
        $("#id_headerNavName").after(pingStatusIconHTML);
        pingStatusIcon = $("#pingStatusIcon");
    }
    pingStatusIcon.attr("class", pingStatusIcons[pingFailures]);
}

function pingStudentAssignmentStatus() 
{
    loadPingConnectionStatus();
    $.ajax(
    {
        type: "POST",
        dataType: "jsonp",
        url: domainRootPath + "WebServices/Assignment.aspx",
        data:
        {
            "jsonpCallback": "pingStudentAssignmentStatusCallback",
            "action": "pingStudentAssignmentStatus",
            "assignmentId": studentAssignment.assignmentId
        },
        error: function (xhr, status, error)
        {
            // ignore parsererror because that always comes back
            if (error == 'parsererror')
                return;
            // timeout
            else if (error == 'timeout')
            {
                pingFailures++;
                /*DEBUG ONLY
                if ((pingFailures == 2)&&(!queueProcessing))
                {
                    var requestObj = {
                        "jsonpCallback": "justATest",
                        "action": "submitStudentAnswer",
                        "id": assignment.id,
                        "componentTitle": "notARealComponent",
                        "promptId": 0,
                        "responseId": 0,
                        "responseIds": "",
                        "responseIndex": 0,
                        "responseText": "",
                        "responseDate": new Date()
                    };
                    console.log("GENERATE FAKE FAILED REQUEST");
                    console.log(requestObj);
                    studentResponseQueue.push(requestObj);
                    setCookie("studentResponseQueue", studentResponseQueue);
                }
                */
                if (pingFailures > pingStatusIcons.length - 1)
                {
                    pingFailures = pingStatusIcons.length - 1;
                    loadFailedSubmissionWarning();
                }
                if (pingFailures < 0)
                    pingFailures = 0;
                pingStudentAssignmentStatus();
            }
        }
    });
}

function pingStudentAssignmentStatusCallback(serverResponseObj, requestObj)
{
    if (serverResponseObj.error)
    {
        inlineSystemErrorMessaging(serverResponseObj, requestObj);
//        goBack();
    }
    else if (serverResponseObj.studentAssignmentAuthorizationToken)
    {
        if (!serverResponseObj.studentAssignmentAuthorizationToken.canView)
        {
            var message = "You do not have access to view this assignment.";
            if (!serverResponseObj.studentAssignmentAuthorizationToken.initiated)
            {
                message = "Assignment has not been started yet.";
            }
            else if (serverResponseObj.studentAssignmentAuthorizationToken.paused)
            {
                message = "Teacher has paused this assignment.";
            }
            else if (serverResponseObj.studentAssignmentAuthorizationToken.submitted && (!serverResponseObj.studentAssignmentAuthorizationToken.studentReview || serverResponseObj.studentAssignmentAuthorizationToken.teacherReview))
            {
                message = "You have submitted your assignment and it is under teacher review.";
            }
            else if (serverResponseObj.studentAssignmentAuthorizationToken.completed && serverResponseObj.studentAssignmentAuthorizationToken.assessment)
            {
                message = "Assessment is complete.";
            }
            var div = document.createElement('div');
            div.style.backgroundColor = '#000';
            div.style.opacity = 0.8;
            div.style.position = 'absolute';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100vw';
            div.style.height = '100vh';
            div.onclick = function ()
            {
                this.parentNode.removeChild(this);
                document.forms[0].style.color = '';
                document.forms[0].style.textShadow = '';
            }
            document.body.appendChild(div);

            document.forms[0].style.color = 'transparent';
            document.forms[0].style.textShadow = '0 0 5px rgba(0,0,0,0.5)';

            window.setTimeout(function ()
            {
                inlineSystemErrorMessaging(message);
                goBack();
            }, 500);
        }
        /*
        if (pingTimer != false)
            clearTimeout(pingTimer);
        pingTimer = window.setTimeout(function ()
        {
            pingStudentAssignmentStatus()
        }, 10000);
        */
    }
}


function updateStudentAnswers(action, componentTitle, activityComponentId, promptId, responseId, responseIds, responseIndex, responseText)
{
    if (typeof (responseIndex) == "undefined")
        responseIndex = 1;
    var responseIdArr = new Array();
    var responseIndexArr = new Array();
    switch (componentTitle.toUpperCase())
    {
        case "FILLINTHEBLANK":
            responseIds = "";
            break;
        case "ORDERING":
            responseId = 0;
            responseIndex = 0;
            responseText = "";
            responseIdArr = responseIds.split(",");
            break;
        case "TRANSCRIPTION":
            responseIds = "";
            break;
        case "SHORTANSWER":
            break;
        case "FINDANDCLICK":
            $("#responsesContainer_" + promptId).find("[id^='responseHotspot_']").each(function ()
            {
                var responseInput = $(this);
                responseIdArr.push(responseInput.data("responseid"));
                responseIndexArr.push(responseInput.data("index"));
            });
            break;
        case "TEXTSELECTOR":
            $("#responsesContainer_" + promptId).find("[id^='response_']").each(function ()
            {
                var responseInput = $(this);
                if (responseInput.hasClass("selectableHighlight") || responseInput.hasClass("incorrect") || responseInput.hasClass("correct"))
                {
                    responseIdArr.push(responseInput.data("responseid"));
                    responseIndexArr.push(responseInput.data("index"));
                }
            });
            break;
        case "SPEAKING":
            break;
        case "WRITING":
            break;
        default:
            if (typeof (responseIds) == "undefined")
            {
                $("#responsesContainer_" + promptId).find("[id^='responseInput_']").each(function ()
                {
                    var responseInput = $(this);
                    if (responseInput.data("checked"))
                        responseIdArr.push(responseInput.data("responseid"));
                });
            }
            else
                responseIdArr = responseIds.split(",");
            break;
    }
    if (action == "remove")
    {
        var i = studentAnswers.length
        while (i--) 
        {
            if ((studentAnswers[i].promptId == promptId) && (studentAnswers[i].responseId == responseId))
            {
                studentAnswers.splice(i, 1);
            }
        }
    }
    else
    {
        var i = studentAnswers.length
        while (i--)
        {
            if ((studentAnswers[i].promptId == promptId) && (((responseIdArr.length > 0) && (responseIdArr.length == responseIndexArr.length)) || (responseIndex <= 0) || (studentAnswers[i].sortKey == responseIndex)))
            {
                var studentAnswerSpliceEvent = $.Event("studentAnswerSplice");
                studentAnswerSpliceEvent.studentAnswerId = studentAnswers[i].id;
                $(document).trigger(studentAnswerSpliceEvent);
                studentAnswers.splice(i, 1);
            }
        }
        if (responseIdArr.length > 0)
        {
            for (var i = 0; i < responseIdArr.length; i++)
            {
                studentAnswers.push({ "moduleId": module.id, "activityComponentId": activityComponentId, "promptId": promptId, "responseId": parseInt(responseIdArr[i]), "sortKey": ((responseIdArr.length == responseIndexArr.length) ? (responseIndexArr[i]) : (i + 1)), "responseText": responseText, "originalGrade": 0, "latestGrade": 0 });
            }
        }
        else if ((responseId > 0) || (responseText != ""))
        {
            studentAnswers.push({ "moduleId": module.id, "activityComponentId": activityComponentId, "promptId": promptId, "responseId": responseId, "sortKey": responseIndex, "responseText": responseText, "originalGrade": 0, "latestGrade": 0 });
        }
    }
    setModuleCompletionData();
    var studentAnswersUpdatedEvent = $.Event("studentAnswersUpdated");
    studentAnswersUpdatedEvent.action = action;
    studentAnswersUpdatedEvent.componentTitle = componentTitle;
    studentAnswersUpdatedEvent.activityComponentId = activityComponentId;
    studentAnswersUpdatedEvent.promptId = promptId;
    studentAnswersUpdatedEvent.responseId = responseId;
    studentAnswersUpdatedEvent.responseIds = responseIds;
    studentAnswersUpdatedEvent.responseIndex = responseIndex;
    studentAnswersUpdatedEvent.responseText = responseText;
    $(document).trigger(studentAnswersUpdatedEvent);

}

function submitStudentSpeakingAnswer(containerElement, file)
{
    var componentTitle = containerElement.attr("data-componenttitle");
    var activityComponentId = containerElement.attr("data-activitycomponentid");
    var promptId = containerElement.attr("data-promptid");
    var responseId = containerElement.attr("data-responseid");
    var responseInputSubmit = $("#responseInputSubmit_" + promptId);
    updateStudentAnswers("", componentTitle, activityComponentId, promptId, responseId, "", 0, file.name)
}

function submitStudentWritingAnswer(containerElement, sketchPad)
{
    var componentTitle = containerElement.attr("data-componenttitle");
    var activityComponentId = containerElement.attr("data-activitycomponentid");
    var promptId = containerElement.attr("data-promptid");
    var responseId = containerElement.attr("data-responseid");
    var responseInputSubmit = $("#responseInputSubmit_" + promptId);
    updateStudentAnswers("", componentTitle, activityComponentId, promptId, responseId, "", 0, sketchPad.toJSON());
}

function setModuleCompletionData()
{
    for (var a = 0; a < module.activities.length; a++)
    {
        setActivityCompletionData(module.activities[a]);
    }
    if (module.hiddenActivities)
    {
        for (var ha = 0; ha < module.hiddenActivities.length; ha++)
        {
            setActivityCompletionData(module.hiddenActivities[ha], true);
        }
    }
    var moduleCompletionSetEvent = $.Event("moduleCompletionSet");
    $(document).trigger(moduleCompletionSetEvent);
}

function setActivityCompletionData(activity, hiddenActivity)
{
    activity.complete = true;
    for (var j = 0; j < activity.activityComponents.length; j++)
    {
        var activityComponent = activity.activityComponents[j];
        activityComponent.complete = true;
        var displayActivityComponent = true;
        for (var k = 0; k < activityComponent.prompts.length; k++)
        {
            var prompt = activityComponent.prompts[k];
            var promptComplete = false;
            switch (activityComponent.componentTitle.toUpperCase())
            {
                case "CATEGORIZATION":
                    activityComponent.complete = false;
                    for (var l = 0; l < studentAnswers.length; l++)
                    {
                        if (studentAnswers[l].activityComponentId == activityComponent.id)
                            activityComponent.complete = true;
                    }
                    break;
                case "MATCHING":
                    for (var l = 0; l < studentAnswers.length; l++)
                    {
                        if (studentAnswers[l].promptId == prompt.id)
                            promptComplete = true;
                    }
                    if (!promptComplete)
                        activityComponent.complete = false;
                    break;
                case "PRESENTATION":
                    displayActivityComponent = false;
                    break;
                case "TRANSCRIPTION":
                case "FILLINTHEBLANK":
                    var maxAnswerCount = $("#responsesContainer_" + prompt.id).find("[id^='response_" + prompt.id + "_']").length;
                    var studentAnswerCount = 0;
                    for (var l = 0; l < studentAnswers.length; l++)
                    {
                        if (studentAnswers[l].promptId == prompt.id)
                            studentAnswerCount++;
                    }
                    if (studentAnswerCount == maxAnswerCount)
                        promptComplete = true;
                    if (!promptComplete)
                        activityComponent.complete = false;
                    break;
                default:
                    if (prompt.responses && prompt.responses.length > 0)
                    {
                        for (var l = 0; l < studentAnswers.length; l++)
                        {
                            if (studentAnswers[l].promptId == prompt.id)
                                promptComplete = true;
                        }
                    }
                    else
                        promptComplete = true;
                    if (!promptComplete)
                        activityComponent.complete = false;
                    break;
            }
        }
        if (displayActivityComponent && !activityComponent.complete)
        {
            activity.complete = false;
        }
    }

}
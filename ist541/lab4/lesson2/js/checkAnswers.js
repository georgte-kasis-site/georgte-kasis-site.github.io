$(document).ready(function ()
{
    $(document).bind("studentAnswersUpdated", function (event)
    {
        updateStudentAnswerSubmitControls(event.action, event.componentTitle, event.activityComponentId, event.promptId, event.responseId, event.responseIds, event.responseIndex, event.responseText);
    });

    $(document).bind("studentAnswerRequestQueued", function (event)
    {
        if ((typeof (studentRequestQueue) != "undefined") && (studentRequestQueue.length > 0))
        {
            $(document).find(".checkAnswerBtn").each(function ()
            {
                var btn = $(this);
                if (!btn.hasClass("checkAnswerBtnDisabled"))
                    btn.addClass("checkAnswerBtnDisabled");
            });
        }
    });
    $(document).bind("studentAnswerRequestRemoved", function (event)
    {
        if ((typeof (studentRequestQueue) == "undefined") || (studentRequestQueue.length == 0))
        {
            $(document).find(".checkAnswerBtn").each(function ()
            {
                var btn = $(this);
                if (btn.hasClass("checkAnswerBtnDisabled"))
                    btn.removeClass("checkAnswerBtnDisabled");
            });
        }
    });
});


function updateStudentAnswerSubmitControls(action, componentTitle, activityComponentId, promptId, responseId, responseIds, responseIndex, responseText)
{
    if (typeof (responseIndex) == "undefined")
        responseIndex = 1;
    switch (componentTitle.toUpperCase())
    {
        case "FILLINTHEBLANK":
            //reset submit and input boxes
            $("#responseInputBox_"+promptId+"_"+responseIndex+"_submit").attr("class","submitBtn btnGrey disabled").show();
            $("#response"+promptId+"_"+responseIndex).removeClass("active");
            $("#responseInputBox_"+promptId+"_"+responseIndex+"_submit").html('<i class="fa fa-check"></i>')
            break;
        case "ORDERING":
            break;
        case "TRANSCRIPTION":
            //reset submit and input boxes
            $("#responseInputBox_"+promptId+"_"+responseIndex+"_submit").attr("class","submitBtn btnGrey disabled").show();
            $("#response"+promptId+"_"+responseIndex).removeClass("active");
            $("#responseInputBox_"+promptId+"_"+responseIndex+"_submit").html('<i class="fa fa-check"></i>')
            break;
        case "SHORTANSWER":
            $("#responseInputSubmit_"+promptId).html('<i class="fa fa-check"></i> Submit')
            break;
        case "FINDANDCLICK":
            break;
        case "TEXTSELECTOR":
            break;
        case "SPEAKING":
            $("#responseInputSubmit_" + promptId).html('<i class="fa fa-check"></i> Submit')
            break;
        case "WRITING":
            $("#responseInputSubmit_" + promptId).html('<i class="fa fa-check"></i> Submit')
            break;
        default:
            break;
    }
    loadCheckAnswersSummary();
}

function loadCheckAnswers()
{
    for (var i = 0; i < module.activities.length; i++)
    {
        var activity = module.activities[i];
        for (var j = 0; j < activity.activityComponents.length; j++)
        {
            var activityComponent = activity.activityComponents[j];
            activityComponent.renderRefresh = true;
            activityComponent.renderCheckAnswer = true;
            switch (activityComponent.componentTitle.toUpperCase())
            {
                case "PRESENTATION":
                    activityComponent.renderCheckAnswer = false;
                    activityComponent.renderRefresh = false;
                    break;
                case "ORDERING":
                    break;
                case "TEXTSELECTOR":
                    break;
                case "CATEGORIZATION":
                    break;
                case "SHORTANSWER":
                    activityComponent.renderCheckAnswer = false;
                    for (var k = 0; k < activityComponent.prompts.length; k++)
                    {
                        if ((activityComponent.prompts[k].responses.length > 0) && (activityComponent.prompts[k].responses[0].text != ""))
                        {
                            activityComponent.renderCheckAnswer = true;
                            buildShortAnswerResponseHTML(activityComponent.prompts[k]);
                        }
                    }
                    break;
                case "FINDANDCLICK":
                    break;
                case "FILLINTHEBLANK":
                    break;
                case "SPEAKING":
                    activityComponent.renderCheckAnswer = false;
                    for (var k = 0; k < activityComponent.prompts.length; k++)
                    {
                        if ((activityComponent.prompts[k].responses.length > 0) && (activityComponent.prompts[k].responses[0].text != ""))
                        {
                            activityComponent.renderCheckAnswer = true;
                            buildSpeakingResponseHTML(activityComponent.prompts[k]);
                        }
                    }
                    break;
                case "WRITING":
                    activityComponent.renderCheckAnswer = false;
                    for (var k = 0; k < activityComponent.prompts.length; k++)
                    {
                        if ((activityComponent.prompts[k].responses.length > 0) && (activityComponent.prompts[k].responses[0].text != ""))
                        {
                            activityComponent.renderCheckAnswer = true;
                            buildWritingResponseHTML(activityComponent.prompts[k]);
                        }
                    }
                    break;
                default:
            }
            if (activityComponent.showCheckAnswers == false)
            {
                activityComponent.renderCheckAnswer = false;
            }
            $("#componentDetails_" + activityComponent.id).after("<div id=\"componentBtnContainer_" + activityComponent.id + "\" class=\"componentBtnContainer " + ((activityComponent.renderRTL == true) ? "" : "right") + "\"></div>");
            var componentBtnContainer = $("#componentBtnContainer_" + activityComponent.id);
            if (activityComponent.renderRTL)
            {
                if (activityComponent.renderCheckAnswer)
                    loadActivityComponentCheckAnswersButton(componentBtnContainer, activityComponent);
                else
                    componentBtnContainer.append("<div class=\"displayTableCell\"><span>&nbsp;</span></div>");
                if (activityComponent.renderRefresh)
                    loadRefreshComponentButton(componentBtnContainer, activityComponent);
            }
            else
            {
                if (activityComponent.renderRefresh)
                    loadRefreshComponentButton(componentBtnContainer, activityComponent);
                if (activityComponent.renderCheckAnswer)
                    loadActivityComponentCheckAnswersButton(componentBtnContainer, activityComponent);
                else
                    componentBtnContainer.append("<div class=\"displayTableCell\"><span>&nbsp;</span></div>");
            }
        }
    }
}

function loadModuleCheckAnswersButton(containerElement)
{
    var checkAnswerCount = 0;
    for (var a = 0; a < module.activities.length; a++)
    {
        for (var ac = 0; ac < module.activities[a].activityComponents.length; ac++)
        {
            if (module.activities[a].activityComponents[ac].renderCheckAnswer)
                checkAnswerCount++;
        }
    }
    if (checkAnswerCount > 0)
    {
        var buttonMarkup = "<span id=\"moduleCheckAnswerBtn\" class=\"activityButton checkAnswerBtn green\" style=\"display: inline; white-space:nowrap; padding:.5em;\"><i class=\"fa fa-check\"></i><span> Check All Answers</span></span>";
        containerElement.append(buttonMarkup);
    }
    $("#moduleCheckAnswerBtn").click(function ()
    {
        for (var a = 0; a < module.activities.length; a++)
        {
            for (var ac = 0; ac < module.activities[a].activityComponents.length; ac++)
            {
                var activityComponent = module.activities[a].activityComponents[ac];
                if(activityComponent.renderCheckAnswer)
                    checkActivityComponentAnswers(activityComponent);
            }
        }
    });
}

function loadActivityComponentCheckAnswersButton(containerElement, activityComponent)
{
    var buttonMarkup = "<div class=\"displayTableCell\"><span id=\"activityComponentCheckAnswerBtn_" + activityComponent.id + "\" class=\"activityButton checkAnswerBtn green\"><i class=\"fa fa-check\"></i></span></div>";
    containerElement.append(buttonMarkup);
    $("#activityComponentCheckAnswerBtn_" + activityComponent.id).on("click", function ()
    {
        checkActivityComponentAnswers(activityComponent);
    });
}

function checkAnswers()
{
    if ((typeof (studentRequestQueue) == "undefined") || (studentRequestQueue.length == 0))
    {
        for (var a = 0; a < module.activities.length; a++)
        {
            for (var ac = 0; ac < module.activities[a].activityComponents.length; ac++)
            {
                checkActivityComponentAnswers(module.activities[a].activityComponents[ac]);
            }
        }
    }
}

function checkActivityComponentAnswers(activityComponent)
{
    if ((typeof (studentRequestQueue) == "undefined") || (studentRequestQueue.length == 0))
    {
        var studentAnswerCount = 0;
        if (activityComponent.renderCheckAnswer && activityComponent.showCheckAnswers)
        {
            for (var sa = 0; sa < studentAnswers.length; sa++)
            {
                if (studentAnswers[sa].activityComponentId == activityComponent.id)
                {
                    studentAnswerCount++;
                    studentAnswers[sa].correct = false;
                    for (var p = 0; p < activityComponent.prompts.length; p++)
                    {
                        if (studentAnswers[sa].promptId == activityComponent.prompts[p].id)
                        {
                            for (var r = 0; r < activityComponent.prompts[p].responses.length; r++)
                            {
                                switch (activityComponent.componentTitle.toUpperCase())
                                {
                                    case "SHORTANSWER":
                                        if (studentAnswers[sa].responseText.length > 0)
                                        {
                                            $("#responseContainer_" + activityComponent.prompts[p].responses[r].id).show();
                                        }
                                        break;
                                    case "FILLINTHEBLANK":
                                    case "TRANSCRIPTION":
                                        if (studentAnswers[sa].sortKey == activityComponent.prompts[p].responses[r].sortKey)
                                        {
                                            if (cleanString(studentAnswers[sa].responseText).toUpperCase() == cleanString(activityComponent.prompts[p].responses[r].text).toUpperCase())
                                            {
                                                studentAnswers[sa].originalGrade = activityComponent.prompts[p].responses[r].value;
                                                studentAnswers[sa].bonusValue = activityComponent.prompts[p].responses[r].bonusValue;
                                                studentAnswers[sa].correct = activityComponent.prompts[p].responses[r].correct;
                                            }
                                            else if (typeof (activityComponent.prompts[p].responses[r].alternateResponses) != "undefined")
                                            {
                                                for (var ar = 0; ar < activityComponent.prompts[p].responses[r].alternateResponses.length; ar++)
                                                {
                                                    if (cleanString(studentAnswers[sa].responseText).toUpperCase() == cleanString(activityComponent.prompts[p].responses[r].alternateResponses[ar].text).toUpperCase())
                                                    {
                                                        studentAnswers[sa].originalGrade = activityComponent.prompts[p].responses[r].alternateResponses[ar].value;
                                                        studentAnswers[sa].bonusValue = activityComponent.prompts[p].responses[r].alternateResponses[ar].bonusValue;
                                                        studentAnswers[sa].correct = activityComponent.prompts[p].responses[r].alternateResponses[ar].correct;
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    case "ORDERING":
                                        if ((studentAnswers[sa].responseId == activityComponent.prompts[p].responses[r].id) && (studentAnswers[sa].sortKey == activityComponent.prompts[p].responses[r].sortKey))
                                        {
                                            studentAnswers[sa].originalGrade = activityComponent.prompts[p].responses[r].value;
                                            studentAnswers[sa].bonusValue = activityComponent.prompts[p].responses[r].bonusValue;
                                            studentAnswers[sa].correct = activityComponent.prompts[p].responses[r].correct;
                                        }
                                        break;
                                    case "MATCHING":
                                    case "CATEGORIZATION":
                                        if ((studentAnswers[sa].promptId == activityComponent.prompts[p].id) && (studentAnswers[sa].responseId == activityComponent.prompts[p].responses[r].id))
                                        {
                                            studentAnswers[sa].originalGrade = activityComponent.prompts[p].responses[r].value;
                                            studentAnswers[sa].bonusValue = activityComponent.prompts[p].responses[r].bonusValue;
                                            studentAnswers[sa].correct = activityComponent.prompts[p].responses[r].correct;
                                        }
                                        break;
                                    case "SPEAKING":
                                        if (studentAnswers[sa].responseText.length > 0)
                                        {
                                            $("#responseContainer_" + activityComponent.prompts[p].responses[r].id).show();
                                        }
                                        break;
                                    case "WRITING":
                                        if (studentAnswers[sa].responseText.length > 0)
                                        {
                                            $("#responseContainer_" + activityComponent.prompts[p].responses[r].id).show();
                                        }
                                        break;
                                    default:
                                        if (studentAnswers[sa].responseId == activityComponent.prompts[p].responses[r].id)
                                        {
                                            studentAnswers[sa].originalGrade = activityComponent.prompts[p].responses[r].value;
                                            studentAnswers[sa].bonusValue = activityComponent.prompts[p].responses[r].bonusValue;
                                            studentAnswers[sa].correct = activityComponent.prompts[p].responses[r].correct;
                                        }
                                        break;
                                }
                                studentAnswers[sa].latestGrade = studentAnswers[sa].originalGrade;
                            }
                            var studentAnswerCheckedEvent = $.Event("studentAnswerChecked");
                            studentAnswerCheckedEvent.studentAnswerId = studentAnswers[sa].id;
                            studentAnswerCheckedEvent.originalGrade = studentAnswers[sa].originalGrade;
                            studentAnswerCheckedEvent.bonusValue = studentAnswers[sa].bonusValue;
                            studentAnswerCheckedEvent.latestGrade = studentAnswers[sa].latestGrade;
                            $(document).trigger(studentAnswerCheckedEvent);
                            $("#promptFeedbackToolBox_" + activityComponent.prompts[p].id).show();
                        }
                    }
                }
            }
        }
        loadStudentScores(studentAnswers, activityComponent.id);
        loadCheckAnswersSummary();
    }
}

function loadRefreshModuleButton(containerElement)
{
    var buttonMarkup = "<span id=\"refreshModuleBtn\" class=\"activityButton refreshComponentBtn blue\" style=\"display:none; white-space:nowrap; padding: .5em;\"><i class=\"fa fa-refresh\"></i><span> Reset All Answers</span></span>";
    containerElement.append(buttonMarkup);
    $("#refreshModuleBtn").on("click", function ()
    {
        customConfirm("Are you sure you wish to reset all answers?", function ()
        {
            studentAnswers = new Array();
            for (var a = 0; a < module.activities.length; a++)
            {
                for (var ac = 0; ac < module.activities[a].activityComponents.length; ac++)
                {
                    var activityComponent = module.activities[a].activityComponents[ac];
                    refreshActivityComponent(activityComponent);
                    if (activityComponent.componentTitle == "ShortAnswer")
                    {
                        for (var p = 0; p < activityComponent.prompts.length; p++)
                        {
                            if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                            {
                                buildShortAnswerResponseHTML(activityComponent.prompts[p]);
                            }
                        }
                    }
                    else if (activityComponent.componentTitle == "Speaking")
                    {
                        for (var p = 0; p < activityComponent.prompts.length; p++)
                        {
                            if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                            {
                                buildSpeakingResponseHTML(activityComponent.prompts[p]);
                            }
                        }
                    }
                    else if (activityComponent.componentTitle == "Writing")
                    {
                        for (var p = 0; p < activityComponent.prompts.length; p++)
                        {
                            if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                            {
                                buildWritingResponseHTML(activityComponent.prompts[p]);
                            }
                        }
                    }
                }
            }
            $("#moduleSummaryData_" + module.id).html("");
            loadCheckAnswersSummary();

            var studentAnswersRemovedEvent = $.Event("studentAnswersRemoved");
            studentAnswersRemovedEvent.moduleId = module.id;
            studentAnswersRemovedEvent.activityComponentId = 0;
            $(document).trigger(studentAnswersRemovedEvent);

            //SCORM TEST RESET SCORE EVENT
            var moduleScoreResetEvent = $.Event("moduleScoreReset");
            $(document).trigger(moduleScoreResetEvent);
        });
    });
}

function loadRefreshComponentButton(containerElement, activityComponent)
{
    var buttonMarkup = "<div class=\"displayTableCell\" style=\"width:100%;\"><span id=\"refreshComponentBtn_" + activityComponent.id + "\" class=\"activityButton refreshComponentBtn blue\"><i class=\"fa fa-refresh\"></i></span></div>";
    containerElement.append(buttonMarkup);
    $("#refreshComponentBtn_" + activityComponent.id).on("click", function ()
    {
        var sa = studentAnswers.length
        while (sa--)
        {
            if (studentAnswers[sa].activityComponentId == activityComponent.id)
            {
                studentAnswers.splice(sa, 1);
            }
        }
        refreshActivityComponent(activityComponent);
        if (activityComponent.componentTitle == "ShortAnswer")
        {
            for (var p = 0; p < activityComponent.prompts.length; p++)
            {
                if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                {
                    buildShortAnswerResponseHTML(activityComponent.prompts[p]);
                }
            }
        }
        if (activityComponent.componentTitle == "Speaking")
        {
            for (var p = 0; p < activityComponent.prompts.length; p++)
            {
                if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                {
                    buildSpeakingResponseHTML(activityComponent.prompts[p]);
                }
            }
        }
        if (activityComponent.componentTitle == "Writing")
        {
            for (var p = 0; p < activityComponent.prompts.length; p++)
            {
                if ((activityComponent.prompts[p].responses.length > 0) && (activityComponent.prompts[p].responses[0].text != ""))
                {
                    buildWritingResponseHTML(activityComponent.prompts[p]);
                }
            }
        }
        var studentAnswersRemovedEvent = $.Event("studentAnswersRemoved");
        studentAnswersRemovedEvent.moduleId = 0;
        studentAnswersRemovedEvent.activityComponentId = activityComponent.id;
        $(document).trigger(studentAnswersRemovedEvent);
    });
}

function buildShortAnswerResponseHTML(prompt)
{
    if (prompt.responses.length > 0)
    {
        var response = prompt.responses[0];
        var responseHTML = '<div id="responseContainer_' + response.id + '" class="responseContainer shortAnswerFeedbackAreaContainer" style="display: none;">'
        responseHTML += '<div class="displayTable">'//container table
        if (!prompt.renderRTL)
        {
            responseHTML += '<div class="displayTableCell" style="width:2.65em;">&nbsp;</div>'
            responseHTML += '<div class="displayCell" style="width:100%;">'
            responseHTML += '   <div id="shortAnswerSuggestedResponse_' + response.id + '" class="displayTable shortAnswerSuggestedResponse"></div>'
            responseHTML += '</div>';
        }
        else
        {
            responseHTML += '<div class="displayCell" style="width:100%;">'
            responseHTML += '   <div id="shortAnswerSuggestedResponse_' + response.id + '" class="displayTable shortAnswerSuggestedResponse"></div>'
            responseHTML += '</div>'
            responseHTML += '<div class="displayTableCell" style="width:2.65em; ">&nbsp;</div>'
        }
        responseHTML += '</div>'//End Table
        responseHTML += '</div>'
        $("#shortAnswerResponseContainer_" + prompt.id).after(responseHTML)

        var feedbackTableHTML = "<div class=\"displayTableCell shortAnswerSuggestedResponseContent response\" style=\"width:100%;\">";
        if(prompt.feedback.length > 0)
        {
            var feedback = prompt.feedback[0];
            if (feedback.text.length > 0)
            {
                feedbackTableHTML += "  <div class=\"displayTableCell rationalFeedbackBtnCell\">";
                feedbackTableHTML += "      <div title=\"Rationale\" id=\"activityPromptRationaleBtn_" + prompt.id + "\" class=\"rationalFeedbackBtn shortAnswer\" onclick=\"showRationale(" + prompt.id + ");\" style=\"display:inline-block;text-align:center;\"><i class=\"fa fa-commenting\"></i></div>";
                feedbackTableHTML += "      <div id=\"rationaleFeedbackCell_" + prompt.id + "\" style=\"display:none;\">";
                feedbackTableHTML += htmlDecode(feedback.text);
                feedbackTableHTML += "      </div>";
                feedbackTableHTML += "  </div>";
            }
        }
        feedbackTableHTML += "  <div class=\"displayTableCell shortAnswerSuggestedResponseContent\" style=\"width:100%;\">";

        feedbackTableHTML += "<div onclick=\"updateShortAnswerValue(" + prompt.activityComponentId + "," + prompt.id + "," +response.correct+","+ response.value + ","+response.bonusValue+");\" style=\"cursor:pointer;\">" + htmlDecode(response.text) + "</div>";
        if (typeof (response.alternateResponses) != "undefined")
        {
            for (var ar = 0; ar < response.alternateResponses.length; ar++)
            {
                feedbackTableHTML += "      <p>-or-</p>";
                feedbackTableHTML += "<div onclick=\"updateShortAnswerValue(" + prompt.activityComponentId + "," + prompt.id + "," + response.alternateResponses[ar].correct+","+ response.alternateResponses[ar].value + ","+response.alternateResponses[ar].bonusValue+");\" style=\"cursor:pointer;\">" + htmlDecode(response.alternateResponses[ar].text) + "</div>";
            }
        }
        feedbackTableHTML += "  </div>";
        feedbackTableHTML += "</div>";

        $("#shortAnswerSuggestedResponse_" + prompt.responses[0].id).html(feedbackTableHTML);
    }
}

function updateShortAnswerValue(activityComponentId, promptId, correct, value, bonusValue)
{
    for (var sa = 0; sa < studentAnswers.length; sa++)
    {
        if ((studentAnswers[sa].activityComponentId == activityComponentId) && (studentAnswers[sa].promptId == promptId))
        {
            studentAnswers[sa].latestGrade = value;
            studentAnswers[sa].bonusValue = bonusValue;
            studentAnswers[sa].correct = correct;
            loadStudentScores(studentAnswers, activityComponentId);

            var studentAnswerCheckedEvent = $.Event("studentAnswerChecked");
            studentAnswerCheckedEvent.studentAnswerId = studentAnswers[sa].id;
            studentAnswerCheckedEvent.originalGrade = studentAnswers[sa].originalGrade;
            studentAnswerCheckedEvent.bonusValue = studentAnswers[sa].bonusValue;
            studentAnswerCheckedEvent.latestGrade = studentAnswers[sa].latestGrade;
            $(document).trigger(studentAnswerCheckedEvent);
            loadCheckAnswersSummary();
            break;
        }
    }
}

function updateSpeakingValue(activityComponentId, promptId, correct, value, bonusValue)
{
    for (var sa = 0; sa < studentAnswers.length; sa++)
    {
        if ((studentAnswers[sa].activityComponentId == activityComponentId) && (studentAnswers[sa].promptId == promptId))
        {
            studentAnswers[sa].latestGrade = value;
            studentAnswers[sa].bonusValue = bonusValue;
            studentAnswers[sa].correct = correct;
            loadStudentScores(studentAnswers, activityComponentId);

            var studentAnswerCheckedEvent = $.Event("studentAnswerChecked");
            studentAnswerCheckedEvent.studentAnswerId = studentAnswers[sa].id;
            studentAnswerCheckedEvent.originalGrade = studentAnswers[sa].originalGrade;
            studentAnswerCheckedEvent.bonusValue = studentAnswers[sa].bonusValue;
            studentAnswerCheckedEvent.latestGrade = studentAnswers[sa].latestGrade;
            $(document).trigger(studentAnswerCheckedEvent);
            loadCheckAnswersSummary();
            break;
        }
    }
}


function updateWritingValue(activityComponentId, promptId, correct, value, bonusValue)
{
    for (var sa = 0; sa < studentAnswers.length; sa++)
    {
        if ((studentAnswers[sa].activityComponentId == activityComponentId) && (studentAnswers[sa].promptId == promptId))
        {
            studentAnswers[sa].latestGrade = value;
            studentAnswers[sa].bonusValue = bonusValue;
            studentAnswers[sa].correct = correct;
            loadStudentScores(studentAnswers, activityComponentId);

            var studentAnswerCheckedEvent = $.Event("studentAnswerChecked");
            studentAnswerCheckedEvent.studentAnswerId = studentAnswers[sa].id;
            studentAnswerCheckedEvent.originalGrade = studentAnswers[sa].originalGrade;
            studentAnswerCheckedEvent.bonusValue = studentAnswers[sa].bonusValue;
            studentAnswerCheckedEvent.latestGrade = studentAnswers[sa].latestGrade;
            $(document).trigger(studentAnswerCheckedEvent);
            loadCheckAnswersSummary();
            break;
        }
    }
}

function showRationale(promptId)
{
    openCustomDialog("Rationale", $("#rationaleFeedbackCell_" + promptId).html(), "shortAnswer", '<i class="icon ' + suggestedAnswerIcon + '"></i>');
}

function buildSpeakingResponseHTML(prompt)
{
    if (prompt.responses.length > 0)
    {
        var response = prompt.responses[0];
        var responseContainer = $("#responseContainer_" + response.id);
        if (responseContainer.length > 0)
            responseContainer.remove();
        var speakingResponseHTML = '<div id="responseContainer_' + response.id + '" class="responseContainer shortAnswerFeedbackAreaContainer" style="display:none;">';
        speakingResponseHTML += '   <div class="displayTable">';
        speakingResponseHTML += '       <div class="displayTableCell" style="width:2.65em;">&nbsp;</div>';
        speakingResponseHTML += '       <div class="displayCell" style="width:100%;">';
        speakingResponseHTML += '           <div id="speakingSuggestedResponse_' + response.id + '" class="displayTable shortAnswerSuggestedResponse">';
        speakingResponseHTML += '               <div class="displayTableCell shortAnswerSuggestedResponseContent response" style="width:10%;">';
        speakingResponseHTML += '                   <div>';
        speakingResponseHTML += '                       <audio id="speakingSuggestedResponseAudio_' + response.id + '" data-showdownload="false" data-allowloop="false" data-allowpause="true" data-allowplaybackspeed="true" data-autoplay="false" data-limitplays="0" data-showduration="true" data-showplaybacktime="true" data-showseekslider="true" data-showvolumecontrol="true" data-transcript="false" data-transcriptionplayer="false"></audio>';
        speakingResponseHTML += '                   </div>';
        speakingResponseHTML += '               </div>';
        speakingResponseHTML += '               <div class="displayTableCell shortAnswerSuggestedResponseContent" style="width:90%; cursor:pointer;" onclick="updateSpeakingValue(' + prompt.activityComponentId + ',' + prompt.id + ', true,' + response.value + ',' + response.bonusValue +');"></div>';
        speakingResponseHTML += '           </div>';
        speakingResponseHTML += '       </div>';
        speakingResponseHTML += '   </div>';
        speakingResponseHTML += '</div>';
        $("#speakingResponseContainer_" + prompt.id).after(speakingResponseHTML)
        var speakingSuggestedResponseAudio = $("#speakingSuggestedResponseAudio_" + response.id);
        if (speakingSuggestedResponseAudio.length > 0)
        {
            speakingSuggestedResponseAudio.attr("src", response.text);
            setupUcatMedia(speakingSuggestedResponseAudio.parent());
        }        
    }
}


function buildWritingResponseHTML(prompt)
{
    if (prompt.responses.length > 0)
    {
        var response = prompt.responses[0];
        var responseContainer = $("#responseContainer_" + response.id);
        if (responseContainer.length > 0)
            responseContainer.remove();
        var writingResponseHTML = '<div id="responseContainer_' + response.id + '" class="responseContainer shortAnswerFeedbackAreaContainer" style="display:none;">';
        writingResponseHTML += '   <div class="displayTable">';
        writingResponseHTML += '       <div class="displayTableCell" style="width:2.65em;">&nbsp;</div>';
        writingResponseHTML += '       <div class="displayCell" style="width:100%;">';
        writingResponseHTML += '           <div id="writingSuggestedResponse_' + response.id + '" class="displayTable shortAnswerSuggestedResponse" onclick="updateWritingValue(' + prompt.activityComponentId + ',' + prompt.id + ', true,' + response.value + ',' + response.bonusValue + ');"></div>';
        writingResponseHTML += '       </div>';
        writingResponseHTML += '   </div>';
        writingResponseHTML += '</div>';
        $("#writingResponseContainer_" + prompt.id).after(writingResponseHTML)
        var writingSuggestedResponse = $("#writingSuggestedResponse_" + response.id);
        var responseData = $.parseJSON(htmlDecode(prompt.responses[0].text));
        if (!responseData)
        {
            responseData = copyGlobalVariable(defaultCanvas);
        }
        if (writingSuggestedResponse.length > 0)
        {
            writingSuggestedResponse.ucatCanvas({drawTools:false, submit:false}, responseData);
        }
    }
}

function loadCheckAnswersSummary()
{
    var moduleTotal = 0;
    var moduleBonusTotal = 0;
    var displayModuleScore = false;
    for (var i = 0; i < module.activities.length; i++)
    {
        var activity = module.activities[i];
        var displayActivityComponentCount = 0;
        var displayActivityScore = false;
        var activityTotal = 0;
        var activityBonusTotal = 0;
        for (var j = 0; j < activity.activityComponents.length; j++)
        {
            var activityComponent = activity.activityComponents[j];
            var displayActivityComponent = true;
            var displayActivityComponentScore = false;
            var activityComponentTotal = 0;
            var activityComponentBonusTotal = 0;
            for (var k = 0; k < activityComponent.prompts.length; k++)
            {
                var prompt = activityComponent.prompts[k];
                var promptComplete = false;
                var promptTotal = 0;
                var promptScoreSpan = $("#promptScoreSpan_" + prompt.id);
                var promptMaxScore = parseInt(promptScoreSpan.data("maxscore"));
                var promptMaxBonusScore = parseInt(promptScoreSpan.data("maxbonusscore"));
                if (promptScoreSpan.length > 0)
                {
                    promptTotal = parseInt(promptScoreSpan.text());
                    if (!isNaN(promptTotal))
                    {
                        if (promptMaxScore > 0)
                        {
                            activityComponentTotal += promptTotal;
                            activityTotal += promptTotal;
                            moduleTotal += promptTotal;
                        }
                        else if (promptMaxBonusScore > 0)
                        {
                            activityComponentBonusTotal += promptTotal;
                            activityBonusTotal += promptTotal;
                            moduleBonusTotal += promptTotal;
                        }
                        displayActivityComponentScore = true;
                        displayActivityScore = true;
                        displayModuleScore = true;
                    }
                }
            }
            if (displayActivityComponentScore)
            {
                if (activityComponent.maxBonusValue > 0)
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<span id=\"activityComponentBonusScoreTotalSpan_" + activityComponent.id + "\" class=\"score" + ((activityComponentBonusTotal > 0) ? "Correct" : "Incorrect") + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ", " + activityComponent.id + ");\">"+((activityComponentBonusTotal > 0) ? "<i class=\"fa fa-plus\"></i>" : "")+"<span id=\"activityComponentBonusScoreSpan_" + activityComponent.id + "\" style=\"margin-left:0.5em;\">" + activityComponentBonusTotal + "</span></span>");
                else
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<span id=\"activityComponentScoreTotalSpan_" + activityComponent.id + "\" class=\"score" + ((activityComponentTotal >= activityComponent.maxValue) ? "Correct" : ((activityComponentTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ", " + activityComponent.id + ");\"><span id=\"activityComponentScoreSpan_" + activityComponent.id + "\">" + activityComponentTotal + "</span><span>/</span><span id=\"activityComponentMaxScoreSpan_" + activityComponent.id + "\">" + activityComponent.maxValue + "</span></span>");
            }
            else if (displayActivityComponent)
            {
                if (activityComponent.complete)
                {
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<i class=\"fa fa-check\" style=\"color:#4ecf3b; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "','" + activityComponent.id + "');\"></i>");
                }
                else
                {
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<i class=\"fa fa-exclamation-triangle\" style=\"color:#e5882e; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "','" + activityComponent.id + "');\"></i>");
                }
            }
        }
        if (displayActivityScore)
        {
            var activitySummaryData = $("#activitySummaryData_" + activity.id);
            activitySummaryData.html("");
            if (activity.maxValue > 0)
                activitySummaryData.append("<span id=\"activityScoreTotalSpan_" + activity.id + "\" class=\"score" + ((activityTotal >= activity.maxValue) ? "Correct" : ((activityTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ",'" + activityComponent.id + "');\"><span id=\"activityScoreSpan_" + activity.id + "\">" + activityTotal + "</span><span>/</span><span id=\"activityMaxScoreSpan_" + activity.id + "\">" + activity.maxValue + "</span></span>");
            if(activity.maxBonusValue > 0)
                activitySummaryData.append("<span id=\"activityBonusScoreTotalSpan_" + activity.id + "\" class=\"score" + ((activityBonusTotal > 0) ? "Correct" : "Incorrect") + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ",'" + activityComponent.id + "');\">"+((activityBonusTotal > 0) ? "<i class=\"fa fa-plus\"></i>" : "")+"<span id=\"activityBonusScoreSpan_" + activity.id + "\" style=\"margin-left:0.5em;\">" + activityBonusTotal + "</span></span>");
        }
        else if (displayActivityComponentCount > 0)
        {
            if (activity.complete)
                $("#activitySummaryData_" + activity.id).html("<i class=\"fa fa-check\" style=\"color:#4ecf3b; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "');\"></i>");
            else
                $("#activitySummaryData_" + activity.id).html("<i class=\"fa fa-exclamation-triangle\" style=\"color:#e5882e; cursor:pointer;\" onclick=\"goToActivity('" + activity.index + "');\"></i>");
        }
    }
    $("#summaryPanelName").hide();
    $("#summaryFooter").html("<div id=\"checkAnswersFooterDiv\" style=\"text-align:center; margin-top:.5em;\"></div>");
    var checkAnswersFooterDiv = $("#checkAnswersFooterDiv");
    loadRefreshModuleButton(checkAnswersFooterDiv);
    loadModuleCheckAnswersButton(checkAnswersFooterDiv);
    if (displayModuleScore)
    {
        var moduleSummaryData = $("#moduleSummaryData_" + module.id);
        moduleSummaryData.html("");
        if(module.maxValue > 0)
            moduleSummaryData.append("<span id=\"moduleScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan score" + ((moduleTotal >= module.maxValue) ? "Correct" : ((moduleTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\"><span id=\"moduleScoreSpan_" + module.id + "\">" + moduleTotal + "</span><span>/</span><span id=\"moduleMaxScoreSpan_" + module.id + "\">" + module.maxValue + "</span></span>");
        if ((module.maxBonusValue > 0)&&(moduleBonusTotal > 0))
            moduleSummaryData.append("<span id=\"moduleBonusScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan scoreCorrect\"><i class=\"fa fa-plus\"></i><span id=\"moduleBonusScoreSpan_" + module.id + "\" style=\"margin-left:0.5em;\">" + moduleBonusTotal + "</span></span>");
        moduleSummaryData.append("<span style=\"padding-left:.5em\">" + (((moduleTotal + moduleBonusTotal) / (module.maxValue > 0 ? module.maxValue : 1)) * 100).toFixed(2) + "%</span>");
        $("#refreshModuleBtn").css("display", "inline");
    }
    else
    {
        $("#refreshModuleBtn").css("display", "none");
    }

    if (displayModuleScore)
    {
        var checkAnswersSummaryLoadedEvent = $.Event("checkAnswersSummaryLoaded");
        checkAnswersSummaryLoadedEvent.containerElement = checkAnswersFooterDiv;
        checkAnswersSummaryLoadedEvent.moduleTotal = moduleTotal;
        checkAnswersSummaryLoadedEvent.module = module;
        $(document).trigger(checkAnswersSummaryLoadedEvent);
    }
    var genericSummaryLoadedEvent = $.Event("genericSummaryLoaded");
    $(document).trigger(genericSummaryLoadedEvent);
}

function setupSubmitSpeakingButton(containerElement)
{
    var componentTitle = containerElement.attr("data-componenttitle");
    var activityComponentId = containerElement.attr("data-activitycomponentid");
    var promptId = containerElement.attr("data-promptid");
    var responseInputSubmit = $("#responseInputSubmit_" + promptId);

    responseInputSubmit.removeClass("disabled");
    responseInputSubmit.removeClass("btnGrey");
    responseInputSubmit.addClass("btnBlue");
    if (responseInputSubmit.attr("data-dir") == "rtl")
        responseInputSubmit.html('<i class="fa fa-reply"></i> Submit')
    else
        responseInputSubmit.html('<i class="fa fa-share"></i> Submit')

    responseInputSubmit.on("click", function (event)
    {
        if (typeof submitInProgress === 'undefined')
        {//submitInProgress global in recordStudentACtion.js
            submitInProgress = false;
        }
        if (!submitInProgress && !$(this).hasClass("disabled"))
        {
            event.stopPropagation();    // Prevent click from bubbling to the parent click

            containerElement.removeClass("active");
            responseInputSubmit.addClass("disabled");
            responseInputSubmit.addClass("btnGrey");
            responseInputSubmit.removeClass("btnBlue");

            submitStudentAnswerFile(containerElement, file, 0);
        }
    });  
}
$(document).ready(function ()
{    
    $(document).bind("gradingIframeLoaded", function (event) { loadAnswerKey(event.gradingIframe) });
    $(document).bind("navigationTriggered", function (event) { navigateAnswerKey(event); closeTranscriptDialog(); });
    $(document).bind("scoreValueUpdated", function (event) { loadReviewSummary(event); });
    $(document).bind("ucatMediaLoaded", function (event) { loadMediaTranscript(event); });
    $(document).bind("ucatMediaTranscriptClick", function (event) { playMediaTranscript(event); });
    $(document).bind("activityLoaded", function (event) { loadActivityReview(event.containerElement, event.activity); });    
});

var gradingIframe = false;
var gradingIframeWindow = false;

function loadAnswerKey(containerElement)
{
    if($("#iFrameContainer").css("display") != "block"){//Do not load if already loaded.
        gradingIframe = containerElement;
        gradingIframe.attr("src", "AssignmentPreview.aspx?assignmentId=" + assignment.id);
        gradingIframe.unbind("load");
        gradingIframe.load(function ()
        {
            gradingIframeWindow = gradingIframe[0].contentWindow;
            gradingIframeWindow.domainRootPath = domainRootPath;
            gradingIframeWindow.setPreviewNavigation(currentSectionSortKey, currentActivitySortKey);
            gradingIframeWindow.studentAssignment = false;
            gradingIframeWindow.assignment = assignment ? assignment : false;

            gradingIframe.contents().find("[id^='panel_']").each(function ()
            {
                var panel = $(this);
                panel.hide();
            });
            gradingIframe.contents().find("#panel_" + currentActivitySortKey).show();
            gradingIframe.contents().find("#mainNav").remove();//Removed from pop-up
            gradingIframe.contents().find(".footerNav").remove();
            gradingIframe.contents().find(".inlineToolBox").remove();//Removed from pop-up
            gradingIframe.contents().find(".componentInstructions").remove();//Removed from pop-up
            gradingIframe.contents().find(".tabDetails").css("margin", 0);//Removed from pop-up
            gradingIframe.contents().find(".fa-chain-broken").switchClass("fa-chain-broken", "fa-chain")//Fixes wrong icon ion answer key. 
        });
        gradingIframe.on("load",function(){
            $("#iFrameContainer").show();
            resizeGradingPanelIframe()
            $(window).resize(resizeGradingPanelIframe);
        })
    }
}

function resizeGradingPanelIframe(){
    if($("#selectedStudentControls").length == 0){
        //Student review
        var panelHeight = $("#id_frameworkCol_3").outerHeight();
        var panelHeaderHeight = $("#id_sideBarHeaderWrapper").outerHeight();
        var remianingHeight = panelHeight - panelHeaderHeight;
        $("#iFrameContainer").css("height", remianingHeight + "px");
    } else {
        //Teacher/Proctor Review
        var panelHeight = $("#id_frameworkCol_3").outerHeight();
        var panelHeaderHeight = $("#id_sideBarHeaderWrapper").outerHeight();
        var selectedStudentHeight = $("#selectedStudentControls").outerHeight();
        var remianingHeight = panelHeight - panelHeaderHeight - selectedStudentHeight - em(2);//2em for extra insurance
        $("#gradingIframe").css("height", remianingHeight + "px");
    }
}

function navigateAnswerKey(event)
{
    gradingIframe = $("#gradingIframe");
    if (gradingIframe && gradingIframe.length > 0)
    {
        gradingIframe.contents().find("[id^='panel_']").each(function ()
        {
            var panel = $(this);
            panel.hide();
        });
        gradingIframe.contents().find("#panel_" + event.activitySortKey).show();
    }
}

function loadReviewSummary()
{
    var moduleTotal = 0;
    var moduleBonusTotal = 0;
    for (var i = 0; i < module.activities.length; i++)
    {
        var activity = module.activities[i];
        var activityTotal = 0;
        var activityBonusTotal = 0;
        var displayActivityComponentCount = 0;
        for (var j = 0; j < activity.activityComponents.length; j++)
        {
            var activityComponent = activity.activityComponents[j];
            var activityComponentComplete = false;
            var activityComponentTotal = 0;
            var activityComponentBonusTotal = 0;
            var displayActivityComponent = true;
            var displayActivityComponent = true;
            if (isComponentJudged(activityComponent))
            {
                displayActivityComponent = true;
                displayActivityComponentCount++;
            }
            else
                displayActivityComponent = false;
            for (var k = 0; k < activityComponent.prompts.length; k++)
            {
                var prompt = activityComponent.prompts[k];
                if (isComponentJudged(activityComponent))
                {
                    displayActivityComponentCount++;
                }
                else
                {
                    displayActivityComponent = false;
                }
                var promptValue = parseFloat($("#promptScoreSpan_" + prompt.id).text());
                if (!isNaN(promptValue))
                {
                    var promptTotal = activityComponent.bonusPoints ? 0 : promptValue;
                    var promptBonusTotal = activityComponent.bonusPoints ? promptValue : 0;
                    activityComponentTotal += promptTotal;
                    activityComponentBonusTotal += promptBonusTotal;
                }
            }
            if (displayActivityComponent)
            {
                if (activityComponent.bonusPoints)
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<span id=\"activityComponentBonusScoreTotalSpan_" + activityComponent.id + "\" class=\"scoreCorrect\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ", " + activityComponent.id + ");\"><i class=\"fa fa-plus\"></i><span id=\"activityComponentBonusScoreSpan_" + activityComponent.id + "\" style=\"margin-left:0.5em;\">" + activityComponentBonusTotal + "</span></span>");
                else
                    $("#activityComponentSummaryData_" + activityComponent.id).html("<span id=\"activityComponentScoreTotalSpan_" + activityComponent.id + "\" class=\"score" + ((activityComponentTotal >= activityComponent.maxValue) ? "Correct" : ((activityComponentTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ", " + activityComponent.id + ");\"><span id=\"activityComponentScoreSpan_" + activityComponent.id + "\">" + activityComponentTotal + "</span><span>/</span><span id=\"activityComponentMaxScoreSpan_" + activityComponent.id + "\">" + activityComponent.maxValue + "</span></span>");
                activityTotal += activityComponentTotal;
                activityBonusTotal += activityComponentBonusTotal;
            }
        }
        if (displayActivityComponentCount > 0)
        {
            var activitySummaryData = $("#activitySummaryData_" + activity.id);
            activitySummaryData.html("");
            if (activityTotal > 0)
                activitySummaryData.append("<span id=\"activityScoreTotalSpan_" + activity.id + "\" class=\"score" + ((activityTotal >= activity.maxValue) ? "Correct" : ((activityTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ",'" + activityComponent.id + "');\"><span id=\"activityScoreSpan_" + activity.id + "\">" + activityTotal + "</span><span>/</span><span id=\"activityMaxScoreSpan_" + activity.id + "\">" + activity.maxValue + "</span></span>");
            if (activityBonusTotal > 0)
                activitySummaryData.append("<span id=\"activityBonusScoreTotalSpan_" + activity.id + "\" class=\"scoreCorrect\" style=\"cursor:pointer;\" onclick=\"goToActivity(" + activity.index + ",'" + activityComponent.id + "');\"><i class=\"fa fa-plus\"></i><span id=\"activityBonusScoreSpan_" + activity.id + "\" style=\"margin-left:0.5em;\">" + activityBonusTotal + "</span></span>");
            moduleTotal += activityTotal;
            moduleBonusTotal += activityBonusTotal;
        }
    }
    var moduleSummaryData = $("#moduleSummaryData_" + module.id);
    moduleSummaryData.html("");
    if (moduleTotal > 0)
        moduleSummaryData.append("<span id=\"moduleScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan score" + ((moduleTotal >= module.maxValue) ? "Correct" : ((moduleTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\"><span id=\"moduleScoreSpan_" + module.id + "\">" + moduleTotal + "</span><span>/</span><span id=\"moduleMaxScoreSpan_" + module.id + "\">" + module.maxValue + "</span></span>");
    if (moduleBonusTotal > 0)
        moduleSummaryData.append("<span id=\"moduleBonusScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan scoreCorrect\"><i class=\"fa fa-plus\"></i><span id=\"moduleBonusScoreSpan_" + module.id + "\" style=\"margin-left:0.5em;\">" + moduleBonusTotal + "</span></span>");
    moduleSummaryData.append("<span style=\"padding-left:.5em\">" + (((moduleTotal + moduleBonusTotal) / (module.maxValue > 0 ? module.maxValue : 1)) * 100).toFixed(2) + "%</span>");
    var genericSummaryLoadedEvent = $.Event("genericSummaryLoaded");
    $(document).trigger(genericSummaryLoadedEvent);
}

function loadReviewSequenceSummary(mArray, caArray, gpvArray, sAnswers)
{
    var sequenceTotal = 0;
    var sequenceBonusTotal = 0;
    var sequenceMax = 0;
    for (var m = 0; m < mArray.length; m++)
    {
        var moduleTotal = 0;
        var moduleBonusTotal = 0;
        var moduleMax = 0;
        var module = mArray[m];
        var cAnswers = caArray[m];
        var gpv = gpvArray[m];
        for (var g = 0; g < gpv.length; g++)
        {
            if ((gpv[g].value > 0) && (gpv[g].moduleId = module.id) && (gpv[g].parentResponseId == 0))
                moduleMax += gpv[g].value;
        }
        for (var a = 0; a < module.activities.length; a++)
        {
            for (var ac = 0; ac < module.activities[a].activityComponents.length; ac++)
            {
                for (var p = 0; p < module.activities[a].activityComponents[ac].prompts.length; p++)
                {
                    var promptTotal = 0;
                    var promptBonusTotal = 0;
                    for (var s = 0; s < sAnswers.length; s++)
                    {
                        if (sAnswers[s].promptId == module.activities[a].activityComponents[ac].prompts[p].id)
                        {
                            promptTotal += sAnswers[s].latestGrade;
                            promptBonusTotal += sAnswers[s].bonusValue;
                        }
                    }
                    if (promptTotal < 0)
                        promptTotal = 0;
                    if (promptBonusTotal < 0)
                        promptBonusTotal = 0;
                    moduleTotal += promptTotal;
                    moduleBonusTotal += promptBonusTotal;
                }
            }
        }
        var sequenceModuleSummaryData = $("#sequenceModuleSummaryData_" + module.id);
        sequenceModuleSummaryData.html("");
        if(moduleTotal > 0)
            sequenceModuleSummaryData.append("<span id=\"sequenceModuleScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan score" + ((moduleTotal >= moduleMax) ? "Correct" : ((moduleTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\" style=\"cursor:pointer;\" onclick=\"goToSection(" + m + "," + (module.activities.length + 1) + ");\"><span id=\"sequenceModuleScoreSpan_" + module.id + "\">" + moduleTotal + "</span><span>/</span><span id=\"sequenceModuleMaxScoreSpan_" + module.id + "\">" + moduleMax + "</span></span>");
        if (moduleBonusTotal > 0)
            sequenceModuleSummaryData.append("<span id=\"sequenceModuleBonusScoreTotalSpan_" + module.id + "\" class=\"moduleScoreTotalSpan scoreCorrect\" style=\"cursor:pointer;\" onclick=\"goToSection(" + m + "," + (module.activities.length + 1) + ");\"><span id=\"sequenceModuleBonusScoreSpan_" + module.id + "\"><i class=\"fa fa-plus\"></i> " + moduleBonusTotal + "</span></span>");

        sequenceTotal += moduleTotal;
        sequenceBonusTotal += moduleBonusTotal;
        sequenceMax += moduleMax;
    }
    var sequenceSummaryData = $("#sequenceSummaryData");
    sequenceSummaryData.html("");
    if(sequenceTotal > 0)
        sequenceSummaryData.append("<span id=\"sequenceScoreTotalSpan\" class=\"moduleScoreTotalSpan score" + ((sequenceTotal >= sequenceMax) ? "Correct" : ((sequenceTotal > 0) ? "PartiallyCorrect" : "Incorrect")) + "\"><span id=\"sequenceScoreSpan\">" + sequenceTotal + "</span><span>/</span><span id=\"sequenceMaxScoreSpan\">" + sequenceMax + "</span></span>");
    if (sequenceBonusTotal > 0)
        sequenceSummaryData.append("<span id=\"sequenceBonusScoreTotalSpan\" class=\"moduleScoreTotalSpan scoreCorrect\"><span id=\"sequenceScoreSpan\">" + sequenceBonusTotal + "</span></span>");
    sequenceSummaryData.append("</span><span style=\"padding-left:.5em\">" + (((sequenceTotal + sequenceBonusTotal) / sequenceMax) * 100).toFixed(2) + "%</span>");
    $("#id_headerNavName").html(studentAssignment.studentName).css("background", "#4ab6f6");
    $("#summaryPanelName").html(studentAssignment.studentName).css("background", "#4ab6f6");
}

function loadMediaTranscript(event)
{
    var resource = false;
    var src = event.currentPlayer.src;
    for (var i = 0; i < module.resources.length; i++)
    {
        if ((module.resources[i].sourceFilePath == src) && (module.resources[i].transcripts) && (module.resources[i].transcripts.length > 0))
        {
            resource = module.resources[i];
            event.currentPlayer.resource = resource;
        }
    }
    if ((resource) && (event.currentPlayer.transcriptionButton))
        event.currentPlayer.transcriptionButton.show();
}


function playMediaTranscript(event)
{
    if (event.currentPlayer.resource)
        openTranscriptDialog(event.currentPlayer.resource);
}

var transcriptDialog;
var transcriptViewMode = 1;

function openTranscriptDialog(resource)
{
    transcriptViewMode = 1;
    transcriptDialog = $("#transcriptDialog");
    if (transcriptDialog.length <= 0)
    {
        $("#ancillary").append("<div id=\"transcriptDialog\" class=\"transcriptDialogWindow\" title=\"Transcript\"></div>");
        transcriptDialog = $("#transcriptDialog");
    }
    var translationColumn = false;
    var translationLanguage = "";
    for (var i = 0; i < resource.transcripts.length; i++)
    {
        if (resource.transcripts[i].translations.length > 0)
        {
            translationColumn = true;
            translationLanguage = resource.transcripts[i].translations[0].languageTitle;
        }
    }
    var transcriptHTML = "";

    if (translationColumn == true)
    {
        transcriptHTML += "    <div class=\"btnGrey interfaceVertMargin1em\" onclick=\"toggleTranscriptTranslation();\">";
        transcriptHTML += "        <span>Toggle Transcript/Translation</span>";
        transcriptHTML += "    </div>";
    }

    transcriptHTML += "<div class=\"transcriptionContainer color_LtYellow grayBorder\">";
    transcriptHTML += " <div class=\"boxes\">";
    transcriptHTML += "     <div id=\"transcriptHeader\" class=\"box transcriptionHeader textAlignCenter" + ((translationColumn) ? " interfaceWidthHalf" : "") + "\">Transcript</div>";
    if (translationColumn)
    {
        transcriptHTML += "     <div id=\"transcriptHeaderBuffer\" class=\"interfacePaddingRight\" style=\"display:none;\"></div>";
        transcriptHTML += "     <div id=\"translationHeader\" class=\"box transcriptionHeader textAlignCenter interfaceWidthHalf\" style=\"display:none;\">Translation</div>";
    }
    transcriptHTML += " </div>";
    transcriptHTML += " <div class=\"boxes\">";
    for (var i = 0; i < resource.transcripts.length; i++)
    {
        transcriptHTML += "     <div class=\"boxRow\">";
        transcriptHTML += "         <div id=\"transcriptText_" + resource.transcripts[i].id + "\" class=\"transcriptText box importModuleFilter transcriptionTextField" + ((translationColumn) ? " interfaceWidthHalf" : "") + " transcriptionRowBottomBorder\">" + htmlDecode(resource.transcripts[i].text) + "</div>";
        transcriptHTML += "         <div id=\"translationBuffer_" + resource.transcripts[i].id + "\" class=\"translationBuffer box interfacePaddingRight transcriptionRowBottomBorder\" style=\"display:none;\"></div>";
        transcriptHTML += "         <div id=\"translationText_" + resource.transcripts[i].id + "\" class=\"translationText box importModuleFilter interfaceWidthHalf transcriptionTextField transcriptionRowBottomBorder\" style=\"display:none;\">" + ((resource.transcripts[i].translations.length > 0) ? htmlDecode(resource.transcripts[i].translations[0].text) : "") + "</div>";
        transcriptHTML += "     </div>";//end boxRow
    }

    transcriptHTML += " </div>";//end boxes
    transcriptHTML += "</div>";
    var iconHTML = '<i class="icon fa fa-language"></i>'
    openCustomDialog("Transcript", transcriptHTML, "Transcript", iconHTML, "70%")
    //transcriptDialog.html(transcriptHTML);
    //transcriptDialog.dialog({ width: "75%" });
}

function closeTranscriptDialog()
{
    if (typeof (transcriptDialog) == "undefined")
        transcriptDialog = $("#transcriptDialog");
    if (transcriptDialog.length > 0)
    {
        ucatDialogClose();
    }
}

function toggleTranscriptTranslation()
{
    transcriptViewMode++;
    switch (transcriptViewMode)
    {
        case 1:
            //Show Transcript / Hide Translation
            $("#transcriptHeader").show();
            $("#transcriptHeaderBuffer").hide();
            $("#translationHeader").hide();
            $(".transcriptText").removeClass("interfaceWidthHalf").show();
            $(".translationBuffer").hide();
            $(".translationText").hide();
            break;
        case 2:
            //Hide Transcription / Show Translation
            $("#transcriptHeader").hide();
            $("#transcriptHeaderBuffer").hide();
            $("#translationHeader").show();
            $(".transcriptText").hide();
            $(".translationBuffer").hide();
            $(".translationText").show();
            break;
        case 3:
            //Show Transcription / Show Translation
            $("#transcriptHeader").show();
            $("#transcriptHeaderBuffer").show();
            $("#translationHeader").show();
            $(".transcriptText").addClass("interfaceWidthHalf").show();
            $(".translationBuffer").show();
            $(".translationText").show();
            transcriptViewMode = 0;
            break;
        default:
            transcriptViewMode = 0;
            break;
    }
}

function loadActivityReview(containerElement, activity)
{
    //Activity behavior additions
    if (activity.behaviorType > 0)
    {
        var behaviorOptionsHTML = '';
        //Need to not display this information if student is in-progress
        //Hide if in-progress

        var activityReviewHTML = '<div id="activityBehaviorSummary_'+activity.id+'">';
        activityReviewHTML += '<div id="activityBehaviorHelp_' + activity.id + '">';//Inline help
        activityReviewHTML += '</div>';//end help
        //End Hide if in-progress

        activityReviewHTML += '<div class="displayTable">'
        activityReviewHTML += '<div class="displayTableRow">';
        activityReviewHTML += '<div class="displayTableCell">'
        activityReviewHTML += '<div class="hiddenPanelIndicatorIcon">';
        activityReviewHTML += '<i class="fa fa-diamond"></i>';
        activityReviewHTML += '</div>';
        activityReviewHTML += '</div>';//end cell
        //Activity Summary
        activityReviewHTML += '<div class="displayTableCell">'
        activityReviewHTML += '<div><span style="font-weight:600;">Type:</span> <span>' + behaviorTypes[activity.behaviorType].displayTitle + '</span></div>';

        switch (activity.behaviorType)
        {
            case 1:
                activityReviewHTML += '<div><span style="font-weight:600;">Trigger:</span> <span>Show this activity if time elapsed is greater than ' + parseInt(activity.behaviorTrigger / 60000) + ' Minute' + (activity.behaviorTrigger == 1 ? "" : "s")+'</span></div>';
                break;
            case 2:
                activityReviewHTML += '<div><span style="font-weight:600;">Trigger:</span> <span>Manually shown by Proctor using the Trigger Activity button.</span></div>';
                break;
            case 3:
                activityReviewHTML += '<div><span style="font-weight:600;">Trigger:</span> <span>Show this activity after ' + behaviorTypes[activity.behaviorType].options[activity.behaviorTrigger].title + '</span></div>';
                break;
        }
        activityReviewHTML += '</div>';//end cell
        activityReviewHTML += '</div>';//end row

        if (typeof(studentAssignment) != "undefined" && studentAssignment && studentAssignment.sessionState && studentAssignment.sessionState.activityTriggers)
        {
            for (var at = 0; at < studentAssignment.sessionState.activityTriggers.length; at++)
            {
                if (studentAssignment.sessionState.activityTriggers[at].activityId == activity.id)
                {
                    activity.activityTrigger = studentAssignment.sessionState.activityTriggers[at];
                    activityReviewHTML += '<div class="displayTableRow" style="margin-top:1em;">';
                    activityReviewHTML += '<div class="displayTableCell"></div>'
                    activityReviewHTML += '<div class="displayTableCell">'
                    activityReviewHTML += '<div><span style="font-weight:600;">Triggered:</span> <span>' + (activity.activityTrigger.triggerDate == false ? "Not Yet" : new Date(activity.activityTrigger.triggerDate).toLocaleString()) + '</span></div>';
                    activityReviewHTML += '<div><span style="font-weight:600;">Completed:</span> <span>' + (activity.activityTrigger.completeDate == false ? "Not Yet" : new Date(activity.activityTrigger.completeDate).toLocaleString()) + '</span></div>';
                    activityReviewHTML += '</div>';//end cell
                    activityReviewHTML += '</div>';//end row
                }
            }
        }
        activityReviewHTML += '</div>'//End Table
        activityReviewHTML += '</div>'
        containerElement.prepend(activityReviewHTML);

        var helpDescription = "Activity Behaviors will not display as part of the default navigation. Instead, the activity will be hidden from the classroom until conditions are met or triggered by a proctor."
        addContextualHelp("activityBehaviorHelp_" + activity.id, helpDescription, "append");

        var hiddenActivitySummaryLoadedEvent = $.Event("hiddenActivitySummaryLoaded");
        hiddenActivitySummaryLoadedEvent.activity = activity;
        hiddenActivitySummaryLoadedEvent.containerElement = $("#activityBehaviorSummary_" + activity.id);
        $(document).trigger(hiddenActivitySummaryLoadedEvent);
    }
}
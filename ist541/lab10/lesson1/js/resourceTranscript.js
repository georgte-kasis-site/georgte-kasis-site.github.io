var ResourceTranscriptRenderModeLayouts = ["Presentation Only", "Show Transcript/Student Translates", "Do Not Show Transcript/StudentTranslates", "ShowTranslation/StudentTranscribes", "Do Not Show Translation/Student Transcribes"];

function loadResourceTranscriptActivityComponent(containerElement, activityComponent)
{
    if (typeof (activityComponent.renderModeLayout) == "undefined")
        activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    var promptTabs = (activityComponent.promptsPerPage > 0);
    if (activityComponent.randomizePrompts)
        shuffle(activityComponent.prompts);

    if (activityComponent.instructions.length > 0)
    {
        loadGenericInstructions(containerElement, activityComponent);
    }

    if (promptTabs)
        loadComponentTabBar(containerElement, activityComponent);

    var renderRTL = activityComponent.renderRTL;
    var tabDetailsHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails transcriptionDetails " + (promptTabs > 0 ? "tabDetailsWithTabs" : "") + "\"></div>";
    containerElement.append(tabDetailsHTML);

    var tabDetails = $("#tabDetails_" + activityComponent.id);

    tabDetails.append(generateActivityComponentPresentationHTML(activityComponent));


    for (var p = 0; p < activityComponent.prompts.length; p++)
    {
        var prompt = activityComponent.prompts[p];
        var promptDivHTML = '<div id="promptDiv_' + prompt.id +'" class="transcriptionDetails">';
        promptDivHTML += '<div id="promptFeedbackToolBox_' + prompt.id + '" class="inlineToolBox" style="display:none;"></div>';
        promptDivHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell" style="float:right;"></div>';
        promptDivHTML += '<div id="promptTranscriptionDetailsDiv_'+prompt.id+'"></div>';
        promptDivHTML += '</div>';


        tabDetails.append(promptDivHTML);
        var promptTranscriptionDetailsDiv = $("#promptTranscriptionDetailsDiv_" + prompt.id);
        var resource = false;
        if (activityComponent.prompts[p].resources.length == 1)
        {
            resource = getResource(activityComponent.prompts[p].resources[0].id);

            var renderModeConfig = getResourceTranscriptRenderModeSettings(activityComponent);
            loadTranscriptComponent(promptTranscriptionDetailsDiv, resource, renderModeConfig);
            if (renderModeConfig.studentTranscribes || renderModeConfig.studentTranslates)
            {
                var classSelector = "";
                if (renderModeConfig.studentTranslates)
                    classSelector = ".paragraphCell.translationCell";
                else if (renderModeConfig.studentTranscribes)
                    classSelector = ".paragraphCell.transcriptCell";
                promptTranscriptionDetailsDiv.find(classSelector).each(function ()
                {
                    var studentAnswerCell = $(this);
                    var idPrefix = studentAnswerCell.attr("id");
                    var idPrefixArr = idPrefix.split("_");
                    var index = parseInt(idPrefixArr[idPrefixArr.length - 1]);
                    if (index < prompt.responses.length)
                    {
                        var response = prompt.responses[index];
                        var rtl = response.rtl;
                        var translation = studentAnswerCell.hasClass("translationCell");
                        var transcript = studentAnswerCell.hasClass("transcriptCell");
                        var resourceTranscriptStudentAnswerHTML = '<span id="response_' + prompt.id + '_' + (index + 1) + '" class="blank" style="width:100%; text-align:' + (rtl ? "right" : "left") + ';" dir="' + (rtl ? "rtl" : "ltr") + '" data-rtl="' + (rtl ? "true" : "false") + '"></span>';
                        studentAnswerCell.html(resourceTranscriptStudentAnswerHTML);
                        var resourceTranscriptStudentAnswer = $("#response_" + prompt.id + "_" + (index+1));
                        resourceTranscriptStudentAnswer.data("rtl", rtl);
                        resourceTranscriptStudentAnswer.data("index", (index+1));
                        resourceTranscriptStudentAnswer.data("responseId", response.id);
                        resourceTranscriptStudentAnswer.data("transcript", transcript);
                        resourceTranscriptStudentAnswer.data("translation", translation);
                        if (resource.transcriptText && resource.transcriptText.paragraphs && index < resource.transcriptText.paragraphs.length)
                        {
                            if (renderModeConfig.studentTranslates)
                                resource.transcriptText.paragraphs[index].translationText = "**********";
                            else if (renderModeConfig.studentTranscribes)
                                resource.transcriptText.paragraphs[index].transcriptText = "**********";
                        }
                    }
                });
            }
        }
        var promptLoadedEvent = $.Event("promptLoaded");
        promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
        promptLoadedEvent.prompt = prompt;
        $(document).trigger(promptLoadedEvent);
    }

    if (promptTabs)
    {
        openFirstTab(activityComponent);
    }
}

function getResourceTranscriptRenderModeSettings(activityComponent)
{
    activityComponent.renderModeIndex = getRenderModeLayoutIndex(activityComponent);
    var isRtl = activityComponent.renderRTL;
    var studentTranslates = false;
    var studentTranscribes = false;
    var showTranslation = true;
    var showTranscription = true;
    var showTranscriptHighlightBtn = true;
    var showTranslationHighlightBtn = true;
    switch (activityComponent.renderModeIndex)
    {
        case 1:
            //Show Transcript/Student Translates
            showTranscription = true
            studentTranslates = true;
            showTranscriptHighlightBtn = true;
            showTranslationHighlightBtn = false;
            break;
        case 2:
            //Do Not Show Transcript/StudentTranslates
            showTranscription = false;
            studentTranslates = true;
            showTranscriptHighlightBtn = false;
            showTranslationHighlightBtn = false;
            break;
        case 3:
            //ShowTranslation/StudentTranscribes
            showTranslation = true;
            studentTranscribes = true;
            showTranscriptHighlightBtn = false;
            showTranslationHighlightBtn = true;
            break;
        case 4:
            //Do Not Show Translation/Student Transcribes
            showTranslation = false;
            studentTranscribes = true;
            showTranscriptHighlightBtn = false;
            showTranslationHighlightBtn = false;
            break;
        default:
            //Presentation Only
            break;
    }
    return {"isRtl": isRtl, "showTranscription": showTranscription, "showTranslation": showTranslation, "studentTranscribes": studentTranscribes, "studentTranslates": studentTranslates, "showTranscriptHighlightBtn": showTranscriptHighlightBtn, "showTranslationHighlightBtn": showTranslationHighlightBtn};
}
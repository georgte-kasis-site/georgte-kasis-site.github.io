//$Rev$ - $LastChangedDate$
var transcriptionRenderModeLayouts = ["default", "dialog"];

function loadTranscriptionActivityComponent(containerElement, activityComponent)
{
    var promptTabs = (activityComponent.promptsPerPage > 0);

    if (activityComponent.randomizePrompts)
        shuffle(activityComponent.prompts);

    if (activityComponent.instructions.length > 0)
        loadGenericInstructions(containerElement, activityComponent);

    if (promptTabs)
        loadComponentTabBar(containerElement, activityComponent);

    var renderRTL = activityComponent.renderRTL;
    var tabDetailsHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails transcriptionDetails " + (promptTabs > 0 ? "tabDetailsWithTabs" : "") + "\"></div>";
    containerElement.append(tabDetailsHTML);

    var tabDetails = $("#tabDetails_" + activityComponent.id);

    tabDetails.append(generateActivityComponentPresentationHTML(activityComponent));

    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        activityComponent.prompts[i].promptIndex = i;
        loadPrompt(tabDetails, activityComponent, activityComponent.prompts[i]);
    }

    if (promptTabs)
        openFirstTab(activityComponent);
}

function loadTranscriptionPrompt(containerElement, activityComponent, prompt)
{
    var resource = false;
    var renderModeLayoutIndex = getRenderModeLayoutIndex(activityComponent);
    if (prompt.resources && prompt.resources.length > 0)
    {
        for (var i = 0; i < prompt.resources.length; i++)
        {
            if (renderModeLayoutIndex == 1 && prompt.sortKey > 1)
            {
                break;
            }
            resource = prompt.resources[i];
        }
    }
    var transcriptionPromptHTML = "<div class=\"tabDetail\">";
    transcriptionPromptHTML += "<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";
    transcriptionPromptHTML += "    <div id=\"prompt_" + prompt.id + "\" class=\"prompt displayTable\">";
    if (!activityComponent.renderRTL)
    {
        transcriptionPromptHTML += "        <span id=\"promptFeedbackContainer_"+prompt.id+"\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\"></span>";
        transcriptionPromptHTML += "        <div id=\"responsesContainer_" + prompt.id + "\" class=\"displayTableCell responseContainer\">";
        if (resource)
            transcriptionPromptHTML += "            <div id=\"transcriptionPlayerContainer_" + prompt.id + "\" class=\"transcriptionPlayerContainer\"><audio id=\"transcriptionAudio_" + prompt.id + "\" src=\"" + resource.sourceFilePath + "\" data-containerid=\"responsesContainer_" + prompt.id + "\"></audio></div>";
        transcriptionPromptHTML += "            <div>";
        transcriptionPromptHTML += htmlDecode(prompt.text);
        transcriptionPromptHTML += "            </div>";
        transcriptionPromptHTML += "        </div>";
        transcriptionPromptHTML += '        <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    else
    {
        transcriptionPromptHTML += '        <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        transcriptionPromptHTML += "        <div id=\"responsesContainer_" + prompt.id + "\" class=\"displayTableCell responseContainer\">";
        if (resource)
            transcriptionPromptHTML += "            <div id=\"transcriptionPlayerContainer_" + prompt.id + "\" class=\"transcriptionPlayerContainer\"><audio id=\"transcriptionAudio_" + prompt.id + "\" src=\"" + resource.sourceFilePath + "\" data-containerid=\"responsesContainer_" + prompt.id + "\"></audio></div>";
        transcriptionPromptHTML += "            <div>";
        transcriptionPromptHTML += htmlDecode(prompt.text);
        transcriptionPromptHTML += "            </div>";
        transcriptionPromptHTML += "        </div>";
        transcriptionPromptHTML += "        <span id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\"></span>";
    }
    transcriptionPromptHTML += "    </div>";
    transcriptionPromptHTML += "</div>";
    containerElement.append(transcriptionPromptHTML);

    if (resource)
    {
        var transcriptionAudio = $("#transcriptionAudio_" + prompt.id);
        transcriptionAudio.attr("data-allowloop", resource.jsonData.allowloop);
        transcriptionAudio.attr("data-allowpause", resource.jsonData.allowpause);
        transcriptionAudio.attr("data-allowplaybackspeed", resource.jsonData.allowplaybackspeed);
        transcriptionAudio.attr("data-autoplay", resource.jsonData.autoplay);
        transcriptionAudio.attr("data-limitplays", resource.jsonData.limitplays);
        transcriptionAudio.attr("data-showduration", resource.jsonData.showduration);
        transcriptionAudio.attr("data-showplaybacktime", resource.jsonData.showplaybacktime);
        transcriptionAudio.attr("data-showseekslider", resource.jsonData.showseekslider);
        transcriptionAudio.attr("data-showvolumecontrol", resource.jsonData.showvolumecontrol);
        transcriptionAudio.attr("data-transcript", resource.jsonData.transcript);
        transcriptionAudio.attr("data-transcriptionplayer", resource.jsonData.transcriptionplayer);
    }

    $("#prompt_"+prompt.id).find(".blank").each(function (index)
    {
        index += 1;
        var responseElement = $(this);
        responseElement.css("width", "5em");
        responseElement.html("&nbsp;");
        responseElement.attr("id", "response_" + prompt.id + "_" + index);
    });
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

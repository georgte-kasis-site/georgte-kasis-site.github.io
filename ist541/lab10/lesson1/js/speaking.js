function loadSpeakingPrompt(containerElement, activityComponent, prompt)
{
    var speakingPromptHTML = "<div class=\"tabDetail shortAnswerDetails\" " + (prompt.promptTabs ? "style=\"display:none;\"" : "") + " >";
    speakingPromptHTML += "  <div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";
    speakingPromptHTML += "  <div class=\"speakingPromptContainer\">";
    speakingPromptHTML += "      <div id=\"prompt_" + prompt.id + "\" class=\"prompt displayTable\">";

    if (!prompt.renderRTL)
    {
        speakingPromptHTML += '<div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top; text-align:center;">&nbsp;</div>';
        speakingPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        speakingPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    else
    {
        speakingPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        speakingPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        speakingPromptHTML += '<div  id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top;">&nbsp;</div>';
    }

    speakingPromptHTML += "      </div>";
    speakingPromptHTML += "  </div>";
    var response = prompt.responses[0];
    if (response)
    {
        response.componentTitle = activityComponent.componentTitle;
        //BEGIN STUDENT RESPONSE AREA
        speakingPromptHTML += '<div id="speakingResponseContainer_' + prompt.id + '" class="shortAnswerResponseContainer">';
        speakingPromptHTML += '<div class="displayTable">';

        if (!prompt.renderRTL)
            speakingPromptHTML += '<div id="speakingResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>'

        //STUDENT ANSWER AREA
        speakingPromptHTML += '<div class="displayTableCell" style="width:100%;">'
        speakingPromptHTML += '<div id="speakingResponseContent_' + prompt.id + '" data-componenttitle="' + activityComponent.componentTitle + '" data-activitycomponentid="' + activityComponent.id + '" data-promptid="' + prompt.id + ' "data-responseid="' + response.id +'"></div>';
        speakingPromptHTML += '</div>'
        if (prompt.renderRTL)
            speakingPromptHTML += '<div id="speakingResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>';
        speakingPromptHTML += '</div>' //displayTable
        speakingPromptHTML += '</div>' //END speakingResponseContainer
        //END STUDENT RESPONSE AREA
    }
    speakingPromptHTML += "</div>";
    containerElement.append(speakingPromptHTML);
    if (prompt.recorder)
        $("#speakingResponseContent_" + prompt.id).ucatRecorder(prompt.recorder);

    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

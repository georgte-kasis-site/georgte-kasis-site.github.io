function loadWritingPrompt(containerElement, activityComponent, prompt)
{
    var writingPromptHTML = "<div class=\"tabDetail shortAnswerDetails\" " + (prompt.promptTabs ? "style=\"display:none;\"" : "") + " >";
    writingPromptHTML += "  <div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";
    writingPromptHTML += "  <div class=\"writingPromptContainer\">";
    writingPromptHTML += "      <div id=\"prompt_" + prompt.id + "\" class=\"prompt displayTable\">";

    if (!prompt.renderRTL)
    {
        writingPromptHTML += '<div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top; text-align:center;">&nbsp;</div>';
        writingPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        writingPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    else
    {
        writingPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        writingPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        writingPromptHTML += '<div  id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top;">&nbsp;</div>';
    }

    writingPromptHTML += "      </div>";
    writingPromptHTML += "  </div>";
    var response = prompt.responses[0];
    if (response)
    {
        response.componentTitle = activityComponent.componentTitle;
        //BEGIN STUDENT RESPONSE AREA
        writingPromptHTML += '<div id="writingResponseContainer_' + prompt.id + '" class="shortAnswerResponseContainer">';
        writingPromptHTML += '<div class="displayTable">';

        if (!prompt.renderRTL)
            writingPromptHTML += '<div id="writingResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>'

        //STUDENT ANSWER AREA
        writingPromptHTML += '<div class="displayTableCell" style="width:100%;">'
        writingPromptHTML += '<div id="writingResponseContent_' + prompt.id + '" data-componenttitle="' + activityComponent.componentTitle + '" data-activitycomponentid="' + activityComponent.id + '" data-promptid="' + prompt.id + '" class="noselect" data-responsedirection="' + response.rtl + '"></div>';
        writingPromptHTML += '</div>';//END Table Cell
        writingPromptHTML += '</div>'//END Table
        if (prompt.renderRTL)
            writingPromptHTML += '<div id="writingResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>';
        writingPromptHTML += '</div>' //displayTable
        writingPromptHTML += '</div>' //END writingResponseContainer
        //END STUDENT RESPONSE AREA
    }
    writingPromptHTML += "</div>";
    containerElement.append(writingPromptHTML);

    var settings = copyGlobalVariable(defaultCanvas);
    var responseData = $.parseJSON(htmlDecode(prompt.responses[0].text));
    if (responseData)
    {
        settings.height = responseData.height;
        settings.width = responseData.width;
        settings.canvasBgClass = responseData.canvasBgClass;
    }
    if (prompt.sketchpad)
        $("#writingResponseContent_" + prompt.id).ucatCanvas(prompt.sketchpad, settings);
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

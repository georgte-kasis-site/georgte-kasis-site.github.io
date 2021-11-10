var ShortAnswerRenderModeLayouts = ["Default", "Live Activity"];

function loadShortAnswerPrompt(containerElement, activityComponent, prompt)
{
    var shortAnswerPromptHTML = "<div class=\"tabDetail shortAnswerDetails\" " + (prompt.promptTabs ? "style=\"display:none;\"" : "") + " >";
    shortAnswerPromptHTML += "  <div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";
    shortAnswerPromptHTML += "  <div class=\"shortAnswerPromptContainer\">";
    shortAnswerPromptHTML += "      <div id=\"prompt_" + prompt.id + "\" class=\"prompt displayTable\">";


    if (!prompt.renderRTL)
    {
        shortAnswerPromptHTML += '<div id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top; text-align:center;">&nbsp;</div>';
        shortAnswerPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        shortAnswerPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    else
    {
        shortAnswerPromptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        shortAnswerPromptHTML += '<div class="displayTableCell contentCell" style="width:100%;">' + htmlDecode(prompt.text) + '</div>';
        shortAnswerPromptHTML += '<div  id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell shortAnswerToggleBufferCell" style="vertical-align:top;">&nbsp;</div>';
    }

    shortAnswerPromptHTML += "      </div>";
    shortAnswerPromptHTML += "  </div>";
    var response = prompt.responses[0];
    if (response)
    {
        response.componentTitle = activityComponent.componentTitle;
        //BEGIN STUDENT RESPONSE AREA
        shortAnswerPromptHTML += '<div id="shortAnswerResponseContainer_' + prompt.id + '" class="shortAnswerResponseContainer">';
        shortAnswerPromptHTML += '<div class="displayTable">';

        if (!prompt.renderRTL)
            shortAnswerPromptHTML += '<div id="shortAnswerResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>'

        //STUDENT ANSWER AREA
        shortAnswerPromptHTML += '<div class="displayTableCell" style="width:100%;">'
        if (activityComponent.renderModeIndex == 0)
        {
            /*Begin Content Editable*/
            shortAnswerPromptHTML += '<div id="shortAnswerResponseContent_' + prompt.id + '" class="shortAnswerResponseContent" style="flex-direction: ' + (response.rtl ? "row-reverse" : "row" ) + ';">';
            shortAnswerPromptHTML += '  <i id="inputBoxIcon_' + prompt.id + '" class="' + inputBoxIcon + ' customInputBoxIcon"></i>';
            shortAnswerPromptHTML += '  <span id="responseInputBox_' + prompt.id + '" style="text-align:' + (response.rtl ? "right" : "left") + '; margin-' + (response.rtl ? "left" : "right") + ': auto; overflow: hidden;" class="customInputBox" dir=' + (response.rtl ? "rtl" : "ltr") + ' data-promptid="' + prompt.id + '" data-text="" contenteditable="false"></span>';
            shortAnswerPromptHTML += '</div>';
            /*End Content Editable*/
        }
        if (activityComponent.renderModeIndex == 1)
        {
            //LIVE ACTIVITY
        }

        shortAnswerPromptHTML += '</div>';
        if (prompt.renderRTL)
            shortAnswerPromptHTML += '<div id="shortAnswerResponseFeedbackContainer_' + prompt.id + '" class="displayTableCell shortAnswerToggleContainer"></div>';

        shortAnswerPromptHTML += '</div>'; //displayTable
        shortAnswerPromptHTML += '</div>'; //END shortAnswerResponseContainer
        //END STUDENT RESPONSE AREA
    }
    shortAnswerPromptHTML += "</div>";
    containerElement.append(shortAnswerPromptHTML);

    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);

}

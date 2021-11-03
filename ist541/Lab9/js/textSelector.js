function loadTextSelectorPrompt(containerElement, activityComponent, prompt)
{
    var striping = (prompt.promptIndex % 2 == 0) ? " light" : " dark"
    var textSelectorPromptHTML = "<div class=\"tabDetail " + striping + " textSelectorDetails\" " + (prompt.promptTabs ? "style=\"display:none;\"" : "") + ">";        //inlineToolBox
    textSelectorPromptHTML += "<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";

    textSelectorPromptHTML += " <div id=\"prompt_" + prompt.id + "\" class=\"prompt displayTable\">";

    if (prompt.renderRTL)
    {
        textSelectorPromptHTML += '     <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        textSelectorPromptHTML += "     <div id=\"responsesContainer_" + prompt.id + "\" class=\"displayTableCell responseContainer contentCell\" style=\"width:100%;\">";
        textSelectorPromptHTML += htmlDecode(prompt.text);
        textSelectorPromptHTML += "     </div>";
        textSelectorPromptHTML += "     <div id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\"></div>";
    }
    else
    {
        textSelectorPromptHTML += "     <div id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\"></div>";
        textSelectorPromptHTML += "     <div id=\"responsesContainer_" + prompt.id + "\" class=\"displayTableCell responseContainer contentCell\" style=\"width:100%;\">";
        textSelectorPromptHTML += htmlDecode(prompt.text);
        textSelectorPromptHTML += "     </div>";
        textSelectorPromptHTML += '     <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    textSelectorPromptHTML += " </div>";//end prompt
    textSelectorPromptHTML += "</div>";//tabDetail
    containerElement.append(textSelectorPromptHTML);

    var responses = prompt.responses;
    var promptElement = $("#prompt_"+prompt.id);
    if (promptElement.find(".selectable").length == responses.length)
    {
        setupSelectableResponse(promptElement, activityComponent, prompt);
    }
    else
    {
        //console.log("This prompt does not have the correct number of responses")
        //---------------------------------------------------------------------THIS IS WHERE THE DATA HAS TO BE REBUILT SINCE THE SME DID NOT ENTER THE CORRECT NUMBER OF RESPONSES
        //Begin fixing data objects to account for the missing responses
        //AFter rebuilding all the data objects then call buildTextSelectorHTML()
        var oldResponses = prompt.responses;
        var newResponses = [];
        //Create an array of all the blank responses
        promptElement.find(".selectable").each(function( index ) {
            var selectableText = $(this).text();
            var spoofedResponseObject = {};
            spoofedResponseObject.id = prompt.id+index;
            spoofedResponseObject.correct = true;
            spoofedResponseObject.feedback = [];
            spoofedResponseObject.promptId = prompt.id;
            spoofedResponseObject.text = selectableText;
            newResponses.push(spoofedResponseObject)
        })

        //compare the array of selectable text against the array of responses
        //If the selected text does not exist as part of the array in the correct index then add it to the correct responses
        for (var i=0; i<newResponses.length; i++) {
            if(responses[i] != null){
                if(htmlDecode(responses[i].text, false) != htmlDecode(newResponses[i].text, false)){
                    responses.splice(i,0,newResponses[i])
                }
            } else {
                responses.splice(i,0,newResponses[i])
            }
        };

        //Update the prompt object and data to reflect the new spoofed data
        prompt.responses = responses;
        setupSelectableResponse(promptElement, activityComponent, prompt);
    }
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function setupSelectableResponse(containerElement, activityComponent, prompt)
{
    containerElement.find(".selectable").each(function (index)
    {
        var responseElement = $(this);
        responseElement.attr("id", "response_" + prompt.responses[index].id)//assign id's based on the id's of the "sme" choices
        responseElement.data("promptid", prompt.id);
        responseElement.data("responseid", prompt.responses[index].id);
        responseElement.data("index", prompt.responses[index].sortKey);

        responseElement.addClass("response")

        //Insert Feedback Btn after the text based on the parent direction
        responseElement.before('<span id="inlineFeedbackContainer_'+prompt.responses[index].id+'" class="feedbackContainer inlineFeedbackContainer"></span>')
        
        responseElement.removeClass("selectable");

        var renderModeLayout = getRenderModeLayoutIndex(activityComponent);
        if (renderModeLayout == "1")
            responseElement.addClass("showSelectableTxt");
    });
}
var OrderingRenderModeLayouts = ["Vertical", "Horizontal"];

function loadOrderingPrompt(containerElement, activityComponent, prompt) {
    shuffle(prompt.responses);
    var componentTabDetailDiv = $(spf('<div class="tabDetail orderingDetails" ~></div>', [(prompt.promptTabs ? ' style="display:none;"' : "")]));
    containerElement.append(componentTabDetailDiv);

    var promptHTML = "<div id=\"prompt_"+prompt.id+"\" class=\"prompt\">";
    //inlineToolBox
    promptHTML += "<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";

    promptHTML += '<div class="displayTable">'
    if (!prompt.renderRTL)
    {
        promptHTML += '<div id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
        promptHTML += '<div class="displayTableCell orderingPromptContainer">'
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptNoteCell_'+prompt.id+'" class="displayTableCell noteCell"></div>'
    }
    else
    {
        promptHTML += '<div id="promptNoteCell_'+prompt.id+'" class="displayTableCell noteCell"></div>'
        promptHTML += '<div class="displayTableCell orderingPromptContainer">'
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
    }
    promptHTML += '</div>';
    promptHTML += '</div>';
    componentTabDetailDiv.append(promptHTML);

    
    //Begin Response Building
    var itemResponsesDiv = $(spf('<div id="responsesContainer_~" class="responseContainer"></div>', [prompt.id]));
    componentTabDetailDiv.append(itemResponsesDiv);

    //---Begin Response Building returns response
    for (var i = 0; i < prompt.responses.length; i++) {
        loadResponse(itemResponsesDiv, prompt, prompt.responses[i]);
    }

    $("#responsesContainer_" + prompt.id).find(".orderingEnabled:first-child").before('<div>&nbsp;</div>');
    $("#responsesContainer_" + prompt.id).find(".orderingEnabled:last-child").after('<div>&nbsp;</div>');
    
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function loadOrderingResponse(containerElement, prompt, response){
    if (prompt.renderModeLayout == "Horizontal")
    {
        loadHorizontalOrderingMode(containerElement, prompt, response)
    } else {
        //Default
        loadVerticalOrderingMode(containerElement, prompt, response)
    }
    containerElement.after('<div style="clear:both;"></div>')//Must clear the float
}

function loadVerticalOrderingMode(containerElement, prompt, response){

    var responseHTML = spf('<div id="response_~" style="cursor:ns-resize; " class="response draggableContent orderingResponse orderingEnabled">', [response.id]);
    responseHTML += '<div class="displayTable">'
    if (prompt.renderRTL) 
    {
        responseHTML += '<div class="displayTableCell orderingContentContainer">'+htmlDecode(response.text)+'</div>';
        responseHTML += '<div id="responseFeedbackContainer_' + response.id + '" class="displayTableCell feedbackContainer orderingFeedbackContainer" style="display:none;"></div>'
        //responseHTML += spf('<div class="displayTableCell orderingDragHandle ~ ~" >&nbsp;</div>', [arrowSortIcon, borderLineStyle]);
    }
    else
    {
        //responseHTML += spf('<div class="displayTableCell orderingDragHandle ~ ~" >&nbsp;</div>', [arrowSortIcon, borderLineStyle]);
        responseHTML += '<div id="responseFeedbackContainer_' + response.id + '" class="displayTableCell feedbackContainer orderingFeedbackContainer" style="display:none;"></div>'
        responseHTML += '<div class="displayTableCell orderingContentContainer">' + htmlDecode(response.text) + '</div>';
    }
    responseHTML += '</div>'
    responseHTML += '</div>'
    containerElement.append(responseHTML);
}

function loadHorizontalOrderingMode(containerElement, prompt, response){
    var floatRTL = prompt.renderRTL ? "float:right; margin-right:1px;" : "float:left; margin-left:1px;"
    var responseHTML = '<div id="response_'+response.id+'" style="cursor:move; display:inline-block; '+floatRTL+'" class="response draggableContent orderingEnabled">';

    if (prompt.renderRTL) 
    {     
        responseHTML += '<div style="display:table;">';

        responseHTML += '<div class="displayTableCell" style="padding:0 5px;">';
        responseHTML += htmlDecode(response.text);
        responseHTML += '</div>'

        responseHTML += '<span id="responseFeedbackContainer_' + response.id + '" class="feedbackContainer displayTableCell" style="display:none;"></span>'

        responseHTML += '</div>'
    }
    else
    {
        responseHTML += '<div style="display:table;">';

        responseHTML += '<span id="responseFeedbackContainer_' + response.id + '" class="feedbackContainer displayTableCell" style="display:none;"></span>'

        responseHTML += '<div class="displayTableCell" style="padding:0 5px;">';
        responseHTML += htmlDecode(response.text);
        responseHTML += '</div>'

        responseHTML += '</div>'
    }
    responseHTML += '</div>'

    containerElement.append(responseHTML);
}


function loadFindAndClickPrompt(containerElement, activityComponent, prompt)
{
    var tabDetail = $(spf('<div class="tabDetail findandClickDetails" ~></div>', [(prompt.promptTabs ? ' style="display:none;"' : "")]));
    containerElement.append(tabDetail);
    //inlineToolBox
    tabDetail.append("<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>");

    var promptText = "";
    if (prompt.feedback && prompt.feedback.length > 0)
    {
        promptText = prompt.feedback[0].text;
        prompt.feedback = new Array();
    }

    var promptHTML = "<div id=\"prompt_" + prompt.id + "\" class=\"prompt\">";
    promptHTML += ' <div class="displayTable">'
    if (activityComponent.renderRTL)
    {
        promptHTML += '     <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        promptHTML += '     <div class="displayTableCell" style="width:100%; padding:.5em">'+htmlDecode(promptText)+'</div>';
        promptHTML += '     <div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
    }
    else
    {
        promptHTML += '     <div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
        promptHTML += '     <div class="displayTableCell" style="width:100%; padding:.5em">' + htmlDecode(promptText) +'</div>';
        promptHTML += '     <div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    promptHTML += ' </div>'
    promptHTML += '</div>'//End Prompt Div
    tabDetail.append(promptHTML);

    var promptDiv = $(spf('<div id="responses_~" class="centered"></div>',[prompt.id] ) );
    promptDiv.append( $(spf('<div id="responsesContainer_~" class="responseContainer hotspotContainer">~</div></div>', [prompt.id, htmlDecode(prompt.text)]) ) );
    tabDetail.append(promptDiv);
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function loadResponseHotspot(activityComponent, response, trigger)
{
    var responseDataArr = $.parseJSON(response.text);
    if (responseDataArr.length == 4)
    {
        var hotspotContainer = $("#responsesContainer_" + response.promptId);
        var hotspot = $("#responseHotspot_" + response.id);
        if (hotspot.length <= 0)
        {
            var img = $('#responsesContainer_' + response.promptId + ' img').get(0);
            /*USING ACTUAL PIXELS FOR ASSIGNMENT PROTOTYPE UNTIL PRELOADING CAN BE FIGURED FOR SCALED POSITIONING
                            var imgX = img.naturalWidth;
                            var imgY = img.naturalHeight;
                            var x = Math.round((responseDataArr[0] / imgX) * 100);
                            var y = Math.round((responseDataArr[1] / imgY) * 100);
                            var w = Math.round(((responseDataArr[2] - responseDataArr[0]) / imgX) * 100);
                            var h = Math.round(((responseDataArr[3] - responseDataArr[1]) / imgY) * 100);
            */

            var x = responseDataArr[0];
            var y = responseDataArr[1];
            var w = responseDataArr[2] - responseDataArr[0];
            var h = responseDataArr[3] - responseDataArr[1];
            hotspot = $("<div id=\"responseHotspot_" + response.id + "\" class=\"hotspot\" style=\"left:" + x + "px; top:" + y + "px; width:" + w + "px; height:" + h + "px; position:absolute;\" data-promptid=\"" + response.promptId + "\" data-responseid=\"" + response.id + "\" data-index=\""+response.sortKey+"\"></div>");
            hotspotContainer.append(hotspot);
            if (trigger)
            {
                var responseInteractionEvent = $.Event("responseInteraction");
                responseInteractionEvent.activityComponentId = activityComponent.id;
                responseInteractionEvent.promptId = response.promptId;
                responseInteractionEvent.responseId = response.id;
                responseInteractionEvent.responseIndex = response.sortKey;
                responseInteractionEvent.componentTitle = "FindAndClick";
                responseInteractionEvent.responseText = "";
                $(document).trigger(responseInteractionEvent);
            }

            var hotspotLoadedEvent = $.Event("hotspotLoaded");
            hotspotLoadedEvent.responseId = response.id;
            hotspotLoadedEvent.promptId = response.promptId;
            hotspotLoadedEvent.activityComponentId = activityComponent.id;
            $(document).trigger(hotspotLoadedEvent);
        }
    }
}

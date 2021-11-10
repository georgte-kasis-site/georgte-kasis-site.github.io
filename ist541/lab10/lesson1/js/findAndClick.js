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
        promptHTML += '     <div class="displayTableCell" style="width:100%; padding:.5em">' + htmlDecode(promptText) + '</div>';
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

    if (activityComponent.renderModeIndex == 1)
    {
        for (var r = 0; r < prompt.responses.length; r++)
        {
            loadResponseHotspot(activityComponent, prompt.responses[r], false);
            bindResponseHotspotClick(activityComponent, prompt, prompt.responses[r]);
        }
    }
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
            hotspotLoadedEvent.response = response;
            hotspotLoadedEvent.promptId = response.promptId;
            hotspotLoadedEvent.activityComponent = activityComponent;
            $(document).trigger(hotspotLoadedEvent);
        }
    }
}

function bindResponseHotspotClick(activityComponent, prompt, response)
{
    if (activityComponent.renderModeIndex == 1)
    {
        var hotspot = $("#responseHotspot_" + response.id);
        if (hotspot.length > 0)
        {
            hotspot.click(function ()
            {
                var responseFeedbackText = typeof (response.feedback) != "undefined" && response.feedback.length > 0 ? htmlDecode(response.feedback[0].text) : "";
                var feedbackHTML = '<div id="responseFeedback_' + response.id + '">' + responseFeedbackText + '</div>';
                var iconHTML = '<span><i class="icon fa fa-info-circle"></i></span>';
                openCustomDialog("Information", feedbackHTML, "information", iconHTML);
            });
        }
    }
    else
    {
        $("#responsesContainer_" + prompt.id).children("img").on("click", { activityComponent: activityComponent, prompt: prompt, response: response }, function (e)
        {
            var img = $('#responsesContainer_' + e.data.prompt.id + ' img').get(0);
            var imgX = img.naturalWidth;
            var imgY = img.naturalHeight;

            var responseDataArr = $.parseJSON(e.data.response.text);
            if (responseDataArr.length == 4)
            {
                var offset = $(this).offset();
                var clickX = e.pageX - offset.left;
                var clickY = e.pageY - offset.top;
                if ((clickX >= Math.round(responseDataArr[0] / imgX * img.width)) && (clickX <= Math.round(responseDataArr[2] / imgX * img.width)) && (clickY >= Math.round(responseDataArr[1] / imgY * img.height)) && (clickY <= Math.round(responseDataArr[3] / imgY * img.height)))
                {
                    switch (e.data.activityComponent)
                    {
                        case 1:
                            break;
                        default:
                            loadResponseHotspot(e.data.activityComponent, e.data.response, true);
                            break;
                    }
                }
            }
        });
    }
}
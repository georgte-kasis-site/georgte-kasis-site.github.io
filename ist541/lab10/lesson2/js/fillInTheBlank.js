var FillInTheBlankRenderModeLayouts = ["Default", "Drag And Drop Word Pool", "Sortable"];

$(document).ready(function ()
{
    $(document).bind("activityComponentTabOpened", function (event) { openFillInTheBlankTab(event); });
});

function loadFillInTheBlankActivityComponent(containerElement, activityComponent)
{
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
    var tabDetailsHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails " + (promptTabs > 0 ? "tabDetailsWithTabs" : "") + "\"></div>";
    containerElement.append(tabDetailsHTML);

    var tabDetails = $("#tabDetails_" + activityComponent.id);

    tabDetails.append(generateActivityComponentPresentationHTML(activityComponent));


    //Max Length of Input boxes to make all the droppable areas the max width of the longest answer
    var tabDetails = $("#tabDetails_"+activityComponent.id);
    tabDetails.addClass("fillInTheBlankDetails")
    switch (activityComponent.renderModeIndex)
    {
		case 1:
			tabDetails.append(spf('<div id="responsePool_~" class="wordPool"></div>', [activityComponent.id]));
			var responsePool = $("#responsePool_"+activityComponent.id);
			responsePool.html("")
			shuffle(activityComponent.responses);
			for (var j = 0; j < activityComponent.responses.length; j++)
			{
			    responsePool.append(spf('<span id="response_~" class="word draggableWord" dir="~" data-responseid="~">~</span>', [activityComponent.responses[j].id, (activityComponent.responses[j].rtl ? "rtl" : "ltr"), activityComponent.responses[j].id, htmlDecode(activityComponent.responses[j].text)]));
			}
            break;
        case 2:
            for (var p = 0; p < activityComponent.prompts.length; p++)
            {
                shuffle(activityComponent.prompts[p].responses);
            }
            break;
        default:
            break;
    }
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        loadFillInTheBlankPrompt(tabDetails, activityComponent, activityComponent.prompts[i]);
    }
    if (promptTabs)
    {
        openFirstTab(activityComponent);
    }
}

function getMaxResponseLength(activityComponent)
{
    var maxLength = 0
    if (activityComponent.prompts.length > 0)
    {
        var allPrompts = activityComponent.prompts;
        for (var i = 0; i < allPrompts.length; i++)
        {
            var prompt = allPrompts[i];
            for (var j = 0; j < prompt.responses.length; j++)
            {
                var response = prompt.responses[j];
                if (response.text.length > maxLength)
                {
                    maxLength = response.text.length;
				}
            }
        }
    }

    return maxLength;
}

function loadFillInTheBlankPrompt(containerElement, activityComponent, prompt)
{
    var componentTabDetailDiv = $(document.createElement('div') ).attr("class","tabDetail fnbDetails");
    if (prompt.promptTabs)
    {
		componentTabDetailDiv.css("display","none");
    }
    //inlineToolBox
    componentTabDetailDiv.append("<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>");

    var promptElement = $(document.createElement('div') ).attr("class","prompt displayTable").attr("id","prompt_"+prompt.id);

    componentTabDetailDiv.append(promptElement);
    containerElement.append(componentTabDetailDiv);
    var promptHTML = "";
    if (!activityComponent.renderRTL)
    {
        promptHTML += '<div id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
        promptHTML += spf('<div id="responsesContainer_~" class="displayTableCell responseContainer" data-fillintheblanktype="~" style="vertical-align:top;">',[prompt.id,"default"])
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    else
    {
        promptHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
        promptHTML += spf('<div id="responsesContainer_~" class="displayTableCell responseContainer" data-fillintheblanktype="~" style="vertical-align:top;">', [prompt.id, "default"])
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>'
    }
    promptElement.append(promptHTML);
    buildFillInTheBlankHTML(prompt, promptElement);
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function buildFillInTheBlankHTML(prompt, promptElement)
{
    var fillInTheBlankType;
    promptElement.find(".blank").each(function (index)
    {
        index += 1;
        var responseElement = $(this);
        responseElement.css("width", "5em");
        responseElement.html("&nbsp;");
        responseElement.attr("id", "response_"+prompt.id+"_"+index);
    });
}

function openFillInTheBlankTab(event)
{
    if ((event.activityComponent.componentTitle == "FillInTheBlank") && (event.activityComponent.promptsPerPage))
    {
        var wordPool = $("#responsePool_" + event.activityComponent.id);
        if (wordPool.length > 0)
        {
            for (var p = 0; p < event.activityComponent.prompts.length; p++)
            {
                var prompt = event.activityComponent.prompts[p];
                if (prompt.responses)
                {
                    for (var r = 0; r < prompt.responses.length; r++)
                    {
                        var responseDraggable = $("#response_" + prompt.responses[r].id);
                        if (responseDraggable.parent().hasClass("wordPool"))
                        {
                            if ($.inArray((p + 1), event.openedPromptIndexes) >= 0)
                            {
                                responseDraggable.show();
                            }
                            else
                            {
                                responseDraggable.hide();
                            }
                        }
                        else
                        {
                            responseDraggable.show();
                        }
                    }
                }
            }
        }
    }
}
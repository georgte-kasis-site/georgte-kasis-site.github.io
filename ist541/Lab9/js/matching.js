function loadMatchingActivityComponent(containerElement, activityComponent)
{
    if (typeof (activityComponent.renderModeLayout) == "undefined")
        activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    var promptTabs = (activityComponent.promptsPerPage > 0);

    if (activityComponent.randomizePrompts)
        shuffle(activityComponent.prompts); //returns shuffled array from globals.js

    if (activityComponent.instructions.length > 0)
    {
        loadGenericInstructions(containerElement, activityComponent);
    }
    var componentTabBar = promptTabs ? loadComponentTabBar(containerElement, activityComponent) : false;
    //---Main Container for Component. Always rendered.
    var borderTabCss = (promptTabs) ? "tabDetailsWithTabs" : "";
    var renderRTL = activityComponent.renderRTL;
    var matchingComponentHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails " + borderTabCss + " \">";
    matchingComponentHTML += generateActivityComponentPresentationHTML(activityComponent);
    matchingComponentHTML += "  <div class=\"tabDetail\">";
    matchingComponentHTML += "      <div id=\"matchingContainer_"+activityComponent.id+"\" class=\"displayTable matchingDetails\">";
    var numRows = activityComponent.prompts.length;
    if (activityComponent.responses.length > numRows)
        numRows = activityComponent.responses.length;
    for (var i = 0; i < numRows; i++)
    {
        matchingComponentHTML += "          <div id=\"matchingFeedbackRow_" + activityComponent.id + "_" + i + "\" class=\"displayTableRow\"></div>";
        matchingComponentHTML += "          <div  id=\"matchingRow_" + activityComponent.id + "_" + i + "\" class=\"displayTableRow\">";
        matchingComponentHTML += "              <div id=\"matching" + (activityComponent.renderRTL ? "Response" : "Prompt") + "Container_" + activityComponent.id + "_" + i + "\" class=\"displayTableCell matching" + (activityComponent.renderRTL ? "Response" : "Prompt") + "Column\"></div>";
        matchingComponentHTML += "              <div id=\"matchingColumnDivider_" + activityComponent.id + "_" + i + "\" class=\"displayTableCell matchingColumnDivider\" data-islocked=\"false\">"+((i < activityComponent.prompts.length) ? "<i id=\"matchingLock_" + activityComponent.id + "_" + i + "\" class=\"fa fa-chain-broken matchingLock\"></i>" : "")+"</div>";
        matchingComponentHTML += "              <div id=\"matching" + (activityComponent.renderRTL ? "Prompt" : "Response") + "Container_" + activityComponent.id + "_" + i + "\" class=\"displayTableCell matching" + (activityComponent.renderRTL ? "Prompt" : "Response") + "Column\"></div>";
        matchingComponentHTML += "          </div>";
    }
    matchingComponentHTML += "      </div>";
    matchingComponentHTML += "  </div>";
    matchingComponentHTML += "</div>";
    containerElement.append(matchingComponentHTML);


    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        activityComponent.prompts[i].promptIndex = i;

        var matchingPromptFeedbackRowHTML = "<div class=\"displayTableCell matchingPromptColumn\"><div id=\"promptFeedbackToolBox_" + activityComponent.prompts[i].id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div></div>";
        matchingPromptFeedbackRowHTML += "<div class=\"displayTableCell matchingColumnDivider\"></div>";
        matchingPromptFeedbackRowHTML += "<div class=\"displayTableCell matchingResponseColumn\"></div>";
        $("#matchingFeedbackRow_" + activityComponent.id + "_" + i).html(matchingPromptFeedbackRowHTML);
        loadMatchingPrompt($("#matchingPromptContainer_" + activityComponent.id + "_"+i), activityComponent, activityComponent.prompts[i]);
    }
    for (var i = 0; i < activityComponent.responses.length; i++)
    {
        loadMatchingResponse($("#matchingResponseContainer_" + activityComponent.id + "_"+i), activityComponent, activityComponent.responses[i]);
    }
    if (!activityComponent.randomizeResponses)
    {
        var matchingContainer = $("#matchingContainer_" + activityComponent.id);
        var draggables = matchingContainer.find("[id^='matchingResponse_']");
        draggables.detach().sort(function (a, b)
        {
            var at = $(a).text().toUpperCase();
            var bt = $(b).text().toUpperCase();
            return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
        });
        for (var d = 0; d < draggables.length; d++)
        {
            $("#matchingResponseContainer_" + activityComponent.id + "_" + d).append(draggables[d]);
        }
    }

    //---Display initial Prompt
    if (promptTabs)
        openFirstTab(activityComponent);
}

function loadMatchingPrompt(containerElement, activityComponent, prompt)
{
	prompt.randomizeResponses = activityComponent.randomizeResponses;
	prompt.componentTitle = activityComponent.componentTitle;
	var matchingPromptHTML = "<div id=\"matchingPrompt_" + prompt.id + "\" class=\"displayTable matchingPrompt prompt\" data-activityComponentid=\"" + activityComponent.id + "\" data-promptid=\"" + prompt.id + "\" data-promptindex=\"" + prompt.promptIndex + "\"></div>";
	containerElement.append(matchingPromptHTML);

	var matchingPrompt = $("#matchingPrompt_" + prompt.id);
	var matchingPromptTableRow = $("<div class=\"displayTableRow\"></div>");

	var matchingPromptFeedbackHTML = "<div class=\"displayTableCell feedbackContainer promptFeedbackContainer\"></div>";
	var matchingPromptContentHTML = "<div class=\"displayTableCell contentCell\" style=\"vertical-align:top; width:100%\">" + htmlDecode(prompt.text) + "</div>";
	var matchingPromptNoteCellHTML = '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
	var matchingPromptDropAreaHTML = "<div class=\"displayTableCell \" style=\"width:3.250em; vertical-align: top;\"><div id=\"matchingPromptDropArea_" + prompt.id + "\" data-activityComponentid=\""+activityComponent.id+"\" data-promptid=\"" + prompt.id + "\" data-promptindex=\""+prompt.promptIndex+"\" class=\"dropArea\"><i class=\"fa fa-crosshairs dropTargetIcon\"></i></div></div>";

	if (activityComponent.renderRTL)
	{
	    matchingPromptTableRow.append(matchingPromptDropAreaHTML);
	    matchingPromptTableRow.append(matchingPromptNoteCellHTML);
	    matchingPromptTableRow.append(matchingPromptContentHTML);
	    matchingPromptTableRow.append(matchingPromptFeedbackHTML);
	}
	else
	{
        matchingPromptTableRow.append(matchingPromptFeedbackHTML);
        matchingPromptTableRow.append(matchingPromptContentHTML);
        matchingPromptTableRow.append(matchingPromptNoteCellHTML);
        matchingPromptTableRow.append(matchingPromptDropAreaHTML);
	}

	matchingPrompt.append(matchingPromptTableRow);
	var promptLoadedEvent = $.Event("promptLoaded");
	promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
	promptLoadedEvent.prompt = prompt;
	$(document).trigger(promptLoadedEvent);

}

function loadMatchingResponse(containerElement, activityComponent, response)
{
    response.componentTitle = activityComponent.componentTitle;

    var matchingResponseHTML = "<div id=\"matchingResponse_" + response.id + "\" class=\"responseContainer displayTable\"></div>";

    containerElement.append(matchingResponseHTML);

    var matchingResponseDropAreaHTML =  "   <div class=\"displayTableCell\" style=\"vertical-align: top; width: 3.25em;\">";
    matchingResponseDropAreaHTML += "       <div id=\"matchingResponseDropArea_" + response.id + "\" class=\"dropAreaHome dropArea\">";
    matchingResponseDropAreaHTML += "           <div id=\"matchingResponseDiv_" + response.id + "\" class=\"dragElement\" data-responseid=\"" + response.id + "\"><span class=\"dragHandle fa fa-arrows\"></span></div>";
    matchingResponseDropAreaHTML += "       </div>";
    matchingResponseDropAreaHTML += "   </div>";

    var matchingResponseContentHTML = "   <div class=\"displayTableCell\" style=\"vertical-align: top;\">";
    matchingResponseContentHTML += "       <div id=\"response_" + response.id + "\" class=\"response contentCell\">" + htmlDecode(response.text) + "</div>";
    matchingResponseContentHTML += "   </div>";

    var matchingResponse = $("#matchingResponse_" + response.id);
    matchingResponse.append(activityComponent.renderRTL ? matchingResponseContentHTML : matchingResponseDropAreaHTML);
    matchingResponse.append(activityComponent.renderRTL ? matchingResponseDropAreaHTML : matchingResponseContentHTML);
}


function toggleMatchingLink(activityComponentId, promptId, promptIndex)
{
    var matchingColumnDivider = $("#matchingColumnDivider_" + activityComponentId + "_" + promptIndex);
    if (matchingColumnDivider.data("islocked") == false)
    {
        $("#matchingLock_" + activityComponentId+"_"+promptIndex).attr("class", matchingLinkedIcon + " matchingLock")
        matchingColumnDivider.data("islocked", true)
    }
    else
    {
        $("#matchingLock_" + activityComponentId + "_" + promptIndex).attr("class", matchingUnlinkedIcon + " matchingLock")
        matchingColumnDivider.data("islocked", false)
    }
}
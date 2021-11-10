function loadCategorizationActivityComponent(containerElement, activityComponent)
{
    if (typeof (activityComponent.renderModeLayout) == "undefined")
        activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    var promptTabs = (activityComponent.promptsPerPage > 0);

    if (activityComponent.randomizePrompts)
        shuffle(activityComponent.prompts);

    if (activityComponent.instructions.length > 0)
        loadGenericInstructions(containerElement, activityComponent);

    if (promptTabs)
        loadComponentTabBar(containerElement, activityComponent);

    var tabDetailsHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails " + (promptTabs ? "tabDetailsWithTabs" : "") + "\">";
    tabDetailsHTML += generateActivityComponentPresentationHTML(activityComponent);
    tabDetailsHTML += " <div id=\"categorizationDetailsDiv_"+activityComponent.id+"\" class=\"tabDetail categorizationDetails\" style=\"display:block;\"></div>";
    tabDetailsHTML += "</div>";
    containerElement.append(tabDetailsHTML);

    if (activityComponent.randomizeResponses)
        shuffle(activityComponent.responses);
    var renderModeIndex = getRenderModeLayoutIndex(activityComponent);
    var containerElement = $("#categorizationDetailsDiv_" + activityComponent.id);
    if (renderModeIndex == 1)
        loadVerticalCategorizationTable(containerElement, activityComponent);
    else
        loadHorizontalCategorizationTable(containerElement, activityComponent);

    if (!activityComponent.randomizeResponses)
    {
        var categorizationResponsesDiv = $("#categorizationResponsesDiv_" + activityComponent.id);
        var draggables = categorizationResponsesDiv.children();
        draggables.detach().sort(function (a, b)
        {
            var at = $(a).text().toUpperCase();
            var bt = $(b).text().toUpperCase();
            return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
        });
        categorizationResponsesDiv.append(draggables);
    }
    if (promptTabs)
        openFirstTab(activityComponent);
}

function loadCategorizationWordPool(containerElement, activityComponent)
{
    var wordPoolHTML = "<div class=\"displayTable\">";
    wordPoolHTML += "   <div id=\"responseContainerCell_" + activityComponent.id + "\" class=\"displayTableCell\" style=\"width:100%; text-align:center;\">";
    wordPoolHTML += "       <div id=\"categorizationResponsesDiv_" + activityComponent.id + "\" class=\"categorizationResponses verticalWordPool\">";
    for (var i = 0; i < activityComponent.responses.length; i++)
    {
        var response = activityComponent.responses[i];
        wordPoolHTML += "           <div id=\"dragInlineElement_" + response.id + "\" class=\"dragInlineElement\" style=\"display:inline-block;\">";
        wordPoolHTML += "               <div id=\"response_" + response.id + "\" class=\"draggableContent response\" data-activitycomponentid=\"" + activityComponent.id + "\" data-responseid=\"" + response.id + "\">";
        if (activityComponent.renderRTL)
        {
            wordPoolHTML += "                   <div id=\"draggableResponseContent_" + response.id + "\" class=\"draggableResponseContent displayTableCell\" style=\"width:100%;\"><div style=\"display:inline-block; width:100%;\">" + htmlDecode(response.text) + "</div></div>";
            wordPoolHTML += "                   <div id=\"responseFeedbackContainer_" + response.id + "\" class=\"displayTableCell feedbackContainer\" style=\"min-width:1px; width:auto;\">&nbsp;</div>";
        }
        else
        {
            wordPoolHTML += "                   <div id=\"responseFeedbackContainer_" + response.id + "\" class=\"displayTableCell feedbackContainer\" style=\"min-width:1px; width:auto;\">&nbsp;</div>";
            wordPoolHTML += "                   <div id=\"draggableResponseContent_" + response.id + "\" class=\"draggableResponseContent displayTableCell\" style=\"width:100%;\"><div style=\"display:inline-block; width: 100%;\">" + htmlDecode(response.text) + "</div></div>";
        }
        wordPoolHTML += "               </div>";//end response
        wordPoolHTML += "           </div>";//end dragInlineElement
    }
    wordPoolHTML += "       </div>";//end categorizationResponsesDiv
    wordPoolHTML += "   </div>";//end responseContainerCell
    wordPoolHTML += "</div>";//end displayTable
    containerElement.append(wordPoolHTML);
}

function loadVerticalCategorizationTable(containerElement, activityComponent)
{
    loadCategorizationWordPool(containerElement, activityComponent);
    if (activityComponent.renderRTL)
        activityComponent.prompts = activityComponent.prompts.reverse();
    var categorizationTableHTML = "<div id=\"categorizationTable_" + activityComponent.id + "\" class=\"displayTable\">";
    categorizationTableHTML += "    <div id=\"categorizationTableHeader_" + activityComponent.id + "\" class=\"displayTableRow\">";
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        var prompt = activityComponent.prompts[i];
        prompt.componentTitle = activityComponent.componentTitle;
        prompt.renderModeLayout = activityComponent.renderModeLayout;
        prompt.renderRTL = activityComponent.renderRTL;
        prompt.randomizeResponses = activityComponent.randomizeResponses;
        prompt.promptTabs = (activityComponent.promptsPerPage > 0);
        if (prompt.renderRTL)
        {
            if (i != 0)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        }
        else
        {
            if (i != 0 && i != activityComponent.prompts.length)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        }

        categorizationTableHTML += "      <div id=\"prompt_" + prompt.id + "\" class=\"displayTableCell prompt\">";
        //inlineToolBox
        categorizationTableHTML += "             <div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";

        categorizationTableHTML += "         <div class=\"displayTable\">";
        if (prompt.renderRTL)
        {
            categorizationTableHTML += "             <div id=\"promptNoteCell_"+prompt.id+"\" class=\"displayTableCell noteCell\" style=\"height:auto;\">";
            categorizationTableHTML += "             </div>";//end note cell
            categorizationTableHTML += "             <div class=\"displayTableCell\" style=\"width:100%; height:auto;\"><div class=\"categorizationPrompt\"><div class=\"categorizationHeader\">" + htmlDecode(prompt.text) + "</div></div>";
            categorizationTableHTML += "             <div id=\"promptFeedbackContainer_"+prompt.id+"\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\" style=\"height:auto;\"></div>";
        }
        else
        {
            categorizationTableHTML += "             <div id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\" style=\"height:auto;\"></div>";
            categorizationTableHTML += "             <div class=\"displayTableCell\" style=\"width:100%; height:auto;\"><div class=\"categorizationPrompt\"><div class=\"categorizationHeader\">"+htmlDecode(prompt.text)+"</div></div></div>";
            categorizationTableHTML += "             <div id=\"promptNoteCell_"+prompt.id+"\" class=\"displayTableCell noteCell\" style=\"height:auto;\">";
            categorizationTableHTML += "             </div>";//end note cell
        }
        categorizationTableHTML += "         </div>";//End Display Table
        categorizationTableHTML += "      </div>";//end prompt
    }
    categorizationTableHTML += "    </div>";//end categorizationTableHeader
    categorizationTableHTML += "    <div id=\"categorizationTableBody_" + activityComponent.id + "\" class=\"displayTableRow\">";
    var colPercentage = 100 / (activityComponent.prompts.length);
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        var prompt = activityComponent.prompts[i];
        var columnClass = "even";
        if (prompt.renderRTL)
            columnClass = (i % 2 == 0) ? "odd" : "even";
        else
            columnClass = (i % 2 == 0) ? "even" : "odd";

        if (prompt.renderRTL)
        {
            if (i != 0)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryColumns\">&nbsp;</div>";
        }
        else
        {
            if (i != 0 && i != activityComponent.prompts.length)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryColumns\">&nbsp;</div>";
        }
        categorizationTableHTML += "        <div id=\"responsesContainer_"+prompt.id+"\" data-promptid=\""+prompt.id+"\" class=\"displayTableCell responseContainer categoryColumn "+columnClass+"\" style=\"width:"+colPercentage+"%;\"></div>";
    }
    categorizationTableHTML += "    </div>";//end categorizationTableBody
    categorizationTableHTML += "</div>";
    containerElement.append(categorizationTableHTML);

    var minHeight = "3.125em"
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        $("#responsesContainer_" + activityComponent.prompts[i].id).css({ "height": minHeight, "padding-bottom": minHeight });
        $("#responsesContainer_" + activityComponent.prompts[i].id).data("activitycomponentid", activityComponent.id);
        var promptLoadedEvent = $.Event("promptLoaded");
        promptLoadedEvent.containerElement = $("#promptNoteCell_" + activityComponent.prompts[i].id);
        promptLoadedEvent.prompt = activityComponent.prompts[i];
        $(document).trigger(promptLoadedEvent);

    }
}

function loadHorizontalCategorizationTable(containerElement, activityComponent)
{
    if (activityComponent.renderRTL)
        activityComponent.prompts = activityComponent.prompts.reverse();

    var categorizationTableHTML = "<div id=\"categorizationTable_" + activityComponent.id + "\" class=\"displayTable\">";
    categorizationTableHTML += "    <div id=\"categorizationTableHeader_" + activityComponent.id + "\" class=\"displayTableRow\">";
    if (!activityComponent.renderRTL)
        categorizationTableHTML += "        <div id=\"responseCol_" + activityComponent.id + "\" class=\"displayTableCell\"></div>";

    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        var prompt = activityComponent.prompts[i];
        prompt.renderRTL = activityComponent.renderRTL;
        if (activityComponent.renderRTL)
        {
            if (i != 0)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        }
        else
        {
            if (i != activityComponent.prompts.length)
                categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        }
        categorizationTableHTML += "        <div id=\"prompt_" + prompt.id + "\" class=\"displayTableCell prompt\">";
        //inlineToolBox
        categorizationTableHTML += "             <div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";

        categorizationTableHTML += "            <div class=\"displayTable\">";
        if (activityComponent.renderRTL)
        {
            categorizationTableHTML += "             <div id=\"promptNoteCell_"+prompt.id+"\" class=\"displayTableCell noteCell\" style=\"height:auto;\">";
//            if (promptNotes.length > 0)
//                categorizationTableHTML += loadGenericNoteBuilder("prompt", categoryPrompts[i].id, activityComponent, promptNotes)
            categorizationTableHTML += "             </div>";
            categorizationTableHTML += "             <div class=\"displayTableCell\" style=\"width:100%; height:auto;\"><div class=\"categorizationPrompt\" style=\"width:100%\"><div class=\"categorizationHeader\">" + htmlDecode(prompt.text) + "</div></div></div>";
            categorizationTableHTML += "             <div id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\" style=\"height:auto;\"></div>";
        }
        else
        {
            categorizationTableHTML += "             <div id=\"promptFeedbackContainer_" + prompt.id + "\" class=\"displayTableCell feedbackContainer promptFeedbackContainer\" style=\"height:auto;\"></div>";
            categorizationTableHTML += "             <div class=\"displayTableCell\" style=\"width:100%; height:auto;\"><div class=\"categorizationPrompt\" style=\"width:100%\"><div class=\"categorizationHeader\">" + htmlDecode(prompt.text) + "</div></div></div>";
            categorizationTableHTML += "             <div id=\"promptNoteCell_"+prompt.id+"\" class=\"displayTableCell noteCell\" style=\"height:auto;\">";
//            if (promptNotes.length > 0)
//                categorizationTableHTML += loadGenericNoteBuilder("prompt", categoryPrompts[i].id, activityComponent, promptNotes)
            categorizationTableHTML += "             </div>";
        }
        categorizationTableHTML += "            </div>";//end displayTable
        categorizationTableHTML += "        </div>";//end prompt
    }
    if (activityComponent.renderRTL)
    {
        categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        categorizationTableHTML += "        <div id=\"responseCol_" + activityComponent.id + "\" class=\"displayTableCell\"></div>";
    }
    categorizationTableHTML += "    </div>";//end categorizationTableHeader
    categorizationTableHTML += "    <div id=\"categorizationTableBody_" + activityComponent.id + "\" class=\"displayTableRow\">";

    var colPercentage = 100 / (activityComponent.prompts.length + 1);
    if (!activityComponent.renderRTL)
        categorizationTableHTML += "     <div id=\"responseContainerCell_" + activityComponent.id + "\" class=\"displayTableCell\" style=\"width:" + colPercentage + "%; vertical-align:top\"></div>";

    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        var prompt = activityComponent.prompts[i];
        if (!activityComponent.renderRTL)
        {
            if (i != activityComponent.prompts.length)
                categorizationTableHTML += "     <div class=\"displayTableCell bufferCellCategoryColumns\">&nbsp;</div>";
        }
        else
        {
            if (i != 0)
                categorizationTableHTML += "     <div class=\"displayTableCell bufferCellCategoryColumns\">&nbsp;</div>";
        }
        var columnClass = "even";
        if (activityComponent.renderRTL)
            columnClass = (i % 2 == 0) ? "odd" : "even";
        else
            columnClass = (i % 2 == 0) ? "even" : "odd";
        categorizationTableHTML += "     <div id=\"responsesContainer_" + prompt.id + "\" data-promptid=\"" + prompt.id + "\" class=\"displayTableCell responseContainer categoryColumn " + columnClass + "\" style=\"width:" + colPercentage + "%; border:2 px solid transparent;\"></div>";
    }
    if (activityComponent.renderRTL)
    {
        categorizationTableHTML += "        <div class=\"displayTableCell bufferCellCategoryHeaderColumns\">&nbsp;</div>";
        categorizationTableHTML += "        <div id=\"responseContainerCell_" + activityComponent.id + "\" class=\"displayTableCell\" style=\"width:" + colPercentage + "%; vertical-align:top\"></div>";
    }
    categorizationTableHTML += "    </div>";//end categorizationTableBody
    categorizationTableHTML += "</div>";//end categorizationTable
    containerElement.append(categorizationTableHTML);

    //Add the responses to the responseContainerCell
    var categorizationResponsesHTML = "<div id=\"categorizationResponsesDiv_" + activityComponent.id + "\" class=\"categorizationResponses\">";
    for (var i = 0; i < activityComponent.responses.length; i++)
    {
        var response = activityComponent.responses[i];
        categorizationResponsesHTML += "    <div id=\"response_" + response.id + "\" class=\"draggableContent response\" data-activitycomponentid=\"" + activityComponent.id + "\" data-responseid=\"" + response.id + "\">";
        if (activityComponent.renderRTL)
        {
            categorizationResponsesHTML += "        <div id=\"draggableResponseContent_" + response.id + "\" class=\"draggableResponseContent displayTableCell\" style=\"width:100%;\"><div style=\"display:inline;\">" + htmlDecode(response.text) + "</div></div>";
            categorizationResponsesHTML += "        <div id=\"responseFeedbackContainer_" + response.id + "\" class=\"displayTableCell feedbackContainer\" style=\"min-width:1px;\"></div>";
        }
        else
        {
            categorizationResponsesHTML += "        <div id=\"responseFeedbackContainer_" + response.id + "\" class=\"displayTableCell feedbackContainer\" style=\"min-width:1px;\"></div>";
            categorizationResponsesHTML += "        <div id=\"draggableResponseContent_" + response.id + "\" class=\"draggableResponseContent displayTableCell\" style=\"width:100%;\"><div style=\"display:inline;\">" + htmlDecode(response.text) + "</div></div>";
        }
        categorizationResponsesHTML += "    </div>";//end response
    }
    categorizationResponsesHTML += "</div>";//categorizationResponsesDiv
    $("#responseContainerCell_" + activityComponent.id).append(categorizationResponsesHTML);
    var minColHeight = "100%"
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        $("#responsesContainer_" + activityComponent.prompts[i].id).data("activitycomponentid", activityComponent.id)
        var promptLoadedEvent = $.Event("promptLoaded");
        promptLoadedEvent.containerElement = $("#promptNoteCell_" + activityComponent.prompts[i].id);
        promptLoadedEvent.prompt = activityComponent.prompts[i];
        $(document).trigger(promptLoadedEvent);
    }
}

function columnPromptHeightFixer(activityComponentId)
{
    //This function will force the droptarget divs height to match the responses column div height.
    //Had to implement on first click since height is 0px at initialization time.
    var currentHeight;
    if (!$("#categorizationResponsesDiv_" + activityComponentId).data("heightadjusted"))
    {
        $("#categorizationTableBody_" + activityComponentId).find('[id*="responsesContainer_"]').each(function ()
        {
            $(this).css("min-height", $("#categorizationResponsesDiv_" + activityComponentId).css("min-height"));
        });

        currentHeight = $("#categorizationResponsesDiv_" + activityComponentId).css("height");
        $("#categorizationResponsesDiv_" + activityComponentId).css("min-height", currentHeight);
        $("#categorizationResponsesDiv_" + activityComponentId).data("heightadjusted", "true");
    }
}

function columnResponseHeightFixer(activityComponentId)
{
    //This function will force the responses culumn to be the height of the tallest prompt column
    //Called when responses are dropped into a prompt column 
    var currentHeight = 0;
    var maxHeight = 0;
//    $("#categorizationResponsesDiv_" + activityComponentId).removeAttr("style")
    $("#categorizationTableBody_"+activityComponentId).find('[id*="responsesContainer_"]').each(function ()
    {
        maxHeight = currentHeight < $(this).height() ? $(this).height() : currentHeight
    });
//    $("#categorizationResponsesDiv_" + activityComponentId).css("height", maxHeight);
//    $("#categorizationResponsesDiv_" + activityComponentId).css("min-height", maxHeight);
}


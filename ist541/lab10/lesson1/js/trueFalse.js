function buildTrueFalseHeaderMarkup(activityComponent, renderRTL, arbitraryHdrWidth)
{
	var responseCnt = activityComponent.prompts[0].responses.length;
	var promptColumnWidth = 100 - (responseCnt*arbitraryHdrWidth);
	var hdrsColumnWidth = (responseCnt*arbitraryHdrWidth);
	var headers = activityComponent.prompts[0].responses;
	var headerColumnWidth = 100 / activityComponent.prompts[0].responses.length

	function buildHeadersHTML() {
		var headersHTML = "";
		headersHTML += spf('<div id="actyHeader_~" class="displayTable" style="table-layout: fixed;">', [activityComponent.id] );
		//headersHTML += '  <div class="displayTableRow">';
		for(var i=0, j=headers.length-1; i<headers.length; i++, j--) {
			headersHTML += spf('<div class="trueFalseHeader displayTableCell" style="width: ~%; text-align: center;">~</div>',
				[headerColumnWidth, (renderRTL) ? htmlDecode(headers[j].text) : htmlDecode(headers[i].text)] );			
		}
		//headersHTML += '  </div>';
		headersHTML += '</div>';

		return headersHTML;
	}

	actyTableHTML = "";
	actyTableHTML += spf('<div id="trueFalseActivity_~" class="displayTable">', [activityComponent.id] );
	actyTableHTML += '  <div class="displayTableRow">';
	actyTableHTML += spf('    <div class="displayTableCell" style="width:~%">~</div>', [(renderRTL) ? hdrsColumnWidth : promptColumnWidth, (renderRTL) ? buildHeadersHTML() : "&nbsp;"] );
	actyTableHTML += spf('    <div class="displayTableCell" style="width:~%">~</div>', [(renderRTL) ? promptColumnWidth : hdrsColumnWidth, (renderRTL) ? "&nbsp;" : buildHeadersHTML()] );
	actyTableHTML += '  </div>';
	actyTableHTML += '</div>';

    return actyTableHTML;
}

function loadTrueFalsePrompt(containerElement, activityComponent, prompt)
{
	var arbitraryHdrWidth = 12;
	var promptColumnWidth = 100 - (prompt.responses.length*arbitraryHdrWidth);
	var backgroundColor = (prompt.promptIndex % 2 == 0) ? "light" : "dark";
	if (prompt.promptIndex == 0 && $("#actyHeader_" + activityComponent.id).length <= 0)
	{
        containerElement.append( buildTrueFalseHeaderMarkup(activityComponent, prompt.renderRTL, arbitraryHdrWidth) );
	}
	var trueFalseItemHTML = "";
	//inlineToolBox
	trueFalseItemHTML += "<div id=\"promptFeedbackToolBox_" + prompt.id + "\" class=\"inlineToolBox\" style=\"display:none;\"></div>";

	trueFalseItemHTML += spf('<div class="tabDetail trueFalseDetails displayTableRow ~" style="~">', [backgroundColor, (prompt.promptTabs ? "display:none;" : "" )] );
    //PROMPT
    var trueFalseItemPromptHTML = "";
    trueFalseItemPromptHTML += spf('  <div id="prompt_~" class="displayTableCell prompt" style="width:~%;">', [prompt.id, promptColumnWidth])
    trueFalseItemPromptHTML += '    <div class="displayTable promptComplex">';  //Prompt Table
    var itemFeedbackHTML = '      <div id="promptFeedbackContainer_'+prompt.id+'" class="displayTableCell feedbackContainer promptFeedbackContainer"></div>';  // Feedback Container
    var itemPromptHTML = spf('      <div class="displayTableCell promptTextContainer">~</div>', [htmlDecode(prompt.text)]);
    var promptNoteCellHTML = '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    if (prompt.renderRTL)
    {
		trueFalseItemPromptHTML += spf( '~~~', [promptNoteCellHTML, itemPromptHTML, itemFeedbackHTML] );
	}
    else
    {
		trueFalseItemPromptHTML += spf( '~~~', [itemFeedbackHTML, itemPromptHTML, promptNoteCellHTML] );
	}
	trueFalseItemPromptHTML += '    </div>';
    trueFalseItemPromptHTML += '  </div>';
    //Responses
	var trueFalseItemResponseHTML = ""; 
	trueFalseItemResponseHTML += '  <div class="displayTableCell" style="vertical-align: top;">';
	trueFalseItemResponseHTML += spf('    <div id="responsesContainer_~" class="displayTable responseContainer"></div>', [prompt.id] );
	trueFalseItemResponseHTML += '  </div>';
	
	if( prompt.renderRTL ) {
		trueFalseItemHTML += spf('~~', [trueFalseItemResponseHTML, trueFalseItemPromptHTML] );
	}
	else {
		trueFalseItemHTML += spf('~~', [trueFalseItemPromptHTML, trueFalseItemResponseHTML] );
	}

	trueFalseItemHTML += '</div>';
	$("#trueFalseActivity_"+activityComponent.id).append( trueFalseItemHTML ); 

    var responsesDiv = $("#responsesContainer_" + prompt.id);

    //---parameters for response
//    var buttonType = (numCorrectResponses(prompt) == 1) ? 1 : 0; //determines if the input should be treated like a multiple select
    var buttonType = 0;
    //Render mode override.
    if (activityComponent.renderModeLayout == "checkboxOnly")
    {
    	buttonType = 0;
    }

    //Order reversed if RTL
    var responseCount = (activityComponent.prompts.length <= 0) ? 0 : activityComponent.prompts[0].responses.length
    if (!prompt.renderRTL)
    {
        for (var i = 0; i < prompt.responses.length; i++)
        {
            loadResponse(responsesDiv, prompt, prompt.responses[i]);
        }
    }
    else
    {
        for (var i = prompt.responses.length - 1; i >= 0; i--)
        {
            loadResponse(responsesDiv, prompt, prompt.responses[i]);
        }
    }
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function loadTrueFalseResponse(containerElement, prompt, response)
{
    /* Note: the #actyHeader_ must be hidden initially so that the widths can be returned as % - fix for
	browser returning pixel rather than percentage width. The #actyHeader_ is then displayed at the end of this function.*/
    $("#actyHeader_"+prompt.activityComponentId).hide();
    var headerWidth = $("#actyHeader_" + prompt.activityComponentId).find(".trueFalseHeader").css("width");

    var responseHTML = "<div id=\"response_"+response.id+"\" class=\"displayTableCell response responseTrueFalse\" style=\"width:"+headerWidth+";\">";

    var responseFeedbackHTML = spf('<div id="responseFeedbackContainer_~" class="feedbackContainer displayTableCell" style="width:33%; text-align:~;"></div>', [response.id, (prompt.renderRTL) ? "right" : "left"]);
    var responseSpacerHTML = '<div class="displayTableCell" style="width:33%;">&nbsp;</div>';//Spacer
    var inputIcon = (prompt.radioButton) ? radioOffIcon : checkBoxOffIcon;
    var inputClass = (prompt.radioButton) ? "customRadio fa-stack" : "customCheckbox fa-stack";
    var type = (prompt.radioButton) ? "radio" : "checkbox";
    var responseRadioHTML = "<div class=\"displayTableCell\" style=\"width:33%;\"><span class=\""+inputClass+"\" id=\"responseInput_"+response.id+"\" data-type=\""+type+"\" data-responseid=\""+response.id+"\"><i class=\""+inputIcon+"\"></i></span></div>";

    responseHTML += '<div class="displayTable">';
	if(prompt.renderRTL) {
		responseHTML += spf( '~~~', [responseFeedbackHTML, responseRadioHTML, responseSpacerHTML] );
	}
	else {
	    responseHTML += spf( '~~~', [responseSpacerHTML, responseRadioHTML, responseFeedbackHTML] );
    }
    responseHTML += '</div>'
    responseHTML += '</div>'

    containerElement.append(responseHTML);
    $("#actyHeader_" + prompt.activityComponentId).show();//now show the response parents now that widths are calculated as % instead of pixels
}
function loadPresentationPrompt(containerElement, activityComponent, prompt)
{
    var activityPresentationsDivHTML;
    activityPresentationsDivHTML = spf('<div id="presentationDiv_~" class="presentationDiv">', [prompt.id] );
    activityPresentationsDivHTML += '<div class="displayTable">'
    if(prompt.renderRTL){
        activityPresentationsDivHTML += '<div id="promptNoteCell_'+prompt.id+'" class="displayTableCell noteCell"></div>';

        activityPresentationsDivHTML += '<div class="displayTableCell contentCell" style="width:100%;">';
        activityPresentationsDivHTML += htmlDecode(prompt.text);
        activityPresentationsDivHTML += '</div>';

        activityPresentationsDivHTML += '<div class="displayTableCell" style="width: 3em;">';
        activityPresentationsDivHTML += '&nbsp;'
        activityPresentationsDivHTML += '</div>';
    }

    if(!prompt.renderRTL){
        activityPresentationsDivHTML += '<div class="displayTableCell" style="width: 3em;">';
        activityPresentationsDivHTML += '&nbsp;'
        activityPresentationsDivHTML += '</div>';

        activityPresentationsDivHTML += '<div class="displayTableCell contentCell" style="width:100%;">';
        activityPresentationsDivHTML += htmlDecode(prompt.text);
        activityPresentationsDivHTML += '</div>';

        activityPresentationsDivHTML += '<div id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>';
    }
    activityPresentationsDivHTML += '</div>';
    activityPresentationsDivHTML += '</div>';

    if (prompt.promptTabs) {
            var componentTabDetailDiv = $('<div class="tabDetail presentationDetails" style="display:none;"></div>');
            containerElement.append(componentTabDetailDiv);
            componentTabDetailDiv.append(activityPresentationsDivHTML);
        } else {
            var tabDetail = $('<div class="tabDetail"></div>')
            tabDetail.append(activityPresentationsDivHTML);
            containerElement.append(tabDetail);
    }
    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_" + prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}
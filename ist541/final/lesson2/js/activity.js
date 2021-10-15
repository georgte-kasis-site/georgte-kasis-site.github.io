function loadActivity(containerElement, activity)
{
    containerElement.html("");
    var layout = false;
    if((activity.layoutId > 0)&&(activity.layoutId < activityLayouts.length))
    {
        layout = activityLayouts[activity.layoutId];
        containerElement.append(generateLayoutTableMarkup(activity));
    }
    for (var i = 0; i < activity.activityComponents.length; i++)
    {
        if(layout && i < layout.numCells)
            containerElement = $("#layoutTableCell_"+activity.id+"_"+(i+1));
        loadActivityComponent(containerElement, activity.activityComponents[i]);
    }

    if (activity.behaviorType > 0)
    {
        containerElement.append("<div id=\"hiddenActivityBtnContainer_" + activity.id + "\" class=\"componentBtnContainer right\"><span id=\"activityCompletionBtn_" + activity.id + "\" class=\"activityButton checkAnswerBtn green\" style=\"display:none; white-space:nowrap; padding:.5em;\"><i class=\"fa fa-check\"></i><span> Mark As Done</span></span></div>");
    }

    var activityLoadedEvent = $.Event("activityLoaded");
    activityLoadedEvent.activity = activity;
    activityLoadedEvent.containerElement = containerElement;
    $(document).trigger(activityLoadedEvent);
}

function generateLayoutTableMarkup(activity)
{
    var layoutTableHTML = '<table class="layoutTable">';
    if (activity.layoutId == 1)
    {
        layoutTableHTML += '<tr>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_1"></div></td>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_2"></div></td>';
        layoutTableHTML += '</tr>';
    }
    else if (activity.layoutId == 2)
    {
        layoutTableHTML += '<tr>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_1"></div></td>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_2"></div></td>';
        layoutTableHTML += '</tr>';
        layoutTableHTML += '<tr>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_3"></div></td>';
        layoutTableHTML += '<td style="width:50%; vertical-align:top;"><div id="layoutTableCell_' + activity.id + '_4"></div></td>';
        layoutTableHTML += '</tr>';
    }
    layoutTableHTML += '</table>';
    return layoutTableHTML;
}


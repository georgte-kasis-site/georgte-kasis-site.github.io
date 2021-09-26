function loadModule(containerElement, m)
{
    if (typeof (module.languages) != "undefined")
    {
        for (var l = 0; l < module.languages.length; l++)
        {
            if (module.languages[l].font.length > 0)
            {
                addLanguageFontClass($("head"), module.languages, l);
                languageFontSV = module.languages[l];
                setLanguageFontSV($("body"));
                break;
            }
        }
    }
    if (module.description.length > 0 || module.objectives.length > 0)
    {
        loadModuleIntro($("#panel_0"), module);
    }
    if (module.activities.length > 0)
    {
        for (var i = 0; i < module.activities.length; i++)
        {
            loadActivity($("#panel_" + module.activities[i].index), module.activities[i]);
        }
    }
    if ((typeof (module.hiddenActivities) != "undefined") && module.hiddenActivities && module.hiddenActivities.length > 0)
    {
        for (var h = 0; h < module.hiddenActivities.length; h++)
        {
            loadActivity($("#hiddenPanel_" + module.hiddenActivities[h].id), module.hiddenActivities[h]);
        }
    }
    var moduleLoadedEvent = $.Event("moduleLoaded");
    moduleLoadedEvent.containerElement = containerElement;
    $(document).trigger(moduleLoadedEvent);
}

function loadModuleIntro(containerElement, module)
{
    var introContainerMarkup = "<div id=\"introDiv\" class=\"introDiv\">";
    var moduleTitle = stripRTLDiv(htmlDecode(module.title))
    introContainerMarkup += "   <h1 " + (moduleTitle.rtl ? "dir=\"rtl\"" : "") + " style=\"padding-top:0;\">" + moduleTitle.text + "</h1>";

    if (module.description.length > 0)
    {
        introContainerMarkup += "   <div class=\"displayTable\"><div class=\"displayTableCell\"><div class=\"descriptionTxt nested bottomBuffer\">" + htmlDecode(module.description) + "</div></div></div>";
    }
    if (module.objectives.length > 0)
    {
        introContainerMarkup += "   <h4 class='introObjectivesHeader'>Objectives</h4>";
        introContainerMarkup += "   <div class=\"objectiveTxt nested bottomBuffer\">"
        for (var i = 0; i < module.objectives.length; i++)
        {
            introContainerMarkup += "       <div>" + htmlDecode(module.objectives[i].text) + "</div>";
        }
        introContainerMarkup += "   </div>";
    }
    introContainerMarkup += "  </div>";
    containerElement.html(introContainerMarkup);
    var introDiv = $("#introDiv");
    glossText(introDiv);
    setupUcatMedia(introDiv, module.moduleFeatures.mediaOptions);
}

function glossText(containerElement)
{
    containerElement.find(".textGloss").each(function ()
    {
        var glossTextSpan = $(this);
        var glossText = glossTextSpan.data("texttodisplay");
        var glossTextDir = glossTextSpan.data("rtl");
        if (glossText.length > 0)
        {
            glossTextSpan.addClass("tTipLexical");
            glossTextSpan.css("cursor", "help");
            var elementDataString = htmlDecode(glossText);
            initToolTip({ "element": glossTextSpan, "elementDataString": elementDataString, "tooltipClass": "lightVersion", "tooltipDelay": 200, "tooltipRTL": glossTextDir })
        }
        else
        {
            glossTextSpan.removeClass("textGloss");
        }
    });
}

function setupTranslations(containerElement)
{
    if(typeof(containerElement) == "undefined")
        containerElement = $("#scaffoldPanel");
    containerElement.find(".translationOuterContainerDiv").each(function()
    {
        var translationOuterContainerDiv = $(this);
        var counter = 0;
        translationOuterContainerDiv.find(".translationContainer").each(function()
        {
            var translationContainer = $(this);
            var translationHeader = translationContainer.children(".translationHeader").first();
            var languageId = translationContainer.data("languageid");
            var languageTitle = translationContainer.data("languagetitle");
            translationHeader.css("cursor", "pointer");
            translationHeader.html(languageTitle+" (click to translate)");
            translationHeader.click(function()
            {
                translateContent(translationOuterContainerDiv, languageId);
            });
            if(counter != 0)
                translationContainer.hide();
            counter++;
        });
    });
}

function translateContent(translationOuterContainerDiv, currentLanguageId)
{
    translationOuterContainerDiv.find(".translationContainer").each(function()
    {
        var translationContainer = $(this);
        var languageId = translationContainer.data("languageid");
        var languageTitle = translationContainer.data("languagetitle");
        if(languageId == currentLanguageId)
        {
            translationContainer.hide();
        }
        else
        {
            translationContainer.show();
        }
    });
}

function getResource(resourceId)
{
    for (var r = 0; r < module.resources.length; r++)
    {
        if (module.resources[r].id == resourceId)
        {
            return module.resources[r];
        }
    }
    return false;
}

function getActivity(activityId)
{
    for (var i = 0; i < module.activities.length; i++)
    {
        if (module.activities[i].id == activityId)
        {
            return module.activities[i];
        }
    }
    return false;
}

function getActivityComponent(activityComponentId)
{
    for (var i = 0; i < module.activities.length; i++)
    {
        for (var j = 0; j < module.activities[i].activityComponents.length; j++)
        {
            if (module.activities[i].activityComponents[j].id == activityComponentId)
                return module.activities[i].activityComponents[j];
        }
    }
    return false;
}

function getPromptById(promptId)
{
    for (var i = 0; i < module.activities.length; i++)
    {
        for (var j = 0; j < module.activities[i].activityComponents.length; j++)
        {
            for (var k = 0; k < module.activities[i].activityComponents[j].prompts.length; k++)
            {
                if (module.activities[i].activityComponents[j].prompts[k].id == promptId)
                    return module.activities[i].activityComponents[j].prompts[k];
            }
        }
    }
    return false;
}

function getResponseById(responseId)
{
    for (var i = 0; i < module.activities.length; i++)
    {
        for (var j = 0; j < module.activities[i].activityComponents.length; j++)
        {
            for (var k = 0; k < module.activities[i].activityComponents[j].prompts.length; k++)
            {
                for (var l = 0; l < module.activities[i].activityComponents[j].prompts[k].responses.length; l++)
                {
                    if (module.activities[i].activityComponents[j].prompts[k].responses[l].id == responseId)
                        return module.activities[i].activityComponents[j].prompts[k].responses[l];
                }
            }
        }
    }
    return false;
}

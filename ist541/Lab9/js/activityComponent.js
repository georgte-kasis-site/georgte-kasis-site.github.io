var genericRenderModeLayouts = ["default", "checkboxOnly"];

function loadActivityComponent(containerElement, activityComponent)
{
    //---Render initial Containers and Define jQuery Objects
    var activityComponentDivHTML = "<div id=\"componentContainer_" + activityComponent.id + "\" class=\"componentContainer\">";
    activityComponentDivHTML += "   <div id=\"componentDetails_" + activityComponent.id + "\" class=\"componentDetails\" data-component=\"" + activityComponent.componentTitle + "\"></div>";
    activityComponentDivHTML += "</div>";
    containerElement.append(activityComponentDivHTML);

    var containerDetailsDiv = $("#componentDetails_" + activityComponent.id);
    containerDetailsDiv.show();
    activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    activityComponent.renderModeIndex = getRenderModeLayoutIndex(activityComponent);
    if (typeof (activityComponent.renderModeLayout) == "undefined")
        activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    //OVERRIDE UNSUPPORTED COMPONENT CONFIGURATION OPTIONS
    switch (activityComponent.componentTitle.toUpperCase())
    {
        case "CATEGORIZATION":
            activityComponent.promptsPerPage = 0
            break;
        case "FILLINTHEBLANK":
            break;
        case "FINDANDCLICK":
            break;
        case "MATCHING":
            activityComponent.promptsPerPage = 0
            break;
        case "ORDERING":
            break;
        case "PRESENTATION":
            break;
        case "SHORTANSWER":
            break;
        case "SPEAKING":
            break;
        case "TEXTSELECTOR":
            break;
        case "TRANSCRIPTION":
            if (activityComponent.renderModeLayout == 1)
                activityComponent.promptsPerPage = 0;
            break;
        case "TRUEFALSE":
            break;
        case "WRITING":
            break;
        default:
    }
    activityComponent.mediaOptions = copyGlobalVariable(module.moduleFeatures.mediaOptions);
    activityComponent.mediaOptions.videosize = getActivityComponentVideoSize(activityComponent);
    window[resolveActivityComponentFunctionName("load" + activityComponent.componentTitle + "ActivityComponent", "loadGenericActivityComponent")](containerDetailsDiv, activityComponent);

    setupUcatMedia(containerDetailsDiv, activityComponent.mediaOptions);
    glossText(containerDetailsDiv);
    var activityComponentLoadedEvent = $.Event("activityComponentLoaded");
    activityComponentLoadedEvent.activityComponent = activityComponent;
    $(document).trigger(activityComponentLoadedEvent);
}

function getActivityComponentVideoSize(activityComponent)
{
    var videoSize = standardVideoPlayer;
    switch (activityComponent.componentTitle.toLowerCase())
    {
        case "categorization":
        case "fillintheblank":
        case "generic":
        case "textselector":
        case "truefalse":
            videoSize = smallVideoPlayer;
            break;
        case "matching":
            videoSize = tinyVideoPlayer;
            break;
        case "ordering":
            videoSize = tinyVideoPlayer;
            break;
        default:
    }
    return videoSize;
}

function refreshActivityComponent(activityComponent)
{
    var containerDetailsDiv = $("#componentDetails_" + activityComponent.id);
    containerDetailsDiv.html("");
    window[resolveActivityComponentFunctionName("load" + activityComponent.componentTitle + "ActivityComponent", "loadGenericActivityComponent")](containerDetailsDiv, activityComponent);

    glossText(containerDetailsDiv);
    setupUcatMedia(containerDetailsDiv, activityComponent.mediaOptions);

    var activityComponentLoadedEvent = $.Event("activityComponentLoaded");
    activityComponentLoadedEvent.activityComponent = activityComponent;
    $(document).trigger(activityComponentLoadedEvent);
}

function loadGenericActivityComponent(containerElement, activityComponent)
{
    if (typeof (activityComponent.renderModeLayout) == "undefined")
        activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    var promptTabs = (activityComponent.promptsPerPage > 0);
    if (activityComponent.randomizePrompts)
        shuffle(activityComponent.prompts);

    if (activityComponent.instructions.length > 0){
        loadGenericInstructions(containerElement, activityComponent);
    }

    if (promptTabs)
        loadComponentTabBar(containerElement, activityComponent);

    var renderRTL = activityComponent.renderRTL;
    var tabDetailsHTML = "<div id=\"tabDetails_" + activityComponent.id + "\" class=\"tabDetails " + (promptTabs ? "tabDetailsWithTabs" : "") + "\"></div>";
    containerElement.append(tabDetailsHTML);

    var tabDetails = $("#tabDetails_"+activityComponent.id);

    tabDetails.append(generateActivityComponentPresentationHTML(activityComponent));
    for (var i = 0; i < activityComponent.prompts.length; i++)
    {
        activityComponent.prompts[i].promptIndex = i;
        loadPrompt(tabDetails, activityComponent, activityComponent.prompts[i]);
    }

    if (promptTabs)
    {
        openFirstTab(activityComponent);
    }
}

function loadGenericInstructions(containerElement, activityComponent)
{
    var instructionsHTML = "<div id=\"componentInstructions_" + activityComponent.id + "\" class=\"componentInstructions instructionsOn\">";
    instructionsHTML += "   <table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" class=\"" + (activityComponent.renderRTL ? "RTLTable" : "LTRTable") + "\">";
    instructionsHTML += "       <tr>";
    instructionsHTML += "           <td style=\"vertical-align:top;\">";
    instructionsHTML += "               <div class=\"instructionHdr\" id=\"instructionsHeader_" + activityComponent.id + "\"><div class=\"instructionBtn\"><i class=\"" + instructionIcon + "\"></i></div></div>";
    instructionsHTML += "           </td>";
    instructionsHTML += "           <td style=\"vertical-align:top; width:100%\">";
    instructionsHTML += "               <div class=\"instructionText\" id=\"instructionText_"+activityComponent.id+"\">"+htmlDecode(activityComponent.instructions)+"</div>";
    instructionsHTML += "           </td>";
    instructionsHTML += "       </tr>";
    instructionsHTML += "   </table>";
    instructionsHTML += "</div>";
    containerElement.append(instructionsHTML);

    var instructionsHdrHTML = $("#instructionsHeader_" + activityComponent.id)
    instructionsHdrHTML.bind("click", function ()
    {
        var componentInstructions = $("#componentInstructions_" + activityComponent.id);
        if (componentInstructions.hasClass("instructionsOn"))
        {
            $("#instructionText_" + activityComponent.id).hide("blind", { direction: "up" }, "fast", function ()
            {
                componentInstructions.stop().animate(
                {
                    width: "2.7em",
                    duration: "fast"
                },
                function ()
                {
                    $(this).removeClass("instructionsOn").addClass("instructionsOff");
                    $(this).css({ "position": "absolute" });
                    componentInstructions.removeClass("instructionsOn")
                    componentInstructions.removeClass("componentInstructions");
                    componentInstructions.addClass("instructionsOff");
                });
            });
        }
        else
        {
            componentInstructions.removeClass("instructionsOff")
            componentInstructions.addClass("instructionsOn")
            componentInstructions.addClass("componentInstructions");
            componentInstructions.css({ "position": "relative" });
            componentInstructions.stop().animate(
            {
                width: "100%",
                duration: "fast",
            },
            function ()
            {
                $(this).find(".instructionBtn").each(function ()
                {
                    $("#instructionText_" + activityComponent.id).show("blind", { direction: "up" }, "fast");
                });
            });
        }
    });
}

function generateActivityComponentPresentationHTML(activityComponent)
{
    if (activityComponent.presentation && (activityComponent.presentation.length > 0))
    {
        var presentationHTML = "<div id=\"componentPresentation_" + activityComponent.id + "\" class=\"componentPresentation\">";
        presentationHTML += htmlDecode(activityComponent.presentation);
        presentationHTML += "</div>";
        return presentationHTML;
    }
    return "";
}

function loadPrompt(containerElement, activityComponent, prompt)
{
    prompt.componentTitle = activityComponent.componentTitle;
    prompt.renderModeLayout = activityComponent.renderModeLayout;
    prompt.renderRTL = activityComponent.renderRTL;
    prompt.randomizeResponses = activityComponent.randomizeResponses;
    prompt.promptTabs = (activityComponent.promptsPerPage > 0);
    window[resolveActivityComponentFunctionName("load" + activityComponent.componentTitle + "Prompt", "loadGenericPrompt")](containerElement, activityComponent, prompt);
}

function loadGenericPrompt(containerElement, activityComponent, prompt)
{
    var componentTabDetailDiv = $(spf('<div class="tabDetail ~Details" ~></div>', [activityComponent.componentTitle, (prompt.promptTabs ? ' style="display:none;"' : "")]));
    containerElement.append(componentTabDetailDiv);
    //DOM STRUCTURE
    var firstPromptClass = prompt.promptIndex == 0 ? "firstPrompt" : "";
    var promptHTML = spf('<div id="prompt_~" class="prompt ~">', [prompt.id, firstPromptClass]);
    promptHTML += '<div class="displayTable">'
    if (!prompt.renderRTL)
    {
        promptHTML += '<div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell feedbackContainer promptFeedbackContainer"><div class="inlineToolBoxContainer"><div id="promptFeedbackToolBox_' + prompt.id +'" class="inlineToolBox" style="display:none;"></div></div></div>'//FeedbackContainer
        promptHTML += '<div class="displayTableCell contentCell" style="width:100%;">'
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptNoteCell_'+prompt.id+'" class="displayTableCell noteCell">'
        promptHTML += '</div>'
    }
    else
    {
        promptHTML += '<div  id="promptNoteCell_' + prompt.id + '" class="displayTableCell noteCell"></div>'
        promptHTML += '<div class="displayTableCell contentCell" style="width:100%;">'
        promptHTML += htmlDecode(prompt.text);
        promptHTML += '</div>';
        promptHTML += '<div id="promptFeedbackContainer_' + prompt.id + '" class="displayTableCell feedbackContainer promptFeedbackContainer"><div class="inlineToolBoxContainer"><div id="promptFeedbackToolBox_' + prompt.id +'" class="inlineToolBox" style="display:none;"></div></div></div>'
    }
    promptHTML += '</div>';
    promptHTML += '</div>';
    componentTabDetailDiv.append(promptHTML);

    //---Begin Response Buiding
    var responsesDiv = $(spf('<div id="responsesContainer_~" class="responseContainer"></div>', [prompt.id]));
    componentTabDetailDiv.append(responsesDiv);
    //---parameters for response
    if ((typeof(prompt.responses) != "undefined") && prompt.randomizeResponses)
        shuffle(prompt.responses);
    var loadResponseFunctionName = resolveActivityComponentFunctionName("load" + activityComponent.componentTitle + "Response", "loadResponse");
    //---Begin Respnse Building

    if ((typeof (prompt.responses) != "undefined"))
    {
        for (var i = 0; i < prompt.responses.length; i++)
        {
            prompt.responses[i].responseIndex = i;
            loadResponse(responsesDiv, prompt, prompt.responses[i]);
        }
    }

    var promptLoadedEvent = $.Event("promptLoaded");
    promptLoadedEvent.containerElement = $("#promptNoteCell_"+prompt.id);
    promptLoadedEvent.prompt = prompt;
    $(document).trigger(promptLoadedEvent);
}

function loadResponse(containerElement, prompt, response)
{
    response.componentTitle = prompt.componentTitle;
    window[resolveActivityComponentFunctionName("load" + prompt.componentTitle + "Response", "loadGenericResponse")](containerElement, prompt, response);
}

function loadGenericResponse(containerElement, prompt, response)
{
    var renderRTLClass = (prompt.renderRTL) ? "responseLabelRTL" : "";
    var responseHTML = spf('<div id="response_~" class="response ~ displayTable">', [response.id, renderRTLClass]);

    if (!prompt.renderRTL)
    {
        responseHTML += '<div id="responseFeedbackContainer_' + response.id + '" class="displayTableCell feedbackContainer"></div>'
        responseHTML += '<div class="displayTableCell" style="width:2.65em; text-align: center;">'
        var inputType = prompt.renderModeLayout == "default" ? "radio" : "checkbox";
        responseHTML += "<div id=\"responseContainer_" + response.id + "\" class=\"customInputWrapper\">";
        if (prompt.renderModeLayout == "checkboxOnly")
        {
            responseHTML += spf('<span class="customCheckbox fa-stack" style="display:inline-block" id="responseInput_~"  data-type="~" data-responseid="~" data-checked=""><i class="' + checkBoxOffIcon + '"></i></span>', [response.id, inputType, response.id]);
        }
        else
        {
            //mixed mode
            if (prompt.radioButton)
            {
                responseHTML += spf('<span class="customRadio fa-stack" style="display:inline-block" id="responseInput_~" data-type="radio" data-responseid="~" data-checked=""><i class="' + radioOffIcon + '"></i></span>', [response.id, response.id]);
            } else
            {
                responseHTML += spf('<span class="customCheckbox fa-stack" style="display:inline-block" id="responseInput_~"  data-type="checkbox" data-responseid="~" data-checked=""><i class="' + checkBoxOffIcon + '"></i></span>', [response.id, response.id]);
            }
        }
        responseHTML += "</div>"
        responseHTML += "</div>"
        responseHTML += "<div id=\"responseLabel_" + response.id + "\" style=\"width:100%;\" class=\"displayTableCell customInputWrapper\">";
        responseHTML += spf('<span class="customInputWrapperLabel">~</span>', [htmlDecode(response.text)]);
        responseHTML += "</div>"
    }
    else
    {
        responseHTML += "<div id=\"responseLabel_" + response.id + "\" style=\"width:100%;\" class=\"displayTableCell customInputWrapper\">";
        responseHTML += spf('<span class="customInputWrapperLabel">~</span>', [htmlDecode(response.text)]);
        responseHTML += "</div>"
        responseHTML += '<div class="displayTableCell" style="width:2.65em; text-align: center;">'
        var inputType = prompt.renderModeLayout == "default" ? "radio" : "checkbox";
        responseHTML += "<div id=\"responseContainer_" + response.id + "\" class=\"customInputWrapper\">";
        if (prompt.renderModeLayout == "checkboxOnly")
        {
            responseHTML += spf('<span class="customRadio fa-stack" style="display:inline-block" id="responseInput_~"  data-type="~" data-responseid="~" data-checked=""><i class="' + checkBoxOffIcon + '"></i></span>', [response.id, inputType, response.id]);
        } else
        {
            //mixed mode
            if (prompt.radioButton)
            {
                responseHTML += spf('<span class="customRadio fa-stack" style="display:inline-block" id="responseInput_~" data-type="radio" data-responseid="~" data-checked=""><i class="' + radioOffIcon + '"></i></span>', [response.id, response.id]);
            } else
            {
                responseHTML += spf('<span class="customCheckbox fa-stack" style="display:inline-block" id="responseInput_~" data-type="checkbox" data-responseid="~" data-checked=""><i class="' + checkBoxOffIcon + '"></i></span>', [response.id, response.id]);
            }
        }
        responseHTML += "</div>"
        responseHTML += "</div>"
        responseHTML += '<div id="responseFeedbackContainer_' + response.id + '" class="displayTableCell feedbackContainer"></div>'
    }

    responseHTML += "</div>"
    containerElement.append(responseHTML);

    //CALL THIS AFTER EACH RESPONSE IS LOADED PER PROMPT and PER ACTIVITY COMPONENT
    var loadedPrompts = $("#componentContainer_" + prompt.activityComponentId).data("loadedPrompts");
    loadedPrompts++;
    $("#componentContainer_" + prompt.activityComponentId).data("loadedPrompts", loadedPrompts);
}

function toggleInput(promptId, responseId, radioButton, renderModeLayout)
{
    var inputToggledOn;
    var responseElement = $("#response_" + responseId)

    if (!responseElement.hasClass("locked"))
    {
        if (renderModeLayout == "checkboxOnly")
        {
            var containerElement = $("#responseContainer_" + responseId);
            var inputElement = $("#responseInput_" + responseId);
            if (inputElement.data("checked"))
            {
                inputElement.data("checked", false);
                responseElement.data("studentAnswer", false);
                inputElement.html('<i class="' + checkBoxOffIcon + '"></i>');
                inputToggledOn = false;
            }
            else
            {
                inputElement.data("checked", true);
                responseElement.data("studentAnswer", true);
                inputElement.html('<i class="' + checkBoxOnIcon + '"></i><i class="' + checkBoxOnIconInside + '"></i>');
                inputToggledOn = true;
            }
        }
        else
        {
            //mixed mode
            if (radioButton)
            {
                var radioGroupContainer = $("#responsesContainer_" + promptId);
                //uncheck the radio group and reset;
                radioGroupContainer.find('*[data-type="radio"]').each(function ()
                {
                    $(this).data("checked", false);
                    $(this).html('<i class="' + radioOffIcon + '"></i>')
                });
                //FInd all the respoonses and mark studentAnswer as false
                radioGroupContainer.find(".response").each(function ()
                {
                    $(this).data("studentAnswer", false);
                });
                //set the radio to students selection
                var inputElement = $("#responseInput_" + responseId);
                inputElement.data("checked", true);
                responseElement.data("studentAnswer", true);
                inputElement.html('<i class="' + radioOnIcon + '"></i><i class="' + radioOnIconInside + '"></i>');
                inputToggledOn = true;
            }
            else
            {
                var containerElement = $("#responseContainer_" + responseId);
                var inputElement = $("#responseInput_" + responseId);
                if (inputElement.data("checked"))
                {
                    inputElement.data("checked", false);
                    responseElement.data("studentAnswer", false);
                    inputElement.html('<i class="' + checkBoxOffIcon + '"></i>');
                    inputToggledOn = false;
                }
                else
                {
                    inputElement.data("checked", true);
                    responseElement.data("studentAnswer", true);
                    inputElement.html('<i class="' + checkBoxOnIcon + '"></i><i class="' + checkBoxOnIconInside + '"></i>');
                    inputToggledOn = true;
                }
            }
        }
    }
    return inputToggledOn;
}

function loadComponentTabBar(containerElement, activityComponent)
{
    containerElement.append("<div id=\"componentTabBar_" + activityComponent.id + "\" class=\"componentTabBar " + ((activityComponent.renderRTL) ? "componentTabBarRTL" : "") + "\"></div>");
    var componentTabBar = $("#componentTabBar_" + activityComponent.id);
    if (activityComponent.promptsPerPage)
    {
        //loadActivityComponent(activityComponent, 1, activityComponent.renderRTL);
        var currentPage = 1;
        var numPagerLinks = activityComponent.prompts.length;
        var startIndex = 1;
        var showFirstLastLinks = false;
        var pageCount = Math.ceil(numPagerLinks / activityComponent.promptsPerPage);
        if (numPagerLinks < pageCount)
        {
            showFirstLastLinks = true;
            startIndex = Math.ceil(currentPage - (numPagerLinks / 2)) <= 0 ? 1 : Math.ceil(currentPage - (numPagerLinks / 2));
        }

        var endIndex = startIndex + numPagerLinks - 1;
        if (endIndex > pageCount)
        {
            if (numPagerLinks < pageCount)
            {
                endIndex = pageCount;
                startIndex = pageCount - numPagerLinks;
            }
            else
            {
                endIndex = pageCount;
                startIndex = 1;
            }
        }
        if (pageCount > 1)
        {
            componentTabBar.html("<span id=\"tabContainer_" + activityComponent.id + "\" class=\"tabContainer \"></span>");
            var tabContainer = $("#tabContainer_" + activityComponent.id);
            for (var i = startIndex; i <= endIndex; i++)
            {
                var displayTitleHTML = activityComponent.itemTitle.length > 0 ? htmlDecode(activityComponent.itemTitle) : "";
                var tabLabelHTML = stripRTLDiv(displayTitleHTML).rtl ? ("<span class=\"tabItem tabItem_" + i + " isRTL\"></span> " + displayTitleHTML) : (displayTitleHTML + " <span class=\"tabItem tabItem_" + i + "\"></span>");
                tabContainer.append("<span id=\"tab_" + activityComponent.id + "_" + i + "\" class=\"tab" + ((currentPage == i) ? " tabSelected " : "") + "\">" + tabLabelHTML + "</span>");
                $("#tab_" + activityComponent.id + "_" + i).on("click", { ac: activityComponent, tabIndex: i }, function (event)
                {
                    if (!$(this).hasClass("tabDisabled"))
                    {
                        openActivityComponentTab(event.data.ac, event.data.tabIndex);
                        var openActivityComponentTabEvent = $.Event("openActivityComponentTab");
                        openActivityComponentTabEvent.activityComponentId = event.data.ac.id;
                        openActivityComponentTabEvent.tabIndex = event.data.tabIndex;
                        $(document).trigger(openActivityComponentTabEvent);
                    }
                });
            }
        }
    }
}

function openActivityComponentTab(activityComponent, tabIndex)
{
    var componentTabBar = $("#componentTabBar_" + activityComponent.id);
    if (componentTabBar.length > 0)
    {
        var summarySheetDiv = $("#activitySummaryDiv_" + activityComponent.id);
        if ((tabIndex > 0) || ((tabIndex == 0) && (summarySheetDiv.length > 0)))
        {
            $("#componentTabBar_" + activityComponent.id).find(".tabSelected").each(function ()
            {
                $(this).removeClass("tabSelected");
            });
            $("#tab_" + activityComponent.id + "_" + tabIndex).addClass("tabSelected");
            if (tabIndex > 0)
            {
                summarySheetDiv.hide();
                var pageCount = Math.ceil(activityComponent.prompts.length / activityComponent.promptsPerPage);
                var tabDetailIndex = 1;
                var openedPromptIndexes = new Array();
                $("#tabDetails_" + activityComponent.id).find(".tabDetail").each(function ()
                {
                    var activityComponentDetailDiv = $(this);
                    var currentPage = Math.ceil(tabDetailIndex / activityComponent.promptsPerPage);
                    if (currentPage == tabIndex)
                    {
                        if (activityComponentDetailDiv.css("display") == "none")
                        {
                            activityComponentDetailDiv.show();
                        }
                        openedPromptIndexes.push(tabDetailIndex);
                    }
                    else
                    {
                        activityComponentDetailDiv.hide();
                        killMedia(activityComponentDetailDiv);
                    }
                    tabDetailIndex++;
                });
                var activityComponentTabOpenedEvent = $.Event("activityComponentTabOpened");
                activityComponentTabOpenedEvent.activityComponent = activityComponent;
                activityComponentTabOpenedEvent.openedPromptIndexes = openedPromptIndexes;
                $(document).trigger(activityComponentTabOpenedEvent);
            }
            else
            {
                $("#tabDetails_" + activityComponent.id).children(".tabDetail").each(function ()
                {
                    $(this).hide();
                });
                summarySheetDiv.show();
                $("#tab_" + activityComponent.id + "_" + tabIndex).html("Summary");
            }
        }
    }
}

function openFirstTab(activityComponent)
{
    var tabContainerSpan = $("#tabContainer_" + activityComponent.id);
    if (tabContainerSpan.length > 0)
    {
//        tabContainerSpan.children("span").first().click({ ac: activityComponent, tabIndex: 1 });
        tabContainerSpan.children("span").first().click();
    }
    else
    {
        $("#tabDetails_" + activityComponent.id).children(".tabDetail").each(function ()
        {
            var activityComponentDetailDiv = $(this);
            activityComponentDetailDiv.show();
        });
    }
}

function resolveActivityComponentFunctionName(suggestedFunctionName, defaultName) {
    if (!(typeof (window[suggestedFunctionName]) == "function"))
    {
        return defaultName;
    }
    return suggestedFunctionName;
}

function getRenderModeLayoutIndex(activityComponent)
{
    var renderModeValue = activityComponent.renderMode;
    var componentTitle = activityComponent.componentTitle.replace(/ /g, "");
    var renderModeArr = typeof (window[componentTitle + "RenderModeLayouts"]) == "undefined" ? genericRenderModeLayouts : window[componentTitle + "RenderModeLayouts"];
    var renderModeLayoutIndex = Math.floor(renderModeValue / 100);
    if ((renderModeLayoutIndex < 0) || (renderModeLayoutIndex > renderModeArr.length))
        renderModeLayoutIndex = 0;
    return renderModeLayoutIndex;
}

function getRenderModeLayout(activityComponent)
{
    var componentTitle = activityComponent.componentTitle.replace(/ /g, "");
    var renderModeArr = typeof (window[componentTitle + "RenderModeLayouts"]) == "undefined" ? genericRenderModeLayouts : window[componentTitle + "RenderModeLayouts"];
    if (renderModeArr.length <= 0)
        return "";
    return renderModeArr[getRenderModeLayoutIndex(activityComponent)];
}

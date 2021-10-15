$(document).ready(function ()
{
    $(document).bind("activityComponentLoaded", function (event) { setActivityComponentInteractivity(event); });
    $(document).bind("moduleCompletionSet activityTriggerComplete", function (event) { setActivityTriggers(); });
    $(document).bind("moduleLoaded", function (event) { setModuleInteractivity(event); });
    $(document).bind("hotspotLoaded", function (event) { setupHotspotInteractivity(event); });
    $(document).bind("recorderShowMP3", function (event) { setupSubmitStudentSpeakingButton(event.containerElement, event.file); });
    $(document).bind("sketchpadChange", function (event) { setupSubmitStudentWritingButton(event.containerElement, event.sketchPad); });

    $(document).bind("studentAnswersUpdated", function (event)
    {
        completeTriggeredActivityComponent(event.activityComponentId);
    });

});

function setModuleInteractivity(event)
{
    if (module.moduleFeatures.limitBrowserFunctionality)
    {
        document.addEventListener('contextmenu',function(){event.preventDefault()});
        $("body").addClass("noselect");
    }
}

function setActivityComponentInteractivity(event)
{
    var activityComponent = event.activityComponent;
    switch (activityComponent.componentTitle.toUpperCase())
    {
        case "CATEGORIZATION":
            var renderModeIndex = getRenderModeLayoutIndex(activityComponent)
            switch (renderModeIndex)
            {
                case 1:
                    setupCategorizationWordPoolDragAndDrop(activityComponent);
                    break;
                default:
                    setupCategorizationDragAndDrop(activityComponent);
                    break;
            }
            break;
        case "FILLINTHEBLANK":
            var renderModeLayout = getRenderModeLayoutIndex(activityComponent);

            switch(renderModeLayout){
                case 1:
                    $("#responsePool_" + activityComponent.id).children(".word").each(function (index)
                    {
                        $(this).draggable({
                            revert: true,
                            containment: $("#tabDetails_" + activityComponent.id)
                        });
                    });
                    setupFillInTheBlankDrop(activityComponent.id);
    
    
                    $("#tabDetails_" + activityComponent.id).find(".blank").each(function ()
                    {
                        var responseBlank = $(this);
                        var responseBlankIdArr = responseBlank.attr("id").split("_");
                        var promptId = responseBlankIdArr[1];
                        var index = responseBlankIdArr[2];
                        var responseRTL = responseBlank.attr("dir") == "rtl";
    
                        var blankHtml = "<span id=\"response_" + promptId + "_" + index + "\" type=\"text\" class=\"response\" style=\"width:auto;\" data-isrtl=\"" + (responseRTL ? "true" : "false") + "\" data-promptid=\"" + promptId + "\" data-index=\"" + index + "\">";
                        blankHtml += "  <span id=\"responseInputBox_" + promptId + "_" + index + "\" class=\"customInputBox\" dir=\"" + (responseRTL ? "rtl" : "ltr") + "\" data-promptid=\"" + promptId + "\" data-index=\"" + index + "\"></span>";
                        blankHtml += "</span>";
                        responseBlank.replaceWith(blankHtml);
                        responseBlank = $("#response_" + promptId + "_" + index);
                        //Insert Feedback Btn after the text based on the parent direction
    
                        var responseBlankContainer = $("<div style='display:inline-block;'></div>");
                        responseBlank.before(responseBlankContainer);
                        responseBlankContainer.html("<span id=\"inlineFeedbackContainer_" + promptId + "_" + index + "\" class=\"feedbackContainer inlineFeedbackContainer\"></span>");
                        responseBlankContainer.append(responseBlank);
    
                        responseBlank.droppable({
                            hoverClass: 'blankHover',
                            accept: ".word",
                            over: function (event, ui)
                            {
                                ui.draggable.addClass('hoverOver')
                            },
                            out: function (event, ui)
                            {
                                ui.draggable.removeClass('hoverOver')
                            },
                            drop: function (event, ui)
                            {
                                dropFillInTheBlankResponse(event, ui.draggable, $(this), activityComponent.id);
                            }
                        });
                        responseBlank.css("text-align", "center");
                        responseBlank.html("");
                        responseBlank.data("fnbType", "wordPool");
                        responseBlank.addClass("blank");
                        responseBlank.addClass("dropTarget");
                        responseBlank.removeAttr("type");
                        responseBlank.css("width", "");
                    });
                break

                case 2:
                    for (var p = 0; p < activityComponent.prompts.length; p++)
                    {
                        var prompt = activityComponent.prompts[p];
                        $("#responsesContainer_" + prompt.id).find(".blank").each(function ()
                        {
                            var responseBlank = $(this);
                            var responseBlankIdArr = responseBlank.attr("id").split("_");
                            var index = responseBlankIdArr[2];
                            var responseRTL = responseBlank.attr("dir") == "rtl";


                            var blankHtml = "<span id=\"response_" + prompt.id + "_" + index + "\" type=\"text\" class=\"response\" style=\"width:auto;\" data-isrtl=\"" + (responseRTL ? "true" : "false") + "\" data-promptid=\"" + prompt.id + "\" data-index=\"" + index + "\">";
                            blankHtml += "  <span id=\"responseInputBox_" + prompt.id + "_" + index + "\" class=\"customInputBox\" dir=\"" + (responseRTL ? "rtl" : "ltr") + "\" data-promptid=\"" + prompt.id + "\" data-index=\"" + index + "\"></span>";
                            blankHtml += "</span>";
                            responseBlank.replaceWith(blankHtml);
                            responseBlank = $("#response_" + prompt.id + "_" + index);
                            //Insert Feedback Btn after the text based on the parent direction

                            var responseBlankContainer = $("<div style='display:inline-block;'></div>");
                            responseBlank.before(responseBlankContainer);
                            responseBlankContainer.html("<span id=\"inlineFeedbackContainer_" + prompt.id + "_" + index + "\" class=\"feedbackContainer inlineFeedbackContainer\"></span>");
                            responseBlankContainer.append(responseBlank);

                            responseBlank.droppable({
                                hoverClass: 'blankHover',
                                accept: '.word[data-promptid="'+prompt.id+'"]',
                                over: function (event, ui)
                                {
                                    ui.draggable.addClass('hoverOver')
                                },
                                out: function (event, ui)
                                {
                                    ui.draggable.removeClass('hoverOver')
                                },
                                drop: function (event, ui)
                                {
                                    dropFillInTheBlankResponse(event, ui.draggable, $(this), activityComponent.id);
                                }
                            });
                            responseBlank.css("text-align", "center");
                            responseBlank.html("");
//                            responseBlank.data("fnbType", "wordPool");
                            responseBlank.addClass("blank");
//                            responseBlank.addClass("dropTarget");
                            responseBlank.removeAttr("type");
                            responseBlank.css("width", "");
                        });
                        for (var r = 0; r < prompt.responses.length; r++)
                        {
                            var response = prompt.responses[r];
                            var blank = $("#response_" + prompt.id + "_" + (r + 1));
                            blank.append('<span id="response_' + response.id + '" class="word draggableWord" dir="' + (response.rtl ? "rtl" : "ltr") + '" data-promptid="'+prompt.id+'" data-responseid="' + response.id + '">' + htmlDecode(response.text) + '</span>');
                            var draggableResponse = $("#response_" + response.id);
                            draggableResponse.draggable({
                                revert: true,
                                containment: $("#responsesContainer_" + prompt.id)
                            });
                            draggableResponse.css("width", "auto");
                        }
                    }
                    break
                default:
                    for (var i = 0; i < activityComponent.prompts.length; i++)
                        {
                        var prompt = activityComponent.prompts[i];
                        var index = -1;
                        var shuffledResponses = shuffle(prompt.responses, true);
                        for (var j = 0; j < prompt.responses.length; j++)
                        {
                            var response = prompt.responses[j];
                            if (index != response.sortKey)
                            {
                                index = response.sortKey;
                                var indexResponseCount = 0;
                                for (var k = 0; k < prompt.responses.length; k++)
                                {
                                    if (index == prompt.responses[k].sortKey)
                                        indexResponseCount++;
                                }
                                var responseBlank = $("#response_" + prompt.id + "_" + index);
                                //var responseInfo = getLanguageInfo(htmlDecode(response.text).trim());
                                //var standardMultiplier = responseInfo.wideChar ? 1.8 : 1;
                                //Forcing an id on the element
                                //FIND THE RENDER MODE TO ESTABLISH CASE
                                if (indexResponseCount > 1)
                                    fillInTheBlankType = "dropDown";
                                else
                                    fillInTheBlankType = "inputBox";
                                
                                var blankHtml = '';
                                if(fillInTheBlankType == "inputBox" && response.rtl)
                                    blankHtml += spf('<span id="responseInputBox_~_~_submit" data-responseinputbox="responseInputBox_~_~" class="submitBtn btnGrey disabled" style="display:inline; margin-left:.25em; font-size:.8em; box-shadow:none;-webkit-box-shadow:none"><i class="fa fa-check" style="color:#ffffff;"></i></span>',[prompt.id, index, prompt.id, index, prompt.id, index]);

                                blankHtml += spf('<span id="response_~_~" type="text" class="response" style="width:auto;" data-isrtl="~" data-promptid="~" data-index="~">', [prompt.id, index, (response.rtl ? true : false), prompt.id, index])
                                blankHtml += spf('<span id="responseInputBox_~_~" class="customInputBox" dir="~" data-promptid="~" data-index="~" data-activitycomponentid="~"></span>', [prompt.id, index, (response.rtl ? "rtl" : "ltr"), prompt.id, index, activityComponent.id]);                            
                                blankHtml += '</span>'
                                
                                if(fillInTheBlankType == "inputBox" && !response.rtl)
                                    blankHtml += spf('<span id="responseInputBox_~_~_submit" data-responseinputbox="responseInputBox_~_~" class="submitBtn btnGrey disabled" style="display:inline; margin-left:.25em; font-size:.8em; box-shadow:none;-webkit-box-shadow:none"><i class="fa fa-check" style="color:#ffffff;"></i></span>',[prompt.id, index, prompt.id, index, prompt.id, index]);

                                responseBlank.replaceWith(blankHtml);
                                responseBlank = $("#response_" + prompt.id + "_" + index);
                                //Insert Feedback Btn after the text based on the parent direction

                                var responseBlankContainer = $("<div style='display:inline-block;'></div>");
                                responseBlank.before(responseBlankContainer);
                                responseBlankContainer.html('<span id="inlineFeedbackContainer_' + prompt.id + '_' + index + '" class="feedbackContainer inlineFeedbackContainer"></span>');
                                responseBlankContainer.append(responseBlank);
                                switch (fillInTheBlankType)
                                {
                                    case "dropDown":
                                        var blankHtml = spf('<a id="blankAnchor_~_~" class="blankAnchor word"></a><i id="blankAnchorCaret_~_~" class="blankAnchorCaret ~"></i>', [prompt.id, index, prompt.id, index, dropdownIndicatorIcon]);
                                        blankHtml += spf('<span id="fnbDropDownMenu_~_~" class="fnbDropDownMenu">', [prompt.id, index]);
                                        for (var k = 0; k < shuffledResponses.length; k++)
                                        {
                                            if (shuffledResponses[k].sortKey == index)
                                            {
                                                blankHtml += spf('<span class="fnbDropDownMenuOption"><a class="word" dir="~">', [(shuffledResponses[k].rtl ? "rtl" : "ltr")]);
                                                blankHtml += stripRTLDiv(htmlDecode(shuffledResponses[k].text)).text;
                                                blankHtml += "</a></span>";
                                            }
                                        }
                                        blankHtml += "</span>";
                                        responseBlank.html(blankHtml);
                                        responseBlank.removeAttr("type");
                                        responseBlank.addClass("blank");
                                        var params = [prompt.id, index];//Pass in values for each iteration
                                        $("#fnbDropDownMenu_" + prompt.id + "_" + index).find(".word").each(function ()
                                        {
                                            $(this).data("params", params);
                                            $(this).on("click", function (event)
                                            {
                                                selectBlankResponse($(this), activityComponent.id);
                                            });
                                        }, params);
                                        $("#blankAnchor_" + prompt.id + "_" + index).click({ promptId: prompt.id, index: index }, showFillInBlankSubMenu);
                                        $("#blankAnchorCaret_" + prompt.id + "_" + index).click({ promptId: prompt.id, index: index }, showFillInBlankSubMenu);
                                        var submenuDiv = $("#fnbDropDownMenu_" + prompt.id + "_" + index);
                                        submenuDiv.css("display", "none");
                                        var dim = submenuDiv.getHiddenDimensions(true);
                                        break;
                                    default:
                                        var responseInputBox = $("#responseInputBox_" + prompt.id + "_" + index);
                                        responseInputBox.attr("spellcheck", false);
                                        responseInputBox.attr("contenteditable", false);
                                        responseInputBox.attr("autocomplete", "off");
                                        $("#response_" + prompt.id + "_" + index).on("click", function (ev)
                                        {
                                            if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                                                submitInProgress = false;
                                            }
                                            if(!submitInProgress){
                                                var inputBox = $(this).children("[id^='responseInputBox_']");
                                                if (document.activeElement == this && !this.textContent)
                                                {
                                                    var sel = window.getSelection();
                                                    var rng = sel.getRangeAt(0);
                                                    if (rng.startContainer == this.parentNode)
                                                    {
                                                        var newRng = document.createRange();
                                                        newRng.setStart(this, 0);
                                                        newRng.collapse(true);
                                                        sel.removeAllRanges();
                                                        sel.addRange(newRng);
                                                    }
                                                }
                                                inputBox.attr('contenteditable', 'true').focus();
                                                inputBox.parent().addClass('active');
                                                ev.preventDefault();
                                                ev.stopPropagation();
                                            }
                                        });
                                        //FROM TRANSCRIPTION
                                        responseInputBox.on("keydown", function (ev)
                                        {
                                            if ($(this).data("text") != $(this).text()){
                                                //enable submit btn
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn);
                                                submitBtnElement.removeClass("disabled");
                                                submitBtnElement.removeClass("btnGrey");
                                                submitBtnElement.addClass("btnBlue");
                                                if(response.rtl)
                                                    submitBtnElement.html('<i class="fa fa-reply"></i>')
                                                else
                                                    submitBtnElement.html('<i class="fa fa-share"></i>')
                                            }
                                            if (ev.keyCode == 13)
                                            {
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn).trigger("click");
                                                $(this).data("tabcalled", false);
                                                ev.preventDefault();
                                            }
                                            if (ev.keyCode == 9)
                                            {
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn)
                                                $(this).data("tabcalled", true);
                                                submitBtnElement.trigger("click");
                                                ev.preventDefault();
                                                if(typeof submitInProgress === 'undefined'){//Respond to tab if record student action layer isnt present
                                                    var inputBox = $(this);
                                                    var index = parseInt(inputBox.data("index"));
                                                    var promptId = inputBox.data("promptid");
                                                    var nextResponse = $("#responseInputBox_" + promptId + "_" + (index + 1));
                                                    if (nextResponse.length)
                                                    {
                                                        nextResponse.click();
                                                    }
                                                    else
                                                    {
                                                        var firstResponse = $("#responsesContainer_" + promptId).find("[id^='responseInputBox_" + promptId + "_']").first();
                                                        if (firstResponse.length)
                                                        {
                                                            firstResponse.click();
                                                        }
                                                    }
                                                }
                                            }
                                            //Revert on ESC key
                                            if (ev.keyCode == 27){
                                                $(this).removeClass("active");
                                                $(this).focusout();
                                                $(this).text($(this).data("text"));
                                                $(this).attr('contenteditable', 'false');
                                                
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn);
                                                submitBtnElement.addClass("disabled");
                                                submitBtnElement.addClass("btnGrey");
                                                submitBtnElement.removeClass("btnBlue");
                                                if(response.rtl)
                                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                                                else
                                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                                            }
                                        });
                                        responseInputBox.on("keydown", function (ev)
                                        {
                                            if ($(this).data("text") != $(this).text()){
                                                //enable submit btn
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn);
                                                submitBtnElement.removeClass("disabled");
                                                submitBtnElement.removeClass("btnGrey");
                                                submitBtnElement.addClass("btnBlue");
                                                if(response.rtl)
                                                    submitBtnElement.html('<i class="fa fa-reply"></i>')
                                                else
                                                    submitBtnElement.html('<i class="fa fa-share"></i>')
                                            }
                                            if (ev.keyCode == 13)
                                            {
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn).trigger("click");
                                                $(this).data("tabcalled", false);
                                                ev.preventDefault();
                                            }
                                            if (ev.keyCode == 9)
                                            {
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn)
                                                $(this).data("tabcalled", true);
                                                submitBtnElement.trigger("click");
                                                ev.preventDefault();
                                                if(submitInProgress === false){//Respond to tab if record student action layer isnt present
                                                    var inputBox = $(this);
                                                    var index = parseInt(inputBox.data("index"));
                                                    var promptId = inputBox.data("promptid");
                                                    var nextResponse = $("#responseInputBox_" + promptId + "_" + (index + 1));
                                                    if (nextResponse.length)
                                                    {
                                                        nextResponse.click();
                                                    }
                                                    else
                                                    {
                                                        var firstResponse = $("#responsesContainer_" + promptId).find("[id^='responseInputBox_" + promptId + "_']").first();
                                                        if (firstResponse.length)
                                                        {
                                                            firstResponse.click();
                                                        }
                                                    }
                                                }
                                            }
                                            //Revert on ESC key
                                            if (ev.keyCode == 27){
                                                $(this).removeClass("active");
                                                $(this).focusout();
                                                $(this).text($(this).data("text"));
                                                $(this).attr('contenteditable', 'false');
                                                
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn);
                                                submitBtnElement.addClass("disabled");
                                                submitBtnElement.addClass("btnGrey");
                                                submitBtnElement.removeClass("btnBlue");
                                                if(response.rtl)
                                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                                                else
                                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                                            }
                                        });
                                        responseInputBox.on("keyup", function (ev)
                                        {
                                            if ($(this).data("text") != $(this).text()){
                                                //enable submit btn
                                                var submitBtn = $(this).attr("id")+"_submit";
                                                var submitBtnElement = $("#"+submitBtn);
                                                submitBtnElement.removeClass("disabled");
                                                submitBtnElement.removeClass("btnGrey");
                                                submitBtnElement.addClass("btnBlue");
                                                if(response.rtl)
                                                    submitBtnElement.html('<i class="fa fa-reply"></i>')
                                                else
                                                    submitBtnElement.html('<i class="fa fa-share"></i>')
                                            }
                                        })

                                        responseInputBox.on("focusin", function ()
                                        {
                                            var thisBox = $(this);
                                            thisBox.data("text", thisBox.text());
                                            thisBox.data("tabcalled", false);
                                        });
                                        responseInputBox.on("focusout", function ()
                                        {
                                            var thisBox = $(this);
                                            var promptId = thisBox.data("promptid");
                                            var responseIndex = thisBox.data("index");

                                            $("#response_" + promptId + "_" + responseIndex).removeClass("active");
                                            $(this).attr('contenteditable', 'false');
                                        });

                                        responseInputBox.on("paste", function (e)
                                        {
                                            e.preventDefault();
                                        });

                                        responseInputBox.on("contextmenu", function (e)
                                        {
                                            e.preventDefault();
                                        });
                                        responseInputBox.on("focusin", function ()
                                        {
                                            var thisBox = $(this);
                                            thisBox.data("text", thisBox.text());
                                        });
                                        responseInputBox.on("focusout", function ()
                                        {
                                            var thisBox = $(this);
                                            var promptId = thisBox.data("promptid");
                                            var responseIndex = thisBox.data("index");
                                            $("#response_" + promptId + "_" + responseIndex).removeClass("active");
                                            $(this).attr('contenteditable', 'false');
                                        });

                                        var responseInputBoxSubmitBtn = $("#responseInputBox_" + prompt.id + "_" + index + "_submit");
                                        
                                        responseInputBoxSubmitBtn.on("click", function(){
                                            if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                                                submitInProgress = false;
                                            }
                                            if(!submitInProgress && !$(this).hasClass("disabled")){
                                                var thisBox = $("#"+$(this).data("responseinputbox"));
                                                var promptId = thisBox.data("promptid");
                                                var responseIndex = thisBox.data("index");
                                                
                                                thisBox.removeClass("active");
                                                thisBox.attr('contenteditable', 'false');
                                                // $(this).hide();
                                                $(this).html('<i class="loader" style="font-size:.8em;">&nbsp</i>')
                                                // $(this).after('<i class="loader" style="display: inline-block; margin-left:.25em; font-size:.8em;">&nbsp</i>');
                                                var responseInteractionEvent = $.Event("responseInteraction");
                                                responseInteractionEvent.activityComponentId = activityComponent.id;
                                                responseInteractionEvent.promptId = parseInt(promptId);
                                                responseInteractionEvent.responseId = 0;
                                                responseInteractionEvent.componentTitle = "FillInTheBlank";
                                                responseInteractionEvent.responseIndex = parseInt(responseIndex);
                                                responseInteractionEvent.responseText = thisBox.text();
                                                $(document).trigger(responseInteractionEvent);
                                            }
                                        })
                                        break;
                                }
                            }
                        }
                    }
                    //END FNB Render Modes SWITCH
            }
            break;
        case "FINDANDCLICK":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                $("#responsesContainer_" + prompt.id).children("img").on("click", {prompt : prompt}, function (e)
                {
                    var img = $('#responsesContainer_' + e.data.prompt.id + ' img').get(0);
                    var imgX = img.naturalWidth;
                    var imgY = img.naturalHeight;
                    for (var j = 0; j < e.data.prompt.responses.length; j++)
                    {
                        var response = e.data.prompt.responses[j];
                        var responseDataArr = $.parseJSON(response.text);
                        if (responseDataArr.length == 4)
                        {
                            var offset = $(this).offset();
                            var clickX = e.pageX - offset.left;
                            var clickY = e.pageY - offset.top;
                            if ((clickX >= Math.round(responseDataArr[0] / imgX * img.width)) && (clickX <= Math.round(responseDataArr[2] / imgX * img.width)) && (clickY >= Math.round(responseDataArr[1] / imgY * img.height)) && (clickY <= Math.round(responseDataArr[3] / imgY * img.height)))
                            {
                                loadResponseHotspot(activityComponent, response, true);
                            }
                        }
                    }
                });
            }
            break;
        case "MATCHING":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                setupMatchingDrop(activityComponent.id, prompt.id);
            }
            for (var i = 0; i < activityComponent.responses.length; i++)
            {
                var response = activityComponent.responses[i];
                setupMatchingDrag(response.activityComponentId, response.id);
            }
            break;
        case "ORDERING":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                var renderMode = activityComponent.renderModeIndex;
                switch (renderMode) {
                    case 0:
                        setupVerticalOrderingResponseSortables(prompt.id, prompt.activityComponentId);
                        break
                    case 1:
                        setupHorizontalOrderingResponseSortables(prompt.id, prompt.activityComponentId);
                        break
                }

                var responseIds = new Array();
                for (var r = 0; r < activityComponent.prompts[i].responses.length; r++)
                    responseIds.push(activityComponent.prompts[i].responses[r].id);

            }
            break;
        case "SHORTANSWER":
            for (var i = 0; i < activityComponent.prompts.length; i++) {
                var renderMode = activityComponent.renderModeIndex;
                switch (renderMode) {
                    case 0:
                        //default
                        (function () {  // Closure function to attach functionality to each short answer component
                            var prompt = activityComponent.prompts[i];
                            var shortAnswerResponseContent = $(`#shortAnswerResponseContent_${prompt.id}`);
                            var inputBox = $(`#responseInputBox_${prompt.id}`);
                            var inputIcon = $(`#inputBoxIcon_${prompt.id}`);
                            inputBox.on("paste", function (event) { event.preventDefault() });  // Prevents paste
                            inputBox.on("contextmenu", function (event) { event.preventDefault() });    // Prevents right-click menu
    
                            var response = prompt.responses[0];
                            var shortAnswerSubmitButton = false;
                            if (response)
                            {
                                shortAnswerResponseContent.after('<span id="responseInputSubmit_' + prompt.id + '" class="submitBtn btnGrey disabled" style="text-align:center; width: 10em; margin-top:0.5em; float: ' + (response.rtl ? "right" : "left") + ';"><i class="fa fa-check" style="color:#ffffff;"></i> Submit</span>');
                                shortAnswerSubmitButton = $(`#responseInputSubmit_${prompt.id}`);
                            }
    
                            shortAnswerResponseContent.on("click", function (event) {
                                if(!$(this).hasClass("active")){
                                    $(this).addClass("active");
                                    inputIcon.css("display", "none");
                                    inputBox.attr("contenteditable", "true");
                                    inputBox.focus();   // Give input box focus
                                }
                            });
    
    
    
                            inputBox.on("keydown", function (ev) { // Fires every character change of a student's answer
                                //Revert on ESC key
                                if (ev.keyCode == 27){
                                    $(this).removeClass("active");
                                    $(this).focusout();
                                    $(this).text(htmlDecode($(this).data("text")));
                                    $(this).attr('contenteditable', 'false');
    
                                    shortAnswerSubmitButton.addClass("disabled");
                                    shortAnswerSubmitButton.addClass("btnGrey");
                                    shortAnswerSubmitButton.removeClass("btnBlue");
                                    if(inputBox.attr("dir") == "rtl")
                                        shortAnswerSubmitButton.html('<i class="fa fa-check" style="color:#ffffff;"></i> Submit')
                                    else
                                        shortAnswerSubmitButton.html('<i class="fa fa-check" style="color:#ffffff;"></i> Submit')
                                }
                            })
    
                            inputBox.on("keyup", function (ev) { // Fires every character change of a student's answer
                                if (shortAnswerSubmitButton.hasClass("disabled")) { // if submit button is NOT displayed, make button visible
                                    shortAnswerSubmitButton.removeClass("disabled");
                                    shortAnswerSubmitButton.removeClass("btnGrey");
                                    shortAnswerSubmitButton.addClass("btnBlue");
                                    if(inputBox.attr("dir") == "rtl")
                                        shortAnswerSubmitButton.html('<i class="fa fa-reply"></i> Submit')
                                    else
                                        shortAnswerSubmitButton.html('<i class="fa fa-share"></i> Submit')
                                }
                            });
    
                            inputBox.on('blur', function (event) {  // Fires when a input box loses focus
                                shortAnswerResponseContent.removeClass("active"); // Make shortAnswerResponseContent non-active
                                inputIcon.css("display", "")
                            })
    
                            shortAnswerSubmitButton.on("click",function (event) {
                                if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                                    submitInProgress = false;
                                }
                                if(!submitInProgress && !$(this).hasClass("disabled")){
                                    event.stopPropagation();    // Prevent click from bubbling to the parent click
    
                                    shortAnswerResponseContent.removeClass("active");
                                    inputIcon.css("display", ""); // Render the icon
                                    inputBox.attr("contenteditable", "false");
                                    shortAnswerSubmitButton.addClass("disabled");
                                    shortAnswerSubmitButton.addClass("btnGrey");
                                    shortAnswerSubmitButton.removeClass("btnBlue");
    
                                    var responseInteractionEvent = $.Event("responseInteraction");  // beginning of packaging up our answer
                                    responseInteractionEvent.activityComponentId = activityComponent.id;
                                    responseInteractionEvent.promptId = parseInt(prompt.id);
                                    responseInteractionEvent.responseId = 0;
                                    responseInteractionEvent.componentTitle = "ShortAnswer";
                                    responseInteractionEvent.responseText = inputBox.html()
                                    $(document).trigger(responseInteractionEvent);
                                }
                            });    
                        }())
                    break
                    case 1:
                        var responseInteractionEvent = $.Event("responseInteraction");
                        responseInteractionEvent.activityComponentId = activityComponent.id;
                        responseInteractionEvent.promptId = parseInt(prompt.id);
                        responseInteractionEvent.responseId = 0;
                        responseInteractionEvent.componentTitle = "ShortAnswer";
                        responseInteractionEvent.responseText = " ";
                        $(document).trigger(responseInteractionEvent);
                    break
                }
            }
            break;
        case "SPEAKING":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                var speakingResponseContent = $("#speakingResponseContent_" + prompt.id);
                if (prompt.recorder && prompt.recorder.submit)
                {
                    var response = prompt.responses[0];
                    speakingResponseContent.after('<span id="responseInputSubmit_' + prompt.id + '" class="submitBtn btnGrey disabled" style="text-align:center; width: 10em; margin-top:0.5em; float: ' + (response.rtl ? "right" : "left") + ';" data-dir="' + (prompt.rtl ? "rtl" : "ltr") + '"><i class="fa fa-check" style="color:#ffffff;"></i> Submit</span>');
                }
            }
            break;
        case "TEXTSELECTOR":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                for (var j = 0; j < prompt.responses.length; j++)
                {
                    var response = prompt.responses[j];
                    bindSelectableText($("#response_"+response.id), activityComponent);
                }
            }
            break;
        case "TRANSCRIPTION":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                var index = -1;
                for (var j = 0; j < prompt.responses.length; j++)
                {
                    var response = prompt.responses[j];
                    if (index != response.sortKey)
                    {
                        index = response.sortKey;
                        var responseBlank = $("#response_" + prompt.id + "_" + index);
                        var blankHtml = '';
                        var blankHtml = '';
                        if(response.rtl)
                            blankHtml += spf('<span id="responseInputBox_~_~_submit" data-responseinputbox="responseInputBox_~_~" class="submitBtn btnGrey disabled" style="display:inline; margin-left:.25em; font-size:.8em; box-shadow:none;-webkit-box-shadow:none"><i class="fa fa-check" style="color:#ffffff;"></i></span>',[prompt.id, index, prompt.id, index, prompt.id, index]);
                        
                        blankHtml += '<span id="response_' + prompt.id + '_' + index + '" type="text" class="response" style="width:auto;" data-isrtl="' + (response.rtl ? "true" : "false") + '" data-promptid="' + prompt.id + '" data-index="' + index + '" tabindex="'+prompt.id+'-'+index+'">';
                        blankHtml += spf('<span id="responseInputBox_~_~" class="customInputBox" dir="~" data-promptid="~" data-index="~" data-activitycomponentid="~"></span>', [prompt.id, index, (response.rtl ? "rtl" : "ltr"), prompt.id, index, activityComponent.id]);
                        blankHtml += '</span>'

                        if(!response.rtl)
                            blankHtml += spf('<span id="responseInputBox_~_~_submit" _submit" data-responseinputbox="responseInputBox_~_~" class="submitBtn btnGrey disabled" style="display:inline; margin-left:.25em; font-size:.8em; box-shadow:none;-webkit-box-shadow:none"><i class="fa fa-check" style="color:#ffffff;"></i></span>',[prompt.id, index, prompt.id, index, prompt.id, index]);
                        
                        responseBlank.replaceWith(blankHtml);
                        responseBlank = $("#response_" + prompt.id + "_" + index);
                        //Insert Feedback Btn after the text based on the parent direction

                        var responseBlankContainer = $("<div style='display:inline-block;'></div>");
                        responseBlank.before(responseBlankContainer);
                        responseBlankContainer.html('<span id="inlineFeedbackContainer_' + prompt.id + '_' + index + '" class="feedbackContainer inlineFeedbackContainer"></span>');
                        responseBlankContainer.append(responseBlank);
                        var responseInputBox = $("#responseInputBox_" + prompt.id + "_" + index);
                        $("#customInputBoxIcon_" + prompt.id + "_" + index).show();
                        responseInputBox.attr("spellcheck", false);
                        responseInputBox.attr("contenteditable", false);
                        responseInputBox.attr("autocomplete", "off");
                        responseInputBox.on("click", function (ev) 
                        {
                            if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                                submitInProgress = false;
                            }
                            if(!submitInProgress){
                                if (document.activeElement == this && !this.textContent) 
                                {
                                    var sel = window.getSelection();
                                    var rng = sel.getRangeAt(0);
                                    if (rng.startContainer == this.parentNode) 
                                    {
                                        var newRng = document.createRange();
                                        newRng.setStart(this, 0);
                                        newRng.collapse(true);
                                        sel.removeAllRanges();
                                        sel.addRange(newRng);
                                    }
                                }
                                else 
                                {
                                    $(this).attr('contenteditable', 'true').focus();
                                }
                                $(this).parent().addClass('active');
                                ev.preventDefault();
                                ev.stopPropagation();
                            }
                        });

                        responseInputBox.on("keydown", function (ev)
                        {
                            if ($(this).data("text") != $(this).text()){
                                //enable submit btn
                                var submitBtn = $(this).attr("id")+"_submit";
                                var submitBtnElement = $("#"+submitBtn);
                                submitBtnElement.removeClass("disabled");
                                submitBtnElement.removeClass("btnGrey");
                                submitBtnElement.addClass("btnBlue");
                                if(response.rtl)
                                    submitBtnElement.html('<i class="fa fa-reply"></i>')
                                else
                                    submitBtnElement.html('<i class="fa fa-share"></i>')
                            }
                            if (ev.keyCode == 13)
                            {
                                var submitBtn = $(this).attr("id")+"_submit";
                                var submitBtnElement = $("#"+submitBtn).trigger("click");
                                $(this).data("tabcalled", false);
                                ev.preventDefault();
                            }
                            if (ev.keyCode == 9)
                            {
                                var submitBtn = $(this).attr("id")+"_submit";
                                var submitBtnElement = $("#"+submitBtn)
                                $(this).data("tabcalled", true);
                                submitBtnElement.trigger("click");
                                ev.preventDefault();
                                if(submitInProgress === false){//Respond to tab if record student action layer isnt present
                                    var inputBox = $(this);
                                    var index = parseInt(inputBox.data("index"));
                                    var promptId = inputBox.data("promptid");
                                    var nextResponse = $("#responseInputBox_" + promptId + "_" + (index + 1));
                                    if (nextResponse.length)
                                    {
                                        nextResponse.click();
                                    }
                                    else
                                    {
                                        var firstResponse = $("#responsesContainer_" + promptId).find("[id^='responseInputBox_" + promptId + "_']").first();
                                        if (firstResponse.length)
                                        {
                                            firstResponse.click();
                                        }
                                    }
                                }
                            }
                            //Revert on ESC key
                            if (ev.keyCode == 27){
                                $(this).removeClass("active");
                                $(this).focusout();
                                $(this).text($(this).data("text"));
                                $(this).attr('contenteditable', 'false');
                                
                                var submitBtn = $(this).attr("id")+"_submit";
                                var submitBtnElement = $("#"+submitBtn);
                                submitBtnElement.addClass("disabled");
                                submitBtnElement.addClass("btnGrey");
                                submitBtnElement.removeClass("btnBlue");
                                if(response.rtl)
                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                                else
                                    submitBtnElement.html('<i class="fa fa-check" style="color:#ffffff;"></i>')
                            }
                        });

                        responseInputBox.on("keyup", function (ev)
                        {
                            if ($(this).data("text") != $(this).text()){
                                //enable submit btn
                                var submitBtn = $(this).attr("id")+"_submit";
                                var submitBtnElement = $("#"+submitBtn);
                                submitBtnElement.removeClass("disabled");
                                submitBtnElement.removeClass("btnGrey");
                                submitBtnElement.addClass("btnBlue");
                                if(response.rtl)
                                    submitBtnElement.html('<i class="fa fa-reply"></i>')
                                else
                                    submitBtnElement.html('<i class="fa fa-share"></i>')
                            }
                        })

                        responseInputBox.on("focusin", function ()
                        {
                            var thisBox = $(this);
                            thisBox.data("text", thisBox.text());
                            thisBox.data("tabcalled", false);
                        });
                        responseInputBox.on("focusout", function ()
                        {
                            var thisBox = $(this);
                            var promptId = thisBox.data("promptid");
                            var responseIndex = thisBox.data("index");

                            $("#response_" + promptId + "_" + responseIndex).removeClass("active");
                            $(this).attr('contenteditable', 'false');
                        });

                        var responseInputBoxSubmitBtn = $("#responseInputBox_" + prompt.id + "_" + index + "_submit");
                        responseInputBoxSubmitBtn.on("click", function(){
                            if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                                submitInProgress = false;
                            }
                            if(!submitInProgress && !$(this).hasClass("disabled")){
                                var thisBox = $("#"+$(this).data("responseinputbox"));
                                var promptId = thisBox.data("promptid");
                                var responseIndex = thisBox.data("index");
                                
                                thisBox.removeClass("active");
                                thisBox.attr('contenteditable', 'false');

                                // $(this).hide();
                                // $(this).after('<i class="loader" style="display: inline-block; margin-left:.25em; font-size:.8em;">&nbsp</i>');
                                $(this).html('<i class="loader" style="font-size:.8em;">&nbsp</i>')
                                var responseInteractionEvent = $.Event("responseInteraction");
                                responseInteractionEvent.activityComponentId = activityComponent.id;
                                responseInteractionEvent.promptId = parseInt(promptId);
                                responseInteractionEvent.responseId = 0;
                                responseInteractionEvent.componentTitle = "Transcription";
                                responseInteractionEvent.responseIndex = parseInt(responseIndex);
                                responseInteractionEvent.responseText = thisBox.text();
                                $(document).trigger(responseInteractionEvent);
                            }
                        })


                        responseInputBox.on("paste", function (e)
                        {
                            e.preventDefault();
                        });
                        responseInputBox.on("contextmenu", function (e)
                        {
                            e.preventDefault();
                        });
                        if (response.feedback)
                        {
                            var responseHintArray = new Array();
                            for (var f = 0; f < response.feedback.length; f++)
                            {
                                if (response.feedback[f].feedbackTypeId == 2)
                                    responseHintArray.push(response.feedback[f]);
                            }
                            loadResponseHints(responseBlank, response, responseHintArray);
                        }
                    }
                }
            }
            break;
        case "TRUEFALSE":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                for (var j = 0; j < prompt.responses.length; j++)
                {
                    var response = prompt.responses[j];
                    $("#response_" + response.id).attr("onclick", "toggleGenericResponseInput('"+activityComponent.id+"', '" + prompt.id + "', '" + response.id + "', " + prompt.radioButton + ", '" + activityComponent.renderModeLayout + "', '" + activityComponent.componentTitle + "')");
                }
            }
            break;
        case "WRITING":
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                var writingResponseContent = $(`#writingResponseContent_${prompt.id}`);
                var response = prompt.responses[0];
                var writingSubmitButton = false;
                if (prompt.sketchpad && prompt.sketchpad.submit)
                {
                    writingResponseContent.after('<span id="responseInputSubmit_' + prompt.id + '" class="submitBtn btnGrey disabled" style="text-align:center; width: 10em; margin-top:0.5em; float: ' + (response.rtl ? "right" : "left") + ';"><i class="fa fa-check" style="color:#ffffff;"></i> Submit</span>');
                }
            }
            break;
        default:
            for (var i = 0; i < activityComponent.prompts.length; i++)
            {
                var prompt = activityComponent.prompts[i];
                if (typeof (prompt.responses) != "undefined")
                {
                    for (var j = 0; j < prompt.responses.length; j++)
                    {
                        var response = prompt.responses[j];
                        var responseElement = $("#response_" + response.id);
                        $("#responseContainer_" + response.id).attr("onclick", "toggleGenericResponseInput('" + activityComponent.id + "', '" + prompt.id + "', '" + response.id + "', " + prompt.radioButton + ", '" + activityComponent.renderModeLayout + "', '" + activityComponent.componentTitle + "')");
                        $("#responseLabel_" + response.id).attr("onclick", "toggleGenericResponseInput('" + activityComponent.id + "', '" + prompt.id + "', '" + response.id + "', " + prompt.radioButton + ", '" + activityComponent.renderModeLayout + "', '" + activityComponent.componentTitle + "')");
                    }
                }
            }
            break;
    }
}

//***********************************GENERIC***********************************//
function toggleGenericResponseInput(activityComponentId, promptId, responseId, radioButton, renderModeLayout, componentTitle)
{
    if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
        submitInProgress = false;
    }
    if(!submitInProgress){
        var inputToggledOn = toggleInput(promptId, responseId, radioButton, renderModeLayout);
        var responseInteractionEvent = $.Event("responseInteraction");
        responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
        if (!inputToggledOn)
            responseInteractionEvent.action = "remove";
        responseInteractionEvent.promptId = parseInt(promptId);
        responseInteractionEvent.responseId = parseInt(responseId);
        responseInteractionEvent.componentTitle = componentTitle;
        responseInteractionEvent.responseText = "";
        $(document).trigger(responseInteractionEvent);
    }
}

//***********************************CATEGORIZATION***********************************//
function setupCategorizationWordPoolDragAndDrop(activityComponent)
{
    var categoryColumnWidth;
    $("#categorizationTableBody_" + activityComponent.id).find("[id*=responsesContainer_]").each(function ()
    {
        $(this).droppable({
            hoverClass: 'categoryColumnHover',
            accept: ".draggableContent",
            over: function (event, ui)
            {
                ui.draggable.addClass('hoverOver')
            },
            out: function (event, ui)
            {
                ui.draggable.removeClass('hoverOver')
            },
            drop: function (event, ui)
            {
                dropCategorizationWordPoolResponse(event, ui.draggable, $(this), activityComponent, false);
            }
        });
    });

    $("#categorizationResponsesDiv_" + activityComponent.id).find(".draggableContent").each(function ()
    {
        var draggableId = $(this).attr("id").split("_")[1]

        $(this).draggable({
            revert: true,
            handle: $("#draggableResponseContent_" + draggableId),
            containment: $("#tabDetails_" + activityComponent.id),
        });
    });

    $("#categorizationResponsesDiv_" + activityComponent.id).droppable({
        hoverClass: 'categoryColumnHover',
        accept: ".draggableContent",
        over: function (event, ui)
        {
            ui.draggable.addClass('hoverOver')
        },
        out: function (event, ui)
        {
            ui.draggable.removeClass('hoverOver')
        },
        drop: function (event, ui)
        {
            dropCategorizationWordPoolResponse(event, ui.draggable, $(this), activityComponent, true);
        }
    });
}

function dropCategorizationWordPoolResponse(event, dragElement, dropElement, activityComponent, isResponseContainer)
{
    var oldParent = dragElement.parent()
    dropElement.append(dragElement);
    dragElement.css("top", "0");
    dragElement.css("left", "0");
    dragElement.removeClass("hoverOver")

    //Inline-block element needs to be removed so that wordpool can be cleared as responses are moved out. New Inline Wrapper will be created if the element is dropped onto the wordpool
    if (oldParent.css("display") == "inline-block")
    {
        oldParent.remove()
    }

    $("#categorizationTableBody_" + activityComponent.id).find(".categoryColumn").each(function ()
    {
        var categoryDropElement = $(this);
        var promptId = categoryDropElement.data("promptid");
        var responseInteractionEvent = $.Event("responseInteraction");
        responseInteractionEvent.activityComponentId = activityComponent.id;
        responseInteractionEvent.promptId = parseInt(promptId);
        responseInteractionEvent.responseId = 0;
        responseInteractionEvent.componentTitle = "Categorization";
        responseInteractionEvent.responseText = "";
        var responseIdArr = new Array();
        categoryDropElement.find("[id^='response_']").each(function ()
        {
            responseIdArr.push($(this).data("responseid"));
        });
        responseInteractionEvent.responseIds = responseIdArr.join();
        $(document).trigger(responseInteractionEvent);
    });

    if (dropElement.hasClass("categoryColumn"))
    {
        dragElement.find(".feedbackContainer").each(function ()
        {
            $(this).css({ "min-width": "1px", "width": "auto" })
        })
        dragElement.css("width", "auto")

    }
    else
    {
        var colPercentage = 100 / (activityComponent.prompts.length);
        var responseIdInt = dragElement.attr("id").split("_")[2]
        dragElement.wrap('<div id="dragInlineElement_' + responseIdInt + '" class="dragInlineElement"></div>');
        dragElement.find(".feedbackContainer").each(function ()
        {
            $(this).css({ "min-width": "1px", "width": "auto" })
        })
        $("#dragInlineElement_" + responseIdInt).css({ "display": "inline-block" })
        dragElement.css("width", "auto")
    }
    $("#categorizationResponsesDiv_" + activityComponent.id).removeAttr("style")
    dragElement.find(".feedbackContainer").html("")//Clear any feedback indicator
}

function setupCategorizationDragAndDrop(activityComponent)
{
    $("#categorizationTableBody_" + activityComponent.id).find(".draggableContent").each(function ()
    {
        $(this).draggable({
            revert: true,
            containment: $("#tabDetails_" + activityComponent.id)
        });
    });

    $("#categorizationTableBody_" + activityComponent.id).find("[id*=responsesContainer_]").each(function ()
    {
        $(this).droppable({
            hoverClass: 'categoryColumnHover',
            accept: ".draggableContent",
            over: function (event, ui)
            {
                ui.draggable.addClass('hoverOver')
            },
            out: function (event, ui)
            {
                ui.draggable.removeClass('hoverOver')
            },
            drop: function (event, ui)
            {
                dropCategorizationResponse(event, ui.draggable, $(this), activityComponent, false);
            }
        });
    });

    $("#categorizationResponsesDiv_" + activityComponent.id).droppable({
        hoverClass: 'categoryColumnHover',
        accept: ".draggableContent",
        over: function (event, ui)
        {
            ui.draggable.addClass('hoverOver')
        },
        out: function (event, ui)
        {
            ui.draggable.removeClass('hoverOver')
        },
        drop: function (event, ui)
        {
            dropCategorizationResponse(event, ui.draggable, $(this), activityComponent, true);
        }
    });
}

function dropCategorizationResponse(event, dragElement, dropElement, activityComponent, isResponseContainer)
{
    $("#responseCol_" + activityComponent.id).css("width", $("#responseCol_" + activityComponent.id).css("width"))

    dropElement.append(dragElement);
    dragElement.css("top", "0");
    dragElement.css("left", "0");
    dragElement.removeClass("hoverOver")

    $("#categorizationTableBody_" + activityComponent.id).find(".categoryColumn").each(function ()
    {
        var categoryDropElement = $(this);
        var promptId = categoryDropElement.data("promptid");
        var responseInteractionEvent = $.Event("responseInteraction");
        responseInteractionEvent.activityComponentId = activityComponent.id;
        responseInteractionEvent.promptId = parseInt(promptId);
        responseInteractionEvent.responseId = 0;
        responseInteractionEvent.componentTitle = "Categorization";
        responseInteractionEvent.responseText = "";
        var responseIdArr = new Array();
        categoryDropElement.find("[id^='response_']").each(function ()
        {
            responseIdArr.push($(this).data("responseid"));
        });
        responseInteractionEvent.responseIds = responseIdArr.join();
        $(document).trigger(responseInteractionEvent);
    });
    dragElement.find(".feedbackContainer").html("").css({ "min-width": "1px", "width": "auto" })//Clear any feedback indicator
    columnResponseHeightFixer(activityComponent.id)
}


//***********************************FILL IN THE BLANK***********************************//
function dropFillInTheBlankResponse(event, dragElement, dropElement, activityComponentId)
{
    var dragElementParent = dragElement.parent();
    if (dragElementParent.attr("id") != dropElement.attr("id"))
    {
        dropElement.removeClass("dropTarget");
        dragElement.removeClass("hoverOver");
        var currentItem = dropElement.children(".word");
        dropElement.prepend(dragElement);
        if (currentItem.length > 0)
        {
            dragElementParent.prepend(currentItem);
            if (!dragElementParent.hasClass("wordPool"))
            {
                //Swapping 2 answers between 2 blanks
                var responseInteractionEvent = $.Event("responseInteraction");
                responseInteractionEvent.componentTitle = "FillInTheBlank";
                responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
                responseInteractionEvent.promptId = parseInt(dragElementParent.data("promptid"));
                responseInteractionEvent.responseId = parseInt(currentItem.data("responseid"));
                responseInteractionEvent.responseText = currentItem.text();
                responseInteractionEvent.responseIndex = parseInt(dragElementParent.data("index"));
                $(document).trigger(responseInteractionEvent);
            }
        }
        var componentContainer = $("#tabDetails_" + activityComponentId);
        componentContainer.find(".response").each(function ()
        {
            var dropTarget = $(this);
            if (dropTarget.children().length == 0)
            {
                dropTarget.addClass("dropTarget");
            }
        });
        if (!dragElementParent.hasClass("wordPool"))
        {
            //moving an answer from one blank to another - remove the previous answer
            var removeResponseInteractionEvent = $.Event("responseInteraction");
            removeResponseInteractionEvent.componentTitle = "FillInTheBlank";
            removeResponseInteractionEvent.action = "remove";
            removeResponseInteractionEvent.activityComponentId = parseInt(activityComponentId);
            removeResponseInteractionEvent.promptId = parseInt(dragElementParent.data("promptid"));
            removeResponseInteractionEvent.responseId = parseInt(dragElement.data("responseid"));
            removeResponseInteractionEvent.responseText = dragElement.text();
            removeResponseInteractionEvent.responseIndex = parseInt(dragElementParent.data("index"));
            $(document).trigger(removeResponseInteractionEvent);
        }
        var responseInteractionEvent = $.Event("responseInteraction");
        responseInteractionEvent.componentTitle = "FillInTheBlank";
        responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
        responseInteractionEvent.promptId = parseInt(dropElement.data("promptid"));
        responseInteractionEvent.responseId = parseInt(dragElement.data("responseid"));
        responseInteractionEvent.responseText = dragElement.text();
        responseInteractionEvent.responseIndex = parseInt(dropElement.data("index"));
        $(document).trigger(responseInteractionEvent);
    }
}

function setupFillInTheBlankDrop(activityComponentId)
{
    $("#responsePool_" + activityComponentId).droppable(
    {
        hoverClass: 'dropAreaHover', accept: ".draggableWord", drop: function (event, ui)
        {
            var responsePool = $(this);
            var dragElement = ui.draggable;
            var dragElementParent = dragElement.parent();
            if (dragElementParent.attr("id") != responsePool.attr("id"))
            {
                dragElementParent.addClass("dropTarget");
                responsePool.prepend(dragElement);

                var responseInteractionEvent = $.Event("responseInteraction");
                responseInteractionEvent.action = "remove";
                responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
                responseInteractionEvent.promptId = parseInt(dragElementParent.data("promptid"));
                responseInteractionEvent.responseId = parseInt(dragElement.data("responseid"));
                responseInteractionEvent.componentTitle = "FillInTheBlank";
                responseInteractionEvent.responseText = dragElement.text();
                responseInteractionEvent.responseIndex = parseInt(dragElementParent.data("index"));
                $(document).trigger(responseInteractionEvent);
            }
        }
    });
}


function showFillInBlankSubMenu(event)
{
    if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
        submitInProgress = false;
    }
    if(!submitInProgress){
        var promptId = event.data.promptId;
        var index = event.data.index;
        var blankAnchor = $("#blankAnchorCaret_" + promptId + "_" + index);
        var submenu = blankAnchor.siblings(".fnbDropDownMenu");
        var blankTarget = $("#blankAnchor_" + promptId + "_" + index);
        submenu.css("left", blankTarget.position().left + "px");
        submenu.css("top", (blankTarget.offset().top + blankTarget.css("height")) + "px");

        if (blankAnchor.hasClass("actionTriggerOn"))
        {
            blankAnchor.removeClass("actionTriggerOn");
            $('html').unbind("click");
        }
        if (submenu.css("display") == "none")
        {
            submenu.css("display", "inline-block");

            blankAnchor.addClass("actionTriggerOn");
            event.stopPropagation();

            $('html').click(function ()
            {
                //Hide the menus if visible
                submenu.css("display", "none");
                blankAnchor.removeClass("actionTriggerOn");
                $(this).unbind("click");
            });
        } else
        {
            submenu.css("display", "none");
        }
        blankAnchor.click(function (event)
        {
            event.stopPropagation();
        });
        submenu.click(function (event)
        {
            event.stopPropagation();
        });
    }
}


function selectBlankResponse(element, activityComponentId)
{
    //used for drop down response selection
    var params = element.data("params")
    var promptId = params[0];
    var index = params[1];
    var blankAnchor = $("#blankAnchor_" + promptId + "_" + index);
    var blankResponseSelector = element;
    var selectedAnswer = blankResponseSelector.html();
    blankAnchor.attr("dir", (blankResponseSelector.attr("dir")));
    blankAnchor.html(selectedAnswer);
    $("#fnbDropDownMenu_" + promptId + "_" + index).hide();

    var responseInteractionEvent = $.Event("responseInteraction");
    responseInteractionEvent.componentTitle = "FillInTheBlank";
    responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
    responseInteractionEvent.promptId = parseInt(promptId);
    responseInteractionEvent.responseId = 0;
    responseInteractionEvent.responseText = selectedAnswer;
    responseInteractionEvent.responseIndex = parseInt(index);
    $(document).trigger(responseInteractionEvent);
}

//***********************************FIND AND CLICK***********************************//
function setupHotspotInteractivity(event)
{
    var hotspot = $("#responseHotspot_" + event.responseId);
    if (hotspot.length > 0)
    {
        hotspot.click(function ()
        {
            if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
                submitInProgress = false;
            }
            if(!submitInProgress){
                hotspot.remove();
                var responseInteractionEvent = $.Event("responseInteraction");
                responseInteractionEvent.action = "remove";
                responseInteractionEvent.activityComponentId = parseInt(event.activityComponentId);
                responseInteractionEvent.promptId = parseInt(hotspot.data("promptid"));
                responseInteractionEvent.responseId = parseInt(hotspot.data("responseid"));
                responseInteractionEvent.responseIndex = parseInt(hotspot.data("index"));
                responseInteractionEvent.componentTitle = "FindAndClick";
                responseInteractionEvent.responseText = "";
                $(document).trigger(responseInteractionEvent);
            }
        });
    }
}

//***********************************MATCHING***********************************//
function setupMatchingDrag(activityComponentId, responseId)
{
    var dragElement = $("#matchingResponseDiv_" + responseId);

    dragElement.draggable({
        revert: function (socketObj) { return !socketObj; },
        containment: $("#tabDetails_" + activityComponentId)
    });

    dragElement.on("dragstart", function (event, ui)
    {
        if (!isAnimationRunning)
        {
            $(".dropAreaHover").removeClass("dropAreaHover");
            var responseId = $(this).data("responseid");
            var myParentElement = $("#matchingResponseDiv_" + responseId);
            $(".responseContainerActive").removeClass("responseContainerActive");
            myParentElement.toggleClass("responseContainerActive");
//            $(".responseColumn>.responseContainerPlaced").removeClass("responseContainerPlaced");
            //myparentelement.addClass("responseContainerPlaced");
            myParentElement.find(".dropArea").each(function ()
            {
                $(this).addClass("dropAreaHoverHome");
            });
        }
    });

    dragElement.on("dragstop", function (event, ui)
    {
        var responseId = $(this).data("responseid");
        var myParentElement = $("#matchingResponseDiv_" + responseId);
        myParentElement.find(".dropArea").each(function ()
        {
            $(this).removeClass("dropAreaHoverHome");
        });
    });

    var draggableParentElement = dragElement.parent();
    //setup returns droppable to original location, "cancel" student selection
    draggableParentElement.droppable({
        hoverClass: 'dropAreaHover',
        accept: dragElement,
        over: function (event, ui)
        {
            ui.draggable.addClass('hoverOver')
        },
        out: function (event, ui)
        {
            ui.draggable.removeClass('hoverOver')
        },
        drop: function (event, ui)
        {
            resetMatchingPrompt(event, ui.draggable, $(this), activityComponentId);
            var smallerHeight = $("#tabDetails_" + activityComponentId).height() - $(this).height();
            $("#matchColumnDivider_" + activityComponentId).css("height", smallerHeight)
            var responseId = dragElement.data("responseid");
            var promptId = dragElement.data("selectedpromptid");
            var promptIndex = $("#matchingPromptDropArea_" + promptId).data("promptindex");
            var activityComponentId = $("#matchingPromptDropArea_" + promptId).data("activitycomponentid");
            dragElement.data("selectedpromptid", 0);
            resetMatchingColumnToggle(activityComponentId, promptIndex);
            if ((responseId > 0) && (promptId > 0))
            {
                var responseInteractionEvent = $.Event("responseInteraction");
                responseInteractionEvent.action = "remove";
                responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
                responseInteractionEvent.promptId = parseInt(promptId);
                responseInteractionEvent.responseId = parseInt(responseId);
                responseInteractionEvent.componentTitle = "Matching";
                responseInteractionEvent.responseText = "";
                $(document).trigger(responseInteractionEvent);
            }
        }
    });
}

function setupMatchingDrop(activityComponentId, promptId)
{
    $("#matchingPromptDropArea_" + promptId).each(function ()
    {
        $(this).droppable({
            hoverClass: 'dropAreaHover',
            accept: ".dragElement",
            over: function (event, ui)
            {
                ui.draggable.addClass('hoverOver')
            },
            out: function (event, ui)
            {
                ui.draggable.removeClass('hoverOver')
            },
            drop: function (event, ui)
            {
                dropMatchingResponse(event, ui.draggable, $(this), activityComponentId);
            }
        });
    });
}

function resetDropTargetIcon()
{
    $(".matchingPrompt").find(".dropArea").each(function ()
    {
        if ($(this).find(".dragElement").length > 0)
        {
            $(this).find(".dropTargetIcon").hide();
        } else
        {
            $(this).find(".dropTargetIcon").show();
        }
    })
}

function resetMatchingColumnToggle(activityComponentId, promptIndex)
{
    $("#matchingLock_" + activityComponentId+"_"+promptIndex).attr("class", matchingUnlinkedIcon + " matchingLock")
    $("#matchingColumnDivider_" + activityComponentId+"_"+promptIndex).data("islocked", false)
}

function resetAllMatchingColumnToggles()
{
    $(".matchingPrompt").find(".dropArea").each(function ()
    {
        var matchingPrompt = $(this);
        if (matchingPrompt.find(".dragElement").length == 0)
        {
            var activityComponentId = matchingPrompt.data("activitycomponentid");
            var promptIndex = matchingPrompt.data("promptindex");
            resetMatchingColumnToggle(activityComponentId, promptIndex)
        }
    })
}

function resetMatchingPrompt(event, dragElement, dropElement, activityComponentId)
{
    //center the droped element on the target
    dropElement.append(dragElement);
    dragElement.css("top", "0");
    dragElement.css("left", "0");
    dragElement.removeClass("dragElementDropped")
    dragElement.data("isplaced", false);
    dragElement.removeClass("hoverOver")
    //remove the matchingstudentresponseid from any prompt
    $(".matchingPrompt").each(function ()
    {
        var matchingPrompt = $(this);
        if (matchingPrompt.data("matchingstudentresponseid") == dragElement.data("responseid"))
        {
            matchingPrompt.removeData("matchingstudentresponseid");
            var promptIndex = matchingPrompt.data("promptindex");
            resetMatchingColumnToggle(activityComponentId, promptIndex);
        }
    });
    resetDropTargetIcon();
}

function dropMatchingResponse(event, dragElement, dropTarget, activityComponentId)
{
    var promptId = dropTarget.data("promptid");
    var promptIndex = dropTarget.data("promptindex");
    var responseId = dragElement.data("responseid");
    //Sends the current dragElement that is already placed back to its original location
    var currentItem = dropTarget.children(".dragElement");
    var dragElementHomeDropArea = $("#matchingResponseDropArea_" + responseId);
    var dragElementParent = $("#matchingResponse_" + responseId);

    dragElement.addClass("dragElementDropped");
    dragElement.data("isplaced", true);
    dragElement.removeClass("hoverOver");

    //Resets the highlights
    $("#matchingContainer_"+activityComponentId).find(".responseContainer").each(function ()
    {
        $(this).removeClass("responseContainerActive");
    });

    //visual bug fix to check if the same item being dropped is not re-dropped on the drop area.
    var isResponseContainer = dragElementParent.hasClass("responseContainer");
    if (isResponseContainer)
    {
        dragElementParent.addClass("responseContainerActive");
    }

    //remove the matchingstudentresponseid from any prompt
    $(".matchingPrompt").each(function ()
    {
        if ($(this).data("matchingstudentresponseid") == responseId)
        {
            $(this).removeData("matchingstudentresponseid")
        }
    });

    //if there are already elements dropped on the drop target return the response content to it's original home
    if (currentItem.length > 0)
    {
        currentItem.hide();
        var currentItemResponseId = currentItem.data("responseid");
        $("#matchingResponseDropArea_" + currentItemResponseId).prepend(currentItem);
        currentItem.fadeIn();
        currentItem.removeClass("dragElementDropped");
        currentItem.data("isplaced", false);
        currentItem.data("selectedpromptid", 0);
        resetMatchingColumnToggle(activityComponentId, promptIndex);
        resetAllMatchingColumnToggles();
        var responseInteractionEvent = $.Event("responseInteraction");
        responseInteractionEvent.action = "remove";
        responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
        responseInteractionEvent.promptId = parseInt(promptId);
        responseInteractionEvent.responseId = parseInt(currentItemResponseId);
        responseInteractionEvent.componentTitle = "Matching";
        responseInteractionEvent.responseText = "";
        $(document).trigger(responseInteractionEvent);
    }

    //center the dropped element on the target
    dropTarget.append(dragElement);
    resetDropTargetIcon();
    dragElement.css("top", "0");
    dragElement.css("left", "0");
    dragElement.data("isplaced", true);

    //clear any instance of the response already assigned to a different prompt
    var promptElement = $("#matchingPrompt_" + promptId);

    if (promptElement.data("matchingstudentresponseid") != responseId)
    {
        //assign the students response to the prompt. Use it for checking answers
        promptElement.data("matchingstudentresponseid", responseId);
    }

    var replaceThisResponse = $("#matchingResponseContainer_" + activityComponentId+"_"+promptIndex).find(".responseContainer");//Response that is currently in the same row as the prompt
    var withThisResponse = $("#matchingResponse_" + responseId);//Response that should move to the prompt Row
    isAnimationRunning = true;
    matchingDragDisable(activityComponentId);

    withThisResponse.fadeTo(animationDuration, 0, function ()
    {
        replaceThisResponse.fadeTo(animationDuration, 0, function ()
        {
            swapElements(replaceThisResponse[0], withThisResponse[0]);
            withThisResponse.fadeTo(animationDuration, 1, function ()
            {
                replaceThisResponse.fadeTo(animationDuration, 1, function ()
                {
                    var selectedPromptId = dragElement.data("selectedpromptid");
                    if (selectedPromptId > 0)
                    {
                        var responseRemoveEvent = $.Event("responseInteraction");
                        responseRemoveEvent.action = "remove";
                        responseRemoveEvent.activityComponentId = parseInt(activityComponentId);
                        responseRemoveEvent.promptId = parseInt(selectedPromptId);
                        responseRemoveEvent.responseId = parseInt(responseId);
                        responseRemoveEvent.componentTitle = "Matching";
                        responseRemoveEvent.responseText = "";
                        $(document).trigger(responseRemoveEvent);
                    }
                    dragElement.data("selectedpromptid", promptId);
                    isAnimationRunning = false;
                    matchingDragEnable(activityComponentId);
                    resetAllMatchingColumnToggles();
                    toggleMatchingLink(activityComponentId, promptId, promptIndex)
                    var responseInteractionEvent = $.Event("responseInteraction");
                    responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
                    responseInteractionEvent.promptId = parseInt(promptId);
                    responseInteractionEvent.responseId = parseInt(responseId);
                    responseInteractionEvent.componentTitle = "Matching";
                    responseInteractionEvent.responseText = "";
                    $(document).trigger(responseInteractionEvent);
                })
            })
        })
    })
}

function matchingDragDisable(activityComponentId)
{
    $("#componentContainer_" + activityComponentId).find(".dragElement").each(function ()
    {
        $(this).draggable("disable")
    })
}

function matchingDragEnable(activityComponentId)
{
    $("#componentContainer_" + activityComponentId).find(".dragElement").each(function ()
    {
        $(this).draggable("enable")
    })
}

//***********************************ORDERING***********************************//
function setupVerticalOrderingResponseSortables(promptId, activityComponentId)
{
    $("#responsesContainer_" + promptId).sortable({
        placeholder: "sortable-placeholder",
        items: ".orderingEnabled",
        axis: "y",
        containment: "#responsesContainer_" + promptId,
        update: function (event, ui)
        {
            dropSortableOrderingResponse($(this).sortable("toArray").toString(),
            promptId, activityComponentId);
        }
    });
}

function setupHorizontalOrderingResponseSortables(promptId, activityComponentId)
{
    $("#responsesContainer_" + promptId).sortable({
        placeholder: "horizontal-sortable-placeholder",
        items: ".orderingEnabled",
        containment: "#responsesContainer_" + promptId,
        update: function (event, ui)
        {
            dropSortableOrderingResponse($(this).sortable("toArray").toString(),
            promptId, activityComponentId);
        }/*,
        start: function( event, ui ) {
            ui.placeholder.css("width","0");
        }*/
    });
}


function dropSortableOrderingResponse(newOrder, promptId, activityComponentId)
{
    var activityComponentDiv = $("#tabDetails_" + activityComponentId).parent();
    var newOrderArr = newOrder.split(',');
    for (var i = 0; i < newOrderArr.length; i++)
    {
        var response = $("#" + newOrderArr[i])
        newOrderArr[i] = newOrderArr[i].split('_')[1];
    }
    newOrder = newOrderArr.join(",");
    var responseInteractionEvent = $.Event("responseInteraction");
    responseInteractionEvent.activityComponentId = parseInt(activityComponentId);
    responseInteractionEvent.promptId = parseInt(promptId);
    responseInteractionEvent.responseId = 0;
    responseInteractionEvent.responseIds = newOrder;
    responseInteractionEvent.componentTitle = "Ordering";
    responseInteractionEvent.responseText = "";
    $(document).trigger(responseInteractionEvent);
}

//***********************************TEXT SELECTOR***********************************//

function bindSelectableText(responseElement, activityComponent)
{
    responseElement.click(function ()
    {
        if(typeof submitInProgress === 'undefined'){//submitInProgress global in recordStudentACtion.js
            submitInProgress = false;
        }
        if(!submitInProgress){
            var selected = responseElement.hasClass("selectableHighlight") || responseElement.hasClass("incorrect") || responseElement.hasClass("correct");
            if (selected)
                responseElement.attr("class", "response");
            else
                responseElement.addClass("selectableHighlight");
            var responseInteractionEvent = $.Event("responseInteraction");
            if (selected)
                responseInteractionEvent.action = "remove";
            responseInteractionEvent.activityComponentId = activityComponent.id;
            responseInteractionEvent.promptId = parseInt(responseElement.data("promptid"));
            responseInteractionEvent.responseId = parseInt(responseElement.data("responseid"));
            responseInteractionEvent.responseIndex = parseInt(responseElement.data("index"));
            responseInteractionEvent.componentTitle = "TextSelector";
            responseInteractionEvent.responseText = "";
            $(document).trigger(responseInteractionEvent);
        }
    });
}

function loadResponseHints(inputBox, response, hintArray)
{
    if (hintArray.length > 0)
    {
        var hintButtonHTML = '<span id="inlineHintContainer_'+response.id+'" class="hintContainer inlineHintContainer" title="Hint"><i class="fa fa-medkit"></i></span>';
        inputBox.after(hintButtonHTML);
        var inlineHintContainer = $("#inlineHintContainer_" + response.id);
        inlineHintContainer.on("click", function ()
        {
            loadResponseHintDialog(response, hintArray);
        });
    }
}

function loadResponseHintDialog(response, hintArray)
{
    var hintDialogHTML = '<div id="responseHintDialogPager" class="feedbackCounter"></div>';
    hintDialogHTML += '<div id="responseHintDialogContainer">';
    for (var h = 0; h < hintArray.length; h++)
    {
        hintDialogHTML += '<div id="responseHint_' + response.id + '_' + h + '" data-hintindex="' + h + '">' + htmlDecode(hintArray[h].text) + '</div>';
    }
    hintDialogHTML += '</div>';
    var iconHTML = "<div id=\"popUpHeaderIcon\"><i class=\"icon fa fa-medkit\"></i></div>";
    openCustomDialog("Hint" + (hintArray.length == 1 ? "" : "s"), hintDialogHTML, "", iconHTML);
    navigateResponseHintDialog(0, hintArray.length);
}

function navigateResponseHintDialog(hintIndex, hintCount)
{
    if (hintCount > 1)
    {
        var previousIndex = hintIndex - 1;
        var nextIndex = hintIndex + 1;
        $("#responseHintDialogContainer").children("[id^='responseHint_']").each(function ()
        {
            var responseHintDiv = $(this);
            if (responseHintDiv.data("hintindex") == hintIndex)
                responseHintDiv.show();
            else
                responseHintDiv.hide();
        });
        var hintPagerHTML = '';
        hintPagerHTML += '<span id="responseHintPagerPreviousBtn" class="feedbackPager' + (previousIndex < 0 ? " disabled" : "") + '"><i class="fa fa-chevron-left"></i></span>';
        hintPagerHTML += '<span id="responseHintDialogCounter" style="cursor:pointer;">' + (hintIndex + 1) + ' of ' + hintCount + '</span>';
        hintPagerHTML += '<span id="responseHintPagerNextBtn" class="feedbackPager' + ((nextIndex > hintCount - 1) ? " disabled" : "") + '"><i class="fa fa-chevron-right"></i></span>';
        $("#responseHintDialogPager").html(hintPagerHTML);
        if (previousIndex >= 0)
        {
            $("#responseHintPagerPreviousBtn").click(function ()
            {
                navigateResponseHintDialog(previousIndex, hintCount);
            });
        }
        $("#responseHintDialogCounter").click(function ()
        {
            navigateResponseHintDialog(hintIndex, hintCount);
        });
        if (nextIndex <= hintCount - 1)
        {
            $("#responseHintPagerNextBtn").click(function ()
            {
                navigateResponseHintDialog(nextIndex, hintCount);
            });
        }
    }
}

function setupSubmitStudentSpeakingButton(containerElement, file)
{
    var componentTitle = containerElement.attr("data-componenttitle");
    var activityComponentId = containerElement.attr("data-activitycomponentid");
    var promptId = containerElement.attr("data-promptid");
    var responseInputSubmit = $("#responseInputSubmit_" + promptId);

    responseInputSubmit.removeClass("disabled");
    responseInputSubmit.removeClass("btnGrey");
    responseInputSubmit.addClass("btnBlue");
    if (responseInputSubmit.attr("data-dir") == "rtl")
        responseInputSubmit.html('<i class="fa fa-reply"></i> Submit')
    else
        responseInputSubmit.html('<i class="fa fa-share"></i> Submit')

    responseInputSubmit.unbind("click");
    responseInputSubmit.on("click", function (event)
    {
        if (typeof submitInProgress === 'undefined')
        {//submitInProgress global in recordStudentACtion.js
            submitInProgress = false;
        }
        if (!submitInProgress && !$(this).hasClass("disabled"))
        {
            event.stopPropagation();    // Prevent click from bubbling to the parent click

            containerElement.removeClass("active");
            responseInputSubmit.addClass("disabled");
            responseInputSubmit.addClass("btnGrey");
            responseInputSubmit.removeClass("btnBlue");

            var speakingSubmitButtonClickEvent = $.Event("speakingSubmitButtonClick");
            speakingSubmitButtonClickEvent.activityComponentId = activityComponentId;
            speakingSubmitButtonClickEvent.containerElement = containerElement;
            speakingSubmitButtonClickEvent.file = file;
            $(document).trigger(speakingSubmitButtonClickEvent);
        }
    });
}

function setupSubmitStudentWritingButton(containerElement, sketchPad)
{
    var componentTitle = containerElement.attr("data-componenttitle");
    var activityComponentId = containerElement.attr("data-activitycomponentid");
    var promptId = containerElement.attr("data-promptid");
    var responseId = containerElement.attr("data-responseid");
    var responseInputSubmit = $("#responseInputSubmit_" + promptId);

    responseInputSubmit.removeClass("disabled");
    responseInputSubmit.removeClass("btnGrey");
    responseInputSubmit.addClass("btnBlue");
    if (responseInputSubmit.attr("data-dir") == "rtl")
        responseInputSubmit.html('<i class="fa fa-reply"></i> Submit')
    else
        responseInputSubmit.html('<i class="fa fa-share"></i> Submit')

    responseInputSubmit.unbind("click");
    responseInputSubmit.on("click", function (event)
    {
        if (typeof submitInProgress === 'undefined')
        {//submitInProgress global in recordStudentACtion.js
            submitInProgress = false;
        }
        if (!submitInProgress && !$(this).hasClass("disabled"))
        {
            event.stopPropagation();    // Prevent click from bubbling to the parent click

            containerElement.removeClass("active");
            responseInputSubmit.addClass("disabled");
            responseInputSubmit.addClass("btnGrey");
            responseInputSubmit.removeClass("btnBlue");
            var writingSubmitButtonClickEvent = $.Event("writingSubmitButtonClick");
            writingSubmitButtonClickEvent.activityComponentId = activityComponentId;
            writingSubmitButtonClickEvent.containerElement = containerElement;
            writingSubmitButtonClickEvent.sketchPad = sketchPad;
            $(document).trigger(writingSubmitButtonClickEvent);
        }
    });
}

function setActivityTriggers()
{
    if (module.hiddenActivities)
    {
        for (var ha = 0; ha < module.hiddenActivities.length; ha++)
        {
            var activity = module.hiddenActivities[ha];
            if ((typeof (activity.behaviorType) != "undefined") && activity.behaviorType > 0)
                window[resolveActivityComponentFunctionName("setup" + cleanString(behaviorTypes[activity.behaviorType].type) + "ActivityTriggers", "setupActivityTriggers")](activity, behaviorTypes[activity.behaviorType]);
        }
    }
}

function setupActivityTriggers(activity, behaviorType)
{
    console.log("Activity Trigger (" + activity.behaviorType.type + ") not yet implemented.");
}

function setupTimedActivityTriggers(activity, behaviorType)
{    
    var time = activity.behaviorTrigger;
    if (typeof(studentAssignment) != "undefined" && studentAssignment.signatureDate)
    {
        var timeSinceSignature = new Date(systemDate) - new Date(studentAssignment.signatureDate);
        time = time - timeSinceSignature;
    }
    else if (elapsedTime)
    {
        time = time - elapsedTime * 1000;
    }
    if (time > 0)
        setTimeout(function() { triggerActivity(activity, behaviorType); }, time);
    else
        triggerActivity(activity, behaviorType);
}


function setupNavigationActivityTriggers(activity, behaviorType)
{
    var allPrevious = activity.behaviorTrigger > 0;
    var allComplete = true;
    var activityComplete = activity.triggerData && activity.triggerData.completeDate;
    if (activityComplete)
        hideHiddenActivity(activity);
    else if (activity.sortKey > 1)
    {
        for (var a = 0; a < module.activities.length; a++)
        {
            if (module.activities[a].sortKey > activity.sortKey)
                break;
            if ((allPrevious && !module.activities[a].complete) || (!allPrevious && (module.activities[a].sortKey == activity.sortKey - 1) && !module.activities[a].complete))
                allComplete = false;
        }
        for (var ha = 0; ha < module.hiddenActivities.length; ha++)
        {
            if (module.hiddenActivities[ha].sortKey >= activity.sortKey)
                break;
            var hiddenActivityComplete = module.hiddenActivities[ha].triggerData && module.hiddenActivities[ha].triggerData.completeDate;
            if ((allPrevious && !hiddenActivityComplete) || (!allPrevious && (module.hiddenActivities[ha].sortKey == activity.sortKey - 1) && !hiddenActivityComplete))
                allComplete = false;
        }
    }
    if (allComplete)
        triggerActivity(activity);
}

// TODO: Implement setupProctorInitiatedActivityTriggers
function setupProctorInitiatedActivityTriggers(activity, behaviorType) 
{
    if (typeof (assignment) != "undefined")
    {
        if (assignment.sessionState)
        {
            var sessionStateObj = $.parseJSON(htmlDecode(assignment.sessionState));
            for (var i = 0; i < sessionStateObj.proctorInitiatedActivities.length; i++)
            {
                if (sessionStateObj.proctorInitiatedActivities[i].id === activity.id && sessionStateObj.proctorInitiatedActivities[i].visible)
                {
                    triggerActivity(activity);
                    break;
                }
                else
                {
                    hideHiddenActivity(activity);
                }
            }
        }
    }
}

/*function setupScoredActivityTriggers(activity, behaviorType)
{
}
*/


function triggerActivity(activity, behaviorType)
{
    if ((activity.triggerData == false)||(activity.triggerData.completeDate == false))
    {
        killMedia($(document));
        $("#hiddenPanel_" + activity.id).show();
        $("#activityTitle").html(htmlDecode(activity.title));
        if (activity.complete)
            showActivityCompletionButton(activity);
        showHiddenActivity(activity);

        if (activity.triggerData == false)
            activity.triggerData = { "activityId": activity.id, "triggerDate": false, "completeDate": false };
        activity.triggerData.triggerDate = new Date().toISOString();

        var activityTriggerEvent = $.Event("activityTriggered");
        activityTriggerEvent.activity = activity;
        activityTriggerEvent.complete = false;
        $(document).trigger(activityTriggerEvent);
    }
}

function completeTriggeredActivityComponent(activityComponentId)
{
    if (module.hiddenActivities)
    {
        for (var ha = 0; ha < module.hiddenActivities.length; ha++)
        {
            var hiddenActivity = module.hiddenActivities[ha];
            for (var hac = 0; hac < hiddenActivity.activityComponents.length; hac++)
            {
                if ((hiddenActivity.activityComponents[hac].id == activityComponentId) && (hiddenActivity.complete))
                {
                    showActivityCompletionButton(hiddenActivity);
                }
            }
        }
    }
}

function completeTriggeredActivity(activity)
{
    if (activity.complete)
    {
        hideHiddenActivity(activity);
        if (activity.triggerData == false)
            activity.triggerData = { "activityId": activity.id, "triggerDate": new Date().toISOString(), "completeDate": false };
        activity.triggerData.completeDate = new Date().toISOString();
        var activityTriggerCompleteEvent = $.Event("activityTriggerComplete");
        activityTriggerCompleteEvent.activity = activity;
        activityTriggerCompleteEvent.complete = true;
        $(document).trigger(activityTriggerCompleteEvent);
    }
}

function showActivityCompletionButton(activity)
{
    var activityCompletionBtn = $("#activityCompletionBtn_" + activity.id);
    activityCompletionBtn.css("display", "inline");
    activityCompletionBtn.on("click", { "activity": activity }, function (event)
    {
        completeTriggeredActivity(event.data.activity);
    });
}
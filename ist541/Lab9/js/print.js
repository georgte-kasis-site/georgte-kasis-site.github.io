
function cleanPrint(printLevel)
{
    var title = stripRTLDiv($("#" + printLevel + "Title").html());
    var titleRTL = title.rtl ? ' dir="rtl"' : "";

    var actyPageHeadHTML = "";
    actyPageHeadHTML += '<meta charset="UTF-8" />';
    actyPageHeadHTML += '<meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />';
    actyPageHeadHTML += spf('<title~>~</title>', [titleRTL, htmlDecode(title.text)]);
    actyPageHeadHTML += spf('<link rel="stylesheet" href="~">', ["css/font-awesome.min.css"]);
    actyPageHeadHTML += spf('<link rel="stylesheet" href="~">', [$(document).find("#studentPrintCssPath").val()]);

    var actyPageJSHTML = "";
    actyPageJSHTML += '<script type="text/javascript">';
    actyPageJSHTML += 'function printPage() {';
    actyPageJSHTML += '    try {';
    actyPageJSHTML += '        window.print();';
    actyPageJSHTML += '    } catch( exception ) {';
    actyPageJSHTML += '        document.execCommand("Print");'
    actyPageJSHTML += '    }';
    actyPageJSHTML += '}';
    actyPageJSHTML += '</script>'

    var actyPageHead = $(document.createElement('head')).append(actyPageHeadHTML);
    if (languageFontSV && languageFontSV.title.length > 0)
    {
        addLanguageFontClass(actyPageHead, languageFontSV);
    }
    actyPageHead.append(actyPageJSHTML);

    var actyPage = $(document.createElement('html')).append(actyPageHead);

    var actyPageBody = $(document.createElement('body'));

    function printPageHeader(containerElement)
    {
        var printPageHeaderHTML = "";
        var theDate = new Date();
        printPageHeaderHTML += '<div id="printPageHeader">';
        printPageHeaderHTML += '  <div id="printPageControls">';
        printPageHeaderHTML += '    <div class="buttonCellLeft"><button id="printPageBtn" onclick="printPage()">print</button></div>';
        printPageHeaderHTML += '    <div class="messageCell">';
        printPageHeaderHTML += '    This page has been formatted for print. If needed, enter your name in the field below.<br />';
        printPageHeaderHTML += '    Click "print" and your browser\'s print dialog will open. Select the appropriate printer or print to pdf to save a file.<br />';
        printPageHeaderHTML += '    You might need to adjust your settings: Layout - Portrait, Print background colors/images - true, etc. When you are finished,';
        printPageHeaderHTML += '    close the tab to exit.</div>';
        printPageHeaderHTML += '  </div>';
        printPageHeaderHTML += '  <div id="printPageInfo">';
        printPageHeaderHTML += '    <div id="printName">Name: <input /></div>';
        printPageHeaderHTML += spf("    <div id=\"printDate\">Date: ~/~/~</div>", [theDate.getMonth() + 1, theDate.getDate(), theDate.getFullYear().toString().substring(2, 4)]);
        printPageHeaderHTML += spf('   <div id="printTitle" class="~"><div ~>~</div></div>', [languageFontSV && languageFontSV.title.length > 0 ? languageFontSV.title : '', titleRTL, title.text]);
        printPageHeaderHTML += '  </div>';
        printPageHeaderHTML += '</div>';

        containerElement.append(printPageHeaderHTML)
    }

    printPageHeader(actyPageBody);

    function createPanel(containerElement, pageCnt)
    {
        var activityPageWrapper = $(document.createElement("div")).attr("class", "activityPage");
        var activityPageTitleContainer = $(document.createElement("div")).attr("class", "activityPageTitle");
        //getStudentInput( containerElement ); // Collect any work done by user; will be added to page for print
        var newElement = containerElement.clone(); // Create copy of actual page
        if (newElement.find(".introDiv").length > 0)
        {
            activityPageTitleContainer.html("Intro Page");
            activityPageWrapper.append(activityPageTitleContainer);
            activityPageWrapper.append($("#introDiv").prop("outerHTML"))
        }
        else
        {
            activityPageTitleContainer.html("<div>Page " + pageCnt + "</div>" + newElement.data("title"));  // Fix this to display correctly
            activityPageWrapper.append(activityPageTitleContainer);
            newElement.find(".componentDetails").each(function ()
            {
                var modifiedContent = $(this);
                //var moduleLocation = window.location.href.split("//")[0] + "//" + window.location.href.split("//")[1].split("/")[0];
                activityNotes = [];
                $(this).find(".noteBtn").each(function ()
                {
                    var noteBtn = $(this);
                    var noteId = noteBtn.data("noteid");
                    var noteContent = $("#noteContent_" + noteId).html();
                    activityNotes[activityNotes.length] = { "content": noteContent, "icon": noteBtn.html() };
                });

                if (modifiedContent.find('.ucatMedia').length > 0)
                {
                    modifiedContent.find('.ucatMedia').each(function ()
                    {
                        modifiedContent.find('audio, video').each(function ()
                        {
                            var mediaType = $(this).prop('nodeName') == "AUDIO" ? "Audio" : "Video";
                            var mediaIcon = '<span class="print' + mediaType + 'Icon"></span>';
                            $(this).replaceWith(mediaIcon).attr("class", "");
                        });
                    });
                }
                else
                {
                    modifiedContent.find('audio, video').each(function ()
                    {
                        var mediaType = $(this).context.localName.charAt(0).toUpperCase() + $(this).context.localName.slice(1);
                        var mediaIcon = '<span class="print' + mediaType + 'Icon"></span>';
                        $(this).replaceWith(mediaIcon).attr("class", "");
                    });
                }
                modifiedContent.find('*[class*="transcriptionControlsWrapper"]').remove();

                //Remove youtube
                if (modifiedContent.find('.youTubeEmbed').length > 0)
                {
                    modifiedContent.find('.youTubeEmbed').each(function ()
                    {
                        var mediaIcon = '<span class="printVideoIcon"></span>';
                        $(this).replaceWith(mediaIcon).attr("class", "");
                    });
                };

                //Timeline
                //Rebuild for print display
                if ($(this).data("component") == "Timeline"){
                    //find all the items and replace the entire html
                    var itemStr = '';
                    $(this).find('.timeline__content').each(function (){
                        itemStr += '<div class="timeline__content">'+$(this).html()+'</div>';
                    });
                    var timelineContainer = '<div style="display:flex;flex-wrap:wrap;">'+itemStr+'</div>';
                    var wordpoolItemsStr = '';
                    if($(this).find(".timelineResponsesContainer").length > 0){
                        wordpoolItemsStr += '<div style="width:100%; border-bottom:1px solid #cccccc">&nbsp;</div>'
                        $(this).find('.timelineResponse--item').each(function (){
                            wordpoolItemsStr += '<div class="timeline__content">'+$(this).html()+'</div>';
                        });
                    }
                    var timelineWordpoolContainer = '<div style="display:flex;flex-wrap:wrap;">'+wordpoolItemsStr+'</div>';
                    var finalStr = timelineContainer + timelineWordpoolContainer;
                    $(this).html(finalStr);
                }

                //LexicalItem
                //Rebuild for print display
                if ($(this).data("component") == "LexicalItem"){
                    //3 different render modes
                    var renderMode
                    if($(this).find(".flashcardsContainer").length > 0)
                        renderMode = "flashcard"
                    if($(this).find(".carouselFlashcardsSlider").length > 0)
                        renderMode = "carousel"
                    if($(this).find(".concentrationMatchedCardsWrapperContainer").length > 0)
                        renderMode = "concentration"
                    
                    switch (renderMode)
                    {
                        case "flashcard":
                            break
                        case "carousel":
                            modifiedContent.find(".carouselFlashcardsControls").remove();
                            break
                        case "concentration":
                            modifiedContent.find(".concentrationCardFrontFace").remove();
                            modifiedContent.find(".concentrationCard").each(function(){
                                $(this).addClass("concentrationCardReveal")
                            });
                            break
                    }
                }

                activityNotesAppendageHTML = "";
                if (activityNotes.length > 0)
                {
                    activityNotesAppendageHTML += '<div class="activityNotesAppendage">';
                    activityNotesAppendageHTML += '  <div class="title">Activity Notes</div>';
                    for (var i = 0; i < activityNotes.length; i++)
                    {
                        activityNotesAppendageHTML += '  <div class="noteContainer">';
                        activityNotesAppendageHTML += spf('    <div class="noteBtn">~</div>', [activityNotes[i].icon]);
                        activityNotesAppendageHTML += spf('    <div class="noteContent">~</div>', [activityNotes[i].content]);
                        activityNotesAppendageHTML += '  </div>';
                    }
                    activityNotesAppendageHTML += '</div>';
                }
                if ($(this).data("component") == "FillInTheBlank")
                {
                    /* experiment to fix fill in the blank by replacing conent with text
                    alert(modifiedContent.text())

                    modifiedContent.find('.customInputBox, .blank, .blankAnchor').each(function ()
                    {
                        if ($(this).html().length == 0)
                        {
                            $(this).remove();
                        }
                    })

                    modifiedContent.find('p').each(function (){
                        $(this).find('.submitBtn').each(function(){
                            $(this).remove();
                        });

                        $(this).find('.fa-times').each(function(){
                            $(this).text("&#10005;")
                        });
                        $(this).find('.fa-check').each(function(){
                            $(this).text('&#10003;')
                        });

                        var textOnly = $(this).text();
                        $(this).html(textOnly);
                    });
                    */

                    
                    modifiedContent.find('.customInputBox, .blank, .blankAnchor').each(function ()
                    {
                        if ($(this).html().length == 0)
                        {
                            $(this).html("&nbsp;");
                        }
                    })   
                }



                modifiedContent = spf('<div class="activityComponent" data-component="~">~~</div>', [$(this).data("component"), modifiedContent.html(), activityNotesAppendageHTML]);;
                activityPageWrapper.append(modifiedContent);
            })
        }
        actyPageBody.append(activityPageWrapper);
    }

    if (printLevel == "module")
    {
        var hasIntro = false;
        // If there is an intro page, it will be the first panel
        $(".panel").each(function (index)
        {
            var pageCnt = index;
            if ($(this).find(".introDiv").length > 0)
            {
                hasIntro = true;
            }
            if (!hasIntro)
            {
                pageCnt++
            }
            createPanel($(this), pageCnt);
            pageCnt++
        });
    }
    else if (printLevel == "activity")
    {
        var hasIntro = false;
        $(".panel").each(function (index)
        {
            var pageCnt = index
            if ($(this).find(".introDiv").length > 0)
                hasIntro = true;
            if (!hasIntro)
            {
                pageCnt++
            }
            if ($(this).css("display") == "block")
            {
                createPanel($(this), pageCnt);
            }
        });
    }

    actyPageBody.find("[id^='feedbackIcon_']").each(function ()
    {
        var feedbackIcon = $(this);
        var icon = feedbackIcon.find(".fa-check,.fa-times").first();

        icon.removeClass("custom-stack-1x");
        icon.insertBefore(feedbackIcon);
        feedbackIcon.remove();

    });

    actyPageBody.find(".tabDetail").css("display", "block");

    actyPageBody.find(".multipleChoiceDetails").each(function ()
    {
        $(this).find(".fa-arrow-right").html("&#10145;").css("font-weight", "bold");
        $(this).find(".fa-arrow-left").html("&#11013;").css("font-weight", "bold");
    });

    actyPageBody.find(".trueFalseDetails").each(function ()
    {
        $(this).find(".responseTrueFalse").each(function ()
        {
            $(this).find(".customCheckbox").css("display", "inline-block"); //ensure checkbox displays when there is feedback
            $(this).find(".customRadio").css("display", "inline-block");  //ensure radio button displays when there is feedback
        });
    });

    actyPageBody.find(".fnbDetails").each(function ()
    {
        $(this).find("ul[class='root submenu']").remove();
        $(this).find("input[type='hidden']").remove();
    });

    actyPageBody.find(".orderingDetails").each(function ()
    {
        $(this).find(".orderingDragHandle").each(function ()
        {
            $(this).removeClass("fa-sort").removeClass("fa-unsorted");
        });
    });

    actyPageBody.find(".transcriptionDetails").each(function ()
    {
        actyPageBody.find("[id^='responseInputBox_']").each(function ()
        {
            $(this).css("min-width", "3em");
        });
    });

    actyPageBody.find(".submitBtn").each(function (){
        $(this).remove();
    })

    actyPageBody.find(".scoreCorrectSelfEvaluated, scoreIncorrectSelfEvaluated").each(function (){
        $(this).remove();
    })

    actyPageBody.find(".componentInstructions").each(function ()
    {
        $(this).removeAttr("style")
    })

    //Reource transcript
    actyPageBody.find(".cuePointsContentDivHeaderTitle").each(function ()
    {
        $(this).remove();
    });

    actyPageBody.find(".cuePointsContainer").each(function ()
    {
        $(this).find("[id^='responseInputBox_']").each(function ()
        {
            var id = $(this).attr("id");
            var textValue = document.getElementById(id).value;
            // console.log(textValue);
            var replacementDiv = '<div class="shortAnswerResponseContent" style="flex-direction: row; white-space: pre-wrap;">'+textValue+'</div>'
            $(this).replaceWith(replacementDiv);
        });
    });
    

    //Canvas
    actyPageBody.find('.controlsContainer').each(function (){$(this).remove()});

    if (actyPageBody.find('canvas').length > 0)
    {
        actyPageBody.find('canvas').each(function ()
        {
            var id = $(this).attr("id")
            var data = $("#"+id).parent().data("sketchpad");//Had to use id to get sketchpad data wopuldnt work with $(this).parent() for some reason?
            var img = new Image();
            img.classList = $(this).attr("class");
            img.src = data.context.canvas.toDataURL();
            $(this).replaceWith(img);
        });
    };

    
    actyPage.append(actyPageBody);
    
    var dt = new Date();
    var w = window.open('', dt.getTime());

    w.document.write(actyPage.prop('outerHTML'));
    w.document.close();
    

}
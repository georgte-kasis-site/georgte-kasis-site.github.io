
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

                if (modifiedContent.find('.mejs-container').length > 0)
                {
                    modifiedContent.find('.mejs-container').each(function ()
                    {
                        modifiedContent.find('.mejs-audio, .mejs-video').each(function ()
                        {
                            var mediaType = $(this).hasClass("mejs-audio") ? "Audio" : "Video";
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
                modifiedContent.find('*[class*="mejs"]').remove();
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

    actyPageBody.find(".componentInstructions").each(function ()
    {
        $(this).removeAttr("style")
    })

    actyPage.append(actyPageBody);

    var dt = new Date();
    var w = window.open('', dt.getTime());

    w.document.write(actyPage.prop('outerHTML'));
    w.document.close();
}
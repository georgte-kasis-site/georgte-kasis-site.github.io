var defaultNoteIcon = "fa fa-paperclip";
var historyNoteIcon = "fa fa-institution"; //"fa fa-clock-o"
var teacherNoteIcon = "fa fa-user";
var informationNoteIcon = "fa fa-lightbulb-o"; // "fa info-circle"
var hintNoteIcon = "fa fa-medkit";      // "fa fa-lightbulb-o"
var infoPageIcon = "fa fa-tags";
var instructionIcon = "fa fa-info-circle";
var glossaryIcon = "fa fa-language";
var closePopUpIcon = "fa fa-times";
var feedbackIcon = "fa fa-comment";
var suggestedAnswerIcon = "fa fa-commenting";
var correctIcon = "fa fa-check";
var incorrectIcon = "fa fa-times";
var checkBoxOffIcon = "fa fa-square-o";
var checkBoxOnIcon = "fa fa-square-o fa-stack-2x";
var checkBoxOnIconInside = "fa fa-square fa-stack-1x";
var radioOffIcon = "fa fa-circle-thin";
var radioOnIcon = "fa fa-circle-thin fa-stack-2x";
var radioOnIconInside = "fa fa-circle fa-stack-1x";
var arrowSortIcon = "fa fa-sort";
var arrowDragIcon = "fa fa-arrows";
var alertIcon = "fa fa-exclamation-circle";
var accordianOpen = "fa fa-caret-right";
var accordianClose = "fa fa-caret-down";
var dropdownIndicatorIcon = "fa fa-caret-down";
var arrowPointerLeft = "fa fa-arrow-left";
var arrowPointerRight = "fa fa-arrow-right";
var navNextIcon = "fa fa-chevron-right";
var navPrevIcon = "fa fa-chevron-left";
var printIcon = "fa fa-print";
var openPageIcon = "fa fa-mail-reply";
var openPagesIcon = "fa fa-mail-reply-all";
var sourceIcon = "fa fa-files-o";
var resourceIcon = "fa fa-files-o";
var docSrcIcon = "fa fa-file-word-o";
var xlsSrcIcon = "fa fa-file-excel-o";
var pptSrcIcon = "fa fa-file-powerpoint-o";
var textSrcIcon = "fa fa-file-text-o";
var pdfSrcIcon = "fa fa-file-pdf-o";
var imageSrcIcon = "fa fa-file-image-o";
var audioSrcIcon = "fa fa-file-sound-o";
var videoSrcIcon = "fa fa-file-video-o";
var copyrightHandleIcon = "fa fa-copyright";
var dropTargetIcon = "fa fa-crosshairs";
var matchingTarget = "fa fa-crosshairs";
var inputBoxIcon = "fa fa-pencil";
var matchingLinkedIcon = "fa fa-link";
var matchingUnlinkedIcon = "fa fa-chain-broken";

var timer = false;
var elapsedTime = 0;
var completionTime = 0;
var autoSubmit = false;
var paused = false;
var inProgress = false;

var languageFontSV;  // assumed to contain only one language object.

var initNavPosY;
var updatedNavPosY;
var initPanelY;
var updatedPanelY;

var previousActivityBtn = false;
var nextActivityBtn = false;

var header = false;
var mainMenu = false;
var mainNav = false;
var contentPanels = false;
var hiddenContentPanels = false;
var footer = false;
var activityNotesMenuContainer = false;
var previewActivityNotes = false;

var currentSectionSortKey = 0;
var currentActivitySortKey = 0;
var firstPanel = -1;
var lastPanel = -1;
var componentStackManager = false;
var componentStackRunCount = 0;
var currentViewMode = "";
var module = false;
var navigationModes = ["open","forward","back"];

function initNavigation(viewMode, sectionSortKey, activitySortKey)
{
    $(window).resize(scrollMenuMobile);
    if ((typeof (sequenceSections) == "undefined")&&(modulesArray.length > 1))
    {
        sequenceSections = new Array();
        for (var m = 0; m < modulesArray.length; m++)
        {
            sequenceSections.push({"moduleId":modulesArray[m].id,"sectionTitle":modulesArray[m].sectionTitle});
        }
    }
    if (typeof (viewMode) != "undefined")
        currentViewMode = viewMode;
    if (typeof (sectionSortKey) != "undefined")
        currentSectionSortKey = sectionSortKey;
    if (typeof (activitySortKey) != "undefined")
        currentActivitySortKey = activitySortKey;
    firstPanel = -1;
    lastPanel = -1;
    var hasFooter = false;
    header = $("#header");
    mainMenu = $("#mainMenu");
    mainNav = $("#mainNav");
    contentPanels = $("#contentPanels");
    hiddenContentPanels = $("#hiddenContentPanels");
    footer = $("#footer");

    if ($("#headerUserStatus").length <= 0)
    {
        header.before('<div style="z-index:30000; position:fixed; top: 2em; right:2em;"><div class="displayTable"><div id="headerUserStatus" class="displayTableCell" ><div id="pendingSubmissionsHTML"></div></div></div></div>')
    }


    // ancillary = $("#ancillary");
    if (currentSectionSortKey == modulesArray.length)
        module = modulesArray;
    else
        module = modulesArray[currentSectionSortKey];
    if ((viewMode == "selfStudy")||(viewMode == "selfStudyPreview"))
        module.locked = false;
    lockNavigation();
    if (!module.locked)
    {

//        loadNavigation();

        swapStyleSheet(((typeof (module.themePath) != "undefined") ? module.themePath : "Scaffold/Default/default/") + "css/style.css");
        var ca = false;
        if (typeof (correctAnswersArray) != "undefined")
        {
            if (currentSectionSortKey == correctAnswersArray.length)
                ca = correctAnswersArray;
            else
                ca = correctAnswersArray[currentSectionSortKey];
        }
        var gpv = false;
        if (typeof (gradingProtocolValuesArray) != "undefined")
        {
            if (currentSectionSortKey == gradingProtocolValuesArray.length)
                gpv = gradingProtocolValuesArray;
            else
                gpv = gradingProtocolValuesArray[currentSectionSortKey];
        }
        var fb = false;
        if (typeof (feedbackArray) != "undefined")
        {
            if (currentSectionSortKey == feedbackArray.length)
                fb = feedbackArray;
            else
                fb = feedbackArray[currentSectionSortKey];
        }
        var li = false;
        if (typeof (lexicalItemsArray) != "undefined")
        {
            if (currentSectionSortKey == lexicalItemsArray.length)
                li = lexicalItemsArray;
            else
                li = lexicalItemsArray[currentSectionSortKey];
        }
    }
    componentStackManager = new ComponentStackManager("componentStackManager", contentPanels, { module: module, correctAnswers: ca, gradingProtocolValues: gpv, feedback: fb, lexicalItems: li }, function (data) { initNavigationCallback(data); }, currentViewMode);
    componentStackRunCount++;

    if (componentStackManager.moduleFeatures.toolbar)
    {
        var toolbarArray = new Array();
        toolbarArray.push({ title: "", iconName: "" });

        if (componentStackManager.moduleFeatures.studentNotes)
            toolbarArray.push({ title: "Student Notes", iconName: "fa fa-sticky-note-o", callback: function (obj) { loadStudentNotes(obj); } });
        if (componentStackManager.moduleFeatures.answerKey)
            toolbarArray.push({ title: "AnswerKey", iconName: gradingProtocolIcon, callback: function (obj) { loadStudentAnswerKey(obj); } });


        buildToolbar(toolbarArray);
    }
    else
    {
        if (componentStackManager.moduleFeatures.studentNotes)
        {
            var panelButtonHTML ='<div id="toolBarBtn_StudentNotes" title="Student Notes" class="displayTableCell btn pagerItem toolBarBtnActivityNav">';
            panelButtonHTML += '<i id="toolBarIcon_StudentNotes" class="fa fa-sticky-note-o"></i>';
            panelButtonHTML += '<i id="toolBarIconX2_StudentNotes"></i>';
            panelButtonHTML += '</div>';
            $("#textLargePeripheralButton").after(panelButtonHTML);
            $("#toolBarBtn_StudentNotes").on("click", function (e)
            {
                var studentNoteHTML = '<div id="studentNotesWrapper" class="studentNotesWrapper"></div>';
                openCustomDialog("Student Notes", studentNoteHTML, "", '<i class="fa fa-sticky-note-o"></i>');
                loadStudentNotes($('#studentNotesWrapper'))
            })
        }
    }
}

var messageDismissed = false;
function userIsLoggedOutMessaging(){
    if(!messageDismissed){
        var messageStr = '<div>';
        messageStr += '<div style="font-weight:600;">You are not logged into UCAT. </div>'
        messageStr += '</br>'
        messageStr += '<div>You may continue to browse UCAT, but you will not have the benefit of all UCAT features, including assignments, saved responses and saved grades.</div>';
        messageStr += '</br>'
        messageStr += '<div><a href="'+domainRootPath+'">Please login at '+domainRootPath+' </a> or close this message to continue.</div>';
        messageStr += '</br>'
        messageStr += '</div>';
        var iconHTML = '';
        $(document).bind("ucatDialogClosed", function (event) { onCloseLoggedOutDialog() });
        openCustomDialog("", messageStr, "", iconHTML, "50%", function(){$("#ucatDialog").css({"height":"200px","top":"40"}) } );
    }
}

function onCloseLoggedOutDialog(){
    messageDismissed = true;
}

function loadHeader()
{
    var headerHTML = '<div id="headerContainer" class="headerContainer">';
    headerHTML += '<div class="DLI_logoContainer"><img alt="DLIFLC" src="images/ui/shieldLogo70px.png" /></div>';

    headerHTML += '  <div id="headerTitlesContainer" class="">';

    headerHTML += '  <div id="id_headerTopRowContainer" class="displayTable" style="table-layout:auto;">';
    // headerHTML = 'HEADER AND LOGO ETC....'
    if (module.curriculum)
    {
        headerHTML += '<div id="courseTitle" class="displayTableCell" style="white-space:nowrap;"><span style="padding-left: 4em;">' + htmlDecode(module.curriculum.title) + '</span></div>';
    }
    else
    {
        headerHTML += '<div id="courseTitle" class="displayTableCell" style="white-space:nowrap;"><span style="padding-left: 4em;"></span></div>';
    }
    headerHTML += '<div id="moduleTitle" class="displayTableCell" style="width:100%; padding-left: 1em; padding-right: 1em; text-align: right;">'+htmlDecode(module.title)+'</div>';
    headerHTML += '  </div>';//End top Row

    headerHTML += '<div id="activityTitleContainer"><div id="activityTitle">&nbsp;</div></div>';
    headerHTML += '  </div>';
    headerHTML += '</div>';
    header.html(headerHTML);

    //Adjust mainNav if running module outside assignment framework
    /*
    z-index: 200;
    position: fixed;
    top: 2.750em;
    */
    $("#mainNav").css({"position":"fixed","top":"2.750em","z-index":"200"});
}

function loadNavigation()
{
    loadActivityPanelsAndNavigation();
}

function initNavigationCallback(stackManager)
{
    loadNavigation();
    var scaffoldPanel = $("#scaffoldPanel");
    if(scaffoldPanel.length <= 0)
    {
        $("<div id='scaffoldPanel'></div>").insertBefore(mainNav);
        scaffoldPanel = $("#scaffoldPanel");
        scaffoldPanel.append(mainNav);
        scaffoldPanel.append(contentPanels);
        scaffoldPanel.append(hiddenContentPanels);
        scaffoldPanel.append(mainMenu);
        scaffoldPanel.append(footer);
        scaffoldPanel.append(ancillary);
    }
    if (module.length > 1)
    {
        if (module[0].moduleFeatures.header)
            loadHeader();
        if (module[0].moduleFeatures.timer)
            loadTimer();
    }
    else
    {
        if (module.moduleFeatures.header)
            loadHeader();
        if (module.moduleFeatures.timer)
            loadTimer();
        loadMainMenu();
        goToActivity(currentActivitySortKey);
    }
    unlockNavigation();
    adjustForNavigation();
    scrollMenuMobile();

    if((typeof(userIsLoggedIn) != "undefined") && !userIsLoggedIn){
        userIsLoggedOutMessaging()
    }
    stackManager.runComponentStackSequence();
    var initNavigationCompleteEvent = $.Event("initNavigationComplete");
    $(document).trigger(initNavigationCompleteEvent);    
}

function loadActivityPanelsAndNavigation()
{
    contentPanels.html("");
    $("#sequenceNavContainer").remove();
    $("#activityNavContainer").remove();
    var panelCnt = 0
    if ((module.description && module.description.length > 0) || (module.objectives && module.objectives.length > 0))
    {
        contentPanels.append("<div id=\"panel_0\" data-activityid=\"0\" data-sortkey=\"0\" class=\"panel\" data-role=\"Introduction\" data-title=\"\"></div>");
        $("body").addClass("introBackground");
        panelCnt++
        firstPanel = 0;
    }
    if ((module.activities && module.activities.length > 0) || (module.hiddenActivities && module.hiddenActivities.length > 0))
    {
        lastPanel = 1;
        if (module.activities && module.activities.length > 0)
        {
            for (var i = 0; i < module.activities.length; i++)
            {
                if (firstPanel < 0)
                    firstPanel = 1;
                module.activities[i].index = i + 1;
                loadActivityPanel(contentPanels, module.activities[i]);
                panelCnt++
            }
            lastPanel = module.activities.length + 1;
        }
        loadSummaryPanel();
    }
    else
    {
        initNavPosY = mainNav.css("top");
        updatedNavPosY = mainNav.css("top");
        initPanelY = contentPanels.css("top");
        updatedPanelY = contentPanels.css("top");
    }

    if ((typeof (module.hiddenActivities) != "undefined") && module.hiddenActivities && module.hiddenActivities.length > 0)
    {
        for (var h = 0; h < module.hiddenActivities.length; h++)
        {
            loadHiddenActivityPanel(hiddenContentPanels, module.hiddenActivities[h]);
        }
    }

    loadMainNav();
    var navPager = $("#navPager");
    if (firstPanel < 0)
    {
        currentActivitySortKey = lastPanel;
        if(lastPanel >= 0)
            navPager.append("<li title=\"\" id=\"pagerItem_" + lastPanel + "\" class=\"btn pagerItem\" onclick=\"goToActivity('" + lastPanel + "');\"></li>");
        var panel = $("#panel_" + lastPanel);
        var pagerItem = $("#pagerItem_" + lastPanel);
        if (panel.data("role") == "Introduction" && lastPanel == 0)
        {
            pagerItem.addClass("introIcon");
        }
        else if (panel.data("role") == "Summary")
        {
            pagerItem.addClass("summaryIcon");
        }
    }
    else
    {
        for (var i = firstPanel; i <= lastPanel; i++)
        {
            var activity = module.activities[i - 1];
            navPager.append("<li title=\"\" id=\"pagerItem_" + i + "\" class=\"btn pagerItem\" onclick=\"goToActivity('" + i + "');\"></li>");
            var panel = $("#panel_" + i);
            var pagerItem = $("#pagerItem_" + i);
            if (panel.data("role") == "Introduction" && i == 0)
            {
                pagerItem.addClass("introIcon");
            }
            else if (panel.data("role") == "Summary")
            {
                pagerItem.addClass("summaryIcon");
            }
            else
            {
                var displayString = stripRTLDiv(panel.attr("data-title"));
                var elementDataString = htmlDecode(displayString.text);
                if (activity && activity.behaviorType > 0)
                {
                    pagerItem.addClass("page_hidden");
                    pagerItem.html('<i class="fa fa-diamond"></i>');
                }
                else
                    pagerItem.addClass("page_" + i);
                initToolTip({ "element": pagerItem, "elementDataString": elementDataString, "tooltipClass": "lightVersion", "tooltipDelay": 200, "tooltipRTL": displayString.rtl });
            }
        }
    }
    initNavPosY = mainNav.css("top");
    updatedNavPosY = mainNav.css("top");
    initPanelY = contentPanels.css("top");
    updatedPanelY = contentPanels.css("top");
}

function loadActivityPanel(containerElement, activity)
{
    var hiddenClassName = activity.behaviorType > 0 ? 'hiddenPanel':''
    var activityPanelDiv = "<div id=\"panel_" + activity.index + "\" data-activityid=\"" + activity.id + "\" data-sortkey=\"" + activity.index + "\" class=\"panel "+hiddenClassName+"\" data-role=\"page\" data-title=\"" + htmlDecode(activity.title) + "\"></div>";
    containerElement.append(activityPanelDiv);
}

function loadHiddenActivityPanel(containerElement, activity)
{
    var hiddenActivityPanelDiv = "<div id=\"hiddenPanel_" + activity.id + "\" style=\"display:none;\" class=\"panel hiddenPanel\"></div>";
    containerElement.append(hiddenActivityPanelDiv);
}

function loadSummaryPanel(){
    var summaryPanelHTML = spf('<div id="panel_~" class="panel" data-sortkey="~" data-role="Summary" data-title="Summary Page">', [lastPanel, lastPanel])
    //Header
    summaryPanelHTML += '<div class="componentDetails">';
    summaryPanelHTML += '<div class="displayTable assessmentSummaryHeader ">';
    summaryPanelHTML += '<div class="displayTableCell  assessmentSummaryTitle">Summary</div>';
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryName" id="summaryPanelName"></div>';
    summaryPanelHTML += spf('<div class="displayTableCell assessmentSummaryData" id="moduleSummaryData_~" style="white-space:nowrap;"></div>',[module.id]);
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryHeaderButtonContainer" id="summaryPanelRight" style="width:100%;"></div>';//Review Button
    summaryPanelHTML += '</div>';
    summaryPanelHTML += '<div class="displayTable activitySummaryContainer">';
    //Activity
    for (var i = 0; i < module.activities.length; i++){
        var activity = module.activities[i];

        var behaviorBg = activity.behaviorType > 0 ? 'background:#ddfad9;' : '';

        
        summaryPanelHTML += '<div class="displayTableRow">';
        summaryPanelHTML += spf('<div id="activitySummaryData_~" class="displayTableCell activitySummaryRowData" style="~"></div>',[activity.id, behaviorBg])//Points ans totals
        var hiddenIcon = activity.behaviorType > 0 ? '<span ><i class="fa fa-diamond"></i></span>' : '';
        summaryPanelHTML += spf('<div class="displayTableCell activitySummaryRowTitle" style="width:100%; ~">~) ~ ~</div>',[behaviorBg, activity.index, hiddenIcon, htmlDecode(activity.title)])
        summaryPanelHTML += '</div>'//End Row
        summaryPanelHTML += '<div class="displayTableRow">';
        summaryPanelHTML += spf('<div class="displayTableCell" style="border-bottom: 1px solid #cccccc; ~">',[behaviorBg]);
        summaryPanelHTML += '</div>';//Required Buffer Cell
        summaryPanelHTML += spf('<div class="displayTableCell" style="width:100% ~">', [behaviorBg]);//Container for components
        summaryPanelHTML += '<div class="displayTable activityComponentSummaryContainer">';
        //Components
        for (var j = 0; j < activity.activityComponents.length; j++){
            summaryPanelHTML += '<div class="displayTableRow">';
            var activityComponent = activity.activityComponents[j];
            //score
            summaryPanelHTML += spf('<div id="activityComponentSummaryData_~" class="displayTableCell activityComponentSummaryRowData" style="~"></div>',[activityComponent.id, behaviorBg])
            //Comments
            summaryPanelHTML += spf('<div class="displayTableCell activityComponentSummaryRowComment" style="~,min-width:2.188em; max-width:2.188em; text-align:center;"><span id="activityComponentSummaryComment_~" class="" style="cursor:pointer; display:none" onclick="goToActivity(\'~\',\'~\')"></span></div>',[behaviorBg, activityComponent.id, activity.index, activityComponent.id, "commentICON"])
            //Title
            summaryPanelHTML += spf('<div class="displayTableCell activityComponentSummaryRowTitle" style="width:100%; ~" onclick="goToActivity(\'~\',\'~\')">~</div>',[behaviorBg, activity.index, activityComponent.id, htmlDecode(activityComponent.title)])
            
            summaryPanelHTML += '</div>'//End Row
        }
        summaryPanelHTML += '</div>'//End Table
        summaryPanelHTML += '</div>'//End Cell
        summaryPanelHTML += '</div>'//End Row
    }
    summaryPanelHTML += '</div>'//End Table
    summaryPanelHTML += '</div>';
    summaryPanelHTML += '<div id="summaryFooter" class="interfaceTopMarginOneEM"></div>'
    summaryPanelHTML += '</div>'
    contentPanels.append(summaryPanelHTML);

    var summaryPanelLoadedEvent = $.Event("summaryPanelLoaded");
    $(document).trigger(summaryPanelLoadedEvent);
}

function loadSequenceSummaryPanel(containerElement)
{
    var summaryPanelHTML = '<div id="sequenceSummaryPanel" data-title="Sequence Summary Page">';
    //Header
    summaryPanelHTML += '<div class="displayTable assessmentSummaryHeader ">';
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryTitle">Summary</div>';
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryName" id="summaryPanelName"></div>';
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryData" id="sequenceSummaryData" style="white-space:nowrap;"></div>';
    summaryPanelHTML += '<div class="displayTableCell assessmentSummaryHeaderButtonContainer" id="summaryPanelRight" style="width:100%;"></div>';//Review Button
    summaryPanelHTML += '</div>';
    summaryPanelHTML += '<div class="displayTable activitySummaryContainer">';
    if (typeof(sequenceSections) != "undefined")
    {
        for (var i = 0; i < sequenceSections.length; i++)
        {
            summaryPanelHTML += '<div class="displayTableRow">';
            summaryPanelHTML += spf('<div id="sequenceModuleSummaryData_~" class="displayTableCell activitySummaryRowData"></div>', [sequenceSections[i].moduleId])//Points and totals
            summaryPanelHTML += spf('<div class="displayTableCell activitySummaryRowTitle" style="width:100%;">~) ~</div>', [(i + 1), sequenceSections[i].sectionTitle])
            summaryPanelHTML += '</div>'//End Row
        }
    }
    summaryPanelHTML += '</div>'//End Table
    summaryPanelHTML += '<div id="summaryFooter" class="interfaceTopMarginOneEM"></div>'
    summaryPanelHTML += '</div>'
    containerElement.append(summaryPanelHTML);
}


function showHiddenActivity(activity)
{
    mainNav.find(".pagerItem").hide();
    mainNav.find(".btn").hide();
    contentPanels.find(".panel").hide();
    var hiddenActivityPanel = $("#hiddenPanel_" + activity.id);
    contentPanels.append(hiddenActivityPanel);
    hiddenActivityPanel.show();
}

function hideHiddenActivity(activity)
{
    mainNav.find(".pagerItem").show();
    mainNav.find(".btn").show();
    var hiddenActivityPanel = $("#hiddenPanel_" + activity.id);
    hiddenContentPanels.append(hiddenActivityPanel);
    goToActivity(currentActivitySortKey);
}

//Need to dynamically adjust the top positin of scaffoldPanel
//To account for navigation height
$(window).resize(adjustForNavigation);
function adjustForNavigation(){
    //Move content down to accomodate sequence Tabs
    var activityNavH = $("#activityNavContainer").outerHeight();
    var sequencNavH = ((typeof(modulesArray) != "undefined") && (modulesArray.length > 0)) ? $("#sequenceNavContainer").outerHeight() : 0;
    var totalNavigationHeight = activityNavH + sequencNavH;
    $("#contentPanels").css({"position":"relative","top":totalNavigationHeight+"px"})
}

function scrollMenuMobile()
{
    var windowHeight = $(window).height();
    var headerHeight = Math.floor(header.outerHeight() -1 ) + "px";
    var mainNavHeight = Math.floor(mainNav.outerHeight());
    var headerNavHeight = Math.floor(header.outerHeight()) + mainNavHeight;
    var buffer = em(1)
    var mainMenuContainer = $("#mainMenuContainer");
    var mainMenuScrollContainer = $("#mainMenuScrollContainer");

    if (header.css("display") != "none")
    {
        mainNav.css({ "top": headerHeight })
        if(module.moduleFeatures && module.moduleFeatures.header)
            contentPanels.css('top', headerNavHeight + buffer)
        updatedNavPosY = headerHeight;
        mainMenuContainer.css('height', (windowHeight - headerNavHeight) + 'px');
        mainMenuContainer.css('top', headerNavHeight)
        mainMenuScrollContainer.css('height', (windowHeight - headerNavHeight) + 'px');
    }
    else
    {
        mainMenuContainer.css('height', windowHeight + 'px');
        mainMenuScrollContainer.css('height', windowHeight + 'px');
    }
}

function loadSequenceNav(containerElement)
{
    containerElement.append('<div id="sequenceNavContainer" class="sequenceNavContainer"></div>')
    var sequenceTabsArr = []
    for (var i = 0; i < sequenceSections.length; i++)
    {
        var locked = false;
        for (var m = 0; m < modulesArray.length; m++)
        {
            if (modulesArray[m].id == sequenceSections[i].moduleId)
                locked = modulesArray[m].locked;
        }
        sequenceTabsArr.push(
            {"tabId":"sequenceTab_"+i,
            "ref":"section",
                "label": "<span></span>" + (locked ? "<i class='fa fa-lock'></i> " : "") + "<span>" + htmlDecode(sequenceSections[i].sectionTitle)+"</span>",
            "call":{"fn":"goToSection", "args":[i]}
        } )
    }
    if (sequenceSections.length > 1)
    {
        if ((currentViewMode != "studentView") || ((studentAssignment.submitDate) && (studentAssignment.visibility == 1)))
        {
            var i = sequenceSections.length;
            sequenceTabsArr.push(
            {
                "tabId": "sequenceTab_" + i,
                "ref": "section",
                "label": "<span></span><span class=\"fa fa-list\"></span>",
                "call": { "fn": "goToSequenceSummary", "args": [i] }
            })
        }
    }
    sequenceTabs = {"containerId":"sequenceTabContainer","indent":true,"tabs": sequenceTabsArr}
    $("#sequenceNavContainer").prepend( tabs.setupTabs( sequenceTabs ) )
    $("#sequenceTab_"+currentSectionSortKey).addClass("selected")
}

function loadMainNav()
{
    mainNav.addClass("mainNav");
    if ((typeof(sequenceSections) != "undefined") && (sequenceSections.length > 1))
        loadSequenceNav(mainNav);

    var mainNavHTML = "<div id=\"activityNavContainer\" class=\"activityNavContainer\">";

    mainNavHTML += "<div id=\"textSmallPeripheralButton\" class=\"textSmallSelected\" onclick=\"setSmallText();\"><i class=\"fa fa-font\">&#8595;</i></div>";
    mainNavHTML += "<div id=\"textLargePeripheralButton\" class=\"textLarge\" onclick=\"setLargeText();\"><i class=\"fa fa-font\">&#8593;</i></div>";
    //Audio Test Btn
    mainNavHTML += "<div class=\"displayTableCell\" id=\"audioTestBtn\" title=\"Test Audio Settings\"onclick=\"loadAudioTestPage();\">";
    mainNavHTML += "<div  class=\"textLarge\"><i class=\"fa fa-microphone\"></i></div>";
    mainNavHTML += "</div>";

    
    mainNavHTML += "<div class=\"displayTableCell\" style=\"vertical-align:top; min-width: 2.188em;\"><div id=\"previousButton\" class=\"btn prevBtn\" onclick=\"previousActivity();\"></div></div>";
    mainNavHTML += "    <div id=\"pagerDiv\" class=\"pagerDiv\">";
    mainNavHTML += "        <ul id=\"navPager\" class=\"navPager\">";
    mainNavHTML += "        </ul>";
    mainNavHTML += "    </div>";
    mainNavHTML += "<div class=\"displayTableCell\" style=\"vertical-align:top; min-width: 2.188em;\"><div id=\"nextButton\" class=\"btn prevBtn\" onclick=\"nextActivity();\"></div></div>";
    mainNavHTML += "</div>";
    mainNav.append(mainNavHTML);

    initNavPosY = mainNav.css("top");
    updatedNavPosY = mainNav.css("top");
    initPanelY = contentPanels.css("top");
    updatedPanelY = contentPanels.css("top");
    previousActivityBtn = $("#previousButton");
    nextActivityBtn = $("#nextButton");
}

function setSmallText()
{
    updatedNavPosY = initNavPosY;
    updatedPanelY = initPanelY;
    $("body").css("font-size", "12pt");
    scrollMenuMobile();
    $("#textSmallPeripheralButton").attr("class", "textSmallSelected");
    $("#textLargePeripheralButton").attr("class", "textLarge");
}

function setLargeText()
{
    $("body").css("font-size", "16pt");
    scrollMenuMobile();
    $("#textSmallPeripheralButton").attr("class", "textSmall");
    $("#textLargePeripheralButton").attr("class", "textLargeSelected");
}

function nextActivity()
{
    killMedia($("#panel_" + currentActivitySortKey));
    if (currentActivitySortKey <= module.activities.length)
    {
        currentActivitySortKey++;
        $(".panel").hide();
        $("#panel_" + currentActivitySortKey).show();
    }
    resolveNavigation();
}

function previousActivity()
{
    killMedia($("#panel_" + currentActivitySortKey));
    if ((firstPanel >= 0) && (currentActivitySortKey > firstPanel))
    {
        currentActivitySortKey--;
        $(".panel").hide();
        $("#panel_" + currentActivitySortKey).show();
    }
    resolveNavigation();
}

function goToActivity(sortKey, activityComponentId)
{
    $(".panel").each(function ()
    {
        var panel = $(this);
        killMedia(panel);
        panel.hide();
    });

    if (sortKey < firstPanel)
        sortKey = firstPanel;
    if (sortKey > lastPanel)
        sortKey = lastPanel;

    $("#panel_" + sortKey).show();
    currentActivitySortKey = sortKey;
    setPagerProgress(currentActivitySortKey);
    resolveNavigation(activityComponentId);
}

function goToSection(sectionSortKey, activitySortKey)
{
    if (sectionSortKey < 0)
        sectionSortKey = 0;
    if (sectionSortKey > (modulesArray.length - 1))
        sectionSortKey = modulesArray.length - 1;
    if(!modulesArray[sectionSortKey].locked)
    {
        currentSectionSortKey = sectionSortKey;
        if (typeof (activitySortKey) != "undefined")
            currentActivitySortKey = activitySortKey;
        else
            currentActivitySortKey = 0;
        firstPanel = -1;
        lastPanel = -1;
        initNavigation(currentViewMode, currentSectionSortKey, currentActivitySortKey);
        var sectionNavigationTriggeredEvent = $.Event("sectionNavigationTriggered");
        sectionNavigationTriggeredEvent.sectionSortKey = currentSectionSortKey;
        sectionNavigationTriggeredEvent.activitySortKey = currentActivitySortKey;
        $(document).trigger(sectionNavigationTriggeredEvent);
    }
}

function goToSequenceSummary()
{
    currentSectionSortKey = sequenceSections.length;
    mainNav.find(".tab").each(function ()
    {
        var tab = $(this);
        if (tab.attr("id") == "sequenceTab_" + currentSectionSortKey)
            tab.addClass("selected");
        else
            tab.removeClass("selected");
    });
    $("#navPager").html("");
    contentPanels.html("");
    lockNavigation();
    componentStackManager = new ComponentStackManager("componentStackManager", contentPanels, { module: modulesArray, correctAnswers: ((typeof (correctAnswersArray) != "undefined") ? correctAnswersArray : false), gradingProtocolValues: ((typeof (gradingProtocolValuesArray) != "undefined") ? gradingProtocolValuesArray : false) }, function (data) { data.runComponentStackSequence(); unlockNavigation(); }, currentViewMode);


    var sectionNavigationTriggeredEvent = $.Event("sectionNavigationTriggered");
    sectionNavigationTriggeredEvent.sectionSortKey = currentSectionSortKey;
    sectionNavigationTriggeredEvent.activitySortKey = currentActivitySortKey;
    $(document).trigger(sectionNavigationTriggeredEvent);
}

function renderFooterNav(containerElement)
{
    var footerNavHTML = '<div id="footerNav" class="footerNav displayTable" style="margin-top:2.5em">'
    footerNavHTML += '<div class="displayTableCell">'
    footerNavHTML += '<div id="previousButtonFooter" class="btn prevBtnFooter" onclick="previousActivity();"></div>'
    footerNavHTML += '</div>'
    footerNavHTML += '<div class="displayTableCell" style="width:100%">'
    footerNavHTML += '&nbsp;'//Center Buffer Cell
    footerNavHTML += '</div>'
    footerNavHTML += '<div class="displayTableCell">'
    footerNavHTML += '<div id="nextButtonFooter" class="btn nextBtnFooter" onclick="nextActivity();"></div>'
    footerNavHTML += '</div>'
    footerNavHTML += '</div>'//End footerNav
    containerElement.css({"padding-bottom":0})
    containerElement.append(footerNavHTML)
}

function resolveNavigation(activityComponentId)
{
    $(".footerNav").remove();
    if (currentSectionSortKey == modulesArray.length)
    {
        previousActivityBtn.hide();
        nextActivityBtn.hide();
    }
    else
    {
        renderFooterNav($("#panel_" + currentActivitySortKey));
        var previousActivityBtnFooter = $("#previousButtonFooter");
        var nextActivityBtnFooter = $("#nextButtonFooter");
        if (previousActivityBtn.length > 0)
        {
            if (firstPanel < 0)
            {
                previousActivityBtn.attr("class", "prevBtnOff");
                previousActivityBtnFooter.hide();
            }
            else if (currentActivitySortKey <= firstPanel)
            {
                currentActivitySortKey = firstPanel;
                previousActivityBtn.attr("class", "prevBtnOff");
                previousActivityBtnFooter.hide();
            }
            else
            {
                previousActivityBtn.attr("class", "btn prevBtn");
                previousActivityBtnFooter.show();
            }
        }
        if (nextActivityBtn.length > 0)
        {
            if (currentActivitySortKey < lastPanel)
            {
                nextActivityBtn.attr("class", "btn nextBtn");
                nextActivityBtnFooter.show();
            }
            else
            {
                nextActivityBtn.attr("class", "nextBtnOff");
                nextActivityBtnFooter.hide();
            }
        }
        $("[id^=pagerItem_]").each(function ()
        {
            var pagerItem = $(this);
            var pagerSortKey = pagerItem.attr("id").substring(10);
            if (pagerSortKey == currentActivitySortKey)
            {
                pagerItem.addClass("pagerActive");
            }
            else
            {
                pagerItem.removeClass("pagerActive");
            }
        });

        if ($("#componentContainer_" + activityComponentId).length > 0)
        {
            var targetElement = "componentContainer_" + activityComponentId;
            document.getElementById(targetElement).scrollIntoView();
        }
        else
        {
            $("#id_contentWrapper").scrollTop(0);
        }
        var activity = false;
        if (!module.locked)
        {
            for (var a = 0; a < module.activities.length; a++)
            {
                if (module.activities[a].index == currentActivitySortKey)
                {
                    activity = module.activities[a];
                }
            }
        }
        if (activity)
            $("#activityTitle").html(htmlDecode(activity.title));
        else
            $("#activityTitle").html("&nbsp;");
    }

    var body = $("html, body");
    body.stop().animate({scrollTop:0}, "fast", 'swing', function() {});

    var navigationTriggeredEvent = $.Event("navigationTriggered");
    navigationTriggeredEvent.activity = activity;
    navigationTriggeredEvent.sectionSortKey = currentSectionSortKey;
    navigationTriggeredEvent.activitySortKey = currentActivitySortKey;
    $(document).trigger(navigationTriggeredEvent);
}

function setPagerProgress(activitySortKey)
{
    var progressSortKey = -1;
    if (typeof (activitySortKey) != "undefined")
        progressSortKey = activitySortKey;
    $("[id^=pagerItem_]").each(function ()
    {
        var pagerItem = $(this);
        var pagerSortKey = parseInt(pagerItem.attr("id").substring(10));
        if (pagerSortKey <= progressSortKey)
            pagerItem.addClass("pagerVisited");
        else
            pagerItem.removeClass("pagerVisited");
    });
}

function loadTimer()
{
    var timeRemainingDiv = $("#timeRemainingDiv");
    if ((timeRemainingDiv.length) > 0 && inProgress &&(completionTime > 0))
    {
        if (autoSubmit == true)
            $("#autocompleteTimeSpan").html("Auto-submit on Completion: ");
        else
            $("#autocompleteTimeSpan").html("");
        elapsedTime++;
        if (timer)
        {
            clearTimeout(timer);
        }
        var timeRemaining = completionTime - elapsedTime;
        var timeRemainingClass = "expireSoon";
        if ((timeRemaining > 0) && !paused)
            timer = setTimeout(function () { loadTimer(); }, 1000);
        if (timeRemaining < 1)
        {
            clearTimeout(timer);
            timeRemainingClass = "expired";
            timeRemainingDiv.attr("class", timeRemainingClass);
            $("#timeRemainingSpan").html(readableCompletionTime(0));
            if (timeRemaining > -1)
            {
                var timerExpiredEvent = $.Event("timerExpired");
                timerExpiredEvent.completionTime = completionTime;
                timerExpiredEvent.autoSubmit = autoSubmit;
                $(document).trigger(timerExpiredEvent);
            }
        }
        else
        {
            if (timeRemaining > 300)
                timeRemainingClass = "plentyOfTime";
            timeRemainingDiv.attr("class", timeRemainingClass);
            $("#timeRemainingSpan").html(readableCompletionTime(timeRemaining));
        }
        timeRemainingDiv.show();
    }
    else
        timeRemainingDiv.hide();
}

function lockNavigation()
{
    $("#assignmentComponentStackLoadedDiv").hide();
    $("#assignmentComponentStackLoadingDiv").show();
}

function unlockNavigation()
{
    $("#assignmentComponentStackLoadingDiv").hide();
    $("#assignmentComponentStackLoadedDiv").show();
    //if (typeof (setMainNavWidth) == "function")
        //setMainNavWidth();
    resolveNavigation();
}

function setLanguageFontSV(containerElement)
{
    if (languageFontSV)
    {
        if (languageFontSV.rtl)
        {
            containerElement.find("*[dir='rtl']").addClass(languageFontSV.title.toLowerCase());
        }
        else
        {
            containerElement.addClass(languageFontSV.title.toLowerCase());
        }
    }
}

/*---------------MOVED TO GLOBAL.JS------------------*/
/*
function openCustomDialog(title, content, type, iconHTML, initialWidth, callback)
{
    var dialogClassName = type + 'DialogContainer';
    var headerClassName = type + 'DialogHeader';
    var dialogWidth = initialWidth ? initialWidth : "60%";
    var customDialogHTML = '<div id="ucatDialog" class="ucatDialog '+dialogClassName+'" style="width: '+dialogWidth+'; height: 60%; visibility:hidden; opacity:0;">';
    customDialogHTML += '<div id="ucatDialogTitle" class="displayTable ucatDialogTitle '+headerClassName+'" style="width: 100%;">';
    customDialogHTML += '<div class="displayTableCell" style="padding-left: 0.625em;">'+iconHTML+'</div>';
    customDialogHTML += '<div id="ucatDialogTitelText" class="displayTableCell titlebar" style="width:100%; text-align:center">'+title+'</div>';
    customDialogHTML += '<div class="displayTableCell ucatDialogBtn ucatDialogCloseBtn" onclick="ucatDialogClose();"><i class="fa fa-times"></i></div>';
    customDialogHTML += '</div>';//End titlebar

    customDialogHTML += '<div id="ucatDialogContent" class="ucatDialogContent">';
    customDialogHTML += '</div>';

    customDialogHTML += '</div>';

    
    if($("#tempDiv").length > 0)
        $("#tempDiv").remove();

    if(ancillary.length > 0){
        ancillary.html(customDialogHTML);
    } else {
        $('body').append('<div id="tempDiv"></div>');
        ancillary = $("#tempDiv");
        ancillary.html(customDialogHTML);
    }
    
    var dialogContentElement = $("#ucatDialogContent");
    dialogContentElement.html(content);
    if(module.moduleFeatures){
        var mediaOptions = copyGlobalVariable(module.moduleFeatures.mediaOptions);
        mediaOptions.audio.transcript = false;
        mediaOptions.video.transcript = false;
        setupUcatMedia(dialogContentElement, mediaOptions);
    }
    initUcatDialog();
    //if there is a function in this parameter then execute when a ucat dialog opens
    if (typeof (callback) == "function")
    {
        callback(dialogContentElement);
    }
}

function initUcatDialog(){
    
    ancillary.show();
    var ucatDialog;
    var dialogJqElement = $(".ucatDialog");
    var dialogTitleJqElement = $(".ucatDialogTitle");
    var dialogContentJqElement = $("#ucatDialogContent");

    adjustDialogContentSize = function() {
        var adjustedDialogHeight = (dialogJqElement.height() - dialogTitleJqElement.height() - 20) + "px";
        dialogContentJqElement.css("height", adjustedDialogHeight);
    }

    ucatDialogClose = function() {
        ancillary.hide();
        dialogJqElement.hide();
        killMedia(dialogJqElement);
        if($("#tempDiv").length > 0)
            $("#tempDiv").remove();

        //if there is a listener bound to "ucatDialogClosed" then it will trigger
        var ucatDialogClosedEvent = $.Event("ucatDialogClosed");
        $(document).trigger(ucatDialogClosedEvent);
    }
    
    ucatDialog = function() {
        killMedia($(document));
        ucatDialog = document.querySelector('.ucatDialog');
        dialogJqElement = $(".ucatDialog");
        dialogTitleJqElement = $(".ucatDialogTitle");
        dialogContentJqElement = $("#ucatDialogContent");
        ucatDialog.style.left = ((window.innerWidth - ucatDialog.clientWidth) / 2) + 'px';
        ucatDialog.style.top = ((window.innerHeight - ucatDialog.clientHeight) / 2) + 'px';

        dialogJqElement.resizable({
            containment: "document",
            resize: function( event, ui ) {
                adjustDialogContentSize();
            }
        });

        dialogJqElement.draggable({
            handle: ".titlebar",
            containment: "window"
        });

        dialogJqElement.css("visibility","visible");//Using visible instead of show hide so window position can be calculated
        //Resize the content element to match the dialog height-titlebar for overflow purposes;
        adjustDialogContentSize();
        dialogJqElement.fadeTo( "fast", 1, function() {});
    };
    ucatDialog();
}

function closeCustomDialog()
{
    //Legacy Code Calls this function. Only here to ensure no failing calls
    if($(".ucatDialog").length > 0){
        ancillary.hide();
        var dialogJqElement = $(".ucatDialog");
        dialogJqElement.hide();
        killMedia(dialogJqElement);
    }
}
*/

function loadMainMenu()
{
    //--------------------Preview handle
    var displayMainMenu = false;
    var mainMenuHTML = '<div id="mainMenuContainer" style="left: -12.375em;">';
    mainMenuHTML += '   <div id="previewMenuHandleContainer" class="previewMenuHandleContainer">';
    mainMenuHTML += '       <div id="previewMenuClickArea" class="previewMenuClickArea">';
    mainMenuHTML += '           <div id="previewMenuContainer" class="btn menuItem previewMenuHandle"></div>';
    mainMenuHTML += '       </div>';
    mainMenuHTML += '   </div>';
    mainMenuHTML += '   <div id="mainMenuScrollContainer" class="mainMenuScrollContainer"><div>';
    mainMenuHTML += '</div>';
    mainMenu.html(mainMenuHTML);
    var previewMenuContainer = $("#previewMenuContainer");
    var mainMenuScrollContainer = $("#mainMenuScrollContainer");
    if ((module.moduleFeatures.info) && ((module.metaData && module.metaData.length > 0) || module.proficiencyLevel))
    {
        previewMenuContainer.append('<div id="previewInfo" class="previewBadgeActive"><i class="' + infoPageIcon + '"></i></div>');
        var moduleInfoMenuHTML = '<div id="moduleInfoMenu">';
        if ((module.metaData && module.metaData.length > 0) || module.proficiencyLevel)
        {
            moduleInfoMenuHTML += '<ul id="moduleInfoMenuList" class="moduleMenuList">'
            moduleInfoMenuHTML += '  <li id="moduleInformationBtn" class="btn menuItem"><i class="' + infoPageIcon + '"></i>Information</li>';
            moduleInfoMenuHTML += '</ul>';
        }
        moduleInfoMenuHTML += '</div>';
        mainMenuScrollContainer.append(moduleInfoMenuHTML);
        $("#moduleInformationBtn").bind("click", function ()
        {
            var iconHTML = spf('<i class="icon ~"></i>', [$(this).children(":first").attr("class")]);
            var moduleInformationDiv = $('<div id="moduleInformationDiv"></div>');
            if(module.proficiencyLevel)
                moduleInformationDiv.append('<div id="targetLevel"><span class="metaDataCategoryHdr">Target ILR Level:</span><span class="metaDataCategoryList">'+htmlDecode(module.proficiencyLevel.title)+'</span></div>');
            for(var m=0; m<module.metaData.length; m++)
            {
                var metaDataCategory = moduleInformationDiv.find("#metaDataCategory_"+module.metaData[m].category.id);
                if(metaDataCategory.length == 0)
                {
                    moduleInformationDiv.append('<div class="metaDataCategoryHdr">'+htmlDecode(module.metaData[m].category.title)+'</div><ul id="metaDataCategory_'+module.metaData[m].category.id+'" class="metaDataCategoryList"></ul>');
                    metaDataCategory = moduleInformationDiv.find("#metaDataCategory_"+module.metaData[m].category.id);
                }
                metaDataCategory.append("<li>"+htmlDecode(module.metaData[m].title)+"</li>");
            }
            if (module.keywords && module.keywords.length > 0)
            {
                var subtopicsHTML = '<div class="metaDataCategoryHdr">Sub-Topic(s)</div><ul class="metaDataCategoryList">';
                for(var k=0; k<module.keywords.length; k++)
                {
                    subtopicsHTML += "<li>"+htmlDecode(module.keywords[k].text)+"</li>";
                }
                subtopicsHTML += '</ul></div>';
                moduleInformationDiv.append(subtopicsHTML);
            }
            openCustomDialog("Information", moduleInformationDiv.html(), "", iconHTML, "20%");
        });
        displayMainMenu = true;
    }
    if (module.moduleFeatures.print)
    {
        previewMenuContainer.append('<div id="previewPrint" class="previewBadge previewBadgeActive"><i class="' + printIcon + '"></i></div>');

        var modulePrintMenuHTML = "<ul id=\"modulePrintList\" class=\"actyMenuList\">";
        modulePrintMenuHTML += "<li id=\"printMenuBtn\" class=\"btn menuItem printMenuBtn\" onclick=\"toggleSubMenu( 'printMenuIcon', 'printMenu')\">";
        modulePrintMenuHTML += "<i class=\"" + printIcon + " subHeader\"></i>";
        modulePrintMenuHTML += "<i id=\"printMenuIcon\" class=\"" + accordianOpen + "\"></i> Print";
        modulePrintMenuHTML += "</li>";
        modulePrintMenuHTML += "<ul id=\"printMenu\" style=\"display:none;\">";
        modulePrintMenuHTML += "<li id=\"activityPrintBtn\" class=\"btn menuItem subMenuItem\"><i class=\"\"></i> Current Page</li>";
        modulePrintMenuHTML += "<li id=\"modulePrintBtn\" class=\"btn menuItem subMenuItem\"><i class=\"\"></i> Module</li>";
        modulePrintMenuHTML += "</ul>";
        modulePrintMenuHTML += "</ul>";
        mainMenuScrollContainer.append(modulePrintMenuHTML);
        $("#modulePrintBtn").bind("click", function ()
        {
            cleanPrint("module");
        })
        $("#activityPrintBtn").bind("click", function ()
        {
            cleanPrint("activity");
        });
        displayMainMenu = true;
    }
    if (module.moduleFeatures.source)
    {
        var hasAdditionalResource = false;
        for (var i = 0; i < module.resources.length; i++)
        {
            if (module.resources[i].additionalSource)
            {
                hasAdditionalResource = true;
                break;
            }
        }
        if (hasAdditionalResource)
        {
            previewMenuContainer.append('<div id="previewSource" class="previewBadge previewBadgeActive"><i class="' + resourceIcon + '"></i></div>');
            loadResourceMainMenu(mainMenuScrollContainer);
        }
    }
    if (module.moduleFeatures.notes)
    {
        previewMenuContainer.append('<div id="previewActivityNotes" class="previewBadge"><i class="' + defaultNoteIcon + '"></i></div>');
        mainMenuScrollContainer.append('<div id="activityNotesMenuContainer" style="display:none;"></div>');
        activityNotesMenuContainer = $("#activityNotesMenuContainer");
        previewActivityNotes = $("#previewActivityNotes");
    }
    if ((typeof (loadGlossaryMainMenu) == "function") && module.moduleFeatures.glossary && module.lexicalItems && module.lexicalItems.length > 0)
    {
        previewMenuContainer.append('<div id="previewGlossary" class="previewBadgeActive"><i class="' + glossaryIcon + '"></i></div>');
        loadGlossaryMainMenu(mainMenuScrollContainer);
        displayMainMenu = true;
    }
    if (displayMainMenu)
    {
        $("#mainMenuContainer").show();
    }
    $("#previewMenuClickArea").click(function ()
    {
        expandMainMenu();
    });
}

function expandMainMenu()
{
    $("#mainMenuContainer").animate({ left: "0" }, {
        duration: "fast", complete: function ()
        {
            if ($("#actyNotes").length > 0)
            {
                toggleSubMenu("actyMenuIcon", "actyNotes");
            }
            $("#previewMenuClickArea").unbind("click");
            $("#previewMenuClickArea").click(function ()
            {
                collapseMainMenu();
            });

            $('#header, #mainNav').click(function ()
            {
                //Hide the menu if visible
                collapseMainMenu();
                $(this).unbind("click");
            });
        }
    });
}

function collapseMainMenu()
{
    $('#header, #mainNav').unbind("click");
    //find any open glossaries and close the list to get rid of any scrollbars
    $("#glossaryMenuContainer").find("div[id*='glossaryMenuListBtn_']").each(function ()
    {
        if ($(this).next().css("display") == "block")
        {
            $(this).trigger("click");
        }
    });

    $("#mainMenuContainer").animate({ left: "-12.375em" }, {
        duration: "fast", complete: function ()
        {
            if ($("#actyNotes").length > 0)
            {
                toggleSubMenu("actyMenuIcon", "actyNotes");
            }
            $("#previewMenuClickArea").unbind("click");
            $("#previewMenuClickArea").click(function ()
            {
                expandMainMenu();
            });
        }
    });
}

function toggleSubMenu(icon, tgt, collapseSiblings, parentContainer)
{
    var tgtContainer = $("#" + tgt)
    var iconElmt = $("#" + icon)
    if (collapseSiblings)
    {
        $("#" + parentContainer).find(".vocabListContainer").each(function ()
        {
            $(this).slideUp("fast")
            $("#glossaryMenuIcon_" + $(this).attr("id").split("_")[1]).removeClass(accordianClose).addClass(accordianOpen);
        })
    }

    if (tgtContainer.css("display") == "none")
    {
        tgtContainer.slideDown("fast");
        iconElmt.removeClass(accordianOpen).addClass(accordianClose);
    }
    else
    {
        tgtContainer.slideUp("fast");
        iconElmt.removeClass(accordianClose).addClass(accordianOpen);
    }
}


function loadTextResource(containerElement, resource, mediaType)
{
/*
    var resourceHTML = "<div class=\"resourceWrapper\">";
    if (mediaType)
        resourceHTML += "   <div class=\"resourceSpacer\"></div>";
    resourceHTML += "   <div class=\"resourceContainerHdr\">";
    resourceHTML += "       <div class=\"transcriptHdr\"></div>";
    resourceHTML += "       <div id=\"translationHdr\" class=\"translationHdr\"></div>";
    resourceHTML += "   </div>";
    resourceHTML += "   <div id=\"resourceContainer\" class=\"resourceContainer\"></div>";
    resourceHTML += "</div>";
    containerElement.append(resourceHTML);

    var resourceContainer = $("#resourceContainer");
    var hasTranscript = false;
    var translationCount = 0;
    for (var i = 0; i < resource.paragraphs.length; i++)
    {
        var paragraph = resource.paragraphs[i];
        if (paragraph)
        {
            var resourceParagraphRowHTML = "<div class=\"resourceParagraphRow\">";
            if (paragraph.text.length > 0)
            {
                resourceParagraphRowHTML += "<div class=\"resourceParagraphColumnXscript resourceLanguage_" + (paragraph.language ? paragraph.language.id : 0) + "\" lang=\"" + (paragraph.language ? paragraph.language.diagraph : "") + "\" dir=\"" + ((paragraph.language && paragraph.language.rtl) ? "rtl" : "ltr") + "\">" + htmlDecode(paragraph.text) + "</div>";
                hasTranscript = true;
            }
            if (paragraph.translations.length > 0)
            {
                resourceParagraphRowHTML += "<div class=\"resourceTranslationColumnContainer\">";
                for (var j = 0; j < paragraph.translations.length; j++)
                {
                    var translation = paragraph.translations[j];
                    var translationLanguageId = translation.language ? translation.language.id : 0;
                    if ($("#translationBtn_" + translationLanguageId).length == 0)
                    {
                        var translationBtn = $(");
                        $("#translationHdr").append("<div id=\"translationBtn_" + translationLanguageId + "\" class=\"translationBtn\" onclick=\"toggleByLanguageVisibility('resourceContainer', 'resourceParagraphColumnXlation', 'resourceLanguage_'," + xlationLangObj.id + ")\">" + xlationLangObj.title + "</div>");
                        if (translationCount == 0)
                            primaryLanguageId = xlationLangObj.id
                        translationCount++
                    }

                }
                resourceParagraphRowHTML += "</div>";
            }
            resourceParagraphRowHTML += "</div>";
        }

        if (paragraph)
        {
            var thisRow = $("<div class=\"resourceParagraphRow\"></div>");
            if (paragraph.text.length > 0)
            {
                thisRow.append(spf('<div class="resourceParagraphColumnXscript resourceLanguage_~" lang="~"~>~</div>', [xscriptLangObj.id, xscriptLangObj.digraph, xscriptLangObj.rtl ? ' dir="rtl"' : "", htmlDecode(paragraph.text)]));
                hasTranscript = true
            }
            if (paragraph.translations.length > 0)
            {
                var xlationRow = $("<div class=\"resourceTranslationColumnContainer\"></div>");
                for (var j = 0; j < paragraph.translations.length; j++)
                {
                    var defaultLanguage = { "id": 0, "digraph": "", "rtl": false, "title": "Eng" }

                    if (paragraph.translations[j].language)
                    {
                        xlationLangObj.id = paragraph.translations[j].language.id;
                        xlationLangObj.rtl = paragraph.translations[j].language.rtl;
                        xlationLangObj.digraph = paragraph.translations[j].language.shortTitle.length > 0 ? paragraph.translations[j].language.shortTitle : "";
                        xlationLangObj.title = paragraph.translations[j].language.title.length > 0 ? paragraph.translations[j].language.title.substring(0, 3) : "Eng";

                    }
                    var primaryLanguageId;

                    if ($("#translationBtn_" + xlationLangObj.id).length == 0)
                    {
                        var translationBtn = $("<div id=\"id_translationBtn_" + xlationLangObj.id + "\" class=\"translationBtn\" onclick=\"toggleByLanguageVisibility('id_resourceContainer', 'resourceParagraphColumnXlation', 'resourceLanguage_'," + xlationLangObj.id + ")\">" + xlationLangObj.title + "</div>");
                        resrcContainerHdrXlation.append(translationBtn);
                        if (translationCount == 0)
                            primaryLanguageId = xlationLangObj.id
                        translationCount++
                    }
                    xlationRow.append(spf('<div class="resourceParagraphColumnXlation resourceLanguage_~~" lang="~"~>~</div>', [xlationLangObj.id, primaryLanguageId == xlationLangObj.id ? "" : " off", xlationLangObj.digraph, xlationLangObj.rtl ? ' dir="rtl"' : "", htmlDecode(paragraph.translations[j].text)]));
                }
                thisRow.append(xlationRow);
            }
            resourceContainer.append(thisRow);
        }
    }

    if (hasTranscript)
        resrcContainerHdr.append(rescrContainerHdrXscript)
    if (translationCount > 0)
    {
        resrcContainerHdr.append(resrcContainerHdrXlation);
    }

    //    containerElement.append(resrcWrapper.prop("outerHTML"));
*/    
}


function loadAudioTestPage(containerElement)
{
    //If on disclaimer page
    if (containerElement)
    {
        var audioTestHTML = '';
        audioTestHTML += '<div id="audioTestPage" class="descriptionTxt nested bottomBuffer">'
        audioTestHTML += '       <div id="testAudioRecordContainer" class="testAudioRecordContainer" style="padding:.5em; text-align:left;"></div>';
        audioTestHTML += '</div>'
        containerElement.append(audioTestHTML);
    } else
    {
        var audioTestDialog = '<div id="audioTestDialog" class="audioTestDialog" style="text-align: center;">';
        audioTestDialog += '    <div id="audioTestPage" class="">'
        audioTestDialog += '       <div id="testAudioRecordContainer" class="testAudioRecordContainer" style="padding:.5em; text-align:left;"></div>';
        audioTestDialog += '    </div>'
        audioTestDialog += '</div>';
        var iconHTML = '<i class="fa fa-microphone"></i>'
        var headerText = "Test Audio Settings";
        openCustomDialog(headerText, audioTestDialog, "", iconHTML, "540px");
    }

    loadAudioTestRecorder($("#testAudioRecordContainer"), false);
}

function loadAudioTestRecorder(containerElement, includeQueue)
{
    var idPrefix = containerElement.attr("id");
    var mediaManagerRecorderHTML = '<div id="' + idPrefix + 'Help"></div>';
    mediaManagerRecorderHTML += '<div id="' + idPrefix + 'Form"></div>';
    if (includeQueue)
        mediaManagerRecorderHTML += '<div id="' + idPrefix + 'UploadContainer" class="mediaManagerResultsContainer fileProgressContainer" style="max-height:18.750em; overflow-y:auto; margin-top:.5em; "></div> ';
    containerElement.html(mediaManagerRecorderHTML);
    loadAudioTestRecorderForm(idPrefix);
    var helpDescription = '<div style="text-align:left;">Use the audio recorder below to test your computers audio output and microphone input settings. These test recordings will not be saved. Record as many sessions as needed to adjust your settings. A new session will erase the previous session.</div>';
    $("#"+idPrefix+"Help").append(helpDescription);
    //addContextualHelp(idPrefix + "Help", helpDescription, "append", true);
}

function loadAudioTestRecorderForm(idPrefix, callback)
{
    var mediaManagerRecorderFormHTML = '';
    mediaManagerRecorderFormHTML += '<div id="' + idPrefix + 'Recorder" style="margin-top:.5em;"></div>';
    $("#" + idPrefix + "Form").html(mediaManagerRecorderFormHTML);

    var mediaManagerRecorderContainer = $("#" + idPrefix + "Recorder");
    mediaManagerRecorderContainer.ucatRecorder({ "record": true, "download": false, "submit": false });
    setupUcatMedia($("#" + idPrefix));
}
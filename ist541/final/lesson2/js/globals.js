/* $Rev$ - $LastChangedDate$ */
var Globals = {
    ajaxEndpoints: {
        'curriculum': 'WebServices/curriculum.aspx', 'curriculumLevel': 'WebServices/CurriculumLevel.aspx',
        'module': 'WebServices/Module.aspx', 'activity': 'WebServices/activity.aspx', 'component': 'WebServices/component.aspx',
        'activityComponent': 'WebServices/activityComponent.aspx', 'prompt': 'WebServices/promptresponse.aspx',
        'response': 'WebServices/promptresponse.aspx',
        'feedback': 'WebServices/feedback.aspx', 'note':'WebServices/note.aspx',
        'resource': 'WebServices/resource.aspx', 'fields': 'WebServices/fields.aspx', 'mediaUpload':'WebServices/resource.aspx',
        'paragraph': 'WebServices/paragraph.aspx', 'language':'WebServices/language.aspx',
        'textLevel': 'WebServices/textLevel.aspx',
        'transcription': 'WebServices/transcription.aspx',
        'alternate': 'WebServices/transcription.aspx',
        // application manager
        'copyrightType': 'WebServices/copyrightType.aspx'
    },

    feedbackTypes:{
        'incorrect': 0, 'correct': 1, 'hint': 2, 'terminal': 3
    },

    feedbackTypeTitles:["Incorrect", "Correct", "Hint", "Terminal"],

    // since the native isArray returns true for both objects and arrays, this tests for a true array, which should have these properties and methods defined
    isArray: function (ele) {
        if (typeof (ele) == 'undefined')
            return false;
        return (typeof (ele.length) != 'undefined' && typeof (ele.slice) != 'undefined' && typeof (ele.push) != 'undefined' && typeof (ele.reverse) != 'undefined' && typeof (ele.pop) != 'undefined');
    },

    // checks if it's a web service callback or not
    isWebServiceCallback: function (args) {
        if (typeof(args.length) == 'undefined')
            return false;
        if (args.length == 1 && typeof (args[0].error) == 'undefined')
            return false;
        else if (args.length != 2)
            return false;
        if (typeof (args[0]) != 'object' || typeof (args[1]) != 'object')
            return false;
        if (args.length == 2 && args[1] !== null && typeof(args[1]) == 'object' && typeof(args[1].callback) != 'undefined' && typeof(args[1].action) != 'undefined')
            return true;
        return false;
    },

    isTouchScreen: /(iPhone|iPod|iPad|Blackberry|Android)/.test(navigator.userAgent),

    screenWidth: function () { return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0); },

    resourceTypes: ["Text", "Image", "Audio", "Video", "Flash", "Document"],
    getResourceTypeIdByName: function (name) {
        name = name.toLowerCase();
        for (var i = 0; i < Globals.resourceTypes.length; i++) {
            if (Globals.resourceTypes[i].toLowerCase() == name)
                return i;
        }
        return -1;
    },

    getResourceTypeNameById: function (id) {
        var rtn = '';
        try {
            rtn = Globals.resourceTypes[id];
        }
        finally {
            return rtn;
        }
    },

    // events
    $navigateEvent:$.Event('navigate'),
}

var validEmailDomains = [ "dliflc.edu", "pom.dliflc.edu", "us.army.mil", "us.navy.mil", "usmc.mil", "us.af.mil", "uscg.mil", "mail.mil" ];

/***************ICONS***************/
var removeIcon               = "removeIcon fa fa-trash-o";
var verticalSortIcon         = "sortHandleVertical fa fa-sort";
var horizontalSortIcon       = "fa fa-arrows-h";
var noteActionTriggerIcon    = "actionTrigger fa fa-paperclip";
var devNoteActionTriggerIcon = "actionTrigger fa fa-file-text";
var accordianOpen            = "fa fa-caret-right";
var accordianClose           = "fa fa-caret-down";
var menuArrowDown            = "fa fa-caret-down";
var menuArrowLeft            = "fa fa-caret-left";
var menuArrowRight           = "fa fa-caret-right";
var dropdownIndicatorIcon    = "fa fa-caret-down";
var addButtonBlueIcon        = "btnBlue fa fa-plus";
var addButtonGreyIcon        = "btnGrey fa fa-plus";
var addButtonGreenIcon       = "btnGreen fa fa-plus";
var pasteButtonGreenIcon     = "btnGreen fa fa-paste";
var buttonGreyIcon           = "btnGrey";
var buttonGreenIcon          = "btnGreen";
var buttonRedIcon            = "btnRed";
var buttonBlueIcon           = "btnBlue";
var contextualHelpIcon		 = "fa fa-question-circle-o";
var feedbackIncorrectIcon             = "feedbackIncorrect fa fa-comment fa-stack-2x";
var feedbackCorrectIcon               = "feedbackCorrect fa fa-comment fa-stack-2x";
var feedbackIncorrectIndicatorIcon    = "fa fa-times custom-stack-1x";
var feedbackCorrectIndicatorIcon      = "fa fa-check custom-stack-1x";
var feedbackIndicatorIcon             = "fa fa-comment fa-stack-2x";
var feedbackBadgeIndicatorIcon        = "fa fa-comment fa-stack-2x";

var summaryFeedbackIcon      = "fa fa fa-key custom-stack-1x";

var feedbackDistractorIcon   = "fa fa-random fa-stack-2x";
var responseAlternateIcon    = "fa fa-star-half-o fa-stack-2x";

var hintIcon                 = "fa fa-medkit";
var flagEmptyIcon            = "fa fa-flag-o";
var flagFullIcon             = "fa fa-flag";
var selectFromAboveIcon      = "btnBlue fa fa-cloud-download";
var replyIcon                = "btnGrey fa fa-reply";
var checkboxCheckedIcon      = "checkboxChecked fa fa-check-square";
var checkboxUncheckedIcon    = "checkbox fa fa-square-o";
var checkcircleCheckedIcon   = "checkcircleChecked fa fa-check-circle";
var checkcircleUncheckedIcon = "checkcircle fa fa-circle";
var downloadIcon             = "fa fa-download";
var menuActionTriggerIcon    = "fa fa-cog";
var currentModuleIcon        = "launchModuleLink fa fa-external-link-square"; // Not used
var notificationIcon         = "fa fa-exclamation-triangle";
var infoIcon                 = "fa fa-info-circle";
var locationInfoIcon         = "fa fa-map-marker";
var publicIcon               = "fa fa-toggle-on switchedOn";
var privateIcon              = "fa fa-toggle-on switchedOff";
var userIcon                 = "fa fa-user";
var projectManagerIcon       = "fa fa-briefcase";
var teamLeadIcon             = "fa fa-user";
var teamMemberIcon           = "fa fa-user";
var lockIcon                 = "fa fa-lock";
var userLoggedOnIcon         = "userLoggedOn fa fa-circle";
var userLoggedOffIcon        = "userLoggedOff fa fa-circle-thin";
var userIdleIcon             = "userIdle fa fa-clock-o";
var userUnavailableIcon      = "userUnavailable fa fa-ban";
var attachIcon               = "fa fa-files-o";
var instructionIcon          = "fa fa-info-circle";
var toggleLtrIcon            = "fa fa-align-left";
var toggleRtlIcon            = "fa fa-align-right";
var oneToManyIcon            = "fa fa-bars";
var oneToOneIcon             = "fa fa-minus";
var defaultObjectiveIcon     = "fa fa-graduation-cap";
var writeIcon                = "fa fa-pencil-square";
var readIcon                 = "fa fa-lock";
var serverSuccessMessageIcon = "fa fa-check-circle-o";
var serverErrorMessageIcon   = "fa fa-exclamation-triangle";
var sortAscIcon              = "fa fa-sort-alpha-asc";
var sortDescIcon             = "fa fa-sort-alpha-desc";
var duplicateIcon            = "fa fa-clone";
var copyIcon                 = "fa fa-copy";
var	hangModuleIcon           = "fa fa-sitemap";
var pronunciationIcon        = "fa fa-microphone";
var lexicalItemImageIcon     = "fa fa-picture-o";
var lexicalItemPartsOfSpeechIcon       = "fa fa-cubes";
var moduleLevelLocationIcon  = "fa fa-folder-open";
var editModuleIcon           = "fa fa-pencil";
var editTextIcon             = "fa fa-pencil";
var popUpWarningIcon         = "fa fa-exclamation-triangle";
var pinModuleIcon = "fa fa-thumb-tack";
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

/* ---------- Sidebar Icons --------------- */
var expandSideBarIcon         = "fa fa-caret-square-o-left";
var collapseSideBarIcon       = "fa fa-caret-square-o-right";
var closeSideBarIcon          = "fa fa-times";

/* ---------- Assessment Icons --------------- */
var assessmentIcon = "fa fa-certificate";
var teacherReviewStatusIcon = "fa fa-eye-slash";
var studentReviewStatusIcon = "fa fa-eye";
var upcomingStatusIcon = "fa fa-calendar";
var inProgressStatusIcon = "fa fa-clock-o";
var completeStatusIcon = "fa fa-check";

/* ---------- Project Manager --------------- */
var projectNavIcon      = "fa fa-map-marker";
var projectHomeIcon     = "fa fa-university";
var structureIcon       = "fa fa-sitemap";
var personnelIcon       = "fa fa-group";
var homeIcon            = "fa fa-cog";
var moveLevelIcon       = "fa fa-arrows";
var openProjectIcon     = "fa fa-sitemap";
var closeProjectIcon    = "fa fa-arrow-circle-left";
var levelLocationIcon   = "fa fa-map-marker";
var closeMoveLevelIcon  = "fa fa-times";
var hasModulesIcon      = "fa fa-file-text";
var noModulesIcon       = "fa fa-file-o";
var projectPublicIcon   = "fa fa-toggle-on switchedOn";
var projectPrivateIcon  = "fa fa-toggle-on switchedOff";
var levelPublicIcon    = "fa fa-toggle-on switchedOn";
var levelPrivateIcon     = "fa fa-toggle-on switchedOff";
var modulePublicIcon               = "fa fa-file-text switchedOnAlternate";
var modulePrivateIcon              = "fa fa-file-o switchedOffAlternate";
var moduleVisibleOnIcon               = "fa fa-toggle-on switchedOn";
var moduleVisibleOffIcon                = "fa fa-toggle-on switchedOff";
var assessmentPublishIcon = "fa fa-certificate";
var gradingProtocolIcon = "fa fa-key";

/* ---------- side panel toolbar --------------- */
var backIcon			= "fa fa-close";
var infoPageIcon		= "fa fa-tags";
var publishOptionsIcon	= "fa fa-sitemap";
var activityIcon		= "fa fa-puzzle-piece";
var mediaIcon			= "fa fa-film";
var glossaryIcon		= "fa fa-language";
var previewIcon			= "fa fa-rocket";
var downloadIcon		= "fa fa-download";
var exportIcon			="fa fa-bolt";
var socialCenterIcon    = "fa fa-share-alt";
var ratingsIcon         = "fa fa-star";
var toolsIcon           = "fa fa-wrench";
var messagingIcon       = "fa fa-envelope-o";
var helpIcon            = "fa fa-question";
var modulesIcon         = "fa fa-laptop";
var classAssignmentIcon = "fa fa-users";

/* ---------- Note Icons ----------- */
var defaultNoteIcon          = "icon defaultNote";       //"fa fa-paperclip";
var historyNoteIcon          = "icon historyNote";       //"fa fa-institution"
var collaborationNoteIcon    = "icon collaborationNote"; //"fa fa-users";
var teacherNoteIcon          = "icon teacherNote";       //"fa fa-user";
var informationNoteIcon      = "icon infoNote";          //"fa fa-lightbulb-o";
var hintNoteIcon             = "icon hintNote";          // "fa fa-medkit" or "fa fa-lightbulb-o"
var developerNoteIcon        = "icon developerNote";     //"fa fa-wrench";
var cultureNoteIcon          = "icon cultureNote";
var grammarNoteIcon          = "icon grammarNote";

/*----------- Custom Radio/Checkbox -----------*/
var checkBoxOffIcon       = "fa fa-square-o";
var checkBoxOnIcon        = "fa fa-check-square";
var radioOffIcon          = "fa fa-circle-thin";
var radioOnIcon           = "fa fa-check-circle";

/*----------- Matching Linked/Unlinked -----------*/
var matchingLinkedIcon        = "fa fa-link";
var matchingUnlinkedIcon      = "fa fa-chain-broken";

var loadPrompt = "loadGenericPrompt"
var loadResponse = "loadGenericResponse"
var isRefresh = false;//Used by post load component code.

var isAnimationRunning = false;
var animationDuration = 400;
var taskWarningTolerance = 0.4;
var GLOBAL_ARCHIVE = 0;
var GLOBAL_VISIBLE = 1;
var defaultPublishMode = "publishedAssignment";

var monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var activityLayouts = [{title:"Default", numCells:0},{title:"Two Column",numCells:2},{title:"Four Cell",numCells:4}];

var skillLevels = ["Native", "Second", "Heritage", "Study"];

var isRunning = false;//used to prevent doubleClick when opening a module. Represents an open module;

var arbitraryFeedbackLimit = 2; // three feedbacks is the max to show a user;

var userRatingsArray = ["Bad", "Poor", "Average", "Good", "Great"]; 

//The following components can have both correct and incorrect feedback possible
var dualFeedbackComponents = ["transcription", "fillintheblank", "textselector", "ordering", "categorization"]

var defaultTableDataObj = {
    parentContainerId: "",
    filterOptionsContainerId: "",
    moduleListContainerId: "",
    displayTableId: "",
    tablePagerId: "",
    searchType: "",
    rowStart: 1,
    rowEnd: 20,
    page: 1,
    totalPages: 0,
    rowCount: 0,
};

//Activity behaviors
var behaviorTypes = [
    { id: 0, type: "Default", displayTitle: "Default" },
    { id: 1, type: "Timed", displayTitle: "Timed", triggerType:"time" },
    { id: 2, type: "ProctorInitiated", displayTitle: "Proctor-Initiated", triggerType:"proctor" },
    {
        id: 3, type: "Navigation", displayTitle: "Navigation Trigger", triggerType:"int", options: [{ value: 0, title: "previous activity had been completed" }, { value: 1, title: "all previous activities have been completed" }]
    }];

function msToTime(ms)
{
    var milliseconds = parseInt((ms % 1000) / 100),
    seconds = Math.floor((ms / 1000) % 60),
    minutes = Math.floor((ms / (1000 * 60)) % 60),
    hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    //return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    return minutes + ":" + seconds;
}

function serializeStringToJSON(string)
{
    return $.parseJSON(htmlDecode(string));
}

function copyGlobalVariable(globalVar)
{
    return JSON.parse(JSON.stringify(globalVar));
}

function reconcileGlobalVariable(copy, globalVar)
{
    $.each(globalVar, function (key, value)
    {
        if (!(key in copy))
        {
            copy[key] = value;
        }
    });
}

function openFullscreen(element)
{
    if (element.requestFullscreen)
        element.requestFullscreen();
    else if (element.mozRequestFullScreen)
        element.mozRequestFullScreen();
    else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
    else if (element.msRequestFullscreen)
        element.msRequestFullscreen();
}

var sortableTableRowHelper = function(e, ui)
{
    ui.children().each(function(){$(this).width($(this).width());});
    return ui;
};

function keyPressIsEnter(e)
{
    var keyCode = (e.keyCode ? e.keyCode : e.charCode);
    return (keyCode == 13);
}

function keyPressIsEscape(e)
{
    var keyCode = (e.keyCode ? e.keyCode : e.charCode);
    return (keyCode == 27);
}

/*
function isNumberKey(e)
{
    var charCode = (e.which) ? e.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

    return true;
}
*/

function isNumberKey(txt, evt)
{
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 46)
    {
        //Check if the text already contains the . character
        if (txt.value.indexOf('.') === -1)
        {
            return true;
        } else
        {
            return false;
        }
    } else
    {
        if (charCode > 31 &&
            (charCode < 48 || charCode > 57))
            return false;
    }
    return true;
}

function replaceQuotes(value)
{
    return value.replace(/"/g,"&quot;");
}

function round(value, step)
{
    if (isNaN(value))
        value = 0;
    step || (step = 1.0);
    var inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

/*------------CUSTOM TOOLTIP CODE------------*/
var timeoutID;
var toolTipAutoHideTimeOut;

function clearToolTip(element){
	element.unbind('mouseenter mouseleave')
    window.clearTimeout(timeoutID);
    window.clearTimeout(toolTipAutoHideTimeOut)
}

function initToolTip(params) {
    var paramElement = params.element; //id
    window.clearTimeout(timeoutID);
    window.clearTimeout(toolTipAutoHideTimeOut)
    paramElement.unbind('mouseenter mouseleave');

    var isiPad = navigator.userAgent.match(/(iPhone|iPod|iPad|Blackberry|Android)/) != null;
    if(!isiPad){

        paramElement.data("params",params)
        if(params.systemErrorToolTip == true){
            $("#id_toolTipContainer").remove();
            systemErrorToolTip(params);
            showTooltip();
        } else {
            paramElement.hover( toolTipHandlerIn, toolTipHandlerOut );
        }
    }
}

/*---------------TOOLTIP VERSION OF SYSTEM ERROR---------------------------*/
//does not work in IE, Edge is fine
var xhr;
var _orgAjax = jQuery.ajaxSettings.xhr;
jQuery.ajaxSettings.xhr = function () {
  xhr = _orgAjax();
  return xhr;
};

//retry is currently not used,
//we can manually pass retry if we want to display a button
//or re-execute the ajax based on the error.


function inlineSystemErrorMessaging(serverResponseObj, requestObj, isRetry){
    var retry = isRetry ? isRetry : false;
    var baseURL = xhr.responseURL.substr(0, xhr.responseURL.indexOf('?'));
    var isDeadlock = false;
    var errorMsgStr = htmlDecode(serverResponseObj.error);
    var errorEmpty = $.isEmptyObject(serverResponseObj.error)
    //suppress deadlock errors
    if (!errorEmpty && serverResponseObj.error.indexOf("deadlocked") >= 0){
        console.log(serverResponseObj.error)
        isDeadlock = true;
    }

    if(isDeadlock){
        errorMsgStr = "The system has encountered an error. Please try again."
        console.log(serverResponseObj.error);
    }
    
    if($("#headerUserStatus").length > 0){
        if($("#errorMsgCell").length > 0)
            $("#errorMsgCell").remove();
        var inlineErrorMsg = '<div id="errorMsgCell" class="themeBgrColor_1 interfacePaddingLeft" style="display:table-cell;vertical-align:middle;"><span class="inlineSystemError"><span id="errorMsg">System Error!</span><span title="Remove Error Message" id="clearErrorBtn" style="padding:0 .25em;"><i class="fa fa-times"></i></span></span></div>';
        $("#headerUserStatus").before(inlineErrorMsg);
        var errorMessageHTML = '<div class="displayTable">';
        errorMessageHTML += '<div class="displayTableCell">'+errorMsgStr+'</div>';
        errorMessageHTML += '<div class="displayTableCell" style="min-width: 1.875em; text-align:right; vertical-align:top;" onclick="closeToolTip()"><span class="systemErrorCloseBtn"><i class="fa fa-times"></i></span></div>'
        errorMessageHTML += '</div>';
        //not used yet
        if(retry){
            errorMessageHTML += '<div style="text-align:center;"><div class="btnBlue"><i class=\"fa fa-refresh\"></i><span id="retryAjaxBtn">Retry</span></div></div>'
        }

        var params = {};
        params.element = $("#errorMsg");
        params.elementDataString = errorMessageHTML;
        params.systemErrorToolTip = true;
        initToolTip(params);
        
        //Reruns the error to display details
        $("#errorMsg").on("click",function(){
            inlineSystemErrorMessaging(serverResponseObj, requestObj);
        })

        //Clears the entire div
        $("#clearErrorBtn").on("click",function(){
            $("#errorMsgCell").remove();
            $("#id_toolTipContainer").remove();
        })

        //not used yet
        if(retry){
            $("#retryAjaxBtn").on("click",function(){
                retryAjax(baseURL, requestObj);
            })
        }
    } else {
        alert(errorMsgStr)
    }
}

function retryAjax(baseURL, requestObj){
    delete requestObj.callback;
    $.ajax(
    {
        type: "POST",
        dataType: "jsonp",
        url: baseURL,
        data: requestObj
    });
}

function systemErrorToolTip(params)
{
    var paramElement = params.element; //id
    var params = paramElement.data("params");
    params.tooltipClass = "warningVersion"
    params.tooltipPos = "bottom";
    createToolTipDivHTML(params)
    var toolTip = $("#id_toolTipContainer")
    toolTip.data("paramElement", paramElement);
    adjustTooltipPosition()
    toolTip.fadeIn(animationDuration);
    //Resize window listener
    $(window).resize(adjustTooltipPosition);
}

//Only used for systemErrorToolTip
function adjustTooltipPosition(){
    var toolTip = $("#id_toolTipContainer");
    if(toolTip.length > 0){
        var paramElement = toolTip.data("paramElement");
        var params = paramElement.data("params")
        var offset = paramElement.offset();
        var targetWidth = paramElement.outerWidth()/2;
        var toolTipLeft = offset.left + targetWidth - toolTip.outerWidth()/2;
        var viewportWidth = $(window).width();

        //prevent from going offscreen right
        if(toolTipLeft+toolTip.outerWidth() > viewportWidth){
            var adjustedToolTipLeft = (toolTipLeft+toolTip.outerWidth() - viewportWidth);
            toolTipLeft = toolTipLeft-adjustedToolTipLeft-17;
            toolTip.css({"left":toolTipLeft});
            //reposition the arrow
            var remaingWidth = offset.left + (paramElement.outerWidth()/2);
            var adjustedArrowMargin = viewportWidth - remaingWidth - 17 - 9;//17 is scrollbar; 9 is width of arrow
            $("#id_toolTipArrow").css({"margin-right":adjustedArrowMargin});
        } else {
            $("#id_toolTipArrow").css({"margin-right":"auto"})
        }

        //Some of these conditions are not used since error tooltip displays on top right.
        //Leaving it in for now in case tooltip postion changes in the UI.
        if(toolTipLeft < 0 ){
            toolTipLeft = 0;//prevent from going offscreen Left
            $("#id_toolTipArrow").css({"margin-left":"2em"})
        }

        var paramTooltipPos = params.tooltipPos ? params.tooltipPos : "";//Position of tooltip Top is default
        if(paramTooltipPos.length > 0){
            var toolTipTop = 0;
            toolTip.css({"left":toolTipLeft,"top":toolTipTop});
        } else {
            var toolTipTop = 0;
            toolTip.css({"left":toolTipLeft,"top":toolTipTop});
        }

        var toolTipTop
        if(paramTooltipPos.length > 0){
            toolTipTop = offset.top+paramElement.outerHeight();
        } else {
            toolTipTop = offset.top - toolTip.outerHeight();
        }
        toolTip.css({"top":toolTipTop});
    }
}

function toolTipHandlerIn()
{
    //only show tooltip if a warning version does dot exist
    if($("#id_toolTipContainer").length > 0){
        if(!$(".warningVersion").length > 0){
            var params = $(this).data("params");
            var offset = $(this).offset()
            var toolTip = $("#id_toolTipContainer")
            var targetWidth = $(this).outerWidth()/2;
            var toolTipLeft = offset.left + targetWidth - toolTip.outerWidth()/2;
            var viewportWidth = $(window).width();

            //prevent from going offscreen right
            if(toolTipLeft+toolTip.outerWidth() > viewportWidth){
                var adjustedToolTipLeft = (toolTipLeft+toolTip.outerWidth() - viewportWidth);
                toolTipLeft = toolTipLeft-adjustedToolTipLeft-17;
                toolTip.css({"left":toolTipLeft});
                //reposition the arrow
                var remaingWidth = offset.left + (paramElement.outerWidth()/2);
                var adjustedArrowMargin = viewportWidth - remaingWidth - 17 - 9;//17 is scrollbar; 9 is width of arrow
                $("#id_toolTipArrow").css({"margin-right":adjustedArrowMargin});
            }
            if(toolTipLeft < 0 ){
                toolTipLeft = 0;//prevent from going offscreen Left
                $("#id_toolTipArrow").css({"margin-left":"2em"})
            }

            var paramTooltipPos = params.tooltipPos ? params.tooltipPos : "";//Position of tooltip Top is default
            if(paramTooltipPos.length > 0){
                var toolTipTop = 0;
                toolTip.css({"left":toolTipLeft,"top":toolTipTop});
            } else {
                var toolTipTop = 0;
                toolTip.css({"left":toolTipLeft,"top":toolTipTop});
            }

            var paramTooltipDelay = params.tooltipDelay ? params.tooltipDelay : 0;//lightversion or default
            if(paramTooltipDelay > 0){
                var toolTipTop
                if(paramTooltipPos.length > 0){
                    toolTipTop = offset.top+$(this).outerHeight();
                } else {
                    toolTipTop = offset.top - toolTip.outerHeight();
                }
                toolTip.css({"top":toolTipTop});
                timeoutID = window.setTimeout(showTooltip, paramTooltipDelay);
            } else {
                var toolTipTop
                if(paramTooltipPos.length > 0){
                    toolTipTop = offset.top+$(this).outerHeight();
                } else {
                    toolTipTop = offset.top - toolTip.outerHeight();
                }
                toolTip.css({"top":toolTipTop});
                toolTip.fadeIn(animationDuration);
            }

            //Check to see if tooltip is outside of screen visible area and compensates.
            //Only checks if tooltip goes beyond the far left of the screen "Stage Left"
            
            function screenWidth(){
            return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
            }
            var tooltipOffSet = toolTip.offset(); 
            var toolTipWidth = toolTip.outerWidth()
            var toolTipLeft = tooltipOffSet.left + toolTipWidth + 17;//17px is the average scrollbar width
            if(toolTipLeft > screenWidth()){
                toolTip.css({"left":"auto","right":0});
                $("#id_toolTipArrow").css("margin","0");
                $("#id_toolTipArrow").css("margin-left","auto")
                $("#id_toolTipArrow").css("margin-right",( screenWidth()-offset.left ) - ( 9 + $(this).outerWidth()/2) )
            }
            toolTipAutoHideTimeOut = window.setTimeout(toolTipHandlerOut, paramTooltipDelay+5000);
        }
    } else {
        //Non- error tooltip version
        var params = $(this).data("params");
        var offset = $(this).offset()
        createToolTipDivHTML(params)
        var toolTip = $("#id_toolTipContainer")
        var targetWidth = $(this).outerWidth()/2;
        var toolTipLeft = offset.left + targetWidth - toolTip.outerWidth()/2;

        if(toolTipLeft < 0 ){
            toolTipLeft = 0;//prevent from going offscreen Left
            $("#id_toolTipArrow").css({"margin-left":"2em"})
        }

        var paramTooltipPos = params.tooltipPos ? params.tooltipPos : "";//Position of tooltip Top is default
        if(paramTooltipPos.length > 0){
            var toolTipTop = 0;
            toolTip.css({"left":toolTipLeft,"top":toolTipTop});
        } else {
            var toolTipTop = 0;
            toolTip.css({"left":toolTipLeft,"top":toolTipTop});
        }

        var paramTooltipDelay = params.tooltipDelay ? params.tooltipDelay : 0;//lightversion or default
        if(paramTooltipDelay > 0){
            var toolTipTop
            if(paramTooltipPos.length > 0){
                toolTipTop = offset.top+$(this).outerHeight();
            } else {
                toolTipTop = offset.top - toolTip.outerHeight();
            }
            toolTip.css({"top":toolTipTop});
            timeoutID = window.setTimeout(showTooltip, paramTooltipDelay);
        } else {
            var toolTipTop
            if(paramTooltipPos.length > 0){
                toolTipTop = offset.top+$(this).outerHeight();
            } else {
                toolTipTop = offset.top - toolTip.outerHeight();
            }
            toolTip.css({"top":toolTipTop});
            toolTip.fadeIn(animationDuration);
        }

        //Check to see if tooltip is outside of screen visible area and compensates.
        //Only checks if tooltip goes beyond the far left of the screen "Stage Left"
        
        function screenWidth(){
        return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
        }
        var tooltipOffSet = toolTip.offset(); 
        var toolTipWidth = toolTip.outerWidth()
        var toolTipLeft = tooltipOffSet.left + toolTipWidth + 17;//17px is the average scrollbar width
        if(toolTipLeft > screenWidth()){
            toolTip.css({"left":"auto","right":0});
            $("#id_toolTipArrow").css("margin","0");
            $("#id_toolTipArrow").css("margin-left","auto")
            $("#id_toolTipArrow").css("margin-right",( screenWidth()-offset.left ) - ( 9 + $(this).outerWidth()) )
        }
        toolTipAutoHideTimeOut = window.setTimeout(toolTipHandlerOut, paramTooltipDelay+5000);
    }
}

function showTooltip(){
    var toolTip = $("#id_toolTipContainer")
    toolTip.fadeIn(animationDuration)
}

function closeToolTip(){
    var toolTip = $("#id_toolTipContainer")
    toolTip.remove();
}

function toolTipHandlerOut(){
    if($("#id_toolTipContainer").length > 0){
        if(!$(".warningVersion").length > 0 || !$(".warningVersion").length > 0){
            $("#id_toolTipContainer").remove();
            window.clearTimeout(timeoutID);
            window.clearTimeout(toolTipAutoHideTimeOut)
        }
    }
}

function createToolTipDivHTML(params){
    if($("#id_toolTipContainer").length > 0){
        $("#id_toolTipContainer").remove();
    }

    var paramElement = params.element;
    var paramElementDataString = params.elementDataString ? params.elementDataString : '&nbsp;'+paramElement.attr("title")+'&nbsp;';//Custom String or title attribute
    var paramTooltipClass = params.tooltipClass ? params.tooltipClass : "";//lightversion or default
    var paramTooltipRTL = params.tooltipRTL ? true : false;
    var paramTooltipPos = params.tooltipPos ? params.tooltipPos : "";//Position of tooltip Top is default
    var paramTooltipPosArrow = params.tooltipPos == "bottom" ? "Up" : "Down";
    var divHTML = spf('<div id="id_toolTipContainer" class="toolTipContainer ~">', [paramTooltipClass]);

    if(paramTooltipPos.length > 0){
        divHTML += spf('<div style="width:100%;"><div id="id_toolTipArrow" class="arrowUp~"></div></div>',[paramTooltipClass]);
    }

    divHTML += spf('<div class="toolTipContent ~">', [paramTooltipClass]);
    if(paramTooltipRTL){
        divHTML += spf('<span dir="rtl">~</span>',[paramElementDataString]);
    } else {
        divHTML += paramElementDataString;
    }
    divHTML += '</div>'

    if(paramTooltipPos.length <= 0){
        divHTML += spf('<div style="width:100%;"><div id="id_toolTipArrow" class="arrowDown~"></div></div>',[paramTooltipClass]);
    }


    divHTML += '</div>'
    $("body").append(divHTML);
}


function initToolTipJQVersion(params) {
    var isiPad = navigator.userAgent.match(/(iPhone|iPod|iPad|Blackberry|Android)/) != null;
    if(!isiPad){
        //element
        var paramElement = params.element; //id
        var paramElementDataString = params.elementDataString ? params.elementDataString : "&nbsp;"+paramElement.attr("title")+"&nbsp;";//Custom String or title attribute
        var paramTooltipClass = params.tooltipClass ? params.tooltipClass : "";//lightversion or default
        var paramTooltipPosMy = params.tooltipPosMy ? params.tooltipPosMy : "center bottom-10";//Position
        var paramTooltipPosAt = params.tooltipPosAt ? params.tooltipPosAt : "center top";//Position
        var paramTooltipDelay = params.tooltipDelay ? params.tooltipDelay : 0;//lightversion or default
        var paramTooltipRTL = params.tooltipRTL ? true : false;

        paramElement.tooltip({
            tooltipClass:paramTooltipClass,
            content: function()
            {
                //var displayString = spf('<div dir="~">~</div>',[paramTooltipRTL, paramElementDataString])
                var displayString = paramElementDataString;
                return displayString;
            },
            position:
            {
                my: paramTooltipPosMy,
                at: paramTooltipPosAt,
                using: function(position, feedback)
                {
                    $(this).css(position);
                    $( "<div>" )
                    .addClass("arrow "+paramTooltipClass)
                    .addClass(feedback.vertical)
                    .addClass(feedback.horizontal)
                    .appendTo(this);
                }
            },
            show:
                {
                    delay: paramTooltipDelay
                },
            hide:false,//Don't fade out; prevents visible font switching
            open: function( event, ui ) {
                
                $("body").find(".ui-tooltip.lightVersion,.ui-tooltip").each(function(){

                    if(paramTooltipRTL){
                        //$(this).css("background","red");
                        $(this).attr("dir","RTL");
                        $(this).addClass("tooltipRTL");
                        var smeMode = getSMEmode()
                        if(smeMode){
                            setLanguageFontSME( $(this).parent() );//SME View Mode
                        } else {
                            setLanguageFontSV( $(this).parent() );//Student View Mode
                        }
                    }
                });
            }
        });
    }
}




/*------------END TOOLTIP------------*/

function downloadStandalone(moduleId, iconElement, draftMode, published, publishedAssignment, scorm, teacher, student)
{
    var iconElementClass = $("#"+iconElement).attr("class")
    var responseText
	responseText = $.ajax(
	{
	    type: "POST", dataType: "jsonp", 
	    url: domainRootPath+"WebServices/Module.aspx", 
	    data:
	    {
	        "jsonpcallback":"downloadStandaloneCallback",
	        "action":"download",
	        "id":moduleId,
	        "iconElement":iconElement,
            "iconElementClass":iconElementClass,
            "draftMode": draftMode,
            "publishedAssignment": publishedAssignment,
            "published":published,
            "scorm":scorm,
            "teacher": teacher,
            "student": student
	    },
	    beforeSend: function() {
	        $('#'+iconElement).attr("class","loader");
	    }
	});
/*
		//This feature is commented out in the student view
		//From sudent view...download published version
	    responseText = $.ajax(
	    {
	        type: "POST", dataType: "jsonp", 
	        url: domainRootPath+"WebServices/Module.aspx", 
	        data:
	        {
	            "jsonpcallback":"downloadStandaloneCallback",
	            "action":"download",
	            "id":moduleId,
	            "iconElement":iconElement,
                "iconElementClass":iconElementClass,
	            "published":true
	        },
	        beforeSend: function() {
	            $('#'+iconElement).attr("class","loader");
	        }
	    });
	}
*/
}

function downloadStandaloneCallback(serverResponseObj, requestObj)
{
    var toggleDownloadSpan = $("#"+requestObj.iconElement);
    if (serverResponseObj.error)
    {
        inlineSystemErrorMessaging(false, serverResponseObj, requestObj ? requestObj : false);
        toggleDownloadSpan.attr("class",requestObj.iconElementClass)
        toggleDownloadSpan.removeClass("actionTriggerOn")
    }
    else if (serverResponseObj.zipFilePath)
    {
        location.href="File.ashx?path="+serverResponseObj.zipFilePath;
        toggleDownloadSpan.attr("class",requestObj.iconElementClass)
        toggleDownloadSpan.removeClass("actionTriggerOn")
    }
}

function generateStudentAssignmentScore(studentAssignment) {   // Previous use case.
    var grade = "<span>" + ((studentAssignment.gradingProtocolTotal > 0) ?
        ((((studentAssignment.studentTotal + studentAssignment.studentBonusTotal) * 1.0) /
            (studentAssignment.gradingProtocolTotal * 1.0)) * 100) : 0.0).toFixed(2) + "%</span><span>(" + studentAssignment.studentTotal + (studentAssignment.studentBonusTotal > 0 ?
                "<span style=\"color:#00b200;\">+" + studentAssignment.studentBonusTotal + "</span>" : "") + "/" + studentAssignment.gradingProtocolTotal + ")</span>";
    return grade;
}

var defaultGradingScale = {
    id: 0,
    title: 'Default Grading Scale',
    passingGrade: 60,
    intervals: [
        {id: 0, name: "", floor: 80, color: "#00b200", passing: true},
        {id: 1, name: "", floor: 60, color: "#ff9564", passing: true},
        {id: 2, name: "", floor: 0, color: "#e50000", passing: false},
    ]
}

function findGradingScaleInterval(studentTotalScore, studentTotalPoints, gradingScale) { // Loops through a user selected gradingScale to find the apporpiate grading scale interval for a students score.
    var intervalData = null;
    var { intervals } = gradingScale; // Destructuring
    for (var i = 0; i < intervals.length; i++) 
    {    // At every level set intervalData to current iteration grade interval.
        intervalData = intervals[i];
        if (gradingScale.pointScale)
        {
            if (studentTotalPoints >= intervalData.floorPoints) 
            {  // If student score is >= the current intervalData floor value breakout
                break;
            }
        }
        else
        {
            if (studentTotalScore >= intervalData.floor) 
            {  // If student score is >= the current intervalData floor value breakout
                break;
            }
        }
    }
    return intervalData;
}

function generateStudentAssignmentScoreHTML(assignment) 
{ // assignment obj, returns HTML to be rendered. The text color will toggle between 'black' or 'white' depending on the background color.
    if ((typeof (assignment).studentCount == "undefined") || (assignment.studentCount <= 0))
        assignment.studentCount = 1;
    var studentTotal = (assignment.studentTotal + assignment.studentBonusTotal) / assignment.studentCount;
    var assignmentTotal = assignment.gradingProtocolTotal / assignment.studentCount;
    var assignmentGrade = (studentTotal / (assignmentTotal > 0 ? assignmentTotal : 1)) * 100; // Student grade score calculation
    
    var studentAssignmentScoreHTML = "";
    if (!assignment.gradingScale) { // if no gradingScale is present in the assignmentObj, then use the default gradingScale
        assignment.gradingScale = copyGlobalVariable(defaultGradingScale)
    }

    var intervalData = findGradingScaleInterval(assignmentGrade, studentTotal, assignment.gradingScale);
    var color = intervalData.color;
    var name = intervalData.name;
    var textColor = contrastTextColor(color);

    studentAssignmentScoreHTML += `<span class="studentScore" style="background-color: ${color}; color: ${textColor}; border-radius: 1em; white-space: nowrap; text-align: center; padding: 0.25em .5em; margin: 0px 4px;">`;
    studentAssignmentScoreHTML += ` ${htmlDecode(name)} ${ studentTotal % 1 != 0 ? studentTotal.toFixed(2) : studentTotal }/${htmlDecode(assignmentTotal)} ${ assignmentGrade % 1 != 0 ? assignmentGrade.toFixed(1) : assignmentGrade }%`;
    studentAssignmentScoreHTML += `</span>`;

    return studentAssignmentScoreHTML;
}

function contrastTextColor(hex) {   // Calculates a contrast number depending on the RGB values. Returns a 'black' or 'white' string based on the calculated contrast number.
    var rgbArray = hexToRGBConversion(hex);
    if (rgbArray == null) {
        return 'black';
    }

    var contrast = Math.round(rgbArray[0] * 0.299 + rgbArray[1] * 0.587 + rgbArray[2] * 0.114);
    return contrast > 150 ? 'black' : 'white';  // Color threshold: 150. The higher the threshold number a lighter color will be selected and vice versa.
}

function hexToRGBConversion(hex) {  // Given a hex string, returns an RGB array.
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); // Regex to convert hex to RGB.
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function loadAssignmentCard(containerElement, assignment, goBack)
{
    var statusClass = 'assignmentCardStatusUpcoming'
    var status = assignment.status;
    switch (status)
    {
        case "Upcoming":
            statusClass = 'assignmentCardStatusUpcoming'
            break
        case "InProgress":
            statusClass = 'assignmentCardStatusInProgress'
            if (assignment.studentAssignment)
            {
                if (assignment.studentAssignment.submitDate)
                {
                    statusClass = 'assignmentCardStatusUpcoming'
                    status = assignment.studentAssignment.visibility ? "Student Review" : "Teacher Review";
                }
                if (assignment.studentAssignment.reviewDate)
                {
                    statusClass = 'assignmentCardStatusComplete'
                    status = "Complete";
                }
            }
            break
        case "Archived":
        case "Complete":
            statusClass = 'assignmentCardStatusComplete'
            if (assignment.studentAssignment)
            {
                if (assignment.studentAssignment.submitDate)
                {
                    statusClass = 'assignmentCardStatusUpcoming'
                    status = assignment.studentAssignment.visibility ? "Student Review" : "Teacher Review";
                }
                if (assignment.studentAssignment.reviewDate)
                {
                    statusClass = 'assignmentCardStatusComplete'
                    status = "Complete";
                }
            }
            break
    }
    var canView = true;
    if (assignment.studentAssignment)
        canView = assignment.studentAssignment.visibility;
    var canViewClass = !canView && status != "Upcoming" ? "studentCannotView" : "";
    var assignmentCardHTML = '<div id="assignmentListItem_'+assignment.id+'" class="assignmentCardContainer">';
    assignmentCardHTML += ' <div class="assignmentCardTopContainer" id="assignmentCardTopContainer_'+assignment.id+'">';
    assignmentCardHTML += '     <div id="assignmentCardStatus_' + assignment.id + '" class="' + statusClass + ' ' + canViewClass + '">';
    assignmentCardHTML += '         <div class="assignmentCardStatusText">'+htmlDecode(status)+'<span><i class="fa fa-'+(canView ? "unlock" : "lock")+'" style="margin: 0 .5em;"></i></span></div>';
    assignmentCardHTML += '     </div>';
    assignmentCardHTML += '     <div class="assignmentCardTitleContainer">';
    assignmentCardHTML += '         <div style="width:100%;">';
    assignmentCardHTML += '             <div class="displayTable">';
    assignmentCardHTML += '                 <div class="displayTableCell" style="white-space:nowrap;">';
    assignmentCardHTML += '                     <span><span style="font-weight:600;">id:</span>' + assignment.id + '</span>';
    if(!assignment.studentAssignment)
        assignmentCardHTML += '                     <span class="studentCount" style="color:inherit;"><span class="fa fa-users"></span>&nbsp;<span class="">' + assignment.studentCount + '</span></span>';
    assignmentCardHTML += '                     <span style="margin:0 .25em; border-right:1px solid #cccccc;"></span>';
    assignmentCardHTML += '                 </div>'
    assignmentCardHTML += '                 <div class="displayTableCell" style="width:100%;">';
    assignmentCardHTML += '                     <span id="assignmentCardTitleText_' + assignment.id + '" class="assignmentCardTitleText">' + htmlDecode(assignment.title) + '</span>';
    if (assignment.sectionCount > 1)
        assignmentCardHTML += '                     <span style="margin-left:2em;"><span>Sequence with </span><span style="background: #ffffff; color: #333333; padding:0 .25em; border:1px solid #333333;">' + assignment.sectionCount + '</span><span> Sections</span></span>';
    assignmentCardHTML += '                 </div>';
    assignmentCardHTML += '             </div>';
    assignmentCardHTML += '         </div>';
    assignmentCardHTML += '         <div id="assignmentRemoveCell_' + assignment.id + '" style="margin-right:.5em; display:none;"></div>';
    assignmentCardHTML += '         <div id="assignmentCardDetails_' + assignment.id + '-toggler" class="expandCardIcon assignmentCardToggleContainer"><div><i class="fa fa-caret-down"></i></div></div>';
    assignmentCardHTML += '     </div>';
    assignmentCardHTML += ' </div>';
    assignmentCardHTML += ' <div id="assignmentCardDetails_' + assignment.id +'" class="assignmentCardBottomContainer" style="display:none;">';
    assignmentCardHTML += '     <div style="display: flex; justify-content: space-around; text-align: left; width: 100%;">';
    assignmentCardHTML += '         <div style="display: flex; flex-direction: column;">';
    assignmentCardHTML += '             <div><span class="h5_inlineClone">Assignment Id:</span>' + assignment.id + '</div>';
    if (assignment.studentAssignment)
    {
        if (assignment.studentAssignment.reviewDate)
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Teacher Reviewed:&nbsp;</span>' + assignment.studentAssignment.reviewDate + '</div>';
        else if (assignment.studentAssignment.submitDate)
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Student Submitted:&nbsp;</span>' + assignment.studentAssignment.submitDate + '</div>';
        else if (assignment.initiateDate)
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Assignment Started:&nbsp;</span>' + assignment.initiateDate + '</div>';
        else
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Scheduled Assignment Start:&nbsp;</span>' + assignment.startDate + '</div>';
    }
    else
    {
        if (assignment.completeDate)
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Assignment Completed:&nbsp;</span>' + assignment.completeDate + '</div>';
        else if (assignment.initiateDate)
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Assignment Started:&nbsp;</span>' + assignment.initiateDate + '</div>';
        else
            assignmentCardHTML += '             <div><span class="h5_inlineClone">Scheduled Assignment Start:&nbsp;</span>' + assignment.startDate + '</div>';
    }
    assignmentCardHTML += '         </div>';
    assignmentCardHTML += '         <div style="display: flex; flex-direction: column;">';
    assignmentCardHTML += '             <div><span class="h5_inlineClone">Class:&nbsp;</span><span>'+assignment.classNumber+'</span></div>';
    assignmentCardHTML += '             <div><span class="h5_inlineClone">Classroom:&nbsp;</span><span>' + assignment.classroomTitle + '</span></div>';
    if(!assignment.studentAssignment)
        assignmentCardHTML += '             <div><span class="h5_inlineClone">Assigned Students:&nbsp;</span><span class="studentCount"><span class="fa fa-users"></span><span class="mediumBold">&nbsp;'+assignment.studentCount+'</span></span></div>';
    assignmentCardHTML += '         </div>';
/*Manage student list through callback or other means
    assignmentCardHTML += '         <div id="studentsAssignmentSummary_39113" style="display: flex; flex-direction: column; width:50%; min-height:13.500em;">';
    assignmentCardHTML += '             <div class="classRoomPanelWrapper">';
    assignmentCardHTML += '                 <div style="height:200px; overflow-y:scroll; height:200px;">';
    assignmentCardHTML += '                     <div id="assignmentStudentsDiv_39113" class="displayTable">';
    assignmentCardHTML += '                         <div class="displayTableRow">';
    assignmentCardHTML += '                             <div class="displayTableCell studentSummaryHeader">&nbsp;</div>';
    assignmentCardHTML += '                             <div class="displayTableCell studentSummaryHeader" style="text-align:left; padding:0 .5em;">Student</div>';
    assignmentCardHTML += '                             <div class="displayTableCell studentSummaryHeader" style="text-align:left; padding:0 .5em;">Status</div>';
    assignmentCardHTML += '                             <div class="displayTableCell studentSummaryHeader">Access</div>';
    assignmentCardHTML += '                         </div>';

    assignmentCardHTML += '                         <div id="studentAssignmentSummaryDiv_29386" class="studentAssignmentSummaryDiv displayTableRow oddRow">';
    assignmentCardHTML += '                             <div class="displayTableCell iconCell" title="LoggedOff"><span class="fa fa-user"></span><span class="userLoggedOff fa fa-circle-thin"></span></div>';
    assignmentCardHTML += '                             <div class="displayTableCell iconCell studentNameCell" style="width:50%; text-align: left; padding:0 .5em;"><span>One, Student 1</span></div>';
    assignmentCardHTML += '                             <div class="displayTableCell iconCell" style="width:50%; text-align: left; text-align:left; padding:0 .5em;">';
    assignmentCardHTML += '                                 <div class="displayTable"><div class="displayTableCell" style="width:100%;">';
    assignmentCardHTML += '                                     <div class="progressPercentWrapper"><span class="progressPercentFill" style="width:0%;"><span style="white-space:nowrap;">In Progress</span></span></div>';
    assignmentCardHTML += '                                 </div>';
    assignmentCardHTML += '                             </div>';
    assignmentCardHTML += '                             <div class="displayTableCell iconCell"><i title="Visible To Student" class="fa fa-unlock"></i></div>';
    assignmentCardHTML += '                         </div>';
    assignmentCardHTML += '                     </div>';

    assignmentCardHTML += '                     <div class="boxes boxNarrowGreyBar topMarginTight"></div>';
    assignmentCardHTML += '                 </div>';
    assignmentCardHTML += '             </div>';
    assignmentCardHTML += '         </div>';
*/
    assignmentCardHTML += '     </div>';
    assignmentCardHTML += ' </div>';
    assignmentCardHTML += '</div>';
    containerElement.append(assignmentCardHTML);
    if (canView)
    {
        $("#assignmentCardTopContainer_" + assignment.id).on("click", { "assignment": assignment }, function (event)
        {
            openClassroomAssignment(event.data.assignment, goBack);
        })
    }
    $("#assignmentCardDetails_" + assignment.id + "-toggler").on("click", { "assignment": assignment }, function (event)
    {
        event.stopPropagation();
        toggleAssignmentCardDetails(event.data.assignment);
    });

    var assignmentListedEvent = $.Event("assignmentListed");
    assignmentListedEvent.assignment = assignment;
    assignmentListedEvent.assignmentListItem = $("#assignmentListItem_" + assignment.id);
    $(document).trigger(assignmentListedEvent);
}

function toggleAssignmentCardDetails(assignment)
{
    var assignmentDetailsToggler = $("#assignmentCardDetails_" + assignment.id + "-toggler");
    var assignmentCardDetails = $("#assignmentCardDetails_" + assignment.id);
    if (assignmentDetailsToggler.hasClass("expandCardIcon"))
    {
        assignmentCardDetails.slideDown(animationDuration);
        assignmentDetailsToggler.html('<div><i class="fa fa-caret-up"></i></div>');
        assignmentDetailsToggler.removeClass("expandCardIcon").addClass("collapseCardIcon");
    }
    else
    {
        assignmentCardDetails.slideUp(animationDuration);
        assignmentDetailsToggler.html('<div><i class="fa fa-caret-down"></i></div>');
        assignmentDetailsToggler.removeClass("collapseCardIcon").addClass("expandCardIcon");
    }
}

function deriveAssignmentStatus(assignmentObject, isStudentAssignment)
{
    var status;
    if (isStudentAssignment)
    {
        if (assignmentObject.initiateDate == false)
            status = "Upcoming"
        else if (assignmentObject.submitDate == false)
        {
            if (assignmentObject.pauseDate)
                status = "Paused"
            else if (assignmentObject.visibility == 0)
                status = "TeacherReview"
            else
                status = "InProgress"
        }
        else if (assignmentObject.reviewDate == false)
        {
            if(assignmentObject.visibility == 1)
                status = "StudentReview"
            else if (assignmentObject.visibility == 0)
                status = "TeacherReview"
            else if (assignmentObject.studentReviewed && assignmentObject.teacherReviewed)
                status = "Reviewed"
        }
        else if(assignmentObject.reviewDate != false)
            status = "Complete"
    }
    else
    {
        if (assignmentObject.initiateDate == false)
            status = "Upcoming";
        else if (assignmentObject.completeDate == false)
        {
            if (assignmentObject.pauseDate)
                status = "Paused"
            else
                status = "InProgress"
        }
        else
        {
            if(assignmentObject.visibility == 1)
                status = "Complete"
            else
                status = "Archived"
        }
    }
    return status
}

function openClassroomAssignment(assignment, goBack)
{
    var assignmentPath = assignment.application.rootPath + 'Assignment.aspx?assignmentId=' + assignment.id;
    if (goBack)
        assignmentPath += '&goBack=' + goBack;
    window.location.href = assignmentPath;
}

var previewIframe;
var previewIframeWindow;
var assignmentPreviewDialog;

function loadAssignmentPreviewDialog(type, objectId, previewMode)
{
    if (previewMode != true)
        previewMode = false;
    assignmentPreviewDialog = $("#assignmentPreviewDialog");
    assignmentPreviewDialog.opened = false;
    if (assignmentPreviewDialog.length <= 0)
    {
        $("#id_frameworkCol_2").append("<div id=\"assignmentPreviewDialog\" title=\"Assignment Preview\" class=\"noPermission\" style=\"display:none; overflow:auto;\"></div>");
        assignmentPreviewDialog = $("#assignmentPreviewDialog");
    }
    assignmentPreviewDialog.html("<iframe id=\"previewIframe\" style=\"width:100%;\"></iframe>");
    previewIframe = $("#previewIframe");
    previewIframe.attr("src", "AssignmentPreview.aspx?"+type+"Id="+objectId+"&previewMode="+previewMode);
    previewIframe.unbind("load");
    previewIframe.load(function ()
    {
        previewIframeWindow = previewIframe[0].contentWindow;
        previewIframeWindow.domainRootPath = domainRootPath;
//        assignmentPreviewDialog.dialog().dialog("close");
    });
    openAssignmentPreviewDialog();
}

function openAssignmentPreviewDialog()
{
    assignmentPreviewDialog = $("#assignmentPreviewDialog");

    assignmentPreviewDialog.dialog({
        autoOpen: false,
        width: "90%",
        resize: function (event, ui) { }
    });

    assignmentPreviewDialog.on( "dialogbeforeclose", function( event, ui )
    {
        //Have to replicate killMedia Here
        //using document.getElementById("previewIframe").contentWindow to reference iframe variable and function
        var currentPlayer = document.getElementById("previewIframe").contentWindow.currentPlayer;
        $(this).find("video,audio").each(function () {
            try {
                $(this)[0].player.pause();
                $(this)[0].player.setCurrentTime(0);
            }
            catch(err) {
            }
        })

        //UCAT MediaPlayer
        if (typeof (currentPlayer) != "undefined"){
            document.getElementById("previewIframe").contentWindow.ucatMediaPause(currentPlayer.id);
        }
    });

    assignmentPreviewDialog.on("dialogresize", function (event, ui)
    {
        previewIframe.contents().find("[id='contentPanel'").height(ui.size.height);
        previewIframe.height(ui.size.height);//16padding top and bottom
    });



    //The iframe content takes up the entire width and height of the dialog
    //scrolling is then disabled for the dialog and enabled on the content panel
    //all heights are needed to be calculated and set explicitly to work correctly
    assignmentPreviewDialog.on("dialogopen", function (event, ui)
    {
        var windowHeight = $(window).height();
        var windowHeightAdjusted = Math.floor(windowHeight * .9);
        assignmentPreviewDialog.opened = true;
        assignmentPreviewDialog.css({ "overflow-y": "hidden", "padding": 0 })
        assignmentPreviewDialog.dialog({ height: windowHeightAdjusted });//for some reson works after the dialog is opened
        previewIframe.contents().find("[id='contentPanel'").css({ "overflow-y": "auto", "height": assignmentPreviewDialog.height() })
        // previewIframe.height(300);
        previewIframe.height(assignmentPreviewDialog.height());
    });
    assignmentPreviewDialog.dialog("open");
}

function closeAssignmentPreviewDialog()
{
    if (typeof (assignmentPreviewDialog) == "undefined")
        assignmentPreviewDialog = $("#assignmentPreviewDialog");
    if ((assignmentPreviewDialog.length > 0) && (assignmentPreviewDialog.opened))
    {
        assignmentPreviewDialog.dialog("close");
        assignmentPreviewDialog.opened = false;
    }
}

//END TEMPORARY ASSIGNMENT CODE


/*--------------CUSTOM DIALOG---------------*/
var module = false;//required variable to setup media when a module is loaded.
//In student view the ancillary div is part of the DOM but in workspaces it has to be appended to the framework.
var ancillary = false;

if($("#ancillary").length == 0){
    $('body').append('<div id="ancillary"></div>')
    ancillary = $("#ancillary");
} else {
    ancillary = $("#ancillary");
}

var tempDiv = false;
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

    $('body').append('<div id="tempDiv"></div>');
    tempDiv = $("#tempDiv");
    tempDiv.html(customDialogHTML);
    
    var dialogContentElement = $("#ucatDialogContent");
    dialogContentElement.append(content);

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
    
    tempDiv.show();
    var ucatDialog;
    var dialogJqElement = $(".ucatDialog");
    var dialogTitleJqElement = $(".ucatDialogTitle");
    var dialogContentJqElement = $("#ucatDialogContent");

    adjustDialogContentSize = function() {
        var adjustedDialogHeight = (dialogJqElement.height() - dialogTitleJqElement.height() - 20) + "px";
        dialogContentJqElement.css("height", adjustedDialogHeight);
    }

    ucatDialogClose = function() {
        tempDiv.hide();
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
        tempDiv.hide();
        var dialogJqElement = $(".ucatDialog");
        dialogJqElement.hide();
        killMedia(dialogJqElement);
    }
}

/*--------------End CUSTOM DIALOG-----------*/



function cleanString(str) 
{
    str = stripRTLDiv(htmlDecode(str)).text;
	var cleanupPatterns = [
		[/[\s\u00A0]{2,}/gi, " "], //  removes extra spaces(&nbsp;)
		[/([\u0648]) */gi, "$1"],  // eliminates spaces after the Arabic و; students and native speakers mistakenly add space
/*
    0000-001F = Controls
    0021-002F & 003A & 003F = standard latin punctuation
    005B-0060 = ASCII punctuation
    007B-007E = ASCII punctuation & symbols
    0080-00B4 & 00B6-00BF = C1 Controls & Latin 1 Supplement: spaces, symbols and other latin punctuation
    060C = Arabic comma
    061B-061F = Arabic punctuation
    2000-206F = General Punctuation
    3001-303F = CJK Symbols & Punctuation
    A700-A71F = Modifier Tone Letters (includes some punctuation)
    FD3E-FD3F = Arabic ornate parentheses
    FE10-FE6F & FF01-FF02 & FF07-FF09 & FF0C-FF0E & FF1A-FF1B & FF1F = Presentation punctuation and different sizes of punctuation (e.g. - MS Word punctuation)

*/
        [/[\u0000-\u001F\u0021-\u002F\u003A-\u003F\u005B-\u0060\u007B-\u007F\u0080-\u00B4\u00B6-\u00BF\u060C\u061B-\u061F\u2000-\u206F\u3001-\u303F\uA700-\uA71F\uFD3E\uFD3F\uFE10-\uFE6F\uFF01\uFF02\uFF07-\uFF09\uFF0C-\uFF0E\uFF1A\uFF1B\uFF1F]/gi, ""]
	];

	var cleanString = str;
    if (typeof (cleanString) == "string") 
    {
	    if (cleanString.length == 0)
	        return cleanString;
        for (var i = 0; i < cleanupPatterns.length; i++) 
        {
			cleanString = cleanString.replace( cleanupPatterns[i][0], cleanupPatterns[i][1] ).trim();
		}
	}
    else 
    {
		alert( "Error in cleanString" );
	}
	return cleanString;
}

function stripRTLDiv( obj ) {
	var output = {};
	var wrapper = $("<div>" + obj + "</div>");
	output.text = wrapper.text().length > 0 ? wrapper.text() : obj;
	output.rtl = wrapper.children(":first").attr("dir") == "rtl" ? true : false;

	return output 
}

function htmlEncode(value) {
    return ((value) ? $("<div/>").text(value).html() : "");
}

/*
function htmlDecode(value, textarea) 
{
    value = ((value) ? $("<div/>").html(value).text() : "");
    if (textarea) 
    {
        value = value.replace(/<br>/,"\n");
    }
    return value;
}
*/

function htmlDecode(value, replaceNewLines)
{
    var txt = document.createElement("textarea");
    txt.innerHTML = value;
    var decoded = txt.value;
    if (replaceNewLines)
    {
        decoded = decoded.replace(/<br>/g, "\n");
    }
    return decoded;
}


function getQuerystringParameter(key)
{
    key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var values = regex.exec(window.location.search);
    if(values == null)
        return "";
    else
        return decodeURIComponent(values[1].replace(/\+/g," "));
}

function shuffle(arr, passByValue)
{
    var temp, current, top = arr.length;
    var copy = new Array();
    for(var i=0; i<top; i++)
        copy.push(arr[i]);
    if(top)
    {
        while(--top)
        {
            current = Math.floor(Math.random() * (top + 1));
            if(passByValue)
            {
                temp = copy[current];
                copy[current] = copy[top];
                copy[top] = temp;
            }
            else
            {
                temp = arr[current];
                arr[current] = arr[top];
                arr[top] = temp;
            }
        }
    }
    if(passByValue)
        return copy;
    return arr;
}

function sortJSON(field, reverse, primer)
{
    var key = function(x){return primer ? primer(x[field]) : x[field]};
    return function(a,b)
    {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];
    }
}

function swapStyleSheet(newPath)
{
    if(newPath.length > 0)
    {
        $("link").each(function()
        {
            var link = $(this);
            if((link.attr("title") == "themeStyleSheet")&&(link.attr("href") != newPath))
                link.attr("href", newPath);
        });
    }
}

function formatDateString(dateStr, showTime)
{
    var dateObj = new Date(dateStr);
    var amPm = "";
    var hour = dateObj.getHours();
    var minute = dateObj.getMinutes();
    if(hour < 12)
        amPm = "AM";
    else
        amPm = "PM";
    if(hour == 0)
        hour = 12;
    if(hour > 12)
        hour = hour-12;
    if(minute < 10)
        minute = "0"+minute;
    var dateString = monthStrings[dateObj.getMonth()]+" "+dateObj.getDate()+" "+dateObj.getFullYear();
    if(showTime)
        dateString += " "+hour+":"+minute+" "+amPm;
    return dateString;
}

function cleanupContent(value)
{
    var htmlValue = $("<div>"+value+"</div>");
    htmlValue.find('script').remove();
    return htmlValue.html();
}

function truncateString(str, len)
{
    if(str.length > len)
        return str.subString(0,len)+"&hellip;";
    return str;
}

function spf(s, t) {
    var n = 0
    function F() {
        return t[n++]
    }
    return s.replace(/~/g, F)
}

function getStructure() {
  var s = this.getStructure.caller.toString()

  return s.substring( s.indexOf('/*')+4, s.indexOf('*/') )
}

function arrayContains(arr, obj)
{
    var i = arr.length;
    while(i--)
    {
        if(arr[i] == obj)
            return true;
    }
    return false;
}

function formatThousandSeperator(x)
{
    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}

$.fn.extend(
{
    slideRight:function(duration, complete)
    {
        return this.each(function()
        {
            $(this).animate({width:"show"}, duration, complete);
        });
    },
    slideLeft:function(duration, complete)
    {
        return this.each(function()
        {
            $(this).animate({width:"hide"}, duration, complete);
        });
    },
    slideToggleWidth:function(duration, complete)
    {
        return this.each(function()
        {
            var el = $(this);
            if(el.css("display") == "none")
                el.slideRight(duration, complete);
            else
                el.slideLeft(duration, complete);
        });
    }
});

(function($)
{
    $.fn.inPlaceEditor = function(options)
    {
        var editorContainer, editorTB, editorRtlToggler, editorCancelBtn, editorSubmitBtn;
        var element = $(this);
        element.data("originalValue", element.text());
        var settings = $.extend(
        {
            allowEmptyString:false,
            applyClass:true,
            columns:0,
            data:[],
            elementId:element.attr("id"),
            fullWidth:true,
            initValue: false,
            initFocused: false,
            maxValue: false,
            htmlMarkupValue: true,
            submitOnBlur:false,
            onSubmit:function(value, element){},
            password:false,
            replaceContentOnSubmit:true,
            rows:1,
            rtl:false,
            rtlToggle:false,
            stopPropagation:false
        }, options);
        if(typeof(settings.applyClass) == "boolean")
        {
            if(settings.applyClass == true)
                element.addClass("editable");
        }
        else if(typeof(settings.applyClass) == "string")
        {
            if(settings.applyClass.length > 0)
                element.addClass(settings.applyClass);
        }
        function setAutoComplete()
        {
            if(settings.data.length > 0)
            {
                editorTB.autocomplete({source:settings.data, minLength:3});
            }
        }
        function submitEditor(leaveOpen)
        {
            var value = editorTB.val();
            value = cleanupContent(value);
            if (!settings.allowEmptyString && value.length <= 0)
            {
                if(!leaveOpen)
                    closeEditor();
            }
            else
            {
                if((settings.rtl)&&(settings.htmlMarkupValue))
                {
                    value = "<div dir=\"rtl\">"+value+"</div>";
                }
                if(settings.replaceContentOnSubmit)
                {
                    element.html(value);
                    editorTB.val(value);
                }
                var tbContainer = $("#"+element.attr("id")+"TBContainer");
				tbContainer.css("border-color", "#00ff00");
                tbContainer.children("span").each(function()
                {
                    //$(this).hide();
                });
                var keyupIcon = $("#"+element.attr("id")+"TBKeyupIcon");
                keyupIcon.css("color", "#00ff00");
                keyupIcon.css("font-size","1.200em");
                keyupIcon.show();
                settings.onSubmit(value, element);
                if(!leaveOpen)
                    closeEditor();
            }
        }

        function closeEditor()
        {
			editorContainer.hide();
            element.show();
            editorContainer.remove();
        }

        function toggleRTL()
        {
            settings.rtl = !settings.rtl;
            var rtlIconClass = settings.rtl ? toggleRtlIcon : toggleLtrIcon;
            editorRtlToggler.attr("class", ""+rtlIconClass+" btnGrey");
            //$("#"+element.attr("id")+"TBRtlToggler span").html(settings.rtl ? "RTL" : "LTR");

            editorTB.attr("dir", (settings.rtl  ? "rtl" : "ltr"));
            editorTB.css("text-align", (settings.rtl ? "right" : "left"));
        }
        element.click(function()
        {           
			closeAllInPlaceEditorInstances( this.id )
			
			editorContainer = $("#"+element.attr("id")+"-editorContainer");
            editorTB = $("#"+element.attr("id")+"TB");
            var float = element.css("float");
            if(float == "none")
                float = "left";
            if(editorContainer.length <= 0)
            {
                editorContainer = $("<div id=\""+element.attr("id")+"-editorContainer\" class=\"editorContainer\"><table id=\""+element.attr("id")+"TBContainer\" class=\"inPlaceEditorTBContainer\"><tr id=\""+element.attr("id")+"TBContainerRow\"></tr></table></div>");
                if(settings.password)
                {
                    editorTBHTML = "<input id=\""+element.attr("id")+"TB\" type=\"password\" style=\"width:100%; border:0px;\"/>";
                }
                else if(settings.rows == 1)
                {
                    editorTBHTML = "<input id=\""+element.attr("id")+"TB\" type=\"text\" style=\"width:100%; border:0px;\"/>";
                }
                else
                {
                    editorTBHTML = "<textarea id=\""+element.attr("id")+"TB\" style=\"width:100%; border:0px;\"></textarea>";
                }                
                editorContainer.hide();
                element.after(editorContainer);
                var tbContainerRow = $("#"+element.attr("id")+"TBContainerRow");
                if(float == "left")
                {
                    tbContainerRow.append("<td style=\"width:100%; vertical-align:middle;\">"+editorTBHTML+"</td>");
                    tbContainerRow.append("<td style=\"width:1.2em; vertical-align:middle;\"><span style=\"line-height:1.5em; font-size: 1.200em; display:none;\" class=\"tTipNoHighlight\" title=\"\" data-info=\"<ul><li>Enter/Return to Save Changes</li><li>Esc to Cancel Changes</li></ul>\">&crarr;</span></td>");
                    tbContainerRow.append("<td style=\"width:1.2em; vertical-align:middle;\"><span id=\""+element.attr("id")+"TBKeyupIcon\" style=\"line-height:1.5em; display:none;\" class=\"tTipNoHighlight fa fa-keyboard-o\" title=\"\" data-info=\"<ul><li>Enter/Return to Save Changes</li><li>Esc to Cancel Changes</li></ul>\"></span></td>");
                }
                else
                {
                    tbContainerRow.append("<td style=\"width:1.2em; vertical-align:middle;\"><span id=\""+element.attr("id")+"TBKeyupIcon\" style=\"line-height:1.5em; display:none;\" class=\"tTipNoHighlight fa fa-keyboard-o\" title=\"\" data-info=\"<ul><li>Enter/Return to Save Changes</li><li>Esc to Cancel Changes</li></ul>\"></span></td>");
                    tbContainerRow.append("<td style=\"width:1.2em; vertical-align:middle;\"><span style=\"line-height:1.5em; font-size: 1.200em; display:none;\" class=\"tTipNoHighlight\" title=\"\" data-info=\"<ul><li>Enter/Return to Save Changes</li><li>Esc to Cancel Changes</li></ul>\">&crarr;</span></td>");
                    tbContainerRow.append("<td style=\"width:100%; vertical-align:middle;\">"+editorTBHTML+"</td>");
                }
                editorTB = $("#" + element.attr("id") + "TB");
                if(settings.initValue)
                {
                    editorTB.val(settings.initValue);
                }
                else if(settings.password||(settings.initValue===""))
                {
                    editorTB.val("");
                }
                else
                {
                    var contents = element.html();
                    var elementContentDiv = element.find("[dir='rtl']").first();
                    var elementRTL = false;
                    var contentRTL = false;
                    if ((typeof (element.attr("dir")) != "undefined") && (element.attr("dir") == "rtl"))
                        elementRTL = true;
                    if(elementContentDiv.length > 0)
                    {
                        settings.rtl = true;
                        contentRTL = true;
                        contents = elementContentDiv.html();
                    }
                    else
                        settings.rtl = elementRTL;
                    if (contentRTL)
                        settings.htmlMarkupValue = true;
                    editorTB.val(htmlDecode(contents));
                }
                if(settings.rtlToggle)
                {
                    var rtlIconClass = settings.rtl ? toggleRtlIcon : toggleLtrIcon;
                    tbContainerRow.append("<td vertical-align:middle;><span id=\""+element.attr("id")+"TBRtlToggler\" class=\""+rtlIconClass+" btnGrey\" style=\"font-size:0.95em;\"></span></td>");
                    editorRtlToggler = $("#"+element.attr("id")+"TBRtlToggler");

                    editorRtlToggler.click(function()
                    {
                        var keyupIcon = $("#"+element.attr("id")+"TBKeyupIcon");
                        keyupIcon.css("font-size","1.200em");
                        var tbContainer = $("#"+element.attr("id")+"TBContainer");
                        tbContainer.css("border-color", "#ff0000");
                        tbContainer.find(".tTipNoHighlight").each(function()
                        {
                            $(this).css("color", "#ff0000").show();
                        });
                        toggleRTL();
                        if (settings.submitOnBlur)
                        {
                            submitEditor(true);
                        }
                        editorTB.focus();
                    });
                }
            }
            if(settings.rtl)
            {
                editorTB.attr("dir", "rtl");
                editorTB.css("text-align", "right");
            }
            if (settings.submitOnBlur)
            {
                editorTB.blur(function (event)
                {
                    submitEditor(true);
                });
            }
            if (settings.initFocused)
            {
                editorTB.focus();
                editorTB.select();
            }
            editorTB.keypress(function (event)
            {
                if((event.keyCode == 13) && settings.stopPropagation)
                {
                    event.preventDefault();
                    event.stopPropagation();
                }
            });
            editorTB.keyup(function(event)
            {
                if (settings.maxValue)
                {
                    var editorValue = parseInt(editorTB.val());
                    if (editorValue > settings.maxValue)
                        editorTB.val(settings.maxValue)
                    if (editorValue < 0)
                        editorTB.val(0);
                }
                if(settings.stopPropagation)
                {
                    event.preventDefault();
                    event.stopPropagation();
                }
                if(keyPressIsEnter(event))
                {
                    if(settings.rows == 1)
                    {
                        submitEditor();
                    }
                }
                else if(keyPressIsEscape(event))
                {
                    closeEditor();
                }
                else
                {
                    var keyupIcon = $("#"+element.attr("id")+"TBKeyupIcon");
                    keyupIcon.css("font-size","1.200em");
                    var tbContainer = $("#"+element.attr("id")+"TBContainer");
                    tbContainer.css("border-color", "#ff0000");
                    tbContainer.find(".tTipNoHighlight").each(function()
                    {
                        $(this).css("color", "#ff0000").show();
                    });
                }
            });
            element.hide();
            setAutoComplete();
            editorContainer.show();
            editorTB.focus();
            if(settings.stopPropagation)
                event.stopPropagation();
        });
    };
})(jQuery);

(function($)
{
    function Tagify(el, options)
    {
        this.nextTagId = 0;
        this.element = $(el);
        this.tagContainerDiv=false;
        this.tagClearingDiv=false;
        this.tagContainerDivtagInputDiv=false;
        this.tagInput=false;
        this.options = $.extend(
        {
            animationTime:0,
            data:[],
            prepopulateData:[],
            onAdd:function(value){return true;},
            onRemove:function(value){}
        }, options);
		this.initialize();
    }

    $.fn.tagify = function(options)
    {
		var control = new Tagify(this.get(0), options);
        return control;
    };

    Tagify.prototype =
    {
        initialize:function()
        {
            var me = this;
            var baseId = me.element.attr("id");
            var tagifyHTML = "<ul id=\""+baseId+"_TagContainerDiv\" class=\"tags tagContainerDiv\">";
            tagifyHTML += "    <div id=\""+baseId+"_TagClearingDiv\" style=\"clear:both;\"></div>";
            tagifyHTML += "</ul>";
            tagifyHTML += "<div id=\""+baseId+"_TagInputDiv\" class=\"tagInputDiv\">";
            tagifyHTML += "<input id=\""+baseId+"_TagInput\" type=\"text\"/>";
            tagifyHTML += "</div>";

            me.element.html(tagifyHTML);
            me.tagContainerDiv = $("#"+baseId+"_TagContainerDiv");
            me.tagClearingDiv = $("#"+baseId+"_TagClearingDiv");
            me.tagInputDiv = $("#"+baseId+"_TagInputDiv");
            me.tagInput = $("#"+baseId+"_TagInput");
            me.tagInput.keyup(function(event)
            {
                if(keyPressIsEnter(event))
                {
                    event.preventDefault();
                    var value = $(this).val();
                    me.selectFunction(event, value);
                }
            });
            for(var i=0; i<me.options.prepopulateData.length; i++)
            {
                me.addTag(me.options.prepopulateData[i]);
            }
            this.setAutoComplete();
        },
        addTag:function(value)
        {
            var me = this;
            var baseId = me.element.attr("id");
            var isDuplicate = false;
            this.tagContainerDiv.find(".tagTitleSpan").each(function()
            {
                if($(this).html() == value)
                    isDuplicate = true;
            });
            if(!isDuplicate)
            {
                var me = this;
                var tagId = me.nextTagId++;
                var newTagHTML = "<li id=\""+baseId+"_tagSpan_"+tagId+"\"><div class=\"tagDiv\"><span id=\""+baseId+"_tagTitleSpan_"+tagId+"\" class=\"tagTitleSpan\">"+value+"</span><a id=\""+baseId+"_removeTagLink_"+tagId+"\" class=\"tagRemoveLink\">&#10005;</a></div></li>";


                var newTag = $(newTagHTML);
                newTag.hide();
                me.tagClearingDiv.before(newTag);
                var removeTagLink = $("#"+baseId+"_removeTagLink_"+tagId);
                removeTagLink.click(function()
                {
                    me.removeFunction(tagId, $("#"+baseId+"_tagTitleSpan_"+tagId).html());
                });
                me.tagInput.val("");
                newTag.fadeIn(me.options.animationTime);
                me.removeDataItem(value);
                me.setAutoComplete();
            }
        },
        selectFunction:function(event, value)
        {
            event.preventDefault();
            var me = this;
            var success = this.options.onAdd(value);
            if(success && success.promise)
            {
                success.promise().done(function()
                {
                    me.addTag(value);
                });
            }
            else if(success)
                me.addTag(value);
        },
        removeFunction:function(tagId, value)
        {
            var me = this;
            var success = this.options.onRemove(value);
            if(success && success.promise)
            {
                success.promise().done(function()
                {
                    me.removeTag(tagId);
                });
            }
            else if(success)
                me.removeTag(tagId);
        },
        getValue:function()
        {
            var me = this;
            var values = new Array();
            me.tagContainerDiv.find(".tagTitleSpan").each(function()
            {
                values.push($(this).html());            
            });
            values.push(me.tagInput.val());
            return values.join(',');
        },
        addDataItem:function(value)
        {
            this.options.data.push(value);
            this.options.data.sort();
        },
        removeDataItem:function(value)
        {
            for(var i=0; i<this.options.data.length; i++)
            {
                if(this.options.data[i] == value)
                    this.options.data.splice(i,1);
            }
        },
        removeTag:function(tagId)
        {
            var me = this;
            var baseId = me.element.attr("id");
            var tagSpan = me.tagContainerDiv.find("#"+baseId+"_tagSpan_"+tagId);
            var tagTitle = me.tagContainerDiv.find("#"+baseId+"_tagTitleSpan_"+tagId).html();
            tagSpan.fadeOut(me.options.animationTime, function(){$(this).remove();});
            me.addDataItem(tagTitle);
            me.setAutoComplete();
        },
        setAutoComplete:function()
        {
            var me = this;
            me.tagInput.autocomplete({
                position: {
                    my: "left bottom",
                    at: "left top"
                },
                triggerSelectOnValidInput: false,
                source:me.options.data, minLength:3});
        }
    };
})(jQuery);

(function($)
{
    $.fn.getHiddenDimensions = function(includeMargin)
    {
        var item = $(this),
            props = {position: "absolute", visibility: "hidden", display : "block"},
            dim = {width:0, height:0, innerWidth:0, innerHeight:0, outerWidth: 0},
            hiddenParents = item.parents().andSelf().not(":visible"),
            includeMargin = (includeMargin == null) ? false : includeMargin;

        var oldProps = [];
        hiddenParents.each(function()
        {
            var old = {};
            for(var name in props)
            {
                old[name] = this.style[name];
                this.style[name] = props[name];
            }
            oldProps.push(old);
        });

        dim.width = item.width();
        dim.outerWidth = item.outerWidth(includeMargin);
        dim.innerWidth = item.innerWidth();
        dim.height = item.height();
        dim.innerHeight = item.innerHeight();
        dim.outerHeight = item.outerHeight(includeMargin);

        hiddenParents.each(function(i)
        {
            var old = oldProps[i];
            for(var name in props)
            {
                this.style[name] = old[name];
            }
        });

        return dim;
    }
}(jQuery));

(function ($) {
  $.each(['show', 'hide'], function (i, ev) {
    var el = $.fn[ev];
    $.fn[ev] = function () {
      this.trigger(ev);
      return el.apply(this, arguments);
    };
  });
})(jQuery);

//Get pixel size using em
function em(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (emSize * input);
}

//Get em size using pixel
function px(input) {
    var emSize = parseFloat($("body").css("font-size"));
    return (input / emSize);
}

//Swap Two Elements in the DOM
function swapElements(elm1, elm2)
{
    var parent1, next1,
        parent2, next2;
    parent1 = elm1.parentNode;
    next1   = elm1.nextSibling;
    parent2 = elm2.parentNode;
    next2   = elm2.nextSibling;

    parent1.insertBefore(elm2, next1);
    parent2.insertBefore(elm1, next2);
}

function addLanguageFontClass( containerElement, langObj, index ) {
    var update = false;
    if (containerElement.find("#id_langStyle")) {
        containerElement.find("#id_langStyle").remove();
    }
    var languageFontStyle = $("<style id=\"id_langStyle\" type=\"text/css\"></style>");
    for (var i = index ? index : 0; i < langObj.length; i++) {
        if (langObj[i].font.length > 0) {
            update = true
            if (langObj[i].rtl) {
                if (langObj[i].title.toLowerCase() == "urdu")
                    languageFontStyle.append("." + langObj[i].title.toLowerCase() + ",\r*[dir='rtl'] *[lang='" + langObj[i].shortTitle.toLowerCase() + "'] {font-family: " + langObj[i].font + "; line-height: 1.8em;}");
                else
                    languageFontStyle.append("." + langObj[i].title.toLowerCase() + ",\r*[dir='rtl'] *[lang='" + langObj[i].shortTitle.toLowerCase() + "'] {font-family: " + langObj[i].font + ";}");
            }
            else {
                languageFontStyle.append("." + langObj[i].title.toLowerCase() + ",\r*[lang='" + langObj[i].shortTitle.toLowerCase() + "'] {font-family: " + langObj[i].font + ";}");
            }
            if (index)
                break;
        }
    }
    if (update)
       containerElement.append( languageFontStyle );
}

// Start "Language Detection Experiment" - should be a separate .js file

/* East Asian (CJK) */
cjkSet = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9faf]/; // Common characters for Chinese & Japanese; cannot isolate one or the other (Japanese can be confirmed by JapaneseSubSet)
var koreanSet = /[\uAC00-\uD7AF]/; // detects presence of Hangul - reliability - 90% for Korean (1000s of permutations of the 24 phonetic characters)
var japaneseSubSet = /[\u3040-\u309F\u30A0-\u30FF]/; // detects presence of Hiragana and/or Katakana - confirms language as Japanese if present w/Chinese characters (Kanji)

/* Middle Eastern Languages */
var arabicSet = /[\u0600-\u06FF]/; // detects presence of arabic script, which is used in many middle eastern and central asian languages (arabic, persian, pashto, urdu, etc.)
var pashtoSubSet = /[\u0659\u0681\u0685\u0689\u0693\u0696\u067c\u069a\u06ab\u06bc\u06cd\u06d0]/; //isolates Pashto from ArabicSet - reliability unknown
var persianUrduSubSet = /[\u0657\u0658\u0679\u0688\u0691\u06af\u06ba\u06c1\u06c2\u06c3\u06d2\u06d3\u06d4]/; // isolates Persian, Urdu and other languages that use a few unique letter from ArabicSet - reliability not fully tested
var persianSubSet = /[\u06cc\u063e\u063f]/;

var hebrewSet = /[\u0590-\u05ff]/; // detects presence of Hebrew - reliability - 90%

/* Central Asian Languages */
var devanagariSet = /[\u0900-\u097F]/; // detects presence of devanagari (hindi)

var cyrillicSet = /[\u0400-\u04ff]/;
var russianSubSet = /[\u0419\u0429-\u042F\u0439\u0447-\u044f]/; // Russian letters
var serbianSubSet = /[\u0402\u0408\u0409\u040A\u040B\u040F\u0452\u0458\u0459\u045a\u045b\u045f]/; // Will only isolate Serbian for words with the unique characters present - most word will pass for simply Russian

/*
    ----------- Currently Not Used - Isolating subsets is not reliable ---------------
var latinSet = /[\u0041-\u007a\u00a1-\u00ff\u0100-\u017f\u0180-\u024f]/;
var croatianSubSet = /[\u0106\u0107\u010c\u010d\u0110\u0111\u0160\u0161\u017d\u017e\u01c7\u01c9\u01ca\u01cc\u01c4\u01c6]/; // doesn't work
var frenchSubSet =/[\u0152\u0153\u0178\u00c0\u00c2\u00c6-\u00cb\u00ce\u00cf\u00d4\u00d9\u00db\u00dc\u00e0\u00e2\u00e6-\u00eb\u00ee\u00ef\u00f4\u00f9\u00fb\u00fc\u00ff]/;
var germanSubSet =/[\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]/;
var spanishSubSet = /[\u00c1\u00c9\u00cd\u00d1\u00d3\u00da\u00dc\u00e1\u00e9\u00ed\u00f1\u00f3\u00fa\u00fc\u00a1\u00aa\u00ba\u00bf]/;
var turkishSubSet =/[\u00c7\u00d6\u00dc\u00e7\u00f6\u00fc\u011e\u011f\u0130\u0131\u015e\u015f]/;
*/

/* ----------- Component Configuration by Language -------------- */
function moduleLanguageExists(lang) {
    var moduleLangInfo = {};
    moduleLangInfo.isPresent = false;
    moduleLangInfo.font = "";
    var langs = typeof module == "undefined" ? ((userModule && userModule.module) ? userModule.module.languages : []) : module.languages;
    for (var k = 0; k < langs.length; k++)
        if (langs[k].title.toLowerCase() == lang.toLowerCase()) {
            moduleLangInfo.isPresent = true;
            moduleLangInfo.font = langs[k].font.length > 0 ? langs[k].font : "";
            moduleLangInfo.subTag = langs[k].shortTitle.length > 0 ? langs[k].shortTitle : "";
        }

    return moduleLangInfo
}

function identifyLanguageByUnicode(txtString) {
    /* Project Languages for DLIFLC: Arabic (MSA, Egyptian, Sudanese), Chinese, Hindi, Iraqi, Korean, Pashto, Persian-Farsi, Russian, Urdu */
    /* langTestArray and subsets can be reconfigured as required; Unicode sets can also be refined for greater reliability */
    var langTestArray = [
        [arabicSet, "Arabic", [[pashtoSubSet, "Pashto"], [persianUrduSubSet, "Urdu"]]],
        [cjkSet, "Chinese", [[japaneseSubSet, "Japanese"]]],
        [cyrillicSet, "Cyrillic", [[russianSubSet, "Russian"], [serbianSubSet, "Serbian"]]],
        [devanagariSet, "Hindi"],
        [hebrewSet, "Hebrew"],
        [koreanSet, "Korean"]]
    var theLang = "latinBase";

    for (var i = 0; i < langTestArray.length; i++) {
        if (langTestArray[i][0].test(txtString)) {
            theLang = langTestArray[i][1];
            if (langTestArray[i][2] && langTestArray[i][2].length > 0) {
                var isolatedLang = { lang: "", conf: 0 };
                for (var j = 0, subSets = langTestArray[i][2]; j < subSets.length; j++) {
                    if (subSets[j][0].test(txtString)) {
                        if (isolatedLang.conf == 0) {
                            isolatedLang.lang = subSets[j][1];
                            isolatedLang.conf++
                        }
                        else {
                            isolatedLang.lang = "";
                        }
                    }
                }
                theLang = isolatedLang.lang.length > 0 ? isolatedLang.lang : langTestArray[i][1];
                break;
            }
        }
    }
    return theLang
}

function getLanguageInfo(txtString) {
    var wideChar = ["chinese", "japanese", "korean"];
    var RTL = ["arabic", "hebrew", "urdu", "pashto", "persian"];
    var smallChar = ["arabic", "pashto", "persian"]

    var responseItem = {};
    responseItem.string = txtString;
    responseItem.lang = identifyLanguageByUnicode(txtString);
    var moduleLangInfo = moduleLanguageExists(responseItem.lang);
    responseItem.isPresent = moduleLangInfo.isPresent;  // can add to reliability 
    responseItem.font = moduleLangInfo.font;
    responseItem.subTag = moduleLangInfo.subTag;
    responseItem.wideChar = wideChar.indexOf(responseItem.lang.toLowerCase()) >= 0 ? true : false;  // Currently used for CJK, but might have wider implication
    responseItem.RTL = RTL.indexOf(responseItem.lang.toLowerCase()) >= 0 ? true : false;
    responseItem.smallChar = smallChar.indexOf(responseItem.lang.toLowerCase()) >= 0 ? true : false;  // Used to better manage generic font-size bump currently tied to RTL languages 

    return responseItem
}

// End "Language Detection Experiment" - BL


function getSMEmode(){
    var smeMode = userModule ? true : false;//if getLocalUserModuleObject function exists then this is SME mode.

    return smeMode
}

$(document).bind('mobileinit',function(){
    $.mobile.changePage.defaults.changeHash = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;
});

//Check to see if the element is visible in the viewport;
function isElementInViewport(el) {

    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
}

function addContextualHelp( containerElementId, helpDescription, insertLocation, autoDisplay) {
    //If the contextual help is already created, remove it so that a new one can be populated as needed
    if($('#'+containerElementId+'_helpContainer').length > 0){
        $('#'+containerElementId+'_helpContainer').remove();
    }

    //adds a help toggle button before or after the containerElementId
    var helpHTML = '<div id="'+containerElementId+'_helpContainer"><div class="displayTable">';
    //toggle ICON
    //Details
    helpHTML += '<div class="displayTableCell" style="width:100%;">'
    var showHelp = autoDisplay ? '' : 'display:none;';
    helpHTML += '<div id="'+containerElementId+'_helpDetails"  style="'+showHelp+' font-weight: normal; background: #ecf2ff; color:#333333; border:1px solid #3a78ff;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px; padding:.5em;">';
    helpHTML += helpDescription
    helpHTML += '</div>';
    helpHTML += '</div>';
    var showHelpToggle = autoDisplay ? 'collapseHelpIcon' : 'expandHelpIcon';
    helpHTML += '<div id="'+containerElementId+'_helpDetails-toggle" class="displayTableCell iconCell '+showHelpToggle+'" style="height: auto; vertical-align: top;color:#6495ff;" onclick="toggleHelpDetails(this.id)"><div class="displayTable" style="text-align:center;margin-left:.5em; width:1em; height:1em; background:#6495ff; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"><i style="font-size: .75em; color:#ffffff;" class="displayTableCell fa fa-question"></i></div></div>';

    helpHTML += '</div></div>';
    var containerElement = $("#"+containerElementId);
    switch (insertLocation){
    	case "before":
	        containerElement.before(helpHTML)
    	break
    	case "after":
	        containerElement.after(helpHTML)
	    break
    	case "prepend":
	        containerElement.prepend(helpHTML)
        break
        case "append":
            containerElement.append(helpHTML)
            break
        case "html":
            containerElement.html(helpHTML)
            break
    }
}

//Borrowed code from toggleDetails function
function toggleHelpDetails(togglerId, callbackFunction, paramArray) {
	/* toggler and detailsContainer id's must match; toggler id simply uses the "-toggler" affix */
	var detailsContainer = $("#"+ togglerId.split("-") ) 
    var togglerIconContainer = $("#"+togglerId);
	var isClosed = togglerIconContainer.hasClass("expandHelpIcon");

    if( isClosed ) {
		detailsContainer.slideDown(animationDuration, function(){
            if(callbackFunction)
                callbackFunction(paramArray.join())
        });
	}
	else {
        detailsContainer.slideUp(animationDuration, function(){
            if(callbackFunction)
                callbackFunction(paramArray.join())
        });
	}
	togglerIconContainer.removeClass(isClosed ? "expandHelpIcon" : "collapseHelpIcon").removeClass(isClosed ? "" : "backHelpIcon").addClass(isClosed ? "collapseHelpIcon" : "expandHelpIcon");
}

function closeAllInPlaceEditorInstances(currentEditor) {
	$(document).find('[id*="-editorContainer"]').each( function() {
		if($(this).attr("id").split("-")[0] != currentEditor ) {
			$(this).hide().remove()
			$("#"+$(this).attr("id").split("-")[0]).show();
		}
	});
}

var dialogCustomClassesObj = {"warningDialog":"warningDialogContainer", "successDialog":"successDialogContainer","testDialog":"testClass"}//optional dialogType Parameter will add css classes to the dialog

function customConfirm(message, yesCallback, noCallback, dialogType) {
    $('.title').html(message);
    if( $("#id_modal_dialog").length == 0 ){
	    var modal_dialog = $(document.createElement('div') ).attr("id","id_modal_dialog");
	    modal_dialog.html(message)

        var customClasses = "";
        if(dialogType){
            customClasses = dialogCustomClassesObj[dialogType];
        }

	    modal_dialog.dialog({
    	    closeOnEscape: false,
		    open: function(event, ui) {
		    	$(this).parent().find(".ui-dialog-titlebar-close").each(function(){
		    		$(this).hide()
		    	})
		    },
	    	title: "Warning!",
	    	resizable: false,
	    	height: "auto",
	    	width: 400,
            modal: true,
            dialogClass: customClasses,
	    	buttons: {
	    		"Yes": function() {
					$( this ).dialog( "close" );
					$( this ).dialog( "destroy" )
					yesCallback();
					$("#id_modal_dialog").remove();
    			},
    			"No": function() {
    				$( this ).dialog( "close" );
    				$( this ).dialog( "destroy" )
                    if(typeof(noCallback) == "function")
    				    noCallback();
    				$("#id_modal_dialog").remove();
				}
			}
	    });
	}
}

function killMedia(containerElement) {
    //UCAT MediaPlayer
    if (typeof (currentPlayer) != "undefined"){
        if(!lockoutMedia){
            ucatMediaPause(currentPlayer.id);
        } else {
            lockoutMedia = false;
            endPlayinterval(currentPlayer.id);
            currentPlayer.mediaTag.currentTime = 0;//Resets the time to zero since navigation counts as an end event if limit plays.
            currentPlayer.mediaTag.pause();
        }
    }

    //Leaving this legacy potion until ucatMediaPlayer is fully integrated into the workspace
    //Not sure if its called by media browser and resources
    containerElement.find("video,audio").each(function () {
        try {
            $(this)[0].player.pause();
            $(this)[0].player.setCurrentTime(0);
        }
        catch(err) {
        }
    })
}

function createSmallLoader(containerElement)
{
    containerElement.append("<span class=\"smallLoaderContainerDiv\"><span class=\"fa fa-spinner fa-pulse fa-3x fa-fw\"></span><span class=\"sr-only\">Loading...</span></span>");
}

function killSmallLoader(containerElement)
{
    containerElement.find(".smallLoaderContainerDiv").remove();
}

function createLoader(containerElement)
{
    var loaderId = containerElement.attr("id") + "_Loader";
    var loader = $("#" + loaderId);
    if (loader.length <= 0)
        containerElement.append('<div id="' + loaderId + '" class="bigLoaderContainerDiv"><table class="bigLoaderTable"><tr><td class="bigLoaderTD"><div class="bigLoader"></div><span>Loading...</span></td></tr></table></div>');
}

function killLoader(containerElement) 
{
	containerElement.find(".bigLoaderContainerDiv").remove();
}

/***************Utility Functions Used In learningObject and resources***************/
function removeElementData(lookupElem, dataName){
    $(lookupElem).each(function() {
        $(this).removeData(dataName);
    });
}

function getElementData(returnData, lookupElem, dataName){
    var returnData;
     $(lookupElem).each(function() {
        var tempDataName = $(this).data(dataName);
        if(typeof tempDataName != "undefined"){
                returnData = tempDataName;
            }
    });
    return returnData;
}

function setElementData(lookupElem,dataName,dataValue){
    $(lookupElem).data(dataName,dataValue);
}


/***************Assessment Global Functions***************/
function getParameterByName(name)
{
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function resolveFunctionName(suggestedFunctionName, defaultName)
{
    if (!(typeof (window[suggestedFunctionName]) == "function"))
    {
        return defaultName;
    }
    return suggestedFunctionName;
}

function readableCompletionTime(seconds)
{
    var minutes = parseInt(seconds/60);
    seconds = parseInt(seconds % 60);
    if (seconds < 10)
        seconds = "0" + seconds;
    return minutes + ":" + seconds;
}

var sessionState;
function getSessionState(key, persistDB, callback)
{
    if (persistDB)
    {
        if (dbSessionState)
            callback(dbSessionState[key]);
        else
            callback($.parseJSON("{\"sessionState\":{}}").sessionState);
    }
    else
    {
        $.ajax(
        {
            type: "POST",
            dataType: "jsonp",
            url: domainRootPath + "WebServices/UserAccount.aspx",
            data:
            {
                "action": "getSessionState",
                "persistDB": persistDB
            },
            complete: function (response)
            {
                var responseText = htmlDecode(response.responseText);
                if (persistDB)
                    dbSessionState = $.parseJSON(responseText).sessionState;
                else
                    sessionState = $.parseJSON(responseText).sessionState;
                if (typeof (callback) == "function")
                    callback((persistDB ? dbSessionState[key] : sessionState[key]));
            }
        });
    }
}

function setSessionState(key, value, persistDB, callback)
{
    if (typeof (persistDB) == "undefined")
        persistDB = false;
    if (persistDB)
        dbSessionState[key] = value;
    else
        sessionState[key] = value;
    var value = persistDB ? JSON.stringify(dbSessionState) : JSON.stringify(sessionState);
    $.ajax(
    {
        type: "POST",
        dataType: "jsonp",
        url: domainRootPath + "WebServices/UserAccount.aspx",
        data:
        {
            "action": "setSessionState",
            "value": value,
            "persistDB": persistDB
        },
        complete: function (response)
        {
            var responseText = htmlDecode(response.responseText);
            if (persistDB)
                dbSessionState = $.parseJSON(responseText).sessionState;
            else
                sessionState = $.parseJSON(responseText).sessionState;
            if (typeof (callback) == "function")
                callback(persistDB ? dbSessionState : sessionState);
        }
    });
}
function deleteSessionState(key, persistDB, callback)
{
    if (typeof (persistDB) == "undefined")
        persistDB = false;
    if (persistDB)
        dbSessionState[key] = {};
    else
        sessionState[key] = {};
    var value = persistDB ? JSON.stringify(dbSessionState) : JSON.stringify(sessionState);
    $.ajax(
    {
        type: "POST",
        dataType: "jsonp",
        url: "WebServices/UserAccount.aspx",
        data:
        {
            "action": "setSessionState",
            "value": value,
            "persistDB": persistDB
        },
        complete: function (response)
        {
            var responseText = htmlDecode(response.responseText);
            if (persistDB)
                dbSessionState = $.parseJSON(responseText).sessionState;
            else
                sessionState = $.parseJSON(responseText).sessionState;
            if (typeof (callback) == "function")
                callback(persistDB ? dbSessionState : sessionState);
        }
    });
}

function getCookie(key)
{
    var value = false;
    var keyEQ = encodeURIComponent(key) + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++)
    {
        var cookie = cookies[i];
        while (cookie.charAt(0) === ' ')
            cookie = cookie.substring(1, cookie.length);
        if (cookie.indexOf(keyEQ) === 0)
            value = cookie.substring(keyEQ.length, cookie.length);
    }
    if (value)
        return $.parseJSON(decodeURIComponent(value));
    return false;
}

function setCookie(key, value)
{   
    document.cookie = key + "=" + encodeURIComponent(JSON.stringify(value));
}

function deleteCookie(key) {    // Deletes a cookie by setting the value to empty and set the value of expires to a passed date
    document.cookie = key + "=" + "; expires = Thu, 01 Jan 1970 00:00:00 GMT";  
}

function buttonMgmtClass() {
	this.toggleRTLButton = function( element, isRTL ) {
		element.attr("class", (isRTL ? toggleRtlIcon : toggleLtrIcon) );
		element.addClass("btnGrey");
	}
}

function launchModule(destination, windowName) {
    var targetWindow;
    switch (windowName){
    	case "0":
	        targetWindow = "_blank"
    	break
    	case "1":
	        targetWindow = "preview"
	    break
	    default:
		    targetWindow = "_blank"
	    break
	    }
	window.open( destination, targetWindow );
}

function navToPage(destination){
	window.open( destination, "_self" );
}

function launchAnyPage(destination, windowName) {
    var targetWindow;
    switch (windowName){
        case "0":
            targetWindow = "_blank"
        break
        case "1":
            targetWindow = "preview"
        break
        default:
            targetWindow = "_blank"
        break
        }
    window.open( destination, targetWindow );
}

//scroll to element
(function($) {
    $.fn.goTo = function() {
        $('#id_contentWrapper').animate({
            scrollTop: $(this).offset().top - $("#id_frameworkNav").outerHeight() +'px'
        }, 'fast');
        return this; // for chaining...
    }
})(jQuery);

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// boolean false: (bool)false, (string)'false', (string)'' -> all others true
function parseBoolean (str) {
    return ((typeof (str) == 'boolean' && str) || (typeof(str) == 'string' && str && str !== 'false'));
}

//Removes Duplicates in an array by comparing objects
//Used for module Filter List
function uniqueArray( ar ) {
  var j = {};

  ar.forEach( function(v) {
    j[v+ '::' + typeof v] = v;
  });

  return Object.keys(j).map(function(v){
    return j[v];
  });
}

function toggleDetails(togglerId, callbackFunction, paramArray) {
	/* toggler and detailsContainer id's must match; toggler id simply uses the "-toggler" affix */
	var detailsContainer = $("#"+ togglerId.split("-") ) 
    var togglerIconContainer = $("#"+togglerId);
	var isClosed = togglerIconContainer.hasClass("expandIcon");

    if( isClosed ) {
		detailsContainer.slideDown(animationDuration, function(){
            if(callbackFunction)
                callbackFunction(paramArray.join())
        });
	}
	else {
        detailsContainer.slideUp(animationDuration, function(){
            if(callbackFunction)
                callbackFunction(paramArray.join())
        });
		closeAllOpenDetails( detailsContainer )
	}
	togglerIconContainer.removeClass(isClosed ? "expandIcon" : "collapseIcon").removeClass(isClosed ? "" : "backIcon").addClass(isClosed ? "collapseIcon" : "expandIcon");
	showCollapseAll();
}

function showCollapseAll() {
	$(".learningObjectToolbarContentDiv").each( function () {
		if( $(this).css("display") == "block") {
			var collapseAllButton = $(this).attr("id").split("_")[0] == "learningObjectActivitiesDiv" ? $("#id_collapseActivitiesBtn") : $("#id_collapseGlossaryBtn");
			if( $(this).find(".collapseIcon").length > 0) {
				collapseAllButton.removeClass("collapseAllBtn_inactive").addClass("collapseAllBtn_active").css('visibility', 'visible').animate({opacity: 1.0});
			}
			else {
				collapseAllButton.removeClass("collapseAllBtn_active").addClass("collapseAllBtn_inactive").css('visibility', 'visible').animate({opacity: 0.5});
			}
		}
	});
}

function slideDetails( containerElement, displayElementId, toggleDirection ) {
	var hideElement;
	containerElement.children().each( function() {
		if( $(this).css("display") != "none" ) {
			hideElement = $(this)
		}
	})
	hideElement.hide( "slide", {direction: toggleDirection }, 1000 )
	toggleDirection = toggleDirection == "right" ? "left" : "right";
	$("#"+displayElementId).show( "slide", {direction: toggleDirection, queue: false }, 1000 );
}

function closeAllOpenDetails( containerElement ) {
	containerElement.find(".collapseIcon").each( function() {
		$(this).removeClass("collapseIcon").removeClass("backIcon").addClass("expandIcon");
		// see note in toggleDetails()
		$( "#"+$(this).attr("id").split("-")[0] ).hide();//.slideUp("fast")
        //return to the activity list and display workmode
        if( $(this).data("toggleactivity")){
            var activityIdString = $(this).attr("id").split("-")[0]
            var activityId = activityIdString.split("_")[1]
            toggleActivityDetails(activityId)
        }
	});
	showCollapseAll()
}

function openAllOpenDetails( containerElement ) {
	containerElement.find(".expandIcon").each( function() {
		$(this).removeClass("expandIcon").addClass("collapseIcon");
		// see note in toggleDetails()
		$( "#"+$(this).attr("id").split("-")[0] ).slideDown("fast");
	});
	showCollapseAll()
}

function tabClass() {


    function getTabSpacer() {
        var spacer = document.createElement("span");
        spacer.classList.add("tabSpacer");

        return spacer;
    }

	this.setupTabs = function( params ) {
		/*	
			FACTORY: GENERIC TABS (Horizontal)

			PARAMS
				params.indent:Boolean,
				params.containerId:string, // required to differentiate between tab sets
				params.tabs: [{
					"tabId":string,
					"label":string, // required
					"call": {
						"fn":string,
						"args":[]
					}
				}]
				Notes:
					Use containerId & tabId for specific styling in blackandwhite.css
					if call.fn is used, an onclick attribute with the function and call.args to pass arguments
						 Note: if passing a string value wrap it in single quotes [format: \' stringValue \'], also passing "this" as a reference
						 only double quotes are used [format: "this"].
		*/

		for( var key in params ) {
			this[key] = params[key];
		}

		if( typeof this.tabs === 'object' && typeof this.tabs.slice === 'function' ) {
			var tabsContainer = document.createElement("div");
			tabsContainer.classList.add( "tabContainer" );

			if( this.containerId !== 'undefined' )
				tabsContainer.setAttribute("id", this.containerId );
			else {
				alert( "Error! Add the containerId." );
			}

			if( params.indent !== 'undefined' && params.indent ) {
				tabsContainer.appendChild( getTabSpacer() );
			}

			for(var i=0, j=this.tabs.length; i<j; i++ ) {
				tabsContainer.appendChild( tabs.createTab( this.tabs[i] ) );
			}
			tabsContainer.appendChild( getTabSpacer() );
		
			return tabsContainer;
		}
		else {
			alert( "Error! Send an array of desired tabs." );
		}
	}

	this.createTab = function( params ) {
		var tab = document.createElement( "span" );
		if( typeof params.tabId != 'undefined' ) {
			tab.setAttribute("id", params.tabId );
		}
		tab.classList.add("tab");
			
		if( typeof params.call != 'undefined' ) {
			/* To trigger onclick on this element do not use dispatchEvent(event)! use element.onclick() or $(element).trigger("click"); */
			var fn = params.call.fn + "(" + params.call.args.join(",") + ")";
			tab.setAttribute("onclick", fn);
		}
		tab.innerHTML = params.label;

		return tab;
	}
	
	this.highlightSelectedTab = function( params ) {
		if( params.caller.parentNode !== null  ) {
			var tabs = params.caller.parentNode.querySelectorAll(".tab"); //document.getElementById( params.containerId )
			for( tab in tabs ) {
				if( typeof tabs[tab] === 'object' ) {
					tabs[tab].classList.remove("selected");
				}
			}
		
			params.caller.classList.toggle("selected");
		}		
	}

	this.destroyTab = function( params ) {
		var tgt = document.getElementById( params.tgtId );
		if( tgt.parentNode !== null ) {
			tgt.parentNode.removeChild( tgt ); 
		}
	}

	this.addTab = function( params ) {
		/*
		Forthcoming....
		var t = document.getElementById( params.containerId ).querySelectorAll(".tab");
		var tlen = t.length;
		var tabCnt = 1;
		if( tlen > 0 ) {
			var p = t[0].parentNode 
			var c = p.childNodes;
			for( var i=0; i<c.length; i++ ) {
				if( c[i].classList.contains("tab") && tabCnt == params.index) {
					p.insertBefore( tabs.createTab( params.tab ), p.childNodes[i] );
				}
				else {
					tabCnt++
				}	
			}
		}
		*/
		return false;
	}
}

var tabs = new tabClass;

function stringToolsClass()
{
    String.prototype.stripTags = function ()
    {
        return this.replace(/<\/?[^>]+>/g, '');
    }
    String.prototype.formatText = function ()
    {
        return this.toLowerCase().replace(/[\,\.\;\:\(\)\?\!]/g, '').replace(/&nbsp;/gi, ' ');
    }
}

/*--------------------DISPLAY TABLE ICON FUNCTIONS-------------------------*/

function toggleDownloadModuleActions(moduleId, displayTableElementId)
{
    switch (displayTableElementId)
    {
        case 'moduleListDisplayTable':
            var actionMenuDiv = $("#" + displayTableElementId + "_DownloadActionMenuDiv_" + moduleId);
            var actionMenuTrigger = $("#" + displayTableElementId + "_DownloadActionMenuTrigger_" + moduleId);
            break;
        default:
            var actionMenuDiv = $("#downloadActionMenuDiv_" + moduleId);
            var actionMenuTrigger = $("#downloadActionMenuTrigger_" + moduleId);
            break;
    }

    if (actionMenuTrigger.hasClass("actionTriggerOn"))
    {
        actionMenuTrigger.removeClass("actionTriggerOn");
        $(".actionSubMenuDiv").remove();
        $('html').unbind("click");
    }


    if (actionMenuDiv.css("display") == "none")
    {
        clearTriggers();
        actionMenuDiv.show();
        var verticalDeviation = ((actionMenuTrigger.offset().top + actionMenuTrigger.height())) - $(window).scrollTop();
        actionMenuDiv.css("top", verticalDeviation);
        if ((document.getElementById(actionMenuDiv.attr("id")).offsetLeft + actionMenuDiv.width()) > $(window).width())
            actionMenuDiv.css("right", "0.25em");
        actionMenuDiv.css("top", verticalDeviation);
        actionMenuTrigger.addClass("actionTriggerOn");
        $('html').click(function ()
        {
            clearTriggers();
            $(this).unbind("click");
        });


        $(window).scroll(function ()
        {
            actionMenuTrigger.removeClass("actionTriggerOn");
            actionMenuDiv.hide();
            $(".actionSubMenuDiv").remove();
            $('html').unbind("click");
            $(window).unbind('scroll')
        });

        actionMenuDiv.mouseleave(function ()
        {
            actionMenuTrigger.removeClass("actionTriggerOn");
            actionMenuDiv.hide();
            $(".actionSubMenuDiv").remove();
            $('html').unbind("click");
            $(window).unbind('scroll')
        });


        if (actionMenuTrigger.data("isattached") == 1)
        {
            $("#detachTrigger_" + moduleId).show()
            $("#attachTrigger_" + moduleId).hide()
        } else
        {
            $("#detachTrigger_" + moduleId).hide()
            $("#attachTrigger_" + moduleId).show()
        }
    }
    else
    {
        actionMenuDiv.hide();
        $(".actionSubMenuDiv").remove();
    }

    actionMenuTrigger.click(function (event)
    {
        event.stopPropagation();
    });

    actionMenuDiv.click(function (event)
    {
        event.stopPropagation();
    });
}

function toggleModuleActions(displayTableElementId, moduleId, row, canAttach, canDetach, canModify)
{

    var actionMenuTrigger = $("#" + displayTableElementId + "_ActionMenuTrigger_" + moduleId);
    var actionMenuDivId = displayTableElementId + "_ActionMenu_" + moduleId;
    var actionMenuHTML = "<div id=\"" + actionMenuDivId + "\" class=\"actionMenuDiv\">";
    actionMenuHTML += "     <ul class=\"actionMenuDropDown\">";

    if (displayTableElementId != "moduleListDisplayTable") //Developer Workspace
        actionMenuHTML += "        <li><a href=\"javascript:duplicateModule('" + moduleId + "');\"><i class=\"" + duplicateIcon + "\"></i> &nbsp;Duplicate</a></li>";

    if (canAttach)
        actionMenuHTML += "        <li id=\"" + displayTableElementId + "_ProjectTrigger_" + moduleId + "\"><a href=\"javascript:loadMyCurriculums('" + displayTableElementId + "'," + row + ",'" + displayTableElementId + "_ProjectTrigger_" + moduleId + "'," + moduleId + ")\"><i class=\"" + hangModuleIcon + "\"></i> &nbsp;Attach to</a></li>";
    else if (canDetach)
        actionMenuHTML += "<li><a href=\"javascript:moveModuleTo(0," + moduleId + ")\"><i class=\"fa fa-chain-broken\"></i>&nbsp;Detach</a></li>";

    // var moduleRowIndex = moduleId;
    if (displayTableElementId != "moduleListDisplayTable") //Developer Workspace
        actionMenuHTML += "        <li><a href=\"javascript:removeModule(" + moduleId + ")\"><i class=\"" + removeIcon + "\"></i> &nbsp;Remove</a></li>";
    actionMenuHTML += "     </ul>";
    actionMenuHTML += "</div>";

    actionMenuTrigger.parent().append(actionMenuHTML)
    var theActionMenuDiv = $("#" + actionMenuDivId);

    if (actionMenuTrigger.hasClass("actionTriggerOn"))
    {
        actionMenuTrigger.removeClass("actionTriggerOn");
        $(".actionSubMenuDiv").remove();
        $('html').unbind("click");
    }
    if (theActionMenuDiv.css("display") == "none")
    {
        clearTriggers();
        theActionMenuDiv.show();
        var verticalDeviation = ((actionMenuTrigger.offset().top + actionMenuTrigger.height())) - $(window).scrollTop();
        theActionMenuDiv.css("top", verticalDeviation);
        if ((document.getElementById(theActionMenuDiv.attr("id")).offsetLeft + theActionMenuDiv.width()) > $(window).width())
            theActionMenuDiv.css("right", "0.25em");
        theActionMenuDiv.css("top", verticalDeviation);
        actionMenuTrigger.addClass("actionTriggerOn");
        $('html').click(function ()
        {
            clearTriggers();
            $(this).unbind("click");
        });

        $("#id_contentWrapper").scroll(function ()
        {
            actionMenuTrigger.removeClass("actionTriggerOn");
            theActionMenuDiv.remove();
            $(".actionSubMenuDiv").remove();
            $('html').unbind("click");
            $("#id_contentWrapper").unbind('scroll')
        });
        $(".actionMenuDiv").mouseleave(function ()
        {
            actionMenuTrigger.removeClass("actionTriggerOn");
            theActionMenuDiv.remove();
            $(".actionSubMenuDiv").remove();
            $('html').unbind("click");
            $("#id_contentWrapper").unbind('scroll')
        });
    }
    else
    {
        theActionMenuDiv.hide();
        $(".actionSubMenuDiv").remove();
    }

    actionMenuTrigger.click(function (event)
    {
        event.stopPropagation();
    });

    theActionMenuDiv.click(function (event)
    {
        event.stopPropagation();
    });
}

function clearTriggers()
{
    $(".actionTrigger").removeClass("actionTriggerOn");
    $(".actionMenuDiv").css("right", "").hide();
    $(".actionSubMenuDiv").remove();
    $('html').unbind("click");
}

function moveModuleTo(curriculumId, moduleId, containerElementId)
{
    $.ajax(
        {
            type: "POST",
            dataType: "jsonp",
            url: domainRootPath + "WebServices/Module.aspx",
            data:
            {
                "jsonpCallback": "moveModuleToCallback",
                "action": "update",
                "id": moduleId,
                "key": "curriculumId",
                "value": curriculumId,
                "containerElementId": containerElementId
            }
        });
}

function moveModuleToCallback(serverResponseObj, requestObj)
{
    if (serverResponseObj.error)
    {
        inlineSystemErrorMessaging(false, serverResponseObj, requestObj ? requestObj : false);
    } else
    {
        var containerElementId = requestObj.containerElementId;
        var actionSubMenuDiv = $("#" + containerElementId + "_ActionSubMenuDiv_" + serverResponseObj.module.id);

        var moduleStatus = serverResponseObj.module.published ? "Published" : "Not Published";
        var locationDataStr = "<ul>";
        locationDataStr += spf('<li>Project:&nbsp;~</li>', [serverResponseObj.module.project]);
        locationDataStr += spf('<li>Status:&nbsp;~</li>', [moduleStatus]);
        locationDataStr += "</ul>";

        if (!serverResponseObj.module.curriculum)
            alert("Module successfully Detached from. The module list will now refresh.")
        else
            alert("Module successfully Attached to " + serverResponseObj.module.project + ". The module list will now refresh.")
        location.reload(true);
    }
}

function removeModule(moduleId, containerElementId)
{
    var trigger = $("#" + containerElementId + "_ActionMenuTrigger_" + moduleId)
    var moduleRow = trigger.parent().parent().parent().parent();
    moduleRow.find("td").addClass("toBeDeleted");

    customConfirm("Are you sure you wish to remove this module?",
        function ()
        {
            // Do something
            $.ajax(
                {
                    type: "POST",
                    dataType: "jsonp",
                    url: domainRootPath + "WebServices/Module.aspx",
                    data:
                    {
                        "jsonpCallback": "removeModuleCallback",
                        "action": "remove",
                        "id": moduleId,
                        "containerElementId": containerElementId,
                        "displayTablePagerId": containerElementId + "_Pager"
                    }
                });
        },
        function ()
        {
            // Do something else
            $("#moduleListDiv").find(".toBeDeleted").removeClass("toBeDeleted");
            clearTriggers()
        }
    );
}

function removeModuleCallback(serverResponseObj, requestObj)
{
    $("#moduleListDiv").find(".toBeDeleted").removeClass("toBeDeleted");
    if (serverResponseObj.error)
        inlineSystemErrorMessaging(false, serverResponseObj, requestObj ? requestObj : false);
    else
    {
        var containerElementId = requestObj.containerElementId;
        var displayTablePagerId = requestObj.displayTablePagerId;
        var trigger = $("#" + containerElementId + "_ActionMenuTrigger_" + serverResponseObj.module.id)
        var moduleRow = trigger.parent().parent().parent().parent();

        if (moduleRow.attr("id") == containerElementId + "_LastEditedModule")
            $('#currentModuleTable').html('<table cellpadding="0" cellspacing="0" border="0"></table><div class="displayTable"><div class="displayTableCell emptyModulesMessage">No Module to display.</div></div>');
        else
        {
            moduleRow.remove();
            var totalRows = $("#" + displayTablePagerId).data("totalRows");
            totalRows = totalRows - 1;
            //removedAModule = true;
            //manageCustomPager();
        }
    }
}

function openModuleStatusForm(moduleId, hasProductionStatus, containerElementId)
{

    var moduleAnchor = $("#" + containerElementId + "_SetModuleProductionStatusLink_" + moduleId);
    var moduleProductionStatusDiv = $("#" + containerElementId + "_ModuleProductionStatusDiv");
    var moduleProductionStatusTB = $("#moduleProductionStatusTB");
    var clearModuleProductionStatusBtn = $("#clearModuleProductionStatusBtn");

    var submitModuleProductionStatusBtn = $("#submitModuleProductionStatusBtn");
    var productionStatusValue = hasProductionStatus ? moduleAnchor.data("info") : "";
    moduleProductionStatusTB.val(htmlDecode(productionStatusValue));
    moduleProductionStatusDiv.dialog();

    moduleProductionStatusTB.autocomplete({ source: productionStatuses, minLength: 3 });

    clearModuleProductionStatusBtn.unbind();
    clearModuleProductionStatusBtn.click(function ()
    {
        moduleProductionStatusTB.val("");
    });

    submitModuleProductionStatusBtn.unbind();
    submitModuleProductionStatusBtn.click(function ()
    {
        submitModuleProductionStatus(moduleId, moduleProductionStatusTB.val(), containerElementId);
    });
}

function submitModuleProductionStatus(moduleId, value, containerElementId)
{
    $.ajax(
        {
            type: "POST",
            dataType: "jsonp",
            url: domainRootPath + "WebServices/Module.aspx",
            data:
            {
                "jsonpCallback": "submitModuleProductionStatusCallback",
                "action": "setproductionstatus",
                "id": moduleId,
                "value": value,
                "containerElementId": containerElementId
            }
        });
}

function submitModuleProductionStatusCallback(serverResponseObj, requestObj)
{
    if (serverResponseObj.error)
        inlineSystemErrorMessaging(false, serverResponseObj, requestObj ? requestObj : false);
    if (serverResponseObj.module)
    {
        var containerElementId = requestObj.containerElementId;
        var moduleProductionStatusDiv = $("#moduleProductionStatusDiv");
        var moduleStatusContainer = $("#" + containerElementId + "_ModuleProductionStatusDiv_" + serverResponseObj.module.id)
        var moduleAnchor = $("#" + containerElementId + "_SetModuleProductionStatusLink_" + serverResponseObj.module.id);
        var statusPanel = $("#" + containerElementId + "_StatusPanel_" + serverResponseObj.module.id);
        var newStatus = serverResponseObj.module.productionStatus ? serverResponseObj.module.productionStatus : "Production Status";
        moduleAnchor.data("info", newStatus);
        moduleAnchor.attr("class", "actionTrigger " + (serverResponseObj.module.productionStatus ? flagFullIcon : flagEmptyIcon));
        var hasProductionStatus = serverResponseObj.module.productionStatus ? true : false;
        moduleAnchor.attr('href', 'javascript:openModuleStatusForm(' + serverResponseObj.module.id + ',' + hasProductionStatus + ', "' + containerElementId + '");')
        moduleProductionStatusDiv.dialog("close");
        if (serverResponseObj.module.productionStatus && ($.inArray(serverResponseObj.module.productionStatus, productionStatuses) < 0))
        {
            productionStatuses.push(serverResponseObj.module.productionStatus);
            productionStatuses.sort();
        }
        var concatProductionStatus = (serverResponseObj.module.productionStatus.length > 0) ? serverResponseObj.module.productionStatus : "";
        if (serverResponseObj.module.productionStatus.length >= 16)
        {
            concatProductionStatus = serverResponseObj.module.productionStatus.substring(0, 15);
            concatProductionStatus += "...";
        }
        clearToolTip(statusPanel)

        statusPanel.data("info", newStatus);
        statusPanel.html(concatProductionStatus);

        if (hasProductionStatus)
        {

            if (serverResponseObj.module.productionStatus.length >= 16)
                statusPanel.addClass("tTip")
            else
                statusPanel.removeClass("tTip")
        }

        //this.runDataTableCleanUp();

        if (hasProductionStatus)
        {
            !moduleStatusContainer.hasClass("hasProdMinClass")
            moduleStatusContainer.addClass("hasProdMinClass");
        }
        else
            moduleStatusContainer.removeClass("hasProdMinClass");

        //var dataTable = $('#'+this.containerElementId+'_dataTable').DataTable()
        //dataTable.draw();
    }
}

function extractFilters(moduleRoot, hasUserModule)
{
    filterObj.isFiltered = false;
    filterObj.filtersApplied = [];
    var moduleObject = hasUserModule ? moduleRoot.module : moduleRoot
    if (moduleObject.curriculum)
    {
        this.defaultFilters[0].curriculum.push(moduleObject.curriculum.title)
    } else
    {
        this.defaultFilters[0].curriculum.push(moduleObject.project)
    }

    if (moduleObject.productionStatus)
    {
        this.defaultFilters[1].productionStatus.push(moduleObject.productionStatus)
    }

    if (moduleObject.curriculumLevel)
    {
        var structure = "";
        for (var j = 0; j < moduleObject.curriculumLevel.breadcrumbs.length; j++)
        {
            structure += moduleObject.curriculumLevel.breadcrumbs[j].name;
            structure += "&nbsp;&gt;&nbsp;"
        }
        structure += moduleObject.curriculumLevel.name;
        this.defaultFilters[2].curriculumLevel.push(htmlDecode(structure))
    }

    if (moduleObject.created)
    {
        this.defaultFilters[3].createdBy.push(moduleObject.created.displayName)
    }
}

function GUID()
{
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/*-----------server tag code-----------*/
//parse url to look for https://ucatstag.dliflc.edu or https://ucatuat.dliflc.edu


$(document).ready(function ()
{
    var origin = window.location.origin;
    var stagingOrigin = "https://ucatstag.dliflc.edu";
    var testingOrigin = "https://ucatuat.dliflc.edu";
    var developmentOrigin = "http://localhost:8080";
    if (origin == stagingOrigin)
        initServerTagCode("Staging");
    if(origin == testingOrigin)
        initServerTagCode("Testing");
    if(origin == developmentOrigin)
        initServerTagCode("Dev");
})

function initServerTagCode(serverType)
{
    var serverHeaderHTML = '<div class="serverTag noselect"><span class="errorMessage">'+serverType+' Server</span></div>';
    $("#ucatLogo").after(serverHeaderHTML);
}

function loadScript(name, path, cb)
{
    var node = document.createElement('SCRIPT');
    node.type = 'text/javascript';
    node.src = path;
    var head = document.getElementsByTagName('HEAD');
    if (head[0] != null)
        head[0].appendChild(node);
    if (cb != null)
    {
        node.onreadystagechange = cb;
        node.onload = cb;
    }
}

function convertFloatToInt16(inFloat)
{
    var sampleCt = inFloat.length;
    var outInt16 = new Int16Array(sampleCt);
    for (var n1 = 0; n1 < sampleCt; n1++)
    {
        //This is where I can apply waveform modifiers.
        var sample16 = 0x8000 * inFloat[n1];
        sample16 = (sample16 < -32767) ? -32767 : (sample16 > 32767) ? 32767 : sample16;
        outInt16[n1] = sample16;
    }
    return (outInt16);
}

//select element content for copy to clipboard
function selectAndCopy(elementId){
    /* Get the text table */
    var copyText = document.getElementById(elementId);
    /* Select the text table */
    selectElementContents(copyText);
    /* Copy the text inside the text table */
    document.execCommand("copy");
}

function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
    try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}

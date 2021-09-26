var currentPlayer;//Global Object to store the currently playing/active media
var mediaPlayers = [];//storage Reference to each of the players.
var standardAudioW = 30;
var standardAudioH = 30;
var fullSizeAudioW = 290;
var fullSizeAudioH = 30;
var standardVideoW = 480;
var standardVideoH = 270;
var tinyVideoPlayer = { width: 240, height: 135 }
var smallVideoPlayer = { width: 320, height: 180 }
var standardVideoPlayer = { width: standardVideoW, height: standardVideoH }
var defaultUcatAudioOptions = { fullwidth:false, cuepointseditor:false, cuepointsplayer:false, vrewind:false, allowplaybackspeed:false, autoplay:false, limitplays:0, transcript:false, videosize: standardVideoPlayer, allowpause: true,  allowloop:false, transcriptionplayer:false, showseekslider:false, showplaybacktime:true, showduration:true, showvolumecontrol:false, showdownload:false};
var defaultUcatVideoOptions = { allowplaybackspeed:false,  autoplay:false, limitplays:0, transcript: false, videosize: standardVideoPlayer, allowpause: true, allowloop: false, transcriptionplayer: false, showseekslider: true, showplaybacktime: true, showduration: true, showvolumecontrol: true, allowFullScreeen:true }
var defaultUcatTranscriptHighlightOptions = {transcriptHighlights: []};
var defaultUcatMediaOptions = {"audio":defaultUcatAudioOptions, "video":defaultUcatVideoOptions, defaultUcatTranscriptHighlightOptions}
var mediaInterval;
var isFullscreen = false;
var globalCurrentTime;//Used to check for rewind and increment limit plays if detected
var lockoutMedia = false;//Used to lock out all media actions when a limit plays is playing or recording is taking place

var usePointer = false;
var downEvent = "mousedown";
var upEvent = "mouseup";
var moveEvent = "mousemove";
var enterEvent = "mouseenter";
var leaveEvent = "mouseleave";

/*-----------WINDOW AND DOCUMENT BINDING--------------*/
//jquery mobile causing swipe issues. Yet another reason to get rid of it
$(document).on('mousedown touchstart', 'input[type=range]', function (e)
{
    e.stopPropagation();
});

$(document).ready(function ()
{
    //THis is for surface
    if (window.PointerEvent)
    {
        usePointer = true;
        downEvent = "pointerdown";
        upEvent = "pointerup";
        moveEvent = "pointermove";
        enterEvent = "pointerenter";
        leaveEvent = "pointerleave";
    }
    //This is for iPad
    if('ontouchend' in document){
        usePointer = false;
        downEvent = "touchstart";
        upEvent = "touchend";
        moveEvent = "touchmove";
        enterEvent = "mouseenter";
        leaveEvent = "mouseleave";
    }
})

function updatePlaysOnRefresh()
{
    //This will Increment the number of plays if limit plays is playing
    //Otherwise student could refresh the page and listen repeatedly
    if(lockoutMedia && !currentPlayer.mediaTag.ended){
        //update number of plays.
        var currentPlayNum = currentPlayer.currentPlay + 1;
        updateUcatPlayerCurrentPlay(currentPlayer.id, currentPlayNum);
        var mediaPlayEndedEvent = $.Event("ucatMediaPlayEnded");
        mediaPlayEndedEvent.containerElementId = currentPlayer.containerElementId;
        mediaPlayEndedEvent.src = currentPlayer.src;
        mediaPlayEndedEvent.currentPlay = currentPlayer.currentPlay;
        $(document).trigger(mediaPlayEndedEvent);
    }
}
window.onbeforeunload = updatePlaysOnRefresh;

//Used to limit interaction when limit plays or transcription is running
function toggleAllMediaPlayBtnCursors(){
    var playerButtonElements = $(".ucatMediaControlsWrapper");
    var overlayPlayElement = $(".ucatMediaElementOverlayPlay");
    if(lockoutMedia){
        playerButtonElements.css("cursor","default");
        overlayPlayElement.css("cursor","not-allowed");

        playerButtonElements.find(".ucatPlayBtn, .seekSlider").each(function(){
            $(this).css("cursor","not-allowed");
            $(this).attr("disabled","disabled");//disable the seekbar;
        })
    } else {
        playerButtonElements.css("cursor","pointer");
        overlayPlayElement.css("cursor","pointer");
        playerButtonElements.find(".ucatPlayBtn, .seekSlider").each(function(){
            $(this).css("cursor","pointer");
            $(this).removeAttr("disabled");//Re-enable the seekbar;
        })
    }
}

/*-----------CONSTRUCTOR--------------*/
function setupUcatMedia(containerElement, settings)
{
    lockoutMedia = false;//resets value on componentRefresh
    toggleAllMediaPlayBtnCursors();
    this.mediaMgmt();
    var options = $.extend(
    {
        audio: copyGlobalVariable(defaultUcatAudioOptions),
        video: copyGlobalVariable(defaultUcatVideoOptions),
        transcriptHighlights: new Array()
    }, settings);
    setupMedia(containerElement, options);
}

/*-----------REVERT--------------*/
function revertUcatMedia(containerElement, mediaId){
    //find player(), stop and rewind;
    if(mediaId){
        //remove only mediaId from container
        containerElement.find("[id='ucatMediaElement_"+mediaId+"']").each(function(){
            if (!getCurrentPlayer(mediaId))
            {
                setCurrentPlayer(mediaId);
            }
            clearInterval(mediaInterval);
            ucatMediaPause(mediaId);
            currentPlayer.mediaTag.currentTime = 0;

            //Remove and replace with original media tag
            $(this).replaceWith(function () {
                var ucatMediaTagHTML
                $(this).find("audio, video").each(function(){
                    ucatMediaTagHTML = $(this);
                    ucatMediaTagHTML.removeClass("ucatMediaTag");
                })
                return ucatMediaTagHTML;
            });
        })
    } else {
        //removes all from container
        containerElement.find(".ucatMedia").each(function(){
            var foundMediaId = $(this).attr("id").split("_")[1]
            var ucatMedia = $("#ucatMediaElement_"+foundMediaId);
            if (!getCurrentPlayer(foundMediaId))
            {
                setCurrentPlayer(foundMediaId);
            }
            clearInterval(mediaInterval);
            ucatMediaPause(foundMediaId);
            currentPlayer.mediaTag.currentTime = 0;

            //Remove and replace with original media tag
            $(this).replaceWith(function () {
                var ucatMediaTagHTML
                $(this).find("audio, video").each(function(){
                    ucatMediaTagHTML = $(this);
                })
                return ucatMediaTagHTML;
            });
        })
    }
}

/*-----------BEGIN OBJECT/CLASS CREATION--------------*/
//Lots of legacy code here.
function mediaMgmt()
{
    this.ucatMediaClass();
    this.setupMedia = function (containerElement, options)
    {
        //AUDIO OR VIDEO
        $(containerElement).find("audio, video").each(function ()
        {
            var tag = $(this);
            //Only convert media if not already converted;
            if(!$(this).hasClass("ucatMEdiaTag")){
                $(this).addClass("ucatMEdiaTag");
                var mediaType = tag.prop("tagName").toLowerCase();//Audio or video
                var argumentOptions = mediaType == 'audio' ? options.audio : options.video;
                var transcriptHighlights = options.transcriptHighlights;
                var defaultOptions = mediaType == 'audio' ? defaultUcatAudioOptions : defaultUcatVideoOptions
                reconcileGlobalVariable(argumentOptions, defaultOptions);
                var tagOptions = copyGlobalVariable(argumentOptions);
                $.each(tag[0].dataset, function (key, value)
                {
                    var valueType = typeof (defaultOptions[key]);
                    switch (valueType)
                    {
                        case "boolean":
                            value = parseBoolean(value);
                            break;
                        case "number":
                            value = parseInt(value);
                            break;
                        default:
                            value = String(value);
                            break;
                    }
                    tagOptions[key] = value;
                });
                //The media browser plug-in passes the videosizetitle as a data-attribute;
                //legacy media should use standard playersize as fallback
                tagOptions.videosize = tagOptions.videosizetitle ? window[tagOptions.videosizetitle] : standardVideoPlayer;
                tagOptions.transcriptHighlights = transcriptHighlights;
                for (var th = 0; th < tagOptions.transcriptHighlights.length; th++)
                {
                    tagOptions.transcriptHighlights[th].visible = true;
                }
                //Addded to force complete download of media
                // tag.attr("preload","auto");

                //simply means that the browser has loaded enough meta-data to know the media’s .duration
                tag.on('loadedmetadata', { o: tagOptions }, function (e)
                {
                    ucatAudioVideo(containerElement, this, e.data.o)
                });
            }
        });

        //Other file types
        $(containerElement).find(".doc, .xls, .ppt, .pdf, .file").each(function ()
        {
            setupDocumentLink($(this));
        });
    }

    return this;
}

function ucatMediaClass()
{
    //LEGACY CODE
    this.ucatAudioVideo = function (containerElement, media, options)
    {
        var mediaTag = $(media);
        var mediaType = media.tagName.toLowerCase();//Audio or video
        //size needed for overlay
        if (mediaType == "video"){
            if(options.videosize)
                mediaTag.attr(options.videosize);
            else
                mediaTag.attr(standardVideoPlayer);
        }

        //It is possible to use javascript to get any frame from the video
        // and use canvas to render the poster image.
        // Default media tag uses the first frame
        // mediaTag.attr("poster",video.poster);
        var mediaId = mediaPlayers.length;
        mediaTag.attr("id","mediaTag_"+mediaId);

        if (options.limitplays > 0)
        {
            // Cant allow the user to rewind a player
            options.allowloop = false;
            options.showseekslider = false;
        }
        //Legacy transcription Controls
        var forTranscription = parseBoolean(mediaTag.data("transcriptionplayer")) ? parseBoolean(mediaTag.data("transcriptionplayer")) : false;
        
        //Cue Point Controls
        var forCuePoints = parseBoolean(mediaTag.data("cuepointsplayer")) ? parseBoolean(mediaTag.data("cuepointsplayer")) : false;



        if (mediaType == "video")
        {
            if (mediaTag.attr("height") == undefined)
            {
                mediaTag.attr("height", standardVideoPlayer.height);
            }
            var mediaObjectHeight = parseInt(mediaTag.attr("height"))
            //Overlay for Video
            var mediaObjectWidth = parseInt(mediaTag.attr("width"));
            var videoOverlay = spf('<div id="ucatMediaElement_~_overlay" class="ucatMediaElementOverlayPlay" style="width: ~px; height: ~px;"><button type="button" class="button-nostyle ucatMediaElementOverlayPlayBtn" aria-label="Play"><i class="fa fa-play-circle"></i></button></div>', [mediaId, mediaObjectWidth, mediaObjectHeight]);
            mediaTag.parent().prepend(videoOverlay);
        }
        //MediaTag
        var auidoVideoClass = mediaType == "video" ? "ucatVideoElement" : "";
        mediaTag.wrap(spf('<div id="ucatMediaElement_~_media" class="ucatMediaElement ~"></div>', [mediaId, auidoVideoClass]));

        //Controls
        var audioVideoControlsClass = mediaType == "video" ? "ucatVideoControlsWrapper" : "";
        var ucatVideoWidthStyle = mediaType == "video" ? 'style="width:' + mediaObjectWidth + 'px;"' : '';
        var mediaHTML = '<div id="ucatMediaElement_' + mediaId + '_ucatMediaControlsWrapper" class="ucatMediaControlsWrapper ' + audioVideoControlsClass + '" ' + ucatVideoWidthStyle + '>';
        //SUPPORT LEGACY MEDIATAGS
        if(mediaTag.attr("data-fullplayer")){
            if(mediaTag.attr("data-fullplayer") == "true"){
                options.allowplaybackspeed=false;
                options.autoplay=false;
                options.limitplays=0;
                options.transcript=false;
                options.videosize= standardVideoPlayer;
                options.allowpause = mediaTag.attr("data-limitplays") ? (mediaTag.attr("data-limitplays") == 0 ?  true : false) : true;//Legacy modules had limitplays and allowpause false
                options.allowloop=false;
                options.transcriptionplayer=false;
                options.cuepointseditor=false;
                options.cuepointsplayer=false;
                options.showseekslider=true;
                options.showplaybacktime=true;
                options.showduration=true;
                options.showvolumecontrol=true;
                options.showdownload=false;
            }
            if(mediaTag.attr("data-fullplayer") == "false"){
                options.allowplaybackspeed=false;
                options.autoplay=false;
                options.limitplays=0;
                options.transcript=false;
                options.videosize= standardVideoPlayer;
                options.allowpause = mediaTag.attr("data-limitplays") ? (mediaTag.attr("data-limitplays") == 0 ?  true : false) : true;//Legacy modules had limitplays and allowpause false
                options.allowloop=false;
                options.cuepointseditor=false;
                options.cuepointsplayer=false;
                options.showseekslider=false;
                options.showplaybacktime=false;
                options.showduration=false;
                options.showvolumecontrol=false;
                options.showdownload=false;
            }
        }
        //Legacy Video Players
        var defaultUcatVideoOptions = { allowplaybackspeed:false,  autoplay:false, limitplays:0, transcript: false, videosize: standardVideoPlayer, allowpause: true, allowloop: false, transcriptionplayer: false, showseekslider: true, showplaybacktime: true, showduration: true, showvolumecontrol: true, allowFullScreeen:true }

        if (mediaType == "video" && !mediaTag.attr("data-videosizetitle") )
        {
            //options = defaultUcatMediaOptions.video;
            //Very Low probability that these attributes exist on legacy players but adding just in case
            options.allowplaybackspeed= mediaTag.attr("data-allowplaybackspeed") ? mediaTag.attr("data-allowplaybackspeed") : false;
            options.autoplay= mediaTag.attr("data-autoplay") ? mediaTag.attr("data-autoplay") : false;
            options.limitplays= mediaTag.attr("data-limitplays") ? mediaTag.attr("data-limitplays") : 0;
            options.transcript= mediaTag.attr("data-transcript") ? mediaTag.attr("data-transcript") : false;
            options.videosize= mediaTag.attr("data-videosize") ? mediaTag.attr("data-videosize") : standardVideoPlayer;
            options.allowpause = mediaTag.attr("data-limitplays") ? (mediaTag.attr("data-limitplays") == 0 ? true : false) : true;//Legacy modules had limitplays and allowpause false
            options.allowloop= mediaTag.attr("data-allowloop") ? mediaTag.attr("data-allowloop") : false;
            options.transcriptionplayer= mediaTag.attr("data-transcriptionplayer") ? mediaTag.attr("data-transcriptionplayer") : false;
            options.cuepointseditor= mediaTag.attr("data-cuepointseditor") ? mediaTag.attr("data-cuepointseditor") : false;
            options.cuepointsplayer= mediaTag.attr("data-cuepointsplayer") ? mediaTag.attr("data-cuepointsplayer") : false;
            options.showseekslider= mediaTag.attr("data-showseekslider") ? mediaTag.attr("data-showseekslider") : true;
            options.showplaybacktime= mediaTag.attr("data-showplaybacktime") ? mediaTag.attr("data-showplaybacktime") : true;
            options.showduration= mediaTag.attr("data-showduration") ? mediaTag.attr("data-showduration") : true;
            options.showvolumecontrol= mediaTag.attr("data-showvolumecontrol") ? mediaTag.attr("data-showvolumecontrol") : true;
            options.allowFullScreeen= mediaTag.attr("data-allowFullScreeen") ? mediaTag.attr("data-allowFullScreeen") : true;
        }



        if (mediaType == "video")
        {
            //VIDEO CONTROLS
            mediaHTML += buildVideoControls(mediaId, media, options);
            
        } else
        {
            //AUDIO CONTROLS
            mediaHTML += buildAudioControls(mediaId, media, options);
        }

        mediaHTML += '</div>';//End Wrapper
        mediaTag.parent().parent().append(mediaHTML);

        //set background of range and Buffer
        if(options.showseekslider == true){
            $("#ucatRangeBg_"+ mediaId).css({"width":$("#seekSlider_"+ mediaId).width(),"height":$("#seekSlider_"+ mediaId).height()-2});
            $(window).resize(resizeRangeBg);
            function resizeRangeBg(){
                $("#ucatRangeBg_"+ mediaId).css({"width":$("#seekSlider_"+ mediaId).width(),"height":$("#seekSlider_"+ mediaId).height()-2})
            }
        }

        //Wrap both the media and the controls
        //full width for transcript editor
        var fullWidth = parseBoolean(mediaTag.data("fullwidth")) ? 'style="width:100%;"' : '';

        $('div[id*="ucatMediaElement_' + mediaId + '_"]').wrapAll('<div id="ucatMediaElement_' + mediaId + '" class="ucatMedia" '+fullWidth+' data-container="'+containerElement.attr("id")+'"></div>');

        var directparent = $("#ucatMediaElement_"+mediaId).parent();
        $("#ucatMediaElement_"+mediaId).data("container",directparent)

        var ucatMediaObj = {
            id: mediaId,
            mediaTag: media,//The actual media
            mediaType: mediaType,
            src: $(media).attr("src"),
            maxPlays: options.limitplays,
            currentPlay: 0,
            containerElementId: containerElement.attr("id"),
            mediaPrefix: 'ucatMediaElement_' + mediaId,//container id prefix that wraps the media and player controls, can be used to find other elements.
            isPlaying: false,
            currentTime: 0,
            seeking: false,
            forTranscription: forTranscription,
            forCuePoints: forCuePoints,
            looping: false,
            loopStart: 0,//if jumping back to specific point
            loopStop:0,//if rewind and looping from this out point
            loopAmount: 0,//Amount to rewind
            muted: false,
            mediaPlaceHolder: 'mediaPlaceHolderBox_' + mediaId,
            options: options
        }
        mediaPlayers.push(ucatMediaObj);
        bindPlayers(mediaId, options);
        //Bind the media to display controls on enter
        if (mediaType == "video")
        {
            var ucatMediaControlsWrapper = $("#ucatMediaElement_" + mediaId + "_ucatMediaControlsWrapper");
            var ucatMediaElement = $("#ucatMediaElement_" + mediaId);
            var ucatMediaOverlay = $("#ucatMediaElement_" + mediaId + "_overlay");
            ucatMediaOverlay.on("click", function(){
                if(!lockoutMedia){
                    currentPlayer = mediaPlayers[mediaId];
                    overlayClick(mediaId);
                }
            });

            //Set upclick event
            var mediaTag = $(media);
            mediaTag.on(downEvent, {mediaId:mediaId}, function(event){
                ucatMediaOverlay.hide();
                var e = event.originalEvent;//jQuery does not pass targetTouches property into its event object
                var mediaId = event.data.mediaId;
                currentPlayer = mediaPlayers[mediaId]
                if(currentPlayer.isPlaying == false)
                    ucatMediaPlay(mediaId)
                //toggle controls
                var ucatMediaControlsWrapper = $("#ucatMediaElement_"+mediaId+"_ucatMediaControlsWrapper");
                var ucatShowVidControlsBtn = $("#ucatShowVidControls_"+mediaId);
                if(ucatMediaControlsWrapper.css("display") == "none"){
                    ucatMediaControlsWrapper.show();
                    ucatShowVidControlsBtn.hide();
                } else {
                    ucatMediaControlsWrapper.hide();
                    ucatShowVidControlsBtn.show();
                }
                //Shows the media Controls if the user clicks off of the media element
                $("html").click(function(event)
                {
                    var mediaElement = $("#"+currentPlayer.mediaPrefix)
                    if ( mediaElement.has(event.target).length == 0 && !mediaElement.is(event.target) ){
                        ucatMediaControlsWrapper.show();
                        ucatShowVidControlsBtn.hide();
                        $(this).unbind( "click" );
                    }
                });
                event.stopPropagation();
            })

            //Show controls toggle needs to be visible when the controls are toggled, so it is a separate element
            var showVidControl = ''
            showVidControl += '<div class="ucatShowVidControls" style="display:none;" id="ucatShowVidControls_' + mediaId + '"><div class="ucatToggleVidControls" onclick="ucatShowVidControls(this,' + mediaId + ');">';//Show/hide video controls
            showVidControl += '<i class="fa fa-chevron-up"></i>'
            showVidControl += '</div>';
            showVidControl += '</div>';
            ucatMediaOverlay.after(showVidControl);
        }
        if (forTranscription)
        {
            $("#ucatMediaElement_"+ mediaId +"_ucatMediaControlsWrapper").addClass("transcriptionWrapper");
            $("#ucatMediaElement_" + mediaId).append(addTranscriptionControls("ucatMediaElement_" + mediaId, mediaTag, options, media.duration));
            $("#seekSlider_" + mediaId).css({ "width": "100%" });
        }

        if(forCuePoints){
            $("#ucatMediaElement_"+ mediaId +"_ucatMediaControlsWrapper").addClass("transcriptionWrapper");
            addCuePointsControls($("#ucatMediaElement_" + mediaId), mediaId, options, mediaType);
            $("#seekSlider_" + mediaId).css({ "width": "100%" });
        }

        //LEGACY CODE
        // Mitigates issues off not being able to play media in an element when drag is enabled on that element;
        //See categorization
        mediaTag.parent().parent().parent().on(downEvent, function (ev)
        {
            ev.stopPropagation();
        });
        if (ucatMediaObj.options.limitplays > 0)
        {
            addLimitPlays(mediaId)
        }
        if (ucatMediaObj.options.transcript){
            addTranscriptButton(mediaId);
        }

        var mediaLoadedEvent = $.Event("ucatMediaLoaded");
        mediaLoadedEvent.currentPlayer = ucatMediaObj;
        $(document).trigger(mediaLoadedEvent);
        
        if(ucatMediaObj.options.autoplay){
            if (mediaType == "video"){
                if(!lockoutMedia){
                    currentPlayer = mediaPlayers[mediaId];
                    overlayClick(mediaId);
                }
            } else {
                    currentPlayer = mediaPlayers[mediaId];
                    ucatMediaPlay(mediaId)
            }
        }
        
        ucatMediaObj.mediaTag.addEventListener('progress',function(){onProgress(ucatMediaObj)},false);

        //Media Player loaded event
        var mediaPlayerLoadedEvent = $.Event("mediaPlayerLoaded");
        mediaPlayerLoadedEvent.mediaObj = ucatMediaObj;
        $(document).trigger(mediaPlayerLoadedEvent);

        /*
        //test draggable media
        // if (mediaType == "video"){
            $("#ucatMediaElement_"+mediaId).prepend('<div id="mediaHandle_'+mediaId+'" class="displayTableCell" style="cursor:pointer; text-align:center; width: 1.875em;color:#333333; max-width: 1.875em; display:none;"><i class="fa fa-arrows"></i></div>')
        // } else {
        //     $("#ucatMediaElement_"+mediaId+"_ucatMediaControlsWrapper").prepend('<div id="mediaHandle_'+mediaId+'" class="displayTableCell" style="cursor:pointer; text-align:center; width: 1.875em;color:#333333; max-width: 1.875em; display:none;"><i class="fa fa-arrows"></i></div>')
        // }

        $("#ucatMediaElement_"+ mediaId).before('<div style="display:inline-block;"><div style="display: table; cursor: pointer;"><div class="disaplyTableRow"><div id="enableDraggable_'+mediaId+'" class="displayTableCell" style="color:#00ff00;" onclick="enableMediaDraggable('+ mediaId +')"><i class="fa fa-window-restore"></i></div></div><div class="displayTableRow"><div id="disableDraggable_'+mediaId+'" class="displayTableCell" style="color:#ff0000; display:none;" onclick="disableMediaDraggable('+ mediaId +')"><i class="fa fa-window-maximize"></i></div></div></div></div>');
        */

        //Slider adjustments
        //Background for range slider
        //Could be used in the future for loaded/buffered
        //Currently fills to 100% of seekbars width when playing;//cant get an accurate width on load for some reason
        // var seekSlider = $("#seekSlider_"+ mediaId);
        // var seekSliderWidth = seekSlider.width();
        // $("#ucatRangeFillBg_"+ mediaId).css("width", seekSliderWidth + "px");
    }

    this.enableMediaDraggable = function(mediaId){


        //Only One Element draggable at a time
        $("body").find(".ucatMedia").each(function(){
            if($(this).hasClass("ui-draggable")){
                var mediaPlayerId = $(this).attr("id");
                var mediaId = mediaPlayerId.split("_")[1];
                disableMediaDraggable(mediaId)
            }
        })
        var parentEle = $("#ucatMediaElement_"+mediaId).data("container")
        $(parentEle).height($("#ucatMediaElement_"+mediaId).height())

        $("#ucatMediaElement_"+mediaId).data("parentEle", parentEle)
        $("#ucatMediaElement_"+mediaId).css({"z-index":300,"position":"fixed", "top":112, "left":46})
        $("#ucatMediaElement_"+mediaId).prependTo("#form1")//Had to do this to go above the header and nav. Would prefer to

        $("#ucatMediaElement_"+mediaId).draggable({
            containment: 'window',
            scroll: false,
            handle: $("#mediaHandle_"+mediaId)
        });
        $("#enableDraggable_"+mediaId).hide();
        $("#mediaHandle_"+mediaId).show();
        $("#disableDraggable_"+mediaId).show();
    }

    this.disableMediaDraggable = function(mediaId){
        $("#ucatMediaElement_"+mediaId).draggable( "destroy" );
        var container = $("#ucatMediaElement_"+mediaId).data("parentEle")
        $("#ucatMediaElement_"+mediaId).removeAttr("style")//css({"position":"relative","top":"auto","left":"auto"})
        $("#ucatMediaElement_"+mediaId).appendTo(container)
        $("#enableDraggable_"+mediaId).show();
        $("#mediaHandle_"+mediaId).hide();
        $("#disableDraggable_"+mediaId).hide();
    }

    this.overlayClick = function(mediaId)
    {
        currentPlayer = mediaPlayers[mediaId];
        $(currentPlayer.mediaTag).trigger(downEvent);
        ucatMediaPlay(mediaId);
        currentPlayer.seeking = false;
        if(currentPlayer.maxPlays == 0){//Note: Limit plays has no seek bar
            if(currentPlayer.options.showseekslider){
                var seekSlider = document.getElementById("seekSlider_"+mediaId);
                ucatMediaSeek(seekSlider);//Ensures the time is correct even if slider isnt dragged.
            }
        }
    }

    //MEDIA PROGRESS
    //define a progress abstraction
    this.onProgress = function(player)
    {
        var mediaTag = player.mediaTag;
        var mediaId = player.id;
        var jqProgress = $("#ucatRangeFillBg_"+mediaId);
        var showSeekSlider = $(mediaTag).data("showseekslider");
        var displayHeight = showSeekSlider ? "":"height:1.875em;";
        //get the buffered ranges data
        var ranges = [];
        for(var i = 0; i < mediaTag.buffered.length; i ++)
        {
            ranges.push([
                mediaTag.buffered.start(i),
                mediaTag.buffered.end(i)
                ]);
        }
        if(showSeekSlider){
            //get the current collection of spans inside the container
            var jqSpans = $("#ucatRangeFillBg_"+mediaId+" span");
            //then add or remove spans so we have the same number as time ranges
            if(jqSpans.length >= 0){
                if(jqSpans.length < mediaTag.buffered.length)
                {
                    jqProgress.append('<span style="'+displayHeight+' left:0">&nbsp;</span>');
                }
                if(jqSpans.length > mediaTag.buffered.length)
                {
                    jqProgress.children().last().remove();
                }
            }
                
            //now iterate through the ranges and convert each set of timings
            //to a percentage position and width for the corresponding span
            for(var i = 0; i < mediaTag.buffered.length; i ++)
            {
                try{
                var rangeLeft = Math.round((100 / mediaTag.duration)*ranges[i][0])+'%';
                var rangeWidth = Math.round((100 / mediaTag.duration)*(ranges[i][1] - ranges[i][0]))+'%';
                    if(jqSpans[i]){
                        $(jqSpans[i]).css({"left":rangeLeft,"width":rangeWidth})
                    }
                }
                catch(err){;}
            }
        } else {
            if(ranges.length > 0){//If statement Required to support the audio recording prototype
                var rangeWidth = Math.round((100 / mediaTag.duration)*(ranges[0][1] - ranges[0][0]))+'%';;
                jqProgress.css("background","linear-gradient(90deg, #848484 0%, #848484 0%, #848484 "+rangeWidth+", #848484 "+rangeWidth+")")//#848484 lime green color if decide to switch back
            }
        }

        if (player.options.transcriptHighlights && player.options.transcriptHighlights.length > 0)
        {
            if (mediaTag.duration > 0 && !mediaTag.paused)
            {
                var currentTime = mediaTag.currentTime;
                for (var th = 0; th < player.options.transcriptHighlights.length; th++)
                {
                    var highlightContainer = $(player.options.transcriptHighlights[th].containerElementSelector);
                    highlightContainer.find(".cuePoint").each(function ()
                    {
                        var cuePoint = $(this);
                        if (currentTime > cuePoint.data("starttime") && currentTime < cuePoint.data("endtime") && player.options.transcriptHighlights[th].visible)
                        {
                            cuePoint.addClass("highlightLine");
                            //$(this).parent()[0].scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})
                        }
                        else
                        {
                            cuePoint.removeClass("highlightLine");
                        }
                    });
                }
                
            }
        }
    }

    this.bindPlayers = function (mediaId, options)
    {
        //Bind seek
        if(options.showseekslider){
            var seekSlider = $("#seekSlider_" + mediaId);
            var theSlider = document.querySelector("#seekSlider_" + mediaId);//Used for pointer listeners
            if (usePointer)
            {
                seekSlider.css("touch-action", "none");
            }

            seekSlider.on(downEvent, function (event)
            {
                if(!lockoutMedia){
                    var e = event.originalEvent;//jQuery does not pass targetTouches property into its event object
                    clearInterval(mediaInterval);
                    if (!getCurrentPlayer(mediaId))
                    {
                        setCurrentPlayer(mediaId);
                    }
                    currentPlayer.seeking = true;

                    if (currentPlayer.isPlaying)
                    {
                        if (mediaInterval)
                        {
                            currentPlayer.mediaTag.pause();
                        }
                    }
                    if (usePointer)
                    {
                        // Every pointer has an ID, which you can read from the event.
                        theSlider.setPointerCapture(e.pointerId);

                        theSlider.addEventListener(moveEvent, function ()
                        {
                            if (currentPlayer != undefined)
                            {
                                if (currentPlayer.seeking)
                                {
                                    ucatMediaSeek(this);
                                }
                            }
                        });

                        theSlider.addEventListener(upEvent, function (event)
                        {
                            currentPlayer.seeking = false;
                            if (currentPlayer.isPlaying)
                            {
                                playerInterval();//Set a new interval
                                currentPlayer.mediaTag.play();
                            }
                            ucatMediaSeek(this);//Ensures the time is correct even if slider isnt dragged.
                        });
                    }
                }
            });

            if (!usePointer)
            {
                if(!lockoutMedia){
                    seekSlider.on(moveEvent, function (event)
                    {
                        if(!lockoutMedia){
                            var e = event.originalEvent;
                            if (currentPlayer != undefined)
                            {
                                if (currentPlayer.seeking)
                                {
                                    ucatMediaSeek(this);
                                }
                            }
                        }
                    });

                    seekSlider.on(upEvent, function (event)
                    {
                        if(!lockoutMedia){
                            var e = event.originalEvent;
                            currentPlayer.seeking = false;
                            if (currentPlayer.isPlaying)
                            {
                                playerInterval();//Set a new interval
                                currentPlayer.mediaTag.play();
                            }
                            var seekto = currentPlayer.mediaTag.duration * (element.value / 100);
                            currentPlayer.mediaTag.currentTime = seekto;
                            var displayTime = convertSecondsToMediaPlayerFormat(seekto)
                            $('#currentTime_' + currentPlayer.id).html(displayTime);
                            $('#ucatJumpToTimeTB_' + currentPlayer.id).val(seekto,true);
                        }
                    });
                }
            }
        }

        //bind jump to input
        if(options.cuepointseditor){
            var ucatJumpToTimeTB = $("#ucatJumpToTimeTB_"+ mediaId)
            ucatJumpToTimeTB.on("keyup", function (ev){
                if (ev.keyCode == 13)
                {
                    var value = $(this).val();
                    //valid is MM.SS.MS
                    var cleanValue = value.replace(":",".")
                    var validReg = new RegExp('([0-5]?[0-9]).([0-5]?[0-9]).([0-9]?[0-9])');
                    var isValid = validReg.test(cleanValue);
                    if(isValid){
                        if (!getCurrentPlayer(mediaId))
                        {
                            setCurrentPlayer(mediaId);
                        }
                        //must be less than media duration
                        if(convertDisplayTimeToSeconds(cleanValue) < currentPlayer.mediaTag.duration){
                            convertAndJumpToTime(mediaId,cleanValue,false);
                            $(this).removeAttr("style");
                        } else {
                            $(this).css({"background":"red","color":"#ffffff"});
                        }
                    } else {
                        //display non-valid warning
                        $(this).css({"background":"red","color":"#ffffff"});
                    }
                    ev.preventDefault();
                }
            });

            ucatJumpToTimeTB.on("click", function (ev){
                ucatMediaPause(mediaId)
            })
        }

        //Bind Volume
        if(options.showvolumecontrol){
            //show hide controls
            var ucatVolumeControlsWrapper = $("#ucatVolumeControlsWrapper_" + mediaId);
            var volumeControlsContainer = $("#volumeControlsContainer_" + mediaId);
            volumeControlsContainer.css({ "position": "absolute" })

            ucatVolumeControlsWrapper.hover(
                function()
                {
                    if(!lockoutMedia){
                        //mouseenter
                        volumeControlsContainer.fadeIn("fast");
                        var muteBtnX = ucatVolumeControlsWrapper.position().left;
                        var muteBtnY = ucatVolumeControlsWrapper.position().top;
                        var controlsPosition = muteBtnX - volumeControlsContainer.width();
                        volumeControlsContainer.css({ "top": muteBtnY, "left": controlsPosition })
                    }
                },
                function()
                {
                    if(!lockoutMedia){
                        //mouseleave
                        volumeControlsContainer.hide();
                    }
                }
            )

            var volumeSlider = $("#volumeSlider_" + mediaId);
            var ucatVolumeIndicator = $("#ucatVolumeIndicator_" + mediaId);
            volumeSlider.on(downEvent, function (event)
            {
                if(!lockoutMedia){
                    if (!getCurrentPlayer(mediaId))
                    {
                        setCurrentPlayer(mediaId);
                    }
                }
            });

            volumeSlider.on(moveEvent, function (event)
            {
                if(!lockoutMedia){
                    if (currentPlayer != undefined)
                    {
                        ucatMediaVolume(event, this, ucatVolumeIndicator);
                    }
                }
            });
        }
    }

    //LEGACY CODE
    this.setupDocumentLink = function (mediaObject)
    {
        var format = mediaObject.attr("data-format");
        var src = mediaObject.attr("data-src");
        var title = mediaObject.attr("data-title");
        var docclass = mediaObject.attr("class");
        var iconClass = "";
        switch (format)
        {
            case "doc/docx":
            case "doc/doc":
                iconClass = docSrcIcon;
                break;
            case "doc/xlsx":
            case "doc/xls":
                iconClass = xlsSrcIcon;
                break;
            case "doc/pptx":
            case "doc/ppt":
                iconClass = pptSrcIcon;
                break;
            case "doc/pdf":
                iconClass = pdfSrcIcon;
                break;
            default:
                iconClass = "fa fa-file-o";
                break
        }
        var documentLink = $("<span class=\"inlineDocBtn\" data-class=\""+docclass+"\"  data-format=\""+format+"\" data-src=\""+src+"\" data-title=\""+title+"\" ><i class=\"" + iconClass + "\"></i>&nbsp;<span>" + title + "</span></span>");
        mediaObject.replaceWith(documentLink);


        documentLink.bind("click", function ()
        {
            var w = ($(window).width() * .8) - (em(1.5) * 2);
            var h = $(window).height() / 2;
            var textResourceBody = $("<div id=\"id_resourceBody\"></div>");
            if (format == "doc/pdf")
            {
                textResourceBody.append("<div class=\"resrcAssetContainer\"><iframe src=\"" + src + "\" width=\"" + w + "\" height=\"" + h + "\" seamless></iframe></div>");
                if(typeof(openMobilePopup) == "function")
                    openMobilePopUp(title, textResourceBody, "", "<i class=\"icon fa fa-file-pdf-o\"></i>");
                else if (typeof(openCustomDialog) == "function")
                    openCustomDialog(title, textResourceBody, "", "<i class=\"icon fa fa-file-pdf-o\"></i>");
            }
            else
                window.open(src, '_blank');
        });
    }

    //LEGACY CODE
    //TRANSCRIPTION COMPONENT
    function createPauseOnTypeControls(mediaPlayerId, duration)
    {
        var ctrlSet = $("<div id='" + mediaPlayerId +"_PoT' class='pauseOnType'></div>");
        ctrlSet = ctrlSet[0];//temporary solution until we get rid of UIController.
        var PoT = '';
        PoT += '<div class="displayTableCell">';
        PoT += '<span>&nbsp;Pause on Type </span>';
        PoT += '</div>';

        PoT += '<div class="displayTableCell">';
        PoT += spf('  <div id="~_pause" class="PoTToggle switchedOff" onclick="togglePoT(this, ~);">', [mediaPlayerId, mediaPlayerId]);
        PoT += '    <div class="inner">&nbsp;</div>';
        PoT += '    <div class="switch"></div>';
        PoT += '</div>';
        PoT += '</div>';
        PoT += '<div class="displayTableCell">';
        PoT += spf('<div id="~_pauseControls" class="displayTable pauseControlsDisabled" style="width:100%; table-layout: auto;">', [mediaPlayerId])
        PoT += '<div class="displayTableCell">';
        PoT += '<span>Pause by </span>'
        PoT += '</div>';
        PoT += '<div class="displayTableCell">';
        PoT += spf('<input type="number" name="~_potPause" id="~_potPause" min="1" max="99" value="1" style="width:3em;" disabled="disabled"></input>',[mediaPlayerId, mediaPlayerId]);
        PoT += '</div>';
        PoT += '<div class="displayTableCell">';
        PoT += '<span>Rewind by </span>'
        PoT += '</div>';
        var duration = Math.floor(duration);
        PoT += '<div class="displayTableCell">';
        PoT += spf('<input type="number" name="~_swing" id="~_swing" min="0" max="~" value="0" style="width:3em;" disabled="disabled"></input>',[mediaPlayerId, mediaPlayerId, duration]);
        PoT += '</div>';
        PoT += '</div>';
        PoT += '</div>';
        PoT += '</div>';

        ctrlSet.innerHTML = PoT;

        return ctrlSet;
    }
    //LEGACY CODE
    function createLoopControls(mediaPlayerId, options)
    {
        var transcriptionStartMarker = "fa fa-map-marker";
        var transcriptionCog = "fa fa-gear";

        var loop = '<div class="createLoop">';
        loop += '<div class="displayTableCell">';
        loop += "<span id='" + mediaPlayerId + "_playLoopBtn' class='loopPlayButton fa-stack disabled' title='Play From Loop Start'><i class='fa fa-stack-2x'></i></span>";
        loop += '</div>'
        loop += '<div class="displayTableCell">'
        loop += '<span>&nbsp;Loop Start:</span>';
        loop += spf('<span value="set" onclick="getStart(\'~\', this);" class="transcriptionLoopMarker" title="Set Loop Start Time"><i class="~"></i></span>', [mediaPlayerId, transcriptionStartMarker]);
        loop += '</div>'
        loop += '<div class="displayTableCell" style="text-align:center;">'
        loop += spf('<span id="~_jumpBack" class="loopAdjustment disabled" title="Jump Back 1/2sec"><i class="jumpBack"></i></span>', [mediaPlayerId, mediaPlayerId]);
        loop += spf('<span id="~_stepBack" class="loopAdjustment disabled" title="Step Back 1/10sec"><i class="stepBack"></i></span>', [mediaPlayerId, mediaPlayerId]);
        loop += spf('<span id="~_startTime" class="timeSlot disabled">~</span>', [mediaPlayerId, convertSecondsToMediaPlayerFormat(0, true)]);
        loop += spf('<span id="~_stepFwrd" class="loopAdjustment disabled" title="Step Forward 1/10sec"><i class="stepForward"></i></span>', [mediaPlayerId, mediaPlayerId]);
        loop += spf('<span id="~_jumpFwrd" class="loopAdjustment disabled" title="Jump Forward 1/2sec"><i class="jumpForward"></i></span>', [mediaPlayerId, mediaPlayerId]);
        loop += '</div>'
        if(options.allowpause){
            loop += '<div class="displayTableCell">'
            loop += spf('<span value="set" onclick="openPauseOnType(\'~\', this);" class="transcriptionLoopMarker" title="Close Pause on Type Controls"><i class="~"></i></span>', [mediaPlayerId, transcriptionCog]);
            loop += '</div>'
        }
        loop += '</div>'

        return loop;
    }
    //LEGACY CODE
    function addTranscriptionControls(mediaPlayerId, mediaTag, options, duration)
    {
        var transcriptionControls = $('<div class="transcriptionControls"></div>');
        if (options.allowloop)
        {
            transcriptionControls.append(createLoopControls(mediaPlayerId,options));
            transcriptionControls.find(".loopAdjustment").each(function ()
            {
                $(this).on("click", function ()
                {
                    if ($(this).hasClass("enabled"))
                    {
                        adjustLoop(mediaPlayerId, this);
                    }
                });
            });
        }

        if (options.allowpause)
        {
            transcriptionControls.append(createPauseOnTypeControls(mediaPlayerId, duration));
        }


        var containerId = mediaTag.data("containerid");
        var keypresscontainer = $(document);
        keypresscontainer.find("body").each(function ()
        {
            $(this).keydown(mediaPlayerId, function (event)
            {
                if (event.which != 9)
                {
//                    pauseAudio(this, event, containerId);
                    pauseAudio(this, event, mediaPlayerId);
                }
            });
            $(this).keyup(mediaPlayerId, function (event)
            {
                if (event.which != 9)
                {
//                    var mediaPlayerId = $("#" + containerId).data("mediaPrefix");
                    var mediaId = mediaPlayerId.split("_")[1];
                    if (!getCurrentPlayer(mediaId)) return true;//If nothing has been played yet. Exit, no need to call play
                    if (currentPlayer.isPlaying)
                        return true;//If playback has re-initiated. Exit, no need to call play

                    if(currentPlayer.pauseOnTypeEnabled == true && !userInitiatedPause){
                        pauseOnTypeInterval = setTimeout(function ()
                        {
                            playAudio(mediaId);
                        }, $("#"+currentPlayer.mediaPrefix+"_potPause").val() * 1000);  //User driven pause time
                    }
                }
            });
        });
        return transcriptionControls;
    }
    

    //UPDATED TRANCRIPTION CONTROLS
    function addCuePointsControls(containerElement, mediaId, options, mediaType)
    {
        if (options.cuepointsplayer)
        {
            if(mediaType != "video"){
                containerElement.append('<div id="transcriptionControlsWrapper_' + mediaId + '" class="transcriptionControlsWrapper"></div>');
            } else {
                var vWidth = options.videosize.width + "px";
                containerElement.after('<div id="transcriptionControlsWrapper_' + mediaId + '" class="transcriptionControlsWrapper" ></div>');//style="display:flex; margin:auto; width:'+vWidth+'"
            }
            var transcriptionControlsWrapper = $("#transcriptionControlsWrapper_" + mediaId);
            var transcriptPlayerControlsHTML = '';
            transcriptPlayerControlsHTML += '<div class="displayTable" style="table-layout:auto;">';
            transcriptPlayerControlsHTML += '<div class="displayTableCell" style="width:50%;">';

            //loopcontrols
            transcriptPlayerControlsHTML += '<div style="display:flex;">';
            transcriptPlayerControlsHTML += '<button type="button" id="ucatRewindBtn_'+mediaId+'_0" class="ucatRewindBtn cuePointRewindToggleOn" onclick="toggleLoop(\''+mediaId+'\',\''+0+'\',this);">Off</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="ucatRewindBtn_'+mediaId+'_2" class="ucatRewindBtn cuePointRewindToggleOff" onclick="toggleLoop(\''+mediaId+'\',\''+2+'\',this);">2s</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="ucatRewindBtn_'+mediaId+'_5" class="ucatRewindBtn cuePointRewindToggleOff" onclick="toggleLoop(\''+mediaId+'\',\''+5+'\',this);">5s</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="ucatRewindBtn_'+mediaId+'_10" class="ucatRewindBtn cuePointRewindToggleOff" onclick="toggleLoop(\''+mediaId+'\',\''+10+'\',this);">10s</button>';
            transcriptPlayerControlsHTML += '</div>';//end table

            transcriptPlayerControlsHTML += '<div style="text-align:center;">';
            transcriptPlayerControlsHTML += 'LOOPING';
            transcriptPlayerControlsHTML += '</div>';
            //end loop controls
            transcriptPlayerControlsHTML += '</div>';

            //track text container populated by transcript player script to show or hide transcript highlighting
            transcriptPlayerControlsHTML += '<div class="displayTableCell" id="trackTextContainer_' + mediaId + '">';

            var highlightButtonsHTML = '';
            var highlightButtonCount = 0;
            if (options.transcriptHighlights)
            {
                highlightButtonsHTML += '<div style="display:flex;">';
                for (var th = 0; th < options.transcriptHighlights.length; th++)
                {
                    if (options.transcriptHighlights[th].language != false)
                    {
                        if (highlightButtonCount > 0)
                            highlightButtonsHTML += '<div class="" style="min-width:2rem;">&nbsp;</div>';//buffer cell
                        highlightButtonsHTML += '<div id="toggleHighlightBtn_' + mediaId + '_' + th + '" class="cuePointBtnToggleOn">' + htmlDecode(options.transcriptHighlights[th].language) + '</div>';
                        highlightButtonCount++;
                    }
                }
                highlightButtonsHTML += '</div>';//end table
                highlightButtonsHTML += '<div style="text-align:center;">';
                highlightButtonsHTML += 'TRACK TEXT';
                highlightButtonsHTML += '</div>';
            }
            if (highlightButtonCount > 0)
                transcriptPlayerControlsHTML += highlightButtonsHTML;

            transcriptPlayerControlsHTML += '</div>';

            transcriptPlayerControlsHTML += '<div class="displayTableCell" style="width:50%;">';
            //speed buttons
            transcriptPlayerControlsHTML += '<div style="display:flex;">';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_5" class="ucatSpeedBtn cuePointSpeedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'.5\',this);">';
            transcriptPlayerControlsHTML += '.5';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_75" class="ucatSpeedBtn cuePointSpeedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'.75\',this);">';
            transcriptPlayerControlsHTML += '.75';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_1" class="ucatSpeedBtn cuePointSpeedToggleOn" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'1\',this);">';
            transcriptPlayerControlsHTML += '1';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_125" class="ucatSpeedBtn cuePointSpeedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'1.25\',this);">';
            transcriptPlayerControlsHTML += '1.25';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_15" class="ucatSpeedBtn cuePointSpeedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'1.5\',this);">';
            transcriptPlayerControlsHTML += '1.5';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '<button type="button" id="speedBtn_'+mediaId+'_2" class="ucatSpeedBtn cuePointSpeedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\',\'2\',this);">';
            transcriptPlayerControlsHTML += '2';
            transcriptPlayerControlsHTML += '</button>';
            transcriptPlayerControlsHTML += '</div>';//End Table

            transcriptPlayerControlsHTML += '<div style="text-align:center;">';
            transcriptPlayerControlsHTML += 'SPEED';
            transcriptPlayerControlsHTML += '</div>';
            //end speed Buttons

            transcriptPlayerControlsHTML += '</div>';
            transcriptPlayerControlsHTML += '</div>';//end table


            transcriptionControlsWrapper.append(transcriptPlayerControlsHTML);

            if(mediaType == "video"){
                transcriptionControlsWrapper.parent().css({"text-align":"center"});
            }

            if (options.transcriptHighlights)
            {
                for (var th = 0; th < options.transcriptHighlights.length; th++)
                {
                    if (options.transcriptHighlights[th].language != false)
                    {
                        var toggleHighlightBtn = $("#toggleHighlightBtn_" + mediaId + "_" + th);
                        toggleHighlightBtn.on("click", { "mediaId": mediaId, "index": th }, function (event)
                        {
                            var button = $(this);
                            options.transcriptHighlights[event.data.index].visible = !options.transcriptHighlights[event.data.index].visible;
                            if (options.transcriptHighlights[event.data.index].visible)
                                button.attr("class","cuePointBtnToggleOn");
                            else
                                button.attr("class","cuePointBtnToggleOff");
                        });
                    }
                }
                highlightButtonsHTML += '</div>';//end table
                highlightButtonsHTML += '<div style="text-align:center;">';
                highlightButtonsHTML += 'TRACK TEXT';
                highlightButtonsHTML += '</div>';
            }


        }
    }

    return this
}

/*----------------------HTML DOM ELEMENT CONSTRUCTION-------------------------*/
/*Legacy controls*/
/*
function buildAudioControls(mediaId, audio, options)
{
    var controlsHTML = '<div id="ucatControls_' + mediaId + '" class="fullPlayerAudioControls">';
    //BUffer display if no seekbar
    if(!options.showseekslider){
        controlsHTML += '<div id="ucatRangeFillBg_'+mediaId+'" class="ucatRangeFillBg bufferProgress" style="border-radius:50%; width: 1.875em; height: 1.875em; position:absolute; top:0px;"></div>'
    }

    controlsHTML += '<div id="ucatPlayBtn_' + mediaId + '" class="ucatPlayBtn" title="Play" onclick="ucatMediaPlay(' + mediaId + ');"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-play" style=""></i></span></div>';

    if(options.allowpause){
        controlsHTML += '<div id="ucatPauseBtn_' + mediaId + '" class="ucatPauseBtn" title="Pause" onclick="ucatMediaPause(' + mediaId + ');" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-pause" style=""></i></span>';

            controlsHTML += '</div>';
    }
    controlsHTML += '<div id="ucatPauseBtnPlaceholder_' + mediaId + '" class="ucatPauseBtn ucatPauseBtnPlaceholder" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa" style=""></i></span></div>';
    if (options.showseekslider)
    {
        controlsHTML += '<div class="ucatSeekBar" title="Seek">';
        controlsHTML += '<div id="ucatRangeFillBg_'+ mediaId +'" class="ucatRangeFillBg bufferProgress"></div>';//Background for "ranged amount"
        controlsHTML += '<div id="ucatRangeFill_'+ mediaId +'" class="ucatRangeFill"></div>';//Always displays the "ranged amount"
        controlsHTML += '<input id="seekSlider_' + mediaId + '" class="seekSlider" type="range" min="0" max="100" value="0" step="1">';
        controlsHTML += '</div>';
    }

    if(options.showplaybacktime || options.showduration){
        controlsHTML += '<div class="ucatPlaybackTime">'
        if(options.showplaybacktime){
            controlsHTML += '<span id="currentTime_' + mediaId + '" class="currentTime">' + convertSecondsToMediaPlayerFormat(0) + '</span>';
        }
        if(options.showduration){
            var convertDuration = convertSecondsToMediaPlayerFormat(audio.duration);
            if(options.showplaybacktime && options.showduration)
                controlsHTML += '/'
            controlsHTML += convertDuration
        }
        controlsHTML += '</div>'
    }

    //PLAYBACK SPEED CONTROLS
    if(options.allowplaybackspeed){
        controlsHTML += '<div id="speedBtn_'+mediaId+'" class="ucatSpeedBtn speedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\');">';
        controlsHTML += '1x';
        controlsHTML += '</div>';
    }

    if(options.showvolumecontrol){
        controlsHTML += '<div id="ucatVolumeControlsWrapper_' + mediaId + '" class="ucatVolumeControlsWrapper">'//Wrapper Trigers show controls
        // Controls hidden until hover of ucatVolumeIndicator
        controlsHTML += '<div id="volumeControlsContainer_' + mediaId + '" class="volumeControlsContainer">'//Hide show this
        controlsHTML += '<div class="ucatVolumeSlider" title="Volume">'
        controlsHTML += '<input id="volumeSlider_' + mediaId + '" class="volumeSlider" type="range" min="0" max="100" value="100" step="1">'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ControlsContainer

        controlsHTML += '<div id="ucatVolumeIndicator_' + mediaId + '" class="ucatVolumeIndicator">';//mute/unmute onclick removed in favor of slider to accomodate touch ui
        controlsHTML += '<i class="fa fa-volume-up"></i>'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ucatVolumeControlsWrapper
    }
    controlsHTML += '</div>';

    return controlsHTML
}
*/

//Updated Audio Controls
function buildAudioControls(mediaId, audio, options)
{
    var controlsHTML = '<div id="ucatControls_' + mediaId + '" class="fullPlayerAudioControls">';
    //BUffer display if no seekbar
    if(!options.showseekslider){
        controlsHTML += '<div id="ucatRangeBg_'+ mediaId +'" class="ucatRangeBg" style="background:#333333;  -webkit-border-radius: 1em; -moz-border-radius: 1em; border-radius: 1em; width: 1.875em; height: 1.875em; position:absolute; top:1px;"" >&nbsp;</div>';//Background for entire range
        controlsHTML += '<div id="ucatRangeFillBg_'+mediaId+'" class="ucatRangeFillBg bufferProgress" style="width: 1.875em;  -webkit-border-radius: 1em; -moz-border-radius: 1em; border-radius: 1em; height: 1.875em; position:absolute; top:1px;"></div>'
    }

    controlsHTML += '<button type="button" id="ucatPlayBtn_' + mediaId + '" class="ucatPlayBtn" title="Play" onclick="ucatMediaPlay(' + mediaId + ');"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333; -webkit-border-radius: 1em; -moz-border-radius: 1em; border-radius: 1em; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-play" style=""></i></span></button>';

    if(options.allowpause){
        controlsHTML += '<button type="button" id="ucatPauseBtn_' + mediaId + '" class="ucatPauseBtn" title="Pause" onclick="ucatMediaPause(' + mediaId + ');" style="display:none;"><span style="display:table-cell; vertical-align:middle; background:#333333;  -moz-border-radius: 1em; border-radius: 1em; position:relative; z-index:2; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-pause" style=""></i></span>';
        controlsHTML += '</button>';
    }
    controlsHTML += '<div id="ucatPauseBtnPlaceholder_' + mediaId + '" class="ucatPauseBtn ucatPauseBtnPlaceholder" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;  -moz-border-radius: 1em; border-radius: 1em; width: 1.5em; height:1.5em; left: .2em;"><i class="fa" style=""></i></span></div>';
    if (options.showseekslider)
    {
        var fullWidth = options.fullwidth ? 'style="width:100%;"' : '';
        controlsHTML += '<div class="ucatSeekBar" '+fullWidth+' title="Seek">';
        controlsHTML += '<div id="ucatRangeBg_'+ mediaId +'" class="ucatRangeBg" style="background:#333333; height: .8em; position: absolute;" >&nbsp;</div>';//Background for entire range
        controlsHTML += '<div id="ucatRangeFillBg_'+ mediaId +'" class="ucatRangeFillBg bufferProgress"></div>';//Background for "ranged amount"
        controlsHTML += '<div id="ucatRangeFill_'+ mediaId +'" class="ucatRangeFill"></div>';//Always displays the "ranged amount"
        var fullWidth = options.fullwidth ? 'style="width:100%;"' : '';
        controlsHTML += '<input title="Seek slider" aria-label="Seek slider" id="seekSlider_' + mediaId + '" class="seekSlider" '+fullWidth+' type="range" min="0" max="100" value="0" step="1">';
        controlsHTML += '</div>';
    }

    //rewind by 1/2 second
    if(options.cuepointseditor){
        controlsHTML += '<button title="Rewind by 1/2 Second" type="button" class="ucatRewindBtn" onClick="stepBack('+mediaId+',\'0.5\');">';
        controlsHTML += '<i class="fa fa-step-backward"></i>';
        controlsHTML += '</button>';
    }

    if(options.showplaybacktime || options.showduration){
        controlsHTML += '<div id="ucatPlaybackTime_'+mediaId+'" class="ucatPlaybackTime" style="white-space:nowrap;">'
        if(options.showplaybacktime){
            //jump to controls
            if(options.cuepointseditor){
                controlsHTML += '<input title="Use 00.00.00 Format to Jump to Time" id="ucatJumpToTimeTB_'+mediaId+'" name="ucatJumpToTimeTB_'+mediaId+'" class="ucatJumpToTimeTB" style="display:inline-block;" maxlength="8" size="4" placeholder="'+convertSecondsToMediaPlayerFormat(0,true)+'" value="'+convertSecondsToMediaPlayerFormat(0,true)+'"/>&nbsp;'
            } else {
                controlsHTML += '<span id="currentTime_' + mediaId + '" class="currentTime">' + convertSecondsToMediaPlayerFormat(0) + '</span>';
            }
        }
        if(options.showduration){
            var convertDuration = convertSecondsToMediaPlayerFormat(audio.duration);
            if(options.cuepointseditor)
                convertDuration = convertSecondsToMediaPlayerFormat(audio.duration,true);
            if(options.showplaybacktime && options.showduration)
                controlsHTML += '/'
            controlsHTML += convertDuration
        }
        controlsHTML += '</div>'
    }

    /*PLAYBACK SPEED CONTROLS*/
    if(options.allowplaybackspeed && !options.cuepointsplayer){
        //Regular player. The cue point speed controls are rendered using addCuePointControls
        if(!options.transcriptionplayer){
            
            controlsHTML += '<button type="button" id="speedBtn_'+mediaId+'" class="ucatSpeedBtn speedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\');" style="background: none;">';
            controlsHTML += '1x';
            controlsHTML += '</button>';
        }
    }

    if(options.showvolumecontrol){
        controlsHTML += '<div id="ucatVolumeControlsWrapper_' + mediaId + '" class="ucatVolumeControlsWrapper">'//Wrapper Trigers show controls
        // Controls hidden until hover of ucatVolumeIndicator
        controlsHTML += '<div id="volumeControlsContainer_' + mediaId + '" class="volumeControlsContainer">'//Hide show this
        controlsHTML += '<div class="ucatVolumeSlider" title="Volume">'
        controlsHTML += '<input title="Adjust Volume" aria-label="Adjust Volume" id="volumeSlider_' + mediaId + '" class="volumeSlider" type="range" min="0" max="100" value="100" step=".01">'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ControlsContainer

        controlsHTML += '<div id="ucatVolumeIndicator_' + mediaId + '" class="ucatVolumeIndicator">';//mute/unmute onclick removed in favor of slider to accomodate touch ui
        controlsHTML += '<i class="fa fa-volume-up"></i>'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ucatVolumeControlsWrapper
    }

    //render toggle for cue point player controls
    if(options.cuepointsplayer){
        controlsHTML += '<button type="button" title="Toggle transcription Controls" id="ucatToggleTranscriptControls_' + mediaId + '" class="ucatToggleTranscriptControls" onclick="ucatToggleTranscriptControls(this,' + mediaId + ');">';//Show/hide video controls
        controlsHTML += '<i class="fa fa-chevron-down"></i>'
        controlsHTML += '</button>';
    }

    controlsHTML += '</div>';

    return controlsHTML
}

/*legacy Video Controls*/
/*
function buildVideoControls(mediaId, video, options)
{
    var controlsHTML = ''
    controlsHTML += '<div id="ucatControls_' + mediaId + '" class="fullPlayerVideoControls">';
    controlsHTML += '<div class="displayTable" style="width: auto;">';
    //BUffer display if no seekbar
    if(!options.showseekslider){
        controlsHTML += '<div id="ucatRangeFillBg_'+mediaId+'" class="ucatRangeFillBg bufferProgress" style="border-radius:50%; width: 1.875em; height: 1.875em; position:absolute; top:0px;"></div>'
    }

    controlsHTML += '<div id="ucatPlayBtn_' + mediaId + '" class="ucatPlayBtn" title="Play" onclick="ucatMediaPlay(' + mediaId + ');"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-play" style=""></i></span></div>';
    if(options.allowpause)
        controlsHTML += '<div id="ucatPauseBtn_' + mediaId + '" class="ucatPauseBtn" title="Pause" onclick="ucatMediaPause(' + mediaId + ');" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-pause" style=""></i></span></div>';
    controlsHTML += '<div id="ucatPauseBtnPlaceholder_' + mediaId + '" class="ucatPauseBtn ucatPauseBtnPlaceholder" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; background:#333333;border-radius:50%; width: 1.5em; height:1.5em; left: .2em;"><i class="fa" style=""></i></span></div>';
    if(options.showplaybacktime || options.showduration){
        controlsHTML += '<div class="ucatPlaybackTime">'
        if(options.showplaybacktime){
            controlsHTML += '<span id="currentTime_' + mediaId + '" class="currentTime">' + convertSecondsToMediaPlayerFormat(0) + '</span>';
        }
        if(options.showduration){
            var convertDuration = convertSecondsToMediaPlayerFormat(video.duration);
            if(options.showplaybacktime && options.showduration)
                controlsHTML += '/'
            controlsHTML += convertDuration
        }
        controlsHTML += '</div>'
    }

    controlsHTML += '<div class="ucatMediaBufferCell displayTableCell" style="width:100%;">&nbsp;</div>';//Buffer
    //PLAYBACK SPEED CONTROLS
    if(options.allowplaybackspeed){
        controlsHTML += '<div id="speedBtn_'+mediaId+'" class="ucatSpeedBtn speedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\');">';
        controlsHTML += '1x';
        controlsHTML += '</div>';
    }

    if(options.showvolumecontrol){
        controlsHTML += '<div id="ucatVolumeControlsWrapper_' + mediaId + '" class="ucatVolumeControlsWrapper">'//Wrapper Trigers show controls
        // Controls hidden until hover of ucatVolumeIndicator
        controlsHTML += '<div id="volumeControlsContainer_' + mediaId + '" class="volumeControlsContainer">'//Hide show this
        controlsHTML += '<div class="ucatVolumeSlider" title="Volume">'
        controlsHTML += '<input id="volumeSlider_' + mediaId + '" class="volumeSlider" type="range" min="0" max="100" value="100" step="1">'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ControlsContainer

        controlsHTML += '<div id="ucatVolumeIndicator_' + mediaId + '" class="ucatVolumeIndicator">';//mute/unmute onclick removed in favor of slider to accomodate touch ui
        controlsHTML += '<i class="fa fa-volume-up"></i>'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ucatVolumeControlsWrapper
    }


    //Do not enable full screen with these options because it will disply the controls
    var allowFullScreeen = true;
    if(!options.allowpause || options.limitplays > 0 || !options.showseekslider){
        allowFullScreeen = false
    }
    if(allowFullScreeen){
        controlsHTML += '<div id="ucatFullScreen_' + mediaId + '" class="ucatFullScreen" onclick="ucatMediaFullScreen(this,' + mediaId + ');">';//Full Screen onclick
        controlsHTML += '<i class="fa fa-expand"></i>'
        controlsHTML += '</div>';
    }
    //HIde controls toggle
    controlsHTML += '<div id="ucatHideVidControls_' + mediaId + '" class="ucatToggleVidControls" onclick="ucatToggleVidControls(this,' + mediaId + ');">';//Show/hide video controls
    controlsHTML += '<i class="fa fa-chevron-down"></i>'
    controlsHTML += '</div>';


    controlsHTML += '</div>';//END displayTable

    if(options.showseekslider){
        controlsHTML += '<div class="displayTable" style="table-layout:auto; width:100%;">';
        controlsHTML += '<div class="ucatSeekBar" title="Seek">'
        controlsHTML += '<div id="ucatRangeFillBg_'+ mediaId +'" class="ucatRangeFillBg bufferProgress"></div>';//Background for "ranged amount"
        controlsHTML += '<div id="ucatRangeFill_'+ mediaId +'" class="ucatRangeFill"></div>';//Always displays the "ranged amount"
        controlsHTML += '<input id="seekSlider_' + mediaId + '" class="seekSlider" style="width:100%;" type="range" min="0" max="100" value="0" step="1"></div>'
        controlsHTML += '</div>';
    }

    controlsHTML += '</div>';
    return controlsHTML
}
*/

//Udpated Video Controls
function buildVideoControls(mediaId, video, options)
{
    var controlsHTML = ''
    controlsHTML += '<div id="ucatControls_' + mediaId + '" class="fullPlayerVideoControls">';
    controlsHTML += '<div class="displayTable" style="table-layout: auto; width: auto;">';
    //BUffer display if no seekbar
    if(!options.showseekslider){
        controlsHTML += '<div id="ucatRangeFillBg_'+mediaId+'" class="ucatRangeFillBg bufferProgress" style=" width: 1.875em; height: 1.875em; position:absolute; top:0px;"></div>'
    }

    controlsHTML += '<button type="button" id="ucatPlayBtn_' + mediaId + '" class="ucatPlayBtn" title="Play" onclick="ucatMediaPlay(' + mediaId + ');"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-play" style=""></i></span></button>';
    if(options.allowpause)
        controlsHTML += '<button type="button" id="ucatPauseBtn_' + mediaId + '" class="ucatPauseBtn" title="Pause" onclick="ucatMediaPause(' + mediaId + ');" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; width: 1.5em; height:1.5em; left: .2em;"><i class="fa fa-pause" style=""></i></span></button>';
    controlsHTML += '<div id="ucatPauseBtnPlaceholder_' + mediaId + '" class="ucatPauseBtn ucatPauseBtnPlaceholder" style="display:none;"><span style="display:table-cell; vertical-align:middle; position:relative; z-index:2; width: 1.5em; height:1.5em; left: .2em;"><i class="fa" style=""></i></span></div>';
    if(options.showplaybacktime || options.showduration){
        controlsHTML += '<div class="ucatPlaybackTime">'
        if(options.showplaybacktime){
            controlsHTML += '<span id="currentTime_' + mediaId + '" class="currentTime">' + convertSecondsToMediaPlayerFormat(0) + '</span>';
        }
        if(options.showduration){
            var convertDuration = convertSecondsToMediaPlayerFormat(video.duration);
            if(options.showplaybacktime && options.showduration)
                controlsHTML += '/'
            controlsHTML += convertDuration
        }
        controlsHTML += '</div>'
    }

    controlsHTML += '<div class="ucatMediaBufferCell displayTableCell" style="width:100%;">&nbsp;</div>';//Buffer
    controlsHTML += '<div class="displayTable" style="table-layout: auto; white-space: nowrap;">';//container for <button> else wrappping issues
    /*PLAYBACK SPEED CONTROLS*/
    if(options.allowplaybackspeed){
        controlsHTML += '<button type="button" id="speedBtn_'+mediaId+'" class="ucatSpeedBtn speedToggleOff" onClick="ucatMediaAdjustRate(\''+mediaId+'\');">';
        controlsHTML += '1x';
        controlsHTML += '</button>';
    }

    if(options.showvolumecontrol){
        controlsHTML += '<div id="ucatVolumeControlsWrapper_' + mediaId + '" class="ucatVolumeControlsWrapper">'//Wrapper Trigers show controls
        // Controls hidden until hover of ucatVolumeIndicator
        controlsHTML += '<div id="volumeControlsContainer_' + mediaId + '" class="volumeControlsContainer">'//Hide show this
        controlsHTML += '<div class="ucatVolumeSlider" title="Volume">'
        controlsHTML += '<input title="Adjust Volume" aria-label="Adjust Volume" id="volumeSlider_' + mediaId + '" class="volumeSlider" type="range" min="0" max="100" value="100" step="0.01">'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ControlsContainer

        controlsHTML += '<div id="ucatVolumeIndicator_' + mediaId + '" class="ucatVolumeIndicator">';//mute/unmute onclick removed in favor of slider to accomodate touch ui
        controlsHTML += '<i class="fa fa-volume-up"></i>'
        controlsHTML += '</div>';
        controlsHTML += '</div>';//End ucatVolumeControlsWrapper
    }


    //Do not enable full screen with these options because it will disply the controls
    var allowFullScreeen = true;
    if(!options.allowpause || options.limitplays > 0 || !options.showseekslider){
        allowFullScreeen = false
    }
    if(allowFullScreeen){
        controlsHTML += '<button type="button" id="ucatFullScreen_' + mediaId + '" class="ucatFullScreen" onclick="ucatMediaFullScreen(this,' + mediaId + ');" title="Show full screen">';//Full Screen onclick
        controlsHTML += '<i class="fa fa-expand"></i>'
        controlsHTML += '</button>';
    }
    //HIde controls toggle
    controlsHTML += '<button type="button" id="ucatHideVidControls_' + mediaId + '" class="ucatToggleVidControls" onclick="ucatToggleVidControls(this,' + mediaId + ');" aria-label="Hide Video Controls">';//Show/hide video controls
    controlsHTML += '<i class="fa fa-chevron-down"></i>'
    controlsHTML += '</button>';

    controlsHTML += '</div>'

    controlsHTML += '</div>';//END displayTable

    if(options.showseekslider){
        controlsHTML += '<div class="displayTable" style="table-layout:auto; width:100%;">';
        controlsHTML += '<div class="ucatSeekBar" title="Seek">'
        controlsHTML += '<div id="ucatRangeBg_'+ mediaId +'" class="ucatRangeBg" style="background:#333333; height: .8em; position: absolute;" >&nbsp;</div>';//Background for entire range
        controlsHTML += '<div id="ucatRangeFillBg_'+ mediaId +'" class="ucatRangeFillBg bufferProgress"></div>';//Background for "ranged amount"
        controlsHTML += '<div id="ucatRangeFill_'+ mediaId +'" class="ucatRangeFill"></div>';//Always displays the "ranged amount"
        controlsHTML += '<input title="Seek slider" aria-label="Seek slider" id="seekSlider_' + mediaId + '" class="seekSlider" style="width:100%;" type="range" min="0" max="100" value="0" step="1"></div>'
        controlsHTML += '</div>';
    }

    controlsHTML += '</div>';
    return controlsHTML
}

/*-----------LIMIT PLAYS--------------*/
function addLimitPlays(mediaId)
{
    var mediaPlayer = mediaPlayers[mediaId];
    var mediaTag = mediaPlayer.mediaTag;
    var limitPlaysDiv = '<div id="limitPlaysDiv_ucatMediaElement_' + mediaId + '" class="limitPlaysMediaCounter displayTableCell">' + mediaPlayer.options.limitplays + '</div>';
    if (mediaPlayer.mediaType == "audio")
    {
        $("#ucatControls_" + mediaId).prepend(limitPlaysDiv);
    } else
    {
        $("#ucatMediaElement_" + mediaId).prepend(limitPlaysDiv);
        $("#limitPlaysDiv_ucatMediaElement_" + mediaId).addClass("videoPrepend");
    }
    mediaPlayer.limitPlaysDiv = $("#limitPlaysDiv_ucatMediaElement_" + mediaId);
}

function updateUcatPlayerCurrentPlay(playerId, plays)
{
    var currentPlayer = mediaPlayers[playerId];
    if (typeof (currentPlayer) != "undefined")
    {
        currentPlayer.currentPlay = plays;
        var currentNum = currentPlayer.maxPlays - plays;
        if (currentNum >= 0) { setUcatPlaysNumber(playerId, currentNum) }
        if ((currentPlayer.maxPlays > 0) && (currentPlayer.currentPlay >= currentPlayer.maxPlays))
        {
            var maxMediaPlaysReachedEvent = $.Event("maxMediaPlaysReached");
            maxMediaPlaysReachedEvent.currentPlayer = currentPlayer;
            $(document).trigger(maxMediaPlaysReachedEvent);
            if (currentPlayer.options.limitplays)
                removeUcatPlayer(currentPlayer);
        }
    }
}

//Used to remove the player after limit plays is reached
function removeUcatPlayer(currentPlayer)
{
    var containerElementId = currentPlayer.containerElementId;
    var mediaObj = currentPlayer;
    var mediaType = mediaObj.mediaTag.tagName.toLowerCase();
    var playerElement = $("#" + currentPlayer.mediaPrefix)
    var playerWidth = playerElement.width();
    var playerHeight = playerElement.height();
    if (playerWidth == 0)
    {
        if (currentPlayer.mediaType == "audio")
            playerWidth = standardAudioW;
        else if(currentPlayer.mediaType == "video")
            playerWidth = (currentPlayer.options && currentPlayer.options.videosize) ? currentPlayer.options.videosize.width : tinyVideoPlayer.width;
    }
    if (playerHeight == 0)
    {
        if (currentPlayer.mediaType == "audio")
            playerHeight = standardAudioH;
        else if (currentPlayer.mediaType == "video")
            playerHeight = (currentPlayer.options && currentPlayer.options.videosize) ? currentPlayer.options.videosize.height : tinyVideoPlayer.height;
    }
    var placeholderBoxHTML = "<div id=\"mediaPlaceHolderBox_" + currentPlayer.id + "\" style=\"width:" + playerWidth + "px; height:" + playerHeight + "px;\" class=\"" + mediaType + "PlaceholderBox" + "\" data-maxplays=\"" + currentPlayer.maxPlays + "\"></div>";
    $("#" + currentPlayer.mediaPrefix).replaceWith(placeholderBoxHTML);
    var mediaRemovedEvent = $.Event("mediaRemoved");
    mediaRemovedEvent.currentPlayer = currentPlayer;
    mediaRemovedEvent.mediaPlaceHolder = $("#ucatMediaElement_" + currentPlayer.id);
    $(document).trigger(mediaRemovedEvent);
}

function setUcatPlaysNumber(playerId, currentNum)
{
    $("#limitPlaysDiv_ucatMediaElement_" + playerId).html(currentNum);
}

/*-----------AUDIO OR VIDEO TRANSCRIPTS--------------*/
function addTranscriptButton(mediaId)
{
    var mediaPlayer = mediaPlayers[mediaId];
    var transcriptIcon = $("<div id=\"transcriptionButton_" + mediaId + "\" class=\"displayTableCell transcriptionButton\" title=\"Transcription / Translation\" style=\"display:none;\"><i class=\"fa fa-language\"></i></div>");
    if (mediaPlayer.mediaType == "audio")
    {
        $("#ucatPauseBtnPlaceholder_" + mediaId).after(transcriptIcon);
    }
    else
    {
        $("#ucatMediaElement_" + mediaId).prepend(transcriptIcon);
        $("#transcriptionButton_" + mediaId).addClass("videoPrepend");
    }
    mediaPlayer.transcriptionButton = $("#transcriptionButton_" + mediaId);
    transcriptIcon.click(function ()
    {
        var transcriptClickEvent = $.Event("ucatMediaTranscriptClick");
        transcriptClickEvent.currentPlayer = mediaPlayer;
        $(document).trigger(transcriptClickEvent);
    });
}

/*-----------PLAYER CONTROLS PLAY, PAUSE, ETC--------------*/
//MEDIA PLAYBACK AND CONTROLS
function ucatMediaPlay(mediaId)
{
    if(!lockoutMedia){
        $(".ucatPauseBtnPlaceholder").hide();
        if (currentPlayer != undefined)
            resetAllOtherPlayers(mediaId);
        currentPlayer = mediaPlayers[mediaId];
        // currentPlayer.mediaTag.volume = 0;//MUTE FOR BUFFER TEST, comment out for deployment
        globalCurrentTime = currentPlayer.mediaTag.currentTime;
        var playerPromise = currentPlayer.mediaTag.play();//Prevents asynchronous error if media is not ready
        currentPlayer.mediaTag.onplay = function(event){//Had to add this event so that everything runs even if the user is using "Media Keys" on the keyboard to play
            if (playerPromise !== undefined) {
                playerPromise.then( function(){
                  // Automatic playback started!
                  // Show playing UI.
                    currentPlayer.isPlaying = true;
                    userInitiatedPause = false;
                    var ucatPlayBtn = $("#ucatPlayBtn_" + currentPlayer.id);
                    ucatPlayBtn.hide();
                    $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).hide();
                    if(currentPlayer.options.allowpause){
                        $("#ucatPauseBtn_" + currentPlayer.id).show();
                    }
                    else{
                        $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                        if(currentPlayer.options.limitplays){
                            lockoutMedia = true;
                            toggleAllMediaPlayBtnCursors();
                            //Check for manual Pause using keybord or touchBar and force the end of limit play
                            currentPlayer.mediaTag.addEventListener("pause", pauseDetectionResponse);
                        }
                    }
                    playerInterval();
                    //Set interval to check current time vs duration, update time etc...
                })
                .catch(function() {
                    // Auto-play was prevented
                    // Show paused UI.
                    if(currentPlayer.maxPlays == 0)
                        $("#ucatPauseBtn_" + currentPlayer.id).show();
                    else
                        $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                });
            } else {
                currentPlayer.isPlaying = true;
                userInitiatedPause = false;
                var ucatPlayBtn = $("#ucatPlayBtn_" + currentPlayer.id);
                ucatPlayBtn.hide();
                $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).hide();
                if(currentPlayer.options.allowpause){
                    $("#ucatPauseBtn_" + currentPlayer.id).show();
                }
                else{
                    $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                    if(currentPlayer.options.limitplays){
                        lockoutMedia = true;
                        toggleAllMediaPlayBtnCursors();
                        //Check for manual Pause using keybord or touchBar and force the end of limit play
                        currentPlayer.mediaTag.addEventListener("pause", pauseDetectionResponse);
                    }
                }
                playerInterval();
                //Set interval to check current time vs duration, update time etc...
            }
        }
    }
}

//Media playbackRate set to half speed. May add additional rates later
function ucatMediaAdjustRate(mediaId, rate, btn){
    /*
    1.0 is normal speed
0.5 is half speed (slower)
2.0 is double speed (faster)
-1.0 is backwards, normal speed
-0.5 is backwards, half speed
    */
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }
    
    if(rate){
        $(".ucatSpeedBtn").attr("class","ucatSpeedBtn cuePointSpeedToggleOff");
        var speedBtn = $(btn);
        speedBtn.attr("class","ucatSpeedBtn cuePointSpeedToggleOn");
        currentPlayer.mediaTag.playbackRate = rate;
    } else {
        var speedBtn = $("#speedBtn_"+mediaId);
        if(speedBtn.hasClass("speedToggleOff")){
            currentPlayer.mediaTag.playbackRate = .5;
            speedBtn.removeClass("speedToggleOff");
            speedBtn.addClass("speedToggleOn");
            speedBtn.html('.5x');
        } else {
            currentPlayer.mediaTag.playbackRate = 1;
            speedBtn.removeClass("speedToggleOn");
            speedBtn.addClass("speedToggleOff");
            speedBtn.html('1x');
        }
    }
}

function ucatMediaSeek(element)
{
    var duration = currentPlayer.mediaTag.duration;
    var seekto = duration * (element.value / 100.0);
    currentPlayer.mediaTag.currentTime = seekto;
    var displayTime = convertSecondsToMediaPlayerFormat(seekto)
    $('#currentTime_'+currentPlayer.id).html(displayTime);
    $('#ucatJumpToTimeTB_' + currentPlayer.id).val(convertSecondsToMediaPlayerFormat(seekto,true));
    var playhead = $("#seekSlider_" + currentPlayer.id);
    var rangFill = $("#ucatRangeFill_"+currentPlayer.id);
    var rangeWidth = playhead.width();
    var percentage = (seekto / duration) * 100;
    var newWidth = Math.floor(percentage/100 * rangeWidth);
    rangFill.css("width", newWidth + "px")
}

//go to time and play or pause
function ucatMediaJumpToTime(mediaId, newTime, playAfter)
{
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }
    currentPlayer.mediaTag.currentTime = newTime;
    if (playAfter)
        ucatMediaPlay(mediaId);
    else
        playerInterval(true);//run once to update display and stop
}

function ucatToggleTranscriptControls(element, mediaId){
    var controlsWrapper = $("#transcriptionControlsWrapper_"+mediaId)
    if(controlsWrapper.css("display")=="none"){
        controlsWrapper.slideDown();
        $(element).html('<i class="fa fa-chevron-down"></i>')
    } else {
        controlsWrapper.slideUp();
        $(element).html('<i class="fa fa-chevron-up"></i>')
    }
}

//Not used yet. could be used in the future to go to particular times in a given media file
function ucatMediaPlayAtTime(mediaId, seekto)
{
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }
    clearInterval(mediaInterval);
    var duration = currentPlayer.mediaTag.duration;
    var percentageToSeekTo = (seekto * 100) / duration;
    var currentTime = currentPlayer.mediaTag.currentTime;
    //Checks for Rewind if limit plays is active. Prevents repeated listening.
    if(seekto < currentTime && currentPlayer.maxPlays > 0){
        //update number of plays.
        var currentPlayNum = currentPlayer.currentPlay + 1;
        updateUcatPlayerCurrentPlay(currentPlayer.id, currentPlayNum);
        var mediaPlayEndedEvent = $.Event("ucatMediaPlayEnded");
        mediaPlayEndedEvent.containerElementId = currentPlayer.containerElementId;
        mediaPlayEndedEvent.src = currentPlayer.src;
        mediaPlayEndedEvent.currentPlay = currentPlayer.currentPlay;
        $(document).trigger(mediaPlayEndedEvent);
    }

    switch (currentPlayer.mediaType)
    {
        case "audio":
            if (currentPlayer.options.showseekslider)
            {
                if(currentPlayer.maxPlays == 0){//Note: Limit plays has no seek bar
                    $("#seekSlider_" + mediaId).val(percentageToSeekTo);
                    var seekSlider = document.getElementById("seekSlider_" + mediaId);
                    ucatMediaSeek(seekSlider);
                } else {
                    currentPlayer.mediaTag.currentTime = seekto;
                }
                ucatMediaPlay(mediaId);
            } else
            {
                currentPlayer.mediaTag.currentTime = seekto
                ucatMediaPlay(mediaId);
            }
            break;
        case "video":
            if(currentPlayer.maxPlays == 0){//Note: Limit plays has no seek bar
                $("#seekSlider_" + mediaId).val(percentageToSeekTo);
                var seekSlider = document.getElementById("seekSlider_" + mediaId);
                ucatMediaSeek(seekSlider);
                currentPlayer.mediaTag.currentTime = seekto
                if ($("#ucatMediaElement_" + mediaId + "_overlay").css("display") == "table")
                {
                    overlayClick(mediaId);
                } else
                {
                    ucatMediaPlay(mediaId);
                }
            } else {
                currentPlayer.mediaTag.currentTime = seekto
                if ($("#ucatMediaElement_" + mediaId + "_overlay").css("display") == "table")
                {
                    overlayClick(mediaId);
                } else
                {
                    ucatMediaPlay(mediaId);
                }
            }

            break;
        default:
    }
}

function ucatMediaPause(mediaId)
{
    clearInterval(mediaInterval);
    var ucatPauseBtn = $("#ucatPauseBtn_" + currentPlayer.id);
    ucatPauseBtn.hide();
    currentPlayer = mediaPlayers[mediaId];
    var playerPromise = currentPlayer.mediaTag.pause();//Prevents asynchronous error if media is not ready
    if (playerPromise !== undefined) {
        playerPromise.then( function(){
            currentPlayer.currentTime = currentPlayer.mediaTag.currentTime;
            currentPlayer.isPlaying = false;
            userInitiatedPause = true;
            $("#ucatPlayBtn_" + currentPlayer.id).show();

            var ucatMediaPausedEvent = $.Event("mediaPaused");
            ucatMediaPausedEvent.currentPlayer = currentPlayer;
            $(document).trigger(ucatMediaPausedEvent);
        })
        .catch(function() {
            // Auto-play was prevented
            // Show paused UI.
            $("#ucatPlayBtn_" + currentPlayer.id).show();
        });
    } else {
        currentPlayer.currentTime = currentPlayer.mediaTag.currentTime;
        currentPlayer.isPlaying = false;
        userInitiatedPause = true;
        $("#ucatPlayBtn_" + currentPlayer.id).show();

        var ucatMediaPausedEvent = $.Event("mediaPaused");
        ucatMediaPausedEvent.currentPlayer = currentPlayer;
        $(document).trigger(ucatMediaPausedEvent);
    }
}

function ucatMediaFullScreen(element, mediaId)
{
    currentPlayer = mediaPlayers[mediaId];
    var video = currentPlayer.mediaTag;
    if (!isFullscreen)
    {
        if (video.requestFullscreen)
        {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen)
        {
            container.mozRequestFullScreen(); // Firefox
        } else if (video.webkitRequestFullscreen)
        {
            video.webkitRequestFullscreen(); // Chrome and Safari
        }
        else if (video.webkitEnterFullscreen)
        {
            video.webkitEnterFullscreen();; // iPad
        }
        isFullscreen = true;
        // fullscreenbutton.classList.remove("icon-fullscreen-alt");
        // fullscreenbutton.classList.add("icon-fullscreen-exit-alt");
    } else
    {
        if (document.cancelFullScreen)
        {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen)
        {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen)
        {
            document.webkitCancelFullScreen();
        }
        else if (document.webkitExitFullScreen)
        {
            document.webkitExitFullScreen();
        }
        isFullscreen = false;
    }
}

function ucatToggleVidControls(element, mediaId){
    var ucatShowVidControlsBtn = $("#ucatShowVidControls_"+mediaId);
    ucatShowVidControlsBtn.show();
    var ucatMediaControlsWrapper = $("#ucatMediaElement_"+mediaId+"_ucatMediaControlsWrapper");
    ucatMediaControlsWrapper.hide();
}

function ucatShowVidControls(element, mediaId){
    var ucatShowVidControlsBtn = $("#ucatShowVidControls_"+mediaId);
    ucatShowVidControlsBtn.hide();
    var ucatMediaControlsWrapper = $("#ucatMediaElement_"+mediaId+"_ucatMediaControlsWrapper");
    ucatMediaControlsWrapper.show();
}

function ucatMediaVolume(event, element, ucatVolumeIndicator)
{
    var mediaId = currentPlayer.id;
    currentPlayer.mediaTag.volume = element.value * .01;
    if (element.value == 0)
    {
        ucatVolumeIndicator.html('<i class="fa fa-volume-off"></i>');
    } else if (element.value > 0 && element.value < 100)
    {
        ucatVolumeIndicator.html('<i class="fa fa-volume-down"></i>');
    } else
    {
        ucatVolumeIndicator.html('<i class="fa fa-volume-up"></i>');
    }
}

//UCAT Media Mute no longer used to accomodate touch actions. Slider must be used instead
//Kept here if needed later
function ucatMediaMute(mediaId){
    currentPlayer = mediaPlayers[mediaId];
    var volumeSlider = ("#volumeSlider_" + mediaId);
    if (currentPlayer.muted)
    {
        //Unmute
        currentPlayer.muted = false;
        currentPlayer.mediaTag.muted = false;
        $("#ucatVolumeIndicator_" + mediaId).html('<i class="fa fa-volume-up"></i>');
        volumeSlider.value = 100;
    } else
    {
        //Mute
        currentPlayer.muted = true;
        currentPlayer.mediaTag.muted = true;
        $("#ucatVolumeIndicator_" + mediaId).html('<i class="fa fa-volume-off"></i>');
        volumeSlider.value = 0;
    }
}

function ucatMediaDownload(containerElementId){
    //Re-examine this later currently filelink only exists in recorder
    //Would rather use the src attribute of the ucatMediaPlayer to create and trigger a download.
    var lnk = document.getElementById($(containerElementId).attr("id") + "_downloadLink");
    if (lnk) {
        lnk.click();
    }

    /*
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }
    //Had to use native js to trigger click on a
    var fileLink = $(currentPlayer.mediaTag).data("fileLink");
    var lnk = document.getElementById(fileLink);
    if (lnk) {
        lnk.click();
    }
    */

}

//-----------------GLOBAL CONTROLLER AND UTILITIES------------------//

//Checks to see if the current media is the one that is currently interacted with
function setCurrentPlayer(mediaId)
{
    //Pause the current player and clear the interval
    if (currentPlayer != undefined)
    {
        if (currentPlayer.isPlaying)
        {
            ucatMediaPause(currentPlayer.id)
        }
    }
    var thisPlayer = mediaPlayers[mediaId];
    currentPlayer = thisPlayer;
    resetAllOtherPlayers(thisPlayer.id);
}

function getCurrentPlayer(mediaId)
{
    var isCurrentPlayer = false;
    var thisPlayer = mediaPlayers[mediaId];
    if (currentPlayer != undefined)
    {
        if (thisPlayer.id == currentPlayer.id)
        {
            isCurrentPlayer = true;
        }
    }
    return isCurrentPlayer
}

function resetAllOtherPlayers(newPlayerId)
{
    for (var i = 0; i < mediaPlayers.length; i++)
    {
        var player = mediaPlayers[i];
        if (player.id != newPlayerId)
        {
            player.mediaTag.pause();
            $("#ucatPauseBtn_" + player.id).hide();
            $("#ucatPlayBtn_" + player.id).show();
        }
    }
}

function pauseDetectionResponse(){
    //console.log("Media paused via Hardware Media Key Handling");
    currentPlayer.mediaTag.currentTime = currentPlayer.mediaTag.duration;
}

function playerInterval()
{
    if (mediaInterval)
    {
        clearInterval(mediaInterval);
    }
    //Check for manual rewind if limit plays is active
    if(currentPlayer.maxPlays > 0 && currentPlayer.mediaTag.currentTime < globalCurrentTime && !currentPlayer.looping){
        //update number of plays.
        var currentPlayNum = currentPlayer.currentPlay + 1;
        updateUcatPlayerCurrentPlay(currentPlayer.id, currentPlayNum);
        var mediaPlayEndedEvent = $.Event("ucatMediaPlayEnded");
        mediaPlayEndedEvent.containerElementId = currentPlayer.containerElementId;
        mediaPlayEndedEvent.src = currentPlayer.src;
        mediaPlayEndedEvent.currentPlay = currentPlayer.currentPlay;
        $(document).trigger(mediaPlayEndedEvent);
    }

    var id = currentPlayer.id;
    var currentTime = currentPlayer.mediaTag.currentTime;
    currentPlayer.currentTime = currentTime;
    globalCurrentTime = currentTime;
    var duration = currentPlayer.mediaTag.duration;
    var percentage = (currentTime / duration) * 100;
    var displayTime = convertSecondsToMediaPlayerFormat(currentTime)
    var seekSlider = $("#seekSlider_" + id);
    var currentTimeElement = $('#currentTime_' + id)
    var jumpToTimeTimeElement = $('#ucatJumpToTimeTB_' + id)
    var rangFill = $("#ucatRangeFill_"+id);
    var rangeWidth = seekSlider.width();
    // $("#ucatRangeFillBg_"+id).css("width",rangeWidth);
    mediaInterval = setInterval(function ()
    {
        //Check for manual rewind if limit plays is active
        if(currentPlayer.maxPlays > 0 && currentPlayer.mediaTag.currentTime < globalCurrentTime){
            //update number of plays.
            var currentPlayNum = currentPlayer.currentPlay + 1;
            updateUcatPlayerCurrentPlay(currentPlayer.id, currentPlayNum);
            var mediaPlayEndedEvent = $.Event("ucatMediaPlayEnded");
            mediaPlayEndedEvent.containerElementId = currentPlayer.containerElementId;
            mediaPlayEndedEvent.src = currentPlayer.src;
            mediaPlayEndedEvent.currentPlay = currentPlayer.currentPlay;
            $(document).trigger(mediaPlayEndedEvent);
        }
        currentTime = currentPlayer.mediaTag.currentTime;
        currentPlayer.currentTime = currentTime;
        globalCurrentTime = currentTime;
        duration = currentPlayer.mediaTag.duration;
        percentage = (currentTime / duration) * 100;
        displayTime = convertSecondsToMediaPlayerFormat(currentTime)
        currentTimeElement.html(displayTime);
        jumpToTimeTimeElement.val(convertSecondsToMediaPlayerFormat(currentTime,true));
        seekSlider.val(percentage);

        var newWidth = Math.floor(percentage/100 * rangeWidth);
        rangFill.css("width", newWidth + "px");

        //Looping for cue points player
        if(currentPlayer.looping && currentPlayer.forCuePoints){
            if(currentPlayer.currentTime >= currentPlayer.loopStop){
                stepBack(currentPlayer.id, currentPlayer.loopAmount);
            }
        }

        if (currentPlayer.mediaTag.ended)
        {
            endPlayinterval(id);
        }
        //SHOW BUFFER RANGES
        onProgress(currentPlayer)
    }, 100);
}

function endPlayinterval(id){
    clearInterval(mediaInterval);
    var seekSlider = $("#seekSlider_" + id);
    var rangFill = $("#ucatRangeFill_"+id);
    $("html").unbind( "click" );//Remove binding if it exists for video
    //Rewind the seekSlider, change the playicon
    seekSlider.val(0);
    $("#ucatPlayBtn_" + id).show();
    $("#ucatPauseBtn_" + id).hide();
    $("#ucatPauseBtnPlaceholder_" + id).hide();
    currentPlayer.isPlaying = false;
    currentPlayer.mediaTag.currentTime = 0;
    currentPlayer.currentTime = 0;
    globalCurrentTime = 0;
    currentPlayer.mediaTag.removeEventListener("pause", pauseDetectionResponse);
    currentPlayer.mediaTag.pause();
    currentPlayer.seeking = false;
    currentPlayer.looping = false;
    $("#currentTime_" + id).html(convertSecondsToMediaPlayerFormat(0))
    rangFill.css("width", "0px");
    //Show Overlay if video;
    if(currentPlayer.mediaType == "video"){
        $("#ucatMediaElement_" + id + "_overlay").show();
        $("#ucatMediaElement_" + id + "_ucatMediaControlsWrapper").hide();
    }
    //LIMIT PLAYS
    lockoutMedia = false;
    toggleAllMediaPlayBtnCursors()
    //jquery does not have .hasAttr() so using a jQuery reference to the html element directly
    if (currentPlayer.options.limitplays > 0)
    {
        updateUcatPlayerCurrentPlay(id, currentPlayer.currentPlay + 1);
        var mediaPlayEndedEvent = $.Event("ucatMediaPlayEnded");
        mediaPlayEndedEvent.containerElementId = currentPlayer.containerElementId;
        mediaPlayEndedEvent.src = currentPlayer.src;
        mediaPlayEndedEvent.currentPlay = currentPlayer.currentPlay;
        $(document).trigger(mediaPlayEndedEvent);
    }
}

/*CUE POINT EDITOR AND PLAYER*/
//TEST PLAY PAUSE USING SPACE BAR
//ONly works on the currently activated player
//Ignore event when typing into text fields
window.addEventListener("keypress", function (event) {
    var SPACEBAR = 32;
    if (event.which === SPACEBAR) {
        playPause(event);
    }
});

function playPause(event)
{
    if(!jQuery.isEmptyObject(currentPlayer)){

        var isTyping = false;
        if($(document.activeElement).attr("contentEditable")){
            isTyping = true;
        }
        if($(document.activeElement).is("input")){
            isTyping = true;
        }

        var mediaId = currentPlayer.id;
        if(currentPlayer.options.allowpause && !isTyping){
            if (currentPlayer.mediaTag.paused){
                ucatMediaPlay(mediaId);
            } else {
                ucatMediaPause(mediaId);
            }
            event.preventDefault();//dont scroll to the bottom. If typing then default key event is needed
        }
    }
    
}

//Steps back half second
function stepBack(mediaId, rewindBy){
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }
    var newTime;
    var currentTime;
    if(currentPlayer.currentTime)
        currentTime = currentPlayer.currentTime
    else
        currentTime = convertDisplayTimeToSeconds($("#ucatJumpToTimeTB_"+mediaId).val());
    
    newTime = currentTime - rewindBy;
    if(newTime <= rewindBy || newTime <= 0){
        newTime = 0;
    }
    ucatMediaJumpToTime(mediaId, newTime, currentPlayer.isPlaying);
}

//Loops repeatedly specific secs
function toggleLoop(mediaId,rewindBy,btn){
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }

    //Button classes
    $(".ucatRewindBtn").attr("class","ucatRewindBtn cuePointRewindToggleOff");//reset all
    var rewindBtn = $(btn);
    rewindBtn.attr("class","ucatRewindBtn cuePointRewindToggleOn");

    if(rewindBy == 0){
        currentPlayer.looping = false;
        currentPlayer.loopstart = 0;
        currentPlayer.loopStop = 0;
        currentPlayer.loopAmount = 0;
    } else {
        currentPlayer.loopstart = currentPlayer.currentTime - rewindBy;
        currentPlayer.loopStop = currentPlayer.currentTime;
        currentPlayer.loopAmount = rewindBy;
        currentPlayer.looping = true;
        if(currentPlayer.isPlaying){
            stepBack(currentPlayer.id, rewindBy);
        }
    }
}


function convertAndJumpToTime(mediaId,value,playAfter){
    var totalTime = convertDisplayTimeToSeconds(value);
    ucatMediaJumpToTime(mediaId, totalTime, playAfter);
}


function convertDisplayTimeToSeconds(timeInStr){
    var totalSeconds = 0;
    var minutes, seconds, milliseconds
    minutes = parseInt(timeInStr.split(".")[0])*60;
    seconds = parseInt(timeInStr.split(".")[1]);
    milliseconds = parseInt(timeInStr.split(".")[2])*.01;
    totalSeconds = minutes+seconds+milliseconds;
    return totalSeconds
}

///TIME UTILITY
function convertSecondsToMediaPlayerFormat(time, showMills)
{
    //var showMills = true;//If want to show milliseconds on all players
    var day, hour, minute, seconds;
    // seconds = Math.floor(milliseconds / 1000);
    seconds = time;
    minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    hour = Math.floor(minute / 60);
    minute = minute % 60;
    day = Math.floor(hour / 24);
    hour = hour % 24;

    var minuteDisplay = minute
    if(minute < 10)
        minuteDisplay = "0"+minute;
    if(minute == 0)
        minuteDisplay == "00";

    var secondsDisplay = seconds.toString().split(".")[0];
    if(seconds < 10)
        secondsDisplay = "0"+seconds.toString().split(".")[0];
    if(seconds == 0)
        secondsDisplay == "00";

    var mills
    var millsDisplay
    if(seconds > 0){
        mills = seconds.toString().split(".")[1];
        if(!mills){
            millsDisplay = "00"
        } else {
            if(mills.length == 1)//EX: 3.5 secs
                millsDisplay = mills + "0";
            else
                millsDisplay = mills.substring(0,2);
        }
    } else {
        millsDisplay = "00"
    }

    if(showMills)
        displayTime = minuteDisplay + "." + secondsDisplay + "." + millsDisplay
    else
        displayTime = minuteDisplay + "." + secondsDisplay
    return displayTime
}

//---------------------------------------------------------LEGACY CODE
//---------------------------------------------------------TRANSCRIPTION
var pauseOnTypeInterval
var userInitiatedPause = false;
function getStart(mediaPlayerId, caller)
{
    var idNum = mediaPlayerId.split("_")[1];
    if (!getCurrentPlayer(idNum))
    {
        setCurrentPlayer(idNum);
    }
    //If isPlaying get the current playback time else get the time from the range slider
    var loopStart
    if (currentPlayer.isPlaying)
    {
        loopStart = currentPlayer.mediaTag.currentTime;
    }
    else
    {
        loopStart = currentPlayer.mediaTag.duration * ($("#seekSlider_" + idNum).val() / 100);
    }
    currentPlayer.loopStart = loopStart;

    $("#" + mediaPlayerId + "_startTime").html(convertSecondsToMediaPlayerFormat(loopStart, true));
    var loopBtn = $("#" + mediaPlayerId + "_playLoopBtn")
    if (loopBtn.hasClass("disabled"))
    {
        $("#" + mediaPlayerId + "_jumpBack").removeClass("disabled").addClass("enabled");
        $("#" + mediaPlayerId + "_stepBack").removeClass("disabled").addClass("enabled");
        $("#" + mediaPlayerId + "_startTime").removeClass("disabled").addClass("enabled");
        $("#" + mediaPlayerId + "_stepFwrd").removeClass("disabled").addClass("enabled");
        $("#" + mediaPlayerId + "_jumpFwrd").removeClass("disabled").addClass("enabled");
        loopBtn.removeClass("disabled").addClass("enabled");
        loopBtn.on("click", function ()
        {
            playLoop(mediaPlayerId);
        });
    }
}

function adjustLoop(mediaPlayerId, caller)
{
    var idNum = mediaPlayerId.split("_")[1];
    if (!getCurrentPlayer(idNum))
    {
        setCurrentPlayer(idNum);
    }
    var direction = caller.title.split(" ")[1].toLowerCase();
    var duration = (currentPlayer.mediaTag.duration) - .5;
    var step = caller.title.split(" ")[0].toLowerCase() == "jump" ? 0.5 : 0.1;
    if (direction == "back" && currentPlayer.loopStart > 0)
    {
        currentPlayer.loopStart = currentPlayer.loopStart < step ? 0 : currentPlayer.loopStart - step;
    }
    else if (direction == "forward" && currentPlayer.loopStart >= duration - 0.5)
    {
        currentPlayer.loopStart = duration - 0.5;//making sure it doesnt go over the duration
    }
    else if (direction == "forward" && currentPlayer.loopStart < duration - .05)
    {//giving at least a half second buffer
        currentPlayer.loopStart = currentPlayer.loopStart + step;
    }
    $("#" + mediaPlayerId + "_startTime").html(convertSecondsToMediaPlayerFormat(currentPlayer.loopStart, true));
}

function playLoop(mediaPlayerId)
{
    var idNum = mediaPlayerId.split("_")[1];
    if (!getCurrentPlayer(idNum))
    {
        setCurrentPlayer(idNum);
    }
    currentPlayer.looping = true;
    currentPlayer.mediaTag.currentTime = currentPlayer.loopStart;
    if (!currentPlayer.mediaTag.isPlyaing)
        ucatMediaPlay(idNum);
    else
        ucatMediaPause(idNum);
}

function togglePoT(caller, mediaPlayerId)
{
    var idNum = $(mediaPlayerId).attr("id").split("_")[1];
    var toggleBtn = $(caller);
    var controls = $("#" + toggleBtn.attr("id") + "Controls")
    if (toggleBtn.hasClass("switchedOff"))
    {
        controls.removeClass("pauseControlsDisabled")
        controls.find("input").attr('disabled', false);
        toggleBtn.removeClass("switchedOff").addClass("switchedOn");
        mediaPlayers[idNum].pauseOnTypeEnabled = true;
    }
    else
    {
        controls.addClass("pauseControlsDisabled")
        controls.find("input").attr('disabled', true);
        toggleBtn.removeClass("switchedOn").addClass("switchedOff");
        mediaPlayers[idNum].pauseOnTypeEnabled = false;
    }
}

function openPauseOnType(mediaPlayerId, caller)
{
    var panel = document.getElementById(mediaPlayerId + "_PoT");
    if (panel !== "undefined")
    {
        if (panel.style.display == "none")
        {
            panel.style.display = "";
            caller.setAttribute("title", "Close Pause on Type Controls");
        }
        else
        {
            panel.style.display = "none";
            caller.setAttribute("title", "Open Pause on Type Controls");
        }
    }
}

//function pauseAudio(caller, event, containerId)
function pauseAudio(caller, event, mediaPrefix)
{
//    var mediaPrefix = $("#" + containerId).data("mediaPrefix");
    var mediaId = mediaPrefix.split("_")[1]

    if (pauseOnTypeInterval)
    {
        clearTimeout(pauseOnTypeInterval);
        pauseOnTypeInterval = null;
    }


    if (!getCurrentPlayer(mediaId)) return true;//If nothing has been played yet. Exit this function.
    if (!getCurrentPlayer(mediaId))
    {
        setCurrentPlayer(mediaId);
    }

    var mediaTag = currentPlayer.mediaTag;
    if (!currentPlayer.isPlaying) return true;//Audio is already paused. Exit this function.
    if (!$("#" + mediaPrefix + "_pause").hasClass("switchedOn")) return true;//If pause on type toggle is off.  Exit this function.

    ucatMediaPause(mediaId);

    var pauseOnTypeSecs = $("#"+currentPlayer.mediaPrefix+"_swing").val()//should be the rewind time?
    if (pauseOnTypeSecs != 0)
    {
        var secs = pauseOnTypeSecs
        if (secs < mediaTag.currentTime)
            mediaTag.currentTime -= secs;
        else
            mediaTag.currentTime = 0;
    }
    userInitiatedPause = false;
}

function playAudio(mediaId)
{
    var mediaTag = currentPlayer.mediaTag;
    clearTimeout(pauseOnTypeInterval);
    pauseOnTypeInterval = null;
    if (!currentPlayer.isPlaying && !userInitiatedPause){
        if(!lockoutMedia){
            ucatMediaPlay(mediaId);
        } else {
            globalCurrentTime = currentPlayer.mediaTag.currentTime;
            var playerPromise = currentPlayer.mediaTag.play();//Prevents asynchronous error if media is not ready
            if (playerPromise !== undefined) {
                playerPromise.then(function() {
                  // Automatic playback started!
                  // Show playing UI.
                    currentPlayer.isPlaying = true;
                    var ucatPlayBtn = $("#ucatPlayBtn_" + currentPlayer.id);
                    ucatPlayBtn.hide();
                    $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).hide();
                    if(currentPlayer.maxPlays == 0){
                        $("#ucatPauseBtn_" + currentPlayer.id).show();
                    }
                    else{
                        $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                        lockoutMedia = true;
                        toggleAllMediaPlayBtnCursors()
                    }
                    playerInterval();
                    //Set interval to check current time vs duration, update time etc...
                })
                .catch(function() {
                    // Auto-play was prevented
                    // Show paused UI.
                    if(currentPlayer.maxPlays == 0)
                        $("#ucatPauseBtn_" + currentPlayer.id).show();
                    else
                        $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                });
            } else {
                currentPlayer.isPlaying = true;
                var ucatPlayBtn = $("#ucatPlayBtn_" + currentPlayer.id);
                ucatPlayBtn.hide();
                $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).hide();
                if(currentPlayer.maxPlays == 0){
                    $("#ucatPauseBtn_" + currentPlayer.id).show();
                }
                else{
                    $("#ucatPauseBtnPlaceholder_" + currentPlayer.id).show();
                    lockoutMedia = true;
                    toggleAllMediaPlayBtnCursors()
                }
                playerInterval();
                //Set interval to check current time vs duration, update time etc...
            }
        }
    }
}

(function ($)
{
    $.fn.ucatRecorder = function (options)
    {
        var powerButton, recordButton, stopButton, audioElement;//plain js dom elements for lame.js compatability
        var recorderContainer, recorderBtnsContainer, downloadContainer, recorderStatus, recorderDuration, recorderOutputContainer, processHelpContainer;//jQuery dom elements
        var recorderContainerElement = $(this);
        var containerElementId = recorderContainerElement.attr("id");
        var recorderShowMP3Event;
        var recorderId;
        var recordingDurationInterval;
        var gAudio = null;       //Audio context
        var gAudioSrc = null;    //Audio source
        var gNode = null;        //The audio processor node
        var gIsLame = false;     //Has lame.min.js been loaded?
        var gLame = null;        //The LAME encoder library
        var gEncoder = null;     //The MP3 encoder object
        var gStrmMp3 = [];       //Collection of MP3 buffers
        var gIsRecording = false;
        var gCfg = {
            chnlCt: 1,
            bufSz: 4096,
            sampleRate: 44100,
            bitRate: 128
        };
        var gPcmCt = 0;
        var gMp3Ct = 0;
        var reader = {}; 
        var chunkSize = 1000 * 1024;

        var recorderduration = 0;

        var settings = $.extend({
            record: true,
            download: true,
            submit:false
        }, options);

        loadRecorder();

        function loadRecorder()
        {
            recorderId = GUID();
            var recorderHTML = recorderHTML = '<div id="' + containerElementId+'_recorderContainer" class="ucatMediaRecorder">';
            if (settings.record)
            {
                recorderHTML += '<div id="' + containerElementId + '_recorderBtnsContainer" class="recorderBtnsContainer ucatMediaControlsWrapper_empty">';

                recorderHTML += '<div class="recorderBtnControls">';
                recorderHTML += '   <div class="powerBtn recorderBtn" id="' + containerElementId + '_recorderPowerBtn" title="Enable/Disable this recording session. Only 1 session can be enabled at a time."><i class="fa fa-microphone"></i></div>';
                recorderHTML += '   <div class="recordBtn recorderBtn" id="' + containerElementId + '_recorderRecordBtn" style="display:none;"><i class="fa fa-circle" title="Start recording. You may record multiple times per session."></i></div>';
                recorderHTML += '   <div class="stopRecordBtn recorderBtn" id="' + containerElementId + '_recorderStopBtn" style="display:none;"><i class="fa fa-stop" title="Stop recording."></i></div>';
                
                if (settings.download)
                {
                    recorderHTML += '<div id="'+containerElementId+'_downloadBtn" class="ucatDownloadBtn" style="display:none;" title="Download" onclick="ucatMediaDownload(' + containerElementId + ')">';
                    recorderHTML += '<i class="fa fa-download"></i>';
                    recorderHTML += '</div>';
                }

                recorderHTML += '   <div class="ucatPlaybackTime ucatRecorderPlayBackTime"><div id="' + containerElementId + '_recorderDuration" class="currentTime" data-recorderduration='+recorderduration+' style="display:inline-block; min-width:2.500em;">'+convertSecondsToMediaPlayerFormat(recorderduration)+'</div></div>'

                recorderHTML += '</div>';

                recorderHTML += '</div>';
            }
            
            recorderHTML += '</div>';

            recorderHTML += '<div id="' + containerElementId +'_recorderOutputContainer" style="display:inline-block; padding-left:.5em;">'
            var showdownload = settings.download ? "true":"false"
            recorderHTML += '   <audio id="' + containerElementId +'_audio" class="ucatMediaTag" data-showdownload="'+showdownload+'" data-allowloop="true" data-allowpause="true" data-allowplaybackspeed="true" data-autoplay="false" data-limitplays="0" data-showduration="true" data-showplaybacktime="true" data-showseekslider="true" data-showvolumecontrol="true" data-transcript="false" data-transcriptionplayer="false">';
            recorderHTML += '       <source type="audio/mpeg" />';
            recorderHTML += '   </audio>';
            recorderHTML += '</div>';
            /*
            if (settings.record)
            {
                recorderHTML += '   <div id="' + containerElementId + '_recorderStatus"></div>';//Shows encoding progress and results Example:450560 / 40751: 9.04%
            }
            */

            if (settings.download)
            {
                recorderHTML += '   <div id="' + containerElementId + '_downloadContainer" style="display:none;"></div>';
            }

            recorderHTML += '<div id="' + containerElementId + '_processHelpContainer"></div>';

            recorderContainerElement.html(recorderHTML);
            audioElement = document.getElementById(containerElementId + '_audio');

            if (settings.record)
            {
                powerButton = document.getElementById(containerElementId + '_recorderPowerBtn');
                recordButton = document.getElementById(containerElementId + '_recorderRecordBtn');
                stopButton = document.getElementById(containerElementId + '_recorderStopBtn');
                recorderBtnsContainer = $("#" + containerElementId + "_recorderBtnsContainer");
                recorderContainer = $("#" + containerElementId + "_recorderContainer");
                recorderOutputContainer = $("#" + containerElementId + "_recorderOutputContainer");
                recorderStatus = $("#" + containerElementId + "_recorderStatus");
                recorderDuration = $("#" + containerElementId + "_recorderDuration");
                processHelpContainer = $("#" + containerElementId + "_processHelpContainer");

                recorderBtnsContainer.data("recorderid", recorderId);

                loadRecorderHelp("initial");

                powerButton.onclick = function ()
                {
                    onPower();
                };

                recordButton.onclick = function ()
                {
                    if(!$(this).hasClass("recordingInProgress"))
                        onRecord();
                };

                stopButton.onclick = function ()
                {
                    onStop();
                };
            }
            if (settings.download)
            {
                downloadContainer = $("#" + containerElementId + "_downloadContainer");
            }
        }

        function loadRecorderHelp(recorderState)
        {
            var initialStateHTML = '<ul>';
            initialStateHTML += '<li>This is the audio recorder.</li>';
            initialStateHTML += '<li>To activate this recorder, click on the microphone button.</li>';
            if (settings.submit)
                initialStateHTML += '<li>Before you can submit, you must first start the session and record some audio.</li>';
            initialStateHTML += '</ul>';

            var activeStateHTML = '<ul>';
            activeStateHTML += '<li>This recorder is now active (only one recorder may be active on the page at a time).</li>';
            activeStateHTML += '<li>To begin the recording, click the red box with the white circle.</li>';
            activeStateHTML += '<li>A countdown from 3 will be displayed over the record button prepare you to begin your recording.</li>';
            activeStateHTML += '<li>Press the stop button when you are finished.</li>';
            activeStateHTML += '</ul>';

            var recordedStateHTML = '<ul>';
            recordedStateHTML += '<li>Your recording is complete.  You may listen to the sample in the generated media player.</li>';
            recordedStateHTML += '<li>To continue recording, you may click the record button again to add more audio to the end of your recording.</li>';
            recordedStateHTML += '<li>If you wish to start over or are happy with your recording, click on the microphone icon to end this session.</li>';
            recordedStateHTML += '</ul>';

            var sessionEndedStateHTML = '<ul>';
            sessionEndedStateHTML += '<li>This recording session has ended.</li>';
            if (settings.download)
                sessionEndedStateHTML += '<li>The download button will allow you to download a local copy of the .mp3 file you have just recorded.</li>';
            if (settings.submit)
                sessionEndedStateHTML += '<li>In order to submit the file, include any additional required information (if applicable) and click the submit button.</li>';
            sessionEndedStateHTML += '</ul>';
            addContextualHelp(processHelpContainer.attr("id"), eval(recorderState+"StateHTML"), "html", true);
        }

        function onPower()
        {
            if (!gAudio)
            {
                PowerOn();
            }
            else
            {
                PowerOff();
            }
        }

        function PowerOn()
        {
            console.log("Powering up...");
            var caps = { audio: true };
            try
            {
                //Browser compatibility
                window.AudioContext = window.AudioContext || window.webkitAudioContext || AudioContext;
                navigator.getUserMedia = navigator.getUserMedia
                    || navigator.webkitGetUserMedia
                    || navigator.mozGetUserMedia
                    || navigator.msGetUserMedia
                    || MediaDevices.getUserMedia;
                if (!(gAudio = new window.AudioContext()))
                {
                    console.log("ERR: Unable to create AudioContext.");
                }
                else
                {
                    navigator.getUserMedia(caps, onUserMedia, onFail);
                }
            }
            catch (ex)
            {
                console.log("ERR: Unable to find any audio support.");
                gAudio = null;
            }

            function onFail(ex)
            {
                console.log("ERR: getUserMedia failed: %s", ex);
            }
        }

        function onUserMedia(stream)
        {
            if (!(gAudioSrc = gAudio.createMediaStreamSource(stream)))
            {
                console.log("ERR: Unable to create audio source.");
            }
            else if (!gIsLame)
            {
                console.log("Fetching lame library...");
                loadScript("lame", "js/lame.js", LameCreate);
            }
            else
            {
                LameCreate();
            }
        }

        function LameCreate()
        {
            gIsLame = true;
            if (!(gEncoder = Mp3Create()))
            {
                console.log("ERR: Unable to create MP3 encoder.");
            }
            else
            {
                gStrmMp3 = [];
                gPcmCt = 0;
                gMp3Ct = 0;
//                console.log("Power ON.");
                loadRecorderHelp("active");

                //recordButton.disabled = false;
                recordButton.classList.remove("recorderBtnDisabled");
                recordButton.style.display = null;
                recorderDuration.data("recorderduration", 0);
                recorderDuration.html("00:00");
                //hide old download button if visible
                $("#"+containerElementId+"_downloadBtn").hide();
                //Disable all other recorders
                $(document).find(".powerBtn").each(function ()
                {
                    var currentRecorder = $(this).parent().parent().data("recorderid");//should be the recorderBtnsContainer
                    if (currentRecorder != recorderId)
                        $(this).addClass("recorderBtnDisabled");
                    else
                        $(this).addClass("active")
                });
            }
        }

        function PowerOff()
        {
            console.log("Power down...");
            if (gIsRecording)
            {
                console.log("ERR: PowerOff: You need to stop recording first.");
            }
            else
            {
                gEncoder = null;
                gLame = null;
                gNode = null;
                gAudioSrc = null;
                gAudio = null;
//                console.log("Power OFF.");
                loadRecorderHelp("sessionEnded");
                recordButton.classList.add("recorderBtnDisabled");
                stopButton.classList.add("recorderBtnDisabled");
                recordButton.style.display = "none";
                stopButton.style.display = "none";
                // recordButton.disabled = true;
                // stopButton.disabled = true;
                //Re-enable all other recorders
                $(document).find(".powerBtn").each(function ()
                {
                    $(this).removeClass("recorderBtnDisabled active");
                });

                //Enables submit for both student and sme
                if (typeof (recorderShowMP3Event) != 'undefined')
                {
                    if (typeof (settings.submit) == "function")
                    {
                        settings.submit(recorderShowMP3Event);
                    }
                    else 
                    {
                        $(document).trigger(recorderShowMP3Event);
                    }
                }
                //Display download button if file recorded file is associated
                var hasFileLink = typeof($(audioElement).data("fileLink")) != 'undefined' ? true : false;
                if(hasFileLink){
                    $("#"+containerElementId+"_downloadBtn").show();
                }
            }
        }

        function onRecord(btn)
        {
            recordButton.classList.add("recordingInProgress");
            powerButton.classList.add("recorderBtnDisabled");
            var timeleft = 3;
            var recordingTimer = setInterval(function(){
              if(timeleft <= 0){
                recordButton.classList.remove("recordingInProgress");
                recordButton.innerHTML = '<i class="fa fa-circle" title="Start recording."></i>';
                clearInterval(recordingTimer);
                
                //Revert the UCAT media Player each time so that the duration will be accurate after each recording 
                revertUcatMedia(recorderOutputContainer)

                if (settings.download)
                {
                    
                    //Empty the download container
                    downloadContainer.html("");
                }
                var creator;
                console.log("Start recording...");
                if (!gAudio)
                {
                    console.log("ERR: No Audio source.");
                }
                else if (!gEncoder)
                {
                    console.log("ERR: No encoder.");
                }
                else if (gIsRecording)
                {
                    console.log("ERR: Already recording.");
                }
                else
                {
                    if (!gNode)
                    {
                        if (!(creator = gAudioSrc.context.createScriptProcessor || gAudioSrc.createJavaScriptNode))
                        {
                            console.log("ERR: No processor creator?");
                        } else if (!(gNode = creator.call(gAudioSrc.context, gCfg.bufSz, gCfg.chnlCt, gCfg.chnlCt)))
                        {
                            console.log("ERR: Unable to create processor node.");
                        }
                    }
                    if (!gNode)
                    {
                        console.log("ERR: onRecord: No processor node.");
                    }
                    else
                    {
                        gNode.onaudioprocess = onAudioProcess;
                        gAudioSrc.connect(gNode);
                        gNode.connect(gAudioSrc.context.destination);
                        gIsRecording = true;
                        console.log("RECORD");
                        recordButton.classList.add("recorderBtnDisabled");
                        recordButton.style.display = "none";
                        stopButton.classList.remove("recorderBtnDisabled");
                        stopButton.classList.add("recordingInProgress");
                        stopButton.style.display = null;

                        //stop any media playback and lockout media players
                        //Pause any currently playing ucat media
                        if(currentPlayer != undefined){
                            var mediaId = currentPlayer.id;
                            ucatMediaPause(mediaId);
                        }
                        lockoutMedia = true;

                        //Pause any currently playing ucat media
                        if(currentPlayer != undefined){
                            var mediaId = currentPlayer.id;
                            ucatMediaPause(mediaId);
                        }

                        // powerButton.disabled = true;
                        // recordButton.disabled = true;
                        // stopButton.disabled = false;

                        //Manually created timer since the auido blob doesnt have a .duration until after it is converted to an audio source
                        //updateRecordingDuration()
                        recordingDurationInterval = setInterval(updateRecordingDuration, 1000);
                    }
                }
              }
              recordButton.innerHTML = timeleft;
              timeleft -= 1;
            }, 1000);

            
        }

        function updateRecordingDuration(){
            var startDuration = recorderDuration.data("recorderduration");
            var endDuration = startDuration+1;
            //save
            recorderDuration.data("recorderduration", endDuration)
            var recordingTime = convertSecondsToMediaPlayerFormat(endDuration);
            recorderDuration.html(recordingTime);
            //Stop Recording if recording for 10 minutes
            if(endDuration >= 600){

                if (typeof stopButton.onclick == "function") {
                    stopButton.onclick.apply(stopButton);
                }
                if (typeof powerButton.onclick == "function") {
                    powerButton.onclick.apply(powerButton);
                }

                alert("10 minute recording time limit reached.");
            }
        }

        function onStop(btn)
        {
            console.log("Stop recording...");
            if (!gAudio)
            {
                console.log("ERR: onStop: No audio.");
            }
            else if (!gAudioSrc)
            {
                console.log("ERR: onStop: No audio source.");
            }
            else if (!gIsRecording)
            {
                console.log("ERR: onStop: Not recording.");
            }
            else
            {
                gAudioSrc.disconnect(gNode);
                gNode.disconnect();
                gIsRecording = false;
                var mp3 = gEncoder.flush();
                if (mp3.length > 0)
                    gStrmMp3.push(mp3);
                showMp3(gStrmMp3);
//                console.log("STOP");
                loadRecorderHelp("recorded");
                //setupUcatMedia(recorderOutputContainer);//No need to call since since setupUcatMedia is called elswhere and will load the player controls when metadataloaded
                powerButton.classList.remove("recorderBtnDisabled");
                recordButton.classList.remove("recorderBtnDisabled");
                recordButton.style.display = null;
                recordButton.innerHTML = '<i class="fa fa-circle" title="Start recording."></i>';
                stopButton.classList.add("recorderBtnDisabled");
                stopButton.style.display = "none";
                stopButton.classList.remove("recordingInProgress");
                clearInterval(recordingDurationInterval);
                lockoutMedia = false;
            }
        }

        function onAudioProcess(e)
        {
            var inBuf = e.inputBuffer;
            var samples = inBuf.getChannelData(0);
            var sampleCt = samples.length;
            var samples16 = convertFloatToInt16(samples);
            if (samples16.length > 0)
            {
                gPcmCt += samples16.length * 2;
                var mp3buf = gEncoder.encodeBuffer(samples16);
                var mp3Ct = mp3buf.length;
                if (mp3Ct > 0)
                {
                    gStrmMp3.push(mp3buf);
                    gMp3Ct += mp3Ct;
                }

                var percent = (gMp3Ct * 100) / gPcmCt;
                var statusStr = gPcmCt + " / " + gMp3Ct + ": " + percent.toFixed(2) + "% Compressed";
                recorderStatus.html(statusStr)
                //status("%d / %d: %2.2f%%",gPcmCt,gMp3Ct,(gMp3Ct*100)/gPcmCt);
            }
        }

        function Mp3Create()
        {
            if (!(gLame = new lamejs()))
            {
                console.log("ERR: Unable to create LAME object.");
            }
            else if (!(gEncoder = new gLame.Mp3Encoder(gCfg.chnlCt, gCfg.sampleRate, gCfg.bitRate)))
            {
                console.log("ERR: Unable to create MP3 encoder.");
            }
            else
            {
                console.log("MP3 encoder created.");
            }
            return (gEncoder);
        }

        function showMp3(mp3)
        {
            //Consolidate the collection of MP3 buffers into a single data Blob.
            var blob = new Blob(gStrmMp3, { type: 'audio/mp3' });
            //Create a URL to the blob.
            var url = window.URL.createObjectURL(blob);

            //Set the source for the media media playback
            audioElement.src = url;

            //Create a link to the blob for download
            var date = new Date();
            var day = date.toLocaleDateString().split('/').join('_');
            var options = {
                hour12: true,
                hour: "numeric",
                minute: "numeric"
            }
            var time = date.toLocaleTimeString("en-US", options);
            var dateTime = day + "_" + time;

            var fileName = GUID() + ".mp3";
            if (settings.download)
            {
                $(audioElement).data("fileLink",  containerElementId + '_downloadLink');
                var downloadHTML = '<a href="' + url + '" id="' + containerElementId + '_downloadLink" download="' + fileName + '">' + fileName + '</a>';
                downloadContainer.html(downloadHTML);
            }
            recorderShowMP3Event = $.Event("recorderShowMP3");
            recorderShowMP3Event.file = new File([blob], fileName, { type: "audio/mp3" });
            recorderShowMP3Event.recorderId = recorderId;
            recorderShowMP3Event.containerElement = recorderContainerElement;
            //$(document).trigger(recorderShowMP3Event);//dont trigger until power down
        }
    };
})(jQuery);

//=======================================================TEST Cue Point Player display
var testLO = {
    "id": 66,
    "sourceMedia": {
        "id": 182,
        "mediaType": {
            "id": 1,
            "title": "Audio",
            "validExtensions": [
                "mp3"
            ]
        },
        "transcriptText": "{&quot;paragraphs&quot;:[{&quot;newParagraph&quot;:true,&quot;startTime&quot;:35.5,&quot;endTime&quot;:41.08,&quot;transcriptText&quot;:&quot;Five score years ago,&quot;,&quot;translationText&quot;:&quot;Five score years ago,&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:41.71,&quot;endTime&quot;:53.67,&quot;transcriptText&quot;:&quot;a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation.&quot;,&quot;translationText&quot;:&quot;a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:53.67,&quot;endTime&quot;:69.92,&quot;transcriptText&quot;:&quot;This momentous decree came as a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice.&quot;,&quot;translationText&quot;:&quot;This momentous decree came as a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:69.92,&quot;endTime&quot;:79.9,&quot;transcriptText&quot;:&quot;It came as a joyous daybreak to end the long night of their captivity.&quot;,&quot;translationText&quot;:&quot;It came as a joyous daybreak to end the long night of their captivity.&quot;},{&quot;newParagraph&quot;:true,&quot;startTime&quot;:79.91,&quot;endTime&quot;:91.36,&quot;transcriptText&quot;:&quot;But one hundred years later, the Negro still is not free.&quot;,&quot;translationText&quot;:&quot;But one hundred years later, the Negro still is not free.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:91.36,&quot;endTime&quot;:106.63,&quot;transcriptText&quot;:&quot;One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination.&quot;,&quot;translationText&quot;:&quot;One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:106.63,&quot;endTime&quot;:119.54,&quot;transcriptText&quot;:&quot;One hundred years later, the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity.&quot;,&quot;translationText&quot;:&quot;One hundred years later, the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:119.54,&quot;endTime&quot;:135.98,&quot;transcriptText&quot;:&quot;One hundred years later, the Negro is still languishing in the corners of American society and finds himself an exile in his own land.&quot;,&quot;translationText&quot;:&quot;One hundred years later, the Negro is still languishing in the corners of American society and finds himself an exile in his own land.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:135.98,&quot;endTime&quot;:143.53,&quot;transcriptText&quot;:&quot;So we have come here today to dramatize a shameful condition.&quot;,&quot;translationText&quot;:&quot;So we have come here today to dramatize a shameful condition.&quot;},{&quot;newParagraph&quot;:true,&quot;startTime&quot;:143.53,&quot;endTime&quot;:149.76,&quot;transcriptText&quot;:&quot;In a sense we have come to our nation’s capital to cash a check.&quot;,&quot;translationText&quot;:&quot;In a sense we have come to our nation’s capital to cash a check.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:149.76,&quot;endTime&quot;:169.49,&quot;transcriptText&quot;:&quot;When the architects of our republic wrote the magnificent words of the Constitution and the Declaration of Independence, they were signing a promissory note to which every American was to fall heir.&quot;,&quot;translationText&quot;:&quot;When the architects of our republic wrote the magnificent words of the Constitution and the Declaration of Independence, they were signing a promissory note to which every American was to fall heir.&quot;},{&quot;newParagraph&quot;:false,&quot;startTime&quot;:169.49,&quot;endTime&quot;:187.05,&quot;transcriptText&quot;:&quot;This note was a promise that all men, yes, black men as well as white men, would be guaranteed the unalienable rights of life, liberty, and the pursuit of happiness.&quot;,&quot;translationText&quot;:&quot;This note was a promise that all men, yes, black men as well as white men, would be guaranteed the unalienable rights of life, liberty, and the pursuit of happiness.&quot;}]}",
        "sourceURL": "",
        "publisher": "",
        "author": "",
        "publicationDate": "04/30/1975",
        "publicationDateDisplay": "April, 30, 1975",
        "publisherWebsite": "",
        "publisherAddress": "",
        "publisherEmail": "",
        "filePath": "media/BasicCourse/audio/bdc1a63a-3b35-4208-af55-d8456acd2072.mp3"
    },
    "transcriptMedia": {
        "id": 182,
        "mediaType": {
            "id": 1,
            "title": "Audio",
            "validExtensions": [
                "mp3"
            ]
        },
        "transcriptText": {
            "paragraphs": [
                {
                    "newParagraph": true,
                    "startTime": 35.5,
                    "endTime": 41.08,
                    "transcriptText": "Five score years ago,",
                    "translationText": "Five score years ago,"
                },
                {
                    "newParagraph": false,
                    "startTime": 41.71,
                    "endTime": 53.67,
                    "transcriptText": "a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation.",
                    "translationText": "a great American, in whose symbolic shadow we stand today, signed the Emancipation Proclamation."
                },
                {
                    "newParagraph": false,
                    "startTime": 53.67,
                    "endTime": 69.92,
                    "transcriptText": "This momentous decree came as a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice.",
                    "translationText": "This momentous decree came as a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice."
                },
                {
                    "newParagraph": false,
                    "startTime": 69.92,
                    "endTime": 79.9,
                    "transcriptText": "It came as a joyous daybreak to end the long night of their captivity.",
                    "translationText": "It came as a joyous daybreak to end the long night of their captivity."
                },
                {
                    "newParagraph": true,
                    "startTime": 79.91,
                    "endTime": 91.36,
                    "transcriptText": "But one hundred years later, the Negro still is not free.",
                    "translationText": "But one hundred years later, the Negro still is not free."
                },
                {
                    "newParagraph": false,
                    "startTime": 91.36,
                    "endTime": 106.63,
                    "transcriptText": "One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination.",
                    "translationText": "One hundred years later, the life of the Negro is still sadly crippled by the manacles of segregation and the chains of discrimination."
                },
                {
                    "newParagraph": false,
                    "startTime": 106.63,
                    "endTime": 119.54,
                    "transcriptText": "One hundred years later, the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity.",
                    "translationText": "One hundred years later, the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity."
                },
                {
                    "newParagraph": false,
                    "startTime": 119.54,
                    "endTime": 135.98,
                    "transcriptText": "One hundred years later, the Negro is still languishing in the corners of American society and finds himself an exile in his own land.",
                    "translationText": "One hundred years later, the Negro is still languishing in the corners of American society and finds himself an exile in his own land."
                },
                {
                    "newParagraph": false,
                    "startTime": 135.98,
                    "endTime": 143.53,
                    "transcriptText": "So we have come here today to dramatize a shameful condition.",
                    "translationText": "So we have come here today to dramatize a shameful condition."
                },
                {
                    "newParagraph": true,
                    "startTime": 143.53,
                    "endTime": 149.76,
                    "transcriptText": "In a sense we have come to our nation’s capital to cash a check.",
                    "translationText": "In a sense we have come to our nation’s capital to cash a check."
                },
                {
                    "newParagraph": false,
                    "startTime": 149.76,
                    "endTime": 169.49,
                    "transcriptText": "When the architects of our republic wrote the magnificent words of the Constitution and the Declaration of Independence, they were signing a promissory note to which every American was to fall heir.",
                    "translationText": "When the architects of our republic wrote the magnificent words of the Constitution and the Declaration of Independence, they were signing a promissory note to which every American was to fall heir."
                },
                {
                    "newParagraph": false,
                    "startTime": 169.49,
                    "endTime": 187.05,
                    "transcriptText": "This note was a promise that all men, yes, black men as well as white men, would be guaranteed the unalienable rights of life, liberty, and the pursuit of happiness.",
                    "translationText": "This note was a promise that all men, yes, black men as well as white men, would be guaranteed the unalienable rights of life, liberty, and the pursuit of happiness."
                }
            ]
        },
        "sourceURL": "",
        "publisher": "",
        "author": "",
        "publicationDate": "04/30/1975",
        "publicationDateDisplay": "April, 30, 1975",
        "publisherWebsite": "",
        "publisherAddress": "",
        "publisherEmail": "",
        "filePath": "media/BasicCourse/audio/bdc1a63a-3b35-4208-af55-d8456acd2072.mp3"
    },
    "languages": [
        {
            "id": 2,
            "parentId": 0,
            "parentTitle": false,
            "title": "Arabic",
            "transliterationTitle": "",
            "rtl": true
        }
    ]
}

function loadTranscriptMediaObject(containerElement, mediaObject, transcriptHighlightObject)
{
    var mediaObjectHTML = "";
    var mediaType = mediaObject.mediaType ? mediaObject.mediaType.title.toUpperCase() : mediaObject.resourceType.toUpperCase();
    var filePath = mediaObject.filePath ? mediaObject.filePath : mediaObject.sourceFilePath
    //rewrites the audio or video tag
    if (mediaObject)
    {
        switch (mediaType)
        {
            case "AUDIO":
                mediaObjectHTML += '<audio class="transcriptionMedia ucatMediaTag" src="' + filePath + '" data-fullwidth="true" data-transcripteditor="false" data-transcriptionplayer="false" data-cuepointseditor="false" data-cuepointsplayer="true" data-allowloop="true" data-allowpause="true" data-allowplaybackspeed="true" data-limitplays="0" data-showduration="true" data-showplaybacktime="true" data-showseekslider="true" data-showvolumecontrol="false" data-transcript="false" data-rewind="false"></audio>'; 
                break;
            case "VIDEO":
                mediaObjectHTML += '<video class="ucatMediaTag" src="' + filePath + '" data-allowloop="false" data-allowpause="true" data-allowplaybackspeed="false" data-limitplays="0" data-showduration="true" data-showplaybacktime="true" data-showseekslider="true" data-showvolumecontrol="true" data-transcript="false" data-transcriptionplayer="false" data-videosizetitle="standardVideoPlayer" data-cuepointseditor="false" data-cuepointsplayer="true"></video>';
                break;
        }
    }
    containerElement.html(mediaObjectHTML);
    setupUcatMedia(containerElement, { "transcriptHighlights": transcriptHighlightObject ? transcriptHighlightObject : new Array() });
}

function loadTranscriptComponent(containerElement, resource, isRtl)
{
    reconcileResourceTranscriptText(resource);
    var idPrefix = containerElement.attr("id");
    var cuePointsContainers = ''

    //if video display as a table with 2 columns obey RTL tag of component
    if(resource.resourceType == "Video"){
        cuePointsContainers += '<section class="cuePointsContainer cuePointsContent cuePointsBox" >';

        cuePointsContainers += '<div style="display:table;">';
        if(!isRtl){
            cuePointsContainers += '<div id="' + idPrefix + '_transcriptVideoContainer" style="display:table-cell; vertical-align: top;">';
            cuePointsContainers += '</div>';
        }
        
        cuePointsContainers += '<div  style="display:table-cell; vertical-align: top;">';
        cuePointsContainers += '<div id="' + idPrefix + '_contentDivHeaderTitle" class="cuePointsContentDivHeaderTitle" style=""></div>';
        cuePointsContainers += '<section id="'+idPrefix+'_contentDivSection" class="cuePointsRow cuePointsFullHeightContent" style="height:100%;"></section>';
        cuePointsContainers += '</div>';

        if(isRtl){
            cuePointsContainers += '<div id="' + idPrefix + '_transcriptVideoContainer" style="display:table-cell; vertical-align: top;">';
            cuePointsContainers += '</div>';
        }

        cuePointsContainers += '</div>';
        cuePointsContainers += '</section>';
    } else {
        cuePointsContainers += '<section class="cuePointsContainer cuePointsContent cuePointsBox" >';
        cuePointsContainers += '<div id="' + idPrefix + '_contentDivHeaderTitle" class="cuePointsContentDivHeaderTitle" style=""></div>';
        cuePointsContainers += '<section id="'+idPrefix+'_contentDivSection" class="cuePointsRow cuePointsFullHeightContent" style="height:100%;"></section>';
        cuePointsContainers += '</section>';

    }

    containerElement.html(cuePointsContainers)

    var contentDivHeaderTitle = $('#'+idPrefix+'_contentDivHeaderTitle');
    var contentDivSection = $('#' + idPrefix +'_contentDivSection');

    var language = false;
    for (var p = 0; p < resource.transcriptText.paragraphs.length; p++)
    {
        if (language == false)
            language = resource.transcriptText.paragraphs[p].language;
    }

    contentDivHeaderTitle.html("Source");
    var sourceComponentHTML = '';
    if (resource.transcriptText)
    {
        if (resource.transcriptText.paragraphs.length > 0)
        {
            var transcriptToggleHTML = '<span id="' + idPrefix + '_transcriptTextToggle" class="cuePointBtnToggleOn" style="margin:0 1rem;">Transcript</span>';
            transcriptToggleHTML += '<span id="' + idPrefix + '_translationTextToggle" class="cuePointBtnToggleOn" style="margin:0 1rem;">Translation</span>';
            contentDivHeaderTitle.html(transcriptToggleHTML);

            contentDivHeaderTitle.find("[id*='TextToggle']").on("click", { "idPrefix": idPrefix }, function (event)
            {
                toggleTranscriptTextVisibility(event.data.idPrefix, $(this));
            });
        }

        var transcriptHTML = '<div class="cuePointsCard" style="height:100%;">';
        transcriptHTML += '<div class="cuePointsCard-content" style="height:100%; padding:0;">'

        transcriptHTML += '<div class="cuePointsBox">';
        if (resource.transcriptText.paragraphs.length > 0)
        {
            transcriptHTML += '<div class="cuePointsRow cuePointsHeader">'
            transcriptHTML += '<div style="display:flex; border-bottom: 1px solid #cccccc;">';

            if (language)
                transcriptHTML += '<div class="transcriptCell" style="font-weight: 700; width:50%;">Transcript (' + htmlDecode(language.title) + ')</div>';
            transcriptHTML += '<div class="translationCell" style="font-weight: 700; width:50%;">Translation (English)</div>';
            transcriptHTML += '</div>';

            transcriptHTML += '</div>';
            transcriptHTML += '<div id="' + idPrefix + '_transcriptDiv" class="cuePointsRow cuePointsFullHeightContent" style="max-height: 300px; overflow-y: scroll; padding: 1.5rem 2rem 0;"></div>';
        }
        transcriptHTML += '<div id="' + idPrefix +'_transcriptMediaContainer" class="cuePointsRow cuePointsRowFooter" style="padding: 0 1em 1em;"></div>';
        transcriptHTML += '</div>';

        transcriptHTML += ' </div>';
        transcriptHTML += ' </div>';

        contentDivSection.html(transcriptHTML);

        //Move player to column if video
        if(resource.resourceType == "Video"){
            $('#' + idPrefix +'_transcriptVideoContainer').html($('#' + idPrefix +'_transcriptMediaContainer'))
        }

        if (resource.transcriptText.paragraphs.length > 0)
        {
            var transcriptDiv = $('#' + idPrefix + '_transcriptDiv');
            loadTranscriptData(idPrefix, resource, transcriptDiv);
            var transcriptHighlights = new Array();
            if (language)
            {
                transcriptHighlights.push({ "language": htmlDecode(language.title), "containerElementSelector": ".transcriptCell" });
                transcriptHighlights.push({ "language": "English", "containerElementSelector": ".translationCell" });
            }
            else
            {
                transcriptHighlights.push({ "language": false, "containerElementSelector": transcriptDiv });
            }
        }
        loadTranscriptMediaObject($('#' + idPrefix +'_transcriptMediaContainer'), resource, transcriptHighlights);
    }
    else
    {
        sourceComponentHTML = '<div>There is no transcript media for this resource.</div>';
        contentDivSection.html(sourceComponentHTML);
    }
}

function toggleTranscriptTextVisibility(idPrefix, toggleButton)
{
    if (toggleButton.hasClass("cuePointBtnToggleOn")){
        toggleButton.attr("class","cuePointBtnToggleOff");
    } else {
        toggleButton.attr("class","cuePointBtnToggleOn");
    }
    var transcriptTextToggle = $('#' + idPrefix +'_transcriptTextToggle');
    var transcriptCell = $(".transcriptCell");
    var translationTextToggle = $('#' + idPrefix +'_translationTextToggle');
    var translationCell = $(".translationCell");

    if (transcriptTextToggle.hasClass("cuePointBtnToggleOn"))
    {
        transcriptCell.show();
        if(translationCell.css("display") == "none"){
            transcriptCell.css("width","100%")
        } else {
            translationCell.css("width","50%")
            transcriptCell.css("width","50%")
        }
    }
    else
    {
        transcriptCell.hide();
        if(translationCell.css("display") == "block"){
            translationCell.css("width","100%")
        }
    }

    if (translationTextToggle.hasClass("cuePointBtnToggleOn"))
    {
        translationCell.show();
        if(transcriptCell.css("display") == "none"){
            translationCell.css("width","100%")
        } else {
            transcriptCell.css("width","50%")
            translationCell.css("width","50%")
        }
    }
    else
    {
        translationCell.hide();
        if(transcriptCell.css("display") == "block"){
            transcriptCell.css("width","100%")
        }
    }

}

function loadTranscriptData(idPrefix, resource, transcriptContainerElement)
{
    var language = false;
    for (var p = 0; p < resource.transcriptText.paragraphs.length; p++)
    {
        if (language == false)
            language = resource.transcriptText.paragraphs[p].language;
    }
    var transcriptHTML = '';
    var transcriptArr =[];
    var translationHTML = '';
    var translationArr =[];
    if (resource.transcriptText.paragraphs)
    {
        var paragraphOpened = false;
        for (var p = 0; p < resource.transcriptText.paragraphs.length; p++)
        {
            var paragraph = resource.transcriptText.paragraphs[p];
            if ((paragraph.newParagraph)||(p==0))
            {
                if (paragraphOpened)
                {
                    transcriptHTML += '</p></div>';
                    transcriptArr.push(transcriptHTML);
                    transcriptHTML ='';

                    translationHTML += '</p></div>';
                    translationArr.push(translationHTML);
                    translationHTML ='';

                }
                transcriptHTML += '<div id="'+idPrefix+'_transcriptCell_'+p+'" class="paragraphCell transcriptCell" style="width:50%; padding: .5rem .5rem .5rem 0;"'+(language && language.rtl ? ' dir="rtl"' : '')+'><p>';
                translationHTML += '<div id="' + idPrefix +'_translationCell_' + p +'" class="paragraphCell translationCell" style="width:50%; padding: .5rem 0 .5rem .5rem;"><p>';
                paragraphOpened = true;
            }
            var lineBreak = paragraph.lineBreak ? '<br/>':'';
            transcriptHTML += '<span data-starttime="' + paragraph.startTime + '" data-endtime="' + paragraph.endTime + '" class="cuePoint cuePointTL">' + htmlDecode(paragraph.transcriptText) + '</span>';
            transcriptHTML += lineBreak;
            translationHTML += '<span data-starttime="' + paragraph.startTime + '" data-endtime="' + paragraph.endTime + '" class="cuePoint cuePointEng">' + htmlDecode(paragraph.translationText) + '</span>';
            translationHTML += lineBreak;
        }
        if (paragraphOpened)
        {
            transcriptHTML += '</p></div>';
            transcriptArr.push(transcriptHTML);
            transcriptHTML ='';
            translationHTML += '</p></div>';
            translationArr.push(translationHTML);
            translationHTML ='';
        }
    }

    var finalOutputHTML = '<div style="">';
    for (var i = 0; i < transcriptArr.length; i++){
        finalOutputHTML += '<div style="display:flex;">'
        finalOutputHTML += transcriptArr[i];
        finalOutputHTML += translationArr[i];
        finalOutputHTML += '</div>';
    }
    finalOutputHTML += '</div>';
    transcriptContainerElement.html(finalOutputHTML);
}


function reconcileResourceTranscriptText(resource)
{
    if (typeof (resource.transcriptText) == "string")
    {
        var transcriptObj = false;
        if (resource.transcriptText.length == 0)
        {
            transcriptObj = { paragraphs: [] };
            for (var p = 0; p < resource.paragraphs.length; p++)
            {
                var text = resource.paragraphs[p].paragraph.text.length > 0 ? $(htmlDecode(resource.paragraphs[p].paragraph.text)).text() : '';
                var translationText = resource.paragraphs[p].paragraph.translations.length > 0 ? $(htmlDecode(resource.paragraphs[p].paragraph.translations[0].text)).text() : '';
                transcriptObj.paragraphs.push({ "newParagraph": true, "language": resource.paragraphs[p].paragraph.language, "startTime": 0, "endTime": 0, "transcriptText": text, "translationText": translationText });
            }
        }
        else
        {
            transcriptObj = serializeStringToJSON(resource.transcriptText);
        }
        resource.transcriptText = transcriptObj;
    }
}
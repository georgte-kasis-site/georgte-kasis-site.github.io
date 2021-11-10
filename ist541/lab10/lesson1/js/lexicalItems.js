/***************ICONS***************/
var previousHorizontalIcon               = "<i class=\"fa fa-chevron-left\"></i>";
var nextHorizontalIcon                   = "<i class=\"fa fa-chevron-right\"></i>";
var previousVerticalIcon               = "<i class=\"fa fa-arrow-up\"></i>";
var nextVerticalIcon                   = "<i class=\"fa fa-arrow-down\"></i>";

var lexicalItemsFeatureArray = [];

$(document).ready(function ()
{
    $(document).bind("moduleLoaded", function (event) { linkLexicalItems(event.containerElement); });
});


function loadGlossaryMainMenu(containerElement)
{
    if (module.moduleFeatures && module.moduleFeatures.glossary && module.lexicalItems && module.lexicalItems.length > 0)
    {
        var glossaryMenuHTML = '<div id="glossaryMenuContainer" class="glossaryMenuContainer">';
        glossaryMenuHTML += '   <div id="glossaryMenuLabel" class="glossaryMenuLabel"><i class="' + glossaryIcon + '" style="padding-left: 1em;"></i>Glossaries</div>';
        glossaryMenuHTML += '</div>';
        containerElement.append(glossaryMenuHTML);
        var glossaryMenuContainer = $("#glossaryMenuContainer");
        for (var l = 0; l < module.lexicalItems.length; l++)
        {
            if (typeof (lexicalItemsFeatureArray[module.lexicalItems[l].language.title]) == "undefined")
            {
                lexicalItemsFeatureArray[module.lexicalItems[l].language.title] = { "lang": module.lexicalItems[l].language.title, "items": [] };
            }
            lexicalItemsFeatureArray[module.lexicalItems[l].language.title].items.push(module.lexicalItems[l]);
            var vocabListContainer = $("#vocabListContainer_" + module.lexicalItems[l].language.id);
            var glossaryList = $("#glossaryList_" + module.lexicalItems[l].language.id);
            if (vocabListContainer.length == 0)
            {
                glossaryMenuHTML = '<div id="glossaryMenuListBtn_' + module.lexicalItems[l].language.id + '" class="glossaryMenuListBtn btn menuItem" data-languageid="' + module.lexicalItems[l].language.id + '"><i id="glossaryMenuIcon_' + module.lexicalItems[l].language.id + '" class="' + accordianOpen + '"></i>' + htmlDecode(module.lexicalItems[l].language.title) + '</div>';
                glossaryMenuHTML += '<div id="vocabListContainer_' + module.lexicalItems[l].language.id + '" class="vocabListContainer" style="display: none;">';
                glossaryMenuHTML += '   <div id="glossaryMenu_' + module.lexicalItems[l].language.id + '" class="glossaryMenu">';
                glossaryMenuHTML += '       <ul id="glossaryList_' + module.lexicalItems[l].language.id + '" class="glossaryList"></ul>';
                glossaryMenuHTML += '   </div>';
                glossaryMenuHTML += '</div>';
                glossaryMenuContainer.append(glossaryMenuHTML);
                vocabListContainer = $("#vocabListContainer_" + module.lexicalItems[l].language.id);
                glossaryList = $("#glossaryList_" + module.lexicalItems[l].language.id);
                $("#glossaryMenuListBtn_" + module.lexicalItems[l].language.id).bind("click", function ()
                {
                    var languageId = $(this).data("languageid");
                    toggleSubMenu("glossaryMenuIcon_" + languageId, "vocabListContainer_" + languageId, true, "glossaryMenuContainer")
                });
            }
            glossaryList.append('<li id="lexicalItemListItem_' + module.lexicalItems[l].id + '" data-lexicalitemid="' + module.lexicalItems[l].id + '" class="btn menuItem subMenuItem glossaryList' + ((l % 2 == 0) ? "Dark" : "Light") + '"><div id="vocab_' + module.lexicalItems[l].id + '" class="glossaryMenuItem" dir="' + ((module.lexicalItems[l].language.rtl) ? "rtl" : "ltr") + '">' + htmlDecode(module.lexicalItems[l].text) + '</div></li>');
            $("#lexicalItemListItem_" + module.lexicalItems[l].id).bind("click", function ()
            {
                var lexicalItemId = $(this).data("lexicalitemid");
                openLexicalItem(lexicalItemId);
            });
        }
    }
}


function linkLexicalItems(containerElement)
{
    if (module.moduleFeatures && module.moduleFeatures.glossary && module.lexicalItems && module.lexicalItems.length > 0)
    {
        containerElement.find(".vocab").each(function ()
        {
            var lexicalItemSpan = $(this);
            var lexicalItemText = lexicalItemSpan.html();
            var lexicalItemId = parseInt(lexicalItemSpan.data("rootid"));
            lexicalItemSpan.attr("title", "");
            var vocabTranslationId = parseInt(lexicalItemSpan.data("translationid"));

            var translationText = "No translation available";
            if (typeof (lexicalItemId) == "undefined")
            {
                lexicalItemId = 0;
                for (i = 0; i < module.lexicalItems.length; i++)
                {
                    if (lexicalItemText.toUpperCase() == module.lexicalItems[i].text.toUpperCase())
                        lexicalItemId = module.lexicalItems[i].id;

                }
            }

            for (i = 0; i < module.lexicalItems.length; i++)
            {
                if (lexicalItemId == module.lexicalItems[i].id)
                {
                    if (vocabTranslationId > 0)
                    {
                        for (var j = 0; j < module.lexicalItems[i].translations.length; j++)
                        {
                            if (vocabTranslationId == module.lexicalItems[i].translations[j].id)
                            {
                                translationText = module.lexicalItems[i].translations[j].text;
                                break;
                            }
                        }
                    }
                    else if (module.lexicalItems[i].translations.length > 0)
                        translationText = module.lexicalItems[i].translations[0].text;
                }
            }
            if (lexicalItemId > 0)
            {
                lexicalItemSpan.addClass("tTipLexical");
                lexicalItemSpan.css("cursor", "pointer");
                lexicalItemSpan.data("translation", translationText);
                var elementDataString = htmlDecode(lexicalItemSpan.data("translation"));
                initToolTip({ "element": lexicalItemSpan, "elementDataString": elementDataString, "tooltipClass": "lightVersion", "tooltipDelay": 200 })
                lexicalItemSpan.on("click", function ()
                {
                    openLexicalItem(lexicalItemId);
                })
            }
            else
            {
                lexicalItemSpan.removeClass("vocab");
            }
        });
    }
}

function openLexicalItem(lexicalItemId)
{
    var langArr = false;
    var lexicalItem;
    var lexicalItemIndex;//Need this to for pager next prev
    langLoop: for (var i in lexicalItemsFeatureArray)
    {
        langArr = lexicalItemsFeatureArray[i]
        for (var j = 0; j < langArr.items.length; j++)
        {
            if (langArr.items[j].id == lexicalItemId)
            {
                lexicalItem = langArr.items[j];
                lexicalItemIndex = j;
                break langLoop;
            }
        }
    }
    if (langArr)
    {
        var iconHTML = spf('<i class="icon ~"></i>', [glossaryIcon]);
        var multipleWords = langArr.items.length > 1 ? true : false;
        //THIS LAYOUT IS FOR IF WE DECIDE TO IMPLEMENT A DIFFERENT LAYOUT FOR A FOREIGN LANGUAGE LAYOUT"
        var glossaryLayout = "Default";//Default Layout. Future placeholder for a possible configuration global variable by language.
        var title = langArr.lang + "&nbsp;Lexical Item";
        var prevLexicalItemBtn = nextLexicalItemBtn = titleParent = ""

        var titleBlock = spf('<div class="glossaryTitle">~~</div>', [title, multipleWords ? "s" : ""]);
        var contentBlock = $('<div id="id_contentBlock"></div>')
        if (multipleWords)
        {
            var prevLexicalItemBtn = spf('<div id="id_vocabPrev" class="~">~</div>', [lexicalItemIndex > 0 ? "btn" : "btnOff", previousHorizontalIcon]);
            var nextLexicalItemBtn = spf('<div id="id_vocabNext" class="~">~</div>', [lexicalItemIndex == langArr.items.length - 1 ? "btnOff" : "btn", nextHorizontalIcon]);
            var lexicalItemNavBar = spf('<div id="id_lexicalItemNavBar" class="lexicalItemNavBar">~ <div class="lexicalItemsStatus"><span id="id_lexicalItemIndex">~</span> of <span id="id_lexicalItemCnt">~</span> Lexical Items</div> ~</div>', [prevLexicalItemBtn, lexicalItemIndex + 1, langArr.items.length, nextLexicalItemBtn]);
            titleParent = "glossary"
            contentBlock.append(lexicalItemNavBar)
        }

        var containerElement = $('<div id="id_glossaryContainer"></div>');   //"id_glossaryContainer"
        contentBlock.append(containerElement);
        generateGlossaryMarkup(lexicalItem, multipleWords, glossaryLayout, containerElement);

        openCustomDialog((title + (multipleWords ? "s" : "")), contentBlock, titleParent, iconHTML);
        setupUcatMedia(containerElement);
        $(containerElement).data("vocab_index", lexicalItemIndex);//used for next/prev navigation

        if (multipleWords == true)
        {
            bindVocabPrevNext(langArr.items, glossaryLayout);
        }
        $(".lexicalItemTranslationContainer").find(".vocabImageBtn").each(function ()
        {
            var elementDataString = "<img src=" + $(this).data("imageresource") + " style='max-width: 240px; height: auto;' />";
            initToolTip({ "element": $(this), "elementDataString": elementDataString, "tooltipClass": "lightVersion" });
        });
        setLanguageFontSV($("#id_glossaryContainer"));
    }
}

function toggleLexicalVariant(id)
{
    var variantIcon = $("#" + id)
    var lexicalVariantWrapper = $("#id_lexicalVariantWrapper")
    $("#id_allLexicalNoteWrapper").hide()
    $("#id_glossaryContainer").find(".activityButtonAlternateActive").each(function () { $(this).removeClass("activityButtonAlternateActive") })

//    $("#id_lexicalNoteWrapper").data("noteId", "")
    if (lexicalVariantWrapper.css("display") == "none")
    {
        //show variant
        $("#id_allVocabTranslationsContainer").hide();
        lexicalVariantWrapper.show();
        variantIcon.addClass("activityButtonAlternateActive")
    } else
    {
        $("#id_allVocabTranslationsContainer").show()
        lexicalVariantWrapper.hide();
        variantIcon.removeClass("activityButtonAlternateActive")
    }
}

function generateGlossaryMarkup(lexicalItem, multipleWords, glossaryLayout, containerElement){
    var generateFunctionName = "generate" + glossaryLayout + "LexicalItemMarkup";
	var glossaryHTML = window[resolveActivityComponentFunctionName(generateFunctionName, "generateDefaultLexicalItemMarkup")](lexicalItem, containerElement)
    containerElement.append( glossaryHTML );
}

function calculateVocabContentArea(){
        var vocabContainerWidth;
        var availableWidth = $(window).width();
        var bufferWidth = parseInt(availableWidth*.40);//get 40% of available window width for right and left margins
        vocabContainerWidth = parseInt(availableWidth - bufferWidth);
        return vocabContainerWidth;
}

function setVocabContentArea(){
    if($("#id_vocabContentContainer").length > 0 ) {
        $("#id_vocabContentContainer").css("width",calculateVocabContentArea());
    } else {
        $(window).off("resize",setVocabContentArea);
    }
}

function getStandardBuffer() {
		
  return '<div class="spacerBlock">&nbsp;</div>'
}
		
function generateDefaultLexicalItemMarkup(lexicalItem, containerElement) {
    //important: #id_popUpDialog-popup has max-width: 80% !important; productStyle.css the vocabContentContainer must not exceed this.
	
	var vocabContentContainer = $('<div id="id_vocabContentContainer" class="vocabContentContainer"></div>' );
	
/*
    var lexicalNotes = lexicalItem.notes;
    //--Note
    if (lexicalNotes.length > 0) 
    {
		containerElement.append( loadGenericNoteBuilder("lexicalItem", "glossaryContainer", {}, lexicalNotes, false, {"alternateClass":"activityButtonAlternate", "alternateFn":"openLexicalNote"} ) )
    }
*/    
    //---------------------------------------------------------------
    var vocabDetailsContainer = $('<div class="vocabDetailsContainer"></div>' );

	    //Text "Lexical Item"
		var lexicalItemHTML = '<div class="lexicalItemTextWrapper">';

	    lexicalItemHTML += spf('<div class="lexicalItemText"~>~</div>', [ lexicalItem.language.rtl ? " dir='rtl'" : "", htmlDecode(lexicalItem.text)] );

	    //Variant Text
	    if(lexicalItem.variants.length > 0){
	    	//lexicalItemHTML += getStandardBuffer();
		    lexicalItemHTML += spf('<div class="lexicalItemVariantText" ~>',[lexicalItem.language.rtl ? " dir='rtl'" : ""]);
		    for(var i=0; i<lexicalItem.variants.length; i++) {
		    	var txt = stripRTLDiv( htmlDecode(lexicalItem.variants[i].text) ).text;

		    	
		    	lexicalItemHTML += lexicalItem.language.rtl ? '' : '<span class="lexicalItemVariantTextDivider"> / </span>';
		    	lexicalItemHTML += txt;
		    	lexicalItemHTML += lexicalItem.language.rtl ? '<span class="lexicalItemVariantTextDivider"> / </span>': '';
		    }
			lexicalItemHTML += '</div>';
		}
	    if(lexicalItem.variants.length > 0){
			lexicalItemHTML += '<span title="Show Variant(s) Details" id="activityNoteDiv_'+lexicalItem.id+'" class="activityButtonAlternate" style="vertical-align: middle;" onclick="toggleLexicalVariant(\'activityNoteDiv_'+lexicalItem.id+'\')"><i class="'+lexicalItemPartsOfSpeechIcon+'"></i></span>';
		}

		//Alternate Text
	    if(lexicalItem.alternateText.length > 0){
	    	lexicalItemHTML += getStandardBuffer();
		    lexicalItemHTML += '<div class="lexicalItemAltText">' + htmlDecode(lexicalItem.alternateText) + '</div>';
		}
		lexicalItemHTML += "</div>"; //END lexicalItemTextWrapper

		vocabDetailsContainer.append( lexicalItemHTML );

		//begin pronunciation
        if(lexicalItem.pronunciations.length > 0) {
            vocabDetailsContainer.append( getStandardBuffer() );
            var hasBrackets = false;
			var pronunciationContainer = $('<div class="allPronunciations"></div>');
			var lexicalItemPronuniciationHTML = "" 
            for(var i=0; i<lexicalItem.pronunciations.length; i++) {
                lexicalItemPronuniciationHTML += '<div class="pronunciationWrapper">';

                if(lexicalItem.pronunciations[i].audioResource) {
                    lexicalItemPronuniciationHTML += "<span>";
                    lexicalItemPronuniciationHTML += "<audio id=\"lexicalItemAudioPlayer_"+lexicalItem.id+"_"+lexicalItem.pronunciations[i].audioResource.id+"\" src=\""+lexicalItem.pronunciations[i].audioResource.sourceFilePath+"\" type=\"audio/mp3\" data-fullplayer='false'></audio>";
                    lexicalItemPronuniciationHTML += "</span>";
                }

                if(lexicalItem.pronunciations[i].text) {
					hasBrackets = true;
					lexicalItemPronuniciationHTML += "<span>" + lexicalItem.pronunciations[i].text + "</span>";
				}
                if(lexicalItem.pronunciations[i].title) {
					hasBrackets = true;
                    lexicalItemPronuniciationHTML += '<span>&nbsp;(' + lexicalItem.pronunciations[i].title + ')</span>';
                }
				
				lexicalItemPronuniciationHTML += "</div>";  //END pronunciationWrapper

                if( (lexicalItem.pronunciations.length) > 1 && (i != lexicalItem.pronunciations.length-1))
                    lexicalItemPronuniciationHTML += ' ; '
            }
            pronunciationContainer.append( lexicalItemPronuniciationHTML );
			if( hasBrackets ) {
				pronunciationContainer.prepend( '<span class="endCap">[</span>' );
				pronunciationContainer.append( '<span class="endCap"> ]</span>' );
			}
			vocabDetailsContainer.append( pronunciationContainer );
		}
    
    vocabContentContainer.append( vocabDetailsContainer );
	containerElement.append( vocabContentContainer );
    generateTranslationMarkup(lexicalItem, containerElement);
    if(lexicalItem.variants.length > 0){
	    generateVariantMarkup(lexicalItem, containerElement);
	}
    setLanguageFontSV( $("#id_glossaryContainer") );
}

function generateVariantMarkup(lexicalItem, containerElement){
	var variantHTML = ''
	variantHTML += '<div id="id_lexicalVariantWrapper" class="lexicalVariantWrapper"><div id="id_variantContent" class="lexicalVariantContent">'

    var posArray = [];
    for(var j=0; j < lexicalItem.translations[0].grammarFeatures.length; j++){
        posArray.push(lexicalItem.translations[0].grammarFeatures[j].abbreviation);
    }
    var posString = posArray.join();
	var posStringOutput = '&nbsp;&nbsp;<span class="lexicalItemPoS">(' + posString + ') </span>';

    variantHTML += spf('<div class=""><span ~>~</span>~</div>', [ lexicalItem.language.rtl ? " dir='rtl'" : "", htmlDecode(lexicalItem.text), posStringOutput] );
    variantHTML += '<div style="margin-left:1em;">' + htmlDecode(lexicalItem.translations[0].text) + '</div>';

    for(var i=0; i<lexicalItem.variants.length; i++) {
    	var txt = stripRTLDiv( htmlDecode(lexicalItem.variants[i].text) ).text;
    	variantHTML += spf('<span ~>',[ lexicalItem.language.rtl ? " dir='rtl'" : ""])
    	variantHTML += txt;
    	variantHTML += '</span>';

    	if(lexicalItem.variants[i].grammarFeatures.length > 0){
		    var posArray = [];
		    for(var j=0; j < lexicalItem.variants[i].grammarFeatures.length; j++){
		        posArray.push(lexicalItem.variants[i].grammarFeatures[j].abbreviation);
		    }
		    var posString = posArray.join();
			var posStringOutput = '&nbsp;&nbsp;<span class="lexicalItemPoS">(' + posString + ') </span>';
			variantHTML += posStringOutput;
		}
    	variantHTML += '</div>';

    	if(lexicalItem.variants[i].description.length > 0){
    		variantHTML += '<div style="margin-left:1em;">' + htmlDecode(lexicalItem.variants[i].description) + '</div>';
    	}

    }
	

	variantHTML += '</div></div>';
	containerElement.append( variantHTML );
}

function generateTranslationMarkup(lexicalItem, containerElement){
    var translationHTML = "";
    //NOTE Wrapper
//	var noteDivHTML = '<div id="id_allLexicalNoteWrapper" class="allLexicalNoteWrapper"><div id="id_lexicalNoteWrapper" class="lexicalNoteWrapper"></div></div>'
//	translationHTML += noteDivHTML;
    //---------------------------------------------------------------
	translationHTML += '<div id="id_allVocabTranslationsContainer" class="allVocabTranslationsContainer" data-translationIndex="0">';
	translationHTML += '<div class="lexicalItemTranslationsWrapper">';
    if(lexicalItem.translations.length > 0)
    { 
        //create next Prev translation buttons if length > 1;
		translationHTML += '<div class="lexicalItemTranslationsRow">';
		translationHTML += '<div class="lexicalItemTranslations">';
		translationHTML += spf('<div id="id_prevTranslation" class="transPrevBtn btnOff"~>', [ lexicalItem.translations.length > 1 ? 'onclick="prevTranslation()"' : ''] );
            translationHTML += lexicalItem.translations.length > 1 ? spf('<span class="translationNavBtn">~</span>',[previousHorizontalIcon]) : "&nbsp;";
		translationHTML += '</div>';
        translationHTML += '<div class="lexicalItemTranslation">'
        for(var i=0; i<lexicalItem.translations.length; i++) {
            var sampleCount = 0;
            if(lexicalItem.translations[i].samples.length > 0){
                sampleCount = lexicalItem.translations[i].samples.length
            }

            translationHTML += spf('<div id="id_vocabTranslationContainer_~" class="lexicalItemTranslationContainer" data-sampleCount="~"  data-transIndex="~" data-sampleIndex="0"~>',[i, sampleCount, i, i > 0 ? " style='display:none'" : ""]);
			translationHTML += '<div class="translationText">';
            if( lexicalItem.translations[i].grammarFeatures.length >0 ) {
                var posArray = [];

                for(var j=0; j < lexicalItem.translations[i].grammarFeatures.length; j++){
                    posArray.push(lexicalItem.translations[i].grammarFeatures[j].abbreviation);
                }
                var posString = posArray.join();
                translationHTML += '<div class="lexicalItemPoS">(' + posString + ') </div>&nbsp;&nbsp;';
			}


            translationHTML += '<div>' + htmlDecode(lexicalItem.translations[i].text) + '</div>';

            //imageRollover
            if( lexicalItem.translations[i].imageResource ) {
                translationHTML += '<div class="vocabImageBtn tTip" title="" data-imageresource="'+lexicalItem.translations[i].imageResource.sourceFilePath+'"><i class="'+lexicalItemImageIcon+'"></i></div>';
            }
			translationHTML += '</div>';
			if(lexicalItem.translations[i].samples.length > 0){
	            translationHTML += generateSampleMarkup(lexicalItem, i);
	        }

            translationHTML += "</div>"; //END lexicalItemTranslationContainer
        }
        translationHTML += '</div>' //END lexicalItemTranslation
        //create next Prev translation buttons if length > 1;
        translationHTML += spf('<div id="id_nextTranslation" class="transNextBtn btn"~>', [ lexicalItem.translations.length > 1 ? 'onclick="nextTranslation()"' : ''] );
        translationHTML += lexicalItem.translations.length > 1 ? spf('<span class="translationNavBtn">~</span>',[nextHorizontalIcon]) : "&nbsp;";
        translationHTML += '</div>' 
        translationHTML += '</div>' //END lexicalItemTranslations
        translationHTML += '</div>' //END lexicalItemTranslationsRow
    }
	translationHTML += '</div>' //END lexicalItemTranslationsWrapper
    translationHTML += "</div>";//END allVocabTranslationsContainer
    //---------------------------------------------------------------
    containerElement.append( translationHTML );
}

function generateSampleMarkup(lexicalItem, transIndex) {
	var sampleSentenceItem = lexicalItem.translations[transIndex].samples; 
	sampleHTML = '<div class="allSampleSentenceContainer">';
    if(sampleSentenceItem.length > 0) {
		for(var j=0; j<sampleSentenceItem.length; j++) {
            sampleHTML += spf('<div id="id_sampleSentenceContainer_~_~" class="sampleSentenceContainer" style="~ ~">',[transIndex, j, j > 0 ? "display:none;" : "", ""]);
				sampleHTML += '<div class="sampleSentence">'
					if(sampleSentenceItem[j].paragraph.audioResource) {
						sampleHTML += '<div class="sampleAudioContainer">';
						sampleHTML += '<audio id="lexicalItemAudioPlayer_'+sampleSentenceItem[j].id+'_'+sampleSentenceItem[j].paragraph.audioResource.id+'" src="'+sampleSentenceItem[j].paragraph.audioResource.sourceFilePath+'" type="audio/mp3" data-fullplayer="false"></audio>';
						sampleHTML += "</div>";
					}
					sampleHTML += spf('<div class="sampleTextContainer">~</div>', [htmlDecode(sampleSentenceItem[j].paragraph.text)]);
			        if(sampleSentenceItem.length > 1) {
						sampleHTML += '<div class="sampleNavContainer">';
							sampleHTML += spf('<div class="samplePrevBtn" onclick="prevSample(~)"><span id="id_prevSample_~_~" class="sampleNavBtn btnOff">~</span></div>',[transIndex, transIndex, j, previousVerticalIcon]);
						sampleHTML += "</div>";
					}
				sampleHTML += "</div>"  //END sampleSentence
				sampleHTML += spf('<div class="sampleTranslation" ~>', [sampleSentenceItem[j].paragraph.translations.length > 0 ? ' style="border-top:1px solid #cccccc;" ' : ""] );
				if(sampleSentenceItem[j].paragraph.audioResource) {
					sampleHTML += '<div class="sampleAudioContainer">&nbsp;</div>';
				}						
				sampleHTML += spf('<div class="sampleTranslationContainer">~</div>', [sampleSentenceItem[j].paragraph.translations.length > 0 ? htmlDecode(sampleSentenceItem[j].paragraph.translations[0].text) : ""] );
				if(sampleSentenceItem.length > 1) {
					sampleHTML += '<div class="sampleNavContainer">';
						sampleHTML += spf('<div class="sampleNextBtn" onclick="nextSample(~)"><span id="id_nextSample_~_~" class="sampleNavBtn btn">~</span></div>',[transIndex, transIndex, j, nextVerticalIcon]);
					sampleHTML += "</div>";
				}
				
				sampleHTML += "</div>" //END sampleTranslation
				
		sampleHTML += "</div>" //END sampleSentenceContainer;
		}
		//sampleHTML += "</div>";
    }
	sampleHTML += "</div>" //END allSampleSentenceContainer;
    return sampleHTML;
}

function bindVocabPrevNext(glossary_arr, glossaryLayout) 
{
	var generateFunctionName = "generate"+glossaryLayout+"VocabMarkup"

    //bind click events to vocab next prev buttons
	$("#id_vocabPrev").bind("click", {glossary_arr: glossary_arr, glossary_length:glossary_arr.length}, function(event) 
	{
		var containerElement = $("#id_glossaryContainer")
		var current_index =  containerElement.data("vocab_index");
		if(current_index > 0) 
		{
			current_index--;
			containerElement.empty()
			window[resolveActivityComponentFunctionName(generateFunctionName, "generateDefaultLexicalItemMarkup")](glossary_arr[current_index], containerElement);
            setupUcatMedia(containerElement);
			$("#id_popUpContent").find('video').each(function () 
			{
				resizeVideoMedia($(this), smallVideoPlayer)
			})
            setupUcatMedia($("#id_popUpContent"));
			$("#id_vocabTranslationContainer_0").find(".vocabImageBtn").each(function()
			{
			    var elementDataString = "<img src="+$(this).data("imageresource")+" style='max-width: 240px; height: auto;' />";
			    initToolTip({ "element": $(this), "elementDataString":elementDataString,"tooltipClass":"lightVersion"} );
			});

		} 
		if( current_index == 0 )
			$(this).switchClass( "btn", "btnOff" );
		if( current_index < event.data.glossary_length-1 )
			$("#id_vocabNext").switchClass( "btnOff", "btn" ) ;
		$("#id_lexicalItemIndex").html( current_index + 1 );
		containerElement.data("vocab_index", current_index);
	});

	$("#id_vocabNext").bind("click", {glossary_arr: glossary_arr, glossary_length:glossary_arr.length}, function(event) 
	{
		var containerElement = $("#id_glossaryContainer")
		var current_index = containerElement.data("vocab_index");
		if( current_index < event.data.glossary_length-1 ) 
		{
			current_index++;
			containerElement.empty()
			window[resolveActivityComponentFunctionName(generateFunctionName, "generateDefaultLexicalItemMarkup")](glossary_arr[current_index],containerElement );
            setupUcatMedia(containerElement);
			$("#id_popUpContent").find('video').each(function () 
			{
				resizeVideoMedia($(this), smallVideoPlayer)
			})
		
            setupUcatMedia($("#id_popUpContent"));
			$("#id_vocabTranslationContainer_0").find(".vocabImageBtn").each(function()
			{
			    var elementDataString = "<img src="+$(this).data("imageresource")+" style='max-width: 240px; height: auto;' />";
			    initToolTip({ "element": $(this), "elementDataString":elementDataString,"tooltipClass":"lightVersion"} );
			});
		}
		if( current_index == event.data.glossary_length-1 )
			$(this).switchClass( "btn", "btnOff" );
		if( current_index > 0 )
			$("#id_vocabPrev").switchClass( "btnOff", "btn" );
		$("#id_lexicalItemIndex").html( current_index + 1 );
		containerElement.data("vocab_index", current_index);
	});
}

function prevTranslation() 
{
    var translationCount = $(".lexicalItemTranslationContainer").length;
    var translationIndex = $("#id_allVocabTranslationsContainer").data("translationindex");

    if( translationIndex > 0 ) 
    {
        $("#id_vocabTranslationContainer_"+translationIndex).hide( "slide", { direction: "left", duration: 100 }, function()
        {
			translationIndex--;
			$("#id_vocabTranslationContainer_"+translationIndex).show("slide", { direction: "right", duration: 200 });
			$("#id_allVocabTranslationsContainer").data("translationindex", translationIndex)
			  
			if( translationIndex == 0 )
				$("#id_prevTranslation").switchClass( "btn", "btnOff" );
			if( translationIndex >= 0 )
				$("#id_nextTranslation").switchClass( "btnOff", "btn" );
		});
	}
}

function nextTranslation() 
{
    var translationCount = $(".lexicalItemTranslationContainer").length;
    var translationIndex = $("#id_allVocabTranslationsContainer").data("translationindex");
	
    if( translationIndex < translationCount-1 ) 
    {
	    $("#id_vocabTranslationContainer_"+translationIndex).hide( "slide", { direction: "right", duration: 100 }, function() 
	    {
			translationIndex++;

			$("#id_vocabTranslationContainer_"+translationIndex).show("slide", { direction: "left", duration: 200 });
			$("#id_allVocabTranslationsContainer").data("translationindex", translationIndex)

			if( translationIndex == translationCount-1 )
				$("#id_nextTranslation").switchClass( "btn", "btnOff" );
			if( translationIndex > 0 )
				$("#id_prevTranslation").switchClass( "btnOff", "btn" );
		})
	}
}


function prevSample(transIndex) 
{
    var sampleContainer = $("#id_vocabTranslationContainer_"+transIndex);
    var sampleCount = sampleContainer.data("samplecount");
    var sampleIndex = sampleContainer.data("sampleindex");
    
    if( sampleIndex > 0 ) 
    {
        $("#id_sampleSentenceContainer_"+transIndex+"_"+sampleIndex).hide("slide", { direction: "down" }, "fast", function()
        {
			sampleIndex--;

			$("#id_sampleSentenceContainer_"+transIndex+"_"+sampleIndex).show("slide", { direction: "up" }, "fast");
			sampleContainer.data("sampleindex", sampleIndex)  

			if( sampleIndex == 0 )
				$("#id_prevSample_"+transIndex+"_"+sampleIndex).switchClass( "btn", "btnOff" );
			if( sampleIndex >= 0 )
				$("#id_nextSample_"+transIndex+"_"+sampleIndex).switchClass( "btnOff", "btn" );
		});
	}
}


function nextSample(transIndex) {
    var sampleContainer = $("#id_vocabTranslationContainer_"+transIndex);
    var sampleCount = sampleContainer.data("samplecount");
    var sampleIndex = sampleContainer.data("sampleindex");

    if( sampleIndex < sampleCount-1 ) {
		$("#id_sampleSentenceContainer_"+transIndex+"_"+sampleIndex).hide("slide", { direction: "up" }, "fast", function() {
			sampleIndex++;

			$("#id_sampleSentenceContainer_"+transIndex+"_"+sampleIndex).show("slide", { direction: "down" }, "fast");
			sampleContainer.data("sampleindex", sampleIndex)

			if( sampleIndex == (sampleCount-1) )
				$("#id_nextSample_"+transIndex+"_"+sampleIndex).switchClass( "btn", "btnOff" );
			if( sampleIndex > 0 )
				$("#id_prevSample_"+transIndex+"_"+sampleIndex).switchClass( "btnOff", "btn" );
		});
	}
}



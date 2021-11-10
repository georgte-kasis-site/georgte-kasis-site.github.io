// Concentration game global variables
var lockGameboard = false;
var hasFlippedCard = false;
var firstCardSelected, secondCardSelected;
var concentrationCardsArray = [];
var concentrationCardsMatchedArray = [];
var concentrationCardTurnsUsed = 0;
var gameboardCardLimit = 20;
var concentrationCardDecks = [];
var concentrationCardDecksIndex = 0;
var cron;
var second = 0;
var minute = 0;
var timerStarted = false;

// Carousel global variables
var carouselFlashcardsArray = [];
var carouselCount = 0;

// Flashcards global variables
var flashcardsArray = [];

function loadLexicalItemActivityComponent(containerElement, activityComponent) {
	switch (activityComponent.renderMode) {
		case 0:
			loadFlashcardsActivityComponent(containerElement, activityComponent);
			break;
        case 100:
            loadCarouselFlashcardsActivityComponent(containerElement, activityComponent);
            break;
		case 200:
			loadConcentrationGameActivityComponent(containerElement, activityComponent, 'text');
			break;
        case 300:
            loadConcentrationGameActivityComponent(containerElement, activityComponent, 'image');
			break;
        case 400:
            loadConcentrationGameActivityComponent(containerElement, activityComponent, 'audio');
			break;
	}
}

function loadFlashcardsActivityComponent(containerElement, activityComponent) {
    var flashcardsActivityHTML = '';
    flashcardsArray = [...module.lexicalItems];

    flashcardsActivityHTML += `<div id="flashcardsContainer_${activityComponent.id}" class="flashcardsContainer tabDetails"></div>`;

    containerElement.html(flashcardsActivityHTML);

    flashcardsArray.forEach(lexicalItemObj => loadFlashcardItem($(`#flashcardsContainer_${activityComponent.id}`), lexicalItemObj, activityComponent.id));
}

function loadCarouselFlashcardsActivityComponent(containerElement, activityComponent) {
    carouselCount = 0;
    carouselFlashcardsArray = [...module.lexicalItems];

    var carouselFlashcardsActivityHTML = '';
    carouselFlashcardsActivityHTML += '<div class="carouselFlashcardsContainer tabDetails">';
    carouselFlashcardsActivityHTML += `     <div id="carouselFlashcardSlider_${activityComponent.id}" class="carouselFlashcardsSlider"></div>`;
    carouselFlashcardsActivityHTML += '     <div class="carouselFlashcardsControls">';
    carouselFlashcardsActivityHTML += `         <div id="carouselFlashcardBtnLeft_${activityComponent.id}" class="btnGrey"><i class="fa fa-arrow-left"></i></div>`;
    carouselFlashcardsActivityHTML += `         <div id="carouselFlashcardBtnRight_${activityComponent.id}" class="btnGrey"><i class="fa fa-arrow-right"></i></div>`;
    carouselFlashcardsActivityHTML += '     </div>';
    carouselFlashcardsActivityHTML += '</div>';

    containerElement.html(carouselFlashcardsActivityHTML);

    shuffleArray(carouselFlashcardsArray);
    carouselFlashcardsArray.forEach((lexicalItemObj, i) => loadFlashcardItem($(`#carouselFlashcardSlider_${activityComponent.id}`), lexicalItemObj, activityComponent.id, true, (i == 0 ? true : '')));
    
    var carouselFlashcardBtnRight = $(`#carouselFlashcardBtnRight_${activityComponent.id}`);
    carouselFlashcardBtnRight.on('click', function () {
        carouselShowNextItem(activityComponent.id);
    });

    var carouselFlashcardBtnLeft = $(`#carouselFlashcardBtnLeft_${activityComponent.id}`);
    carouselFlashcardBtnLeft.on('click', function () {
        carouselShowPreviousItem(activityComponent.id);
    });
}

function carouselShowNextItem(activityComponentId) {
    var carouselItems = $(`#carouselFlashcardSlider_${activityComponentId} > div`);
    carouselItems.eq(carouselCount).removeClass('carouselActive');
    if (carouselCount < carouselItems.length - 1) {
        carouselCount++;
    } else {
        carouselCount = 0;
    }

    carouselItems.eq(carouselCount).addClass('carouselActive');
}

function carouselShowPreviousItem(activityComponentId) {
    var carouselItems = $(`#carouselFlashcardSlider_${activityComponentId} > div`);
    carouselItems.eq(carouselCount).removeClass('carouselActive');
    if (carouselCount > 0) {
        carouselCount--;
    } else {
        carouselCount = carouselItems.length - 1;
    }

    carouselItems.eq(carouselCount).addClass('carouselActive');
}

function loadFlashcardItem(containerElement, lexicalItemObj, activityComponentId, carouselItems=false, carouselInit=false) {
    var renderFrontRtl = lexicalItemObj.language && lexicalItemObj.language.rtl ? true : false;
    var renderBackRtl = lexicalItemObj.translations.language && lexicalItemObj.translations.language.rtl ? true: false;
	var flashcardId = `${activityComponentId}_${lexicalItemObj.id}`;
	var flashcardFrontText = lexicalItemObj.text;
	var flashcardBackText = lexicalItemObj.translations.map(translations => translations.text).join('; ');

    var flashcardItemHTML = '';
    flashcardItemHTML += `<div id="flashcardScene_${flashcardId}" class="flashcardScene ${carouselItems ? (carouselInit ? 'carouselHidden carouselActive' : 'carouselHidden') : ''}">`;
    flashcardItemHTML += `	<div class="flashcardFrontFace" ${renderFrontRtl ? 'dir="rtl"' : ''}>${flashcardFrontText}</div>`;
    flashcardItemHTML += `	<div class="flashcardBackFace" ${renderBackRtl ? 'dir="rtl"' : ''}>${flashcardBackText == '' ? 'No translation provided' : flashcardBackText}</div>`;
    flashcardItemHTML += '</div>';

	containerElement.append(flashcardItemHTML);

	var flashcardScene = $(`#flashcardScene_${flashcardId}`);
	flashcardScene.on('click', function () {
		flashcardScene.toggleClass('flashcardFlip');
	});
}

function loadConcentrationGameActivityComponent(containerElement, activityComponent, gameType='text') {
    var renderRtl = activityComponent.renderRTL;
    concentrationCardsArray = [];
	concentrationCardTurnsUsed = 0;
    concentrationCardDecks = [];
    concentrationCardDecksIndex = 0;
    firstCardSelected = null;
    secondCardSelected = null;
    lockGameboard = false;
    hasFlippedCard = false;
    timerStarted = false;
    second = 0;
    minute = 0;
    clearInterval(cron);

    module.lexicalItems.forEach(lexicalItemObj => createConcentrationPairCards(lexicalItemObj, concentrationCardsArray, gameType));
    createConcentrationCardDecks(); // Create concentration card decks which is a 2d global array to hold our card decks
    shuffleArray(concentrationCardDecks[concentrationCardDecksIndex]);  // Shuffles the first deck

    var concentrationGameAcitivityHTML = '';
    concentrationGameAcitivityHTML += `<div style="display: flex;" class="tabDetails">`;
    concentrationGameAcitivityHTML += '  <div>';
    concentrationGameAcitivityHTML += '  <div class="concentrationGameStatBox">'
    concentrationGameAcitivityHTML += '     <div class="concentrationGameStatContainer">';
    concentrationGameAcitivityHTML += '         <div class="concentrationGameStatColContainer. concentrationGameTurnsContainer">';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatHeader" style="-webkit-border-top-left-radius: 6px;-moz-border-radius-topleft: 6px; border-top-left-radius: 6px;">Turns</div>';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatRowContainer">';
    concentrationGameAcitivityHTML += `                 <div id="concentrationGameTurnCounter_${activityComponent.id}" class="concentrationGameStat">${concentrationCardTurnsUsed}</div>`;
    concentrationGameAcitivityHTML += '             </div>';
    concentrationGameAcitivityHTML += '         </div>';
    concentrationGameAcitivityHTML += '         <div class="concentrationGameStatColContainer concentrationGameTimeContainer">';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatHeader">Time</div>';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatRowContainer" style="background: #ffffff; padding: 0 .25em; border-radius: 16px;">';
    concentrationGameAcitivityHTML += '                 <div class="fa fa-clock-o"></div>';
    concentrationGameAcitivityHTML += '                 <div class="concentrationGameStatRowContainer" style="margin: 0em .25em;">';
    concentrationGameAcitivityHTML += '                     <span id="concentrationGameTimerMinutes">00</span>:<span id="concentrationGameTimerSeconds">00</span>';
    concentrationGameAcitivityHTML += '                 </div>';
    concentrationGameAcitivityHTML += '             </div>';
    concentrationGameAcitivityHTML += '         </div>';
    concentrationGameAcitivityHTML += '         <div class="concentrationGameStatColContainer concentrationGameRemainingContainer">';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatHeader" style="-webkit-border-top-right-radius: 6px;-moz-border-radius-topright: 6px; border-top-right-radius: 6px;">Remaining</div>';
    concentrationGameAcitivityHTML += '             <div class="concentrationGameStatRowContainer">';
    concentrationGameAcitivityHTML += '                 <div>Cards</div>';
    concentrationGameAcitivityHTML += `		            <div class="concentrationGameStat" id="concentrationGameTotalCardsRemaining_${activityComponent.id}">${concentrationCardDecks.flat().length}</div>`;
    concentrationGameAcitivityHTML += '                 <div>Decks</div>';
    concentrationGameAcitivityHTML += `		            <div class="concentrationGameStat" id="concentrationGameDecksRemaining_${activityComponent.id}">${concentrationCardDecks.length-1}</div>`;
    concentrationGameAcitivityHTML += '             </div>';
    concentrationGameAcitivityHTML += '         </div>';
    concentrationGameAcitivityHTML += '     </div>';
    concentrationGameAcitivityHTML += '  </div>';
    concentrationGameAcitivityHTML += '  <div class="concentrationMatchedCardsWrapperContainer">';
    concentrationGameAcitivityHTML += `	    <div id="concentrationMatchedCardsContainer_${activityComponent.id}" style="display: none;" class="concentrationMatchedCardsContainer">`;
    concentrationGameAcitivityHTML += '         <h5>Matched Words</h5>';
    concentrationGameAcitivityHTML += '     </div>';
    concentrationGameAcitivityHTML += '  </div>';
    concentrationGameAcitivityHTML += '  </div>';
    concentrationGameAcitivityHTML += `	 <div id="concentrationGameboardContainer_${activityComponent.id}" class="concentrationGameboardContainer"></div>`;
    concentrationGameAcitivityHTML += '</div>';

    containerElement.html(concentrationGameAcitivityHTML);

    concentrationCardDecks[concentrationCardDecksIndex].forEach(concentrationCardObj => loadConcentrationCard($(`#concentrationGameboardContainer_${activityComponent.id}`), concentrationCardObj, activityComponent, renderRtl));
}

function loadConcentrationCard(containerElement, concentrationCardObj, activityComponent, renderRtl=false) {
    var concentrationCardValue = concentrationCardObj.value;
    var concentrationCardId = `${activityComponent.id}_${concentrationCardObj.id}`;
    switch (concentrationCardObj.cardType) {
        case 'text':
            var concentrationCardBackValue = concentrationCardObj.text;
            break;
        case 'image':
            var concentrationCardBackValue = concentrationCardObj.imageUrl;
            break;
        case 'audio':
            var concentrationCardBackValue = domainRootPath + concentrationCardObj.audioResource.sourceFilePath;
            break;
    }

    var concentrationCardHTML = '';
    concentrationCardHTML += `<div id="concentrationCard_${concentrationCardId}" class="concentrationCard">`;
    concentrationCardHTML += `	<img class="concentrationCardFrontFace" src="images/ui/cardBackGray.png" />`;
    switch (concentrationCardObj.cardType) {
        case 'text':
            concentrationCardHTML += `<div class="concentrationCardBackFace" ${renderRtl ? 'dir="rtl"' : ''}>${concentrationCardBackValue}</div>`;
            break;
        case 'image':
            concentrationCardHTML += `<div class="concentrationCardBackFace"><img src="${concentrationCardBackValue}" /></div>`;
            break;
        case 'audio':
            concentrationCardHTML += `<div class="concentrationCardBackFace"><audio id="concentrationCardBackAudio_${concentrationCardId}" src="${concentrationCardBackValue}" style="display: none;"></audio></div>`;
            break;
    }
    concentrationCardHTML += '</div>';

    containerElement.append(concentrationCardHTML);

    var concentrationCard = $(`#concentrationCard_${concentrationCardId}`);
    var concentrationCardBackAudio = $(`#concentrationCardBackAudio_${concentrationCardId}`);
    concentrationCard.data('value', concentrationCardValue);
    concentrationCard.on('click', function (e) {
        startTimer();
        $(`.ucatPlaybackTime`).css('display', 'none');
        flipConcentrationCard(concentrationCard, activityComponent, concentrationCardObj.cardType, concentrationCardBackAudio);
    });
}

function loadMatchedConcentrationCard(containerElement, matchedCardsArray) {
    var translatedGlossaryPairCardIndex = matchedCardsArray[0].id === matchedCardsArray[0].value ? 1 : 0;   // Deciphers which index within our matchedCardsArray is our glossary item
    var glossaryItemIndex = translatedGlossaryPairCardIndex == 0 ? 1 : 0;   // Deciphers which index within our matchedCardsArray is our translated glossary item
    var pairCardType = matchedCardsArray[translatedGlossaryPairCardIndex].cardType;
    var pairCardText = matchedCardsArray[translatedGlossaryPairCardIndex].text ? matchedCardsArray[translatedGlossaryPairCardIndex].text : false;
    var pairCardImage = pairCardType == 'image' ? matchedCardsArray[translatedGlossaryPairCardIndex].imageUrl : false;
    var pairCardAudio = pairCardType == 'audio' ? matchedCardsArray[translatedGlossaryPairCardIndex].audioResource.sourceFilePath : false;

    var matchedConcentrationCardHTML = '';
    matchedConcentrationCardHTML += '<div class="concentrationGameMatchedWordsContainer">';
    matchedConcentrationCardHTML += `   <div class="firstItem">${matchedCardsArray[glossaryItemIndex].text}</div>`;
    switch (pairCardType) {
        case 'text':
            matchedConcentrationCardHTML += `<div class="concentrationGamePairContainer">${pairCardText}</div>`;
            break;
        case 'image':
            matchedConcentrationCardHTML += `<div class="concentrationGamePairContainer"><img src="${pairCardImage}" /><div>${pairCardText}</div></div>`;
            break;
        case 'audio':
            matchedConcentrationCardHTML += `<div class="concentrationGamePairContainer"><audio src="${pairCardAudio}"></audio><div>${pairCardText}</div></div>`;
            break;
    }
    matchedConcentrationCardHTML += '</div>';

    containerElement.append(matchedConcentrationCardHTML);
    setupUcatMedia(containerElement, {audio: { showduration: false, showplaybacktime: false }});
}

function flipConcentrationCard(concentrationCard, activityComponent, cardType, concentrationCardBackAudio) {
    if (lockGameboard) return;
    if (concentrationCard.is(firstCardSelected) || firstCardSelected == 'undefined') return;

    concentrationCard.addClass('concentrationCardReveal');
    if (cardType == 'audio') { 
        concentrationCardBackAudio[0].play();
    }
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCardSelected = concentrationCard;

        return;
    }

    secondCardSelected = concentrationCard;
    updateTurnsUsedValue(activityComponent.id);
    checkCardsForMatch(activityComponent);
    if (cardType == 'audio') {
        killMedia(concentrationCardBackAudio);
    }
}

function createConcentrationPairCards(lexicalItemObj, concentrationCardsArray, gameType) {
    var concentrationCardObj = {
        'cardType': 'text',
        'id': lexicalItemObj.id,
        'text': lexicalItemObj.text,
        'value': lexicalItemObj.id
    }

    switch (gameType) {
        case 'text':
            var concentrationCardPairObj = lexicalItemObj.translations.length > 0 ? {
                'cardType': 'text',
                'id': lexicalItemObj.translations[0].id,
                'text': lexicalItemObj.translations[0].text,
                'value': lexicalItemObj.translations[0].lexicalItemId
            } : false;
            break;
        case 'image':
            var concentrationCardPairObj = (lexicalItemObj.translations.length > 0 && lexicalItemObj.translations[0].imageResource) ? {
                'cardType': 'image',
                'id': lexicalItemObj.translations[0].id,
                'value': lexicalItemObj.translations[0].lexicalItemId,
                'text': lexicalItemObj.translations[0].text,
                'imageUrl': domainRootPath + lexicalItemObj.translations[0].imageResource.sourceFilePath,
            } : false;
            break;
        case 'audio':
            var concentrationCardPairObj = lexicalItemObj.pronunciations.length > 0 ? {
                'cardType': 'audio',
                'id': lexicalItemObj.translations[0].id,
                'text': lexicalItemObj.translations[0].text,
                'value': lexicalItemObj.translations[0].lexicalItemId,
                'audioResource': lexicalItemObj.pronunciations[0].audioResource
            } : false;
            break;
    }

	if (concentrationCardPairObj) {
		concentrationCardsArray.push(concentrationCardObj);
		concentrationCardsArray.push(concentrationCardPairObj);
	}
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function checkCardsForMatch(activityComponent) {
    var revealedCards = $('.concentrationCardReveal');
    var isMatch = $(revealedCards[0]).data('value') == $(revealedCards[1]).data('value');
    isMatch ? removeCards(activityComponent) : flipRevealedCards();
}

function flipRevealedCards() {
    lockGameboard = true;
    var revealedCards = $('.concentrationCardReveal');
    setTimeout(() => {
        revealedCards.removeClass('concentrationCardReveal');
        resetGameboard();
    }, 2000);
}

function resetGameboard() {
    hasFlippedCard = false;
    lockGameboard = false;
    firstCardSelected = null;
    secondCardSelected = null;
}

function removeCards(activityComponent) {
    lockGameboard = true;
    var revealedCards = $('.concentrationCardReveal');
    updateCardsRemainingArray(activityComponent.id);
    setTimeout(function () {
        revealedCards.removeClass('concentrationCardReveal');
        revealedCards.css('visibility', 'hidden');
        resetGameboard();
        checkForDrawOfNewDeck(activityComponent);
        if (concentrationCardDecks.flat().length == 0) {
            clearInterval(cron);
            loadConcentrationGameOver($(`#concentrationGameboardContainer_${activityComponent.id}`));
        }
    }, 2000);
}

function showConcentrationEndGame(activityComponentId) {
	var concentrationGameControlsContainer = $(`#concentrationGameControlsContainer_${activityComponentId}`);
	concentrationGameControlsContainer.show();
}

function updateTurnsUsedValue(activityComponentId) {
    concentrationCardTurnsUsed++;
	var concentrationGameTurnCounter = $(`#concentrationGameTurnCounter_${activityComponentId}`);
	concentrationGameTurnCounter.html(concentrationCardTurnsUsed);
}

function updateCardsRemainingArray(activityComponentId) {
    var cardsToRemoveArray = [firstCardSelected.data('value'), secondCardSelected.data('value')];
    var matchedCardsArray = [];
    while (cardsToRemoveArray.length != 0) {
        var cardToBeRemovedValue = cardsToRemoveArray.shift();
        for (var i=0; i<concentrationCardDecks[concentrationCardDecksIndex].length; i++) {
            if (concentrationCardDecks[concentrationCardDecksIndex][i].value == cardToBeRemovedValue) {
                matchedCardsArray.push(concentrationCardDecks[concentrationCardDecksIndex][i]);
                concentrationCardDecks[concentrationCardDecksIndex].splice(i, 1);
                break;
            }
        }
    } 
    
    $(`#concentrationMatchedCardsContainer_${activityComponentId}`).show();
    loadMatchedConcentrationCard($(`#concentrationMatchedCardsContainer_${activityComponentId}`), matchedCardsArray);
    updateTotalCardsRemainingValue(activityComponentId);
}

function updateCardsRemainingValue(activityComponentId) {
    var concentrationGameTurnCounter = $(`#concentrationGameCardsRemaining_${activityComponentId}`); 
    concentrationGameTurnCounter.html(`Cards Remaining: ${concentrationCardDecks[concentrationCardDecksIndex].length}`)
}

function updateTotalCardsRemainingValue(activityComponentId) {
    var concentrationGameTotalCardsRemaining = $(`#concentrationGameTotalCardsRemaining_${activityComponentId}`);
    concentrationGameTotalCardsRemaining.html(concentrationCardDecks.flat().length)
}

function updateGameDeckIndexValue(activityComponentId) {
    var concentrationGameDeckIndex = $(`#concentrationGameDeckIndex_${activityComponentId}`);
    concentrationGameDeckIndex.html(`Current Deck: ${concentrationCardDecksIndex+1}`);  // We add one to the card deck index for rendering due to 0 indexing
}

function updateGameDecksRemainingValue(activityComponentId) {
    var concentrationGameDecksRemaining = $(`#concentrationGameDecksRemaining_${activityComponentId}`);
    concentrationGameDecksRemaining.html(concentrationCardDecks.length-(concentrationCardDecksIndex+1));
}

function createConcentrationCardDecks() {
    while(concentrationCardsArray.length) {
        concentrationCardDecks.push(concentrationCardsArray.splice(0, gameboardCardLimit));
    }
}

function checkForDrawOfNewDeck(activityComponent) {
    if (concentrationCardDecks[concentrationCardDecksIndex].length == 0 && concentrationCardDecks[concentrationCardDecksIndex+1]) { // We add one to the card deck index for rendering due to 0 indexing
        clearGameboard(activityComponent.id);
        drawANewDeck(activityComponent);
        resetGameStats(activityComponent);
    }
    return;
}


function drawANewDeck(activityComponent) {
    concentrationCardDecksIndex++;
    shuffleArray(concentrationCardDecks[concentrationCardDecksIndex]);
    concentrationCardDecks[concentrationCardDecksIndex].forEach(concentrationCardObj => loadConcentrationCard($(`#concentrationGameboardContainer_${activityComponent.id}`), concentrationCardObj, activityComponent, activityComponent.renderRTL));
}

function clearGameboard(activityComponentId) {
    var concentrationGameContainer = $(`#concentrationGameboardContainer_${activityComponentId}`);
    concentrationGameContainer.empty();
}

function resetGameStats(activityComponent) {
    updateCardsRemainingValue(activityComponent.id);
    updateGameDecksRemainingValue(activityComponent.id);
}

function startTimer() {
    if (timerStarted) {
        return;
    } else {
        timerStarted = true;
        cron = setInterval(() => { chronograph(); }, 1000);
    }
}

function chronograph() {
    second++;
    if (second == 60) {
        second = 0;
        minute++;
    }

    if (minute == 60) {
        clearInterval(cron);
    }
    
    $('#concentrationGameTimerSeconds').html(returnData(second));
    $('#concentrationGameTimerMinutes').html(returnData(minute));
}

function returnData(input) {
    return input > 9 ? input : `0${input}`;
}

function loadConcentrationGameOver(containerElement) {
    console.log('load up end game')
}
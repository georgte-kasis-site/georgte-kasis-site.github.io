var feedback = false;

$(document).ready(function ()
{
    $(document).bind("activityComponentLoaded", function (event) { setFeedbackUnread(event); });
    $(document).bind("responseScoreTokenLoaded", function (event) { loadResponseScoreTokenFeedback(event); });
    $(document).bind("promptScoreTokenLoaded", function (event) { loadPromptScoreTokenFeedback(event); });
    $(document).bind("navigationTriggered", function (event) { closeCustomDialog(); });

});

function setFeedbackUnread(event)
{
    for (var p = 0; p < event.activityComponent.prompts.length; p++)
    {
        if (event.activityComponent.prompts[p].feedback)
        {
            for (var pf = 0; pf < event.activityComponent.prompts[p].feedback.length; pf++)
            {
                event.activityComponent.prompts[p].feedback[pf].read = false;
            }
        }
        if (event.activityComponent.prompts[p].responses)
        {
            for (var r = 0; r < event.activityComponent.prompts[p].responses.length; r++)
            {
                if (event.activityComponent.prompts[p].responses[r].feedback)
                {
                    for (var rf = 0; rf < event.activityComponent.prompts[p].responses[r].feedback.length; rf++)
                    {
                        event.activityComponent.prompts[p].responses[r].feedback[rf].read = false;
                    }
                }
            }
        }
    }
}

function loadResponseScoreTokenFeedback(event)
{
    var response = false;
    if (event.studentScore.responseText.length > 0) //FillInTheBlank, Transcription or ShortAnswer
    {
        var prompt = getPromptById(event.studentScore.promptId);
        for (var i = 0; i < prompt.responses.length; i++)
        {
            if ((prompt.responses[i].text == event.studentScore.responseText) || ((prompt.responses[i].sortKey == event.studentScore.sortKey) && prompt.responses[i].correct))
            {
                response = prompt.responses[i];
                break;
            }
        }
    }
    else if (event.studentScore.responseId > 0)
    {
        response = getResponseById(event.studentScore.responseId);
    }
    if (response && ((response.feedback && response.feedback.length > 0) || event.activityComponent.terminalFeedback))
    {
        var studentCorrect = event.studentScore.correct;
        var responseFeedbackArray = new Array();
        var responseKeyArray = new Array();
        var terminalFeedback = "";
        if (!studentCorrect && event.activityComponent.terminalFeedback)
        {
            responseKeyArray.push(response.text);
            if (response.alternateResponses)
            {
                for (var ar = 0; ar < response.alternateResponses.length; ar++)
                {
                    responseKeyArray.push(response.alternateResponses[ar].text);
                }
            }
            terminalFeedback = getTerminalFeedback(responseKeyArray, event.studentScore.responseText);
        }
        var responseScoreIcon = event.scoreToken.find(".fa").first();
        if (response.feedback)
        {
            for (var i = 0; i < response.feedback.length; i++)
            {
                if (((response.feedback[i].feedbackTypeId == 0) || (response.feedback[i].feedbackTypeId == 1)) && (response.feedback[i].correct == studentCorrect))
                {
                    responseFeedbackArray.push(response.feedback[i]);
                }
            }
        }
        if((responseFeedbackArray.length > 0)||(terminalFeedback.length > 0))
            loadResponseFeedbackIcon(responseScoreIcon, response.id, responseFeedbackArray, studentCorrect, terminalFeedback);
    }
}

function loadResponseFeedbackIcon(responseScoreIcon, responseId, responseFeedbackArray, studentCorrect, terminalFeedback)
{
    var firstUnreadIndex = 0;
    for (var f = 0; f < responseFeedbackArray.length; f++)
    {
        if (!responseFeedbackArray[f].read)
        {
            firstUnreadIndex = f;
            break;
        }
        else if (f == responseFeedbackArray.length - 1)
            firstUnreadIndex = responseFeedbackArray.length - 1;
    }
    var responseFeedbackIconHTML = "<span title=\"View Feedback\" id=\"responseFeedbackIcon_" + responseId + "\" class=\"" + (studentCorrect ? "correct" : "incorrect") + "FeedbackBtn fa-stack\"><i class=\"feedback" + (studentCorrect ? "Correct" : "Incorrect") + " fa fa-comment fa-stack-2x\"></i><i class=\"" + (responseScoreIcon.attr("class")) + " custom-stack-1x\"></i></span>";
    responseScoreIcon.replaceWith(responseFeedbackIconHTML);
    var feedbackIcon = $("#responseFeedbackIcon_" + responseId);
    feedbackIcon.click(function (event)
    {
        event.stopPropagation();
        loadFeedbackDialog("response", responseId, responseFeedbackArray, firstUnreadIndex, terminalFeedback);
    });
}

function loadPromptScoreTokenFeedback(event)
{
    var activityPromptRationaleBtn =$("#activityPromptRationaleBtn_"+event.promptId);
    if(activityPromptRationaleBtn.length == 0)
    {
        var prompt = getPromptById(event.promptId);
        if (prompt && prompt.feedback && prompt.feedback.length > 0)
        {
            var studentCorrect = false;
            if (event.maxScore > 0)
                studentCorrect = (event.total == event.maxScore);//This suggests that partial credit yields incorrect feedback.  This rule may change.
            else
                studentCorrect = event.scoreToken.hasClass("scoreCorrect");
            var promptFeedbackArray = new Array();
            for (var f = 0; f < prompt.feedback.length; f++)
            {
                if ((prompt.feedback[f].correct == studentCorrect)&&(prompt.feedback[f].text.length > 0))
                {
                    promptFeedbackArray.push(prompt.feedback[f]);
                }
            }
            if(promptFeedbackArray.length > 0)
                loadPromptFeedbackIcon(event.scoreToken, prompt.id, promptFeedbackArray, studentCorrect);
        }
    }
}

function loadPromptFeedbackIcon(promptScoreToken, promptId, promptFeedbackArray, studentCorrect)
{
    var feedbackIcon = $("#promptFeedbackIcon_" + promptId);
    if (feedbackIcon.length > 0)
        feedbackIcon.remove();
    var firstUnreadIndex = 0;
    for (var f = 0; f < promptFeedbackArray.length; f++)
    {
        if (!promptFeedbackArray[f].read)
        {
            firstUnreadIndex = f;
            break;
        }
        else if (f == promptFeedbackArray.length - 1)
            firstUnreadIndex = promptFeedbackArray.length - 1;
    }
    var promptFeedbackIconHTML = "<span title=\"View Feedback\" id=\"promptFeedbackIcon_" + promptId + "\" class=\"" + (studentCorrect ? "correct" : "incorrect") + "FeedbackBtn fa-stack\"><i class=\"feedback" + (studentCorrect ? "Correct" : "Incorrect") + " fa fa-comment fa-stack-2x\"></i><i class=\"fa " + ((studentCorrect ? "fa-check" : "fa-times")) + " custom-stack-1x\"></i></span>";
    promptScoreToken.before(promptFeedbackIconHTML);
    feedbackIcon = $("#promptFeedbackIcon_" + promptId);
    feedbackIcon.click(function (e)
    {
        loadFeedbackDialog("prompt", promptId, promptFeedbackArray, firstUnreadIndex);
    });
}

function loadFeedbackDialog(type, objectId, feedbackArray, firstUnreadIndex, terminalFeedback)
{
    if ((feedbackArray.length > 0)||(terminalFeedback))
    {
        var feedbackHTML = '<div id="feedbackDialogPager" class="feedbackCounter"></div>';
        feedbackHTML += '<div id="feedbackDialogContainer">';
        var feedbackCorrect = false;
        for (var f = 0; f < feedbackArray.length; f++)
        {
            feedbackCorrect = feedbackArray[f].correct;
            feedbackHTML += '<div id="' + type + 'Feedback_' + objectId + '_' + f + '" data-feedbackindex="'+f+'">' + htmlDecode(feedbackArray[f].text) + '</div>';
        }
        if (terminalFeedback)
        {
            feedbackHTML += '<div id="' + type + 'TerminalFeedback_' + objectId + '" style="display:none;" class="terminalFeedback">' + terminalFeedback;
            if(feedbackArray.length > 0)
                feedbackHTML += '<div id="' + type + 'TerminalFeedbackHideMsg_' + objectId +'" style="text-align:center; border-top:1px solid #eeeeee; padding-top:0.5em; margin-top:2em;"><span id="' + type + 'TerminalFeedbackHideBtn_' + objectId + '" class="btnGrey"><i class="fa fa-arrow-left"></i> Back to Feedback</span></div>';
            feedbackHTML += '</div>';
        }
        feedbackHTML += '</div>';
        if (terminalFeedback)
        {
            feedbackHTML += '<div id="' + type + 'TerminalFeedbackMsg_' + objectId + '" style="text-align:center; ' + ((feedbackArray.length > 0) ? "border-top:1px solid #eeeeee; padding-top:0.5em;" : "")+' margin-top:2em;">This component contains a detailed summary.  Click the button below to display.<br/>';
            feedbackHTML += '<span id="' + type + 'TerminalFeedbackBtn_' + objectId + '" class="btnGrey"><i class="fa fa-comment"></i> OK</span>';
            feedbackHTML += '</div>';
        }

        var iconHTML = "<div id=\"popUpHeaderIcon\"><div class=\"fa-stack\"><i class=\"icon fa fa-comment fa-stack-2x\"></i><i class=\"icon fa " + (feedbackCorrect ? 'fa-check' : 'fa-times') + " custom-stack-1x\"></i></div></div>";
        openCustomDialog((feedbackCorrect ? "Correct" : "Incorrect"), feedbackHTML, (feedbackCorrect ? "correct" : "incorrect"), iconHTML);
        if (terminalFeedback)
        {
            $("#" + type + "TerminalFeedbackBtn_" + objectId).on("click", function ()
            {
                showTerminalFeedback(type, objectId);
            });
            $("#" + type + "TerminalFeedbackHideBtn_" + objectId).on("click", function ()
            {
                hideTerminalFeedback(type, objectId);
            });
        }
        if (feedbackArray.length > 0)
            navigateFeedbackDialog(firstUnreadIndex, firstUnreadIndex, feedbackArray, feedbackCorrect);
    }
}

function navigateFeedbackDialog(feedbackIndex, firstUnreadIndex, feedbackArray, feedbackCorrect)
{
    if (feedbackArray.length > 1)
    {
        var previousIndex = feedbackIndex - 1;
        var nextIndex = feedbackIndex + 1;
        $("#feedbackDialogContainer").children("[id*='Feedback_']").each(function ()
        {
            var feedbackDiv = $(this);
            if (feedbackDiv.data("feedbackindex") == feedbackIndex)
                feedbackDiv.show();
            else
                feedbackDiv.hide();
        });
        if (!feedbackCorrect)
        {
            feedbackArray[feedbackIndex].read = true;
            var feedbackPagerHTML = '';
            feedbackPagerHTML += '<span id="feedbackPagerPreviousBtn" class="feedbackPager' + (previousIndex < 0 ? " disabled" : "") + '"><i class="fa fa-chevron-left"></i></span>';
            feedbackPagerHTML += '<span id="feedbackDialogCounter" style="cursor:pointer;">' + (feedbackIndex + 1) + ' of ' + feedbackArray.length + '</span>';
            feedbackPagerHTML += '<span id="feedbackPagerNextBtn" class="feedbackPager' + (((nextIndex > firstUnreadIndex) || (nextIndex > feedbackArray.length - 1)) ? " disabled" : "") + '"><i class="fa fa-chevron-right"></i></span>';
            $("#feedbackDialogPager").html(feedbackPagerHTML);
            if ((previousIndex >= 0) && (previousIndex < firstUnreadIndex))
            {
                $("#feedbackPagerPreviousBtn").click(function ()
                {
                    navigateFeedbackDialog(previousIndex, firstUnreadIndex, feedbackArray, feedbackCorrect);
                });
            }
            $("#feedbackDialogCounter").click(function ()
            {
                navigateFeedbackDialog(feedbackIndex, firstUnreadIndex, feedbackArray, feedbackCorrect);
            });
            if ((nextIndex <= firstUnreadIndex) && (nextIndex <= feedbackArray.length - 1))
            {
                $("#feedbackPagerNextBtn").click(function ()
                {
                    navigateFeedbackDialog(nextIndex, firstUnreadIndex, feedbackArray, feedbackCorrect);
                });
            }
        }
    }
}

function showTerminalFeedback(type, objectId)
{
    $("#feedbackDialogPager").hide();
    $("#" + type + "TerminalFeedbackMsg_" + objectId).hide();
    $("#" + type + "TerminalFeedbackHideMsg_" + objectId).show();
    $("#feedbackDialogContainer").children("[id*='Feedback_']").hide();
    $("#" + type + "TerminalFeedback_" + objectId).show();
}

function hideTerminalFeedback(type, objectId)
{
    $("#feedbackDialogPager").show();
    $("#" + type + "TerminalFeedbackHideMsg_" + objectId).hide();    
    $("#" + type + "TerminalFeedbackMsg_" + objectId).show();
    $("#feedbackDialogContainer").children("[id*='Feedback_']").show();
    $("#" + type + "TerminalFeedback_" + objectId).hide();
}

function getTerminalFeedback(answerKeyArray, studentAnswer) 
{
    var scores = [];
    var lang = 'english';
    if (module.languages && module.languages.length)
        lang = module.languages[0].title.toLowerCase();

    var tj = null;
    var key = null;
    for (var i = 0; i < answerKeyArray.length; i++)
    {
        var tempTJ = new terminalFeedback(studentAnswer, answerKeyArray[i], lang);
        if (tj == null)
            tj = tempTJ;
        if (key == null)
            key = answerKeyArray[i];
        if (tj.totalScore() < tempTJ.totalScore())
        {
            tj = tempTJ;
            key = answerKeyArray[i];
        }
    }
    var languageInfo = getLanguageInfo(key);
    var score = tj.totalScore();
    scores.push({ correct: tj.wordCorrect, correctCount: tj.wordCorrect.length, textOffset: 0, score: score });
    var terminalFeedbackSummary = "";
    if (score < 100)
    {
        terminalFeedbackSummary = "Score: " + score.toFixed(0) + "%. ";
        if (score > 89)
        {
            terminalFeedbackSummary += "Only minor errors in spelling or grammar.";
        }
        else if (score > 69)
        {
            terminalFeedbackSummary += "Likely there are errors in spelling/grammar or a missed word or two.";
        }
        else
        {
            terminalFeedbackSummary += "There are probably one or more missing words and/or major spelling/grammar issues.";
        }
        terminalFeedbackSummary += "<br/>";
        terminalFeedbackSummary += "<div>Terminal Feedback Summary: ";
        terminalFeedbackSummary += "<div class='summaryFeedbackText' style='text-align:" + (languageInfo.RTL ? "right" : "left") + ";' dir=" + (languageInfo.RTL ? "rtl" : "ltr") + ">" + tj.terminalFeedbackSummary() + "</div>";
        terminalFeedbackSummary += "</div>";
    }
    return terminalFeedbackSummary;
}

function terminalFeedback(studentText, keyText, moduleLanguage)
{
    this.terminalFeedbackString = "";
    this.idx = 0;
    this.cjk = ['cn', 'jp', 'kr'];
    this.notCJKRE = new RegExp("[^(" + cjkSet.source.substr(1, cjkSet.source.length - 2) + ")]", 'gyi');
    this.notCJKRE.lastIndex = 0;

    this.scores = [];
    if (typeof (moduleLanguage) == 'undefined')
        moduleLanguage = 'english';
    this.wordSplitter = / +/;
    this.skips = /[\u0000-\u001F\u0021\u0022\u0027-\u0029\u002C-\u002E\u003A\u003B\u003F\u005B-\u0060\u007B-\u007F\u0080-\u00B4\u00B6-\u00BF\u060C\u061B-\u061F\u2000-\u206F\u3001-\u303F\uA700-\uA71F\uFD3E\uFD3F\uFE10-\uFE6F\uFF01\uFF02\uFF07-\uFF09\uFF0C-\uFF0E\uFF1A\uFF1B\uFF1F]/gi;

    this.ranges = {
        cn: [[11904, 12019], [12032, 12245], [12296, 12351], [13312, 19893], [20000, 40907], [59277, 59286], [63744, 64217], [65072, 65103]],
        kr: [[4352, 4607], [12608, 12686], [43360, 43388], [44032, 55203], [55216, 55291], [65296, 65499]],
        jp: [[12367, 12447], [12448, 12543], [12784, 12799]]
    };

    this.activeRange = null;

    this.correct = 0;
    this.wordCorrect = [];
    this.judgedCount = 0;
    this.offset = 0;
    this.letterCount = 0;

    this.keyWords = [];
    this.textWords = [];

    this.textIndex = 0;
    this.keyIndex = 0;

    this.init = function ()
    {
        var k = this.idx;
        var t = this.idx;

        var formattedStudentText = this.formatText(studentText);
        var formattedKeyText = this.formatText(keyText);
        // text does not start on a new word
        if (formattedStudentText && t && formattedStudentText.charCodeAt(t - 1) != 32)
            t = this.getLastSpace(formattedStudentText, t) + 1;

        this.offset = (t - this.idx);
        this.idx = t;

        // split words
        this.keyWords = formattedKeyText.split(this.wordSplitter);
        this.textWords = formattedStudentText.substr(this.idx).split(this.wordSplitter);

        // did they even write anything?
        if (!formattedStudentText)
        {
            for (var i = 0; i < this.keyWords.length; i++)
            {
                this.scores.push(new terminalFeedbackScore({ score: 0, word: '', key: this.keyWords[i], entryIndex: 0, keyIndex: i, feedbackSpan: this.createFeedbackSpan(false, this.keyWords[i], 0) }));
                this.terminalFeedbackString += this.scores[this.scores.length - 1].feedbackSpan.html();
            }
            return false;
        }

        // cjk?
        if (moduleLanguage)
            this.getLanguageCode(moduleLanguage);
        else if (this.keyWords[0].length >= 3 && cjkSet.test(this.keyWords[0].substr(0, 3)))
        {
            if (japaneseSubSet.test(this.keyWords[0]))
            {
                this.language = 'jp';
            }
            else if (koreanSet.test(this.keyWords[0]))
            {
                this.language = 'kr';
            }
            else
            {
                this.language = 'cn';
            }
        }

        // only do for non-cjk
        if (this.cjk.indexOf(this.language) == -1)
        {
            // check to see if the text index is too far over since we'll miss every subsequent word if it is
            if (this.idx > 0 && this.scoreWord(this.textWords[t], this.keyWords[k], t, k) < 0.5)
            {
                // go back 3
                var w = 0;
                var lastSpace = this.idx;
                while (w < 3)
                {
                    lastSpace = this.getLastSpace(formattedStudentText, lastSpace - 2) + 1;
                    if (this.scoreWord(this.textWords[t], this.keyWords[k], t, k) >= 0.5)
                    {
                        this.textWords = formattedStudentText.substr(lastSpace).split(' ');
                        offset += (lastSpace - this.idx);
                        break;
                    }
                    w++;
                }
            }

            while (t < this.textWords.length && k < this.keyWords.length)
            {
                var wordScore = this.scoreWord(this.textWords[t], this.keyWords[k], t, k);
                var s;
                // added a word
                if (t < (this.textWords.length - 1) && (s = this.scoreWord(this.textWords[t + 1], this.keyWords[k], t + 1, k)).score > wordScore.score)
                {
                    this.terminalFeedbackString += s.feedbackSpan.html();
                    t++;
                }
                // skipped a word
                else if (k < (this.keyWords.length - 1) && (s = this.scoreWord(this.textWords[t], this.keyWords[k + 1], t, k + 1)).score > wordScore.score)
                {
                    this.terminalFeedbackString += wordScore.feedbackSpan.html();
                    wordScore.score = 0;
                    this.scores.push(wordScore);
                    this.wordCorrect.push(false);
                    k++;
                }
                else
                {
                    this.terminalFeedbackString += wordScore.feedbackSpan.html();
                    this.scores.push(wordScore);
                    this.wordCorrect.push(true);
                    if (wordScore.score == 1)
                        this.correct++;
                    t++;
                    k++;
                }
            }

            // more words in key than response
            if (k < this.keyWords.length)
            {
                this.terminalFeedbackString += "<span style='font-style:italic; font-size:0.8em;'> (additional words missed)</span>";

                while (k < this.keyWords.length)
                {
                    this.scores.push(new terminalFeedbackScore({ score: 0, word: '', key: this.keyWords[k++], keyIndex: 0, entryIndex: 0, feedbackSpan: '' }));
                }
            }
        }
        // cjk: judge text, skip non-cjk not in key
        else
        {
            this.textIndex = this.idx;
            this.keyIndex = this.idx;
            while (this.textIndex < formattedStudentText.length)
            {
                var score = this.scoreWord(formattedStudentText, formattedKeyText, this.textIndex, this.keyIndex);
                this.scores.push(score);
                this.terminalFeedbackString += score.feedbackSpan.html();
            }
        }
        return terminalFeedback;
    }

    this.scoreWord = function (txt, key, ti, ki)
    {
        var scoredEle = $("<span> </span>"); //getElementById(itemResponseFeedbackId);

        var toJudge = txt; // student answer
        var judgeAgainst = key; // key

        // totally correct
        if (toJudge == judgeAgainst)
        {
            scoredEle.append(this.createFeedbackSpan(true, toJudge, 190));

            this.keyIndex += key.length;
            this.textIndex += txt.length;
            return new terminalFeedbackScore({ score: 1, word: txt, key: key, entryIndex: ti, keyIndex: ki, feedbackSpan: scoredEle });
        }

        var j = 0;
        var k = 0;
        var keyJudged = 0;
        var txtJudged = 0;
        var c = 0;

        // figure out judged chars
        for (var i = 0; i < judgeAgainst.length; i++)
        {
            if (this.isJudged(judgeAgainst.charCodeAt(i)))
            {
                keyJudged++;
            }
        }
        for (var i = 0; i < toJudge.length; i++)
        {
            if (this.isJudged(toJudge.charCodeAt(i)))
                txtJudged++;
        }

        while (k < judgeAgainst.length)
        {
            var isCorrect = false;

            if (j >= toJudge.length)
            {
                scoredEle.append(document.createTextNode(judgeAgainst[k]));
                k++;
                continue;
                //break;
            }

            var toJudgeChar = toJudge.charCodeAt(j);
            var judgeAgainstChar = judgeAgainst.charCodeAt(k);

            if (!this.isJudged(judgeAgainstChar))
            {
                scoredEle.append(document.createTextNode(judgeAgainst[k]));
                k++;
                continue;
            }
            if (!this.isJudged(toJudgeChar))
            {
                scoredEle.append(document.createTextNode(toJudge[j]));
                j++;
                continue;
            }

            // not in target language, but may still be judged
            if (typeof (this.ranges[this.language]) != 'undefined' && !this.isInRange(this.ranges[this.language], toJudgeChar))
            {
                // not right, so check for romanization
                if (toJudgeChar != judgeAgainstChar)
                {
                    // check for unjudged and skip


                    // next character is also out of range, so probably romanizing something
                    if ((this.language == 'cn' || this.language == 'jp' || this.language == 'kr') && j < (toJudge.length - 1) && !this.isInRange(this.ranges[this.language], toJudge.charCodeAt(j + 1)))
                    {
                        while (j < toJudge.length && !this.isInRange(this.ranges[this.language], toJudgeChar))
                        {
                            scoredEle.append(this.createFeedbackSpan(false, toJudge[j], 221));
                            toJudgeChar = toJudge.charCodeAt(++j);
                        }
                        // text after romanization doesn't match next char
                        if (toJudgeChar != judgeAgainstChar)
                        {
                            // test next two, give up after
                            if (k < (judgeAgainst.length - 2) && toJudgeChar == judgeAgainst.charCodeAt(k + 2))
                            {
                                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 0));
                                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k + 1], 0));
                                k += 2;
                                j += 2;
                            }
                            else if (k < (judgeAgainst.length - 1) && toJudgeChar == judgeAgainst.charCodeAt(k + 1))
                            {
                                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 0));
                                k++;
                            }
                            // give up, skip the chars
                            else
                            {
                                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 0));
                                k++;
                            }
                            judgeAgainstChar = judgeAgainst.charCodeAt(k);
                        }
                    }
                    // else will be judged
                }
                // else will be judged
            }

            if (judgeAgainstChar == toJudgeChar)
            {
                c++;
                isCorrect = true;
                scoredEle.append(this.createFeedbackSpan(true, toJudge[j], 221));
            }
            // added
            else if (j < (toJudge.length - 1) && judgeAgainstChar == toJudge.charCodeAt(j + 1)) 
            {
                //scoredEle.appendChild(createTranscriptionFeedbackSpan(false, toJudge.substr(t, 1), 225));
                j++;
                continue;
            }
            // added 2
            else if (j < (toJudge.length - 2) && judgeAgainstChar == toJudge.charCodeAt(j + 2) && ((j < (toJudge.length - 3) && judgeAgainst.charCodeAt(k + 1) == toJudge.charCodeAt(j + 3)) || j >= (toJudge.length - 3)))
            {
                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 230));
                j += 2;
            }
            // skipped
            else if (k < (judgeAgainst.length - 1) && judgeAgainst.charCodeAt(k + 1) == toJudgeChar)
            {
                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 230));
                k++;
                continue;
            }
            // skipped 2
            else if (k < (judgeAgainst.length - 2) && judgeAgainst.charCodeAt(k + 2) == toJudgeChar && ((k < (judgeAgainst.length - 3) && toJudge.charCodeAt(j + 1) == judgeAgainst.charCodeAt(k + 3)) || k >= (judgeAgainst.length - 3)))
            {
                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 230));
                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k + 1], 230));
                k += 2;
                continue;
            }

            // incorrect
            if (!isCorrect)
                scoredEle.append(this.createFeedbackSpan(false, judgeAgainst[k], 236));

            k++;
            j++;
        }

        this.keyIndex += k;
        this.textIndex += j;

        return new terminalFeedbackScore({ score: ((txtJudged > keyJudged) ? (c / txtJudged) : (c / keyJudged)), word: txt, key: key, entryIndex: ti, keyIndex: ki, feedbackSpan: scoredEle });
    }

    this.isJudged = function (chr)
    {
        return ((chr >= 47 && chr <= 57) || (chr >= 97 && chr <= 122) || !this.skips.test(String.fromCharCode(chr)));
    }

    this.isInRange = function (range, chr)
    {
        if (!range)
            return true;
        for (var i = 0; i < range.length; i++)
        {
            if (chr >= range[i][0] && chr <= range[i][1])
                return true;
        }
        return false;
    }

    this.isOutsideLanguage = function (chr)
    {
        if (this.language == 'kr' && !this.isInRange(this.hangulRange, chr))
            return true;
        if (this.language == 'jp' && !this.isInRange(this.japaneseRange, chr))
            return true;
        if (this.language == 'cn' && !this.isInRange(this.chineseRange, chr))
            return true;

        return false;
    }

    this.getLanguageCode = function (l)
    {
        switch (l.toLowerCase())
        {
            case 'chinese':
                this.language = 'cn';
                break;
            case 'korean':
                this.language = 'kr';
                break;
            case 'japanese':
                this.language = 'jp';
                break;
            default:
                this.language = 'en';
                break;
        }
    }

    this.totalWordScore = function ()
    {
        var s = 0;
        for (var i = 0; i < this.scores.length; i++)
        {
            s += this.scores[i].score;
        }
        return s;
    }

    this.totalScore = function ()
    {
        return this.totalWordScore() / this.scores.length * 100;
    }

    this.terminalFeedbackSummary = function ()
    {
        return this.terminalFeedbackString;
    }

    this.createFeedbackSpan = function (correct, txt, where)
    {
        return $("<span class='" + (correct ? "correct" : "incorect") + "'>" + txt + "</span>");
    }

    this.getLastSpace = function (txt, idx)
    {
        return txt.lastIndexOf(' ', idx);
    }

    this.getNextSpace = function (txt, idx)
    {
        return txt.indexOf(' ', idx);
    }

    this.formatText = function (txt)
    {
        return txt.toLowerCase().replace(/<\/?[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/[\,\.\;\:\(\)\?\!]/g, '');
    }

    this.init();

    return this;
}

function terminalFeedbackScore(params)
{
    var fields = ['score', 'word', 'key', 'entryIndex', 'keyIndex', 'feedbackSpan'];
    for (var i = 0; i < fields.length; i++)
    {
        this[fields[i]] = params[fields[i]];
    }

    this.correct = (this.score > 0.5);

    return this;
}
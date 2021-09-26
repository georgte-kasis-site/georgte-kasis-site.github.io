$(document).ready(function()
{
    $(document).bind("moduleLoaded", function (event) { linkInlineNotes(event.containerElement); });
    $(document).bind("navigationTriggered", function (event) { loadActivityNotesMainMenu(event.activity); });
    $(document).bind("promptLoaded", function (event) { loadPromptNotes(event.containerElement, event.prompt); });
});

function loadActivityNotesMainMenu(activity)
{
    if (module.moduleFeatures && module.moduleFeatures.notes && activityNotesMenuContainer)
    {
        var activityNoteDisplayCount = 0;
        if (activity && activity.notes)
        {
            var notesMenuHTML = '<ul id="activityNotesMenuList" class="actyMenuList">';
            notesMenuHTML += '  <li id="activityNotesMenuBtn" class="btn menuItem" onclick="toggleSubMenu(\'activityNotesMenuIcon\', \'activityNotesMenuSubList\')"><i class="fa fa-paperclip subHeader"></i><i id="activityNotesMenuIcon" class="fa fa-caret-right"></i>Activity Notes</li>';
            notesMenuHTML += '  <ul id="activityNotesMenuSubList" class="actyMenuList"></ul>';
            notesMenuHTML += '</ul>';
            activityNotesMenuContainer.html(notesMenuHTML);
            var activityNotesMenuSubList = $("#activityNotesMenuSubList");
            for (var n = 0; n < activity.notes.length; n++)
            {
                if ((userIsStudent && activity.notes[n].noteType.studentView) || (userIsTeacher && activity.notes[n].noteType.teacherView) || (userIsDeveloper && activity.notes[n].noteType.developerView))
                {
                    activityNoteDisplayCount++;
                    activityNotesMenuSubList.append('<li id="activityNotesMenuBtn_' + activity.notes[n].id + '" class="btn menuItem subMenuItem"><i class="' + activity.notes[n].noteType.iconPath + '"></i> ' + htmlDecode(activity.notes[n].noteType.title) + '</li>');
                    $("#activityNotesMenuBtn_" + activity.notes[n].id).bind("click", { note: activity.notes[n] }, function (event)
                    {
                        var note = event.data.note;
                        openCustomDialog(htmlDecode(note.noteType.title), htmlDecode(note.text), "", "<i class=\"" + note.noteType.iconPath + "\"></i>");
                    });
                }
            }
        }
        if (activityNoteDisplayCount > 0)
        {
            $("#mainMenuContainer").show();
            previewActivityNotes.addClass("previewBadgeActive");
            activityNotesMenuContainer.show();
        }
        else
        {
            previewActivityNotes.removeClass("previewBadgeActive");
            var previewMenuContainerButtonCount = $("#previewMenuContainer").find(".previewBadgeActive").length;
            if (previewMenuContainerButtonCount == 0)
                $("#mainMenuContainer").hide();
            activityNotesMenuContainer.html("");
            activityNotesMenuContainer.hide();
        }
    }
}

function loadPromptNotes(containerElement, prompt)
{
    if (module.moduleFeatures && module.moduleFeatures.notes)
    {
        for (var n = 0; n < prompt.notes.length; n++)
        {
            if ((userIsStudent && prompt.notes[n].noteType.studentView) || (userIsTeacher && prompt.notes[n].noteType.teacherView) || (userIsDeveloper && prompt.notes[n].noteType.developerView))
            {
                ancillary.append("<div id=\"noteContent_" + prompt.notes[n].id + "\">" + htmlDecode(prompt.notes[n].text) + "</div>");
                containerElement.append('<span id="promptNoteButton_' + prompt.notes[n].id + '" title="Note" class="activityButton noteBtn black" data-noteid="' + prompt.notes[n].id + '"><i class="' + prompt.notes[n].noteType.iconPath + '"></i></span>');
                $("#promptNoteButton_" + prompt.notes[n].id).bind("click", { note: prompt.notes[n] }, function (event)
                {
                    var note = event.data.note;
                    openCustomDialog(htmlDecode(note.noteType.title), htmlDecode(note.text), "", "<i class=\"" + note.noteType.iconPath + "\"></i>");
                });
            }
        }
    }    
}


function linkInlineNotes(containerElement)
{
    if (module.moduleFeatures && module.moduleFeatures.notes)
    {
        containerElement.find(".inlineNote").each(function ()
        {
            var inlineNoteIcon = $(this);
            var inlineNoteStudentView = parseBoolean(inlineNoteIcon.data("studentview"));
            var inlineNoteTeacherView = parseBoolean(inlineNoteIcon.data("teacherview"));
            var inlineNoteDeveloperView = parseBoolean(inlineNoteIcon.data("developerview"));

            if ((userIsStudent && inlineNoteStudentView) || (userIsTeacher && inlineNoteTeacherView) || (userIsDeveloper && inlineNoteDeveloperView))
            {
                var inlineNoteTypeId = inlineNoteIcon.data("notetypeid");
                var inlineNoteTypeTitle = inlineNoteIcon.data("notetypetitle");
                var inlineNoteTypeIconPath = inlineNoteIcon.data("notetypeiconpath");
                var inlineNoteContent = inlineNoteIcon.data("content");
                var inlineNote = { text: inlineNoteContent, noteType: { id: inlineNoteTypeId, title: inlineNoteTypeTitle, iconPath: inlineNoteTypeIconPath, studentView: inlineNoteStudentView, teacherView: inlineNoteTeacherView, developerView: inlineNoteDeveloperView } };
                inlineNoteIcon.bind("click", { note: inlineNote }, function (event)
                {
                    var note = event.data.note;
                    openCustomDialog(htmlDecode(note.noteType.title), htmlDecode(note.text), "", "<i class=\"" + note.noteType.iconPath + "\"></i>");
                });
            }
            else
            {
                inlineNoteIcon.remove();
            }
        });
    }
}
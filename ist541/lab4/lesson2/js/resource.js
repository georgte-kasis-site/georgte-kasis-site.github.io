function loadResourceMainMenu(containerElement) 
{
    var sourceCount = 0;
    var moduleSourceMenuHTML = "<ul id=\"moduleResourceList\" class=\"actyMenuList\">";
    moduleSourceMenuHTML += "<li id=\"resourceMenuBtn\" class=\"btn menuItem resourceMenuBtn\" onclick=\"toggleSubMenu( 'resourceMenuIcon', 'resourceMenu')\">";
    moduleSourceMenuHTML += "<i class=\"" + resourceIcon + " subHeader\"></i>";
    moduleSourceMenuHTML += "<i id=\"resourceMenuIcon\" class=\"" + accordianOpen + "\"></i> Resource(s)";
    moduleSourceMenuHTML += "</li>";
    moduleSourceMenuHTML += "<ul id=\"resourceMenu\" style=\"display:none;\"></ul>";
    moduleSourceMenuHTML += "</ul>";
    containerElement.append(moduleSourceMenuHTML);
    var resourceMenu = $("#resourceMenu");
    for (var r = 0; r < module.resources.length; r++) 
    {
        if (module.resources[r].additionalSource)
        {
            var resourceTitle = module.resources[r].title;
            var iconName = eval(module.resources[r].resourceType.toLowerCase() + "SrcIcon");
            var resourceFormat = module.resources[r].format.split("/")
            if (resourceFormat.length > 1)
            {
                var resourceFormatExtension = resourceFormat[1].substring(0, 3);
                if (resourceFormatExtension == "doc" || resourceFormatExtension == "xls" || resourceFormatExtension == "ppt")
                {
                    iconName = eval(resourceFormatExtension + "SrcIcon");
                    resourceTitle = "<span onclick=\"window.open('" + module.resources[r].sourceFilePath + "', '_blank')\">" + module.resources[r].originalFilename + "</span>";
                }
                else if (resourceFormatExtension == "pdf")
                    iconName = eval(resourceFormatExtension + "SrcIcon");
            }
            resourceMenu.append('<li id="moduleSourceBtn_' + module.resources[r].id + '" class="btn menuItem subMenuItem truncate-ellipsis"><i class="icon ' + iconName + '"></i>' + resourceTitle + '</li>');
            $("#moduleSourceBtn_" + module.resources[r].id).bind("click", {resource: module.resources[r]}, function (event)
            {
                var moduleSourceButton = $(this);
                var callOpenDialog = true;
                var w = ($(window).width() * .8) - (em(1.5) * 2);
                var h = $(window).height() / 2;
                var dialogTitle = event.data.resource.title;
                var iconHTML = spf('<i class="~"></i>', [moduleSourceButton.children(":first").attr("class")]);

                var resourceHTML = '<div id="resourceBody">';
                resourceHTML += '   <div class="resrcAssetContainer">';
                var resourceFormat = event.data.resource.format.split("/");
                switch (resourceFormat[0])
                {
                    case "doc":
                        if (resourceFormat.length > 1)
                            if (resourceFormat[1] == "pdf")
                                resourceHTML += '<iframe src="' + event.data.resource.sourceFilePath + '" width="' + w + '" height="' + h + '" seamless></iframe>';
                            else
                                callOpenDialog = false
                        break;
                    case "image":
                        resourceHTML += '<img src="' + event.data.resource.sourceFilePath + '">';
                        break;
                    case "audio":
                        resourceHTML += '<audio src="' + event.data.resource.sourceFilePath + '" data-fullplayer="true" data-transcript="false"></audio>';
                        break;
                    case "video":
                        resourceHTML += '<video src="' + event.data.resource.sourceFilePath + '"></video>';
                        break;
                    default:
                        break;
                }
                resourceHTML += '   </div>';//close resrcAssetContainer
                if (event.data.resource.paragraphs.length > 0)
                {
                    var transcriptionLanguage = { "id": 0, "digraph": "En", "rtl": false, "title": "English" };
                    var translationLanguage = false;
                    if (module.languages && module.languages.length > 0)
                    {
                        //SME Workspace only provides a means to create a transcript in primary language and a translation
                        translationLanguage = transcriptionLanguage;
                        transcriptionLanguage = { "id": module.languages[0].id, "digraph": module.languages[0].digraph, "rtl": module.languages[0].rtl, "title": module.languages[0].title }
                    }

                    resourceHTML += '<div class="resourceWrapper">';
                    resourceHTML += '   <div class="resourceSpacer"></div>';
                    resourceHTML += '   <div id="resourceContainerHeader" class="resourceContainerHdr">';
                    resourceHTML += '       <div class="transcriptHdr">';
                    if (translationLanguage)
                        resourceHTML += '           <div id="transcriptionBtn_' + transcriptionLanguage.id + '" class="translationBtn">' + transcriptionLanguage.title + '</div>';
                    resourceHTML += '       </div>';//close transcriptHdr
                    if (translationLanguage)
                    {
                        resourceHTML += '       <div id="translationHeader" class="translationHdr">';
                        resourceHTML += '           <div id="translationBtn_' + translationLanguage.id + '" class="translationBtn">' + translationLanguage.title + '</div>';
                        resourceHTML += '       </div >';
                    }
                    resourceHTML += '   </div >';//close resourceContainerHeader
                    resourceHTML += '   <div id="resourceContainer" class="resourceContainer" >';
                    for (var p = 0; p < event.data.resource.paragraphs.length; p++)
                    {
                        resourceHTML += '       <div class="resourceParagraphRow">';
                        resourceHTML += '           <div class="resourceParagraphColumnXscript resourceLanguage_' + transcriptionLanguage.id + '" lang="' + transcriptionLanguage.digraph + '">' + htmlDecode(event.data.resource.paragraphs[p].paragraph.text) + '</div >';
                        if (translationLanguage)
                        {
                            resourceHTML += '           <div class="resourceTranslationColumnContainer">';
                            resourceHTML += '               <div class="resourceParagraphColumnXlation resourceLanguage_' + translationLanguage.id + '" lang="' + translationLanguage.digraph + '">' + ((event.data.resource.paragraphs[p].paragraph.translations.length > 0) ? htmlDecode(event.data.resource.paragraphs[p].paragraph.translations[0].text) : "") + '</div>';
                            resourceHTML += '           </div>';
                        }
                        resourceHTML += '       </div>';//close resourceParagraphRow
                    }
                    resourceHTML += '   </div>';//close resourceContainer
                    resourceHTML += '</div >';//close resourceWrapper;
                }
                resourceHTML += '</div>';//close resourceBody
                if (callOpenDialog)
                    openCustomDialog(dialogTitle, resourceHTML, "", iconHTML);

            });
            sourceCount++;
        }
    }
    if (sourceCount == 0)
        $("#moduleResourceList").remove();
}

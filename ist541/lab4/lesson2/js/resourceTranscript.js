function loadResourceTranscriptActivityComponent(containerElement, activityComponent)
{
    for (var p = 0; p < activityComponent.prompts.length; p++)
    {
        var resource = false;
        if (activityComponent.prompts[p].resources.length == 1)
        {
            resource = getResource(activityComponent.prompts[p].resources[0].id);
            loadTranscriptComponent(containerElement, resource, activityComponent.renderRTL);
        }
    }
}
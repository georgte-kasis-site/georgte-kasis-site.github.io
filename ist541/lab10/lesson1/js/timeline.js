var TimelineRenderModeLayouts = ["Presentational - Horizontal", "Presentational - Vertical", "Student Matches event to Date - Horizontal", "Student Matches event to Date - Vertical"];
var stopDraggingScroll = true;

function loadTimelineActivityComponent(containerElement, activityComponent) 
{
    activityComponent.renderModeLayout = getRenderModeLayout(activityComponent);
    activityComponent.renderModeIndex = getRenderModeLayoutIndex(activityComponent);

    if (activityComponent.prompts.length == 0) {
      containerElement.html('<div class="tabDetails">No timeline prompts have been added</div>');
      return;
    }

    var renderHorizontal;
    var renderInteractive;
    var renderVertical;
    var renderPresentational;
    //Force vertical interactive activityComponent.renderModeIndex = 3;
    switch (activityComponent.renderModeIndex)
    {
		case 0:
      renderHorizontal = true;
      renderInteractive = false;
      renderVertical = false;
      renderPresentational = true;
      break;
    case 1:
      renderHorizontal = false;
      renderInteractive = false;
      renderVertical = true;
      renderPresentational = true;
      break;
    case 2:
      renderHorizontal = true;
      renderInteractive = true;
      renderVertical = false;
      renderPresentational = false;
      break;
    case 3:
      renderHorizontal = false;
      renderInteractive = true;
      renderVertical = true;
      renderPresentational = false;
      break;
    }
    var timelineActivityComponentHTML = '';
    timelineActivityComponentHTML += '<div class="tabDetails">';
    timelineActivityComponentHTML += generateActivityComponentPresentationHTML(activityComponent);
    timelineActivityComponentHTML += `<div class="timelineActivityComponent ${renderVertical && renderInteractive ? 'vertical' : 'horizontal'}">`;
    timelineActivityComponentHTML += `    <div id="timelineComponent_${activityComponent.id}" class="timeline ${renderVertical && renderInteractive ? 'verticalJudgingModeTimeline' : ''}">`;
    timelineActivityComponentHTML += `        <div class="timeline__wrap">`;
    timelineActivityComponentHTML += `            <div id="responsesContainer_${activityComponent.id}" class="timeline__items"></div>`;
    timelineActivityComponentHTML += '        </div>';  
    timelineActivityComponentHTML += '    </div>';
    if (renderInteractive) {  // Render our word pool if judging
      timelineActivityComponentHTML += '<div>';
      timelineActivityComponentHTML += `  <div id="responsePool_${activityComponent.id}" class="timelineResponsesContainer ${renderVertical && renderInteractive ? 'verticalJudgingModePool' : ''}"></div>`;
      timelineActivityComponentHTML += '</div>';
    }
    timelineActivityComponentHTML += '</div>';

    if (activityComponent.instructions.length > 0) {
      loadGenericInstructions(containerElement, activityComponent)
    }

    containerElement.append(timelineActivityComponentHTML);

    activityComponent.prompts.forEach(prompt => loadTimelinePrompt($(`#responsesContainer_${activityComponent.id}`), prompt, activityComponent.renderModeIndex));

    $(`#timelineComponent_${activityComponent.id}`).timeline({
        mode: `${renderHorizontal ? 'horizontal' : 'vertical'}`,
    });

    // Load our timeline responses
    if (renderInteractive) 
    {
        var randomizedResponses = [...activityComponent.responses].sort(() => Math.random() - 0.5); // Array of randomized prompts  
        randomizedResponses.forEach(response => 
        { // Iterate through our prompts to load our responses
            loadTimelineResponse($(`#responsePool_${activityComponent.id}`), response, activityComponent);
        });
    }
}

function loadTimelinePrompt(containerElement, prompt, renderModeIndex) 
{
  var promptText = htmlDecode(prompt.text);
    var responseText = (renderModeIndex == 0 || renderModeIndex == 1) ? htmlDecode(prompt.responses[0].text) : "";
  
  var timelinePromptHTML = '';
  timelinePromptHTML += '<div class="timeline__item">';
  timelinePromptHTML += '    <div class="timeline__content">';
  //Prompt feedback+score container area
  if (renderModeIndex == 2 || renderModeIndex == 3) {//will be for interactive renderModes
    timelinePromptHTML += '<div class="displayTableCell"><div id="promptFeedbackToolBox_' + prompt.id + '" class="inlineToolBox" style="display:none;"></div></div>';
  }

  timelinePromptHTML += '         <div class="prompt">'+promptText+'</div>';
  if (renderModeIndex == 0 || renderModeIndex == 1) {
    timelinePromptHTML += `      <div style="margin-top: 15px; max-height: 200px; overflow-y: auto;">${responseText}</div>`;
  } else {
      timelinePromptHTML += `      <div id="timelineAnswerContainer_${prompt.id}" class="timelineAnswerContainer" data-promptid="${prompt.id}">`;
    timelinePromptHTML += `      <div id="responseFeedbackContainer__${prompt.id}" class="displayTableCell feedbackContainer timelineFeedbackContainer" style="display:none;"></div>`;//response FB
    timelinePromptHTML += `      </div>`;
  }
  timelinePromptHTML += '    </div>';
  timelinePromptHTML += '</div>';

  containerElement.append(timelinePromptHTML)
}

function loadTimelineResponse(containerElement, response, activityComponent) 
{
  var responseText = htmlDecode(response.text);
  var timelineResponseHTML = '';
  timelineResponseHTML += `<div id="response_${response.id}" data-responseid="${response.id}" data-activitycomponentid="${activityComponent.id}" class="timelineResponse--item">`;
  timelineResponseHTML += htmlDecode(responseText);
    timelineResponseHTML += '</div>';
    timelineResponseHTML += '<span id="inlineFeedbackContainer_'+response.id+'" style="display:none;"></span>';
  containerElement.append(timelineResponseHTML);
}


function timeline(collection, options) {
  const timelines = [];
  const warningLabel = "Timeline:";
  let winWidth = window.innerWidth;
  let resizeTimer;
  let currentIndex = 0;
  // Set default settings
  const defaultSettings = {
    forceVerticalMode: {
      type: "integer",
      defaultValue: 600
    },
    horizontalStartPosition: {
      type: "string",
      acceptedValues: ["bottom", "top"],
      defaultValue: "top"
    },
    mode: {
      type: "string",
      acceptedValues: ["horizontal", "vertical"],
      defaultValue: "vertical"
    },
    moveItems: {
      type: "integer",
      defaultValue: 1
    },
    rtlMode: {
      type: "boolean",
      acceptedValues: [true, false],
      defaultValue: false
    },
    startIndex: {
      type: "integer",
      defaultValue: 0
    },
    verticalStartPosition: {
      type: "string",
      acceptedValues: ["left", "right"],
      defaultValue: "left"
    },
    verticalTrigger: {
      type: "string",
      defaultValue: "15%"
    },
    visibleItems: {
      type: "integer",
      defaultValue: 3
    }
  };

  // Helper function to test whether values are an integer
  function testTimelineValues(value, settingName) {
    if (typeof value !== "number" && value % 1 !== 0) {
      console.warn(
        `${warningLabel} The value "${value}" entered for the setting "${settingName}" is not an integer.`
      );
      return false;
    }
    return true;
  }

  // Helper function to wrap an element in another HTML element
  function itemTimelineWrap(el, wrapper, classes) {
    wrapper.classList.add(classes);
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }

  // Helper function to wrap each element in a group with other HTML elements
  function wrapTimelineElements(items) {
    items.forEach((item) => {
      itemTimelineWrap(
        item.querySelector(".timeline__content"),
        document.createElement("div"),
        "timeline__content__wrap"
      );
      itemTimelineWrap(
        item.querySelector(".timeline__content__wrap"),
        document.createElement("div"),
        "timeline__item__inner"
      );
    });
  }

  // Helper function to check if an element is partially in the viewport
  function isTimelineElementInViewport(el, triggerPosition) {
    const rect = el.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const defaultTrigger = defaultSettings.verticalTrigger.defaultValue.match(
      /(\d*\.?\d*)(.*)/
    );
    let triggerUnit = triggerPosition.unit;
    let triggerValue = triggerPosition.value;
    let trigger = windowHeight;
    if (triggerUnit === "px" && triggerValue >= windowHeight) {
      console.warn(
        'The value entered for the setting "verticalTrigger" is larger than the window height. The default value will be used instead.'
      );
      [, triggerValue, triggerUnit] = defaultTrigger;
    }
    if (triggerUnit === "px") {
      trigger = parseInt(trigger - triggerValue, 10);
    } else if (triggerUnit === "%") {
      trigger = parseInt(trigger * ((100 - triggerValue) / 100), 10);
    }
    return (
      rect.top <= trigger &&
      rect.left <=
        (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top + rect.height >= 0 &&
      rect.left + rect.width >= 0
    );
  }

  // Helper function to add transform styles
  function addTimelineTransforms(el, transform) {
    el.style.webkitTransform = transform;
    el.style.msTransform = transform;
    el.style.transform = transform;
  }

  // Create timelines
  function createTimelines(timelineEl) {
    const timelineName = timelineEl.id
      ? `#${timelineEl.id}`
      : `.${timelineEl.className}`;
    const errorPart = "could not be found as a direct descendant of";
    const data = timelineEl.dataset;
    let wrap;
    let scroller;
    let items;
    const settings = {};

    // Test for correct HTML structure
    try {
      wrap = timelineEl.querySelector(".timeline__wrap");
      if (!wrap) {
        throw new Error(
          `${warningLabel} .timeline__wrap ${errorPart} ${timelineName}`
        );
      } else {
        scroller = wrap.querySelector(".timeline__items");
        if (!scroller) {
          throw new Error(
            `${warningLabel} .timeline__items ${errorPart} .timeline__wrap`
          );
        } else {
          items = [].slice.call(scroller.children, 0);
        }
      }
    } catch (e) {
      console.warn(e.message);
      return false;
    }

    // Test setting input values
    Object.keys(defaultSettings).forEach((key) => {
      settings[key] = defaultSettings[key].defaultValue;

      if (data[key]) {
        settings[key] = data[key];
      } else if (options && options[key]) {
        settings[key] = options[key];
      }

      if (defaultSettings[key].type === "integer") {
        if (!settings[key] || !testTimelineValues(settings[key], key)) {
          settings[key] = defaultSettings[key].defaultValue;
        }
      } else if (defaultSettings[key].type === "string") {
        if (
          defaultSettings[key].acceptedValues &&
          defaultSettings[key].acceptedValues.indexOf(settings[key]) === -1
        ) {
          console.warn(
            `${warningLabel} The value "${settings[key]}" entered for the setting "${key}" was not recognised.`
          );
          settings[key] = defaultSettings[key].defaultValue;
        }
      }
    });

    // Further specific testing of input values
    const defaultTrigger = defaultSettings.verticalTrigger.defaultValue.match(
      /(\d*\.?\d*)(.*)/
    );
    const triggerArray = settings.verticalTrigger.match(/(\d*\.?\d*)(.*)/);
    let [, triggerValue, triggerUnit] = triggerArray;
    let triggerValid = true;
    if (!triggerValue) {
      console.warn(
        `${warningLabel} No numercial value entered for the 'verticalTrigger' setting.`
      );
      triggerValid = false;
    }
    if (triggerUnit !== "px" && triggerUnit !== "%") {
      console.warn(
        `${warningLabel} The setting 'verticalTrigger' must be a percentage or pixel value.`
      );
      triggerValid = false;
    }
    if (triggerUnit === "%" && (triggerValue > 100 || triggerValue < 0)) {
      console.warn(
        `${warningLabel} The 'verticalTrigger' setting value must be between 0 and 100 if using a percentage value.`
      );
      triggerValid = false;
    } else if (triggerUnit === "px" && triggerValue < 0) {
      console.warn(
        `${warningLabel} The 'verticalTrigger' setting value must be above 0 if using a pixel value.`
      );
      triggerValid = false;
    }

    if (triggerValid === false) {
      [, triggerValue, triggerUnit] = defaultTrigger;
    }

    settings.verticalTrigger = {
      unit: triggerUnit,
      value: triggerValue
    };

    if (settings.moveItems > settings.visibleItems) {
      console.warn(
        `${warningLabel} The value of "moveItems" (${settings.moveItems}) is larger than the number of "visibleItems" (${settings.visibleItems}). The value of "visibleItems" has been used instead.`
      );
      settings.moveItems = settings.visibleItems;
    }

    if (
      settings.startIndex > items.length - settings.visibleItems &&
      items.length > settings.visibleItems
    ) {
      console.warn(
        `${warningLabel} The 'startIndex' setting must be between 0 and ${
          items.length - settings.visibleItems
        } for this timeline. The value of ${
          items.length - settings.visibleItems
        } has been used instead.`
      );
      settings.startIndex = items.length - settings.visibleItems;
    } else if (items.length <= settings.visibleItems) {
      console.warn(
        `${warningLabel} The number of items in the timeline must exceed the number of visible items to use the 'startIndex' option.`
      );
      settings.startIndex = 0;
    } else if (settings.startIndex < 0) {
      console.warn(
        `${warningLabel} The 'startIndex' setting must be between 0 and ${
          items.length - settings.visibleItems
        } for this timeline. The value of 0 has been used instead.`
      );
      settings.startIndex = 0;
    }

    timelines.push({
      timelineEl,
      wrap,
      scroller,
      items,
      settings
    });
  }

  if (collection.length) {
    [].forEach.call(collection, createTimelines);
  }

  // Set height and widths of timeline elements and viewport
  function setTimelineHeightandWidths(tl) {
    // Set widths of items and viewport
    function setTimelineWidths() {
      tl.itemWidth = tl.wrap.offsetWidth / tl.settings.visibleItems;
      tl.items.forEach((item) => {
        item.style.width = `${tl.itemWidth}px`;
      });
      tl.scrollerWidth = tl.itemWidth * tl.items.length;
      tl.scroller.style.width = `${tl.scrollerWidth}px`;
    }

    // Set height of items and viewport
    function setTimelineHeights() {
      let oddIndexTallest = 0;
      let evenIndexTallest = 0;
      tl.items.forEach((item, i) => {
        item.style.height = "auto";
        const height = item.offsetHeight;
        if (i % 2 === 0) {
          evenIndexTallest =
            height > evenIndexTallest ? height : evenIndexTallest;
        } else {
          oddIndexTallest = height > oddIndexTallest ? height : oddIndexTallest;
        }
      });

      const transformString = `translateY(${evenIndexTallest}px)`;
      tl.items.forEach((item, i) => {
        if (i % 2 === 0) {
          item.style.height = `${evenIndexTallest}px`;
          if (tl.settings.horizontalStartPosition === "bottom") {
            item.classList.add("timeline__item--bottom");
            addTimelineTransforms(item, transformString);
          } else {
            item.classList.add("timeline__item--top");
          }
        } else {
          item.style.height = `${oddIndexTallest}px`;
          if (tl.settings.horizontalStartPosition !== "bottom") {
            item.classList.add("timeline__item--bottom");
            addTimelineTransforms(item, transformString);
          } else {
            item.classList.add("timeline__item--top");
          }
        }
      });
      tl.scroller.style.height = `${evenIndexTallest + oddIndexTallest}px`;
    }

    if (window.innerWidth > tl.settings.forceVerticalMode) {
      setTimelineWidths();
      setTimelineHeights();
    }
  }

  // Create and add arrow controls to horizontal timeline
  function addTimelineNavigation(tl) {
    if (tl.items.length > tl.settings.visibleItems) {
      const prevArrow = document.createElement("button");
      const nextArrow = document.createElement("button");
      const topPosition = tl.items[0].offsetHeight;
      prevArrow.className = "timeline-nav-button timeline-nav-button--prev";
      nextArrow.className = "timeline-nav-button timeline-nav-button--next";
      prevArrow.textContent = "Previous";
      nextArrow.textContent = "Next";

      if (currentIndex === 0) {
        prevArrow.disabled = true;
      } else if (currentIndex === tl.items.length - tl.settings.visibleItems) {
        nextArrow.disabled = true;
      }
      tl.timelineEl.appendChild(prevArrow);
      tl.timelineEl.appendChild(nextArrow);
    }
  }

  // Add the centre line to the horizontal timeline
  function addHorizontalDivider(tl) {
    const divider = tl.timelineEl.querySelector(".timeline-divider");
    if (divider) {
      tl.timelineEl.removeChild(divider);
    }
    const topPosition = tl.items[0].offsetHeight;
    const horizontalDivider = document.createElement("span");
    horizontalDivider.className = "timeline-divider";
    horizontalDivider.style.top = `${topPosition}px`;
    tl.timelineEl.appendChild(horizontalDivider);
  }

  // Calculate the new position of the horizontal timeline
  function timelinePosition(tl) {
    const position = tl.items[currentIndex].offsetLeft;
    const str = `translate3d(-${position}px, 0, 0)`;
    addTimelineTransforms(tl.scroller, str);
  }

  // Make the horizontal timeline slide
  function slideTimeline(tl) {
    const navArrows = tl.timelineEl.querySelectorAll(".timeline-nav-button");
    const arrowPrev = tl.timelineEl.querySelector(".timeline-nav-button--prev");
    const arrowNext = tl.timelineEl.querySelector(".timeline-nav-button--next");
    const maxIndex = tl.items.length - tl.settings.visibleItems;
    const moveItems = parseInt(tl.settings.moveItems, 10);
    [].forEach.call(navArrows, (arrow) => {
      arrow.addEventListener("click", function (e) {
        e.preventDefault();
        currentIndex = this.classList.contains("timeline-nav-button--next")
          ? (currentIndex += moveItems)
          : (currentIndex -= moveItems);
        if (currentIndex === 0 || currentIndex < 0) {
          currentIndex = 0;
          arrowPrev.disabled = true;
          arrowNext.disabled = false;
        } else if (currentIndex === maxIndex || currentIndex > maxIndex) {
          currentIndex = maxIndex;
          arrowPrev.disabled = false;
          arrowNext.disabled = true;
        } else {
          arrowPrev.disabled = false;
          arrowNext.disabled = false;
        }
        timelinePosition(tl);
      });
    });
  }

  // Set up horizontal timeline
  function setUpHorinzontalTimeline(tl) {
    if (tl.settings.rtlMode) {
      currentIndex =
        tl.items.length > tl.settings.visibleItems
          ? tl.items.length - tl.settings.visibleItems
          : 0;
    } else {
      currentIndex = tl.settings.startIndex;
    }
    tl.timelineEl.classList.add("timeline--horizontal");
    setTimelineHeightandWidths(tl);
    timelinePosition(tl);
    addTimelineNavigation(tl);
    addHorizontalDivider(tl);
    slideTimeline(tl);
  }

  // Set up vertical timeline
  function setUpVerticalTimeline(tl) {
    let lastVisibleIndex = 0;
    tl.items.forEach((item, i) => {
      item.classList.remove("animated", "fadeIn");
      if (!isTimelineElementInViewport(item, tl.settings.verticalTrigger) && i > 0) {
        item.classList.add("animated");
      } else {
        lastVisibleIndex = i;
      }
      const divider = tl.settings.verticalStartPosition === "left" ? 1 : 0;
      if (
        i % 2 === divider &&
        window.innerWidth > tl.settings.forceVerticalMode
      ) {
        item.classList.add("timeline__item--right");
      } else {
        item.classList.add("timeline__item--left");
      }
    });
    for (let i = 0; i < lastVisibleIndex; i += 1) {
      tl.items[i].classList.remove("animated", "fadeIn");
    }
    // Bring elements into view as the page is scrolled
    window.addEventListener("scroll", () => {
      tl.items.forEach((item) => {
        if (isTimelineElementInViewport(item, tl.settings.verticalTrigger)) {
          item.classList.add("fadeIn");
        }
      });
    });
  }

  // Reset timelines
  function resetTimelines(tl) {
    tl.timelineEl.classList.remove("timeline--horizontal", "timeline--mobile");
    tl.scroller.removeAttribute("style");
    tl.items.forEach((item) => {
      item.removeAttribute("style");
      item.classList.remove(
        "animated",
        "fadeIn",
        "timeline__item--left",
        "timeline__item--right"
      );
    });
    const navArrows = tl.timelineEl.querySelectorAll(".timeline-nav-button");
    [].forEach.call(navArrows, (arrow) => {
      arrow.parentNode.removeChild(arrow);
    });
  }

  // Set up the timelines
  function setUpTimelines() {
    timelines.forEach((tl) => {
      tl.timelineEl.style.opacity = 0;
      if (!tl.timelineEl.classList.contains("timeline--loaded")) {
        wrapTimelineElements(tl.items);
      }
      resetTimelines(tl);
      if (window.innerWidth <= tl.settings.forceVerticalMode) {
        tl.timelineEl.classList.add("timeline--mobile");
      }
      if (
        tl.settings.mode === "horizontal" &&
        window.innerWidth > tl.settings.forceVerticalMode
      ) {
        setUpHorinzontalTimeline(tl);
      } else {
        setUpVerticalTimeline(tl);
      }
      tl.timelineEl.classList.add("timeline--loaded");
      setTimeout(() => {
        tl.timelineEl.style.opacity = 1;
      }, 500);
    });
  }

  // Initialise the timelines on the page
  setUpTimelines();

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newWinWidth = window.innerWidth;
      if (newWinWidth !== winWidth) {
        setUpTimelines();
        winWidth = newWinWidth;
      }
    }, 250);
  });

  $(document).bind("navigationTriggered", function (event) {
      setUpTimelines();
  });

}

// Register as a jQuery plugin if the jQuery library is present
if (window.jQuery) {
  (($) => {
    $.fn.timeline = function (opts) {
      timeline(this, opts);
      return this;
    };
  })(window.jQuery);
}
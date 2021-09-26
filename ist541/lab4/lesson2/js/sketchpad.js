
//    The MIT License (MIT)
//
//    Copyright (c) 2014-2016 YIOM
//
//    Permission is hereby granted, free of charge, to any person obtaining a copy
//    of this software and associated documentation files (the "Software"), to deal
//    in the Software without restriction, including without limitation the rights
//    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//    copies of the Software, and to permit persons to whom the Software is
//    furnished to do so, subject to the following conditions:
//
//    The above copyright notice and this permission notice shall be included in
//    all copies or substantial portions of the Software.
//
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//    THE SOFTWARE.

function Sketchpad(config)
{
    // Enforces the context for all functions
    for (var key in this.constructor.prototype)
    {
        this[key] = this[key].bind(this);
    }

    // Warn the user if no DOM element was selected
    if (!config.hasOwnProperty('element'))
    {
        console.error('SKETCHPAD ERROR: No element selected');
        return;
    }

    if (typeof (config.element) === 'string')
    {
        this.element = $(config.element);
    }
    else
    {
        this.element = config.element;
    }

    // Width can be defined on the HTML or programatically
    this._width = config.width || this.element.attr('data-width') || 0;
    this._height = config.height || this.element.attr('data-height') || 0;

    // Pen attributes
    this.color = config.color || this.element.attr('data-color') || '#000000';
    this.penSize = config.penSize || this.element.attr('data-penSize') || 1;

    // ReadOnly sketchpads may not be modified
    this.readOnly = config.readOnly || this.element.attr('data-readOnly') || false;
    if (!this.readOnly)
    {
        this.element.css({ cursor: 'crosshair' });
    }

    //Animation speed variable in ms
    this.animationSpeed = config.animationSpeed || this.element.attr('data-animationSpeed') || 10;

    // Stroke control variables
    this.strokes = config.strokes || [];
    this._currentStroke = {
        color: null,
        size: null,
        lines: [],
    };

    // Undo History
    this.undoHistory = config.undoHistory || [];

    // Animation function calls
    this.animateIds = [];

    // Set sketching state
    this._sketching = false;

    // Setup canvas sketching listeners
    this.reset();

    //Canvas Element id // remove "_canvas" use as selector
    this.elementIdPrefix = this.element.attr("id").slice(0, -7);
}

//
// Private API
//

Sketchpad.prototype._cursorPosition = function (event)
{
    return {
        x: event.pageX - $(this.canvas).offset().left,
        y: event.pageY - $(this.canvas).offset().top,
    };
};

Sketchpad.prototype._draw = function (start, end, color, size)
{
    this._stroke(start, end, color, size, 'source-over');
};

Sketchpad.prototype._erase = function (start, end, color, size)
{
    this._stroke(start, end, color, size, 'destination-out');
};

Sketchpad.prototype._stroke = function (start, end, color, size, compositeOperation)
{
    this.context.save();
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = color;
    this.context.lineWidth = size;
    this.context.globalCompositeOperation = compositeOperation;
    this.context.beginPath();
    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.closePath();
    this.context.stroke();

    this.context.restore();
};

//
// Callback Handlers
//

Sketchpad.prototype._mouseDown = function (event)
{
    this._lastPosition = this._cursorPosition(event);
    this._currentStroke.color = this.color;
    this._currentStroke.size = this.penSize;
    this._currentStroke.lines = [];
    this._sketching = true;
    this.canvas.addEventListener('mousemove', this._mouseMove);

    //Force a "Dot" on mouse down, taken from _mouseMouve
    var currentPosition = this._cursorPosition(event);
    this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
    this._currentStroke.lines.push({
        start: $.extend(true, {}, this._lastPosition),
        end: $.extend(true, {}, currentPosition),
    });

    this._lastPosition = currentPosition;
};

Sketchpad.prototype._mouseUp = function (event)
{
    if (this._sketching)
    {

        // Check that the current stroke is not empty
        if (this._currentStroke.lines.length > 0)
        {
            this.strokes.push($.extend(true, {}, this._currentStroke));
        }

        this._sketching = false;
    }
    this.canvas.removeEventListener('mousemove', this._mouseMove);
};

Sketchpad.prototype._mouseMove = function (event)
{
    var currentPosition = this._cursorPosition(event);

    this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
    this._currentStroke.lines.push({
        start: $.extend(true, {}, this._lastPosition),
        end: $.extend(true, {}, currentPosition),
    });

    this._lastPosition = currentPosition;
};

Sketchpad.prototype._touchStart = function (event)
{
    event.preventDefault();
    if (this._sketching)
    {
        return;
    }
    this._lastPosition = this._cursorPosition(event.changedTouches[0]);
    this._currentStroke.color = this.color;
    this._currentStroke.size = this.penSize;
    this._currentStroke.lines = [];
    this._sketching = true;
    this.canvas.addEventListener('touchmove', this._touchMove, false);

    //Force a "Dot" on mouse down, taken from _touchMouve
    var currentPosition = this._cursorPosition(event.changedTouches[0]);

    this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
    this._currentStroke.lines.push({
        start: $.extend(true, {}, this._lastPosition),
        end: $.extend(true, {}, currentPosition),
    });

    this._lastPosition = currentPosition;
};

Sketchpad.prototype._touchEnd = function (event)
{
    event.preventDefault();
    if (this._sketching)
    {
        this.strokes.push($.extend(true, {}, this._currentStroke));
        this._sketching = false;
    }
    this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchCancel = function (event)
{
    event.preventDefault();
    if (this._sketching)
    {
        this.strokes.push($.extend(true, {}, this._currentStroke));
        this._sketching = false;
    }
    this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchLeave = function (event)
{
    event.preventDefault();
    if (this._sketching)
    {
        this.strokes.push($.extend(true, {}, this._currentStroke));
        this._sketching = false;
    }
    this.canvas.removeEventListener('touchmove', this._touchMove);
};

Sketchpad.prototype._touchMove = function (event)
{
    event.preventDefault();
    var currentPosition = this._cursorPosition(event.changedTouches[0]);

    this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
    this._currentStroke.lines.push({
        start: $.extend(true, {}, this._lastPosition),
        end: $.extend(true, {}, currentPosition),
    });

    this._lastPosition = currentPosition;
};

//
// Public API
//

Sketchpad.prototype.reset = function ()
{
    // Set attributes
    this.canvas = this.element[0];
    this.canvas.width = this._width;
    this.canvas.height = this._height;
    this.context = this.canvas.getContext('2d');

    // Setup event listeners
    this.redraw(this.strokes);

    if (this.readOnly)
    {
        return;
    }

    // Mouse
    this.canvas.addEventListener('mousedown', this._mouseDown);
    this.canvas.addEventListener('mouseout', this._mouseUp);
    this.canvas.addEventListener('mouseup', this._mouseUp);

    // Touch
    this.canvas.addEventListener('touchstart', this._touchStart);
    this.canvas.addEventListener('touchend', this._touchEnd);
    this.canvas.addEventListener('touchcancel', this._touchCancel);
    this.canvas.addEventListener('touchleave', this._touchLeave);
};

Sketchpad.prototype.drawStroke = function (stroke)
{
    for (var j = 0; j < stroke.lines.length; j++)
    {
        var line = stroke.lines[j];
        this._draw(line.start, line.end, stroke.color, stroke.size);
    }
};

Sketchpad.prototype.redraw = function (strokes)
{
    for (var i = 0; i < strokes.length; i++)
    {
        this.drawStroke(strokes[i]);
    }
};

Sketchpad.prototype.toObject = function ()
{
    return {
        width: this.canvas.width,
        height: this.canvas.height,
        strokes: this.strokes,
        undoHistory: this.undoHistory,
    };
};

Sketchpad.prototype.toJSON = function ()
{
    return JSON.stringify(this.toObject());
};

Sketchpad.prototype.animate = function (ms, loop, loopDelay)
{
    this.clear();
    var delay = ms;
    var callback = null;
    for (var i = 0; i < this.strokes.length; i++)
    {
        var stroke = this.strokes[i];
        for (var j = 0; j < stroke.lines.length; j++)
        {
            var line = stroke.lines[j];
            callback = this._draw.bind(this, line.start, line.end,
                stroke.color, stroke.size);
            this.animateIds.push(setTimeout(callback, delay));
            delay += ms;
        }
    }
    if (loop)
    {
        loopDelay = loopDelay || 0;
        callback = this.animate.bind(this, ms, loop, loopDelay);
        this.animateIds.push(setTimeout(callback, delay + loopDelay));
    }
};

Sketchpad.prototype.setAnimationSpeed = function (ms){
    //Acts as a toggle
    this.cancelAnimation();
    this.clear();
    this.clear();
    this.redraw(this.strokes);
    this.animationSpeed = ms;
    if(ms == 40){
        $("#" + this.elementIdPrefix + "_animateSpeed1x").hide();
        $("#" + this.elementIdPrefix + "_animateSpeed5x").show();
    } else {
        $("#" + this.elementIdPrefix + "_animateSpeed1x").show();
        $("#" + this.elementIdPrefix + "_animateSpeed5x").hide();
    }
}

Sketchpad.prototype.cancelAnimation = function ()
{
    for (var i = 0; i < this.animateIds.length; i++)
    {
        clearTimeout(this.animateIds[i]);
    }
};

Sketchpad.prototype.clear = function ()
{
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Sketchpad.prototype.deleteStep = function(){
    this.strokes.pop();
    var stroke = this.strokes;
    if (stroke)
    {
        this.clear();
        this.redraw(this.strokes);
    }

    if(this.strokes.length == 0){
        $("#" + this.elementIdPrefix + "_undoButton").addClass("disabled");
        $("#" + this.elementIdPrefix + "_deleteStepButton").addClass("disabled");
        $("#" + this.elementIdPrefix + "_redoButton").addClass("disabled");
        $("#" + this.elementIdPrefix + "_animateButton").addClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed1x").addClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed5x").addClass("disabled");
    }
    if(this.strokes.length > 1){
        // $("#" + this.elementIdPrefix + "_undoButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_deleteStepButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_redoButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed1x").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed5x").removeClass("disabled");
    }
}

Sketchpad.prototype.undo = function ()
{
    this.clear();
    var stroke = this.strokes.pop();
    if (stroke)
    {
        this.undoHistory.push(stroke);
        this.redraw(this.strokes);
        $("#" + this.elementIdPrefix + "_redoButton").removeClass("disabled");
        if(this.strokes.length == 0){
            $("#" + this.elementIdPrefix + "_undoButton").addClass("disabled");
            $("#" + this.elementIdPrefix + "_deleteStepButton").addClass("disabled");
            $("#" + this.elementIdPrefix + "_animateButton").addClass("disabled");
            $("#" + this.elementIdPrefix + "_animateSpeed1x").addClass("disabled");
            $("#" + this.elementIdPrefix + "_animateSpeed5x").addClass("disabled");
        }
    }
};

Sketchpad.prototype.redo = function ()
{
    var stroke = this.undoHistory.pop();
    if (stroke)
    {
        this.strokes.push(stroke);
        this.drawStroke(stroke);
        $("#" + this.elementIdPrefix + "_undoButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_deleteStepButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateButton").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed1x").removeClass("disabled");
        $("#" + this.elementIdPrefix + "_animateSpeed5x").removeClass("disabled");
    }

    if(this.undoHistory.length == 0){
        $("#" + this.elementIdPrefix + "_redoButton").addClass("disabled");
    }

};

var canvasSizeOptions = [{ height: 400, width: 400, name: "Small" }, { height: 400, width: 600, name: "Medium" }, { height: 600, width: 600, name: "Large" }];
var defaultCanvas = { height: canvasSizeOptions[0].height, width: canvasSizeOptions[0].width, strokes: [], undoHistory: [] };


(function ($)
{
    $.fn.ucatCanvas = function (options, saveData)
    {
        var sketchPad, canvasElement, drawToolsDiv, stepControlsDiv, deleteStepDiv, undoButton, deleteStepButton, redoButton, colorPicker, sizePicker, sizeDisplay, animateButton, animateSpeed1x, animateSpeed5x, toggleCanvasBg, clearButton;
        var canvasContainerElement = $(this);
        var containerElementId = canvasContainerElement.attr("id");
        var canvasId;
        var animationSpeed = 10;
        var data = typeof (saveData) != "undefined" ? saveData : false;
        var width = data ? data.width : defaultCanvas.width;
        var height = data ? data.height : defaultCanvas.height;

        var settings = $.extend({
            drawTools: true,
            stepControls: true,
            submit: true
        }, options);

        var readOnly = settings.drawTools ? false : true;

        loadCanvas();

        function loadCanvas()
        {
            canvasId = GUID();
            var canvasHTML = '';
            canvasHTML += '<div style="margin-bottom:.5em;display: table; min-height: 2.125em;">';
            //CANVAS PEN/BG TOOLS
            canvasHTML += '<div id="'+containerElementId+'_drawToolsDiv" style="display:none;" class="canvasToolbarControlContainer canvasToolsDrawingContainer">';
            //Pen
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Pen Display" style="padding: 0; min-width:2em; height:2em; background:#ffffff; border:1px solid #cccccc;">';//PEN SIZE DISPLAY
            canvasHTML += '<div id="'+containerElementId+'_sizeDisplay" class="penSizeDisplay" style="border:1px solid #000000; margin:auto; width:1px;height:1px; background:#000000; border-radius:50%;"></div>';
            canvasHTML += '</div>';
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Pen Size">';
            canvasHTML += '<input id="'+containerElementId+'_sizePicker" type="range" min="2" max="28" value="2" style="background: #ffffff; width:50px;">';
            canvasHTML += '</div>';

            //Pen Color
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Pen Color">';
            canvasHTML += '<input id="'+containerElementId+'_colorPicker" type="color">';
            canvasHTML += '</div>';
            //Canvas Background
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Show/Hide Background">';
            canvasHTML += '<div class="paperToggleContainer noselect">';
            canvasHTML += '    <input type="checkbox" id="' + containerElementId +'_toggleCanvasBg" class="checkbox" checked>';
            canvasHTML += '    <label title="toggle background on/off" for="' + containerElementId +'_toggleCanvasBg" class="switch">';
            canvasHTML += '        <span class="toggleOn">ON</span>';
            canvasHTML += '        <span class="toggleOff">OFF</span>';
            canvasHTML += '    </label>';
            canvasHTML += '</div>';
            canvasHTML += '</div>';
            //Clear
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Erase">';
            canvasHTML += '<div id="' + containerElementId +'_clearButton" class="btnGrey"><i class="fa fa-eraser"></i></div>';
            canvasHTML += '</div>';

            canvasHTML += '</div>';
            
            //CANVAS PLAYBACK TOOLS
            canvasHTML += '<div id="'+containerElementId+'_stepControlsDiv" style="display:none;" class="canvasToolbarControlContainer canvasToolsPlaybackContainer">';
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Step Backward">';
            canvasHTML += '<div id="'+containerElementId+'_undoButton" class="btnGrey disabled"><i class="fa fa-step-backward"></i></div>';
            canvasHTML += '</div>';
            canvasHTML += '<div id="'+containerElementId+'_deleteStepDiv" class="canvasToolbarControlContainer" title="Delete This Step">';
            canvasHTML += '<div id="' + containerElementId +'_deleteStepButton" class="btnGrey disabled"><i class="fa fa-trash-o"></i></div>';
            canvasHTML += '</div>';
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Step Forward">';
            canvasHTML += '<div id="' + containerElementId +'_redoButton" class="btnGrey disabled"><i class="fa fa-step-forward"></i></div>';
            canvasHTML += '</div>';
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Animate Steps">';
            canvasHTML += '<div id="'+containerElementId+'_animateButton" class="btnGrey disabled"><i class="fa fa-play"></i></div>';
            canvasHTML += '</div>';
            canvasHTML += '<div class="canvasToolbarControlContainer" title="Animation Speed" style="padding:0; min-width: 1.125em;">';
            canvasHTML += '<div id="'+containerElementId+'_animateSpeed1x" class="btnGreyToggle disabled" style="">1x</div>';
            canvasHTML += '<div id="'+containerElementId+'_animateSpeed5x" class="btnGreyToggle disabled" style="display:none; background:#ffffff;">.5x</div>';
            canvasHTML += '</div>';

            canvasHTML += '</div>';
            canvasHTML += '</div>';//End drawToolsDiv

            canvasHTML += '<canvas id="' + containerElementId + '_canvas" style="border:1px solid #cccccc; cursor:crosshair;" class="canvasPaper canvasPaperLines"></canvas>';

            canvasContainerElement.html(canvasHTML);

            canvasElement = $("#" + containerElementId + "_canvas");
            drawToolsDiv = $("#" + containerElementId + "_drawToolsDiv");
            stepControlsDiv = $("#" + containerElementId + "_stepControlsDiv");
            deleteStepDiv = $("#" + containerElementId + "_deleteStepDiv");
            undoButton = $("#" + containerElementId + "_undoButton");
            deleteStepButton  = $("#" + containerElementId + "_deleteStepButton");
            redoButton = $("#" + containerElementId + "_redoButton");
            colorPicker = $("#" + containerElementId + "_colorPicker");
            sizePicker = $("#" + containerElementId + "_sizePicker");
            sizeDisplay = $("#" + containerElementId + "_sizeDisplay");
            animateButton = $("#" + containerElementId + "_animateButton");
            animateSpeed1x = $("#" + containerElementId + "_animateSpeed1x");
            animateSpeed5x = $("#" + containerElementId + "_animateSpeed5x");
            toggleCanvasBg = $("#" + containerElementId + "_toggleCanvasBg");
            clearButton = $("#" + containerElementId + "_clearButton");

            var savedStrokes = data ? data.strokes : [];
            if(savedStrokes.length > 0){
                animateButton.removeClass("disabled");
                animateSpeed1x.removeClass("disabled");
                animateSpeed5x.removeClass("disabled");
                undoButton.removeClass("disabled");
                deleteStepButton.removeClass("disabled");
                //redoButton.removeClass("disabled");
            }
            var savedHistory = data ? data.undoHistory : [];
            sketchPad = new Sketchpad({
                element: '#'+ containerElementId + '_canvas',
                width: width,
                height: height,
                strokes: savedStrokes,
                undoHistory: savedHistory,
                readOnly: readOnly
            });

            if (settings.drawTools)
            {
                drawToolsDiv.show();
            }
            else
            {
                drawToolsDiv.hide();
                deleteStepDiv.hide();
            }

            if (settings.stepControls)
            {
                stepControlsDiv.show();
            }
            else
            {
                stepControlsDiv.hide();
                deleteStepDiv.hide();
            }

            colorPicker.val('#000000');
            sizePicker.val(2);
            sizeDisplay.css({'width':sizePicker.val(1),'height':sizePicker.val(1), 'background':'#000000'})

            colorPicker.on("change", function (event)
            {
                sketchPad.color = $(event.target).val();
                sizeDisplay.css({'background':$(event.target).val()});
            });

            sizePicker.on("change", function (event)
            {
                sketchPad.penSize = $(event.target).val();
                sizeDisplay.css({'width':$(event.target).val(),'height':$(event.target).val()})
            });

            undoButton.on("click", function (event)
            {
                sketchPad.undo();
                canvasContainerElement.data("sketchpad",sketchPad);
                var sketchpadChangeEvent = $.Event("sketchpadChange");
                sketchpadChangeEvent.sketchPad = sketchPad;
                sketchpadChangeEvent.containerElement = canvasContainerElement;
                $(document).trigger(sketchpadChangeEvent);
            });

            deleteStepButton.on("click", function (event)
            {
                sketchPad.deleteStep();
                canvasContainerElement.data("sketchpad", sketchPad);
                var sketchpadChangeEvent = $.Event("sketchpadChange");
                sketchpadChangeEvent.sketchPad = sketchPad;
                sketchpadChangeEvent.containerElement = canvasContainerElement;
                $(document).trigger(sketchpadChangeEvent);
            });

            redoButton.on("click", function ()
            {
                sketchPad.redo();
                canvasContainerElement.data("sketchpad", sketchPad);
                var sketchpadChangeEvent = $.Event("sketchpadChange");
                sketchpadChangeEvent.sketchPad = sketchPad;
                sketchpadChangeEvent.containerElement = canvasContainerElement;
                $(document).trigger(sketchpadChangeEvent);
            });

            animateButton.on("click", function ()
            {
                if(!$(this).hasClass("disabled"))
                    sketchPad.animate(sketchPad.animationSpeed);
            });

            animateSpeed1x.on("click", function(){
                if(!$(this).hasClass("disabled"))
                    sketchPad.setAnimationSpeed(40);
            });

            animateSpeed5x.on("click", function(){
                if(!$(this).hasClass("disabled"))
                    sketchPad.setAnimationSpeed(10);
            });

            toggleCanvasBg.on('change', function () 
            {
                if (toggleCanvasBg.is(":checked")) 
                {
                    canvasElement.addClass("canvasPaperLines");
                }
                else
                {
                    canvasElement.removeClass("canvasPaperLines");
                }
            });

            /*when is this called? Answer: its not. Its just a demo of how to load saved canvas data into another canvas
            function recover(event)
            {
                var settings = sketchpad.toObject();
                settings.element = '#other-sketchpad';
                var otherSketchpad = new Sketchpad(settings);
            }
            */

            clearButton.on("click", function ()
            {
                sketchPad.clear();
                sketchPad.animateIds = [];
                sketchPad.undoHistory = [];
                sketchPad.strokes = [];
                animateButton.addClass("disabled");
                animateSpeed1x.addClass("disabled");
                animateSpeed5x.addClass("disabled");
                undoButton.addClass("disabled");
                deleteStepButton.addClass("disabled");
                redoButton.addClass("disabled");

                canvasContainerElement.data("sketchpad", sketchPad);
                var sketchpadChangeEvent = $.Event("sketchpadChange");
                sketchpadChangeEvent.sketchPad = sketchPad;
                sketchpadChangeEvent.containerElement = canvasContainerElement;
                $(document).trigger(sketchpadChangeEvent);
            });

            if (data)
            {
                sketchPad.undoHistory = data.undoHistory;
                sketchPad.strokes = data.strokes;
            }

            if (settings.submit)
            {
                canvasElement.on('mouseup touchend', function (event)
                {
                    if(sketchPad.strokes.length > 0 ){
                        animateButton.removeClass("disabled");
                        animateSpeed1x.removeClass("disabled");
                        animateSpeed5x.removeClass("disabled");
                        undoButton.removeClass("disabled");
                        deleteStepButton.removeClass("disabled");
                        redoButton.addClass("disabled");
                    }
                    canvasContainerElement.data("sketchpad", sketchPad);
                    var sketchpadChangeEvent = $.Event("sketchpadChange");
                    sketchpadChangeEvent.sketchPad = sketchPad;
                    sketchpadChangeEvent.containerElement = canvasContainerElement;
                    $(document).trigger(sketchpadChangeEvent);
                });
            }

            canvasContainerElement.data("sketchpad",sketchPad);
        }
        return sketchPad;
    };
})(jQuery);

/*!
 * jquery.tour.js 0.0.2 - https://github.com/yckart/jquery.tour.js
 * A frontend presentation tool.
 *
 * Based upon https://github.com/twanlass/tour.js
 *
 * Copyright (c) 2013 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/02/09
*/
(function ($, window) {
    $.tour = function (TourSteps, TourCompleteCallback) {

        var Tour = {
            startFrom: 0, // override this to start the tour from a specified point
            offsetFudge: 15, // adjusts distance from target for tour dialog
            allowSkip: false, // coming in a future update
            funnelID: "tourV1", // we'll pass this to Mixpanel to segement on and guage future funnel improvment

            init: function () {
                $('body').prepend('<div id="tour_mask"></div><div id="tour_dialog"><div class="arrow top"></div><div class="msg"></div></div>');
                this.showStep();
            },

            // increment steps or pause if we're waiting on a trigger to advance
            nextStep: function () {
                var latent = TourSteps[this.startFrom].waitForTrigger; // should we proceed?
                this.startFrom += 1;
                this[this.startFrom < TourSteps.length && !latent ? 'showStep' : 'tourComplete']();
            },

            // build dialog content, set focus on elements, and finally fade in the step
            showStep: function () {
                var parent = this;
                this.setupSelectorsLive();

                $('.tour_item').removeClass('active');
                this.getContent();
                this.setDialogPos(TourSteps[this.startFrom].position);
                $('*').bind('click', {
                    stop: this.startFrom
                }, this.tourClickHandler);

                if (!$('#tour_mask').is(":visible")) {
                    $('#tour_mask').fadeIn();
                }

                $(TourSteps[this.startFrom].selector).addClass('active').fadeIn();
                $('#tour_dialog').fadeIn(function () {
                    parent.dialogVisible();
                });
            },

            stepComplete: function () {
                this.mpEvent(TourSteps[this.startFrom].actionName);
                $('*').unbind('click', this.tourClickHandler);
                var parent = this;
                $('#tour_dialog').fadeOut(function () {
                    parent.nextStep();
                    this.inProgress = true;
                });
            },

            tourComplete: function () {
                $('#tour_dialog').fadeOut();
                // sipmle check to see if we're pausing or at the end of our tour step
                // if we're just pausing, we want to keep focus on the area until we move forward
                if (this.startFrom == TourSteps.length) {
                    $('#tour_mask').fadeOut(function () {
                        $('.tour_item').removeClass('active');
                        if (typeof TourCompleteCallback == 'function') {
                            TourCompleteCallback.call();
                        }
                    });
                }
            },

            // To use: include MixPanel js (see mixpanel.com). Set identity or person info *before* the tour starts.
            // Add a "actionName" string to each step and upon user completion it will be automatically sent to MixPanel for funnel tracking
            mpEvent: function (eventName) {
                if (eventName) {
                    mixpanel.track(eventName, {
                        "funnelVersion": this.funnelID
                    });
                }
            },

            getContent: function () {
                var message = TourSteps[this.startFrom].msg;
                message += TourSteps[this.startFrom].btnMsg ? "<hr><div id='tour_dialog_btn' class='button'>" + TourSteps[this.startFrom].btnMsg + "</div>" : "";
                $('#tour_dialog .msg').html(message);
            },

            setDialogPos: function (position) {

                // @todo - need to calculate arrow position in px instead of %

                var selArray = TourSteps[this.startFrom].selector.split(",");
                var target = $(selArray[0]);
                var dialog = $('#tour_dialog');
                var top, left;

                // added check to see if the target exists if not go to next step
                if (target.length === 0) {
                    this.nextStep();
                } else {

                    switch (position) {
                        case "top":
                            top = target.offset().top - dialog.outerHeight() - this.offsetFudge;
                            left = target.offset().left + target.outerWidth() / 2 - dialog.outerWidth() / 2;
                            break;
                        case "right":
                            top = target.offset().top;
                            left = target.offset().left + target.outerWidth() + this.offsetFudge;
                            break;
                        case "bottom":
                            top = target.offset().top + target.outerHeight() + this.offsetFudge;
                            left = target.offset().left + target.outerWidth() / 2 - dialog.outerWidth() / 2;
                            break;
                        case "left":
                            top = target.offset().top;
                            left = target.offset().left - dialog.outerWidth() - this.offsetFudge;
                            break;
                        case "center":
                            // screen center hor & vert
                            top = Math.max(0, (($(window).height() - dialog.outerHeight()) / 2) + $(window).scrollTop());
                            left = Math.max(0, (($(window).width() - dialog.outerWidth()) / 2) + $(window).scrollLeft());
                            break;
                    }

                    dialog.children('.arrow').attr('class', 'arrow ' + position);
                    dialog.css({
                        top: top,
                        left: left
                    });
                }


            },

            // Is our next tour item visible on screen? If not, scroll to it!
            dialogVisible: function () {
                var dialog = $('#tour_dialog'),
                    scrollTop = $(window).scrollTop(),
                    scrollBottom = scrollTop + $(window).height(),

                    elemTop = $(dialog).offset().top,
                    elemBottom = elemTop + $(dialog).height();

                if (!((elemBottom >= scrollTop) && (elemTop <= scrollBottom) && (elemBottom <= scrollBottom) && (elemTop >= scrollTop))) {
                    $('html, body').animate({
                        scrollTop: $(dialog).offset().top - 25
                    }, 500);
                }
            },

            setupSelectorsLive: function () {
                // tour item class allows us to pull an element up the z-index and focus on it
                // if we pass more than one selector, loop through and add the class to all of them
                var selArray = TourSteps[this.startFrom].selector.split(",");
                for (var i = 0; i < selArray.length; i++) {
                    $(selArray[i]).addClass('tour_item');
                }

                // setup triggers for latent actions - use .trigger() to fire these off once the user has complete a custom action in your app
                var trigger = TourSteps[this.startFrom].waitForTrigger;
                if (trigger) {
                    $('body').append('<div id="' + trigger.substring(1) + '" style="display: none;"></div>');
                    $(trigger).bind('click.tour', {
                        selector: trigger
                    }, this.resumeClickHandler);
                }
            },

            // namespaced for tour resume triggers
            // if a trigger has been activated let's resume the tour where we left off
            resumeClickHandler: function (e) {
                $(e.data.selector).unbind('click.tour', this.resumeClickHandler);
                Tour.showStep();
            },

            // custom click handler when tour is active.
            // Check to see if the next action was clicked to advance the tour (nextSelector)
            tourClickHandler: function (e) {
                var nextSel = TourSteps[e.data.stop].nextSelector;
                if (nextSel) { // we only proceed when THIS selector is clicked i.e. #ok_button
                    if ($(e.currentTarget).is(nextSel) || $(nextSel).find(e.currentTarget).length > 0) {
                        Tour.stepComplete();
                    }
                } else { // no next selector specified. Any click or action will continue the tour
                    Tour.stepComplete();
                }
            }
        };
        Tour.init(); // kickoff our tour

    };
}(jQuery, window));

/**

* @brief

* This method initiates the page tour


*/
async function iniatePageTour() {

    var tourSteps = [
        {
            selector: "#map",
            position: 'top',
            "actionName": false,
            nextSelector: "#tour_dialog_btn",
            waitForTrigger: false,
            btnMsg: "Next",
            msg: "Clusters of wells are displayed in the map section. The number shown in each circle indicates the number of wells in that cluster. Zoom in until you see the well icons. There are two types of well icons, a plain black well icon (graphic) and a well-log icon (graphic). The well-log icon indicates log data is available for that well. Loads from master-data/well"
        },
        {
            selector: "#resizeMapSection",
            btnMsg: "Next",
            msg: "Check on the bottom right of map section with two lines : Click + hold + drag to resize the map section , currently supported only in Chrome ,FireFox and Safari",
            position: 'centre',

        },
        {
            selector: ".leaflet-control-lasso",
            position: 'left',            
            btnMsg: "Next",
            msg: "Click to activate. The status of the lasso is shown on the Lasso Status button.With the lasso activated, select the wells by drawing over the clusters or individual well-log icons (to draw click + hold the mouse button and move the cursor)."
        },
        {
            selector: ".leaflet-control-search",
            position: 'left',
            btnMsg: "Next",
            msg: "Helps you search by well names from the list of wells loaded in the map-section"
        },
        {
            selector: ".lassoStatus",
            position: 'left',
            btnMsg: "Next",
            msg: "Shows the status of lasso tool."
        },
        {
            selector: "#myGrid",
            position: 'top',
            btnMsg: "Next",
            msg: "The wells you selected in the map section, that contain log data, are displayed in this table. Select the check boxes of the wells to be downloaded,searches the selected wells from the database work-product-component/welllog"
        },
        {
            selector: "#btnDownloadLasFiles",
            btnMsg: "Finish",
            msg: "Download LAS files for the wells selected in the download table.",
            position: 'left',

        }

        

    ]

    $.tour(tourSteps);
}
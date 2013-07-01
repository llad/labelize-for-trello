/*!
 * TrelloLabelize
 * https://github.com/llad/trelloLabelize
 * 
 * Adds text identifiers to labels on Trello cards.
 *
 */

// JSLint Options
/*global $: false, MutationSummary: false */
/*jslint browser: true, devel: true */

(function () {
    "use strict";

    // Variables
    var labelAbbrs = {},
        labelSelector = "div.card-labels > span.card-label",
        cardSelector = "div.card-labels",
        boardHeaderSelector = "div#board-header",
        labelEditSelector = "form.edit-labels",
        labelEditSaveSelector = "form.edit-labels > .js-save",
        labelHeight = "16px",
        apiRoot = "https://trello.com/1/boards/";
        
    // Makes an API call to get all the names of the labels and takes
    // a callback so that other processing of the page waits until we get
    // the list back.
    function getLabelNames(callback) {
        var URL = $(location).attr('href'),
            boardID = URL.split('/')[5],
            apiURL = apiRoot + boardID;
        
        labelAbbrs = {}; //Clear the object
        
        // Make the API call
        $.getJSON(apiURL + "/labelNames", function (data) {
            $.each(data, function (key, value) {
                var abbr = value.substr(0, 3),
                    k = key + "-label";
                    
                labelAbbrs[k] = abbr;
            });
            
            callback();  // Makes sure 
        });

    }
    
    // Make the label adjustments cards
    function labelize() {
        $(labelSelector).each(function () {
            var label = $(this).attr('class').split(' ')[1],
                a = labelAbbrs[label];

            if (a) {
                $(this).text(a).css({"height": labelHeight});
            }
        });
    }
    
    // Gets the list of label names and adjust the card labels
    function refreshLabels(summaries) {
        getLabelNames(labelize);
    }
    
    // If the user edits labels, update the cards.
    function nameChange(summaries) {
        $(labelEditSaveSelector).click(function () {
            setTimeout(refreshLabels, 1000);
        });
    }
    

    // *************************************
    $(document).ready(function () {
        
        refreshLabels();

        // Use MutationSummary to track changes to labels on cards
        var cardObserver = new MutationSummary({
            callback: labelize,
            queries: [{
                element: cardSelector
            }]
        }),
            // Use MutationSummary to track board changes
            boardObserver = new MutationSummary({
                callback: refreshLabels, //could have used: function () {getLabelNames(labelize); },
                queries: [{
                    element: boardHeaderSelector
                }]
            }),
            
            // Use MutationSummary to see if user access the edit label popup
            labelEditObserver = new MutationSummary({
                callback: nameChange, //could have used: function () {getLabelNames(labelize); },
                queries: [{
                    element: labelEditSelector
                }]
            });

    });
    
}());
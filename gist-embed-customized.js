//author: Stuart Tannehill
//https://github.com/stannehill/gist-embed-customized

(function ($) {
    "use strict";

    // Reduce an array to its unique components
    var getUnique = function (input) {
        var u = {}, a = [], inputlength = input.length, i;

        for (i = 0; i < inputlength; i++) {
            if (u.hasOwnProperty(input[i])) {
                continue;
            }
            a.push(input[i]);
            u[input[i]] = 1;
        }

        return a;
    };

    // Get the line numbers that a particular chunk of gist will need
    var getLineNumbers = function (lineRangeString) {
        var lineNumbers = [],
            lineNumberSections = lineRangeString.split(','),
            range,
            i,
            k;

        for (i = 0; i < lineNumberSections.length; i++) {
            range = lineNumberSections[i].split('-');
            if (range.length === 2) {
                for (k = parseInt(range[0], 10); k <= range[1]; k++) {
                    lineNumbers.push(k);
                }
            }
            else if (range.length === 1) {
                lineNumbers.push(parseInt(range[0], 10));
            }
        }

        return lineNumbers;
    };

    // Set a range of line numbers to use
    var range = function (start, stop, step) {
        var length, counter, range;

        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        length = Math.max(Math.ceil((stop - start) / step), 0);
        counter = 0;
        range = new Array(length);

        while (counter < length) {
            range[counter++] = start;
            start += step;
        }

        return range;
    };

    // Parse the retrieved gist, removing unneeded lines and setting line numbers appropriately
    var parseGist = function (response, $elem, line) {
        //the html payload is in the div property
        if (response && response.div) {
            //add the stylesheet if it does not exist
            if (response.stylesheet && $('link[href="' + response.stylesheet + '"]').length === 0) {
                var l = document.createElement("link"),
                    head = document.getElementsByTagName("head")[0];

                l.type = "text/css";
                l.rel = "stylesheet";
                l.href = "https://gist.github.com" + response.stylesheet;
                head.insertBefore(l, head.firstChild);
            }

            var random = Math.floor(Math.random() * 100000);
            $elem.html("<div id='" + random + "'>" + response.div + "</div>");

            if (line) {
                var lineComponents,
                    startRange, 
                    endRange, 
                    arraytoselect, 
                    counter = 0,
                    lineNumbers;

                // if there is a - in the line we have a range to deal with
                if (line.indexOf('-') !== -1) {
                    lineComponents = line.split('-');
                    startRange = parseInt(lineComponents[0], 10);
                    endRange = parseInt(lineComponents[1] + 1, 10);

                    if (startRange <= 0) {
                        startRange = 1;
                        console.log("No zero based start for you (it's a feature)!");
                    }
                    arraytoselect = range(startRange, endRange);
                }

                if(line.indexOf(',') !== -1) {
                    lineComponents = line.split(',');
                    arraytoselect = lineComponents;
                }

                lineNumbers = getLineNumbers(line);
                $('#' + random).find('.line').each(function (index) {
                    if (($.inArray(index + 1, lineNumbers)) === -1) {
                        $(this).remove();
                    }
                });

                $('#' + random).find('.line-number').each(function (index) {
                    if (($.inArray(index + 1, lineNumbers)) === -1) {
                        $(this).remove();
                    }
                    else {
                        if (lineComponents) {
                            $(this).html(arraytoselect[counter]);
                            counter++;
                        } else {
                            $(this).html(line);
                        }
                    }
                });
                console.log('done');
            }
            if ($elem.attr('data-showFooter') && $elem.attr('data-showFooter') === "false") {
                $('#' + random).find('.gist-meta').remove();
            }

            if ($elem.attr('data-showLineNumbers') && $elem.attr('data-showLineNumbers') === "false") {
                $('#' + random).find('.line-numbers').remove();
            }
            $('#' + random).find('.gist-file').css('margin-bottom', '0px');
        } else {
            $elem.html('Failed loading gist');
        }
    };

    $(function () {
        var gistMarkerId = 'gist-',
            gistCodeBlocks = [],
            uniqueGists,
            url,
            retrievedGist = {},
            i = 0;


        // Get each instance of a gist marker in the DOM
        $('code[id*="' + gistMarkerId + '"]').each(function () {
            gistCodeBlocks.push($(this).attr('id'));
        });


        // Reduce the collection of gist markers. get rid of duplicates 
        uniqueGists = getUnique(gistCodeBlocks);


        // Iterate over each gist. Handle parsing it in the ajax success callback
        $.each(uniqueGists, function () {

            var strippedId = this.replace(gistMarkerId, '');

            //make ajax call and have success handle the details
            // Appending ?callback=? makes the reaust JSONP and nullifys same origin policy issues
            url = 'https://gist.github.com/' + strippedId + '.json?callback=?';
            $.getJSON(url,function (data) {
                retrievedGist[i] = data;

                //find all code elements containing "gist-" the id attribute.
                $('code[id*="' + gistMarkerId + '"]').each(function () {

                    var $elem = $(this),
                        id,
                        file,
                        line,
                        data = {};

                    id = $elem.attr('id') || '';
                    file = $elem.attr('data-file');
                    line = $elem.attr('data-line');

                    if (id === (gistMarkerId + strippedId)) {


                        if (file) {
                            data.file = file;
                            //splittedFileName = file.split('.').join('-');
                        }

                        //if the id doesn't begin with 'gist-', then ignore the code block
                        if (!id || id.indexOf('gist-') !== 0) {
                            return false;
                        }

                        //make block level so loading text shows properly
                        $elem.css('display', 'block');

                        //get the numeric id from the id attribute of the element holder
                        id = id.substr(0, gistMarkerId.length) === gistMarkerId ? id.replace(gistMarkerId, '') : null;

                        //make sure result is a numeric id
                        if (!isNaN(parseInt(id, 10))) {
                            parseGist(retrievedGist[i], $elem, line);
                        }
                    }
                });

                i++;

            }).fail(function (jqXHR) {
                    // Some failed ajax request error logging
                    console.log('There was an error retrieving a gist.');
                    console.log(jqXHR);
                });
        });
    });

})(jQuery);
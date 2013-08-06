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
            lineNumberSections = lineRangeString.split(',');

        for (var k = 0; k < lineNumberSections.length; k++) {
            var range = lineNumberSections[k].split('-');
            if (range.length === 2) {
                for (var i = parseInt(range[0], 10); i <= range[1]; i++) {
                    lineNumbers.push(i);
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
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(length);

        while (idx < length) {
            range[idx++] = start;
            start += step;
        }

        return range;
    };

    // 
    var parseGist = function (response, $elem, line) {
        var resultdiv;
        resultdiv = response.div;
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
                // if there is a - in the line we have a range to deal with
                if (line.indexOf('-') !== -1) {
                    var lineComponents = line.split('-');
                    var startRange = parseInt(lineComponents[0], 10);
                    var endRange = parseInt(lineComponents[1] + 1, 10);

                    if (startRange <= 0) {
                        startRange = 1;
                        console.log("No zero based start for you (it's a feature)!");
                    }
                    var arraytoselect = range(startRange, endRange);
                    var counter = 0;
                }
                var lineNumbers = getLineNumbers(line);
                $('#' + random).find('.line').each(function (index) {
                    if (($.inArray(index + 1, lineNumbers)) === -1) {
                        $(this).remove();
                    }
                });

                //var lineNumber = 1;
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
            retrievedGists = [],
            uniqueGists,
            url,
            gotbacks = {},
            ic = 0;


        // Get each instance of a gist marker in the DOM
        $('code[id*="' + gistMarkerId + '"]').each(function () {
            retrievedGists.push($(this).attr('id'));
        });


        // Reduce the collection of gist markers. get rid of duplicates 
        uniqueGists = getUnique(retrievedGists);


        // Iterate over each gist. Handle parsing it in the ajax success callback
        $.each(uniqueGists, function () {

            var strippedId = this.replace(gistMarkerId, '');

            //make ajax call and have success handle the details
            // Appending ?callback=? makes the reaust JSONP and nullifys same origin policy issues
            url = 'https://gist.github.com/' + strippedId + '.json?callback=?';
            $.getJSON(url,function (data) {
                gotbacks[ic] = data;

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
                            parseGist(gotbacks[ic], $elem, line);
                        }
                    }
                });

                ic++;

            }).fail(function (jqXHR) {
                    // Some failed ajax request error logging
                    console.log('There was an error retriving a gist.');
                    console.log(jqXHR);
                });
        });
    });

})(jQuery);
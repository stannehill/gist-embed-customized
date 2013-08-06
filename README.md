gist-embed-customized
=====================

Embed gists, then reuse portions of them preserving their original line numbers (also, only retrieves each gist once... reusing it for additional references in your page).

In your html:

To display a full gist
```html
<code id="gist-6104937"></code>
```

To display a range of lines from a gist
```html
<code id="gist-6104937" data-line="11-20"></code>
```

To display a discrete selection of lines from a gist
```html
<code id="gist-6104937" data-line="5,10,14"></code>
```

See the included sampleindex.html file for more examples.

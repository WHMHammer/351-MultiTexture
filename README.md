# Multi-texture with Client-side Image Files

This repo demonstrates how to load client-side (local) image files without requiring the user to manually encode their images to base-64 or to dangerously enable cross-site scripting (XSS) in their browsers.

## XSS and CORS

[Cross-site scripting](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) (XSS) is dangerous because it allows unauthorized codes to access data from a different origin. All modern browsers follow the [cross-origin resource sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS) policies given by the resource owners. Unfortunately, [all local files are treated as from different origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp#loading_a_local_file) due to security reasons. This protection mechanism hinders us from automatically loading anything from the users' local filesystems.

## FileReader

However, we can use [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)s to load local files. Note that this approach is fundamentally different from the XSS approach. The XSS approach treats the file to be loaded as a **remote** resource owned by the server side, and thus it has to follow the CORS policies. The `FileReader` approach treats the file to be loaded as a **local** resource owned by the client (user) side, so the CORS mechanism is not involved at all.

## File Input

HTML `input`s have a `type` attribute. One of the types is `file`. An `<input type="file">` element is rendered as a button. A pop-up window will appear for the user to select a file to be loaded once the button is clicked. A `change` event will be triggered once the file finishes loading. Check [my codes](https://github.com/WHMHammer/351-MultiTexture/blob/main/MultiTexture.FILE.js#L132-L164) and the MDN [documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file) for more details.

## Drag and Drop API

Another way to load a file is to drag and drop one to the window. Check [my codes](https://github.com/WHMHammer/351-MultiTexture/blob/main/MultiTexture.FILE.js#L166-L199) and the MDN [documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API) for more details.
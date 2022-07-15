# container-browser

Displays the contents of an Azure storage container.

## Installation

* Download the source code.
* build the project by running `npm install && npm run build`
* upload the file `dist/browse.html` to the root of an Azure Storage Container.
* set the public access level of the storage container to "Container".
* open `https://{storageaccount}.blob.core.windows.net/{container}/browse.html` in your browser.

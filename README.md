# folderselect

Hierarchical select plugin for jQuery.

Check out the [live demo](http://magnustovslid.com/project/folderselect)

## TODO
* Click to sort on different columns

## Dependencies
* jQuery

## Usage

### Initializing
Initialize by calling folderselect(options) on a jquery object.
The options argument is described further below.

```js
$("#element").folderselect({
    data:        my_json_hierarchical_data,
    headers:     [],
    url:         false,
    icon_item:   "item.png",
    icon_folder: "folder.png",
    icon_home:   "home.png",
	spinner_gif: "ajax-loader.gif",
    item_selected_callback:  function(item) {},
    item_removed_callback:   function(item) {},
    folder_entered_callback: function(folder) {}
});
```

### Retrieving selected items
You can retrieve the selected elements by calling
folderselect('selected') on the initialized jQuery object.
What you get in return is the same as you put in
the data parameter when initializing.

```js
var selected_items = $("#element").folderselect('selected');
```

### Options
All options are optional, except for `data`.

* `headers` : Array of strings which will become headers inside each folder. Can be overridden in the data parameter.
* `url` : If the user tries to open an empty folder (`content = []`), a post request will be sent to this URL to get the content of the folder.
          The folder object is sent along as post data.
* `icon_folder / icon_item / icon_home` : URLs to use for different icons. Can be overridden in the data parameter.
* `item_selected_callback` : Called when an item is selected. The item object is given as argument.
* `item_removed_callback` : Called when an item is deselected. The item object is given as argument.
* `folder_entered_callback` : Called when a folder is opened. The folder object is given as argument.
* `data` : See below

### Data parameter
The data parameter is a json object containing the hierarchical data. It is possible to just
give the base of the tree here, and use ajax to load sub trees when the user clicks on a folder.

The data parameter consists of two types of objects, items and folders. These have some similarities
and some differences.

Remember to check out the examples as well.

#### Folder and item:

* `type` : Should equal either 'folder' or 'item'.
* `icon` : URL to the icon to use for this item/folder.
* `cells` : Array of strings. The first string indicates the name of the folder/icon.
            If headers are used, the number of cells should equal the number of headers.
            Also, all items in a folder should have the same number of cells.
* `payload` : An arbitrary json object. Can be used to store the database id for the object, etc.

#### Folder only:

* `content` : Array of item/folder objects that are to be found inside this folder.
* `headers` : Array of headers to be displayed within this folder.
* `openable` : True if the folder should be openable, false if not.
               If an ajax request is sent to get the content for this folder and the result is empty, this is set to false.
* `open` : True if this folder should be opened by default. Note that only one folder may be opened by default.

#### Item only:

* `selectable` : True if this item should be possible to select.
* `selected` : True if this item should be selected by default.

### Customizing
The plugin is not very customizable at this point. I recommend fiddling with the css
if you don't like the looks. In particular, in order to set the height of the
select box you need to do so in CSS for now.
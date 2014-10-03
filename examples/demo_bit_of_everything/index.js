$(document).ready(function () {
    function item_selected_callback(item) {
        $("#last_event").html("Item selected!\n\n" + JSON.stringify(item, null, 4));
        var selected = $("#my_folderselect").folderselect("selected");
        $("#pre_selected").html(JSON.stringify(selected, null, 4));
    }

    function item_removed_callback(item) {
        $("#last_event").html("Item removed!\n\n" + JSON.stringify(item, null, 4));
        var selected = $("#my_folderselect").folderselect("selected");
        $("#pre_selected").html(JSON.stringify(selected, null, 4));
    }

    function folder_entered_callback(folder) {
        $("#last_event").html("Folder entered!\n\n" + JSON.stringify(folder, null, 4));
    }

    var folderselect = $("#my_folderselect").folderselect(
        {
            "data": data,
            "selectable": true,
            "icon_item": "../img/item.png",
            "icon_folder": "../img/folder.png",
            "icon_home": "../img/home.png",
            "spinner_gif": "../img/ajax-loader.gif",
            "url": 'more.json',
            "item_selected_callback": item_selected_callback,
            "item_removed_callback": item_removed_callback,
            "folder_entered_callback": folder_entered_callback
        }
    );

    var selected = folderselect.folderselect("selected");
    $("#pre_selected").html(JSON.stringify(selected, null, 4));
});

var data =
{
    "type": "folder",
    "content": [
        {
            "type": "folder",
            "cells": ["Simple folder"],
            "content": [
                {
                    "type": "item",
                    "cells": ["Pick me!"],
                    "payload": {}
                },
                {
                    "type": "item",
                    "cells": ["Pick me!!"],
                    "payload": {}
                },
                {
                    "type": "item",
                    "cells": ["I'm not attractive enough to be picked :("],
                    "payload": {},
                    "selectable": false
                }
            ]
        },
        {
            "type": "folder",
            "cells": ["Folder with headers"],
            "headers": ["Model", "Type"],
            "content": [
                {
                    "type": "item",
                    "cells": ["S40", "Hatchback"],
                    "payload": {"myPayload": "can put anything here"}
                },
                {
                    "type": "item",
                    "cells": ["V50", "Estate"],
                    "payload": {}
                },
                {
                    "type": "item",
                    "cells": ["X70 (not selectable)", "Estate"],
                    "payload": {},
                    "selectable": false
                }
            ]
        },
        {
            "type": "folder",
            "cells": ["Inifinite folder"],
            "payload": {"id_of_empty_folder": "Hi, I'm the ID of the infinite folder"},
            "content": []
        },
        {
            "type": "folder",
            "cells": ["Already selected stuff"],
            "payload": {},
            "content": [
                {
                    "type": "item",
                    "cells": ["I am already selected!"],
                    "selected": true
                }
            ]
        },
        {
            "type": "item",
            "cells": ["Root item"]
        },
        {
            "type": "item",
            "cells": ["Root item"]
        }
    ]
};
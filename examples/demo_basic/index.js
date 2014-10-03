$(document).ready(function () {
    function item_selected_callback(item) {
        update_select_box($("#my_folderselect").folderselect('selected'));
    }

    function item_removed_callback(item){
        update_select_box($("#my_folderselect").folderselect('selected'));
    }

    var folderselect = $("#my_folderselect").folderselect(
        {
            "data": data,
            "icon_item": "../img/item.png",
            "icon_folder": "../img/folder.png",
            "icon_home": "../img/home.png",
            "spinner_gif": "../img/ajax-loader.gif",
            'item_selected_callback': item_selected_callback,
            'item_removed_callback': item_removed_callback
        }
    );
});

function update_select_box(objs){
    var html = "";
    $.each(objs, function(key, obj){
       html += "<option value='" + obj.payload.id +"' selected>" + obj.cells[0] + "</option>"
    });

    $("#selectbox").html(html);
}

var data =
{
    "type": "folder",
    "content": [
        {
            "type": "folder",
            "cells": ["Name of folder"],
            "content": [
                {
                    "type": "item",
                    "cells": ["Item 1"],
                    "payload": {'id': 1}
                },
                {
                    "type": "item",
                    "cells": ["Item 2"],
                    "payload": {'id': 2}
                }
            ]
        },
        {
            "type": "item",
            "cells": ["Root item"],
            "payload": {'id': 3}
        }
    ]
};
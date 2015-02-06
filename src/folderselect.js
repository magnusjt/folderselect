;(function ( $, window, document, undefined ) {
    var TYPE_ITEM = "item";
    var TYPE_FOLDER = "folder";

    var defaults = {
        "data": {"type": "folder", "cells": [""], "content": []},
        "headers": [],
        "url": false,
        "spinner_gif": "ajax-loader.gif",
        "icon_home": "home.png",
        "icon_item": "page.png",
        "icon_folder": "folder.png",
        "item_selected_callback": function(item){},
        "item_removed_callback": function(item){},
        "folder_entered_callback": function(folder){}
    };

    function Plugin( element, options ) {
        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        this.defaults = defaults;
        this.name = 'folderselect'; // Plugin name
        this.root_id = 1; // ID of the root element. Is always 1.
        this.last_id = 0; // ID of last element to be put in the data_flat object
        this.current_folder_id = this.root_id; // The currently open folder
        this.data_flat = {}; // Parsed data object. An adjacency list

        this.init();
    }

    Plugin.prototype.pub = {
        "selected": function(){
            var that = this;
            var selected = [];
            $.each(this.data_flat, function(index, item){
                if(item.selected === true){
                    selected.push(that.build_selected_object(index));
                }
            });

            return selected;
        }
    };

    Plugin.prototype.init = function () {
        var html = "";

        this.element.addClass("fs-wrapper");

        this.parse_data([this.options.data], 0);
        this.options.data = undefined;

        html += "<div class='fs-breadcrumbs-wrapper'></div>";
        html += "<div class='fs-selector-wrapper'><div class='fs-scroll-wrapper'></div></div>";
        html += "<div class='fs-selected-wrapper'><div class='fs-scroll-wrapper'></div></div>";

        this.element.html(html);

        this.update_selector_from_folder_id(this.current_folder_id);
        this.update_selected();

        this.set_listeners();
    };

    Plugin.prototype.set_listeners = function(){
        var that = this;

        this.element.on("click", ".fs-tr-folder-selectable, .fs-td-breadcrumb, .fs-td-breadcrumb-home", function(){
            /*
            Open a folder.
            NB: Scroll position is stored every time the selector is updated, that's why we have to do some trickery here.
            */
            var folder_id = $(this).data("id");
            var scroll_element = that.element.find(".fs-selector-wrapper > .fs-scroll-wrapper");

            // Store current scroll position for the next time we enter this folder
            that.data_flat[that.current_folder_id].scroll = scroll_element.scrollTop();

            // Get the store scroll of the folder we are about to enter
            var stored_scroll_pos = that.data_flat[folder_id].scroll;

            that.update_selector_from_folder_id(folder_id);

            // Restore the stored scroll, and make sure it is stored again
            scroll_element.scrollTop(stored_scroll_pos);
            that.data_flat[folder_id].scroll = stored_scroll_pos;

            that.options.folder_entered_callback(that.build_selected_object(folder_id));
        });

        this.element.on("click", ".fs-td-breadcrumb-current", function(){
            /*
             Select all in the current folder
             */
            var folder_id = $(this).data("id");
            that.select_items_from_folder_id(folder_id);
        });

        this.element.on("click", ".fs-tr-item-selectable", function(){
            /*
                Select an item
            */
            var id = $(this).data("id");
            that.select_item_from_id(id);
        });

        this.element.on("click", ".fs-tr-item-removable", function(){
            /*
                Deselect an item
            */
            var id = $(this).data("id");
            that.deselect_item_from_id(id);
        });

        this.element.on("click", ".fs-div-folder-removable", function(){
            /*
                Deselect all items within the folder
            */
            var folder_id = $(this).data("id");
            that.deselect_items_from_folder_id(folder_id);
        });
    };

    /**
     *
     * @param folder array
     * @param folder_id int
     */
    Plugin.prototype.parse_data = function ( folder, folder_id )
    {
        if(!$.isArray(folder)){
            $.error("Folder content should be an array.");
        }

        for(var i = 0; i < folder.length; i++)
        {
            this.last_id += 1;
            var current_item = {
                "id": this.last_id,
                "folder_id": folder_id
            };

            if(folder[i].hasOwnProperty("type")){
                if(folder[i].type === "item"){
                    current_item.type = TYPE_ITEM;
                }else if(folder[i].type === "folder"){
                    current_item.type = TYPE_FOLDER;
                }else{
                    $.error("Invalid type: " + folder[i].type);
                }
            }else{
                $.error("Type must be specified on all objects.");
            }

            current_item.cells = ["name"];
            if(folder[i].hasOwnProperty("cells") && $.isArray(folder[i].cells)){
                current_item.cells = folder[i].cells;
            }

            current_item.payload = {};
            if(folder[i].hasOwnProperty("payload")){
                current_item.payload = folder[i].payload;
            }

            if(current_item.type === TYPE_FOLDER)
            {
                current_item.headers = this.options.headers;
                if(folder[i].hasOwnProperty("headers") && $.isArray(folder[i].headers)){
                    current_item.headers = folder[i].headers;
                }

                current_item.openable = true;
                if(folder[i].hasOwnProperty("openable")){
                    current_item.openable = folder[i].openable;
                }

                current_item.sort_index = 0;
                if(folder[i].hasOwnProperty("sort_index")){
                    current_item.sort_index = folder[i].sort_index;
                }

                current_item.icon = this.options.icon_folder;
                if(folder[i].hasOwnProperty("icon")){
                    current_item.icon = folder[i].icon;
                }

                if(folder[i].hasOwnProperty("open") && folder[i].open === true){
                    this.current_folder_id = current_item.id;
                }

                current_item.scroll = 0;
            }
            else if(current_item.type === TYPE_ITEM)
            {
                current_item.selectable = true;
                if(folder[i].hasOwnProperty("selectable")){
                    current_item.selectable = folder[i].selectable;
                }

                current_item.selected = false;
                if(folder[i].hasOwnProperty("selected")){
                    current_item.selected = folder[i].selected;
                }

                current_item.icon = this.options.icon_item;
                if(folder[i].hasOwnProperty("icon")){
                    current_item.icon = folder[i].icon;
                }
            }

            this.data_flat[current_item.id] = current_item;

            if(current_item.type === "folder" && folder[i].hasOwnProperty("content")){
                this.parse_data(folder[i].content, current_item.id);
            }
        }
    };

    Plugin.prototype.build_selected_object = function(id)
    {
        var selected = this.data_flat[id];
        return {
            "type": selected.type,
            "cells": selected.cells,
            "payload": selected.payload
        };
    };

    Plugin.prototype.load_more_data = function(folder_id)
    {
        var that = this;

        if(this.options.url === false){
            this.data_flat[folder_id].openable = false;
            return;
        }

        if(this.data_flat[folder_id].openable == false){
            return;
        }

        // Put in the ajax-loader spinner
        this.element.find(".fs-tr-folder-selectable").filter(function(){
            return $(this).data("id") === folder_id;
        }).children("td:nth-child(2)").append("<img src='" + this.options.spinner_gif + "' />");

        // Build data object to send with ajax request
        var folder_obj = this.build_selected_object(folder_id);

        $.ajax({
            url: this.options.url,
            data: folder_obj,
            dataType: 'json',
            method: "POST",
            success: function(data){
                if(data.length > 0){
                    that.parse_data(data, folder_id);
                    that.update_selector_from_folder_id(folder_id);
                }else{
                    that.data_flat[folder_id].openable = false;
                    that.update_selector_from_folder_id(that.data_flat[folder_id].folder_id);
                }
            },
            error: function(){
                console.log("Error retrieving data from server");
                that.data_flat[folder_id].openable = false;
                that.update_selector_from_folder_id(that.data_flat[folder_id].folder_id);
            }
        });
    };

    Plugin.prototype.update_selector = function()
    {
        this.update_selector_from_folder_id(this.current_folder_id);
    };

    /**
     *
     * @param folder_id int
     */
    Plugin.prototype.update_selector_from_folder_id = function(folder_id)
    {
        var i;
        var j;

        if(folder_id === 0){
            folder_id = 1; // Folder ID should never be 0, but take a precaution here.
        }

        /*
        Set the current folder_id so that subsequent updates shows the current folder
         */
        this.current_folder_id = folder_id;

        /*
        Get item/folder list under the current folder
         */
        var items = this.get_item_list_from_folder_id(folder_id);

        /*
        If item/folder list is empty, check if we can load some
         */
        if(items.length === 0){
            this.load_more_data(folder_id);
            return;
        }

        /*
        Create table headers for the current folder
         */
        var table_head_html = "";

        if(this.data_flat[folder_id].headers.length > 0){
            table_head_html = "<thead><tr><th></th>";
            for(i = 0; i < this.data_flat[folder_id].headers.length; i++){
                table_head_html += "<th>" + this.data_flat[folder_id].headers[i] + "</th>";
            }
            table_head_html += "</tr></thead>";
        }

        /*
        Create item/folder list
         */
        var table_rows_items_html = "";
        var table_rows_folders_html = "";

        if(folder_id > this.root_id){
            table_rows_folders_html += "<tr class='fs-tr-folder-selectable' data-id='" + this.data_flat[folder_id].folder_id + "' title='Up one folder'>";
            table_rows_folders_html += "<td class='fs-td-icon'><img src='" + this.data_flat[folder_id].icon + "'></td>";
            table_rows_folders_html += "<td colspan='" + this.data_flat[folder_id].headers.length.toString() + "'>..</td></tr>";
        }

        for(i = 0; i < items.length; i++){
            if(items[i].type === "folder"){
                if(items[i].openable){
                    table_rows_folders_html += "<tr class='fs-tr-folder-selectable' data-id='" + items[i].id + "' title='Click to open folder'>";
                }else{
                    table_rows_folders_html += "<tr class='fs-tr-folder-not-selectable' title='This folder is empty'>";
                }

                table_rows_folders_html += "<td class='fs-td-icon'><img src='" + items[i].icon + "'></td>";

                for(j = 0; j < items[i].cells.length; j++){
                    table_rows_folders_html += "<td>" + items[i].cells[j] + "</td>";
                }

                table_rows_folders_html += "</tr>";
            }else{
                var class_selected = "";
                if(items[i].selected === true){
                    class_selected += " fs-tr-item-selected";
                }

                if(items[i].selectable === true){
                    table_rows_items_html += "<tr class='fs-tr-item-selectable" + class_selected + "' data-id='" + items[i].id + "' title='Click to select'>";
                }else{
                    table_rows_items_html += "<tr class='fs-tr-item-not-selectable" + class_selected + "' title='Not selectable'>";
                }

                table_rows_items_html += "<td class='fs-td-icon'><img src='" + items[i].icon + "'></td>";

                for(j = 0; j < items[i].cells.length; j++){
                    table_rows_items_html += "<td>" + items[i].cells[j] + "</td>";
                }

                table_rows_items_html += "</tr>";
            }
        }

        var breadcrumbs_html = this.create_breadcrumbs_html(folder_id);
        this.element.find(".fs-breadcrumbs-wrapper").html(breadcrumbs_html);

        var html = "";
        html += "<table class='fs-table'>";
        html += table_head_html;
        html += "<tbody>";
        html += table_rows_folders_html;
        html += table_rows_items_html;
        html += "</tbody>";
        html += "</table>";

        /*
         Render html and return to scroll position
         */
        var selector_element = this.element.find(".fs-selector-wrapper > .fs-scroll-wrapper");
        var scroll_pos = selector_element.scrollTop();

        // Store the scroll position for next time the folder is accessed.
        this.data_flat[folder_id].scroll = scroll_pos;

        selector_element.html(html);
        selector_element.scrollTop(scroll_pos);
    };

    Plugin.prototype.update_selected = function()
    {
        var i;
        var that = this;

        /*
        First we find the selected items from the adjacency list (data_flat)
        Store as array per folder
         */
        var items_per_folder_id = {};
        $.each(this.data_flat, function(id,obj){
            if(obj.type === TYPE_ITEM && obj.selected === true){
                if(!items_per_folder_id.hasOwnProperty(obj.folder_id)){
                    items_per_folder_id[obj.folder_id] = [];
                }

                items_per_folder_id[obj.folder_id].push(obj);
            }
        });

        /*
        Rearrange the data into an array so it can be sorted according to the breadcrumbs for each folder.
         */
        var items_and_folder_id_and_breadcrumbs = [];
        $.each(items_per_folder_id, function(folder_id, items){
            /*
            Get the breadcrumbs for the current folder.
            Get as a string, with " / " separating each folder name.
             */
            var breadcrumb_names_html = that.get_breadcrumb_list_from_folder_id(folder_id).map(function(elem){return elem.cells[0];}).join("/");
            if(breadcrumb_names_html == ''){
                breadcrumb_names_html = 'Root';
            }

            /*
            Sort the items under the current folder
             */
            items.sort(function(a,b){
                var sort_index = that.data_flat[folder_id].sort_index;
                if(a.cells[sort_index] < b.cells[sort_index]) return -1;
                if(a.cells[sort_index] > b.cells[sort_index]) return 1;
                return 0;
            });

            items_and_folder_id_and_breadcrumbs.push({
                "items": items,
                "breadcrumb_names_html": breadcrumb_names_html,
                "folder_id": folder_id
            });
        });

        /*
        Sort the list according to the breadcrumbs for each folder
         */
        items_and_folder_id_and_breadcrumbs.sort(function(a,b){
            if(a.breadcrumb_names_html < b.breadcrumb_names_html) return -1;
            if(a.breadcrumb_names_html > b.breadcrumb_names_html) return 1;
            return 0;
        });

        var html = "";

        for(i = 0; i < items_and_folder_id_and_breadcrumbs.length; i++){
            var folder_id = items_and_folder_id_and_breadcrumbs[i]["folder_id"];
            var items = items_and_folder_id_and_breadcrumbs[i]["items"];
            var breadcrumb_names_html = items_and_folder_id_and_breadcrumbs[i]["breadcrumb_names_html"];
            var headers = this.data_flat[folder_id].headers;
            var i_headers;
            var i_items;

            html += "<div class='fs-div-folder-removable' title='Deselect all' data-id='" + folder_id + "'>";
            html += "<div class='fs-div-folder-removable-text'>" + breadcrumb_names_html + "</div>";
            html += "</div>";
            html += "<table class='fs-table'>";

            if(headers.length > 0){
                html += "<thead><tr><th></th>";
                for(i_headers = 0; i_headers < headers.length; i_headers++){
                    html += "<th>" + headers[i_headers] + "</th>";
                }

                html += "</tr></thead>";
            }

            html += "<tbody>";

            for(i_items = 0; i_items < items.length; i_items++){
                html += "<tr class='fs-tr-item-removable' title='Deselect' data-id='" + items[i_items].id + "'>";
                html += "<td class='fs-td-icon'><img src='" + items[i_items].icon + "'></td>";

                for(var i_cells = 0; i_cells < items[i_items].cells.length; i_cells++){
                    html += "<td>" + items[i_items].cells[i_cells] + "</td>";
                }

                html += "</tr>";
            }

            html += "</tbody>";
            html += "</table>";
        }

        /*
            Render html and return to scroll position
         */
        var selector_element = this.element.find(".fs-selected-wrapper > .fs-scroll-wrapper");
        var scroll_pos = selector_element.scrollTop();
        selector_element.html(html);
        selector_element.scrollTop(scroll_pos);
    };

    Plugin.prototype.create_breadcrumbs_html = function(folder_id)
    {
        var breadcrumb_list = this.get_breadcrumb_list_from_folder_id(folder_id);
        var breadcrumb_list_html = "<table class='fs-table-breadcrumbs'><tr>";

        breadcrumb_list_html += "<td class='fs-td-breadcrumb-home fs-td-icon' data-id='" + this.root_id + "' title='Navigate to root folder'><img src='" + this.options.icon_home + "'></td>";

        for(var i = 0; i < breadcrumb_list.length-1; i++){
            breadcrumb_list_html += "<td class='fs-td-breadcrumb' title='Navigate to folder' data-id='" + breadcrumb_list[i].id + "'>" + breadcrumb_list[i].cells[0] + "</td>"
        }

        if(breadcrumb_list.length > 0){
            breadcrumb_list_html += "<td class='fs-td-breadcrumb-current' title='Select all in this folder' data-id='" + breadcrumb_list[i].id + "'>" + breadcrumb_list[i].cells[0] + "</td>"
        }

        breadcrumb_list_html += "</tr></table>";

        return breadcrumb_list_html;
    };

    /**
     *
     * @param folder_id int
     * @returns {Array}
     */
    Plugin.prototype.get_item_list_from_folder_id = function(folder_id)
    {
        var sort_index = this.data_flat[folder_id].sort_index;
        var list = [];
        $.each(this.data_flat, function(id,obj){
            if(obj.folder_id === folder_id){
                list.push(obj);
            }
        });

        list.sort(function(a,b){
            if(a.cells[sort_index] < b.cells[sort_index]) return -1;
            if(a.cells[sort_index] > b.cells[sort_index]) return 1;
            return 0;
        });

        return list;
    };

    /**
     *
     * @param folder_id int
     * @returns {Array}
     */
    Plugin.prototype.get_breadcrumb_list_from_folder_id = function(folder_id)
    {
        var list = [];
        if(folder_id > this.root_id)
        {
            list = this.get_breadcrumb_list_from_folder_id(this.data_flat[folder_id].folder_id);

            if(this.data_flat[folder_id].type === "folder"){
                list.push(this.data_flat[folder_id]);
            }
        }

        return list;
    };

    Plugin.prototype.select_item_from_id = function(id)
    {
        this.data_flat[id].selected = true;

        this.update_selected();
        this.update_selector();

        this.options.item_selected_callback(this.build_selected_object(id));
    };

    Plugin.prototype.select_items_from_folder_id = function(folder_id){
        var that = this;
        $.each(this.data_flat, function(id, obj){
            if(obj.folder_id === folder_id && obj.selectable){
                obj.selected = true;
                that.options.item_selected_callback(that.build_selected_object(id));
            }
        });

        this.update_selected();
        this.update_selector();
    };

    Plugin.prototype.deselect_item_from_id = function(id){
        this.data_flat[id].selected = false;

        this.update_selected();
        this.update_selector();

        this.options.item_removed_callback(this.build_selected_object(id));
    };

    Plugin.prototype.deselect_items_from_folder_id = function(folder_id){
        var that = this;
        $.each(this.data_flat, function(id, obj){
            if(obj.folder_id === folder_id && obj.hasOwnProperty("selected")){
                obj.selected = false;
                that.options.item_removed_callback(that.build_selected_object(id));
            }
        });

        this.update_selected();
        this.update_selector();
    };


    $.fn.folderselect = function ( options_or_method ) {
        var args = arguments;
        var return_value;
        this.each(function () {
            var plugin;

            if (!$.data(this, 'plugin_folderselect')) {
                if(typeof options_or_method !== 'object'){
                    $.error("folderselect needs an options object for initialization.");
                    return;
                }
                $.data(this, 'plugin_folderselect',
                    new Plugin( $(this), options_or_method ));
            }

            plugin = $.data(this, 'plugin_folderselect');

            if(typeof options_or_method !== 'object') {
                if(plugin.pub[options_or_method]){
                    return_value = plugin.pub[options_or_method].apply(plugin, Array.prototype.slice( args, 1 ));
                }else{
                    $.error( 'Method ' +  options_or_method + ' does not exist in folderselect plugin' );
                }
            }
        });

        if(return_value !== undefined){
            return return_value;
        }

        return this;
    }

})( jQuery, window, document );
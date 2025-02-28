/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils, w2toolbar, w2field
*
* == TODO ==
*   - column autosize based on largest content
*   - reorder columns/records
*   - problem with .set() and arrays, array get extended too, but should be replaced
*   - after edit stay on the same record option
*   - if supplied array of ids, get should return array of records
*   - allow functions in routeData (also add routeData to list/enum)
*   - implement global routeData and all elements read from there
*   - send parsed URL to the event if there is routeData
*   - if you set searchData or sortData and call refresh() it should work
*   - add selectType: 'none' so that no selection can be make but with mouse
*   - reorder records with frozen columns
*   - focus/blur for selectType = cell not display grayed out selection
*   - frozen columns
        - load more only on the right side
        - scrolling on frozen columns is not working only on regular columns
*   - copy or large number of records is slow
*   - reusable search component (see https://github.com/vitmalina/w2ui/issues/914#issuecomment-107340524)
*   - allow enum in inline edit (see https://github.com/vitmalina/w2ui/issues/911#issuecomment-107341193)
*   - if record has no recid, then it should be index in the aray (should not be 0)
*   - remote source, but localSort/localSearch
*   - gridMinWidth - should show/hide columns, when it is triggered, column can not be turned on at all
*
* == KNOWN ISSUES ==
*   - bug: vs_start = 100 and more then 500 records, when scrolling empty sets
*   - row drag and drop has bugs
*   - Shift-click/Ctrl-click/Ctrl-Shift-Click selection is not as robust as it should be
*
* == 1.5 changes
*   - $('#grid').w2grid() - if called w/o argument then it returns grid object
*   - added statusRange     : true,
*           statusBuffered  : false,
*           statusRecordID  : true,
*           statusSelection : true,
*           statusResponse  : true,
*           statusSort      : true,
*           statusSearch    : true,
*   - change selectAll() and selectNone() - return time it took
*   - added vs_start and vs_extra
*   - added update(cells) - updates only data in the grid (or cells)
*   - add to docs onColumnDragStart, onColumnDragEnd
*   - onSelect and onSelect should fire 1 time for selects with shift or selectAll(), selectNone()
*   - record.w2ui.style[field_name]
*   - use column field for style: { 1: 'color: red' }
*   - added focus(), blur(), onFocus, onBlur
*   - search.simple - if false, will not show up in simple search
*   - search.operator - default operator to use with search field
*   - search.operators - array of operators for the search
*   - search.hidden - could not be cleared by the user
*   - search.value - only for hidden searches
*   - if .search(val) - search all fields
*   - refactor reorderRow (not finished)
*   - return JSON can now have summary array
*   - frozen columns
*   - added selectionSave, selectionRestore - for internal use
*   - added additional search filter options for int, float, date, time
*   - added getLineHTML
*   - added lineNumberWidth
*   - add searches.style
*   - getColumn without params returns fields of all columns
*   - getSearch without params returns fields of all searches
*   - added column.tooltip
*   - added hasFocus, refactored w2utils.keyboard
*   - do not clear selection when clicked and it was not in focus
*   - added record.w2ui.colspan
*   - editable area extends with typing
*   - removed onSubmit and onDeleted - now it uses onSave and onDelete
*   - column.seachable - can be an object, which will create search
*   - added null, not null filters
*   - update(cells) - added argument cells
*   - scrollIntoView(..., ..., instant) - added third argument
*   - added onResizeDblClick
*   - added onColumnDblClick
*   - implemented showBubble
*   - added show.searchAll
*   - added show.searchHiddenMsg
*   - added w2grid.operators
*   - added w2grid.operatorsMap
*   - move events into prototype
*   - move rec.summary, rec.style, rec.editable -> into rec.w2ui.summary, rec.w2ui.style, rec.w2ui.editable
*   - record: {
        recid
        field1
        ...
        fieldN
        w2ui: {
            colspan: { field: 5, ...}
            editable: true/false
            hideCheckBox: true/false,
            changes: {
                field: chagned_value,
                ....
            },
            children: [
                // similar to records array
                // can have sub children
            ]
            parent_recid: (internally set, id of the parent record, when children are copied to records array)
            summary: true/false
            style: 'string' - for entire row OR { field: 'string', ...} - per field
            class: 'string' - for entire row OR { field: 'string', ...} - per field
        }
    }
*   - added this.show.toolbarInput
*   - disableCVS
*   - added nestedFields: use field name containing dots as separator to look into objects
*   - grid.message
*   - added noReset option to localSort()
*   - onColumnSelect
*   - need to update PHP example
*   - added scrollToColumn(field)
*   - textSearch: 'begins' (default), 'contains', 'is', ...
*   - added refreshBody
*   - added response.total = -1 (or not present) to indicate that number of records is unknown
*   - message(.., callBack) - added callBack
*   - grid.msgEmpty
*   - field.render(..., data) -- added last argument which is what grid thinks should be there
*   - field.render can return { html, class, style } as an object
*   - onSearchOpen (onSearch will have mutli and reset flags)
*   - added httpHeaders
*   - col.editable can be a function which will be called with the same args as col.render()
*   - col.clipboardCopy - display icon to copy to clipboard
*   - clipboardCopy - new function on grid level
*   - getCellEditable(index, col_ind) -- return an 'editable' descriptor if cell is really editable
*   - added stateId
*   - rec.w2ui.class (and rec.w2ui.class { fname: '...' })
*   - columnTooltip
*   - expendable grids are still working
*   - added search.type = 'color'
*   - added getFirst
*   - added stateColProps
*   - added stateColDefaults
*   - deprecated search.caption -> search.label
*   - deprecated column.caption -> column.text
*   - deprecated columnGroup.caption -> columnGroup.text
*   - moved a lot of properties into prototype
*   - showExtraOnSearch
*   - added sortMap, searchMap
*   - added column.hideable
*   - added updateColumn
*   - column.info {
        icon    : string|function|object,
        style   : string|function|object,
        render  : function,
        fields  : array|object,
        showOn  : 'mouseover|mouseenter|...',
        hideOn  : 'mouseout|mouseleave|...',
        options : {} - will be passed to w2tag (for example options.potions = 'top')
    }
*   - added msgDeleteBtn
*   - grid.toolbar.item batch
*   - order.column
*   - fixed select/unselect, not it can take array of ids
*   - menuClick - changed parameters
*   - column.text can be a function
*   - columnGroup.text can be a function
*   - grid.tabIndex
*   - onColumnAutoResize
*   - col.sortMode = 'default', 'natural' or a function
*   == 2.0
*
************************************************************************/

import { w2event } from './w2event.js'
import { w2utils } from './w2utils.js'
import { w2toolbar } from './w2toolbar.js'

class w2grid extends w2event {
    constructor(options) {
        super(options.name)
        this.name = null
        this.box = null // HTML element that hold this element
        this.columns = [] // { field, text, size, attr, render, hidden, gridMinWidth, editable }
        this.columnGroups = [] // { span: int, text: 'string', main: true/false }
        this.records = [] // { recid: int(requied), field1: 'value1', ... fieldN: 'valueN', style: 'string',  changes: object }
        this.summary = [] // arry of summary records, same structure as records array
        this.searches = [] // { type, label, field, inTag, outTag, hidden }
        this.sortMap = {} // remap sort Fields
        this.toolbar = {} // if not empty object; then it is toolbar object
        this.ranges = []
        this.menu = []
        this.searchData = []
        this.sortData = []
        this.total = 0 // server total
        this.recid = null // field from records to be used as recid

        // internal
        this.last = {
            field     : '',
            label     : '',
            logic     : 'OR',
            search    : '',
            searchIds : [],
            selection : {
                indexes : [],
                columns : {}
            },
            multi       : false,
            scrollTop   : 0,
            scrollLeft  : 0,
            colStart    : 0, // for column virtual scrolling
            colEnd      : 0,
            sortData    : null,
            sortCount   : 0,
            xhr         : null,
            loaded      : false,
            range_start : null,
            range_end   : null,
            sel_ind     : null,
            sel_col     : null,
            sel_type    : null,
            edit_col    : null,
            isSafari    : (/^((?!chrome|android).)*safari/i).test(navigator.userAgent)
        }
        this.header = ''
        this.url = ''
        this.limit = 100
        this.offset = 0 // how many records to skip (for infinite scroll) when pulling from server
        this.postData = {}
        this.routeData = {}
        this.httpHeaders = {}
        this.show = {
            header          : false,
            toolbar         : false,
            footer          : false,
            columnHeaders   : true,
            lineNumbers     : false,
            orderColumn     : false,
            expandColumn    : false,
            selectColumn    : false,
            emptyRecords    : true,
            toolbarReload   : true,
            toolbarColumns  : true,
            toolbarSearch   : true,
            toolbarInput    : true,
            toolbarAdd      : false,
            toolbarEdit     : false,
            toolbarDelete   : false,
            toolbarSave     : false,
            searchAll       : true,
            searchHiddenMsg : false,
            statusRange     : true,
            statusBuffered  : false,
            statusRecordID  : true,
            statusSelection : true,
            statusResponse  : true,
            statusSort      : false,
            statusSearch    : false,
            recordTitles    : true,
            selectionBorder : true,
            skipRecords     : true,
            saveRestoreState: true
        }
        this.stateId = null // Custom state name for stateSave, stateRestore and stateReset
        this.hasFocus = false
        this.autoLoad = true // for infinite scroll
        this.fixedBody = true // if false; then grid grows with data
        this.recordHeight = 24 // should be in prototype
        this.lineNumberWidth = null
        this.keyboard = true
        this.selectType = 'row' // can be row|cell
        this.multiSearch = true
        this.multiSelect = true
        this.multiSort = true
        this.reorderColumns = false
        this.reorderRows = false
        this.showExtraOnSearch = 0 // show extra records before and after on search
        this.markSearch = true
        this.columnTooltip = 'top|bottom' // can be normal, top, bottom, left, right
        this.disableCVS = false // disable Column Virtual Scroll
        this.textSearch = 'begins' // default search type for text
        this.nestedFields = true // use field name containing dots as separator to look into object
        this.vs_start = 150
        this.vs_extra = 15
        this.style = ''
        this.method = null // if defined, then overwrited ajax method
        this.dataType = null // if defined, then overwrited w2utils.settings.dataType
        this.parser = null

        // these column properties will be saved in stateSave()
        this.stateColProps = {
            text            : false,
            field           : true,
            size            : true,
            min             : false,
            max             : false,
            gridMinWidth    : false,
            sizeCorrected   : false,
            sizeCalculated  : true,
            sizeOriginal    : true,
            sizeType        : true,
            hidden          : true,
            sortable        : false,
            searchable      : false,
            clipboardCopy   : false,
            resizable       : false,
            hideable        : false,
            attr            : false,
            style           : false,
            render          : false,
            title           : false,
            editable        : false,
            frozen          : true,
            info            : false,
        }

        // these are the stateSave() fallback values if the property to save is not a property of the column object
        this.stateColDefaults = {
            text            : '', // column text
            field           : '', // field name to map column to a record
            size            : null, // size of column in px or %
            min             : 20, // minimum width of column in px
            max             : null, // maximum width of column in px
            gridMinWidth    : null, // minimum width of the grid when column is visible
            sizeCorrected   : null, // read only, corrected size (see explanation below)
            sizeCalculated  : null, // read only, size in px (see explanation below)
            sizeOriginal    : null,
            sizeType        : null,
            hidden          : false, // indicates if column is hidden
            sortable        : false, // indicates if column is sortable
            searchable      : false, // indicates if column is searchable, bool/string: int,float,date,...
            clipboardCopy   : false,
            resizable       : true, // indicates if column is resizable
            hideable        : true, // indicates if column can be hidden
            attr            : '', // string that will be inside the <td ... attr> tag
            style           : '', // additional style for the td tag
            render          : null, // string or render function
            title           : null, // string or function for the title property for the column cells
            editable        : {}, // editable object if column fields are editable
            frozen          : false, // indicates if the column is fixed to the left
            info            : null // info bubble, can be bool/object
        }

        this.msgDelete = 'Are you sure you want to delete XX records?'
        this.msgDeleteBtn = 'Delete'
        this.msgNotJSON = 'Returned data is not in valid JSON format.'
        this.msgAJAXerror = 'AJAX error. See console for more details.'
        this.msgRefresh = 'Refreshing...'
        this.msgNeedReload = 'Your remote data source record count has changed, reloading from the first record.'
        this.msgEmpty = '' // if not blank, then it is message when server returns no records

        this.buttons = {
            'reload'   : { type: 'button', id: 'w2ui-reload', icon: 'w2ui-icon-reload', tooltip: 'Reload data in the list' },
            'columns'  : { type: 'drop', id: 'w2ui-column-on-off', icon: 'w2ui-icon-columns', tooltip: 'Show/hide columns', arrow: false, html: '' },
            'search'   : { type: 'html', id: 'w2ui-search',
                html: '<div class="w2ui-icon icon-search-down w2ui-search-down" '+
                                  'onclick="let grid = w2ui[jQuery(this).parents(\'div.w2ui-grid\').attr(\'name\')]; grid.searchShowFields()"></div>'
            },
            'search-go': { type: 'drop', id: 'w2ui-search-advanced', icon: 'w2ui-icon-search', text: 'Search', tooltip: 'Open Search Fields' },
            'add'      : { type: 'button', id: 'w2ui-add', text: 'Add New', tooltip: 'Add new record', icon: 'w2ui-icon-plus' },
            'edit'     : { type: 'button', id: 'w2ui-edit', text: 'Edit', tooltip: 'Edit selected record', icon: 'w2ui-icon-pencil', disabled: true },
            'delete'   : { type: 'button', id: 'w2ui-delete', text: 'Delete', tooltip: 'Delete selected records', icon: 'w2ui-icon-cross', disabled: true },
            'save'     : { type: 'button', id: 'w2ui-save', text: 'Save', tooltip: 'Save changed records', icon: 'w2ui-icon-check' }
        }

        this.operators = { // for search fields
            'text'    : ['is', 'begins', 'contains', 'ends'],
            'number'  : ['=', 'between', '>', '<', '>=', '<='],
            'date'    : ['is', 'between', { oper: 'less', text: 'before'}, { oper: 'more', text: 'after' }],
            'list'    : ['is'],
            'hex'     : ['is', 'between'],
            'color'   : ['is', 'begins', 'contains', 'ends'],
            'enum'    : ['in', 'not in']
            // -- all possible
            // "text"    : ['is', 'begins', 'contains', 'ends'],
            // "number"  : ['is', 'between', 'less:less than', 'more:more than', 'null:is null', 'not null:is not null'],
            // "list"    : ['is', 'null:is null', 'not null:is not null'],
            // "enum"    : ['in', 'not in', 'null:is null', 'not null:is not null']
        }

        this.operatorsMap = {
            'text'         : 'text',
            'int'          : 'number',
            'float'        : 'number',
            'money'        : 'number',
            'currency'     : 'number',
            'percent'      : 'number',
            'hex'          : 'hex',
            'alphanumeric' : 'text',
            'color'        : 'color',
            'date'         : 'date',
            'time'         : 'date',
            'datetime'     : 'date',
            'list'         : 'list',
            'combo'        : 'text',
            'enum'         : 'enum',
            'file'         : 'enum',
            'select'       : 'list',
            'radio'        : 'list',
            'checkbox'     : 'list',
            'toggle'       : 'list'
        }

        // events
        this.onAdd = null
        this.onEdit = null
        this.onRequest = null // called on any server event
        this.onLoad = null
        this.onDelete = null
        this.onSave = null
        this.onSelect = null
        this.onUnselect = null
        this.onClick = null
        this.onDblClick = null
        this.onContextMenu = null
        this.onMenuClick = null // when context menu item selected
        this.onColumnClick = null
        this.onColumnDblClick = null
        this.onColumnResize = null
        this.onColumnAutoResize = null
        this.onSort = null
        this.onSearch = null
        this.onSearchOpen = null
        this.onChange = null // called when editable record is changed
        this.onRestore = null // called when editable record is restored
        this.onExpand = null
        this.onCollapse = null
        this.onError = null
        this.onKeydown = null
        this.onToolbar = null // all events from toolbar
        this.onColumnOnOff = null
        this.onCopy = null
        this.onPaste = null
        this.onSelectionExtend = null
        this.onEditField = null
        this.onRender = null
        this.onRefresh = null
        this.onReload = null
        this.onResize = null
        this.onDestroy = null
        this.onStateSave = null
        this.onStateRestore = null
        this.onFocus = null
        this.onBlur = null
        this.onReorderRow = null

        // need deep merge
        $.extend(true, this, options)

        // check if there are records without recid
        if (Array.isArray(this.records)) {
            this.records.forEach(rec => {
                if (rec[this.recid] != null) {
                    rec.recid = rec[this.recid]
                }
                if (rec.recid == null) {
                    console.log('ERROR: Cannot add records without recid. (obj: '+ this.name +')')
                }
            })
        }
        // add searches
        if (Array.isArray(this.columns)) {
            this.columns.forEach(col => {
                let search = col.searchable
                if (search == null || search === false || this.getSearch(col.field) != null) return
                if ($.isPlainObject(search)) {
                    this.addSearch($.extend({ field: col.field, label: col.text, type: 'text' }, search))
                } else {
                    let stype = col.searchable
                    let attr = ''
                    if (col.searchable === true) {
                        stype = 'text'
                        attr = 'size="20"'
                    }
                    this.addSearch({ field: col.field, label: col.text, type: stype, attr: attr })
                }
            })
        }
    }

    add(record, first) {
        if (!Array.isArray(record)) record = [record]
        let added = 0
        for (let i = 0; i < record.length; i++) {
            let rec = record[i]
            if (rec[this.recid] != null) {
                rec.recid = rec[this.recid]
            }
            if (rec.recid == null) {
                console.log('ERROR: Cannot add record without recid. (obj: '+ this.name +')')
                continue
            }
            if (rec.w2ui && rec.w2ui.summary === true) {
                if (first) this.summary.unshift(rec); else this.summary.push(rec)
            } else {
                if (first) this.records.unshift(rec); else this.records.push(rec)
            }
            added++
        }
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!url) {
            this.total = this.records.length
            this.localSort(false, true)
            this.localSearch()
            // do not call this.refresh(), this is unnecessary, heavy, and messes with the toolbar.
            this.refreshBody()
            this.resizeRecords()
            return added
        }
        this.refresh() // ??  should it be reload?
        return added
    }

    find(obj, returnIndex) {
        if (obj == null) obj = {}
        let recs = []
        let hasDots = false
        // check if property is nested - needed for speed
        for (let o in obj) if (String(o).indexOf('.') != -1) hasDots = true
        // look for an item
        for (let i = 0; i < this.records.length; i++) {
            let match = true
            for (let o in obj) {
                let val = this.records[i][o]
                if (hasDots && String(o).indexOf('.') != -1) val = this.parseField(this.records[i], o)
                if (obj[o] == 'not-null') {
                    if (val == null || val === '') match = false
                } else {
                    if (obj[o] != val) match = false
                }
            }
            if (match && returnIndex !== true) recs.push(this.records[i].recid)
            if (match && returnIndex === true) recs.push(i)
        }
        return recs
    }

    set(recid, record, noRefresh) { // does not delete existing, but overrides on top of it
        if ((typeof recid == 'object') && (recid !== null)) {
            noRefresh = record
            record = recid
            recid = null
        }
        // update all records
        if (recid == null) {
            for (let i = 0; i < this.records.length; i++) {
                $.extend(true, this.records[i], record) // recid is the whole record
            }
            if (noRefresh !== true) this.refresh()
        } else { // find record to update
            let ind = this.get(recid, true)
            if (ind == null) return false
            let isSummary = (this.records[ind] && this.records[ind].recid == recid ? false : true)
            if (isSummary) {
                $.extend(true, this.summary[ind], record)
            } else {
                $.extend(true, this.records[ind], record)
            }
            if (noRefresh !== true) this.refreshRow(recid, ind) // refresh only that record
        }
        return true
    }

    get(recid, returnIndex) {
        // search records
        if (Array.isArray(recid)) {
            let recs = []
            for (let i = 0; i < recid.length; i++) {
                let v = this.get(recid[i], returnIndex)
                if (v !== null)
                    recs.push(v)
            }
            return recs
        } else {
            // get() must be fast, implements a cache to bypass loop over all records
            // most of the time.
            let idCache = this.last.idCache
            if (!idCache) {
                this.last.idCache = idCache = {}
            }
            let i = idCache[recid]
            if (typeof(i) === 'number') {
                if (i >= 0 && i < this.records.length && this.records[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.records[i]
                }
                // summary indexes are stored as negative numbers, try them now.
                i = ~i
                if (i >= 0 && i < this.summary.length && this.summary[i].recid == recid) {
                    if (returnIndex === true) return i; else return this.summary[i]
                }
                // wrong index returned, clear cache
                this.last.idCache = idCache = {}
            }
            for (let i = 0; i < this.records.length; i++) {
                if (this.records[i].recid == recid) {
                    idCache[recid] = i
                    if (returnIndex === true) return i; else return this.records[i]
                }
            }
            // search summary
            for (let i = 0; i < this.summary.length; i++) {
                if (this.summary[i].recid == recid) {
                    idCache[recid] = ~i
                    if (returnIndex === true) return i; else return this.summary[i]
                }
            }
            return null
        }
    }

    getFirst() {
        if (this.records.length == 0) return null
        let recid = this.records[0].recid
        let tmp = this.last.searchIds
        if (this.searchData.length > 0) {
            if (Array.isArray(tmp) && tmp.length > 0) {
                recid = this.records[tmp[0]].recid
            } else {
                recid = null
            }
        }
        return recid
    }

    remove() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.records.length-1; r >= 0; r--) {
                if (this.records[r].recid == arguments[a]) { this.records.splice(r, 1); removed++ }
            }
            for (let r = this.summary.length-1; r >= 0; r--) {
                if (this.summary[r].recid == arguments[a]) { this.summary.splice(r, 1); removed++ }
            }
        }
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!url) {
            this.localSort(false, true)
            this.localSearch()
        }
        this.refresh()
        return removed
    }

    addColumn(before, columns) {
        let added = 0
        if (arguments.length == 1) {
            columns = before
            before = this.columns.length
        } else {
            if (typeof before == 'string') before = this.getColumn(before, true)
            if (before == null) before = this.columns.length
        }
        if (!Array.isArray(columns)) columns = [columns]
        for (let i = 0; i < columns.length; i++) {
            this.columns.splice(before, 0, columns[i])
            // if column is searchable, add search field
            if (columns[i].searchable) {
                let stype = columns[i].searchable
                let attr = ''
                if (columns[i].searchable === true) { stype = 'text'; attr = 'size="20"' }
                this.addSearch({ field: columns[i].field, label: columns[i].label, type: stype, attr: attr })
            }
            before++
            added++
        }
        this.refresh()
        return added
    }

    removeColumn() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.columns.length-1; r >= 0; r--) {
                if (this.columns[r].field == arguments[a]) {
                    if (this.columns[r].searchable) this.removeSearch(arguments[a])
                    this.columns.splice(r, 1)
                    removed++
                }
            }
        }
        this.refresh()
        return removed
    }

    getColumn(field, returnIndex) {
        // no arguments - return fields of all columns
        if (arguments.length === 0) {
            let ret = []
            for (let i = 0; i < this.columns.length; i++) ret.push(this.columns[i].field)
            return ret
        }
        // find column
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].field == field) {
                if (returnIndex === true) return i; else return this.columns[i]
            }
        }
        return null
    }

    updateColumn(names, updates) {
        let effected = 0
        names = (Array.isArray(names) ? names : [names])
        names.forEach((colName) => {
            this.columns.forEach((col) => {
                if (col.field == colName) {
                    let _updates = $.extend(true, {}, updates)
                    Object.keys(_updates).forEach((key) => {
                        // if it is a function
                        if (typeof _updates[key] == 'function') {
                            _updates[key] = _updates[key](col)
                        }
                        if (col[key] != _updates[key]) effected++
                    })
                    $.extend(true, col, _updates)
                }
            })
        })
        if (effected > 0) {
            this.refresh() // need full refresh due to colgroups not resiging properly
        }
        return effected
    }

    toggleColumn() {
        return this.updateColumn(Array.from(arguments), { hidden(col) { return !col.hidden } })
    }

    showColumn() {
        return this.updateColumn(Array.from(arguments), { hidden: false })
    }

    hideColumn() {
        return this.updateColumn(Array.from(arguments), { hidden: true })
    }

    addSearch(before, search) {
        let added = 0
        if (arguments.length == 1) {
            search = before
            before = this.searches.length
        } else {
            if (typeof before == 'string') before = this.getSearch(before, true)
            if (before == null) before = this.searches.length
        }
        if (!Array.isArray(search)) search = [search]
        for (let i = 0; i < search.length; i++) {
            this.searches.splice(before, 0, search[i])
            before++
            added++
        }
        this.searchClose()
        return added
    }

    removeSearch() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a]) { this.searches.splice(r, 1); removed++ }
            }
        }
        this.searchClose()
        return removed
    }

    getSearch(field, returnIndex) {
        // no arguments - return fields of all searches
        if (arguments.length === 0) {
            let ret = []
            for (let i = 0; i < this.searches.length; i++) ret.push(this.searches[i].field)
            return ret
        }
        // find search
        for (let i = 0; i < this.searches.length; i++) {
            if (this.searches[i].field == field) {
                if (returnIndex === true) return i; else return this.searches[i]
            }
        }
        return null
    }

    toggleSearch() {
        let effected = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a]) {
                    this.searches[r].hidden = !this.searches[r].hidden
                    effected++
                }
            }
        }
        this.searchClose()
        return effected
    }

    showSearch() {
        let shown = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== false) {
                    this.searches[r].hidden = false
                    shown++
                }
            }
        }
        this.searchClose()
        return shown
    }

    hideSearch() {
        let hidden = 0
        for (let a = 0; a < arguments.length; a++) {
            for (let r = this.searches.length-1; r >= 0; r--) {
                if (this.searches[r].field == arguments[a] && this.searches[r].hidden !== true) {
                    this.searches[r].hidden = true
                    hidden++
                }
            }
        }
        this.searchClose()
        return hidden
    }

    getSearchData(field) {
        for (let i = 0; i < this.searchData.length; i++) {
            if (this.searchData[i].field == field) return this.searchData[i]
        }
        return null
    }

    localSort(silent, noResetRefresh) {
        let obj = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (url) {
            console.log('ERROR: grid.localSort can only be used on local data source, grid.url should be empty.')
            return
        }
        if ($.isEmptyObject(this.sortData)) return
        let time = (new Date()).getTime()
        // process date fields
        this.selectionSave()
        this.prepareData()
        if (!noResetRefresh) {
            this.reset()
        }
        // process sortData
        for (let i = 0; i < this.sortData.length; i++) {
            let column = this.getColumn(this.sortData[i].field)
            if (!column) return
            if (typeof column.render == 'string') {
                if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
                    this.sortData[i].field_ = column.field + '_'
                }
                if (['time'].indexOf(column.render.split(':')[0]) != -1) {
                    this.sortData[i].field_ = column.field + '_'
                }
            }
        }

        // prepare paths and process sort
        preparePaths()
        this.records.sort((a, b) => {
            return compareRecordPaths(a, b)
        })
        cleanupPaths()

        this.selectionRestore(noResetRefresh)
        time = (new Date()).getTime() - time
        if (silent !== true && this.show.statusSort) {
            setTimeout(() => {
                this.status(w2utils.lang('Sorting took') + ' ' + time/1000 + ' ' + w2utils.lang('sec'))
            }, 10)
        }
        return time

        // grab paths before sorting for efficiency and because calling obj.get()
        // while sorting 'obj.records' is unsafe, at least on webkit
        function preparePaths() {
            for (let i = 0; i < obj.records.length; i++) {
                let rec = obj.records[i]
                if (rec.w2ui && rec.w2ui.parent_recid != null) {
                    rec.w2ui._path = getRecordPath(rec)
                }
            }
        }

        // cleanup and release memory allocated by preparePaths()
        function cleanupPaths() {
            for (let i = 0; i < obj.records.length; i++) {
                let rec = obj.records[i]
                if (rec.w2ui && rec.w2ui.parent_recid != null) {
                    rec.w2ui._path = null
                }
            }
        }

        // compare two paths, from root of tree to given records
        function compareRecordPaths(a, b) {
            if ((!a.w2ui || a.w2ui.parent_recid == null) && (!b.w2ui || b.w2ui.parent_recid == null)) {
                return compareRecords(a, b) // no tree, fast path
            }
            let pa = getRecordPath(a)
            let pb = getRecordPath(b)
            for (let i = 0; i < Math.min(pa.length, pb.length); i++) {
                let diff = compareRecords(pa[i], pb[i])
                if (diff !== 0) return diff // different subpath
            }
            if (pa.length > pb.length) return 1
            if (pa.length < pb.length) return -1
            console.log('ERROR: two paths should not be equal.')
            return 0
        }

        // return an array of all records from root to and including 'rec'
        function getRecordPath(rec) {
            if (!rec.w2ui || rec.w2ui.parent_recid == null) return [rec]
            if (rec.w2ui._path)
                return rec.w2ui._path
            // during actual sort, we should never reach this point
            let subrec = obj.get(rec.w2ui.parent_recid)
            if (!subrec) {
                console.log('ERROR: no parent record: '+rec.w2ui.parent_recid)
                return [rec]
            }
            return (getRecordPath(subrec).concat(rec))
        }

        // compare two records according to sortData and finally recid
        function compareRecords(a, b) {
            if (a === b) return 0 // optimize, same object
            for (let i = 0; i < obj.sortData.length; i++) {
                let fld = obj.sortData[i].field
                let sortFld = (obj.sortData[i].field_) ? obj.sortData[i].field_ : fld
                let aa = a[sortFld]
                let bb = b[sortFld]
                if (String(fld).indexOf('.') != -1) {
                    aa = obj.parseField(a, sortFld)
                    bb = obj.parseField(b, sortFld)
                }
                let col = obj.getColumn(fld)
                if (col && col.editable != null) { // for drop editable fields and drop downs
                    if ($.isPlainObject(aa) && aa.text) aa = aa.text
                    if ($.isPlainObject(bb) && bb.text) bb = bb.text
                }
                let ret = compareCells(aa, bb, i, obj.sortData[i].direction, col.sortMode || 'default')
                if (ret !== 0) return ret
            }
            // break tie for similar records,
            // required to have consistent ordering for tree paths
            let ret = compareCells(a.recid, b.recid, -1, 'asc')
            return ret
        }

        // compare two values, aa and bb, producing consistent ordering
        function compareCells(aa, bb, i, direction, sortMode) {
            // if both objects are strictly equal, we're done
            if (aa === bb)
                return 0
            // all nulls, empty and undefined on bottom
            if ((aa == null || aa === '') && (bb != null && bb !== ''))
                return 1
            if ((aa != null && aa !== '') && (bb == null || bb === ''))
                return -1
            let dir = (direction.toLowerCase() === 'asc') ? 1 : -1
            // for different kind of objects, sort by object type
            if (typeof aa != typeof bb)
                return (typeof aa > typeof bb) ? dir : -dir
            // for different kind of classes, sort by classes
            if (aa.constructor.name != bb.constructor.name)
                return (aa.constructor.name > bb.constructor.name) ? dir : -dir
            // if we're dealing with non-null objects, call valueOf().
            // this mean that Date() or custom objects will compare properly.
            if (aa && typeof aa == 'object')
                aa = aa.valueOf()
            if (bb && typeof bb == 'object')
                bb = bb.valueOf()
            // if we're still dealing with non-null objects that have
            // a useful Object => String conversion, convert to string.
            let defaultToString = {}.toString
            if (aa && typeof aa == 'object' && aa.toString != defaultToString)
                aa = String(aa)
            if (bb && typeof bb == 'object' && bb.toString != defaultToString)
                bb = String(bb)
            // do case-insensitive string comparison
            if (typeof aa == 'string')
                aa = $.trim(aa.toLowerCase())
            if (typeof bb == 'string')
                bb = $.trim(bb.toLowerCase())

            switch (sortMode) {
                case 'natural':
                    sortMode = w2utils.naturalCompare
                    break
            }

            if (typeof sortMode == 'function') {
                return sortMode(aa,bb) * dir
            }

            // compare both objects
            if (aa > bb)
                return dir
            if (aa < bb)
                return -dir
            return 0
        }
    }

    localSearch(silent) {
        let obj = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (url) {
            console.log('ERROR: grid.localSearch can only be used on local data source, grid.url should be empty.')
            return
        }
        let time = (new Date()).getTime()
        let defaultToString = {}.toString
        let duplicateMap = {}
        this.total = this.records.length
        // mark all records as shown
        this.last.searchIds = []
        // prepare date/time fields
        this.prepareData()
        // hide records that did not match
        if (this.searchData.length > 0 && !url) {
            this.total = 0
            for (let i = 0; i < this.records.length; i++) {
                let rec = this.records[i]
                let match = searchRecord(rec)
                if (match) {
                    if (rec && rec.w2ui) addParent(rec.w2ui.parent_recid)
                    if (this.showExtraOnSearch > 0) {
                        let before = this.showExtraOnSearch
                        let after = this.showExtraOnSearch
                        if (i < before) before = i
                        if (i + after > this.records.length) after = this.records.length - i
                        if (before > 0) {
                            for (let j = i - before; j < i; j++) {
                                if (this.last.searchIds.indexOf(j) < 0)
                                    this.last.searchIds.push(j)
                            }
                        }
                        if (this.last.searchIds.indexOf(i) < 0) this.last.searchIds.push(i)
                        if (after > 0) {
                            for (let j = (i + 1) ; j <= (i + after) ; j++) {
                                if (this.last.searchIds.indexOf(j) < 0) this.last.searchIds.push(j)
                            }
                        }
                    } else {
                        this.last.searchIds.push(i)
                    }
                }
            }
            this.total = this.last.searchIds.length
        }
        time = (new Date()).getTime() - time
        if (silent !== true && this.show.statusSearch) {
            setTimeout(() => {
                this.status(w2utils.lang('Search took') + ' ' + time/1000 + ' ' + w2utils.lang('sec'))
            }, 10)
        }
        return time

        // check if a record (or one of its closed children) matches the search data
        function searchRecord(rec) {
            let fl = 0, val1, val2, val3, tmp
            let orEqual = false
            for (let j = 0; j < obj.searchData.length; j++) {
                let sdata = obj.searchData[j]
                let search = obj.getSearch(sdata.field)
                if (sdata == null) continue
                if (search == null) search = { field: sdata.field, type: sdata.type }
                let val1b = obj.parseField(rec, search.field)
                val1 = (val1b !== null && val1b !== undefined &&
                    (typeof val1b != 'object' || val1b.toString != defaultToString)) ?
                    String(val1b).toLowerCase() : '' // do not match a bogus string
                if (sdata.value != null) {
                    if (!Array.isArray(sdata.value)) {
                        val2 = String(sdata.value).toLowerCase()
                    } else {
                        val2 = sdata.value[0]
                        val3 = sdata.value[1]
                    }
                }
                switch (sdata.operator) {
                    case '=':
                    case 'is':
                        if (obj.parseField(rec, search.field) == sdata.value) fl++ // do not hide record
                        else if (search.type == 'date') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDate(tmp, 'yyyy-mm-dd')
                            val2 = w2utils.formatDate(w2utils.isDate(val2, w2utils.settings.dateFormat, true), 'yyyy-mm-dd')
                            if (val1 == val2) fl++
                        }
                        else if (search.type == 'time') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 == val2) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1 == val2) fl++
                        }
                        break
                    case 'between':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            if (parseFloat(obj.parseField(rec, search.field)) >= parseFloat(val2) && parseFloat(obj.parseField(rec, search.field)) <= parseFloat(val3)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            val3 = w2utils.isDate(val3, w2utils.settings.dateFormat, true)
                            if (val3 != null) val3 = new Date(val3.getTime() + 86400000) // 1 day
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        else if (search.type == 'time') {
                            val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val2 = w2utils.isTime(val2, true)
                            val3 = w2utils.isTime(val3, true)
                            val2 = (new Date()).setHours(val2.hours, val2.minutes, val2.seconds ? val2.seconds : 0, 0)
                            val3 = (new Date()).setHours(val3.hours, val3.minutes, val3.seconds ? val3.seconds : 0, 0)
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        else if (search.type == 'datetime') {
                            val1 = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val2 = w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true)
                            val3 = w2utils.isDateTime(val3, w2utils.settings.datetimeFormat, true)
                            if (val3) val3 = new Date(val3.getTime() + 86400000) // 1 day
                            if (val1 >= val2 && val1 < val3) fl++
                        }
                        break
                    case '<=':
                        orEqual = true
                    case '<':
                    case 'less':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            val1 = parseFloat(obj.parseField(rec, search.field))
                            val2 = parseFloat(sdata.value)
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'time') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 < val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1.length == val2.length && (val1 < val2 || (orEqual && val1 === val2))) fl++
                        }
                        break
                    case '>=':
                        orEqual = true
                    case '>':
                    case 'more':
                        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                            val1 = parseFloat(obj.parseField(rec, search.field))
                            val2 = parseFloat(sdata.value)
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'date') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.isDate(tmp, w2utils.settings.dateFormat, true)
                            val2 = w2utils.isDate(val2, w2utils.settings.dateFormat, true)
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'time') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatTime(tmp, 'hh24:mi')
                            val2 = w2utils.formatTime(val2, 'hh24:mi')
                            if (val1 > val2 || (orEqual && val1 === val2)) fl++
                        }
                        else if (search.type == 'datetime') {
                            tmp = (obj.parseField(rec, search.field + '_') instanceof Date ? obj.parseField(rec, search.field + '_') : obj.parseField(rec, search.field))
                            val1 = w2utils.formatDateTime(tmp, 'yyyy-mm-dd|hh24:mm:ss')
                            val2 = w2utils.formatDateTime(w2utils.isDateTime(val2, w2utils.settings.datetimeFormat, true), 'yyyy-mm-dd|hh24:mm:ss')
                            if (val1.length == val2.length && (val1 > val2 || (orEqual && val1 === val2))) fl++
                        }
                        break
                    case 'in':
                        tmp = sdata.value
                        if (sdata.svalue) tmp = sdata.svalue
                        if ((tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) !== -1) || tmp.indexOf(val1) !== -1) fl++
                        break
                    case 'not in':
                        tmp = sdata.value
                        if (sdata.svalue) tmp = sdata.svalue
                        if (!((tmp.indexOf(w2utils.isFloat(val1b) ? parseFloat(val1b) : val1b) !== -1) || tmp.indexOf(val1) !== -1)) fl++
                        break
                    case 'begins':
                    case 'begins with': // need for back compatib.
                        if (val1.indexOf(val2) === 0) fl++ // do not hide record
                        break
                    case 'contains':
                        if (val1.indexOf(val2) >= 0) fl++ // do not hide record
                        break
                    case 'null':
                        if (obj.parseField(rec, search.field) == null) fl++ // do not hide record
                        break
                    case 'not null':
                        if (obj.parseField(rec, search.field) != null) fl++ // do not hide record
                        break
                    case 'ends':
                    case 'ends with': // need for back compatib.
                        lastIndex = val1.lastIndexOf(val2)
                        if (lastIndex !== -1 && lastIndex == val1.length - val2.length) fl++ // do not hide record
                        break
                }
            }
            if ((obj.last.logic == 'OR' && fl !== 0) ||
                (obj.last.logic == 'AND' && fl == obj.searchData.length))
                return true
            if (rec.w2ui && rec.w2ui.children && rec.w2ui.expanded !== true) {
                // there are closed children, search them too.
                for (let r = 0; r < rec.w2ui.children.length; r++) {
                    let subRec = rec.w2ui.children[r]
                    if (searchRecord(subRec))
                        return true
                }
            }
            return false
        }

        // add parents nodes recursively
        function addParent(recid) {
            if (recid === undefined)
                return
            if (duplicateMap[recid])
                return // already visited
            duplicateMap[recid] = true
            let i = obj.get(recid, true)
            if (i == null)
                return
            if ($.inArray(i, obj.last.searchIds) != -1)
                return
            let rec = obj.records[i]
            if (rec && rec.w2ui)
                addParent(rec.w2ui.parent_recid)
            obj.last.searchIds.push(i)
        }
    }

    getRangeData(range, extra) {
        let rec1 = this.get(range[0].recid, true)
        let rec2 = this.get(range[1].recid, true)
        let col1 = range[0].column
        let col2 = range[1].column

        let res = []
        if (col1 == col2) { // one row
            for (let r = rec1; r <= rec2; r++) {
                let record = this.records[r]
                let dt = record[this.columns[col1].field] || null
                if (extra !== true) {
                    res.push(dt)
                } else {
                    res.push({ data: dt, column: col1, index: r, record: record })
                }
            }
        } else if (rec1 == rec2) { // one line
            let record = this.records[rec1]
            for (let i = col1; i <= col2; i++) {
                let dt = record[this.columns[i].field] || null
                if (extra !== true) {
                    res.push(dt)
                } else {
                    res.push({ data: dt, column: i, index: rec1, record: record })
                }
            }
        } else {
            for (let r = rec1; r <= rec2; r++) {
                let record = this.records[r]
                res.push([])
                for (let i = col1; i <= col2; i++) {
                    let dt = record[this.columns[i].field]
                    if (extra !== true) {
                        res[res.length-1].push(dt)
                    } else {
                        res[res.length-1].push({ data: dt, column: i, index: r, record: record })
                    }
                }
            }
        }
        return res
    }

    addRange(ranges) {
        let added = 0, first, last
        if (this.selectType == 'row') return added
        if (!Array.isArray(ranges)) ranges = [ranges]
        // if it is selection
        for (let i = 0; i < ranges.length; i++) {
            if (typeof ranges[i] != 'object') ranges[i] = { name: 'selection' }
            if (ranges[i].name == 'selection') {
                if (this.show.selectionBorder === false) continue
                let sel = this.getSelection()
                if (sel.length === 0) {
                    this.removeRange('selection')
                    continue
                } else {
                    first = sel[0]
                    last = sel[sel.length-1]
                }
            } else { // other range
                first = ranges[i].range[0]
                last = ranges[i].range[1]
            }
            if (first) {
                let rg = {
                    name: ranges[i].name,
                    range: [{ recid: first.recid, column: first.column }, { recid: last.recid, column: last.column }],
                    style: ranges[i].style || ''
                }
                // add range
                let ind = false
                for (let j = 0; j < this.ranges.length; j++) if (this.ranges[j].name == ranges[i].name) { ind = j; break }
                if (ind !== false) {
                    this.ranges[ind] = rg
                } else {
                    this.ranges.push(rg)
                }
                added++
            }
        }
        this.refreshRanges()
        return added
    }

    removeRange() {
        let removed = 0
        for (let a = 0; a < arguments.length; a++) {
            let name = arguments[a]
            $('#grid_'+ this.name +'_'+ name).remove()
            $('#grid_'+ this.name +'_f'+ name).remove()
            for (let r = this.ranges.length-1; r >= 0; r--) {
                if (this.ranges[r].name == name) {
                    this.ranges.splice(r, 1)
                    removed++
                }
            }
        }
        return removed
    }

    refreshRanges() {
        if (this.ranges.length === 0) return
        let obj = this
        let $range, sLeft, sTop, _left, _top
        let time = (new Date()).getTime()
        let rec1 = $('#grid_'+ this.name +'_frecords')
        let rec2 = $('#grid_'+ this.name +'_records')
        for (let i = 0; i < this.ranges.length; i++) {
            let rg = this.ranges[i]
            let first = rg.range[0]
            let last = rg.range[1]
            if (first.index == null) first.index = this.get(first.recid, true)
            if (last.index == null) last.index = this.get(last.recid, true)
            let td1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]')
            let td2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]')
            let td1f = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(first.recid) + ' td[col="'+ first.column +'"]')
            let td2f = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) + ' td[col="'+ last.column +'"]')
            let _lastColumn = last.column
            // adjustment due to column virtual scroll
            if (first.column < this.last.colStart && last.column > this.last.colStart) {
                td1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) + ' td[col="start"]')
            }
            if (first.column < this.last.colEnd && last.column > this.last.colEnd) {
                _lastColumn = '"end"'
                td2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(last.recid) + ' td[col="end"]')
            }
            // if virtual scrolling kicked in
            let index_top = parseInt($('#grid_'+ this.name +'_rec_top').next().attr('index'))
            let index_bottom = parseInt($('#grid_'+ this.name +'_rec_bottom').prev().attr('index'))
            let index_ftop = parseInt($('#grid_'+ this.name +'_frec_top').next().attr('index'))
            let index_fbottom = parseInt($('#grid_'+ this.name +'_frec_bottom').prev().attr('index'))
            if (td1.length === 0 && first.index < index_top && last.index > index_top) {
                td1 = $('#grid_'+ this.name +'_rec_top').next().find('td[col='+ first.column +']')
            }
            if (td2.length === 0 && last.index > index_bottom && first.index < index_bottom) {
                td2 = $('#grid_'+ this.name +'_rec_bottom').prev().find('td[col='+ _lastColumn +']')
            }
            if (td1f.length === 0 && first.index < index_ftop && last.index > index_ftop) { // frozen
                td1f = $('#grid_'+ this.name +'_frec_top').next().find('td[col='+ first.column +']')
            }
            if (td2f.length === 0 && last.index > index_fbottom && first.index < index_fbottom) { // frozen
                td2f = $('#grid_'+ this.name +'_frec_bottom').prev().find('td[col='+ last.column +']')
            }

            // do not show selection cell if it is editable
            let edit = $(this.box).find('#grid_'+ this.name + '_editable')
            let tmp = edit.find('.w2ui-input')
            let tmp1 = tmp.attr('recid')
            let tmp2 = tmp.attr('column')
            if (rg.name == 'selection' && rg.range[0].recid == tmp1 && rg.range[0].column == tmp2) continue

            // frozen regular columns range
            $range = $('#grid_'+ this.name +'_f'+ rg.name)
            if (td1f.length > 0 || td2f.length > 0) {
                if ($range.length === 0) {
                    rec1.append('<div id="grid_'+ this.name +'_f' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
                                    (rg.name == 'selection' ? '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
                                '</div>')
                    $range = $('#grid_'+ this.name +'_f'+ rg.name)
                } else {
                    $range.attr('style', rg.style)
                    $range.find('.w2ui-selection-resizer').show()
                }
                if (td2f.length === 0) {
                    td2f = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(last.recid) +' td:last-child')
                    if (td2f.length === 0) td2f = $('#grid_'+ this.name +'_frec_bottom td:first-child')
                    $range.css('border-right', '0px')
                    $range.find('.w2ui-selection-resizer').hide()
                }
                if (first.recid != null && last.recid != null && td1f.length > 0 && td2f.length > 0) {
                    sLeft = 0 // frozen columns do not need left offset
                    sTop = rec2.scrollTop()
                    // work arround jQuery inconsistensy between vers >3.2 and <=3.3
                    if (td1f.find('>div').position().top < 8) {
                        sLeft = 0
                        sTop = 0
                    }
                    _left = (td1f.position().left - 0 + sLeft)
                    _top = (td1f.position().top - 0 + sTop)
                    $range.show().css({
                        left    : (_left > 0 ? _left : 0) + 'px',
                        top     : (_top > 0 ? _top : 0) + 'px',
                        width   : (td2f.position().left - td1f.position().left + td2f.width() + 2) + 'px',
                        height  : (td2f.position().top - td1f.position().top + td2f.height() + 1) + 'px'
                    })
                } else {
                    $range.hide()
                }
            } else {
                $range.hide()
            }
            // regular columns range
            $range = $('#grid_'+ this.name +'_'+ rg.name)
            if (td1.length > 0 || td2.length > 0) {
                if ($range.length === 0) {
                    rec2.append('<div id="grid_'+ this.name +'_' + rg.name +'" class="w2ui-selection" style="'+ rg.style +'">'+
                                    (rg.name == 'selection' ? '<div id="grid_'+ this.name +'_resizer" class="w2ui-selection-resizer"></div>' : '')+
                                '</div>')
                    $range = $('#grid_'+ this.name +'_'+ rg.name)
                } else {
                    $range.attr('style', rg.style)
                }
                if (td1.length === 0) {
                    td1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(first.recid) +' td:first-child')
                    if (td1.length === 0) td1 = $('#grid_'+ this.name +'_rec_top td:first-child')
                }
                if (td2f.length !== 0) {
                    $range.css('border-left', '0px')
                }
                if (first.recid != null && last.recid != null && td1.length > 0 && td2.length > 0) {
                    sLeft = rec2.scrollLeft()
                    sTop = rec2.scrollTop()
                    // work arround jQuery inconsistensy between vers >3.2 and <=3.3
                    if (td2.find('>div').position().top < 8) {
                        sLeft = 0
                        sTop = 0
                    }
                    _left = (td1.position().left - 0 + sLeft)
                    _top = (td1.position().top - 0 + sTop)
                    // console.log('top', td1.position().top, rec2.scrollTop(), td1.find('>div').position().top)
                    $range.show().css({
                        left    : (_left > 0 ? _left : 0) + 'px',
                        top     : (_top > 0 ? _top : 0) + 'px',
                        width   : (td2.position().left - td1.position().left + td2.width() + 2) + 'px',
                        height  : (td2.position().top - td1.position().top + td2.height() + 1) + 'px'
                    })
                } else {
                    $range.hide()
                }
            } else {
                $range.hide()
            }
        }

        // add resizer events
        $(this.box).find('.w2ui-selection-resizer')
            .off('mousedown').on('mousedown', mouseStart)
            .off('dblclick').on('dblclick', function(event) {
                let edata = obj.trigger({ phase: 'before', type: 'resizerDblClick', target: obj.name, originalEvent: event })
                if (edata.isCancelled === true) return
                obj.trigger($.extend(edata, { phase: 'after' }))
            })
        let edata = { phase: 'before', type: 'selectionExtend', target: obj.name, originalRange: null, newRange: null }

        return (new Date()).getTime() - time

        function mouseStart (event) {
            let sel = obj.getSelection()
            obj.last.move = {
                type   : 'expand',
                x      : event.screenX,
                y      : event.screenY,
                divX   : 0,
                divY   : 0,
                recid  : sel[0].recid,
                column : sel[0].column,
                originalRange : [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }],
                newRange      : [{ recid: sel[0].recid, column: sel[0].column }, { recid: sel[sel.length-1].recid, column: sel[sel.length-1].column }]
            }
            $(document)
                .off('.w2ui-' + obj.name)
                .on('mousemove.w2ui-' + obj.name, mouseMove)
                .on('mouseup.w2ui-' + obj.name, mouseStop)
            // do not blur grid
            event.preventDefault()
        }

        function mouseMove (event) {
            let mv = obj.last.move
            if (!mv || mv.type != 'expand') return
            mv.divX = (event.screenX - mv.x)
            mv.divY = (event.screenY - mv.y)
            // find new cell
            let recid, column
            let tmp = event.originalEvent.target
            if (tmp.tagName.toUpperCase() != 'TD') tmp = $(tmp).parents('td')[0]
            if ($(tmp).attr('col') != null) column = parseInt($(tmp).attr('col'))
            tmp = $(tmp).parents('tr')[0]
            recid = $(tmp).attr('recid')
            // new range
            if (mv.newRange[1].recid == recid && mv.newRange[1].column == column) return
            let prevNewRange = $.extend({}, mv.newRange)
            mv.newRange = [{ recid: mv.recid, column: mv.column }, { recid: recid, column: column }]
            // event before
            edata = obj.trigger($.extend(edata, { originalRange: mv.originalRange, newRange : mv.newRange }))
            if (edata.isCancelled === true) {
                mv.newRange = prevNewRange
                edata.newRange = prevNewRange
                return
            } else {
                // default behavior
                obj.removeRange('grid-selection-expand')
                obj.addRange({
                    name  : 'grid-selection-expand',
                    range : edata.newRange,
                    style : 'background-color: rgba(100,100,100,0.1); border: 2px dotted rgba(100,100,100,0.5);'
                })
            }
        }

        function mouseStop (event) {
            // default behavior
            obj.removeRange('grid-selection-expand')
            delete obj.last.move
            $(document).off('.w2ui-' + obj.name)
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    select() {
        if (arguments.length === 0) return 0
        let selected = 0
        let sel = this.last.selection
        if (!this.multiSelect) this.selectNone()
        // if too manu arguments > 150k, then it errors off
        let args = Array.prototype.slice.call(arguments)
        if (Array.isArray(args[0])) args = args[0]
        // event before
        let tmp = { phase: 'before', type: 'select', target: this.name }
        if (args.length == 1) {
            tmp.multiple = false
            if ($.isPlainObject(args[0])) {
                tmp.recid = args[0].recid
                tmp.column = args[0].column
            } else {
                tmp.recid = args[0]
            }
        } else {
            tmp.multiple = true
            tmp.recids = args
        }
        let edata = this.trigger(tmp)
        if (edata.isCancelled === true) return 0

        // default action
        if (this.selectType == 'row') {
            for (let a = 0; a < args.length; a++) {
                let recid = typeof args[a] == 'object' ? args[a].recid : args[a]
                let index = this.get(recid, true)
                if (index == null) continue
                let recEl1 = null
                let recEl2 = null
                if (this.searchData.length !== 0 || (index + 1 >= this.last.range_start && index + 1 <= this.last.range_end)) {
                    recEl1 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                    recEl2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                }
                if (this.selectType == 'row') {
                    if (sel.indexes.indexOf(index) != -1) continue
                    sel.indexes.push(index)
                    if (recEl1 && recEl2) {
                        recEl1.addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl2.addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl1.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    selected++
                }
            }
        } else {
            // normalize for performance
            let new_sel = {}
            for (let a = 0; a < args.length; a++) {
                let recid = typeof args[a] == 'object' ? args[a].recid : args[a]
                let column = typeof args[a] == 'object' ? args[a].column : null
                new_sel[recid] = new_sel[recid] || []
                if (Array.isArray(column)) {
                    new_sel[recid] = column
                } else if (w2utils.isInt(column)) {
                    new_sel[recid].push(column)
                } else {
                    for (let i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; new_sel[recid].push(parseInt(i)) }
                }
            }
            // add all
            let col_sel = []
            for (let recid in new_sel) {
                let index = this.get(recid, true)
                if (index == null) continue
                let recEl1 = null
                let recEl2 = null
                if (index + 1 >= this.last.range_start && index + 1 <= this.last.range_end) {
                    recEl1 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                    recEl2 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                }
                let s = sel.columns[index] || []
                // default action
                if (sel.indexes.indexOf(index) == -1) {
                    sel.indexes.push(index)
                }
                // anly only those that are new
                for (let t = 0; t < new_sel[recid].length; t++) {
                    if (s.indexOf(new_sel[recid][t]) == -1) s.push(new_sel[recid][t])
                }
                s.sort((a, b) => { return a-b }) // sort function must be for numerical sort
                for (let t = 0; t < new_sel[recid].length; t++) {
                    let col = new_sel[recid][t]
                    if (col_sel.indexOf(col) == -1) col_sel.push(col)
                    if (recEl1) {
                        recEl1.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected')
                        recEl1.find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl1.data('selected', 'yes')
                        recEl1.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    if (recEl2) {
                        recEl2.find('#grid_'+ this.name +'_data_'+ index +'_'+ col).addClass('w2ui-selected')
                        recEl2.find('.w2ui-col-number').addClass('w2ui-row-selected')
                        recEl2.data('selected', 'yes')
                        recEl2.find('.w2ui-grid-select-check').prop('checked', true)
                    }
                    selected++
                }
                // save back to selection object
                sel.columns[index] = s
            }
            // select columns (need here for speed)
            for (let c = 0; c < col_sel.length; c++) {
                $(this.box).find('#grid_'+ this.name +'_column_'+ col_sel[c] +' .w2ui-col-header').addClass('w2ui-col-selected')
            }
        }
        // need to sort new selection for speed
        sel.indexes.sort((a, b) => { return a-b })
        // all selected?
        let areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            $('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            $('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        this.status()
        this.addRange('selection')
        this.updateToolbar(sel, areAllSelected)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return selected
    }

    unselect() {
        let unselected = 0
        let sel = this.last.selection
        // if too manu arguments > 150k, then it errors off
        let args = Array.prototype.slice.call(arguments)
        if (Array.isArray(args[0])) args = args[0]
        // event before
        let tmp = { phase: 'before', type: 'unselect', target: this.name }
        if (args.length == 1) {
            tmp.multiple = false
            if ($.isPlainObject(args[0])) {
                tmp.recid = args[0].recid
                tmp.column = args[0].column
            } else {
                tmp.recid = args[0]
            }
        } else {
            tmp.multiple = true
            tmp.recids = args
        }
        let edata = this.trigger(tmp)
        if (edata.isCancelled === true) return 0

        for (let a = 0; a < args.length; a++) {
            let recid = typeof args[a] == 'object' ? args[a].recid : args[a]
            let record = this.get(recid)
            if (record == null) continue
            let index = this.get(record.recid, true)
            let recEl1 = $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
            let recEl2 = $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
            if (this.selectType == 'row') {
                if (sel.indexes.indexOf(index) == -1) continue
                // default action
                sel.indexes.splice(sel.indexes.indexOf(index), 1)
                recEl1.removeClass('w2ui-selected w2ui-inactive').removeData('selected').find('.w2ui-col-number').removeClass('w2ui-row-selected')
                recEl2.removeClass('w2ui-selected w2ui-inactive').removeData('selected').find('.w2ui-col-number').removeClass('w2ui-row-selected')
                if (recEl1.length != 0) {
                    recEl1[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl1.attr('custom_style')
                    recEl2[0].style.cssText = 'height: '+ this.recordHeight +'px; ' + recEl2.attr('custom_style')
                }
                recEl1.find('.w2ui-grid-select-check').prop('checked', false)
                unselected++
            } else {
                let col = args[a].column
                if (!w2utils.isInt(col)) { // unselect all columns
                    let cols = []
                    for (let i = 0; i < this.columns.length; i++) { if (this.columns[i].hidden) continue; cols.push({ recid: recid, column: i }) }
                    return this.unselect(cols)
                }
                let s = sel.columns[index]
                if (!Array.isArray(s) || s.indexOf(col) == -1) continue
                // default action
                s.splice(s.indexOf(col), 1)
                $('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid)).find(' > td[col='+ col +']').removeClass('w2ui-selected w2ui-inactive')
                $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid)).find(' > td[col='+ col +']').removeClass('w2ui-selected w2ui-inactive')
                // check if any row/column still selected
                let isColSelected = false
                let isRowSelected = false
                let tmp = this.getSelection()
                for (let i = 0; i < tmp.length; i++) {
                    if (tmp[i].column == col) isColSelected = true
                    if (tmp[i].recid == recid) isRowSelected = true
                }
                if (!isColSelected) {
                    $(this.box).find('.w2ui-grid-columns td[col='+ col +'] .w2ui-col-header, .w2ui-grid-fcolumns td[col='+ col +'] .w2ui-col-header').removeClass('w2ui-col-selected')
                }
                if (!isRowSelected) {
                    $('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid)).find('.w2ui-col-number').removeClass('w2ui-row-selected')
                }
                unselected++
                if (s.length === 0) {
                    delete sel.columns[index]
                    sel.indexes.splice(sel.indexes.indexOf(index), 1)
                    recEl1.removeData('selected')
                    recEl1.find('.w2ui-grid-select-check').prop('checked', false)
                    recEl2.removeData('selected')
                }
            }
        }
        // all selected?
        let areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            $('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            $('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        // show number of selected
        this.status()
        this.addRange('selection')
        this.updateToolbar(sel, areAllSelected)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return unselected
    }

    selectAll() {
        let time = (new Date()).getTime()
        if (this.multiSelect === false) return
        // event before
        let edata = this.trigger({ phase: 'before', type: 'select', target: this.name, all: true })
        if (edata.isCancelled === true) return
        // default action
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        let sel = this.last.selection
        let cols = []
        for (let i = 0; i < this.columns.length; i++) cols.push(i)
        // if local data source and searched
        sel.indexes = []
        if (!url && this.searchData.length !== 0) {
            // local search applied
            for (let i = 0; i < this.last.searchIds.length; i++) {
                sel.indexes.push(this.last.searchIds[i])
                if (this.selectType != 'row') sel.columns[this.last.searchIds[i]] = cols.slice() // .slice makes copy of the array
            }
        } else {
            let buffered = this.records.length
            if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
            for (let i = 0; i < buffered; i++) {
                sel.indexes.push(i)
                if (this.selectType != 'row') sel.columns[i] = cols.slice() // .slice makes copy of the array
            }
        }
        // add selected class
        if (this.selectType == 'row') {
            $(this.box).find('.w2ui-grid-records tr').not('.w2ui-empty-record')
                .addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-frecords tr').not('.w2ui-empty-record')
                .addClass('w2ui-selected').data('selected', 'yes').find('.w2ui-col-number').addClass('w2ui-row-selected')
            $(this.box).find('input.w2ui-grid-select-check').prop('checked', true)
        } else {
            $(this.box).find('.w2ui-grid-columns td .w2ui-col-header, .w2ui-grid-fcolumns td .w2ui-col-header').addClass('w2ui-col-selected')
            $(this.box).find('.w2ui-grid-records tr .w2ui-col-number').addClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-records tr').not('.w2ui-empty-record')
                .find('.w2ui-grid-data').not('.w2ui-col-select').addClass('w2ui-selected').data('selected', 'yes')
            $(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').addClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-frecords tr').not('.w2ui-empty-record')
                .find('.w2ui-grid-data').not('.w2ui-col-select').addClass('w2ui-selected').data('selected', 'yes')
            $(this.box).find('input.w2ui-grid-select-check').prop('checked', true)
        }
        // enable/disable toolbar buttons
        sel = this.getSelection(true)
        if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit')
        if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete')
        this.addRange('selection')
        $('#grid_'+ this.name +'_check_all').prop('checked', true)
        this.status()
        this.updateToolbar({ indexes: sel }, true)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    selectNone() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'unselect', target: this.name, all: true })
        if (edata.isCancelled === true) return
        // default action
        let sel = this.last.selection
        // remove selected class
        if (this.selectType == 'row') {
            $(this.box).find('.w2ui-grid-records tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected')
                .find('.w2ui-col-number').removeClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-frecords tr.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected')
                .find('.w2ui-col-number').removeClass('w2ui-row-selected')
            $(this.box).find('input.w2ui-grid-select-check').prop('checked', false)
        } else {
            $(this.box).find('.w2ui-grid-columns td .w2ui-col-header, .w2ui-grid-fcolumns td .w2ui-col-header').removeClass('w2ui-col-selected')
            $(this.box).find('.w2ui-grid-records tr .w2ui-col-number').removeClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-frecords tr .w2ui-col-number').removeClass('w2ui-row-selected')
            $(this.box).find('.w2ui-grid-data.w2ui-selected').removeClass('w2ui-selected w2ui-inactive').removeData('selected')
            $(this.box).find('input.w2ui-grid-select-check').prop('checked', false)
        }
        sel.indexes = []
        sel.columns = {}
        this.toolbar.disable('w2ui-edit', 'w2ui-delete')
        this.removeRange('selection')
        $('#grid_'+ this.name +'_check_all').prop('checked', false)
        this.status()
        this.updateToolbar(sel, false)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    updateToolbar(sel, areAllSelected) {
        let obj = this
        let cnt = sel && sel.indexes ? sel.indexes.length : 0
        this.toolbar.items.forEach((item) => {
            _checkItem(item, '')
            if (Array.isArray(item.items)) {
                item.items.forEach((it) => {
                    _checkItem(it, item.id + ':')
                })
            }
        })

        function _checkItem(item, prefix) {
            if (item.batch === 0) {
                if (cnt > 0) obj.toolbar.enable(prefix + item.id); else obj.toolbar.disable(prefix + item.id)
            }
            if (item.batch != null && !isNaN(item.batch) && item.batch > 0) {
                if (cnt == item.batch) obj.toolbar.enable(prefix + item.id); else obj.toolbar.disable(prefix + item.id)
            }
            if (typeof item.batch == 'function') {
                item.batch(obj.selectType == 'cell' ? sel : (sel ? sel.indexes : null))
            }
        }
    }

    getSelection(returnIndex) {
        let ret = []
        let sel = this.last.selection
        if (this.selectType == 'row') {
            for (let i = 0; i < sel.indexes.length; i++) {
                if (!this.records[sel.indexes[i]]) continue
                if (returnIndex === true) ret.push(sel.indexes[i]); else ret.push(this.records[sel.indexes[i]].recid)
            }
            return ret
        } else {
            for (let i = 0; i < sel.indexes.length; i++) {
                let cols = sel.columns[sel.indexes[i]]
                if (!this.records[sel.indexes[i]]) continue
                for (let j = 0; j < cols.length; j++) {
                    ret.push({ recid: this.records[sel.indexes[i]].recid, index: parseInt(sel.indexes[i]), column: cols[j] })
                }
            }
            return ret
        }
    }

    search(field, value) {
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        let searchData = []
        let last_multi = this.last.multi
        let last_logic = this.last.logic
        let last_field = this.last.field
        let last_search = this.last.search
        let hasHiddenSearches = false
        // add hidden searches
        for (let i = 0; i < this.searches.length; i++) {
            if (!this.searches[i].hidden || this.searches[i].value == null) continue
            searchData.push({
                field    : this.searches[i].field,
                operator : this.searches[i].operator || 'is',
                type     : this.searches[i].type,
                value    : this.searches[i].value || ''
            })
            hasHiddenSearches = true
        }
        // 1: search() - advanced search (reads from popup)
        if (arguments.length === 0) {
            last_search = ''
            // advanced search
            for (let i = 0; i < this.searches.length; i++) {
                let search = this.searches[i]
                let operator = $('#grid_'+ this.name + '_operator_'+ i).val()
                let field1 = $('#grid_'+ this.name + '_field_'+ i)
                let field2 = $('#grid_'+ this.name + '_field2_'+ i)
                let value1 = field1.val()
                let value2 = field2.val()
                let svalue = null
                let text = null

                if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1) {
                    let fld1 = field1.data('w2field')
                    let fld2 = field2.data('w2field')
                    if (fld1) value1 = fld1.clean(value1)
                    if (fld2) value2 = fld2.clean(value2)
                }
                if (['list', 'enum'].indexOf(search.type) != -1) {
                    value1 = field1.data('selected') || {}
                    if (Array.isArray(value1)) {
                        svalue = []
                        for (let j = 0; j < value1.length; j++) {
                            svalue.push(w2utils.isFloat(value1[j].id) ? parseFloat(value1[j].id) : String(value1[j].id).toLowerCase())
                            delete value1[j].hidden
                        }
                        if ($.isEmptyObject(value1)) value1 = ''
                    } else {
                        text = value1.text || ''
                        value1 = value1.id || ''
                    }
                }
                if ((value1 !== '' && value1 != null) || (value2 != null && value2 !== '')) {
                    let tmp = {
                        field    : search.field,
                        type     : search.type,
                        operator : operator
                    }
                    if (operator == 'between') {
                        $.extend(tmp, { value: [value1, value2] })
                    } else if (operator == 'in' && typeof value1 == 'string') {
                        $.extend(tmp, { value: value1.split(',') })
                    } else if (operator == 'not in' && typeof value1 == 'string') {
                        $.extend(tmp, { value: value1.split(',') })
                    } else {
                        $.extend(tmp, { value: value1 })
                    }
                    if (svalue) $.extend(tmp, { svalue: svalue })
                    if (text) $.extend(tmp, { text: text })

                    // conver date to unix time
                    try {
                        if (search.type == 'date' && operator == 'between') {
                            tmp.value[0] = value1 // w2utils.isDate(value1, w2utils.settings.dateFormat, true).getTime();
                            tmp.value[1] = value2 // w2utils.isDate(value2, w2utils.settings.dateFormat, true).getTime();
                        }
                        if (search.type == 'date' && operator == 'is') {
                            tmp.value = value1 // w2utils.isDate(value1, w2utils.settings.dateFormat, true).getTime();
                        }
                    } catch (e) {

                    }
                    searchData.push(tmp)
                    last_multi = true // if only hidden searches, then do not set
                }
            }
            last_logic = 'AND'
        }
        // 2: search(field, value) - regular search
        if (typeof field == 'string') {
            // if only one argument - search all
            if (arguments.length == 1) {
                value = field
                field = 'all'
            }
            last_field = field
            last_search = value
            last_multi = false
            last_logic = (hasHiddenSearches ? 'AND' : 'OR')
            // loop through all searches and see if it applies
            if (value != null) {
                if (field.toLowerCase() == 'all') {
                    // if there are search fields loop thru them
                    if (this.searches.length > 0) {
                        for (let i = 0; i < this.searches.length; i++) {
                            let search = this.searches[i]
                            if (search.type == 'text' || (search.type == 'alphanumeric' && w2utils.isAlphaNumeric(value))
                                    || (search.type == 'int' && w2utils.isInt(value)) || (search.type == 'float' && w2utils.isFloat(value))
                                    || (search.type == 'percent' && w2utils.isFloat(value)) || ((search.type == 'hex' || search.type == 'color') && w2utils.isHex(value))
                                    || (search.type == 'currency' && w2utils.isMoney(value)) || (search.type == 'money' && w2utils.isMoney(value))
                                    || (search.type == 'date' && w2utils.isDate(value)) || (search.type == 'time' && w2utils.isTime(value))
                                    || (search.type == 'datetime' && w2utils.isDateTime(value)) || (search.type == 'datetime' && w2utils.isDate(value))
                                    || (search.type == 'enum' && w2utils.isAlphaNumeric(value)) || (search.type == 'list' && w2utils.isAlphaNumeric(value))
                            ) {
                                let tmp = {
                                    field    : search.field,
                                    type     : search.type,
                                    operator : (search.operator != null ? search.operator : (search.type == 'text' ? this.textSearch : 'is')),
                                    value    : value
                                }
                                if ($.trim(value) != '') searchData.push(tmp)
                            }
                            // range in global search box
                            if (['int', 'float', 'money', 'currency', 'percent'].indexOf(search.type) != -1 && $.trim(String(value)).split('-').length == 2) {
                                let t = $.trim(String(value)).split('-')
                                let tmp = {
                                    field    : search.field,
                                    type     : search.type,
                                    operator : (search.operator != null ? search.operator : 'between'),
                                    value    : [t[0], t[1]]
                                }
                                searchData.push(tmp)
                            }
                            // lists fiels
                            if (['list', 'enum'].indexOf(search.type) != -1) {
                                let new_values = []
                                if (search.options == null) search.options = {}
                                if (!Array.isArray(search.options.items)) search.options.items = []
                                for (let j = 0; j < search.options.items; j++) {
                                    let tmp = search.options.items[j]
                                    try {
                                        let re = new RegExp(value, 'i')
                                        if (re.test(tmp)) new_values.push(j)
                                        if (tmp.text && re.test(tmp.text)) new_values.push(tmp.id)
                                    } catch (e) {}
                                }
                                if (new_values.length > 0) {
                                    let tmp = {
                                        field    : search.field,
                                        type     : search.type,
                                        operator : (search.operator != null ? search.operator : 'in'),
                                        value    : new_values
                                    }
                                    searchData.push(tmp)
                                }
                            }
                        }
                    } else {
                        // no search fields, loop thru columns
                        for (let i = 0; i < this.columns.length; i++) {
                            let tmp = {
                                field    : this.columns[i].field,
                                type     : 'text',
                                operator : this.textSearch,
                                value    : value
                            }
                            searchData.push(tmp)
                        }
                    }
                } else {
                    let el = $('#grid_'+ this.name +'_search_all')
                    let search = this.getSearch(field)
                    if (search == null) search = { field: field, type: 'text' }
                    if (search.field == field) this.last.label = search.label
                    if (value !== '') {
                        let op = this.textSearch
                        let val = value
                        if (['date', 'time', 'datetime'].indexOf(search.type) != -1) op = 'is'
                        if (['list', 'enum'].indexOf(search.type) != -1) {
                            op = 'is'
                            let tmp = el.data('selected')
                            if (tmp && !$.isEmptyObject(tmp)) val = tmp.id; else val = ''
                        }
                        if (search.type == 'int' && value !== '') {
                            op = 'is'
                            if (String(value).indexOf('-') != -1) {
                                let tmp = value.split('-')
                                if (tmp.length == 2) {
                                    op = 'between'
                                    val = [parseInt(tmp[0]), parseInt(tmp[1])]
                                }
                            }
                            if (String(value).indexOf(',') != -1) {
                                let tmp = value.split(',')
                                op = 'in'
                                val = []
                                for (let i = 0; i < tmp.length; i++) val.push(tmp[i])
                            }
                        }
                        if (search.operator != null) op = search.operator
                        let tmp = {
                            field    : search.field,
                            type     : search.type,
                            operator : op,
                            value    : val
                        }
                        searchData.push(tmp)
                    }
                }
            }
        }
        // 3: search([ { field, value, [operator,] [type] }, { field, value, [operator,] [type] } ], logic) - submit whole structure
        if (Array.isArray(field)) {
            let logic = 'AND'
            if (typeof value == 'string') {
                logic = value.toUpperCase()
                if (logic != 'OR' && logic != 'AND') logic = 'AND'
            }
            last_search = ''
            last_multi = true
            last_logic = logic
            for (let i = 0; i < field.length; i++) {
                let data = field[i]
                if (typeof data.value == 'number') data.operator = 'is'
                if (typeof data.value == 'string') data.operator = this.textSearch
                if (Array.isArray(data.value)) data.operator = 'in'
                // merge current field and search if any
                searchData.push(data)
            }
        }
        // event before
        let edata = this.trigger({
            phase: 'before', type: 'search', target: this.name, multi: (arguments.length === 0 ? true : false),
            searchField: (field ? field : 'multi'), searchValue: (field ? value : 'multi'),
            searchData: searchData, searchLogic: last_logic })
        if (edata.isCancelled === true) return
        // default action
        this.searchData = edata.searchData
        this.last.field = last_field
        this.last.search = last_search
        this.last.multi = last_multi
        this.last.logic = edata.searchLogic
        this.last.scrollTop = 0
        this.last.scrollLeft = 0
        this.last.selection.indexes = []
        this.last.selection.columns = {}
        // -- clear all search field
        this.searchClose()
        // apply search
        if (url) {
            this.last.xhr_offset = 0
            this.reload()
        } else {
            // local search
            this.localSearch()
            this.refresh()
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    searchOpen() {
        if (!this.box) return
        if (this.searches.length === 0) return
        let it = this.toolbar.get('w2ui-search-advanced')
        let btn = '#tb_'+ this.toolbar.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button'
        // event before
        let edata = this.trigger({ phase: 'before', type: 'searchOpen', target: this.name })
        if (edata.isCancelled === true) {
            setTimeout(() => { this.toolbar.uncheck('w2ui-search-advanced') }, 1)
            return
        }
        // show search
        $('#tb_'+ this.name +'_toolbar_item_w2ui-search-advanced').w2overlay({
            html    : this.getSearchesHTML(),
            name    : this.name + '-searchOverlay',
            left    : -10,
            'class' : 'w2ui-grid-searches',
            onShow() {
                this.initSearches()
                $('#w2ui-overlay-'+ this.name +'-searchOverlay .w2ui-grid-searches').data('grid-name', this.name)
                let sfields = $('#w2ui-overlay-'+ this.name +'-searchOverlay .w2ui-grid-searches *[rel=search]')
                if (sfields.length > 0) sfields[0].focus()
                if (!it.checked) {
                    it.checked = true
                    $(btn).addClass('checked')
                }
                // event after
                this.trigger($.extend(edata, { phase: 'after' }))
            },
            onHide() {
                it.checked = false
                $(btn).removeClass('checked')
            }
        })
    }

    searchClose() {
        if (!this.box) return
        if (this.searches.length === 0) return
        if (this.toolbar) this.toolbar.uncheck('w2ui-search-advanced', 'w2ui-column-on-off')
        // hide search
        $().w2overlay({ name: this.name + '-searchOverlay' })
    }

    searchReset(noRefresh) {
        let searchData = []
        let hasHiddenSearches = false
        // add hidden searches
        for (let i = 0; i < this.searches.length; i++) {
            if (!this.searches[i].hidden || this.searches[i].value == null) continue
            searchData.push({
                field    : this.searches[i].field,
                operator : this.searches[i].operator || 'is',
                type     : this.searches[i].type,
                value    : this.searches[i].value || ''
            })
            hasHiddenSearches = true
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'search', reset: true, target: this.name, searchData: searchData })
        if (edata.isCancelled === true) return
        // default action
        this.searchData = edata.searchData
        this.last.search = ''
        this.last.logic = (hasHiddenSearches ? 'AND' : 'OR')
        // --- do not reset to All Fields (I think)
        if (this.searches.length > 0) {
            if (!this.multiSearch || !this.show.searchAll) {
                let tmp = 0
                while (tmp < this.searches.length && (this.searches[tmp].hidden || this.searches[tmp].simple === false)) tmp++
                if (tmp >= this.searches.length) {
                    // all searches are hidden
                    this.last.field = ''
                    this.last.label = ''
                } else {
                    this.last.field = this.searches[tmp].field
                    this.last.label = this.searches[tmp].label
                }
            } else {
                this.last.field = 'all'
                this.last.label = w2utils.lang('All Fields')
            }
        }
        this.last.multi = false
        this.last.xhr_offset = 0
        // reset scrolling position
        this.last.scrollTop = 0
        this.last.scrollLeft = 0
        this.last.selection.indexes = []
        this.last.selection.columns = {}
        // -- clear all search field
        this.searchClose()
        $('#grid_'+ this.name +'_search_all').val('').removeData('selected')
        // apply search
        if (!noRefresh) this.reload()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    searchShowFields(forceHide) {
        let el = $('#grid_'+ this.name +'_search_all')
        if (forceHide === true) {
            $(el).w2overlay({ name: this.name + '-searchFields' })
            return
        }
        let html = '<div class="w2ui-select-field"><table><tbody>'
        for (let s = -1; s < this.searches.length; s++) {
            let search = this.searches[s]
            let sField = (search ? search.field : null)
            let column = this.getColumn(sField)
            let disable = false
            let msg = 'This column is hidden'
            if (this.show.searchHiddenMsg == true && s != -1 && (column == null || (column.hidden === true && column.hideable !== false))) {
                disable = true
                if (column == null) {
                    msg = 'This column does not exist'
                }
            }
            if (s == -1) { // -1 is All Fields search
                if (!this.multiSearch || !this.show.searchAll) continue
                search = { field: 'all', label: w2utils.lang('All Fields') }
            } else {
                if (column != null && column.hideable === false) continue
                // don't show hidden searches
                if (this.searches[s].hidden === true || this.searches[s].simple === false) continue
            }
            if (search.label == null && search.caption != null) {
                console.log('NOTICE: grid search.caption property is deprecated, please use search.label. Search ->', search)
                search.label = search.caption
            }

            html += '<tr style="'+ (disable ? 'color: silver' : '') +'" '
                    + (disable
                        ? 'onmouseenter="jQuery(this).w2tag({ top: 4, html: \''+ msg +'\' })" onmouseleave="jQuery(this).w2tag()"'
                        : ''
                    ) +
                    (w2utils.isIOS ? 'onTouchStart' : 'onClick') +'="event.stopPropagation(); '+
                    '           w2ui[\''+ this.name +'\'].initAllField(\''+ search.field +'\');'+
                    '           jQuery(\'#grid_'+ this.name +'_search_all\').w2overlay({ name: \''+ this.name +'-searchFields\' });"'+
                    '           jQuery(this).addClass(\'w2ui-selected\');'+
                    '      onmousedown="jQuery(this).parent().find(\'tr\').removeClass(\'w2ui-selected\'); jQuery(this).addClass(\'w2ui-selected\')" ' +
                    '      onmouseup="jQuery(this).removeClass(\'w2ui-selected\')" ' +
                    '   >'+
                    '   <td>'+
                    '       <span class="w2ui-column-check w2ui-icon-'+ (search.field == this.last.field ? 'check' : 'empty') +'"></span>'+
                    '   </td>'+
                    '   <td>'+ search.label +'</td>'+
                    '</tr>'
        }
        html += '</tbody></table></div>'

        let overName = this.name + '-searchFields'
        if ($('#w2ui-overlay-'+ overName).length == 1) html = '' // hide if visible
        // need timer otherwise does nto show with list type
        setTimeout(() => {
            $(el).w2overlay({ html: html, name: overName, left: -10 })
        }, 1)
    }

    initAllField(field, value) {
        let search
        let el = $('#grid_'+ this.name +'_search_all')
        if (field == 'all') {
            search = { field: 'all', label: w2utils.lang('All Fields') }
            el.w2field('clear')
            // el.change(); // triggering change will cause grid calling remote url twice
        } else {
            search = this.getSearch(field)
            if (search == null) return
            let st = search.type
            if (['enum', 'select'].indexOf(st) != -1) st = 'list'
            el.w2field(st, $.extend({}, search.options, { suffix: '', autoFormat: false, selected: value }))
            if (['list', 'enum', 'date', 'time', 'datetime'].indexOf(search.type) != -1) {
                this.last.search = ''
                this.last.item = ''
                el.val('')
                $('#grid_'+ this.name +'_searchClear').hide()
            }
        }
        // update field
        if (this.last.search != '') {
            this.last.label = search.label
            this.search(search.field, this.last.search)
        } else {
            this.last.field = search.field
            this.last.label = search.label
        }
        el.attr('placeholder', w2utils.lang(search.label || search.caption || search.field))
        $().w2overlay({ name: this.name + '-searchFields' })
    }

    // clears records and related params
    clear(noRefresh) {
        this.total = 0
        this.records = []
        this.summary = []
        this.last.xhr_offset = 0 // need this for reload button to work on remote data set
        this.last.idCache = {} // optimization to free memory
        this.reset(true)
        // refresh
        if (!noRefresh) this.refresh()
    }

    // clears scroll position, selection, ranges
    reset(noRefresh) {
        // position
        this.last.scrollTop = 0
        this.last.scrollLeft = 0
        this.last.selection = { indexes: [], columns: {} }
        this.last.range_start = null
        this.last.range_end = null
        // additional
        $('#grid_'+ this.name +'_records').prop('scrollTop', 0)
        // refresh
        if (!noRefresh) this.refresh()
    }

    skip(offset, callBack) {
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (url) {
            this.offset = parseInt(offset)
            if (this.offset > this.total) this.offset = this.total - this.limit
            if (this.offset < 0 || !w2utils.isInt(this.offset)) this.offset = 0
            this.clear(true)
            this.reload(callBack)
        } else {
            console.log('ERROR: grid.skip() can only be called when you have remote data source.')
        }
    }

    load(url, callBack) {
        if (url == null) {
            console.log('ERROR: You need to provide url argument when calling .load() method of "'+ this.name +'" object.')
            return
        }
        // default action
        this.clear(true)
        this.request('get', {}, url, callBack)
    }

    reload(callBack) {
        let grid = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        grid.selectionSave()
        if (url) {
            // need to remember selection (not just last.selection object)
            this.load(url, () => {
                grid.selectionRestore()
                if (typeof callBack == 'function') callBack()
            })
        } else {
            this.reset(true)
            this.localSearch()
            this.selectionRestore()
            if (typeof callBack == 'function') callBack({ status: 'success' })
        }
    }

    request(cmd, add_params, url, callBack) {
        if (add_params == null) add_params = {}
        if (url == '' || url == null) url = this.url
        if (url == '' || url == null) return
        // build parameters list
        if (!w2utils.isInt(this.offset)) this.offset = 0
        if (!w2utils.isInt(this.last.xhr_offset)) this.last.xhr_offset = 0
        // add list params
        let edata
        let params = {
            limit       : this.limit,
            offset      : parseInt(this.offset) + parseInt(this.last.xhr_offset),
            searchLogic : this.last.logic,
            search: this.searchData.map((search) => {
                let _search = $.extend({}, search)
                if (this.searchMap && this.searchMap[_search.field]) _search.field = this.searchMap[_search.field]
                return _search
            }),
            sort: this.sortData.map((sort) => {
                let _sort = $.extend({}, sort)
                if (this.sortMap && this.sortMap[_sort.field]) _sort.field = this.sortMap[_sort.field]
                return _sort
            })
        }
        if (this.searchData.length === 0) {
            delete params.search
            delete params.searchLogic
        }
        if (this.sortData.length === 0) {
            delete params.sort
        }
        // append other params
        $.extend(params, this.postData)
        $.extend(params, add_params)
        // other actions
        if (cmd == 'delete' || cmd == 'save') {
            delete params.limit
            delete params.offset
            params.action = cmd
            if (cmd == 'delete') {
                params[this.recid || 'recid'] = this.getSelection()
            }
        }
        // event before
        if (cmd == 'get') {
            edata = this.trigger({ phase: 'before', type: 'request', target: this.name, url: url, postData: params, httpHeaders: this.httpHeaders })
            if (edata.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return }
        } else {
            edata = { url: url, postData: params, httpHeaders: this.httpHeaders }
        }
        // call server to get data
        if (this.last.xhr_offset === 0) {
            this.lock(w2utils.lang(this.msgRefresh), true)
        }
        if (this.last.xhr) try { this.last.xhr.abort() } catch (e) {}
        // URL
        url = (typeof edata.url != 'object' ? edata.url : edata.url.get)
        if (cmd == 'save' && typeof edata.url == 'object') url = edata.url.save
        if (cmd == 'delete' && typeof edata.url == 'object') url = edata.url.remove
        // process url with routeData
        if (!$.isEmptyObject(this.routeData)) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (this.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                }
            }
        }
        // ajax options
        let ajaxOptions = {
            type     : 'GET',
            url      : url,
            data     : edata.postData,
            headers  : edata.httpHeaders,
            dataType : 'json' // expected data type from server
        }

        let dataType = this.dataType || w2utils.settings.dataType
        switch (dataType) {
            case 'HTTP':
                ajaxOptions.data = (typeof ajaxOptions.data == 'object' ? String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']') : ajaxOptions.data)
                break
            case 'HTTPJSON':
                ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                break
            case 'RESTFULL':
                ajaxOptions.type = 'GET'
                if (cmd == 'save') ajaxOptions.type = 'PUT' // so far it is always update
                if (cmd == 'delete') ajaxOptions.type = 'DELETE'
                ajaxOptions.data = (typeof ajaxOptions.data == 'object' ? String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']') : ajaxOptions.data)
                break
            case 'RESTFULLJSON':
                ajaxOptions.type = 'GET'
                if (cmd == 'save') ajaxOptions.type = 'PUT' // so far it is always update
                if (cmd == 'delete') ajaxOptions.type = 'DELETE'
                ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                ajaxOptions.contentType = 'application/json'
                break
            case 'JSON':
                ajaxOptions.type = 'POST'
                ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                ajaxOptions.contentType = 'application/json'
                break
        }
        if (this.method) ajaxOptions.type = this.method

        this.last.xhr_cmd = cmd
        this.last.xhr_start = (new Date()).getTime()
        this.last.loaded = false
        this.last.xhr = $.ajax(ajaxOptions)
            .done((data, status, xhr) => {
                this.requestComplete(status, xhr, cmd, callBack)
            })
            .fail((xhr, status, error) => {
                // trigger event
                let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                let edata2 = this.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr })
                if (edata2.isCancelled === true) return
                // default behavior
                if (status != 'abort') { // it can be aborted by the grid itself
                    let data
                    try { data = typeof xhr.responseJSON === 'object' ? xhr.responseJSON : $.parseJSON(xhr.responseText) } catch (e) {}
                    console.log('ERROR: Server communication failed.',
                        '\n   EXPECTED:', { status: 'success', total: 5, records: [{ recid: 1, field: 'value' }] },
                        '\n         OR:', { status: 'error', message: 'error message' },
                        '\n   RECEIVED:', typeof data == 'object' ? data : xhr.responseText)
                    this.requestComplete('error', xhr, cmd, callBack)
                }
                // event after
                this.trigger($.extend(edata2, { phase: 'after' }))
            })
        if (cmd == 'get') {
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    requestComplete(status, xhr, cmd, callBack) {
        this.unlock()
        this.last.xhr_response = ((new Date()).getTime() - this.last.xhr_start)/1000
        setTimeout(() => {
            if (this.show.statusResponse) {
                this.status(w2utils.lang('Server Response XX sec').replace('XX', this.last.xhr_response))
            }
        }, 10)
        this.last.pull_more = false
        this.last.pull_refresh = true

        // event before
        let event_name = 'load'
        if (this.last.xhr_cmd == 'save') event_name = 'save'
        if (this.last.xhr_cmd == 'delete') event_name = 'delete'
        let edata = this.trigger({ phase: 'before', target: this.name, type: event_name, xhr: xhr, status: status })
        if (edata.isCancelled === true) {
            if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' })
            return
        }
        // parse server response
        let data
        if (status != 'error') {
            // default action
            if (typeof this.parser == 'function') {
                data = this.parser(xhr.responseJSON)
                if (typeof data != 'object') {
                    console.log('ERROR: Your parser did not return proper object')
                }
            } else {
                data = xhr.responseJSON
                if (data == null) {
                    data = {
                        status       : 'error',
                        message      : w2utils.lang(this.msgNotJSON),
                        responseText : xhr.responseText
                    }
                } else if (Array.isArray(data)) {
                    // if it is plain array, assume these are records
                    data = {
                        status  : 'success',
                        records : data,
                        total   : data.length
                    }
                }
            }
            if (Array.isArray(data.records)) {
                // make sure each record has recid
                data.records.forEach((rec, ind) => {
                    if (this.recid) {
                        rec.recid = this.parseField(rec, this.recid)
                    }
                    if (rec.recid == null) {
                        rec.recid = 'recid-' + ind
                    }
                })
            }
            if (data.status == 'error') {
                this.error(data.message)
            } else {
                if (cmd == 'get') {
                    if (data.total == null) data.total = -1
                    if (data.records == null) {
                        data.records = []
                    }
                    if (data.records.length == this.limit) {
                        let loaded = this.records.length + data.records.length
                        this.last.xhr_hasMore = (loaded == this.total ? false : true)
                    } else {
                        this.last.xhr_hasMore = false
                        this.total = this.offset + this.last.xhr_offset + data.records.length
                    }
                    if (!this.last.xhr_hasMore) {
                        // if no morerecords, then hide spinner
                        $('#grid_'+ this.name +'_rec_more, #grid_'+ this.name +'_frec_more').hide()
                    }
                    if (this.last.xhr_offset === 0) {
                        this.records = []
                        this.summary = []
                        if (w2utils.isInt(data.total)) this.total = parseInt(data.total)
                    } else {
                        if (data.total != -1 && parseInt(data.total) != parseInt(this.total)) {
                            this.message(w2utils.lang(this.msgNeedReload), () => {
                                delete this.last.xhr_offset
                                this.reload()
                            })
                            return
                        }
                    }
                    // records
                    if (data.records) {
                        for (let r = 0; r < data.records.length; r++) {
                            this.records.push(data.records[r])
                        }
                    }
                    // summary records (if any)
                    if (data.summary) {
                        this.summary = []
                        for (let r = 0; r < data.summary.length; r++) {
                            this.summary.push(data.summary[r])
                        }
                    }
                }
                if (cmd == 'delete') {
                    this.reset() // unselect old selections
                    this.reload()
                    return
                }
            }
        } else {
            data = {
                status       : 'error',
                message      : w2utils.lang(this.msgAJAXerror),
                responseText : xhr.responseText
            }
            this.error(w2utils.lang(this.msgAJAXerror))
        }
        // event after
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!url) {
            this.localSort()
            this.localSearch()
        }
        this.total = parseInt(this.total)
        // do not refresh if loading on infinite scroll
        if (this.last.xhr_offset === 0) {
            this.refresh()
        } else {
            this.scroll()
            this.resize()
        }
        // call back
        if (typeof callBack == 'function') callBack(data) // need to be befor event:after
        // after event
        this.trigger($.extend(edata, { phase: 'after' }))
        this.last.loaded = true
    }

    error(msg) {
        // let the management of the error outside of the grid
        let edata = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr })
        if (edata.isCancelled === true) {
            if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' })
            return
        }
        this.message(msg)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    getChanges(recordsBase) {
        let changes = []
        if (typeof recordsBase == 'undefined') {
            recordsBase = this.records
        }

        for (let r = 0; r < recordsBase.length; r++) {
            let rec = recordsBase[r]
            if (rec.w2ui) {
                if (rec.w2ui.changes != null) {
                    let obj = {}
                    obj[this.recid || 'recid'] = rec.recid
                    changes.push($.extend(true, obj, rec.w2ui.changes))
                }

                // recursively look for changes in non-expanded children
                if (rec.w2ui.expanded !== true && rec.w2ui.children && rec.w2ui.children.length) {
                    $.merge(changes, this.getChanges(rec.w2ui.children))
                }
            }
        }
        return changes
    }

    mergeChanges() {
        let changes = this.getChanges()
        for (let c = 0; c < changes.length; c++) {
            let record = this.get(changes[c].recid)
            for (let s in changes[c]) {
                if (s == 'recid') continue // do not allow to change recid
                if (typeof changes[c][s] === 'object') changes[c][s] = changes[c][s].text
                try {
                    _setValue(record, s, changes[c][s])
                } catch (e) {
                    console.log('ERROR: Cannot merge. ', e.message || '', e)
                }
                if (record.w2ui) delete record.w2ui.changes
            }
        }
        this.refresh()

        function _setValue(obj, field, value) {
            let fld = field.split('.')
            if (fld.length == 1) {
                obj[field] = value
            } else {
                obj = obj[fld[0]]
                fld.shift()
                _setValue(obj, fld.join('.'), value)
            }
        }
    }

    // ===================================================
    // --  Action Handlers

    save(callBack) {
        let changes = this.getChanges()
        let url = (typeof this.url != 'object' ? this.url : this.url.save)
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'save', changes: changes })
        if (edata.isCancelled === true) {
            if (url && typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' })
            return
        }
        if (url) {
            this.request('save', { 'changes' : edata.changes }, null,
                (data) => {
                    if (data.status !== 'error') {
                        // only merge changes, if save was successful
                        this.mergeChanges()
                    }
                    // event after
                    this.trigger($.extend(edata, { phase: 'after' }))
                    // call back
                    if (typeof callBack == 'function') callBack(data)
                }
            )
        } else {
            this.mergeChanges()
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }

    editField(recid, column, value, event) {
        let obj = this, index
        if (this.last.inEditMode === true) { // already editing
            if (event.keyCode == 13) {
                index = this.last._edit.index
                column = this.last._edit.column
                recid = this.last._edit.recid
                this.editChange({ type: 'custom', value: this.last._edit.value }, this.get(recid, true), column, event)
                let next = event.shiftKey ? this.prevRow(index, column) : this.nextRow(index, column)
                if (next != null && next != index) {
                    setTimeout(() => {
                        if (this.selectType != 'row') {
                            this.selectNone()
                            this.select({ recid: this.records[next].recid, column: column })
                        } else {
                            this.editField(this.records[next].recid, column, null, event)
                        }
                    }, 1)
                }
                this.last.inEditMode = false
            } else {
                // when 2 chars entered fast
                let $input = $(this.box).find('div.w2ui-edit-box .w2ui-input')
                if ($input.length > 0 && $input[0].tagName == 'DIV') {
                    $input.text($input.text() + value)
                    w2utils.setCursorPosition($input[0], $input.text().length)
                }
            }
            return
        }
        index = this.get(recid, true)
        let edit = this.getCellEditable(index, column)
        if (!edit) return
        let rec = this.records[index]
        let col = this.columns[column]
        let prefix = (col.frozen === true ? '_f' : '_')
        if (['enum', 'file'].indexOf(edit.type) != -1) {
            console.log('ERROR: input types "enum" and "file" are not supported in inline editing.')
            return
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'editField', target: this.name, recid: recid, column: column, value: value,
            index: index, originalEvent: event })
        if (edata.isCancelled === true) return
        value = edata.value
        // default behaviour
        this.last.inEditMode = true
        this.last._edit = { value: value, index: index, column: column, recid: recid }
        this.selectNone()
        this.select({ recid: recid, column: column })
        if (['checkbox', 'check'].indexOf(edit.type) != -1) return
        // create input element
        let tr = $('#grid_'+ this.name + prefix +'rec_' + w2utils.escapeId(recid))
        let el = tr.find('[col='+ column +'] > div')
        // clear previous if any
        $(this.box).find('div.w2ui-edit-box').remove()
        // for spreadsheet - insert into selection
        if (this.selectType != 'row') {
            $('#grid_'+ this.name + prefix + 'selection')
                .attr('id', 'grid_'+ this.name + '_editable')
                .removeClass('w2ui-selection')
                .addClass('w2ui-edit-box')
                .prepend('<div style="position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px;"></div>')
                .find('.w2ui-selection-resizer')
                .remove()
            el = $('#grid_'+ this.name + '_editable >div:first-child')
        }
        if (edit.inTag == null) edit.inTag = ''
        if (edit.outTag == null) edit.outTag = ''
        if (edit.style == null) edit.style = ''
        if (edit.items == null) edit.items = []
        let val = (rec.w2ui && rec.w2ui.changes && rec.w2ui.changes[col.field] != null ? w2utils.stripTags(rec.w2ui.changes[col.field]) : w2utils.stripTags(rec[col.field]))
        if (val == null) val = ''
        let old_value = (typeof val != 'object' ? val : '')
        if (edata.old_value != null) old_value = edata.old_value
        if (value != null) val = value
        let addStyle = (col.style != null ? col.style + ';' : '')
        if (typeof col.render == 'string' && ['number', 'int', 'float', 'money', 'percent', 'size'].indexOf(col.render.split(':')[0]) != -1) {
            addStyle += 'text-align: right;'
        }
        // normalize items
        if (edit.items.length > 0 && !$.isPlainObject(edit.items[0])) {
            edit.items = w2utils.normMenu(edit.items)
        }
        switch (edit.type) {

            case 'select': {
                let html = ''
                for (let i = 0; i < edit.items.length; i++) {
                    html += '<option value="'+ edit.items[i].id +'"'+ (edit.items[i].id == val ? ' selected="selected"' : '') +'>'+ edit.items[i].text +'</option>'
                }
                el.addClass('w2ui-editable')
                    .html('<select id="grid_'+ this.name +'_edit_'+ recid +'_'+ column +'" column="'+ column +'" class="w2ui-input"'+
                        '    style="width: 100%; pointer-events: auto; padding: 0 0 0 3px; margin: 0px; border-left: 0; border-right: 0; border-radius: 0px; '+
                        '           outline: none; font-family: inherit;'+ addStyle + edit.style +'" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" '+
                        '    '+ edit.inTag +
                        '>'+ html +'</select>' + edit.outTag)
                setTimeout(() => {
                    el.find('select')
                        .on('change', function(event) {
                            delete obj.last.move
                        })
                        .on('blur', function(event) {
                            if ($(this).data('keep-open') == true) return
                            obj.editChange.call(obj, this, index, column, event)
                        })
                }, 10)
                break
            }
            case 'div': {
                let $tmp = tr.find('[col='+ column +'] > div')
                let font = 'font-family: '+ $tmp.css('font-family') + '; font-size: '+ $tmp.css('font-size') + ';'
                el.addClass('w2ui-editable')
                    .html('<div id="grid_'+ this.name +'_edit_'+ recid +'_'+ column +'" class="w2ui-input"'+
                        '    contenteditable style="'+ font + addStyle + edit.style +'" autocorrect="off" autocomplete="off" spellcheck="false" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" column="'+ column +'" '+ edit.inTag +
                        '></div>' + edit.outTag)
                if (value == null) el.find('div.w2ui-input').text(typeof val != 'object' ? val : '')
                // add blur listener
                let input = el.find('div.w2ui-input').get(0)
                setTimeout(() => {
                    let tmp = input
                    $(tmp).on('blur', function(event) {
                        if ($(this).data('keep-open') == true) return
                        obj.editChange.call(obj, tmp, index, column, event)
                    })
                }, 10)
                if (value != null) $(input).text(typeof val != 'object' ? val : '')
                break
            }
            default: {
                let $tmp = tr.find('[col='+ column +'] > div')
                let font = 'font-family: '+ $tmp.css('font-family') + '; font-size: '+ $tmp.css('font-size')
                el.addClass('w2ui-editable')
                    .html('<input id="grid_'+ this.name +'_edit_'+ recid +'_'+ column +'" autocorrect="off" autocomplete="off" spellcheck="false" type="text" '+
                        '    style="'+ font +'; width: 100%; height: 100%; padding: 3px; border-color: transparent; outline: none; border-radius: 0; '+
                        '       pointer-events: auto; '+ addStyle + edit.style +'" '+
                        '    field="'+ col.field +'" recid="'+ recid +'" column="'+ column +'" class="w2ui-input"'+ edit.inTag +
                        '/>' + edit.outTag)
                // issue #499
                if (edit.type == 'number') {
                    val = w2utils.formatNumber(val)
                }
                if (edit.type == 'date') {
                    val = w2utils.formatDate(w2utils.isDate(val, edit.format, true) || new Date(), edit.format)
                }
                if (value == null) el.find('input').val(typeof val != 'object' ? val : '')
                // init w2field
                let input = el.find('input').get(0)
                $(input).w2field(edit.type, $.extend(edit, { selected: val }))
                // add blur listener
                setTimeout(() => {
                    let tmp = input
                    if (edit.type == 'list') {
                        tmp = $($(input).data('w2field').helpers.focus).find('input')
                        if (typeof val != 'object' && val != '') tmp.val(val).css({ opacity: 1 }).prev().css({ opacity: 1 })
                        el.find('input').on('change', function(event) {
                            obj.editChange.call(obj, input, index, column, event)
                        })
                    }
                    $(tmp).on('blur', function(event) {
                        if ($(this).data('keep-open') == true) return
                        obj.editChange.call(obj, input, index, column, event)
                    })
                }, 10)
                if (value != null) $(input).val(typeof val != 'object' ? val : '')
            }
        }

        setTimeout(() => {
            if (!this.last.inEditMode) return
            el.find('input, select, div.w2ui-input')
                .data('old_value', old_value)
                .on('mousedown', function(event) {
                    event.stopPropagation()
                })
                .on('click', function(event) {
                    if (edit.type == 'div') {
                        expand.call(el.find('div.w2ui-input')[0], null)
                    } else {
                        expand.call(el.find('input, select')[0], null)
                    }
                })
                .on('paste', function(event) {
                    // clean paste to be plain text
                    let e = event.originalEvent
                    event.preventDefault()
                    let text = e.clipboardData.getData('text/plain')
                    document.execCommand('insertHTML', false, text)
                })
                .on('keydown', function(event) {
                    let el = this
                    let val = (el.tagName.toUpperCase() == 'DIV' ? $(el).text() : $(el).val())
                    switch (event.keyCode) {
                        case 8: // backspace;
                            if (edit.type == 'list' && !$(input).data('w2field')) { // cancel backspace when deleting element
                                event.preventDefault()
                            }
                            break
                        case 9:
                        case 13:
                            event.preventDefault()
                            break
                        case 37:
                            if (w2utils.getCursorPosition(el) === 0) {
                                event.preventDefault()
                            }
                            break
                        case 39:
                            if (w2utils.getCursorPosition(el) == val.length) {
                                w2utils.setCursorPosition(el, val.length)
                                event.preventDefault()
                            }
                            break
                    }
                    // need timeout so, this handler is executed last
                    setTimeout(() => {
                        switch (event.keyCode) {
                            case 9: { // tab
                                let next_rec = recid
                                let next_col = event.shiftKey ? obj.prevCell(index, column, true) : obj.nextCell(index, column, true)
                                // next or prev row
                                if (next_col == null) {
                                    let tmp = event.shiftKey ? obj.prevRow(index, column) : obj.nextRow(index, column)
                                    if (tmp != null && tmp != index) {
                                        next_rec = obj.records[tmp].recid
                                        // find first editable row
                                        for (let c = 0; c < obj.columns.length; c++) {
                                            let edit = obj.getCellEditable(index, c)
                                            if (edit != null && ['checkbox', 'check'].indexOf(edit.type) == -1) {
                                                next_col = parseInt(c)
                                                if (!event.shiftKey) break
                                            }
                                        }
                                    }

                                }
                                if (next_rec === false) next_rec = recid
                                if (next_col == null) next_col = column
                                // init new or same record
                                el.blur()
                                setTimeout(() => {
                                    if (obj.selectType != 'row') {
                                        obj.selectNone()
                                        obj.select({ recid: next_rec, column: next_col })
                                    } else {
                                        obj.editField(next_rec, next_col, null, event)
                                    }
                                }, 1)
                                if (event.preventDefault) event.preventDefault()
                                break
                            }
                            case 13: { // enter
                                el.blur()
                                let next = event.shiftKey ? obj.prevRow(index, column) : obj.nextRow(index, column)
                                if (next != null && next != index) {
                                    setTimeout(() => {
                                        if (obj.selectType != 'row') {
                                            obj.selectNone()
                                            obj.select({ recid: obj.records[next].recid, column: column })
                                        } else {
                                            obj.editField(obj.records[next].recid, column, null, event)
                                        }
                                    }, 1)
                                }
                                if (el.tagName.toUpperCase() == 'DIV') {
                                    event.preventDefault()
                                }
                                break
                            }

                            case 27: { // escape
                                let old = obj.parseField(rec, col.field)
                                if (rec.w2ui && rec.w2ui.changes && rec.w2ui.changes[col.field] != null) old = rec.w2ui.changes[col.field]
                                if ($(el).data('old_value') != null) old = $(el).data('old_value')
                                if (el.tagName.toUpperCase() == 'DIV') {
                                    $(el).text(old != null ? old : '')
                                } else {
                                    el.value = old != null ? old : ''
                                }
                                el.blur()
                                setTimeout(() => { obj.select({ recid: recid, column: column }) }, 1)
                                break
                            }
                        }
                        // if input too small - expand
                        expand.call(el, event)
                    }, 1)
                })
                .on('keyup', function(event) {
                    expand.call(this, event)
                })
            // focus and select
            setTimeout(() => {
                if (!this.last.inEditMode) return
                let tmp = el.find('.w2ui-input')
                let len = ($(tmp).val() != null ? $(tmp).val().length : 0)
                if (edit.type == 'div') len = $(tmp).text().length
                if (tmp.length > 0) {
                    tmp.focus()
                    clearTimeout(this.last.kbd_timer) // keep focus
                    if (tmp[0].tagName.toUpperCase() != 'SELECT') w2utils.setCursorPosition(tmp[0], len)
                    tmp[0].resize = expand
                    expand.call(tmp[0], null)
                }
            }, 50)
            // event after
            this.trigger($.extend(edata, { phase: 'after', input: el.find('input, select, div.w2ui-input') }))
        }, 5) // needs to be 5-10
        return

        function expand(event) {
            try {
                let val = (this.tagName.toUpperCase() == 'DIV' ? $(this).text() : this.value)
                let $sel = $('#grid_'+ obj.name + '_editable')
                let style = 'font-family: '+ $(this).css('font-family') + '; font-size: '+ $(this).css('font-size') + '; white-space: pre;'
                let width = w2utils.getStrWidth(val, style)
                if (width + 20 > $sel.width()) {
                    $sel.width(width + 20)
                }
            } catch (e) {
            }
        }
    }

    editChange(el, index, column, event) {
        // keep focus
        setTimeout(() => {
            let $input = $(this.box).find('#grid_'+ this.name + '_focus')
            if (!$input.is(':focus')) $input.focus()
        }, 10)
        // all other fields
        let summary = index < 0
        index = index < 0 ? -index - 1 : index
        let records = summary ? this.summary : this.records
        let rec = records[index]
        let col = this.columns[column]
        let tr = $('#grid_'+ this.name + (col.frozen === true ? '_frec_' : '_rec_') + w2utils.escapeId(rec.recid))
        let new_val = (el.tagName && el.tagName.toUpperCase() == 'DIV' ? $(el).text() : el.value)
        let old_val = this.parseField(rec, col.field)
        let tmp = $(el).data('w2field')
        if (tmp) {
            if (tmp.type == 'list') new_val = $(el).data('selected')
            if ($.isEmptyObject(new_val) || new_val == null) new_val = ''
            if (!$.isPlainObject(new_val)) new_val = tmp.clean(new_val)
        }
        if (el.type == 'checkbox') {
            if (rec.w2ui && rec.w2ui.editable === false) el.checked = !el.checked
            new_val = el.checked
        }
        // change/restore event
        let edata = {
            phase: 'before', type: 'change', target: this.name, input_id: el.id, recid: rec.recid, index: index, column: column,
            originalEvent: (event.originalEvent ? event.originalEvent : event),
            value_new: new_val,
            value_previous: (rec.w2ui && rec.w2ui.changes && rec.w2ui.changes.hasOwnProperty(col.field) ? rec.w2ui.changes[col.field]: old_val),
            value_original: old_val
        }
        if ($(event.target).data('old_value') != null) edata.value_previous = $(event.target).data('old_value')
        // if (old_val == null) old_val = ''; -- do not uncomment, error otherwise
        while (true) {
            new_val = edata.value_new
            if ((typeof new_val != 'object' && String(old_val) != String(new_val)) ||
                (typeof new_val == 'object' && new_val && new_val.id != old_val && (typeof old_val != 'object' || old_val == null || new_val.id != old_val.id))) {
                // change event
                edata = this.trigger($.extend(edata, { type: 'change', phase: 'before' }))
                if (edata.isCancelled !== true) {
                    if (new_val !== edata.value_new) {
                        // re-evaluate the type of change to be made
                        continue
                    }
                    // default action
                    rec.w2ui = rec.w2ui || {}
                    rec.w2ui.changes = rec.w2ui.changes || {}
                    rec.w2ui.changes[col.field] = edata.value_new
                    // event after
                    this.trigger($.extend(edata, { phase: 'after' }))
                }
            } else {
                // restore event
                edata = this.trigger($.extend(edata, { type: 'restore', phase: 'before' }))
                if (edata.isCancelled !== true) {
                    if (new_val !== edata.value_new) {
                        // re-evaluate the type of change to be made
                        continue
                    }
                    // default action
                    if (rec.w2ui && rec.w2ui.changes) delete rec.w2ui.changes[col.field]
                    if (rec.w2ui && $.isEmptyObject(rec.w2ui.changes)) delete rec.w2ui.changes
                    // event after
                    this.trigger($.extend(edata, { phase: 'after' }))
                }
            }
            break
        }
        // refresh cell
        let cell = $(tr).find('[col='+ column +']')
        if (!summary) {
            if (rec.w2ui && rec.w2ui.changes && rec.w2ui.changes[col.field] != null) {
                cell.addClass('w2ui-changed')
            } else {
                cell.removeClass('w2ui-changed')
            }
            // update cell data
            cell.replaceWith(this.getCellHTML(index, column, summary))
        }
        // remove
        $(this.box).find('div.w2ui-edit-box').remove()
        // enable/disable toolbar search button
        if (this.show.toolbarSave) {
            if (this.getChanges().length > 0) this.toolbar.enable('w2ui-save'); else this.toolbar.disable('w2ui-save')
        }
        this.last.inEditMode = false
    }

    'delete'(force) {
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'delete', force: force })
        if (force) this.message() // close message
        if (edata.isCancelled === true) return
        force = edata.force
        // hide all tooltips
        setTimeout(() => { $().w2tag() }, 20)
        // default action
        let recs = this.getSelection()
        if (recs.length === 0) return
        if (this.msgDelete != '' && !force) {
            this.message({
                width   : 380,
                height  : 170,
                body    : '<div class="w2ui-centered">' +
                                w2utils.lang(this.msgDelete).replace('XX', recs.length).replace('records', (recs.length == 1 ? 'record' : 'records')) +
                          '</div>',
                buttons : (w2utils.settings.macButtonOrder
                    ? '<button type="button" class="w2ui-btn btn-default" onclick="w2ui[\''+ this.name +'\'].message()">' + w2utils.lang('Cancel') + '</button>' +
                      '<button type="button" class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].delete(true)">' + w2utils.lang(this.msgDeleteBtn) + '</button>'
                    : '<button type="button" class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].delete(true)">' + w2utils.lang(this.msgDeleteBtn) + '</button>' +
                      '<button type="button" class="w2ui-btn btn-default" onclick="w2ui[\''+ this.name +'\'].message()">' + w2utils.lang('Cancel') + '</button>'
                ),
                onOpen(event) {
                    let inputs = $(this.box).find('input, textarea, select, button')
                    inputs.off('.message')
                        .on('blur.message', function(evt) {
                            // last input
                            if (inputs.index(evt.target) + 1 === inputs.length) {
                                inputs.get(0).focus()
                                evt.preventDefault()
                            }
                        })
                        .on('keydown.message', function(evt) {
                            if (evt.keyCode == 27) this.message() // esc
                        })
                    setTimeout(() => {
                        $(this.box).find('.w2ui-btn.btn-default').focus()
                        clearTimeout(this.last.kbd_timer)
                    }, 50)
                }
            })
            return
        }
        // call delete script
        let url = (typeof this.url != 'object' ? this.url : this.url.remove)
        if (url) {
            this.request('delete')
        } else {
            if (typeof recs[0] != 'object') {
                this.selectNone()
                this.remove.apply(this, recs)
            } else {
                // clear cells
                for (let r = 0; r < recs.length; r++) {
                    let fld = this.columns[recs[r].column].field
                    let ind = this.get(recs[r].recid, true)
                    let rec = this.records[ind]
                    if (ind != null && fld != 'recid') {
                        this.records[ind][fld] = ''
                        if (rec.w2ui && rec.w2ui.changes) delete rec.w2ui.changes[fld]
                        // -- style should not be deleted
                        // if (rec.style != null && $.isPlainObject(rec.style) && rec.style[recs[r].column]) {
                        //     delete rec.style[recs[r].column];
                        // }
                    }
                }
                this.update()
            }
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    click(recid, event) {
        let time = (new Date()).getTime()
        let column = null
        if (this.last.cancelClick == true || (event && event.altKey)) return
        if ((typeof recid == 'object') && (recid !== null)) {
            column = recid.column
            recid = recid.recid
        }
        if (event == null) event = {}
        // check for double click
        if (time - parseInt(this.last.click_time) < 350 && this.last.click_recid == recid && event.type == 'click') {
            this.dblClick(recid, event)
            return
        }
        // hide bubble
        if (this.last.bubbleEl) {
            $(this.last.bubbleEl).w2tag()
            this.last.bubbleEl = null
        }
        this.last.click_time = time
        let last_recid = this.last.click_recid
        this.last.click_recid = recid
        // column user clicked on
        if (column == null && event.target) {
            let tmp = event.target
            if (tmp.tagName.toUpperCase() != 'TD') tmp = $(tmp).parents('td')[0]
            if ($(tmp).attr('col') != null) column = parseInt($(tmp).attr('col'))
        }
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'click', recid: recid, column: column, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        let sel = this.getSelection()
        $('#grid_'+ this.name +'_check_all').prop('checked', false)
        let ind = this.get(recid, true)
        let selectColumns = []
        this.last.sel_ind = ind
        this.last.sel_col = column
        this.last.sel_recid = recid
        this.last.sel_type = 'click'
        // multi select with shif key
        let start, end, t1, t2
        if (event.shiftKey && sel.length > 0 && this.multiSelect) {
            if (sel[0].recid) {
                start = this.get(sel[0].recid, true)
                end = this.get(recid, true)
                if (column > sel[0].column) {
                    t1 = sel[0].column
                    t2 = column
                } else {
                    t1 = column
                    t2 = sel[0].column
                }
                for (let c = t1; c <= t2; c++) selectColumns.push(c)
            } else {
                start = this.get(last_recid, true)
                end = this.get(recid, true)
            }
            let sel_add = []
            if (start > end) { let tmp = start; start = end; end = tmp }
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            for (let i = start; i <= end; i++) {
                if (this.searchData.length > 0 && !url && $.inArray(i, this.last.searchIds) == -1) continue
                if (this.selectType == 'row') {
                    sel_add.push(this.records[i].recid)
                } else {
                    for (let sc = 0; sc < selectColumns.length; sc++) {
                        sel_add.push({ recid: this.records[i].recid, column: selectColumns[sc] })
                    }
                }
                //sel.push(this.records[i].recid);
            }
            this.select(sel_add)
        } else {
            let last = this.last.selection
            let flag = (last.indexes.indexOf(ind) != -1 ? true : false)
            let fselect = false
            // if clicked on the checkbox
            if ($(event.target).parents('td').hasClass('w2ui-col-select')) fselect = true
            // clear other if necessary
            if (((!event.ctrlKey && !event.shiftKey && !event.metaKey && !fselect) || !this.multiSelect) && !this.showSelectColumn) {
                if (this.selectType != 'row' && $.inArray(column, last.columns[ind]) == -1) flag = false
                if (sel.length > 300) this.selectNone(); else this.unselect(sel)
                if (flag === true && sel.length == 1) {
                    this.unselect({ recid: recid, column: column })
                } else {
                    this.select({ recid: recid, column: column })
                }
            } else {
                let isChecked = $(event.target).parents('tr').find('.w2ui-grid-select-check').is(':checked')
                if (this.selectType != 'row' && $.inArray(column, last.columns[ind]) == -1 && !isChecked) flag = false
                if (flag === true) {
                    this.unselect({ recid: recid, column: column })
                } else {
                    this.select({ recid: recid, column: column })
                }
            }
        }
        this.status()
        this.initResize()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    columnClick(field, event) {
        // ignore click if column was resized
        if (this.last.colResizing === true) {
            return
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'columnClick', target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behaviour
        if (this.selectType == 'row') {
            let column = this.getColumn(field)
            if (column && column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey) ? true : false))
            if (edata.field == 'line-number') {
                if (this.getSelection().length >= this.records.length) {
                    this.selectNone()
                } else {
                    this.selectAll()
                }
            }
        } else {
            if (event.altKey){
                let column = this.getColumn(field)
                if (column && column.sortable) this.sort(field, null, (event && (event.ctrlKey || event.metaKey) ? true : false))
            }
            // select entire column
            if (edata.field == 'line-number') {
                if (this.getSelection().length >= this.records.length) {
                    this.selectNone()
                } else {
                    this.selectAll()
                }
            } else {
                if (!event.shiftKey && !event.metaKey && !event.ctrlKey) {
                    this.selectNone()
                }
                let tmp = this.getSelection()
                let column = this.getColumn(edata.field, true)
                let sel = []
                let cols = []
                // check if there was a selection before
                if (tmp.length != 0 && event.shiftKey) {
                    let start = column
                    let end = tmp[0].column
                    if (start > end) {
                        start = tmp[0].column
                        end = column
                    }
                    for (let i=start; i<=end; i++) cols.push(i)
                } else {
                    cols.push(column)
                }
                edata = this.trigger({ phase: 'before', type: 'columnSelect', target: this.name, columns: cols })
                if (edata.isCancelled !== true) {
                    for (let i = 0; i < this.records.length; i++) {
                        sel.push({ recid: this.records[i].recid, column: cols })
                    }
                    this.select(sel)
                }
                this.trigger($.extend(edata, { phase: 'after' }))
            }
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    columnDblClick(field, event) {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'columnDblClick', target: this.name, field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    focus(event) {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'focus', target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = true
        $(this.box).removeClass('w2ui-inactive').find('.w2ui-inactive').removeClass('w2ui-inactive')
        setTimeout(() => {
            let $input = $(this.box).find('#grid_'+ this.name + '_focus')
            if (!$input.is(':focus')) $input.focus()
        }, 10)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    blur(event) {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'blur', target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = false
        $(this.box).addClass('w2ui-inactive').find('.w2ui-selected').addClass('w2ui-inactive')
        $(this.box).find('.w2ui-selection').addClass('w2ui-inactive')
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    keydown(event) {
        // this method is called from w2utils
        let obj = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (obj.keyboard !== true) return
        // trigger event
        let edata = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behavior
        if ($(this.box).find('>.w2ui-message').length > 0) {
            // if there are messages
            if (event.keyCode == 27) this.message()
            return
        }
        let empty = false
        let records = $('#grid_'+ obj.name +'_records')
        let sel = obj.getSelection()
        if (sel.length === 0) empty = true
        let recid = sel[0] || null
        let columns = []
        let recid2 = sel[sel.length-1]
        if (typeof recid == 'object' && recid != null) {
            recid = sel[0].recid
            columns = []
            let ii = 0
            while (true) {
                if (!sel[ii] || sel[ii].recid != recid) break
                columns.push(sel[ii].column)
                ii++
            }
            recid2 = sel[sel.length-1].recid
        }
        let ind = obj.get(recid, true)
        let ind2 = obj.get(recid2, true)
        let recEL = $('#grid_'+ obj.name +'_rec_'+ (ind != null ? w2utils.escapeId(obj.records[ind].recid) : 'none'))
        let cancel = false
        let key = event.keyCode
        let shiftKey = event.shiftKey

        switch (key) {
            case 8: // backspace
            case 46: // delete
                // delete if button is visible
                obj.delete()
                cancel = true
                event.stopPropagation()
                break

            case 27: // escape
                obj.selectNone()
                cancel = true
                break

            case 65: // cmd + A
                if (!event.metaKey && !event.ctrlKey) break
                obj.selectAll()
                cancel = true
                break

            case 13: // enter
                // if expandable columns - expand it
                if (this.selectType == 'row' && obj.show.expandColumn === true) {
                    if (recEL.length <= 0) break
                    obj.toggle(recid, event)
                    cancel = true
                } else { // or enter edit
                    for (let c = 0; c < this.columns.length; c++) {
                        let edit = this.getCellEditable(ind, c)
                        if (edit) {
                            columns.push(parseInt(c))
                            break
                        }
                    }
                    // edit last column that was edited
                    if (this.selectType == 'row' && this.last._edit && this.last._edit.column) {
                        columns = [this.last._edit.column]
                    }
                    if (columns.length > 0) {
                        obj.editField(recid, columns[0], null, event)
                        cancel = true
                    }
                }
                break

            case 37: // left
                if (empty) { // no selection
                    selectTopRecord()
                    break
                }
                if (this.selectType == 'row') {
                    if (recEL.length <= 0) break
                    let tmp = this.records[ind].w2ui || {}
                    if (tmp && tmp.parent_recid != null && (!Array.isArray(tmp.children) || tmp.children.length === 0 || !tmp.expanded)) {
                        obj.unselect(recid)
                        obj.collapse(tmp.parent_recid, event)
                        obj.select(tmp.parent_recid)
                    } else {
                        obj.collapse(recid, event)
                    }
                } else {
                    let prev = obj.prevCell(ind, columns[0])
                    if (!shiftKey && prev == null) {
                        this.selectNone()
                        prev = 0
                    }
                    if (prev != null) {
                        if (shiftKey && obj.multiSelect) {
                            if (tmpUnselect()) return
                            let tmp = []
                            let newSel = []
                            let unSel = []
                            if (columns.indexOf(this.last.sel_col) === 0 && columns.length > 1) {
                                for (let i = 0; i < sel.length; i++) {
                                    if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                    unSel.push({ recid: sel[i].recid, column: columns[columns.length-1] })
                                }
                                obj.unselect(unSel)
                                obj.scrollIntoView(ind, columns[columns.length-1], true)
                            } else {
                                for (let i = 0; i < sel.length; i++) {
                                    if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                    newSel.push({ recid: sel[i].recid, column: prev })
                                }
                                obj.select(newSel)
                                obj.scrollIntoView(ind, prev, true)
                            }
                        } else {
                            event.metaKey = false
                            obj.click({ recid: recid, column: prev }, event)
                            obj.scrollIntoView(ind, prev, true)
                        }
                    } else {
                        // if selected more then one, then select first
                        if (!shiftKey) {
                            if (sel.length > 1) {
                                obj.selectNone()
                            } else {
                                for (let s = 1; s < sel.length; s++) obj.unselect(sel[s])
                            }
                        }
                    }
                }
                cancel = true
                break

            case 39: // right
                if (empty) {
                    selectTopRecord()
                    break
                }
                if (this.selectType == 'row') {
                    if (recEL.length <= 0) break
                    obj.expand(recid, event)
                } else {
                    let next = obj.nextCell(ind, columns[columns.length-1]) // columns is an array of selected columns
                    if (!shiftKey && next == null) {
                        this.selectNone()
                        next = this.columns.length-1
                    }
                    if (next != null) {
                        if (shiftKey && key == 39 && obj.multiSelect) {
                            if (tmpUnselect()) return
                            let tmp = []
                            let newSel = []
                            let unSel = []
                            if (columns.indexOf(this.last.sel_col) == columns.length-1 && columns.length > 1) {
                                for (let i = 0; i < sel.length; i++) {
                                    if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                    unSel.push({ recid: sel[i].recid, column: columns[0] })
                                }
                                obj.unselect(unSel)
                                obj.scrollIntoView(ind, columns[0], true)
                            } else {
                                for (let i = 0; i < sel.length; i++) {
                                    if (tmp.indexOf(sel[i].recid) == -1) tmp.push(sel[i].recid)
                                    newSel.push({ recid: sel[i].recid, column: next })
                                }
                                obj.select(newSel)
                                obj.scrollIntoView(ind, next, true)
                            }
                        } else {
                            event.metaKey = false
                            obj.click({ recid: recid, column: next }, event)
                            obj.scrollIntoView(ind, next, true)
                        }
                    } else {
                        // if selected more then one, then select first
                        if (!shiftKey) {
                            if (sel.length > 1) {
                                obj.selectNone()
                            } else {
                                for (let s = 0; s < sel.length-1; s++) obj.unselect(sel[s])
                            }
                        }
                    }
                }
                cancel = true
                break

            case 38: // up
                if (empty) selectTopRecord()
                if (recEL.length <= 0) break
                // move to the previous record
                let prev = obj.prevRow(ind, columns[0])
                if (!shiftKey && prev == null) {
                    if (this.searchData.length != 0 && !url) {
                        prev = this.last.searchIds[0]
                    } else {
                        prev = 0
                    }
                }
                if (prev != null) {
                    if (shiftKey && obj.multiSelect) { // expand selection
                        if (tmpUnselect()) return
                        if (obj.selectType == 'row') {
                            if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
                                obj.unselect(obj.records[ind2].recid)
                            } else {
                                obj.select(obj.records[prev].recid)
                            }
                        } else {
                            if (obj.last.sel_ind > prev && obj.last.sel_ind != ind2) {
                                prev = ind2
                                let tmp = []
                                for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] })
                                obj.unselect(tmp)
                            } else {
                                let tmp = []
                                for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[prev].recid, column: columns[c] })
                                obj.select(tmp)
                            }
                        }
                    } else { // move selected record
                        if (sel.length > 300) this.selectNone(); else this.unselect(sel)
                        obj.click({ recid: obj.records[prev].recid, column: columns[0] }, event)
                    }
                    obj.scrollIntoView(prev)
                    if (event.preventDefault) event.preventDefault()
                } else {
                    // if selected more then one, then select first
                    if (!shiftKey) {
                        if (sel.length > 1) {
                            obj.selectNone()
                        } else {
                            for (let s = 1; s < sel.length; s++) obj.unselect(sel[s])
                        }
                    }
                }
                break

            case 40: // down
                if (empty) selectTopRecord()
                if (recEL.length <= 0) break
                // move to the next record
                let next = obj.nextRow(ind2, columns[0])
                if (!shiftKey && next == null) {
                    if (this.searchData.length != 0 && !url) {
                        next = this.last.searchIds[this.last.searchIds.length - 1]
                    } else {
                        next = this.records.length - 1
                    }
                }
                if (next != null) {
                    if (shiftKey && obj.multiSelect) { // expand selection
                        if (tmpUnselect()) return
                        if (obj.selectType == 'row') {
                            if (this.last.sel_ind < next && this.last.sel_ind != ind) {
                                obj.unselect(obj.records[ind].recid)
                            } else {
                                obj.select(obj.records[next].recid)
                            }
                        } else {
                            if (this.last.sel_ind < next && this.last.sel_ind != ind) {
                                next = ind
                                let tmp = []
                                for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] })
                                obj.unselect(tmp)
                            } else {
                                let tmp = []
                                for (let c = 0; c < columns.length; c++) tmp.push({ recid: obj.records[next].recid, column: columns[c] })
                                obj.select(tmp)
                            }
                        }
                    } else { // move selected record
                        if (sel.length > 300) this.selectNone(); else this.unselect(sel)
                        obj.click({ recid: obj.records[next].recid, column: columns[0] }, event)
                    }
                    obj.scrollIntoView(next)
                    cancel = true
                } else {
                    // if selected more then one, then select first
                    if (!shiftKey) {
                        if (sel.length > 1) {
                            obj.selectNone()
                        } else {
                            for (let s = 0; s < sel.length-1; s++) obj.unselect(sel[s])
                        }
                    }
                }
                break

                // copy & paste

            case 17: // ctrl key
            case 91: // cmd key
                // SLOW: 10k records take 7.0
                if (empty) break
                // in Safari need to copy to buffer on cmd or ctrl key (otherwise does not work)
                if (obj.last.isSafari) {
                    obj.last.copy_event = obj.copy(false, event)
                    $('#grid_'+ obj.name + '_focus').val(obj.last.copy_event.text).select()
                }
                break

            case 67: // - c
                // this fill trigger event.onComplete
                if (event.metaKey || event.ctrlKey) {
                    if (obj.last.isSafari) {
                        obj.copy(obj.last.copy_event, event)
                    } else {
                        obj.last.copy_event = obj.copy(false, event)
                        $('#grid_'+ obj.name + '_focus').val(obj.last.copy_event.text).select()
                        obj.copy(obj.last.copy_event, event)
                    }
                }
                break

            case 88: // x - cut
                if (empty) break
                if (event.ctrlKey || event.metaKey) {
                    if (obj.last.isSafari) {
                        obj.copy(obj.last.copy_event, event)
                    } else {
                        obj.last.copy_event = obj.copy(false, event)
                        $('#grid_'+ obj.name + '_focus').val(obj.last.copy_event.text).select()
                        obj.copy(obj.last.copy_event, event)
                    }
                }
                break
        }
        let tmp = [32, 187, 189, 192, 219, 220, 221, 186, 222, 188, 190, 191] // other typable chars
        for (let i=48; i<=111; i++) tmp.push(i) // 0-9,a-z,A-Z,numpad
        if (tmp.indexOf(key) != -1 && !event.ctrlKey && !event.metaKey && !cancel) {
            if (columns.length === 0) columns.push(0)
            cancel = false
            // move typed key into edit
            setTimeout(() => {
                let focus = $('#grid_'+ obj.name + '_focus')
                let key = focus.val()
                focus.val('')
                obj.editField(recid, columns[0], key, event)
            }, 1)
        }
        if (cancel) { // cancel default behaviour
            if (event.preventDefault) event.preventDefault()
        }
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))

        function selectTopRecord() {
            let ind = Math.floor(records[0].scrollTop / obj.recordHeight) + 1
            if (!obj.records[ind] || ind < 2) ind = 0
            obj.select({ recid: obj.records[ind].recid, column: 0})
        }

        function tmpUnselect () {
            if (obj.last.sel_type != 'click') return false
            if (obj.selectType != 'row') {
                obj.last.sel_type = 'key'
                if (sel.length > 1) {
                    for (let s = 0; s < sel.length; s++) {
                        if (sel[s].recid == obj.last.sel_recid && sel[s].column == obj.last.sel_col) {
                            sel.splice(s, 1)
                            break
                        }
                    }
                    obj.unselect(sel)
                    return true
                }
                return false
            } else {
                obj.last.sel_type = 'key'
                if (sel.length > 1) {
                    sel.splice(sel.indexOf(obj.records[obj.last.sel_ind].recid), 1)
                    obj.unselect(sel)
                    return true
                }
                return false
            }
        }
    }

    scrollIntoView(ind, column, instant) {
        let buffered = this.records.length
        if (this.searchData.length != 0 && !this.url) buffered = this.last.searchIds.length
        if (buffered === 0) return
        if (ind == null) {
            let sel = this.getSelection()
            if (sel.length === 0) return
            if ($.isPlainObject(sel[0])) {
                ind = sel[0].index
                column = sel[0].column
            } else {
                ind = this.get(sel[0], true)
            }
        }
        let records = $('#grid_'+ this.name +'_records')
        // if all records in view
        let len = this.last.searchIds.length
        if (len > 0) ind = this.last.searchIds.indexOf(ind) // if search is applied

        // vertical
        if (records.height() < this.recordHeight * (len > 0 ? len : buffered) && records.length > 0) {
            // scroll to correct one
            let t1 = Math.floor(records[0].scrollTop / this.recordHeight)
            let t2 = t1 + Math.floor(records.height() / this.recordHeight)
            if (ind == t1) {
                if (instant === true) {
                    records.prop({ 'scrollTop': records.scrollTop() - records.height() / 1.3 })
                } else {
                    records.stop()
                    records.animate({ 'scrollTop': records.scrollTop() - records.height() / 1.3 }, 250, 'linear')
                }
            }
            if (ind == t2) {
                if (instant === true) {
                    records.prop({ 'scrollTop': records.scrollTop() + records.height() / 1.3 })
                } else {
                    records.stop()
                    records.animate({ 'scrollTop': records.scrollTop() + records.height() / 1.3 }, 250, 'linear')
                }
            }
            if (ind < t1 || ind > t2) {
                if (instant === true) {
                    records.prop({ 'scrollTop': (ind - 1) * this.recordHeight })
                } else {
                    records.stop()
                    records.animate({ 'scrollTop': (ind - 1) * this.recordHeight }, 250, 'linear')
                }
            }
        }

        // horizontal
        if (column != null) {
            let x1 = 0
            let x2 = 0
            let sb = w2utils.scrollBarSize()
            for (let i = 0; i <= column; i++) {
                let col = this.columns[i]
                if (col.frozen || col.hidden) continue
                x1 = x2
                x2 += parseInt(col.sizeCalculated)
            }
            if (records.width() < x2 - records.scrollLeft()) { // right
                if (instant === true) {
                    records.prop({ 'scrollLeft': x1 - sb })
                } else {
                    records.animate({ 'scrollLeft': x1 - sb }, 250, 'linear')
                }
            } else if (x1 < records.scrollLeft()) { // left
                if (instant === true) {
                    records.prop({ 'scrollLeft': x2 - records.width() + sb * 2 })
                } else {
                    records.animate({ 'scrollLeft': x2 - records.width() + sb * 2 }, 250, 'linear')
                }
            }
        }
    }

    dblClick(recid, event) {
        // find columns
        let column = null
        if ((typeof recid == 'object') && (recid !== null)) {
            column = recid.column
            recid = recid.recid
        }
        if (event == null) event = {}
        // column user clicked on
        if (column == null && event.target) {
            let tmp = event.target
            if (tmp.tagName.toUpperCase() != 'TD') tmp = $(tmp).parents('td')[0]
            column = parseInt($(tmp).attr('col'))
        }
        let index = this.get(recid, true)
        let rec = this.records[index]
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'dblClick', recid: recid, column: column, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        this.selectNone()
        let edit = this.getCellEditable(index, column)
        if (edit) {
            this.editField(recid, column, null, event)
        } else {
            this.select({ recid: recid, column: column })
            if (this.show.expandColumn || (rec && rec.w2ui && Array.isArray(rec.w2ui.children))) this.toggle(recid)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    contextMenu(recid, column, event) {
        if (this.last.userSelect == 'text') return
        if (event == null) event = { offsetX: 0, offsetY: 0, target: $('#grid_'+ this.name +'_rec_'+ recid)[0] }
        if (event.offsetX == null) {
            event.offsetX = event.layerX - event.target.offsetLeft
            event.offsetY = event.layerY - event.target.offsetTop
        }
        if (w2utils.isFloat(recid)) recid = parseFloat(recid)
        let sel = this.getSelection()
        if (this.selectType == 'row') {
            if (sel.indexOf(recid) == -1) this.click(recid)
        } else {
            let $tmp = $(event.target)
            if ($tmp[0].tagName.toUpperCase() != 'TD') $tmp = $(event.target).parents('td')
            let selected = false
            column = $tmp.attr('col')
            // check if any selected sel in the right row/column
            for (let i=0; i<sel.length; i++) {
                if (sel[i].recid == recid || sel[i].column == column) selected = true
            }
            if (!selected && recid != null) this.click({ recid: recid, column: column })
            if (!selected && column != null) this.columnClick(this.columns[column].field, event)
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'contextMenu', target: this.name, originalEvent: event, recid: recid, column: column })
        if (edata.isCancelled === true) return
        // default action
        if (this.menu.length > 0) {
            $(this.box).find(event.target)
                .w2menu(this.menu, {
                    originalEvent: event,
                    contextMenu: true,
                    onSelect(event) {
                        this.menuClick(recid, event)
                    }
                })
        }
        // cancel event
        if (event.preventDefault) event.preventDefault()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    menuClick(recid, event) {
        // event before
        let edata = this.trigger({
            phase: 'before', type: 'menuClick', target: this.name,
            originalEvent: event.originalEvent, menuEvent: event,
            recid: recid, menuIndex: event.index, menuItem: event.item
        })
        if (edata.isCancelled === true) return
        // default action
        // -- empty
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    toggle(recid) {
        let rec = this.get(recid)
        rec.w2ui = rec.w2ui || {}
        if (rec.w2ui.expanded === true) return this.collapse(recid); else return this.expand(recid)
    }

    expand(recid) {
        let ind = this.get(recid, true)
        let rec = this.records[ind]
        rec.w2ui = rec.w2ui || {}
        let id = w2utils.escapeId(recid)
        let children = rec.w2ui.children
        let edata
        if (Array.isArray(children)) {
            if (rec.w2ui.expanded === true || children.length === 0) return false // already shown
            edata = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid })
            if (edata.isCancelled === true) return false
            rec.w2ui.expanded = true
            children.forEach((child) => {
                child.w2ui = child.w2ui || {}
                child.w2ui.parent_recid = rec.recid
                if (child.w2ui.children == null) child.w2ui.children = []
            })
            this.records.splice.apply(this.records, [ind + 1, 0].concat(children))
            this.total += children.length
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            if (!url) {
                this.localSort(true, true)
                if (this.searchData.length > 0) {
                    this.localSearch(true)
                }
            }
            this.refresh()
            this.trigger($.extend(edata, { phase: 'after' }))
        } else {
            if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length > 0 || this.show.expandColumn !== true) return false
            if (rec.w2ui.expanded == 'none') return false
            // insert expand row
            $('#grid_'+ this.name +'_rec_'+ id).after(
                '<tr id="grid_'+ this.name +'_rec_'+ recid +'_expanded_row" class="w2ui-expanded-row">'+
                    '    <td colspan="100" class="w2ui-expanded2">'+
                    '        <div id="grid_'+ this.name +'_rec_'+ recid +'_expanded"></div>'+
                    '    </td>'+
                    '    <td class="w2ui-grid-data-last"></td>'+
                    '</tr>')

            $('#grid_'+ this.name +'_frec_'+ id).after(
                '<tr id="grid_'+ this.name +'_frec_'+ recid +'_expanded_row" class="w2ui-expanded-row">'+
                        (this.show.lineNumbers ? '<td class="w2ui-col-number"></td>' : '') +
                    '    <td class="w2ui-grid-data w2ui-expanded1" colspan="100">'+
                    '       <div id="grid_'+ this.name +'_frec_'+ recid +'_expanded"></div>'+
                    '   </td>'+
                    '</tr>')

            // event before
            edata = this.trigger({ phase: 'before', type: 'expand', target: this.name, recid: recid,
                box_id: 'grid_'+ this.name +'_rec_'+ recid +'_expanded', fbox_id: 'grid_'+ this.name +'_frec_'+ id +'_expanded' })
            if (edata.isCancelled === true) {
                $('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove()
                $('#grid_'+ this.name +'_frec_'+ id +'_expanded_row').remove()
                return false
            }
            // expand column
            let row1 = $(this.box).find('#grid_'+ this.name +'_rec_'+ recid +'_expanded')
            let row2 = $(this.box).find('#grid_'+ this.name +'_frec_'+ recid +'_expanded')
            let innerHeight = row1.find('> div:first-child').height()
            if (row1.height() < innerHeight) {
                row1.css({ height: innerHeight + 'px' })
            }
            if (row2.height() < innerHeight) {
                row2.css({ height: innerHeight + 'px' })
            }
            // default action
            $('#grid_'+ this.name +'_rec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded')
            $('#grid_'+ this.name +'_frec_'+ id).attr('expanded', 'yes').addClass('w2ui-expanded')
            // $('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').show();
            $('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('-')
            rec.w2ui.expanded = true
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
            this.resizeRecords()
        }
        return true
    }

    collapse(recid) {
        let ind = this.get(recid, true)
        let rec = this.records[ind]
        rec.w2ui = rec.w2ui || {}
        let id = w2utils.escapeId(recid)
        let children = rec.w2ui.children
        let edata
        if (Array.isArray(children)) {
            if (rec.w2ui.expanded !== true) return false // already hidden
            edata = this.trigger({ phase: 'before', type: 'collapse', target: this.name, recid: recid })
            if (edata.isCancelled === true) return false
            clearExpanded(rec)
            let stops = []
            for (let r = rec; r != null; r = this.get(r.w2ui.parent_recid))
                stops.push(r.w2ui.parent_recid)
            // stops contains 'undefined' plus the ID of all nodes in the path from 'rec' to the tree root
            let start = ind + 1
            let end = start
            while (true) {
                if (this.records.length <= end + 1 || this.records[end+1].w2ui == null ||
                    stops.indexOf(this.records[end+1].w2ui.parent_recid) >= 0) {
                    break
                }
                end++
            }
            this.records.splice(start, end - start + 1)
            this.total -= end - start + 1
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            if (!url) {
                if (this.searchData.length > 0) {
                    this.localSearch(true)
                }
            }
            this.refresh()
            this.trigger($.extend(edata, { phase: 'after' }))
        } else {
            if ($('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').length === 0 || this.show.expandColumn !== true) return false
            // event before
            edata = this.trigger({ phase: 'before', type: 'collapse', target: this.name, recid: recid,
                box_id: 'grid_'+ this.name +'_rec_'+ id +'_expanded', fbox_id: 'grid_'+ this.name +'_frec_'+ id +'_expanded' })
            if (edata.isCancelled === true) return false
            // default action
            $('#grid_'+ this.name +'_rec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded')
            $('#grid_'+ this.name +'_frec_'+ id).removeAttr('expanded').removeClass('w2ui-expanded')
            $('#grid_'+ this.name +'_cell_'+ this.get(recid, true) +'_expand div').html('+')
            $('#grid_'+ this.name +'_rec_'+ id +'_expanded').css('height', '0px')
            $('#grid_'+ this.name +'_frec_'+ id +'_expanded').css('height', '0px')
            setTimeout(() => {
                $('#grid_'+ this.name +'_rec_'+ id +'_expanded_row').remove()
                $('#grid_'+ this.name +'_frec_'+ id +'_expanded_row').remove()
                rec.w2ui.expanded = false
                // event after
                this.trigger($.extend(edata, { phase: 'after' }))
                this.resizeRecords()
            }, 300)
        }
        return true

        function clearExpanded(rec) {
            rec.w2ui.expanded = false
            for (let i = 0; i < rec.w2ui.children.length; i++) {
                let subRec = rec.w2ui.children[i]
                if (subRec.w2ui.expanded) {
                    clearExpanded(subRec)
                }
            }
        }
    }

    sort(field, direction, multiField) { // if no params - clears sort
        // event before
        let edata = this.trigger({ phase: 'before', type: 'sort', target: this.name, field: field, direction: direction, multiField: multiField })
        if (edata.isCancelled === true) return
        // check if needed to quit
        if (field != null) {
            // default action
            let sortIndex = this.sortData.length
            for (let s = 0; s < this.sortData.length; s++) {
                if (this.sortData[s].field == field) { sortIndex = s; break }
            }
            if (direction == null) {
                if (this.sortData[sortIndex] == null) {
                    direction = 'asc'
                } else {
                    if(this.sortData[sortIndex].direction == null) {
                        this.sortData[sortIndex].direction = ''
                    }
                    switch (this.sortData[sortIndex].direction.toLowerCase()) {
                        case 'asc' : direction = 'desc'; break
                        case 'desc' : direction = 'asc'; break
                        default : direction = 'asc'; break
                    }
                }
            }
            if (this.multiSort === false) { this.sortData = []; sortIndex = 0 }
            if (multiField != true) { this.sortData = []; sortIndex = 0 }
            // set new sort
            if (this.sortData[sortIndex] == null) this.sortData[sortIndex] = {}
            this.sortData[sortIndex].field = field
            this.sortData[sortIndex].direction = direction
        } else {
            this.sortData = []
        }
        // if local
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!url) {
            this.localSort(true, true)
            if (this.searchData.length > 0) this.localSearch(true)
            // reset vertical scroll
            this.last.scrollTop = 0
            $('#grid_'+ this.name +'_records').prop('scrollTop', 0)
            // event after
            this.trigger($.extend(edata, { phase: 'after', direction: direction }))
            this.refresh()
        } else {
            // event after
            this.trigger($.extend(edata, { phase: 'after', direction: direction }))
            this.last.xhr_offset = 0
            this.reload()
        }
    }

    copy(flag, oEvent) {
        if ($.isPlainObject(flag)) {
            // event after
            this.trigger($.extend(flag, { phase: 'after' }))
            return flag.text
        }
        // generate text to copy
        let sel = this.getSelection()
        if (sel.length === 0) return ''
        let text = ''
        if (typeof sel[0] == 'object') { // cell copy
            // find min/max column
            let minCol = sel[0].column
            let maxCol = sel[0].column
            let recs = []
            for (let s = 0; s < sel.length; s++) {
                if (sel[s].column < minCol) minCol = sel[s].column
                if (sel[s].column > maxCol) maxCol = sel[s].column
                if (recs.indexOf(sel[s].index) == -1) recs.push(sel[s].index)
            }
            recs.sort((a, b) => { return a-b }) // sort function must be for numerical sort
            for (let r = 0 ; r < recs.length; r++) {
                let ind = recs[r]
                for (let c = minCol; c <= maxCol; c++) {
                    let col = this.columns[c]
                    if (col.hidden === true) continue
                    text += this.getCellCopy(ind, c) + '\t'
                }
                text = text.substr(0, text.length-1) // remove last \t
                text += '\n'
            }
        } else { // row copy
            // copy headers
            for (let c = 0; c < this.columns.length; c++) {
                let col = this.columns[c]
                if (col.hidden === true) continue
                let colName = (col.text ? col.text : col.field)
                if (col.text && col.text.length < 3 && col.tooltip) colName = col.tooltip // if column name is less then 3 char and there is tooltip - use it
                text += '"' + w2utils.stripTags(colName) + '"\t'
            }
            text = text.substr(0, text.length-1) // remove last \t
            text += '\n'
            // copy selected text
            for (let s = 0; s < sel.length; s++) {
                let ind = this.get(sel[s], true)
                for (let c = 0; c < this.columns.length; c++) {
                    let col = this.columns[c]
                    if (col.hidden === true) continue
                    text += '"' + this.getCellCopy(ind, c) + '"\t'
                }
                text = text.substr(0, text.length-1) // remove last \t
                text += '\n'
            }
        }
        text = text.substr(0, text.length - 1)

        // if called without params
        let edata
        if (flag == null) {
            // before event
            edata = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text,
                cut: (oEvent.keyCode == 88 ? true : false), originalEvent: oEvent })
            if (edata.isCancelled === true) return ''
            text = edata.text
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
            return text
        } else if (flag === false) { // only before event
            // before event
            edata = this.trigger({ phase: 'before', type: 'copy', target: this.name, text: text,
                cut: (oEvent.keyCode == 88 ? true : false), originalEvent: oEvent })
            if (edata.isCancelled === true) return ''
            text = edata.text
            return edata
        }
    }

    /**
     * Gets value to be copied to the clipboard
     * @param ind index of the record
     * @param col_ind index of the column
     * @returns the displayed value of the field's record associated with the cell
     */
    getCellCopy(ind, col_ind) {
        return w2utils.stripTags(this.getCellHTML(ind, col_ind))
    }

    paste(text) {
        let sel = this.getSelection()
        let ind = this.get(sel[0].recid, true)
        let col = sel[0].column
        // before event
        let edata = this.trigger({ phase: 'before', type: 'paste', target: this.name, text: text, index: ind, column: col })
        if (edata.isCancelled === true) return
        text = edata.text
        // default action
        if (this.selectType == 'row' || sel.length === 0) {
            console.log('ERROR: You can paste only if grid.selectType = \'cell\' and when at least one cell selected.')
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
            return
        }
        let newSel = []
        text = text.split('\n')
        for (let t = 0; t < text.length; t++) {
            let tmp = text[t].split('\t')
            let cnt = 0
            let rec = this.records[ind]
            let cols = []
            if (rec == null) continue
            for (let dt = 0; dt < tmp.length; dt++) {
                if (!this.columns[col + cnt]) continue
                this.setCellPaste(rec, col + cnt, tmp[dt])
                cols.push(col + cnt)
                cnt++
            }
            for (let c = 0; c < cols.length; c++) newSel.push({ recid: rec.recid, column: cols[c] })
            ind++
        }
        this.selectNone()
        this.select(newSel)
        this.refresh()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    /**
     * Sets record field using clipboard text
     * @param rec record
     * @param col_ind column index
     * @param paste sub part of the pasted text
     */
    setCellPaste(rec, col_ind, paste) {
        let field = this.columns[col_ind].field
        rec.w2ui = rec.w2ui || {}
        rec.w2ui.changes = rec.w2ui.changes || {}
        rec.w2ui.changes[field] = paste
    }

    // ==================================================
    // --- Common functions

    resize() {
        let time = (new Date()).getTime()
        // make sure the box is right
        if (!this.box || $(this.box).attr('name') != this.name) return
        // determine new width and height
        $(this.box).find('> div.w2ui-grid-box')
            .css('width', $(this.box).width())
            .css('height', $(this.box).height())
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return
        // resize
        this.resizeBoxes()
        this.resizeRecords()
        if (this.toolbar && this.toolbar.resize) this.toolbar.resize()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }

    update(cells) {
        let time = (new Date()).getTime()
        if (this.box == null) return 0
        if (cells == null) {
            for (let index = this.last.range_start - 1; index <= this.last.range_end - 1; index++) {
                if (index < 0) continue
                let rec = this.records[index] || {}
                if (!rec.w2ui) rec.w2ui = {}
                for (let column = 0; column < this.columns.length; column++) {
                    let row = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid))
                    let cell = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ column)
                    cell.replaceWith(this.getCellHTML(index, column, false))
                    cell = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ column) // need to reselect as it was replaced
                    // assign style
                    if (rec.w2ui.style != null && !$.isEmptyObject(rec.w2ui.style)) {
                        if (typeof rec.w2ui.style == 'string') {
                            row.attr('style', rec.w2ui.style)
                        }
                        if ($.isPlainObject(rec.w2ui.style) && typeof rec.w2ui.style[column] == 'string') {
                            cell.attr('style', rec.w2ui.style[column])
                        }
                    } else {
                        cell.attr('style', '')
                    }
                    // assign class
                    if (rec.w2ui.class != null && !$.isEmptyObject(rec.w2ui.class)) {
                        if (typeof rec.w2ui.class == 'string') {
                            row.addClass(rec.w2ui.class)
                        }
                        if ($.isPlainObject(rec.w2ui.class) && typeof rec.w2ui.class[column] == 'string') {
                            cell.addClass(rec.w2ui.class[column])
                        }
                    }
                }
            }

        } else {

            for (let i = 0; i < cells.length; i++) {
                let index = cells[i].index
                let column = cells[i].column
                if (index < 0) continue
                if (index == null || column == null) {
                    console.log('ERROR: Wrong argument for grid.update(cells), cells should be [{ index: X, column: Y }, ...]')
                    continue
                }
                let rec = this.records[index] || {}
                let row = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(rec.recid))
                let cell = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ column)
                if (!rec.w2ui) rec.w2ui = {}
                cell.replaceWith(this.getCellHTML(index, column, false))
                cell = $(this.box).find('#grid_'+ this.name + '_data_'+ index +'_'+ column) // need to reselect as it was replaced
                // assign style
                if (rec.w2ui.style != null && !$.isEmptyObject(rec.w2ui.style)) {
                    if (typeof rec.w2ui.style == 'string') {
                        row.attr('style', rec.w2ui.style)
                    }
                    if ($.isPlainObject(rec.w2ui.style) && typeof rec.w2ui.style[column] == 'string') {
                        cell.attr('style', rec.w2ui.style[column])
                    }
                } else {
                    cell.attr('style', '')
                }
                // assign class
                if (rec.w2ui.class != null && !$.isEmptyObject(rec.w2ui.class)) {
                    if (typeof rec.w2ui.class == 'string') {
                        row.addClass(rec.w2ui.class)
                    }
                    if ($.isPlainObject(rec.w2ui.class) && typeof rec.w2ui.class[column] == 'string') {
                        cell.addClass(rec.w2ui.class[column])
                    }
                }
            }
        }
        return (new Date()).getTime() - time
    }

    refreshCell(recid, field) {
        let index = this.get(recid, true)
        let col_ind = this.getColumn(field, true)
        let isSummary = (this.records[index] && this.records[index].recid == recid ? false : true)
        let cell = $(this.box).find((isSummary ? '.w2ui-grid-summary ' : '') + '#grid_'+ this.name + '_data_'+ index +'_'+ col_ind)
        if (cell.length == 0) return false
        // set cell html and changed flag
        cell.replaceWith(this.getCellHTML(index, col_ind, isSummary))
    }

    refreshRow(recid, ind) {
        let tr1 = $(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
        let tr2 = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
        if (tr1.length > 0) {
            if (ind == null) ind = this.get(recid, true)
            let line = tr1.attr('line')
            let isSummary = (this.records[ind] && this.records[ind].recid == recid ? false : true)
            // if it is searched, find index in search array
            let url = (typeof this.url != 'object' ? this.url : this.url.get)
            if (this.searchData.length > 0 && !url) for (let s = 0; s < this.last.searchIds.length; s++) if (this.last.searchIds[s] == ind) ind = s
            let rec_html = this.getRecordHTML(ind, line, isSummary)
            $(tr1).replaceWith(rec_html[0])
            $(tr2).replaceWith(rec_html[1])
            // apply style to row if it was changed in render functions
            let st = (this.records[ind].w2ui ? this.records[ind].w2ui.style : '')
            if (typeof st == 'string') {
                tr1 = $(this.box).find('#grid_'+ this.name +'_frec_'+ w2utils.escapeId(recid))
                tr2 = $(this.box).find('#grid_'+ this.name +'_rec_'+ w2utils.escapeId(recid))
                tr1.attr('custom_style', st)
                tr2.attr('custom_style', st)
                if (tr1.hasClass('w2ui-selected')) {
                    st = st.replace('background-color', 'none')
                }
                tr1[0].style.cssText = 'height: '+ this.recordHeight + 'px;' + st
                tr2[0].style.cssText = 'height: '+ this.recordHeight + 'px;' + st
            }
            if (isSummary) {
                this.resize()
            }
        }
    }

    refresh() {
        let time = (new Date()).getTime()
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.total <= 0 && !url && this.searchData.length === 0) {
            this.total = this.records.length
        }
        this.toolbar.disable('w2ui-edit', 'w2ui-delete')
        if (!this.box) return
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'refresh' })
        if (edata.isCancelled === true) return
        // -- header
        if (this.show.header) {
            $('#grid_'+ this.name +'_header').html(this.header +'&#160;').show()
        } else {
            $('#grid_'+ this.name +'_header').hide()
        }
        // -- toolbar
        if (this.show.toolbar) {
            // if select-collumn is checked - no toolbar refresh
            if (this.toolbar && this.toolbar.get('w2ui-column-on-off') && this.toolbar.get('w2ui-column-on-off').checked) {
                // no action
            } else {
                $('#grid_'+ this.name +'_toolbar').show()
                // refresh toolbar all but search field
                if (typeof this.toolbar == 'object') {
                    let tmp = this.toolbar.items
                    for (let t = 0; t < tmp.length; t++) {
                        if (tmp[t].id == 'w2ui-search' || tmp[t].type == 'break') continue
                        this.toolbar.refresh(tmp[t].id)
                    }
                }
            }
        } else {
            $('#grid_'+ this.name +'_toolbar').hide()
        }
        // -- make sure search is closed
        this.searchClose()
        // search placeholder
        let el = $('#grid_'+ this.name +'_search_all')
        if (!this.multiSearch && this.last.field == 'all' && this.searches.length > 0) {
            this.last.field = this.searches[0].field
            this.last.label = this.searches[0].label
        }
        for (let s = 0; s < this.searches.length; s++) {
            if (this.searches[s].field == this.last.field) this.last.label = this.searches[s].label
        }
        if (this.last.multi) {
            el.attr('placeholder', '[' + w2utils.lang('Multiple Fields') + ']')
            el.w2field('clear')
        } else {
            el.attr('placeholder', w2utils.lang(this.last.label))
        }
        if (el.val() != this.last.search) {
            let val = this.last.search
            let tmp = el.data('w2field')
            if (tmp) val = tmp.format(val)
            el.val(val)
        }

        // -- body
        this.refreshBody()

        // -- footer
        if (this.show.footer) {
            $('#grid_'+ this.name +'_footer').html(this.getFooterHTML()).show()
        } else {
            $('#grid_'+ this.name +'_footer').hide()
        }
        // show/hide clear search link
        let $clear = $('#grid_'+ this.name +'_searchClear')
        $clear.hide()
        this.searchData.some((item) => {
            let tmp = this.getSearch(item.field)
            if (this.last.multi || (tmp && !tmp.hidden && ['list', 'enum'].indexOf(tmp.type) == -1)) {
                $clear.show()
                return true
            }
        })
        // all selected?
        let sel = this.last.selection,
            areAllSelected = (this.records.length > 0 && sel.indexes.length == this.records.length),
            areAllSearchedSelected = (sel.indexes.length > 0 && this.searchData.length !== 0 && sel.indexes.length == this.last.searchIds.length)
        if (areAllSelected || areAllSearchedSelected) {
            $('#grid_'+ this.name +'_check_all').prop('checked', true)
        } else {
            $('#grid_'+ this.name +'_check_all').prop('checked', false)
        }
        // show number of selected
        this.status()
        // collapse all records
        let rows = this.find({ 'w2ui.expanded': true }, true)
        for (let r = 0; r < rows.length; r++) {
            let tmp = this.records[rows[r]].w2ui
            if (tmp && !Array.isArray(tmp.children)) {
                tmp.expanded = false
            }
        }
        // mark selection
        if (this.markSearch) {
            setTimeout(() => {
                // mark all search strings
                let search = []
                for (let s = 0; s < this.searchData.length; s++) {
                    let sdata = this.searchData[s]
                    let fld = this.getSearch(sdata.field)
                    if (!fld || fld.hidden) continue
                    let ind = this.getColumn(sdata.field, true)
                    search.push({ field: sdata.field, search: sdata.value, col: ind })
                }
                if (search.length > 0) {
                    search.forEach((item) => {
                        $(this.box).find('td[col="'+ item.col +'"]').not('.w2ui-head').w2marker(item.search)
                    })
                }
            }, 50)
        }
        // enable/disable toolbar search button
        if (this.show.toolbarSave) {
            if (this.getChanges().length > 0) this.toolbar.enable('w2ui-save'); else this.toolbar.disable('w2ui-save')
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.resize()
        this.addRange('selection')
        setTimeout(() => { // allow to render first
            this.resize() // needed for horizontal scroll to show (do not remove)
            this.scroll()
        }, 1)

        if (this.reorderColumns && !this.last.columnDrag) {
            this.last.columnDrag = this.initColumnDrag()
        } else if (!this.reorderColumns && this.last.columnDrag) {
            this.last.columnDrag.remove()
        }
        return (new Date()).getTime() - time
    }

    refreshBody() {
        // -- separate summary
        let obj = this,
            tmp = this.find({ 'w2ui.summary': true }, true)
        if (tmp.length > 0) {
            for (let t = 0; t < tmp.length; t++) this.summary.push(this.records[tmp[t]])
            for (let t = tmp.length-1; t >= 0; t--) this.records.splice(tmp[t], 1)
        }

        // -- body
        this.scroll() // need to calculate virtual scolling for columns
        let recHTML = this.getRecordsHTML()
        let colHTML = this.getColumnsHTML()
        let bodyHTML =
            '<div id="grid_'+ this.name +'_frecords" class="w2ui-grid-frecords" style="margin-bottom: '+ (w2utils.scrollBarSize() - 1) +'px;">'+
                recHTML[0] +
            '</div>'+
            '<div id="grid_'+ this.name +'_records" class="w2ui-grid-records" onscroll="w2ui[\''+ this.name +'\'].scroll(event);">' +
                recHTML[1] +
            '</div>'+
            '<div id="grid_'+ this.name +'_scroll1" class="w2ui-grid-scroll1" style="height: '+ w2utils.scrollBarSize() +'px"></div>'+
            // Columns need to be after to be able to overlap
            '<div id="grid_'+ this.name +'_fcolumns" class="w2ui-grid-fcolumns">'+
            '    <table><tbody>'+ colHTML[0] +'</tbody></table>'+
            '</div>'+
            '<div id="grid_'+ this.name +'_columns" class="w2ui-grid-columns">'+
            '    <table><tbody>'+ colHTML[1] +'</tbody></table>'+
            '</div>'

        let gridBody = $('#grid_'+ this.name +'_body', this.box).html(bodyHTML),
            records = $('#grid_'+ this.name +'_records', this.box)
        let frecords = $('#grid_'+ this.name +'_frecords', this.box)
        let self = this
        if (this.selectType == 'row') {
            records
                .on('mouseover mouseout', 'tr', function(event) {
                    $('#grid_'+ self.name +'_frec_' + w2utils.escapeId($(this).attr('recid'))).toggleClass('w2ui-record-hover', event.type == 'mouseover')
                })
            frecords
                .on('mouseover mouseout', 'tr', function(event) {
                    $('#grid_'+ self.name +'_rec_' + w2utils.escapeId($(this).attr('recid'))).toggleClass('w2ui-record-hover', event.type == 'mouseover')
                })
        }
        if(w2utils.isIOS)
            records.add(frecords)
                .on('click', 'tr', function(ev) {
                    self.dblClick($(this).attr('recid'), ev)
                })
        else
            records.add(frecords)
                .on('click', 'tr', function(ev) {
                    self.click($(this).attr('recid'), ev)
                })
                .on('contextmenu', 'tr', function(ev) {
                    self.contextMenu($(this).attr('recid'), null, ev)
                })

        // enable scrolling on frozen records,
        gridBody.data('scrolldata', { lastTime: 0, lastDelta: 0, time: 0 })
            .find('.w2ui-grid-frecords')
            .on('mousewheel DOMMouseScroll ', function(event) {
                event.preventDefault()

                let e = event.originalEvent,
                    scrolldata = gridBody.data('scrolldata'),
                    recordsContainer = $(this).siblings('.w2ui-grid-records').addBack().filter('.w2ui-grid-records'),
                    amount = typeof e.wheelDelta != null ? e.wheelDelta * -1 / 120 : (e.detail || e.deltaY) / 3, // normalizing scroll speed
                    newScrollTop = recordsContainer.scrollTop()

                scrolldata.time = +new Date()

                if (scrolldata.lastTime < scrolldata.time - 150) {
                    scrolldata.lastDelta = 0
                }

                scrolldata.lastTime = scrolldata.time
                scrolldata.lastDelta += amount

                if (Math.abs(scrolldata.lastDelta) < 1) {
                    amount = 0
                } else {
                    amount = Math.round(scrolldata.lastDelta)
                }
                gridBody.data('scrolldata', scrolldata)

                // make scroll amount dependent on visible rows
                amount *= (Math.round(records.height() / obj.recordHeight) - 1) * obj.recordHeight / 4
                recordsContainer.stop().animate({ 'scrollTop': newScrollTop + amount }, 250, 'linear')
            })

        if (this.records.length === 0 && this.msgEmpty) {
            $('#grid_'+ this.name +'_body')
                .append('<div id="grid_'+ this.name + '_empty_msg" class="w2ui-grid-empty-msg"><div>'+ this.msgEmpty +'</div></div>')
        } else if ($('#grid_'+ this.name +'_empty_msg').length > 0) {
            $('#grid_'+ this.name +'_empty_msg').remove()
        }
        // show summary records
        if (this.summary.length > 0) {
            let sumHTML = this.getSummaryHTML()
            $('#grid_'+ this.name +'_fsummary').html(sumHTML[0]).show()
            $('#grid_'+ this.name +'_summary').html(sumHTML[1]).show()
        } else {
            $('#grid_'+ this.name +'_fsummary').hide()
            $('#grid_'+ this.name +'_summary').hide()
        }
    }

    render(box) {
        let obj = this
        let time = (new Date()).getTime()
        if (box != null) {
            if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-grid w2ui-inactive')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'render', box: box })
        if (edata.isCancelled === true) return
        // reset needed if grid existed
        this.reset(true)
        // --- default search field
        if (!this.last.field) {
            if (!this.multiSearch || !this.show.searchAll) {
                let tmp = 0
                while (tmp < this.searches.length && (this.searches[tmp].hidden || this.searches[tmp].simple === false)) tmp++
                if (tmp >= this.searches.length) {
                    // all searches are hidden
                    this.last.field = ''
                    this.last.label = ''
                } else {
                    this.last.field = this.searches[tmp].field
                    this.last.label = this.searches[tmp].label
                }
            } else {
                this.last.field = 'all'
                this.last.label = w2utils.lang('All Fields')
            }
        }
        // insert elements
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-grid w2ui-inactive')
            .html('<div class="w2ui-grid-box">'+
                  '    <div id="grid_'+ this.name +'_header" class="w2ui-grid-header"></div>'+
                  '    <div id="grid_'+ this.name +'_toolbar" class="w2ui-grid-toolbar"></div>'+
                  '    <div id="grid_'+ this.name +'_body" class="w2ui-grid-body"></div>'+
                  '    <div id="grid_'+ this.name +'_fsummary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                  '    <div id="grid_'+ this.name +'_summary" class="w2ui-grid-body w2ui-grid-summary"></div>'+
                  '    <div id="grid_'+ this.name +'_footer" class="w2ui-grid-footer"></div>'+
                  '    <textarea id="grid_'+ this.name +'_focus" class="w2ui-grid-focus-input" '+
                            (this.tabIndex ? 'tabindex="' + this.tabIndex + '"' : '')+
                            (w2utils.isIOS ? 'readonly' : '') +'></textarea>'+ // readonly needed on android not to open keyboard
                  '</div>')
        if (this.selectType != 'row') $(this.box).addClass('w2ui-ss')
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // init toolbar
        this.initToolbar()
        if (this.toolbar != null) this.toolbar.render($('#grid_'+ this.name +'_toolbar')[0])
        // reinit search_all
        if (this.last.field && this.last.field != 'all') {
            let sd = this.searchData
            setTimeout(() => { this.initAllField(this.last.field, (sd.length == 1 ? sd[0].value : null)) }, 1)
        }
        // init footer
        $('#grid_'+ this.name +'_footer').html(this.getFooterHTML())
        // refresh
        if (!this.last.state) this.last.state = this.stateSave(true) // initial default state
        this.stateRestore()
        if (url) { this.clear(); this.refresh() } // show empty grid (need it) - should it be only for remote data source
        // if hidden searches - apply it
        let hasHiddenSearches = false
        for (let i = 0; i < this.searches.length; i++) {
            if (this.searches[i].hidden) { hasHiddenSearches = true; break }
        }
        if (hasHiddenSearches) {
            this.searchReset(false) // will call reload
            if (!url) setTimeout(() => { this.searchReset() }, 1)
        } else {
            this.reload()
        }
        // focus
        $(this.box).find('#grid_'+ this.name + '_focus')
            .on('focus', function (event) {
                clearTimeout(obj.last.kbd_timer)
                if (!obj.hasFocus) obj.focus()
            })
            .on('blur', function (event) {
                clearTimeout(obj.last.kbd_timer)
                obj.last.kbd_timer = setTimeout(() => {
                    if (obj.hasFocus) { obj.blur() }
                }, 100) // need this timer to be 100 ms
            })
            .on('paste', function (event) {
                let cd = (event.originalEvent.clipboardData ? event.originalEvent.clipboardData : null)
                if (cd && cd.types && cd.types.indexOf('text/plain') != -1) {
                    event.preventDefault()
                    let text = cd.getData('text/plain')
                    if (text.indexOf('\r') != -1 && text.indexOf('\n') == -1) {
                        text = text.replace(/\r/g, '\n')
                    }
                    w2ui[obj.name].paste(text)
                } else {
                    // for older browsers
                    let el = this
                    setTimeout(() => { w2ui[obj.name].paste(el.value); el.value = '' }, 1)
                }
            })
            .on('keydown', function (event) {
                w2ui[obj.name].keydown.call(w2ui[obj.name], event)
            })
        // init mouse events for mouse selection
        let edataCol // event for column select
        $(this.box).off('mousedown').on('mousedown', mouseStart)
        this.updateToolbar()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // attach to resize event
        if ($('.w2ui-layout').length === 0) { // if there is layout, it will send a resize event
            $(window)
                .off('resize.w2ui-'+ obj.name)
                .on('resize.w2ui-'+ obj.name, function (event) {
                    if (w2ui[obj.name] == null) {
                        $(window).off('resize.w2ui-'+ obj.name)
                    } else {
                        w2ui[obj.name].resize()
                    }
                })
        }
        return (new Date()).getTime() - time

        function mouseStart (event) {
            if (event.which != 1) return // if not left mouse button
            // restore css user-select
            if (obj.last.userSelect == 'text') {
                delete obj.last.userSelect
                $(obj.box).find('.w2ui-grid-body').css(w2utils.cssPrefix('user-select', 'none'))
            }
            // regular record select
            if (obj.selectType == 'row' && ($(event.target).parents().hasClass('w2ui-head') || $(event.target).hasClass('w2ui-head'))) return
            if (obj.last.move && obj.last.move.type == 'expand') return
            // if altKey - alow text selection
            if (event.altKey) {
                $(obj.box).find('.w2ui-grid-body').css(w2utils.cssPrefix('user-select', 'text'))
                obj.selectNone()
                obj.last.move = { type: 'text-select' }
                obj.last.userSelect = 'text'
            } else {
                let tmp = event.target
                let pos = {
                    x: event.offsetX - 10,
                    y: event.offsetY - 10
                }
                let tmps = false
                while (tmp) {
                    if (tmp.classList && tmp.classList.contains('w2ui-grid')) break
                    if (tmp.tagName && tmp.tagName.toUpperCase() == 'TD') tmps = true
                    if (tmp.tagName && tmp.tagName.toUpperCase() != 'TR' && tmps == true) {
                        pos.x += tmp.offsetLeft
                        pos.y += tmp.offsetTop
                    }
                    tmp = tmp.parentNode
                }

                obj.last.move = {
                    x      : event.screenX,
                    y      : event.screenY,
                    divX   : 0,
                    divY   : 0,
                    focusX : pos.x,
                    focusY : pos.y,
                    recid  : $(event.target).parents('tr').attr('recid'),
                    column : parseInt(event.target.tagName.toUpperCase() == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col')),
                    type   : 'select',
                    ghost  : false,
                    start  : true
                }
                if (obj.last.move.recid == null) obj.last.move.type = 'select-column'
                // set focus to grid
                let target = event.target
                let $input = $(obj.box).find('#grid_'+ obj.name + '_focus')
                // move input next to cursor so screen does not jump
                if (obj.last.move) {
                    let sLeft = obj.last.move.focusX
                    let sTop = obj.last.move.focusY
                    let $owner = $(target).parents('table').parent()
                    if ($owner.hasClass('w2ui-grid-records') || $owner.hasClass('w2ui-grid-frecords')
                            || $owner.hasClass('w2ui-grid-columns') || $owner.hasClass('w2ui-grid-fcolumns')
                            || $owner.hasClass('w2ui-grid-summary')) {
                        sLeft = obj.last.move.focusX - $(obj.box).find('#grid_'+ obj.name +'_records').scrollLeft()
                        sTop = obj.last.move.focusY - $(obj.box).find('#grid_'+ obj.name +'_records').scrollTop()
                    }
                    if ($(target).hasClass('w2ui-grid-footer') || $(target).parents('div.w2ui-grid-footer').length > 0) {
                        sTop = $(obj.box).find('#grid_'+ obj.name +'_footer').position().top
                    }
                    // if clicked on toolbar
                    if ($owner.hasClass('w2ui-scroll-wrapper') && $owner.parent().hasClass('w2ui-toolbar')) {
                        sLeft = obj.last.move.focusX - $owner.scrollLeft()
                    }
                    $input.css({
                        left: sLeft - 10,
                        top : sTop
                    })
                }
                // if toolbar input is clicked
                setTimeout(() => {
                    if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(target.tagName.toUpperCase()) != -1) {
                        $(target).focus()
                    } else {
                        if (!$input.is(':focus')) $input.focus()
                    }
                }, 50)
                // disable click select for this condition
                if (!obj.multiSelect && !obj.reorderRows && obj.last.move.type == 'drag') {
                    delete obj.last.move
                }
            }
            if (obj.reorderRows == true) {
                let el = event.target
                if (el.tagName.toUpperCase() != 'TD') el = $(el).parents('td')[0]
                if ($(el).hasClass('w2ui-col-number') || $(el).hasClass('w2ui-col-order')) {
                    obj.selectNone()
                    obj.last.move.reorder = true
                    // supress hover
                    let eColor = $(obj.box).find('.w2ui-even.w2ui-empty-record').css('background-color')
                    let oColor = $(obj.box).find('.w2ui-odd.w2ui-empty-record').css('background-color')
                    $(obj.box).find('.w2ui-even td').not('.w2ui-col-number').css('background-color', eColor)
                    $(obj.box).find('.w2ui-odd td').not('.w2ui-col-number').css('background-color', oColor)
                    // display empty record and ghost record
                    let mv = obj.last.move
                    if (!mv.ghost) {
                        let row = $('#grid_'+ obj.name + '_rec_'+ mv.recid)
                        let tmp = row.parents('table').find('tr:first-child').clone()
                        mv.offsetY = event.offsetY
                        mv.from = mv.recid
                        mv.pos = row.position()
                        mv.ghost = $(row).clone(true)
                        mv.ghost.removeAttr('id')
                        row.find('td').remove()
                        row.append('<td colspan="1000"><div style="height: '+ obj.recordHeight +'px; background-color: #eee; border-bottom: 1px dashed #aaa; border-top: 1px dashed #aaa;"></div></td>')
                        let recs = $(obj.box).find('.w2ui-grid-records')
                        recs.append('<div id="grid_'+ obj.name + '_ghost_line" style="position: absolute; z-index: 999999; pointer-events: none; width: 100%;"></div>')
                        recs.append('<table id="grid_'+ obj.name + '_ghost" style="position: absolute; z-index: 999998; opacity: 0.9; pointer-events: none;"></table>')
                        $('#grid_'+ obj.name + '_ghost').append(tmp).append(mv.ghost)
                    }
                    let ghost = $('#grid_'+ obj.name + '_ghost')
                    let recs = $(obj.box).find('.w2ui-grid-records')
                    ghost.css({
                        top  : mv.pos.top + recs.scrollTop(),
                        left : mv.pos.left,
                        'border-top'    : '1px solid #aaa',
                        'border-bottom' : '1px solid #aaa'
                    })
                } else {
                    obj.last.move.reorder = false
                }
            }
            $(document)
                .on('mousemove.w2ui-' + obj.name, mouseMove)
                .on('mouseup.w2ui-' + obj.name, mouseStop)
            // needed when grid grids are nested, see issue #1275
            event.stopPropagation()
        }

        function mouseMove (event) {
            let mv = obj.last.move
            if (!mv || ['select', 'select-column'].indexOf(mv.type) == -1) return
            mv.divX = (event.screenX - mv.x)
            mv.divY = (event.screenY - mv.y)
            if (Math.abs(mv.divX) <= 1 && Math.abs(mv.divY) <= 1) return // only if moved more then 1px
            obj.last.cancelClick = true
            if (obj.reorderRows == true && obj.last.move.reorder) {
                let recs = $(obj.box).find('.w2ui-grid-records')
                let tmp = $(event.target).parents('tr')
                let recid = tmp.attr('recid')
                if (recid == '-none-') recid = 'bottom'
                if (recid != mv.from) {
                    // let row1 = $('#grid_'+ obj.name + '_rec_'+ mv.recid)
                    let row2 = $('#grid_'+ obj.name + '_rec_'+ recid)
                    $(obj.box).find('.insert-before')
                    row2.addClass('insert-before')
                    // MOVABLE GHOST
                    // if (event.screenY - mv.lastY < 0) row1.after(row2); else row2.after(row1);
                    mv.lastY = event.screenY
                    mv.to = recid
                    // line to insert before
                    let pos = row2.position()
                    let ghost_line = $('#grid_'+ obj.name + '_ghost_line')
                    if (pos) {
                        ghost_line.css({
                            top  : pos.top + recs.scrollTop(),
                            left : mv.pos.left,
                            'border-top': '2px solid #769EFC'
                        })
                    } else {
                        ghost_line.css({
                            'border-top': '2px solid transparent'
                        })
                    }
                }
                let ghost = $('#grid_'+ obj.name + '_ghost')
                ghost.css({
                    top  : mv.pos.top + mv.divY + recs.scrollTop(),
                    left : mv.pos.left
                })
                return
            }
            if (mv.start && mv.recid) {
                obj.selectNone()
                mv.start = false
            }
            let newSel= []
            let recid = (event.target.tagName.toUpperCase() == 'TR' ? $(event.target).attr('recid') : $(event.target).parents('tr').attr('recid'))
            if (recid == null) {
                // select by dragging columns
                if (obj.selectType == 'row') return
                if (obj.last.move && obj.last.move.type == 'select') return
                let col = parseInt($(event.target).parents('td').attr('col'))
                if (isNaN(col)) {
                    obj.removeRange('column-selection')
                    $(obj.box).find('.w2ui-grid-columns .w2ui-col-header, .w2ui-grid-fcolumns .w2ui-col-header').removeClass('w2ui-col-selected')
                    $(obj.box).find('.w2ui-col-number').removeClass('w2ui-row-selected')
                    delete mv.colRange
                } else {
                    // add all columns in between
                    let newRange = col + '-' + col
                    if (mv.column < col) newRange = mv.column + '-' + col
                    if (mv.column > col) newRange = col + '-' + mv.column
                    // array of selected columns
                    let cols = []
                    let tmp = newRange.split('-')
                    for (let ii = parseInt(tmp[0]); ii <= parseInt(tmp[1]); ii++) {
                        cols.push(ii)
                    }
                    if (mv.colRange != newRange) {
                        edataCol = obj.trigger({ phase: 'before', type: 'columnSelect', target: obj.name, columns: cols, isCancelled: false }) // initial isCancelled
                        if (edataCol.isCancelled !== true) {
                            if (mv.colRange == null) obj.selectNone()
                            // highlight columns
                            let tmp = newRange.split('-')
                            $(obj.box).find('.w2ui-grid-columns .w2ui-col-header, .w2ui-grid-fcolumns .w2ui-col-header').removeClass('w2ui-col-selected')
                            for (let j = parseInt(tmp[0]); j <= parseInt(tmp[1]); j++) {
                                $(obj.box).find('#grid_'+ obj.name +'_column_' + j + ' .w2ui-col-header').addClass('w2ui-col-selected')
                            }
                            $(obj.box).find('.w2ui-col-number').not('.w2ui-head').addClass('w2ui-row-selected')
                            // show new range
                            mv.colRange = newRange
                            obj.removeRange('column-selection')
                            obj.addRange({
                                name  : 'column-selection',
                                range : [{ recid: obj.records[0].recid, column: tmp[0] }, { recid: obj.records[obj.records.length-1].recid, column: tmp[1] }],
                                style : 'background-color: rgba(90, 145, 234, 0.1)'
                            })
                        }
                    }
                }

            } else { // regular selection

                let ind1 = obj.get(mv.recid, true)
                // this happens when selection is started on summary row
                if (ind1 == null || (obj.records[ind1] && obj.records[ind1].recid != mv.recid)) return
                let ind2 = obj.get(recid, true)
                // this happens when selection is extended into summary row (a good place to implement scrolling)
                if (ind2 == null) return
                let col1 = parseInt(mv.column)
                let col2 = parseInt(event.target.tagName.toUpperCase() == 'TD' ? $(event.target).attr('col') : $(event.target).parents('td').attr('col'))
                if (isNaN(col1) && isNaN(col2)) { // line number select entire record
                    col1 = 0
                    col2 = obj.columns.length-1
                }
                if (ind1 > ind2) { let tmp = ind1; ind1 = ind2; ind2 = tmp }
                // check if need to refresh
                let tmp = 'ind1:'+ ind1 +',ind2;'+ ind2 +',col1:'+ col1 +',col2:'+ col2
                if (mv.range == tmp) return
                mv.range = tmp
                for (let i = ind1; i <= ind2; i++) {
                    if (obj.last.searchIds.length > 0 && obj.last.searchIds.indexOf(i) == -1) continue
                    if (obj.selectType != 'row') {
                        if (col1 > col2) { let tmp = col1; col1 = col2; col2 = tmp }
                        for (let c = col1; c <= col2; c++) {
                            if (obj.columns[c].hidden) continue
                            newSel.push({ recid: obj.records[i].recid, column: parseInt(c) })
                        }
                    } else {
                        newSel.push(obj.records[i].recid)
                    }
                }
                if (obj.selectType != 'row') {
                    let sel = obj.getSelection()
                    // add more items
                    let tmp = []
                    for (let ns = 0; ns < newSel.length; ns++) {
                        let flag = false
                        for (let s = 0; s < sel.length; s++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true
                        if (!flag) tmp.push({ recid: newSel[ns].recid, column: newSel[ns].column })
                    }
                    obj.select(tmp)
                    // remove items
                    tmp = []
                    for (let s = 0; s < sel.length; s++) {
                        let flag = false
                        for (let ns = 0; ns < newSel.length; ns++) if (newSel[ns].recid == sel[s].recid && newSel[ns].column == sel[s].column) flag = true
                        if (!flag) tmp.push({ recid: sel[s].recid, column: sel[s].column })
                    }
                    obj.unselect(tmp)
                } else {
                    if (obj.multiSelect) {
                        let sel = obj.getSelection()
                        for (let ns = 0; ns < newSel.length; ns++) {
                            if (sel.indexOf(newSel[ns]) == -1) obj.select(newSel[ns]) // add more items
                        }
                        for (let s = 0; s < sel.length; s++) {
                            if (newSel.indexOf(sel[s]) == -1) obj.unselect(sel[s]) // remove items
                        }
                    }
                }
            }
        }

        function mouseStop (event) {
            let mv = obj.last.move
            setTimeout(() => { delete obj.last.cancelClick }, 1)
            if ($(event.target).parents().hasClass('.w2ui-head') || $(event.target).hasClass('.w2ui-head')) return
            if (mv && ['select', 'select-column'].indexOf(mv.type) != -1) {
                if (mv.colRange != null && edataCol.isCancelled !== true) {
                    let tmp = mv.colRange.split('-')
                    let sel = []
                    for (let i = 0; i < obj.records.length; i++) {
                        let cols = []
                        for (let j = parseInt(tmp[0]); j <= parseInt(tmp[1]); j++) cols.push(j)
                        sel.push({ recid: obj.records[i].recid, column: cols })
                    }
                    obj.removeRange('column-selection')
                    obj.trigger($.extend(edataCol, { phase: 'after' }))
                    obj.select(sel)
                }
                if (obj.reorderRows == true && obj.last.move.reorder) {
                    // event
                    let edata = obj.trigger({ phase: 'before', target: obj.name, type: 'reorderRow', recid: mv.from, moveAfter: mv.to })
                    if (edata.isCancelled === true) {
                        $('#grid_'+ obj.name + '_ghost').remove()
                        $('#grid_'+ obj.name + '_ghost_line').remove()
                        obj.refresh()
                        delete obj.last.move
                        return
                    }
                    // default behavior
                    let ind1 = obj.get(mv.from, true)
                    let ind2 = obj.get(mv.to, true)
                    if (mv.to == 'bottom') ind2 = obj.records.length // end of list
                    let tmp = obj.records[ind1]
                    // swap records
                    if (ind1 != null && ind2 != null) {
                        obj.records.splice(ind1, 1)
                        if (ind1 > ind2) {
                            obj.records.splice(ind2, 0, tmp)
                        } else {
                            obj.records.splice(ind2 - 1, 0, tmp)
                        }
                    }
                    $('#grid_'+ obj.name + '_ghost').remove()
                    $('#grid_'+ obj.name + '_ghost_line').remove()
                    obj.refresh()
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                }
            }
            delete obj.last.move
            $(document).off('.w2ui-' + obj.name)
        }
    }

    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'destroy' })
        if (edata.isCancelled === true) return
        // remove all events
        $(this.box).off()
        // clean up
        if (typeof this.toolbar == 'object' && this.toolbar.destroy) this.toolbar.destroy()
        if ($(this.box).find('#grid_'+ this.name +'_body').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-grid w2ui-inactive')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    // ===========================================
    // --- Internal Functions

    initColumnOnOff() {
        if (!this.show.toolbarColumns) return
        // line number
        let col_html = '<div class="w2ui-col-on-off">'+
            '<table><tbody>'+
            '<tr id="grid_'+ this.name +'_column_ln_check" onclick="w2ui[\''+ this.name +'\'].columnOnOff(event, \'line-numbers\'); event.stopPropagation();">'+
            '   <td style="width: 30px; text-align: center; padding-right: 3px; color: #888;">'+
            '      <span class="w2ui-column-check w2ui-icon-'+ (!this.show.lineNumbers ? 'empty' : 'check') +'"></span>'+
            '   </td>'+
            '   <td>'+
            '      <label>'+ w2utils.lang('Line #') +'</label>'+
            '   </td>'+
            '</tr>'
        // columns
        for (let c = 0; c < this.columns.length; c++) {
            let col = this.columns[c]
            let tmp = this.columns[c].text
            if (col.hideable === false) continue
            if (!tmp && this.columns[c].tooltip) tmp = this.columns[c].tooltip
            if (!tmp) tmp = '- column '+ (parseInt(c) + 1) +' -'
            col_html +=
                '<tr id="grid_'+ this.name +'_column_'+ c +'_check" '+
                '       onclick="w2ui[\''+ this.name +'\'].columnOnOff(event, \''+ col.field +'\'); event.stopPropagation();">'+
                '   <td style="width: 30px; text-align: center; padding-right: 3px; color: #888;">'+
                '      <span class="w2ui-column-check w2ui-icon-'+ (col.hidden ? 'empty' : 'check') +'"></span>'+
                '   </td>'+
                '   <td>'+
                '       <label>'+ w2utils.stripTags(tmp) +'</label>'+
                '   </td>'+
                '</tr>'
        }
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        // devider
        if ((url && this.show.skipRecords) || this.show.saveRestoreState) {
            col_html += '<tr style="pointer-events: none"><td colspan="2"><div style="border-top: 1px solid #ddd;"></div></td></tr>'
        }
        // skip records
        if (url && this.show.skipRecords) {
            col_html +=
                    '<tr><td colspan="2" style="padding: 0px">'+
                    '    <div style="cursor: pointer; padding: 2px 8px; cursor: default">'+ w2utils.lang('Skip') +
                    '        <input type="text" style="width: 60px" value="'+ this.offset +'" '+
                    '            onkeydown="if ([48,49,50,51,52,53,54,55,56,57,58,13,8,46,37,39].indexOf(event.keyCode) == -1) { event.preventDefault() }"'+
                    '            onkeypress="if (event.keyCode == 13) { '+
                    '               w2ui[\''+ this.name +'\'].skip(this.value); '+
                    '               jQuery(\'.w2ui-overlay\')[0].hide(); '+
                    '            }"/> '+ w2utils.lang('Records')+
                    '    </div>'+
                    '</td></tr>'
        }
        // save/restore state
        if (this.show.saveRestoreState) {
            col_html += '<tr><td colspan="2" onclick="let grid = w2ui[\''+ this.name +'\']; grid.toolbar.uncheck(\'w2ui-column-on-off\'); grid.stateSave();">'+
                        '    <div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Save Grid State') + '</div>'+
                        '</td></tr>'+
                        '<tr><td colspan="2" onclick="let grid = w2ui[\''+ this.name +'\']; grid.toolbar.uncheck(\'w2ui-column-on-off\'); grid.stateReset();">'+
                        '    <div style="cursor: pointer; padding: 4px 8px; cursor: default">'+ w2utils.lang('Restore Default State') + '</div>'+
                        '</td></tr>'
        }
        col_html += '</tbody></table></div>'
        this.toolbar.get('w2ui-column-on-off').html = col_html
    }

    /**
     *
     * @param box, grid object
     * @returns {{remove: Function}} contains a closure around all events to ensure they are removed from the dom
     */
    initColumnDrag(box) {
        //throw error if using column groups
        if (this.columnGroups && this.columnGroups.length) throw 'Draggable columns are not currently supported with column groups.'

        let obj = this,
            _dragData = {}
        _dragData.lastInt = undefined
        _dragData.pressed = false
        _dragData.timeout = null;_dragData.columnHead = null

        //attach original event listener
        $(obj.box).on('mousedown', dragColStart)
        $(obj.box).on('mouseup', catchMouseup)

        function catchMouseup(){
            _dragData.pressed = false
            clearTimeout(_dragData.timeout)
        }
        /**
         *
         * @param event, mousedown
         * @returns {boolean} false, preventsDefault
         */
        function dragColStart (event) {
            if (_dragData.timeout) clearTimeout(_dragData.timeout)
            let self = this
            _dragData.pressed = true

            _dragData.timeout = setTimeout(() => {
                // When dragging a column for reordering, a quick release and a secondary
                // click may result in a bug where the column is ghosted to the screen,
                // but can no longer be docked back into the header.  It simply floats and you
                // can no longer interact with it.
                // The erronius event thats fired will have _dragData.numberPreColumnsPresent === 0
                // populated, wheras a valid event will not.
                // if we see the erronius event, dont allow that second click to register, which results
                // in the floating column remaining under the mouse's control.
                if (!_dragData.pressed || _dragData.numberPreColumnsPresent === 0) return

                let edata,
                    columns,
                    selectedCol,
                    origColumn,
                    origColumnNumber,
                    invalidPreColumns = [ 'w2ui-col-number', 'w2ui-col-expand', 'w2ui-col-select' ],
                    invalidPostColumns = [ 'w2ui-head-last' ],
                    invalidColumns = invalidPreColumns.concat(invalidPostColumns),
                    preColumnsSelector = '.w2ui-col-number, .w2ui-col-expand, .w2ui-col-select',
                    preColHeadersSelector = '.w2ui-head.w2ui-col-number, .w2ui-head.w2ui-col-expand, .w2ui-head.w2ui-col-select'

                // do nothing if it is not a header
                if (!$(event.originalEvent.target).parents().hasClass('w2ui-head')) return

                // do nothing if it is an invalid column
                for (let i = 0, l = invalidColumns.length; i < l; i++){
                    if ($(event.originalEvent.target).parents().hasClass(invalidColumns[ i ])) return
                }

                _dragData.numberPreColumnsPresent = $(obj.box).find(preColHeadersSelector).length

                //start event for drag start
                _dragData.columnHead = origColumn = $(event.originalEvent.target).parents('.w2ui-head')
                _dragData.originalPos = origColumnNumber = parseInt(origColumn.attr('col'), 10)
                edata = obj.trigger({ type: 'columnDragStart', phase: 'before', originalEvent: event, origColumnNumber: origColumnNumber, target: origColumn[0] })
                if (edata.isCancelled === true) return false

                columns = _dragData.columns = $(obj.box).find('.w2ui-head:not(.w2ui-head-last)')

                // add events
                $(document).on('mouseup', dragColEnd)
                $(document).on('mousemove', dragColOver)

                //_dragData.columns.css({ overflow: 'visible' }).children('div').css({ overflow: 'visible' });

                //configure and style ghost image
                _dragData.ghost = $(self).clone(true)

                //hide other elements on ghost except the grid body
                $(_dragData.ghost).find('[col]:not([col="' + _dragData.originalPos + '"]), .w2ui-toolbar, .w2ui-grid-header').remove()
                $(_dragData.ghost).find(preColumnsSelector).remove()
                $(_dragData.ghost).find('.w2ui-grid-body').css({ top: 0 })

                selectedCol = $(_dragData.ghost).find('[col="' + _dragData.originalPos + '"]')
                $(document.body).append(_dragData.ghost)

                $(_dragData.ghost).css({
                    width: 0,
                    height: 0,
                    margin: 0,
                    position: 'fixed',
                    zIndex: 999999,
                    opacity: 0
                }).addClass('.w2ui-grid-ghost').animate({
                    width: selectedCol.width(),
                    height: $(obj.box).find('.w2ui-grid-body:first').height(),
                    left : event.pageX,
                    top : event.pageY,
                    opacity: 0.8
                }, 0)

                //establish current offsets
                _dragData.offsets = []
                for (let i = 0, l = columns.length; i < l; i++) {
                    _dragData.offsets.push($(columns[ i ]).offset().left)
                }

                //conclude event
                obj.trigger($.extend(edata, { phase: 'after' }))
            }, 150)//end timeout wrapper
        }

        function dragColOver(event) {
            if (!_dragData.pressed) return

            let cursorX = event.originalEvent.pageX,
                cursorY = event.originalEvent.pageY,
                offsets = _dragData.offsets,
                lastWidth = $('.w2ui-head:not(.w2ui-head-last)').width()

            _dragData.targetInt = Math.max(_dragData.numberPreColumnsPresent,targetIntersection(cursorX, offsets, lastWidth))

            markIntersection(_dragData.targetInt)
            trackGhost(cursorX, cursorY)
        }

        function dragColEnd(event) {
            _dragData.pressed = false

            let edata,
                target,
                selected,
                columnConfig,
                targetColumn,
                ghosts = $('.w2ui-grid-ghost')

            //start event for drag start
            edata = obj.trigger({ type: 'columnDragEnd', phase: 'before', originalEvent: event, target: _dragData.columnHead[0] })
            if (edata.isCancelled === true) return false

            selected = obj.columns[ _dragData.originalPos ]
            columnConfig = obj.columns
            targetColumn = $(_dragData.columns[ Math.min(_dragData.lastInt, _dragData.columns.length - 1) ])
            target = (_dragData.lastInt < _dragData.columns.length) ? parseInt(targetColumn.attr('col')) : columnConfig.length

            if (target !== _dragData.originalPos + 1 && target !== _dragData.originalPos && targetColumn && targetColumn.length) {
                $(_dragData.ghost).animate({
                    top: $(obj.box).offset().top,
                    left: targetColumn.offset().left,
                    width: 0,
                    height: 0,
                    opacity: 0.2
                }, 300, function() {
                    $(this).remove()
                    ghosts.remove()
                })

                columnConfig.splice(target, 0, $.extend({}, selected))
                columnConfig.splice(columnConfig.indexOf(selected), 1)

            } else {
                $(_dragData.ghost).remove()
                ghosts.remove()
            }

            //_dragData.columns.css({ overflow: '' }).children('div').css({ overflow: '' });

            $(document).off('mouseup', dragColEnd)
            $(document).off('mousemove', dragColOver)
            if (_dragData.marker) _dragData.marker.remove()
            _dragData = {}

            obj.refresh()

            //conclude event
            obj.trigger($.extend(edata, { phase: 'after', targetColumnNumber: target - 1 }))
        }

        function markIntersection(intersection){
            if (!_dragData.marker && !_dragData.markerLeft) {
                _dragData.marker = $('<div class="col-intersection-marker">' +
                    '<div class="top-marker"></div>' +
                    '<div class="bottom-marker"></div>' +
                    '</div>')
                _dragData.markerLeft = $('<div class="col-intersection-marker">' +
                    '<div class="top-marker"></div>' +
                    '<div class="bottom-marker"></div>' +
                    '</div>')
            }

            if (!_dragData.lastInt || _dragData.lastInt !== intersection){
                _dragData.lastInt = intersection
                _dragData.marker.remove()
                _dragData.markerLeft.remove()
                $('.w2ui-head').removeClass('w2ui-col-intersection')

                //if the current intersection is greater than the number of columns add the marker to the end of the last column only
                if (intersection >= _dragData.columns.length) {
                    $(_dragData.columns[ _dragData.columns.length - 1 ]).children('div:last').append(_dragData.marker.addClass('right').removeClass('left'))
                    $(_dragData.columns[ _dragData.columns.length - 1 ]).addClass('w2ui-col-intersection')
                } else if (intersection <= _dragData.numberPreColumnsPresent) {
                    //if the current intersection is on the column numbers place marker on first available column only
                    $(_dragData.columns[ _dragData.numberPreColumnsPresent ]).prepend(_dragData.marker.addClass('left').removeClass('right')).css({ position: 'relative' })
                    $(_dragData.columns[ _dragData.numberPreColumnsPresent ]).prev().addClass('w2ui-col-intersection')
                } else {
                    //otherwise prepend the marker to the targeted column and append it to the previous column
                    $(_dragData.columns[intersection]).children('div:last').prepend(_dragData.marker.addClass('left').removeClass('right'))
                    $(_dragData.columns[intersection]).prev().children('div:last').append(_dragData.markerLeft.addClass('right').removeClass('left')).css({ position: 'relative' })
                    $(_dragData.columns[intersection - 1]).addClass('w2ui-col-intersection')
                }
            }
        }

        function targetIntersection(cursorX, offsets, lastWidth){
            if (cursorX <= offsets[0]) {
                return 0
            } else if (cursorX >= offsets[offsets.length - 1] + lastWidth) {
                return offsets.length
            } else {
                for (let i = 0, l = offsets.length; i < l; i++) {
                    let thisOffset = offsets[ i ]
                    let nextOffset = offsets[ i + 1 ] || offsets[ i ] + lastWidth
                    let midpoint = (nextOffset - offsets[ i ]) / 2 + offsets[ i ]

                    if (cursorX > thisOffset && cursorX <= midpoint) {
                        return i
                    } else if (cursorX > midpoint && cursorX <= nextOffset) {
                        return i + 1
                    }
                }
                return intersection
            }
        }

        function trackGhost(cursorX, cursorY){
            $(_dragData.ghost).css({
                left: cursorX - 10,
                top: cursorY - 10
            })
        }

        //return an object to remove drag if it has ever been enabled
        return {
            remove(){
                $(obj.box).off('mousedown', dragColStart)
                $(obj.box).off('mouseup', catchMouseup)
                $(obj.box).find('.w2ui-head').removeAttr('draggable')
                obj.last.columnDrag = false
            }
        }
    }

    columnOnOff(event, field) {
        let $el = $(event.target).parents('tr').find('.w2ui-column-check')
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'columnOnOff', field: field, originalEvent: event })
        if (edata.isCancelled === true) return
        // regular processing
        let obj = this
        let hide = (!event.shiftKey && !event.metaKey && !event.ctrlKey && !$(event.target).hasClass('w2ui-column-check'))
        // collapse expanded rows
        let rows = obj.find({ 'w2ui.expanded': true }, true)
        for (let r = 0; r < rows.length; r++) {
            let tmp = this.records[r].w2ui
            if (tmp && !Array.isArray(tmp.children)) {
                this.records[r].w2ui.expanded = false
            }
        }
        // show/hide
        if (field == 'line-numbers') {
            this.show.lineNumbers = !this.show.lineNumbers
            if (this.show.lineNumbers) {
                $el.addClass('w2ui-icon-check').removeClass('w2ui-icon-empty')
            } else {
                $el.addClass('w2ui-icon-empty').removeClass('w2ui-icon-check')
            }
            this.refreshBody()
            this.resizeRecords()
        } else {
            let col = this.getColumn(field)
            if (col.hidden) {
                $el.addClass('w2ui-icon-check').removeClass('w2ui-icon-empty')
                setTimeout(() => {
                    obj.showColumn(col.field)
                }, hide ? 0 : 50)
            } else {
                $el.addClass('w2ui-icon-empty').removeClass('w2ui-icon-check')
                setTimeout(() => {
                    obj.hideColumn(col.field)
                }, hide ? 0 : 50)
            }
        }
        if (hide) {
            setTimeout(() => {
                $().w2overlay({ name: obj.name + '_toolbar' })
            }, 40)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }

    scrollToColumn(field) {
        if (field == null)
            return
        let sWidth = 0
        let found = false
        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i]
            if (col.field == field) {
                found = true
                break
            }
            if (col.frozen || col.hidden)
                continue
            let cSize = parseInt(col.sizeCalculated ? col.sizeCalculated : col.size)
            sWidth += cSize
        }
        if (!found)
            return
        this.last.scrollLeft = sWidth+1
        this.scroll()
    }

    initToolbar() {
        // -- if toolbar is true
        if (this.toolbar.render == null) {
            let tmp_items = this.toolbar.items || []
            this.toolbar.items = []
            this.toolbar = new w2toolbar($.extend(true, {}, this.toolbar, { name: this.name +'_toolbar', owner: this }))

            // =============================================
            // ------ Toolbar Generic buttons

            if (this.show.toolbarReload) {
                this.toolbar.items.push($.extend(true, {}, this.buttons.reload))
            }
            if (this.show.toolbarColumns) {
                this.toolbar.items.push($.extend(true, {}, this.buttons.columns))
            }
            if (this.show.toolbarReload || this.show.toolbarColumns) {
                this.toolbar.items.push({ type: 'break', id: 'w2ui-break0' })
            }
            if (this.show.toolbarInput) {
                let html =
                    '<div class="w2ui-toolbar-search">'+
                    '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                    '    <td>'+ this.buttons.search.html +'</td>'+
                    '    <td>'+
                    '        <input type="text" id="grid_'+ this.name +'_search_all" class="w2ui-search-all" tabindex="-1" '+
                    '            autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"'+
                    '            placeholder="'+ w2utils.lang(this.last.label) +'" value="'+ this.last.search +'"'+
                    '            onfocus="let grid = w2ui[\''+ this.name +'\']; clearTimeout(grid.last.kbd_timer); grid.searchShowFields(true); grid.searchClose()"'+
                    '            onkeydown="if (event.keyCode == 13 &amp;&amp; w2utils.isIE) this.onchange();"'+
                    '            onchange="'+
                    '                let grid = w2ui[\''+ this.name +'\']; '+
                    '                let val = this.value; '+
                    '                let sel = jQuery(this).data(\'selected\');'+
                    '                let fld = jQuery(this).data(\'w2field\'); '+
                    '                if (fld) val = fld.clean(val);'+
                    '                if (fld &amp;&amp; fld.type == \'list\' &amp;&amp; sel &amp;&amp; typeof sel.id == \'undefined\') {'+
                    '                   grid.searchReset();'+
                    '                } else {'+
                    '                   grid.search(grid.last.field, val);'+
                    '                }'+
                    '            "/>'+
                    '    </td>'+
                    '    <td>'+
                    '        <div class="w2ui-search-clear" id="grid_'+ this.name +'_searchClear"  '+
                    '             onclick="let obj = w2ui[\''+ this.name +'\']; obj.searchReset();" style="display: none"'+
                    '        >&#160;&#160;</div>'+
                    '    </td>'+
                    '</tr></tbody></table>'+
                    '</div>'
                this.toolbar.items.push({ type: 'html', id: 'w2ui-search', html: html })
            }
            if (this.show.toolbarSearch && this.multiSearch && this.searches.length > 0) {
                this.toolbar.items.push($.extend(true, {}, this.buttons['search-go']))
            }
            if ((this.show.toolbarSearch || this.show.toolbarInput)
                    && (this.show.toolbarAdd || this.show.toolbarEdit || this.show.toolbarDelete || this.show.toolbarSave)) {
                this.toolbar.items.push({ type: 'break', id: 'w2ui-break1' })
            }
            if (this.show.toolbarAdd && Array.isArray(tmp_items)
                    && tmp_items.map((item) => { return item.id }).indexOf(this.buttons.add.id) == -1) {
                this.toolbar.items.push($.extend(true, {}, this.buttons.add))
            }
            if (this.show.toolbarEdit && Array.isArray(tmp_items)
                    && tmp_items.map((item) => { return item.id }).indexOf(this.buttons.edit.id) == -1) {
                this.toolbar.items.push($.extend(true, {}, this.buttons.edit))
            }
            if (this.show.toolbarDelete && Array.isArray(tmp_items)
                    && tmp_items.map((item) => { return item.id }).indexOf(this.buttons.delete.id) == -1) {
                this.toolbar.items.push($.extend(true, {}, this.buttons.delete))
            }
            if (this.show.toolbarSave && Array.isArray(tmp_items)
                    && tmp_items.map((item) => { return item.id }).indexOf(this.buttons.save.id) == -1) {
                if (this.show.toolbarAdd || this.show.toolbarDelete || this.show.toolbarEdit) {
                    this.toolbar.items.push({ type: 'break', id: 'w2ui-break2' })
                }
                this.toolbar.items.push($.extend(true, {}, this.buttons.save))
            }
            // add original buttons
            if (tmp_items) for (let i = 0; i < tmp_items.length; i++) this.toolbar.items.push(tmp_items[i])

            // =============================================
            // ------ Toolbar onClick processing

            this.toolbar.on('click', (event) => {
                let edata = this.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event })
                if (edata.isCancelled === true) return
                let id = event.target
                let edata2
                switch (id) {
                    case 'w2ui-reload':
                        edata2 = this.trigger({ phase: 'before', type: 'reload', target: this.name })
                        if (edata2.isCancelled === true) return false
                        this.reload()
                        this.trigger($.extend(edata2, { phase: 'after' }))
                        break
                    case 'w2ui-column-on-off':
                        this.initColumnOnOff()
                        this.initResize()
                        this.resize()
                        break
                    case 'w2ui-search-advanced':
                        it = this.get(id)
                        if (it.checked) {
                            this.searchClose()
                        } else {
                            this.searchOpen()
                        }
                        // need to cancel event in order to user custom searchOpen/close functions
                        this.toolbar.tooltipHide('w2ui-search-advanced')
                        event.preventDefault()
                        break
                    case 'w2ui-add':
                        // events
                        edata2 = this.trigger({ phase: 'before', target: this.name, type: 'add', recid: null })
                        if (edata2.isCancelled === true) return false
                        this.trigger($.extend(edata2, { phase: 'after' }))
                        // hide all tooltips
                        setTimeout(() => { $().w2tag() }, 20)
                        break
                    case 'w2ui-edit': {
                        let sel = this.getSelection()
                        let recid = null
                        if (sel.length == 1) recid = sel[0]
                        // events
                        edata2 = this.trigger({ phase: 'before', target: this.name, type: 'edit', recid: recid })
                        if (edata2.isCancelled === true) return false
                        this.trigger($.extend(edata2, { phase: 'after' }))
                        // hide all tooltips
                        setTimeout(() => { $().w2tag() }, 20)
                        break
                    }
                    case 'w2ui-delete':
                        this.delete()
                        break
                    case 'w2ui-save':
                        this.save()
                        break
                }
                // no default action
                this.trigger($.extend(edata, { phase: 'after' }))
            })
            this.toolbar.on('refresh', (event) => {
                if (event.target == 'w2ui-search') {
                    let sd = this.searchData
                    setTimeout(() => {
                        this.initAllField(this.last.field, (sd.length == 1 ? sd[0].value : null))
                    }, 1)
                }
            })
        }
    }

    initResize() {
        let obj = this
        $(this.box).find('.w2ui-resizer')
            .off('.grid-col-resize')
            .on('click.grid-col-resize', function(event) {
                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                if (event.preventDefault) event.preventDefault()
            })
            .on('mousedown.grid-col-resize', function(event) {
                if (!event) event = window.event
                obj.last.colResizing = true
                obj.last.tmp = {
                    x   : event.screenX,
                    y   : event.screenY,
                    gx  : event.screenX,
                    gy  : event.screenY,
                    col : parseInt($(this).attr('name'))
                }
                // find tds that will be resized
                obj.last.tmp.tds = $('#grid_'+ obj.name +'_body table tr:first-child td[col='+ obj.last.tmp.col +']')

                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                if (event.preventDefault) event.preventDefault()
                // fix sizes
                for (let c = 0; c < obj.columns.length; c++) {
                    if (obj.columns[c].hidden) continue
                    if (obj.columns[c].sizeOriginal == null) obj.columns[c].sizeOriginal = obj.columns[c].size
                    obj.columns[c].size = obj.columns[c].sizeCalculated
                }
                let edata = { phase: 'before', type: 'columnResize', target: obj.name, column: obj.last.tmp.col, field: obj.columns[obj.last.tmp.col].field }
                edata = obj.trigger($.extend(edata, { resizeBy: 0, originalEvent: event }))
                // set move event
                let timer
                let mouseMove = function(event) {
                    if (obj.last.colResizing != true) return
                    if (!event) event = window.event
                    // event before
                    edata = obj.trigger($.extend(edata, { resizeBy: (event.screenX - obj.last.tmp.gx), originalEvent: event }))
                    if (edata.isCancelled === true) { edata.isCancelled = false; return }
                    // default action
                    obj.last.tmp.x = (event.screenX - obj.last.tmp.x)
                    obj.last.tmp.y = (event.screenY - obj.last.tmp.y)
                    let newWidth =(parseInt(obj.columns[obj.last.tmp.col].size) + obj.last.tmp.x) + 'px'
                    obj.columns[obj.last.tmp.col].size = newWidth
                    if (timer) clearTimeout(timer)
                    timer = setTimeout(() => {
                        obj.resizeRecords()
                        obj.scroll()
                    }, 100)
                    // quick resize
                    obj.last.tmp.tds.css({ width: newWidth })
                    // reset
                    obj.last.tmp.x = event.screenX
                    obj.last.tmp.y = event.screenY
                }
                let mouseUp = function(event) {
                    $(document).off('.grid-col-resize')
                    obj.resizeRecords()
                    obj.scroll()
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after', originalEvent: event }))
                    // need timeout to finish processing events
                    setTimeout(() => { obj.last.colResizing = false }, 1)
                }

                $(document)
                    .off('.grid-col-resize')
                    .on('mousemove.grid-col-resize', mouseMove)
                    .on('mouseup.grid-col-resize', mouseUp)
            })
            .on('dblclick.grid-col-resize', function(event) {
                let colId = parseInt($(this).attr('name')),
                    col = obj.columns[colId],
                    maxDiff = 0

                if (col.autoResize === false) {
                    return true
                }

                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                if (event.preventDefault) event.preventDefault()
                $('.w2ui-grid-records td[col="' + colId + '"] > div', obj.box).each(() => {
                    let thisDiff = this.offsetWidth - this.scrollWidth
                    if (thisDiff < maxDiff) {
                        maxDiff = thisDiff - 3 // 3px buffer needed for Firefox
                    }
                })

                // event before
                let edata = { phase: 'before', type: 'columnAutoResize', target: obj.name, column: col, field: col.field }
                edata = obj.trigger($.extend(edata, { resizeBy: Math.abs(maxDiff), originalEvent: event }))
                if (edata.isCancelled === true) { edata.isCancelled = false; return }

                if (maxDiff < 0) {
                    col.size = Math.min(parseInt(col.size) + Math.abs(maxDiff), col.max || Infinity) + 'px'
                    obj.resizeRecords()
                    obj.resizeRecords() // Why do we have to call it twice in order to show the scrollbar?
                    obj.scroll()
                }

                // event after
                obj.trigger($.extend(edata, { phase: 'after', originalEvent: event }))
            })
            .each((index, el) => {
                let td = $(el).parent()
                $(el).css({
                    'height'      : td.height(),
                    'margin-left' : (td.width() - 3) + 'px'
                })
            })
    }

    resizeBoxes() {
        // elements
        let header = $('#grid_'+ this.name +'_header')
        let toolbar = $('#grid_'+ this.name +'_toolbar')
        let fsummary = $('#grid_'+ this.name +'_fsummary')
        let summary = $('#grid_'+ this.name +'_summary')
        let footer = $('#grid_'+ this.name +'_footer')
        let body = $('#grid_'+ this.name +'_body')

        if (this.show.header) {
            header.css({
                top:   '0px',
                left:  '0px',
                right: '0px'
            })
        }

        if (this.show.toolbar) {
            toolbar.css({
                top:   (0 + (this.show.header ? w2utils.getSize(header, 'height') : 0)) + 'px',
                left:  '0px',
                right: '0px'
            })
        }
        if (this.summary.length > 0) {
            fsummary.css({
                bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)) + 'px'
            })
            summary.css({
                bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)) + 'px',
                right: '0px'
            })
        }
        if (this.show.footer) {
            footer.css({
                bottom: '0px',
                left:  '0px',
                right: '0px'
            })
        }
        body.css({
            top: (0 + (this.show.header ? w2utils.getSize(header, 'height') : 0) + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)) + 'px',
            bottom: (0 + (this.show.footer ? w2utils.getSize(footer, 'height') : 0) + (this.summary.length > 0 ? w2utils.getSize(summary, 'height') : 0)) + 'px',
            left:   '0px',
            right:  '0px'
        })
    }

    resizeRecords() {
        let obj = this
        // remove empty records
        $(this.box).find('.w2ui-empty-record').remove()
        // -- Calculate Column size in PX
        let box = $(this.box)
        let grid = $(this.box).find('> div.w2ui-grid-box')
        let header = $('#grid_'+ this.name +'_header')
        let toolbar = $('#grid_'+ this.name +'_toolbar')
        let summary = $('#grid_'+ this.name +'_summary')
        let fsummary = $('#grid_'+ this.name +'_fsummary')
        let footer = $('#grid_'+ this.name +'_footer')
        let body = $('#grid_'+ this.name +'_body')
        let columns = $('#grid_'+ this.name +'_columns')
        let fcolumns = $('#grid_'+ this.name +'_fcolumns')
        let records = $('#grid_'+ this.name +'_records')
        let frecords = $('#grid_'+ this.name +'_frecords')
        let scroll1 = $('#grid_'+ this.name +'_scroll1')
        let lineNumberWidth = String(this.total).length * 8 + 10
        if (lineNumberWidth < 34) lineNumberWidth = 34 // 3 digit width
        if (this.lineNumberWidth != null) lineNumberWidth = this.lineNumberWidth

        let bodyOverflowX = false
        let bodyOverflowY = false
        let sWidth = 0
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].frozen || this.columns[i].hidden) continue
            let cSize = parseInt(this.columns[i].sizeCalculated ? this.columns[i].sizeCalculated : this.columns[i].size)
            sWidth += cSize
        }
        if (records.width() < sWidth) bodyOverflowX = true
        if (body.height() - columns.height() < $(records).find('>table').height() + (bodyOverflowX ? w2utils.scrollBarSize() : 0)) bodyOverflowY = true

        // body might be expanded by data
        if (!this.fixedBody) {
            // allow it to render records, then resize
            let calculatedHeight = w2utils.getSize(columns, 'height')
                + w2utils.getSize($('#grid_'+ this.name +'_records table'), 'height')
                + (bodyOverflowX ? w2utils.scrollBarSize() : 0)
            this.height = calculatedHeight
                + w2utils.getSize(grid, '+height')
                + (this.show.header ? w2utils.getSize(header, 'height') : 0)
                + (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
                + (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
                + (this.show.footer ? w2utils.getSize(footer, 'height') : 0)
            grid.css('height', this.height)
            body.css('height', calculatedHeight)
            box.css('height', w2utils.getSize(grid, 'height') + w2utils.getSize(box, '+height'))
        } else {
            // fixed body height
            let calculatedHeight = grid.height()
                - (this.show.header ? w2utils.getSize(header, 'height') : 0)
                - (this.show.toolbar ? w2utils.getSize(toolbar, 'height') : 0)
                - (summary.css('display') != 'none' ? w2utils.getSize(summary, 'height') : 0)
                - (this.show.footer ? w2utils.getSize(footer, 'height') : 0)
            body.css('height', calculatedHeight)
        }

        let buffered = this.records.length
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        // apply overflow
        if (!this.fixedBody) { bodyOverflowY = false }
        if (bodyOverflowX || bodyOverflowY) {
            columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show()
            records.css({
                top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                '-webkit-overflow-scrolling': 'touch',
                'overflow-x': (bodyOverflowX ? 'auto' : 'hidden'),
                'overflow-y': (bodyOverflowY ? 'auto' : 'hidden')
            })
        } else {
            columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').hide()
            records.css({
                top: ((this.columnGroups.length > 0 && this.show.columns ? 1 : 0) + w2utils.getSize(columns, 'height')) +'px',
                overflow: 'hidden'
            })
            if (records.length > 0) { this.last.scrollTop = 0; this.last.scrollLeft = 0 } // if no scrollbars, always show top
        }
        if (bodyOverflowX) {
            frecords.css('margin-bottom', w2utils.scrollBarSize())
            scroll1.show()
        } else {
            frecords.css('margin-bottom', 0)
            scroll1.hide()
        }
        frecords.css({ overflow: 'hidden', top: records.css('top') })
        if (this.show.emptyRecords && !bodyOverflowY) {
            let max = Math.floor(records.height() / this.recordHeight) - 1
            let leftover = 0
            if (records[0]) leftover = records[0].scrollHeight - max * this.recordHeight
            if (leftover >= this.recordHeight) {
                leftover -= this.recordHeight
                max++
            }
            if (this.fixedBody) {
                for (let di = buffered; di < max; di++) {
                    addEmptyRow(di, this.recordHeight, this)
                }
                addEmptyRow(max, leftover, this)
            }
        }

        function addEmptyRow(row, height, grid) {
            let html1 = ''
            let html2 = ''
            let htmlp = ''
            html1 += '<tr class="'+ (row % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" recid="-none-" style="height: '+ height +'px">'
            html2 += '<tr class="'+ (row % 2 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-empty-record" recid="-none-" style="height: '+ height +'px">'
            if (grid.show.lineNumbers) html1 += '<td class="w2ui-col-number"></td>'
            if (grid.show.selectColumn) html1 += '<td class="w2ui-grid-data w2ui-col-select"></td>'
            if (grid.show.expandColumn) html1 += '<td class="w2ui-grid-data w2ui-col-expand"></td>'
            html2 += '<td class="w2ui-grid-data-spacer" col="start" style="border-right: 0"></td>'
            if (grid.show.orderColumn) html2 += '<td class="w2ui-grid-data w2ui-col-order" col="order"></td>'
            for (let j = 0; j < grid.columns.length; j++) {
                let col = grid.columns[j]
                if ((col.hidden || j < grid.last.colStart || j > grid.last.colEnd) && !col.frozen) continue
                htmlp = '<td class="w2ui-grid-data" '+ (col.attr != null ? col.attr : '') +' col="'+ j +'"></td>'
                if (col.frozen) html1 += htmlp; else html2 += htmlp
            }
            html1 += '<td class="w2ui-grid-data-last"></td> </tr>'
            html2 += '<td class="w2ui-grid-data-last" col="end"></td> </tr>'
            $('#grid_'+ grid.name +'_frecords > table').append(html1)
            $('#grid_'+ grid.name +'_records > table').append(html2)
        }
        let width_box, percent
        if (body.length > 0) {
            let width_max = parseInt(body.width())
                - (bodyOverflowY ? w2utils.scrollBarSize() : 0)
                - (this.show.lineNumbers ? lineNumberWidth : 0)
                // - (this.show.orderColumn ? 26 : 0)
                - (this.show.selectColumn ? 26 : 0)
                - (this.show.expandColumn ? 26 : 0)
                - 1 // left is 1xp due to border width
            width_box = width_max
            percent = 0
            // gridMinWidth processing
            let restart = false
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.gridMinWidth > 0) {
                    if (col.gridMinWidth > width_box && col.hidden !== true) {
                        col.hidden = true
                        restart = true
                    }
                    if (col.gridMinWidth < width_box && col.hidden === true) {
                        col.hidden = false
                        restart = true
                    }
                }
            }
            if (restart === true) {
                this.refresh()
                return
            }
            // assign PX column s
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.hidden) continue
                if (String(col.size).substr(String(col.size).length-2).toLowerCase() == 'px') {
                    width_max -= parseFloat(col.size)
                    this.columns[i].sizeCalculated = col.size
                    this.columns[i].sizeType = 'px'
                } else {
                    percent += parseFloat(col.size)
                    this.columns[i].sizeType = '%'
                    delete col.sizeCorrected
                }
            }
            // if sum != 100% -- reassign proportionally
            if (percent != 100 && percent > 0) {
                for (let i = 0; i < this.columns.length; i++) {
                    let col = this.columns[i]
                    if (col.hidden) continue
                    if (col.sizeType == '%') {
                        col.sizeCorrected = Math.round(parseFloat(col.size) * 100 * 100 / percent) / 100 + '%'
                    }
                }
            }
            // calculate % columns
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                if (col.hidden) continue
                if (col.sizeType == '%') {
                    if (this.columns[i].sizeCorrected != null) {
                        // make it 1px smaller, so margin of error can be calculated correctly
                        this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.sizeCorrected) / 100) - 1 + 'px'
                    } else {
                        // make it 1px smaller, so margin of error can be calculated correctly
                        this.columns[i].sizeCalculated = Math.floor(width_max * parseFloat(col.size) / 100) - 1 + 'px'
                    }
                }
            }
        }
        // fix margin of error that is due percentage calculations
        let width_cols = 0
        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i]
            if (col.hidden) continue
            if (col.min == null) col.min = 20
            if (parseInt(col.sizeCalculated) < parseInt(col.min)) col.sizeCalculated = col.min + 'px'
            if (parseInt(col.sizeCalculated) > parseInt(col.max)) col.sizeCalculated = col.max + 'px'
            width_cols += parseInt(col.sizeCalculated)
        }
        let width_diff = parseInt(width_box) - parseInt(width_cols)
        if (width_diff > 0 && percent > 0) {
            let i = 0
            while (true) {
                let col = this.columns[i]
                if (col == null) { i = 0; continue }
                if (col.hidden || col.sizeType == 'px') { i++; continue }
                col.sizeCalculated = (parseInt(col.sizeCalculated) + 1) + 'px'
                width_diff--
                if (width_diff === 0) break
                i++
            }
        } else if (width_diff > 0) {
            columns.find('> table > tbody > tr:nth-child(1) td.w2ui-head-last').css('width', w2utils.scrollBarSize()).show()
        }

        // find width of frozen columns
        let fwidth = 1
        if (this.show.lineNumbers) fwidth += lineNumberWidth
        if (this.show.selectColumn) fwidth += 26
        // if (this.show.orderColumn) fwidth += 26;
        if (this.show.expandColumn) fwidth += 26
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].hidden) continue
            if (this.columns[i].frozen) fwidth += parseInt(this.columns[i].sizeCalculated)
        }
        fcolumns.css('width', fwidth)
        frecords.css('width', fwidth)
        fsummary.css('width', fwidth)
        scroll1.css('width', fwidth)
        columns.css('left', fwidth)
        records.css('left', fwidth)
        summary.css('left', fwidth)

        // resize columns
        columns.find('> table > tbody > tr:nth-child(1) td')
            .add(fcolumns.find('> table > tbody > tr:nth-child(1) td'))
            .each((index, el) => {
                // line numbers
                if ($(el).hasClass('w2ui-col-number')) {
                    $(el).css('width', lineNumberWidth)
                }
                // records
                let ind = $(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.colStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        $(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated)
                }
                // last column
                if ($(el).hasClass('w2ui-head-last')) {
                    if (obj.last.colEnd + 1 < obj.columns.length) {
                        let width = 0
                        for (let i = obj.last.colEnd + 1; i < obj.columns.length; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        $(el).css('width', width + 'px')
                    } else {
                        $(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                    }
                }
            })
        // if there are column groups - hide first row (needed for sizing)
        if (columns.find('> table > tbody > tr').length == 3) {
            columns.find('> table > tbody > tr:nth-child(1) td')
                .add(fcolumns.find('> table > tbody > tr:nth-child(1) td'))
                .html('').css({
                    'height' : '0px',
                    'border' : '0px',
                    'padding': '0px',
                    'margin' : '0px'
                })
        }
        // resize records
        records.find('> table > tbody > tr:nth-child(1) td')
            .add(frecords.find('> table > tbody > tr:nth-child(1) td'))
            .each((index, el) =>{
                // line numbers
                if ($(el).hasClass('w2ui-col-number')) {
                    $(el).css('width', lineNumberWidth)
                }
                // records
                let ind = $(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.colStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        $(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated)
                }
                // last column
                if ($(el).hasClass('w2ui-grid-data-last') && $(el).parents('.w2ui-grid-frecords').length === 0) { // not in frecords
                    if (obj.last.colEnd + 1 < obj.columns.length) {
                        let width = 0
                        for (let i = obj.last.colEnd + 1; i < obj.columns.length; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        $(el).css('width', width + 'px')
                    } else {
                        $(el).css('width', (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                    }
                }
            })
        // resize summary
        summary.find('> table > tbody > tr:nth-child(1) td')
            .add(fsummary.find('> table > tbody > tr:nth-child(1) td'))
            .each((index, el) => {
                // line numbers
                if ($(el).hasClass('w2ui-col-number')) {
                    $(el).css('width', lineNumberWidth)
                }
                // records
                let ind = $(el).attr('col')
                if (ind != null) {
                    if (ind == 'start') {
                        let width = 0
                        for (let i = 0; i < obj.last.colStart; i++) {
                            if (!obj.columns[i] || obj.columns[i].frozen || obj.columns[i].hidden) continue
                            width += parseInt(obj.columns[i].sizeCalculated)
                        }
                        $(el).css('width', width + 'px')
                    }
                    if (obj.columns[ind]) $(el).css('width', obj.columns[ind].sizeCalculated)
                }
                // last column
                if ($(el).hasClass('w2ui-grid-data-last') && $(el).parents('.w2ui-grid-frecords').length === 0) { // not in frecords
                    $(el).css('width', w2utils.scrollBarSize() + (width_diff > 0 && percent === 0 ? width_diff : 0) + 'px')
                }
            })
        this.initResize()
        this.refreshRanges()
        // apply last scroll if any
        if ((this.last.scrollTop || this.last.scrollLeft) && records.length > 0) {
            columns.prop('scrollLeft', this.last.scrollLeft)
            records.prop('scrollTop', this.last.scrollTop)
            records.prop('scrollLeft', this.last.scrollLeft)
        }
    }

    getSearchesHTML() {
        let html = '<table cellspacing="0"><tbody>'
        let showBtn = false
        for (let i = 0; i < this.searches.length; i++) {
            let s = this.searches[i]
            s.type = String(s.type).toLowerCase()
            if (s.hidden) continue
            let btn = ''
            if (showBtn == false) {
                btn = '<button type="button" class="w2ui-btn close-btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) obj.searchClose()">X</button>'
                showBtn = true
            }
            if (s.inTag == null) s.inTag = ''
            if (s.outTag == null) s.outTag = ''
            if (s.style == null) s.style = ''
            if (s.type == null) s.type = 'text'
            if (s.label == null && s.caption != null) {
                console.log('NOTICE: grid search.caption property is deprecated, please use search.label. Search ->', s)
                s.label = s.caption
            }
            let operator =
                '<select id="grid_'+ this.name +'_operator_'+ i +'" class="w2ui-input" ' +
                '   onchange="w2ui[\''+ this.name + '\'].initOperator(this, '+ i +')">' +
                    getOperators(s.type, s.operators) +
                '</select>'

            html += '<tr>'+
                    '    <td class="close-btn">'+ btn +'</td>' +
                    '    <td class="caption">'+ (s.label || '') +'</td>' +
                    '    <td class="operator">'+ operator +'</td>'+
                    '    <td class="value">'

            let tmpStyle
            switch (s.type) {
                case 'text':
                case 'alphanumeric':
                case 'hex':
                case 'color':
                case 'list':
                case 'combo':
                case 'enum':
                    tmpStyle = 'width: 250px;'
                    if (['hex', 'color'].indexOf(s.type) != -1) tmpStyle = 'width: 90px;'
                    html += '<input rel="search" type="text" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+
                            '   class="w2ui-input" style="'+ tmpStyle + s.style +'" '+ s.inTag +'/>'
                    break

                case 'int':
                case 'float':
                case 'money':
                case 'currency':
                case 'percent':
                case 'date':
                case 'time':
                case 'datetime':
                    tmpStyle = 'width: 90px;'
                    if (s.type == 'datetime') tmpStyle = 'width: 140px;'
                    html += '<input rel="search" type="text" class="w2ui-input" style="'+ tmpStyle + s.style +'" id="grid_'+ this.name +'_field_'+ i +'" name="'+ s.field +'" '+ s.inTag +'/>'+
                            '<span id="grid_'+ this.name +'_range_'+ i +'" style="display: none">&#160;-&#160;&#160;'+
                            '<input rel="search" type="text" class="w2ui-input" style="'+ tmpStyle + s.style +'" id="grid_'+ this.name +'_field2_'+ i +'" name="'+ s.field +'" '+ s.inTag +'/>'+
                            '</span>'
                    break

                case 'select':
                    html += '<select rel="search" class="w2ui-input" style="'+ s.style +'" id="grid_'+ this.name +'_field_'+ i +'" '+
                            ' name="'+ s.field +'" '+ s.inTag +'></select>'
                    break

            }
            html += s.outTag +
                    '    </td>' +
                    '</tr>'
        }
        html += '<tr>'+
                '    <td colspan="4" class="actions">'+
                '        <div>'+
                '        <button type="button" class="w2ui-btn" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.searchReset(); }">'+ w2utils.lang('Reset') + '</button>'+
                '        <button type="button" class="w2ui-btn w2ui-btn-blue" onclick="obj = w2ui[\''+ this.name +'\']; if (obj) { obj.search(); }">'+ w2utils.lang('Search') + '</button>'+
                '        </div>'+
                '    </td>'+
                '</tr></tbody></table>'
        return html

        function getOperators(type, fieldOperators) {
            let html = ''
            let operators = obj.operators[obj.operatorsMap[type]]
            if (fieldOperators != null) operators = fieldOperators
            for (let i = 0; i < operators.length; i++) {
                let oper = operators[i]
                let text = oper
                if (Array.isArray(oper)) {
                    text = oper[1]
                    oper = oper[0]
                    if (text == null) text = oper
                } else if ($.isPlainObject(oper)) {
                    text = oper.text
                    oper = oper.oper
                }
                html += '<option value="'+ oper +'">'+ w2utils.lang(text) +'</option>\n'
            }
            return html
        }
    }

    initOperator(el, search_ind) {
        let search = this.searches[search_ind]
        let range = $('#grid_'+ this.name + '_range_'+ search_ind)
        let fld1 = $('#grid_'+ this.name +'_field_'+ search_ind)
        let fld2 = fld1.parent().find('span input')
        fld1.show()
        range.hide()
        switch ($(el).val()) {
            case 'between':
                range.show()
                fld2.w2field(search.type, search.options)
                break
            case 'not null':
            case 'null':
                fld1.hide()
                fld1.val('1') // need to insert something for search to activate
                fld1.change()
                break
        }
    }

    initSearches() {
        let obj = this
        // init searches
        for (let s = 0; s < this.searches.length; s++) {
            let search = this.searches[s]
            let sdata = this.getSearchData(search.field)
            search.type = String(search.type).toLowerCase()
            let operators = this.operators[this.operatorsMap[search.type]]
            if (search.operators) operators = search.operators
            let operator = operators[0] // default operator
            if ($.isPlainObject(operator)) operator = operator.oper
            if (typeof search.options != 'object') search.options = {}
            if (search.type == 'text') operator = this.textSearch
            // only accept search.operator if it is valid
            for (let i = 0; i < operators.length; i++) {
                let oper = operators[i]
                if ($.isPlainObject(oper)) oper = oper.oper
                if (search.operator == oper) {
                    operator = search.operator
                    break
                }
            }
            // init types
            let options
            switch (search.type) {
                case 'text':
                case 'alphanumeric':
                    $('#grid_'+ this.name +'_field_' + s).w2field(search.type, search.options)
                    break

                case 'int':
                case 'float':
                case 'hex':
                case 'color':
                case 'money':
                case 'currency':
                case 'percent':
                case 'date':
                case 'time':
                case 'datetime':
                    $('#grid_'+ this.name +'_field_'+s).w2field(search.type, search.options)
                    $('#grid_'+ this.name +'_field2_'+s).w2field(search.type, search.options)
                    setTimeout(() => { // convert to date if it is number
                        $('#grid_'+ this.name +'_field_'+s).keydown()
                        $('#grid_'+ this.name +'_field2_'+s).keydown()
                    }, 1)
                    break

                case 'list':
                case 'combo':
                case 'enum':
                    options = search.options
                    if (search.type == 'list') options.selected = {}
                    if (search.type == 'enum') options.selected = []
                    if (sdata) options.selected = sdata.value
                    $('#grid_'+ this.name +'_field_'+s).w2field(search.type, $.extend({ openOnFocus: true }, options))
                    if (sdata && sdata.text != null) $('#grid_'+ this.name +'_field_'+s).data('selected', {id: sdata.value, text: sdata.text})
                    break

                case 'select':
                    // build options
                    options = '<option value="">--</option>'
                    for (let i = 0; i < search.options.items.length; i++) {
                        let si = search.options.items[i]
                        if ($.isPlainObject(search.options.items[i])) {
                            let val = si.id
                            let txt = si.text
                            if (val == null && si.value != null) val = si.value
                            if (txt == null && si.text != null) txt = si.text
                            if (val == null) val = ''
                            options += '<option value="'+ val +'">'+ txt +'</option>'
                        } else {
                            options += '<option value="'+ si +'">'+ si +'</option>'
                        }
                    }
                    $('#grid_'+ this.name +'_field_'+s).html(options)
                    break
            }
            if (sdata != null) {
                if (sdata.type == 'int' && ['in', 'not in'].indexOf(sdata.operator) != -1) {
                    $('#grid_'+ this.name +'_field_'+ s).w2field('clear').val(sdata.value)
                }
                $('#grid_'+ this.name +'_operator_'+ s).val(sdata.operator).trigger('change')
                if (!Array.isArray(sdata.value)) {
                    if (sdata.value != null) $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change')
                } else {
                    if (['in', 'not in'].indexOf(sdata.operator) != -1) {
                        $('#grid_'+ this.name +'_field_'+ s).val(sdata.value).trigger('change')
                    } else {
                        $('#grid_'+ this.name +'_field_'+ s).val(sdata.value[0]).trigger('change')
                        $('#grid_'+ this.name +'_field2_'+ s).val(sdata.value[1]).trigger('change')
                    }
                }
            } else {
                $('#grid_'+ this.name +'_operator_'+s).val(operator).trigger('change')
            }
        }
        // add on change event
        $('#w2ui-overlay-'+ this.name +'-searchOverlay .w2ui-grid-searches *[rel=search]').on('keypress', function(evnt) {
            if (evnt.keyCode == 13) {
                obj.search()
                $().w2overlay({ name: obj.name + '-searchOverlay' })
            }
        })
    }

    getColumnsHTML() {
        let obj = this
        let html1 = ''
        let html2 = ''
        if (this.show.columnHeaders) {
            if (this.columnGroups.length > 0) {
                let tmp1 = getColumns(true)
                let tmp2 = getGroups()
                let tmp3 = getColumns(false)
                html1 = tmp1[0] + tmp2[0] + tmp3[0]
                html2 = tmp1[1] + tmp2[1] + tmp3[1]
            } else {
                let tmp = getColumns(true)
                html1 = tmp[0]
                html2 = tmp[1]
            }
        }
        return [html1, html2]

        function getGroups () {
            let html1 = '<tr>'
            let html2 = '<tr>'
            let tmpf = ''
            // add empty group at the end
            let tmp = obj.columnGroups.length - 1
            if (obj.columnGroups[tmp].text == null && obj.columnGroups[tmp].caption != null) {
                console.log('NOTICE: grid columnGroup.caption property is deprecated, please use columnGroup.text. Group -> ', obj.columnGroups[tmp])
                obj.columnGroups[tmp].text = obj.columnGroups[tmp].caption
            }
            if (obj.columnGroups[obj.columnGroups.length-1].text != '') obj.columnGroups.push({ text: '' })

            if (obj.show.lineNumbers) {
                html1 += '<td class="w2ui-head w2ui-col-number">'+
                        '    <div style="height: '+ (obj.recordHeight+1) +'px">&#160;</div>'+
                        '</td>'
            }
            if (obj.show.selectColumn) {
                html1 += '<td class="w2ui-head w2ui-col-select">'+
                        '    <div style="height: 25px">&#160;</div>'+
                        '</td>'
            }
            if (obj.show.expandColumn) {
                html1 += '<td class="w2ui-head w2ui-col-expand">'+
                        '    <div style="height: 25px">&#160;</div>'+
                        '</td>'
            }
            let ii = 0
            html2 += '<td id="grid_'+ obj.name + '_column_start" class="w2ui-head" col="start" style="border-right: 0"></td>'
            if (obj.show.orderColumn) {
                html2 += '<td class="w2ui-head w2ui-col-order" col="order">'+
                        '    <div style="height: 25px">&#160;</div>'+
                        '</td>'
            }
            for (let i=0; i<obj.columnGroups.length; i++) {
                let colg = obj.columnGroups[i]
                let col = obj.columns[ii]
                if (colg.colspan != null) colg.span = colg.colspan
                if (colg.span == null || colg.span != parseInt(colg.span)) colg.span = 1
                if (col.text == null && col.caption != null) {
                    console.log('NOTICE: grid column.caption property is deprecated, please use column.text. Column ->', col)
                    col.text = col.caption
                }
                let colspan = 0
                for (let jj = ii; jj < ii + colg.span; jj++) {
                    if (obj.columns[jj] && !obj.columns[jj].hidden) {
                        colspan++
                    }
                }
                if (i == obj.columnGroups.length-1) {
                    colspan = 100 // last column
                }
                if (colspan <= 0) {
                    // do nothing here, all columns in the group are hidden.
                } else if (colg.main === true) {
                    let sortStyle = ''
                    for (let si = 0; si < obj.sortData.length; si++) {
                        if (obj.sortData[si].field == col.field) {
                            if ((obj.sortData[si].direction || '').toLowerCase() === 'asc') sortStyle = 'w2ui-sort-up'
                            if ((obj.sortData[si].direction || '').toLowerCase() === 'desc') sortStyle = 'w2ui-sort-down'
                        }
                    }
                    let resizer = ''
                    if (col.resizable !== false) {
                        resizer = '<div class="w2ui-resizer" name="'+ ii +'"></div>'
                    }
                    let text = (typeof col.text == 'function' ? col.text(col) : col.text)
                    tmpf = '<td id="grid_'+ obj.name + '_column_' + ii +'" class="w2ui-head '+ sortStyle +'" col="'+ ii + '" '+
                           '    rowspan="2" colspan="'+ colspan +'" '+
                           '    oncontextmenu = "w2ui[\''+ obj.name +'\'].contextMenu(null, '+ ii +', event);"'+
                           '    onclick="w2ui[\''+ obj.name +'\'].columnClick(\''+ col.field +'\', event);"'+
                           '    ondblclick="w2ui[\''+ obj.name +'\'].columnDblClick(\''+ col.field +'\', event);">'+
                               resizer +
                           '    <div class="w2ui-col-group w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +'">'+
                           '        <div class="'+ sortStyle +'"></div>'+
                                   (!text ? '&#160;' : text) +
                           '    </div>'+
                           '</td>'
                    if (col && col.frozen) html1 += tmpf; else html2 += tmpf
                } else {
                    let gText = (typeof colg.text == 'function' ? colg.text(colg) : colg.text)
                    tmpf = '<td id="grid_'+ obj.name + '_column_' + ii +'" class="w2ui-head" col="'+ ii + '" '+
                           '        colspan="'+ colspan +'">'+
                           '    <div class="w2ui-col-group">'+
                               (!gText ? '&#160;' : gText) +
                           '    </div>'+
                           '</td>'
                    if (col && col.frozen) html1 += tmpf; else html2 += tmpf
                }
                ii += colg.span
            }
            html1 += '<td></td></tr>' // need empty column for border-right
            html2 += '<td id="grid_'+ obj.name + '_column_end" class="w2ui-head" col="end"></td></tr>'
            return [html1, html2]
        }

        function getColumns (main) {
            let html1 = '<tr>'
            let html2 = '<tr>'
            if (obj.show.lineNumbers) {
                html1 += '<td class="w2ui-head w2ui-col-number" '+
                        '       onclick="w2ui[\''+ obj.name +'\'].columnClick(\'line-number\', event);"'+
                        '       ondblclick="w2ui[\''+ obj.name +'\'].columnDblClick(\'line-number\', event);">'+
                        '    <div>#</div>'+
                        '</td>'
            }
            if (obj.show.selectColumn) {
                html1 += '<td class="w2ui-head w2ui-col-select"'+
                        '       onclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                        '    <div>'+
                        '        <input type="checkbox" id="grid_'+ obj.name +'_check_all" tabindex="-1"'+
                        '            style="' + (obj.multiSelect == false ? 'display: none;' : '') + '"'+
                        '            onmousedown="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;"'+
                        '            onclick="let grid = w2ui[\''+ obj.name +'\'];'+
                        '               if (this.checked) grid.selectAll(); else grid.selectNone();'+
                        '               if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;'+
                        '               clearTimeout(grid.last.kbd_timer); /* keep focus */' +
                        '            "/>'+
                        '    </div>'+
                        '</td>'
            }
            if (obj.show.expandColumn) {
                html1 += '<td class="w2ui-head w2ui-col-expand">'+
                        '    <div>&#160;</div>'+
                        '</td>'
            }
            let ii = 0
            let id = 0
            let colg
            html2 += '<td id="grid_'+ obj.name + '_column_start" class="w2ui-head" col="start" style="border-right: 0"></td>'
            if (obj.show.orderColumn) {
                html2 += '<td class="w2ui-head w2ui-col-order" col="order">'+
                        '    <div>&#160;</div>'+
                        '</td>'
            }
            for (let i = 0; i < obj.columns.length; i++) {
                let col = obj.columns[i]
                if (col.text == null && col.caption != null) {
                    console.log('NOTICE: grid column.caption property is deprecated, please use column.text. Column -> ', col)
                    col.text = col.caption
                }
                if (col.size == null) col.size = '100%'
                if (i == id) { // always true on first iteration
                    colg = obj.columnGroups[ii++] || {}
                    id = id + colg.span
                }
                if ((i < obj.last.colStart || i > obj.last.colEnd) && !col.frozen)
                    continue
                if (col.hidden)
                    continue
                if (colg.main !== true || main) { // grouping of columns
                    let colCellHTML = obj.getColumnCellHTML(i)
                    if (col && col.frozen) html1 += colCellHTML; else html2 += colCellHTML
                }
            }
            html1 += '<td class="w2ui-head w2ui-head-last"><div>&#160;</div></td>'
            html2 += '<td class="w2ui-head w2ui-head-last" col="end"><div>&#160;</div></td>'
            html1 += '</tr>'
            html2 += '</tr>'
            return [html1, html2]
        }
    }

    getColumnCellHTML(i) {
        let col = this.columns[i]
        if (col == null) return ''
        // reorder style
        let reorderCols = (this.reorderColumns && (!this.columnGroups || !this.columnGroups.length)) ? ' w2ui-reorder-cols-head ' : ''
        // sort style
        let sortStyle = ''
        for (let si = 0; si < this.sortData.length; si++) {
            if (this.sortData[si].field == col.field) {
                if ((this.sortData[si].direction || '').toLowerCase() === 'asc') sortStyle = 'w2ui-sort-up'
                if ((this.sortData[si].direction || '').toLowerCase() === 'desc') sortStyle = 'w2ui-sort-down'
            }
        }
        // col selected
        let tmp = this.last.selection.columns
        let selected = false
        for (let t in tmp) {
            for (let si = 0; si < tmp[t].length; si++) {
                if (tmp[t][si] == i) selected = true
            }
        }
        let text = (typeof col.text == 'function' ? col.text(col) : col.text)
        let html = '<td id="grid_'+ this.name + '_column_' + i +'" col="'+ i +'" class="w2ui-head '+ sortStyle + reorderCols + '" ' +
                         (this.columnTooltip == 'normal' && col.tooltip ? 'title="'+ col.tooltip +'" ' : '') +
                    '    onmouseEnter = "w2ui[\''+ this.name +'\'].columnTooltipShow(\''+ i +'\', event);"'+
                    '    onmouseLeave  = "w2ui[\''+ this.name +'\'].columnTooltipHide(\''+ i +'\', event);"'+
                    '    oncontextmenu = "w2ui[\''+ this.name +'\'].contextMenu(null, '+ i +', event);"'+
                    '    onclick="w2ui[\''+ this.name +'\'].columnClick(\''+ col.field +'\', event);"'+
                    '    ondblclick="w2ui[\''+ this.name +'\'].columnDblClick(\''+ col.field +'\', event);">'+
                         (col.resizable !== false ? '<div class="w2ui-resizer" name="'+ i +'"></div>' : '') +
                    '    <div class="w2ui-col-header '+ (sortStyle ? 'w2ui-col-sorted' : '') +' '+ (selected ? 'w2ui-col-selected' : '') +'">'+
                    '        <div class="'+ sortStyle +'"></div>'+
                            (!text ? '&#160;' : text) +
                    '    </div>'+
                    '</td>'

        return html
    }

    columnTooltipShow(ind) {
        if (this.columnTooltip == 'normal') return
        let $el = $(this.box).find('#grid_'+ this.name + '_column_'+ ind)
        let item = this.columns[ind]
        let pos = this.columnTooltip
        $el.prop('_mouse_over', true)
        setTimeout(() => {
            if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                $el.w2tag(item.tooltip, { position: pos, top: 5 })
            }
        }, 1)
    }

    columnTooltipHide(ind) {
        if (this.columnTooltip == 'normal') return
        let $el = $(this.box).find('#grid_'+ this.name + '_column_'+ ind)
        $el.removeProp('_mouse_over')
        setTimeout(() => {
            if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
                $el.removeProp('_mouse_tooltip')
                // hide tooltip
                $el.w2tag()
            }
        }, 1)
    }

    getRecordsHTML() {
        let buffered = this.records.length
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        // larger number works better with chrome, smaller with FF.
        if (buffered > this.vs_start) this.last.show_extra = this.vs_extra; else this.last.show_extra = this.vs_start
        let records = $('#grid_'+ this.name +'_records')
        let limit = Math.floor((records.height() || 0) / this.recordHeight) + this.last.show_extra + 1
        if (!this.fixedBody || limit > buffered) limit = buffered
        // always need first record for resizing purposes
        let rec_html = this.getRecordHTML(-1, 0)
        let html1 = '<table><tbody>' + rec_html[0]
        let html2 = '<table><tbody>' + rec_html[1]
        // first empty row with height
        html1 += '<tr id="grid_'+ this.name + '_frec_top" line="top" style="height: '+ 0 +'px">'+
                 '    <td colspan="2000"></td>'+
                 '</tr>'
        html2 += '<tr id="grid_'+ this.name + '_rec_top" line="top" style="height: '+ 0 +'px">'+
                 '    <td colspan="2000"></td>'+
                 '</tr>'
        for (let i = 0; i < limit; i++) {
            rec_html = this.getRecordHTML(i, i+1)
            html1 += rec_html[0]
            html2 += rec_html[1]
        }
        let h2 = (buffered - limit) * this.recordHeight
        html1 += '<tr id="grid_' + this.name + '_frec_bottom" rec="bottom" line="bottom" style="height: ' + h2 + 'px; vertical-align: top">' +
                '    <td colspan="2000" style="border-right: 1px solid #D6D5D7;"></td>'+
                '</tr>'+
                '<tr id="grid_'+ this.name +'_frec_more" style="display: none; ">'+
                '    <td colspan="2000" class="w2ui-load-more"></td>'+
                '</tr>'+
                '</tbody></table>'
        html2 += '<tr id="grid_' + this.name + '_rec_bottom" rec="bottom" line="bottom" style="height: ' + h2 + 'px; vertical-align: top">' +
                '    <td colspan="2000" style="border: 0"></td>'+
                '</tr>'+
                '<tr id="grid_'+ this.name +'_rec_more" style="display: none">'+
                '    <td colspan="2000" class="w2ui-load-more"></td>'+
                '</tr>'+
                '</tbody></table>'
        this.last.range_start = 0
        this.last.range_end = limit
        return [html1, html2]
    }

    getSummaryHTML() {
        if (this.summary.length === 0) return
        let rec_html = this.getRecordHTML(-1, 0) // need this in summary too for colspan to work properly
        let html1 = '<table><tbody>' + rec_html[0]
        let html2 = '<table><tbody>' + rec_html[1]
        for (let i = 0; i < this.summary.length; i++) {
            rec_html = this.getRecordHTML(i, i+1, true)
            html1 += rec_html[0]
            html2 += rec_html[1]
        }
        html1 += '</tbody></table>'
        html2 += '</tbody></table>'
        return [html1, html2]
    }

    scroll(event) {
        let obj = this
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        let records = $('#grid_'+ this.name +'_records')
        let frecords = $('#grid_'+ this.name +'_frecords')
        // sync scroll positions
        if (event) {
            let sTop = event.target.scrollTop
            let sLeft = event.target.scrollLeft
            this.last.scrollTop = sTop
            this.last.scrollLeft = sLeft
            $('#grid_'+ this.name +'_columns')[0].scrollLeft = sLeft
            $('#grid_'+ this.name +'_summary')[0].scrollLeft = sLeft
            frecords[0].scrollTop = sTop
        }
        // hide bubble
        if (this.last.bubbleEl) {
            $(this.last.bubbleEl).w2tag()
            this.last.bubbleEl = null
        }
        // column virtual scroll
        let colStart = null
        let colEnd = null
        if (this.disableCVS || this.columnGroups.length > 0) {
            // disable virtual scroll
            colStart = 0
            colEnd = this.columns.length - 1
        } else {
            let sWidth = records.width()
            let cLeft = 0
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i].frozen || this.columns[i].hidden) continue
                let cSize = parseInt(this.columns[i].sizeCalculated ? this.columns[i].sizeCalculated : this.columns[i].size)
                if (cLeft + cSize + 30 > this.last.scrollLeft && colStart == null) colStart = i
                if (cLeft + cSize - 30 > this.last.scrollLeft + sWidth && colEnd == null) colEnd = i
                cLeft += cSize
            }
            if (colEnd == null) colEnd = this.columns.length - 1
        }
        if (colStart != null) {
            if (colStart < 0) colStart = 0
            if (colEnd < 0) colEnd = 0
            if (colStart == colEnd) {
                if (colStart > 0) colStart--; else colEnd++ // show at least one column
            }
            // ---------
            if (colStart != this.last.colStart || colEnd != this.last.colEnd) {
                let $box = $(this.box)
                let deltaStart = Math.abs(colStart - this.last.colStart)
                let deltaEnd = Math.abs(colEnd - this.last.colEnd)
                // add/remove columns for small jumps
                if (deltaStart < 5 && deltaEnd < 5) {
                    let $cfirst = $box.find('.w2ui-grid-columns #grid_'+ this.name +'_column_start')
                    let $clast = $box.find('.w2ui-grid-columns .w2ui-head-last')
                    let $rfirst = $box.find('#grid_'+ this.name +'_records .w2ui-grid-data-spacer')
                    let $rlast = $box.find('#grid_'+ this.name +'_records .w2ui-grid-data-last')
                    let $sfirst = $box.find('#grid_'+ this.name +'_summary .w2ui-grid-data-spacer')
                    let $slast = $box.find('#grid_'+ this.name +'_summary .w2ui-grid-data-last')
                    // remove on left
                    if (colStart > this.last.colStart) {
                        for (let i = this.last.colStart; i < colStart; i++) {
                            $box.find('#grid_'+ this.name +'_columns #grid_'+ this.name +'_column_'+ i).remove() // column
                            $box.find('#grid_'+ this.name +'_records td[col="'+ i +'"]').remove() // record
                            $box.find('#grid_'+ this.name +'_summary td[col="'+ i +'"]').remove() // summary
                        }
                    }
                    // remove on right
                    if (colEnd < this.last.colEnd) {
                        for (let i = this.last.colEnd; i > colEnd; i--) {
                            $box.find('#grid_'+ this.name +'_columns #grid_'+ this.name +'_column_'+ i).remove() // column
                            $box.find('#grid_'+ this.name +'_records td[col="'+ i +'"]').remove() // record
                            $box.find('#grid_'+ this.name +'_summary td[col="'+ i +'"]').remove() // summary
                        }
                    }
                    // add on left
                    if (colStart < this.last.colStart) {
                        for (let i = this.last.colStart - 1; i >= colStart; i--) {
                            if (this.columns[i] && (this.columns[i].frozen || this.columns[i].hidden)) continue
                            $cfirst.after(this.getColumnCellHTML(i)) // column
                            // record
                            $rfirst.each((ind, el) => {
                                let index = $(el).parent().attr('index')
                                let td = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, false)
                                $(el).after(td)
                            })
                            // summary
                            $sfirst.each((ind, el) => {
                                let index = $(el).parent().attr('index')
                                let td = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, true)
                                $(el).after(td)
                            })
                        }
                    }
                    // add on right
                    if (colEnd > this.last.colEnd) {
                        for (let i = this.last.colEnd + 1; i <= colEnd; i++) {
                            if (this.columns[i] && (this.columns[i].frozen || this.columns[i].hidden)) continue
                            $clast.before(this.getColumnCellHTML(i)) // column
                            // record
                            $rlast.each((ind, el) => {
                                let index = $(el).parent().attr('index')
                                let td = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px"></td>' // width column
                                if (index != null) td = this.getCellHTML(parseInt(index), i, false)
                                $(el).before(td)
                            })
                            // summary
                            $slast.each((ind, el) => {
                                let index = $(el).parent().attr('index') || -1
                                let td = this.getCellHTML(parseInt(index), i, true)
                                $(el).before(td)
                            })
                        }
                    }
                    this.last.colStart = colStart
                    this.last.colEnd = colEnd
                    this.resizeRecords()
                } else {
                    this.last.colStart = colStart
                    this.last.colEnd = colEnd
                    // dot not just call this.refresh();
                    let colHTML = this.getColumnsHTML()
                    let recHTML = this.getRecordsHTML()
                    let sumHTML = this.getSummaryHTML()
                    let $columns = $box.find('#grid_'+ this.name +'_columns')
                    let $records = $box.find('#grid_'+ this.name +'_records')
                    let $frecords = $box.find('#grid_'+ this.name +'_frecords')
                    let $summary = $box.find('#grid_'+ this.name +'_summary')
                    $columns.find('tbody').html(colHTML[1])
                    $frecords.html(recHTML[0])
                    $records.prepend(recHTML[1])
                    if (sumHTML != null) $summary.html(sumHTML[1])
                    // need timeout to clean up (otherwise scroll problem)
                    setTimeout(() => {
                        $records.find('> table').not('table:first-child').remove()
                        if ($summary[0]) $summary[0].scrollLeft = this.last.scrollLeft
                    }, 1)
                    this.resizeRecords()
                }
            }
        }
        // perform virtual scroll
        let buffered = this.records.length
        if (buffered > this.total && this.total !== -1) buffered = this.total
        if (this.searchData.length != 0 && !url) buffered = this.last.searchIds.length
        if (buffered === 0 || records.length === 0 || records.height() === 0) return
        if (buffered > this.vs_start) this.last.show_extra = this.vs_extra; else this.last.show_extra = this.vs_start
        // update footer
        let t1 = Math.round(records[0].scrollTop / this.recordHeight + 1)
        let t2 = t1 + (Math.round(records.height() / this.recordHeight) - 1)
        if (t1 > buffered) t1 = buffered
        if (t2 >= buffered - 1) t2 = buffered
        $('#grid_'+ this.name + '_footer .w2ui-footer-right').html(
            (this.show.statusRange
                ? w2utils.formatNumber(this.offset + t1) + '-' + w2utils.formatNumber(this.offset + t2) +
                    (this.total != -1 ? ' ' + w2utils.lang('of') + ' ' + w2utils.formatNumber(this.total) : '')
                    : '') +
            (url && this.show.statusBuffered ? ' ('+ w2utils.lang('buffered') + ' '+ w2utils.formatNumber(buffered) +
                    (this.offset > 0 ? ', skip ' + w2utils.formatNumber(this.offset) : '') + ')' : '')
        )
        // only for local data source, else no extra records loaded
        if (!url && (!this.fixedBody || (this.total != -1 && this.total <= this.vs_start))) return
        // regular processing
        let start = Math.floor(records[0].scrollTop / this.recordHeight) - this.last.show_extra
        let end = start + Math.floor(records.height() / this.recordHeight) + this.last.show_extra * 2 + 1
        // let div  = start - this.last.range_start;
        if (start < 1) start = 1
        if (end > this.total && this.total != -1) end = this.total
        let tr1 = records.find('#grid_'+ this.name +'_rec_top')
        let tr2 = records.find('#grid_'+ this.name +'_rec_bottom')
        let tr1f = frecords.find('#grid_'+ this.name +'_frec_top')
        let tr2f = frecords.find('#grid_'+ this.name +'_frec_bottom')
        // if row is expanded
        if (String(tr1.next().prop('id')).indexOf('_expanded_row') != -1) {
            tr1.next().remove()
            tr1f.next().remove()
        }
        if (this.total > end && String(tr2.prev().prop('id')).indexOf('_expanded_row') != -1) {
            tr2.prev().remove()
            tr2f.prev().remove()
        }
        let first = parseInt(tr1.next().attr('line'))
        let last = parseInt(tr2.prev().attr('line'))
        //$('#log').html('buffer: '+ this.buffered +' start-end: ' + start + '-'+ end + ' ===> first-last: ' + first + '-' + last);
        let tmp, tmp1, tmp2, rec_start, rec_html
        if (first < start || first == 1 || this.last.pull_refresh) { // scroll down
            if (end <= last + this.last.show_extra - 2 && end != this.total) return
            this.last.pull_refresh = false
            // remove from top
            while (true) {
                tmp1 = frecords.find('#grid_'+ this.name +'_frec_top').next()
                tmp2 = records.find('#grid_'+ this.name +'_rec_top').next()
                if (tmp2.attr('line') == 'bottom') break
                if (parseInt(tmp2.attr('line')) < start) { tmp1.remove(); tmp2.remove() } else break
            }
            // add at bottom
            tmp = records.find('#grid_'+ this.name +'_rec_bottom').prev()
            rec_start = tmp.attr('line')
            if (rec_start == 'top') rec_start = start
            for (let i = parseInt(rec_start) + 1; i <= end; i++) {
                if (!this.records[i-1]) continue
                tmp2 = this.records[i-1].w2ui
                if (tmp2 && !Array.isArray(tmp2.children)) {
                    tmp2.expanded = false
                }
                rec_html = this.getRecordHTML(i-1, i)
                tr2.before(rec_html[1])
                tr2f.before(rec_html[0])
            }
            markSearch()
            setTimeout(() => { this.refreshRanges() }, 0)
        } else { // scroll up
            if (start >= first - this.last.show_extra + 2 && start > 1) return
            // remove from bottom
            while (true) {
                tmp1 = frecords.find('#grid_'+ this.name +'_frec_bottom').prev()
                tmp2 = records.find('#grid_'+ this.name +'_rec_bottom').prev()
                if (tmp2.attr('line') == 'top') break
                if (parseInt(tmp2.attr('line')) > end) { tmp1.remove(); tmp2.remove() } else break
            }
            // add at top
            tmp = records.find('#grid_'+ this.name +'_rec_top').next()
            rec_start = tmp.attr('line')
            if (rec_start == 'bottom') rec_start = end
            for (let i = parseInt(rec_start) - 1; i >= start; i--) {
                if (!this.records[i-1]) continue
                tmp2 = this.records[i-1].w2ui
                if (tmp2 && !Array.isArray(tmp2.children)) {
                    tmp2.expanded = false
                }
                rec_html = this.getRecordHTML(i-1, i)
                tr1.after(rec_html[1])
                tr1f.after(rec_html[0])
            }
            markSearch()
            setTimeout(() => { this.refreshRanges() }, 0)
        }
        // first/last row size
        let h1 = (start - 1) * this.recordHeight
        let h2 = (buffered - end) * this.recordHeight
        if (h2 < 0) h2 = 0
        tr1.css('height', h1 + 'px')
        tr1f.css('height', h1 + 'px')
        tr2.css('height', h2 + 'px')
        tr2f.css('height', h2 + 'px')
        this.last.range_start = start
        this.last.range_end = end
        // load more if needed
        let s = Math.floor(records[0].scrollTop / this.recordHeight)
        let e = s + Math.floor(records.height() / this.recordHeight)
        if (e + 10 > buffered && this.last.pull_more !== true && (buffered < this.total - this.offset || (this.total == -1 && this.last.xhr_hasMore))) {
            if (this.autoLoad === true) {
                this.last.pull_more = true
                this.last.xhr_offset += this.limit
                this.request('get')
            }
            // scroll function
            let more = $('#grid_'+ this.name +'_rec_more, #grid_'+ this.name +'_frec_more')
            more.show()
                .eq(1) // only main table
                .off('.load-more')
                .on('click.load-more', function() {
                    // show spinner
                    $(this).find('td').html('<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>')
                    // load more
                    obj.last.pull_more = true
                    obj.last.xhr_offset += obj.limit
                    obj.request('get')
                })
                .find('td')
                .html(obj.autoLoad
                    ? '<div><div style="width: 20px; height: 20px;" class="w2ui-spinner"></div></div>'
                    : '<div style="padding-top: 15px">'+ w2utils.lang('Load') + ' ' + obj.limit + ' ' + w2utils.lang('More') + '...</div>'
                )
        }

        function markSearch() {
            // mark search
            if (!obj.markSearch) return
            clearTimeout(obj.last.marker_timer)
            obj.last.marker_timer = setTimeout(() => {
                // mark all search strings
                let search = []
                for (let s = 0; s < obj.searchData.length; s++) {
                    let sdata = obj.searchData[s]
                    let fld = obj.getSearch(sdata.field)
                    if (!fld || fld.hidden) continue
                    let ind = obj.getColumn(sdata.field, true)
                    search.push({ field: sdata.field, search: sdata.value, col: ind })
                }
                if (search.length > 0) {
                    search.forEach((item) => {
                        $(obj.box).find('td[col="'+ item.col +'"]').not('.w2ui-head').w2marker(item.search)
                    })
                }
            }, 50)
        }
    }

    getRecordHTML(ind, lineNum, summary) {
        let tmph = ''
        let rec_html1 = ''
        let rec_html2 = ''
        let sel = this.last.selection
        let record
        // first record needs for resize purposes
        if (ind == -1) {
            rec_html1 += '<tr line="0">'
            rec_html2 += '<tr line="0">'
            if (this.show.lineNumbers) rec_html1 += '<td class="w2ui-col-number" style="height: 0px;"></td>'
            if (this.show.selectColumn) rec_html1 += '<td class="w2ui-col-select" style="height: 0px;"></td>'
            if (this.show.expandColumn) rec_html1 += '<td class="w2ui-col-expand" style="height: 0px;"></td>'
            rec_html2 += '<td class="w2ui-grid-data w2ui-grid-data-spacer" col="start" style="height: 0px; width: 0px;"></td>'
            if (this.show.orderColumn) rec_html2 += '<td class="w2ui-col-order" style="height: 0px;" col="order"></td>'
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                tmph = '<td class="w2ui-grid-data" col="'+ i +'" style="height: 0px;"></td>'
                if (col.frozen && !col.hidden) {
                    rec_html1 += tmph
                } else {
                    if (col.hidden || i < this.last.colStart || i > this.last.colEnd) continue
                    rec_html2 += tmph
                }
            }
            rec_html1 += '<td class="w2ui-grid-data-last" style="height: 0px"></td>'
            rec_html2 += '<td class="w2ui-grid-data-last" col="end" style="height: 0px"></td>'
            rec_html1 += '</tr>'
            rec_html2 += '</tr>'
            return [rec_html1, rec_html2]
        }
        // regular record
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (summary !== true) {
            if (this.searchData.length > 0 && !url) {
                if (ind >= this.last.searchIds.length) return ''
                ind = this.last.searchIds[ind]
                record = this.records[ind]
            } else {
                if (ind >= this.records.length) return ''
                record = this.records[ind]
            }
        } else {
            if (ind >= this.summary.length) return ''
            record = this.summary[ind]
        }
        if (!record) return ''
        if (record.recid == null && this.recid != null) {
            let rid = this.parseField(record, this.recid)
            if (rid != null) record.recid = rid
        }
        let isRowSelected = false
        if (sel.indexes.indexOf(ind) != -1) isRowSelected = true
        let rec_style = (record.w2ui ? record.w2ui.style : '')
        if (rec_style == null || typeof rec_style != 'string') rec_style = ''
        let rec_class = (record.w2ui ? record.w2ui.class : '')
        if (rec_class == null || typeof rec_class != 'string') rec_class = ''
        // render TR
        rec_html1 += '<tr id="grid_'+ this.name +'_frec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
            ' class="'+ (lineNum % 2 === 0 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-record ' + rec_class +
                (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') +
                (record.w2ui && record.w2ui.editable === false ? ' w2ui-no-edit' : '') +
                (record.w2ui && record.w2ui.expanded === true ? ' w2ui-expanded' : '') + '" ' +
            ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && rec_style != '' ? rec_style : rec_style.replace('background-color', 'none')) +'" '+
                (rec_style != '' ? 'custom_style="'+ rec_style +'"' : '') +
            '>'
        rec_html2 += '<tr id="grid_'+ this.name +'_rec_'+ record.recid +'" recid="'+ record.recid +'" line="'+ lineNum +'" index="'+ ind +'" '+
            ' class="'+ (lineNum % 2 === 0 ? 'w2ui-even' : 'w2ui-odd') + ' w2ui-record ' + rec_class +
                (isRowSelected && this.selectType == 'row' ? ' w2ui-selected' : '') +
                (record.w2ui && record.w2ui.editable === false ? ' w2ui-no-edit' : '') +
                (record.w2ui && record.w2ui.expanded === true ? ' w2ui-expanded' : '') + '" ' +
            ' style="height: '+ this.recordHeight +'px; '+ (!isRowSelected && rec_style != '' ? rec_style : rec_style.replace('background-color', 'none')) +'" '+
                (rec_style != '' ? 'custom_style="'+ rec_style +'"' : '') +
            '>'
        if (this.show.lineNumbers) {
            rec_html1 += '<td id="grid_'+ this.name +'_cell_'+ ind +'_number' + (summary ? '_s' : '') + '" '+
                        '   class="w2ui-col-number '+ (isRowSelected ? ' w2ui-row-selected' : '') +'"'+
                            (this.reorderRows ? ' style="cursor: move"' : '') + '>'+
                            (summary !== true ? this.getLineHTML(lineNum, record) : '') +
                        '</td>'
        }
        if (this.show.selectColumn) {
            rec_html1 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_select' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-select">'+
                        (summary !== true && !(record.w2ui && record.w2ui.hideCheckBox === true) ?
                        '    <div>'+
                        '        <input class="w2ui-grid-select-check" type="checkbox" tabindex="-1" '+
                                    (isRowSelected ? 'checked="checked"' : '') + ' style="pointer-events: none"/>'+
                        '    </div>'
                        :
                        '' ) +
                    '</td>'
        }
        if (this.show.expandColumn) {
            let tmp_img = ''
            if (record.w2ui && record.w2ui.expanded === true) tmp_img = '-'; else tmp_img = '+'
            if (record.w2ui && (record.w2ui.expanded == 'none' || !Array.isArray(record.w2ui.children) || !record.w2ui.children.length)) tmp_img = ''
            if (record.w2ui && record.w2ui.expanded == 'spinner') tmp_img = '<div class="w2ui-spinner" style="width: 16px; margin: -2px 2px;"></div>'
            rec_html1 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_expand' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-expand">'+
                        (summary !== true ?
                        '    <div ondblclick="if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;" '+
                        '            onclick="w2ui[\''+ this.name +'\'].toggle(jQuery(this).parents(\'tr\').attr(\'recid\')); '+
                        '                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;">'+
                        '        '+ tmp_img +' </div>'
                        :
                        '' ) +
                    '</td>'
        }
        // insert empty first column
        rec_html2 += '<td class="w2ui-grid-data-spacer" col="start" style="border-right: 0"></td>'
        if (this.show.orderColumn) {
            rec_html2 +=
                    '<td id="grid_'+ this.name +'_cell_'+ ind +'_order' + (summary ? '_s' : '') + '" class="w2ui-grid-data w2ui-col-order" col="order">'+
                        (summary !== true ? '<div title="Drag to reorder">&nbsp;</div>' : '' ) +
                    '</td>'
        }
        let col_ind = 0
        let col_skip = 0
        while (true) {
            let col_span = 1
            let col = this.columns[col_ind]
            if (col == null) break
            if (col.hidden) {
                col_ind++
                if (col_skip > 0) col_skip--
                continue
            }
            if (col_skip > 0) {
                col_ind++
                if (this.columns[col_ind] == null) break
                record.w2ui.colspan[this.columns[col_ind-1].field] = 0 // need it for other methods
                col_skip--
                continue
            } else if (record.w2ui) {
                let tmp1 = record.w2ui.colspan
                let tmp2 = this.columns[col_ind].field
                if (tmp1 && tmp1[tmp2] === 0) {
                    delete tmp1[tmp2] // if no longer colspan then remove 0
                }
            }
            // column virtual scroll
            if ((col_ind < this.last.colStart || col_ind > this.last.colEnd) && !col.frozen) {
                col_ind++
                continue
            }
            if (record.w2ui) {
                if (typeof record.w2ui.colspan == 'object') {
                    let span = parseInt(record.w2ui.colspan[col.field]) || null
                    if (span > 1) {
                        // if there are hidden columns, then no colspan on them
                        let hcnt = 0
                        for (let i = col_ind; i < col_ind + span; i++) {
                            if (i >= this.columns.length) break
                            if (this.columns[i].hidden) hcnt++
                        }
                        col_span = span - hcnt
                        col_skip = span - 1
                    }
                }
            }
            let rec_cell = this.getCellHTML(ind, col_ind, summary, col_span)
            if (col.frozen) rec_html1 += rec_cell; else rec_html2 += rec_cell
            col_ind++
        }
        rec_html1 += '<td class="w2ui-grid-data-last"></td>'
        rec_html2 += '<td class="w2ui-grid-data-last" col="end"></td>'
        rec_html1 += '</tr>'
        rec_html2 += '</tr>'
        return [rec_html1, rec_html2]
    }

    getLineHTML(lineNum) {
        return '<div>' + lineNum + '</div>'
    }

    getCellHTML(ind, col_ind, summary, col_span) {
        let obj = this
        let col = this.columns[col_ind]
        if (col == null) return ''
        let record = (summary !== true ? this.records[ind] : this.summary[ind])
        let data = (ind !== -1 ? this.getCellValue(ind, col_ind, summary) : '')
        let edit = (ind !== -1 ? this.getCellEditable(ind, col_ind) : '')
        let style = 'max-height: '+ parseInt(this.recordHeight) +'px;' + (col.clipboardCopy ? 'margin-right: 20px' : '')
        let isChanged = !summary && record && record.w2ui && record.w2ui.changes && record.w2ui.changes[col.field] != null
        let addStyle = ''
        let addClass = ''
        let sel = this.last.selection
        let isRowSelected = false
        let infoBubble = ''
        if (sel.indexes.indexOf(ind) != -1) isRowSelected = true
        if (col_span == null) {
            if (record && record.w2ui && record.w2ui.colspan && record.w2ui.colspan[col.field]) {
                col_span = record.w2ui.colspan[col.field]
            } else {
                col_span = 1
            }
        }
        // expand icon
        if (col_ind === 0 && record && record.w2ui && Array.isArray(record.w2ui.children)) {
            let level = 0
            let subrec = this.get(record.w2ui.parent_recid, true)
            while (true) {
                if (subrec != null) {
                    level++
                    let tmp = this.records[subrec].w2ui
                    if (tmp != null && tmp.parent_recid != null) {
                        subrec = this.get(tmp.parent_recid, true)
                    } else {
                        break
                    }
                } else {
                    break
                }
            }
            if (record.w2ui.parent_recid){
                for (let i = 0; i < level; i++) {
                    infoBubble += '<span class="w2ui-show-children w2ui-icon-empty"></span>'
                }
            }
            infoBubble += '<span class="w2ui-show-children '+
                    (record.w2ui.children.length > 0
                        ? (record.w2ui.expanded ? 'w2ui-icon-collapse' : 'w2ui-icon-expand')
                        : 'w2ui-icon-empty'
                    ) +'" '+
                ' onclick="event.stopPropagation(); w2ui[\''+ this.name + '\'].toggle(jQuery(this).parents(\'tr\').attr(\'recid\'))"></span>'
        }
        // info bubble
        if (col.info === true) col.info = {}
        if (col.info != null) {
            let infoIcon = 'w2ui-icon-info'
            if (typeof col.info.icon == 'function') {
                infoIcon = col.info.icon(record)
            } else if (typeof col.info.icon == 'object') {
                infoIcon = col.info.icon[this.parseField(record, col.field)] || ''
            } else if (typeof col.info.icon == 'string') {
                infoIcon = col.info.icon
            }
            let infoStyle = col.info.style || ''
            if (typeof col.info.style == 'function') {
                infoStyle = col.info.style(record)
            } else if (typeof col.info.style == 'object') {
                infoStyle = col.info.style[this.parseField(record, col.field)] || ''
            } else if (typeof col.info.style == 'string') {
                infoStyle = col.info.style
            }
            infoBubble += '<span class="w2ui-info '+ infoIcon +'" style="'+ infoStyle + '" '+
                (col.info.showOn != null ? 'on' + col.info.showOn : 'onclick') +
                '="event.stopPropagation(); w2ui[\''+ this.name + '\'].showBubble('+ ind +', '+ col_ind +')"'+
                (col.info.hideOn != null ? 'on' + col.info.hideOn : '') +
                '="let grid = w2ui[\''+ this.name + '\']; if (grid.last.bubbleEl) { $(grid.last.bubbleEl).w2tag() } grid.last.bubbleEl = null;"'+
                '></span>'
        }
        if (col.render != null && ind !== -1) {
            if (typeof col.render == 'function') {
                let html = col.render.call(this, record, ind, col_ind, data)
                if (html != null && typeof html == 'object') {
                    data = $.trim(html.html || '')
                    addClass = html.class || ''
                    addStyle = html.style || ''
                } else {
                    data = $.trim(html)
                }
                if (data.length < 4 || data.substr(0, 4).toLowerCase() != '<div') {
                    data = '<div style="'+ style +'" title="'+ getTitle(data) +'">' + infoBubble + String(data) + '</div>'
                }
            }
            // if it is an object
            if (typeof col.render == 'object') {
                let dsp = col.render[data]
                if (dsp == null || dsp === '') dsp = data
                data = '<div style="'+ style +'" title="'+ getTitle(dsp) +'">' + infoBubble + String(dsp) + '</div>'
            }
            // formatters
            if (typeof col.render == 'string') {
                let t = col.render.toLowerCase().indexOf(':')
                let tmp = []
                if (t == -1) {
                    tmp[0] = col.render.toLowerCase()
                    tmp[1] = ''
                } else {
                    tmp[0] = col.render.toLowerCase().substr(0, t)
                    tmp[1] = col.render.toLowerCase().substr(t+1)
                }
                // formatters
                let func = w2utils.formatters[tmp[0]]
                if (col.options && col.options.autoFormat === false) {
                    func = null
                }
                data = (typeof func == 'function' ? func(data, tmp[1], record) : '')
                data = '<div style="'+ style +'" title="'+ getTitle(data) +'">' + infoBubble + String(data) + '</div>'
            }
        } else {
            // if editable checkbox
            if (edit && ['checkbox', 'check'].indexOf(edit.type) != -1) {
                let changeInd = summary ? -(ind + 1) : ind
                style += 'text-align: center;'
                data = '<input tabindex="-1" type="checkbox" '+ (data ? 'checked="checked"' : '') +' onclick="' +
                       '    let obj = w2ui[\''+ this.name + '\']; '+
                       '    obj.editChange.call(obj, this, '+ changeInd +', '+ col_ind +', event); ' +
                       '"/>'
                infoBubble = ''
            }
            data = '<div style="'+ style +'" title="'+ getTitle(data) +'">' + infoBubble + String(data) + '</div>'
        }
        if (data == null) data = ''
        // --> cell TD
        if (typeof col.render == 'string') {
            let tmp = col.render.toLowerCase().split(':')
            if (['number', 'int', 'float', 'money', 'currency', 'percent', 'size'].indexOf(tmp[0]) != -1) addStyle += 'text-align: right;'
        }
        if (record && record.w2ui) {
            if (typeof record.w2ui.style == 'object') {
                if (typeof record.w2ui.style[col_ind] == 'string') addStyle += record.w2ui.style[col_ind] + ';'
                if (typeof record.w2ui.style[col.field] == 'string') addStyle += record.w2ui.style[col.field] + ';'
            }
            if (typeof record.w2ui.class == 'object') {
                if (typeof record.w2ui.class[col_ind] == 'string') addClass += record.w2ui.class[col_ind] + ' '
                if (typeof record.w2ui.class[col.field] == 'string') addClass += record.w2ui.class[col.field] + ' '
            }
        }
        let isCellSelected = false
        if (isRowSelected && $.inArray(col_ind, sel.columns[ind]) != -1) isCellSelected = true
        // clipboardCopy
        let clipboardTxt, clipboardIcon
        if(col.clipboardCopy){
            clipboardTxt = (typeof col.clipboardCopy == 'string' ? col.clipboardCopy : w2utils.lang('Copy to clipboard'))
            clipboardIcon = '<span onmouseEnter="jQuery(this).w2tag(\'' + clipboardTxt +'\', { position: \'top|bottom\' })"'
                + 'onclick="w2ui[\''+ this.name + '\'].clipboardCopy('+ ind +', '+ col_ind +'); jQuery(this).w2tag(w2utils.lang(\'Copied\'), { position: \'top|bottom\' }); event.stopPropagation();" '
                + 'onmouseLeave="jQuery(this).w2tag()" class="w2ui-clipboard-copy w2ui-icon-paste"></span>'
        }
        // data
        data = '<td class="w2ui-grid-data'+ (isCellSelected ? ' w2ui-selected' : '') + ' ' + addClass +
                    (isChanged ? ' w2ui-changed' : '') +
                    '" '+
                '   id="grid_'+ this.name +'_data_'+ ind +'_'+ col_ind +'" col="'+ col_ind +'" '+
                '   style="'+ addStyle + (col.style != null ? col.style : '') +'" '+
                    (col.attr != null ? col.attr : '') +
                    (col_span > 1 ? 'colspan="'+ col_span + '"' : '') +
                '>' + data + (clipboardIcon && w2utils.stripTags(data) ? clipboardIcon : '') +'</td>'
        // summary top row
        if (ind === -1 && summary === true) {
            data = '<td class="w2ui-grid-data" col="'+ col_ind +'" style="height: 0px; '+ addStyle + '" '+
                        (col_span > 1 ? 'colspan="'+ col_span + '"' : '') +
                    '></td>'
        }
        return data

        function getTitle(cellData){
            let title = ''
            if (obj.show.recordTitles) {
                if (col.title != null) {
                    if (typeof col.title == 'function') title = col.title.call(obj, record, ind, col_ind)
                    if (typeof col.title == 'string') title = col.title
                } else {
                    title = w2utils.stripTags(String(cellData).replace(/"/g, '\'\''))
                }
            }
            return (title != null) ? String(title) : ''
        }
    }

    clipboardCopy(ind, col_ind) {
        let rec = this.records[ind]
        let col = this.columns[col_ind]
        let txt = (col ? this.parseField(rec, col.field) : '')
        if (typeof col.clipboardCopy == 'function') {
            txt = col.clipboardCopy(rec)
        }
        $('#grid_' + this.name + '_focus').text(txt).select()
        document.execCommand('copy')
    }

    showBubble(ind, col_ind) {
        let html = ''
        let info = this.columns[col_ind].info
        let rec = this.records[ind]
        let el = $(this.box).find('#grid_'+ this.name +'_data_'+ ind +'_'+ col_ind + ' .w2ui-info')
        if (this.last.bubbleEl) $(this.last.bubbleEl).w2tag()
        this.last.bubbleEl = el
        // if no fields defined - show all
        if (info.fields == null) {
            info.fields = []
            for (let i = 0; i < this.columns.length; i++) {
                let col = this.columns[i]
                info.fields.push(col.field + (typeof col.render == 'string' ? ':' + col.render : ''))
            }
        }
        let fields = info.fields
        if (typeof fields == 'function') {
            fields = fields(rec, ind, col_ind) // custom renderer
        }
        // generate html
        if (typeof info.render == 'function') {
            html = info.render(rec, ind, col_ind)

        } else if (Array.isArray(fields)) {
            // display mentioned fields
            html = '<table cellpadding="0" cellspacing="0">'
            for (let i = 0; i < fields.length; i++) {
                let tmp = String(fields[i]).split(':')
                if (tmp[0] == '' || tmp[0] == '-' || tmp[0] == '--' || tmp[0] == '---') {
                    html += '<tr><td colspan=2><div style="border-top: '+ (tmp[0] == '' ? '0' : '1') +'px solid #C1BEBE; margin: 6px 0px;"></div></td></tr>'
                    continue
                }
                let col = this.getColumn(tmp[0])
                if (col == null) col = { field: tmp[0], caption: tmp[0] } // if not found in columns
                let val = (col ? this.parseField(rec, col.field) : '')
                if (tmp.length > 1) {
                    if (w2utils.formatters[tmp[1]]) {
                        val = w2utils.formatters[tmp[1]](val, tmp[2] || null, rec)
                    } else {
                        console.log('ERROR: w2utils.formatters["'+ tmp[1] + '"] does not exists.')
                    }
                }
                if (info.showEmpty !== true && (val == null || val == '')) continue
                if (info.maxLength != null && typeof val == 'string' && val.length > info.maxLength) val = val.substr(0, info.maxLength) + '...'
                html += '<tr><td>' + col.text + '</td><td>' + ((val === 0 ? '0' : val) || '') + '</td></tr>'
            }
            html += '</table>'
        } else if ($.isPlainObject(fields)) {
            // display some fields
            html = '<table cellpadding="0" cellspacing="0">'
            for (let caption in fields) {
                let fld = fields[caption]
                if (fld == '' || fld == '-' || fld == '--' || fld == '---') {
                    html += '<tr><td colspan=2><div style="border-top: '+ (fld == '' ? '0' : '1') +'px solid #C1BEBE; margin: 6px 0px;"></div></td></tr>'
                    continue
                }
                let tmp = String(fld).split(':')
                let col = this.getColumn(tmp[0])
                if (col == null) col = { field: tmp[0], caption: tmp[0] } // if not found in columns
                let val = (col ? this.parseField(rec, col.field) : '')
                if (tmp.length > 1) {
                    if (w2utils.formatters[tmp[1]]) {
                        val = w2utils.formatters[tmp[1]](val, tmp[2] || null, rec)
                    } else {
                        console.log('ERROR: w2utils.formatters["'+ tmp[1] + '"] does not exists.')
                    }
                }
                if (typeof fld == 'function') {
                    val = fld(rec, ind, col_ind)
                }
                if (info.showEmpty !== true && (val == null || val == '')) continue
                if (info.maxLength != null && typeof val == 'string' && val.length > info.maxLength) val = val.substr(0, info.maxLength) + '...'
                html += '<tr><td>' + caption + '</td><td>' + (val || '') + '</td></tr>'
            }
            html += '</table>'
        }
        $(el).w2tag($.extend({
            html        : html,
            left        : -4,
            position    : 'bottom|top',
            className   : 'w2ui-info-bubble',
            style       : '',
            hideOnClick : true
        }, info.options || {}))
    }

    // return null or the editable object if the given cell is editable
    getCellEditable(ind, col_ind) {
        let col = this.columns[col_ind]
        let rec = this.records[ind]
        if (!rec || !col) return null
        let edit = (rec.w2ui ? rec.w2ui.editable : null)
        if (edit === false) return null
        if (edit == null || edit === true) {
            edit = (col ? col.editable : null)
            if (typeof(edit) === 'function') {
                let data = this.getCellValue(ind, col_ind, false)
                // same arguments as col.render()
                edit = edit.call(this, rec, ind, col_ind, data)
            }
        }
        return edit
    }

    getCellValue(ind, col_ind, summary) {
        let col = this.columns[col_ind]
        let record = (summary !== true ? this.records[ind] : this.summary[ind])
        let data = this.parseField(record, col.field)
        if (record && record.w2ui && record.w2ui.changes && record.w2ui.changes[col.field] != null) {
            data = record.w2ui.changes[col.field]
        }
        if ($.isPlainObject(data) /*&& col.editable*/) { //It can be an object btw
            if (col.options && col.options.items) {
                val=col.options.items.find((item) => { return item.id == data.id })
                if (val) data=val.text
                else data=data.id
            } else {
                if (data.text != null) data = data.text
                if (data.id != null) data = data.id
            }
        }
        if (data == null) data = ''
        return data
    }

    getFooterHTML() {
        return '<div>'+
            '    <div class="w2ui-footer-left"></div>'+
            '    <div class="w2ui-footer-right"></div>'+
            '    <div class="w2ui-footer-center"></div>'+
            '</div>'
    }

    status(msg) {
        if (msg != null) {
            $('#grid_'+ this.name +'_footer').find('.w2ui-footer-left').html(msg)
        } else {
            // show number of selected
            let msgLeft = ''
            let sel = this.getSelection()
            if (sel.length > 0) {
                if (this.show.statusSelection && sel.length > 1) {
                    msgLeft = String(sel.length).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + ' ' + w2utils.lang('selected')
                }
                if (this.show.statusRecordID && sel.length == 1) {
                    let tmp = sel[0]
                    if (typeof tmp == 'object') tmp = tmp.recid + ', '+ w2utils.lang('Column') +': '+ tmp.column
                    msgLeft = w2utils.lang('Record ID') + ': '+ tmp + ' '
                }
            }
            $('#grid_'+ this.name +'_footer .w2ui-footer-left').html(msgLeft)
            // toolbar
            if (sel.length == 1) this.toolbar.enable('w2ui-edit'); else this.toolbar.disable('w2ui-edit')
            if (sel.length >= 1) this.toolbar.enable('w2ui-delete'); else this.toolbar.disable('w2ui-delete')
        }
    }

    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this.box)
        setTimeout(() => {
            // hide empty msg if any
            $(this.box).find('#grid_'+ this.name +'_empty_msg').remove()
            w2utils.lock.apply(window, args)
        }, 10)
    }

    unlock(speed) {
        setTimeout(() => {
            // do not unlock if there is a message
            if ($(this.box).find('.w2ui-message').not('.w2ui-closing').length > 0) return
            w2utils.unlock(this.box, speed)
        }, 25) // needed timer so if server fast, it will not flash
    }

    stateSave(returnOnly) {
        if (!w2utils.hasLocalStorage) return null
        let state = {
            columns     : [],
            show        : $.extend({}, this.show),
            last        : {
                search      : this.last.search,
                multi       : this.last.multi,
                logic       : this.last.logic,
                label       : this.last.label,
                field       : this.last.field,
                scrollTop   : this.last.scrollTop,
                scrollLeft  : this.last.scrollLeft
            },
            sortData    : [],
            searchData  : []
        }
        let prop_val
        for (let i = 0; i < this.columns.length; i++) {
            let col = this.columns[i]
            let col_save_obj = {}
            // iterate properties to save
            Object.keys(this.stateColProps).forEach((prop, idx) => {
                if(this.stateColProps[prop]){
                    // check if the property is defined on the column
                    if(col[prop] !== undefined){
                        prop_val = col[prop]
                    } else {
                        // use fallback or null
                        prop_val = this.stateColDefaults[prop] || null
                    }
                    col_save_obj[prop] = prop_val
                }
            })
            state.columns.push(col_save_obj)
        }
        for (let i = 0; i < this.sortData.length; i++) state.sortData.push($.extend({}, this.sortData[i]))
        for (let i = 0; i < this.searchData.length; i++) state.searchData.push($.extend({}, this.searchData[i]))
        // save into local storage
        if (returnOnly !== true) {
            // event before
            let edata = this.trigger({ phase: 'before', type: 'stateSave', target: this.name, state: state })
            if (edata.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return }
            try {
                let savedState = $.parseJSON(localStorage.w2ui || '{}')
                if (!savedState) savedState = {}
                if (!savedState.states) savedState.states = {}
                savedState.states[(this.stateId || this.name)] = state
                localStorage.w2ui = JSON.stringify(savedState)
            } catch (e) {
                delete localStorage.w2ui
                return null
            }
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
        return state
    }

    stateRestore(newState) {
        let url = (typeof this.url != 'object' ? this.url : this.url.get)
        if (!newState) {
            // read it from local storage
            try {
                if (!w2utils.hasLocalStorage) return false
                let tmp = $.parseJSON(localStorage.w2ui || '{}')
                if (!tmp) tmp = {}
                if (!tmp.states) tmp.states = {}
                newState = tmp.states[(this.stateId || this.name)]
            } catch (e) {
                delete localStorage.w2ui
                return null
            }
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'stateRestore', target: this.name, state: newState })
        if (edata.isCancelled === true) { if (typeof callBack == 'function') callBack({ status: 'error', message: 'Request aborted.' }); return }
        // default behavior
        if ($.isPlainObject(newState)) {
            $.extend(this.show, newState.show)
            $.extend(this.last, newState.last)
            let sTop = this.last.scrollTop
            let sLeft = this.last.scrollLeft
            for (let c = 0; c < newState.columns.length; c++) {
                let tmp = newState.columns[c]
                let col_index = this.getColumn(tmp.field, true)
                if (col_index !== null) {
                    $.extend(this.columns[col_index], tmp)
                    // restore column order from saved state
                    if (c !== col_index) this.columns.splice(c, 0, this.columns.splice(col_index, 1)[0])
                }
            }
            this.sortData.splice(0, this.sortData.length)
            for (let c = 0; c < newState.sortData.length; c++) this.sortData.push(newState.sortData[c])
            this.searchData.splice(0, this.searchData.length)
            for (let c = 0; c < newState.searchData.length; c++) this.searchData.push(newState.searchData[c])
            // apply sort and search
            setTimeout(() => {
                // needs timeout as records need to be populated
                // ez 10.09.2014 this -->
                if (!url) {
                    if (this.sortData.length > 0) this.localSort()
                    if (this.searchData.length > 0) this.localSearch()
                }
                this.last.scrollTop = sTop
                this.last.scrollLeft = sLeft
                this.refresh()
            }, 1)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return true
    }

    stateReset() {
        this.stateRestore(this.last.state)
        // remove from local storage
        if (w2utils.hasLocalStorage) {
            try {
                let tmp = $.parseJSON(localStorage.w2ui || '{}')
                if (tmp.states && tmp.states[(this.stateId || this.name)]) {
                    delete tmp.states[(this.stateId || this.name)]
                }
                localStorage.w2ui = JSON.stringify(tmp)
            } catch (e) {
                delete localStorage.w2ui
                return null
            }
        }
    }

    parseField(obj, field) {
        if (this.nestedFields) {
            let val = ''
            try { // need this to make sure no error in fields
                val = obj
                let tmp = String(field).split('.')
                for (let i = 0; i < tmp.length; i++) {
                    val = val[tmp[i]]
                }
            } catch (event) {
                val = ''
            }
            return val
        } else {
            return obj ? obj[field] : ''
        }
    }

    prepareData() {
        let obj = this

        // loops thru records and prepares date and time objects
        for (let r = 0; r < this.records.length; r++) {
            let rec = this.records[r]
            prepareRecord(rec)
        }

        // prepare date and time objects for the 'rec' record and its closed children
        function prepareRecord(rec) {
            for (let c = 0; c < obj.columns.length; c++) {
                let column = obj.columns[c]
                if (rec[column.field] == null || typeof column.render != 'string') continue
                // number
                if (['number', 'int', 'float', 'money', 'currency', 'percent'].indexOf(column.render.split(':')[0]) != -1) {
                    if (typeof rec[column.field] != 'number') rec[column.field] = parseFloat(rec[column.field])
                }
                // date
                if (['date', 'age'].indexOf(column.render.split(':')[0]) != -1) {
                    if (!rec[column.field + '_']) {
                        let dt = rec[column.field]
                        if (w2utils.isInt(dt)) dt = parseInt(dt)
                        rec[column.field + '_'] = new Date(dt)
                    }
                }
                // time
                if (['time'].indexOf(column.render) != -1) {
                    if (w2utils.isTime(rec[column.field])) { // if string
                        let tmp = w2utils.isTime(rec[column.field], true)
                        let dt = new Date()
                        dt.setHours(tmp.hours, tmp.minutes, (tmp.seconds ? tmp.seconds : 0), 0) // sets hours, min, sec, mills
                        if (!rec[column.field + '_']) rec[column.field + '_'] = dt
                    } else { // if date object
                        let tmp = rec[column.field]
                        if (w2utils.isInt(tmp)) tmp = parseInt(tmp)
                        tmp = (tmp != null ? new Date(tmp) : new Date())
                        let dt = new Date()
                        dt.setHours(tmp.getHours(), tmp.getMinutes(), tmp.getSeconds(), 0) // sets hours, min, sec, mills
                        if (!rec[column.field + '_']) rec[column.field + '_'] = dt
                    }
                }
            }

            if (rec.w2ui && rec.w2ui.children && rec.w2ui.expanded !== true) {
                // there are closed children, prepare them too.
                for (let r = 0; r < rec.w2ui.children.length; r++) {
                    let subRec = rec.w2ui.children[r]
                    prepareRecord(subRec)
                }
            }
        }
    }

    nextCell(index, col_ind, editable) {
        let check = col_ind + 1
        if (check >= this.columns.length) return null
        let tmp = this.records[index].w2ui
        // let ccol = this.columns[col_ind]
        // if (tmp && tmp.colspan[ccol.field]) check += parseInt(tmp.colspan[ccol.field]) -1; // colspan of a column
        let col = this.columns[check]
        let span = (tmp && tmp.colspan && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
        if (col == null) return null
        if (col && col.hidden || span === 0) return this.nextCell(index, check, editable)
        if (editable) {
            let edit = this.getCellEditable(index, col_ind)
            if (edit == null || ['checkbox', 'check'].indexOf(edit.type) != -1) {
                return this.nextCell(index, check, editable)
            }
        }
        return check
    }

    prevCell(index, col_ind, editable) {
        let check = col_ind - 1
        if (check < 0) return null
        let tmp = this.records[index].w2ui
        let col = this.columns[check]
        let span = (tmp && tmp.colspan && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
        if (col == null) return null
        if (col && col.hidden || span === 0) return this.prevCell(index, check, editable)
        if (editable) {
            let edit = this.getCellEditable(index, col_ind)
            if (edit == null || ['checkbox', 'check'].indexOf(edit.type) != -1) {
                return this.prevCell(index, check, editable)
            }
        }
        return check
    }

    nextRow(ind, col_ind) {
        let sids = this.last.searchIds
        let ret = null
        if ((ind + 1 < this.records.length && sids.length === 0) // if there are more records
                || (sids.length > 0 && ind < sids[sids.length-1])) {
            ind++
            if (sids.length > 0) while (true) {
                if ($.inArray(ind, sids) != -1 || ind > this.records.length) break
                ind++
            }
            // colspan
            let tmp = this.records[ind].w2ui
            let col = this.columns[col_ind]
            let span = (tmp && tmp.colspan && col != null && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
            if (span === 0) {
                ret = this.nextRow(ind, col_ind)
            } else {
                ret = ind
            }
        }
        return ret
    }

    prevRow(ind, col_ind) {
        let sids = this.last.searchIds
        let ret = null
        if ((ind > 0 && sids.length === 0) // if there are more records
                || (sids.length > 0 && ind > sids[0])) {
            ind--
            if (sids.length > 0) while (true) {
                if ($.inArray(ind, sids) != -1 || ind < 0) break
                ind--
            }
            // colspan
            let tmp = this.records[ind].w2ui
            let col = this.columns[col_ind]
            let span = (tmp && tmp.colspan && col != null && !isNaN(tmp.colspan[col.field]) ? parseInt(tmp.colspan[col.field]) : 1)
            if (span === 0) {
                ret = this.prevRow(ind, col_ind)
            } else {
                ret = ind
            }
        }
        return ret
    }

    selectionSave() {
        this.last._selection = this.getSelection()
        return this.last._selection
    }

    selectionRestore(noRefresh) {
        let time = (new Date()).getTime()
        this.last.selection = { indexes: [], columns: {} }
        let sel = this.last.selection
        let lst = this.last._selection
        if (lst) for (let i = 0; i < lst.length; i++) {
            if ($.isPlainObject(lst[i])) {
                // selectType: cell
                let tmp = this.get(lst[i].recid, true)
                if (tmp != null) {
                    if (sel.indexes.indexOf(tmp) == -1) sel.indexes.push(tmp)
                    if (!sel.columns[tmp]) sel.columns[tmp] = []
                    sel.columns[tmp].push(lst[i].column)
                }
            } else {
                // selectType: row
                let tmp = this.get(lst[i], true)
                if (tmp != null) sel.indexes.push(tmp)
            }
        }
        delete this.last._selection
        if (noRefresh !== true) this.refresh()
        return (new Date()).getTime() - time
    }

    message(options, callBack) {
        if (typeof options == 'string') {
            options = {
                width   : (options.length < 300 ? 350 : 550),
                height  : (options.length < 300 ? 170: 250),
                body    : '<div class="w2ui-centered">' + options + '</div>',
                buttons : '<button type="button" class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].message()">Ok</button>',
                onOpen(event) {
                    setTimeout(() => {
                        $(this.box).find('.w2ui-btn').focus()
                    }, 25)
                },
                onClose(even) {
                    if (typeof callBack == 'function') callBack()
                }
            }
        }
        w2utils.message.call(this, {
            box   : this.box,
            path  : 'w2ui.' + this.name,
            title : '.w2ui-grid-header:visible',
            body  : '.w2ui-grid-box'
        }, options)
    }
}

export { w2grid }
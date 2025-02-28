/* w2ui 2.0.x (nightly) (c) http://w2ui.com, vitmalina@gmail.com */
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
**/

class w2event {
    constructor(name) {
        this.handlers = []
        // register globaly
        if (name) {
            window.w2ui = window.w2ui || {}
            if (!w2utils.checkName(name)) return
            window.w2ui[name] = this
        }
    }
    on(edata, handler) {
        let scope
        // allow 'eventName.scope' syntax
        if (typeof edata === 'string' && edata.indexOf('.') !== -1) {
            let tmp = edata.split('.')
            edata = tmp[0]
            scope = tmp[1]
        }
        // allow 'eventName:after' syntax
        if (typeof edata === 'string' && edata.indexOf(':') !== -1) {
            let tmp = edata.split(':')
            if (['complete', 'done'].indexOf(edata[1]) !== -1) edata[1] = 'after'
            edata = {
                type    : tmp[0],
                execute : tmp[1]
            }
            if (scope) edata.scope = scope
        }
        if (!$.isPlainObject(edata)) edata = { type: edata, scope: scope }
        edata = $.extend({ type: null, execute: 'before', target: null, onComplete: null }, edata)
        // errors
        if (!edata.type) { console.log('ERROR: You must specify event type when calling .on() method of '+ this.name); return }
        if (!handler) { console.log('ERROR: You must specify event handler function when calling .on() method of '+ this.name); return }
        if (!Array.isArray(this.handlers)) this.handlers = []
        this.handlers.push({ edata: edata, handler: handler })
        return this // needed for chaining
    }
    off(edata, handler) {
        let scope
        // allow 'eventName.scope' syntax
        if (typeof edata === 'string' && edata.indexOf('.') !== -1) {
            let tmp = edata.split('.')
            edata = tmp[0]
            scope = tmp[1]
            if (edata === '') edata = '*'
        }
        // allow 'eventName:after' syntax
        if (typeof edata === 'string' && edata.indexOf(':') !== -1) {
            let tmp = edata.split(':')
            if (['complete', 'done'].indexOf(edata[1]) !== -1) edata[1] = 'after'
            edata = {
                type    : tmp[0],
                execute : tmp[1]
            }
        }
        if (!$.isPlainObject(edata)) edata = { type: edata }
        edata = $.extend({}, { type: null, execute: null, target: null, onComplete: null }, edata)
        // errors
        if (!edata.type && !scope) { console.log('ERROR: You must specify event type when calling .off() method of '+ this.name); return }
        if (!handler) { handler = null }
        // remove handlers
        let newHandlers = []
        for (let h = 0, len = this.handlers.length; h < len; h++) {
            let t = this.handlers[h]
            if ((t.edata.type === edata.type || edata.type === '*' || (t.edata.scope != null && edata.type == '')) &&
                (t.edata.target === edata.target || edata.target == null) &&
                (t.edata.execute === edata.execute || edata.execute == null) &&
                ((t.handler === handler && handler != null) || (scope != null && t.edata.scope == scope)))
            {
                // match
            } else {
                newHandlers.push(t)
            }
        }
        this.handlers = newHandlers
        return this
    }
    trigger(edata) {
        edata = $.extend({ type: null, phase: 'before', target: null, doneHandlers: [] }, edata, {
            isStopped: false,
            isCancelled: false,
            done(handler) { this.doneHandlers.push(handler) },
            preventDefault() { this.isCancelled = true },
            stopPropagation() { this.isStopped = true }
        })
        if (edata.phase === 'before') edata.onComplete = null
        let args, fun, tmp
        if (edata.target == null) edata.target = null
        if (!Array.isArray(this.handlers)) this.handlers = []
        // process events in REVERSE order
        for (let h = this.handlers.length-1; h >= 0; h--) {
            let item = this.handlers[h]
            if (item != null && (item.edata.type === edata.type || item.edata.type === '*') &&
                (item.edata.target === edata.target || item.edata.target == null) &&
                (item.edata.execute === edata.phase || item.edata.execute === '*' || item.edata.phase === '*'))
            {
                edata = $.extend({}, item.edata, edata)
                // check handler arguments
                args = []
                tmp = new RegExp(/\((.*?)\)/).exec(item.handler)
                if (tmp) args = tmp[1].split(/\s*,\s*/)
                if (args.length === 2) {
                    item.handler.call(this, edata.target, edata) // old way for back compatibility
                } else {
                    item.handler.call(this, edata) // new way
                }
                if (edata.isStopped === true || edata.stop === true) return edata // back compatibility edata.stop === true
            }
        }
        // main object events
        let funName = 'on' + edata.type.substr(0,1).toUpperCase() + edata.type.substr(1)
        if (edata.phase === 'before' && typeof this[funName] === 'function') {
            fun = this[funName]
            // check handler arguments
            args = []
            tmp = new RegExp(/\((.*?)\)/).exec(fun)
            if (tmp) args = tmp[1].split(/\s*,\s*/)
            if (args.length === 2) {
                fun.call(this, edata.target, edata) // old way for back compatibility
            } else {
                fun.call(this, edata) // new way
            }
            if (edata.isStopped === true || edata.stop === true) return edata // back compatibility edata.stop === true
        }
        // item object events
        if (edata.object != null && edata.phase === 'before' && typeof edata.object[funName] === 'function') {
            fun = edata.object[funName]
            // check handler arguments
            args = []
            tmp = new RegExp(/\((.*?)\)/).exec(fun)
            if (tmp) args = tmp[1].split(/\s*,\s*/)
            if (args.length === 2) {
                fun.call(this, edata.target, edata) // old way for back compatibility
            } else {
                fun.call(this, edata) // new way
            }
            if (edata.isStopped === true || edata.stop === true) return edata
        }
        // execute onComplete
        if (edata.phase === 'after') {
            if (typeof edata.onComplete === 'function') edata.onComplete.call(this, edata)
            for (let i = 0; i < edata.doneHandlers.length; i++) {
                if (typeof edata.doneHandlers[i] === 'function') {
                    edata.doneHandlers[i].call(this, edata)
                }
            }
        }
        return edata
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery
*        - w2ui             - object that will contain all widgets
*        - w2utils          - basic utilities
*        - w2utils.event    - generic event object
*
* == TODO ==
*   - overlay should be displayed where more space (on top or on bottom)
*   - write and article how to replace certain framework functions
*   - add maxHeight for the w2menu
*   - add time zone
*   - TEST On IOS
*   - $().w2marker() -- only unmarks first instance
*   - subitems for w2menus()
*   - add w2utils.lang wrap for all captions in all buttons.
*   - $().w2date(), $().w2dateTime()
*
* == 1.5 change
*   - parseColor(str) returns rgb
*   - rgb2hsv, hsv2rgb
*   - color.onSelect
*   - color.html
*   - refactored w2tag object, it has more potential with $().data('w2tag')
*   - added w2utils.tooltip
*   - w2tag options.hideOnFocus
*   - w2tag options.maxWidth
*   - w2tag options.auto - if set to true, then tag will show on mouseover
*   - w2tag options.showOn, hideOn - if set to true, then tag will show on mouseover
*   - w2tag options.className: 'w2ui-light' - for light color tag
*   - w2menu options.items... remove t/f
*   - w2menu options.items... keepOpen t/f
*   - w2menu options.onRemove
*   - w2menu options.hideOnRemove
*   - w2menu - can not nest items, item.items and item.expanded
*   - w2menu.options.topHTML
*   - w2menu.options.menuStyle
*   - naturalCompare
*   == 2.0
*   - normMenu
*
************************************************/
let w2ui = {}
let w2utils = (($) => {
    let tmp = {} // for some temp variables
    return {
        version  : '2.0.x',
        settings : {
            'locale'            : 'en-us',
            'dateFormat'        : 'm/d/yyyy',
            'timeFormat'        : 'hh:mi pm',
            'datetimeFormat'    : 'm/d/yyyy|hh:mi pm',
            'currencyPrefix'    : '$',
            'currencySuffix'    : '',
            'currencyPrecision' : 2,
            'groupSymbol'       : ',',
            'decimalSymbol'     : '.',
            'shortmonths'       : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'fullmonths'        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            'shortdays'         : ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            'fulldays'          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'weekStarts'        : 'M', // can be "M" for Monday or "S" for Sunday
            'dataType'          : 'HTTPJSON', // can be HTTP, HTTPJSON, RESTFULL, RESTFULLJSON, JSON (case sensitive)
            'phrases'           : {}, // empty object for english phrases
            'dateStartYear'     : 1950, // start year for date-picker
            'dateEndYear'       : 2030, // end year for date picker
            'macButtonOrder'    : false // if true, Yes on the right side
        },
        isBin,
        isInt,
        isFloat,
        isMoney,
        isHex,
        isAlphaNumeric,
        isEmail,
        isIpAddress,
        isDate,
        isTime,
        isDateTime,
        age,
        interval,
        date,
        formatSize,
        formatNumber,
        formatDate,
        formatTime,
        formatDateTime,
        stripTags,
        encodeTags,
        decodeTags,
        escapeId,
        normMenu,
        base64encode,
        base64decode,
        md5,
        transition,
        lock,
        unlock,
        message,
        naturalCompare,
        lang,
        locale,
        getSize,
        getStrWidth,
        scrollBarSize,
        checkName,
        checkUniqueId,
        parseRoute,
        cssPrefix,
        parseColor,
        hsv2rgb,
        rgb2hsv,
        tooltip,
        getCursorPosition,
        setCursorPosition,
        testLocalStorage,
        hasLocalStorage: testLocalStorage(),
        // some internal variables
        isIOS : ((navigator.userAgent.toLowerCase().indexOf('iphone') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipod') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('ipad') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('mobile') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('android') !== -1)
                 ? true : false),
        isIE : ((navigator.userAgent.toLowerCase().indexOf('msie') !== -1 ||
                 navigator.userAgent.toLowerCase().indexOf('trident') !== -1 )
                 ? true : false)
    }
    function isBin (val) {
        let re = /^[0-1]+$/
        return re.test(val)
    }
    function isInt (val) {
        let re = /^[-+]?[0-9]+$/
        return re.test(val)
    }
    function isFloat (val) {
        if (typeof val === 'string') val = val.replace(/\s+/g, '').replace(w2utils.settings.groupSymbol, '').replace(w2utils.settings.decimalSymbol, '.')
        return (typeof val === 'number' || (typeof val === 'string' && val !== '')) && !isNaN(Number(val))
    }
    function isMoney (val) {
        if (typeof val === 'object' || val === '') return false
        if(isFloat(val)) return true
        let se = w2utils.settings
        let re = new RegExp('^'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[-+]?'+ (se.currencyPrefix ? '\\' + se.currencyPrefix + '?' : '') +
                            '[0-9]*[\\'+ se.decimalSymbol +']?[0-9]+'+ (se.currencySuffix ? '\\' + se.currencySuffix + '?' : '') +'$', 'i')
        if (typeof val === 'string') {
            val = val.replace(new RegExp(se.groupSymbol, 'g'), '')
        }
        return re.test(val)
    }
    function isHex (val) {
        let re = /^(0x)?[0-9a-fA-F]+$/
        return re.test(val)
    }
    function isAlphaNumeric (val) {
        let re = /^[a-zA-Z0-9_-]+$/
        return re.test(val)
    }
    function isEmail (val) {
        let email = /^[a-zA-Z0-9._%\-+]+@[а-яА-Яa-zA-Z0-9.-]+\.[а-яА-Яa-zA-Z]+$/
        return email.test(val)
    }
    function isIpAddress (val) {
        let re = new RegExp('^' +
                            '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}' +
                            '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' +
                            '$')
        return re.test(val)
    }
    function isDate (val, format, retDate) {
        if (!val) return false
        let dt = 'Invalid Date'
        let month, day, year
        if (format == null) format = w2utils.settings.dateFormat
        if (typeof val.getFullYear === 'function') { // date object
            year = val.getFullYear()
            month = val.getMonth() + 1
            day = val.getDate()
        } else if (parseInt(val) == val && parseInt(val) > 0) {
            val = new Date(parseInt(val))
            year = val.getFullYear()
            month = val.getMonth() + 1
            day = val.getDate()
        } else {
            val = String(val)
            // convert month formats
            if (new RegExp('mon', 'ig').test(format)) {
                format = format.replace(/month/ig, 'm').replace(/mon/ig, 'm').replace(/dd/ig, 'd').replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase()
                val = val.replace(/[, ]/ig, '/').replace(/\/\//g, '/').toLowerCase()
                for (let m = 0, len = w2utils.settings.fullmonths.length; m < len; m++) {
                    let t = w2utils.settings.fullmonths[m]
                    val = val.replace(new RegExp(t, 'ig'), (parseInt(m) + 1)).replace(new RegExp(t.substr(0, 3), 'ig'), (parseInt(m) + 1))
                }
            }
            // format date
            let tmp = val.replace(/-/g, '/').replace(/\./g, '/').toLowerCase().split('/')
            let tmp2 = format.replace(/-/g, '/').replace(/\./g, '/').toLowerCase()
            if (tmp2 === 'mm/dd/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'm/d/yyyy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'dd/mm/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2] }
            if (tmp2 === 'd/m/yyyy') { month = tmp[1]; day = tmp[0]; year = tmp[2] }
            if (tmp2 === 'yyyy/dd/mm') { month = tmp[2]; day = tmp[1]; year = tmp[0] }
            if (tmp2 === 'yyyy/d/m') { month = tmp[2]; day = tmp[1]; year = tmp[0] }
            if (tmp2 === 'yyyy/mm/dd') { month = tmp[1]; day = tmp[2]; year = tmp[0] }
            if (tmp2 === 'yyyy/m/d') { month = tmp[1]; day = tmp[2]; year = tmp[0] }
            if (tmp2 === 'mm/dd/yy') { month = tmp[0]; day = tmp[1]; year = tmp[2] }
            if (tmp2 === 'm/d/yy') { month = tmp[0]; day = tmp[1]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'dd/mm/yy') { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'd/m/yy') { month = tmp[1]; day = tmp[0]; year = parseInt(tmp[2]) + 1900 }
            if (tmp2 === 'yy/dd/mm') { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/d/m') { month = tmp[2]; day = tmp[1]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/mm/dd') { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900 }
            if (tmp2 === 'yy/m/d') { month = tmp[1]; day = tmp[2]; year = parseInt(tmp[0]) + 1900 }
        }
        if (!isInt(year)) return false
        if (!isInt(month)) return false
        if (!isInt(day)) return false
        year = +year
        month = +month
        day = +day
        dt = new Date(year, month - 1, day)
        dt.setFullYear(year)
        // do checks
        if (month == null) return false
        if (String(dt) === 'Invalid Date') return false
        if ((dt.getMonth() + 1 !== month) || (dt.getDate() !== day) || (dt.getFullYear() !== year)) return false
        if (retDate === true) return dt; else return true
    }
    function isTime (val, retTime) {
        // Both formats 10:20pm and 22:20
        if (val == null) return false
        let max, am, pm
        // -- process american format
        val = String(val)
        val = val.toUpperCase()
        am = val.indexOf('AM') >= 0
        pm = val.indexOf('PM') >= 0
        let ampm = (pm || am)
        if (ampm) max = 12; else max = 24
        val = val.replace('AM', '').replace('PM', '')
        val = $.trim(val)
        // ---
        let tmp = val.split(':')
        let h = parseInt(tmp[0] || 0), m = parseInt(tmp[1] || 0), s = parseInt(tmp[2] || 0)
        // accept edge case: 3PM is a good timestamp, but 3 (without AM or PM) is NOT:
        if ((!ampm || tmp.length !== 1) && tmp.length !== 2 && tmp.length !== 3) { return false }
        if (tmp[0] === '' || h < 0 || h > max || !this.isInt(tmp[0]) || tmp[0].length > 2) { return false }
        if (tmp.length > 1 && (tmp[1] === '' || m < 0 || m > 59 || !this.isInt(tmp[1]) || tmp[1].length !== 2)) { return false }
        if (tmp.length > 2 && (tmp[2] === '' || s < 0 || s > 59 || !this.isInt(tmp[2]) || tmp[2].length !== 2)) { return false }
        // check the edge cases: 12:01AM is ok, as is 12:01PM, but 24:01 is NOT ok while 24:00 is (midnight; equivalent to 00:00).
        // meanwhile, there is 00:00 which is ok, but 0AM nor 0PM are okay, while 0:01AM and 0:00AM are.
        if (!ampm && max === h && (m !== 0 || s !== 0)) { return false }
        if (ampm && tmp.length === 1 && h === 0) { return false }
        if (retTime === true) {
            if (pm && h !== 12) h += 12 // 12:00pm - is noon
            if (am && h === 12) h += 12 // 12:00am - is midnight
            return {
                hours: h,
                minutes: m,
                seconds: s
            }
        }
        return true
    }
    function isDateTime (val, format, retDate) {
        if (typeof val.getFullYear === 'function') { // date object
            if (retDate !== true) return true
            return val
        }
        let intVal = parseInt(val)
        if (intVal === val) {
            if (intVal < 0) return false
            else if (retDate !== true) return true
            else return new Date(intVal)
        }
        let tmp = String(val).indexOf(' ')
        if (tmp < 0) {
            if (String(val).indexOf('T') < 0 || String(new Date(val)) == 'Invalid Date') return false
            else if (retDate !== true) return true
            else return new Date(val)
        } else {
            if (format == null) format = w2utils.settings.datetimeFormat
            let formats = format.split('|')
            let values = [val.substr(0, tmp), val.substr(tmp).trim()]
            formats[0] = formats[0].trim()
            if (formats[1]) formats[1] = formats[1].trim()
            // check
            let tmp1 = w2utils.isDate(values[0], formats[0], true)
            let tmp2 = w2utils.isTime(values[1], true)
            if (tmp1 !== false && tmp2 !== false) {
                if (retDate !== true) return true
                tmp1.setHours(tmp2.hours)
                tmp1.setMinutes(tmp2.minutes)
                tmp1.setSeconds(tmp2.seconds)
                return tmp1
            } else {
                return false
            }
        }
    }
    function age(dateStr) {
        let d1
        if (dateStr === '' || dateStr == null) return ''
        if (typeof dateStr.getFullYear === 'function') { // date object
            d1 = dateStr
        } else if (parseInt(dateStr) == dateStr && parseInt(dateStr) > 0) {
            d1 = new Date(parseInt(dateStr))
        } else {
            d1 = new Date(dateStr)
        }
        if (String(d1) === 'Invalid Date') return ''
        let d2 = new Date()
        let sec = (d2.getTime() - d1.getTime()) / 1000
        let amount = ''
        let type = ''
        if (sec < 0) {
            amount = 0
            type = 'sec'
        } else if (sec < 60) {
            amount = Math.floor(sec)
            type = 'sec'
            if (sec < 0) { amount = 0; type = 'sec' }
        } else if (sec < 60*60) {
            amount = Math.floor(sec/60)
            type = 'min'
        } else if (sec < 24*60*60) {
            amount = Math.floor(sec/60/60)
            type = 'hour'
        } else if (sec < 30*24*60*60) {
            amount = Math.floor(sec/24/60/60)
            type = 'day'
        } else if (sec < 365*24*60*60) {
            amount = Math.floor(sec/30/24/60/60*10)/10
            type = 'month'
        } else if (sec < 365*4*24*60*60) {
            amount = Math.floor(sec/365/24/60/60*10)/10
            type = 'year'
        } else if (sec >= 365*4*24*60*60) {
            // factor in leap year shift (only older then 4 years)
            amount = Math.floor(sec/365.25/24/60/60*10)/10
            type = 'year'
        }
        return amount + ' ' + type + (amount > 1 ? 's' : '')
    }
    function interval (value) {
        let ret = ''
        if (value < 1000) {
            ret = '< 1 sec'
        } else if (value < 60000) {
            ret = Math.floor(value / 1000) + ' secs'
        } else if (value < 3600000) {
            ret = Math.floor(value / 60000) + ' mins'
        } else if (value < 86400000) {
            ret = Math.floor(value / 3600000 * 10) / 10 + ' hours'
        } else if (value < 2628000000) {
            ret = Math.floor(value / 86400000 * 10) / 10 + ' days'
        } else if (value < 3.1536e+10) {
            ret = Math.floor(value / 2628000000 * 10) / 10 + ' months'
        } else {
            ret = Math.floor(value / 3.1536e+9) / 10 + ' years'
        }
        return ret
    }
    function date (dateStr) {
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        let d1 = new Date(dateStr)
        if (w2utils.isInt(dateStr)) d1 = new Date(Number(dateStr)) // for unix timestamps
        if (String(d1) === 'Invalid Date') return ''
        let months = w2utils.settings.shortmonths
        let d2 = new Date() // today
        let d3 = new Date()
        d3.setTime(d3.getTime() - 86400000) // yesterday
        let dd1 = months[d1.getMonth()] + ' ' + d1.getDate() + ', ' + d1.getFullYear()
        let dd2 = months[d2.getMonth()] + ' ' + d2.getDate() + ', ' + d2.getFullYear()
        let dd3 = months[d3.getMonth()] + ' ' + d3.getDate() + ', ' + d3.getFullYear()
        let time = (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am')
        let time2= (d1.getHours() - (d1.getHours() > 12 ? 12 :0)) + ':' + (d1.getMinutes() < 10 ? '0' : '') + d1.getMinutes() + ':' + (d1.getSeconds() < 10 ? '0' : '') + d1.getSeconds() + ' ' + (d1.getHours() >= 12 ? 'pm' : 'am')
        let dsp = dd1
        if (dd1 === dd2) dsp = time
        if (dd1 === dd3) dsp = w2utils.lang('Yesterday')
        return '<span title="'+ dd1 +' ' + time2 +'">'+ dsp +'</span>'
    }
    function formatSize (sizeStr) {
        if (!w2utils.isFloat(sizeStr) || sizeStr === '') return ''
        sizeStr = parseFloat(sizeStr)
        if (sizeStr === 0) return 0
        let sizes = ['Bt', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB']
        let i = parseInt( Math.floor( Math.log(sizeStr) / Math.log(1024) ) )
        return (Math.floor(sizeStr / Math.pow(1024, i) * 10) / 10).toFixed(i === 0 ? 0 : 1) + ' ' + (sizes[i] || '??')
    }
    function formatNumber (val, fraction, useGrouping) {
        if (val == null || val === '' || typeof val === 'object') return ''
        let options = {
            minimumFractionDigits : fraction,
            maximumFractionDigits : fraction,
            useGrouping : useGrouping
        }
        if (fraction == null || fraction < 0) {
            options.minimumFractionDigits = 0
            options.maximumFractionDigits = 20
        }
        return parseFloat(val).toLocaleString(w2utils.settings.locale, options)
    }
    function formatDate (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.dateFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        let dt = new Date(dateStr)
        if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (String(dt) === 'Invalid Date') return ''
        let year = dt.getFullYear()
        let month = dt.getMonth()
        let date = dt.getDate()
        return format.toLowerCase()
            .replace('month', w2utils.settings.fullmonths[month])
            .replace('mon', w2utils.settings.shortmonths[month])
            .replace(/yyyy/g, ('000' + year).slice(-4))
            .replace(/yyy/g, ('000' + year).slice(-4))
            .replace(/yy/g, ('0' + year).slice(-2))
            .replace(/(^|[^a-z$])y/g, '$1' + year) // only y's that are not preceded by a letter
            .replace(/mm/g, ('0' + (month + 1)).slice(-2))
            .replace(/dd/g, ('0' + date).slice(-2))
            .replace(/th/g, (date == 1 ? 'st' : 'th'))
            .replace(/th/g, (date == 2 ? 'nd' : 'th'))
            .replace(/th/g, (date == 3 ? 'rd' : 'th'))
            .replace(/(^|[^a-z$])m/g, '$1' + (month + 1)) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])d/g, '$1' + date) // only y's that are not preceded by a letter
    }
    function formatTime (dateStr, format) { // IMPORTANT dateStr HAS TO BE valid JavaScript Date String
        if (!format) format = this.settings.timeFormat
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        let dt = new Date(dateStr)
        if (w2utils.isInt(dateStr)) dt = new Date(Number(dateStr)) // for unix timestamps
        if (w2utils.isTime(dateStr)) {
            let tmp = w2utils.isTime(dateStr, true)
            dt = new Date()
            dt.setHours(tmp.hours)
            dt.setMinutes(tmp.minutes)
        }
        if (String(dt) === 'Invalid Date') return ''
        let type = 'am'
        let hour = dt.getHours()
        let h24 = dt.getHours()
        let min = dt.getMinutes()
        let sec = dt.getSeconds()
        if (min < 10) min = '0' + min
        if (sec < 10) sec = '0' + sec
        if (format.indexOf('am') !== -1 || format.indexOf('pm') !== -1) {
            if (hour >= 12) type = 'pm'
            if (hour > 12) hour = hour - 12
            if (hour === 0) hour = 12
        }
        return format.toLowerCase()
            .replace('am', type)
            .replace('pm', type)
            .replace('hhh', (hour < 10 ? '0' + hour : hour))
            .replace('hh24', (h24 < 10 ? '0' + h24 : h24))
            .replace('h24', h24)
            .replace('hh', hour)
            .replace('mm', min)
            .replace('mi', min)
            .replace('ss', sec)
            .replace(/(^|[^a-z$])h/g, '$1' + hour) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])m/g, '$1' + min) // only y's that are not preceded by a letter
            .replace(/(^|[^a-z$])s/g, '$1' + sec) // only y's that are not preceded by a letter
    }
    function formatDateTime(dateStr, format) {
        let fmt
        if (dateStr === '' || dateStr == null || (typeof dateStr === 'object' && !dateStr.getMonth)) return ''
        if (typeof format !== 'string') {
            fmt = [this.settings.dateFormat, this.settings.timeFormat]
        } else {
            fmt = format.split('|')
            fmt[0] = fmt[0].trim()
            fmt[1] = (fmt.length > 1 ? fmt[1].trim() : this.settings.timeFormat)
        }
        // older formats support
        if (fmt[1] === 'h12') fmt[1] = 'h:m pm'
        if (fmt[1] === 'h24') fmt[1] = 'h24:m'
        return this.formatDate(dateStr, fmt[0]) + ' ' + this.formatTime(dateStr, fmt[1])
    }
    function stripTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/<(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*>/ig, '')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.stripTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.stripTags(html[i])
                }
                break
        }
        return html
    }
    function encodeTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.encodeTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.encodeTags(html[i])
                }
                break
        }
        return html
    }
    function decodeTags (html) {
        if (html == null) return html
        switch (typeof html) {
            case 'number':
                break
            case 'string':
                html = String(html).replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
                break
            case 'object':
                // does not modify original object, but creates a copy
                if (Array.isArray(html)) {
                    html = $.extend(true, [], html)
                    for (let i = 0; i < html.length; i++) html[i] = this.decodeTags(html[i])
                } else {
                    html = $.extend(true, {}, html)
                    for (let i in html) html[i] = this.decodeTags(html[i])
                }
                break
        }
        return html
    }
    function escapeId (id) {
        if (id === '' || id == null) return ''
        return String(id).replace(/([;&,\.\+\*\~'`:"\!\^#$%@\[\]\(\)=<>\|\/? {}\\])/g, '\\$1')
    }
    function base64encode (input) {
        let output = ''
        let chr1, chr2, chr3, enc1, enc2, enc3, enc4
        let i = 0
        let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        input = utf8_encode(input)
        while (i < input.length) {
            chr1 = input.charCodeAt(i++)
            chr2 = input.charCodeAt(i++)
            chr3 = input.charCodeAt(i++)
            enc1 = chr1 >> 2
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
            enc4 = chr3 & 63
            if (isNaN(chr2)) {
                enc3 = enc4 = 64
            } else if (isNaN(chr3)) {
                enc4 = 64
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
        }
        function utf8_encode (string) {
            string = String(string).replace(/\r\n/g,'\n')
            let utftext = ''
            for (let n = 0; n < string.length; n++) {
                let c = string.charCodeAt(n)
                if (c < 128) {
                    utftext += String.fromCharCode(c)
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192)
                    utftext += String.fromCharCode((c & 63) | 128)
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224)
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128)
                    utftext += String.fromCharCode((c & 63) | 128)
                }
            }
            return utftext
        }
        return output
    }
    function base64decode (input) {
        let output = ''
        let chr1, chr2, chr3
        let enc1, enc2, enc3, enc4
        let i = 0
        let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '')
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++))
            enc2 = keyStr.indexOf(input.charAt(i++))
            enc3 = keyStr.indexOf(input.charAt(i++))
            enc4 = keyStr.indexOf(input.charAt(i++))
            chr1 = (enc1 << 2) | (enc2 >> 4)
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
            chr3 = ((enc3 & 3) << 6) | enc4
            output = output + String.fromCharCode(chr1)
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2)
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3)
            }
        }
        output = utf8_decode(output)
        function utf8_decode (utftext) {
            let string = ''
            let i = 0
            let c = 0, c2, c3
            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i)
                if (c < 128) {
                    string += String.fromCharCode(c)
                    i++
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1)
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63))
                    i += 2
                }
                else {
                    c2 = utftext.charCodeAt(i+1)
                    c3 = utftext.charCodeAt(i+2)
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
                    i += 3
                }
            }
            return string
        }
        return output
    }
    function md5(input) {
        /*
         * Based on http://pajhome.org.uk/crypt/md5
         */
        let hexcase = 0
        function __pj_crypt_hex_md5(s) {
            return __pj_crypt_rstr2hex(__pj_crypt_rstr_md5(__pj_crypt_str2rstr_utf8(s)))
        }
        /*
         * Calculate the MD5 of a raw string
         */
        function __pj_crypt_rstr_md5(s)
        {
            return __pj_crypt_binl2rstr(__pj_crypt_binl_md5(__pj_crypt_rstr2binl(s), s.length * 8))
        }
        /*
         * Convert a raw string to a hex string
         */
        function __pj_crypt_rstr2hex(input)
        {
            try {
                hexcase
            } catch (e) {
                hexcase = 0
            }
            let hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef'
            let output = ''
            let x
            for (let i = 0; i < input.length; i++)
            {
                x = input.charCodeAt(i)
                output += hex_tab.charAt((x >>> 4) & 0x0F)
                        + hex_tab.charAt(x & 0x0F)
            }
            return output
        }
        /*
         * Encode a string as utf-8.
         * For efficiency, this assumes the input is valid utf-16.
         */
        function __pj_crypt_str2rstr_utf8(input)
        {
            let output = ''
            let i = -1
            let x, y
            while (++i < input.length)
            {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i)
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
                {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF)
                    i++
                }
                /* Encode output as utf-8 */
                if (x <= 0x7F)
                    output += String.fromCharCode(x)
                else if (x <= 0x7FF)
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                        0x80 | (x & 0x3F))
                else if (x <= 0xFFFF)
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F))
                else if (x <= 0x1FFFFF)
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6) & 0x3F),
                        0x80 | (x & 0x3F))
            }
            return output
        }
        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function __pj_crypt_rstr2binl(input)
        {
            let output = Array(input.length >> 2)
            for (let i = 0; i < output.length; i++)
                output[i] = 0
            for (let i = 0; i < input.length * 8; i += 8)
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
            return output
        }
        /*
         * Convert an array of little-endian words to a string
         */
        function __pj_crypt_binl2rstr(input)
        {
            let output = ''
            for (let i = 0; i < input.length * 32; i += 8)
                output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
            return output
        }
        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function __pj_crypt_binl_md5(x, len)
        {
            /* append padding */
            x[len >> 5] |= 0x80 << ((len) % 32)
            x[(((len + 64) >>> 9) << 4) + 14] = len
            let a = 1732584193
            let b = -271733879
            let c = -1732584194
            let d = 271733878
            for (let i = 0; i < x.length; i += 16)
            {
                let olda = a
                let oldb = b
                let oldc = c
                let oldd = d
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 0], 7, -680876936)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 10], 17, -42063)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
                a = __pj_crypt_md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
                d = __pj_crypt_md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
                c = __pj_crypt_md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
                b = __pj_crypt_md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 0], 20, -373897302)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
                a = __pj_crypt_md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
                d = __pj_crypt_md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
                c = __pj_crypt_md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
                b = __pj_crypt_md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 5], 4, -378558)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 0], 11, -358537222)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
                a = __pj_crypt_md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
                d = __pj_crypt_md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
                c = __pj_crypt_md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
                b = __pj_crypt_md5_hh(b, c, d, a, x[i + 2], 23, -995338651)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 0], 6, -198630844)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
                a = __pj_crypt_md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
                d = __pj_crypt_md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
                c = __pj_crypt_md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
                b = __pj_crypt_md5_ii(b, c, d, a, x[i + 9], 21, -343485551)
                a = __pj_crypt_safe_add(a, olda)
                b = __pj_crypt_safe_add(b, oldb)
                c = __pj_crypt_safe_add(c, oldc)
                d = __pj_crypt_safe_add(d, oldd)
            }
            return Array(a, b, c, d)
        }
        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function __pj_crypt_md5_cmn(q, a, b, x, s, t)
        {
            return __pj_crypt_safe_add(__pj_crypt_bit_rol(__pj_crypt_safe_add(__pj_crypt_safe_add(a, q), __pj_crypt_safe_add(x, t)), s), b)
        }
        function __pj_crypt_md5_ff(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
        }
        function __pj_crypt_md5_gg(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
        }
        function __pj_crypt_md5_hh(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn(b ^ c ^ d, a, b, x, s, t)
        }
        function __pj_crypt_md5_ii(a, b, c, d, x, s, t)
        {
            return __pj_crypt_md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
        }
        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function __pj_crypt_safe_add(x, y)
        {
            let lsw = (x & 0xFFFF) + (y & 0xFFFF)
            let msw = (x >> 16) + (y >> 16) + (lsw >> 16)
            return (msw << 16) | (lsw & 0xFFFF)
        }
        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function __pj_crypt_bit_rol(num, cnt)
        {
            return (num << cnt) | (num >>> (32 - cnt))
        }
        return __pj_crypt_hex_md5(input)
    }
    function transition (div_old, div_new, type, callBack) {
        let width = $(div_old).width()
        let height = $(div_old).height()
        let time = 0.5
        if (!div_old || !div_new) {
            console.log('ERROR: Cannot do transition when one of the divs is null')
            return
        }
        div_old.parentNode.style.cssText += 'perspective: 900px; overflow: hidden;'
        div_old.style.cssText += '; position: absolute; z-index: 1019; backface-visibility: hidden'
        div_new.style.cssText += '; position: absolute; z-index: 1020; backface-visibility: hidden'
        switch (type) {
            case 'slide-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d('+ width + 'px, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(-'+ width +'px, 0, 0)'
                }, 1)
                break
            case 'slide-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(-'+ width +'px, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0px, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d('+ width +'px, 0, 0)'
                }, 1)
                break
            case 'slide-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; z-index: 1; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; z-index: 0; transform: translate3d(0, 0, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, '+ height +'px, 0)'
                }, 1)
                break
            case 'slide-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, '+ height +'px, 0)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: translate3d(0, 0, 0)'
                }, 1)
                break
            case 'flip-left':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateY(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateY(-180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateY(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateY(180deg)'
                }, 1)
                break
            case 'flip-right':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateY(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateY(180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateY(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateY(-180deg)'
                }, 1)
                break
            case 'flip-down':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateX(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateX(180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateX(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateX(-180deg)'
                }, 1)
                break
            case 'flip-up':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: rotateX(0deg)'
                div_new.style.cssText += 'overflow: hidden; transform: rotateX(-180deg)'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: rotateX(0deg)'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: rotateX(180deg)'
                }, 1)
                break
            case 'pop-in':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); transform: scale(.8); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; transform: scale(1); opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s;'
                }, 1)
                break
            case 'pop-out':
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); transform: scale(1); opacity: 1;'
                div_new.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s; transform: scale(1.7); opacity: 0;'
                }, 1)
                break
            default:
                // init divs
                div_old.style.cssText += 'overflow: hidden; transform: translate3d(0, 0, 0)'
                div_new.style.cssText += 'overflow: hidden; translate3d(0, 0, 0); opacity: 0;'
                $(div_new).show()
                // -- need a timing function because otherwise not working
                setTimeout(() => {
                    div_new.style.cssText += 'transition: '+ time +'s; opacity: 1;'
                    div_old.style.cssText += 'transition: '+ time +'s'
                }, 1)
                break
        }
        setTimeout(() => {
            if (type === 'slide-down') {
                $(div_old).css('z-index', '1019')
                $(div_new).css('z-index', '1020')
            }
            if (div_new) {
                $(div_new).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : ''
                }))
            }
            if (div_old) {
                $(div_old).css({ 'opacity': '1' }).css(w2utils.cssPrefix({
                    'transition': '',
                    'transform' : ''
                }))
            }
            if (typeof callBack === 'function') callBack()
        }, time * 1000)
    }
    function lock (box, msg, spinner) {
        let options = {}
        if (typeof msg === 'object') {
            options = msg
        } else {
            options.msg = msg
            options.spinner = spinner
        }
        if (!options.msg && options.msg !== 0) options.msg = ''
        w2utils.unlock(box)
        $(box).prepend(
            '<div class="w2ui-lock"></div>'+
            '<div class="w2ui-lock-msg"></div>'
        )
        let $lock = $(box).find('.w2ui-lock')
        let mess = $(box).find('.w2ui-lock-msg')
        if (!options.msg) mess.css({ 'background-color': 'transparent', 'border': '0px' })
        if (options.spinner === true) options.msg = '<div class="w2ui-spinner" '+ (!options.msg ? 'style="width: 35px; height: 35px"' : '') +'></div>' + options.msg
        if (options.opacity != null) $lock.css('opacity', options.opacity)
        if (typeof $lock.fadeIn === 'function') {
            $lock.fadeIn(200)
            mess.html(options.msg).fadeIn(200)
        } else {
            $lock.show()
            mess.html(options.msg).show(0)
        }
    }
    function unlock (box, speed) {
        if (isInt(speed)) {
            $(box).find('.w2ui-lock').fadeOut(speed)
            setTimeout(() => {
                $(box).find('.w2ui-lock').remove()
                $(box).find('.w2ui-lock-msg').remove()
            }, speed)
        } else {
            $(box).find('.w2ui-lock').remove()
            $(box).find('.w2ui-lock-msg').remove()
        }
    }
    /**
    *  Used in w2popup, w2grid, w2form, w2layout
    *  should be called with .call(...) method
    */
    function message(where, options) {
        let obj = this, closeTimer, edata
        // var where.path    = 'w2popup';
        // var where.title   = '.w2ui-popup-title';
        // var where.body    = '.w2ui-box';
        $().w2tag() // hide all tags
        if (!options) options = { width: 200, height: 100 }
        if (options.on == null) $.extend(options, w2utils.event)
        if (options.width == null) options.width = 200
        if (options.height == null) options.height = 100
        let pWidth = parseInt($(where.box).width())
        let pHeight = parseInt($(where.box).height())
        let titleHeight = parseInt($(where.box).find(where.title).css('height') || 0)
        if (options.width > pWidth) options.width = pWidth - 10
        if (options.height > pHeight - titleHeight) options.height = pHeight - 10 - titleHeight
        options.originalWidth = options.width
        options.originalHeight = options.height
        if (parseInt(options.width) < 0) options.width = pWidth + options.width
        if (parseInt(options.width) < 10) options.width = 10
        if (parseInt(options.height) < 0) options.height = pHeight + options.height - titleHeight
        if (parseInt(options.height) < 10) options.height = 10
        if (options.hideOnClick == null) options.hideOnClick = false
        let poptions = $(where.box).data('options') || {}
        if (options.width == null || options.width > poptions.width - 10) {
            options.width = poptions.width - 10
        }
        if (options.height == null || options.height > poptions.height - titleHeight - 5) {
            options.height = poptions.height - titleHeight - 5 // need margin from bottom only
        }
        // negative value means margin
        if (options.originalHeight < 0) options.height = pHeight + options.originalHeight - titleHeight
        if (options.originalWidth < 0) options.width = pWidth + options.originalWidth * 2 // x 2 because there is left and right margin
        let head = $(where.box).find(where.title)
        // if some messages are closing, insta close them
        let $tmp = $(where.box).find('.w2ui-message.w2ui-closing')
        if ($(where.box).find('.w2ui-message.w2ui-closing').length > 0) {
            clearTimeout(closeTimer)
            closeCB($tmp, $tmp.data('options') || {})
        }
        let msgCount = $(where.box).find('.w2ui-message').length
        // remove message
        if ($.trim(options.html) === '' && $.trim(options.body) === '' && $.trim(options.buttons) === '') {
            if (msgCount === 0) return // no messages at all
            let $msg = $(where.box).find('#w2ui-message'+ (msgCount-1))
            options = $msg.data('options') || {}
            // before event
            if (options.trigger) {
                edata = options.trigger({ phase: 'before', type: 'close', target: 'self' })
                if (edata.isCancelled === true) return
            }
            // default behavior
            $msg.css(w2utils.cssPrefix({
                'transition': '0.15s',
                'transform': 'translateY(-' + options.height + 'px)'
            })).addClass('w2ui-closing')
            if (msgCount === 1) {
                if (this.unlock) {
                    if (where.param) this.unlock(where.param, 150); else this.unlock(150)
                }
            } else {
                $(where.box).find('#w2ui-message'+ (msgCount-2)).css('z-index', 1500)
            }
            closeTimer = setTimeout(() => { closeCB($msg, options) }, 150)
        } else {
            if ($.trim(options.body) !== '' || $.trim(options.buttons) !== '') {
                options.html = '<div class="w2ui-message-body">'+ (options.body || '') +'</div>'+
                    '<div class="w2ui-message-buttons">'+ (options.buttons || '') +'</div>'
            }
            // hide previous messages
            $(where.box).find('.w2ui-message').css('z-index', 1390)
            head.data('old-z-index', head.css('z-index'))
            head.css('z-index', 1501)
            // add message
            $(where.box).find(where.body)
                .before('<div id="w2ui-message' + msgCount + '" onmousedown="event.stopPropagation();" '+
                        '   class="w2ui-message" style="display: none; z-index: 1500; ' +
                            (head.length === 0 ? 'top: 0px;' : 'top: ' + w2utils.getSize(head, 'height') + 'px;') +
                            (options.width != null ? 'width: ' + options.width + 'px; left: ' + ((pWidth - options.width) / 2) + 'px;' : 'left: 10px; right: 10px;') +
                            (options.height != null ? 'height: ' + options.height + 'px;' : 'bottom: 6px;') +
                            w2utils.cssPrefix('transition', '.3s', true) + '"' +
                            (options.hideOnClick === true
                                ? where.param
                                    ? 'onclick="'+ where.path +'.message(\''+ where.param +'\');"'
                                    : 'onclick="'+ where.path +'.message();"'
                                : '') + '>' +
                        '</div>')
            $(where.box).find('#w2ui-message'+ msgCount)
                .data('options', options)
                .data('prev_focus', $(':focus'))
            let display = $(where.box).find('#w2ui-message'+ msgCount).css('display')
            $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({
                'transform': (display === 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)')
            }))
            if (display === 'none') {
                $(where.box).find('#w2ui-message'+ msgCount).show().html(options.html)
                options.box = $(where.box).find('#w2ui-message'+ msgCount)
                // before event
                if (options.trigger) {
                    edata = options.trigger({ phase: 'before', type: 'open', target: 'self' })
                    if (edata.isCancelled === true) {
                        head.css('z-index', head.data('old-z-index'))
                        $(where.box).find('#w2ui-message'+ msgCount).remove()
                        return
                    }
                }
                // timer needs to animation
                setTimeout(() => {
                    $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({
                        'transform': (display === 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)')
                    }))
                }, 1)
                // timer for lock
                if (msgCount === 0 && this.lock) {
                    if (where.param) this.lock(where.param); else this.lock()
                }
                setTimeout(() => {
                    // has to be on top of lock
                    $(where.box).find('#w2ui-message'+ msgCount).css(w2utils.cssPrefix({ 'transition': '0s' }))
                    // event after
                    if (options.trigger) {
                        options.trigger($.extend(edata, { phase: 'after' }))
                    }
                }, 350)
            }
        }
        function closeCB($msg, options) {
            if (edata == null) {
                // before event
                if (options.trigger) {
                    edata = options.trigger({ phase: 'before', type: 'open', target: 'self' })
                    if (edata.isCancelled === true) {
                        head.css('z-index', head.data('old-z-index'))
                        $(where.box).find('#w2ui-message'+ msgCount).remove()
                        return
                    }
                }
            }
            let $focus = $msg.data('prev_focus')
            $msg.remove()
            if ($focus && $focus.length > 0) {
                $focus.focus()
            } else {
                if (obj && obj.focus) obj.focus()
            }
            head.css('z-index', head.data('old-z-index'))
            // event after
            if (options.trigger) {
                options.trigger($.extend(edata, { phase: 'after' }))
            }
        }
    }
    function getSize (el, type) {
        let $el = $(el)
        let bwidth = {
            left    : parseInt($el.css('border-left-width')) || 0,
            right   : parseInt($el.css('border-right-width')) || 0,
            top     : parseInt($el.css('border-top-width')) || 0,
            bottom  : parseInt($el.css('border-bottom-width')) || 0
        }
        let mwidth = {
            left    : parseInt($el.css('margin-left')) || 0,
            right   : parseInt($el.css('margin-right')) || 0,
            top     : parseInt($el.css('margin-top')) || 0,
            bottom  : parseInt($el.css('margin-bottom')) || 0
        }
        let pwidth = {
            left    : parseInt($el.css('padding-left')) || 0,
            right   : parseInt($el.css('padding-right')) || 0,
            top     : parseInt($el.css('padding-top')) || 0,
            bottom  : parseInt($el.css('padding-bottom')) || 0
        }
        switch (type) {
            case 'top' : return bwidth.top + mwidth.top + pwidth.top
            case 'bottom' : return bwidth.bottom + mwidth.bottom + pwidth.bottom
            case 'left' : return bwidth.left + mwidth.left + pwidth.left
            case 'right' : return bwidth.right + mwidth.right + pwidth.right
            case 'width' : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right + parseInt($el.width())
            case 'height' : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom + parseInt($el.height())
            case '+width' : return bwidth.left + bwidth.right + mwidth.left + mwidth.right + pwidth.left + pwidth.right
            case '+height' : return bwidth.top + bwidth.bottom + mwidth.top + mwidth.bottom + pwidth.top + pwidth.bottom
        }
        return 0
    }
    function getStrWidth (str, styles) {
        let w, html = '<div id="_tmp_width" style="position: absolute; top: -900px;'+ (styles || '') +'">'+
                        encodeTags(str) +
                      '</div>'
        $('body').append(html)
        w = $('#_tmp_width').width()
        $('#_tmp_width').remove()
        return w
    }
    function lang (phrase) {
        let translation = this.settings.phrases[phrase]
        if (translation == null) return phrase; else return translation
    }
    function locale (locale, callBack) {
        if (!locale) locale = 'en-us'
        // if the locale is an object, not a string, than we assume it's a
        if (typeof locale !== 'string' ) {
            w2utils.settings = $.extend(true, w2utils.settings, locale)
            return
        }
        if (locale.length === 5) locale = 'locale/'+ locale +'.json'
        // clear phrases from language before
        w2utils.settings.phrases = {}
        // load from the file
        $.ajax({
            url      : locale,
            type     : 'GET',
            dataType : 'JSON',
            success(data, status, xhr) {
                w2utils.settings = $.extend(true, w2utils.settings, data)
                if (typeof callBack === 'function') callBack()
            },
            error(xhr, status, msg) {
                console.log('ERROR: Cannot load locale '+ locale)
            }
        })
    }
    function scrollBarSize () {
        if (tmp.scrollBarSize) return tmp.scrollBarSize
        let html =
            '<div id="_scrollbar_width" style="position: absolute; top: -300px; width: 100px; height: 100px; overflow-y: scroll;">'+
            '    <div style="height: 120px">1</div>'+
            '</div>'
        $('body').append(html)
        tmp.scrollBarSize = 100 - $('#_scrollbar_width > div').width()
        $('#_scrollbar_width').remove()
        if (String(navigator.userAgent).indexOf('MSIE') >= 0) tmp.scrollBarSize = tmp.scrollBarSize / 2 // need this for IE9+
        return tmp.scrollBarSize
    }
    function checkName (name) {
        if (name == null) {
            console.log('ERROR: Property "name" is required but not supplied.')
            return false
        }
        if (w2ui[name] != null) {
            console.log(`ERROR: Object named "${name}" is already registered as w2ui.${name}.`)
            return false
        }
        if (!w2utils.isAlphaNumeric(name)) {
            console.log('ERROR: Property "name" has to be alpha-numeric (a-z, 0-9, dash and underscore).')
            return false
        }
        return true
    }
    function checkUniqueId (id, items, desc, obj) { // was w2checkUniqueId
        if (!Array.isArray(items)) items = [items]
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === id) {
                console.log(`ERROR: The item "id=${id}" is not unique within the ${desc} "${obj}".`, items)
                return false
            }
        }
        return true
    }
    function parseRoute(route) {
        let keys = []
        let path = route
            .replace(/\/\(/g, '(?:/')
            .replace(/\+/g, '__plus__')
            .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, (_, slash, format, key, capture, optional) => {
                keys.push({ name: key, optional: !! optional })
                slash = slash || ''
                return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '')
            })
            .replace(/([\/.])/g, '\\$1')
            .replace(/__plus__/g, '(.+)')
            .replace(/\*/g, '(.*)')
        return {
            path  : new RegExp('^' + path + '$', 'i'),
            keys  : keys
        }
    }
    function cssPrefix(field, value, returnString) {
        let css = {}
        let newCSS = {}
        let ret = ''
        if (!$.isPlainObject(field)) {
            css[field] = value
        } else {
            css = field
            if (value === true) returnString = true
        }
        for (let c in css) {
            newCSS[c] = css[c]
            newCSS['-webkit-'+c] = css[c]
            newCSS['-moz-'+c] = css[c].replace('-webkit-', '-moz-')
            newCSS['-ms-'+c] = css[c].replace('-webkit-', '-ms-')
            newCSS['-o-'+c] = css[c].replace('-webkit-', '-o-')
        }
        if (returnString === true) {
            for (let c in newCSS) {
                ret += c + ': ' + newCSS[c] + '; '
            }
        } else {
            ret = newCSS
        }
        return ret
    }
    function getCursorPosition(input) {
        if (input == null) return null
        let caretOffset = 0
        let doc = input.ownerDocument || input.document
        let win = doc.defaultView || doc.parentWindow
        let sel
        if (input.tagName && input.tagName.toUpperCase() === 'INPUT' && input.selectionStart) {
            // standards browser
            caretOffset = input.selectionStart
        } else {
            if (win.getSelection) {
                sel = win.getSelection()
                if (sel.rangeCount > 0) {
                    let range = sel.getRangeAt(0)
                    let preCaretRange = range.cloneRange()
                    preCaretRange.selectNodeContents(input)
                    preCaretRange.setEnd(range.endContainer, range.endOffset)
                    caretOffset = preCaretRange.toString().length
                }
            } else if ( (sel = doc.selection) && sel.type !== 'Control') {
                let textRange = sel.createRange()
                let preCaretTextRange = doc.body.createTextRange()
                preCaretTextRange.moveToElementText(input)
                preCaretTextRange.setEndPoint('EndToEnd', textRange)
                caretOffset = preCaretTextRange.text.length
            }
        }
        return caretOffset
    }
    function setCursorPosition(input, pos, posEnd) {
        let range = document.createRange()
        let el, sel = window.getSelection()
        if (input == null) return
        for (let i = 0; i < input.childNodes.length; i++) {
            let tmp = $(input.childNodes[i]).text()
            if (input.childNodes[i].tagName) {
                tmp = $(input.childNodes[i]).html()
                tmp = tmp.replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&nbsp;/g, ' ')
            }
            if (pos <= tmp.length) {
                el = input.childNodes[i]
                if (el.childNodes && el.childNodes.length > 0) el = el.childNodes[0]
                if (el.childNodes && el.childNodes.length > 0) el = el.childNodes[0]
                break
            } else {
                pos -= tmp.length
            }
        }
        if (el == null) return
        if (pos > el.length) pos = el.length
        range.setStart(el, pos)
        if (posEnd) {
            range.setEnd(el, posEnd)
        } else {
            range.collapse(true)
        }
        sel.removeAllRanges()
        sel.addRange(range)
    }
    function testLocalStorage() {
        // test if localStorage is available, see issue #1282
        let str = 'w2ui_test'
        try {
            localStorage.setItem(str, str)
            localStorage.removeItem(str)
            return true
        } catch (e) {
            return false
        }
    }
    function parseColor(str) {
        if (typeof str !== 'string') return null; else str = str.trim().toUpperCase()
        if (str[0] === '#') str = str.substr(1)
        let color = {}
        if (str.length === 3) {
            color = {
                r: parseInt(str[0] + str[0], 16),
                g: parseInt(str[1] + str[1], 16),
                b: parseInt(str[2] + str[2], 16),
                a: 1
            }
        } else if (str.length === 6) {
            color = {
                r: parseInt(str.substr(0, 2), 16),
                g: parseInt(str.substr(2, 2), 16),
                b: parseInt(str.substr(4, 2), 16),
                a: 1
            }
        } else if (str.length === 8) {
            color = {
                r: parseInt(str.substr(0, 2), 16),
                g: parseInt(str.substr(2, 2), 16),
                b: parseInt(str.substr(4, 2), 16),
                a: Math.round(parseInt(str.substr(6, 2), 16) / 255 * 100) / 100 // alpha channel 0-1
            }
        } else if (str.length > 4 && str.substr(0, 4) === 'RGB(') {
            let tmp = str.replace('RGB', '').replace(/\(/g, '').replace(/\)/g, '').split(',')
            color = {
                r: parseInt(tmp[0], 10),
                g: parseInt(tmp[1], 10),
                b: parseInt(tmp[2], 10),
                a: 1
            }
        } else if (str.length > 5 && str.substr(0, 5) === 'RGBA(') {
            let tmp = str.replace('RGBA', '').replace(/\(/g, '').replace(/\)/g, '').split(',')
            color = {
                r: parseInt(tmp[0], 10),
                g: parseInt(tmp[1], 10),
                b: parseInt(tmp[2], 10),
                a: parseFloat(tmp[3])
            }
        } else {
            // word color
            return null
        }
        return color
    }
    // h=0..360, s=0..100, v=0..100
    function hsv2rgb(h, s, v, a) {
        let r, g, b, i, f, p, q, t
        if (arguments.length === 1) {
            s = h.s; v = h.v; a = h.a; h = h.h
        }
        h = h / 360
        s = s / 100
        v = v / 100
        i = Math.floor(h * 6)
        f = h * 6 - i
        p = v * (1 - s)
        q = v * (1 - f * s)
        t = v * (1 - (1 - f) * s)
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break
            case 1: r = q, g = v, b = p; break
            case 2: r = p, g = v, b = t; break
            case 3: r = p, g = q, b = v; break
            case 4: r = t, g = p, b = v; break
            case 5: r = v, g = p, b = q; break
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
            a: (a != null ? a : 1)
        }
    }
    // r=0..255, g=0..255, b=0..255
    function rgb2hsv(r, g, b, a) {
        if (arguments.length === 1) {
            g = r.g; b = r.b; a = r.a; r = r.r
        }
        let max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255
        switch (max) {
            case min: h = 0; break
            case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break
            case g: h = (b - r) + d * 2; h /= 6 * d; break
            case b: h = (r - g) + d * 4; h /= 6 * d; break
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            v: Math.round(v * 100),
            a: (a != null ? a : 1)
        }
    }
    function tooltip(msg, options) {
        let actions, showOn = 'mouseenter', hideOn = 'mouseleave'
        options = options || {}
        if (options.showOn) {
            showOn = options.showOn
            delete options.showOn
        }
        if (options.hideOn) {
            hideOn = options.hideOn
            delete options.hideOn
        }
        // base64 is needed to avoid '"<> and other special chars conflicts
        actions = 'on'+ showOn +'="$(this).w2tag(w2utils.base64decode(\'' + w2utils.base64encode(msg) + '\'),'
                + 'JSON.parse(w2utils.base64decode(\'' + w2utils.base64encode(JSON.stringify(options)) + '\')))"'
                + 'on'+ hideOn +'="$(this).w2tag()"'
        return actions
    }
    /*
     * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
     * @license    MIT License
     */
    function naturalCompare(a, b) {
        let i, codeA
            , codeB = 1
            , posA = 0
            , posB = 0
            , alphabet = String.alphabet
        function getCode(str, pos, code) {
            if (code) {
                for (i = pos; code = getCode(str, i), code < 76 && code > 65;) ++i
                return +str.slice(pos - 1, i)
            }
            code = alphabet && alphabet.indexOf(str.charAt(pos))
            return code > -1 ? code + 76 : ((code = str.charCodeAt(pos) || 0), code < 45 || code > 127) ? code
                : code < 46 ? 65 // -
                : code < 48 ? code - 1
                : code < 58 ? code + 18 // 0-9
                : code < 65 ? code - 11
                : code < 91 ? code + 11 // A-Z
                : code < 97 ? code - 37
                : code < 123 ? code + 5 // a-z
                : code - 63
        }

        if ((a+='') != (b+='')) for (;codeB;) {
            codeA = getCode(a, posA++)
            codeB = getCode(b, posB++)
            if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
                codeA = getCode(a, posA, posA)
                codeB = getCode(b, posB, posA = i)
                posB = i
            }
            if (codeA != codeB) return (codeA < codeB) ? -1 : 1
        }
        return 0
    }
    function normMenu(menu, el) {
        if (Array.isArray(menu)) {
            menu.forEach((it, m) => {
                if (typeof it === 'string') {
                    menu[m] = { id: it, text: it }
                } else if (it != null) {
                    if (it.caption != null && it.text == null) it.text = it.caption
                    if (it.text != null && it.id == null) it.id = it.text
                    if (it.text == null && it.id != null) it.text = it.id
                } else {
                    menu[m] = { id: null, text: 'null' }
                }
            })
            return menu
        } else if (typeof menu === 'function') {
            return w2utils.normMenu.call(this, menu.call(this, el))
        } else if (typeof menu === 'object') {
            return Object.keys(menu).map(key => { return { id: key, text: menu[key] } })
        }
    }
})(jQuery)
/***********************************************************
*  Formatters object
*  --- Primariy used in grid
*
*********************************************************/
w2utils.formatters = {
    'number'(value, params) {
        if (parseInt(params) > 20) params = 20
        if (parseInt(params) < 0) params = 0
        if (value == null || value === '') return ''
        return w2utils.formatNumber(parseFloat(value), params, true)
    },
    'float'(value, params) {
        return w2utils.formatters.number(value, params)
    },
    'int'(value, params) {
        return w2utils.formatters.number(value, 0)
    },
    'money'(value, params) {
        if (value == null || value === '') return ''
        let data = w2utils.formatNumber(Number(value), w2utils.settings.currencyPrecision)
        return (w2utils.settings.currencyPrefix || '') + data + (w2utils.settings.currencySuffix || '')
    },
    'currency'(value, params) {
        return w2utils.formatters.money(value, params)
    },
    'percent'(value, params) {
        if (value == null || value === '') return ''
        return w2utils.formatNumber(value, params || 1) + '%'
    },
    'size'(value, params) {
        if (value == null || value === '') return ''
        return w2utils.formatSize(parseInt(value))
    },
    'date'(value, params) {
        if (params === '') params = w2utils.settings.dateFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatDate(dt, params) + '</span>'
    },
    'datetime'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatDateTime(dt, params) + '</span>'
    },
    'time'(value, params) {
        if (params === '') params = w2utils.settings.timeFormat
        if (params === 'h12') params = 'hh:mi pm'
        if (params === 'h24') params = 'h24:mi'
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return '<span title="'+ dt +'">' + w2utils.formatTime(value, params) + '</span>'
    },
    'timestamp'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return dt.toString ? dt.toString() : ''
    },
    'gmt'(value, params) {
        if (params === '') params = w2utils.settings.datetimeFormat
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, params, true)
        if (dt === false) dt = w2utils.isDate(value, params, true)
        return dt.toUTCString ? dt.toUTCString() : ''
    },
    'age'(value, params) {
        if (value == null || value === 0 || value === '') return ''
        let dt = w2utils.isDateTime(value, null, true)
        if (dt === false) dt = w2utils.isDate(value, null, true)
        return '<span title="'+ dt +'">' + w2utils.age(value) + (params ? (' ' + params) : '') + '</span>'
    },
    'interval'(value, params) {
        if (value == null || value === 0 || value === '') return ''
        return w2utils.interval(value) + (params ? (' ' + params) : '')
    },
    'toggle'(value, params) {
        return (value ? 'Yes' : '')
    },
    'password'(value, params) {
        let ret = ''
        for (let i=0; i < value.length; i++) {
            ret += '*'
        }
        return ret
    }
}
if (self) {
    self.w2utils = w2utils
    self.w2ui = self.w2ui || {}
    w2ui = self.w2ui
}
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
*   == 2.0
*
************************************************************************/

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
        this.msgDelete = 'Are you sure you want to delete NN records?'
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
        setTimeout(() => {
            if (this.show.statusResponse) {
                this.status(w2utils.lang('Server Response') + ' ' + ((new Date()).getTime() - this.last.xhr_start)/1000 +' ' + w2utils.lang('sec'))
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
            edit.items = w2obj.field.prototype.normMenu(edit.items)
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
                                w2utils.lang(this.msgDelete).replace('NN', recs.length).replace('records', (recs.length == 1 ? 'record' : 'records')) +
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
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == TODO ==
*   - onResize for the panel
*   - add more panel title positions (left=rotated, right=rotated, bottom)
*   - bug: when you assign content before previous transition completed.
*   - refactor with flex-grid
*
* == changes
*   - negative values for left, right panel
*   - onResize for layout as well as onResizing
*   - panel.callBack - one time
*   - layout.html().replaced(function () {})
*   == 2.0
*   - layout.content - deprecated
*
************************************************************************/

let w2panels = ['top', 'left', 'main', 'preview', 'right', 'bottom']
class w2layout extends w2event {
    constructor(options) {
        super(options.name)
        this.box = null // DOM Element that holds the element
        this.name = null // unique name for w2ui
        this.panels = []
        this.tmp = {}
        this.padding = 1 // panel padding
        this.resizer = 4 // resizer width or height
        this.style = ''
        this.onShow = null
        this.onHide = null
        this.onResizing = null
        this.onResizerClick = null
        this.onRender = null
        this.onRefresh = null
        this.onContent = null
        this.onResize = null
        this.onDestroy = null
        this.panel_taemplate = {
            type: null, // left, right, top, bottom
            title: '',
            size: 100, // width or height depending on panel name
            minSize: 20,
            maxSize: false,
            hidden: false,
            resizable: false,
            overflow: 'auto',
            style: '',
            content: '', // can be String or Object with .render(box) method
            tabs: null,
            toolbar: null,
            width: null, // read only
            height: null, // read only
            show: {
                toolbar: false,
                tabs: false
            },
            callBack: null, // function to call when content is overwritten
            onRefresh: null,
            onShow: null,
            onHide: null
        }
        // mix in options
        $.extend(true, this, options)
        if (!Array.isArray(this.panels)) this.panels = []
        // add defined panels
        this.panels.forEach((panel, ind) => {
            this.panels[ind] = $.extend(true, {}, this.panel_taemplate, panel)
            if ($.isPlainObject(panel.tabs) || Array.isArray(panel.tabs)) initTabs(this, panel.type)
            if ($.isPlainObject(panel.toolbar) || Array.isArray(panel.toolbar)) initToolbar(this, panel.type)
        })
        // add all other panels
        w2panels.forEach(tab => {
            if (this.get(tab) != null) return
            this.panels.push($.extend(true, {}, this.panel_taemplate, { type: tab, hidden: (tab !== 'main'), size: 50 }))
        })
        function initTabs(object, panel, tabs) {
            let pan = object.get(panel)
            if (pan != null && tabs == null) tabs = pan.tabs
            if (pan == null || tabs == null) return false
            // instanciate tabs
            if (Array.isArray(tabs)) tabs = { tabs: tabs }
            $().w2destroy(object.name + '_' + panel + '_tabs') // destroy if existed
            pan.tabs = new w2tabs($.extend({}, tabs, { owner: object, name: object.name + '_' + panel + '_tabs' }))
            pan.show.tabs = true
            return true
        }
        function initToolbar(object, panel, toolbar) {
            let pan = object.get(panel)
            if (pan != null && toolbar == null) toolbar = pan.toolbar
            if (pan == null || toolbar == null) return false
            // instanciate toolbar
            if (Array.isArray(toolbar)) toolbar = { items: toolbar }
            $().w2destroy(object.name + '_' + panel + '_toolbar') // destroy if existed
            pan.toolbar = new w2toolbar($.extend({}, toolbar, { owner: object, name: object.name + '_' + panel + '_toolbar' }))
            pan.show.toolbar = true
            return true
        }
    }
    html(panel, data, transition) {
        let obj = this
        let p = this.get(panel)
        let promise = {
            panel     : panel,
            html      : p.html,
            error     : false,
            cancelled : false,
            removed   (callBack) {
                if (typeof callBack == 'function') {
                    p.callBack = callBack
                }
            }
        }
        if (typeof p.callBack == 'function') {
            p.callBack({ panel: panel, content: p.html, new_content: data, transition: transition || 'none' })
            p.callBack = null // this is one time call back only
        }
        // if it is CSS panel
        if (panel == 'css') {
            $('#layout_'+ obj.name +'_panel_css').html('<style>'+ data +'</style>')
            promise.status = true
            return promise
        }
        if (p == null) {
            console.log('ERROR: incorrect panel name. Panel name can be main, left, right, top, bottom, preview or css')
            promise.error = true
            return promise
        }
        if (data == null) {
            return promise
        }
        // event before
        let edata = this.trigger({ phase: 'before', type: 'content', target: panel, object: p, content: data, transition: transition })
        if (edata.isCancelled === true) {
            promise.cancelled = true
            return promise
        }
        if (data instanceof jQuery) {
            console.log('ERROR: You can not pass jQuery object to w2layout.html() method')
            return promise
        }
        let pname = '#layout_'+ this.name + '_panel_'+ p.type
        let current = $(pname + '> .w2ui-panel-content')
        let panelTop = 0
        if (current.length > 0) {
            $(pname).scrollTop(0)
            panelTop = $(current).position().top
        }
        if (p.html === '') {
            p.html = data
            this.refresh(panel)
        } else {
            p.html = data
            if (!p.hidden) {
                if (transition != null && transition !== '') {
                    // apply transition
                    let div1 = $(pname + '> .w2ui-panel-content')
                    div1.after('<div class="w2ui-panel-content new-panel" style="'+ div1[0].style.cssText +'"></div>')
                    let div2 = $(pname + '> .w2ui-panel-content.new-panel')
                    div1.css('top', panelTop)
                    div2.css('top', panelTop)
                    if (typeof data == 'object') {
                        data.box = div2[0] // do not do .render(box);
                        data.render()
                    } else {
                        div2.html(data)
                    }
                    w2utils.transition(div1[0], div2[0], transition, () => {
                        div1.remove()
                        div2.removeClass('new-panel')
                        div2.css('overflow', p.overflow)
                        // make sure only one content left
                        $(pname + '> .w2ui-panel-content').slice(1).remove()
                        // IE Hack
                        obj.resize()
                        if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(() => { obj.resize() }, 100)
                    })
                }
            }
            this.refresh(panel)
        }
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
        // IE Hack
        obj.resize()
        if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(() => { obj.resize() }, 100)
        return promise
    }
    message(panel, options) {
        let obj = this
        if (typeof options == 'string') {
            options = {
                width   : (options.length < 300 ? 350 : 550),
                height  : (options.length < 300 ? 170: 250),
                body    : '<div class="w2ui-centered">' + options + '</div>',
                buttons : '<button class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].message(\''+ panel +'\')">Ok</button>',
                onOpen  (event) {
                    setTimeout(() => { $(this.box).find('.w2ui-btn').focus() }, 25)
                }
            }
        }
        let p = this.get(panel)
        let $el = $('#layout_'+ this.name + '_panel_'+ p.type)
        let oldOverflow = $el.css('overflow')
        let oldOnClose
        if (options) {
            if (options.onClose) oldOnClose = options.onClose
            options.onClose = (event) => {
                if (typeof oldOnClose == 'function') oldOnClose(event)
                event.done(() => {
                    $('#layout_'+ obj.name + '_panel_'+ p.type).css('overflow', oldOverflow)
                })
            }
        }
        $('#layout_'+ this.name + '_panel_'+ p.type).css('overflow', 'hidden')
        w2utils.message.call(this, {
            box   : $('#layout_'+ this.name + '_panel_'+ p.type),
            param : panel,
            path  : 'w2ui.' + this.name,
            title : '.w2ui-panel-title:visible',
            body  : '.w2ui-panel-content'
        }, options)
    }
    load(panel, url, transition, onLoad) {
        let obj = this
        if (panel == 'css') {
            $.get(url, (data, status, xhr) => { // should always be $.get as it is template
                obj.html(panel, xhr.responseText)
                if (onLoad) onLoad()
            })
            return true
        }
        if (this.get(panel) != null) {
            $.get(url, (data, status, xhr) => { // should always be $.get as it is template
                obj.html(panel, xhr.responseText, transition)
                if (onLoad) onLoad()
                // IE Hack
                obj.resize()
                if (window.navigator.userAgent.indexOf('MSIE') != -1) setTimeout(() => { obj.resize() }, 100)
            })
            return true
        }
        return false
    }
    sizeTo(panel, size, instant) {
        let obj = this
        let pan = obj.get(panel)
        if (pan == null) return false
        // resize
        $(obj.box).find(' > div > .w2ui-panel')
            .css(w2utils.cssPrefix('transition', (instant !== true ? '.2s' : '0s')))
        setTimeout(() => {
            obj.set(panel, { size: size })
        }, 1)
        // clean
        setTimeout(() => {
            $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'))
            obj.resize()
        }, 500)
        return true
    }
    show(panel, immediate) {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'show', target: panel, object: this.get(panel), immediate: immediate })
        if (edata.isCancelled === true) return
        let p = obj.get(panel)
        if (p == null) return false
        p.hidden = false
        if (immediate === true) {
            $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '1' })
            obj.trigger($.extend(edata, { phase: 'after' }))
            obj.resize()
        } else {
            // resize
            $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' })
            $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '.2s'))
            setTimeout(() => { obj.resize() }, 1)
            // show
            setTimeout(() => {
                $('#layout_'+ obj.name +'_panel_'+ panel).css({ 'opacity': '1' })
            }, 250)
            // clean
            setTimeout(() => {
                $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'))
                obj.trigger($.extend(edata, { phase: 'after' }))
                obj.resize()
            }, 500)
        }
        return true
    }
    hide(panel, immediate) {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'hide', target: panel, object: this.get(panel), immediate: immediate })
        if (edata.isCancelled === true) return
        let p = obj.get(panel)
        if (p == null) return false
        p.hidden = true
        if (immediate === true) {
            $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' })
            obj.trigger($.extend(edata, { phase: 'after' }))
            obj.resize()
        } else {
            // hide
            $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '.2s'))
            $('#layout_'+ obj.name +'_panel_'+panel).css({ 'opacity': '0' })
            setTimeout(() => { obj.resize() }, 1)
            // clean
            setTimeout(() => {
                $(obj.box).find(' > div > .w2ui-panel').css(w2utils.cssPrefix('transition', '0s'))
                obj.trigger($.extend(edata, { phase: 'after' }))
                obj.resize()
            }, 500)
        }
        return true
    }
    toggle(panel, immediate) {
        let p = this.get(panel)
        if (p == null) return false
        if (p.hidden) return this.show(panel, immediate); else return this.hide(panel, immediate)
    }
    set(panel, options) {
        let ind = this.get(panel, true)
        if (ind == null) return false
        $.extend(this.panels[ind], options)
        // refresh only when content changed
        if (options.html != null || options.resizable != null) {
            this.refresh(panel)
        }
        // show/hide resizer
        this.resize() // resize is needed when panel size is changed
        return true
    }
    get(panel, returnIndex) {
        for (let p = 0; p < this.panels.length; p++) {
            if (this.panels[p].type == panel) {
                if (returnIndex === true) return p; else return this.panels[p]
            }
        }
        return null
    }
    el(panel) {
        let el = $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-content')
        if (el.length != 1) return null
        return el[0]
    }
    hideToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.toolbar = false
        $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-toolbar').hide()
        this.resize()
    }
    showToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.toolbar = true
        $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-toolbar').show()
        this.resize()
    }
    toggleToolbar(panel) {
        let pan = this.get(panel)
        if (!pan) return
        if (pan.show.toolbar) this.hideToolbar(panel); else this.showToolbar(panel)
    }
    assignToolbar(panel, toolbar) {
        if (typeof toolbar == 'string' && w2ui[toolbar] != null) toolbar = w2ui[toolbar]
        let pan = this.get(panel)
        pan.toolbar = toolbar
        let tmp = $(this.box).find(panel +'> .w2ui-panel-toolbar')
        if (pan.toolbar != null) {
            if (tmp.find('[name='+ pan.toolbar.name +']').length === 0) {
                tmp.w2render(pan.toolbar)
            } else if (pan.toolbar != null) {
                pan.toolbar.refresh()
            }
            toolbar.owner = this
            this.showToolbar(panel)
            this.refresh(panel)
        } else {
            tmp.html('')
            this.hideToolbar(panel)
        }
    }
    hideTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.tabs = false
        $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-tabs').hide()
        this.resize()
    }
    showTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        pan.show.tabs = true
        $('#layout_'+ this.name +'_panel_'+ panel +'> .w2ui-panel-tabs').show()
        this.resize()
    }
    toggleTabs(panel) {
        let pan = this.get(panel)
        if (!pan) return
        if (pan.show.tabs) this.hideTabs(panel); else this.showTabs(panel)
    }
    render(box) {
        let obj = this
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        let time = (new Date()).getTime()
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'render', target: obj.name, box: box })
        if (edata.isCancelled === true) return
        if (box != null) {
            if ($(obj.box).find('#layout_'+ obj.name +'_panel_main').length > 0) {
                $(obj.box)
                    .removeAttr('name')
                    .removeClass('w2ui-layout')
                    .html('')
            }
            obj.box = box
        }
        if (!obj.box) return false
        $(obj.box)
            .attr('name', obj.name)
            .addClass('w2ui-layout')
            .html('<div></div>')
        if ($(obj.box).length > 0) $(obj.box)[0].style.cssText += obj.style
        // create all panels
        for (let p1 = 0; p1 < w2panels.length; p1++) {
            let html = '<div id="layout_'+ obj.name + '_panel_'+ w2panels[p1] +'" class="w2ui-panel">'+
                        '    <div class="w2ui-panel-title"></div>'+
                        '    <div class="w2ui-panel-tabs"></div>'+
                        '    <div class="w2ui-panel-toolbar"></div>'+
                        '    <div class="w2ui-panel-content"></div>'+
                        '</div>'+
                        '<div id="layout_'+ obj.name + '_resizer_'+ w2panels[p1] +'" class="w2ui-resizer"></div>'
            $(obj.box).find(' > div').append(html)
            // tabs are rendered in refresh()
        }
        $(obj.box).find(' > div')
            .append('<div id="layout_'+ obj.name + '_panel_css" style="position: absolute; top: 10000px;"></div>')
        obj.refresh() // if refresh is not called here, the layout will not be available right after initialization
        // process event
        obj.trigger($.extend(edata, { phase: 'after' }))
        // reinit events
        setTimeout(() => { // needed this timeout to allow browser to render first if there are tabs or toolbar
            initEvents()
            obj.resize()
        }, 0)
        return (new Date()).getTime() - time
        function initEvents() {
            obj.tmp.events = {
                resize (event) {
                    if (w2ui[obj.name] == null) {
                        $(window).off('resize.w2ui-'+ obj.name)
                    } else {
                        w2ui[obj.name].resize()
                    }
                },
                resizeStart : resizeStart,
                mouseMove   : resizeMove,
                mouseUp     : resizeStop
            }
            $(window).on('resize.w2ui-'+ obj.name, obj.tmp.events.resize)
        }
        function resizeStart(type, evnt) {
            if (!obj.box) return
            if (!evnt) evnt = window.event
            $(document).off('mousemove', obj.tmp.events.mouseMove).on('mousemove', obj.tmp.events.mouseMove)
            $(document).off('mouseup', obj.tmp.events.mouseUp).on('mouseup', obj.tmp.events.mouseUp)
            obj.tmp.resize = {
                type    : type,
                x       : evnt.screenX,
                y       : evnt.screenY,
                diff_x  : 0,
                diff_y  : 0,
                value   : 0
            }
            // lock all panels
            for (let p1 = 0; p1 < w2panels.length; p1++) {
                let $tmp = $(obj.el(w2panels[p1])).parent().find('.w2ui-lock')
                if ($tmp.length > 0) {
                    $tmp.attr('locked', 'previous')
                } else {
                    obj.lock(w2panels[p1], { opacity: 0 })
                }
            }
            if (type == 'left' || type == 'right') {
                obj.tmp.resize.value = parseInt($('#layout_'+ obj.name +'_resizer_'+ type)[0].style.left)
            }
            if (type == 'top' || type == 'preview' || type == 'bottom') {
                obj.tmp.resize.value = parseInt($('#layout_'+ obj.name +'_resizer_'+ type)[0].style.top)
            }
        }
        function resizeStop(evnt) {
            if (!obj.box) return
            if (!evnt) evnt = window.event
            $(document).off('mousemove', obj.tmp.events.mouseMove)
            $(document).off('mouseup', obj.tmp.events.mouseUp)
            if (obj.tmp.resize == null) return
            // unlock all panels
            for (let p1 = 0; p1 < w2panels.length; p1++) {
                let $tmp = $(obj.el(w2panels[p1])).parent().find('.w2ui-lock')
                if ($tmp.attr('locked') == 'previous') {
                    $tmp.removeAttr('locked')
                } else {
                    obj.unlock(w2panels[p1])
                }
            }
            // set new size
            if (obj.tmp.diff_x !== 0 || obj.tmp.resize.diff_y !== 0) { // only recalculate if changed
                let ptop = obj.get('top')
                let pbottom = obj.get('bottom')
                let panel = obj.get(obj.tmp.resize.type)
                let height = parseInt($(obj.box).height())
                let width = parseInt($(obj.box).width())
                let str = String(panel.size)
                let ns, nd
                switch (obj.tmp.resize.type) {
                    case 'top':
                        ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.diff_y
                        nd = 0
                        break
                    case 'bottom':
                        ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_y
                        nd = 0
                        break
                    case 'preview':
                        ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_y
                        nd = (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) +
                            (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0)
                        break
                    case 'left':
                        ns = parseInt(panel.sizeCalculated) + obj.tmp.resize.diff_x
                        nd = 0
                        break
                    case 'right':
                        ns = parseInt(panel.sizeCalculated) - obj.tmp.resize.diff_x
                        nd = 0
                        break
                }
                // set size
                if (str.substr(str.length-1) == '%') {
                    panel.size = Math.floor(ns * 100 / (panel.type == 'left' || panel.type == 'right' ? width : height - nd) * 100) / 100 + '%'
                } else {
                    if (String(panel.size).substr(0, 1) == '-') {
                        panel.size = parseInt(panel.size) - panel.sizeCalculated + ns
                    } else {
                        panel.size = ns
                    }
                }
                obj.resize()
            }
            $('#layout_'+ obj.name + '_resizer_'+ obj.tmp.resize.type).removeClass('active')
            delete obj.tmp.resize
        }
        function resizeMove(evnt) {
            if (!obj.box) return
            if (!evnt) evnt = window.event
            if (obj.tmp.resize == null) return
            let panel = obj.get(obj.tmp.resize.type)
            // event before
            let tmp = obj.tmp.resize
            let edata = obj.trigger({ phase: 'before', type: 'resizing', target: obj.name, object: panel, originalEvent: evnt,
                panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0 })
            if (edata.isCancelled === true) return
            let p = $('#layout_'+ obj.name + '_resizer_'+ tmp.type)
            let resize_x = (evnt.screenX - tmp.x)
            let resize_y = (evnt.screenY - tmp.y)
            let mainPanel = obj.get('main')
            if (!p.hasClass('active')) p.addClass('active')
            switch (tmp.type) {
                case 'left':
                    if (panel.minSize - resize_x > panel.width) {
                        resize_x = panel.minSize - panel.width
                    }
                    if (panel.maxSize && (panel.width + resize_x > panel.maxSize)) {
                        resize_x = panel.maxSize - panel.width
                    }
                    if (mainPanel.minSize + resize_x > mainPanel.width) {
                        resize_x = mainPanel.width - mainPanel.minSize
                    }
                    break
                case 'right':
                    if (panel.minSize + resize_x > panel.width) {
                        resize_x = panel.width - panel.minSize
                    }
                    if (panel.maxSize && (panel.width - resize_x > panel.maxSize)) {
                        resize_x = panel.width - panel.maxSize
                    }
                    if (mainPanel.minSize - resize_x > mainPanel.width) {
                        resize_x = mainPanel.minSize - mainPanel.width
                    }
                    break
                case 'top':
                    if (panel.minSize - resize_y > panel.height) {
                        resize_y = panel.minSize - panel.height
                    }
                    if (panel.maxSize && (panel.height + resize_y > panel.maxSize)) {
                        resize_y = panel.maxSize - panel.height
                    }
                    if (mainPanel.minSize + resize_y > mainPanel.height) {
                        resize_y = mainPanel.height - mainPanel.minSize
                    }
                    break
                case 'preview':
                case 'bottom':
                    if (panel.minSize + resize_y > panel.height) {
                        resize_y = panel.height - panel.minSize
                    }
                    if (panel.maxSize && (panel.height - resize_y > panel.maxSize)) {
                        resize_y = panel.height - panel.maxSize
                    }
                    if (mainPanel.minSize - resize_y > mainPanel.height) {
                        resize_y = mainPanel.minSize - mainPanel.height
                    }
                    break
            }
            tmp.diff_x = resize_x
            tmp.diff_y = resize_y
            switch (tmp.type) {
                case 'top':
                case 'preview':
                case 'bottom':
                    tmp.diff_x = 0
                    if (p.length > 0) p[0].style.top = (tmp.value + tmp.diff_y) + 'px'
                    break
                case 'left':
                case 'right':
                    tmp.diff_y = 0
                    if (p.length > 0) p[0].style.left = (tmp.value + tmp.diff_x) + 'px'
                    break
            }
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }))
        }
    }
    refresh(panel) {
        let obj = this
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        if (panel == null) panel = null
        let time = (new Date()).getTime()
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'refresh', target: (panel != null ? panel : obj.name), object: obj.get(panel) })
        if (edata.isCancelled === true) return
        // obj.unlock(panel);
        if (typeof panel == 'string') {
            let p = obj.get(panel)
            if (p == null) return
            let pname = '#layout_'+ obj.name + '_panel_'+ p.type
            let rname = '#layout_'+ obj.name +'_resizer_'+ p.type
            // apply properties to the panel
            $(pname).css({ display: p.hidden ? 'none' : 'block' })
            if (p.resizable) $(rname).show(); else $(rname).hide()
            // insert content
            if (typeof p.html == 'object' && typeof p.html.render === 'function') {
                p.html.box = $(pname +'> .w2ui-panel-content')[0]
                setTimeout(() => {
                    // need to remove unnecessary classes
                    if ($(pname +'> .w2ui-panel-content').length > 0) {
                        $(pname +'> .w2ui-panel-content')
                            .removeClass()
                            .removeAttr('name')
                            .addClass('w2ui-panel-content')
                            .css('overflow', p.overflow)[0].style.cssText += ';' + p.style
                    }
                    if (p.html && typeof p.html.render == 'function') {
                        p.html.render() // do not do .render(box);
                    }
                }, 1)
            } else {
                // need to remove unnecessary classes
                if ($(pname +'> .w2ui-panel-content').length > 0) {
                    $(pname +'> .w2ui-panel-content')
                        .removeClass()
                        .removeAttr('name')
                        .addClass('w2ui-panel-content')
                        .html(p.html)
                        .css('overflow', p.overflow)[0].style.cssText += ';' + p.style
                }
            }
            // if there are tabs and/or toolbar - render it
            let tmp = $(obj.box).find(pname +'> .w2ui-panel-tabs')
            if (p.show.tabs) {
                if (tmp.find('[name='+ p.tabs.name +']').length === 0 && p.tabs != null) tmp.w2render(p.tabs); else p.tabs.refresh()
            } else {
                tmp.html('').removeClass('w2ui-tabs').hide()
            }
            tmp = $(obj.box).find(pname +'> .w2ui-panel-toolbar')
            if (p.show.toolbar) {
                if (tmp.find('[name='+ p.toolbar.name +']').length === 0 && p.toolbar != null) tmp.w2render(p.toolbar); else p.toolbar.refresh()
            } else {
                tmp.html('').removeClass('w2ui-toolbar').hide()
            }
            // show title
            tmp = $(obj.box).find(pname +'> .w2ui-panel-title')
            if (p.title) {
                tmp.html(p.title).show()
            } else {
                tmp.html('').hide()
            }
        } else {
            if ($('#layout_'+ obj.name +'_panel_main').length === 0) {
                obj.render()
                return
            }
            obj.resize()
            // refresh all of them
            for (let p1 = 0; p1 < this.panels.length; p1++) { obj.refresh(this.panels[p1].type) }
        }
        obj.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    resize() {
        // if (window.getSelection) window.getSelection().removeAllRanges();    // clear selection
        if (!this.box) return false
        let time = (new Date()).getTime()
        // event before
        let tmp = this.tmp.resize
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name,
            panel: tmp ? tmp.type : 'all', diff_x: tmp ? tmp.diff_x : 0, diff_y: tmp ? tmp.diff_y : 0 })
        if (edata.isCancelled === true) return
        if (this.padding < 0) this.padding = 0
        // layout itself
        let width = parseInt($(this.box).width())
        let height = parseInt($(this.box).height())
        $(this.box).find(' > div').css({
            width    : width + 'px',
            height    : height + 'px'
        })
        let obj = this
        // panels
        let pmain = this.get('main')
        let pprev = this.get('preview')
        let pleft = this.get('left')
        let pright = this.get('right')
        let ptop = this.get('top')
        let pbottom = this.get('bottom')
        let sprev = (pprev != null && pprev.hidden !== true ? true : false)
        let sleft = (pleft != null && pleft.hidden !== true ? true : false)
        let sright = (pright != null && pright.hidden !== true ? true : false)
        let stop = (ptop != null && ptop.hidden !== true ? true : false)
        let sbottom = (pbottom != null && pbottom.hidden !== true ? true : false)
        let l, t, w, h, e
        // calculate %
        for (let p = 0; p < w2panels.length; p++) {
            if (w2panels[p] === 'main') continue
            tmp = this.get(w2panels[p])
            if (!tmp) continue
            let str = String(tmp.size || 0)
            if (str.substr(str.length-1) == '%') {
                let tmph = height
                if (tmp.type == 'preview') {
                    tmph = tmph -
                        (ptop && !ptop.hidden ? ptop.sizeCalculated : 0) -
                        (pbottom && !pbottom.hidden ? pbottom.sizeCalculated : 0)
                }
                tmp.sizeCalculated = parseInt((tmp.type == 'left' || tmp.type == 'right' ? width : tmph) * parseFloat(tmp.size) / 100)
            } else {
                tmp.sizeCalculated = parseInt(tmp.size)
            }
            tmp.sizeCalculated = Math.max(tmp.sizeCalculated, parseInt(tmp.minSize))
        }
        // negative size
        if (String(pright.size).substr(0, 1) == '-') {
            if (sleft && String(pleft.size).substr(0, 1) == '-') {
                console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.')
            } else {
                pright.sizeCalculated = width - (sleft ? pleft.sizeCalculated : 0) + parseInt(pright.size)
            }
        }
        if (String(pleft.size).substr(0, 1) == '-') {
            if (sright && String(pright.size).substr(0, 1) == '-') {
                console.log('ERROR: you cannot have both left panel.size and right panel.size be negative.')
            } else {
                pleft.sizeCalculated = width - (sright ? pright.sizeCalculated : 0) + parseInt(pleft.size)
            }
        }
        // top if any
        if (ptop != null && ptop.hidden !== true) {
            l = 0
            t = 0
            w = width
            h = ptop.sizeCalculated
            $('#layout_'+ this.name +'_panel_top').css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            }).show()
            ptop.width = w
            ptop.height = h
            // resizer
            if (ptop.resizable) {
                t = ptop.sizeCalculated - (this.padding === 0 ? this.resizer : 0)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                $('#layout_'+ this.name +'_resizer_top').show().css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px',
                    'cursor': 'ns-resize'
                }).off('mousedown').on('mousedown', function(event) {
                    // event before
                    let edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'top', originalEvent: event })
                    if (edata.isCancelled === true) return
                    // default action
                    w2ui[obj.name].tmp.events.resizeStart('top', event)
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    return false
                })
            }
        } else {
            $('#layout_'+ this.name +'_panel_top').hide()
            $('#layout_'+ this.name +'_resizer_top').hide()
        }
        // left if any
        if (pleft != null && pleft.hidden !== true) {
            l = 0
            t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
            w = pleft.sizeCalculated
            h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                    (sbottom ? pbottom.sizeCalculated + this.padding : 0)
            e = $('#layout_'+ this.name +'_panel_left')
            if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17 // IE hack
            e.css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            }).show()
            pleft.width = w
            pleft.height = h
            // resizer
            if (pleft.resizable) {
                l = pleft.sizeCalculated - (this.padding === 0 ? this.resizer : 0)
                w = (this.resizer > this.padding ? this.resizer : this.padding)
                $('#layout_'+ this.name +'_resizer_left').show().css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px',
                    'cursor': 'ew-resize'
                }).off('mousedown').on('mousedown', function(event) {
                    // event before
                    let edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'left', originalEvent: event })
                    if (edata.isCancelled === true) return
                    // default action
                    w2ui[obj.name].tmp.events.resizeStart('left', event)
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    return false
                })
            }
        } else {
            $('#layout_'+ this.name +'_panel_left').hide()
            $('#layout_'+ this.name +'_resizer_left').hide()
        }
        // right if any
        if (pright != null && pright.hidden !== true) {
            l = width - pright.sizeCalculated
            t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
            w = pright.sizeCalculated
            h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
                (sbottom ? pbottom.sizeCalculated + this.padding : 0)
            $('#layout_'+ this.name +'_panel_right').css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            }).show()
            pright.width = w
            pright.height = h
            // resizer
            if (pright.resizable) {
                l = l - this.padding
                w = (this.resizer > this.padding ? this.resizer : this.padding)
                $('#layout_'+ this.name +'_resizer_right').show().css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px',
                    'cursor': 'ew-resize'
                }).off('mousedown').on('mousedown', function(event) {
                    // event before
                    let edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'right', originalEvent: event })
                    if (edata.isCancelled === true) return
                    // default action
                    w2ui[obj.name].tmp.events.resizeStart('right', event)
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    return false
                })
            }
        } else {
            $('#layout_'+ this.name +'_panel_right').hide()
            $('#layout_'+ this.name +'_resizer_right').hide()
        }
        // bottom if any
        if (pbottom != null && pbottom.hidden !== true) {
            l = 0
            t = height - pbottom.sizeCalculated
            w = width
            h = pbottom.sizeCalculated
            $('#layout_'+ this.name +'_panel_bottom').css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            }).show()
            pbottom.width = w
            pbottom.height = h
            // resizer
            if (pbottom.resizable) {
                t = t - (this.padding === 0 ? 0 : this.padding)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                $('#layout_'+ this.name +'_resizer_bottom').show().css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px',
                    'cursor': 'ns-resize'
                }).off('mousedown').on('mousedown', function(event) {
                    // event before
                    let edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'bottom', originalEvent: event })
                    if (edata.isCancelled === true) return
                    // default action
                    w2ui[obj.name].tmp.events.resizeStart('bottom', event)
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    return false
                })
            }
        } else {
            $('#layout_'+ this.name +'_panel_bottom').hide()
            $('#layout_'+ this.name +'_resizer_bottom').hide()
        }
        // main - always there
        l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0)
        t = 0 + (stop ? ptop.sizeCalculated + this.padding : 0)
        w = width - (sleft ? pleft.sizeCalculated + this.padding : 0) -
            (sright ? pright.sizeCalculated + this.padding: 0)
        h = height - (stop ? ptop.sizeCalculated + this.padding : 0) -
            (sbottom ? pbottom.sizeCalculated + this.padding : 0) -
            (sprev ? pprev.sizeCalculated + this.padding : 0)
        e = $('#layout_'+ this.name +'_panel_main')
        if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17 // IE hack
        e.css({
            'display': 'block',
            'left': l + 'px',
            'top': t + 'px',
            'width': w + 'px',
            'height': h + 'px'
        })
        pmain.width = w
        pmain.height = h
        // preview if any
        if (pprev != null && pprev.hidden !== true) {
            l = 0 + (sleft ? pleft.sizeCalculated + this.padding : 0)
            t = height - (sbottom ? pbottom.sizeCalculated + this.padding : 0) - pprev.sizeCalculated
            w = width - (sleft ? pleft.sizeCalculated + this.padding : 0) -
                (sright ? pright.sizeCalculated + this.padding : 0)
            h = pprev.sizeCalculated
            e = $('#layout_'+ this.name +'_panel_preview')
            if (window.navigator.userAgent.indexOf('MSIE') != -1 && e.length > 0 && e[0].clientHeight < e[0].scrollHeight) w += 17 // IE hack
            e.css({
                'display': 'block',
                'left': l + 'px',
                'top': t + 'px',
                'width': w + 'px',
                'height': h + 'px'
            }).show()
            pprev.width = w
            pprev.height = h
            // resizer
            if (pprev.resizable) {
                t = t - (this.padding === 0 ? 0 : this.padding)
                h = (this.resizer > this.padding ? this.resizer : this.padding)
                $('#layout_'+ this.name +'_resizer_preview').show().css({
                    'display': 'block',
                    'left': l + 'px',
                    'top': t + 'px',
                    'width': w + 'px',
                    'height': h + 'px',
                    'cursor': 'ns-resize'
                }).off('mousedown').on('mousedown', function(event) {
                    // event before
                    let edata = obj.trigger({ phase: 'before', type: 'resizerClick', target: 'preview', originalEvent: event })
                    if (edata.isCancelled === true) return
                    // default action
                    w2ui[obj.name].tmp.events.resizeStart('preview', event)
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    return false
                })
            }
        } else {
            $('#layout_'+ this.name +'_panel_preview').hide()
            $('#layout_'+ this.name +'_resizer_preview').hide()
        }
        // display tabs and toolbar if needed
        for (let p1 = 0; p1 < w2panels.length; p1++) {
            let pan = this.get(w2panels[p1])
            let tmp2 = '#layout_'+ this.name +'_panel_'+ w2panels[p1] +' > .w2ui-panel-'
            let tabHeight = 0
            if (pan) {
                if (pan.title) {
                    tabHeight += w2utils.getSize($(tmp2 + 'title').css({ top: tabHeight + 'px', display: 'block' }), 'height')
                }
                if (pan.show.tabs) {
                    if (pan.tabs != null && w2ui[this.name +'_'+ w2panels[p1] +'_tabs']) w2ui[this.name +'_'+ w2panels[p1] +'_tabs'].resize()
                    tabHeight += w2utils.getSize($(tmp2 + 'tabs').css({ top: tabHeight + 'px', display: 'block' }), 'height')
                }
                if (pan.show.toolbar) {
                    if (pan.toolbar != null && w2ui[this.name +'_'+ w2panels[p1] +'_toolbar']) w2ui[this.name +'_'+ w2panels[p1] +'_toolbar'].resize()
                    tabHeight += w2utils.getSize($(tmp2 + 'toolbar').css({ top: tabHeight + 'px', display: 'block' }), 'height')
                }
            }
            $(tmp2 + 'content').css({ display: 'block' }).css({ top: tabHeight + 'px' })
        }
        // send resize to all objects
        clearTimeout(this._resize_timer)
        this._resize_timer = setTimeout(() => {
            for (let e in w2ui) {
                if (typeof w2ui[e].resize == 'function') {
                    // sent to all none-layouts
                    if (w2ui[e].panels == null) w2ui[e].resize()
                    // only send to nested layouts
                    let parent = $(w2ui[e].box).parents('.w2ui-layout')
                    if (parent.length > 0 && parent.attr('name') == obj.name) w2ui[e].resize()
                }
            }
        }, 100)
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        if (w2ui[this.name] == null) return false
        // clean up
        if ($(this.box).find('#layout_'+ this.name +'_panel_main').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-layout')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        if (this.tmp.events && this.tmp.events.resize) $(window).off('resize', this.tmp.events.resize)
        return true
    }
    lock(panel, msg, showSpinner) {
        if (w2panels.indexOf(panel) == -1) {
            console.log('ERROR: First parameter needs to be the a valid panel name.')
            return
        }
        let args = Array.from(arguments)
        args[0] = '#layout_'+ this.name + '_panel_' + panel
        w2utils.lock.apply(window, args)
    }
    unlock(panel, speed) {
        if (w2panels.indexOf(panel) == -1) {
            console.log('ERROR: First parameter needs to be the a valid panel name.')
            return
        }
        let nm = '#layout_'+ this.name + '_panel_' + panel
        w2utils.unlock(nm, speed)
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - hide overlay on esc
*   - make popup width/height in %
*
* == changes 2.0
*   - load(url)
*   - template(data, id)
*   - open, load, message - return promise
*   - options.actions = { text, class, onClick }
*   - bindEvents
*
************************************************************************/

class w2dialog extends w2event {
    constructor(options) {
        super()
        this.defaults = {
            title: '',
            body: '',
            buttons: '',
            actions: null,
            style: '',
            color: '#000',
            opacity: 0.4,
            speed: 0.3,
            modal: false,
            maximized: false,
            keyboard: true, // will close popup on esc if not modal
            width: 500,
            height: 300,
            showClose: true,
            showMax: false,
            transition: null,
            multiple: false // if popup already open, opens as a message
        }
        this.status = 'closed' // string that describes current status
        this.onOpen = null
        this.onClose = null
        this.onMax = null
        this.onMin = null
        this.onToggle = null
        this.onKeydown = null
        this.onAction = null
        this.onMove = null
        this.onMsgOpen = null
        this.onMsgClose = null
    }
    open(options) {
        return new Promise((resolve, reject) => {
            let obj = this
            let orig_options = $.extend(true, {}, options)
            if (w2popup.status == 'closing') {
                setTimeout(() => { obj.open.call(obj, options) }, 100)
                return
            }
            // get old options and merge them
            let old_options = $('#w2ui-popup').data('options')
            options = $.extend({}, this.defaults, old_options, { title: '', body : '', buttons: '' }, options, { maximized: false })
            // need timer because popup might not be open
            setTimeout(() => { $('#w2ui-popup').data('options', options) }, 100)
            // if new - reset event handlers
            if ($('#w2ui-popup').length === 0) {
                // w2popup.handlers  = []; // if commented, allows to add w2popup.on() for all
                w2popup.onOpen = null
                w2popup.onClose = null
                w2popup.onMax = null
                w2popup.onMin = null
                w2popup.onToggle = null
                w2popup.onKeydown = null
                w2popup.onAction = null
                w2popup.onMove = null
                w2popup.onMsgOpen = null
                w2popup.onMsgClose = null
            }
            if (options.onOpen) w2popup.onOpen = options.onOpen
            if (options.onClose) w2popup.onClose = options.onClose
            if (options.onMax) w2popup.onMax = options.onMax
            if (options.onMin) w2popup.onMin = options.onMin
            if (options.onToggle) w2popup.onToggle = options.onToggle
            if (options.onKeydown) w2popup.onKeydown = options.onKeydown
            if (options.onAction) w2popup.onAction = options.onAction
            if (options.onMove) w2popup.onMove = options.onMove
            if (options.onMsgOpen) w2popup.onMsgOpen = options.onMsgOpen
            if (options.onMsgClose) w2popup.onMsgClose = options.onMsgClose
            options.width = parseInt(options.width)
            options.height = parseInt(options.height)
            let maxW, maxH, edata, msg, tmp
            if (window.innerHeight == undefined) {
                maxW = parseInt(document.documentElement.offsetWidth)
                maxH = parseInt(document.documentElement.offsetHeight)
                if (w2utils.engine === 'IE7') { maxW += 21; maxH += 4 }
            } else {
                maxW = parseInt(window.innerWidth)
                maxH = parseInt(window.innerHeight)
            }
            if (maxW - 10 < options.width) options.width = maxW - 10
            if (maxH - 10 < options.height) options.height = maxH - 10
            let top = (maxH - options.height) / 2 * 0.6
            let left = (maxW - options.width) / 2
            // convert action arrays into buttons
            if (options.actions != null) {
                options.buttons = ''
                Object.keys(options.actions).forEach((action) => {
                    let handler = options.actions[action]
                    if (typeof handler == 'function') {
                        options.buttons += `<button class="w2ui-btn w2ui-action" data-click='["action","${action}"]'>${action}</button>`
                    }
                    if (typeof handler == 'object') {
                        options.buttons += `<button class="w2ui-btn w2ui-action ${handler.class || ''}" data-click='["action","${action}"]'
                            style="${handler.style}">${handler.text || action}</button>`
                    }
                    if (typeof handler == 'string') {
                        options.buttons += handler
                    }
                })
            }
            // check if message is already displayed
            if ($('#w2ui-popup').length === 0) {
                // trigger event
                edata = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: false })
                if (edata.isCancelled === true) return
                w2popup.status = 'opening'
                // output message
                w2popup.lockScreen(options)
                let btn = ''
                if (options.showClose) {
                    btn += '<div class="w2ui-popup-button w2ui-popup-close w2ui-action" data-mousedown="stop" data-click="close">Close</div>'
                }
                if (options.showMax) {
                    btn += '<div class="w2ui-popup-button w2ui-popup-max w2ui-action" data-mousedown="stop" data-click="toggle">Max</div>'
                }
                // first insert just body
                msg = '<div id="w2ui-popup" class="w2ui-popup w2ui-popup-opening" style="left: '+ left +'px; top: '+ top +'px;'+
                          '     width: ' + parseInt(options.width) + 'px; height: ' + parseInt(options.height) + 'px;"></div>'
                $('body').append(msg)
                // parse rel=*
                let parts = $('#w2ui-popup')
                if (parts.find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                    // title
                    tmp = parts.find('div[rel=title]')
                    if (tmp.length > 0) { options.title = tmp.html(); tmp.remove() }
                    // buttons
                    tmp = parts.find('div[rel=buttons]')
                    if (tmp.length > 0) { options.buttons = tmp.html(); tmp.remove() }
                    // body
                    tmp = parts.find('div[rel=body]')
                    if (tmp.length > 0) options.body = tmp.html(); else options.body = parts.html()
                }
                // then content
                msg = '<div class="w2ui-popup-title" style="'+ (!options.title ? 'display: none' : '') +'">' + btn + '</div>'+
                          '<div class="w2ui-box" style="'+ (!options.title ? 'top: 0px !important;' : '') +
                                    (!options.buttons ? 'bottom: 0px !important;' : '') + '">'+
                          '    <div class="w2ui-popup-body' + (!options.title ? ' w2ui-popup-no-title' : '') +
                                    (!options.buttons ? ' w2ui-popup-no-buttons' : '') + '" style="' + options.style + '">' +
                          '    </div>'+
                          '</div>'+
                          '<div class="w2ui-popup-buttons" style="'+ (!options.buttons ? 'display: none' : '') +'"></div>'+
                          '<input class="w2ui-popup-hidden" style="position: absolute; top: -100px"/>' // this is needed to keep focus in popup
                $('#w2ui-popup').html(msg)
                if (options.title) $('#w2ui-popup .w2ui-popup-title').append(options.title)
                if (options.buttons) $('#w2ui-popup .w2ui-popup-buttons').append(options.buttons)
                if (options.body) $('#w2ui-popup .w2ui-popup-body').append(options.body)
                // allow element to render
                setTimeout(() => {
                    $('#w2ui-popup')
                        .css(w2utils.cssPrefix({
                            'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform'
                        }))
                        .removeClass('w2ui-popup-opening')
                    obj.focus()
                }, 1)
                // clean transform
                setTimeout(() => {
                    $('#w2ui-popup').css(w2utils.cssPrefix('transform', ''))
                    w2popup.status = 'open'
                }, options.speed * 1000)
                // onOpen event should trigger while popup still coing
                setTimeout(() => {
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    obj.bindEvents()
                    $('#w2ui-popup').find('.w2ui-popup-body').show()
                    resolve(edata)
                }, 50)
            } else if (options.multiple === true) {
                // popup is not compatible with w2popup.message
                w2popup.message(orig_options)
            } else {
                // if was from template and now not
                if (w2popup._prev == null && w2popup._template != null) obj.restoreTemplate()
                // trigger event
                edata = this.trigger({ phase: 'before', type: 'open', target: 'popup', options: options, present: true })
                if (edata.isCancelled === true) return
                // check if size changed
                w2popup.status = 'opening'
                if (old_options != null) {
                    if (!old_options.maximized && (old_options.width != options.width || old_options.height != options.height)) {
                        w2popup.resize(options.width, options.height)
                    }
                    options.prevSize = options.width + 'px:' + options.height + 'px'
                    options.maximized = old_options.maximized
                }
                // show new items
                let cloned = $('#w2ui-popup .w2ui-box').clone()
                cloned.removeClass('w2ui-box').addClass('w2ui-box-temp').find('.w2ui-popup-body').empty().append(options.body)
                // parse rel=*
                if (typeof options.body == 'string' && cloned.find('div[rel=title], div[rel=body], div[rel=buttons]').length > 0) {
                    // title
                    tmp = cloned.find('div[rel=title]')
                    if (tmp.length > 0) { options.title = tmp.html(); tmp.remove() }
                    // buttons
                    tmp = cloned.find('div[rel=buttons]')
                    if (tmp.length > 0) { options.buttons = tmp.html(); tmp.remove() }
                    // body
                    tmp = cloned.find('div[rel=body]')
                    if (tmp.length > 0) options.body = tmp.html(); else options.body = cloned.html()
                    // set proper body
                    cloned.html(options.body)
                }
                $('#w2ui-popup .w2ui-box').after(cloned)
                if (options.buttons) {
                    $('#w2ui-popup .w2ui-popup-buttons').show().html('').append(options.buttons)
                    $('#w2ui-popup .w2ui-popup-body').removeClass('w2ui-popup-no-buttons')
                    $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('bottom', '')
                } else {
                    $('#w2ui-popup .w2ui-popup-buttons').hide().html('')
                    $('#w2ui-popup .w2ui-popup-body').addClass('w2ui-popup-no-buttons')
                    $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('bottom', '0px')
                }
                if (options.title) {
                    $('#w2ui-popup .w2ui-popup-title')
                        .show()
                        .html((options.showClose
                                ? '<div class="w2ui-popup-button w2ui-popup-close w2ui-action" data-mousedown="stop" data-click="close">Close</div>'
                                : '') +
                              (options.showMax
                                ? '<div class="w2ui-popup-button w2ui-popup-max w2ui-action" data-mousedown="stop" data-click="toggle">Max</div>'
                                : ''))
                        .append(options.title)
                    $('#w2ui-popup .w2ui-popup-body').removeClass('w2ui-popup-no-title')
                    $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('top', '')
                } else {
                    $('#w2ui-popup .w2ui-popup-title').hide().html('')
                    $('#w2ui-popup .w2ui-popup-body').addClass('w2ui-popup-no-title')
                    $('#w2ui-popup .w2ui-box, #w2ui-popup .w2ui-box-temp').css('top', '0px')
                }
                // transition
                let div_old = $('#w2ui-popup .w2ui-box')[0]
                let div_new = $('#w2ui-popup .w2ui-box-temp')[0]
                w2utils.transition(div_old, div_new, options.transition, () => {
                    // clean up
                    obj.restoreTemplate()
                    $(div_old).remove()
                    $(div_new).removeClass('w2ui-box-temp').addClass('w2ui-box')
                    let $body = $(div_new).find('.w2ui-popup-body')
                    if ($body.length == 1) {
                        $body[0].style.cssText = options.style
                        $body.show()
                    }
                    // remove max state
                    $('#w2ui-popup').data('prev-size', null)
                    // focus on first button
                    obj.focus()
                })
                // call event onOpen
                w2popup.status = 'open'
                obj.trigger($.extend(edata, { phase: 'after' }))
                obj.bindEvents()
                $('#w2ui-popup').find('.w2ui-popup-body').show()
                resolve(edata)
            }
            // save new options
            options._last_focus = $(':focus')
            // keyboard events
            if (options.keyboard) $(document).on('keydown', this.keydown)
            // initialize move
            tmp = {
                resizing : false,
                mvMove   : mvMove,
                mvStop   : mvStop
            }
            $('#w2ui-popup .w2ui-popup-title').on('mousedown', function(event) {
                if (!w2popup.get().maximized) mvStart(event)
            })
            // handlers
            function mvStart(evnt) {
                if (!evnt) evnt = window.event
                w2popup.status = 'moving'
                tmp.resizing = true
                tmp.isLocked = $('#w2ui-popup > .w2ui-lock').length == 1 ? true : false
                tmp.x = evnt.screenX
                tmp.y = evnt.screenY
                tmp.pos_x = $('#w2ui-popup').position().left
                tmp.pos_y = $('#w2ui-popup').position().top
                if (!tmp.isLocked) w2popup.lock({ opacity: 0 })
                $(document).on('mousemove', tmp.mvMove)
                $(document).on('mouseup', tmp.mvStop)
                if (evnt.stopPropagation) evnt.stopPropagation(); else evnt.cancelBubble = true
                if (evnt.preventDefault) evnt.preventDefault(); else return false
            }
            function mvMove(evnt) {
                if (tmp.resizing != true) return
                if (!evnt) evnt = window.event
                tmp.div_x = evnt.screenX - tmp.x
                tmp.div_y = evnt.screenY - tmp.y
                // trigger event
                let edata = w2popup.trigger({ phase: 'before', type: 'move', target: 'popup', div_x: tmp.div_x, div_y: tmp.div_y })
                if (edata.isCancelled === true) return
                // default behavior
                $('#w2ui-popup').css(w2utils.cssPrefix({
                    'transition': 'none',
                    'transform' : 'translate3d('+ tmp.div_x +'px, '+ tmp.div_y +'px, 0px)'
                }))
                // event after
                w2popup.trigger($.extend(edata, { phase: 'after'}))
            }
            function mvStop(evnt) {
                if (tmp.resizing != true) return
                if (!evnt) evnt = window.event
                w2popup.status = 'open'
                tmp.div_x = (evnt.screenX - tmp.x)
                tmp.div_y = (evnt.screenY - tmp.y)
                $('#w2ui-popup').css({
                    'left': (tmp.pos_x + tmp.div_x) + 'px',
                    'top' : (tmp.pos_y + tmp.div_y) + 'px'
                }).css(w2utils.cssPrefix({
                    'transition': 'none',
                    'transform' : 'translate3d(0px, 0px, 0px)'
                }))
                tmp.resizing = false
                $(document).off('mousemove', tmp.mvMove)
                $(document).off('mouseup', tmp.mvStop)
                if (!tmp.isLocked) w2popup.unlock()
            }
        })
    }
    load(options) {
        return new Promise((resolve, reject) => {
            if (typeof options == 'string') {
                options = { url: options }
            }
            if (options.url == null) {
                console.log('ERROR: The url is not defined.')
                reject('The url is not defined')
                return
            }
            w2popup.status = 'loading'
            let tmp = String(options.url).split('#')
            let url = tmp[0]
            let selector = tmp[1]
            if (options == null) options = {}
            // load url
            let html = $('#w2ui-popup').data(url)
            if (html != null) {
                popup(html, selector)
            } else {
                $.get(url, (data, status, obj) => { // should always be $.get as it is template
                    this.template(obj.responseText, selector, options).then(() => { resolve() })
                })
            }
        })
    }
    template(data, id, options = {}) {
        let $html = $(data)
        if (id) $html = $html.filter('#' + id)
        $.extend(options, {
            style: $html[0].style.cssText,
            width: $html.width(),
            height: $html.height(),
            title: $html.find('[rel=title]').html(),
            body: $html.find('[rel=body]').html(),
            buttons: $html.find('[rel=buttons]').html(),
        })
        return w2popup.open(options)
    }
    bindEvents() {
        $('#w2ui-popup .w2ui-action').each((ind, el) => {
            let actions = $(el).data()
            if (actions.mousedown == 'stop') {
                $(el)
                    .off('mousedown')
                    .on('mousedown', (event) => { event.stopPropagation() })
            }
            if (actions.click) {
                $(el)
                    .off('click')
                    .on('click', (event) => {
                        let params = $(event.target).data('click')
                        if (typeof params == 'string') params = [params]
                        let method = params[0]
                        params.shift()
                        w2popup[method].apply(w2popup, params)
                    })
            }
        })
    }
    action(action, msgId) {
        let obj = this
        let options = $('#w2ui-popup').data('options')
        if (msgId != null) {
            options = $('#w2ui-message' + msgId).data('options')
            obj = {
                parent: this,
                options: options,
                close() {
                    w2popup.message({ msgId: msgId })
                }
            }
        }
        let act = options.actions[action]
        let click = act
        if ($.isPlainObject(act) && act.onClick) click = act.onClick
        // event before
        let edata = this.trigger({ phase: 'before', target: action, msgId: msgId, type: 'action', action: act, originalEvent: event })
        if (edata.isCancelled === true) return
        // default actions
        if (typeof click === 'function') click.call(obj, event)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    keydown(event) {
        let options = $('#w2ui-popup').data('options')
        if (options && !options.keyboard) return
        // trigger event
        let edata = w2popup.trigger({ phase: 'before', type: 'keydown', target: 'popup', options: options, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behavior
        switch (event.keyCode) {
            case 27:
                event.preventDefault()
                if ($('#w2ui-popup .w2ui-message').length > 0) w2popup.message(); else w2popup.close()
                break
        }
        // event after
        w2popup.trigger($.extend(edata, { phase: 'after'}))
    }
    close(options) {
        let obj = this
        options = $.extend({}, $('#w2ui-popup').data('options'), options)
        if ($('#w2ui-popup').length === 0 || this.status == 'closed') return
        if (this.status == 'opening') {
            setTimeout(() => { w2popup.close() }, 100)
            return
        }
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'close', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status = 'closing'
        $('#w2ui-popup')
            .css(w2utils.cssPrefix({
                'transition': options.speed + 's opacity, ' + options.speed + 's -webkit-transform'
            }))
            .addClass('w2ui-popup-closing')
        w2popup.unlockScreen(options)
        setTimeout(() => {
            // return template
            obj.restoreTemplate()
            $('#w2ui-popup').remove()
            w2popup.status = 'closed'
            // restore active
            if (options._last_focus && options._last_focus.length > 0) options._last_focus.focus()
            // event after
            obj.trigger($.extend(edata, { phase: 'after'}))
        }, options.speed * 1000)
        // remove keyboard events
        if (options.keyboard) $(document).off('keydown', this.keydown)
    }
    toggle() {
        let obj = this
        let options = $('#w2ui-popup').data('options')
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'toggle', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // defatul action
        if (options.maximized === true) w2popup.min(); else w2popup.max()
        // event after
        setTimeout(() => {
            obj.trigger($.extend(edata, { phase: 'after'}))
        }, (options.speed * 1000) + 50)
    }
    max() {
        let obj = this
        let options = $('#w2ui-popup').data('options')
        if (options.maximized === true) return
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'max', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status = 'resizing'
        options.prevSize = $('#w2ui-popup').css('width') + ':' + $('#w2ui-popup').css('height')
        // do resize
        w2popup.resize(10000, 10000, () => {
            w2popup.status = 'open'
            options.maximized = true
            obj.trigger($.extend(edata, { phase: 'after'}))
            // resize gird, form, layout inside popup
            $('#w2ui-popup .w2ui-grid, #w2ui-popup .w2ui-form, #w2ui-popup .w2ui-layout').each(() => {
                let name = $(this).attr('name')
                if (w2ui[name] && w2ui[name].resize) w2ui[name].resize()
            })
        })
    }
    min() {
        let obj = this
        let options = $('#w2ui-popup').data('options')
        if (options.maximized !== true) return
        let size = options.prevSize.split(':')
        // trigger event
        let edata = this.trigger({ phase: 'before', type: 'min', target: 'popup', options: options })
        if (edata.isCancelled === true) return
        // default behavior
        w2popup.status = 'resizing'
        // do resize
        w2popup.resize(parseInt(size[0]), parseInt(size[1]), () => {
            w2popup.status = 'open'
            options.maximized = false
            options.prevSize = null
            obj.trigger($.extend(edata, { phase: 'after'}))
            // resize gird, form, layout inside popup
            $('#w2ui-popup .w2ui-grid, #w2ui-popup .w2ui-form, #w2ui-popup .w2ui-layout').each(() => {
                let name = $(this).attr('name')
                if (w2ui[name] && w2ui[name].resize) w2ui[name].resize()
            })
        })
    }
    get() {
        return $('#w2ui-popup').data('options')
    }
    set(options) {
        w2popup.open(options)
    }
    clear() {
        $('#w2ui-popup .w2ui-popup-title').html('')
        $('#w2ui-popup .w2ui-popup-body').html('')
        $('#w2ui-popup .w2ui-popup-buttons').html('')
    }
    reset() {
        w2popup.open(w2popup.defaults)
    }
    message(options) {
        return new Promise((resolve, reject) => {
            let obj = this
            $().w2tag() // hide all tags
            if (typeof options == 'string') {
                options = { html: options, width: 200, height: 100 }
            }
            if (!options) options = { width: 200, height: 100 }
            let pWidth = parseInt($('#w2ui-popup').width())
            let pHeight = parseInt($('#w2ui-popup').height())
            options.originalWidth = options.width
            options.originalHeight = options.height
            if (parseInt(options.width) < 10) options.width = 10
            if (parseInt(options.height) < 10) options.height = 10
            if (options.hideOnClick == null) options.hideOnClick = false
            let poptions = $('#w2ui-popup').data('options') || {}
            let titleHeight = parseInt($('#w2ui-popup > .w2ui-popup-title').css('height'))
            if (options.width == null || options.width > poptions.width - 10) {
                options.width = poptions.width - 10
            }
            if (options.height == null || options.height > poptions.height - titleHeight - 5) {
                options.height = poptions.height - titleHeight - 5 // need margin from bottom only
            }
            // negative value means margin
            if (options.originalHeight < 0) options.height = pHeight + options.originalHeight - titleHeight
            if (options.originalWidth < 0) options.width = pWidth + options.originalWidth * 2 // x 2 because there is left and right margin
            let head = $('#w2ui-popup .w2ui-popup-title')
            let msgCount = $('#w2ui-popup .w2ui-message').length
            // convert action arrays into buttons
            if (options.actions != null) {
                options.buttons = ''
                Object.keys(options.actions).forEach((action) => {
                    let handler = options.actions[action]
                    if (typeof handler == 'function') {
                        options.buttons += `<button class="w2ui-btn w2ui-action" data-click='["action","${action}","${msgCount}"]'>${action}</button>`
                    }
                    if (typeof handler == 'object') {
                        options.buttons += `<button class="w2ui-btn w2ui-action ${handler.class || ''}" style="${handler.style || ''}"
                            data-click='["action","${action}","${msgCount}"]'>${handler.text || action}</button>`
                    }
                    if (typeof handler == 'string') {
                        options.buttons += handler
                    }
                })
            }
            // remove message
            if ($.trim(options.html) === '' && $.trim(options.body) === '' && $.trim(options.buttons) === '') {
                let $msg = $('#w2ui-popup .w2ui-message').last()
                if (options.msgId != null) {
                    $msg = $('#w2ui-message'+ options.msgId)
                }
                options = $msg.data('options') || {}
                // message close event
                let edata = obj.trigger({ phase: 'before', type: 'msgClose', msgId: $msg.attr('data-msgId'), target: 'popup', options: options })
                if (edata.isCancelled === true) return
                // start hide transition
                $msg.css(w2utils.cssPrefix({
                    'transition': '0.15s',
                    'transform': 'translateY(-' + options.height + 'px)'
                }))
                let $focus = $('#w2ui-popup .w2ui-message')
                $focus = $($focus[$focus.length - 2])
                    .css('z-index', 1500)
                    .data('msg-focus')
                if ($focus && $focus.length > 0) $focus.focus(); else obj.focus()
                if (msgCount == 1) w2popup.unlock(150)
                setTimeout(() => {
                    $msg.remove()
                    // default action
                    if (typeof options.onClose == 'function') {
                        options.onClose(edata)
                    }
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    obj.bindEvents()
                    resolve(edata)
                }, 150)
            } else {
                if ($.trim(options.body) !== '' || $.trim(options.buttons) !== '') {
                    options.html = '<div class="w2ui-message-body">'+ options.body +'</div>'+
                        '<div class="w2ui-message-buttons">'+ options.buttons +'</div>'
                }
                // hide previous messages
                $('#w2ui-popup .w2ui-message').css('z-index', 1390).data('msg-focus', $(':focus'))
                head.css('z-index', 1501)
                if (options.close == null) {
                    options.close = () => {
                        w2popup.message({ msgId: msgCount })
                    }
                }
                // add message
                $('#w2ui-popup .w2ui-box')
                    .before('<div id="w2ui-message' + msgCount + '" class="w2ui-message" style="display: none; z-index: 1500; ' +
                                (head.length === 0 ? 'top: 0px;' : 'top: ' + w2utils.getSize(head, 'height') + 'px;') +
                                (options.width != null ? 'width: ' + options.width + 'px; left: ' + ((pWidth - options.width) / 2) + 'px;' : 'left: 10px; right: 10px;') +
                                (options.height != null ? 'height: ' + options.height + 'px;' : 'bottom: 6px;') +
                                w2utils.cssPrefix('transition', '0s', true) + '" data-msgId="' + msgCount +'" ' +
                                (options.hideOnClick === true ? 'onclick="w2popup.message();"' : '') + '>' +
                            '</div>')
                $('#w2ui-popup #w2ui-message'+ msgCount).data('options', options)
                let display = $('#w2ui-popup #w2ui-message'+ msgCount).css('display')
                $('#w2ui-popup #w2ui-message'+ msgCount).css(w2utils.cssPrefix({
                    'transform': (display == 'none' ? 'translateY(-' + options.height + 'px)' : 'translateY(0px)')
                }))
                if (display == 'none') {
                    $('#w2ui-popup #w2ui-message'+ msgCount).show().html(options.html)
                    // timer needs to animation
                    setTimeout(() => {
                        $('#w2ui-popup #w2ui-message'+ msgCount).css(
                            $.extend(
                                w2utils.cssPrefix('transition', '.3s', false),
                                w2utils.cssPrefix({
                                    'transform': (display == 'none' ? 'translateY(0px)' : 'translateY(-' + options.height + 'px)')
                                })
                            )
                        )
                    }, 1)
                    // timer for lock
                    if (msgCount === 0) w2popup.lock()
                    // message open event
                    let edata = obj.trigger({ phase: 'before', type: 'msgOpen', msgId: msgCount, target: 'popup', options: options })
                    if (edata.isCancelled === true) return
                    setTimeout(() => {
                        obj.focus()
                        // has to be on top of lock
                        $('#w2ui-popup #w2ui-message'+ msgCount).css(w2utils.cssPrefix({ 'transition': '0s' }))
                        if (typeof options.onOpen == 'function') {
                            options.onOpen(edata)
                        }
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }))
                        obj.bindEvents()
                        resolve(edata)
                    }, 350)
                }
            }
        })
    }
    focus() {
        let tmp = null
        let pop = $('#w2ui-popup')
        let sel = 'input:visible, button:visible, select:visible, textarea:visible, [contentEditable], .w2ui-input'
        // clear previous blur
        $(pop).find(sel).off('.keep-focus')
        // in message or popup
        let cnt = $('#w2ui-popup .w2ui-message').length - 1
        let msg = $('#w2ui-popup #w2ui-message' + cnt)
        if (msg.length > 0) {
            let btn =$(msg[msg.length - 1]).find('button')
            if (btn.length > 0) btn[0].focus()
            tmp = msg
        } else if (pop.length > 0) {
            let btn = pop.find('.w2ui-popup-buttons button')
            if (btn.length > 0) btn[0].focus()
            tmp = pop
        }
        // keep focus/blur inside popup
        $(tmp).find(sel)
            .on('blur.keep-focus', function(event) {
                setTimeout(() => {
                    let focus = $(':focus')
                    if ((focus.length > 0 && !$(tmp).find(sel).is(focus)) || focus.hasClass('w2ui-popup-hidden')) {
                        let el = $(tmp).find(sel)
                        if (el.length > 0) el[0].focus()
                    }
                }, 1)
            })
    }
    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift($('#w2ui-popup'))
        w2utils.lock.apply(window, args)
    }
    unlock(speed) {
        w2utils.unlock($('#w2ui-popup'), speed)
    }
    // --- INTERNAL FUNCTIONS
    lockScreen(options) {
        if ($('#w2ui-lock').length > 0) return false
        if (options == null) options = $('#w2ui-popup').data('options')
        if (options == null) options = {}
        options = $.extend({}, w2popup.defaults, options)
        // show element
        $('body').append('<div id="w2ui-lock" ' +
            '    style="position: ' + (w2utils.engine == 'IE5' ? 'absolute' : 'fixed') + '; z-Index: 1199; left: 0px; top: 0px; ' +
            '           padding: 0px; margin: 0px; background-color: ' + options.color + '; width: 100%; height: 100%; opacity: 0;"></div>')
        // lock screen
        setTimeout(() => {
            $('#w2ui-lock')
                .css('opacity', options.opacity)
                .css(w2utils.cssPrefix('transition', options.speed + 's opacity'))
        }, 1)
        // add events
        if (options.modal == true) {
            $('#w2ui-lock')
                .on('mousedown', function() {
                    $('#w2ui-lock')
                        .css('opacity', '0.6')
                        .css(w2utils.cssPrefix('transition', '.1s'))
                })
                .on('mouseup', function() {
                    setTimeout(() => {
                        $('#w2ui-lock')
                            .css('opacity', options.opacity)
                            .css(w2utils.cssPrefix('transition', '.1s'))
                    }, 100)
                })
                .on('mousewheel', function(event) {
                    if (event.stopPropagation) { event.stopPropagation() } else { event.cancelBubble = true }
                    if (event.preventDefault) { event.preventDefault() } else { return false }
                })
        } else {
            $('#w2ui-lock').on('mousedown', function() { w2popup.close() })
        }
        return true
    }
    unlockScreen(options) {
        if ($('#w2ui-lock').length === 0) return false
        if (options == null) options = $('#w2ui-popup').data('options')
        if (options == null) options = {}
        options = $.extend({}, w2popup.defaults, options)
        $('#w2ui-lock')
            .css('opacity', '0')
            .css(w2utils.cssPrefix('transition', options.speed + 's opacity'))
        setTimeout(() => {
            $('#w2ui-lock').remove()
        }, options.speed * 1000)
        return true
    }
    resizeMessages() {
        // see if there are messages and resize them
        $('#w2ui-popup .w2ui-message').each(() => {
            let moptions = $(this).data('options')
            let $popup = $('#w2ui-popup')
            if (parseInt(moptions.width) < 10) moptions.width = 10
            if (parseInt(moptions.height) < 10) moptions.height = 10
            let titleHeight = parseInt($popup.find('> .w2ui-popup-title').css('height'))
            let pWidth = parseInt($popup.width())
            let pHeight = parseInt($popup.height())
            // recalc width
            moptions.width = moptions.originalWidth
            if (moptions.width > pWidth - 10) {
                moptions.width = pWidth - 10
            }
            // recalc height
            moptions.height = moptions.originalHeight
            if (moptions.height > pHeight - titleHeight - 5) {
                moptions.height = pHeight - titleHeight - 5
            }
            if (moptions.originalHeight < 0) moptions.height = pHeight + moptions.originalHeight - titleHeight
            if (moptions.originalWidth < 0) moptions.width = pWidth + moptions.originalWidth * 2 // x 2 because there is left and right margin
            $(this).css({
                left    : ((pWidth - moptions.width) / 2) + 'px',
                width   : moptions.width + 'px',
                height  : moptions.height + 'px'
            })
        })
    }
    resize(width, height, callBack) {
        let obj = this
        let options = $('#w2ui-popup').data('options') || {}
        if (options.speed == null) options.speed = 0
        width = parseInt(width)
        height = parseInt(height)
        // calculate new position
        let maxW, maxH
        if (window.innerHeight == undefined) {
            maxW = parseInt(document.documentElement.offsetWidth)
            maxH = parseInt(document.documentElement.offsetHeight)
            if (w2utils.engine === 'IE7') { maxW += 21; maxH += 4 }
        } else {
            maxW = parseInt(window.innerWidth)
            maxH = parseInt(window.innerHeight)
        }
        if (maxW - 10 < width) width = maxW - 10
        if (maxH - 10 < height) height = maxH - 10
        let top = (maxH - height) / 2 * 0.6
        let left = (maxW - width) / 2
        // resize there
        $('#w2ui-popup')
            .css(w2utils.cssPrefix({
                'transition': options.speed + 's width, ' + options.speed + 's height, ' + options.speed + 's left, ' + options.speed + 's top'
            }))
            .css({
                'top'   : top,
                'left'  : left,
                'width' : width,
                'height': height
            })
        let tmp_int = setInterval(() => { obj.resizeMessages() }, 10) // then messages resize nicely
        setTimeout(() => {
            clearInterval(tmp_int)
            options.width = width
            options.height = height
            obj.resizeMessages()
            if (typeof callBack == 'function') callBack()
        }, (options.speed * 1000) + 50) // give extra 50 ms
    }
    /***********************
    *  Internal
    **/
    // restores template
    restoreTemplate() {
        let options = $('#w2ui-popup').data('options')
        if (options == null) return
        let template = w2popup._template
        let title = options.title
        let body = options.body
        let buttons = options.buttons
        if (w2popup._prev) {
            template = w2popup._prev.template
            title = w2popup._prev.title
            body = w2popup._prev.body
            buttons = w2popup._prev.buttons
            delete w2popup._prev
        } else {
            delete w2popup._template
        }
        if (template != null) {
            let $tmp = $(template)
            if ($tmp.length === 0) return
            if ($(body).attr('rel') == 'body') {
                if (title) $tmp.append(title)
                if (body) $tmp.append(body)
                if (buttons) $tmp.append(buttons)
            } else {
                $tmp.append(body)
            }
        }
    }
}
let w2popup = new w2dialog()
if (window) {
    window.w2popup = w2popup
}
function w2alert(msg, title, callBack) {
    let $ = jQuery
    if (title == null) title = w2utils.lang('Notification')
    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing') {
        w2popup.message({
            width: 400,
            height: 170,
            body: '<div class="w2ui-centered w2ui-alert-msg" style="font-size: 13px;">' + msg + '</div>',
            actions: {
                Ok: {
                    text: w2utils.lang('Ok'),
                    onClick() {
                        w2popup.message()
                    }
                }
            },
            onOpen() {
                $('#w2ui-popup .w2ui-message .w2ui-popup-btn').focus()
            },
            onClose() {
                if (typeof callBack == 'function') callBack()
            }
        })
    } else {
        w2popup.open({
            width     : 450,
            height    : 220,
            showMax   : false,
            showClose : false,
            title     : title,
            body      : '<div class="w2ui-centered w2ui-alert-msg" style="font-size: 13px;">' + msg + '</div>',
            actions: {
                Ok: {
                    text: w2utils.lang('Ok'),
                    onClick() {
                        w2popup.close()
                    }
                }
            },
            onOpen(event) {
                // do not use onComplete as it is slower
                setTimeout(() => { $('#w2ui-popup .w2ui-popup-btn').focus() }, 1)
            },
            onKeydown(event) {
                $('#w2ui-popup .w2ui-popup-btn').focus().addClass('clicked')
            },
            onClose() {
                if (typeof callBack == 'function') callBack()
            }
        })
    }
    return {
        ok(fun) {
            callBack = fun
            return this
        },
        done(fun) {
            callBack = fun
            return this
        },
        then(fun) {
            callBack = fun
            return this
        }
    }
}
function w2confirm(msg, title, callBack) {
    let $ = jQuery
    let options = {}
    let defaults = {
        msg: '',
        title: w2utils.lang('Confirmation'),
        width: ($('#w2ui-popup').length > 0 ? 400 : 450),
        height: ($('#w2ui-popup').length > 0 ? 170 : 220),
        btn_yes: {
            text: 'Yes',
            class: '',
            styel: '',
            click: null
        },
        btn_no     : {
            text: 'No',
            class: '',
            styel: '',
            click: null
        },
        focus_to_no : false,
        callBack    : null
    }
    if (arguments.length == 1 && typeof msg == 'object') {
        $.extend(options, defaults, msg)
    } else {
        if (typeof title == 'function') {
            $.extend(options, defaults, {
                msg     : msg,
                callBack: title
            })
        } else {
            $.extend(options, defaults, {
                msg     : msg,
                title   : title,
                callBack: callBack
            })
        }
    }
    // yes btn - backward compatibility
    if (options.yes_text) options.btn_yes.text = options.yes_text
    if (options.yes_class) options.btn_yes.class = options.yes_class
    if (options.yes_style) options.btn_yes.style = options.yes_style
    if (options.yes_onClick) options.btn_yes.click = options.yes_onClick
    if (options.yes_callBack) options.btn_yes.click = options.yes_callBack
    // no btn - backward compatibility
    if (options.no_text) options.btn_no.text = options.no_text
    if (options.no_class) options.btn_no.class = options.no_class
    if (options.no_style) options.btn_no.style = options.no_style
    if (options.no_onClick) options.btn_no.click = options.no_onClick
    if (options.no_callBack) options.btn_no.click = options.no_callBack
    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing' && w2popup.get()) {
        if (options.width > w2popup.get().width) options.width = w2popup.get().width
        if (options.height > (w2popup.get().height - 50)) options.height = w2popup.get().height - 50
        w2popup.message({
            width: options.width,
            height: options.height,
            body: '<div class="w2ui-centered w2ui-confirm-msg" style="font-size: 13px;">' + options.msg + '</div>',
            buttons: (w2utils.settings.macButtonOrder
                ? '<button id="No" class="w2ui-popup-btn w2ui-btn '+ options.btn_no.class +'" style="'+ options.btn_no.style +'">' + w2utils.lang(options.btn_no.text) + '</button>' +
                  '<button id="Yes" class="w2ui-popup-btn w2ui-btn '+ options.btn_yes.class +'" style="'+ options.btn_yes.style +'">' + w2utils.lang(options.btn_yes.text) + '</button>'
                : '<button id="Yes" class="w2ui-popup-btn w2ui-btn '+ options.btn_yes.class +'" style="'+ options.btn_yes.style +'">' + w2utils.lang(options.btn_yes.text) + '</button>' +
                  '<button id="No" class="w2ui-popup-btn w2ui-btn '+ options.btn_no.class +'" style="'+ options.btn_no.style +'">' + w2utils.lang(options.btn_no.text) + '</button>'
            ),
            onOpen(event) {
                $('#w2ui-popup .w2ui-message .w2ui-btn').on('click.w2confirm', function(event) {
                    w2popup._confirm_btn = event.target.id
                    w2popup.message()
                })
                if (typeof options.onOpen == 'function') options.onOpen()
            },
            onClose(event) {
                // needed this because there might be other messages
                $('#w2ui-popup .w2ui-message .w2ui-btn').off('click.w2confirm')
                // need to wait for message to slide up
                setTimeout(() => {
                    if (typeof options.callBack == 'function') options.callBack(w2popup._confirm_btn)
                    if (w2popup._confirm_btn == 'Yes' && typeof options.btn_yes.click == 'function') options.btn_yes.click()
                    if (w2popup._confirm_btn == 'No' && typeof options.btn_no.click == 'function') options.btn_no.click()
                }, 300)
                if (typeof options.onClose == 'function') options.onClose()
            }
            // onKeydown will not work here
        })
    } else {
        if (!w2utils.isInt(options.height)) options.height = options.height + 50
        w2popup.open({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            showClose: false,
            body: '<div class="w2ui-centered w2ui-confirm-msg" style="font-size: 13px;">' + options.msg + '</div>',
            buttons: (w2utils.settings.macButtonOrder
                    ? '<button id="No" class="w2ui-popup-btn w2ui-btn '+ options.btn_no.class +'" style="'+ options.btn_no.style +'">'+ w2utils.lang(options.btn_no.text) +'</button>' +
                      '<button id="Yes" class="w2ui-popup-btn w2ui-btn '+ options.btn_yes.class +'" style="'+ options.btn_yes.style +'">'+ w2utils.lang(options.btn_yes.text) +'</button>'
                    : '<button id="Yes" class="w2ui-popup-btn w2ui-btn '+ options.btn_yes.class +'" style="'+ options.btn_yes.style +'">'+ w2utils.lang(options.btn_yes.text) +'</button>' +
                      '<button id="No" class="w2ui-popup-btn w2ui-btn '+ options.btn_no.class +'" style="'+ options.btn_no.style +'">'+ w2utils.lang(options.btn_no.text) +'</button>'
            ),
            onOpen(event) {
                // do not use onComplete as it is slower
                setTimeout(() => {
                    $('#w2ui-popup .w2ui-popup-btn').on('click', function(event) {
                        w2popup.close()
                        if (typeof options.callBack == 'function') options.callBack(event.target.id)
                        if (event.target.id == 'Yes' && typeof options.btn_yes.click == 'function') options.btn_yes.click()
                        if (event.target.id == 'No' && typeof options.btn_no.click == 'function') options.btn_no.click()
                    })
                    if(options.focus_to_no){
                        $('#w2ui-popup .w2ui-popup-btn#No').focus()
                    }else{
                        $('#w2ui-popup .w2ui-popup-btn#Yes').focus()
                    }
                    if (typeof options.onOpen == 'function') options.onOpen()
                }, 1)
            },
            onClose(event) {
                if (typeof options.onClose == 'function') options.onClose()
            },
            onKeydown(event) {
                // if there are no messages
                if ($('#w2ui-popup .w2ui-message').length === 0) {
                    switch (event.originalEvent.keyCode) {
                        case 13: // enter
                            $('#w2ui-popup .w2ui-popup-btn#Yes').focus().addClass('clicked') // no need fo click as enter will do click
                            w2popup.close()
                            break
                        case 27: // esc
                            $('#w2ui-popup .w2ui-popup-btn#No').focus().click()
                            w2popup.close()
                            break
                    }
                }
            }
        })
    }
    return {
        yes(fun) {
            options.btn_yes.click = fun
            return this
        },
        no(fun) {
            options.btn_no.click = fun
            return this
        }
    }
}
function w2prompt(label, title, callBack) {
    let $ = jQuery
    let options = {}
    let defaults = {
        title: w2utils.lang('Notification'),
        width: ($('#w2ui-popup').length > 0 ? 400 : 450),
        height: ($('#w2ui-popup').length > 0 ? 170 : 220),
        label: '',
        value: '',
        attrs: '',
        textarea: false,
        btn_ok: {
            text: 'Ok',
            class: '',
            style: '',
            click: null
        },
        btn_cancel: {
            text: 'Cancel',
            class: '',
            style: '',
            click: null
        },
        callBack: null,
        onOpen: null,
        onClose: null
    }
    w2popup.tmp = w2popup.tmp || {}
    if (arguments.length == 1 && typeof label == 'object') {
        $.extend(options, defaults, label)
    } else {
        if (typeof title == 'function') {
            $.extend(options, defaults, {
                label   : label,
                callBack: title
            })
        } else {
            $.extend(options, defaults, {
                label   : label,
                title   : title,
                callBack: callBack
            })
        }
    }
    // ok btn - backward compatibility
    if (options.ok_text) options.btn_ok.text = options.ok_text
    if (options.ok_class) options.btn_ok.class = options.ok_class
    if (options.ok_style) options.btn_ok.style = options.ok_style
    if (options.ok_onClick) options.btn_ok.click = options.ok_onClick
    if (options.ok_callBack) options.btn_ok.click = options.ok_callBack
    // cancel btn - backward compatibility
    if (options.cancel_text) options.btn_cancel.text = options.cancel_text
    if (options.cancel_class) options.btn_cancel.class = options.cancel_class
    if (options.cancel_style) options.btn_cancel.style = options.cancel_style
    if (options.cancel_onClick) options.btn_cancel.click = options.cancel_onClick
    if (options.cancel_callBack) options.btn_cancel.click = options.cancel_callBack
    if ($('#w2ui-popup').length > 0 && w2popup.status != 'closing' && w2popup.get()) {
        if (options.width > w2popup.get().width) options.width = w2popup.get().width
        if (options.height > (w2popup.get().height - 50)) options.height = w2popup.get().height - 50
        w2popup.message({
            width   : options.width,
            height  : options.height,
            body    : (options.textarea
                     ? '<div class="w2ui-prompt textarea">'+
                        '  <div>' + options.label + '</div>'+
                        '  <textarea id="w2prompt" class="w2ui-input" '+ options.attrs +'></textarea>'+
                        '</div>'
                     : '<div class="w2ui-prompt w2ui-centered">'+
                        '  <label>' + options.label + '</label>'+
                        '  <input id="w2prompt" class="w2ui-input" '+ options.attrs +'>'+
                        '</div>'
            ),
            buttons : (w2utils.settings.macButtonOrder
                ? '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>' +
                  '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'
                : '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>' +
                  '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>'
            ),
            onOpen() {
                $('#w2prompt').val(options.value).off('.w2prompt').on('keydown.w2prompt', function(event) {
                    if (event.keyCode == 13) {
                        $('#w2ui-popup .w2ui-message .w2ui-btn#Ok').click()
                    }
                })
                $('#w2ui-popup .w2ui-message .w2ui-btn#Ok').off('.w2prompt').on('click.w2prompt', function(event) {
                    w2popup.tmp.btn = 'ok'
                    w2popup.tmp.value = $('#w2prompt').val()
                    w2popup.message()
                })
                $('#w2ui-popup .w2ui-message .w2ui-btn#Cancel').off('.w2prompt').on('click.w2prompt', function(event) {
                    w2popup.tmp.btn = 'cancel'
                    w2popup.tmp.value = null
                    w2popup.message()
                })
                // set focus
                setTimeout(() => { $('#w2prompt').focus() }, 100)
                // some event
                if (typeof options.onOpen == 'function') options.onOpen()
            },
            onClose() {
                // needed this because there might be other messages
                $('#w2ui-popup .w2ui-message .w2ui-btn').off('click.w2prompt')
                // need to wait for message to slide up
                setTimeout(() => {
                    btnClick(w2popup.tmp.btn, w2popup.tmp.value)
                }, 300)
                // some event
                if (typeof options.onClose == 'function') options.onClose()
            }
            // onKeydown will not work here
        })
    } else {
        if (!w2utils.isInt(options.height)) options.height = options.height + 50
        w2popup.open({
            width: options.width,
            height: options.height,
            title: options.title,
            modal: true,
            showClose: false,
            body: (options.textarea
                         ? '<div class="w2ui-prompt">'+
                            '  <div>' + options.label + '</div>'+
                            '  <textarea id="w2prompt" class="w2ui-input" '+ options.attrs +'></textarea>'+
                            '</div>'
                         : '<div class="w2ui-prompt w2ui-centered" style="font-size: 13px;">'+
                            '  <label>' + options.label + '</label>'+
                            '  <input id="w2prompt" class="w2ui-input" '+ options.attrs +'>'+
                            '</div>'
            ),
            buttons    : (w2utils.settings.macButtonOrder
                ? '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>' +
                  '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'
                : '<button id="Ok" class="w2ui-popup-btn w2ui-btn '+ options.btn_ok.class +'" style="'+ options.btn_ok.style +'">' + options.btn_ok.text + '</button>'+
                  '<button id="Cancel" class="w2ui-popup-btn w2ui-btn '+ options.btn_cancel.class +'" style="'+ options.btn_cancel.style +'">' + options.btn_cancel.text + '</button>'
            ),
            onOpen(event) {
                // do not use onComplete as it is slower
                setTimeout(() => {
                    $('#w2prompt').val(options.value)
                    $('#w2prompt').w2field('text')
                    $('#w2ui-popup .w2ui-popup-btn#Ok').on('click', function(event) {
                        w2popup.tmp.btn = 'ok'
                        w2popup.tmp.value = $('#w2prompt').val()
                        w2popup.close()
                    })
                    $('#w2ui-popup .w2ui-popup-btn#Cancel').on('click', function(event) {
                        w2popup.tmp.btn = 'cancel'
                        w2popup.tmp.value = null
                        w2popup.close()
                    })
                    $('#w2ui-popup .w2ui-popup-btn#Ok')
                    // set focus
                    setTimeout(() => { $('#w2prompt').focus() }, 100)
                    // some event
                    if (typeof options.onOpen == 'function') options.onOpen()
                }, 1)
            },
            onClose(event) {
                // some event
                btnClick(w2popup.tmp.btn, w2popup.tmp.value)
                if (typeof options.onClose == 'function') options.onClose()
            },
            onKeydown(event) {
                // if there are no messages
                if ($('#w2ui-popup .w2ui-message').length === 0) {
                    switch (event.originalEvent.keyCode) {
                        case 13: // enter
                            $('#w2ui-popup .w2ui-popup-btn#Ok').focus().addClass('clicked') // no need fo click as enter will do click
                            break
                        case 27: // esc
                            w2popup.tmp.btn = 'cancel'
                            w2popup.tmp.value = null
                            break
                    }
                }
            }
        })
    }
    function btnClick(btn, value) {
        if (btn == 'ok' && typeof options.btn_ok.click == 'function') {
            options.btn_ok.click(value)
        }
        if (btn == 'cancel' && typeof options.btn_cancel.click == 'function') {
            options.btn_cancel.click(value)
        }
        if (typeof options.callBack == 'function') {
            options.callBack(btn, value)
        }
    }
    return {
        change(fun) {
            $('#w2prompt').on('keyup', fun).keyup()
            return this
        },
        ok(fun) {
            options.btn_ok.click = fun
            return this
        },
        cancel(fun) {
            options.btn_cancel.click = fun
            return this
        }
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == 1.5 changes ==
*   - tab.caption - deprecated
*   - getTabHTML()
*   - refactored with display: flex
*   - reorder
*   - initReorder
*   - dragMove
*   - tmp
*   == 2.0
*   - w2tabs.tab => w2tabs.tab_template
*   - show/hide, enable/disable, check/uncheck - return array of effected items
*
************************************************************************/

class w2tabs extends w2event {
    constructor(options) {
        super(options.name)
        this.box = null // DOM Element that holds the element
        this.name = null // unique name for w2ui
        this.active = null
        this.reorder = false
        this.flow = 'down' // can be down or up
        this.tooltip = 'top|left' // can be top, bottom, left, right
        this.tabs = []
        this.routeData = {} // data for dynamic routes
        this.tmp = {} // placeholder for internal variables
        this.right = ''
        this.style = ''
        this.onClick = null
        this.onClose = null
        this.onRender = null
        this.onRefresh = null
        this.onResize = null
        this.onDestroy = null
        this.tab_template = {
            id: null,
            text: null,
            route: null,
            hidden: false,
            disabled: false,
            closable: false,
            tooltip: null,
            style: '',
            onClick: null,
            onRefresh: null,
            onClose: null
        }
        let tabs = options.tabs
        delete options.tabs
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(tabs)) this.add(tabs)
    }
    add(tab) {
        return this.insert(null, tab)
    }
    insert(id, tabs) {
        if (!Array.isArray(tabs)) tabs = [tabs]
        // assume it is array
        tabs.forEach(tab => {
            // checks
            if (tab.id == null) {
                console.log(`ERROR: The parameter "id" is required but not supplied. (obj: ${this.name})`)
                return
            }
            if (!w2utils.checkUniqueId(tab.id, this.tabs, 'tabs', this.name)) return
            // add tab
            let it = Object.assign({}, this.tab_template, tab)
            if (id == null) {
                this.tabs.push(it)
            } else {
                let middle = this.get(id, true)
                let before = this.tabs[middle].id
                this.insertTabHTML(before, it)
            }
        })
    }
    remove() {
        let effected = 0
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab) return
            effected++
            // remove from array
            this.tabs.splice(this.get(tab.id, true), 1)
            // remove from screen
            $(this.box).find(`#tabs_${this.name}_tab_${w2utils.escapeId(tab.id)}`).remove()
        })
        this.resize()
        return effected
    }
    select(id) {
        if (this.active == id || this.get(id) == null) return false
        this.active = id
        this.refresh()
        return true
    }
    set(id, tab) {
        let index = this.get(id, true)
        if (index == null) return false
        $.extend(this.tabs[index], tab)
        this.refresh(id)
        return true
    }
    get(id, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let i1 = 0; i1 < this.tabs.length; i1++) {
                if (this.tabs[i1].id != null) {
                    all.push(this.tabs[i1].id)
                }
            }
            return all
        } else {
            for (let i2 = 0; i2 < this.tabs.length; i2++) {
                if (this.tabs[i2].id == id) { // need to be == since id can be numeric
                    return (returnIndex === true ? i2 : this.tabs[i2])
                }
            }
        }
        return null
    }
    show() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.hidden === false) return
            tab.hidden = false
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }
    hide() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.hidden === true) return
            tab.hidden = true
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }
    enable() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.disabled === false) return
            tab.disabled = false
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }
    disable() {
        let effected = []
        Array.from(arguments).forEach(it => {
            let tab = this.get(it)
            if (!tab || tab.disabled === true) return
            tab.disabled = true
            effected.push(tab.id)
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }
    dragMove(event) {
        if (!this.tmp.reordering) return
        let obj = this
        let info = this.tmp.moving
        let tab = this.tabs[info.index]
        let next = _find(info.index, 1)
        let prev = _find(info.index, -1)
        let $el = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(tab.id))
        if (info.divX > 0 && next) {
            let $nextEl = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(next.id))
            let width1 = parseInt($el.css('width'))
            let width2 = parseInt($nextEl.css('width'))
            if (width1 < width2) {
                width1 = Math.floor(width1 / 3)
                width2 = width2 - width1
            } else {
                width1 = Math.floor(width2 / 3)
                width2 = width2 - width1
            }
            if (info.divX > width2) {
                let index = this.tabs.indexOf(next)
                this.tabs.splice(info.index, 0, this.tabs.splice(index, 1)[0]) // reorder in the array
                info.$tab.before($nextEl)
                info.$tab.css('opacity', 0)
                Object.assign(this.tmp.moving, {
                    index: index,
                    divX: -width1,
                    x: event.pageX + width1,
                    left: info.left + info.divX + width1
                })
                return
            }
        }
        if (info.divX < 0 && prev) {
            let $prevEl = $('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(prev.id))
            let width1 = parseInt($el.css('width'))
            let width2 = parseInt($prevEl.css('width'))
            if (width1 < width2) {
                width1 = Math.floor(width1 / 3)
                width2 = width2 - width1
            } else {
                width1 = Math.floor(width2 / 3)
                width2 = width2 - width1
            }
            if (Math.abs(info.divX) > width2) {
                let index = this.tabs.indexOf(prev)
                this.tabs.splice(info.index, 0, this.tabs.splice(index, 1)[0]) // reorder in the array
                $prevEl.before(info.$tab)
                info.$tab.css('opacity', 0)
                Object.assign(info, {
                    index: index,
                    divX: width1,
                    x: event.pageX - width1,
                    left: info.left + info.divX - width1
                })
                return
            }
        }
        function _find(ind, inc) {
            ind += inc
            let tab = obj.tabs[ind]
            if (tab && tab.hidden) {
                tab = _find(ind, inc)
            }
            return tab
        }
    }
    tooltipShow(id, event, forceRefresh) {
        let item = this.get(id)
        let $el = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id))
        if (this.tooltip == null || item.disabled || this.tmp.reordering) {
            return
        }
        let pos = this.tooltip
        let txt = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        $el.prop('_mouse_over', true)
        setTimeout(() => {
            if ($el.prop('_mouse_over') === true && $el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
            if (forceRefresh == true) {
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
        }, 1)
    }
    tooltipHide(id) {
        let item = this.get(id)
        let $el = $(this.box).find('#tabs_'+ this.name + '_tab_'+ w2utils.escapeId(id))
        if (this.tooltip == null || item.disabled || this.tmp.reordering) {
            return
        }
        $el.removeProp('_mouse_over')
        setTimeout(() => {
            if ($el.prop('_mouse_over') !== true && $el.prop('_mouse_tooltip') === true) {
                $el.removeProp('_mouse_tooltip')
                $el.w2tag() // hide tooltip
            }
        }, 1)
    }
    getTabHTML(id) {
        let index = this.get(id, true)
        let tab = this.tabs[index]
        if (tab == null) return false
        if (tab.text == null && tab.caption != null) tab.text = tab.caption
        if (tab.tooltip == null && tab.hint != null) tab.tooltip = tab.hint // for backward compatibility
        if (tab.caption != null) {
            console.log('NOTICE: tabs tab.caption property is deprecated, please use tab.text. Tab -> ', tab)
        }
        if (tab.hint != null) {
            console.log('NOTICE: tabs tab.hint property is deprecated, please use tab.tooltip. Tab -> ', tab)
        }
        let text = tab.text
        if (typeof text == 'function') text = text.call(this, tab)
        if (text == null) text = ''
        let closable = ''
        let addStyle = ''
        if (tab.hidden) { addStyle += 'display: none;' }
        if (tab.disabled) { addStyle += 'opacity: 0.2;' }
        if (tab.closable && !tab.disabled) {
            closable = `<div class="w2ui-tab-close${this.active === tab.id ? ' active' : ''}"
                onmouseover= "w2ui['${this.name}'].tooltipShow('${tab.id}', event)"
                onmouseout = "w2ui['${this.name}'].tooltipHide('${tab.id}', event)"
                onmousedown= "event.stopPropagation()"
                onmouseup  = "w2ui['${this.name}'].animateClose('${tab.id}', event); event.stopPropagation()">
            </div>`
        }
        let tabHTML = `
            <div id="tabs_${this.name}_tab_${tab.id}" style="${addStyle} ${tab.style}"
               class="w2ui-tab ${this.active === tab.id ? 'active' : ''} ${tab.closable ? 'closable' : ''} ${tab.class ? tab.class : ''}"
               onmouseover = "w2ui['${this.name}'].tooltipShow('${tab.id}', event)"
               onmouseout  = "w2ui['${this.name}'].tooltipHide('${tab.id}', event)"
               onmousedown = "w2ui['${this.name}'].initReorder('${tab.id}', event)"
               onclick     = "w2ui['${this.name}'].click('${tab.id}', event)">
                    ${w2utils.lang(text) + closable}
            </div>`
        return tabHTML
    }
    refresh(id) {
        let time = (new Date()).getTime()
        if (this.flow == 'up') $(this.box).addClass('w2ui-tabs-up'); else $(this.box).removeClass('w2ui-tabs-up')
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), object: this.get(id) })
        if (edata.isCancelled === true) return
        if (id == null) {
            // refresh all
            for (let i = 0; i < this.tabs.length; i++) {
                this.refresh(this.tabs[i].id)
            }
        } else {
            // create or refresh only one item
            let $tab = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
            let tabHTML = this.getTabHTML(id)
            if ($tab.length === 0) {
                $(this.box).find('#tabs_'+ this.name +'_right').before(tabHTML)
            } else {
                $tab.replaceWith(tabHTML)
            }
        }
        // right html
        $('#tabs_'+ this.name +'_right').html(this.right)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // this.resize();
        return (new Date()).getTime() - time
    }
    render(box) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return
        // default action
        // if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection
        if (box != null) {
            if ($(this.box).find('#tabs_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-tabs')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return false
        // render all buttons
        let html =`
            <div class="w2ui-scroll-wrapper" onmousedown="var el=w2ui['${this.name}']; if (el) el.resize();">
                <div class="w2ui-tabs-line"></div>
                <div id="tabs_${this.name}_right" class="w2ui-tabs-right">${this.right}</div>
            </div>
            <div class="w2ui-scroll-left" onclick="var el=w2ui['${this.name}']; if (el) el.scroll('left');"></div>
            <div class="w2ui-scroll-right" onclick="var el=w2ui['${this.name}']; if (el) el.scroll('right');"></div>`
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-tabs')
            .html(html)
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.refresh()
        this.resize()
        return (new Date()).getTime() - time
    }
    initReorder(id, event) {
        if (!this.reorder) return
        let obj = this
        let $tab = $('#tabs_' + this.name + '_tab_' + w2utils.escapeId(id))
        let tabIndex = this.get(id, true)
        let $ghost = $tab.clone()
        let edata
        $ghost.attr('id', '#tabs_' + this.name + '_tab_ghost')
        // debugger
        this.tmp.moving = {
            index: tabIndex,
            indexFrom: tabIndex,
            $tab: $tab,
            $ghost: $ghost,
            divX: 0,
            left: $tab.offset().left,
            parentX: $(this.box).offset().left,
            x: event.pageX,
            opacity: $tab.css('opacity')
        }
        $('body')
            .off('.w2uiTabReorder')
            .on('mousemove.w2uiTabReorder', function(event) {
                if (!obj.tmp.reordering) {
                    // event before
                    edata = obj.trigger({ phase: 'before', type: 'reorder', target: obj.tabs[tabIndex].id, indexFrom: tabIndex, tab: obj.tabs[tabIndex] })
                    if (edata.isCancelled === true) return
                    $().w2tag()
                    obj.tmp.reordering = true
                    $ghost.addClass('moving')
                    $ghost.css({
                        'pointer-events': 'none',
                        'position': 'absolute',
                        'left': $tab.offset().left
                    })
                    $tab.css('opacity', 0)
                    $(obj.box).find('.w2ui-scroll-wrapper').append($ghost)
                    $(obj.box).find('.w2ui-tab-close').hide()
                }
                obj.tmp.moving.divX = event.pageX - obj.tmp.moving.x
                $ghost.css('left', (obj.tmp.moving.left - obj.tmp.moving.parentX + obj.tmp.moving.divX) + 'px')
                obj.dragMove(event)
            })
            .on('mouseup.w2uiTabReorder', function() {
                $('body').off('.w2uiTabReorder')
                $ghost.css({
                    'transition': '0.1s',
                    'left': obj.tmp.moving.$tab.offset().left - obj.tmp.moving.parentX
                })
                $(obj.box).find('.w2ui-tab-close').show()
                setTimeout(() => {
                    $ghost.remove()
                    $tab.css({ opacity: obj.tmp.moving.opacity })
                    // obj.render()
                    if (obj.tmp.reordering) {
                        obj.trigger($.extend(edata, { phase: 'after', indexTo: obj.tmp.moving.index }))
                        if (edata.isCancelled === true) return
                    }
                    obj.tmp.reordering = false
                }, 100)
            })
    }
    scroll(direction) {
        let box = $(this.box)
        let obj = this
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        let scrollLeft = scrollBox.scrollLeft()
        let $right = $(this.box).find('.w2ui-tabs-right')
        let width1 = scrollBox.outerWidth()
        let width2 = scrollLeft + parseInt($right.offset().left) + parseInt($right.width())
        let scroll
        switch (direction) {
            case 'left':
                scroll = scrollLeft - width1 + 50 // 35 is width of both button
                if (scroll <= 0) scroll = 0
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
            case 'right':
                scroll = scrollLeft + width1 - 50 // 35 is width of both button
                if (scroll >= width2 - width1) scroll = width2 - width1
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
        }
        setTimeout(() => { obj.resize() }, 350)
    }
    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return
        // show hide overflow buttons
        let box = $(this.box)
        box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        let $right = $(this.box).find('.w2ui-tabs-right')
        let boxWidth = scrollBox.outerWidth()
        let itemsWidth = ($right.length > 0 ? $right[0].offsetLeft + $right[0].clientWidth : 0)
        if (itemsWidth > boxWidth) {
            // we have overflowed content
            if (scrollBox.scrollLeft() > 0) {
                box.find('.w2ui-scroll-left').show()
            }
            let padding = parseInt(scrollBox.css('padding-right'))
            if (boxWidth < itemsWidth - scrollBox.scrollLeft() - padding) {
                box.find('.w2ui-scroll-right').show()
            }
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('#tabs_'+ this.name + '_right').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-tabs')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    // ===================================================
    // -- Internal Event Handlers
    click(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled || this.tmp.reordering) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'click', target: id, tab: tab, object: tab, originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).removeClass('active')
        $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(this.active)).removeClass('active')
        this.active = tab.id
        // route processing
        if (typeof tab.route == 'string') {
            let route = tab.route !== '' ? String('/'+ tab.route).replace(/\/{2,}/g, '/') : ''
            let info = w2utils.parseRoute(route)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (this.routeData[info.keys[k].name] == null) continue
                    route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                }
            }
            setTimeout(() => { window.location.hash = route }, 1)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.refresh(id)
    }
    animateClose(id, event) {
        let tab = this.get(id)
        if (tab == null || tab.disabled) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'close', target: id, object: this.get(id), originalEvent: event })
        if (edata.isCancelled === true) return
        // default action
        let obj = this
        let $tab = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(tab.id))
        $tab.css({ // need to be separate transition
            'opacity': 0,
            'transition': '.25s'
        })
            .find('.w2ui-tab-close').remove()
        $tab.css({
            'padding-left': 0,
            'padding-right': 0,
            'text-overflow': 'clip',
            'overflow': 'hidden',
            'width': '0px'
        })
        setTimeout(() => {
            obj.remove(id)
            obj.trigger($.extend(edata, { phase: 'after' }))
            obj.refresh()
        }, 250)
    }
    insertTabHTML(id, tab) {
        let middle = this.get(id, true)
        this.tabs = this.tabs.slice(0, middle).concat([tab], this.tabs.slice(middle))
        let $before = $(this.box).find('#tabs_'+ this.name +'_tab_'+ w2utils.escapeId(id))
        let $tab = $(this.getTabHTML(tab.id))
        $before.before($tab)
        this.resize()
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - vertical toolbar
*   - refactor w/o <table>
*
* == 1.5 changes ==
*   - menu drop down can have groups now
*   - item.caption - deprecated
*   - item.text - can be a function
*   - item.icon - can be a function
*   - item.tooltip - can be a function
*   - item.color
*   - item.options
*   - event.item.get - finds selected item
*   - item.keepOpen, drop down will not close
*   - item.type = 'new-line'
*   == 2.0
*   - w2toolbar.item => w2toolbar.item_template
*   - show/hide, enable/disable, check/uncheck - return array of effected items
*
************************************************************************/
class w2toolbar extends w2event {
    constructor(options) {
        super(options.name)
        this.box = null // DOM Element that holds the element
        this.name = null // unique name for w2ui
        this.routeData = {} // data for dynamic routes
        this.items = []
        this.right = '' // HTML text on the right of toolbar
        this.tooltip = 'top|left'// can be top, bottom, left, right
        this.onClick = null
        this.onRender = null
        this.onRefresh = null
        this.onResize = null
        this.onDestroy = null
        this.item_template = {
            id: null, // command to be sent to all event handlers
            type: 'button', // button, check, radio, drop, menu, menu-radio, menu-check, break, html, spacer
            text: null,
            html: '',
            tooltip: null, // w2toolbar.tooltip should be
            count: null,
            hidden: false,
            disabled: false,
            checked: false, // used for radio buttons
            img: null,
            icon: null,
            route: null, // if not null, it is route to go
            arrow: true, // arrow down for drop/menu types
            style: null, // extra css style for caption
            group: null, // used for radio buttons
            items: null, // for type menu* it is an array of items in the menu
            selected: null, // used for menu-check, menu-radio
            overlay: {},
            color: null, // color value - used in color pickers
            options: {
                advanced: false, // advanced picker t/f - user in color picker
                transparent: true, // transparent t/f - used in color picker
                html: '' // additional buttons for color picker
            },
            onClick: null,
            onRefresh: null
        }
        let items = options.items
        delete options.items
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(items)) this.add(items)
    }
    add(items) {
        this.insert(null, items)
    }
    insert(id, items) {
        if (!Array.isArray(items)) items = [items]
        items.forEach(item => {
            // checks
            let valid = ['button', 'check', 'radio', 'drop', 'menu', 'menu-radio', 'menu-check', 'color', 'text-color', 'html',
                'break', 'spacer', 'new-line']
            if (valid.indexOf(String(item.type)) == -1) {
                console.log('ERROR: The parameter "type" should be one of the following:', valid, `, but ${item.type} is supplied.`, item)
                return
            }
            if (item.id == null && ['break', 'spacer', 'new-line'].indexOf(item.type) == -1) {
                console.log('ERROR: The parameter "id" is required but not supplied.', item)
                return
            }
            if (item.type == null) {
                console.log('ERROR: The parameter "type" is required but not supplied.', item)
                return
            }
            if (!w2utils.checkUniqueId(item.id, this.items, 'toolbar', this.name)) return
            // add item
            let newItem = Object.assign({}, this.item_template, item)
            if (newItem.type == 'menu-check') {
                if (!Array.isArray(newItem.selected)) newItem.selected = []
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach(it => {
                        if (it.checked && newItem.selected.indexOf(it.id) == -1) newItem.selected.push(it.id)
                        if (!it.checked && newItem.selected.indexOf(it.id) != -1) it.checked = true
                        if (it.checked == null) it.checked = false
                    })
                }
            } else if (newItem.type == 'menu-radio') {
                if (Array.isArray(newItem.items)) {
                    newItem.items.forEach(it => {
                        if (it.checked && newItem.selected == null) newItem.selected = it.id; else it.checked = false
                        if (!it.checked && newItem.selected == it.id) it.checked = true
                        if (it.checked == null) it.checked = false
                    })
                }
            }
            if (id == null) {
                this.items.push(newItem)
            } else {
                let middle = this.get(id, true)
                this.items = this.items.slice(0, middle).concat([netItem], this.items.slice(middle))
            }
            this.refresh(newItem.id)
        })
        this.resize()
    }
    remove() {
        let effected = 0
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            effected++
            // remove from screen
            $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id)).remove()
            // remove from array
            let ind = this.get(it.id, true)
            if (ind != null) this.items.splice(ind, 1)
        })
        this.resize()
        return effected
    }
    set(id, newOptions) {
        let item = this.get(id)
        if (item == null) return false
        Object.assign(item, newOptions)
        this.refresh(String(id).split(':')[0])
        return true
    }
    get(id, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let i1 = 0; i1 < this.items.length; i1++) if (this.items[i1].id != null) all.push(this.items[i1].id)
            return all
        }
        let tmp = String(id).split(':')
        for (let i2 = 0; i2 < this.items.length; i2++) {
            let it = this.items[i2]
            // find a menu item
            if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1 && tmp.length == 2 && it.id == tmp[0]) {
                let subItems = it.items
                if (typeof subItems == 'function') subItems = subItems(this)
                for (let i = 0; i < subItems.length; i++) {
                    let item = subItems[i]
                    if (item.id == tmp[1] || (item.id == null && item.text == tmp[1])) {
                        if (returnIndex == true) return i; else return item
                    }
                    if (Array.isArray(item.items)) {
                        for (let j = 0; j < item.items.length; j++) {
                            if (item.items[j].id == tmp[1] || (item.items[j].id == null && item.items[j].text == tmp[1])) {
                                if (returnIndex == true) return i; else return item.items[j]
                            }
                        }
                    }
                }
            } else if (it.id == tmp[0]) {
                if (returnIndex == true) return i2; else return it
            }
        }
        return null
    }
    show() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.hidden = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.resize() }) }, 15) // needs timeout
        return effected
    }
    hide() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.hidden = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.tooltipHide(it); this.resize() }) }, 15) // needs timeout
        return effected
    }
    enable() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.disabled = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }
    disable() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it) return
            it.disabled = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it); this.tooltipHide(it) }) }, 15) // needs timeout
        return effected
    }
    check() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            it.checked = true
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }
    uncheck() {
        let effected = []
        Array.from(arguments).forEach(item => {
            let it = this.get(item)
            if (!it || String(item).indexOf(':') != -1) return
            // remove overlay
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1 && it.checked) {
                // hide overlay
                setTimeout(() => {
                    let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                    el.w2overlay({ name: obj.name, data: { 'tb-item': it.id }})
                }, 1)
            }
            it.checked = false
            effected.push(String(item).split(':')[0])
        })
        setTimeout(() => { effected.forEach(it => { this.refresh(it) }) }, 15) // needs timeout
        return effected
    }
    click(id, event) {
        let obj = this
        // click on menu items
        let tmp = String(id).split(':')
        let it = this.get(tmp[0])
        let items = (it && it.items ? w2utils.normMenu.call(this, it.items, it) : [])
        if (tmp.length > 1) {
            let subItem = this.get(id)
            if (subItem && !subItem.disabled) {
                obj.menuClick({ name: obj.name, item: it, subItem: subItem, originalEvent: event })
            }
            return
        }
        if (it && !it.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: 'click', target: (id != null ? id : this.name),
                item: it, object: it, originalEvent: event })
            if (edata.isCancelled === true) return
            let btn = '#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id) +' table.w2ui-button'
            $(btn).removeClass('down') // need to requery at the moment -- as well as elsewhere in this function
            if (it.type == 'radio') {
                for (let i = 0; i < this.items.length; i++) {
                    let itt = this.items[i]
                    if (itt == null || itt.id == it.id || itt.type !== 'radio') continue
                    if (itt.group == it.group && itt.checked) {
                        itt.checked = false
                        this.refresh(itt.id)
                    }
                }
                it.checked = true
                $(btn).addClass('checked')
            }
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                obj.tooltipHide(id)
                if (it.checked) {
                    // if it was already checked, second click will hide it
                    setTimeout(() => {
                        // hide overlay
                        let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                        el.w2overlay({ name: obj.name, data: { 'tb-item': it.id }})
                        // uncheck
                        it.checked = false
                        obj.refresh(it.id)
                    }, 1)
                } else {
                    // show overlay
                    setTimeout(() => {
                        let el = $('#tb_'+ obj.name +'_item_'+ w2utils.escapeId(it.id))
                        if (!$.isPlainObject(it.overlay)) it.overlay = {}
                        let left = (el.width() - 50) / 2
                        if (left > 19) left = 19
                        if (it.type == 'drop') {
                            el.w2overlay(it.html, $.extend({ name: obj.name, left: left, top: 3, data: { 'tb-item': it.id } }, it.overlay, {
                                onHide(event) {
                                    hideDrop()
                                }
                            }))
                        }
                        if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                            let menuType = 'normal'
                            if (it.type == 'menu-radio') {
                                menuType = 'radio'
                                items.forEach((item) => {
                                    if (it.selected == item.id) item.checked = true; else item.checked = false
                                })
                            }
                            if (it.type == 'menu-check') {
                                menuType = 'check'
                                items.forEach((item) => {
                                    if (Array.isArray(it.selected) && it.selected.indexOf(item.id) != -1) item.checked = true; else item.checked = false
                                })
                            }
                            el.w2menu($.extend({ name: obj.name, items: items, left: left, top: 3, data: { 'tb-item': it.id } }, it.overlay, {
                                type: menuType,
                                remove(event) {
                                    obj.menuClick({ name: obj.name, remove: true, item: it, subItem: event.item, originalEvent: event.originalEvent, keepOpen: event.keepOpen })
                                },
                                select(event) {
                                    obj.menuClick({ name: obj.name, item: it, subItem: event.item, originalEvent: event.originalEvent, keepOpen: event.keepOpen })
                                },
                                onHide(event) {
                                    hideDrop()
                                }
                            }))
                        }
                        if (['color', 'text-color'].indexOf(it.type) != -1) {
                            $(el).w2color($.extend({
                                color: it.color,
                                onHide(event) {
                                    hideDrop()
                                    if (obj._tmpColor) {
                                        obj.colorClick({ name: obj.name, item: it, color: obj._tmpColor, final: true })
                                    }
                                    delete obj._tmpColor
                                },
                                onSelect(color) {
                                    if (color != null) {
                                        obj.colorClick({ name: obj.name, item: it, color: color })
                                        obj._tmpColor = color
                                    }
                                }
                            }, it.options))
                        }
                        function hideDrop(event) {
                            it.checked = false
                            $(btn).removeClass('checked')
                        }
                    }, 1)
                }
            }
            if (['check', 'menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                it.checked = !it.checked
                if (it.checked) {
                    $(btn).addClass('checked')
                } else {
                    $(btn).removeClass('checked')
                }
            }
            // route processing
            if (it.route) {
                let route = String('/'+ it.route).replace(/\/{2,}/g, '/')
                let info = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            if (event && ['button', 'check', 'radio'].indexOf(it.type) != -1) {
                // need to refresh toolbar as it might be dynamic
                this.tooltipShow(id, event, true)
            }
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }
    scroll(direction) {
        let box = $(this.box)
        let obj = this
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        let scrollLeft = scrollBox.scrollLeft()
        let width1, width2, scroll
        switch (direction) {
            case 'left':
                width1 = scrollBox.outerWidth()
                width2 = scrollBox.find(':first').outerWidth()
                scroll = scrollLeft - width1 + 50 // 35 is width of both button
                if (scroll <= 0) scroll = 0
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
            case 'right':
                width1 = scrollBox.outerWidth()
                width2 = scrollBox.find(':first').outerWidth()
                scroll = scrollLeft + width1 - 50 // 35 is width of both button
                if (scroll >= width2 - width1) scroll = width2 - width1
                scrollBox.animate({ scrollLeft: scroll }, 300)
                break
        }
        setTimeout(() => { obj.resize() }, 350)
    }
    render(box) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return
        if (box != null) {
            if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-toolbar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        // render all buttons
        let html = '<div class="w2ui-scroll-wrapper" onmousedown="var el=w2ui[\''+ this.name +'\']; if (el) el.resize();">'+
                   '<table cellspacing="0" cellpadding="0" width="100%"><tbody>'+
                   '<tr>'
        for (let i = 0; i < this.items.length; i++) {
            let it = this.items[i]
            if (it == null) continue
            if (it.id == null) it.id = 'item_' + i
            if (it.caption != null) {
                console.log('NOTICE: toolbar item.caption property is deprecated, please use item.text. Item -> ', it)
            }
            if (it.hint != null) {
                console.log('NOTICE: toolbar item.hint property is deprecated, please use item.tooltip. Item -> ', it)
            }
            if (it.type == 'spacer') {
                html += '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>'
            } else if (it.type == 'new-line') {
                html += '<td width="100%"></td></tr></tbody></table>'
                     + '<div class="w2ui-toolbar-new-line"></div>'
                     + '<table cellspacing="0" cellpadding="0" width="100%"><tbody><tr>'
            } else {
                html += '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                        '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+
                        '</td>'
            }
        }
        html += '<td width="100%" id="tb_'+ this.name +'_right" align="right">'+ this.right +'</td>'
        html += '</tr>'+
                '</tbody></table></div>'+
                '<div class="w2ui-scroll-left" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'left\');"></div>'+
                '<div class="w2ui-scroll-right" onclick="var el=w2ui[\''+ this.name +'\']; if (el) el.scroll(\'right\');"></div>'
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-toolbar')
            .html(html)
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // refresh all
        this.refresh()
        this.resize()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    refresh(id) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name), item: this.get(id) })
        if (edata.isCancelled === true) return
        let edata2
        // refresh all
        if (id == null) {
            for (let i = 0; i < this.items.length; i++) {
                let it1 = this.items[i]
                if (it1.id == null) it1.id = 'item_' + i
                this.refresh(it1.id)
            }
            return
        }
        // create or refresh only one item
        let it = this.get(id)
        if (it == null) return false
        if (typeof it.onRefresh == 'function') {
            edata2 = this.trigger({ phase: 'before', type: 'refresh', target: id, item: it, object: it })
            if (edata2.isCancelled === true) return
        }
        let el = $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(it.id))
        let html = this.getItemHTML(it)
        // hide tooltip
        this.tooltipHide(id, {})
        if (el.length === 0) {
            // does not exist - create it
            if (it.type == 'spacer') {
                html = '<td width="100%" id="tb_'+ this.name +'_item_'+ it.id +'" align="right"></td>'
            } else {
                html = '<td id="tb_'+ this.name + '_item_'+ it.id +'" style="'+ (it.hidden ? 'display: none' : '') +'" '+
                    '    class="'+ (it.disabled ? 'disabled' : '') +'" valign="middle">'+ html +
                    '</td>'
            }
            if (this.get(id, true) == this.items.length-1) {
                $(this.box).find('#tb_'+ this.name +'_right').before(html)
            } else {
                $(this.box).find('#tb_'+ this.name +'_item_'+ w2utils.escapeId(this.items[parseInt(this.get(id, true))+1].id)).before(html)
            }
        } else {
            if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(it.type) != -1) {
                let drop = $('#w2ui-overlay-'+ this.name)
                if (drop.length > 0) {
                    if (it.checked == false) {
                        drop[0].hide()
                    } else {
                        if (['menu', 'menu-radio', 'menu-check'].indexOf(it.type) != -1) {
                            drop.w2menu('refresh', { items: it.items })
                        }
                    }
                }
            }
            // refresh
            el.html(html)
            if (it.hidden) { el.css('display', 'none') } else { el.css('display', '') }
            if (it.disabled) { el.addClass('disabled') } else { el.removeClass('disabled') }
        }
        // event after
        if (typeof it.onRefresh == 'function') {
            this.trigger($.extend(edata2, { phase: 'after' }))
        }
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return
        // show hide overflow buttons
        let box = $(this.box)
        box.find('.w2ui-scroll-left, .w2ui-scroll-right').hide()
        let scrollBox = box.find('.w2ui-scroll-wrapper')
        if (scrollBox.find(':first').outerWidth() > scrollBox.outerWidth()) {
            // we have overflowed content
            if (scrollBox.scrollLeft() > 0) {
                box.find('.w2ui-scroll-left').show()
            }
            if (scrollBox.scrollLeft() < scrollBox.find(':first').outerWidth() - scrollBox.outerWidth()) {
                box.find('.w2ui-scroll-right').show()
            }
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('> table #tb_'+ this.name + '_right').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-toolbar')
                .html('')
        }
        $(this.box).html('')
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    // ========================================
    // --- Internal Functions
    getItemHTML(item) {
        let html = ''
        if (item.caption != null && item.text == null) item.text = item.caption // for backward compatibility
        if (item.text == null) item.text = ''
        if (item.tooltip == null && item.hint != null) item.tooltip = item.hint // for backward compatibility
        if (item.tooltip == null) item.tooltip = ''
        if (typeof item.get !== 'function' && (Array.isArray(item.items) || typeof item.items == 'function')) {
            item.get = function get(id) { // need scope, cannot be arrow func
                let tmp = item.items
                if (typeof tmp == 'function') tmp = item.items(item)
                return tmp.find(it => it.id == id ? true : false)
            }
        }
        let img = '<td>&#160;</td>'
        let text = (typeof item.text == 'function' ? item.text.call(this, item) : item.text)
        if (item.img) img = '<td><div class="w2ui-tb-image w2ui-icon '+ item.img +'"></div></td>'
        if (item.icon) {
            img = '<td><div class="w2ui-tb-image"><span class="'+
                (typeof item.icon == 'function' ? item.icon.call(this, item) : item.icon) +'"></span></div></td>'
        }
        if (html === '') switch (item.type) {
            case 'color':
            case 'text-color':
                if (typeof item.color == 'string') {
                    if (item.color.substr(0,1) == '#') item.color = item.color.substr(1)
                    if (item.color.length == 3 || item.color.length == 6) item.color = '#' + item.color
                }
                if (item.type == 'color') {
                    text = '<div style="height: 12px; width: 12px; margin-top: 1px; border: 1px solid #8A8A8A; border-radius: 1px; box-shadow: 0px 0px 1px #fff; '+
                           '        background-color: '+ (item.color != null ? item.color : '#fff') +'; float: left;"></div>'+
                           (item.text ? '<div style="margin-left: 17px;">' + w2utils.lang(item.text) + '</div>' : '')
                }
                if (item.type == 'text-color') {
                    text = '<div style="color: '+ (item.color != null ? item.color : '#444') +';">'+
                                (item.text ? w2utils.lang(item.text) : '<b>Aa</b>') +
                           '</div>'
                }
            case 'menu':
            case 'menu-check':
            case 'menu-radio':
            case 'button':
            case 'check':
            case 'radio':
            case 'drop':
                html += '<table cellpadding="0" cellspacing="0" '+
                        '       class="w2ui-button '+ (item.checked ? 'checked' : '') +' '+ (item.class ? item.class : '') +'" '+
                        '       onclick     = "var el=w2ui[\''+ this.name + '\']; if (el) el.click(\''+ item.id +'\', event);" '+
                        '       onmouseenter = "' + (!item.disabled ? 'jQuery(this).addClass(\'over\'); w2ui[\''+ this.name +'\'].tooltipShow(\''+ item.id +'\', event);' : '') + '"'+
                        '       onmouseleave = "' + (!item.disabled ? 'jQuery(this).removeClass(\'over\').removeClass(\'down\'); w2ui[\''+ this.name +'\'].tooltipHide(\''+ item.id +'\', event);' : '') + '"'+
                        '       onmousedown = "' + (!item.disabled ? 'jQuery(this).addClass(\'down\');' : '') + '"'+
                        '       onmouseup   = "' + (!item.disabled ? 'jQuery(this).removeClass(\'down\');' : '') + '"'+
                        '><tbody>'+
                        '<tr><td>'+
                        '  <table cellpadding="1" cellspacing="0"><tbody>'+
                        '  <tr>' +
                                img +
                                (text !== ''
                                    ? '<td class="w2ui-tb-text w2ui-tb-caption" nowrap="nowrap" style="'+ (item.style ? item.style : '') +'">'+ w2utils.lang(text) +'</td>'
                                    : ''
                                ) +
                                (item.count != null
                                    ? '<td class="w2ui-tb-count" nowrap="nowrap"><span>'+ item.count +'</span></td>'
                                    : ''
                                ) +
                                (((['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1) && item.arrow !== false) ?
                                    '<td class="w2ui-tb-down" nowrap="nowrap"><div></div></td>' : '') +
                        '  </tr></tbody></table>'+
                        '</td></tr></tbody></table>'
                break
            case 'break':
                html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                        '    <td><div class="w2ui-break">&#160;</div></td>'+
                        '</tr></tbody></table>'
                break
            case 'html':
                html += '<table cellpadding="0" cellspacing="0"><tbody><tr>'+
                        '    <td nowrap="nowrap">' + (typeof item.html == 'function' ? item.html.call(this, item) : item.html) + '</td>'+
                        '</tr></tbody></table>'
                break
        }
        return '<div>' + html + '</div>'
    }
    tooltipShow(id, event, forceRefresh) {
        if (this.tooltip == null) return
        let $el = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id))
        let item = this.get(id)
        let pos = this.tooltip
        let txt = item.tooltip
        if (typeof txt == 'function') txt = txt.call(this, item)
        clearTimeout(this._tooltipTimer)
        this._tooltipTimer = setTimeout(() => {
            if ($el.prop('_mouse_tooltip') !== true) {
                $el.prop('_mouse_tooltip', true)
                // show tooltip
                if (['menu', 'menu-radio', 'menu-check', 'drop', 'color', 'text-color'].indexOf(item.type) != -1 && item.checked == true) return // not for opened drop downs
                $el.w2tag(w2utils.lang(txt), { position: pos })
            }
        }, 0)
        // refresh only
        if ($el.prop('_mouse_tooltip') && forceRefresh == true) {
            $el.w2tag(w2utils.lang(txt), { position: pos })
        }
    }
    tooltipHide(id, event) {
        if (this.tooltip == null) return
        let $el = $(this.box).find('#tb_'+ this.name + '_item_'+ w2utils.escapeId(id))
        clearTimeout(this._tooltipTimer)
        setTimeout(() => {
            if ($el.prop('_mouse_tooltip') === true) {
                $el.removeProp('_mouse_tooltip')
                // hide tooltip
                $el.w2tag()
            }
        }, 1)
    }
    menuClick(event) {
        let obj = this
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: (event.remove !== true ? 'click' : 'remove'), target: event.item.id + ':' + event.subItem.id, item: event.item,
                subItem: event.subItem, originalEvent: event.originalEvent })
            if (edata.isCancelled === true) return
            // route processing
            let it = event.subItem
            let item = this.get(event.item.id)
            let items = item.items
            if (typeof items == 'function') items = item.items()
            if (item.type == 'menu-radio') {
                item.selected = it.id
                if (Array.isArray(items)) {
                    items.forEach((item) => {
                        if (item.checked === true) delete item.checked
                        if (Array.isArray(item.items)) {
                            item.items.forEach((item) => {
                                if (item.checked === true) delete item.checked
                            })
                        }
                    })
                }
                it.checked = true
            }
            if (item.type == 'menu-check') {
                if (!Array.isArray(item.selected)) item.selected = []
                if (it.group == null) {
                    let ind = item.selected.indexOf(it.id)
                    if (ind == -1) {
                        item.selected.push(it.id)
                        it.checked = true
                    } else {
                        item.selected.splice(ind, 1)
                        it.checked = false
                    }
                } else if (it.group === false) {
                    // if group is false, then it is not part of checkboxes
                } else {
                    let unchecked = [];
                    // recursive
                    (function checkNested(items) {
                        items.forEach((sub) => {
                            if (sub.group === it.group) {
                                let ind = item.selected.indexOf(sub.id)
                                if (ind != -1) {
                                    if (sub.id != it.id) unchecked.push(sub.id)
                                    item.selected.splice(ind, 1)
                                }
                            }
                            if (Array.isArray(sub.items)) checkNested(sub.items)
                        })
                    })(items)
                    let ind = item.selected.indexOf(it.id)
                    if (ind == -1) {
                        item.selected.push(it.id)
                        it.checked = true
                    }
                }
            }
            if (typeof it.route == 'string') {
                let route = it.route !== '' ? String('/'+ it.route).replace(/\/{2,}/g, '/') : ''
                let info = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), this.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            this.refresh(event.item.id)
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }
    colorClick(event) {
        let obj = this
        if (event.item && !event.item.disabled) {
            // event before
            let edata = this.trigger({ phase: 'before', type: 'click', target: event.item.id, item: event.item,
                color: event.color, final: event.final, originalEvent: event.originalEvent })
            if (edata.isCancelled === true) return
            // default behavior
            event.item.color = event.color
            obj.refresh(event.item.id)
            // event after
            this.trigger($.extend(edata, { phase: 'after' }))
        }
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - dbl click should be like it is in grid (with timer not HTML dbl click event)
*   - node.style is misleading - should be there to apply color for example
*
* == 1.5 changes
*   - node.class - ne property
*   - sb.levelPadding
*   - sb.handle (for debugger points)
*   - node.style
*   - sb.updte()
*   - node.caption - deprecated
*   - node.text - can be a function
*   - node.icon - can be a function
*   - sb.each() - iterate through each node
*   - sb.sort() - sort nodes
*   - sb.skipRefresh - no refresh during add/remove
*   - sb.tabIndex
*   - sb.search
*   == 2.0
*   - w2sidebar.node_template => w2sidebar.node
*   - show/hide, enable/disable - return array of effected items
*
************************************************************************/

class w2sidebar extends w2event {
    constructor(options) {
        super(options.name)
        this.name = null
        this.box = null
        this.sidebar = null
        this.parent = null
        this.nodes = [] // Sidebar child nodes
        this.menu = []
        this.routeData = {} // data for dynamic routes
        this.selected = null // current selected node (readonly)
        this.img = null
        this.icon = null
        this.style = ''
        this.topHTML = ''
        this.bottomHTML = ''
        this.flatButton = false
        this.keyboard = true
        this.flat = false
        this.hasFocus = false
        this.levelPadding = 12
        this.skipRefresh = false
        this.handle = { size: 0, style: '', content: '' },
        this.onClick = null // Fire when user click on Node Text
        this.onDblClick = null // Fire when user dbl clicks
        this.onContextMenu = null
        this.onMenuClick = null // when context menu item selected
        this.onExpand = null // Fire when node Expands
        this.onCollapse = null // Fire when node Colapses
        this.onKeydown = null
        this.onRender = null
        this.onRefresh = null
        this.onResize = null
        this.onDestroy = null
        this.onFocus = null
        this.onBlur = null
        this.onFlat = null
        this.node_template = {
            id: null,
            text: '',
            count: null,
            img: null,
            icon: null,
            nodes: [],
            style: '', // additional style for subitems
            route: null,
            selected: false,
            expanded: false,
            hidden: false,
            disabled: false,
            group: false, // if true, it will build as a group
            groupShowHide: true,
            collapsible: false,
            plus: false, // if true, plus will be shown even if there is no sub nodes
            // events
            onClick: null,
            onDblClick: null,
            onContextMenu: null,
            onExpand: null,
            onCollapse: null,
            // internal
            parent: null, // node object
            sidebar: null
        }
        let nodes = options.nodes
        delete options.nodes
        // mix in options
        $.extend(true, this, options)
        // add item via method to makes sure item_template is applied
        if (Array.isArray(nodes)) this.add(nodes)
    }
    add(parent, nodes) {
        if (arguments.length == 1) {
            // need to be in reverse order
            nodes = arguments[0]
            parent = this
        }
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent == null || parent == '') parent = this
        return this.insert(parent, null, nodes)
    }
    insert(parent, before, nodes) {
        let txt, ind, tmp, node, nd
        if (arguments.length == 2 && typeof parent == 'string') {
            // need to be in reverse order
            nodes = arguments[1]
            before = arguments[0]
            if (before != null) {
                ind = this.get(before)
                if (ind == null) {
                    if (!Array.isArray(nodes)) nodes = [nodes]
                    if (nodes[0].caption != null && nodes[0].text == null) {
                        console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text. Node -> ', nodes[0])
                        nodes[0].text = nodes[0].caption
                    }
                    txt = nodes[0].text
                    console.log('ERROR: Cannot insert node "'+ txt +'" because cannot find node "'+ before +'" to insert before.')
                    return null
                }
                parent = this.get(before).parent
            } else {
                parent = this
            }
        }
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent == null || parent == '') parent = this
        if (!Array.isArray(nodes)) nodes = [nodes]
        for (let o = 0; o < nodes.length; o++) {
            node = nodes[o]
            if (typeof node.id == null) {
                if (node.caption != null && node.text == null) {
                    console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text')
                    node.text = node.caption
                }
                txt = node.text
                console.log('ERROR: Cannot insert node "'+ txt +'" because it has no id.')
                continue
            }
            if (this.get(this, node.id) != null) {
                console.log('ERROR: Cannot insert node with id='+ node.id +' (text: '+ node.text + ') because another node with the same id already exists.')
                continue
            }
            tmp = Object.assign({}, this.node_template, node)
            tmp.sidebar = this
            tmp.parent = parent
            nd = tmp.nodes || []
            tmp.nodes = [] // very important to re-init empty nodes array
            if (before == null) { // append to the end
                parent.nodes.push(tmp)
            } else {
                ind = this.get(parent, before, true)
                if (ind == null) {
                    console.log('ERROR: Cannot insert node "'+ node.text +'" because cannot find node "'+ before +'" to insert before.')
                    return null
                }
                parent.nodes.splice(ind, 0, tmp)
            }
            if (nd.length > 0) {
                this.insert(tmp, null, nd)
            }
        }
        if (!this.skipRefresh) this.refresh(parent.id)
        return tmp
    }
    remove() { // multiple arguments
        let effected = 0
        let node
        Array.from(arguments).forEach(arg => {
            node = this.get(arg)
            if (node == null) return
            if (this.selected != null && this.selected === node.id) {
                this.selected = null
            }
            let ind = this.get(node.parent, arg, true)
            if (ind == null) return
            if (node.parent.nodes[ind].selected) node.sidebar.unselect(node.id)
            node.parent.nodes.splice(ind, 1)
            effected++
        })
        if (!this.skipRefresh) {
            if (effected > 0 && arguments.length == 1) this.refresh(node.parent.id); else this.refresh()
        }
        return effected
    }
    set(parent, id, node) {
        if (arguments.length == 2) {
            // need to be in reverse order
            node = id
            id = parent
            parent = this
        }
        // searches all nested nodes
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return null
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].id === id) {
                // see if quick update is possible
                let res = this.update(id, node)
                if (Object.keys(res).length != 0) {
                    // make sure nodes inserted correctly
                    let nodes = node.nodes
                    $.extend(parent.nodes[i], node, { nodes: [] })
                    if (nodes != null) {
                        this.add(parent.nodes[i], nodes)
                    }
                    if (!this.skipRefresh) this.refresh(id)
                }
                return true
            } else {
                let rv = this.set(parent.nodes[i], id, node)
                if (rv) return true
            }
        }
        return false
    }
    get(parent, id, returnIndex) { // can be just called get(id) or get(id, true)
        if (arguments.length === 0) {
            let all = []
            let tmp = this.find({})
            for (let t = 0; t < tmp.length; t++) {
                if (tmp[t].id != null) all.push(tmp[t].id)
            }
            return all
        } else {
            if (arguments.length == 1 || (arguments.length == 2 && id === true) ) {
                // need to be in reverse order
                returnIndex = id
                id = parent
                parent = this
            }
            // searches all nested nodes
            if (typeof parent == 'string') parent = this.get(parent)
            if (parent.nodes == null) return null
            for (let i = 0; i < parent.nodes.length; i++) {
                if (parent.nodes[i].id == id) {
                    if (returnIndex === true) return i; else return parent.nodes[i]
                } else {
                    let rv = this.get(parent.nodes[i], id, returnIndex)
                    if (rv || rv === 0) return rv
                }
            }
            return null
        }
    }
    find(parent, params, results) { // can be just called find({ selected: true })
        // TODO: rewrite with this.each()
        if (arguments.length == 1) {
            // need to be in reverse order
            params = parent
            parent = this
        }
        if (!results) results = []
        // searches all nested nodes
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return results
        for (let i = 0; i < parent.nodes.length; i++) {
            let match = true
            for (let prop in params) { // params is an object
                if (parent.nodes[i][prop] != params[prop]) match = false
            }
            if (match) results.push(parent.nodes[i])
            if (parent.nodes[i].nodes.length > 0) results = this.find(parent.nodes[i], params, results)
        }
        return results
    }
    sort(options, nodes) {
        // defabult options
        if (!options || typeof options != 'object') options = {}
        if (options.foldersFirst == null) options.foldersFirst = true
        if (options.caseSensitive == null) options.caseSensitive = false
        if (options.reverse == null) options.reverse = false
        if (nodes == null) {
            nodes = this.nodes
        }
        // if (nodes.length === 3) debugger
        nodes.sort((a, b) => {
            // folders first
            let isAfolder = (a.nodes && a.nodes.length > 0)
            let isBfolder = (b.nodes && b.nodes.length > 0)
            // both folder or both not folders
            if (options.foldersFirst === false || (!isAfolder && !isBfolder) || (isAfolder && isBfolder)) {
                aText = a.text
                bText = b.text
                if (!options.caseSensitive) {
                    aText = aText.toLowerCase()
                    bText = bText.toLowerCase()
                }
                if (aText == bText) return 0
                if (aText > bText) return !options.reverse ? 1 : -1
                return !options.reverse ? -1 : 1
            }
            if (isAfolder && !isBfolder) {
                return !options.reverse ? -1 : 1
            }
            if (!isAfolder && isBfolder) {
                return !options.reverse ? 1 : -1
            }
        })
        nodes.forEach(node => {
            if (node.nodes && node.nodes.length > 0) {
                this.sort(options, node.nodes)
            }
        })
    }
    each(fn, nodes) {
        if (nodes == null) nodes = this.nodes
        nodes.forEach((node) => {
            fn(node)
            if (node.nodes && node.nodes.length > 0) {
                this.each(fn, node.nodes)
            }
        })
    }
    search(str) {
        let str2 = str.toLowerCase()
        this.each((node) => {
            if (node.text.toLowerCase().indexOf(str2) === -1) {
                node.hidden = true
            } else {
                showParents(node)
                node.hidden = false
            }
        })
        this.refresh()
        $(this.box).find('#search-steps input').val(str).focus()
        function showParents(node) {
            if (node.parent) {
                node.parent.hidden = false
                showParents(node.parent)
            }
        }
    }
    show() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.hidden === false) return
            node.hidden = false
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }
    hide() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.hidden === true) return
            node.hidden = true
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }
    enable() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.disabled === false) return
            node.disabled = false
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }
    disable() { // multiple arguments
        let effected = []
        Array.from(arguments).forEach(it => {
            let node = this.get(it)
            if (node == null || node.disabled === true) return
            node.disabled = true
            if (node.selected) this.unselect(node.id)
            effected.push(node.id)
        })
        if (effected.length > 0) {
            if (arguments.length == 1) this.refresh(arguments[0]); else this.refresh()
        }
        return effected
    }
    select(id) {
        // var obj = this;
        let new_node = this.get(id)
        if (!new_node) return false
        if (this.selected == id && new_node.selected) return false
        this.unselect(this.selected)
        let $el = $(this.box).find('#node_'+ w2utils.escapeId(id))
        $el.addClass('w2ui-selected')
            .find('.w2ui-icon')
            .addClass('w2ui-icon-selected')
        if ($el.length > 0) {
            this.scrollIntoView(id, true)
        }
        new_node.selected = true
        this.selected = id
        return true
    }
    unselect(id) {
        // if no arguments provided, unselect selected node
        if (arguments.length === 0) {
            id = this.selected
        }
        let current = this.get(id)
        if (!current) return false
        current.selected = false
        $(this.box).find('#node_'+ w2utils.escapeId(id))
            .removeClass('w2ui-selected')
            .find('.w2ui-icon').removeClass('w2ui-icon-selected')
        if (this.selected == id) this.selected = null
        return true
    }
    toggle(id) {
        let nd = this.get(id)
        if (nd == null) return false
        if (nd.plus) {
            this.set(id, { plus: false })
            this.expand(id)
            this.refresh(id)
            return
        }
        if (nd.nodes.length === 0) return false
        if (!nd.collapsible) return false
        if (this.get(id).expanded) return this.collapse(id); else return this.expand(id)
    }
    collapse(id) {
        let obj = this
        let nd = this.get(id)
        if (nd == null) return false
        // event before
        let edata = this.trigger({ phase: 'before', type: 'collapse', target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideUp(200)
        $(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-expanded').removeClass('w2ui-expanded').addClass('w2ui-collapsed')
        nd.expanded = false
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        setTimeout(() => { obj.refresh(id) }, 200)
        return true
    }
    collapseAll(parent) {
        if (parent == null) parent = this
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return false
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].expanded === true) parent.nodes[i].expanded = false
            if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.collapseAll(parent.nodes[i])
        }
        this.refresh(parent.id)
        return true
    }
    expand(id) {
        let obj = this
        let nd = this.get(id)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'expand', target: id, object: nd })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).find('#node_'+ w2utils.escapeId(id) +'_sub').slideDown(200)
        $(this.box).find('#node_'+ w2utils.escapeId(id) +' .w2ui-collapsed').removeClass('w2ui-collapsed').addClass('w2ui-expanded')
        nd.expanded = true
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        setTimeout(() => { obj.refresh(id) }, 200)
        return true
    }
    expandAll(parent) {
        if (parent == null) parent = this
        if (typeof parent == 'string') parent = this.get(parent)
        if (parent.nodes == null) return false
        for (let i = 0; i < parent.nodes.length; i++) {
            if (parent.nodes[i].expanded === false) parent.nodes[i].expanded = true
            if (parent.nodes[i].nodes && parent.nodes[i].nodes.length > 0) this.expandAll(parent.nodes[i])
        }
        this.refresh(parent.id)
    }
    expandParents(id) {
        let node = this.get(id)
        if (node == null) return false
        if (node.parent) {
            if (!node.parent.expanded) {
                node.parent.expanded = true
                this.refresh(node.parent.id)
            }
            this.expandParents(node.parent.id)
        }
        return true
    }
    click(id, event) {
        let obj = this
        let nd = this.get(id)
        if (nd == null) return
        if (nd.disabled || nd.group) return // should click event if already selected
        // unselect all previsously
        $(obj.box).find('.w2ui-node.w2ui-selected').each((index, el) => {
            let oldID = $(el).attr('id').replace('node_', '')
            let oldNode = obj.get(oldID)
            if (oldNode != null) oldNode.selected = false
            $(el).removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
        })
        // select new one
        let newNode = $(obj.box).find('#node_'+ w2utils.escapeId(id))
        let oldNode = $(obj.box).find('#node_'+ w2utils.escapeId(obj.selected))
        newNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
        // need timeout to allow rendering
        setTimeout(() => {
            // event before
            let edata = obj.trigger({ phase: 'before', type: 'click', target: id, originalEvent: event, node: nd, object: nd })
            if (edata.isCancelled === true) {
                // restore selection
                newNode.removeClass('w2ui-selected').find('.w2ui-icon').removeClass('w2ui-icon-selected')
                oldNode.addClass('w2ui-selected').find('.w2ui-icon').addClass('w2ui-icon-selected')
                return
            }
            // default action
            if (oldNode != null) oldNode.selected = false
            obj.get(id).selected = true
            obj.selected = id
            // route processing
            if (typeof nd.route == 'string') {
                let route = nd.route !== '' ? String('/'+ nd.route).replace(/\/{2,}/g, '/') : ''
                let info = w2utils.parseRoute(route)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        route = route.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                    }
                }
                setTimeout(() => { window.location.hash = route }, 1)
            }
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }))
        }, 1)
    }
    focus(event) {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'focus', target: this.name, originalEvent: event })
        if (edata.isCancelled === true) return false
        // default behaviour
        this.hasFocus = true
        $(this.box).find('.w2ui-sidebar-body').addClass('w2ui-focus')
        setTimeout(() => {
            let $input = $(obj.box).find('#sidebar_'+ obj.name + '_focus')
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
        $(this.box).find('.w2ui-sidebar-body').removeClass('w2ui-focus')
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    keydown(event) {
        let obj = this
        let nd = obj.get(obj.selected)
        if (obj.keyboard !== true) return
        if (!nd) nd = obj.nodes[0]
        // trigger event
        let edata = obj.trigger({ phase: 'before', type: 'keydown', target: obj.name, originalEvent: event })
        if (edata.isCancelled === true) return
        // default behaviour
        if (event.keyCode == 13 || event.keyCode == 32) { // enter or space
            if (nd.nodes.length > 0) obj.toggle(obj.selected)
        }
        if (event.keyCode == 37) { // left
            if (nd.nodes.length > 0 && nd.expanded) {
                obj.collapse(obj.selected)
            } else {
                selectNode(nd.parent)
                if (!nd.parent.group) obj.collapse(nd.parent.id)
            }
        }
        if (event.keyCode == 39) { // right
            if ((nd.nodes.length > 0 || nd.plus) && !nd.expanded) obj.expand(obj.selected)
        }
        if (event.keyCode == 38) { // up
            if (obj.get(obj.selected) == null) {
                selectNode(this.nodes[0] || null)
            } else {
                selectNode(neighbor(nd, prev))
            }
        }
        if (event.keyCode == 40) { // down
            if (obj.get(obj.selected) == null) {
                selectNode(this.nodes[0] || null)
            } else {
                selectNode(neighbor(nd, next))
            }
        }
        // cancel event if needed
        if ($.inArray(event.keyCode, [13, 32, 37, 38, 39, 40]) != -1) {
            if (event.preventDefault) event.preventDefault()
            if (event.stopPropagation) event.stopPropagation()
        }
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
        function selectNode(node, event) {
            if (node != null && !node.hidden && !node.disabled && !node.group) {
                obj.click(node.id, event)
                setTimeout(() => { obj.scrollIntoView() }, 50)
            }
        }
        function neighbor(node, neighborFunc) {
            node = neighborFunc(node)
            while (node != null && (node.hidden || node.disabled)) {
                if (node.group) break; else node = neighborFunc(node)
            }
            return node
        }
        function next(node, noSubs) {
            if (node == null) return null
            let parent = node.parent
            let ind = obj.get(node.id, true)
            let nextNode = null
            // jump inside
            if (node.expanded && node.nodes.length > 0 && noSubs !== true) {
                let t = node.nodes[0]
                if (t.hidden || t.disabled || t.group) nextNode = next(t); else nextNode = t
            } else {
                if (parent && ind + 1 < parent.nodes.length) {
                    nextNode = parent.nodes[ind + 1]
                } else {
                    nextNode = next(parent, true) // jump to the parent
                }
            }
            if (nextNode != null && (nextNode.hidden || nextNode.disabled || nextNode.group)) nextNode = next(nextNode)
            return nextNode
        }
        function prev(node) {
            if (node == null) return null
            let parent = node.parent
            let ind = obj.get(node.id, true)
            let prevNode = (ind > 0) ? lastChild(parent.nodes[ind - 1]) : parent
            if (prevNode != null && (prevNode.hidden || prevNode.disabled || prevNode.group)) prevNode = prev(prevNode)
            return prevNode
        }
        function lastChild(node) {
            if (node.expanded && node.nodes.length > 0) {
                let t = node.nodes[node.nodes.length - 1]
                if (t.hidden || t.disabled || t.group) return prev(t); else return lastChild(t)
            }
            return node
        }
    }
    scrollIntoView(id, instant) {
        if (id == null) id = this.selected
        let nd = this.get(id)
        if (nd == null) return
        let body = $(this.box).find('.w2ui-sidebar-body')
        let item = $(this.box).find('#node_'+ w2utils.escapeId(id))
        let offset = item.offset().top - body.offset().top
        if (offset + item.height() > body.height() || offset <= 0) {
            body.animate({ 'scrollTop': body.scrollTop() + offset - body.height() / 2 + item.height() }, instant ? 0 : 250, 'linear')
        }
    }
    dblClick(id, event) {
        let nd = this.get(id)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'dblClick', target: id, originalEvent: event, object: nd })
        if (edata.isCancelled === true) return
        // default action
        this.toggle(id)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    contextMenu(id, event) {
        let obj = this
        let nd = obj.get(id)
        if (id != obj.selected) obj.click(id)
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'contextMenu', target: id, originalEvent: event, object: nd, allowOnDisabled: false })
        if (edata.isCancelled === true) return
        // default action
        if (nd.disabled && !edata.allowOnDisabled) return
        if (obj.menu.length > 0) {
            $(obj.box).find('#node_'+ w2utils.escapeId(id))
                .w2menu({
                    items: obj.menu,
                    contextMenu: true,
                    originalEvent: event,
                    onSelect(event) {
                        obj.menuClick(id, parseInt(event.index), event.originalEvent)
                    }
                }
                )
        }
        // cancel event
        if (event.preventDefault) event.preventDefault()
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
    }
    menuClick(itemId, index, event) {
        let obj = this
        // event before
        let edata = obj.trigger({ phase: 'before', type: 'menuClick', target: itemId, originalEvent: event, menuIndex: index, menuItem: obj.menu[index] })
        if (edata.isCancelled === true) return
        // default action
        // -- empty
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
    }
    goFlat() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'flat', goFlat: !this.flat })
        if (edata.isCancelled === true) return
        // default action
        this.flat = !this.flat
        this.refresh()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    render(box) {
        let time = (new Date()).getTime()
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box })
        if (edata.isCancelled === true) return
        // default action
        if (box != null) {
            if ($(this.box).find('> div > div.w2ui-sidebar-body').length > 0) {
                $(this.box)
                    .removeAttr('name')
                    .removeClass('w2ui-reset w2ui-sidebar')
                    .html('')
            }
            this.box = box
        }
        if (!this.box) return
        $(this.box)
            .attr('name', this.name)
            .addClass('w2ui-reset w2ui-sidebar')
            .html('<div>'+
                    '<input id="sidebar_'+ this.name +'_focus" '+ (this.tabIndex ? 'tabindex="' + this.tabIndex + '"' : '') +
                    '   style="position: absolute; top: 0; right: 0; width: 1px; z-index: -1; opacity: 0" '+ (w2utils.isIOS ? 'readonly' : '') +'/>'+
                    '<div class="w2ui-sidebar-top"></div>' +
                    '<div class="w2ui-sidebar-body"></div>'+
                    '<div class="w2ui-sidebar-bottom"></div>'+
                '</div>'
            )
        $(this.box).find('> div').css({
            width  : $(this.box).width() + 'px',
            height : $(this.box).height() + 'px'
        })
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // adjust top and bottom
        let flatHTML = ''
        if (this.flatButton == true) {
            flatHTML = '<div class="w2ui-flat-'+ (this.flat ? 'right' : 'left') +'" onclick="w2ui[\''+ this.name +'\'].goFlat()"></div>'
        }
        if (this.topHTML !== '' || flatHTML !== '') {
            $(this.box).find('.w2ui-sidebar-top').html(this.topHTML + flatHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px')
        }
        if (this.bottomHTML !== '') {
            $(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px')
        }
        // focus
        let kbd_timer
        $(this.box).find('#sidebar_'+ this.name + '_focus')
            .on('focus', function(event) {
                clearTimeout(kbd_timer)
                if (!obj.hasFocus) obj.focus(event)
            })
            .on('blur', function(event) {
                kbd_timer = setTimeout(() => {
                    if (obj.hasFocus) { obj.blur(event) }
                }, 100)
            })
            .on('keydown', function(event) {
                if (event.keyCode != 9) { // not tab
                    w2ui[obj.name].keydown.call(w2ui[obj.name], event)
                }
            })
        $(this.box).off('mousedown').on('mousedown', function(event) {
            // set focus to grid
            setTimeout(() => {
                // if input then do not focus
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(event.target.tagName.toUpperCase()) == -1) {
                    let $input = $(obj.box).find('#sidebar_'+ obj.name + '_focus')
                    if (!$input.is(':focus')) {
                        if ($(event.target).hasClass('w2ui-node')) {
                            let top = $(event.target).position().top + $(obj.box).find('.w2ui-sidebar-top').height() + event.offsetY
                            $input.css({ top: top + 'px', left: '0px' })
                        }
                        $input.focus()
                    }
                }
            }, 1)
        })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // ---
        this.refresh()
        return (new Date()).getTime() - time
    }
    update(id, options) {
        // quick function to refresh just this item (not sub nodes)
        //  - icon, class, style, text, count
        let nd = this.get(id)
        let level
        if (nd) {
            let $el = $(this.box).find('#node_'+ w2utils.escapeId(nd.id))
            if (nd.group) {
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-group-text').replaceWith(typeof nd.text == 'function'
                        ? nd.text.call(this, nd)
                        : '<span class="w2ui-group-text">'+ nd.text +'</span>')
                    delete options.text
                }
                if (options.class) {
                    nd.class = options.class
                    level = $el.data('level')
                    $el[0].className = 'w2ui-node-group w2ui-level-'+ level +(nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.style) {
                    nd.style = options.style
                    $el.next()[0].style = nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;')
                    delete options.style
                }
            } else {
                if (options.icon) {
                    let $img = $el.find('.w2ui-node-image > span')
                    if ($img.length > 0) {
                        nd.icon = options.icon
                        $img[0].className = (typeof nd.icon == 'function' ? nd.icon.call(this, nd) : nd.icon)
                        delete options.icon
                    }
                }
                if (options.count) {
                    nd.count = options.count
                    $el.find('.w2ui-node-count').html(nd.count)
                    if ($el.find('.w2ui-node-count').length > 0) delete options.count
                }
                if (options.class && $el.length > 0) {
                    nd.class = options.class
                    level = $el.data('level')
                    $el[0].className = 'w2ui-node w2ui-level-'+ level + (nd.selected ? ' w2ui-selected' : '') + (nd.disabled ? ' w2ui-disabled' : '') + (nd.class ? ' ' + nd.class : '')
                    delete options.class
                }
                if (options.text) {
                    nd.text = options.text
                    $el.find('.w2ui-node-text').html(typeof nd.text == 'function' ? nd.text.call(this, nd) : nd.text)
                    delete options.text
                }
                if (options.style && $el.length > 0) {
                    let $txt = $el.find('.w2ui-node-text')
                    nd.style = options.style
                    $txt[0].style = nd.style
                    delete options.style
                }
            }
        }
        // return what was not set
        return options
    }
    refresh(id) {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'refresh', target: (id != null ? id : this.name),
            fullRefresh: (id != null ? false : true) })
        if (edata.isCancelled === true) return
        // adjust top and bottom
        let flatHTML = ''
        if (this.flatButton == true) {
            flatHTML = '<div class="w2ui-flat-'+ (this.flat ? 'right' : 'left') +'" onclick="w2ui[\''+ this.name +'\'].goFlat()"></div>'
        }
        if (this.topHTML !== '' || flatHTML !== '') {
            $(this.box).find('.w2ui-sidebar-top').html(this.topHTML + flatHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('top', $(this.box).find('.w2ui-sidebar-top').height() + 'px')
        }
        if (this.bottomHTML !== '') {
            $(this.box).find('.w2ui-sidebar-bottom').html(this.bottomHTML)
            $(this.box).find('.w2ui-sidebar-body')
                .css('bottom', $(this.box).find('.w2ui-sidebar-bottom').height() + 'px')
        }
        // default action
        $(this.box).find('> div').removeClass('w2ui-sidebar-flat').addClass(this.flat ? 'w2ui-sidebar-flat' : '').css({
            width : $(this.box).width() + 'px',
            height: $(this.box).height() + 'px'
        })
        // if no parent - reset nodes
        if (this.nodes.length > 0 && this.nodes[0].parent == null) {
            let tmp = this.nodes
            this.nodes = []
            this.add(this, tmp)
        }
        let obj = this
        let node, nd
        let nm
        if (id == null) {
            node = this
            nm = '.w2ui-sidebar-body'
        } else {
            node = this.get(id)
            if (node == null) return
            nm = '#node_'+ w2utils.escapeId(node.id) + '_sub'
        }
        let nodeHTML
        if (node !== this) {
            let tmp = '#node_'+ w2utils.escapeId(node.id)
            nodeHTML = getNodeHTML(node)
            $(this.box).find(tmp).before('<div id="sidebar_'+ this.name + '_tmp"></div>')
            $(this.box).find(tmp).remove()
            $(this.box).find(nm).remove()
            $('#sidebar_'+ this.name + '_tmp').before(nodeHTML)
            $('#sidebar_'+ this.name + '_tmp').remove()
        }
        // remember scroll position
        let scroll = {
            top: $(this.box).find(nm).scrollTop(),
            left: $(this.box).find(nm).scrollLeft()
        }
        // refresh sub nodes
        $(this.box).find(nm).html('')
        for (let i = 0; i < node.nodes.length; i++) {
            nd = node.nodes[i]
            nodeHTML = getNodeHTML(nd)
            $(this.box).find(nm).append(nodeHTML)
            if (nd.nodes.length !== 0) {
                this.refresh(nd.id)
            } else {
                // trigger event
                let edata2 = this.trigger({ phase: 'before', type: 'refresh', target: nd.id })
                if (edata2.isCancelled === true) return
                // event after
                this.trigger($.extend(edata2, { phase: 'after' }))
            }
        }
        // reset scroll
        $(this.box).find(nm).scrollLeft(scroll.left).scrollTop(scroll.top)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
        function getNodeHTML(nd) {
            let html = ''
            let img = nd.img
            let icon = nd.icon
            if (icon == null && img == null) {
                if (icon == null) icon = obj.icon
                if (img == null) img = obj.img
            }
            // -- find out level
            let tmp = nd.parent
            let level = 0
            while (tmp && tmp.parent != null) {
                // if (tmp.group) level--;
                tmp = tmp.parent
                level++
            }
            if (nd.caption != null && nd.text == null) nd.text = nd.caption
            if (nd.caption != null) {
                console.log('NOTICE: sidebar node.caption property is deprecated, please use node.text. Node -> ', nd)
                nd.text = nd.caption
            }
            if (Array.isArray(nd.nodes) && nd.nodes.length > 0) nd.collapsible = true
            if (nd.group) {
                html =
                    '<div class="w2ui-node-group w2ui-level-'+ level + (nd.class ? ' ' + nd.class : '') +'" id="node_'+ nd.id +'" data-level="'+ level + '"'+
                    '   style="'+ (nd.hidden ? 'display: none' : '') +'" onclick="w2ui[\''+ obj.name +'\'].toggle(\''+ nd.id +'\')"'+
                    '   oncontextmenu="w2ui[\''+ obj.name +'\'].contextMenu(\''+ nd.id +'\', event);"'+
                    '   onmouseout="jQuery(this).find(\'span:nth-child(1)\').css(\'color\', \'transparent\')" '+
                    '   onmouseover="jQuery(this).find(\'span:nth-child(1)\').css(\'color\', \'inherit\')">'+
                    ((nd.groupShowHide && nd.collapsible) ? '<span>'+ (!nd.hidden && nd.expanded ? w2utils.lang('Hide') : w2utils.lang('Show')) +'</span>' : '<span></span>') +
                    (typeof nd.text == 'function' ? nd.text.call(obj, nd) : '<span class="w2ui-group-text">'+ nd.text +'</span>') +
                    '</div>'+
                    '<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>'
                if (obj.flat) {
                    html = '<div class="w2ui-node-group" id="node_'+ nd.id +'"><span>&#160;</span></div>'+
                           '<div id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>'
                }
            } else {
                if (nd.selected && !nd.disabled) obj.selected = nd.id
                tmp = ''
                if (img) tmp = '<div class="w2ui-node-image w2ui-icon '+ img + (nd.selected && !nd.disabled ? ' w2ui-icon-selected' : '') +'"></div>'
                if (icon) {
                    tmp = '<div class="w2ui-node-image"><span class="' + (typeof icon == 'function' ? icon.call(obj, nd) : icon) + '"></span></div>'
                }
                let text = nd.text
                let expand = ''
                let counts = (nd.count != null ? '<div class="w2ui-node-count">'+ nd.count +'</div>' : '')
                if (nd.collapsible === true) {
                    expand = '<div class="w2ui-' + (nd.expanded ? 'expanded' : 'collapsed') + '"><span></span></div>'
                }
                if (typeof nd.text == 'function') text = nd.text.call(obj, nd)
                html = '<div class="w2ui-node w2ui-level-'+ level + (nd.selected ? ' w2ui-selected' : '') + (nd.disabled ? ' w2ui-disabled' : '') + (nd.class ? ' ' + nd.class : '') +'"'+
                        '    id="node_'+ nd.id +'" data-level="'+ level +'" style="position: relative; '+ (nd.hidden ? 'display: none;' : '') +'"'+
                        '    ondblclick="w2ui[\''+ obj.name +'\'].dblClick(\''+ nd.id +'\', event);"'+
                        '    oncontextmenu="w2ui[\''+ obj.name +'\'].contextMenu(\''+ nd.id +'\', event);"'+
                        '    onClick="w2ui[\''+ obj.name +'\'].click(\''+ nd.id +'\', event); ">'+
                        (obj.handle.content
                            ? '<div class="w2ui-node-handle" style="width: '+ obj.handle.size +'px; '+ obj.handle.style + '">'+
                                   obj.handle.content +
                              '</div>'
                            : ''
                        ) +
                        '   <div class="w2ui-node-data" style="margin-left:'+ (level * obj.levelPadding + obj.handle.size) +'px">'+
                                expand + tmp + counts +
                                '<div class="w2ui-node-text w2ui-node-caption" style="'+ (nd.style || '') +'">'+ text +'</div>'+
                        '   </div>'+
                        '</div>'+
                        '<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>'
                if (obj.flat) {
                    html = '<div class="w2ui-node w2ui-level-'+ level +' '+ (nd.selected ? 'w2ui-selected' : '') +' '+ (nd.disabled ? 'w2ui-disabled' : '') + (nd.class ? ' ' + nd.class : '') +'" id="node_'+ nd.id +'" style="'+ (nd.hidden ? 'display: none;' : '') +'"'+
                            '    onmouseover="jQuery(this).find(\'.w2ui-node-data\').w2tag(w2utils.base64decode(\''+
                                            w2utils.base64encode(text + (nd.count || nd.count === 0 ? ' - <span class="w2ui-node-count">'+ nd.count +'</span>' : '')) + '\'), '+
                            '               { id: \'' + nd.id + '\', left: -5 })"'+
                            '    onmouseout="jQuery(this).find(\'.w2ui-node-data\').w2tag(null, { id: \'' + nd.id + '\' })"'+
                            '    ondblclick="w2ui[\''+ obj.name +'\'].dblClick(\''+ nd.id +'\', event);"'+
                            '    oncontextmenu="w2ui[\''+ obj.name +'\'].contextMenu(\''+ nd.id +'\', event);"'+
                            '    onClick="w2ui[\''+ obj.name +'\'].click(\''+ nd.id +'\', event); ">'+
                            '<div class="w2ui-node-data w2ui-node-flat">'+ tmp +'</div>'+
                            '</div>'+
                            '<div class="w2ui-node-sub" id="node_'+ nd.id +'_sub" style="'+ nd.style +';'+ (!nd.hidden && nd.expanded ? '' : 'display: none;') +'"></div>'
                }
            }
            return html
        }
    }
    resize() {
        let time = (new Date()).getTime()
        // event before
        let edata = this.trigger({ phase: 'before', type: 'resize', target: this.name })
        if (edata.isCancelled === true) return
        // default action
        $(this.box).css('overflow', 'hidden') // container should have no overflow
        $(this.box).find('> div').css({
            width  : $(this.box).width() + 'px',
            height : $(this.box).height() + 'px'
        })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return (new Date()).getTime() - time
    }
    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', type: 'destroy', target: this.name })
        if (edata.isCancelled === true) return
        // clean up
        if ($(this.box).find('> div > div.w2ui-sidebar-body').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-sidebar')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this.box)
        w2utils.lock.apply(window, args)
    }
    unlock(speed) {
        w2utils.unlock(this.box, speed)
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils
*
* == TODO ==
*   - upload (regular files)
*   - BUG with prefix/postfix and arrows (test in different contexts)
*   - multiple date selection
*   - month selection, year selections
*   - arrows no longer work (for int)
*   - form to support custom types
*   - rewrite suffix and prefix positioning with translateY()
*   - prefix and suffix are slow (100ms or so)
*   - MultiSelect - Allow Copy/Paste for single and multi values
*   - add routeData to list/enum
*   - for type: list -> read value from attr('value')
*   - ENUM, LIST: should have same as grid (limit, offset, search, sort)
*   - ENUM, LIST: should support wild chars
*   - add selection of predefined times (used for appointments)
*   - options.items - can be an array
*   - options.msgSearch - message to search for user
*   - options.msgNoItems - can be a function
*   - normmenu - remove, it is in w2utils now
*   == 2.0
*
************************************************************************/

let custom = {}
function addType(type, handler) {
    type = String(type).toLowerCase()
    custom[type] = handler
    return true
}
function removeType(type) {
    type = String(type).toLowerCase()
    if (!custom[type]) return false
    delete custom[type]
    return true
}
/* To Define CUSTOM field types

addType('myType', (options) => {
    $(this.el).on('keypress', function(event) {
        if (event.metaKey || event.ctrlKey || event.altKey
            || (event.charCode != event.keyCode && event.keyCode > 0)) return;
        let ch = String.fromCharCode(event.charCode);
        if (ch != 'a' && ch != 'b' && ch != 'c') {
            if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true;
            return false;
        }
    });
    $(this.el).on('blur', function(event)  { // keyCode & charCode differ in FireFox
        let ch = this.value;
        if (ch != 'a' && ch != 'b' && ch != 'c') {
            $(this).w2tag(w2utils.lang("Not a single character from the set of 'abc'"));
        }
    });
})
*/
class w2field extends w2event {
    constructor(type, options) {
        super()
        // sanitazation
        if (typeof type == 'string' && options == null) {
            options = { type: type }
        }
        if (typeof type == 'object' && options == null) {
            options = $.extend(true, {}, type)
        }
        if (typeof type == 'string' && options == 'object') {
            options.type = type
        }
        options.type = String(options.type).toLowerCase()
        this.options = options
        this.el = null
        this.helpers = {} // object or helper elements
        this.type = options.type || 'text'
        this.options = $.extend(true, {}, options)
        this.onSearch = options.onSearch || null
        this.onRequest = options.onRequest || null
        this.onLoad = options.onLoad || null
        this.onError = options.onError || null
        this.onClick = options.onClick || null
        this.onAdd = options.onAdd || null
        this.onNew = options.onNew || null
        this.onRemove = options.onRemove || null
        this.onMouseOver = options.onMouseOver || null
        this.onMouseOut = options.onMouseOut || null
        this.onIconClick = options.onIconClick || null
        this.onScroll = options.onScroll || null
        this.tmp = {} // temp object
        // clean up some options
        delete this.options.type
        delete this.options.onSearch
        delete this.options.onRequest
        delete this.options.onLoad
        delete this.options.onError
        delete this.options.onClick
        delete this.options.onMouseOver
        delete this.options.onMouseOut
        delete this.options.onIconClick
        delete this.options.onScroll
    }
    render(el) {
        if ($(el).length == 0) {
            console.log('ERROR: Cannot init w2field on empty set')
            return
        }
        this.el = $(el)[0]
        this.init()
    }
    init() {
        let obj = this
        let options = this.options
        let defaults
        // Custom Types
        if (typeof custom[this.type] === 'function') {
            custom[this.type].call(this, options)
            return
        }
        // only for INPUT or TEXTAREA
        if (['INPUT', 'TEXTAREA'].indexOf(this.el.tagName.toUpperCase()) == -1) {
            console.log('ERROR: w2field could only be applied to INPUT or TEXTAREA.', this.el)
            return
        }
        switch (this.type) {
            case 'text':
            case 'int':
            case 'float':
            case 'money':
            case 'currency':
            case 'percent':
            case 'alphanumeric':
            case 'bin':
            case 'hex':
                defaults = {
                    min                : null,
                    max                : null,
                    step               : 1,
                    autoFormat         : true,
                    currencyPrefix     : w2utils.settings.currencyPrefix,
                    currencySuffix     : w2utils.settings.currencySuffix,
                    currencyPrecision  : w2utils.settings.currencyPrecision,
                    decimalSymbol      : w2utils.settings.decimalSymbol,
                    groupSymbol        : w2utils.settings.groupSymbol,
                    arrows             : false,
                    keyboard           : true,
                    precision          : null,
                    silent             : true,
                    prefix             : '',
                    suffix             : ''
                }
                this.options = $.extend(true, {}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                options.numberRE = new RegExp('['+ options.groupSymbol + ']', 'g')
                options.moneyRE = new RegExp('['+ options.currencyPrefix + options.currencySuffix + options.groupSymbol +']', 'g')
                options.percentRE = new RegExp('['+ options.groupSymbol + '%]', 'g')
                // no keyboard support needed
                if (['text', 'alphanumeric', 'hex', 'bin'].indexOf(this.type) !== -1) {
                    options.arrows = false
                    options.keyboard = false
                }
                this.addPrefix() // only will add if needed
                this.addSuffix()
                break
            case 'color':
                defaults = {
                    prefix      : '',
                    suffix      : '<div style="width: '+ (parseInt($(this.el).css('font-size')) || 12) +'px">&#160;</div>',
                    arrows      : false,
                    keyboard    : false,
                    advanced    : null, // open advanced by default
                    transparent : true
                }
                this.options = $.extend(true, {}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                this.addPrefix() // only will add if needed
                this.addSuffix() // only will add if needed
                // additional checks
                if ($(this.el).val() !== '') setTimeout(() => { obj.change() }, 1)
                break
            case 'date':
                defaults = {
                    format       : w2utils.settings.dateFormat, // date format
                    keyboard     : true,
                    silent       : true,
                    start        : '', // string or jquery object
                    end          : '', // string or jquery object
                    blocked      : {}, // { '4/11/2011': 'yes' }
                    colored      : {}, // { '4/11/2011': 'red:white' }
                    blockWeekDays : null // array of numbers of weekday to block
                }
                this.options = $.extend(true, {}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.format)
                break
            case 'time':
                defaults = {
                    format    : w2utils.settings.timeFormat,
                    keyboard  : true,
                    silent    : true,
                    start     : '',
                    end       : '',
                    noMinutes : false
                }
                this.options = $.extend(true, {}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.format)
                break
            case 'datetime':
                defaults = {
                    format      : w2utils.settings.dateFormat + ' | ' + w2utils.settings.timeFormat,
                    keyboard    : true,
                    silent      : true,
                    start       : '', // string or jquery object or Date object
                    end         : '', // string or jquery object or Date object
                    blocked     : [], // [ '4/11/2011', '4/12/2011' ] or [ new Date(2011, 4, 11), new Date(2011, 4, 12) ]
                    colored     : {}, // { '12/17/2014': 'blue:green', '12/18/2014': 'gray:white'  }; // key has to be formatted with w2utils.settings.dateFormat
                    placeholder : null, // optional. will fall back to this.format if not specified. Only used if this.el has no placeholder attribute.
                    btn_now     : true, // show/hide the use-current-date-and-time button
                    noMinutes   : false
                }
                this.options = $.extend(true, {}, defaults, options)
                options = this.options // since object is re-created, need to re-assign
                if ($(this.el).attr('placeholder') == null) $(this.el).attr('placeholder', options.placeholder || options.format)
                break
            case 'list':
            case 'combo':
                defaults = {
                    items           : [],
                    selected        : {},
                    url             : null, // url to pull data from
                    recId           : null, // map retrieved data from url to id, can be string or function
                    recText         : null, // map retrieved data from url to text, can be string or function
                    method          : null, // default comes from w2utils.settings.dataType
                    interval        : 350, // number of ms to wait before sending server call on search
                    postData        : {},
                    minLength       : 1, // min number of chars when trigger search
                    cacheMax        : 250,
                    maxDropHeight   : 350, // max height for drop down menu
                    maxDropWidth    : null, // if null then auto set
                    minDropWidth    : null, // if null then auto set
                    match           : 'begins', // ['contains', 'is', 'begins', 'ends']
                    silent          : true,
                    icon            : null,
                    iconStyle       : '',
                    align           : 'both', // same width as control
                    altRows         : true, // alternate row color
                    onSearch        : null, // when search needs to be performed
                    onRequest       : null, // when request is submitted
                    onLoad          : null, // when data is received
                    onError         : null, // when data fails to load due to server error or other failure modes
                    onIconClick     : null,
                    renderDrop      : null, // render function for drop down item
                    compare         : null, // compare function for filtering
                    filter          : true, // weather to filter at all
                    prefix          : '',
                    suffix          : '',
                    openOnFocus     : false, // if to show overlay onclick or when typing
                    markSearch      : false
                }
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                // need to be first
                options.items = w2utils.normMenu.call(this, options.items)
                if (this.type === 'list') {
                    // defaults.search = (options.items && options.items.length >= 10 ? true : false);
                    defaults.openOnFocus = true
                    $(this.el).addClass('w2ui-select')
                    // if simple value - look it up
                    if (!$.isPlainObject(options.selected) && Array.isArray(options.items)) {
                        for (let i = 0; i< options.items.length; i++) {
                            let item = options.items[i]
                            if (item && item.id === options.selected) {
                                options.selected = $.extend(true, {}, item)
                                break
                            }
                        }
                    }
                    this.watchSize()
                }
                options = $.extend({}, defaults, options)
                this.options = options
                if (!$.isPlainObject(options.selected)) options.selected = {}
                $(this.el).data('selected', options.selected)
                if (options.url) {
                    options.items = []
                    this.request(0)
                }
                if (this.type === 'list') this.addFocus()
                this.addPrefix()
                this.addSuffix()
                setTimeout(() => { obj.refresh() }, 10) // need this for icon refresh
                $(this.el)
                    .attr('autocapitalize', 'off')
                    .attr('autocomplete', 'off')
                    .attr('autocorrect', 'off')
                    .attr('spellcheck', 'false')
                if (options.selected.text != null) $(this.el).val(options.selected.text)
                break
            case 'enum':
                defaults = {
                    items           : [],
                    selected        : [],
                    max             : 0, // max number of selected items, 0 - unlim
                    url             : null, // not implemented
                    recId           : null, // map retrieved data from url to id, can be string or function
                    recText         : null, // map retrieved data from url to text, can be string or function
                    interval        : 350, // number of ms to wait before sending server call on search
                    method          : null, // default comes from w2utils.settings.dataType
                    postData        : {},
                    minLength       : 1, // min number of chars when trigger search
                    cacheMax        : 250,
                    maxWidth        : 250, // max width for a single item
                    maxHeight       : 350, // max height for input control to grow
                    maxDropHeight   : 350, // max height for drop down menu
                    maxDropWidth    : null, // if null then auto set
                    match           : 'contains', // ['contains', 'is', 'begins', 'ends']
                    silent          : true,
                    align           : 'both', // same width as control
                    altRows         : true, // alternate row color
                    openOnFocus     : false, // if to show overlay onclick or when typing
                    markSearch      : true,
                    renderDrop      : null, // render function for drop down item
                    renderItem      : null, // render selected item
                    compare         : null, // compare function for filtering
                    filter          : true, // alias for compare
                    style           : '', // style for container div
                    onSearch        : null, // when search needs to be performed
                    onRequest       : null, // when request is submitted
                    onLoad          : null, // when data is received
                    onError         : null, // when data fails to load due to server error or other failure modes
                    onClick         : null, // when an item is clicked
                    onAdd           : null, // when an item is added
                    onNew           : null, // when new item should be added
                    onRemove        : null, // when an item is removed
                    onMouseOver     : null, // when an item is mouse over
                    onMouseOut      : null, // when an item is mouse out
                    onScroll        : null // when div with selected items is scrolled
                }
                options = $.extend({}, defaults, options, { suffix: '' })
                if (typeof options.items == 'function') {
                    options._items_fun = options.items
                }
                options.items = w2utils.normMenu.call(this, options.items)
                options.selected = w2utils.normMenu.call(this, options.selected)
                this.options = options
                if (!Array.isArray(options.selected)) options.selected = []
                $(this.el).data('selected', options.selected)
                if (options.url) {
                    options.items = []
                    this.request(0)
                }
                this.addSuffix()
                this.addMulti()
                this.watchSize()
                break
            case 'file':
                defaults = {
                    selected      : [],
                    max           : 0,
                    maxSize       : 0, // max size of all files, 0 - unlim
                    maxFileSize   : 0, // max size of a single file, 0 -unlim
                    maxWidth      : 250, // max width for a single item
                    maxHeight     : 350, // max height for input control to grow
                    maxDropHeight : 350, // max height for drop down menu
                    maxDropWidth  : null, // if null then auto set
                    readContent   : true, // if true, it will readAsDataURL content of the file
                    silent        : true,
                    align         : 'both', // same width as control
                    altRows       : true, // alternate row color
                    renderItem    : null, // render selected item
                    style         : '', // style for container div
                    onClick       : null, // when an item is clicked
                    onAdd         : null, // when an item is added
                    onRemove      : null, // when an item is removed
                    onMouseOver   : null, // when an item is mouse over
                    onMouseOut    : null // when an item is mouse out
                }
                options = $.extend({}, defaults, options)
                this.options = options
                if (!Array.isArray(options.selected)) options.selected = []
                $(this.el).data('selected', options.selected)
                if ($(this.el).attr('placeholder') == null) {
                    $(this.el).attr('placeholder', w2utils.lang('Attach files by dragging and dropping or Click to Select'))
                }
                this.addMulti()
                this.watchSize()
                break
        }
        // attach events
        this.tmp = {
            onChange    (event) { obj.change.call(obj, event) },
            onClick     (event) { obj.click.call(obj, event) },
            onFocus     (event) { obj.focus.call(obj, event) },
            onBlur      (event) { obj.blur.call(obj, event) },
            onKeydown   (event) { obj.keyDown.call(obj, event) },
            onKeyup     (event) { obj.keyUp.call(obj, event) },
            onKeypress  (event) { obj.keyPress.call(obj, event) }
        }
        $(this.el)
            .addClass('w2field w2ui-input')
            .data('w2field', this)
            .on('change.w2field', this.tmp.onChange)
            .on('click.w2field', this.tmp.onClick) // ignore click because it messes overlays
            .on('focus.w2field', this.tmp.onFocus)
            .on('blur.w2field', this.tmp.onBlur)
            .on('keydown.w2field', this.tmp.onKeydown)
            .on('keyup.w2field', this.tmp.onKeyup)
            .on('keypress.w2field', this.tmp.onKeypress)
            .css(w2utils.cssPrefix('box-sizing', 'border-box'))
        // format initial value
        this.change($.Event('change'))
    }
    watchSize() {
        let obj = this
        let tmp = $(obj.el).data('tmp') || {}
        tmp.sizeTimer = setInterval(() => {
            if ($(obj.el).parents('body').length > 0) {
                obj.resize()
            } else {
                clearInterval(tmp.sizeTimer)
            }
        }, 200)
        $(obj.el).data('tmp', tmp)
    }
    get() {
        let ret
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            ret = $(this.el).data('selected')
        } else {
            ret = $(this.el).val()
        }
        return ret
    }
    set(val, append) {
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            if (this.type !== 'list' && append) {
                if ($(this.el).data('selected') == null) $(this.el).data('selected', [])
                $(this.el).data('selected').push(val)
                $(this.el).trigger('input').change()
            } else {
                let it = (this.type === 'enum' ? [val] : val)
                $(this.el).data('selected', it).trigger('input').change()
            }
            this.refresh()
        } else {
            $(this.el).val(val)
        }
    }
    setIndex(ind, append) {
        if (['list', 'enum'].indexOf(this.type) !== -1) {
            let items = this.options.items
            if (items && items[ind]) {
                if (this.type !== 'list' && append) {
                    if ($(this.el).data('selected') == null) $(this.el).data('selected', [])
                    $(this.el).data('selected').push(items[ind])
                    $(this.el).trigger('input').change()
                } else {
                    let it = (this.type === 'enum' ? [items[ind]] : items[ind])
                    $(this.el).data('selected', it).trigger('input').change()
                }
                this.refresh()
                return true
            }
        }
        return false
    }
    clear() {
        let options = this.options
        // if money then clear value
        if (['money', 'currency'].indexOf(this.type) !== -1) {
            $(this.el).val($(this.el).val().replace(options.moneyRE, ''))
        }
        if (this.type === 'percent') {
            $(this.el).val($(this.el).val().replace(/%/g, ''))
        }
        if (this.type === 'list') {
            $(this.el).removeClass('w2ui-select')
        }
        this.type = 'clear'
        let tmp = $(this.el).data('tmp')
        if (!this.tmp) return
        // restore paddings
        if (tmp != null) {
            $(this.el).height('auto')
            if (tmp && tmp['old-padding-left']) $(this.el).css('padding-left', tmp['old-padding-left'])
            if (tmp && tmp['old-padding-right']) $(this.el).css('padding-right', tmp['old-padding-right'])
            if (tmp && tmp['old-background-color']) $(this.el).css('background-color', tmp['old-background-color'])
            if (tmp && tmp['old-border-color']) $(this.el).css('border-color', tmp['old-border-color'])
            // remove resize watcher
            clearInterval(tmp.sizeTimer)
        }
        // remove events and (data)
        $(this.el)
            .val(this.clean($(this.el).val()))
            .removeClass('w2field')
            .removeData() // removes all attached data
            .off('.w2field') // remove only events added by w2field
        // remove helpers
        for (let h in this.helpers) $(this.helpers[h]).remove()
        this.helpers = {}
    }
    refresh() {
        let obj = this
        let options = this.options
        let selected = $(this.el).data('selected')
        let time = (new Date()).getTime()
        // enum
        if (['list'].indexOf(this.type) !== -1) {
            $(obj.el).parent().css('white-space', 'nowrap') // needs this for arrow always to appear on the right side
            // hide focus and show text
            if (obj.helpers.prefix) obj.helpers.prefix.hide()
            setTimeout(() => {
                if (!obj.helpers.focus) return
                // if empty show no icon
                if (!$.isEmptyObject(selected) && options.icon) {
                    options.prefix = '<span class="w2ui-icon '+ options.icon +'"style="cursor: pointer; font-size: 14px;' +
                                     ' display: inline-block; margin-top: -1px; color: #7F98AD;'+ options.iconStyle +'">'+
                        '</span>'
                    obj.addPrefix()
                } else {
                    options.prefix = ''
                    obj.addPrefix()
                }
                // focus helper
                let focus = obj.helpers.focus.find('input')
                if ($(focus).val() === '') {
                    $(focus).css('text-indent', '-9999em').prev().css('opacity', 0)
                    $(obj.el).val(selected && selected.text != null ? w2utils.lang(selected.text) : '')
                } else {
                    $(focus).css('text-indent', 0).prev().css('opacity', 1)
                    $(obj.el).val('')
                    setTimeout(() => {
                        if (obj.helpers.prefix) obj.helpers.prefix.hide()
                        let tmp = 'position: absolute; opacity: 0; margin: 4px 0px 0px 2px; background-position: left !important;'
                        if (options.icon) {
                            $(focus).css('margin-left', '17px')
                            $(obj.helpers.focus).find('.icon-search').attr('style', tmp + 'width: 11px !important; opacity: 1; display: block')
                        } else {
                            $(focus).css('margin-left', '0px')
                            $(obj.helpers.focus).find('.icon-search').attr('style', tmp + 'width: 0px !important; opacity: 0; display: none')
                        }
                    }, 1)
                }
                // if readonly or disabled
                if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                    setTimeout(() => {
                        $(obj.helpers.prefix).css('opacity', '0.6')
                        $(obj.helpers.suffix).css('opacity', '0.6')
                    }, 1)
                } else {
                    setTimeout(() => {
                        $(obj.helpers.prefix).css('opacity', '1')
                        $(obj.helpers.suffix).css('opacity', '1')
                    }, 1)
                }
            }, 1)
        }
        if (['enum', 'file'].indexOf(this.type) !== -1) {
            let html = ''
            if (selected) {
                for (let s = 0; s < selected.length; s++) {
                    let it = selected[s]
                    let ren = ''
                    if (typeof options.renderItem === 'function') {
                        ren = options.renderItem(it, s, '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>')
                    } else {
                        ren = '<div class="w2ui-list-remove" title="'+ w2utils.lang('Remove') +'" index="'+ s +'">&#160;&#160;</div>'+
                             (obj.type === 'enum' ? it.text : it.name + '<span class="file-size"> - '+ w2utils.formatSize(it.size) +'</span>')
                    }
                    html += '<li index="'+ s +'" style="max-width: '+ parseInt(options.maxWidth) + 'px; '+ (it.style ? it.style : '') +'">'+
                           ren +'</li>'
                }
            }
            let div = obj.helpers.multi
            let ul = div.find('ul')
            div.attr('style', div.attr('style') + ';' + options.style)
            $(obj.el).css('z-index', '-1')
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) {
                setTimeout(() => {
                    div[0].scrollTop = 0 // scroll to the top
                    div.addClass('w2ui-readonly')
                        .find('li').css('opacity', '0.9')
                        .parent().find('li.nomouse').hide()
                        .find('input').prop('readonly', true)
                        .parents('ul')
                        .find('.w2ui-list-remove').hide()
                }, 1)
            } else {
                setTimeout(() => {
                    div.removeClass('w2ui-readonly')
                        .find('li').css('opacity', '1')
                        .parent().find('li.nomouse').show()
                        .find('input').prop('readonly', false)
                        .parents('ul')
                        .find('.w2ui-list-remove').show()
                }, 1)
            }
            // clean
            div.find('.w2ui-enum-placeholder').remove()
            ul.find('li').not('li.nomouse').remove()
            // add new list
            if (html !== '') {
                ul.prepend(html)
            } else if ($(obj.el).attr('placeholder') != null && div.find('input').val() === '') {
                let style =
                    'padding-top: ' + $(this.el).css('padding-top') + ';'+
                    'padding-left: ' + $(this.el).css('padding-left') + '; ' +
                    'box-sizing: ' + $(this.el).css('box-sizing') + '; ' +
                    'line-height: ' + $(this.el).css('line-height') + '; ' +
                    'font-size: ' + $(this.el).css('font-size') + '; ' +
                    'font-family: ' + $(this.el).css('font-family') + '; '
                div.prepend('<div class="w2ui-enum-placeholder" style="'+ style +'">'+ $(obj.el).attr('placeholder') +'</div>')
            }
            // ITEMS events
            div.off('scroll.w2field').on('scroll.w2field', function(event) {
                let edata = obj.trigger({ phase: 'before', type: 'scroll', target: obj.el, originalEvent: event })
                if (edata.isCancelled === true) return
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }))
            })
                .find('li')
                .data('mouse', 'out')
                .on('click', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    let item = selected[$(target).attr('index')]
                    if ($(target).hasClass('nomouse')) return
                    event.stopPropagation()
                    let edata
                    // default behavior
                    if ($(event.target).hasClass('w2ui-list-remove')) {
                        if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                        // trigger event
                        edata = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // default behavior
                        $().w2overlay()
                        selected.splice($(event.target).attr('index'), 1)
                        $(obj.el).trigger('input').trigger('change')
                        $(event.target).parent().fadeOut('fast')
                        setTimeout(() => {
                            obj.refresh()
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }, 300)
                    } else {
                        // trigger event
                        edata = obj.trigger({ phase: 'before', type: 'click', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // if file - show image preview
                        if (obj.type === 'file') {
                            let preview = ''
                            if ((/image/i).test(item.type)) { // image
                                preview = '<div style="padding: 3px;">'+
                                    '    <img src="'+ (item.content ? 'data:'+ item.type +';base64,'+ item.content : '') +'" style="max-width: 300px;" '+
                                    '        onload="var w = jQuery(this).width(); var h = jQuery(this).height(); '+
                                    '            if (w < 300 & h < 300) return; '+
                                    '            if (w >= h && w > 300) jQuery(this).width(300);'+
                                    '            if (w < h && h > 300) jQuery(this).height(300);"'+
                                    '        onerror="this.style.display = \'none\'"'+
                                    '    >'+
                                    '</div>'
                            }
                            let td1 = 'style="padding: 3px; text-align: right; color: #777;"'
                            let td2 = 'style="padding: 3px"'
                            preview += '<div style="padding: 8px;">'+
                                '    <table cellpadding="2"><tbody>'+
                                '    <tr><td '+ td1 +'>'+ w2utils.lang('Name') +':</td><td '+ td2 +'>'+ item.name +'</td></tr>'+
                                '    <tr><td '+ td1 +'>'+ w2utils.lang('Size') +':</td><td '+ td2 +'>'+ w2utils.formatSize(item.size) +'</td></tr>'+
                                '    <tr><td '+ td1 +'>'+ w2utils.lang('Type') +':</td><td '+ td2 +'>' +
                                '        <span style="width: 200px; display: block-inline; overflow: hidden; text-overflow: ellipsis; white-space: nowrap="nowrap";">'+ item.type +'</span>'+
                                '    </td></tr>'+
                                '    <tr><td '+ td1 +'>'+ w2utils.lang('Modified') +':</td><td '+ td2 +'>'+ w2utils.date(item.modified) +'</td></tr>'+
                                '    </tbody></table>'+
                                '</div>'
                            $('#w2ui-overlay').remove()
                            $(target).w2overlay(preview)
                        } // event after
                        obj.trigger($.extend(edata, { phase: 'after' }))
                    }
                })
                .on('mouseover', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    if ($(target).hasClass('nomouse')) return
                    if ($(target).data('mouse') === 'out') {
                        let item = selected[$(event.target).attr('index')]
                        // trigger event
                        let edata = obj.trigger({ phase: 'before', type: 'mouseOver', target: obj.el, originalEvent: event.originalEvent, item: item })
                        if (edata.isCancelled === true) return
                        // event after
                        obj.trigger($.extend(edata, { phase: 'after' }))
                    }
                    $(target).data('mouse', 'over')
                })
                .on('mouseout', function(event) {
                    let target = (event.target.tagName.toUpperCase() === 'LI' ? event.target : $(event.target).parents('LI'))
                    if ($(target).hasClass('nomouse')) return
                    $(target).data('mouse', 'leaving')
                    setTimeout(() => {
                        if ($(target).data('mouse') === 'leaving') {
                            $(target).data('mouse', 'out')
                            let item = selected[$(event.target).attr('index')]
                            // trigger event
                            let edata = obj.trigger({ phase: 'before', type: 'mouseOut', target: obj.el, originalEvent: event.originalEvent, item: item })
                            if (edata.isCancelled === true) return
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }
                    }, 0)
                })
            // adjust height
            $(this.el).height('auto')
            let cntHeight = $(div).find('> div.w2ui-multi-items').height() + w2utils.getSize(div, '+height') * 2
            if (cntHeight < 26) cntHeight = 26
            if (cntHeight > options.maxHeight) cntHeight = options.maxHeight
            if (div.length > 0) div[0].scrollTop = 1000
            let inpHeight = w2utils.getSize($(this.el), 'height') - 2
            if (inpHeight > cntHeight) cntHeight = inpHeight
            $(div).css({ 'height': cntHeight + 'px', overflow: (cntHeight == options.maxHeight ? 'auto' : 'hidden') })
            if (cntHeight < options.maxHeight) $(div).prop('scrollTop', 0)
            $(this.el).css({ 'height' : (cntHeight + 0) + 'px' })
            // update size
            if (obj.type === 'enum') {
                let tmp = obj.helpers.multi.find('input')
                tmp.width(((tmp.val().length + 2) * 8) + 'px')
            }
        }
        return (new Date()).getTime() - time
    }
    reset() {
        let type = this.type
        this.clear()
        this.type = type
        this.init()
    }
    // resizing width of list, enum, file controls
    resize() {
        let obj = this
        let new_width = $(obj.el).width()
        let new_height = $(obj.el).height()
        if (obj.tmp.current_width == new_width && new_height > 0) return
        let focus = this.helpers.focus
        let multi = this.helpers.multi
        let suffix = this.helpers.suffix
        let prefix = this.helpers.prefix
        // resize helpers
        if (focus) {
            focus.width($(obj.el).width())
        }
        if (multi) {
            let width = (w2utils.getSize(obj.el, 'width')
                - parseInt($(obj.el).css('margin-left'), 10)
                - parseInt($(obj.el).css('margin-right'), 10))
            $(multi).width(width)
        }
        if (suffix) {
            obj.options.suffix = '<div class="arrow-down" style="margin-top: '+ ((parseInt($(obj.el).height()) - 6) / 2) +'px;"></div>'
            obj.addSuffix()
        }
        if (prefix) {
            obj.addPrefix()
        }
        // remember width
        obj.tmp.current_width = new_width
    }
    clean(val) {
        //issue #499
        if(typeof val === 'number'){
            return val
        }
        let options = this.options
        val = String(val).trim()
        // clean
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) !== -1) {
            if (typeof val === 'string') {
                if (options.autoFormat && ['money', 'currency'].indexOf(this.type) !== -1) val = String(val).replace(options.moneyRE, '')
                if (options.autoFormat && this.type === 'percent') val = String(val).replace(options.percentRE, '')
                if (options.autoFormat && ['int', 'float'].indexOf(this.type) !== -1) val = String(val).replace(options.numberRE, '')
                val = val.replace(/\s+/g, '').replace(w2utils.settings.groupSymbol, '').replace(w2utils.settings.decimalSymbol, '.')
            }
            if (parseFloat(val) == val) {
                if (options.min != null && val < options.min) { val = options.min; $(this.el).val(options.min) }
                if (options.max != null && val > options.max) { val = options.max; $(this.el).val(options.max) }
            }
            if (val !== '' && w2utils.isFloat(val)) val = Number(val); else val = ''
        }
        return val
    }
    format(val) {
        let options = this.options
        // autoformat numbers or money
        if (options.autoFormat && val !== '') {
            switch (this.type) {
                case 'money':
                case 'currency':
                    val = w2utils.formatNumber(val, options.currencyPrecision, options.groupSymbol)
                    if (val !== '') val = options.currencyPrefix + val + options.currencySuffix
                    break
                case 'percent':
                    val = w2utils.formatNumber(val, options.precision, options.groupSymbol)
                    if (val !== '') val += '%'
                    break
                case 'float':
                    val = w2utils.formatNumber(val, options.precision, options.groupSymbol)
                    break
                case 'int':
                    val = w2utils.formatNumber(val, 0, options.groupSymbol)
                    break
            }
        }
        return val
    }
    change(event) {
        let obj = this
        let options = obj.options
        // numeric
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(this.type) !== -1) {
            // check max/min
            let val = $(this.el).val()
            let new_val = this.format(this.clean($(this.el).val()))
            // if was modified
            if (val !== '' && val != new_val) {
                $(this.el).val(new_val).trigger('input').change()
                // cancel event
                event.stopPropagation()
                event.preventDefault()
                return false
            }
        }
        // color
        if (this.type === 'color') {
            let color = $(this.el).val()
            if (color.substr(0, 3).toLowerCase() !== 'rgb') {
                color = '#' + color
                let len = $(this.el).val().length
                if (len !== 8 && len !== 6 && len !== 3) color = ''
            }
            $(this.el).next().find('div').css('background-color', color)
            if ($(this.el).hasClass('has-focus') && $(this.el).data('skipInit') !== true) {
                this.updateOverlay()
            }
        }
        // list, enum
        if (['list', 'enum', 'file'].indexOf(this.type) !== -1) {
            obj.refresh()
            // need time out to show icon indent properly
            setTimeout(() => { obj.refresh() }, 5)
        }
        // date, time
        if (['date', 'time', 'datetime'].indexOf(this.type) !== -1) {
            // convert linux timestamps
            let tmp = parseInt(obj.el.value)
            if (w2utils.isInt(obj.el.value) && tmp > 3000) {
                if (this.type === 'time') $(obj.el).val(w2utils.formatTime(new Date(tmp), options.format)).trigger('input').change()
                if (this.type === 'date') $(obj.el).val(w2utils.formatDate(new Date(tmp), options.format)).trigger('input').change()
                if (this.type === 'datetime') $(obj.el).val(w2utils.formatDateTime(new Date(tmp), options.format)).trigger('input').change()
            }
        }
    }
    click(event) {
        event.stopPropagation()
        // lists
        if (['list', 'combo', 'enum'].indexOf(this.type) !== -1) {
            if (!$(this.el).hasClass('has-focus')) this.focus(event)
        }
        // other fields with drops
        if (['date', 'time', 'color', 'datetime'].indexOf(this.type) !== -1) {
            this.updateOverlay()
        }
    }
    focus(event) {
        let obj = this
        $(obj.el).addClass('has-focus')
        // color, date, time
        if (['color', 'date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
            setTimeout(() => { obj.updateOverlay() }, 150)
        }
        // menu
        if (['list', 'combo', 'enum'].indexOf(obj.type) !== -1) {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
            obj.resize()
            setTimeout(() => {
                if (obj.type === 'list' && $(obj.el).is(':focus')) { // need to stay .is(':focus')
                    $(obj.helpers.focus).find('input').focus()
                    return
                }
                obj.search()
                setTimeout(() => { obj.updateOverlay() }, 1)
            }, 1)
            // regenerat items
            if (typeof obj.options._items_fun == 'function') {
                obj.options.items = w2utils.normMenu.call(this, obj.options._items_fun)
            }
        }
        // file
        if (obj.type === 'file') {
            $(obj.helpers.multi).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '2px' })
        }
    }
    blur(event) {
        let obj = this
        let options = obj.options
        let val = $(obj.el).val().trim()
        let $overlay = $('#w2ui-overlay')
        $(obj.el).removeClass('has-focus')
        // hide overlay
        if (['color', 'date', 'time', 'list', 'combo', 'enum', 'datetime'].indexOf(obj.type) !== -1) {
            let closeTimeout = window.setTimeout(() => {
                if ($overlay.data('keepOpen') !== true) $overlay.hide()
            }, 0)
            $('.menu', $overlay).one('focus', function() {
                clearTimeout(closeTimeout)
                $(this).one('focusout', function(event) {
                    $overlay.hide()
                })
            })
        }
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) !== -1) {
            if (val !== '' && !obj.checkType(val)) {
                $(obj.el).val('').trigger('input').change()
                if (options.silent === false) {
                    $(obj.el).w2tag('Not a valid number')
                    setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                }
            }
        }
        // date or time
        if (['date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
            // check if in range
            if (val !== '' && !obj.inRange(obj.el.value)) {
                $(obj.el).val('').removeData('selected').trigger('input').change()
                if (options.silent === false) {
                    $(obj.el).w2tag('Not in range')
                    setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                }
            } else {
                if (obj.type === 'date' && val !== '' && !w2utils.isDate(obj.el.value, options.format)) {
                    $(obj.el).val('').removeData('selected').trigger('input').change()
                    if (options.silent === false) {
                        $(obj.el).w2tag('Not a valid date')
                        setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                    }
                }
                else if (obj.type === 'time' && val !== '' && !w2utils.isTime(obj.el.value)) {
                    $(obj.el).val('').removeData('selected').trigger('input').change()
                    if (options.silent === false) {
                        $(obj.el).w2tag('Not a valid time')
                        setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                    }
                }
                else if (obj.type === 'datetime' && val !== '' && !w2utils.isDateTime(obj.el.value, options.format)) {
                    $(obj.el).val('').removeData('selected').trigger('input').change()
                    if (options.silent === false) {
                        $(obj.el).w2tag('Not a valid date')
                        setTimeout(() => { $(obj.el).w2tag('') }, 3000)
                    }
                }
            }
        }
        // clear search input
        if (obj.type === 'enum') {
            $(obj.helpers.multi).find('input').val('').width(20)
        }
        // file
        if (obj.type === 'file') {
            $(obj.helpers.multi).css({ 'outline': 'none' })
        }
    }
    keyPress(event) {
        let obj = this
        // ignore wrong pressed key
        if (['int', 'float', 'money', 'currency', 'percent', 'hex', 'bin', 'color', 'alphanumeric'].indexOf(obj.type) !== -1) {
            // keyCode & charCode differ in FireFox
            if (event.metaKey || event.ctrlKey || event.altKey || (event.charCode != event.keyCode && event.keyCode > 0)) return
            let ch = String.fromCharCode(event.charCode)
            if (!obj.checkType(ch, true) && event.keyCode != 13) {
                event.preventDefault()
                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                return false
            }
        }
        // update date popup
        if (['date', 'time', 'datetime'].indexOf(obj.type) !== -1) {
            if (event.keyCode !== 9) setTimeout(() => { obj.updateOverlay() }, 1)
        }
    }
    keyDown(event, extra) {
        let obj = this
        let options = obj.options
        let key = event.keyCode || (extra && extra.keyCode)
        let cancel = false
        let val, inc, daymil, dt, newValue, newDT
        // numeric
        if (['int', 'float', 'money', 'currency', 'percent'].indexOf(obj.type) !== -1) {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            val = parseFloat($(obj.el).val().replace(options.moneyRE, '')) || 0
            inc = options.step
            if (event.ctrlKey || event.metaKey) inc = 10
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val + inc <= options.max || options.max == null ? Number((val + inc).toFixed(12)) : options.max)
                    $(obj.el).val(newValue).trigger('input').change()
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newValue = (val - inc >= options.min || options.min == null ? Number((val - inc).toFixed(12)) : options.min)
                    $(obj.el).val(newValue).trigger('input').change()
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                }, 0)
            }
        }
        // date
        if (obj.type === 'date') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            daymil = 24*60*60*1000
            inc = 1
            if (event.ctrlKey || event.metaKey) inc = 10
            dt = w2utils.isDate($(obj.el).val(), options.format, true)
            if (!dt) { dt = new Date(); daymil = 0 }
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDate(dt.getTime() + daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').change()
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDate(dt.getTime() - daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDate(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').change()
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                    obj.updateOverlay()
                }, 0)
            }
        }
        // time
        if (obj.type === 'time') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            inc = (event.ctrlKey || event.metaKey ? 60 : 1)
            val = $(obj.el).val()
            let time = obj.toMin(val) || obj.toMin((new Date()).getHours() + ':' + ((new Date()).getMinutes() - 1))
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    time += inc
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    time -= inc
                    cancel = true
                    break
            }
            if (cancel) {
                $(obj.el).val(obj.fromMin(time)).trigger('input').change()
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                }, 0)
            }
        }
        // datetime
        if (obj.type === 'datetime') {
            if (!options.keyboard || $(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            daymil = 24*60*60*1000
            inc = 1
            if (event.ctrlKey || event.metaKey) inc = 10
            let str = $(obj.el).val()
            dt = w2utils.isDateTime(str, this.options.format, true)
            if (!dt) { dt = new Date(); daymil = 0 }
            switch (key) {
                case 38: // up
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDateTime(dt.getTime() + daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()+1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').change()
                    cancel = true
                    break
                case 40: // down
                    if (event.shiftKey) break // no action if shift key is pressed
                    newDT = w2utils.formatDateTime(dt.getTime() - daymil, options.format)
                    if (inc == 10) newDT = w2utils.formatDateTime(new Date(dt.getFullYear(), dt.getMonth()-1, dt.getDate()), options.format)
                    $(obj.el).val(newDT).trigger('input').change()
                    cancel = true
                    break
            }
            if (cancel) {
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                    obj.updateOverlay()
                }, 0)
            }
        }
        // color
        if (obj.type === 'color') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            // paste
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
                let dir = null
                let newColor = null
                switch (key) {
                    case 38: // up
                        dir = 'up'
                        break
                    case 40: // down
                        dir = 'down'
                        break
                    case 39: // right
                        dir = 'right'
                        break
                    case 37: // left
                        dir = 'left'
                        break
                }
                if (obj.el.nav && dir != null) {
                    newColor = obj.el.nav(dir)
                    $(obj.el).val(newColor).trigger('input').change()
                    event.preventDefault()
                }
            }
        }
        // list/select/combo
        if (['list', 'combo', 'enum'].indexOf(obj.type) !== -1) {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            let selected = $(obj.el).data('selected')
            let focus = $(obj.el)
            let indexOnly = false
            if (['list', 'enum'].indexOf(obj.type) !== -1) {
                if (obj.type === 'list') {
                    focus = $(obj.helpers.focus).find('input')
                }
                if (obj.type === 'enum') {
                    focus = $(obj.helpers.multi).find('input')
                }
                // not arrows - refresh
                if ([37, 38, 39, 40].indexOf(key) == -1) {
                    setTimeout(() => { obj.refresh() }, 1)
                }
                // paste
                if (event.keyCode == 86 && (event.ctrlKey || event.metaKey)) {
                    setTimeout(() => {
                        obj.refresh()
                        obj.search()
                        obj.request()
                    }, 50)
                }
            }
            // apply arrows
            switch (key) {
                case 27: // escape
                    if (obj.type === 'list') {
                        if (focus.val() !== '') focus.val('')
                        event.stopPropagation() // escape in field should not close popup
                    }
                    break
                case 37: // left
                case 39: // right
                    // indexOnly = true;
                    break
                case 13: { // enter
                    if ($('#w2ui-overlay').length === 0) break // no action if overlay not open
                    let item = options.items[options.index]
                    if (obj.type === 'enum') {
                        if (item != null) {
                            // trigger event
                            let edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: item })
                            if (edata.isCancelled === true) return
                            item = edata.item // need to reassign because it could be recreated by user
                            // default behavior
                            if (selected.length >= options.max && options.max > 0) selected.pop()
                            delete item.hidden
                            delete obj.tmp.force_open
                            selected.push(item)
                            $(obj.el).trigger('input').change()
                            focus.val('').width(20)
                            obj.refresh()
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        } else {
                            // trigger event
                            item = { id: focus.val(), text: focus.val() }
                            let edata = obj.trigger({ phase: 'before', type: 'new', target: obj.el, originalEvent: event.originalEvent, item: item })
                            if (edata.isCancelled === true) return
                            item = edata.item // need to reassign because it could be recreated by user
                            // default behavior
                            if (typeof obj.onNew === 'function') {
                                if (selected.length >= options.max && options.max > 0) selected.pop()
                                delete obj.tmp.force_open
                                selected.push(item)
                                $(obj.el).trigger('input').change()
                                focus.val('').width(20)
                                obj.refresh()
                            }
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }
                    } else {
                        if (item) $(obj.el).data('selected', item).val(item.text).trigger('input').change()
                        if ($(obj.el).val() === '' && $(obj.el).data('selected')) $(obj.el).removeData('selected').val('').trigger('input').change()
                        if (obj.type === 'list') {
                            focus.val('')
                            obj.refresh()
                        }
                        // hide overlay
                        obj.tmp.force_hide = true
                    }
                    break
                }
                case 8: // backspace
                case 46: // delete
                    if (obj.type === 'enum' && key === 8) {
                        if (focus.val() === '' && selected.length > 0) {
                            let item = selected[selected.length - 1]
                            // trigger event
                            let edata = obj.trigger({ phase: 'before', type: 'remove', target: obj.el, originalEvent: event.originalEvent, item: item })
                            if (edata.isCancelled === true) return
                            // default behavior
                            selected.pop()
                            $(obj.el).trigger('input').trigger('change')
                            obj.refresh()
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        }
                    }
                    if (obj.type === 'list' && focus.val() === '') {
                        $(obj.el).data('selected', {}).trigger('input').change()
                        obj.refresh()
                    }
                    break
                case 38: // up
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0
                    options.index--
                    while (options.index > 0 && (options.items[options.index].hidden || options.items[options.index].disabled)) options.index--
                    if (options.index === 0 && (options.items[options.index].hidden || options.items[options.index].disabled)) {
                        while (options.items[options.index] && (options.items[options.index].hidden || options.items[options.index].disabled)) options.index++
                    }
                    indexOnly = true
                    break
                case 40: // down
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : -1
                    options.index++
                    while (options.index < options.items.length-1 && (options.items[options.index].hidden || options.items[options.index].disabled)) options.index++
                    if (options.index == options.items.length-1 && (options.items[options.index].hidden || options.items[options.index].disabled)) {
                        while (options.items[options.index] && (options.items[options.index].hidden || options.items[options.index].disabled)) options.index--
                    }
                    // show overlay if not shown
                    if (focus.val() === '' && $('#w2ui-overlay').length === 0) {
                        obj.tmp.force_open = true
                    } else {
                        indexOnly = true
                    }
                    break
            }
            if (indexOnly) {
                if (options.index < 0) options.index = 0
                if (options.index >= options.items.length) options.index = options.items.length -1
                obj.updateOverlay(indexOnly)
                // cancel event
                event.preventDefault()
                setTimeout(() => {
                    // set cursor to the end
                    if (obj.type === 'enum') {
                        let tmp = focus.get(0)
                        tmp.setSelectionRange(tmp.value.length, tmp.value.length)
                    } else if (obj.type === 'list') {
                        let tmp = focus.get(0)
                        tmp.setSelectionRange(tmp.value.length, tmp.value.length)
                    } else {
                        obj.el.setSelectionRange(obj.el.value.length, obj.el.value.length)
                    }
                }, 0)
                return
            }
            // expand input
            if (obj.type === 'enum') {
                focus.width(((focus.val().length + 2) * 8) + 'px')
            }
        }
    }
    keyUp(event) {
        let obj = this
        if (['list', 'combo', 'enum'].indexOf(this.type) !== -1) {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            // need to be here for ipad compa
            if ([16, 17, 18, 20, 37, 39, 91].indexOf(event.keyCode) == -1) { // no refresh on crtl, shift, left/right arrows, etc
                let input = $(this.helpers.focus).find('input')
                if (input.length === 0) input = $(this.el) // for combo list
                // trigger event
                let edata = this.trigger({ phase: 'before', type: 'search', originalEvent: event, target: input, search: input.val() })
                if (edata.isCancelled === true) return
                // regular
                if (!this.tmp.force_hide) this.request()
                if (input.val().length == 1) this.refresh()
                if ($('#w2ui-overlay').length === 0 || [38, 40].indexOf(event.keyCode) == -1) { // no search on arrows
                    this.search()
                }
                // event after
                this.trigger($.extend(edata, { phase: 'after' }))
            }
        }
    }
    clearCache() {
        let options = this.options
        options.items = []
        this.tmp.xhr_loading = false
        this.tmp.xhr_search = ''
        this.tmp.xhr_total = -1
    }
    request(interval) {
        let obj = this
        let options = this.options
        let search = $(obj.el).val() || ''
        // if no url - do nothing
        if (!options.url) return
        // --
        if (obj.type === 'enum') {
            let tmp = $(obj.helpers.multi).find('input')
            if (tmp.length === 0) search = ''; else search = tmp.val()
        }
        if (obj.type === 'list') {
            let tmp = $(obj.helpers.focus).find('input')
            if (tmp.length === 0) search = ''; else search = tmp.val()
        }
        if (options.minLength !== 0 && search.length < options.minLength) {
            options.items = [] // need to empty the list
            this.updateOverlay()
            return
        }
        if (interval == null) interval = options.interval
        if (obj.tmp.xhr_search == null) obj.tmp.xhr_search = ''
        if (obj.tmp.xhr_total == null) obj.tmp.xhr_total = -1
        // check if need to search
        if (options.url && $(obj.el).prop('readonly') !== true && $(obj.el).prop('disabled') !== true && (
            (options.items.length === 0 && obj.tmp.xhr_total !== 0) ||
                (obj.tmp.xhr_total == options.cacheMax && search.length > obj.tmp.xhr_search.length) ||
                (search.length >= obj.tmp.xhr_search.length && search.substr(0, obj.tmp.xhr_search.length) !== obj.tmp.xhr_search) ||
                (search.length < obj.tmp.xhr_search.length)
        )) {
            // empty list
            if (obj.tmp.xhr) try { obj.tmp.xhr.abort() } catch (e) {}
            obj.tmp.xhr_loading = true
            obj.search()
            // timeout
            clearTimeout(obj.tmp.timeout)
            obj.tmp.timeout = setTimeout(() => {
                // trigger event
                let url = options.url
                let postData = {
                    search : search,
                    max    : options.cacheMax
                }
                $.extend(postData, options.postData)
                let edata = obj.trigger({ phase: 'before', type: 'request', search: search, target: obj.el, url: url, postData: postData })
                if (edata.isCancelled === true) return
                url = edata.url
                postData = edata.postData
                let ajaxOptions = {
                    type     : 'GET',
                    url      : url,
                    data     : postData,
                    dataType : 'JSON' // expected from server
                }
                if (options.method) ajaxOptions.type = options.method
                if (w2utils.settings.dataType === 'JSON') {
                    ajaxOptions.type = 'POST'
                    ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                    ajaxOptions.contentType = 'application/json'
                }
                if (w2utils.settings.dataType === 'HTTPJSON') {
                    ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                }
                if (options.method != null) ajaxOptions.type = options.method
                obj.tmp.xhr = $.ajax(ajaxOptions)
                    .done((data, status, xhr) => {
                        // trigger event
                        let edata2 = obj.trigger({ phase: 'before', type: 'load', target: obj.el, search: postData.search, data: data, xhr: xhr })
                        if (edata2.isCancelled === true) return
                        // default behavior
                        data = edata2.data
                        if (typeof data === 'string') data = JSON.parse(data)
                        if (data.records == null && data.items != null) {
                            // needed for backward compatibility
                            data.records = data.items
                            delete data.items
                        }
                        if (data.status === 'success' && data.records == null) { data.records = [] } // handles Golang marshal of empty arrays to null
                        if (data.status !== 'success' || !Array.isArray(data.records)) {
                            console.log('ERROR: server did not return proper structure. It should return', { status: 'success', records: [{ id: 1, text: 'item' }] })
                            return
                        }
                        // remove all extra items if more then needed for cache
                        if (data.records.length > options.cacheMax) data.records.splice(options.cacheMax, 100000)
                        // map id and text
                        if (options.recId == null && options.recid != null) options.recId = options.recid // since lower-case recid is used in grid
                        if (options.recId || options.recText) {
                            data.records.forEach((item) => {
                                if (typeof options.recId === 'string') item.id = item[options.recId]
                                if (typeof options.recId === 'function') item.id = options.recId(item)
                                if (typeof options.recText === 'string') item.text = item[options.recText]
                                if (typeof options.recText === 'function') item.text = options.recText(item)
                            })
                        }
                        // remember stats
                        obj.tmp.xhr_loading = false
                        obj.tmp.xhr_search = search
                        obj.tmp.xhr_total = data.records.length
                        obj.tmp.lastError = ''
                        options.items = obj.normMenu(data.records)
                        if (search === '' && data.records.length === 0) obj.tmp.emptySet = true; else obj.tmp.emptySet = false
                        // preset item
                        let find_selected = $(obj.el).data('find_selected')
                        if (find_selected) {
                            let sel
                            if (Array.isArray(find_selected)) {
                                sel = []
                                find_selected.forEach((find) => {
                                    let isFound = false
                                    options.items.forEach((item) => {
                                        if (item.id == find || (find && find.id == item.id)) {
                                            sel.push($.extend(true, {}, item))
                                            isFound = true
                                        }
                                    })
                                    if (!isFound) sel.push(find)
                                })
                            } else {
                                sel = find_selected
                                options.items.forEach((item) => {
                                    if (item.id == find_selected || (find_selected && find_selected.id == item.id)) {
                                        sel = item
                                    }
                                })
                            }
                            $(obj.el).data('selected', sel).removeData('find_selected').trigger('input').change()
                        }
                        obj.search()
                        // event after
                        obj.trigger($.extend(edata2, { phase: 'after' }))
                    })
                    .fail((xhr, status, error) => {
                        // trigger event
                        let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                        let edata2 = obj.trigger({ phase: 'before', type: 'error', target: obj.el, search: search, error: errorObj, xhr: xhr })
                        if (edata2.isCancelled === true) return
                        // default behavior
                        if (status !== 'abort') {
                            let data
                            try { data = $.parseJSON(xhr.responseText) } catch (e) {}
                            console.log('ERROR: Server communication failed.',
                                '\n   EXPECTED:', { status: 'success', records: [{ id: 1, text: 'item' }] },
                                '\n         OR:', { status: 'error', message: 'error message' },
                                '\n   RECEIVED:', typeof data === 'object' ? data : xhr.responseText)
                        }
                        // reset stats
                        obj.tmp.xhr_loading = false
                        obj.tmp.xhr_search = search
                        obj.tmp.xhr_total = 0
                        obj.tmp.emptySet = true
                        obj.tmp.lastError = (edata2.error || 'Server communication failed')
                        options.items = []
                        obj.clearCache()
                        obj.search()
                        obj.updateOverlay(false)
                        // event after
                        obj.trigger($.extend(edata2, { phase: 'after' }))
                    })
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }))
            }, interval)
        }
    }
    search() {
        let obj = this
        let options = this.options
        let search = $(obj.el).val()
        let target = obj.el
        let ids = []
        let selected = $(obj.el).data('selected')
        if (obj.type === 'enum') {
            target = $(obj.helpers.multi).find('input')
            search = target.val()
            for (let s in selected) { if (selected[s]) ids.push(selected[s].id) }
        }
        else if (obj.type === 'list') {
            target = $(obj.helpers.focus).find('input')
            search = target.val()
            for (let s in selected) { if (selected[s]) ids.push(selected[s].id) }
        }
        let items = options.items
        if (obj.tmp.xhr_loading !== true) {
            let shown = 0
            for (let i = 0; i < items.length; i++) {
                let item = items[i]
                if (options.compare != null) {
                    if (typeof options.compare === 'function') {
                        item.hidden = (options.compare.call(this, item, search) === false ? true : false)
                    }
                } else {
                    let prefix = ''
                    let suffix = ''
                    if (['is', 'begins'].indexOf(options.match) !== -1) prefix = '^'
                    if (['is', 'ends'].indexOf(options.match) !== -1) suffix = '$'
                    try {
                        let re = new RegExp(prefix + search + suffix, 'i')
                        if (re.test(item.text) || item.text === '...') item.hidden = false; else item.hidden = true
                    } catch (e) {}
                }
                if (options.filter === false) item.hidden = false
                // do not show selected items
                if (obj.type === 'enum' && $.inArray(item.id, ids) !== -1) item.hidden = true
                if (item.hidden !== true) { shown++; delete item.hidden }
            }
            // preselect first item
            options.index = -1
            while (items[options.index] && items[options.index].hidden) options.index++
            if (shown <= 0) options.index = -1
            options.spinner = false
            obj.updateOverlay()
            setTimeout(() => {
                let html = $('#w2ui-overlay').html() || ''
                if (options.markSearch && html.indexOf('$.fn.w2menuHandler') !== -1) { // do not highlight when no items
                    $('#w2ui-overlay').w2marker(search)
                }
            }, 1)
        } else {
            items.splice(0, options.cacheMax)
            options.spinner = true
            obj.updateOverlay()
        }
    }
    updateOverlay(indexOnly) {
        let obj = this
        let options = this.options
        let month, year, dt, params
        // color
        if (this.type === 'color') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            $(this.el).w2color({
                color       : $(this.el).val(),
                transparent : options.transparent,
                advanced    : options.advanced
            },
            (color) => {
                if (color == null) return
                $(obj.el).val(color).trigger('input').change()
            })
        }
        // date
        if (this.type === 'date') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar"></div>', {
                    css: { 'background-color': '#f5f5f5' },
                    onShow(event) {
                        // this needed for IE 11 compatibility
                        if (w2utils.isIE) {
                            $('.w2ui-calendar').on('mousedown', function(event) {
                                let $tg = $(event.target)
                                if ($tg.length === 1 && $tg[0].id === 'w2ui-jump-year') {
                                    $('#w2ui-overlay').data('keepOpen', true)
                                }
                            })
                        }
                    }
                })
            }
            dt = w2utils.isDate($(obj.el).val(), obj.options.format, true)
            if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear() }
            (function refreshCalendar(month, year) {
                if (!month && !year) {
                    let dt = new Date()
                    month = dt.getMonth()
                    year = dt.getFullYear()
                }
                $('#w2ui-overlay > div > div').html(obj.getMonthHTML(month, year, $(obj.el).val()))
                $('#w2ui-overlay .w2ui-calendar-title')
                    .on('mousedown', function() {
                        if ($(this).next().hasClass('w2ui-calendar-jump')) {
                            $(this).next().remove()
                        } else {
                            let selYear, selMonth
                            $(this).after('<div class="w2ui-calendar-jump" style=""></div>')
                            $(this).next().hide().html(obj.getYearHTML()).fadeIn(200)
                            setTimeout(() => {
                                $('#w2ui-overlay .w2ui-calendar-jump')
                                    .find('.w2ui-jump-month, .w2ui-jump-year')
                                    .on('dblclick', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selMonth == null) selMonth = month
                                        if (selYear == null) selYear = year
                                        $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                        setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                    })
                                    .on('click', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selYear != null && selMonth != null) {
                                            $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                            setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                        }
                                    })
                                $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000)
                            }, 1)
                        }
                    })
                $('#w2ui-overlay .w2ui-date')
                    .on('mousedown', function() {
                        let day = $(this).attr('date')
                        $(obj.el).val(day).trigger('input').change()
                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                    })
                    .on('mouseup', function() {
                        setTimeout(() => {
                            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                        }, 10)
                    })
                $('#w2ui-overlay .previous').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0] = parseInt(tmp[0]) - 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                $('#w2ui-overlay .next').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0] = parseInt(tmp[0]) + 1
                    refreshCalendar(tmp[0], tmp[1])
                })
            })(month, year)
        }
        // time
        if (this.type === 'time') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time" onclick="event.stopPropagation();"></div>', {
                    css: { 'background-color': '#fff' }
                })
            }
            let h24 = (this.options.format === 'h24')
            $('#w2ui-overlay > div').html(obj.getHourHTML())
            $('#w2ui-overlay .w2ui-time')
                .on('mousedown', function(event) {
                    $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                    let hour = $(this).attr('hour')
                    $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').change()
                })
            if (this.options.noMinutes == null || this.options.noMinutes === false) {
                $('#w2ui-overlay .w2ui-time')
                    .on('mouseup', function() {
                        let hour = $(this).attr('hour')
                        if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                        $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                        $('#w2ui-overlay > div').html(obj.getMinHTML(hour))
                        $('#w2ui-overlay .w2ui-time')
                            .on('mousedown', function() {
                                $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                let min = $(this).attr('min')
                                $(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').change()
                            })
                            .on('mouseup', function() {
                                setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                            })
                    })
            } else {
                $('#w2ui-overlay .w2ui-time')
                    .on('mouseup', function() {
                        setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                    })
            }
        }
        // datetime
        if (this.type === 'datetime') {
            if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
            // hide overlay if we are in the time selection
            if ($('#w2ui-overlay .w2ui-time').length > 0) $('#w2ui-overlay')[0].hide()
            if ($('#w2ui-overlay').length === 0) {
                $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar" onclick="event.stopPropagation();"></div>', {
                    css: { 'background-color': '#f5f5f5' },
                    onShow(event) {
                        // this needed for IE 11 compatibility
                        if (w2utils.isIE) {
                            $('.w2ui-calendar').on('mousedown', function(event) {
                                let $tg = $(event.target)
                                if ($tg.length === 1 && $tg[0].id === 'w2ui-jump-year') {
                                    $('#w2ui-overlay').data('keepOpen', true)
                                }
                            })
                        }
                    }
                })
            }
            dt = w2utils.isDateTime($(obj.el).val(), obj.options.format, true)
            if (dt) { month = dt.getMonth() + 1; year = dt.getFullYear() }
            let selDate = null;
            (function refreshCalendar(month, year) {
                $('#w2ui-overlay > div > div').html(
                    obj.getMonthHTML(month, year, $(obj.el).val())
                    + (options.btn_now ? '<div class="w2ui-calendar-now now">'+ w2utils.lang('Current Date & Time') + '</div>' : '')
                )
                $('#w2ui-overlay .w2ui-calendar-title')
                    .on('mousedown', function() {
                        if ($(this).next().hasClass('w2ui-calendar-jump')) {
                            $(this).next().remove()
                        } else {
                            let selYear, selMonth
                            $(this).after('<div class="w2ui-calendar-jump" style=""></div>')
                            $(this).next().hide().html(obj.getYearHTML()).fadeIn(200)
                            setTimeout(() => {
                                $('#w2ui-overlay .w2ui-calendar-jump')
                                    .find('.w2ui-jump-month, .w2ui-jump-year')
                                    .on('click', function() {
                                        if ($(this).hasClass('w2ui-jump-month')) {
                                            $(this).parent().find('.w2ui-jump-month').removeClass('selected')
                                            $(this).addClass('selected')
                                            selMonth = $(this).attr('name')
                                        }
                                        if ($(this).hasClass('w2ui-jump-year')) {
                                            $(this).parent().find('.w2ui-jump-year').removeClass('selected')
                                            $(this).addClass('selected')
                                            selYear = $(this).attr('name')
                                        }
                                        if (selYear != null && selMonth != null) {
                                            $('#w2ui-overlay .w2ui-calendar-jump').fadeOut(100)
                                            setTimeout(() => { refreshCalendar(parseInt(selMonth)+1, selYear) }, 100)
                                        }
                                    })
                                $('#w2ui-overlay .w2ui-calendar-jump >:last-child').prop('scrollTop', 2000)
                            }, 1)
                        }
                    })
                $('#w2ui-overlay .w2ui-date')
                    .on('mousedown', function() {
                        let day = $(this).attr('date')
                        $(obj.el).val(day).trigger('input').change()
                        $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                        selDate = new Date($(this).attr('data-date'))
                    })
                    .on('mouseup', function() {
                        // continue with time picker
                        let selHour, selMin
                        if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                        $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                        // let h24 = (obj.options.format === 'h24')
                        $('#w2ui-overlay > div').html(obj.getHourHTML())
                        $('#w2ui-overlay .w2ui-time')
                            .on('mousedown', function(event) {
                                $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                selHour = $(this).attr('hour')
                                selDate.setHours(selHour)
                                let txt = w2utils.formatDateTime(selDate, obj.options.format)
                                $(obj.el).val(txt).trigger('input').change()
                                //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':00' + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').change();
                            })
                        if (obj.options.noMinutes == null || obj.options.noMinutes === false) {
                            $('#w2ui-overlay .w2ui-time')
                                .on('mouseup', function() {
                                    let hour = $(this).attr('hour')
                                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                                    $(obj.el).w2overlay('<div class="w2ui-reset w2ui-calendar-time"></div>', { css: { 'background-color': '#fff' } })
                                    $('#w2ui-overlay > div').html(obj.getMinHTML(hour))
                                    $('#w2ui-overlay .w2ui-time')
                                        .on('mousedown', function() {
                                            $(this).css({ 'background-color': '#B6D5FB', 'border-color': '#aaa' })
                                            selMin = $(this).attr('min')
                                            selDate.setHours(selHour, selMin)
                                            let txt = w2utils.formatDateTime(selDate, obj.options.format)
                                            $(obj.el).val(txt).trigger('input').change()
                                            //$(obj.el).val((hour > 12 && !h24 ? hour - 12 : hour) + ':' + (min < 10 ? 0 : '') + min + (!h24 ? (hour < 12 ? ' am' : ' pm') : '')).trigger('input').change();
                                        })
                                        .on('mouseup', function() {
                                            setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                                        })
                                })
                        } else {
                            $('#w2ui-overlay .w2ui-time')
                                .on('mouseup', function() {
                                    setTimeout(() => { if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide() }, 10)
                                })
                        }
                    })
                $('#w2ui-overlay .previous').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0] = parseInt(tmp[0]) - 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                $('#w2ui-overlay .next').on('mousedown', function() {
                    let tmp = obj.options.current.split('/')
                    tmp[0] = parseInt(tmp[0]) + 1
                    refreshCalendar(tmp[0], tmp[1])
                })
                // "now" button
                $('#w2ui-overlay .now')
                    .on('mousedown', function() {
                        // this currently ignores blocked days or start / end dates!
                        let tmp = w2utils.formatDateTime(new Date(), obj.options.format)
                        $(obj.el).val(tmp).trigger('input').change()
                        return false
                    })
                    .on('mouseup', function() {
                        setTimeout(() => {
                            if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                        }, 10)
                    })
            })(month, year)
        }
        // list
        if (['list', 'combo', 'enum'].indexOf(this.type) !== -1) {
            let el = this.el
            let input = this.el
            if (this.type === 'enum') {
                el = $(this.helpers.multi)
                input = $(el).find('input')
            }
            if (this.type === 'list') {
                let sel = $(input).data('selected')
                if ($.isPlainObject(sel) && !$.isEmptyObject(sel) && options.index == -1) {
                    options.items.forEach((item, ind) => {
                        if (item.id === sel.id) {
                            options.index = ind
                        }
                    })
                }
                input = $(this.helpers.focus).find('input')
            }
            if ($(this.el).hasClass('has-focus')) {
                if (options.openOnFocus === false && $(input).val() === '' && obj.tmp.force_open !== true) {
                    $().w2overlay()
                    return
                }
                if (obj.tmp.force_hide) {
                    $().w2overlay()
                    setTimeout(() => {
                        delete obj.tmp.force_hide
                    }, 1)
                    return
                }
                if ($(input).val() !== '') delete obj.tmp.force_open
                let msgNoItems = w2utils.lang('No matches')
                if (options.url != null && String($(input).val()).length < options.minLength && obj.tmp.emptySet !== true) {
                    msgNoItems = options.minLength + ' ' + w2utils.lang('letters or more...')
                }
                if (options.url != null && $(input).val() === '' && obj.tmp.emptySet !== true) {
                    msgNoItems = w2utils.lang(options.msgSearch || 'Type to search...')
                }
                if (options.url == null && options.items.length === 0) msgNoItems = w2utils.lang('Empty list')
                if (options.msgNoItems != null) {
                    let eventData = {
                        search: $(input).val(),
                        options: $.extend(true, {}, options)
                    }
                    if (options.url) {
                        eventData.remote = {
                            url: options.url,
                            empty: obj.tmp.emptySet ? true : false,
                            error: obj.tmp.lastError,
                            minLength: options.minLength
                        }
                    }
                    msgNoItems = (typeof options.msgNoItems === 'function'
                        ? options.msgNoItems(eventData)
                        : options.msgNoItems)
                }
                if (obj.tmp.lastError) {
                    msgNoItems = obj.tmp.lastError
                }
                if (msgNoItems) {
                    msgNoItems = '<div style="white-space: normal; line-height: 1.3">' + msgNoItems + '</div>'
                }
                params = $.extend(true, {}, options, {
                    search     : false,
                    render     : options.renderDrop,
                    maxHeight  : options.maxDropHeight,
                    maxWidth   : options.maxDropWidth,
                    minWidth   : options.minDropWidth,
                    msgNoItems : msgNoItems,
                    // selected with mouse
                    onSelect(event) {
                        if (obj.type === 'enum') {
                            let selected = $(obj.el).data('selected')
                            if (event.item) {
                                // trigger event
                                let edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, originalEvent: event.originalEvent, item: event.item })
                                if (edata.isCancelled === true) return
                                // default behavior
                                if (selected.length >= options.max && options.max > 0) selected.pop()
                                delete event.item.hidden
                                selected.push(event.item)
                                $(obj.el).data('selected', selected).trigger('input').change()
                                $(obj.helpers.multi).find('input').val('').width(20)
                                obj.refresh()
                                if (event.keepOpen !== true) {
                                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay')[0].hide()
                                } else {
                                    let ind
                                    params.items.forEach((item, i) => { if (item.id == event.item.id) ind = i })
                                    if (ind != null) params.items.splice(ind, 1)
                                    params.selected = selected
                                    $(el).w2menu('refresh', params)
                                }
                                // event after
                                obj.trigger($.extend(edata, { phase: 'after' }))
                            }
                        } else {
                            $(obj.el).data('selected', event.item).val(event.item.text).trigger('input').change()
                            if (obj.helpers.focus) obj.helpers.focus.find('input').val('')
                        }
                    }
                })
                $(el).w2menu((!indexOnly ? 'refresh' : 'refresh-index'), params)
            }
        }
    }
    inRange(str, onlyDate) {
        let inRange = false
        if (this.type === 'date') {
            let dt = w2utils.isDate(str, this.options.format, true)
            if (dt) {
                // enable range
                if (this.options.start || this.options.end) {
                    let st = (typeof this.options.start === 'string' ? this.options.start : $(this.options.start).val())
                    let en = (typeof this.options.end === 'string' ? this.options.end : $(this.options.end).val())
                    let start = w2utils.isDate(st, this.options.format, true)
                    let end = w2utils.isDate(en, this.options.format, true)
                    let current = new Date(dt)
                    if (!start) start = current
                    if (!end) end = current
                    if (current >= start && current <= end) inRange = true
                } else {
                    inRange = true
                }
                // block predefined dates
                if (this.options.blocked && $.inArray(str, this.options.blocked) !== -1) inRange = false
                /*
                clockWeekDay - type: array or integers. every element - number of week day.
                number of weekday (1 - monday, 2 - tuesday, 3 - wensday, 4 - thursday, 5 - friday, 6 - saturday, 0 - sunday)
                for block in calendar (for example, block all sundays so user can't choose sunday in calendar)
                */
                if (this.options.blockWeekDays !== null && this.options.blockWeekDays !== undefined
                    && this.options.blockWeekDays.length != undefined){
                    let l = this.options.blockWeekDays.length
                    for (let i=0; i<l; i++){
                        if (dt.getDay() == this.options.blockWeekDays[i]){
                            inRange = false
                        }
                    }
                }
            }
        } else if (this.type === 'time') {
            if (this.options.start || this.options.end) {
                let tm = this.toMin(str)
                let tm1 = this.toMin(this.options.start)
                let tm2 = this.toMin(this.options.end)
                if (!tm1) tm1 = tm
                if (!tm2) tm2 = tm
                if (tm >= tm1 && tm <= tm2) inRange = true
            } else {
                inRange = true
            }
        } else if (this.type === 'datetime') {
            let dt = w2utils.isDateTime(str, this.options.format, true)
            if (dt) {
                // enable range
                if (this.options.start || this.options.end) {
                    let start, end
                    if (typeof this.options.start === 'object' && this.options.start instanceof Date) {
                        start = this.options.start
                    } else {
                        let st = (typeof this.options.start === 'string' ? this.options.start : $(this.options.start).val())
                        if (st.trim() !== '') {
                            start = w2utils.isDateTime(st, this.options.format, true)
                        } else {
                            start = ''
                        }
                    }
                    if (typeof this.options.end === 'object' && this.options.end instanceof Date) {
                        end = this.options.end
                    } else {
                        let en = (typeof this.options.end === 'string' ? this.options.end : $(this.options.end).val())
                        if (en.trim() !== '') {
                            end = w2utils.isDateTime(en, this.options.format, true)
                        } else {
                            end = ''
                        }
                    }
                    let current = dt // new Date(dt);
                    if (!start) start = current
                    if (!end) end = current
                    if (onlyDate && start instanceof Date) {
                        start.setHours(0)
                        start.setMinutes(0)
                        start.setSeconds(0)
                    }
                    if (current >= start && current <= end) inRange = true
                } else {
                    inRange = true
                }
                // block predefined dates
                if (inRange && this.options.blocked) {
                    for (let i=0; i<this.options.blocked.length; i++) {
                        let blocked = this.options.blocked[i]
                        if(typeof blocked === 'string') {
                            // convert string to Date object
                            blocked = w2utils.isDateTime(blocked, this.options.format, true)
                        }
                        // check for Date object with the same day
                        if(typeof blocked === 'object' && blocked instanceof Date && (blocked.getFullYear() == dt.getFullYear() && blocked.getMonth() == dt.getMonth() && blocked.getDate() == dt.getDate())) {
                            inRange = false
                            break
                        }
                    }
                }
            }
        }
        return inRange
    }
    /*
    *  INTERNAL FUNCTIONS
    */
    checkType(ch, loose) {
        let obj = this
        switch (obj.type) {
            case 'int':
                if (loose && ['-', obj.options.groupSymbol].indexOf(ch) !== -1) return true
                return w2utils.isInt(ch.replace(obj.options.numberRE, ''))
            case 'percent':
                ch = ch.replace(/%/g, '')
            case 'float':
                if (loose && ['-', w2utils.settings.decimalSymbol, obj.options.groupSymbol].indexOf(ch) !== -1) return true
                return w2utils.isFloat(ch.replace(obj.options.numberRE, ''))
            case 'money':
            case 'currency':
                if (loose && ['-', obj.options.decimalSymbol, obj.options.groupSymbol, obj.options.currencyPrefix, obj.options.currencySuffix].indexOf(ch) !== -1) return true
                return w2utils.isFloat(ch.replace(obj.options.moneyRE, ''))
            case 'bin':
                return w2utils.isBin(ch)
            case 'hex':
                return w2utils.isHex(ch)
            case 'alphanumeric':
                return w2utils.isAlphaNumeric(ch)
        }
        return true
    }
    addPrefix() {
        let obj = this
        setTimeout(() => {
            if (obj.type === 'clear') return
            let helper
            let tmp = $(obj.el).data('tmp') || {}
            if (tmp['old-padding-left']) $(obj.el).css('padding-left', tmp['old-padding-left'])
            tmp['old-padding-left'] = $(obj.el).css('padding-left')
            $(obj.el).data('tmp', tmp)
            // remove if already displayed
            if (obj.helpers.prefix) $(obj.helpers.prefix).remove()
            if (obj.options.prefix !== '') {
                // add fresh
                $(obj.el).before(
                    '<div class="w2ui-field-helper">'+
                        obj.options.prefix +
                    '</div>'
                )
                helper = $(obj.el).prev()
                helper
                    .css({
                        'color'          : $(obj.el).css('color'),
                        'font-family'    : $(obj.el).css('font-family'),
                        'font-size'      : $(obj.el).css('font-size'),
                        'padding-top'    : $(obj.el).css('padding-top'),
                        'padding-bottom' : $(obj.el).css('padding-bottom'),
                        'padding-left'   : $(obj.el).css('padding-left'),
                        'padding-right'  : 0,
                        'margin-top'     : (parseInt($(obj.el).css('margin-top'), 10) + 2) + 'px',
                        'margin-bottom'  : (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px',
                        'margin-left'    : $(obj.el).css('margin-left'),
                        'margin-right'   : 0
                    })
                    .on('click', function(event) {
                        if (obj.options.icon && typeof obj.onIconClick === 'function') {
                            // event before
                            let edata = obj.trigger({ phase: 'before', type: 'iconClick', target: obj.el, el: $(this).find('span.w2ui-icon')[0] })
                            if (edata.isCancelled === true) return
                            // intentionally empty
                            // event after
                            obj.trigger($.extend(edata, { phase: 'after' }))
                        } else {
                            if (obj.type === 'list') {
                                $(obj.helpers.focus).find('input').focus()
                            } else {
                                $(obj.el).focus()
                            }
                        }
                    })
                $(obj.el).css('padding-left', (helper.width() + parseInt($(obj.el).css('padding-left'), 10)) + 'px')
                // remember helper
                obj.helpers.prefix = helper
            }
        }, 1)
    }
    addSuffix() {
        let obj = this
        let helper, pr
        setTimeout(() => {
            if (obj.type === 'clear') return
            let tmp = $(obj.el).data('tmp') || {}
            if (tmp['old-padding-right']) $(obj.el).css('padding-right', tmp['old-padding-right'])
            tmp['old-padding-right'] = $(obj.el).css('padding-right')
            $(obj.el).data('tmp', tmp)
            pr = parseInt($(obj.el).css('padding-right'), 10)
            if (obj.options.arrows) {
                // remove if already displayed
                if (obj.helpers.arrows) $(obj.helpers.arrows).remove()
                // add fresh
                $(obj.el).after(
                    '<div class="w2ui-field-helper" style="border: 1px solid transparent">&#160;'+
                    '    <div class="w2ui-field-up" type="up">'+
                    '        <div class="arrow-up" type="up"></div>'+
                    '    </div>'+
                    '    <div class="w2ui-field-down" type="down">'+
                    '        <div class="arrow-down" type="down"></div>'+
                    '    </div>'+
                    '</div>')
                helper = $(obj.el).next()
                helper.css({
                    'color'         : $(obj.el).css('color'),
                    'font-family'   : $(obj.el).css('font-family'),
                    'font-size'     : $(obj.el).css('font-size'),
                    'height'        : ($(obj.el).height() + parseInt($(obj.el).css('padding-top'), 10) + parseInt($(obj.el).css('padding-bottom'), 10) ) + 'px',
                    'padding'       : 0,
                    'margin-top'    : (parseInt($(obj.el).css('margin-top'), 10) + 1) + 'px',
                    'margin-bottom' : 0,
                    'border-left'   : '1px solid silver'
                })
                    .css('margin-left', '-'+ (helper.width() + parseInt($(obj.el).css('margin-right'), 10) + 12) + 'px')
                    .on('mousedown', function(event) {
                        let body = $('body')
                        body.on('mouseup', tmp)
                        body.data('_field_update_timer', setTimeout(update, 700))
                        update(false)
                        // timer function
                        function tmp() {
                            clearTimeout(body.data('_field_update_timer'))
                            body.off('mouseup', tmp)
                        }
                        // update function
                        function update(notimer) {
                            $(obj.el).focus()
                            obj.keyDown($.Event('keydown'), {
                                keyCode : ($(event.target).attr('type') === 'up' ? 38 : 40)
                            })
                            if (notimer !== false) $('body').data('_field_update_timer', setTimeout(update, 60))
                        }
                    })
                pr += helper.width() + 12
                $(obj.el).css('padding-right', pr + 'px')
                // remember helper
                obj.helpers.arrows = helper
            }
            if (obj.options.suffix !== '') {
                // remove if already displayed
                if (obj.helpers.suffix) $(obj.helpers.suffix).remove()
                // add fresh
                $(obj.el).after(
                    '<div class="w2ui-field-helper">'+
                        obj.options.suffix +
                    '</div>')
                helper = $(obj.el).next()
                helper
                    .css({
                        'color'          : $(obj.el).css('color'),
                        'font-family'    : $(obj.el).css('font-family'),
                        'font-size'      : $(obj.el).css('font-size'),
                        'padding-top'    : $(obj.el).css('padding-top'),
                        'padding-bottom' : $(obj.el).css('padding-bottom'),
                        'padding-left'   : '3px',
                        'padding-right'  : $(obj.el).css('padding-right'),
                        'margin-top'     : (parseInt($(obj.el).css('margin-top'), 10) + 2) + 'px',
                        'margin-bottom'  : (parseInt($(obj.el).css('margin-bottom'), 10) + 1) + 'px'
                    })
                    .on('click', function(event) {
                        if (obj.type === 'list') {
                            $(obj.helpers.focus).find('input').focus()
                        } else {
                            $(obj.el).focus()
                        }
                    })
                helper.css('margin-left', '-'+ (w2utils.getSize(helper, 'width') + parseInt($(obj.el).css('margin-right'), 10) + 2) + 'px')
                pr += helper.width() + 3
                $(obj.el).css('padding-right', pr + 'px')
                // remember helper
                obj.helpers.suffix = helper
            }
        }, 1)
    }
    addFocus() {
        let obj = this
        let width = 0 // 11 - show search icon, 0 do not show
        let pholder
        // clean up & init
        $(obj.helpers.focus).remove()
        // remember original tabindex
        let tabIndex = parseInt($(obj.el).attr('tabIndex'))
        if (!isNaN(tabIndex) && tabIndex !== -1) obj.el._tabIndex = tabIndex
        if (obj.el._tabIndex) tabIndex = obj.el._tabIndex
        if (tabIndex == null) tabIndex = -1
        if (isNaN(tabIndex)) tabIndex = 0
        // if there is id, add to search with "_search"
        let searchId = ''
        if ($(obj.el).attr('id') != null) {
            searchId = 'id="' + $(obj.el).attr('id') + '_search"'
        }
        // build helper
        let html =
            '<div class="w2ui-field-helper">'+
            '    <div class="w2ui-icon icon-search" style="opacity: 0; display: none"></div>'+
            '    <input '+ searchId +' type="text" tabIndex="'+ tabIndex +'" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"/>'+
            '</div>'
        $(obj.el).attr('tabindex', -1).before(html)
        let helper = $(obj.el).prev()
        obj.helpers.focus = helper
        helper.css({
            width           : $(obj.el).width(),
            'margin-top'    : $(obj.el).css('margin-top'),
            'margin-left'   : (parseInt($(obj.el).css('margin-left')) + parseInt($(obj.el).css('padding-left'))) + 'px',
            'margin-bottom' : $(obj.el).css('margin-bottom'),
            'margin-right'  : $(obj.el).css('margin-right')
        })
            .find('input')
            .css({
                cursor   : 'default',
                width    : '100%',
                outline  : 'none',
                opacity  : 1,
                margin   : 0,
                border   : '1px solid transparent',
                padding  : $(obj.el).css('padding-top'),
                'padding-left'     : 0,
                'margin-left'      : (width > 0 ? width + 6 : 0),
                'background-color' : 'transparent'
            })
        // INPUT events
        helper.find('input')
            .on('click', function(event) {
                if ($('#w2ui-overlay').length === 0) obj.focus(event)
                event.stopPropagation()
            })
            .on('focus', function(event) {
                pholder = $(obj.el).attr('placeholder')
                $(obj.el).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '2px' })
                $(this).val('')
                $(obj.el).triggerHandler('focus')
                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
            })
            .on('blur', function(event) {
                $(obj.el).css('outline', 'none')
                $(this).val('')
                obj.refresh()
                $(obj.el).triggerHandler('blur')
                if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                if (pholder != null) $(obj.el).attr('placeholder', pholder)
            })
            .on('keydown', function(event) {
                let el = this
                obj.keyDown(event)
                setTimeout(() => {
                    if (el.value === '') $(obj.el).attr('placeholder', pholder); else $(obj.el).attr('placeholder', '')
                }, 10)
            })
            .on('keyup', function(event) { obj.keyUp(event) })
            .on('keypress', function(event) { obj.keyPress(event) })
        // MAIN div
        helper.on('click', function(event) { $(this).find('input').focus() })
        obj.refresh()
    }
    addMulti() {
        let obj = this
        // clean up & init
        $(obj.helpers.multi).remove()
        // build helper
        let html = ''
        let margin =
            'margin-top     : 0px; ' +
            'margin-bottom  : 0px; ' +
            'margin-left    : ' + $(obj.el).css('margin-left') + '; ' +
            'margin-right   : ' + $(obj.el).css('margin-right') + '; '+
            'width          : ' + (w2utils.getSize(obj.el, 'width')
                                - parseInt($(obj.el).css('margin-left'), 10)
                                - parseInt($(obj.el).css('margin-right'), 10))
                                + 'px;'
        // if there is id, add to search with "_search"
        let searchId = ''
        if ($(obj.el).attr('id') != null) {
            searchId = 'id="' + $(obj.el).attr('id') + '_search" '
        }
        if (obj.type === 'enum') {
            // remember original tabindex
            let tabIndex = $(obj.el).attr('tabIndex')
            if (tabIndex && tabIndex !== -1) obj.el._tabIndex = tabIndex
            if (obj.el._tabIndex) tabIndex = obj.el._tabIndex
            if (tabIndex == null) tabIndex = 0 // default tabindex
            html = '<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
                    '    <div style="padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">'+
                    '    <ul>'+
                    '        <li style="padding-left: 0px; padding-right: 0px" class="nomouse">'+
                    '            <input '+ searchId +' type="text" style="width: 20px; margin: -3px 0 0; padding: 2px 0; border-color: white" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"' +
                        ($(obj.el).prop('readonly') ? ' readonly="readonly"': '') + ($(obj.el).prop('disabled') ? ' disabled="disabled"': '') + ' tabindex="'+ tabIndex +'"/>'+
                    '        </li>'+
                    '    </ul>'+
                    '    </div>'+
                    '</div>'
        }
        if (obj.type === 'file') {
            html = '<div class="w2ui-field-helper w2ui-list" style="'+ margin + '; box-sizing: border-box">'+
                    '   <div style="position: absolute; left: 0px; right: 0px; top: 0px; bottom: 0px;">'+
                    '       <input '+ searchId +' name="attachment" class="file-input" type="file" style="width: 100%; height: 100%; opacity: 0;" tabindex="-1"' + (obj.options.max !== 1 ? ' multiple="multiple"': '') + ($(obj.el).prop('readonly') ? ' readonly="readonly"': '') + ($(obj.el).prop('disabled') ? ' disabled="disabled"': '') + ($(obj.el).attr('accept') ? ' accept="'+ $(obj.el).attr('accept') +'"': '') + '/>'+
                    '   </div>'+
                    '    <div style="position: absolute; padding: 0px; margin: 0px; display: inline-block" class="w2ui-multi-items">'+
                    '        <ul><li style="padding-left: 0px; padding-right: 0px" class="nomouse"></li></ul>'+
                    '    </div>'+
                    '</div>'
        }
        // old bg and border
        let tmp = $(obj.el).data('tmp') || {}
        tmp['old-background-color'] = $(obj.el).css('background-color')
        tmp['old-border-color'] = $(obj.el).css('border-color')
        $(obj.el).data('tmp', tmp)
        $(obj.el)
            .before(html)
            .css({
                'background-color' : 'transparent',
                'border-color'     : 'transparent'
            })
        let div = $(obj.el).prev()
        obj.helpers.multi = div
        if (obj.type === 'enum') {
            $(obj.el).attr('tabindex', -1)
            // INPUT events
            div.find('input')
                .on('click', function(event) {
                    if ($('#w2ui-overlay').length === 0) obj.focus(event)
                    $(obj.el).triggerHandler('click')
                })
                .on('focus', function(event) {
                    $(div).css({ 'outline': 'auto 5px #7DB4F3', 'outline-offset': '2px' })
                    $(obj.el).triggerHandler('focus')
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                })
                .on('blur', function(event) {
                    $(div).css('outline', 'none')
                    $(obj.el).triggerHandler('blur')
                    if (event.stopPropagation) event.stopPropagation(); else event.cancelBubble = true
                })
                .on('keyup', function(event) { obj.keyUp(event) })
                .on('keydown', function(event) { obj.keyDown(event) })
                .on('keypress', function(event) { obj.keyPress(event) })
            // MAIN div
            div.on('click', function(event) { $(this).find('input').focus() })
        }
        if (obj.type === 'file') {
            $(obj.el).css('outline', 'none')
            div.find('input')
                .off('.drag')
                .on('click.drag', function(event) {
                    event.stopPropagation()
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(obj.el).focus()
                })
                .on('dragenter.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).addClass('w2ui-file-dragover')
                })
                .on('dragleave.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).removeClass('w2ui-file-dragover')
                })
                .on('drop.drag', function(event) {
                    if ($(obj.el).prop('readonly') || $(obj.el).prop('disabled')) return
                    $(div).removeClass('w2ui-file-dragover')
                    let files = event.originalEvent.dataTransfer.files
                    for (let i = 0, l = files.length; i < l; i++) obj.addFile.call(obj, files[i])
                    $(obj.el).focus()
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('dragover.drag', function(event) {
                    // cancel to stop browser behaviour
                    event.preventDefault()
                    event.stopPropagation()
                })
                .on('change.drag', function() {
                    $(obj.el).focus()
                    if (typeof this.files !== 'undefined') {
                        for (let i = 0, l = this.files.length; i < l; i++) {
                            obj.addFile.call(obj, this.files[i])
                        }
                    }
                })
        }
        obj.refresh()
    }
    addFile(file) {
        let obj = this
        let options = this.options
        let selected = $(obj.el).data('selected')
        let newItem = {
            name     : file.name,
            type     : file.type,
            modified : file.lastModifiedDate,
            size     : file.size,
            content  : null,
            file     : file
        }
        let size = 0
        let cnt = 0
        let err
        if (selected) {
            for (let s = 0; s < selected.length; s++) {
                // check for dups
                if (selected[s].name == file.name && selected[s].size == file.size) return
                size += selected[s].size
                cnt++
            }
        }
        // trigger event
        let edata = obj.trigger({ phase: 'before', type: 'add', target: obj.el, file: newItem, total: cnt, totalSize: size })
        if (edata.isCancelled === true) return
        // check params
        if (options.maxFileSize !== 0 && newItem.size > options.maxFileSize) {
            err = 'Maximum file size is '+ w2utils.formatSize(options.maxFileSize)
            if (options.silent === false) $(obj.el).w2tag(err)
            console.log('ERROR: '+ err)
            return
        }
        if (options.maxSize !== 0 && size + newItem.size > options.maxSize) {
            err = w2utils.lang('Maximum total size is') + ' ' + w2utils.formatSize(options.maxSize)
            if (options.silent === false) {
                $(obj.el).w2tag(err)
            } else {
                console.log('ERROR: '+ err)
            }
            return
        }
        if (options.max !== 0 && cnt >= options.max) {
            err = w2utils.lang('Maximum number of files is') + ' '+ options.max
            if (options.silent === false) {
                $(obj.el).w2tag(err)
            } else {
                console.log('ERROR: '+ err)
            }
            return
        }
        selected.push(newItem)
        // read file as base64
        if (typeof FileReader !== 'undefined' && options.readContent === true) {
            let reader = new FileReader()
            // need a closure
            reader.onload = (function onload() {
                return function closure(event) {
                    let fl = event.target.result
                    let ind = fl.indexOf(',')
                    newItem.content = fl.substr(ind+1)
                    obj.refresh()
                    $(obj.el).trigger('input').trigger('change')
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                }
            })()
            reader.readAsDataURL(file)
        } else {
            obj.refresh()
            $(obj.el).trigger('input').trigger('change')
            obj.trigger($.extend(edata, { phase: 'after' }))
        }
    }
    normMenu(menu, el) {
        if (Array.isArray(menu)) {
            for (let m = 0; m < menu.length; m++) {
                if (typeof menu[m] === 'string') {
                    menu[m] = { id: menu[m], text: menu[m] }
                } else if (menu[m] != null) {
                    if (menu[m].text != null && menu[m].id == null) menu[m].id = menu[m].text
                    if (menu[m].text == null && menu[m].id != null) menu[m].text = menu[m].id
                    if (menu[m].caption != null) menu[m].text = menu[m].caption
                } else {
                    menu[m] = { id: null, text: 'null' }
                }
            }
            return menu
        } else if (typeof menu === 'function') {
            return w2utils.normMenu.call(this, menu.call(this, el))
        } else if (typeof menu === 'object') {
            let tmp = []
            for (let m in menu) tmp.push({ id: m, text: menu[m] })
            return tmp
        }
    }
    getMonthHTML(month, year, selected) {
        let td = new Date()
        let months = w2utils.settings.fullmonths
        let daysCount = ['31', '28', '31', '30', '31', '30', '31', '31', '30', '31', '30', '31']
        let today = td.getFullYear() + '/' + (Number(td.getMonth()) + 1) + '/' + td.getDate()
        let days = w2utils.settings.fulldays.slice() // creates copy of the array
        let sdays = w2utils.settings.shortdays.slice() // creates copy of the array
        if (w2utils.settings.weekStarts !== 'M') {
            days.unshift(days.pop())
            sdays.unshift(sdays.pop())
        }
        let options = this.options
        if (options == null) options = {}
        // normalize date
        year = w2utils.isInt(year) ? parseInt(year) : td.getFullYear()
        month = w2utils.isInt(month) ? parseInt(month) : td.getMonth() + 1
        if (month > 12) { month -= 12; year++ }
        if (month < 1 || month === 0) { month += 12; year-- }
        if (year/4 == Math.floor(year/4)) { daysCount[1] = '29' } else { daysCount[1] = '28' }
        options.current = month + '/' + year
        // start with the required date
        td = new Date(year, month-1, 1)
        let weekDay = td.getDay()
        let dayTitle = ''
        for (let i = 0; i < sdays.length; i++) dayTitle += '<td title="'+ days[i] +'">' + sdays[i] + '</td>'
        let html =
            '<div class="w2ui-calendar-title title">'+
            '    <div class="w2ui-calendar-previous previous"> <div></div> </div>'+
            '    <div class="w2ui-calendar-next next"> <div></div> </div> '+
                    months[month-1] +', '+ year +
            '       <span class="arrow-down" style="position: relative; top: -1px; left: 5px; opacity: 0.6;"></span>'+
            '</div>'+
            '<table class="w2ui-calendar-days" cellspacing="0"><tbody>'+
            '    <tr class="w2ui-day-title">' + dayTitle + '</tr>'+
            '    <tr>'
        let day = 1
        if (w2utils.settings.weekStarts !== 'M') weekDay++
        if(this.type === 'datetime') {
            let dt_sel = w2utils.isDateTime(selected, options.format, true)
            selected = w2utils.formatDate(dt_sel, w2utils.settings.dateFormat)
        }
        for (let ci = 1; ci < 43; ci++) {
            if (weekDay === 0 && ci == 1) {
                for (let ti = 0; ti < 6; ti++) html += '<td class="w2ui-day-empty">&#160;</td>'
                ci += 6
            } else {
                if (ci < weekDay || day > daysCount[month-1]) {
                    html += '<td class="w2ui-day-empty">&#160;</td>'
                    if ((ci) % 7 === 0) html += '</tr><tr>'
                    continue
                }
            }
            let dt = year + '/' + month + '/' + day
            let DT = new Date(dt)
            let className = ''
            if (DT.getDay() === 6) className = ' w2ui-saturday'
            if (DT.getDay() === 0) className = ' w2ui-sunday'
            if (dt == today) className += ' w2ui-today'
            let dspDay = day
            let col = ''
            let bgcol = ''
            let tmp_dt, tmp_dt_fmt
            if(this.type === 'datetime') {
                // var fm = options.format.split('|')[0].trim();
                // tmp_dt      = w2utils.formatDate(dt, fm);
                tmp_dt = w2utils.formatDateTime(dt, options.format)
                tmp_dt_fmt = w2utils.formatDate(dt, w2utils.settings.dateFormat)
            } else {
                tmp_dt = w2utils.formatDate(dt, options.format)
                tmp_dt_fmt = tmp_dt
            }
            if (options.colored && options.colored[tmp_dt_fmt] !== undefined) { // if there is predefined colors for dates
                let tmp = options.colored[tmp_dt_fmt].split(':')
                bgcol = 'background-color: ' + tmp[0] + ';'
                col = 'color: ' + tmp[1] + ';'
            }
            html += '<td class="'+ (this.inRange(tmp_dt, true) ? 'w2ui-date ' + (tmp_dt_fmt == selected ? 'w2ui-date-selected' : '') : 'w2ui-blocked') + className + '" '+
                    '   style="'+ col + bgcol + '" date="'+ tmp_dt +'" data-date="'+ DT +'">'+
                        dspDay +
                    '</td>'
            if (ci % 7 === 0 || (weekDay === 0 && ci == 1)) html += '</tr><tr>'
            day++
        }
        html += '</tr></tbody></table>'
        return html
    }
    getYearHTML() {
        let months = w2utils.settings.shortmonths
        let start_year = w2utils.settings.dateStartYear
        let end_year = w2utils.settings.dateEndYear
        let mhtml = ''
        let yhtml = ''
        for (let m = 0; m < months.length; m++) {
            mhtml += '<div class="w2ui-jump-month" name="'+ m +'">'+ months[m] + '</div>'
        }
        for (let y = start_year; y <= end_year; y++) {
            yhtml += '<div class="w2ui-jump-year" name="'+ y +'">'+ y + '</div>'
        }
        return '<div id="w2ui-jump-month">'+ mhtml +'</div><div id="w2ui-jump-year">'+ yhtml +'</div>'
    }
    getHourHTML() {
        let tmp = []
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        let h24 = (options.format.indexOf('h24') > -1)
        for (let a = 0; a < 24; a++) {
            let time = (a >= 12 && !h24 ? a - 12 : a) + ':00' + (!h24 ? (a < 12 ? ' am' : ' pm') : '')
            if (a == 12 && !h24) time = '12:00 pm'
            if (!tmp[Math.floor(a/8)]) tmp[Math.floor(a/8)] = ''
            let tm1 = this.fromMin(this.toMin(time))
            let tm2 = this.fromMin(this.toMin(time) + 59)
            if (this.type === 'datetime') {
                let dt = w2utils.isDateTime(this.el.value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm1 = w2utils.formatDate(dt, fm) + ' ' + tm1
                tm2 = w2utils.formatDate(dt, fm) + ' ' + tm2
            }
            tmp[Math.floor(a/8)] += '<div class="'+ (this.inRange(tm1) || this.inRange(tm2) ? 'w2ui-time ' : 'w2ui-blocked') + '" hour="'+ a +'">'+ time +'</div>'
        }
        let html =
            '<div class="w2ui-calendar">'+
            '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Hour') +'</div>'+
            '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
            '       <td>'+ tmp[0] +'</td>' +
            '       <td>'+ tmp[1] +'</td>' +
            '       <td>'+ tmp[2] +'</td>' +
            '   </tr></tbody></table></div>'+
            '</div>'
        return html
    }
    getMinHTML(hour) {
        if (hour == null) hour = 0
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        let h24 = (options.format.indexOf('h24') > -1)
        let tmp = []
        for (let a = 0; a < 60; a += 5) {
            let time = (hour > 12 && !h24 ? hour - 12 : hour) + ':' + (a < 10 ? 0 : '') + a + ' ' + (!h24 ? (hour < 12 ? 'am' : 'pm') : '')
            let tm = time
            let ind = a < 20 ? 0 : (a < 40 ? 1 : 2)
            if (!tmp[ind]) tmp[ind] = ''
            if (this.type === 'datetime') {
                let dt = w2utils.isDateTime(this.el.value, options.format, true)
                let fm = options.format.split('|')[0].trim()
                tm = w2utils.formatDate(dt, fm) + ' ' + tm
            }
            tmp[ind] += '<div class="'+ (this.inRange(tm) ? 'w2ui-time ' : 'w2ui-blocked') + '" min="'+ a +'">'+ time +'</div>'
        }
        let html =
            '<div class="w2ui-calendar">'+
            '   <div class="w2ui-calendar-title">'+ w2utils.lang('Select Minute') +'</div>'+
            '   <div class="w2ui-calendar-time"><table><tbody><tr>'+
            '       <td>'+ tmp[0] +'</td>' +
            '       <td>'+ tmp[1] +'</td>' +
            '       <td>'+ tmp[2] +'</td>' +
            '   </tr></tbody></table></div>'+
            '</div>'
        return html
    }
    toMin(str) {
        if (typeof str !== 'string') return null
        let tmp = str.split(':')
        if (tmp.length === 2) {
            tmp[0] = parseInt(tmp[0])
            tmp[1] = parseInt(tmp[1])
            if (str.indexOf('pm') !== -1 && tmp[0] !== 12) tmp[0] += 12
        } else {
            return null
        }
        return tmp[0] * 60 + tmp[1]
    }
    fromMin(time) {
        let ret = ''
        if (time >= 24 * 60) time = time % (24 * 60)
        if (time < 0) time = 24 * 60 + time
        let hour = Math.floor(time/60)
        let min = ((time % 60) < 10 ? '0' : '') + (time % 60)
        let options = this.options
        if (options == null) options = { format: w2utils.settings.timeFormat }
        if (options.format.indexOf('h24') !== -1) {
            ret = hour + ':' + min
        } else {
            ret = (hour <= 12 ? hour : hour - 12) + ':' + min + ' ' + (hour >= 12 ? 'pm' : 'am')
        }
        return ret
    }
}
/************************************************************************
*   Part of w2ui 2.0 library
*   - Dependencies: jQuery, w2utils, w2toolbar, w2tabs
*
* == TODO ==
*   - include delta on save
*   - form should read <select> <options> into items
*   - two way data bindings
*   - nested groups (so fields can be deifned inside)
*
* == 1.5 changes
*   - $('#form').w2form() - if called w/o argument then it returns form object
*   - added onProgress
*   - added field.html.style (for the whole field)
*   - added enable/disable, show/hide
*   - added field.disabled, field.hidden
*   - when field is blank, set record.field = null
*   - action: { caption: 'Limpiar', style: '', class: '', onClick() {} }
*   - added ability to generate radio and select html in generateHTML()
*   - refresh(field) - would refresh only one field
*   - form.message
*   - added field.html.column
*   - added field types html, empty, custom
*   - httpHeaders
*   - method
*   - onInput
*   - added field.html.groupStyle, field.html.groupTitleStyle
*   - added field.html.column = 'before' && field.html.column = 'after'
*   - added field.html.anchor
*   - changed this.clear(field1, field2,...)
*   - added nestedFields: use field name containing dots as separator to look into objects
*   - added getValue(), setValue()
*   - added getChanges()
*   - added getCleanRecord(strict)
*   - added applyFocus()
*   - deprecated field.name -> field.field
*   - options.items - can be an array
*   - added form.pageStyle
*   - added html.span -1 - then label is displayed on top
*   - added field.options.minLength, min/max for numbers can be done with int/float - min/max
*   - field.html.groupCollapsible, form.toggleGroup
*   - added showErrors
*   - added field.type = 'check'
*   - new field type 'map', 'array' - same thing but map has unique keys also html: { key: { text: '111', attr: '222' }, value: {...}}
*   - updateEmptyGroups
*   - tabs below some fields
*   - tabindexBase
*   == 2.0
*
************************************************************************/

class w2form extends w2event {
    constructor(options) {
        super(options.name)
        this.name = null
        this.header = ''
        this.box = null // HTML element that hold this element
        this.url = ''
        this.routeData = {} // data for dynamic routes
        this.formURL = '' // url where to get form HTML
        this.formHTML = '' // form HTML (might be loaded from the url)
        this.page = 0 // current page
        this.recid = 0 // can be null or 0
        this.fields = []
        this.actions = {}
        this.record = {}
        this.original = null
        this.postData = {}
        this.httpHeaders = {}
        this.method = null // only used when not null, otherwise set based on w2utils.settings.dataType
        this.toolbar = {} // if not empty, then it is toolbar
        this.tabs = {} // if not empty, then it is tabs object
        this.style = ''
        this.focus = 0 // focus first or other element
        this.autosize = true // autosize
        this.nestedFields= true // use field name containing dots as separator to look into object
        this.multipart = false
        this.tabindexBase= 0 // this will be added to the auto numbering
        this.isGenerated = false
        this.last = {
            xhr: null, // jquery xhr requests
            errors: []
        }
        this.onRequest = null
        this.onLoad = null
        this.onValidate = null
        this.onSubmit = null
        this.onProgress = null
        this.onSave = null
        this.onChange = null
        this.onInput = null
        this.onRender = null
        this.onRefresh = null
        this.onResize = null
        this.onDestroy = null
        this.onAction = null
        this.onToolbar = null
        this.onError = null
        this.msgNotJSON = 'Returned data is not in valid JSON format.'
        this.msgAJAXerror = 'AJAX error. See console for more details.'
        this.msgRefresh = 'Loading...'
        this.msgSaving = 'Saving...'
        // mix in options
        $.extend(true, this, options)
        // When w2utils.settings.dataType is JSON, then we can convert the save request to multipart/form-data. So we can upload large files with the form
        // The original body is JSON.stringified to __body
        // remember items
        let record = options.record
        let original = options.original
        let fields = options.fields
        let toolbar = options.toolbar
        let tabs = options.tabs
        // extend items
        $.extend(this, { record: {}, original: null, fields: [], tabs: {}, toolbar: {}, handlers: [] })
        if (Array.isArray(tabs)) {
            $.extend(true, this.tabs, { tabs: [] })
            for (let t = 0; t < tabs.length; t++) {
                let tmp = tabs[t]
                if (typeof tmp === 'object') {
                    this.tabs.tabs.push(tmp)
                    if(tmp.active === true) {
                        this.tabs.active = tmp.id
                    }
                } else {
                    this.tabs.tabs.push({ id: tmp, text: tmp })
                }
            }
        } else {
            $.extend(true, this.tabs, tabs)
        }
        $.extend(true, this.toolbar, toolbar)
        // reassign variables
        if (fields) for (let p = 0; p < fields.length; p++) {
            let field = $.extend(true, {}, fields[p])
            if (field.field == null && field.name != null) {
                console.log('NOTICE: form field.name property is deprecated, please use field.field. Field ->', field)
                field.field = field.name
            }
            this.fields[p] = field
        }
        for (let p in record) { // it is an object
            if ($.isPlainObject(record[p])) {
                this.record[p] = $.extend(true, {}, record[p])
            } else {
                this.record[p] = record[p]
            }
        }
        for (let p in original) { // it is an object
            if ($.isPlainObject(original[p])) {
                this.original[p] = $.extend(true, {}, original[p])
            } else {
                this.original[p] = original[p]
            }
        }
        // generate html if necessary
        if (this.formURL !== '') {
            $.get(this.formURL, (data) => { // should always be $.get as it is template
                this.formHTML = data
                this.isGenerated = true
            })
        } else if (!this.formURL && !this.formHTML) {
            this.formHTML = this.generateHTML()
            this.isGenerated = true
        }
    }
    get(field, returnIndex) {
        if (arguments.length === 0) {
            let all = []
            for (let f1 = 0; f1 < this.fields.length; f1++) {
                if (this.fields[f1].field != null) all.push(this.fields[f1].field)
            }
            return all
        } else {
            for (let f2 = 0; f2 < this.fields.length; f2++) {
                if (this.fields[f2].field == field) {
                    if (returnIndex === true) return f2; else return this.fields[f2]
                }
            }
            return null
        }
    }
    set(field, obj) {
        for (let f = 0; f < this.fields.length; f++) {
            if (this.fields[f].field == field) {
                $.extend(this.fields[f] , obj)
                this.refresh(field)
                return true
            }
        }
        return false
    }
    getValue(field) {
        if (this.nestedFields) {
            let val = undefined
            try { // need this to make sure no error in fields
                let rec = this.record
                val = String(field).split('.').reduce((rec, i) => { return rec[i] }, rec)
            } catch (event) {
            }
            return val
        } else {
            return this.record[field]
        }
    }
    setValue(field, value) {
        if (this.nestedFields) {
            try { // need this to make sure no error in fields
                let rec = this.record
                String(field).split('.').map((fld, i, arr) => {
                    if (arr.length - 1 !== i) {
                        if (rec[fld]) rec = rec[fld]; else { rec[fld] = {}; rec = rec[fld] }
                    } else {
                        rec[fld] = value
                    }
                })
                return true
            } catch (event) {
                return false
            }
        } else {
            this.record[field] = value
            return true
        }
    }
    show() {
        let affected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && fld.hidden) {
                fld.hidden = false
                affected.push(fld.field)
            }
        }
        if (affected.length > 0) this.refresh.apply(this, affected)
        this.updateEmptyGroups()
        return affected.length
    }
    hide() {
        let affected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && !fld.hidden) {
                fld.hidden = true
                affected.push(fld.field)
            }
        }
        if (affected.length > 0) this.refresh.apply(this, affected)
        this.updateEmptyGroups()
        return affected.length
    }
    updateEmptyGroups() {
        // hide empty groups
        $(this.box).find('.w2ui-group').each((ind, group) =>{
            if (isHidden($(group).find('.w2ui-field'))) {
                $(group).hide()
            } else {
                $(group).show()
            }
        })
        function isHidden($els) {
            let flag = true
            $els.each((ind, el) => {
                if (el.style.display != 'none') flag = false
            })
            return flag
        }
    }
    enable() {
        let affected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && fld.disabled) {
                fld.disabled = false
                affected.push(fld.field)
            }
        }
        if (affected.length > 0) this.refresh.apply(this, affected)
        return affected.length
    }
    disable() {
        let affected = []
        for (let a = 0; a < arguments.length; a++) {
            let fld = this.get(arguments[a])
            if (fld && !fld.disabled) {
                fld.disabled = true
                affected.push(fld.field)
            }
        }
        if (affected.length > 0) this.refresh.apply(this, affected)
        return affected.length
    }
    change() {
        Array.from(arguments).forEach((field) => {
            let tmp = this.get(field)
            if (tmp.$el) tmp.$el.change()
        })
    }
    reload(callBack) {
        let url = (typeof this.url !== 'object' ? this.url : this.url.get)
        if (url && this.recid !== 0 && this.recid != null) {
            // this.clear();
            this.request(callBack)
        } else {
            // this.refresh(); // no need to refresh
            if (typeof callBack === 'function') callBack()
        }
    }
    clear() {
        if (arguments.length != 0) {
            Array.from(arguments).forEach((field) => {
                let rec = this.record
                String(field).split('.').map((fld, i, arr) => {
                    if (arr.length - 1 !== i) rec = rec[fld]; else delete rec[fld]
                })
                this.refresh(field)
            })
        } else {
            this.recid = 0
            this.record = {}
            this.original = null
            this.refresh()
        }
        $().w2tag()
    }
    error(msg) {
        let obj = this
        // let the management of the error outside of the grid
        let edata = this.trigger({ target: this.name, type: 'error', message: msg , xhr: this.last.xhr })
        if (edata.isCancelled === true) {
            if (typeof callBack === 'function') callBack()
            return
        }
        // need a time out because message might be already up)
        setTimeout(() => { obj.message(msg) }, 1)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    message(options) {
        if (typeof options === 'string') {
            options = {
                width   : (options.length < 300 ? 350 : 550),
                height  : (options.length < 300 ? 170: 250),
                body    : '<div class="w2ui-centered">' + options + '</div>',
                buttons : '<button class="w2ui-btn" onclick="w2ui[\''+ this.name +'\'].message()">Ok</button>',
                onOpen  (event) {
                    setTimeout(() => {
                        $(event.box).find('.w2ui-btn').focus()
                    }, 25)
                }
            }
        }
        w2utils.message.call(this, {
            box   : this.box,
            path  : 'w2ui.' + this.name,
            title : '.w2ui-form-header:visible',
            body  : '.w2ui-form-box'
        }, options)
    }
    validate(showErrors) {
        if (showErrors == null) showErrors = true
        $().w2tag() // hide all tags before validating
        // validate before saving
        let errors = []
        for (let f = 0; f < this.fields.length; f++) {
            let field = this.fields[f]
            if (this.getValue(field.field) == null) this.setValue(field.field, '')
            switch (field.type) {
                case 'int':
                    if (this.getValue(field.field) && !w2utils.isInt(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not an integer') })
                    }
                    break
                case 'float':
                    if (this.getValue(field.field) && !w2utils.isFloat(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a float') })
                    }
                    break
                case 'money':
                    if (this.getValue(field.field) && !w2utils.isMoney(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not in money format') })
                    }
                    break
                case 'color':
                case 'hex':
                    if (this.getValue(field.field) && !w2utils.isHex(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a hex number') })
                    }
                    break
                case 'email':
                    if (this.getValue(field.field) && !w2utils.isEmail(this.getValue(field.field))) {
                        errors.push({ field: field, error: w2utils.lang('Not a valid email') })
                    }
                    break
                case 'checkbox':
                    // convert true/false
                    if (this.getValue(field.field) == true) this.setValue(field.field, 1); else this.setValue(field.field, 0)
                    break
                case 'date':
                    // format date before submit
                    if (!field.options.format) field.options.format = w2utils.settings.dateFormat
                    if (this.getValue(field.field) && !w2utils.isDate(this.getValue(field.field), field.options.format)) {
                        errors.push({ field: field, error: w2utils.lang('Not a valid date') + ': ' + field.options.format })
                    }
                    break
                case 'list':
                case 'combo':
                    break
                case 'enum':
                    break
            }
            // === check required - if field is '0' it should be considered not empty
            let val = this.getValue(field.field)
            if (field.required && field.hidden !== true && ['div', 'custom', 'html', 'empty'].indexOf(field.type) == -1
                    && (val === '' || (Array.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val)))) {
                errors.push({ field: field, error: w2utils.lang('Required field') })
            }
            if (field.options && field.hidden !== true && field.options.minLength > 0
                    && ['enum', 'list', 'combo'].indexOf(field.type) == -1 // since minLength is used there too
                    && this.getValue(field.field).length < field.options.minLength) {
                errors.push({ field: field, error: w2utils.lang('Field should be at least NN characters.').replace('NN', field.options.minLength) })
            }
        }
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'validate', errors: errors })
        if (edata.isCancelled === true) return
        // show error
        this.last.errors = errors
        if (showErrors) this.showErrors()
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        return errors
    }
    showErrors() {
        let errors = this.last.errors
        if (errors.length > 0) {
            let err = errors[0]
            // scroll into view
            this.goto(errors[0].field.page)
            $(err.field.$el).parents('.w2ui-field')[0].scrollIntoView(true)
            // show errors
            for (let i = 0; i < errors.length; i++) {
                err = errors[i]
                let opt = $.extend({ 'class': 'w2ui-error', hideOnFocus: true }, err.options)
                if (err.field == null) continue
                if (err.field.type === 'radio') { // for radio and checkboxes
                    $($(err.field.el).closest('div')[0]).w2tag(err.error, opt)
                } else if (['enum', 'file'].indexOf(err.field.type) !== -1) {
                    (function closure(err) {
                        setTimeout(() => {
                            let fld = $(err.field.el).data('w2field').helpers.multi
                            $(err.field.el).w2tag(err.error, err.options)
                            $(fld).addClass('w2ui-error')
                        }, 1)
                    })(err)
                } else {
                    $(err.field.el).w2tag(err.error, opt)
                }
            }
            // hide errors on scroll
            setTimeout(() => {
                let err = errors[0]
                $(err.field.$el).parents('.w2ui-page').off('.hideErrors').on('scroll.hideErrors', function(event) {
                    for (let i = 0; i < errors.length; i++) {
                        err = errors[i]
                        $(err.field.el).w2tag()
                    }
                    $(err.field.$el).parents('.w2ui-page').off('.hideErrors')
                })
            }, 300)
        }
    }
    getChanges() {
        let diff = {}
        if (this.original != null && typeof this.original == 'object' && !$.isEmptyObject(this.record)) {
            diff = doDiff(this.record, this.original, {})
        }
        return diff
         function doDiff(record, original, result) {
            if (Array.isArray(record) && Array.isArray(original)) {
                while (record.length < original.length) {
                    record.push(null)
                }
            }
            for (let i in record) {
                if (record[i] != null && typeof record[i] === "object") {
                    result[i] = doDiff(record[i], original[i] || {}, {})
                    if (!result[i] || ($.isEmptyObject(result[i]) && $.isEmptyObject(original[i]))) delete result[i]
                } else if (record[i] != original[i] || (record[i] == null && original[i] != null)) { // also catch field clear
                    result[i] = record[i]
                }
            }
            return !$.isEmptyObject(result) ? result : null
        }
    }
    getCleanRecord(strict) {
        let data = $.extend(true, {}, this.record)
        this.fields.forEach((fld) => {
            if (['list', 'combo', 'enum'].indexOf(fld.type) != -1) {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field)
                if ($.isPlainObject(val) && val.id != null) { // should be tru if val.id === ''
                    this.setValue.call(tmp, fld.field, val.id)
                }
                if (Array.isArray(val)) {
                    val.forEach((item, ind) => {
                        if ($.isPlainObject(item) && item.id) {
                            val[ind] = item.id
                        }
                    })
                }
            }
            if (fld.type == 'map') {
                let tmp = { nestedFields: true, record: data }
                let val = this.getValue.call(tmp, fld.field)
                if (val._order) delete val._order
            }
        })
        // return only records presend in description
        if (strict === true) {
            Object.keys(data).forEach((key) => {
                if (!this.get(key)) delete data[key]
            })
        }
        return data
    }
    request(postData, callBack) { // if (1) param then it is call back if (2) then postData and callBack
        let obj = this
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        if (postData == null) postData = {}
        if (!this.url || (typeof this.url === 'object' && !this.url.get)) return
        if (this.recid == null) this.recid = 0
        // build parameters list
        let params = {}
        // add list params
        params.cmd = 'get'
        params.recid = this.recid
        params.name = this.name
        // append other params
        $.extend(params, this.postData)
        $.extend(params, postData)
        // event before
        let edata = this.trigger({ phase: 'before', type: 'request', target: this.name, url: this.url, postData: params, httpHeaders: this.httpHeaders })
        if (edata.isCancelled === true) { if (typeof callBack === 'function') callBack({ status: 'error', message: 'Request aborted.' }); return }
        // default action
        this.record = {}
        this.original = null
        // call server to get data
        this.lock(w2utils.lang(this.msgRefresh))
        let url = edata.url
        if (typeof edata.url === 'object' && edata.url.get) url = edata.url.get
        if (this.last.xhr) try { this.last.xhr.abort() } catch (e) {}
        // process url with routeData
        if (!$.isEmptyObject(obj.routeData)) {
            let info = w2utils.parseRoute(url)
            if (info.keys.length > 0) {
                for (let k = 0; k < info.keys.length; k++) {
                    if (obj.routeData[info.keys[k].name] == null) continue
                    url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                }
            }
        }
        let ajaxOptions = {
            type     : 'POST',
            url      : url,
            data     : edata.postData,
            headers  : edata.httpHeaders,
            dataType : 'json' // expected from server
        }
        let dataType = obj.dataType || w2utils.settings.dataType
        if (edata.dataType) dataType = edata.dataType
        switch (dataType) {
            case 'HTTP':
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                break
            case 'HTTPJSON':
                ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                break
            case 'RESTFULL':
                ajaxOptions.type = 'GET'
                ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                break
            case 'RESTFULLJSON':
                ajaxOptions.type = 'GET'
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
        if (edata.method) ajaxOptions.type = edata.method
        this.last.xhr = $.ajax(ajaxOptions)
            .done((data, status, xhr) => {
                obj.unlock()
                // prepare record
                data = xhr.responseJSON
                if (data == null) {
                    data = {
                        status       : 'error',
                        message      : w2utils.lang(obj.msgNotJSON),
                        responseText : xhr.responseText
                    }
                }
                // event before
                let edata = obj.trigger({ phase: 'before', target: obj.name, type: 'load', data: data, xhr: xhr })
                if (edata.isCancelled === true) {
                    if (typeof callBack === 'function') callBack({ status: 'error', message: 'Request aborted.' })
                    return
                }
                // parse server response
                if (edata.data.status === 'error') {
                    obj.error(w2utils.lang(edata.data.message))
                } else {
                    obj.record = $.extend({}, edata.data.record)
                }
                // event after
                obj.trigger($.extend(edata, { phase: 'after' }))
                obj.refresh()
                obj.applyFocus()
                // call back
                if (typeof callBack === 'function') callBack(edata.data)
            })
            .fail((xhr, status, error) => {
                // trigger event
                let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                let edata2 = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr })
                if (edata2.isCancelled === true) return
                // default behavior
                if (status !== 'abort') {
                    let data
                    try { data = typeof xhr.responseJSON === 'object' ? xhr.responseJSON : $.parseJSON(xhr.responseText) } catch (e) {}
                    console.log('ERROR: Server communication failed.',
                        '\n   EXPECTED:', { status: 'success', items: [{ id: 1, text: 'item' }] },
                        '\n         OR:', { status: 'error', message: 'error message' },
                        '\n   RECEIVED:', typeof data === 'object' ? data : xhr.responseText)
                    obj.unlock()
                }
                // event after
                obj.trigger($.extend(edata2, { phase: 'after' }))
            })
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    submit(postData, callBack) {
        return this.save(postData, callBack)
    }
    save(postData, callBack) {
        let obj = this
        $(this.box).find(':focus').change() // trigger onchange
        // check for multiple params
        if (typeof postData === 'function') {
            callBack = postData
            postData = null
        }
        // validation
        let errors = obj.validate(true)
        if (errors.length !== 0) return
        // submit save
        if (postData == null) postData = {}
        if (!obj.url || (typeof obj.url === 'object' && !obj.url.save)) {
            console.log('ERROR: Form cannot be saved because no url is defined.')
            return
        }
        obj.lock(w2utils.lang(obj.msgSaving) + ' <span id="'+ obj.name +'_progress"></span>')
        // need timer to allow to lock
        setTimeout(() => {
            // build parameters list
            let params = {}
            // add list params
            params.cmd = 'save'
            params.recid = obj.recid
            params.name = obj.name
            // append other params
            $.extend(params, obj.postData)
            $.extend(params, postData)
            // clear up files
            if (!obj.multipart)
                obj.fields.forEach((item) => {
                    if (item.type === 'file' && Array.isArray(obj.getValue(item.field))) {
                        obj.getValue(item.field).forEach((fitem) => {
                            delete fitem.file
                        })
                    }
                })
            params.record = $.extend(true, {}, obj.record)
            // event before
            let edata = obj.trigger({ phase: 'before', type: 'submit', target: obj.name, url: obj.url, postData: params, httpHeaders: obj.httpHeaders })
            if (edata.isCancelled === true) return
            // default action
            let url = edata.url
            if (typeof edata.url === 'object' && edata.url.save) url = edata.url.save
            if (obj.last.xhr) try { obj.last.xhr.abort() } catch (e) {}
            // process url with routeData
            if (!$.isEmptyObject(obj.routeData)) {
                let info = w2utils.parseRoute(url)
                if (info.keys.length > 0) {
                    for (let k = 0; k < info.keys.length; k++) {
                        if (obj.routeData[info.keys[k].name] == null) continue
                        url = url.replace((new RegExp(':'+ info.keys[k].name, 'g')), obj.routeData[info.keys[k].name])
                    }
                }
            }
            let ajaxOptions = {
                type     : 'POST',
                url      : url,
                data     : edata.postData,
                headers  : edata.httpHeaders,
                dataType : 'json', // expected from server
                xhr () {
                    let xhr = new window.XMLHttpRequest()
                    // upload
                    xhr.upload.addEventListener('progress', function progress(evt) {
                        if (evt.lengthComputable) {
                            let edata3 = obj.trigger({ phase: 'before', type: 'progress', total: evt.total, loaded: evt.loaded, originalEvent: evt })
                            if (edata3.isCancelled === true) return
                            // only show % if it takes time
                            let percent = Math.round(evt.loaded / evt.total * 100)
                            if ((percent && percent != 100) || $('#'+ obj.name + '_progress').text() != '') {
                                $('#'+ obj.name + '_progress').text(''+ percent + '%')
                            }
                            // event after
                            obj.trigger($.extend(edata3, { phase: 'after' }))
                        }
                    }, false)
                    return xhr
                }
            }
            let dataType = obj.dataType || w2utils.settings.dataType
            if (edata.dataType) dataType = edata.dataType
            switch (dataType) {
                case 'HTTP':
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                    break
                case 'HTTPJSON':
                    ajaxOptions.data = { request: JSON.stringify(ajaxOptions.data) }
                    break
                case 'RESTFULL':
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT'
                    ajaxOptions.data = String($.param(ajaxOptions.data, false)).replace(/%5B/g, '[').replace(/%5D/g, ']')
                    break
                case 'RESTFULLJSON':
                    if (obj.recid !== 0 && obj.recid != null) ajaxOptions.type = 'PUT'
                    ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                    ajaxOptions.contentType = 'application/json'
                    break
                case 'JSON':
                    ajaxOptions.type = 'POST'
                    ajaxOptions.contentType = 'application/json'
                    if (!obj.multipart) {
                        ajaxOptions.data = JSON.stringify(ajaxOptions.data)
                    } else {
                        function apend(fd, dob, fob, p){
                            if (p == null) p = ''
                            function isObj(dob, fob, p){
                                if (typeof dob === 'object' && dob instanceof File) fd.append(p, dob)
                                if (typeof dob === 'object'){
                                    if (!!dob && dob.constructor === Array) {
                                        for (let i = 0; i < dob.length; i++) {
                                            let aux_fob = !!fob ? fob[i] : fob
                                            isObj(dob[i], aux_fob, p+'['+i+']')
                                        }
                                    } else {
                                        apend(fd, dob, fob, p)
                                    }
                                }
                            }
                            for(let prop in dob){
                                let aux_p = p == '' ? prop : '${p}[${prop}]'
                                let aux_fob = !!fob ? fob[prop] : fob
                                isObj(dob[prop], aux_fob, aux_p)
                            }
                        }
                        let fdata = new FormData()
                        fdata.append('__body', JSON.stringify(ajaxOptions.data))
                        apend(fdata,ajaxOptions.data)
                        ajaxOptions.data = fdata
                        ajaxOptions.contentType = false
                        ajaxOptions.processData = false
                    }
                    break
            }
            if (this.method) ajaxOptions.type = this.method
            if (edata.method) ajaxOptions.type = edata.method
            obj.last.xhr = $.ajax(ajaxOptions)
                .done((data, status, xhr) => {
                    obj.unlock()
                    // event before
                    let edata = obj.trigger({ phase: 'before', target: obj.name, type: 'save', xhr: xhr, status: status, data: data })
                    if (edata.isCancelled === true) return
                    // parse server response
                    data = xhr.responseJSON
                    // default action
                    if (data == null) {
                        data = {
                            status       : 'error',
                            message      : w2utils.lang(obj.msgNotJSON),
                            responseText : xhr.responseText
                        }
                    }
                    if (data.status === 'error') {
                        obj.error(w2utils.lang(data.message))
                    } else {
                        obj.original = null
                    }
                    // event after
                    obj.trigger($.extend(edata, { phase: 'after' }))
                    obj.refresh()
                    // call back
                    if (typeof callBack === 'function') callBack(data, xhr)
                })
                .fail((xhr, status, error) => {
                    // trigger event
                    let errorObj = { status: status, error: error, rawResponseText: xhr.responseText }
                    let edata2 = obj.trigger({ phase: 'before', type: 'error', error: errorObj, xhr: xhr })
                    if (edata2.isCancelled === true) return
                    // default behavior
                    console.log('ERROR: server communication failed. The server should return',
                        { status: 'success' }, 'OR', { status: 'error', message: 'error message' },
                        ', instead the AJAX request produced this: ', errorObj)
                    obj.unlock()
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
            // event after
            obj.trigger($.extend(edata, { phase: 'after' }))
        }, 50)
    }
    lock(msg, showSpinner) {
        let args = Array.prototype.slice.call(arguments, 0)
        args.unshift(this.box)
        setTimeout(() => { w2utils.lock.apply(window, args) }, 10)
    }
    unlock(speed) {
        let box = this.box
        setTimeout(() => { w2utils.unlock(box, speed) }, 25) // needed timer so if server fast, it will not flash
    }
    lockPage(page, msg){
        let $page = $(this.box).find('.page-' + page)
        if($page.length){
            // page found
            w2utils.lock($page, msg)
            return true
        }
        // page with this id not found!
        return false
    }
    unlockPage(page, speed){
        let $page = $(this.box).find('.page-' + page)
        if($page.length){
            // page found
            w2utils.unlock($page, speed)
            return true
        }
        // page with this id not found!
        return false
    }
    goto(page) {
        if (this.page === page) return // already on this page
        if (page != null) this.page = page
        // if it was auto size, resize it
        if ($(this.box).data('auto-size') === true) $(this.box).height(0)
        this.refresh()
    }
    generateHTML() {
        let pages = [] // array for each page
        let group = ''
        let page
        let column
        let html
        let tabindex
        let tabindex_str
        for (let f = 0; f < this.fields.length; f++) {
            html = ''
            tabindex = this.tabindexBase + f + 1
            tabindex_str = ' tabindex="'+ tabindex +'"'
            let field = this.fields[f]
            if (field.html == null) field.html = {}
            if (field.options == null) field.options = {}
            if (field.html.caption != null && field.html.label == null) {
                console.log('NOTICE: form field.html.caption property is deprecated, please use field.html.label. Field ->', field)
                field.html.label = field.html.caption
            }
            if (field.html.label == null) field.html.label = field.field
            field.html = $.extend(true, { label: '', span: 6, attr: '', text: '', style: '', page: 0, column: 0 }, field.html)
            if (page == null) page = field.html.page
            if (column == null) column = field.html.column
            // input control
            let input = '<input id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" type="text" '+ field.html.attr + tabindex_str + '>'
            switch (field.type) {
                case 'pass':
                case 'password':
                    input = '<input id="' + field.field + '" name="' + field.field + '" class="w2ui-input" type = "password" ' + field.html.attr + tabindex_str + '>'
                    break
                case 'check':
                case 'checks': {
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    input = ''
                    // normalized options
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<label class="w2ui-box-label">'+
                                 '  <input id="' + field.field + i +'" name="' + field.field + '" class="w2ui-input" type="checkbox" ' +
                                            field.html.attr + tabindex_str + ' data-value="'+ items[i].id +'" data-index="'+ i +'">' +
                                    '<span>&#160;' + items[i].text + '</span>' +
                                 '</label><br>'
                    }
                    break
                }
                case 'checkbox':
                    input = '<label class="w2ui-box-label">'+
                            '   <input id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" type="checkbox" '+ field.html.attr + tabindex_str + '>'+
                            '   <span>'+ field.html.label +'</span>'+
                            '</label>'
                    break
                case 'radio': {
                    input = ''
                    // normalized options
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<label class="w2ui-box-label">'+
                                 '  <input id="' + field.field + i + '" name="' + field.field + '" class="w2ui-input" type = "radio" ' +
                                        field.html.attr + (i === 0 ? tabindex_str : '') + ' value="'+ items[i].id + '">' +
                                    '<span>&#160;' + items[i].text + '</span>' +
                                 '</label><br>'
                    }
                    break
                }
                case 'select': {
                    input = '<select id="' + field.field + '" name="' + field.field + '" class="w2ui-input" ' + field.html.attr + tabindex_str + '>'
                    // normalized options
                    if (field.options.items == null && field.html.items != null) field.options.items = field.html.items
                    let items = field.options.items
                    if (!Array.isArray(items)) items = []
                    if (items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                    }
                    // generate
                    for (let i = 0; i < items.length; i++) {
                        input += '<option value="'+ items[i].id + '">' + items[i].text + '</option>'
                    }
                    input += '</select>'
                    break
                }
                case 'textarea':
                    input = '<textarea id="'+ field.field +'" name="'+ field.field +'" class="w2ui-input" '+ field.html.attr + tabindex_str + '></textarea>'
                    break
                case 'toggle':
                    input = '<input id="'+ field.field +'" name="'+ field.field +'" type="checkbox" '+ field.html.attr + tabindex_str + ' class="w2ui-input w2ui-toggle"><div><div></div></div>'
                    break
                case 'map':
                case 'array':
                    field.html.key = field.html.key || {}
                    field.html.value = field.html.value || {}
                    field.html.tabindex_str = tabindex_str
                    input = '<span style="float: right">' + (field.html.text || '') + '</span>' +
                            '<input id="'+ field.field +'" name="'+ field.field +'" type="hidden" '+ field.html.attr + tabindex_str + '>'+
                            '<div class="w2ui-map-container"></div>'
                    break
                case 'div':
                case 'custom':
                    input = '<div id="'+ field.field +'" name="'+ field.field +'" '+ field.html.attr + tabindex_str + ' class="w2ui-input">'+
                                (field && field.html && field.html.html ? field.html.html : '') +
                            '</div>'
                    break
                case 'html':
                case 'empty':
                    input = (field && field.html ? (field.html.html || '') + (field.html.text || '') : '')
                    break
            }
            if (group !== '') {
                if(page != field.html.page || column != field.html.column || (field.html.group && (group != field.html.group))){
                    pages[page][column] += '\n   </div>\n  </div>'
                    group = ''
                }
            }
            if (field.html.group && (group != field.html.group)) {
                let collapsible = ''
                if (field.html.groupCollapsible) {
                    collapsible = '<span class="w2ui-icon-collapse" style="width: 15px; display: inline-block; position: relative; top: -2px;"></span>'
                }
                html += '\n <div class="w2ui-group">'
                    + '\n   <div class="w2ui-group-title" style="'+ (field.html.groupTitleStyle || '')
                                    + (collapsible != '' ? 'cursor: pointer; user-select: none' : '') + '"'
                    + (collapsible != '' ? 'data-group="' + w2utils.base64encode(field.html.group) + '"' : '')
                    + (collapsible != ''
                        ? 'onclick="w2ui[\'' + this.name + '\'].toggleGroup(\'' + field.html.group + '\')"'
                        : '')
                    + '>'
                    + collapsible + field.html.group + '</div>\n'
                    + '   <div class="w2ui-group-fields" style="'+ (field.html.groupStyle || '') +'">'
                group = field.html.group
            }
            if (field.html.anchor == null) {
                let span = (field.html.span != null ? 'w2ui-span'+ field.html.span : '')
                if (field.html.span == -1) span = 'w2ui-span-none'
                let label = '<label'+ (span == 'none' ? ' style="display: none"' : '') +'>' + w2utils.lang(field.type != 'checkbox' ? field.html.label : field.html.text) +'</label>'
                if (!field.html.label) label = ''
                html += '\n      <div class="w2ui-field '+ span +'" style="'+ (field.hidden ? 'display: none;' : '') + field.html.style +'">'+
                        '\n         '+ label +
                        ((field.type === 'empty') ? input : '\n         <div>'+ input + (field.type != 'array' && field.type != 'map' ? w2utils.lang(field.type != 'checkbox' ? field.html.text : '') : '') + '</div>') +
                        '\n      </div>'
            } else {
                pages[field.html.page].anchors = pages[field.html.page].anchors || {}
                pages[field.html.page].anchors[field.html.anchor] = '<div class="w2ui-field w2ui-field-inline" style="'+ (field.hidden ? 'display: none;' : '') + field.html.style +'">'+
                        ((field.type === 'empty') ? input : '<div>'+ w2utils.lang(field.type != 'checkbox' ? field.html.label : field.html.text) + input + w2utils.lang(field.type != 'checkbox' ? field.html.text : '') + '</div>') +
                        '</div>'
            }
            if (pages[field.html.page] == null) pages[field.html.page] = {}
            if (pages[field.html.page][field.html.column] == null) pages[field.html.page][field.html.column] = ''
            pages[field.html.page][field.html.column] += html
            page = field.html.page
            column = field.html.column
        }
        if (group !== '') pages[page][column] += '\n   </div>\n  </div>'
        if (this.tabs.tabs) {
            for (let i = 0; i < this.tabs.tabs.length; i++) if (pages[i] == null) pages[i] = []
        }
        // buttons if any
        let buttons = ''
        if (!$.isEmptyObject(this.actions)) {
            buttons += '\n<div class="w2ui-buttons">'
            tabindex = this.tabindexBase + this.fields.length + 1
            for (let a in this.actions) { // it is an object
                let act = this.actions[a]
                let info = { text: '', style: '', 'class': '' }
                if ($.isPlainObject(act)) {
                    if (act.text == null && act.caption != null) {
                        console.log('NOTICE: form action.caption property is deprecated, please use action.text. Action ->', act)
                        act.text = act.caption
                    }
                    if (act.text) info.text = act.text
                    if (act.style) info.style = act.style
                    if (act.class) info.class = act.class
                } else {
                    info.text = a
                    if (['save', 'update', 'create'].indexOf(a.toLowerCase()) !== -1) info.class = 'w2ui-btn-blue'; else info.class = ''
                }
                buttons += '\n    <button name="'+ a +'" class="w2ui-btn '+ info.class +'" style="'+ info.style +'" tabindex="'+ tabindex +'">'+
                                        w2utils.lang(info.text) +'</button>'
                tabindex++
            }
            buttons += '\n</div>'
        }
        html = ''
        for (let p = 0; p < pages.length; p++){
            html += '<div class="w2ui-page page-'+ p +'" style="' + (p !== 0 ? 'display: none;' : '') + this.pageStyle + '">'
            if (pages[p].before) {
                html += pages[p].before
            }
            html += '<div class="w2ui-column-container">'
            Object.keys(pages[p]).sort().forEach((c, ind) => {
                if (c == parseInt(c)) {
                    html += '<div class="w2ui-column col-'+ c +'">' + (pages[p][c] || '') + '\n</div>'
                }
            })
            html += '\n</div>'
            if (pages[p].after) {
                html += pages[p].after
            }
            html += '\n</div>'
            // process page anchors
            if (pages[p].anchors) {
                Object.keys(pages[p].anchors).forEach((key, ind) => {
                    html = html.replace(key, pages[p].anchors[key])
                })
            }
        }
        html += buttons
        return html
    }
    toggleGroup(groupName, show) {
        let el = $(this.box).find('.w2ui-group-title[data-group="' + w2utils.base64encode(groupName) + '"]')
        if (el.next().css('display') == 'none' && show !== true) {
            el.next().slideDown(300)
            el.next().next().remove()
            el.find('span').addClass('w2ui-icon-collapse').removeClass('w2ui-icon-expand')
        } else {
            el.next().slideUp(300)
            let css = 'width: ' + el.next().css('width') + ';'
               + 'padding-left: ' + el.next().css('padding-left') + ';'
               + 'padding-right: ' + el.next().css('padding-right') + ';'
               + 'margin-left: ' + el.next().css('margin-left') + ';'
               + 'margin-right: ' + el.next().css('margin-right') + ';'
            setTimeout(() => { el.next().after('<div style="height: 5px;'+ css +'"></div>') }, 100)
            el.find('span').addClass('w2ui-icon-expand').removeClass('w2ui-icon-collapse')
        }
    }
    action(action, event) {
        let act = this.actions[action]
        let click = act
        if ($.isPlainObject(act) && act.onClick) click = act.onClick
        // event before
        let edata = this.trigger({ phase: 'before', target: action, type: 'action', action: act, originalEvent: event })
        if (edata.isCancelled === true) return
        // default actions
        if (typeof click === 'function') click.call(this, event)
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
    }
    resize() {
        let obj = this
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'resize' })
        if (edata.isCancelled === true) return
        // default behaviour
        let main = $(this.box).find('> div.w2ui-form-box')
        let header = $(this.box).find('> div .w2ui-form-header')
        let toolbar = $(this.box).find('> div .w2ui-form-toolbar')
        let tabs = $(this.box).find('> div .w2ui-form-tabs')
        let page = $(this.box).find('> div .w2ui-page')
        let cpage = $(this.box).find('> div .w2ui-page.page-'+ this.page)
        let dpage = $(this.box).find('> div .w2ui-page.page-'+ this.page + ' > div')
        let buttons = $(this.box).find('> div .w2ui-buttons')
        // if no height, calculate it
        resizeElements()
        if (this.autosize) { //we don't need auto-size every time
            if (parseInt($(this.box).height()) === 0 || $(this.box).data('auto-size') === true) {
                $(this.box).height(
                    (header.length > 0 ? w2utils.getSize(header, 'height') : 0) +
                    ((typeof this.tabs === 'object' && Array.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') : 0) +
                    ((typeof this.toolbar === 'object' && Array.isArray(this.toolbar.items) && this.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0) +
                    (page.length > 0 ? w2utils.getSize(dpage, 'height') + w2utils.getSize(cpage, '+height') + 12 : 0) + // why 12 ???
                    (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0)
                )
                $(this.box).data('auto-size', true)
            }
            resizeElements()
        }
        if (this.toolbar && this.toolbar.resize) this.toolbar.resize()
        if (this.tabs && this.tabs.resize) this.tabs.resize()
        // event after
        obj.trigger($.extend(edata, { phase: 'after' }))
        function resizeElements() {
            // resize elements
            main.width($(obj.box).width()).height($(obj.box).height())
            toolbar.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0))
            tabs.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                          + ((typeof obj.toolbar === 'object' && Array.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') : 0))
            page.css('top', (obj.header !== '' ? w2utils.getSize(header, 'height') : 0)
                          + ((typeof obj.toolbar === 'object' && Array.isArray(obj.toolbar.items) && obj.toolbar.items.length > 0) ? w2utils.getSize(toolbar, 'height') + 5 : 0)
                          + ((typeof obj.tabs === 'object' && Array.isArray(obj.tabs.tabs) && obj.tabs.tabs.length > 0) ? w2utils.getSize(tabs, 'height') + 5 : 0))
            page.css('bottom', (buttons.length > 0 ? w2utils.getSize(buttons, 'height') : 0))
        }
    }
    refresh() {
        let time = (new Date()).getTime()
        let obj = this
        if (!this.box) return
        if (!this.isGenerated || $(this.box).html() == null) return
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page, field: arguments[0], fields: arguments })
        if (edata.isCancelled === true) return
        let fields = Array.from(this.fields.keys())
        if (arguments.length > 0) {
            fields = Array.from(arguments)
                .map((fld, ind) => {
                    if (typeof fld != 'string') console.log('ERROR: Arguments in refresh functions should be field names')
                    return this.get(fld, true) // get index of field
                })
                .filter((fld, ind) => {
                    if (fld != null) return true; else return false
                })
        } else {
            // update what page field belongs
            $(this.box).find('input, textarea, select').each((index, el) => {
                let name = ($(el).attr('name') != null ? $(el).attr('name') : $(el).attr('id'))
                let field = obj.get(name)
                if (field) {
                    // find page
                    let div = $(el).closest('.w2ui-page')
                    if (div.length > 0) {
                        for (let i = 0; i < 100; i++) {
                            if (div.hasClass('page-'+i)) { field.page = i; break }
                        }
                    }
                }
            })
            // default action
            $(this.box).find('.w2ui-page').hide()
            $(this.box).find('.w2ui-page.page-' + this.page).show()
            $(this.box).find('.w2ui-form-header').html(this.header)
            // refresh tabs if needed
            if (typeof this.tabs === 'object' && Array.isArray(this.tabs.tabs) && this.tabs.tabs.length > 0) {
                $('#form_'+ this.name +'_tabs').show()
                this.tabs.active = this.tabs.tabs[this.page].id
                this.tabs.refresh()
            } else {
                $('#form_'+ this.name +'_tabs').hide()
            }
            // refresh tabs if needed
            if (typeof this.toolbar === 'object' && Array.isArray(this.toolbar.items) && this.toolbar.items.length > 0) {
                $('#form_'+ this.name +'_toolbar').show()
                this.toolbar.refresh()
            } else {
                $('#form_'+ this.name +'_toolbar').hide()
            }
        }
        // refresh values of fields
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            if (field.name == null && field.field != null) field.name = field.field
            if (field.field == null && field.name != null) field.field = field.name
            field.$el = $(this.box).find('[name="'+ String(field.name).replace(/\\/g, '\\\\') +'"]')
            field.el = field.$el[0]
            if (field.el) field.el.id = field.name
            let tmp = $(field).data('w2field')
            if (tmp) tmp.clear()
            $(field.$el)
                .off('.w2form')
                .on('change.w2form', function(event) {
                    let that = this
                    let field = obj.get(this.name)
                    if (field == null) return
                    if ($(this).data('skip_change') == true) {
                        $(this).data('skip_change', false)
                        return
                    }
                    let value_new = this.value
                    let value_previous = obj.getValue(this.name)
                    if (value_previous == null) value_previous = ''
                    if (['list', 'enum', 'file'].indexOf(field.type) !== -1 && $(this).data('selected')) {
                        let nv = $(this).data('selected')
                        let cv = obj.getValue(this.name)
                        if (Array.isArray(nv)) {
                            value_new = []
                            for (let i = 0; i < nv.length; i++) value_new[i] = $.extend(true, {}, nv[i]) // clone array
                        }
                        if ($.isPlainObject(nv)) {
                            value_new = $.extend(true, {}, nv) // clone object
                        }
                        if (Array.isArray(cv)) {
                            value_previous = []
                            for (let i = 0; i < cv.length; i++) value_previous[i] = $.extend(true, {}, cv[i]) // clone array
                        }
                        if ($.isPlainObject(cv)) {
                            value_previous = $.extend(true, {}, cv) // clone object
                        }
                    }
                    if (['toggle', 'checkbox'].indexOf(field.type) !== -1) {
                        value_new = ($(this).prop('checked') ? ($(this).prop('value') === 'on' ? true : $(this).prop('value')) : false)
                    }
                    if (['check', 'checks'].indexOf(field.type) !== -1) {
                        if (!Array.isArray(value_previous)) value_previous = []
                        value_new = value_previous.slice()
                        let tmp = field.options.items[$(this).attr('data-index')]
                        if ($(this).prop('checked')) {
                            value_new.push(tmp.id)
                        } else {
                            value_new.splice(value_new.indexOf(tmp.id), 1)
                        }
                    }
                    // clean extra chars
                    if (['int', 'float', 'percent', 'money', 'currency'].indexOf(field.type) !== -1) {
                        value_new = $(this).data('w2field').clean(value_new)
                    }
                    if (value_new === value_previous) return
                    // event before
                    let edata2 = obj.trigger({ phase: 'before', target: this.name, type: 'change', value_new: value_new, value_previous: value_previous, originalEvent: event })
                    if (edata2.isCancelled === true) {
                        edata2.value_new = obj.getValue(this.name)
                        if ($(this).val() !== edata2.value_new) {
                            $(this).data('skip_change', true)
                            // if not immediate, then ignore it
                            setTimeout(() => { $(that).data('skip_change', false) }, 10)
                        }
                        $(this).val(edata2.value_new) // return previous value
                    }
                    // default action
                    let val = edata2.value_new
                    if (['enum', 'file'].indexOf(field.type) !== -1) {
                        if (val.length > 0) {
                            let fld = $(field.el).data('w2field').helpers.multi
                            $(fld).removeClass('w2ui-error')
                        }
                    }
                    if (val === '' || val == null
                            || (Array.isArray(val) && val.length === 0) || ($.isPlainObject(val) && $.isEmptyObject(val))) {
                        val = null
                    }
                    obj.setValue(this.name, val)
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
                .on('input.w2form', function(event) {
                    let val = this.value
                    if (event.target.type == 'checkbox') {
                        val = event.target.checked
                    }
                    // remember original
                    if (obj.original == null) {
                        if (!$.isEmptyObject(obj.record)) {
                            obj.original = $.extend(true, {}, obj.record)
                        } else {
                            obj.original = {}
                        }
                    }
                    // event before
                    let edata2 = obj.trigger({ phase: 'before', target: this.name, type: 'input', value_new: val, originalEvent: event })
                    if (edata2.isCancelled === true) return
                    // event after
                    obj.trigger($.extend(edata2, { phase: 'after' }))
                })
            // required
            if (field.required) {
                $(field.el).parent().parent().addClass('w2ui-required')
            } else {
                $(field.el).parent().parent().removeClass('w2ui-required')
            }
            // disabled
            if (field.disabled != null) {
                let $fld = $(field.el)
                if (field.disabled) {
                    if ($fld.data('w2ui-tabIndex') == null) {
                        $fld.data('w2ui-tabIndex', $fld.prop('tabIndex'))
                    }
                    $(field.el)
                        .prop('readonly', true)
                        .prop('tabindex', -1)
                        .closest('.w2ui-field')
                        .addClass('w2ui-disabled')
                } else {
                    $(field.el)
                        .prop('readonly', false)
                        .prop('tabIndex', $fld.data('w2ui-tabIndex'))
                        .closest('.w2ui-field')
                        .removeClass('w2ui-disabled')
                }
            }
            // hidden
            tmp = field.el
            if (!tmp) tmp = $(this.box).find('#' + field.field)
            if (field.hidden) {
                $(tmp).closest('.w2ui-field').hide()
            } else {
                $(tmp).closest('.w2ui-field').show()
            }
        }
        // attach actions on buttons
        $(this.box).find('button, input[type=button]').each((index, el) => {
            $(el).off('click').on('click', function(event) {
                let action = this.value
                if (this.id) action = this.id
                if (this.name) action = this.name
                obj.action(action, event)
            })
        })
        // init controls with record
        for (let f = 0; f < fields.length; f++) {
            let field = this.fields[fields[f]]
            let value = (this.getValue(field.name) != null ? this.getValue(field.name) : '')
            if (!field.el) continue
            if (!$(field.el).hasClass('w2ui-input')) $(field.el).addClass('w2ui-input')
            field.type = String(field.type).toLowerCase()
            if (!field.options) field.options = {}
            switch (field.type) {
                case 'text':
                case 'textarea':
                case 'email':
                case 'pass':
                case 'password':
                    field.el.value = value
                    break
                case 'int':
                case 'float':
                case 'money':
                case 'currency':
                case 'percent':
                    // issue #761
                    field.el.value = value
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
                case 'hex':
                case 'alphanumeric':
                case 'color':
                case 'date':
                case 'time':
                    field.el.value = value
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
                case 'toggle':
                    if (w2utils.isFloat(value)) value = parseFloat(value)
                    $(field.el).prop('checked', (value ? true : false))
                    this.setValue(field.name, (value ? value : false))
                    break
                case 'radio':
                    $(field.$el).prop('checked', false).each((index, el) => {
                        if ($(el).val() == value) $(el).prop('checked', true)
                    })
                    break
                case 'checkbox':
                    $(field.el).prop('checked', value ? true : false)
                    if (field.disabled === true || field.disabled === false) {
                        $(field.el).prop('disabled', field.disabled ? true : false)
                    }
                    break
                case 'check':
                case 'checks':
                    if (Array.isArray(value)) {
                        value.forEach((val) => {
                            $(field.el).closest('div').find('[data-value="' + val + '"]').prop('checked', true)
                        })
                    }
                    if (field.disabled) {
                        $(field.el).closest('div').find('input[type=checkbox]').prop('disabled', true)
                    } else {
                        $(field.el).closest('div').find('input[type=checkbox]').removeProp('disabled')
                    }
                    break
                // enums
                case 'list':
                case 'combo':
                    if (field.type === 'list') {
                        let tmp_value = ($.isPlainObject(value) ? value.id : ($.isPlainObject(field.options.selected) ? field.options.selected.id : value))
                        // normalized options
                        if (!field.options.items) field.options.items = []
                        let items = field.options.items
                        if (typeof items == 'function') items = items()
                        // find value from items
                        let isFound = false
                        if (Array.isArray(items)) {
                            for (let i = 0; i < items.length; i++) {
                                let item = items[i]
                                if (item.id == tmp_value) {
                                    value = $.extend(true, {}, item)
                                    obj.setValue(field.name, value)
                                    isFound = true
                                    break
                                }
                            }
                        }
                        if (!isFound && value != null && value !== '') {
                            field.$el.data('find_selected', value)
                        }
                    } else if (field.type === 'combo' && !$.isPlainObject(value)) {
                        field.el.value = value
                    } else if ($.isPlainObject(value) && value.text != null) {
                        field.el.value = value.text
                    } else {
                        field.el.value = ''
                    }
                    if (!$.isPlainObject(value)) value = {}
                    $(field.el).w2field($.extend({}, field.options, { type: field.type, selected: value }))
                    break
                case 'enum':
                case 'file':
                    let sel = []
                    let isFound = false
                    if (!Array.isArray(value)) value = []
                    if (typeof field.options.items != 'function') {
                        if (!Array.isArray(field.options.items)) {
                            field.options.items = []
                        }
                        // find value from items
                        value.forEach((val) => {
                            field.options.items.forEach((it) => {
                                if (it && (it.id == val || ($.isPlainObject(val) && it.id == val.id))) {
                                    sel.push($.isPlainObject(it) ? $.extend(true, {}, it) : it)
                                    isFound = true
                                }
                            })
                        })
                    }
                    if (!isFound && value != null && value.length !== 0) {
                        field.$el.data('find_selected', value)
                        sel = value
                    }
                    let opt = $.extend({}, field.options, { type: field.type, selected: sel })
                    Object.keys(field.options).forEach((key) => {
                        if (typeof field.options[key] == 'function') {
                            opt[key] = field.options[key]
                        }
                    })
                    $(field.el).w2field(opt)
                    break
                // standard HTML
                case 'select': {
                    // generate options
                    let items = field.options.items
                    if (items != null && items.length > 0) {
                        items = w2utils.normMenu.call(this, items, field)
                        $(field.el).html('')
                        for (let it = 0; it < items.length; it++) {
                            $(field.el).append('<option value="'+ items[it].id +'">' + items[it].text + '</option')
                        }
                    }
                    $(field.el).val(value)
                    break
                }
                case 'map':
                case 'array':
                    // init map
                    if (field.type == 'map' && (value == null || !$.isPlainObject(value))) {
                        this.setValue(field.field, {})
                        value = this.getValue(field.field)
                    }
                    if (field.type == 'array' && (value == null || !Array.isArray(value))) {
                        this.setValue(field.field, [])
                        value = this.getValue(field.field)
                    }
                    // need closure
                    (function closure(obj, field) {
                        field.el.mapAdd = function(field, div, cnt) {
                            let attr = (field.disabled ? ' readOnly ' : '') + (field.html.tabindex_str || '')
                            let html = '<div class="w2ui-map-field" style="margin-bottom: 5px">'+
                                '<input id="'+ field.field +'_key_'+ cnt +'" data-cnt="'+ cnt +'" type="text" '+ field.html.key.attr + attr +' class="w2ui-input w2ui-map key">'+
                                    (field.html.key.text || '') +
                                '<input id="'+ field.field +'_value_'+ cnt +'" data-cnt="'+ cnt +'" type="text" '+ field.html.value.attr + attr +' class="w2ui-input w2ui-map value">'+
                                    (field.html.value.text || '') +
                                '</div>'
                            div.append(html)
                        }
                        field.el.mapRefresh = function(map, div) {
                            // generate options
                            let cnt = 1
                            let names
                            if (field.type == 'map') {
                                if (!$.isPlainObject(map)) map = {}
                                if (map._order == null) map._order = Object.keys(map)
                                names = map._order
                            }
                            if (field.type == 'array') {
                                if (!Array.isArray(map)) map = []
                                names = map.map((item) => { return item.key })
                            }
                            let $k, $v
                            names.forEach((item) => {
                                $k = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt)
                                $v = div.find('#' + w2utils.escapeId(field.name) + '_value_' + cnt)
                                if ($k.length == 0 || $v.length == 0) {
                                    field.el.mapAdd(field, div, cnt)
                                    $k = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt)
                                    $v = div.find('#' + w2utils.escapeId(field.name) + '_value_' + cnt)
                                }
                                let val = map[item]
                                if (field.type == 'array') {
                                    let tmp = map.filter((it) => { return it.key == item ? true : false})
                                    if (tmp.length > 0) val = tmp[0].value
                                }
                                $k.val(item)
                                $v.val(val)
                                if (field.disabled === true || field.disabled === false) {
                                    $k.prop('readOnly', field.disabled ? true : false)
                                    $v.prop('readOnly', field.disabled ? true : false)
                                }
                                $k.parents('.w2ui-map-field').attr('data-key', item)
                                cnt++
                            })
                            let curr = div.find('#' + w2utils.escapeId(field.name) + '_key_' + cnt).parent()
                            let next = div.find('#' + w2utils.escapeId(field.name) + '_key_' + (cnt + 1)).parent()
                            // if not disabled - show next
                            if (curr.length === 0 && !($k && ($k.prop('readOnly') === true || $k.prop('disabled') === true))) {
                                field.el.mapAdd(field, div, cnt)
                            }
                            if (curr.length == 1 && next.length == 1) {
                                curr.removeAttr('data-key')
                                curr.find('.key').val(next.find('.key').val())
                                curr.find('.value').val(next.find('.value').val())
                                next.remove()
                            }
                            if (field.disabled === true || field.disabled === false) {
                                curr.find('.key').prop('readOnly', field.disabled ? true : false)
                                curr.find('.value').prop('readOnly', field.disabled ? true : false)
                            }
                            // attach events
                            $(field.el).next().find('input.w2ui-map')
                                .off('.mapChange')
                                .on('keyup.mapChange', function(event) {
                                    let $div = $(event.target).parents('.w2ui-map-field')
                                    if (event.keyCode == 13) {
                                        $div.next().find('input.key').focus()
                                    }
                                })
                                .on('change.mapChange', function() {
                                    let $div = $(event.target).parents('.w2ui-map-field')
                                    let old = $div.attr('data-key')
                                    let key = $div.find('.key').val()
                                    let value = $div.find('.value').val()
                                    // event before
                                    let value_new = {}
                                    let value_previous = {}
                                    let aMap = null
                                    let aIndex = null
                                    value_new[key] = value
                                    if (field.type == 'array') {
                                        map.forEach((it, ind) => {
                                            if (it.key == old) aIndex = ind
                                        })
                                        aMap = map[aIndex]
                                    }
                                    if (old != null && field.type == 'map') {
                                        value_previous[old] = map[old]
                                    }
                                    if (old != null && field.type == 'array') {
                                        value_previous[old] = aMap.value
                                    }
                                    let edata = obj.trigger({ phase: 'before', target: field.field, type: 'change', originalEvent: event, value_new: value_new, value_previous: value_previous })
                                    if (edata.isCancelled === true) {
                                        return
                                    }
                                    if (field.type == 'map') {
                                        delete map[old]
                                        let ind = map._order.indexOf(old)
                                        if (key != '') {
                                            if (map[key] != null) {
                                                let newKey, more = 0
                                                do { more++; newKey = key + more } while (map[newKey] != null)
                                                key = newKey
                                                $div.find('.key').val(newKey)
                                            }
                                            map[key] = value
                                            $div.attr('data-key', key)
                                            if (ind != -1) {
                                                map._order[ind] = key
                                            } else {
                                                map._order.push(key)
                                            }
                                        } else {
                                            map._order.splice(ind, 1)
                                            $div.find('.value').val('')
                                        }
                                    } else if (field.type == 'array') {
                                        if (key != '') {
                                            if (aMap == null) {
                                                map.push({ key: key, value: value })
                                            } else {
                                                aMap.key = key
                                                aMap.value = value
                                            }
                                        } else {
                                            map.splice(aIndex, 1)
                                        }
                                    }
                                    obj.setValue(field.field, map)
                                    field.el.mapRefresh(map, div)
                                    // event after
                                    obj.trigger($.extend(edata, { phase: 'after' }))
                                })
                        }
                        field.el.mapRefresh(value, $(field.el).parent().find('.w2ui-map-container'))
                    })(this, field)
                    break
                case 'div':
                case 'custom':
                    $(field.el).html(value)
                    break
                case 'html':
                case 'empty':
                    break
                default:
                    $(field.el).val(value)
                    $(field.el).w2field($.extend({}, field.options, { type: field.type }))
                    break
            }
        }
        // wrap pages in div
        let tmp = $(this.box).find('.w2ui-page')
        for (let i = 0; i < tmp.length; i++) {
            if ($(tmp[i]).find('> *').length > 1) $(tmp[i]).wrapInner('<div></div>')
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        this.resize()
        return (new Date()).getTime() - time
    }
    render(box) {
        let time = (new Date()).getTime()
        let obj = this
        if (typeof box === 'object') {
            // remove from previous box
            if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
                $(this.box).removeAttr('name')
                    .removeClass('w2ui-reset w2ui-form')
                    .html('')
            }
            this.box = box
        }
        if (!this.isGenerated) return
        if (!this.box) return
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (box != null ? box : this.box) })
        if (edata.isCancelled === true) return
        let html = '<div class="w2ui-form-box">' +
                    (this.header !== '' ? '<div class="w2ui-form-header">' + this.header + '</div>' : '') +
                    '    <div id="form_'+ this.name +'_toolbar" class="w2ui-form-toolbar" style="display: none"></div>' +
                    '    <div id="form_'+ this.name +'_tabs" class="w2ui-form-tabs" style="display: none"></div>' +
                        this.formHTML +
                    '</div>'
        $(this.box).attr('name', this.name)
            .addClass('w2ui-reset w2ui-form')
            .html(html)
        if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style
        // init toolbar regardless it is defined or not
        if (typeof this.toolbar.render !== 'function') {
            this.toolbar = new w2toolbar($.extend({}, this.toolbar, { name: this.name +'_toolbar', owner: this }))
            this.toolbar.on('click', function(event) {
                let edata = obj.trigger({ phase: 'before', type: 'toolbar', target: event.target, originalEvent: event })
                if (edata.isCancelled === true) return
                // no default action
                obj.trigger($.extend(edata, { phase: 'after' }))
            })
        }
        if (typeof this.toolbar === 'object' && typeof this.toolbar.render === 'function') {
            this.toolbar.render($('#form_'+ this.name +'_toolbar')[0])
        }
        // init tabs regardless it is defined or not
        if (typeof this.tabs.render !== 'function') {
            this.tabs = new w2tabs($.extend({}, this.tabs, { name: this.name +'_tabs', owner: this, active: this.tabs.active }))
            this.tabs.on('click', function(event) {
                obj.goto(this.get(event.target, true))
            })
        }
        if (typeof this.tabs === 'object' && typeof this.tabs.render === 'function') {
            this.tabs.render($('#form_'+ this.name +'_tabs')[0])
            if(this.tabs.active) this.tabs.click(this.tabs.active)
        }
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        // after render actions
        this.resize()
        let url = (typeof this.url !== 'object' ? this.url : this.url.get)
        if (url && this.recid !== 0 && this.recid != null) {
            this.request()
        } else {
            this.refresh()
        }
        // attach to resize event
        if ($('.w2ui-layout').length === 0) { // if there is layout, it will send a resize event
            this.tmp_resize = function tmp_resize(event) {
                if (w2ui[obj.name] == null) {
                    $(window).off('resize.w2uiResize', obj.tmp_resize)
                } else {
                    w2ui[obj.name].resize()
                }
            }
            $(window).off('resize.w2uiResize').on('resize.w2uiResize', obj.tmp_resize)
        }
        // focus on load
        function focusEl() {
            let inputs = $(obj.box).find('div:not(.w2ui-field-helper) > input, select, textarea, div > label:nth-child(1) > :radio').not('.file-input')
            if (inputs.length > obj.focus) inputs[obj.focus].focus()
        }
        if (this.focus != -1) {
            setTimeout(() => {
                // if not rendered in 10ms, then wait 500ms
                if ($(obj.box).find('input, select, textarea').length === 0) {
                    setTimeout(focusEl, 500) // need timeout to allow form to render
                } else {
                    obj.applyFocus()
                }
            }, 50)
        }
        return (new Date()).getTime() - time
    }
    applyFocus() {
        let focus = this.focus
        let inputs = $(this.box).find('div:not(.w2ui-field-helper) > input, select, textarea, div > label:nth-child(1) > :radio').not('.file-input')
        // find visible
        while ($(inputs[focus]).is(':hidden') && inputs.length >= focus) {
            focus++
        }
        if (inputs[focus]) inputs[focus].focus()
    }
    destroy() {
        // event before
        let edata = this.trigger({ phase: 'before', target: this.name, type: 'destroy' })
        if (edata.isCancelled === true) return
        // clean up
        if (typeof this.toolbar === 'object' && this.toolbar.destroy) this.toolbar.destroy()
        if (typeof this.tabs === 'object' && this.tabs.destroy) this.tabs.destroy()
        if ($(this.box).find('#form_'+ this.name +'_tabs').length > 0) {
            $(this.box)
                .removeAttr('name')
                .removeClass('w2ui-reset w2ui-form')
                .html('')
        }
        delete w2ui[this.name]
        // event after
        this.trigger($.extend(edata, { phase: 'after' }))
        $(window).off('resize', 'body')
    }
}
// Register jQuery plugins
(function($) {
    // if jQuery is not defined, then exit
    if (!$) return
    $.fn.w2render = function(name) {
        if ($(this).length > 0) {
            if (typeof name === 'string' && w2ui[name]) w2ui[name].render($(this)[0])
            if (typeof name === 'object') name.render($(this)[0])
        }
    }
    $.fn.w2destroy = function(name) {
        if (!name && this.length > 0) name = this.attr('name')
        if (typeof name === 'string' && w2ui[name]) w2ui[name].destroy()
        if (typeof name === 'object') name.destroy()
    }
    $.fn.w2field = function(type, options) {
        // if without arguments - return the object
        if (arguments.length === 0) {
            let obj = $(this).data('w2field')
            return obj
        }
        return this.each((index, el) => {
            let obj = $(el).data('w2field')
            // if object is not defined, define it
            if (obj == null) {
                obj = new w2field(type, options)
                obj.render(el)
                return obj
            } else { // fully re-init
                obj.clear()
                if (type === 'clear') return
                obj = new w2field(type, options)
                obj.render(el)
                return obj
            }
            return null
        })
    }
    $.fn.w2form     = function(options) { return proc.call(this, options, 'w2form') }
    $.fn.w2grid     = function(options) { return proc.call(this, options, 'w2grid') }
    $.fn.w2layout   = function(options) { return proc.call(this, options, 'w2layout') }
    $.fn.w2sidebar  = function(options) { return proc.call(this, options, 'w2sidebar') }
    $.fn.w2tabs     = function(options) { return proc.call(this, options, 'w2tabs') }
    $.fn.w2toolbar  = function(options) { return proc.call(this, options, 'w2toolbar') }
    function proc(options, type) {
        if ($.isPlainObject(options)) {
            let obj
            if (type == 'w2form')       obj = new w2form(options)
            if (type == 'w2grid')       obj = new w2grid(options)
            if (type == 'w2layout')     obj = new w2layout(options)
            if (type == 'w2sidebar')    obj = new w2sidebar(options)
            if (type == 'w2tabs')       obj = new w2tabs(options)
            if (type == 'w2toolbar')    obj = new w2toolbar(options)
            if ($(this).length !== 0) {
                obj.render(this[0])
            }
            return obj
        } else {
            let obj = w2ui[$(this).attr('name')]
            if (!obj) return null
            if (arguments.length > 0) {
                if (obj[options]) obj[options].apply(obj, Array.prototype.slice.call(arguments, 1))
                return this
            } else {
                return obj
            }
        }
    }
    $.fn.w2popup = function(options) {
        if (this.length > 0 ) {
            w2popup.template(this[0], null, options)
        }
    }
    $.fn.w2marker = function() {
        let str = Array.prototype.slice.call(arguments, 0)
        if (Array.isArray(str[0])) str = str[0]
        if (str.length === 0 || !str[0]) { // remove marker
            return $(this).each(clearMarkedText)
        } else { // add marker
            return $(this).each((index, el) => {
                clearMarkedText(index, el)
                for (let s = 0; s < str.length; s++) {
                    let tmp = str[s]
                    if (typeof tmp !== 'string') tmp = String(tmp)
                    // escape regex special chars
                    tmp = tmp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/&/g, '&amp;').replace(/</g, '&gt;').replace(/>/g, '&lt;')
                    let regex = new RegExp(tmp + '(?!([^<]+)?>)', 'gi') // only outside tags
                    el.innerHTML = el.innerHTML.replace(regex, replaceValue)
                }
                function replaceValue(matched) { // mark new
                    return '<span class="w2ui-marker">' + matched + '</span>'
                }
            })
        }
        function clearMarkedText(index, el) {
            while (el.innerHTML.indexOf('<span class="w2ui-marker">') !== -1) {
                el.innerHTML = el.innerHTML.replace(/\<span class=\"w2ui\-marker\"\>((.|\n|\r)*)\<\/span\>/ig, '$1') // unmark
            }
        }
    }
    // -- w2tag - there can be multiple on screen at a time
    $.fn.w2tag = function(text, options) {
        // only one argument
        if (arguments.length === 1 && typeof text === 'object') {
            options = text
            if (options.html != null) text = options.html
        }
        // default options
        options = $.extend({
            id              : null, // id for the tag, otherwise input id is used
            auto            : null, // if auto true, then tag will show on mouseEnter and hide on mouseLeave
            html            : text, // or html
            position        : 'right|top', // can be left, right, top, bottom
            align           : 'none', // can be none, left, right (only works for potision: top | bottom)
            left            : 0, // delta for left coordinate
            top             : 0, // delta for top coordinate
            maxWidth        : null, // max width
            style           : '', // adition style for the tag
            css             : {}, // add css for input when tag is shown
            className       : '', // add class bubble
            inputClass      : '', // add class for input when tag is shown
            onShow          : null, // callBack when shown
            onHide          : null, // callBack when hidden
            hideOnKeyPress  : true, // hide tag if key pressed
            hideOnFocus     : false, // hide tag on focus
            hideOnBlur      : false, // hide tag on blur
            hideOnClick     : false, // hide tag on document click
            hideOnChange    : true
        }, options)
        if (options.name != null && options.id == null) options.id = options.name
        // for backward compatibility
        if (options.class !== '' && options.inputClass === '') options.inputClass = options.class
        // remove all tags
        if ($(this).length === 0) {
            $('.w2ui-tag').each((index, el) => {
                let tag = $(el).data('w2tag')
                if (tag) tag.hide()
            })
            return
        }
        if (options.auto === true || options.showOn != null || options.hideOn != null) {
            if (arguments.length == 0 || !text) {
                return $(this).each((index, el) => {
                    $(el).off('.w2tooltip')
                })
            } else {
                return $(this).each((index, el) => {
                    let showOn = 'mouseenter', hideOn = 'mouseleave'
                    if (options.showOn) {
                        showOn = String(options.showOn).toLowerCase()
                        delete options.showOn
                    }
                    if (options.hideOn) {
                        hideOn = String(options.hideOn).toLowerCase()
                        delete options.hideOn
                    }
                    if (!options.potision) { options.position = 'top|bottom' }
                    $(el)
                        .off('.w2tooltip')
                        .on(showOn + '.w2tooltip', function tooltip() {
                            options.auto = false
                            $(this).w2tag(text, options)
                        })
                        .on(hideOn + '.w2tooltip', function tooltip() {
                            $(this).w2tag()
                        })
                })
            }
        } else {
            return $(this).each((index, el) => {
                // main object
                let tag
                let origID = (options.id ? options.id : el.id)
                if (origID == '') { // search for an id
                    origID = $(el).find('input').attr('id')
                }
                if (!origID) {
                    origID = 'noid'
                }
                let tmpID = w2utils.escapeId(origID)
                if ($(this).data('w2tag') != null) {
                    tag = $(this).data('w2tag')
                    $.extend(tag.options, options)
                } else {
                    tag = {
                        id        : origID,
                        attachedTo: el, // element attached to
                        box       : $('#w2ui-tag-' + tmpID), // tag itself
                        options   : $.extend({}, options),
                        // methods
                        init      : init, // attach events
                        hide      : hide, // hide tag
                        getPos    : getPos, // gets position of tag
                        isMoved   : isMoved, // if called, will adjust position
                        // internal
                        tmp       : {} // for temp variables
                    }
                }
                // show or hide tag
                if (text === '' || text == null) {
                    tag.hide()
                } else if (tag.box.length !== 0) {
                    // if already present
                    tag.box.find('.w2ui-tag-body')
                        .css(tag.options.css)
                        .attr('style', tag.options.style)
                        .addClass(tag.options.className)
                        .html(tag.options.html)
                } else {
                    tag.tmp.originalCSS = ''
                    if ($(tag.attachedTo).length > 0) tag.tmp.originalCSS = $(tag.attachedTo)[0].style.cssText
                    let tagStyles = 'white-space: nowrap;'
                    if (tag.options.maxWidth && w2utils.getStrWidth(text) > tag.options.maxWidth) {
                        tagStyles = 'width: '+ tag.options.maxWidth + 'px'
                    }
                    // insert
                    $('body').append(
                        '<div onclick="event.stopPropagation()" style="display: none;" id="w2ui-tag-'+ tag.id +'" '+
                        '       class="w2ui-tag '+ ($(tag.attachedTo).parents('.w2ui-popup, .w2ui-overlay-popup, .w2ui-message').length > 0 ? 'w2ui-tag-popup' : '') + '">'+
                        '   <div style="margin: -2px 0px 0px -2px; '+ tagStyles +'">'+
                        '      <div class="w2ui-tag-body '+ tag.options.className +'" style="'+ (tag.options.style || '') +'">'+ text +'</div>'+
                        '   </div>' +
                        '</div>')
                    tag.box = $('#w2ui-tag-' + tmpID)
                    $(tag.attachedTo).data('w2tag', tag) // make available to element tag attached to
                    setTimeout(init, 1)
                }
                return
                function init() {
                    tag.box.css('display', 'block')
                    if (!tag || !tag.box || !$(tag.attachedTo).offset()) return
                    let pos = tag.getPos()
                    tag.box.css({
                        opacity : '1',
                        left    : pos.left + 'px',
                        top     : pos.top + 'px'
                    })
                        .data('w2tag', tag)
                        .find('.w2ui-tag-body').addClass(pos.posClass)
                    tag.tmp.pos = pos.left + 'x' + pos.top
                    $(tag.attachedTo)
                        .off('.w2tag')
                        .css(tag.options.css)
                        .addClass(tag.options.inputClass)

                    if (tag.options.hideOnKeyPress) {
                        $(tag.attachedTo).on('keypress.w2tag', tag.hide)
                    }
                    if (tag.options.hideOnFocus) {
                        $(tag.attachedTo).on('focus.w2tag', tag.hide)
                    }
                    if (options.hideOnChange) {
                        if (el.nodeName === 'INPUT') {
                            $(el).on('change.w2tag', tag.hide)
                        } else {
                            $(el).find('input').on('change.w2tag', tag.hide)
                        }
                    }
                    if (tag.options.hideOnBlur) {
                        $(tag.attachedTo).on('blur.w2tag', tag.hide)
                    }
                    if (tag.options.hideOnClick) {
                        $('body').on('click.w2tag' + (tag.id || ''), tag.hide)
                    }
                    if (typeof tag.options.onShow === 'function') {
                        tag.options.onShow()
                    }
                    isMoved()
                }
                // bind event to hide it
                function hide() {
                    if (tag.box.length <= 0) return
                    if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
                    tag.box.remove()
                    if (tag.options.hideOnClick) {
                        $('body').off('.w2tag' + (tag.id || ''))
                    }
                    $(tag.attachedTo).off('.w2tag')
                        .removeClass(tag.options.inputClass)
                        .removeData('w2tag')
                    // restore original CSS
                    if ($(tag.attachedTo).length > 0) {
                        $(tag.attachedTo)[0].style.cssText = tag.tmp.originalCSS
                    }
                    if (typeof tag.options.onHide === 'function') {
                        tag.options.onHide()
                    }
                }
                function isMoved(instant) {
                    // monitor if destroyed
                    let offset = $(tag.attachedTo).offset()
                    if ($(tag.attachedTo).length === 0 || (offset.left === 0 && offset.top === 0) || tag.box.find('.w2ui-tag-body').length === 0) {
                        tag.hide()
                        return
                    }
                    let pos = getPos()
                    if (tag.tmp.pos !== pos.left + 'x' + pos.top) {
                        tag.box
                            .css(w2utils.cssPrefix({ 'transition': (instant ? '0s' : '.2s') }))
                            .css({
                                left: pos.left + 'px',
                                top : pos.top + 'px'
                            })
                        tag.tmp.pos = pos.left + 'x' + pos.top
                    }
                    if (tag.tmp.timer) clearTimeout(tag.tmp.timer)
                    tag.tmp.timer = setTimeout(isMoved, 100)
                }
                function getPos() {
                    let offset = $(tag.attachedTo).offset()
                    let posClass = 'w2ui-tag-right'
                    let posLeft = parseInt(offset.left + tag.attachedTo.offsetWidth + (tag.options.left ? tag.options.left : 0))
                    let posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                    let tagBody = tag.box.find('.w2ui-tag-body')
                    let width = tagBody[0].offsetWidth
                    let height = tagBody[0].offsetHeight
                    if (typeof tag.options.position === 'string' && tag.options.position.indexOf('|') !== -1) {
                        tag.options.position = tag.options.position.split('|')
                    }
                    if (tag.options.position === 'top') {
                        posClass = 'w2ui-tag-top'
                        posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                        posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0)) - height - 10
                    } else if (tag.options.position === 'bottom') {
                        posClass = 'w2ui-tag-bottom'
                        posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                        posTop = parseInt(offset.top + tag.attachedTo.offsetHeight + (tag.options.top ? tag.options.top : 0)) + 10
                    } else if (tag.options.position === 'left') {
                        posClass = 'w2ui-tag-left'
                        posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - width - 20
                        posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                    } else if (Array.isArray(tag.options.position)) {
                        // try to fit the tag on screen in the order defined in the array
                        let maxWidth = window.innerWidth
                        let maxHeight = window.innerHeight
                        for (let i = 0; i < tag.options.position.length; i++) {
                            let pos = tag.options.position[i]
                            if (pos === 'right') {
                                posClass = 'w2ui-tag-right'
                                posLeft = parseInt(offset.left + tag.attachedTo.offsetWidth + (tag.options.left ? tag.options.left : 0))
                                posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                                if (posLeft+width <= maxWidth) break
                            } else if (pos === 'left') {
                                posClass = 'w2ui-tag-left'
                                posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - width - 20
                                posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0))
                                if (posLeft >= 0) break
                            } else if (pos === 'top') {
                                posClass = 'w2ui-tag-top'
                                posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                                posTop = parseInt(offset.top + (tag.options.top ? tag.options.top : 0)) - height - 10
                                if(posLeft+width <= maxWidth && posTop >= 0) break
                            } else if (pos === 'bottom') {
                                posClass = 'w2ui-tag-bottom'
                                posLeft = parseInt(offset.left + (tag.options.left ? tag.options.left : 0)) - 14
                                posTop = parseInt(offset.top + tag.attachedTo.offsetHeight + (tag.options.top ? tag.options.top : 0)) + 10
                                if (posLeft+width <= maxWidth && posTop+height <= maxHeight) break
                            }
                        }
                        if (tagBody.data('posClass') !== posClass) {
                            tagBody.removeClass('w2ui-tag-right w2ui-tag-left w2ui-tag-top w2ui-tag-bottom')
                                .addClass(posClass)
                                .data('posClass', posClass)
                        }
                    }
                    return { left: posLeft, top: posTop, posClass: posClass }
                }
            })
        }
    }
    // w2overlay - appears under the element, there can be only one at a time
    $.fn.w2overlay = function(html, options) {
        let obj = this
        let name = ''
        let defaults = {
            name        : null, // it not null, then allows multiple concurrent overlays
            html        : '', // html text to display
            align       : 'none', // can be none, left, right, both
            left        : 0, // offset left
            top         : 0, // offset top
            tipLeft     : 30, // tip offset left
            noTip       : false, // if true - no tip will be displayed
            selectable  : false,
            width       : 0, // fixed width
            height      : 0, // fixed height
            minWidth    : null, // min width if any. Valid values: null / 'auto' (default) / 'input' (default for align='both') / 'XXpx' / numeric value (same as setting string with 'px')
            maxWidth    : null, // max width if any
            maxHeight   : null, // max height if any
            contextMenu : false, // if true, it will be opened at mouse position
            pageX       : null,
            pageY       : null,
            originalEvent : null,
            style       : '', // additional style for main div
            'class'     : '', // additional class name for main div
            overlayStyle: '',
            onShow      : null, // event on show
            onHide      : null, // event on hide
            openAbove   : null, // show above control (if not, then as best needed)
            tmp         : {}
        }
        if (arguments.length === 1) {
            if (typeof html === 'object') {
                options = html
            } else {
                options = { html: html }
            }
        }
        if (arguments.length === 2) options.html = html
        if (!$.isPlainObject(options)) options = {}
        options = $.extend({}, defaults, options)
        if (options.name) name = '-' + options.name
        // hide
        let tmp_hide
        if (this.length === 0 || options.html === '' || options.html == null) {
            if ($('#w2ui-overlay'+ name).length > 0) {
                tmp_hide = $('#w2ui-overlay'+ name)[0].hide
                if (typeof tmp_hide === 'function') tmp_hide()
            } else {
                $('#w2ui-overlay'+ name).remove()
            }
            return $(this)
        }
        // hide previous if any
        if ($('#w2ui-overlay'+ name).length > 0) {
            tmp_hide = $('#w2ui-overlay'+ name)[0].hide
            $(document).off('.w2overlay'+ name)
            if (typeof tmp_hide === 'function') tmp_hide()
        }
        if (obj.length > 0 && (obj[0].tagName == null || obj[0].tagName.toUpperCase() === 'BODY')) options.contextMenu = true
        if (options.contextMenu && options.originalEvent) {
            options.pageX = options.originalEvent.pageX
            options.pageY = options.originalEvent.pageY
        }
        if (options.contextMenu && (options.pageX == null || options.pageY == null)) {
            console.log('ERROR: to display menu at mouse location, pass options.pageX and options.pageY.')
        }
        let data_str = ''
        if (options.data) {
            Object.keys(options.data).forEach((item) => {
                data_str += 'data-'+ item + '="' + options.data[item] +'"'
            })
        }
        // append
        $('body').append(
            '<div id="w2ui-overlay'+ name +'" style="display: none; left: 0px; top: 0px; '+ options.overlayStyle +'" '+ data_str +
            '        class="w2ui-reset w2ui-overlay '+ ($(this).parents('.w2ui-popup, .w2ui-overlay-popup, .w2ui-message').length > 0 ? 'w2ui-overlay-popup' : '') +'">'+
            '    <style></style>'+
            '    <div style="min-width: 100%; '+ options.style +'" class="'+ options.class +'"></div>'+
            '</div>'
        )
        // init
        let div1 = $('#w2ui-overlay'+ name)
        let div2 = div1.find(' > div')
        div2.html(options.html)
        // pick bg color of first div
        let bc = div2.css('background-color')
        if (bc != null && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') div1.css({ 'background-color': bc, 'border-color': bc })
        let offset = $(obj).offset() || {}
        div1.data('element', obj.length > 0 ? obj[0] : null)
            .data('options', options)
            .data('position', offset.left + 'x' + offset.top)
            .fadeIn('fast')
            .on('click', function(event) {
                $('#w2ui-overlay'+ name).data('keepOpen', true)
                // if there is label for input, it will produce 2 click events
                if (event.target.tagName.toUpperCase() === 'LABEL') event.stopPropagation()
            })
            .on('mousedown', function(event) {
                let tmp = event.target.tagName.toUpperCase()
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(tmp) === -1 && !options.selectable) {
                    event.preventDefault()
                }
            })
        div1[0].hide = hide
        div1[0].resize = resize
        // need time to display
        setTimeout(() => {
            $(document).off('.w2overlay'+ name).on('click.w2overlay'+ name, hide)
            if (typeof options.onShow === 'function') options.onShow()
            resize()
        }, 10)
        monitor()
        return $(this)
        // monitor position
        function monitor() {
            let tmp = $('#w2ui-overlay'+ name)
            if (tmp.data('element') !== obj[0]) return // it if it different overlay
            if (tmp.length === 0) return
            let offset = $(obj).offset() || {}
            let pos = offset.left + 'x' + offset.top
            if (tmp.data('position') !== pos) {
                hide()
            } else {
                setTimeout(monitor, 250)
            }
        }
        // click anywhere else hides the drop down
        function hide(event) {
            if (event && event.button !== 0) return // only for left click button
            let div1 = $('#w2ui-overlay'+ name)
            // Allow clicking inside other overlays which belong to the elements inside this overlay
            if (event && $($(event.target).closest('.w2ui-overlay').data('element')).closest('.w2ui-overlay')[0] === div1[0]) return
            if (div1.data('keepOpen') === true) {
                div1.removeData('keepOpen')
                return
            }
            let result
            if (typeof options.onHide === 'function') result = options.onHide()
            if (result === false) return
            div1.remove()
            $(document).off('.w2overlay'+ name)
            clearInterval(div1.data('timer'))
        }
        function resize() {
            let div1 = $('#w2ui-overlay'+ name)
            let div2 = div1.find(' > div')
            let menu = $('#w2ui-overlay'+ name +' div.w2ui-menu')
            let pos = {}
            if (menu.length > 0) {
                menu.css('overflow-y', 'hidden')
                pos.scrollTop = menu.scrollTop()
                pos.scrollLeft = menu.scrollLeft()
            }
            // if goes over the screen, limit height and width
            if (div1.length > 0) {
                div2.height('auto').width('auto')
                // width/height
                let overflowY = false
                let h = div2.height()
                let w = div2.width()
                if (options.width && options.width < w) w = options.width
                if (w < 30) w = 30
                // if content of specific height
                if (options.tmp.contentHeight) {
                    h = parseInt(options.tmp.contentHeight)
                    div2.height(h)
                    setTimeout(() => {
                        let $div = div2.find('div.w2ui-menu')
                        if (h > $div.height()) {
                            div2.find('div.w2ui-menu').css('overflow-y', 'hidden')
                        }
                    }, 1)
                    setTimeout(() => {
                        let $div = div2.find('div.w2ui-menu')
                        if ($div.css('overflow-y') !== 'auto') $div.css('overflow-y', 'auto')
                    }, 10)
                }
                if (options.tmp.contentWidth && options.align !== 'both') {
                    w = parseInt(options.tmp.contentWidth)
                    div2.width(w)
                    setTimeout(() => {
                        if (w > div2.find('div.w2ui-menu > table').width()) {
                            div2.find('div.w2ui-menu > table').css('overflow-x', 'hidden')
                        }
                    }, 1)
                    setTimeout(() => {
                        div2.find('div.w2ui-menu > table').css('overflow-x', 'auto')
                    }, 10)
                }
                div2.find('div.w2ui-menu').css('width', '100%')
                // adjust position
                let boxLeft = options.left
                let boxWidth = options.width
                let tipLeft = options.tipLeft
                let minWidth = options.minWidth
                let maxWidth = options.maxWidth
                let objWidth = w2utils.getSize($(obj), 'width')
                // alignment
                switch (options.align) {
                    case 'both':
                        boxLeft = 17
                        minWidth = 'input'
                        maxWidth = 'input'
                        break
                    case 'left':
                        boxLeft = 17
                        break
                    case 'right':
                        break
                }
                // convert minWidth to a numeric value
                if(!minWidth || minWidth === 'auto') minWidth = 0
                if(minWidth === 'input') minWidth = objWidth
                minWidth = parseInt(minWidth, 10)
                // convert maxWidth to a numeric value
                if(!maxWidth || maxWidth === 'auto') maxWidth = 0
                if(maxWidth === 'input') maxWidth = objWidth
                maxWidth = parseInt(maxWidth, 10)
                // convert boxWidth to a numeric value
                if(!boxWidth || boxWidth === 'auto') boxWidth = 0
                if(boxWidth === 'input') boxWidth = objWidth
                boxWidth = parseInt(boxWidth, 10)
                if(minWidth) boxWidth = Math.max(boxWidth, minWidth)
                if(maxWidth) boxWidth = Math.min(boxWidth, maxWidth)
                if(options.align === 'right') {
                    let mw = Math.max(w - 10, minWidth - 17)
                    boxLeft = objWidth - mw
                    tipLeft = mw - 30
                }
                if (w === 30 && !boxWidth) boxWidth = 30
                let tmp = ((boxWidth ? boxWidth : w) - 17) / 2
                if (tmp < 25) {
                    tipLeft = Math.floor(tmp)
                }
                // Y coord
                let X, Y, offsetTop
                if (options.contextMenu) { // context menu
                    X = options.pageX + 8
                    Y = options.pageY - 0
                    offsetTop = options.pageY
                } else {
                    let offset = obj.offset() || {}
                    X = ((offset.left > 25 ? offset.left : 25) + boxLeft)
                    Y = (offset.top + w2utils.getSize(obj, 'height') + options.top + 7)
                    offsetTop = offset.top
                }
                div1.css({
                    left        :  X + 'px',
                    top         :  Y + 'px',
                    'width'     : boxWidth || 'auto',
                    'min-width' : minWidth || 'auto',
                    'max-width' : maxWidth || 'auto',
                    'min-height': options.height || 'auto'
                })
                // $(window).height() - has a problem in FF20
                let offset = div2.offset() || {}
                let maxHeight = window.innerHeight + $(document).scrollTop() - offset.top - 7
                maxWidth = window.innerWidth + $(document).scrollLeft() - offset.left - 7
                if (options.contextMenu) { // context menu
                    maxHeight = window.innerHeight + $(document).scrollTop() - options.pageY - 15
                    maxWidth = window.innerWidth + $(document).scrollLeft() - options.pageX
                }
                if (((maxHeight > -50 && maxHeight < 210) || options.openAbove === true) && options.openAbove !== false) {
                    let tipOffset
                    // show on top
                    if (options.contextMenu) { // context menu
                        maxHeight = options.pageY - 7
                        tipOffset = 5
                    } else {
                        maxHeight = offset.top - $(document).scrollTop() - 7
                        tipOffset = 24
                    }
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight
                    if (h > maxHeight) {
                        overflowY = true
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' })
                        h = maxHeight
                    }
                    div1.addClass('bottom-arrow')
                    div1.css('top', (offsetTop - h - tipOffset + options.top) + 'px')
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { margin-left: '+ parseInt(tipLeft) +'px; }'
                    )
                } else {
                    // show under
                    if (options.maxHeight && maxHeight > options.maxHeight) maxHeight = options.maxHeight
                    if (h > maxHeight) {
                        overflowY = true
                        div2.height(maxHeight).width(w).css({ 'overflow-y': 'auto' })
                    }
                    div1.addClass('top-arrow')
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { margin-left: '+ parseInt(tipLeft) +'px; }'+
                        '#w2ui-overlay'+ name +':after { margin-left: '+ parseInt(tipLeft) +'px; }'
                    )
                }
                // check width
                w = div2.width()
                maxWidth = window.innerWidth + $(document).scrollLeft() - offset.left - 7
                if (options.maxWidth && maxWidth > options.maxWidth) maxWidth = options.maxWidth
                if (w > maxWidth && options.align !== 'both') {
                    options.align = 'right'
                    setTimeout(() => { resize() }, 1)
                }
                // don't show tip
                if (options.contextMenu || options.noTip) { // context menu
                    div1.find('>style').html(
                        '#w2ui-overlay'+ name +':before { display: none; }'+
                        '#w2ui-overlay'+ name +':after { display: none; }'
                    )
                }
                // check scroll bar (needed to avoid horizontal scrollbar)
                if (overflowY && options.align !== 'both') div2.width(w + w2utils.scrollBarSize() + 2)
            }
            if (menu.length > 0) {
                menu.css('overflow-y', 'auto')
                menu.scrollTop(pos.scrollTop)
                menu.scrollLeft(pos.scrollLeft)
            }
        }
    }
    $.fn.w2menu = function(menu, options) {
        /*
        ITEM STRUCTURE
            item : {
                id       : null,
                text     : '',
                style    : '',
                img      : '',
                icon     : '',
                count    : '',
                tooltip  : '',
                hidden   : false,
                checked  : null,
                disabled : false
                ...
            }
        */
        // if items is a function
        if (options && typeof options.items === 'function') {
            options.items = options.items()
        }
        let defaults = {
            type         : 'normal', // can be normal, radio, check
            index        : null, // current selected
            items        : [],
            render       : null,
            msgNoItems   : 'No items',
            onSelect     : null,
            hideOnRemove : false,
            tmp          : {}
        }
        let ret
        let obj = this
        let name = ''
        if (menu === 'refresh') {
            // if not show - call blur
            if ($.fn.w2menuOptions && $.fn.w2menuOptions.name) name = '-' + $.fn.w2menuOptions.name
            if (options.name) name = '-' + options.name
            if ($('#w2ui-overlay'+ name).length > 0) {
                options = $.extend($.fn.w2menuOptions, options)
                let scrTop = $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop()
                $('#w2ui-overlay'+ name +' div.w2ui-menu').html(getMenuHTML())
                $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop(scrTop)
                mresize()
            } else {
                $(this).w2menu(options)
            }
        } else if (menu === 'refresh-index') {
            let $menu = $('#w2ui-overlay'+ name +' div.w2ui-menu')
            let cur = $menu.find('tr[index='+ options.index +']')
            let scrTop = $menu.scrollTop()
            $menu.find('tr.w2ui-selected').removeClass('w2ui-selected') // clear all
            cur.addClass('w2ui-selected') // select current
            // scroll into view
            if (cur.length > 0) {
                let top = cur[0].offsetTop - 5 // 5 is margin top
                let height = $menu.height()
                $menu.scrollTop(scrTop)
                if (top < scrTop || top + cur.height() > scrTop + height) {
                    $menu.animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear')
                }
            }
            mresize()
        } else {
            if (arguments.length === 1) options = menu; else options.items = menu
            if (typeof options !== 'object') options = {}
            options = $.extend({}, defaults, options)
            $.fn.w2menuOptions = options
            if (options.name) name = '-' + options.name
            if (typeof options.select === 'function' && typeof options.onSelect !== 'function') options.onSelect = options.select
            if (typeof options.remove === 'function' && typeof options.onRemove !== 'function') options.onRemove = options.remove
            if (typeof options.onRender === 'function' && typeof options.render !== 'function') options.render = options.onRender
            // since only one overlay can exist at a time
            $.fn.w2menuClick = function w2menuClick(event, index, parentIndex) {
                let keepOpen = false, items
                let $tr = $(event.target).closest('tr')
                if (event.shiftKey || event.metaKey || event.ctrlKey) {
                    keepOpen = true
                }
                if (parentIndex == null) {
                    items = options.items
                } else {
                    items = options.items[parentIndex].items
                }
                if ($(event.target).hasClass('remove')) {
                    if (typeof options.onRemove === 'function') {
                        options.onRemove({
                            index: index,
                            parentIndex: parentIndex,
                            item: items[index],
                            keepOpen: keepOpen,
                            originalEvent: event
                        })
                    }
                    keepOpen = !options.hideOnRemove
                    $(event.target).closest('tr').remove()
                    mresize()
                } else if ($tr.hasClass('has-sub-menu')) {
                    keepOpen = true
                    if ($tr.hasClass('expanded')) {
                        items[index].expanded = false
                        $tr.removeClass('expanded').addClass('collapsed').next().hide()
                    } else {
                        items[index].expanded = true
                        $tr.addClass('expanded').removeClass('collapsed').next().show()
                    }
                    mresize()
                } else if (typeof options.onSelect === 'function') {
                    let tmp = items
                    if (typeof items == 'function') {
                        tmp = items(options.items[parentIndex])
                    }
                    if (tmp[index].keepOpen != null) {
                        keepOpen = tmp[index].keepOpen
                    }
                    options.onSelect({
                        index: index,
                        parentIndex: parentIndex,
                        item: tmp[index],
                        keepOpen: keepOpen,
                        originalEvent: event
                    })
                }
                // -- hide
                if (items[index] == null || items[index].keepOpen !== true) {
                    let div = $('#w2ui-overlay'+ name)
                    div.removeData('keepOpen')
                    if (div.length > 0 && typeof div[0].hide === 'function' && !keepOpen) {
                        div[0].hide()
                    }
                }
            }
            $.fn.w2menuDown = function w2menuDown(event, index, parentIndex) {
                let items
                let $el = $(event.target).closest('tr')
                let tmp = $($el.get(0)).find('.w2ui-icon')
                if (parentIndex == null) {
                    items = options.items
                } else {
                    items = options.items[parentIndex].items
                }
                let item = items[index]
                if ((options.type === 'check' || options.type === 'radio') && item.group !== false
                            && !$(event.target).hasClass('remove')
                            && !$(event.target).closest('tr').hasClass('has-sub-menu')) {
                    item.checked = !item.checked
                    if (item.checked) {
                        if (options.type === 'radio') {
                            tmp.parents('table').find('.w2ui-icon') // should not be closest, but parents
                                .removeClass('w2ui-icon-check')
                                .addClass('w2ui-icon-empty')
                        }
                        if (options.type === 'check' && item.group != null) {
                            items.forEach((sub, ind) => {
                                if (sub.id == item.id) return
                                if (sub.group === item.group && sub.checked) {
                                    tmp.closest('table').find('tr[index='+ ind +'] .w2ui-icon')
                                        .removeClass('w2ui-icon-check')
                                        .addClass('w2ui-icon-empty')
                                    items[ind].checked = false
                                }
                            })
                        }
                        tmp.removeClass('w2ui-icon-empty').addClass('w2ui-icon-check')
                    } else if (options.type === 'check' && item.group == null && item.group !== false) {
                        tmp.removeClass('w2ui-icon-check').addClass('w2ui-icon-empty')
                    }
                }
                // highlight record
                $el.parent().find('tr').removeClass('w2ui-selected')
                $el.addClass('w2ui-selected')
            }
            let html = ''
            if (options.search) {
                html +=
                    '<div style="position: absolute; top: 0px; height: 40px; left: 0px; right: 0px; border-bottom: 1px solid silver; background-color: #ECECEC; padding: 8px 5px;">'+
                    '    <div class="w2ui-icon icon-search" style="position: absolute; margin-top: 4px; margin-left: 6px; width: 11px; background-position: left !important;"></div>'+
                    '    <input id="menu-search" type="text" style="width: 100%; outline: none; padding-left: 20px;" onclick="event.stopPropagation();"/>'+
                    '</div>'
                options.style += ';background-color: #ECECEC'
                options.index = 0
                for (let i = 0; i < options.items.length; i++) options.items[i].hidden = false
            }
            html += (options.topHTML || '') +
                    '<div class="w2ui-menu" style="top: '+ (options.search ? 40 : 0) + 'px;' + (options.menuStyle || '') + '">' +
                        getMenuHTML() +
                    '</div>'
            ret = $(this).w2overlay(html, options)
            setTimeout(() => {
                $('#w2ui-overlay'+ name +' #menu-search')
                    .on('keyup', change)
                    .on('keydown', function(event) {
                        // cancel tab key
                        if (event.keyCode === 9) { event.stopPropagation(); event.preventDefault() }
                    })
                if (options.search) {
                    if (['text', 'password'].indexOf($(obj)[0].type) !== -1 || $(obj)[0].tagName.toUpperCase() === 'TEXTAREA') return
                    $('#w2ui-overlay'+ name +' #menu-search').focus()
                }
                mresize()
            }, 250)
            mresize()
            // map functions
            let div = $('#w2ui-overlay'+ name)
            if (div.length > 0) {
                div[0].mresize = mresize
                div[0].change = change
            }
        }
        return ret
        function mresize() {
            setTimeout(() => {
                // show selected
                $('#w2ui-overlay'+ name +' tr.w2ui-selected').removeClass('w2ui-selected')
                let cur = $('#w2ui-overlay'+ name +' tr[index='+ options.index +']')
                let scrTop = $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop()
                cur.addClass('w2ui-selected')
                if (options.tmp) {
                    options.tmp.contentHeight = $('#w2ui-overlay'+ name +' table').height() + (options.search ? 50 : 10)
                        + (parseInt($('#w2ui-overlay'+ name +' .w2ui-menu').css('top')) || 0) // it menu is moved with menuStyle
                        + (parseInt($('#w2ui-overlay'+ name +' .w2ui-menu').css('bottom')) || 0) // it menu is moved with menuStyle
                    options.tmp.contentWidth = $('#w2ui-overlay'+ name +' table').width()
                }
                if ($('#w2ui-overlay'+ name).length > 0) $('#w2ui-overlay'+ name)[0].resize()
                // scroll into view
                if (cur.length > 0) {
                    let top = cur[0].offsetTop - 5 // 5 is margin top
                    let el = $('#w2ui-overlay'+ name +' div.w2ui-menu')
                    let height = el.height()
                    $('#w2ui-overlay'+ name +' div.w2ui-menu').scrollTop(scrTop)
                    if (top < scrTop || top + cur.height() > scrTop + height) {
                        $('#w2ui-overlay'+ name +' div.w2ui-menu').animate({ 'scrollTop': top - (height - cur.height() * 2) / 2 }, 200, 'linear')
                    }
                }
            }, 1)
        }
        function change(event) {
            let search = this.value
            let key = event.keyCode
            let cancel = false
            switch (key) {
                case 13: // enter
                    $('#w2ui-overlay'+ name).remove()
                    $.fn.w2menuClick(event, options.index)
                    break
                case 9: // tab
                case 27: // escape
                    $('#w2ui-overlay'+ name).remove()
                    $.fn.w2menuClick(event, -1)
                    break
                case 38: // up
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0
                    options.index--
                    while (options.index > 0 && options.items[options.index].hidden) options.index--
                    if (options.index === 0 && options.items[options.index].hidden) {
                        while (options.items[options.index] && options.items[options.index].hidden) options.index++
                    }
                    if (options.index < 0) options.index = 0
                    cancel = true
                    break
                case 40: // down
                    options.index = w2utils.isInt(options.index) ? parseInt(options.index) : 0
                    options.index++
                    while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++
                    if (options.index === options.items.length-1 && options.items[options.index].hidden) {
                        while (options.items[options.index] && options.items[options.index].hidden) options.index--
                    }
                    if (options.index >= options.items.length) options.index = options.items.length - 1
                    cancel = true
                    break
            }
            // filter
            if (!cancel) {
                let shown = 0
                for (let i = 0; i < options.items.length; i++) {
                    let item = options.items[i]
                    let prefix = ''
                    let suffix = ''
                    if (['is', 'begins with'].indexOf(options.match) !== -1) prefix = '^'
                    if (['is', 'ends with'].indexOf(options.match) !== -1) suffix = '$'
                    try {
                        let re = new RegExp(prefix + search + suffix, 'i')
                        if (re.test(item.text) || item.text === '...') item.hidden = false; else item.hidden = true
                    } catch (e) {}
                    // do not show selected items
                    if (obj.type === 'enum' && $.inArray(item.id, ids) !== -1) item.hidden = true
                    if (item.hidden !== true) shown++
                }
                options.index = 0
                while (options.index < options.items.length-1 && options.items[options.index].hidden) options.index++
                if (shown <= 0) options.index = -1
            }
            $(obj).w2menu('refresh', options)
            mresize()
        }
        function getMenuHTML(items, subMenu, expanded, parentIndex) {
            if (options.spinner) {
                return '<table><tbody><tr><td style="padding: 5px 10px 13px 10px; text-align: center">'+
                        '    <div class="w2ui-spinner" style="width: 18px; height: 18px; position: relative; top: 5px;"></div> '+
                        '    <div style="display: inline-block; padding: 3px; color: #999;">'+ w2utils.lang('Loading...') +'</div>'+
                        '</td></tr></tbody></table>'
            }
            let count = 0
            let menu_html = '<table cellspacing="0" cellpadding="0" class="'+ (subMenu ? ' sub-menu' : '') +'"><tbody>'
            let img = null, icon = null
            if (items == null) items = options.items
            if (!Array.isArray(items)) items = []
            for (let f = 0; f < items.length; f++) {
                let mitem = items[f]
                if (typeof mitem === 'string') {
                    mitem = { id: mitem, text: mitem }
                } else {
                    if (mitem.text != null && mitem.id == null) mitem.id = mitem.text
                    if (mitem.text == null && mitem.id != null) mitem.text = mitem.id
                    if (mitem.caption != null) mitem.text = mitem.caption
                    img = mitem.img
                    icon = mitem.icon
                    if (img == null) img = null // img might be undefined
                    if (icon == null) icon = null // icon might be undefined
                }
                if (['radio', 'check'].indexOf(options.type) != -1 && !Array.isArray(mitem.items) && mitem.group !== false) {
                    if (mitem.checked === true) icon = 'w2ui-icon-check'; else icon = 'w2ui-icon-empty'
                }
                if (mitem.hidden !== true) {
                    let imgd = ''
                    let txt = mitem.text
                    let subMenu_dsp = ''
                    if (typeof options.render === 'function') txt = options.render(mitem, options)
                    if (typeof txt == 'function') txt = txt(mitem, options)
                    if (img) imgd = '<td class="menu-icon"><div class="w2ui-tb-image w2ui-icon '+ img +'"></div></td>'
                    if (icon) imgd = '<td class="menu-icon" align="center"><span class="w2ui-icon '+ icon +'"></span></td>'
                    // render only if non-empty
                    if (mitem.type !== 'break' && txt != null && txt !== '' && String(txt).substr(0, 2) != '--') {
                        let bg = (count % 2 === 0 ? 'w2ui-item-even' : 'w2ui-item-odd')
                        if (options.altRows !== true) bg = ''
                        let colspan = 1
                        if (imgd === '') colspan++
                        if (mitem.count == null && mitem.hotkey == null && mitem.remove !== true && mitem.items == null) colspan++
                        if (mitem.tooltip == null && mitem.hint != null) mitem.tooltip = mitem.hint // for backward compatibility
                        let count_dsp = ''
                        if (mitem.remove === true) {
                            count_dsp = '<span class="remove">X</span>'
                        } else if (mitem.items != null) {
                            let _items = []
                            if (typeof mitem.items == 'function') {
                                _items = mitem.items(mitem)
                            } else if (Array.isArray(mitem.items)) {
                                _items = mitem.items
                            }
                            count_dsp = '<span></span>'
                            subMenu_dsp = '<tr style="'+ (mitem.expanded ? '' : 'display: none') +'">'+
                                          '     <td colspan="3">' + getMenuHTML(_items, true, !mitem.expanded, f) + '</td>'+
                                          '<tr>'
                        } else {
                            if (mitem.count != null) count_dsp += '<span>' + mitem.count + '</span>'
                            if (mitem.hotkey != null) count_dsp += '<span class="hotkey">' + mitem.hotkey + '</span>'
                        }
                        menu_html +=
                            '<tr index="'+ f + '" style="'+ (mitem.style ? mitem.style : '') +'" '+ (mitem.tooltip ? 'title="'+ w2utils.lang(mitem.tooltip) +'"' : '') +
                            ' class="'+ bg
                                + (options.index === f ? ' w2ui-selected' : '')
                                + (mitem.disabled === true ? ' w2ui-disabled' : '')
                                + (subMenu_dsp !== '' ? ' has-sub-menu' + (mitem.expanded ? ' expanded' : ' collapsed') : '')
                                + '"'+
                            '        onmousedown="if ('+ (mitem.disabled === true ? 'true' : 'false') + ') return;'+
                            '               jQuery.fn.w2menuDown(event, '+ f +',  '+ parentIndex +');"'+
                            '        onclick="event.stopPropagation(); '+
                            '               if ('+ (mitem.disabled === true ? 'true' : 'false') + ') return;'+
                            '               jQuery.fn.w2menuClick(event, '+ f +',  '+ parentIndex +');">'+
                                (subMenu ? '<td></td>' : '') + imgd +
                            '   <td class="menu-text" colspan="'+ colspan +'">'+ w2utils.lang(txt) +'</td>'+
                            '   <td class="menu-count">'+ count_dsp +'</td>'+
                            '</tr>'+ subMenu_dsp
                        count++
                    } else {
                        // horizontal line
                        let divText = txt.replace(/^-+/g, '')
                        menu_html += '<tr><td colspan="3" class="menu-divider '+ (divText != '' ? 'divider-text' : '') +'">'+
                                     '   <div class="line">'+ divText +'</div>'+
                                     '   <div class="text">'+ divText +'</div>'+
                                     '</td></tr>'
                    }
                }
                items[f] = mitem
            }
            if (count === 0 && options.msgNoItems) {
                menu_html += '<tr><td style="padding: 13px; color: #999; text-align: center">'+ options.msgNoItems +'</div></td></tr>'
            }
            menu_html += '</tbody></table>'
            return menu_html
        }
    }
    $.fn.w2color = function(options, callBack) {
        let $el = $(this)
        let el = $el[0]
        // no need to init
        if ($el.data('skipInit')) {
            $el.removeData('skipInit')
            return
        }
        // needed for keyboard navigation
        let index = [-1, -1]
        if ($.fn.w2colorPalette == null) {
            $.fn.w2colorPalette = [
                ['000000', '333333', '555555', '777777', '888888', '999999', 'AAAAAA', 'CCCCCC', 'DDDDDD', 'EEEEEE', 'F7F7F7', 'FFFFFF'],
                ['FF011B', 'FF9838', 'FFC300', 'FFFD59', '86FF14', '14FF7A', '2EFFFC', '2693FF', '006CE7', '9B24F4', 'FF21F5', 'FF0099'],
                ['FFEAEA', 'FCEFE1', 'FCF4DC', 'FFFECF', 'EBFFD9', 'D9FFE9', 'E0FFFF', 'E8F4FF', 'ECF4FC', 'EAE6F4', 'FFF5FE', 'FCF0F7'],
                ['F4CCCC', 'FCE5CD', 'FFF1C2', 'FFFDA1', 'D5FCB1', 'B5F7D0', 'BFFFFF', 'D6ECFF', 'CFE2F3', 'D9D1E9', 'FFE3FD', 'FFD9F0'],
                ['EA9899', 'F9CB9C', 'FFE48C', 'F7F56F', 'B9F77E', '84F0B1', '83F7F7', 'B5DAFF', '9FC5E8', 'B4A7D6', 'FAB9F6', 'FFADDE'],
                ['E06666', 'F6B26B', 'DEB737', 'E0DE51', '8FDB48', '52D189', '4EDEDB', '76ACE3', '6FA8DC', '8E7CC3', 'E07EDA', 'F26DBD'],
                ['CC0814', 'E69138', 'AB8816', 'B5B20E', '6BAB30', '27A85F', '1BA8A6', '3C81C7', '3D85C6', '674EA7', 'A14F9D', 'BF4990'],
                ['99050C', 'B45F17', '80650E', '737103', '395E14', '10783D', '13615E', '094785', '0A5394', '351C75', '780172', '782C5A']
            ]
        }
        let pal = $.fn.w2colorPalette
        if (typeof options === 'string') options = {
            color: options,
            transparent: true
        }
        if (options.onSelect == null && callBack != null) options.onSelect = callBack
        // add remove transarent color
        if (options.transparent && pal[0][1] == '333333') {
            pal[0].splice(1, 1)
            pal[0].push('')
        }
        if (!options.transparent && pal[0][1] != '333333') {
            pal[0].splice(1, 0, '333333')
            pal[0].pop()
        }
        if (options.color) options.color = String(options.color).toUpperCase()
        if (typeof options.color === 'string' && options.color.substr(0,1) === '#') options.color = options.color.substr(1)
        if (options.fireChange == null) options.fireChange = true
        if ($('#w2ui-overlay').length === 0) {
            $(el).w2overlay(getColorHTML(options), options)
        } else { // only refresh contents
            $('#w2ui-overlay .w2ui-colors').parent().html(getColorHTML(options))
            $('#w2ui-overlay').show()
        }
        // bind events
        $('#w2ui-overlay .w2ui-color')
            .off('.w2color')
            .on('mousedown.w2color', (event) => {
                let color = $(event.originalEvent.target).attr('name') // should not have #
                index = $(event.originalEvent.target).attr('index').split(':')
                if (el.tagName.toUpperCase() === 'INPUT') {
                    if (options.fireChange) $(el).change()
                    $(el).next().find('>div').css('background-color', color)
                } else {
                    $(el).data('_color', color)
                }
                if (typeof options.onSelect === 'function') options.onSelect(color)
            })
            .on('mouseup.w2color', () => {
                setTimeout(() => {
                    if ($('#w2ui-overlay').length > 0) $('#w2ui-overlay').removeData('keepOpen')[0].hide()
                }, 10)
            })
        $('#w2ui-overlay .color-original')
            .off('.w2color')
            .on('click.w2color', (event) => {
                // restore original color
                let tmp = w2utils.parseColor($(event.target).css('background-color'))
                if (tmp != null) {
                    rgb = tmp
                    hsv = w2utils.rgb2hsv(rgb)
                    setColor(hsv)
                    updateSlides()
                    refreshPalette()
                }
            })
        $('#w2ui-overlay input')
            .off('.w2color')
            .on('mousedown.w2color', (event) => {
                $('#w2ui-overlay').data('keepOpen', true)
                setTimeout(() => { $('#w2ui-overlay').data('keepOpen', true) }, 10)
                event.stopPropagation()
            })
            .on('change.w2color', () => {
                let $el = $(this)
                let val = parseFloat($el.val())
                let max = parseFloat($el.attr('max'))
                if (isNaN(val)) val = 0
                if (max > 1) val = parseInt(val)
                if (max > 0 && val > max) {
                    $el.val(max)
                    val = max
                }
                if (val < 0) {
                    $el.val(0)
                    val = 0
                }
                let name = $el.attr('name')
                let color = {}
                if (['r', 'g', 'b', 'a'].indexOf(name) !== -1) {
                    rgb[name] = val
                    hsv = w2utils.rgb2hsv(rgb)
                } else if (['h', 's', 'v'].indexOf(name) !== -1) {
                    color[name] = val
                }
                setColor(color)
                updateSlides()
                refreshPalette()
            })
        // advanced color events
        let initial
        let hsv, rgb = w2utils.parseColor(options.color)
        if (rgb == null) {
            rgb = { r: 140, g: 150, b: 160, a: 1 }
            hsv = w2utils.rgb2hsv(rgb)
        }
        hsv = w2utils.rgb2hsv(rgb)
        function setColor(color, silent) {
            if (color.h != null) hsv.h = color.h
            if (color.s != null) hsv.s = color.s
            if (color.v != null) hsv.v = color.v
            if (color.a != null) { rgb.a = color.a; hsv.a = color.a }
            rgb = w2utils.hsv2rgb(hsv)
            // console.log(rgb)
            let newColor = 'rgba('+ rgb.r +','+ rgb.g +','+ rgb.b +','+ rgb.a +')'
            let cl = [
                Number(rgb.r).toString(16).toUpperCase(),
                Number(rgb.g).toString(16).toUpperCase(),
                Number(rgb.b).toString(16).toUpperCase(),
                (Math.round(Number(rgb.a)*255)).toString(16).toUpperCase()
            ]
            cl.forEach((item, ind) => { if (item.length === 1) cl[ind] = '0' + item })
            newColor = cl[0] + cl[1] + cl[2] + cl[3]
            if (rgb.a === 1) {
                newColor = cl[0] + cl[1] + cl[2]
            }
            $('#w2ui-overlay .color-preview').css('background-color', '#'+newColor)
            $('#w2ui-overlay input').each((index, el) => {
                if (el.name) {
                    if (rgb[el.name] != null) el.value = rgb[el.name]
                    if (hsv[el.name] != null) el.value = hsv[el.name]
                    if (el.name === 'a') el.value = rgb.a
                }
            })
            if (!silent) {
                if (el.tagName.toUpperCase() === 'INPUT') {
                    $(el).val(newColor).data('skipInit', true)
                    if (options.fireChange) $(el).change()
                    $(el).next().find('>div').css('background-color', '#'+newColor)
                } else {
                    $(el).data('_color', newColor)
                }
                if (typeof options.onSelect === 'function') options.onSelect(newColor)
            } else {
                $('#w2ui-overlay .color-original').css('background-color', '#'+newColor)
            }
        }
        function updateSlides() {
            let $el1 = $('#w2ui-overlay .palette .value1')
            let $el2 = $('#w2ui-overlay .rainbow .value2')
            let $el3 = $('#w2ui-overlay .alpha .value2')
            let offset1 = parseInt($el1.width()) / 2
            let offset2 = parseInt($el2.width()) / 2
            $el1.css({ 'left': hsv.s * 150 / 100 - offset1, 'top': (100 - hsv.v) * 125 / 100 - offset1})
            $el2.css('left', hsv.h/(360/150) - offset2)
            $el3.css('left', rgb.a*150 - offset2)
        }
        function refreshPalette() {
            let cl = w2utils.hsv2rgb(hsv.h, 100, 100)
            let rgb = cl.r + ',' + cl.g + ',' + cl.b
            $('#w2ui-overlay .palette').css('background-image',
                'linear-gradient(90deg, rgba('+ rgb +',0) 0%, rgba(' + rgb + ',1) 100%)')
        }
        function mouseDown(event) {
            let $el = $(this).find('.value1, .value2')
            let offset = parseInt($el.width()) / 2
            if ($el.hasClass('move-x')) $el.css({ left: (event.offsetX - offset) + 'px' })
            if ($el.hasClass('move-y')) $el.css({ top: (event.offsetY - offset) + 'px' })
            initial = {
                $el    : $el,
                x      : event.pageX,
                y      : event.pageY,
                width  : $el.parent().width(),
                height : $el.parent().height(),
                left   : parseInt($el.css('left')),
                top    : parseInt($el.css('top'))
            }
            mouseMove(event)
            $('body').off('.w2color')
                .on(mMove, mouseMove)
                .on(mUp, mouseUp)
        }
        function mouseUp(event) {
            $('body').off('.w2color')
        }
        function mouseMove (event) {
            let $el = initial.$el
            let divX = event.pageX - initial.x
            let divY = event.pageY - initial.y
            let newX = initial.left + divX
            let newY = initial.top + divY
            let offset = parseInt($el.width()) / 2
            if (newX < -offset) newX = -offset
            if (newY < -offset) newY = -offset
            if (newX > initial.width - offset) newX = initial.width - offset
            if (newY > initial.height - offset) newY = initial.height - offset
            if ($el.hasClass('move-x')) $el.css({ left : newX + 'px' })
            if ($el.hasClass('move-y')) $el.css({ top : newY + 'px' })
            // move
            let name = $el.parent().attr('name')
            let x = parseInt($el.css('left')) + offset
            let y = parseInt($el.css('top')) + offset
            if (name === 'palette') {
                setColor({
                    s: Math.round(x / initial.width * 100),
                    v: Math.round(100 - (y / initial.height * 100))
                })
            }
            if (name === 'rainbow') {
                let h = Math.round(360 / 150 * x)
                setColor({ h: h })
                refreshPalette()
            }
            if (name === 'alpha') {
                setColor({ a: parseFloat(Number(x / 150).toFixed(2)) })
            }
        }
        if ($.fn._colorAdvanced === true || options.advanced === true) {
            $('#w2ui-overlay .w2ui-color-tabs :nth-child(2)').click()
            $('#w2ui-overlay').removeData('keepOpen')
        }
        setColor({}, true)
        refreshPalette()
        updateSlides()
        // Events of iOS
        let mUp = 'mouseup.w2color'
        let mMove = 'mousemove.w2color'
        if (w2utils.isIOS) {
            mUp = 'touchend.w2color'
            mMove = 'touchmove.w2color'
        }
        $('#w2ui-overlay .palette')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)
        $('#w2ui-overlay .rainbow')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)
        $('#w2ui-overlay .alpha')
            .off('.w2color')
            .on('mousedown.w2color', mouseDown)
        // keyboard navigation
        el.nav = (direction) => {
            switch (direction) {
                case 'up':
                    index[0]--
                    break
                case 'down':
                    index[0]++
                    break
                case 'right':
                    index[1]++
                    break
                case 'left':
                    index[1]--
                    break
            }
            if (index[0] < 0) index[0] = 0
            if (index[0] > pal.length - 2) index[0] = pal.length - 2
            if (index[1] < 0) index[1] = 0
            if (index[1] > pal[0].length - 1) index[1] = pal[0].length - 1
            color = pal[index[0]][index[1]]
            $(el).data('_color', color)
            return color
        }
        function getColorHTML(options) {
            let bor
            let html = '<div class="w2ui-colors" onmousedown="jQuery(this).parents(\'.w2ui-overlay\').data(\'keepOpen\', true)">'+
                        '<div class="w2ui-color-palette">'+
                        '<table cellspacing="5"><tbody>'
            for (let i = 0; i < pal.length; i++) {
                html += '<tr>'
                for (let j = 0; j < pal[i].length; j++) {
                    if (pal[i][j] === 'FFFFFF') bor = ';border: 1px solid #efefef'; else bor = ''
                    html += '<td>'+
                            '    <div class="w2ui-color '+ (pal[i][j] === '' ? 'w2ui-no-color' : '') +'" style="background-color: #'+ pal[i][j] + bor +';" ' +
                            '       name="'+ pal[i][j] +'" index="'+ i + ':' + j +'">'+ (options.color == pal[i][j] ? '&#149;' : '&#160;') +
                            '    </div>'+
                            '</td>'
                    if (options.color == pal[i][j]) index = [i, j]
                }
                html += '</tr>'
                if (i < 2) html += '<tr><td style="height: 8px" colspan="8"></td></tr>'
            }
            html += '</tbody></table>'+
                    '</div>'
            if (true) {
                html += '<div class="w2ui-color-advanced" style="display: none">'+
                        '   <div class="color-info">'+
                        '       <div class="color-preview-bg"><div class="color-preview"></div><div class="color-original"></div></div>'+
                        '       <div class="color-part">'+
                        '           <span>H</span> <input name="h" maxlength="3" max="360" tabindex="101">'+
                        '           <span>R</span> <input name="r" maxlength="3" max="255" tabindex="104">'+
                        '       </div>'+
                        '       <div class="color-part">'+
                        '           <span>S</span> <input name="s" maxlength="3" max="100" tabindex="102">'+
                        '           <span>G</span> <input name="g" maxlength="3" max="255" tabindex="105">'+
                        '       </div>'+
                        '       <div class="color-part">'+
                        '           <span>V</span> <input name="v" maxlength="3" max="100" tabindex="103">'+
                        '           <span>B</span> <input name="b" maxlength="3" max="255" tabindex="106">'+
                        '       </div>'+
                        '       <div class="color-part" style="margin: 30px 0px 0px 2px">'+
                        '           <span style="width: 40px">Opacity</span> '+
                        '           <input name="a" maxlength="5" max="1" style="width: 32px !important" tabindex="107">'+
                        '       </div>'+
                        '   </div>'+
                        '   <div class="palette" name="palette">'+
                        '       <div class="palette-bg"></div>'+
                        '       <div class="value1 move-x move-y"></div>'+
                        '   </div>'+
                        '   <div class="rainbow" name="rainbow">'+
                        '       <div class="value2 move-x"></div>'+
                        '   </div>'+
                        '   <div class="alpha" name="alpha">'+
                        '       <div class="alpha-bg"></div>'+
                        '       <div class="value2 move-x"></div>'+
                        '   </div>'+
                        '</div>'
            }
            html += '<div class="w2ui-color-tabs">'+
                    '   <div class="w2ui-color-tab selected" onclick="jQuery(this).addClass(\'selected\').next().removeClass(\'selected\').parents(\'.w2ui-overlay\').find(\'.w2ui-color-advanced\').hide().parent().find(\'.w2ui-color-palette\').show(); jQuery.fn._colorAdvanced = false; jQuery(\'#w2ui-overlay\')[0].resize()"><span class="w2ui-icon w2ui-icon-colors"></span></div>'+
                    '   <div class="w2ui-color-tab" onclick="jQuery(this).addClass(\'selected\').prev().removeClass(\'selected\').parents(\'.w2ui-overlay\').find(\'.w2ui-color-advanced\').show().parent().find(\'.w2ui-color-palette\').hide(); jQuery.fn._colorAdvanced = true; jQuery(\'#w2ui-overlay\')[0].resize()"><span class="w2ui-icon w2ui-icon-settings"></span></div>'+
                    '   <div style="padding: 8px; text-align: right;">' + (typeof options.html == 'string' ? options.html : '') + '</div>' +
                    '</div>'+
                    '</div>'+
                    '<div style="clear: both; height: 0"></div>'
            return html
        }
    }
})(jQuery);
// Compatibility with CommonJS and AMD modules
(function(global, w2ui) {
    if (typeof define == 'function' && define.amd) {
        return define(() => w2ui)
    }
    if (typeof exports != 'undefined') {
        if (typeof module != 'undefined' && module.exports) {
            return exports = module.exports = w2ui
        }
        global = exports
    }
    if (global) {
        Object.keys(w2ui).forEach(key => {
            global[key] = w2ui[key]
        })
    }
})(self, {
    w2ui,
    w2utils,
    w2popup,
    w2alert,
    w2confirm,
    w2prompt,
    w2field,
    w2form,
    w2grid,
    w2layout,
    w2sidebar,
    w2tabs,
    w2toolbar,
    addType,
    removeType
})
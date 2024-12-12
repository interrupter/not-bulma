const inputValuesExtractors = Object.freeze({
    checkbox: (inpEl, defaultValue = undefined) => {
        if (
            typeof defaultValue == "object" &&
            Object.hasOwn(defaultValue, "checked") &&
            Object.hasOwn(defaultValue, "unchecked")
        ) {
            return inpEl.checked
                ? defaultValue.checked
                : defaultValue.unchecked;
        } else if (
            Object.hasOwn(inpEl, "value") &&
            typeof inpEl.value !== "undefined"
        ) {
            return inpEl.checked ? inpEl.value : false;
        } else {
            return inpEl.checked;
        }
    },
});

/**
 * Collection of common to UI functions and properties
 *
 * @class UICommon
 */
class UICommon {
    static CLEAR_MACRO = "__CLEAR__";
    static ERROR_DEFAULT = "Что пошло не так.";
    static DEFAULT_REDIRECT_TIMEOUT = 3000;
    static CLASS_OK = "is-success";
    static CLASS_ERR = "is-danger";
    static SCROLL_DISABLER_CLASS = "remove-scroll";
    static FILLER = "_";

    static SCROLL_OPTIONS = {
        top: 0,
        behavior: "smooth",
    };

    static get inputValuesExtractors() {
        return inputValuesExtractors;
    }

    static extractValueFromInput(inpEl, defaultValue = undefined) {
        if (Object.hasOwn(UICommon.inputValuesExtractors, inpEl.type)) {
            return UICommon.inputValuesExtractors[inpEl.type](
                inpEl,
                defaultValue
            );
        }
        return inpEl.value;
    }

    /**
     *
     *
     * @static
     * @param {string}      field    field name
     * @param {import('./events.types').UIEventInputChangeCallback}    onchange
     * @param {any}         [defaultValue=undefined]
     * @return {import('./events.types').UIEventCallback}
     * @memberof UICommon
     */
    static onInput(field, onchange, defaultValue = undefined) {
        return (event) => {
            const value = UICommon.extractValueFromInput(
                event.currentTarget,
                defaultValue
            );
            return onchange(
                {
                    field,
                    value,
                },
                event
            );
        };
    }

    /**
     *
     *
     * @static
     * @param {KeyboardEvent} e
     * @memberof UICommon
     */
    static isEnterEvent(e) {
        return e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.shiftKey;
    }

    static onlyOnEnter(callback) {
        return (e) => {
            if (UICommon.isEnterEvent(e)) {
                return callback(e);
            } else {
                return true;
            }
        };
    }

    static MOBILE_WIDTH_BREAK_POINT = 760;

    static isMobile() {
        const testMobile = window.matchMedia || window.msMatchMedia;
        if (testMobile) {
            let testQuery = "(pointer:coarse)";
            if (arguments.length) {
                const max_width =
                    typeof arguments[0] === "boolean"
                        ? this.MOBILE_WIDTH_BREAK_POINT
                        : arguments[0];
                testQuery = `only screen and (max-width: ${max_width}px)`;
            }
            return testMobile(testQuery).matches;
        }
        return false;
    }

    static removeBodyScroll() {
        document.body.classList.add(this.SCROLL_DISABLER_CLASS);
    }

    static restoreBodyScroll() {
        document.body.classList.remove(this.SCROLL_DISABLER_CLASS);
    }

    /**
     *  Reformats input from any string to strict phone format
     *  @param {string}    val    free style phone number
     *  @param {string}    [filler=UICommon.FILLER]    free style phone number
     *  @returns {string}          phone number
     **/
    static formatPhone(val, filler = this.FILLER) {
        //starting from 11 digits in phone number
        const slots = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
        let digits = val.replace(/\D/g, "");
        //if there are more, move them to country code slot
        if (digits.length > 11) {
            let d = digits.length - 11;
            while (d > 0) {
                d--;
                slots.unshift(1);
            }
        }
        let stack = ["", "", "", "", ""];
        Array.from(digits).forEach((digit, index) => {
            let slot = slots[index];
            stack[slot - 1] = stack[slot - 1] + digit;
        });
        //creating map of parts lengths
        const lens = slots.reduce((acc, curr) => {
            if (typeof acc[curr] === "undefined") {
                acc[curr] = 1;
            } else {
                acc[curr] += 1;
            }
            return acc;
        }, {});
        //fill empty positions with filler (_)
        for (let t in stack) {
            let dif = lens[parseInt(t) + 1] - stack[t].length;
            while (dif > 0) {
                stack[t] = stack[t] + filler;
                dif--;
            }
        }
        return `+${stack[0]} (${stack[1]}) ${stack[2]}-${stack[3]}-${stack[4]}`;
    }

    static MONEY_SIGN = "&#8381;";

    static setMoneySign(val) {
        this.MONEY_SIGN = val;
    }

    /**
     *
     *
     * @static
     * @param {number} price
     * @return {string}
     * @memberof UICommon
     */
    static formatPrice(price) {
        let major = Math.floor(price / 100),
            minor = price % 100;
        return `${this.MONEY_SIGN}${major.toString()}.${minor.toString()}`;
    }

    static formatLocaleDatetime(dt, opts = { date: true, time: true }) {
        const date = dt.toLocaleDateString(window.navigator.language);
        const time = dt.toLocaleTimeString(window.navigator.language);
        if (opts.date && opts.time) {
            return `${date} ${time}`;
        } else if (opts.date && !opts.time) {
            return date;
        } else {
            return time;
        }
    }

    static tryFormatLocaleDateTime(value, opts = { date: true, time: true }) {
        if (typeof value == "string" || typeof value == "number") {
            const dt = new Date(value);
            return UICommon.formatLocaleDatetime(dt, opts);
        } else if (typeof value == "object") {
            return UICommon.formatLocaleDatetime(value, opts);
        } else {
            return "";
        }
    }

    static formatTimestamp(timestamp, offset = 0) {
        let offsetLocal = new Date().getTimezoneOffset();
        let deltaOffset = (offsetLocal - offset) * 60 * 1000;
        let localDateTime = new Date(parseInt(timestamp) - deltaOffset);
        return localDateTime.toLocaleString(window.navigator.language);
    }

    static TIME = {
        SECONDS: ["секунду", "секунды", "секунд"],
        MINUTES: ["минуту", "минуты", "минут"],
        HOURS: ["час", "часа", "часов"],
    };

    static declOfNum(n, text_forms) {
        n = Math.abs(n) % 100;
        let n1 = n % 10;
        if (n > 10 && n < 20) {
            return text_forms[2];
        }
        if (n1 > 1 && n1 < 5) {
            return text_forms[1];
        }
        if (n1 == 1) {
            return text_forms[0];
        }
        return text_forms[2];
    }

    static humanizedTimeDiff(date /* unix time */) {
        let currentTime = new Date().getTime();
        let sec = Math.round((currentTime - date) / 1000);
        let unit;
        if (sec < 60) {
            unit = this.declOfNum(sec, this.TIME.SECONDS);
            return `${sec} ${unit} назад`;
        } else if (sec < 3600) {
            let min = Math.floor(sec / 60);
            unit = this.declOfNum(min, this.TIME.MINUTES);
            return `${min} ${unit} назад`;
        } else {
            let hours = Math.floor(sec / (60 * 60));
            unit = this.declOfNum(hours, this.TIME.HOURS);
            return `${hours} ${unit} назад`;
        }
    }
}

export default UICommon;

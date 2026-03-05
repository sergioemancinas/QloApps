(function () {
    'use strict';
    var SPECIAL_REQUEST_KEY = 'fewo_special_request';
    var CHARGEABLE_GUESTS_KEY = 'fewo_chargeable_guests';
    var UNDER3_GUESTS_KEY = 'fewo_under3_guests';
    var MAX_TOTAL_GUESTS = 4;
    var lastRateChangeValue = null;
    var lastRateChangeTs = 0;
    var lastGuestChangeSignature = null;
    var lastGuestChangeTs = 0;

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
            return decodeURIComponent(match[2]);
        }
        return null;
    }

    function setCookie(name, value) {
        document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; SameSite=Lax';
    }

    function setStorageItem(key, value) {
        try {
            if (window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            // Ignore storage failures (private mode, strict browser settings)
        }
    }

    function getStorageItem(key) {
        try {
            if (window.localStorage) {
                return window.localStorage.getItem(key);
            }
        } catch (e) {
            // Ignore storage failures (private mode, strict browser settings)
        }
        return null;
    }

    function getDefaultRate() {
        if (typeof fewoPricingDefault !== 'undefined' && fewoPricingDefault) {
            return fewoPricingDefault;
        }
        return 'standard';
    }

    function syncRateSelection(value) {
        if (!value) {
            return;
        }
        var inputs = document.querySelectorAll('input[name="fewo_rate_option"]');
        inputs.forEach(function (input) {
            input.checked = (input.value === value);
        });
    }

    function onRateChange(value) {
        setCookie('fewo_rate_option', value);
        syncRateSelection(value);
        if (typeof BookingForm !== 'undefined' && BookingForm.refresh) {
            BookingForm.refresh();
        }
    }

    function triggerRateChange(value) {
        var now = Date.now();
        if (value && value === lastRateChangeValue && (now - lastRateChangeTs) < 250) {
            return;
        }

        lastRateChangeValue = value;
        lastRateChangeTs = now;
        onRateChange(value);
    }

    function getRateInputFromClickTarget(target) {
        if (!target || !target.closest) {
            return null;
        }

        var wrapper = target.closest('.fewo-rate-option');
        if (!wrapper) {
            return null;
        }

        return wrapper.querySelector('input[name="fewo_rate_option"]');
    }

    function getSpecialRequestField() {
        return document.querySelector('#fewo_special_request');
    }

    function getGuestField(name) {
        return document.querySelector('select[name="' + name + '"]');
    }

    function clampInt(value, min, max, fallback) {
        var parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            return fallback;
        }

        if (parsed < min) {
            return min;
        }

        if (parsed > max) {
            return max;
        }

        return parsed;
    }

    function normalizeGuestSelection(selection) {
        var safeSelection = selection || {};
        var chargeable = clampInt(safeSelection.chargeable, 1, 4, 2);
        var under3 = clampInt(safeSelection.under3, 0, 4, 0);
        var maxUnder3 = Math.max(0, MAX_TOTAL_GUESTS - chargeable);
        if (under3 > maxUnder3) {
            under3 = maxUnder3;
        }

        return {
            chargeable: chargeable,
            under3: under3
        };
    }

    function getGuestSelection() {
        var chargeableField = getGuestField('fewo_chargeable_guests');
        var under3Field = getGuestField('fewo_under3_guests');
        if (!chargeableField || !under3Field) {
            return null;
        }

        return normalizeGuestSelection({
            chargeable: clampInt(chargeableField.value, 1, 4, 2),
            under3: clampInt(under3Field.value, 0, 4, 0)
        });
    }

    function syncGuestSelection(selection) {
        var guestSelection = normalizeGuestSelection(selection || getGuestSelection());
        if (!guestSelection) {
            return;
        }

        var chargeableField = getGuestField('fewo_chargeable_guests');
        var under3Field = getGuestField('fewo_under3_guests');
        if (chargeableField) {
            chargeableField.value = String(guestSelection.chargeable);
        }
        if (under3Field) {
            under3Field.value = String(guestSelection.under3);
        }

        setCookie(CHARGEABLE_GUESTS_KEY, guestSelection.chargeable);
        setCookie(UNDER3_GUESTS_KEY, guestSelection.under3);
    }

    function triggerGuestChange(selection) {
        var guestSelection = normalizeGuestSelection(selection || getGuestSelection());
        if (!guestSelection) {
            return;
        }

        var signature = guestSelection.chargeable + ':' + guestSelection.under3;
        var now = Date.now();
        if (signature === lastGuestChangeSignature && (now - lastGuestChangeTs) < 250) {
            return;
        }

        lastGuestChangeSignature = signature;
        lastGuestChangeTs = now;
        syncGuestSelection(guestSelection);
        if (typeof BookingForm !== 'undefined' && BookingForm.refresh) {
            BookingForm.refresh();
        }
    }

    function getCheckoutMessageField() {
        return document.querySelector('textarea#message, textarea[name="message"]');
    }

    function getStoredSpecialRequest() {
        var fromStorage = getStorageItem(SPECIAL_REQUEST_KEY);
        if (fromStorage !== null && fromStorage !== undefined) {
            return fromStorage;
        }
        return getCookie(SPECIAL_REQUEST_KEY) || '';
    }

    function saveSpecialRequest(value) {
        setStorageItem(SPECIAL_REQUEST_KEY, value);
        setCookie(SPECIAL_REQUEST_KEY, value);
    }

    function syncSpecialRequest(value) {
        var requestValue = value || '';
        var requestField = getSpecialRequestField();
        if (requestField && requestField.value !== requestValue) {
            requestField.value = requestValue;
        }

        var messageField = getCheckoutMessageField();
        if (messageField && !messageField.value.trim()) {
            messageField.value = requestValue;
        }
    }

    // Keep pricing logic in booking flow only, not in the room information copy.
    function hidePricingCopyFromInfoTab() {
        var infoTab = document.querySelector('#product_info_tab_information');
        if (!infoTab) {
            return;
        }

        var pricingCopyPatterns = [
            /rate options and pricing/i,
            /final price is calculated automatically/i,
            /base daily rate/i,
            /non-refundable rates include/i,
            /weekly rates apply from 7 nights/i,
            /pricing is calculated dynamically/i
        ];

        infoTab.querySelectorAll('p, li').forEach(function (node) {
            var text = (node.textContent || '').replace(/\s+/g, ' ').trim();
            if (!text) {
                return;
            }

            var shouldRemove = pricingCopyPatterns.some(function (pattern) {
                return pattern.test(text);
            });

            if (shouldRemove && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });

        infoTab.querySelectorAll('ul').forEach(function (list) {
            if (!list.querySelector('li') && list.parentNode) {
                list.parentNode.removeChild(list);
            }
        });

        infoTab.querySelectorAll('p').forEach(function (paragraph) {
            if (!paragraph.textContent.trim() && paragraph.parentNode) {
                paragraph.parentNode.removeChild(paragraph);
            }
        });
    }

    document.addEventListener('change', function (event) {
        if (event.target && event.target.name === 'fewo_rate_option') {
            triggerRateChange(event.target.value);
            return;
        }

        if (event.target && (
            event.target.name === 'fewo_chargeable_guests' ||
            event.target.name === 'fewo_under3_guests'
        )) {
            triggerGuestChange();
        }
    });

    // Uniform/customized radios may swallow native change in some browsers.
    // Click fallback keeps rate pricing responsive.
    document.addEventListener('click', function (event) {
        var input = getRateInputFromClickTarget(event.target);
        if (input && input.value) {
            window.setTimeout(function () {
                triggerRateChange(input.value);
            }, 0);
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        var cookieRate = getCookie('fewo_rate_option');
        var initialRate = cookieRate || getDefaultRate();
        syncRateSelection(initialRate);
        hidePricingCopyFromInfoTab();

        var defaultChargeable = (typeof fewoGuestChargeableDefault !== 'undefined')
            ? fewoGuestChargeableDefault
            : 2;
        var defaultUnder3 = (typeof fewoGuestUnder3Default !== 'undefined')
            ? fewoGuestUnder3Default
            : 0;
        var chargeableCookie = getCookie(CHARGEABLE_GUESTS_KEY);
        var under3Cookie = getCookie(UNDER3_GUESTS_KEY);
        var initialGuestSelection = normalizeGuestSelection({
            chargeable: clampInt(
                chargeableCookie !== null ? chargeableCookie : defaultChargeable,
                1,
                4,
                2
            ),
            under3: clampInt(
                under3Cookie !== null ? under3Cookie : defaultUnder3,
                0,
                4,
                0
            )
        });
        syncGuestSelection(initialGuestSelection);

        var specialRequest = getStoredSpecialRequest();
        syncSpecialRequest(specialRequest);

        var requestField = getSpecialRequestField();
        if (requestField) {
            requestField.addEventListener('input', function () {
                saveSpecialRequest(requestField.value);
                syncSpecialRequest(requestField.value);
            });
        }

        // Checkout content can be injected after page load in OPC flows.
        window.setTimeout(function () {
            syncSpecialRequest(getStoredSpecialRequest());
            hidePricingCopyFromInfoTab();
        }, 1200);
    });
})();

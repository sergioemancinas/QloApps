/**
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License version 3.0
* that is bundled with this package in the file LICENSE.md
* It is also available through the world-wide-web at this URL:
* https://opensource.org/license/osl-3-0-php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to support@qloapps.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade this module to a newer
* versions in the future. If you wish to customize this module for your needs
* please refer to https://store.webkul.com/customisation-guidelines for more information.
*
* @author Webkul IN
* @copyright Since 2010 Webkul
* @license https://opensource.org/license/osl-3-0-php Open Software License version 3.0
*/

const BookingSearchManager = {
    inputSteps: {
        'location': {
            init: function() {
                $('.location_search_results_ul').hide();

                // search location with users searched characters
                $(document).on('keyup', '#hotel_location', function(e) {
                    BookingSearchManager.inputSteps['location'].onInput.call(this, e);
                });

                // set data on clicking the searched location on dropdown
                $(document).on('click', '.location_search_results_ul li', function(e) {
                    e.preventDefault();

                    BookingSearchManager.inputSteps['location'].onInputComplete.call(this, e);
                });

                // handle Tab key press on hotel location field
                $(document).on('keydown', '#hotel_location', function (e) {
                    if (e.which == 9) { // Tab key
                        e.preventDefault();

                        if ($('.location_search_results_ul').is(':visible')) {
                            $('.location_search_results_ul li:first').focus().click();
                        } else {
                            BookingSearchManager.activateStep('hotel');
                        }
                    }
                });

                // handle Tab key press on hotel location list
                $(document).on('keydown', '.location_search_results_ul li', function (e) {
                    if (e.which == 9) { // Tab key
                        e.preventDefault();
                        $(this).click();
                    }
                });

                // navigate to prev and next li in the location dropdown
                $('body').on('keydown', '.location_search_results_ul li', function(e) {
                    if (e.which == 40 || e.which == 38) {
                        var ulElement = $(this).closest('ul');
                        var ulLength = ulElement.find('li').length;
                        $(this).blur();
                        ulElement.scrollTop($(this).index() * $(this).outerHeight());
                        if (e.which == 40) {
                            if ($(this).index() != (ulLength - 1)) {
                                $(this).next('li.search_result_li').focus();
                            } else {
                                ulElement.find('li:first').focus();
                            }
                        } else if (e.which == 38) {
                            if ($(this).index()) {
                                $(this).prev('li.search_result_li').focus();
                            } else {
                                ulElement.find('li:last').focus();
                            }
                        }
                    }
                });
            },
            activate: function() {
                $('#hotel_location').focus();
            },
            inputHasValue: function () {
                return ($('#hotel_location').val() != '') && ($('#location_category_id').val() != '');
            },
            onInput: function (e) {
                if (e.which == 13) {
                    return;
                }

                if (($('.location_search_results_ul').is(':visible')) && (e.which == 40 || e.which == 38)) {
                    $(this).blur();
                    if (e.which == 40) {
                        $('.location_search_results_ul li:first').focus();
                    } else if (e.which == 38) {
                        $('.location_search_results_ul li:last').focus();
                    }
                } else {
                    $('.location_search_results_ul').empty().hide();
                    if ($(this).val() != '') {
                        abortRunningAjax();
                        ajax_check_var = $.ajax({
                            url: autocomplete_search_url,
                            data: {
                                to_search_data: $(this).val(),
                            },
                            method: 'POST',
                            dataType: 'json',
                            success: function(result) {
                                if (result.status) {
                                    $('.location_search_results_ul').html(result.data);
                                    $('.location_search_results_ul').show();
                                }
                            }
                        });
                    } else {
                        $('#location_category_id').val('');
                    }
                }
            },
            onInputComplete: function (e) {
                e.preventDefault();

                $('.location_search_results_ul').empty().hide();
                $('#hotel_location').attr('value', $(this).html());
                $('#location_category_id').val($(this).val());

                // fetch hotels for selected location
                $.ajax({
                    url: autocomplete_search_url,
                    data: {
                        location_category_id: $('#location_category_id').val(),
                    },
                    method: 'POST',
                    dataType: 'json',
                    success: function(result) {
                        if (result.status) {
                            $('#hotel_cat_id').val('');
                            $('#id_hotel_button').html(result.html_hotel_options);
                            $('#id_hotel_button').trigger('chosen:updated');
                            // Resetting the data from previously selected hotel
                            $('#min_booking_offset').val(0);
                            var max_order_date = $('#max_order_date').val();
                            var min_booking_offset = 0;
                            createDateRangePicker(max_order_date, min_booking_offset, $('#check_in_time').val(), $('#check_out_time').val());
                            if (search_auto_focus_next_field) {
                                BookingSearchManager.activateStep('hotel');
                            }
                        } else {
                            alert(no_results_found_cond);
                        }
                    }
                });
            },
        },
        'hotel': {
            init: function() {
                $('select#id_hotel_button').chosen({
                    search_contains: true,
                    disable_search: !hotel_name_has_search,
                    width: '100%',
                });

                $(document).on('change', '#id_hotel_button', function() {
                    if ($(this).find('option:selected').val().trim() != '') {
                        $('#id_hotel_button_chosen .chosen-search input').blur();
                        BookingSearchManager.inputSteps['hotel'].onInputComplete.call(this);
                    }
                });

                // prevents calendar from closing on hotel selection
                $(document).on('click', '#id_hotel_button_chosen li', function(e) {
                    e.stopPropagation();
                });

                $(document).on('keydown', '#id_hotel_button_chosen.chosen-container-active', function (e) {
                    if (e.which == 9) { // Tab key
                        e.preventDefault();
                        if ($('#daterange_value').length) {
                            $('#daterange_value').focus();
                            $('#daterange_value').click();
                        }
                    }
                });

                $(document).on('keydown', '#id_hotel_button_chosen .chosen-search input', function (e) {
                    if (e.which == 9 && $('#daterange_value').siblings('.date-picker-wrapper').is(':visible')) { // Tab key
                        e.preventDefault();
                        $('#daterange_value').data('dateRangePicker').close();

                        if (is_occupancy_wise_search) {
                            BookingSearchManager.activateStep('occupancy');
                        } else {
                            BookingSearchManager.activateStep('submit');
                        }
                    }
                });

                // if chosen will not be initialized add placeholder to hotel select element as first option
                if (!BookingSearchManager.isBrowserSupported()) {
                    $('select#id_hotel_button option').first().html(select_htl_txt);
                }

                if (hotel_name_has_search) {
                    $('select#id_hotel_button').on('chosen:showing_dropdown', function() {
                        $(this).siblings('.chosen-container').find('.chosen-single').addClass('invisible')
                    });

                    $('select#id_hotel_button').on('chosen:hiding_dropdown', function() {
                        $(this).siblings('.chosen-container').find('.chosen-single').removeClass('invisible')
                    });
                }
            },
            activate: function() {
                $('#id_hotel_button').trigger('chosen:open');
            },
            inputHasValue: function () {
                return ($('#id_hotel').val() != '') && ($('#hotel_cat_id').val() != '');
            },
            onInputComplete: function () {
                $('#id_hotel_button_chosen .chosen-search input').blur();
                const selectedHotel = $(this).find('option:selected');

                if ($(selectedHotel).val().trim() != '') {
                    const maxOrderDate = $(selectedHotel).attr('data-max_order_date');
                    const minBookingOffset = $(selectedHotel).attr('data-min_booking_offset')

                    createDateRangePicker(maxOrderDate, minBookingOffset, $('#check_in_time').val(), $('#check_out_time').val());

                    $('#max_order_date').val(maxOrderDate);
                    $('#min_booking_offset').val(minBookingOffset);
                    $('#id_hotel').val($(selectedHotel).attr('data-id-hotel'));
                    $('#hotel_cat_id').val($(selectedHotel).attr('data-hotel-cat-id'));

                    if (search_auto_focus_next_field) {
                        setTimeout(function () {
                            if ($('#id_hotel_button').data('chosen') != undefined) {
                                $('#id_hotel_button').data('chosen').close_field();
                            }

                            BookingSearchManager.activateStep('date_range');
                        }, 10);
                    }
                } else {
                    $('#id_hotel').val('');
                    $('#hotel_cat_id').val('');
                }
            },
        },
        'date_range': {
            init: function() {
                $(document).on('keydown', '#daterange_value', function (e) {
                    if (e.which == 9) { // Tab key
                        e.preventDefault();
                        $('#daterange_value').removeClass('focused').blur();

                        if ($('#daterange_value').data('dateRangePicker') != undefined) {
                            $('#daterange_value').data('dateRangePicker').close();
                        }

                        if (is_occupancy_wise_search) {
                            BookingSearchManager.activateStep('occupancy');
                        } else {
                            BookingSearchManager.activateStep('submit');
                        }
                    }
                });
            },
            activate: function() {
                $('#daterange_value').data('dateRangePicker').open();
            },
            inputHasValue: function () {
                return ($('#check_in_time').val() != '') && ($('#check_out_time').val() != '');
            },
        },
        'occupancy': {
            init: function() {
                $(document).on('keydown', '#guest_occupancy', function (e) {
                    if (e.which == 9) { // Tab key
                        e.preventDefault();
                        if ($('#search_occupancy_wrapper').css('display') != 'none') {
                            $('#guest_occupancy').click();
                        }

                        BookingSearchManager.activateStep('submit');
                    }
                });
            },
            activate: function() {
                if ($('#search_occupancy_wrapper').css('display') == 'none') {
                    $('#guest_occupancy').click().focus();
                }
            },
            inputHasValue: function () {
                return false;
            },
        },
        'submit': {
            activate: function() {
                $('#search_room_submit').focus();
            },
            inputHasValue: function () {
                return false;
            },
        },
    },
    init: function () {
        this.inputSteps['location'].init();
        this.inputSteps['hotel'].init();
        this.inputSteps['date_range'].init();
        if (is_occupancy_wise_search) {
            this.inputSteps['occupancy'].init();
        }
    },
    activateStep: function (step) {
        if (step in this.inputSteps) {
            this.inputSteps[step].activate();
        }
    },
    allFieldsFilled: function () {
        return this.inputSteps['hotel'].inputHasValue()
            && this.inputSteps['date_range'].inputHasValue()
    },
    isBrowserSupported: function() { // defined as it is from chosen to decide if chosen will be initialized
        if (window.navigator.appName === "Microsoft Internet Explorer") {
            return document.documentMode >= 8;
        }
        if (/iP(od|hone)/i.test(window.navigator.userAgent)) {
            return false;
        }
        if (/Android/i.test(window.navigator.userAgent)) {
            if (/Mobile/i.test(window.navigator.userAgent)) {
                return false;
            }
        }

        return true;
    },
}

$(document).ready(function() {
    // initialize booking search fields
    BookingSearchManager.init();

    // for screen size changes for room search
    var window_width = $(window).width();
    if (window_width > 767) {
        $('.fancy_search_header_xs').hide();
    }

    if ($("body").length) {
        $(window).resize(function() {
            var window_width = $(window).width();
            if (window_width > 767) {
                $.fancybox.close();
                $('.fancy_search_header_xs').hide();
            } else {
                $('.fancy_search_header_xs').show();
            }
        });
    }
    $(function() {
        $('#xs_room_search').fancybox({
            minWidth: 200,
            autoSize: true,
            padding: 0,
            autoScale: false,
            maxWidth: '100%',
            helpers: {
                overlay: { closeClick: false } //Disable click outside event
            },
            'afterClose': function() {
                $('.header-rmsearch-container').show();
                $('#xs_room_search_form').show();
            },
        });
    });

    /*END*/
    var ajax_check_var = '';
    var availability_ajax_var = '';
    var unavailableDatesMap = {};
    var unavailableDatesHotelId = 0;
    var unavailableDatesRange = { from: '', to: '' };
    var unavailableDatesLoaded = false;
    var nativeDateFallbackInitialized = false;
    var calendarLayoutKey = '';
    var touchCalendarResizeTimer = null;
    var calendarEnhanceTimer = null;
    var calendarMutationObserver = null;

    showNativeDateFallback = function () {
        var fallback = $('#wk-native-date-fallback');
        if (!fallback.length) {
            var labelCheckin = (typeof RangePickerCheckin != 'undefined' && RangePickerCheckin) ? RangePickerCheckin : 'Check-in';
            var labelCheckout = (typeof RangePickerCheckout != 'undefined' && RangePickerCheckout) ? RangePickerCheckout : 'Check-out';
            var fallbackHtml =
                '<div id="wk-native-date-fallback" class="wk-native-date-fallback">'
                + '<div class="wk-native-date-field">'
                + '<label for="wk_native_check_in">' + labelCheckin + '</label>'
                + '<input type="date" id="wk_native_check_in" class="form-control header-rmsearch-input" />'
                + '</div>'
                + '<div class="wk-native-date-field">'
                + '<label for="wk_native_check_out">' + labelCheckout + '</label>'
                + '<input type="date" id="wk_native_check_out" class="form-control header-rmsearch-input" />'
                + '</div>'
                + '</div>';

            $('#daterange_value').closest('.form-group').append(fallbackHtml);
            fallback = $('#wk-native-date-fallback');

            $(document).on('change', '#wk_native_check_in', function () {
                var inDate = $(this).val();
                $('#check_in_time').val(inDate);
                if (inDate) {
                    var outInput = $('#wk_native_check_out');
                    outInput.attr('min', inDate);
                    if (outInput.val() && outInput.val() < inDate) {
                        outInput.val('');
                        $('#check_out_time').val('');
                    }
                }
            });

            $(document).on('change', '#wk_native_check_out', function () {
                $('#check_out_time').val($(this).val());
            });
        }

        $('#wk_native_check_in').val($('#check_in_time').val() || '');
        $('#wk_native_check_out').val($('#check_out_time').val() || '');
        fallback.show();
        nativeDateFallbackInitialized = true;
    }

    hideNativeDateFallback = function () {
        $('#wk-native-date-fallback').hide();
    }

    isTouchPrimaryPointer = function () {
        if (window.matchMedia) {
            if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
                return true;
            }
        }

        return ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    }

    isPhoneCalendarViewport = function () {
        return window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    }

    isTabletCalendarViewport = function () {
        return isTouchPrimaryPointer()
            && window.matchMedia
            && window.matchMedia('(min-width: 821px) and (max-width: 1200px)').matches;
    }

    shouldUseTouchCalendarShell = function () {
        return isTouchPrimaryPointer() && (isPhoneCalendarViewport() || isTabletCalendarViewport());
    }

    updateTouchModeClasses = function () {
        $('body').toggleClass('wk-touch-ui', isTouchPrimaryPointer());
        $('body').toggleClass('wk-touch-phone', isPhoneCalendarViewport());
        $('body').toggleClass('wk-touch-tablet', isTabletCalendarViewport());
    }

    openTouchCalendarShell = function () {
        updateTouchModeClasses();
        if (!shouldUseTouchCalendarShell()) {
            return;
        }

        var overlay = $('#wk-calendar-backdrop');
        if (!overlay.length) {
            $('body').append('<div id="wk-calendar-backdrop" class="wk-calendar-backdrop"></div>');
            overlay = $('#wk-calendar-backdrop');
        }

        overlay.off('click.wkcalendar').on('click.wkcalendar', function () {
            var pickerObj = $('#daterange_value').data('dateRangePicker');
            if (pickerObj && typeof pickerObj.close == 'function') {
                pickerObj.close();
            }
        });

        $('body')
            .addClass('wk-touch-calendar-active')
            .toggleClass('wk-touch-calendar-phone', isPhoneCalendarViewport())
            .toggleClass('wk-touch-calendar-tablet', !isPhoneCalendarViewport());
    }

    closeTouchCalendarShell = function () {
        $('body').removeClass('wk-touch-calendar-active wk-touch-calendar-phone wk-touch-calendar-tablet');
    }

    formatDateForApi = function (dateObj) {
        return $.datepicker.formatDate('yy-mm-dd', dateObj);
    }

    redrawDateRangePicker = function () {
        if (typeof $('#daterange_value').data('dateRangePicker') != 'undefined') {
            $('#daterange_value').data('dateRangePicker').redraw();
            setTimeout(function() {
                ensureDatePickerLegend();
                syncCalendarLegendLayout();
                applyCalendarVisualStyles();
            }, 0);
        }
    }

    syncCalendarAvailabilityClasses = function (picker) {
        if (!picker || !picker.length) {
            return;
        }

        picker.find('.day.toMonth').each(function () {
            var day = $(this);
            var time = parseInt(day.attr('time'), 10);
            if (isNaN(time)) {
                return;
            }

            var unavailable = isDateUnavailable(new Date(time));
            if (unavailable) {
                day
                    .addClass('wk-unavailable-date')
                    .removeClass('wk-available-date')
                    .removeClass('valid')
                    .addClass('invalid');
            } else {
                day.removeClass('wk-unavailable-date');
                if (day.hasClass('valid')) {
                    day.addClass('wk-available-date');
                }
            }
        });
    }

    applyCalendarVisualStyles = function () {
        var picker = $('#daterange_value').siblings('.date-picker-wrapper');
        if (!picker.length) {
            return;
        }

        // Reset inline day styles before repainting from current classes.
        picker.find('.day').css({
            'background': '',
            'background-image': '',
            'border-color': '',
            'color': '',
            'font-weight': '',
            'box-shadow': '',
            'cursor': '',
            'text-decoration': '',
            'transform': ''
        });

        syncCalendarAvailabilityClasses(picker);

        picker.find('.day.wk-available-date').each(function () {
            var day = $(this);
            if (
                day.hasClass('checked')
                || day.hasClass('first-date-selected')
                || day.hasClass('last-date-selected')
                || day.hasClass('hovering')
                || day.hasClass('invalid')
            ) {
                return;
            }

            day.css({
                'background': '#d9f4dc',
                'border-color': '#1d7a3d',
                'color': '#0f5132',
                'font-weight': '700',
                'box-shadow': 'inset 0 0 0 1px rgba(17,94,52,.16)'
            });
        });

        picker.find('.day.wk-unavailable-date').each(function () {
            var day = $(this);
            day.css({
                'background': '#ffe5e5',
                'background-image': 'repeating-linear-gradient(135deg, rgba(153,27,27,.22) 0, rgba(153,27,27,.22) 4px, transparent 4px, transparent 8px)',
                'border-color': '#b91c1c',
                'color': '#7f1d1d',
                'font-weight': '700',
                'cursor': 'not-allowed',
                'text-decoration': 'none'
            });
        });

        picker.find('.day.checked').each(function () {
            var day = $(this);
            if (day.hasClass('first-date-selected') || day.hasClass('last-date-selected')) {
                day.css({
                    'background': '#0f80e4',
                    'border-color': '#0f80e4',
                    'color': '#ffffff',
                    'font-weight': '700'
                });
            } else {
                day.css({
                    'background': '#e6ebf2',
                    'border-color': '#bac6d8',
                    'color': '#2f3d4f',
                    'font-weight': '700',
                    'box-shadow': 'inset 0 0 0 1px rgba(120, 138, 164, .16)'
                });
            }
        });

        // While dragging after first click, highlight provisional nights selection.
        picker.find('.day.hovering').each(function () {
            var day = $(this);
            if (day.hasClass('wk-unavailable-date')) {
                return;
            }
            // Allow "invalid tmp" hover cells so the user can preview before minimum nights is reached.
            if (day.hasClass('invalid') && !day.hasClass('tmp')) {
                return;
            }

            if (day.hasClass('first-date-selected') || day.hasClass('last-date-selected')) {
                day.css({
                    'background': '#0f80e4',
                    'border-color': '#0f80e4',
                    'color': '#ffffff',
                    'font-weight': '700'
                });
            } else {
                day.css({
                    'background': '#dfe6f1',
                    'border-color': '#b0bed3',
                    'color': '#2f3d4f',
                    'font-weight': '700',
                    'box-shadow': 'inset 0 0 0 1px rgba(120, 138, 164, .16)'
                });
            }
        });
    }

    startCalendarEnhancer = function () {
        if (calendarEnhanceTimer) {
            clearInterval(calendarEnhanceTimer);
        }

        calendarEnhanceTimer = setInterval(function () {
            var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
            if (!picker.length) {
                stopCalendarEnhancer();
                return;
            }

            ensureDatePickerLegend();
            syncCalendarLegendLayout();
            applyCalendarVisualStyles();
        }, 180);
    }

    stopCalendarEnhancer = function () {
        if (calendarEnhanceTimer) {
            clearInterval(calendarEnhanceTimer);
            calendarEnhanceTimer = null;
        }
    }

    startCalendarMutationObserver = function () {
        if (!window.MutationObserver) {
            return;
        }

        stopCalendarMutationObserver();
        var monthWrapper = $('#daterange_value').siblings('.date-picker-wrapper:visible').find('.month-wrapper').get(0);
        if (!monthWrapper) {
            return;
        }

        calendarMutationObserver = new MutationObserver(function () {
            ensureDatePickerLegend();
            syncCalendarLegendLayout();
            applyCalendarVisualStyles();
        });
        calendarMutationObserver.observe(monthWrapper, {
            childList: true,
            subtree: true,
        });
    }

    stopCalendarMutationObserver = function () {
        if (calendarMutationObserver) {
            calendarMutationObserver.disconnect();
            calendarMutationObserver = null;
        }
    }

    animateDateSelectionFeedback = function () {
        var fields = $('#daterange_value, #daterange_value_from, #daterange_value_to').filter(':visible');
        if (!fields.length) {
            fields = $('#daterange_value');
        }

        fields.removeClass('wk-date-selection-animated');
        setTimeout(function () {
            fields.addClass('wk-date-selection-animated');
        }, 0);
        setTimeout(function () {
            fields.removeClass('wk-date-selection-animated');
        }, 460);
    }

    ensureDatePickerLegend = function () {
        var legendAvailable = (typeof available_date_txt != 'undefined' && available_date_txt) ? available_date_txt : 'Available';
        var legendUnavailable = (typeof unavailable_date_txt != 'undefined' && unavailable_date_txt) ? unavailable_date_txt : 'Already booked';
        var legendSelected = (typeof selected_nights_txt != 'undefined' && selected_nights_txt) ? selected_nights_txt : 'Selected nights';
        var legendToday = (typeof today_txt != 'undefined' && today_txt) ? today_txt : 'Today';
        var picker = $('#daterange_value').siblings('.date-picker-wrapper');

        if (!picker.length || picker.find('.wk-calendar-legend').length) {
            return;
        }

        picker.append(
            '<div class="wk-calendar-legend" role="note" aria-label="Calendar availability legend">'
            + '<span class="wk-legend-item"><i class="wk-legend-dot wk-legend-dot-available"></i><span class="wk-legend-label">' + legendAvailable + '</span></span>'
            + '<span class="wk-legend-separator" aria-hidden="true">|</span>'
            + '<span class="wk-legend-item"><i class="wk-legend-dot wk-legend-dot-selected"></i><span class="wk-legend-label">' + legendSelected + '</span></span>'
            + '<span class="wk-legend-separator" aria-hidden="true">|</span>'
            + '<span class="wk-legend-item"><i class="wk-legend-dot wk-legend-dot-unavailable"></i><span class="wk-legend-label">' + legendUnavailable + '</span></span>'
            + '<button type="button" class="wk-calendar-today-btn">' + legendToday + '</button>'
            + '</div>'
        );

        var legend = picker.find('.wk-calendar-legend');
        legend.css({
            'position': 'absolute',
            'left': '10px',
            'right': '10px',
            'bottom': '8px',
            'z-index': '3',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'gap': '8px',
            'flex-wrap': 'wrap',
            'margin-top': '0',
            'padding': '6px 8px 0',
            'border-top': '1px solid #e8edf4',
            'background': 'linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,1) 55%)',
            'font-size': '12px',
            'text-align': 'center',
            'overflow-x': 'hidden',
            'overflow-y': 'hidden'
        });
        legend.find('.wk-legend-item').css({
            'display': 'inline-flex',
            'align-items': 'center',
            'gap': '6px',
            'padding': '4px 8px',
            'border-radius': '999px',
            'border': '1px solid #d3dae5',
            'background-color': '#fbfcff',
            'font-weight': '800',
            'white-space': 'nowrap',
            'flex': '0 0 auto'
        });
        legend.find('.wk-legend-dot').css({
            'width': '12px',
            'height': '12px',
            'border-radius': '3px',
            'display': 'inline-block',
            'border': '1px solid transparent'
        });
        legend.find('.wk-legend-dot-available').css({
            'background-color': '#d9f4dc',
            'border-color': '#1d7a3d',
            'box-shadow': '0 0 0 1px rgba(17, 94, 52, 0.14)'
        });
        legend.find('.wk-legend-dot-selected').css({
            'background-color': '#e6ebf2',
            'border-color': '#bac6d8',
            'box-shadow': '0 0 0 1px rgba(120, 138, 164, .14)'
        });
        legend.find('.wk-legend-dot-unavailable').css({
            'background-color': '#ffe5e5',
            'background-image': 'repeating-linear-gradient(135deg, rgba(153, 27, 27, 0.22) 0, rgba(153, 27, 27, 0.22) 4px, transparent 4px, transparent 8px)',
            'border-color': '#b91c1c',
            'box-shadow': '0 0 0 1px rgba(127, 29, 29, 0.14)'
        });
        legend.find('.wk-legend-label').css({
            'font-weight': '800',
            'letter-spacing': '.01em'
        });
        legend.find('.wk-legend-separator').css({
            'font-weight': '700',
            'color': '#64748b'
        });
        legend.find('.wk-calendar-today-btn').css({
            'margin-left': '4px',
            'padding': '4px 8px',
            'border-radius': '999px',
            'border': '1px solid #9fb0c7',
            'background': '#f2f6fb',
            'color': '#334155',
            'font-weight': '700',
            'line-height': '1.2',
            'cursor': 'pointer',
            'white-space': 'nowrap',
            'flex': '0 0 auto'
        });

        legend.find('.wk-calendar-today-btn')
            .off('click.wkcal touchend.wkcal keydown.wkcal')
            .on('click.wkcal touchend.wkcal', function(e) {
                goToTodayInDatePicker(e);
            })
            .on('keydown.wkcal', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    goToTodayInDatePicker(e);
                }
            });

        syncCalendarLegendLayout();
    }

    goToTodayInDatePicker = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        var pickerObj = $('#daterange_value').data('dateRangePicker');
        if (!pickerObj) {
            return;
        }

        if (typeof pickerObj.resetMonthsView == 'function') {
            pickerObj.resetMonthsView(new Date());
        } else if (typeof pickerObj.redraw == 'function') {
            pickerObj.redraw();
        }

        if (typeof pickerObj.redraw == 'function') {
            pickerObj.redraw();
        }

        setTimeout(function () {
            ensureDatePickerLegend();
            syncCalendarLegendLayout();
            applyCalendarVisualStyles();
        }, 16);
    }

    syncCalendarLegendLayout = function () {
        var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
        if (!picker.length) {
            picker = $('#daterange_value').siblings('.date-picker-wrapper');
        }
        if (!picker.length) {
            return;
        }

        var legend = picker.find('.wk-calendar-legend');
        if (!legend.length) {
            return;
        }

        var legendHeight = Math.ceil(legend.outerHeight(true) || 0);
        var bottomPadding = Math.max(44, legendHeight + 10);
        picker.css({
            'padding-bottom': bottomPadding + 'px',
            'min-height': ''
        });
    }

    shouldUseSingleMonthCalendar = function () {
        if (window.matchMedia) {
            return window.matchMedia('(max-width: 900px)').matches;
        }

        return $(window).width() <= 900;
    }

    getCalendarLayoutKey = function () {
        var mode = shouldUseSingleMonthCalendar() ? 'single' : 'double';
        var viewport = isPhoneCalendarViewport() ? 'phone' : (isTabletCalendarViewport() ? 'tablet' : 'desktop');
        return mode + ':' + viewport;
    }

    getMinimumStayDays = function () {
        // 2 nights minimum stay => 3 calendar days in daterangepicker.
        return 3;
    }

    isDateUnavailable = function (dateObj) {
        return !!unavailableDatesMap[formatDateForApi(dateObj)];
    }

    getDatePickerOptions = function (options) {
        var singleMonth = shouldUseSingleMonthCalendar();
        return $.extend({}, options, {
            singleMonth: singleMonth,
            stickyMonths: !singleMonth,
            minDays: getMinimumStayDays(),
            beforeShowDay: function (dateObj) {
                if (isDateUnavailable(dateObj)) {
                    return [false, 'wk-unavailable-date'];
                }

                return [true, 'wk-available-date'];
            }
        });
    }

    refreshUnavailableDates = function (startDateObj, maxOrderDateObj) {
        if (typeof availability_search_url == 'undefined' || !availability_search_url) {
            return;
        }

        var idHotel = parseInt($('#id_hotel').val() || 0);
        if (!idHotel) {
            unavailableDatesMap = {};
            unavailableDatesHotelId = 0;
            unavailableDatesRange = { from: '', to: '' };
            unavailableDatesLoaded = false;
            redrawDateRangePicker();
            return;
        }

        var dateFrom = formatDateForApi(startDateObj);
        var dateToObj;
        if (maxOrderDateObj) {
            dateToObj = maxOrderDateObj;
        } else {
            dateToObj = new Date(startDateObj.getTime());
            dateToObj.setDate(dateToObj.getDate() + 365);
        }

        var dateTo = formatDateForApi(dateToObj);

        if (unavailableDatesLoaded
            && unavailableDatesHotelId === idHotel
            && unavailableDatesRange.from
            && unavailableDatesRange.to
            && unavailableDatesRange.from <= dateFrom
            && unavailableDatesRange.to >= dateTo
        ) {
            return;
        }

        if (unavailableDatesHotelId !== idHotel) {
            unavailableDatesMap = {};
            unavailableDatesLoaded = false;
            redrawDateRangePicker();
        }

        if (availability_ajax_var) {
            availability_ajax_var.abort();
        }

        availability_ajax_var = $.ajax({
            url: availability_search_url,
            data: {
                id_hotel: idHotel,
                hotel_cat_id: $('#hotel_cat_id').val() || '',
                date_from: dateFrom,
                date_to: dateTo,
            },
            method: 'POST',
            dataType: 'json',
            success: function(result) {
                if (result.status && $.isArray(result.unavailable_dates)) {
                    unavailableDatesMap = {};
                    $.each(result.unavailable_dates, function(_, dateStr) {
                        unavailableDatesMap[dateStr] = true;
                    });
                    unavailableDatesHotelId = idHotel;
                    unavailableDatesRange = {
                        from: dateFrom,
                        to: dateTo,
                    };
                    unavailableDatesLoaded = true;
                    redrawDateRangePicker();
                }
            },
            error: function() {
                unavailableDatesMap = {};
                unavailableDatesLoaded = false;
                unavailableDatesHotelId = idHotel;
                unavailableDatesRange = { from: '', to: '' };
                redrawDateRangePicker();
            }
        });
    }

    createDateRangePicker = function (max_order_date, min_booking_offset, dateFrom, dateTo) {
        let start_date = new Date();
        if (min_booking_offset) {
            start_date.setDate(start_date.getDate() + parseInt(min_booking_offset));
            start_date.setHours(0, 0, 0, 0);
        }

        // Using the Date object will also add extra hours according to the timezone.
        let selectedDateFrom = $.datepicker.parseDate('yy-mm-dd', dateFrom);
        let selectedDateTo = $.datepicker.parseDate('yy-mm-dd', dateTo);
        if (max_order_date) {
            max_order_date = $.datepicker.parseDate('yy-mm-dd', max_order_date);
        } else {
            max_order_date = false;
        }
        let max_order_date_obj = max_order_date ? new Date(max_order_date.getTime()) : false;

        if (selectedDateFrom < start_date
            || selectedDateTo < start_date
            || (max_order_date && (max_order_date < selectedDateTo))
        ) {
            $('#check_in_time').val('');
            $('#check_out_time').val('');
        }

        if (typeof $('#daterange_value').data('dateRangePicker') != 'undefined') {
            if (max_order_date) {
                if ($.datepicker.parseDate('yy-mm-dd', $('#check_out_time').val()) < max_order_date) {
                    dateFrom = dateFrom ? dateFrom :$('#check_in_time').val();
                    dateTo = dateTo ? dateTo : $('#check_out_time').val();
                } else {
                    dateFrom = false;
                    dateTo = false;
                }
            }
            $('#daterange_value').data('dateRangePicker').clear();
            $('#daterange_value').data('dateRangePicker').destroy();
            $("#daterange_value").off("datepicker-change");
        }

        if (max_order_date) {
            max_order_date = $.datepicker.formatDate('dd-mm-yy', max_order_date);
        }

        refreshUnavailableDates(start_date, max_order_date_obj);

        if (typeof(multiple_dates_input) != 'undefined' && multiple_dates_input) {
            $('#daterange_value').dateRangePicker(getDatePickerOptions({
                startDate: $.datepicker.formatDate('dd-mm-yy', new Date()),
                separator : ' to ',
                setValue: function(s,s1,s2)
                {
                    if (s1) {
                        $('#daterange_value_from').find('span').html(s1);
                    } else {
                        $('#daterange_value_from').find('span').html(
                            RangePickerCheckin
                        );
                    }
                    if (s2) {
                        $('#daterange_value_to').find('span').html(s2);
                    } else {
                        $('#daterange_value_to').find('span').html(
                            RangePickerCheckin
                        );
                    }
                },
                endDate: max_order_date,
                customOpenAnimation: function(cb)
                {
                    $(this).show(10, cb);
                },
                customCloseAnimation: function(cb)
                {
                    $(this).hide(10, cb);
                }
            })).on('datepicker-first-date-selected', function() {
                calendarFirstDateSelected = true;
            }).on('datepicker-change', function(event,obj){
                $('#check_in_time').val($.datepicker.formatDate('yy-mm-dd', obj.date1));
                $('#check_out_time').val($.datepicker.formatDate('yy-mm-dd', obj.date2));
                animateDateSelectionFeedback();
                focusNextOnCalendarClose = true;
                calendarFirstDateSelected = false;
            }).on('datepicker-open', function() {
                $('#daterange_value').addClass('focused').focus();
                ensureDatePickerLegend();
                syncCalendarLegendLayout();
                hideNativeDateFallback();
                applyCalendarVisualStyles();
                startCalendarEnhancer();
                startCalendarMutationObserver();
                openTouchCalendarShell();
                if (!shouldUseTouchCalendarShell()) {
                    forceDatepickerDown();
                    setTimeout(function () {
                        var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
                        if (picker.length) {
                            clampDatepickerWithinViewport(picker, $('#daterange_value'));
                        }
                    }, 0);
                }
            }).on('datepicker-close', function() {
                $('#daterange_value').removeClass('focused').blur();
                stopCalendarEnhancer();
                stopCalendarMutationObserver();
                closeTouchCalendarShell();
            }).on('datepicker-closed', function() {
                stopCalendarEnhancer();
                stopCalendarMutationObserver();
                closeTouchCalendarShell();
                if (search_auto_focus_next_field && focusNextOnCalendarClose) {
                    if (is_occupancy_wise_search) {
                        if ($('#check_in_time').val() != '' && $('#check_out_time').val() != '') {
                            BookingSearchManager.activateStep('occupancy');
                        }
                    } else {
                        if (BookingSearchManager.allFieldsFilled()) {
                            BookingSearchManager.activateStep('submit');
                        }
                    }

                    focusNextOnCalendarClose = false;
                }
            });
        } else {
            $('#daterange_value').dateRangePicker(getDatePickerOptions({
                startDate: start_date,
                endDate: max_order_date,
                customOpenAnimation: function(cb)
                {
                    $(this).show(10, cb);
                },
                customCloseAnimation: function(cb)
                {
                    $(this).hide(10, cb);
                }
            })).on('datepicker-first-date-selected', function() {
                calendarFirstDateSelected = true;
            }).on('datepicker-change', function(event,obj){
                $('#check_in_time').val($.datepicker.formatDate('yy-mm-dd', obj.date1));
                $('#check_out_time').val($.datepicker.formatDate('yy-mm-dd', obj.date2));
                animateDateSelectionFeedback();
                focusNextOnCalendarClose = true;
                calendarFirstDateSelected = false;
            }).on('datepicker-open', function() {
                $('#daterange_value').addClass('focused').focus();
                ensureDatePickerLegend();
                syncCalendarLegendLayout();
                hideNativeDateFallback();
                applyCalendarVisualStyles();
                startCalendarEnhancer();
                startCalendarMutationObserver();
                openTouchCalendarShell();
                if (!shouldUseTouchCalendarShell()) {
                    forceDatepickerDown();
                    setTimeout(function () {
                        var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
                        if (picker.length) {
                            clampDatepickerWithinViewport(picker, $('#daterange_value'));
                        }
                    }, 0);
                }
            }).on('datepicker-close', function() {
                $('#daterange_value').removeClass('focused').blur();
                calendarFirstDateSelected = false;
                stopCalendarEnhancer();
                stopCalendarMutationObserver();
                closeTouchCalendarShell();
            }).on('datepicker-closed', function() {
                stopCalendarEnhancer();
                stopCalendarMutationObserver();
                closeTouchCalendarShell();
                if (search_auto_focus_next_field && focusNextOnCalendarClose) {
                    if (is_occupancy_wise_search) {
                        if ($('#check_in_time').val() != '' && $('#check_out_time').val() != '') {
                            BookingSearchManager.activateStep('occupancy');
                        }
                    } else {
                        if (BookingSearchManager.allFieldsFilled()) {
                            BookingSearchManager.activateStep('submit');
                        }
                    }

                    focusNextOnCalendarClose = false;
                }
            });
        }

        if (dateFrom && dateTo) {
            $('#daterange_value').data('dateRangePicker').setDateRange(
                $.datepicker.formatDate('dd-mm-yy', $.datepicker.parseDate('yy-mm-dd', dateFrom)),
                $.datepicker.formatDate('dd-mm-yy', $.datepicker.parseDate('yy-mm-dd', dateTo))
            );
        }
    }

    abortRunningAjax = function () {
        if (ajax_check_var) {
            ajax_check_var.abort();
        }
    }

    // If only one hotel then set max order date on date pickers
    var max_order_date = $('#max_order_date').val();
    var min_booking_offset = $('#min_booking_offset').val();
    updateTouchModeClasses();
    createDateRangePicker(max_order_date, min_booking_offset, $('#check_in_time').val(), $('#check_out_time').val());
    calendarLayoutKey = getCalendarLayoutKey();

    $(window).on('resize orientationchange', function () {
        if (touchCalendarResizeTimer) {
            clearTimeout(touchCalendarResizeTimer);
        }

        touchCalendarResizeTimer = setTimeout(function () {
            updateTouchModeClasses();
            tuneHomepageSearchButtonWidth();
            var newKey = getCalendarLayoutKey();
            if (newKey !== calendarLayoutKey) {
                calendarLayoutKey = newKey;
                createDateRangePicker(
                    $('#max_order_date').val(),
                    $('#min_booking_offset').val(),
                    $('#check_in_time').val(),
                    $('#check_out_time').val()
                );
            } else {
                var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
                if (picker.length) {
                    clampDatepickerWithinViewport(picker, $('#daterange_value'));
                }
            }
        }, 120);
    });

    $(document).on('click touchstart', '#daterange_value, #daterange_value_from, #daterange_value_to', function(e) {
        var pickerObj = $('#daterange_value').data('dateRangePicker');
        if (pickerObj && typeof pickerObj.open == 'function') {
            hideNativeDateFallback();
            pickerObj.open();
        } else {
            e.preventDefault();
            showNativeDateFallback();
        }
    });

    setTimeout(function() {
        var pickerObj = $('#daterange_value').data('dateRangePicker');
        if ((!pickerObj || typeof pickerObj.open != 'function') && !nativeDateFallbackInitialized) {
            showNativeDateFallback();
        }
    }, 1200);

    tuneHomepageSearchButtonWidth = function () {
        if (!$('body#index').length) {
            return;
        }

        var isDesktop = !(window.matchMedia && window.matchMedia('(max-width: 767px)').matches);
        var submitBlock = $('#search_hotel_block_form .search_room_submit_block');
        var visibleGridItems = $('#search_hotel_block_form .grid > .grid-item:visible');
        if (!submitBlock.length || visibleGridItems.length !== 2) {
            return;
        }

        // Two-field layout only (calendar + submit): make submit button wider horizontally.
        if (isDesktop) {
            submitBlock.css('grid-column', 'span 4');
            visibleGridItems.first().css('grid-column', 'span 5');
        } else {
            submitBlock.css('grid-column', '');
            visibleGridItems.first().css('grid-column', '');
        }
    }

    // Re-apply calendar styling after month navigation arrows are used.
    $(document).on('click', '.date-picker-wrapper .next, .date-picker-wrapper .prev', function() {
        setTimeout(function () {
            ensureDatePickerLegend();
            syncCalendarLegendLayout();
            applyCalendarVisualStyles();
            forceDatepickerDown();
            var picker = $('#daterange_value').siblings('.date-picker-wrapper:visible');
            if (picker.length) {
                clampDatepickerWithinViewport(picker, $('#daterange_value'));
            }
        }, 24);
    });

    tuneHomepageSearchButtonWidth();

    // validations on the submit of the search fields
    $(document).on('click', '#search_room_submit', function() {
        var check_in_time = $("#check_in_time").val();
        var check_out_time = $("#check_out_time").val();
        var max_order_date = $("#max_order_date").val();
        var error = false;

        var location_category_id = $('#location_category_id').val();
        var hotelCatId = $('#hotel_cat_id').val();
        $('.header-rmsearch-input').removeClass("error_border");

        if (hotelCatId == '') {
            if (typeof(location_category_id) == 'undefined' || location_category_id == '') {
                $("#hotel_location").addClass("error_border");
                error = true;
            }
            $("#id_hotel_button_chosen").addClass("error_border");
            $('#select_htl_error_p').text(hotel_name_cond);
            error = true;
        }
        var date_selector
        if (typeof(multiple_dates_input) != 'undefined' && multiple_dates_input) {
            date_selector =  '#daterange_value_from, #daterange_value_to';
        } else {
            date_selector =  '#daterange_value';
        }
        if (check_in_time == '') {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(check_in_time_cond);
            error = true;
        } else if (check_in_time < $.datepicker.formatDate('yy-mm-dd', new Date())) {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(less_checkin_date);
            error = true;
        }
        if (check_out_time == '') {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(check_out_time_cond);
            error = true;
        } else if (check_out_time < check_in_time) {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(more_checkout_date);
            error = true;
        } else if (max_order_date < check_in_time) {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(max_order_date_err + ' ' + max_order_date);
            error = true;
        } else if (max_order_date < check_out_time) {
            $(date_selector).addClass("error_border");
            $('#daterange_value_error_p').text(max_order_date_err + ' ' + max_order_date);
            error = true;
        }

        if (error) {
            return false;
        }

        // Homepage search should route directly to the room detail page with selected dates.
        // This avoids posting `search_room_submit` to index, which can fail depending on runtime state.
        var bodyId = $('body').attr('id') || '';

        if (isHomePage() || bodyId === 'product') {
            var defaultProductLink = baseUri + (lang_iso || 'en') + '/the-hotel-prime/1-fewo-ebermannsmuehle-lauscha.html';
            var productLink = $('.htlRoomTypeBookNow:first').attr('href')
                || $('.navigation-link[href*="/the-hotel-prime/"]:first').attr('href')
                || defaultProductLink;

            if (typeof productLink !== 'string') {
                productLink = defaultProductLink;
            } else {
                productLink = productLink.split('#')[0];
                if (/^https?:\/\//i.test(productLink)) {
                    try {
                        var parsed = new URL(productLink, window.location.origin);
                        if (parsed.origin !== window.location.origin) {
                            productLink = defaultProductLink;
                        } else {
                            productLink = parsed.pathname;
                        }
                    } catch (e) {
                        productLink = defaultProductLink;
                    }
                }
            }

            if (productLink.charAt(0) !== '/' || productLink.indexOf('/the-hotel-prime/') === -1) {
                productLink = defaultProductLink;
            }

            var searchParams = {
                date_from: check_in_time,
                date_to: check_out_time
            };

            var selectedRate = $('input[name="fewo_rate_option"]:checked').val();
            if (!selectedRate && typeof fewoPricingDefault !== 'undefined' && fewoPricingDefault) {
                selectedRate = fewoPricingDefault;
            }
            if (selectedRate) {
                searchParams.fewo_rate_option = selectedRate;
            }

            var chargeableGuests = $('#fewo_chargeable_guests').val();
            if (!chargeableGuests && typeof fewoGuestChargeableDefault !== 'undefined') {
                chargeableGuests = fewoGuestChargeableDefault;
            }
            if (chargeableGuests) {
                searchParams.fewo_chargeable_guests = chargeableGuests;
            }

            var under3Guests = $('#fewo_under3_guests').val();
            if (!under3Guests && typeof fewoGuestUnder3Default !== 'undefined') {
                under3Guests = fewoGuestUnder3Default;
            }
            if (typeof under3Guests !== 'undefined' && under3Guests !== null && under3Guests !== '') {
                searchParams.fewo_under3_guests = under3Guests;
            }

            var query = $.param(searchParams);
            if (query) {
                productLink += (productLink.indexOf('?') === -1 ? '?' : '&') + query;
            }

            window.location.href = productLink;
            return false;
        }

        return true;
    });

    // Occupancy field dropdown
    // add occupancy info block
    $(document).on('click', '#search_occupancy_wrapper .add_new_occupancy_btn', function(e) {
        e.preventDefault();

        var occupancy_block = '';

        var roomBlockIndex = parseInt($("#search_occupancy_wrapper .occupancy_info_block").last().attr('occ_block_index'));
        roomBlockIndex += 1;

        var countRooms = parseInt($('#search_occupancy_wrapper .occupancy_info_block').length);
        countRooms += 1

        occupancy_block += '<div class="occupancy-room-block">';
            occupancy_block += '<div class="occupancy_info_head"><span class="room_num_wrapper">'+ room_txt + ' - ' + countRooms + '</span><a class="remove-room-link pull-right" href="#">' + remove_txt + '</a></div>';
            occupancy_block += '<div class="occupancy_info_block" occ_block_index="'+roomBlockIndex+'">';
                occupancy_block += '<div class="row">';
                    occupancy_block += '<div class="form-group occupancy_count_block col-sm-5 col-xs-6">';
                        occupancy_block += '<label>' + adults_txt + '</label>';
                        occupancy_block += '<div>';
                            occupancy_block += '<input type="hidden" class="num_occupancy num_adults room_occupancies" name="occupancy['+roomBlockIndex+'][adults]" value="1">';
                            occupancy_block += '<div class="occupancy_count pull-left">';
                                occupancy_block += '<span>1</span>';
                            occupancy_block += '</div>';
                            occupancy_block += '<div class="qty_direction pull-left">';
                                occupancy_block += '<a href="#" data-field-qty="qty" class="btn btn-default occupancy_quantity_up">';
                                    occupancy_block += '<span><i class="icon-plus"></i></span>';
                                occupancy_block += '</a>';
                                occupancy_block += '<a href="#" data-field-qty="qty" class="btn btn-default occupancy_quantity_down">';
                                    occupancy_block += '<span><i class="icon-minus"></i></span>';
                                occupancy_block += '</a>';
                            occupancy_block += '</div>';
                        occupancy_block += '</div>';
                    occupancy_block += '</div>';
                    occupancy_block += '<div class="form-group occupancy_count_block col-sm-7 col-xs-6">';
                        occupancy_block += '<label>' + children_txt + '</label>';
                        occupancy_block += '<div class="clearfix">';
                            occupancy_block += '<input type="hidden" class="num_occupancy num_children room_occupancies" name="occupancy['+roomBlockIndex+'][children]" value="0">';
                            occupancy_block += '<div class="occupancy_count pull-left">';
                                occupancy_block += '<span>0</span>';
                            occupancy_block += '</div>';
                            occupancy_block += '<div class="qty_direction pull-left">';
                                occupancy_block += '<a href="#" data-field-qty="qty" class="btn btn-default occupancy_quantity_up">';
                                    occupancy_block += '<span><i class="icon-plus"></i></span>';
                                occupancy_block += '</a>';
                                occupancy_block += '<a href="#" data-field-qty="qty" class="btn btn-default occupancy_quantity_down">';
                                    occupancy_block += '<span><i class="icon-minus"></i></span>';
                                occupancy_block += '</a>';
                            occupancy_block += '</div>';
                        occupancy_block += '</div>';
                        occupancy_block += '<p class="label-desc-txt"> (' + below_txt + ' ' + max_child_age + ' ' + years_txt + ')</p>';
                    occupancy_block += '</div>';
                occupancy_block += '</div>';
                occupancy_block += '<div class="row">';
                    occupancy_block += '<div class="form-group children_age_info_block col-sm-12">';
                        occupancy_block += '<label>' + all_children_txt + '</label>';
                        occupancy_block += '<div class="children_ages">';
                        occupancy_block += '</div>';
                    occupancy_block += '</div>';
                occupancy_block += '</div>';
            occupancy_block += '</div>';
            occupancy_block += '<hr class="occupancy-info-separator">';
        occupancy_block += '</div>';
        $('#occupancy_inner_wrapper').append(occupancy_block);

        // scroll to the latest added room
        $("#search_occupancy_wrapper").animate({ scrollTop: $("#search_occupancy_wrapper").prop('scrollHeight') }, "slow");

        setGuestOccupancy();
    });

    // remove occupancy info block
    $(document).on('click', '#search_occupancy_wrapper .remove-room-link', function(e) {
        e.preventDefault();
        $(this).closest('#search_occupancy_wrapper .occupancy-room-block').remove();

        $( "#search_occupancy_wrapper .room_num_wrapper" ).each(function(key, val) {
            $(this).text(room_txt + ' - '+ (key+1) );
        });

        setGuestOccupancy();
    });

    // increase the quantity of adults and child
    $(document).on('click', '#search_occupancy_wrapper .occupancy_quantity_up', function(e) {
        e.preventDefault();
        // set input field value
        var element = $(this).closest('.occupancy_count_block').find('.num_occupancy');
        var elementVal = parseInt(element.val()) + 1;

        var childElement = $(this).closest('.occupancy_count_block').find('.num_children').length;
        if (childElement) {
            var totalChilds = $(this).closest('.occupancy_info_block').find('.guest_child_age').length;

            if (max_child_in_room == 0 || totalChilds < max_child_in_room) {
                element.val(elementVal);
                $(this).closest('.occupancy_info_block').find('.children_age_info_block').show();

                var roomBlockIndex = parseInt($(this).closest('.occupancy_info_block').attr('occ_block_index'));

                var childAgeSelect = '<div>';
                    childAgeSelect += '<select class="guest_child_age room_occupancies" name="occupancy[' +roomBlockIndex+ '][child_ages][]">';
                        childAgeSelect += '<option value="-1">' + select_age_txt + '</option>';
                        childAgeSelect += '<option value="0">' + under_1_age + '</option>';
                        for (let age = 1; age < max_child_age; age++) {
                            childAgeSelect += '<option value="'+age+'">'+age+'</option>';
                        }
                    childAgeSelect += '</select>';
                childAgeSelect += '</div>';

                $(this).closest('.occupancy_info_block').find('.children_ages').append(childAgeSelect);

                // set input field value
                $(this).closest('.occupancy_count_block').find('.occupancy_count > span').text(elementVal);
            } else {
                if (elementVal >= max_child_in_room) {
                    if (elementVal == 0) {
                        showOccupancyError(no_children_allowed_txt, $(this).closest(".occupancy_info_block"));
                    } else {
                        showOccupancyError(max_children_txt, $(this).closest(".occupancy_info_block"));
                    }
                } else {
                    showOccupancyError(max_occupancy_reached_txt, $(this).closest(".occupancy_info_block"));
                }
            }
        } else {
            element.val(elementVal);

            // set input field value
            $(this).closest('.occupancy_count_block').find('.occupancy_count > span').text(elementVal);
        }

        setGuestOccupancy();
    });

    var errorMsgTime;
    function showOccupancyError(msg, occupancy_info_block)
    {
        var errorMsgBlock = $(occupancy_info_block).find('.occupancy-input-errors')
        $(errorMsgBlock).html(msg).parent().show('fast');
        clearTimeout(errorMsgTime);
        errorMsgTime = setTimeout(function() {
            $(errorMsgBlock).parent().hide('fast');
        }, 1000);

    }

    $(document).on('click', '#search_occupancy_wrapper .occupancy_quantity_down', function(e) {
        e.preventDefault();
        // set input field value
        var element = $(this).closest('.occupancy_count_block').find('.num_occupancy');
        var elementVal = parseInt(element.val()) - 1;
        var childElement = $(this).closest('.occupancy_count_block').find('.num_children').length;

        if (childElement) {
            if (elementVal < 0) {
                elementVal = 0;
            } else {
                $(this).closest('.occupancy_info_block').find('.children_ages select').last().closest('div').remove();
                if (elementVal <= 0) {
                    $(this).closest('.occupancy_info_block').find('.children_age_info_block').hide();
                }
            }
        } else {
            if (elementVal == 0) {
                elementVal = 1;
            }
        }

        element.val(elementVal);
        // set input field value
        $(this).closest('.occupancy_count_block').find('.occupancy_count > span').text(elementVal);

        setGuestOccupancy();
    });

    // toggle occupancy block
    $('#guest_occupancy').on('click', function(e) {
        e.stopPropagation();
        if ($('#daterange_value').siblings('.date-picker-wrapper').is(':visible')) {
            $('#daterange_value').data('dateRangePicker').close();
        }
        if (typeof setBookingSearchPositions === 'function') {
            setBookingSearchPositions();
        }
        if (isHomePage()) {
            $("#search_occupancy_wrapper").removeClass('bottom').addClass('top');
        }
        $("#search_occupancy_wrapper").toggle();
    });

    function validateOccupancies() {
        let hasErrors = 0;

        let adults = $("#search_occupancy_wrapper").find(".num_adults").map(function(){return $(this).val();}).get();
        let children = $("#search_occupancy_wrapper").find(".num_children").map(function(){return $(this).val();}).get();
        let child_ages = $("#search_occupancy_wrapper").find(".guest_child_age").map(function(){return $(this).val();}).get();

        // start validating above values
        if (!adults.length || (adults.length != children.length)) {
            hasErrors = 1;
            showErrorMessage(invalid_occupancy_txt);
        } else {
            $("#search_occupancy_wrapper").find('.occupancy_count').removeClass('error_border');

            // validate values of adults and children
            adults.forEach(function (item, index) {
                if (isNaN(item) || parseInt(item) < 1) {
                    hasErrors = 1;
                    $("#search_occupancy_wrapper .num_adults").eq(index).closest('.occupancy_count_block').find('.occupancy_count').addClass('error_border');
                }
                if (isNaN(children[index])) {
                    hasErrors = 1;
                    $("#search_occupancy_wrapper .num_children").eq(index).closest('.occupancy_count_block').find('.occupancy_count').addClass('error_border');
                }
            });

            // validate values of selected child ages
            $("#search_occupancy_wrapper").find('.guest_child_age').removeClass('error_border');
            child_ages.forEach(function (age, index) {
                age = parseInt(age);
                if (isNaN(age) || (age < 0) || (age >= parseInt(max_child_age))) {
                    hasErrors = 1;
                    $("#search_occupancy_wrapper .guest_child_age").eq(index).addClass('error_border');
                }
            });
        }

        if (hasErrors == 0) {
            $("#search_occupancy_wrapper").hide();
            $("#search_hotel_block_form #guest_occupancy").removeClass('error_border');
        } else {
            $("#search_hotel_block_form #guest_occupancy").addClass('error_border');
            return false;
        }

        return true;
    }

    // Body Events - start
    var focusNextOnCalendarClose = true;
    var calendarFirstDateSelected = false;
    $('body').on('click', function(e) {
        // if user clicks anywhere and location li is visible then close it
        if ($('.location_search_results_ul').is(':visible')
            && e.target.className != 'search_result_li'
            && e.target.id != 'hotel_location'
        ) {
            $('.location_search_results_ul').hide();
            $('#hotel_location').attr('placeholder', hotel_location_txt);
        }

        // check if user clicked outside calendar
        if ($('#daterange_value').siblings('.date-picker-wrapper').is(':visible')) {
            if (!$(e.target).closest('.form-group').find('.date-picker-wrapper').length) {
                focusNextOnCalendarClose = false;
            }
        }

        // close the occupancy block when clink anywhere in the body outside occupancy block
        if ($('#search_occupancy_wrapper').length) {
            if ($('#search_occupancy_wrapper').css('display') !== 'none') {
                if (!($(e.target).closest("#search_occupancy_wrapper").length)) {
                    // Before closing the occupancy block validate the values inside
                    return validateOccupancies();
                }
            }
        }
    });

    $(document).on('click', '#search_occupancy_wrapper .submit_occupancy_btn', function(e) {
        e.preventDefault();
        if ($('#search_occupancy_wrapper').length) {
            if ($('#search_occupancy_wrapper').css('display') !== 'none') {
                return validateOccupancies();
            }
        }
    });

    var isEnterKeyHeldOnLocation = false;
    $('body').on('keydown', function(e) {
        let preventDefault = false;

        // fix for: if user pressed Tab after selecting only first date
        if (e.which == 9
            && $('#daterange_value').siblings('.date-picker-wrapper').is(':visible')
            && calendarFirstDateSelected
        ) {
            preventDefault = true;
            $('#daterange_value').data('dateRangePicker').close();

            setTimeout(function () {
                if (is_occupancy_wise_search) {
                    BookingSearchManager.activateStep('occupancy');
                } else {
                    BookingSearchManager.activateStep('submit');
                }
            }, 10);
        }

        // if user is selecting the location by Up, Down, Enter or Tab keys
        if ((e.which == 40 || e.which == 38) && $('.location_search_results_ul li.search_result_li').is(':visible')) {
            return false;
        } else if (e.which == 13 && e.target.className == 'search_result_li') {
            // select location only after held Enter key is unheld
            preventDefault = true;
            isEnterKeyHeldOnLocation = true;
        } else if (e.which == 9 && $('.location_search_results_ul').is(':visible')) {
            preventDefault = true;
            $(e.target).click();
        }

        // check if submit button must be focused
        if (e.which == 9 && $('#search_occupancy_wrapper:visible').length) {
            preventDefault = true;
            if (validateOccupancies()) {
                BookingSearchManager.activateStep('submit');
            }
        }

        if (preventDefault) {
            e.preventDefault();
        }
    });

    // select location only after held Enter key is unheld
    $('body').on('keyup', function(e) {
        if ($(e.target).is('.location_search_results_ul li')
            && isEnterKeyHeldOnLocation
            && e.which == 13
        ) {
            $(e.target).click();
        }
    });
    // Body Events - end

    // set positions of popups when required
    if (page_name == 'index') {
        $('#hotel_location, #id_hotel_button, #guest_occupancy').focus(function () {
            setBookingSearchPositions();
        });

        // after chosen has been initialized
        $('select#id_hotel_button').on('chosen:ready', function() {
            $('#id_hotel_button_chosen .chosen-search input').focus(function () {
                setBookingSearchPositions();
            });
        });

        $('#daterange_value').click(function () {
            setBookingSearchPositions();
        });
    }
});

// function to set occupancy infor in guest occupancy field(search form)
function setGuestOccupancy()
{
    var adults = 0;
    var children = 0;
    var rooms = $('#search_occupancy_wrapper .occupancy_info_block').length;
    $( "#search_occupancy_wrapper .num_adults" ).each(function(key, val) {
        adults += parseInt($(this).val());
    });
    $( "#search_occupancy_wrapper .num_children" ).each(function(key, val) {
        children += parseInt($(this).val());
    });
    var guestButtonVal = parseInt(adults) + ' ';
    if (parseInt(adults) > 1) {
        guestButtonVal += adults_txt;
    } else {
        guestButtonVal += adult_txt;
    }
    if (parseInt(children) > 0) {
        if (parseInt(children) > 1) {
            guestButtonVal += ', ' + parseInt(children) + ' ' + children_txt;
        } else {
            guestButtonVal += ', ' + parseInt(children) + ' ' + child_txt;
        }
    }
    if (parseInt(rooms) > 1) {
        guestButtonVal += ', ' + parseInt(rooms) + ' ' + rooms_txt;
    } else {
        guestButtonVal += ', ' + parseInt(rooms) + ' ' + room_txt;
    }
    $('#guest_occupancy > span').text(guestButtonVal);
}

// position dropdowns
function setBookingSearchPositions() {
    // calculate available spaces
    let searchForm = $('#search_hotel_block_form');
    const forceTop = isHomePage();

    let inputFieldsAndDropdowns = [
        { input: $('#hotel_location'), dropdown: $('.location_search_results_ul')},
        { input: $('.hotel-selector-wrap'), dropdown: $('#id_hotel_button_chosen .chosen-drop')},
        { input: $('#guest_occupancy'), dropdown: $('#search_occupancy_wrapper')},
    ];

    let positionClass = 'bottom';
    if (!searchForm.closest('.fancybox-wrap').length) {
        let searchFormHeight = searchForm.outerHeight();
        let spaceTop = searchForm.offset().top - $(window).scrollTop();
        let spaceBottom = $(window).height() - searchFormHeight - spaceTop;

        // calculate max height for dropdowns
        let maxHeightNeeded = 0;
        $(inputFieldsAndDropdowns).each(function (i, inputFieldAndDropdown) {
            if (!inputFieldAndDropdown.input.length) return false;

            // find needed space height
            let cssMaxHeight = parseInt(inputFieldAndDropdown.dropdown.css('max-height'));
            if (Number.isInteger(cssMaxHeight)) {
                maxHeightNeeded = Math.max(maxHeightNeeded, cssMaxHeight);
            }
        });

        // determine position class
        if (spaceBottom < maxHeightNeeded && spaceTop > spaceBottom) {
            positionClass = 'top';
        }
    }

    // position dropdowns
    $(inputFieldsAndDropdowns).each(function (i, inputFieldAndDropdown) {
        const dropdown = inputFieldAndDropdown.dropdown;
        dropdown.removeClass('top bottom');
        if (forceTop && dropdown.is('#search_occupancy_wrapper')) {
            dropdown.addClass('top');
            return;
        }
        dropdown.addClass(positionClass);
    });

    forceDatepickerDown();
}

function isHomePage() {
    if (typeof page_name !== 'undefined' && page_name === 'index') {
        return true;
    }
    return $('body').attr('id') === 'index';
}

function forceDatepickerDown() {
    if (!isHomePage()) {
        return;
    }

    if ($('body').hasClass('wk-touch-calendar-active')) {
        return;
    }

    var input = $('#daterange_value');
    if (!input.length) {
        return;
    }

    var picker = input.siblings('.date-picker-wrapper');
    if (!picker.length) {
        picker = $('.date-picker-wrapper');
    }
    if (!picker.length) {
        return;
    }

    var inputHeight = input.outerHeight() || 0;
    var offset = 8;

    picker
        .removeClass('bottom')
        .addClass('top')
        .css({
            top: 'unset',
            bottom: inputHeight + offset,
            left: 0,
            right: 'auto'
        });

    clampDatepickerWithinViewport(picker, input);
}

function clampDatepickerWithinViewport(picker, input) {
    if (!picker || !picker.length) {
        return;
    }

    if ($('body').hasClass('wk-touch-calendar-active')) {
        return;
    }

    var anchor = (input && input.length) ? input : $('#daterange_value');
    var margin = 8;
    var scrollLeft = $(window).scrollLeft();
    var viewportWidth = $(window).width();
    var viewportLeft = scrollLeft + margin;
    var viewportRight = scrollLeft + viewportWidth - margin;

    picker.css({
        right: 'auto',
        'max-width': '',
    });

    var pickerOffset = picker.offset();
    if (!pickerOffset) {
        return;
    }

    var offsetParent = picker.offsetParent();
    var parentOffset = (offsetParent && offsetParent.length) ? (offsetParent.offset() || { left: 0 }) : { left: 0 };

    var pickerWidth = picker.outerWidth() || 0;
    var maxPickerWidth = Math.max(280, viewportWidth - (margin * 2));
    if (pickerWidth > maxPickerWidth) {
        picker.css('max-width', maxPickerWidth + 'px');
        pickerWidth = picker.outerWidth() || pickerWidth;
    }

    var nextLeft = pickerOffset.left;
    var maxLeft = viewportRight - pickerWidth;
    if (nextLeft > maxLeft) {
        nextLeft = maxLeft;
    }
    if (nextLeft < viewportLeft) {
        nextLeft = viewportLeft;
    }

    var nextLeftCss = nextLeft - parentOffset.left;
    var currentLeftCss = parseFloat(picker.css('left'));
    if (isNaN(currentLeftCss)) {
        currentLeftCss = pickerOffset.left - parentOffset.left;
    }

    if (Math.abs(nextLeftCss - currentLeftCss) > 1) {
        picker.css('left', nextLeftCss + 'px');
    }
}

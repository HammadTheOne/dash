import React, { Component, PropTypes } from 'react';
import { DateRangePicker } from 'react-dates';
import moment from 'moment';

/**
 * DatePickerRange is a tailor made component designed for selecting
 * timespan across multiple days off of a calendar.
 *
 * The DatePicker integrates well with the Python datetime module with the
 * startDate and endDate being returned in a string format suitable for
 * creating datetime objects.
 *
 * This component is based off of Airbnb's react-dates react component
 * which can be found here: https://github.com/airbnb/react-dates
 */
export default class DatePickerRange extends Component {
    constructor(props) {
        super(props);
        const propObj = {
            startDate: this.props.start_date,
            endDate: this.props.end_date,
            initialVisibleMonth: this.props.initial_visible_month,
            minDateAllowed: this.props.min_date_allowed,
            maxDateAllowed: this.props.max_date_allowed
        };
        const momentProps = this.convertPropsToMoment(propObj);
        this.state = {
            focusedInput: props.autoFocusEndDate ? momentProps.startDate : momentProps.endDate,
            startDate: momentProps.startDate,
            endDate: momentProps.endDate,
            initialVisibleMonth: momentProps.initialVisibleMonth,
            minDateAllowed: momentProps.min,
            maxDateAllowed: momentProps.max,
            prevStartDate: this.props.start_date,
            prevEndDate: this.props.end_date,
            prevInitialVisibleMonth: this.props.initial_visible_month,
            prevMinDateAllowed: this.props.min_date_allowed,
            prevMaxDateAllowed: this.props.max_date_allowed
        };

        this.isOutsideRange = this.isOutsideRange.bind(this);
        this.onDatesChange = this.onDatesChange.bind(this);
    }

    convertPropsToMoment(props) {
        let startDate = null; let endDate = null;
        let initialVisibleMonth = moment(props.startDate);
        if (typeof props.startDate !== 'undefined') {
            startDate = moment(props.startDate);
        }

        if (typeof props.endDate !== 'undefined') {
            endDate = moment(props.endDate);
        }

        if (typeof props.initialVisibleMonth !== 'undefined') {
            initialVisibleMonth = moment(props.initialVisibleMonth);
        }

        let min; let max;
        if (typeof props.minDateAllowed !== 'undefined') {
            min = moment(props.minDateAllowed);
        }

        if (typeof props.maxDateAllowed !== 'undefined') {
            max = moment(props.maxDateAllowed);
            max.add(1, 'days');
        }

        try {
            if (startDate.isAfter(endDate)) {
                endDate = null;
            }
        } catch (TypeError) {
            // Continue regardless of error
        }

        return { startDate, endDate, initialVisibleMonth, min, max };
    }

    componentWillReceiveProps(newProps) {
        const propObj = {
                startDate: newProps.start_date,
                endDate: newProps.end_date,
                initialVisibleMonth: newProps.initial_visible_month,
                minDateAllowed: newProps.min_date_allowed,
                maxDateAllowed: newProps.max_date_allowed
            };

        const momentProps = this.(propObj);
        if (this.state.prevStartDate !== newProps.start_date) {
            this.setState({
                prevStartDate: newProps.start_date,
                startDate: momentProps.startDate
            });
        }

        if (this.state.prevEndDate !== newProps.end_date) {
            this.setState({
                prevEndDate: newProps.end_date,
                endDate: momentProps.endDate
            });
        }

        if (this.state.prevInitialVisibleMonth !== newProps.initial_visible_month) {
            this.setState({
                prevInitialVisibleMonth: newProps.initial_visible_month,
                initialVisibleMonth: momentProps.initialVisibleMonth
            });
        }

        if (this.state.prevMinDateAllowed !== newProps.min_date_allowed) {
            this.setState({
                prevMinDateAllowed: newProps.min_date_allowed,
                minDateRange: momentProps.minDateAllowed
            });
        }

        if (this.state.prevMaxDateAllowed !== newProps.max_date_range) {
            this.setState({
                prevMaxDateAllowed: newProps.max_date_allowed,
                maxDateRange: momentProps.maxDateRange
            });
        }

        try {
            if (this.state.startDate.isAfter(this.state.endDate)) {
                this.setState({
                    endDate: null
                });
            }
        } catch (TypeError) {
            // Continue regardless of error
        }
    }

    onDatesChange({startDate, endDate}) {
        this.setState({ startDate, endDate });
        if (startDate !== null) {
            const startDateStr = startDate.format('YYYY-MM-DD');
            if (setProps) {
                setProps({
                    start_date: startDateStr
                });
            }

            if (fireEvent) {
                fireEvent('change');
            }
        }

        if (endDate !== null) {
            const endDateStr = endDate.format('YYYY-MM-DD');
            if (setProps) {
                setProps({
                    end_date: endDateStr
                });
            }

            if (fireEvent) {
                fireEvent('change');
            }
        }
    }

    isOutsideRange(date) {
        if (typeof this.state.minDateAllowed !== 'undefined' &&
                typeof this.state.maxDateAllowed !== 'undefined') {
            return date < this.state.minDateAllowed ||
                         date >= this.state.maxDateAllowed;
        } else if (typeof this.state.minDateAllowed === 'undefined' &&
                             typeof this.state.maxDateAllowed !== 'undefined') {
            return date >= this.state.maxDateAllowed;
        } else if (typeof this.state.minDateAllowed !== 'undefined' &&
                             typeof this.state.maxDateAllowed === 'undefined') {
            return date < this.state.minDateAllowed;
        } else {
            return false;
        }
    }

    render() {
        const {
            startDate,
            endDate,
            focusedInput,
            initialVisibleMonth
        } = this.state;

        const {
            calendar_orientation,
            clearable,
            day_size,
            disabled,
            display_format,
            end_date_placeholder_text,
            fireEvent,
            first_day_of_week,
            is_RTL,
            minimum_nights,
            month_format,
            number_of_months_shown,
            reopen_calendar_on_clear,
            setProps,
            show_outside_days,
            start_date_placeholder_text,
            stay_open_on_select,
            with_full_screen_portal,
            with_portal,
        } = this.props;


        const verticalFlag = (calendar_orientation !== 'vertical');

        return (
            <DateRangePicker
                daySize={day_size}
                disabled={disabled}
                displayFormat={display_format}
                enableOutsideDays={show_outside_days}
                endDate={end_date}
                endDatePlaceholderText={end_date_placeholder_text}
                firstDayOfWeek={first_day_of_week}
                focusedInput={focusedInput}
                initialVisibleMonth={startDate || initialVisibleMonth}
                isOutsideRange={this.isOutsideRange}
                isRTL={is_RTL}
                keepOpenOnDateSelect={stay_open_on_select}
                minimumNights={minimum_nights}
                monthFormat={month_format}
                numberOfMonths={number_of_months_shown}
                onDatesChange={this.onDatesChange}
                onFocusChange={focusedInput => this.setState({ focusedInput })}
                orientation={calendar_orientation}
                reopenPickerOnClearDates={reopen_calendar_on_clear}
                showClearDates={clearable}
                startDate={startDate}
                startDatePlaceholderText={start_date_placeholder_text}
                withFullScreenPortal={with_full_screen_portal && verticalFlag}
                withPortal={with_portal && verticalFlag}
            />
        );
    }
}

DatePickerRange.propTypes = {
    id: PropTypes.string,

    /**
     * Specifies the starting date for the component.
     * Accepts datetime.datetime objects or strings
     * in the format 'YYYY-MM-DD'
     */
    start_date: PropTypes.string,

    /**
     * Specifies the ending date for the component.
     * Accepts datetime.datetime objects or strings
     * in the format 'YYYY-MM-DD'
     */
    end_date: PropTypes.string,

    /**
     * Specifies the lowest selectable date for the component.
     * Accepts datetime.datetime objects or strings
     * in the format 'YYYY-MM-DD'
     */
    min_date_allowed: PropTypes.string,

    /**
     * Specifies the highest selectable date for the component.
     * Accepts datetime.datetime objects or strings
     * in the format 'YYYY-MM-DD'
     */
    max_date_allowed: PropTypes.string,

    /**
     * Specifies the month that is initially presented when the user
     * opens the calendar. Accepts datetime.datetime objects or strings
     * in the format 'YYYY-MM-DD'
     *
     */
    initial_visible_month: PropTypes.string,

    /**
     * Text that will be displayed in the first input
     * box of the date picker when no date is selected. Default value is 'Start Date'
     */
    start_date_placeholder_text: PropTypes.string,

    /**
     * Text that will be displayed in the second input
     * box of the date picker when no date is selected. Default value is 'End Date'
     */
    end_date_placeholder_text: PropTypes.string,

    /**
     * Size of rendered calendar days, higher number
     * means bigger day size and larger calendar overall
     */
    day_size: PropTypes.number,

    /**
     * Orientation of calendar, either vertical or horizontal.
     * Valid options are 'vertical' or 'horizontal'.
     */
    calendar_orientation: PropTypes.oneOf(['vertical', 'horizontal']),

    /**
     * Determines whether the calendar and days operate
     * from left to right or from right to left
     */
    is_RTL: PropTypes.bool,

    /**
     * If True, the calendar will automatically open when cleared
     */
    reopen_calendar_on_clear: PropTypes.bool,

    /**
     * Number of calendar months that are shown when calendar is opened
     */
    number_of_months_shown: PropTypes.number,

    /**
     * If True, calendar will open in a screen overlay portal,
     * not supported on vertical calendar
     */
    with_portal: PropTypes.bool,

    /**
     * If True, calendar will open in a full screen overlay portal, will
     * take precedent over 'withPortal' if both are set to true,
     * not supported on vertical calendar
     */
    with_full_screen_portal: PropTypes.bool,

    /**
     * Specifies what day is the first day of the week, values must be
     * from [0, ..., 6] with 0 denoting Sunday and 6 denoting Saturday
     */
    first_day_of_week: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),

    /**
     * Specifies a minimum number of nights that must be selected between
     * the startDate and the endDate
     */
    minimum_nights: PropTypes.number,

    /**
     * If True the calendar will not close when the user has selected a value
     * and will wait until the user clicks off the calendar
     */
    stay_open_on_select: PropTypes.bool,

    /**
     * If True the calendar will display days that rollover into
     * the next month
     */
    show_outside_days: PropTypes.bool,

    /**
     * Specifies the format that the month will be displayed in the calendar,
     * valid formats are variations of "MM YY". For example:
     * "MM YY" renders as '05 97' for May 1997
     * "MMMM, YYYY" renders as 'May, 1997' for May 1997
     * "MMM, YY" renders as 'Sep, 97' for September 1997
     */
    month_format: PropTypes.string,

    /**
     * Specifies the format that the selected dates will be displayed
     * valid formats are variations of "MM YY DD". For example:
     * "MM YY DD" renders as '05 10 97' for May 10th 1997
     * "MMMM, YY" renders as 'May, 1997' for May 10th 1997
     * "M, D, YYYY" renders as '07, 10, 1997' for September 10th 1997
     * "MMMM" renders as 'May' for May 10 1997
     */
    display_format: PropTypes.string,

    /**
     * If True, no dates can be selected.
     */
    disabled: PropTypes.bool,

     /**
     * Whether or not the dropdown is "clearable", that is, whether or
     * not a small "x" appears on the right of the dropdown that removes
     * the selected value.
     */
    clearable: PropTypes.bool,

    /**
     * Dash-assigned callback that gets fired when the value changes.
     */
    setProps: PropTypes.func,

    /**
     * Dash-assigned callback that gets fired when the value changes.
     */
    dashEvents: PropTypes.oneOf(['change'])
};

DatePickerRange.defaultProps = {
    calendar_orientation: 'horizontal',
    is_RTL: false,
    day_size: 39,
    with_portal: false,
    with_full_screen_portal: false,
    first_day_of_week: 0,
    number_of_months_shown: 1,
    stay_open_on_select: false,
    reopen_calendar_on_clear: false,
    clearable: false,
    disabled: false
};

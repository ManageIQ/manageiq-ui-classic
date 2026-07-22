/**
 * Date / datetime value editor for the ExpressionEditor.
 *
 * Modes (stored as rule.dateFormat: 's' | 'r'):
 *   's' — specific date: Carbon DatePicker + optional 15-min time Select
 *   'r' — relative date: Select from FROM_* option lists
 *
 * Operator FROM renders two date controls separated by a "THROUGH" label;
 * value is stored as [fromValue, throughValue]. All other operators use a scalar.
 *
 * The Carbon DatePicker locale (calendar weekday/month names, first day of week)
 * is fetched once from /api and passed through as the flatpickr locale code.
 */
import { useState, useEffect } from 'react';
import {
  Button,
  DatePicker,
  DatePickerInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { Calendar, Moon } from '@carbon/react/icons';
import { API } from '../../http_api';
import { buildRelativeDateOptions, TIME_OPTIONS } from './date-constants';

/**
 * Derive the Carbon DatePicker config from a ManageIQ locale string ("zh_CN", "de", …).
 * Returns { fpLocale, dateFormat, placeholder } where:
 *   fpLocale    — flatpickr locale code passed to Carbon's `locale` prop
 *   dateFormat  — flatpickr format string passed to Carbon's `dateFormat` prop
 *   placeholder — visible hint text in the input
 *
 * Day/month order and separator are read from the browser's Intl.DateTimeFormat
 * so there is no hardcoded locale map to maintain.
 */
const buildLocaleConfig = (manageiqLocale) => {
  // flatpickr locale code: ManageIQ uses underscores; zh_TW is a special case
  let fpLocale = 'en';
  if (manageiqLocale && manageiqLocale !== 'default') {
    fpLocale = manageiqLocale === 'zh_TW' ? 'zh_tw' : manageiqLocale.split('_')[0];
  }

  // BCP-47 tag for Intl (underscores → hyphens)
  const intlTag = (manageiqLocale || 'en').replace(/_/g, '-');

  let dateFormat = 'm/d/Y';
  let placeholder = 'mm/dd/yyyy';
  try {
    const parts = new Intl.DateTimeFormat(intlTag, {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date(2000, 0, 15));

    // Build format/placeholder in the order Intl gives us
    const sep = parts.find((p) => p.type === 'literal' && p.value.trim())?.value.trim() || '/';
    const tokenMap = { year: ['Y', 'yyyy'], month: ['m', 'mm'], day: ['d', 'dd'] };
    const dateParts = parts.filter((p) => tokenMap[p.type]);
    dateFormat = dateParts.map((p) => tokenMap[p.type][0]).join(sep);
    placeholder = dateParts.map((p) => tokenMap[p.type][1]).join(sep);
  } catch (_) { /* unsupported locale — keep US defaults */ }

  return { fpLocale, dateFormat, placeholder };
};

// Split a stored datetime string ("2024-01-15 14:30") into { date, time }.
const splitDateTime = (val) => {
  if (!val) {
    return { date: '', time: null };
  }
  const str = String(val);
  const spaceIdx = str.indexOf(' ');
  if (spaceIdx === -1) {
    return { date: str, time: null };
  }
  return { date: str.slice(0, spaceIdx), time: str.slice(spaceIdx + 1) };
};

// Reorder a stored "yyyy-mm-dd" date into the display format flatpickr expects.
const formatDateForPicker = (isoDate, dateFormat) => {
  if (!isoDate) {
    return '';
  }
  const [year, month, day] = String(isoDate).split('-');
  if (!year || !month || !day) {
    return String(isoDate);
  }
  return dateFormat.replace('Y', year).replace('m', month).replace('d', day);
};

const joinDateTime = (date, time) => (time ? `${date} ${time}` : date);

// One date control: DatePicker+time in specific mode, Select in relative mode.
const SingleDateControl = ({
  value,
  dateFormat,
  isDatetime,
  disabled,
  id,
  onChange,
  operator,
  localeConfig,
}) => {
  const relativeOptions = buildRelativeDateOptions(isDatetime);
  const { date, time } = splitDateTime(value);
  const showTime = isDatetime && operator !== 'IS';
  const defaultTime = TIME_OPTIONS[0].name;

  useEffect(() => {
    if (showTime && date && time === null) {
      onChange(joinDateTime(date, defaultTime));
    }
  }, [showTime]); // intentionally omits date/time/onChange — runs only when showTime toggles

  if (dateFormat === 'r') {
    const firstOption = relativeOptions[0]?.name ?? '';
    const safeVal = value || firstOption;
    return (
      <Select
        id={id}
        hideLabel
        labelText={__('Date')}
        size="sm"
        value={safeVal}
        disabled={disabled}
        className="exp-date-relative-select"
        onChange={(e) => onChange(e.target.value)}
      >
        {relativeOptions.map((opt) => (
          <SelectItem key={opt.name} value={opt.name} text={opt.label} />
        ))}
      </Select>
    );
  }

  const handleDateChange = (dates) => {
    if (!dates || dates.length === 0) {
      return;
    }
    const [d] = dates;
    if (!(d instanceof Date) || isNaN(d)) {
      return;
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(joinDateTime(formatted, time ?? defaultTime));
  };

  const handleTimeChange = (e) => {
    onChange(joinDateTime(date, e.target.value));
  };

  const { fpLocale, dateFormat: pickerFormat, placeholder } = localeConfig;

  return (
    <div className="exp-date-specific">
      <DatePicker
        datePickerType="single"
        dateFormat={pickerFormat}
        locale={fpLocale}
        value={formatDateForPicker(date, pickerFormat) || undefined}
        onChange={handleDateChange}
      >
        <DatePickerInput
          id={id}
          hideLabel
          labelText={__('Date')}
          placeholder={placeholder}
          size="sm"
          disabled={disabled}
        />
      </DatePicker>
      {showTime && (
        <Select
          id={`${id}-time`}
          hideLabel
          labelText={__('Time')}
          size="sm"
          value={time ?? TIME_OPTIONS[0].name}
          disabled={disabled}
          className="exp-date-time-select"
          onChange={handleTimeChange}
        >
          {TIME_OPTIONS.map((t) => (
            <SelectItem key={t.name} value={t.name} text={t.label} />
          ))}
        </Select>
      )}
    </div>
  );
};

const DateValueEditor = ({
  value,
  operator,
  dateFormat: dateFormatProp,
  isDatetime,
  disabled,
  id,
  handleOnChange,
  onToggleFormat,
}) => {
  const [dateFormat, setDateFormat] = useState(
    dateFormatProp === 'r' ? 'r' : 's',
  );
  const [localeConfig, setLocaleConfig] = useState(() => buildLocaleConfig(null));

  useEffect(() => {
    API.get('/api?attributes=settings').then(({ settings }) => {
      // settings.display.locale is the user's saved preference ("zh_CN", "de", …)
      // settings.locale is the server's I18n.locale — not what we want here.
      const userLocale = settings && settings.display && settings.display.locale;
      setLocaleConfig(buildLocaleConfig(userLocale));
    }).catch(() => { /* keep US defaults */ });
  }, []);

  const isFrom = operator === 'FROM';

  const fromVal = isFrom ? (Array.isArray(value) ? value[0] : value) ?? '' : null;
  const throughVal = isFrom ? (Array.isArray(value) ? value[1] : null) ?? '' : null;
  const scalarVal = isFrom ? null : (Array.isArray(value) ? value[0] : value) ?? '';

  const handleToggle = () => {
    const next = dateFormat === 's' ? 'r' : 's';
    setDateFormat(next);
    if (onToggleFormat) {
      onToggleFormat(next);
    }
    // When switching to relative mode, seed with the first available option so
    // the Select is immediately valid (it renders that option anyway, but never
    // fires onChange to write it back). When switching back to specific, reset
    // to empty so the validator correctly requires a date to be picked.
    if (next === 'r') {
      const firstOption = buildRelativeDateOptions(isDatetime)[0]?.name ?? '';
      if (isFrom) {
        handleOnChange([firstOption, firstOption]);
      } else {
        handleOnChange(firstOption);
      }
    } else if (isFrom) {
      handleOnChange(['', '']);
    } else {
      handleOnChange('');
    }
  };

  const handleFromChange = (newFrom) => handleOnChange([newFrom, throughVal ?? '']);
  const handleThroughChange = (newThrough) => handleOnChange([fromVal ?? '', newThrough]);

  return (
    <div className="exp-date-editor">
      {isFrom ? (
        <>
          <SingleDateControl
            value={fromVal}
            dateFormat={dateFormat}
            isDatetime={isDatetime}
            disabled={disabled}
            id={`${id}-from`}
            onChange={handleFromChange}
            operator={operator}
            localeConfig={localeConfig}
          />
          <span className="exp-date-through">{__('THROUGH')}</span>
          <SingleDateControl
            value={throughVal}
            dateFormat={dateFormat}
            isDatetime={isDatetime}
            disabled={disabled}
            id={`${id}-through`}
            onChange={handleThroughChange}
            operator={operator}
            localeConfig={localeConfig}
          />
        </>
      ) : (
        <SingleDateControl
          value={scalarVal}
          dateFormat={dateFormat}
          isDatetime={isDatetime}
          disabled={disabled}
          id={id}
          onChange={handleOnChange}
          operator={operator}
          localeConfig={localeConfig}
        />
      )}
      <Button
        kind="ghost"
        size="sm"
        hasIconOnly
        renderIcon={dateFormat === 's' ? Moon : Calendar}
        iconDescription={
          dateFormat === 's'
            ? __('Switch to relative date format')
            : __('Switch to specific date format')
        }
        tooltipPosition="bottom"
        disabled={disabled}
        className="exp-date-toggle-btn"
        onClick={handleToggle}
      />
    </div>
  );
};

export default DateValueEditor;

import { DIALOG_FIELD_TYPES } from './constants';

class ServiceValidator {
  static validateField(data) {
    if (!data.isOrderServiceForm) {
      return ({ valid: true, value: data.value });
    }
    const {
      checkBox, date, dateTime, dropDown, radio, tag, textBox, textArea,
    } = DIALOG_FIELD_TYPES;

    switch (data.field.type) {
      case checkBox:
        return this.checkbox(data);
      case date:
        return this.date(data);
      case dateTime:
        return this.dateTime(data);
      case dropDown:
        return this.dropDown(data);
      case radio:
        return this.radio(data);
      case tag:
        return this.tag(data);
      case textBox:
        return this.textBox(data);
      case textArea:
        return this.textArea(data);
      default:
        return this.default(data);
    }
  }

  static checkbox(data) {
    return { valid: (data.field.required ? !!data.value : true), value: data.value !== '' };
  }

  static date({ field, value }) {
    const { day, month, year } = value;
    const hasDate = !!((day && month && year));
    return { valid: field.required ? hasDate : true, value: { day, month, year } };
  }

  static time({ field, value }) {
    const { hour, minute } = value;
    const hasMinute = !!((hour && { hour, minute }));
    return { valid: field.required ? hasMinute : true, value: { hour, minute } };
  }

  static dateTime(data) {
    const date = this.date(data);
    const time = this.time(data);
    return { valid: data.field.required ? !!(date.valid && time.valid) : true, value: { ...date.value, ...time.value } };
  }

  static dropDown(data) {
    const isMulti = !!(data.field.options && data.field.options.force_multi_value);
    const valid = isMulti ? !!(data.value.length > 0) : !!data.value.id;
    return { valid: data.field.required ? valid : true, value: data.value };
  }

  static radio(data) {
    return { valid: data.field.required ? !!data.value : true, value: data.value };
  }

  static tag(data) {
    const isMulti = !!(data.field.options && !data.field.options.force_single_value);
    const valid = isMulti ? !!(data.value.length > 0) : !!data.value.id;
    return { valid: data.field.required ? valid : true, value: data.value };
  }

  static textBox(data) {
    return { valid: data.field.required ? !!data.value : true, value: data.value };
  }

  static textArea(data) {
    return { valid: data.field.required ? !!data.value : true, value: data.value };
  }

  static commonValidation(data) {
    return { valid: data.field.required ? !!data.value : true, value: data.value };
  }

  static default(data) {
    return { valid: true, value: data.value };
  }
}

export default ServiceValidator;

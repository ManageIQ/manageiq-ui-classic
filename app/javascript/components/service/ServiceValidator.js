import { DIALOG_FIELD_TYPES, ServiceType } from './constants';

class ServiceValidator {
  constructor(serviceType) {
    if (!ServiceValidator.instance) {
      this.serviceType = serviceType;
      ServiceValidator.instance = this;
    }
    return ServiceValidator.instance;
  }

  static validateField(data) {
    switch (ServiceValidator.instance.serviceType) {
      case ServiceType.order:
        return this.orderServiceValidation(data);
      case ServiceType.dialog:
      case ServiceType.request:
      default:
        return ({ valid: true, value: data.value });
    }
  }

  static orderServiceValidation(data) {
    const validationMap = {
      [DIALOG_FIELD_TYPES.checkBox]: this.checkbox,
      [DIALOG_FIELD_TYPES.date]: this.date,
      [DIALOG_FIELD_TYPES.dateTime]: this.dateTime,
      [DIALOG_FIELD_TYPES.dropDown]: this.dropDown,
      [DIALOG_FIELD_TYPES.radio]: this.radio,
      [DIALOG_FIELD_TYPES.tag]: this.tag,
      [DIALOG_FIELD_TYPES.textBox]: this.textBox,
      [DIALOG_FIELD_TYPES.textArea]: this.textArea,
    };
    const validateFn = validationMap[data.field.type] || this.default;
    return validateFn.call(this, data);
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
    const { hour, minute, meridiem } = value;
    const hasMinute = !!((hour && { hour, minute, meridiem }));
    return { valid: field.required ? hasMinute : true, value: { hour, minute, meridiem } };
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

  static textBox({ field, value }) {
    return this.commonFieldValidation(field, value);
  }

  static textArea({ field, value }) {
    return this.commonFieldValidation(field, value);
  }

  /** Regular expression is handled only for TextInput and TextArea */
  static regularExpressionValidation(field, value) {
    if (field.validator_type === 'regex' && field.validator_rule) {
      try {
        if (typeof field.validator_rule === 'string') {
          field.validator_rule = new RegExp(field.validator_rule);
        }
        const aaa = field.validator_rule.test(value);
        return aaa ? { valid: true, value, message: undefined }
          : { valid: false, message: field.validator_message || __('Custom Validation failed'), value };
      } catch (error) {
        console.error('Unexpected error occurred when the field was validated using regular expression.', error);
        throw error;
      }
    }
    return undefined;
  }

  /** Validation for TextInput, TextArea. */
  static commonFieldValidation(field, value) {
    const custom = this.regularExpressionValidation(field, value);
    if (field.required) {
      if (custom) {
        return custom.valid
          ? { valid: true, value }
          : { valid: false, value, message: custom.message };
      }
      return { valid: !!value, value };
    }
    return { valid: true, value };
  }
}

export default ServiceValidator;

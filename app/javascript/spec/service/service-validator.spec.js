import ServiceValidator from '../../components/service/ServiceValidator';
import { ServiceType } from '../../components/service/constants';

// Re-initialise the singleton before every test so state doesn't leak.
beforeEach(() => {
  ServiceValidator.instance = null;
  new ServiceValidator(ServiceType.order); // eslint-disable-line no-new
});

const field = (overrides = {}) => ({
  type: 'DialogFieldTextBox',
  required: true,
  validator_type: null,
  validator_rule: null,
  validator_message: null,
  options: {},
  ...overrides,
});

describe('ServiceValidator', () => {
  describe('non-editable service types', () => {
    it('always returns valid for serviceDialog', () => {
      ServiceValidator.instance = null;
      new ServiceValidator(ServiceType.dialog); // eslint-disable-line no-new
      const result = ServiceValidator.validateField({ field: field(), value: '' });
      expect(result.valid).toBe(true);
    });

    it('always returns valid for serviceRequest', () => {
      ServiceValidator.instance = null;
      new ServiceValidator(ServiceType.request); // eslint-disable-line no-new
      const result = ServiceValidator.validateField({ field: field(), value: '' });
      expect(result.valid).toBe(true);
    });
  });

  describe('TextBox / TextArea', () => {
    it('is invalid when required and empty', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldTextBox', required: true }),
        value: '',
      });
      expect(result.valid).toBe(false);
    });

    it('is valid when required and has a value', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldTextBox', required: true }),
        value: 'hello',
      });
      expect(result.valid).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('is valid when optional and empty', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldTextBox', required: false }),
        value: '',
      });
      expect(result.valid).toBe(true);
    });

    it('TextArea mirrors TextBox behaviour', () => {
      const required = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldTextAreaBox', required: true }),
        value: '',
      });
      expect(required.valid).toBe(false);

      const optional = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldTextAreaBox', required: false }),
        value: '',
      });
      expect(optional.valid).toBe(true);
    });
  });

  describe('regex validation (TextBox)', () => {
    const regexField = (rule, message = null) =>
      field({
        type: 'DialogFieldTextBox',
        required: true,
        validator_type: 'regex',
        validator_rule: rule,
        validator_message: message,
      });

    it('is invalid when value does not match the regex', () => {
      const result = ServiceValidator.validateField({
        field: regexField('^\\d+$'),
        value: 'abc',
      });
      expect(result.valid).toBe(false);
    });

    it('is valid when value matches the regex', () => {
      const result = ServiceValidator.validateField({
        field: regexField('^\\d+$'),
        value: '123',
      });
      expect(result.valid).toBe(true);
    });

    it('uses validator_message when provided', () => {
      const result = ServiceValidator.validateField({
        field: regexField('^\\d+$', 'Digits only'),
        value: 'abc',
      });
      expect(result.message).toBe('Digits only');
    });

    it('falls back to default message when no validator_message', () => {
      const result = ServiceValidator.validateField({
        field: regexField('^\\d+$', null),
        value: 'abc',
      });
      expect(result.message).toBe(__('Custom Validation failed'));
    });
  });

  describe('CheckBox', () => {
    it('is valid when required and checked (true)', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldCheckBox', required: true }),
        value: true,
      });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    it('is invalid when required and unchecked (false)', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldCheckBox', required: true }),
        value: false,
      });
      expect(result.valid).toBe(false);
    });

    it('is valid when optional and unchecked', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldCheckBox', required: false }),
        value: false,
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('DropDown (single)', () => {
    const ddField = (required = true) =>
      field({ type: 'DialogFieldDropDownList', required, options: { force_multi_value: false } });

    it('is invalid when required and nothing is selected', () => {
      const result = ServiceValidator.validateField({ field: ddField(), value: {} });
      expect(result.valid).toBe(false);
    });

    it('is valid when required and an item is selected', () => {
      const result = ServiceValidator.validateField({ field: ddField(), value: { id: '1', text: 'One' } });
      expect(result.valid).toBe(true);
    });

    it('is valid when optional and nothing selected', () => {
      const result = ServiceValidator.validateField({ field: ddField(false), value: {} });
      expect(result.valid).toBe(true);
    });
  });

  describe('DropDown (multi)', () => {
    const multiField = (required = true) =>
      field({ type: 'DialogFieldDropDownList', required, options: { force_multi_value: true } });

    it('is invalid when required and no items selected', () => {
      const result = ServiceValidator.validateField({ field: multiField(), value: [] });
      expect(result.valid).toBe(false);
    });

    it('is valid when required and at least one item selected', () => {
      const result = ServiceValidator.validateField({
        field: multiField(),
        value: [{ id: '1', text: 'One' }],
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('Radio', () => {
    it('is invalid when required and no option selected', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldRadioButton', required: true }),
        value: '',
      });
      expect(result.valid).toBe(false);
    });

    it('is valid when required and an option is selected', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldRadioButton', required: true }),
        value: 'option1',
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('Date', () => {
    it('is invalid when required and date is incomplete', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldDateControl', required: true }),
        value: { day: '', month: '', year: '' },
      });
      expect(result.valid).toBe(false);
    });

    it('is valid when required and date is complete', () => {
      const result = ServiceValidator.validateField({
        field: field({ type: 'DialogFieldDateControl', required: true }),
        value: { day: '15', month: '6', year: '2025' },
      });
      expect(result.valid).toBe(true);
    });
  });
});

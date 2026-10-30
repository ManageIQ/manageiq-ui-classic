import { buildSubmitData, getInitialValues } from '../../components/ab-form/helper';
import { API } from '../../http_api';

jest.mock('../../http_api', () => ({ API: { get: jest.fn() } }));

const baseValues = {
  name: 'My Button',
  description: 'desc',
  options: {
    button_type: 'default',
    display: true,
    display_for: 'single',
    submit_how: 'one',
    open_url: false,
  },
  resource_action: { ae_instance: 'Request', ae_message: 'create' },
  uri_attributes: { request: 'my_request' },
  attribute_pairs: [],
  visibility: { roles: '_ALL_' },
  enablement_expression: null,
  visibility_expression: null,
};

describe('buildSubmitData', () => {
  it('sets applies_to_class and injects ae_class/ae_namespace into resource_action', () => {
    const result = buildSubmitData(baseValues, null, 'Vm', null, {}, 'ff ff-action');

    expect(result.applies_to_class).toBe('Vm');
    expect(result.resource_action.ae_class).toBe('PROCESS');
    expect(result.resource_action.ae_namespace).toBe('SYSTEM');
  });

  it('uses initialValues.applies_to_id when editing', () => {
    const result = buildSubmitData(baseValues, 5, 'Vm', null, { applies_to_id: '42' }, 'ff ff-action');

    expect(result.applies_to_id).toBe('42');
  });

  it('uses appliesToId prop when creating', () => {
    const result = buildSubmitData(baseValues, null, 'ServiceTemplate', '99', {}, 'ff ff-action');

    expect(result.applies_to_id).toBe('99');
  });

  it('merges buttonIcon into options', () => {
    const result = buildSubmitData(baseValues, null, 'Vm', null, {}, 'ff ff-check');

    expect(result.options.button_icon).toBe('ff ff-check');
  });

  describe('role visibility', () => {
    it('converts _ALL_ to array format', () => {
      const result = buildSubmitData(baseValues, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.visibility).toEqual({ roles: ['_ALL_'] });
      expect(result.available_roles).toBeUndefined();
    });

    it('converts by-role with label/value objects to array of values', () => {
      const values = {
        ...baseValues,
        visibility: { roles: 'role' },
        available_roles: [
          { label: 'EvmRole-auditor', value: 'EvmRole-auditor' },
          { label: 'EvmRole-approver', value: 'EvmRole-approver' },
        ],
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.visibility).toEqual({ roles: ['EvmRole-auditor', 'EvmRole-approver'] });
      expect(result.available_roles).toBeUndefined();
    });

    it('re-wraps plain strings when editing', () => {
      const values = {
        ...baseValues,
        visibility: { roles: 'role' },
        available_roles: ['EvmRole-auditor', 'EvmRole-approver'],
      };
      const result = buildSubmitData(values, 5, 'Vm', null, {}, 'ff ff-action');

      expect(result.visibility).toEqual({ roles: ['EvmRole-auditor', 'EvmRole-approver'] });
    });
  });

  describe('attribute_pairs', () => {
    it('packs non-empty pairs into uri_attributes', () => {
      const values = {
        ...baseValues,
        attribute_pairs: [
          { key: 'env', value: 'prod' },
          { key: 'tier ', value: ' web' },
        ],
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.uri_attributes.env).toBe('prod');
      expect(result.uri_attributes.tier).toBe('web');
      expect(result.attribute_pairs).toBeUndefined();
    });

    it('ignores pairs with blank keys', () => {
      const values = {
        ...baseValues,
        attribute_pairs: [{ key: '', value: 'ignored' }, { key: '  ', value: 'also ignored' }],
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(Object.keys(result.uri_attributes)).toEqual(['request']);
    });
  });

  describe('expressions', () => {
    it('wraps a valid expression in { exp: ... }', () => {
      const values = {
        ...baseValues,
        enablement_expression: { '=': { field: 'Vm-name', value: 'foo' } },
        visibility_expression: { '!=': { field: 'Vm-name', value: 'bar' } },
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.enablement_expression).toEqual({ exp: { '=': { field: 'Vm-name', value: 'foo' } } });
      expect(result.visibility_expression).toEqual({ exp: { '!=': { field: 'Vm-name', value: 'bar' } } });
    });

    it('strips the __expression_invalid__ sentinel to null', () => {
      const values = {
        ...baseValues,
        enablement_expression: '__expression_invalid__',
        visibility_expression: '__expression_invalid__',
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.enablement_expression).toBeNull();
      expect(result.visibility_expression).toBeNull();
    });

    it('nulls out expressions when display_for is not single', () => {
      const values = {
        ...baseValues,
        options: { ...baseValues.options, display_for: 'list' },
        enablement_expression: { '=': { field: 'Vm-name', value: 'foo' } },
        visibility_expression: { '=': { field: 'Vm-name', value: 'foo' } },
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.enablement_expression).toBeNull();
      expect(result.visibility_expression).toBeNull();
    });
  });

  describe('ansible playbook button', () => {
    const ansibleValues = {
      ...baseValues,
      options: { ...baseValues.options, button_type: 'ansible_playbook' },
      uri_attributes: { service_template_name: 'my_playbook' },
    };

    it('sets request to Order_Ansible_Playbook', () => {
      const result = buildSubmitData(
        { ...ansibleValues, inventory_type: 'localhost' }, null, 'Vm', null, {}, 'ff ff-action'
      );

      expect(result.uri_attributes.request).toBe('Order_Ansible_Playbook');
    });

    it('sets hosts to localhost', () => {
      const result = buildSubmitData(
        { ...ansibleValues, inventory_type: 'localhost' }, null, 'Vm', null, {}, 'ff ff-action'
      );

      expect(result.uri_attributes.hosts).toBe('localhost');
    });

    it('sets hosts to vmdb_object', () => {
      const result = buildSubmitData(
        { ...ansibleValues, inventory_type: 'vmdb_object' }, null, 'Vm', null, {}, 'ff ff-action'
      );

      expect(result.uri_attributes.hosts).toBe('vmdb_object');
    });

    it('sets hosts to the manual value and cleans up form-only fields', () => {
      const result = buildSubmitData(
        { ...ansibleValues, inventory_type: 'manual', hosts: '192.168.1.1,192.168.1.2' },
        null, 'Vm', null, {}, 'ff ff-action'
      );

      expect(result.uri_attributes.hosts).toBe('192.168.1.1,192.168.1.2');
      expect(result.hosts).toBeUndefined();
      expect(result.inventory_type).toBeUndefined();
    });

    it('does not pack attribute_pairs', () => {
      const values = {
        ...ansibleValues,
        inventory_type: 'localhost',
        attribute_pairs: [{ key: 'foo', value: 'bar' }],
      };
      const result = buildSubmitData(values, null, 'Vm', null, {}, 'ff ff-action');

      expect(result.attribute_pairs).toBeUndefined();
      expect(result.uri_attributes.foo).toBeUndefined();
    });
  });
});

describe('getInitialValues', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns default new-button values when recId is falsy', async() => {
    const result = await getInitialValues(null);

    expect(result.options.button_type).toBe('default');
    expect(result.attribute_pairs).toEqual([]);
    expect(result.visibility).toEqual({ roles: ['_ALL_'] });
  });

  describe('when recId is present', () => {
    const apiButton = {
      name: 'Existing Button',
      options: { button_type: 'default', display_for: 'single' },
      uri_attributes: { request: 'my_req', env: 'prod', object_name: 'skip_me' },
      resource_action: { ae_instance: 'Request', dialog_id: '7' },
      visibility: { roles: ['_ALL_'] },
      enablement_expression: null,
      visibility_expression: null,
    };

    beforeEach(() => {
      API.get.mockResolvedValue(apiButton);
    });

    it('fetches from /api/custom_buttons/:id', async() => {
      await getInitialValues(5);

      expect(API.get).toHaveBeenCalledWith(expect.stringContaining('/api/custom_buttons/5'));
    });

    it('converts uri_attributes to attribute_pairs, skipping reserved keys', async() => {
      const result = await getInitialValues(5);

      expect(result.attribute_pairs).toEqual([{ key: 'env', value: 'prod' }]);
    });

    it('casts dialog_id from string to int', async() => {
      const result = await getInitialValues(5);

      expect(result.resource_action.dialog_id).toBe(7);
    });

    it('normalises _ALL_ visibility to a string', async() => {
      const result = await getInitialValues(5);

      expect(result.visibility).toEqual({ roles: '_ALL_' });
    });

    it('normalises by-role visibility and sets available_roles', async() => {
      API.get.mockResolvedValue({
        ...apiButton,
        visibility: { roles: ['EvmRole-auditor', 'EvmRole-approver'] },
      });
      const result = await getInitialValues(5);

      expect(result.visibility).toEqual({ roles: 'role' });
      expect(result.available_roles).toEqual(['EvmRole-auditor', 'EvmRole-approver']);
    });

    it('unwraps enablement_expression from { exp: ... }', async() => {
      const exp = { '=': { field: 'Vm-name', value: 'foo' } };
      API.get.mockResolvedValue({ ...apiButton, enablement_expression: { exp } });
      const result = await getInitialValues(5);

      expect(result.enablement_expression).toEqual(exp);
    });

    it('leaves expressions as null when absent', async() => {
      const result = await getInitialValues(5);

      expect(result.enablement_expression).toBeNull();
      expect(result.visibility_expression).toBeNull();
    });

    describe('ansible playbook normalisation', () => {
      const ansibleApi = {
        ...apiButton,
        options: { button_type: 'ansible_playbook' },
        uri_attributes: { request: 'Order_Ansible_Playbook', hosts: 'localhost', service_template_name: 'pb' },
      };

      it('resets request to create', async() => {
        API.get.mockResolvedValue(ansibleApi);
        const result = await getInitialValues(5);

        expect(result.uri_attributes.request).toBe('create');
      });

      it('derives inventory_type localhost', async() => {
        API.get.mockResolvedValue(ansibleApi);
        const result = await getInitialValues(5);

        expect(result.inventory_type).toBe('localhost');
      });

      it('derives inventory_type vmdb_object', async() => {
        API.get.mockResolvedValue({
          ...ansibleApi,
          uri_attributes: { ...ansibleApi.uri_attributes, hosts: 'vmdb_object' },
        });
        const result = await getInitialValues(5);

        expect(result.inventory_type).toBe('vmdb_object');
      });

      it('derives inventory_type manual and sets hosts', async() => {
        API.get.mockResolvedValue({
          ...ansibleApi,
          uri_attributes: { ...ansibleApi.uri_attributes, hosts: '10.0.0.1' },
        });
        const result = await getInitialValues(5);

        expect(result.inventory_type).toBe('manual');
        expect(result.hosts).toBe('10.0.0.1');
      });
    });
  });
});

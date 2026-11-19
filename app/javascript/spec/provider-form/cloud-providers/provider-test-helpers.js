import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux as render } from '../../helpers/mountForm';
import ProviderForm from '../../../components/provider-form';
import miqRedirectBack from '../../../helpers/miq-redirect-back';
import validateName from '../../../helpers/storage_manager/validate-names';
import {
  PROVIDER_TYPES,
  REGION_OPTIONS,
  SELECT_OPTIONS,
  TAB_LABELS,
  VALIDATION_MESSAGES,
} from '../../../../../cypress/e2e/ui/Compute/Clouds/Providers/provider-factory';
import {
  buildProviderRecord,
  buildProviderSchema,
  slugify,
} from './provider-schema-builder';

/**
 * Jest counterpart of `generateProviderTests` (cypress/support/commands/provider_helper_commands.js).
 *
 * The provider definitions come from the shared Cypress registry (provider-factory.js). The form
 * schema normally served by the backend is synthesised from that registry, see provider-schema-builder.js.
 *
 * `validateName` must be mocked by the spec file that calls `generateProviderTests`:
 *   jest.mock('../../../helpers/storage_manager/validate-names', () => jest.fn());
 */

/** Field that is changed in edit mode for each provider, mirrors `updateProviderFieldsForEdit` in Cypress. */
export const EDIT_FIELD_UPDATES = {
  [PROVIDER_TYPES.VMWARE_VCLOUD]: {
    id: 'api_version',
    kind: 'select',
    value: SELECT_OPTIONS.API_VERSION_V9,
  },
  [PROVIDER_TYPES.ORACLE_CLOUD]: {
    id: 'provider_region',
    kind: 'select',
    value: REGION_OPTIONS.MELBOURNE,
  },
  [PROVIDER_TYPES.IBM_CLOUD_VPC]: {
    id: 'provider_region',
    kind: 'select',
    value: REGION_OPTIONS.SPAIN,
  },
  [PROVIDER_TYPES.IBM_POWER_SYSTEMS]: {
    id: 'uid_ems',
    kind: 'text',
    value: '-xr4q',
  },
  [PROVIDER_TYPES.GOOGLE_COMPUTE]: {
    id: 'project',
    kind: 'text',
    value: '-76g1',
  },
  [PROVIDER_TYPES.AZURE_STACK]: {
    id: 'endpoints.default.security_protocol',
    kind: 'select',
    value: SELECT_OPTIONS.SECURITY_PROTOCOL_NON_SSL,
  },
  [PROVIDER_TYPES.IBM_POWERVC]: {
    id: 'endpoints.default.security_protocol',
    kind: 'select',
    value: SELECT_OPTIONS.SECURITY_PROTOCOL_NON_SSL,
  },
  [PROVIDER_TYPES.IBM_CIC]: {
    id: 'endpoints.default.security_protocol',
    kind: 'select',
    value: SELECT_OPTIONS.SECURITY_PROTOCOL_NON_SSL,
  },
  [PROVIDER_TYPES.OPENSTACK]: {
    id: 'endpoints.default.security_protocol',
    kind: 'select',
    value: SELECT_OPTIONS.SECURITY_PROTOCOL_NON_SSL,
  },
  [PROVIDER_TYPES.AZURE]: {
    id: 'provider_region',
    kind: 'select',
    value: REGION_OPTIONS.CENTRAL_US,
  },
  [PROVIDER_TYPES.AMAZON_EC2]: {
    id: 'provider_region',
    kind: 'select',
    value: REGION_OPTIONS.ASIA_PACIFIC,
  },
};

const REQUIRED_MARKER = 'span.ddorg__carbon-component-mapper_is-required';
const PROVIDER_ZONES = [
  { id: SELECT_OPTIONS.ZONE_DEFAULT, name: SELECT_OPTIONS.ZONE_DEFAULT },
];

const byId = (container, id) => container.querySelector(`[id="${id}"]`);
/** user-event treats `{` and `[` as key descriptors; doubling them types the literal character (e.g. JSON values). */
const typeText = (user, element, value) =>
  user.type(element, value.replace(/[{[]/g, '$&$&'));
const labelFor = (container, id) =>
  container.querySelector(`label[for="${id}"]`);
const button = (name) => screen.getByRole('button', { name });

const TASK_ROUTE = 'task';
const TASK_URL = '/api/tasks/1?attributes=task_results';

/** Mocks the REST API by URL, ProviderForm and the helpers it uses keep talking to the real `API`. */
const mockApi = (providerConfig, { provider } = {}) => {
  const schema = buildProviderSchema(providerConfig);
  fetchMock.route(
    { method: 'OPTIONS', url: '/api/providers' },
    {
      data: {
        supported_providers: [
          {
            type: providerConfig.className,
            title: providerConfig.type,
            kind: 'cloud',
          },
        ],
      },
    }
  );
  fetchMock.route(
    {
      method: 'OPTIONS',
      url: `/api/providers?type=${providerConfig.className}`,
    },
    {
      data: { provider_form_schema: schema },
    }
  );
  fetchMock.get(/\/api\/zones/, { resources: PROVIDER_ZONES });
  if (provider) {
    fetchMock.get(
      '/api/providers/1?attributes=endpoints,authentications',
      provider
    );
  }
  // The credential check and the actual save both POST to `/api/providers`, only the action tells them apart.
  fetchMock.route({
    method: 'POST',
    url: /\/api\/providers(\/1)?$/,
    body: { action: 'verify_credentials' },
    matchPartialBody: true,
    response: { results: [{ task_id: '1', success: true }] },
  });
  fetchMock.post('/api/providers', {});
  fetchMock.patch('/api/providers/1', {});
  fetchMock.get(
    TASK_URL,
    { state: 'Finished', status: 'Ok', task_results: {} },
    { name: TASK_ROUTE }
  );
};

/** Makes the background task, that verifies the credentials, finish with an error. */
const failCredentialTask = (providerConfig) => {
  fetchMock.removeRoutes({ names: [TASK_ROUTE] });
  fetchMock.get(TASK_URL, {
    state: 'Finished',
    status: 'Error',
    message: providerConfig.validationError,
  });
};

/** Requests sent with the given method, with the JSON body parsed. */
const requestsWith = (method) =>
  fetchMock.callHistory
    .calls()
    .filter(({ options }) => options.method?.toUpperCase() === method)
    .map(({ url, options }) => ({
      path: new window.URL(url, 'http://localhost').pathname,
      body: options.body ? JSON.parse(options.body) : undefined,
    }));

/** Requests that save the provider, the credential checks are left out. */
const savedProviders = (method, path) =>
  requestsWith(method).filter(
    (request) =>
      request.path === path && request.body?.action !== 'verify_credentials'
  );

/** Waits until the endpoints sub-form is rendered, with its tab strip when the provider has one. */
const waitForEndpoints = (container, providerConfig) =>
  waitFor(() => {
    expect(byId(container, 'endpoints-subform')).toBeTruthy();
    if (providerConfig.hasTabs) {
      expect(screen.getAllByRole('tab')).toHaveLength(
        providerConfig.tabs.length
      );
    }
  });

const renderAdd = async(providerConfig) => {
  mockApi(providerConfig);
  const view = render(
    <ProviderForm kind="cloud" title="Cloud" redirect="/providers" />
  );
  await waitFor(() => expect(byId(view.container, 'type')).toBeTruthy());
  return view;
};

const renderEdit = async(providerConfig) => {
  mockApi(providerConfig, {
    provider: { id: '1', ...buildProviderRecord(providerConfig) },
  });
  const view = render(
    <ProviderForm
      kind="cloud"
      title="Cloud"
      redirect="/providers"
      providerId="1"
    />
  );
  await waitForEndpoints(view.container, providerConfig);
  return view;
};

const selectType = async(user, { container }, providerConfig) => {
  await user.selectOptions(byId(container, 'type'), providerConfig.type);
  await waitForEndpoints(container, providerConfig);
};

const openTab = async(user, tabLabel) => {
  await user.click(screen.getByRole('tab', { name: tabLabel }));
};

/** Mirrors `setupTabForValidation`: pick the first value of every field listed in `fieldSelectionValues`. */
const applyFieldSelections = async(user, container, providerConfig, slug) => {
  const selections = providerConfig.fieldSelectionValues[slug] || {};
  for (const [id, value] of Object.entries(selections)) {
    await user.selectOptions(
      byId(container, id),
      Array.isArray(value) ? value[0] : value
    );
  }
};

const expectLabel = (container, field) => {
  const label = labelFor(container, field.id);
  expect(label).toBeInTheDocument();
  expect(label).toHaveTextContent(field.label);
  if (field.required) {
    expect(label.querySelector(REQUIRED_MARKER)).toHaveTextContent('*');
  }
};

const expectPlaceholder = (container, field) => {
  const placeholder = byId(container, `${field.id}-password-placeholder`);
  // several credential groups use the same label (e.g. "Password"), so look inside the field's own fieldset
  expect(
    within(placeholder.closest('fieldset')).getByText(field.label, {
      selector: 'legend',
    })
  ).toBeInTheDocument();
  expect(placeholder).toHaveAttribute('type', 'password');
  expect(placeholder).toBeDisabled();
};

const expectFormField = (container, field, isEdit) => {
  const usesPlaceholder = isEdit && field.isPlaceholderInEditMode;
  if (!usesPlaceholder) {
    expectLabel(container, field);
  }

  switch (field.type) {
    case 'select':
      expect(byId(container, field.id)).toBeEnabled();
      break;
    case 'text':
      expect(byId(container, field.id)).toBeEnabled();
      break;
    case 'number':
      expect(byId(container, field.id)).toHaveAttribute('type', 'number');
      expect(byId(container, field.id)).toBeEnabled();
      break;
    case 'password':
    case 'textarea':
      if (usesPlaceholder) {
        expectPlaceholder(container, field);
      } else {
        const element = byId(container, field.id);
        expect(element.tagName).toBe(
          field.type === 'password' ? 'INPUT' : 'TEXTAREA'
        );
        if (field.type === 'password') {
          expect(element).toHaveAttribute('type', 'password');
        }
        expect(element).toBeEnabled();
      }
      break;
    case 'toggle_button':
      expect(byId(container, field.id)).toBeEnabled();
      break;
    default:
      break;
  }
};

const expectCommonFields = (container, providerConfig, isEdit) => {
  providerConfig.formFields.common.forEach((field) => {
    expectLabel(container, field);
    const element = byId(container, field.id);
    if (field.id === 'type' && isEdit) {
      expect(element).toBeDisabled();
      expect(
        within(element).getByRole('option', { selected: true })
      ).toHaveTextContent(providerConfig.type);
    } else {
      expect(element).toBeEnabled();
    }
  });
};

const expectButtons = (isEdit) => {
  // like Cypress, only the first Validate button is checked, optional credential groups can have their own
  expect(screen.getAllByRole('button', { name: 'Validate' })[0]).toBeDisabled();
  expect(button(isEdit ? 'Save' : 'Add')).toBeDisabled();
  if (isEdit) {
    expect(button('Reset')).toBeDisabled();
  }
  expect(button('Cancel')).toBeEnabled();
};

/** The endpoints sub-form shows the provider specific heading, and a tab strip only for providers with tabs. */
const expectEndpointsLayout = (container, providerConfig) => {
  const heading = within(byId(container, 'endpoints-subform')).getByRole(
    'heading',
    { level: 3 }
  );
  expect(heading).toHaveTextContent(
    new RegExp(`^${providerConfig.endpointsTitle}$`)
  );
  expect(screen.queryAllByRole('tablist')).toHaveLength(
    providerConfig.hasTabs ? 1 : 0
  );
};

const validateProviderFormFields = async(
  user,
  view,
  providerConfig,
  isEdit
) => {
  const { container, debug } = view;
  expectCommonFields(container, providerConfig, isEdit);
  expectEndpointsLayout(container, providerConfig);
  // Buttons are asserted on the untouched form, before the tab walk-through selects dropdown values and dirties it.
  expectButtons(isEdit);

  for (const tabLabel of providerConfig.tabs) {
    const slug = slugify(tabLabel);
    if (tabLabel !== TAB_LABELS.DEFAULT) {
      debug(container, 1000000000);
      await openTab(user, tabLabel);
    }

    await applyFieldSelections(user, container, providerConfig, slug);
    (providerConfig.formFields[slug] || []).forEach((field) =>
      expectFormField(container, field, isEdit));
  }

  if (providerConfig.tabs.length > 1) {
    await openTab(user, TAB_LABELS.DEFAULT);
  }
};

const updateFieldForEdit = async(user, container, providerConfig) => {
  const update = EDIT_FIELD_UPDATES[providerConfig.type];
  if (!update) {
    throw new Error(
      `No edit field update defined for provider type "${providerConfig.type}"`
    );
  }
  const element = byId(container, update.id);
  if (update.kind === 'select') {
    await user.selectOptions(element, update.value);
  } else {
    await typeText(user, element, update.value);
  }
};

/** Mirrors `fillProviderForm` for the default tab: type, name, zone and every value in `formValues.default`. */
const fillAddForm = async(user, view, providerConfig) => {
  const { container } = view;
  const { common, default: defaults = {} } = providerConfig.formValues;
  await selectType(user, view, providerConfig);
  await user.type(byId(container, 'name'), common.name);
  await user.selectOptions(byId(container, 'zone_id'), common.zone_id);
  await applyFieldSelections(
    user,
    container,
    providerConfig,
    slugify(TAB_LABELS.DEFAULT)
  );

  for (const [id, value] of Object.entries(defaults)) {
    const { type } = providerConfig.formFields.default.find(
      (field) => field.id === id
    );

    await (type === 'select'
      ? user.selectOptions(byId(container, id), value)
      : typeText(user, byId(container, id), value));
  }
};

/** Clicks every enabled Validate button and waits for the success message of each. */
const validateCredentials = async(user) => {
  const enabled = screen
    .getAllByRole('button', { name: 'Validate' })
    .filter((validate) => !validate.disabled);
  expect(enabled.length).toBeGreaterThan(0);
  for (const validate of enabled) {
    await user.click(validate);
  }
  await waitFor(() =>
    expect(screen.getAllByText(VALIDATION_MESSAGES.SUCCESSFUL)).toHaveLength(
      enabled.length
    ));
};

const addFormTests = (providerConfig) => {
  describe(`Validate ${providerConfig.type} add form`, () => {
    it('Validate visibility of elements', async() => {
      const user = userEvent.setup();
      const view = await renderAdd(providerConfig);

      expect(button('Add')).toBeDisabled();
      await selectType(user, view, providerConfig);

      // Verify the Add button stays disabled after the provider schema is loaded
      expect(button('Add')).toBeDisabled();
      expect(
        fetchMock.callHistory.called(
          `/api/providers?type=${providerConfig.className}`
        )
      ).toBe(true);

      await validateProviderFormFields(user, view, providerConfig, false);
      view.debug(view.container, 100000000000);
    });

    it('Cancel redirects back with a cancelled message', async() => {
      const user = userEvent.setup();
      const view = await renderAdd(providerConfig);
      await selectType(user, view, providerConfig);

      await user.click(button('Cancel'));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('cancelled'),
        'success',
        '/providers'
      );
    });

    it('Validates the credentials and adds the provider', async() => {
      const user = userEvent.setup();
      const view = await renderAdd(providerConfig);
      await fillAddForm(user, view, providerConfig);
      expect(button('Add')).toBeDisabled();

      await validateCredentials(user);
      await waitFor(() => expect(button('Add')).toBeEnabled());
      await user.click(button('Add'));

      const { common } = providerConfig.formValues;
      await waitFor(() =>
        expect(savedProviders('POST', '/api/providers')).toHaveLength(1));
      expect(savedProviders('POST', '/api/providers')[0].body).toEqual(
        expect.objectContaining({
          type: providerConfig.className,
          name: common.name,
          ddf: true,
          endpoints: expect.any(Array),
          authentications: expect.any(Array),
        })
      );
      await waitFor(() =>
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringMatching(/was saved/),
          'success',
          '/providers'
        ));
    });

    it('Keeps Add disabled when the credential validation fails', async() => {
      const user = userEvent.setup();
      const view = await renderAdd(providerConfig);
      await fillAddForm(user, view, providerConfig);
      failCredentialTask(providerConfig);

      await user.click(
        screen
          .getAllByRole('button', { name: 'Validate' })
          .find((validate) => !validate.disabled)
      );

      expect(
        await screen.findByText(new RegExp(VALIDATION_MESSAGES.FAILED))
      ).toBeInTheDocument();
      expect(button('Add')).toBeDisabled();
      expect(savedProviders('POST', '/api/providers')).toHaveLength(0);
    });
  });
};

const editFormTests = (providerConfig) => {
  describe(`Validate ${providerConfig.type} edit form`, () => {
    it('Validate visibility of elements', async() => {
      const user = userEvent.setup();
      const view = await renderEdit(providerConfig);
      view.debug(view.container, 100000000000);

      expect(
        fetchMock.callHistory.called(
          '/api/providers/1?attributes=endpoints,authentications'
        )
      ).toBe(true);
      await validateProviderFormFields(user, view, providerConfig, true);
    });

    it('Modifying a field enables Save and Reset', async() => {
      const user = userEvent.setup();
      const { container } = await renderEdit(providerConfig);
      expect(button('Save')).toBeDisabled();

      await updateFieldForEdit(user, container, providerConfig);

      await waitFor(() => expect(button('Save')).toBeEnabled());
      expect(button('Reset')).toBeEnabled();
    });

    it('Cancel redirects back with a cancelled message', async() => {
      const user = userEvent.setup();
      await renderEdit(providerConfig);

      await user.click(button('Cancel'));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('cancelled'),
        'success',
        '/providers'
      );
    });

    it('Updates a field and saves the provider', async() => {
      const user = userEvent.setup();
      const { container } = await renderEdit(providerConfig);

      await updateFieldForEdit(user, container, providerConfig);
      await waitFor(() => expect(button('Reset')).toBeEnabled());
      // Changing a field inside a credential group requires validating that group again.
      if (button('Save').disabled) {
        await validateCredentials(user);
      }
      await waitFor(() => expect(button('Save')).toBeEnabled());
      await user.click(button('Save'));

      await waitFor(() =>
        expect(savedProviders('PATCH', '/api/providers/1')).toHaveLength(1));
      expect(savedProviders('PATCH', '/api/providers/1')[0].body).toEqual(
        expect.objectContaining({ ddf: true })
      );
      await waitFor(() =>
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringMatching(/was saved/),
          'success',
          '/providers'
        ));
    });
  });
};

const nameUniquenessTests = (providerConfig) => {
  describe(`${providerConfig.type} provider name uniqueness validation`, () => {
    it('Should display error on duplicate name usage', async() => {
      validateName.mockResolvedValue(
        `The name "${providerConfig.formValues.common.name}" already exists in "providers"`
      );
      const user = userEvent.setup();
      const view = await renderAdd(providerConfig);
      await selectType(user, view, providerConfig);

      await user.type(
        byId(view.container, 'name'),
        providerConfig.formValues.common.name
      );
      await user.tab();

      expect(
        await screen.findByText(
          new RegExp(VALIDATION_MESSAGES.NAME_ALREADY_EXISTS)
        )
      ).toBeInTheDocument();
    });
  });
};

/**
 * Registers the Jest suites for a single cloud provider.
 * @param {Object} providerConfig - Result of `getProviderConfig(PROVIDER_TYPES.X)` from provider-factory.js
 */
export const generateProviderTests = (providerConfig) => {
  describe(`Validate cloud provider type: ${providerConfig.type}`, () => {
    beforeAll(() => {
      fetchMock.mockGlobal();
      // defined by miq_application.js in the application, which is not loaded in Jest, `API.wait_for_task` needs it
      window.miqDeferred = () => {
        const deferred = {};
        deferred.promise = new Promise((resolve, reject) => {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
        return deferred;
      };
    });

    afterEach(() => {
      fetchMock.removeRoutes();
      fetchMock.clearHistory();
    });

    afterAll(() => {
      fetchMock.unmockGlobal();
    });

    beforeEach(() => {
      window.miqSparkleOn = jest.fn();
      window.miqSparkleOff = jest.fn();
      miqRedirectBack.mockClear();
      validateName.mockReset();
      validateName.mockResolvedValue(undefined);
    });

    addFormTests(providerConfig);
    editFormTests(providerConfig);
    nameUniquenessTests(providerConfig);
  });
};

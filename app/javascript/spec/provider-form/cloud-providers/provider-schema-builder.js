import { REGION_OPTIONS, SELECT_OPTIONS } from '../../../../../cypress/e2e/ui/Compute/Clouds/Providers/provider-factory';

/**
 * The real `provider_form_schema` is defined in the provider gems (Ruby) and served by
 * `OPTIONS /api/providers?type=<class>`. It is not available to Jest, so a synthetic schema
 * is derived here from the shared Cypress provider registry (provider-factory.js).
 */

export const slugify = (text) => text.toLowerCase().replace(/\s+/g, '_');

const CREDENTIAL_ID = /^authentications\.([^.]+)\./;

const toArray = (value) => {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

const selectOptions = (providerConfig, slug, field) => {
  const values = [
    ...toArray(
      providerConfig.formValues[slug]
        && providerConfig.formValues[slug][field.id]
    ),
    ...toArray(
      providerConfig.fieldSelectionValues[slug]
        && providerConfig.fieldSelectionValues[slug][field.id]
    ),
    ...(field.id === 'provider_region'
      ? Object.values(REGION_OPTIONS)
      : Object.values(SELECT_OPTIONS)),
  ];
  return [...new Set(values)].map((value) => ({ label: value, value }));
};

const buildField = (providerConfig, slug, field) => {
  const base = {
    id: field.id,
    name: field.id,
    label: field.label,
    ...(field.required
      ? { isRequired: true, validate: [{ type: 'required' }] }
      : {}),
  };

  switch (field.type) {
    case 'select':
      return {
        ...base,
        component: 'select',
        options: selectOptions(providerConfig, slug, field),
      };
    case 'toggle_button':
      return { ...base, component: 'switch' };
    case 'number':
      return { ...base, component: 'text-field', type: 'number' };
    case 'password':
      return field.isPlaceholderInEditMode
        ? { ...base, component: 'password-field', type: 'password' }
        : { ...base, component: 'text-field', type: 'password' };
    case 'textarea':
      return field.isPlaceholderInEditMode
        ? { ...base, component: 'password-field', componentClass: 'textarea' }
        : { ...base, component: 'textarea' };
    default:
      return { ...base, component: 'text-field' };
  }
};

const buildTab = (providerConfig, tabLabel) => {
  const slug = slugify(tabLabel);
  const fields = [];
  const credentialGroups = {};

  (providerConfig.formFields[slug] || []).forEach((field) => {
    const built = buildField(providerConfig, slug, field);
    const credential = CREDENTIAL_ID.exec(field.id);
    if (!credential) {
      fields.push(built);
      return;
    }

    const role = credential[1];
    if (!credentialGroups[role]) {
      // Credentials are grouped per role in a validate wrapper, as the real schemas do. The wrapper
      // is also what makes password fields render their "change" placeholder in edit mode.
      credentialGroups[role] = {
        component: 'validate-provider-credentials',
        id: `authentications.${role}.valid`,
        name: `authentications.${role}.valid`,
        skipSubmit: true,
        fields: [],
      };
      fields.push(credentialGroups[role]);
    }
    credentialGroups[role].fields.push(built);
    if (field.required) {
      credentialGroups[role].isRequired = true;
    }
  });

  return {
    component: 'tab-item',
    name: slug,
    title: tabLabel,
    fields,
  };
};

/**
 * Content of the "endpoints-subform" sub-form. Providers with tabs get a tabs component, providers
 * registered with `hasTabs: false` (a single endpoint) get the fields of their default tab directly.
 */
const buildEndpointsFields = (providerConfig) => {
  if (!providerConfig.hasTabs) {
    return buildTab(providerConfig, providerConfig.tabs[0]).fields;
  }
  return [
    {
      component: 'tabs',
      name: 'tabs',
      fields: providerConfig.tabs.map((tabLabel) =>
        buildTab(providerConfig, tabLabel)),
    },
  ];
};

// The content is wrapped in an "endpoints-subform" sub-form, which renders the header (`endpointsTitle`
// of the registry), as the schemas of the real provider gems do.
export const buildProviderSchema = (providerConfig) => ({
  fields: [
    {
      component: 'sub-form',
      id: 'endpoints-subform',
      name: 'endpoints-subform',
      title: providerConfig.endpointsTitle,
      fields: buildEndpointsFields(providerConfig),
    },
  ],
});

/**
 * Splits the flat, dotted `formValues` of a tab into the shape returned by `GET /api/providers/:id`.
 * `endpoints.<role>.<key>` and `authentications.<authtype>.<key>` become arrays (as the API returns
 * them), anything else is a top level provider attribute. The `fieldSelectionValues` are part of the
 * record too, selecting them in the UI must not make an unchanged edit form dirty.
 */
export const buildProviderRecord = (providerConfig) => {
  const record = {
    type: providerConfig.className,
    name: providerConfig.formValues.common.name,
    zone_id: SELECT_OPTIONS.ZONE_DEFAULT,
  };
  const groups = { endpoints: {}, authentications: {} };

  providerConfig.tabs.forEach((tabLabel) => {
    const slug = slugify(tabLabel);
    const selections = Object.fromEntries(
      Object.entries(providerConfig.fieldSelectionValues[slug] || {}).map(
        ([id, value]) => [id, toArray(value)[0]]
      )
    );
    Object.entries({
      ...selections,
      ...(providerConfig.formValues[slug] || {}),
    }).forEach(([id, value]) => {
      const [head, role, key] = id.split('.');
      if (groups[head] && key) {
        const bucket = groups[head];
        bucket[role] = {
          ...(bucket[role] || {
            [head === 'endpoints' ? 'role' : 'authtype']: role,
          }),
          [key]: value,
        };
      } else {
        record[id] = value;
      }
    });
  });

  return {
    ...record,
    endpoints: Object.values(groups.endpoints),
    authentications: Object.values(groups.authentications),
  };
};

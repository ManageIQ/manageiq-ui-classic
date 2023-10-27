import { componentTypes } from '@@ddf';

const fieldLabels = {
  userid: __('Username'),
  password: __('Password'),
  auth_key: __('Private key'),
  auth_key_password: __('Private key passphrase'),
};

const createSchema = (credentials, credentialReferences, payloadCredentials, workflowAuthentications, setState) => {
  // Saves a new credential mapping to 'credentials'
  const mapCredentials = () => setState((state) => {
    if (state.workflowCredentials && state.credentialField) {
      return ({
        ...state,
        credentials: {
          ...credentials,
          [state.credentialReferences]: {
            credential_ref: state.workflowCredentials,
            credential_field: state.credentialField,
          },
        },
      });
    }
    return ({ ...state });
  });

  // Deletes an existing credential mapping from 'credentials'
  const deleteMapping = (selectedRow, cellType, formOptions) => {
    if (cellType === 'buttonCallback' && credentials[selectedRow.cells[0].value]) {
      // This is creating a new credentials object without the mapping we're trying to delete
      // eslint-disable-next-line no-unused-vars
      const { [selectedRow.cells[0].value]: _, ...newCredentials } = credentials;
      setState((state) => ({
        ...state,
        credentials: newCredentials,
      }));

      formOptions.change('credential_references', '');
      setState((state) => ({
        ...state,
        credentialReferences: undefined,
      }));
    }
  };

  // Creates the rows for the 'credential-mapper' component
  const createRows = (credentials, payloadCredentials, workflowAuthentications) => {
    const rows = [];

    Object.keys(payloadCredentials).forEach((value, index) => {
      rows.push({
        id: index.toString(),
        CredentialsIdentifier: { text: value },
        CredentialRecord: {
          text: credentials[value] ? workflowAuthentications.find((item) => item.value === credentials[value].credential_ref).label : '',
        },
        CredentialField: { text: credentials[value] ? fieldLabels[credentials[value].credential_field] : '' },
        Delete: {
          is_button: true,
          text: __('Delete'),
          kind: 'danger',
          size: 'md',
          callback: 'deleteMapping',
        },
      });
    });

    return rows;
  };

  return ({
    fields: [
      {
        component: 'credential-mapper',
        name: 'credential-mapping-table',
        id: 'credential-mapping-table',
        rows: createRows(credentials, payloadCredentials, workflowAuthentications),
        onCellClick: deleteMapping,
      },
      {
        component: componentTypes.SELECT,
        name: 'credential_references',
        id: 'credential_references',
        label: __('Credential Reference'),
        placeholder: __('<Choose>'),
        includeEmpty: true,
        options: Object.keys(payloadCredentials).map((key) => ({
          value: key,
          label: key,
        })),
        resolveProps: (props, { meta, input }, formOptions) => {
          // This ensures credentialReferences is set back to undefined when credential_references is reset to default
          if (meta.pristine && credentialReferences !== undefined) {
            setState((state) => ({
              ...state,
              credentialReferences: undefined,
            }));
          }

          /*
            Anytime the user selects a credential reference to map check to see if it's already mapped.
            If it is, then update 'workflow_credentials' and 'credential_field' to display this mapping.
            Otherwise reset them to empty.
          */
          if (credentials[input.value] && credentialReferences !== input.value) {
            formOptions.change('workflow_credentials', credentials[input.value].credential_ref);
            formOptions.change('credential_field', credentials[input.value].credential_field);
            setState((state) => ({
              ...state,
              workflowCredentials: credentials[input.value].credential_ref,
              credentialField: credentials[input.value].credential_field,
            }));
          } else if (credentialReferences !== (input.value || undefined)) {
            formOptions.change('workflow_credentials', '');
            formOptions.change('credential_field', '');
            setState((state) => ({
              ...state,
              workflowCredentials: '',
              credentialField: '',
            }));
          }
        },
        onChange: (value) => setState((state) => ({
          ...state,
          credentialReferences: value,
        })),
      },
      {
        component: componentTypes.SUB_FORM,
        name: 'workflow_credentials_section',
        id: 'workflow_credentials_section',
        condition: { when: 'credential_references', isNotEmpty: true },
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'workflow_credentials',
            id: 'workflow_credentials',
            label: __('Workflow Credential'),
            placeholder: __('<Choose>'),
            includeEmpty: true,
            options: workflowAuthentications,
            onChange: (value) => {
              setState((state) => ({ ...state, workflowCredentials: value }));
              mapCredentials();
            },
          },
          {
            component: componentTypes.SELECT,
            name: 'credential_field',
            id: 'credential_field',
            label: __('Credential Field'),
            placeholder: __('<Choose>'),
            includeEmpty: true,
            options: [
              { label: __('Username'), value: 'userid' },
              { label: __('Password'), value: 'password' },
              { label: __('Private key'), value: 'auth_key' },
              { label: __('Private key passphrase'), value: 'auth_key_password' },
            ],
            onChange: (value) => {
              setState((state) => ({ ...state, credentialField: value }));
              mapCredentials();
            },
          },
        ],
      },
    ],
  });
};

export default createSchema;

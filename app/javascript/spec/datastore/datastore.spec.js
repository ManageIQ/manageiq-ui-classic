import { render, screen } from '@testing-library/react';

import Datastore from '../../components/data-tables/datastore';
import { renderWithRedux } from '../helpers/mountForm';

const DATASTORE_TYPES = {
  list: 'ns_list',
  details: 'ns_details',
  instances: 'class_instances',
  methods: 'class_methods',
  domain: 'domain_overrides',
  schema: 'class_fields',
  fields: 'instant_fields',
};

const schemaRow = {
  id: '0',
  field_id: 7,
  clickable: false,
  aetype: 'attribute',
  datatype: 'string',
  display_name: 'Var One',
  substitute: true,
  cells: [
    { text: 'Var One (ae_var1)', icon: [] },
    { text: 'a description' },
    { text: 'Wilma' },
    { text: '' },
    { text: 'create' },
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' },
    { text: '' },
  ],
};

describe('Datastore (class_fields schema)', () => {
  it('should match snapshot in read-only mode', () => {
    const { container } = render(
      <Datastore
        type={DATASTORE_TYPES.schema}
        initialData={[schemaRow]}
        datastoreTypes={DATASTORE_TYPES}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot in edit mode', () => {
    const { container } = renderWithRedux(
      <Datastore
        type={DATASTORE_TYPES.schema}
        initialData={[schemaRow]}
        datastoreTypes={DATASTORE_TYPES}
        isEdit
        editProps={{ aeClassId: 1, aeTypeOptions: [], dTypeOptions: [] }}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders the read-only schema table without edit controls', () => {
    render(
      <Datastore
        type={DATASTORE_TYPES.schema}
        initialData={[schemaRow]}
        datastoreTypes={DATASTORE_TYPES}
      />
    );

    expect(screen.getByText('Var One (ae_var1)')).toBeInTheDocument();
    expect(screen.getByText('Wilma')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add a field/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /^edit$/i })).not.toBeInTheDocument();
  });

  it('renders the schema editor in edit mode', () => {
    renderWithRedux(
      <Datastore
        type={DATASTORE_TYPES.schema}
        initialData={[schemaRow]}
        datastoreTypes={DATASTORE_TYPES}
        isEdit
        editProps={{ aeClassId: 1, aeTypeOptions: [], dTypeOptions: [] }}
      />
    );

    expect(screen.getByRole('button', { name: /add a field/i })).toBeInTheDocument();
    expect(screen.getByText('Var One (ae_var1)')).toBeInTheDocument();
  });
});

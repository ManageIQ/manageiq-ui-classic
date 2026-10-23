import isEqual from 'lodash/isEqual';
import { componentTypes } from '@@ddf';
import { schemaHeaders } from '../helper';

// Compares rows by content. An empty list and no value count as equal.
const sameRows = (a, b) => isEqual(a || [], b || []);

const createSchemaEditSchema = (rows, setState, isSchemaModified, onFieldDelete) => {
  const handleAddField = () => {
    setState((prev) => ({
      ...prev,
      selectedRowId: undefined,
      isModalOpen: true,
      formKey: !prev.formKey,
    }));
  };

  return {
    fields: [
      {
        component: componentTypes.SUB_FORM,
        name: 'schema_editor_section',
        id: 'schema_editor_section',
        key: isSchemaModified,
        fields: [
          {
            component: 'schema-table',
            name: 'schema-table',
            id: 'schema-table',
            // Keeps Save and Reset disabled until the rows change.
            FieldProps: { isEqual: sameRows },
            rows,
            headers: schemaHeaders(true),
            onCellClick: (selectedRow) => {
              switch (selectedRow.callbackAction) {
                case 'editClassField':
                  setState((prev) => ({
                    ...prev,
                    selectedRowId: rows.findIndex((row) => row.id === selectedRow.id),
                    isModalOpen: true,
                    formKey: !prev.formKey,
                  }));
                  break;
                case 'deleteClassField':
                  onFieldDelete(selectedRow.id);
                  break;
                default:
                  break;
              }
            },
            onButtonClick: handleAddField,
          },
        ],
      },
    ],
  };
};
export default createSchemaEditSchema;

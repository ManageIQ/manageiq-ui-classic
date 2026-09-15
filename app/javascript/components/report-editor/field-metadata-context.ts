import { createContext, useContext } from 'react';
import type { FieldMetadataContextValue } from './report-editor-types';

/**
 * Holds ephemeral field-lookup data that should NOT live in DDF form state:
 *   - availableFields: [[label, fieldId], ...]  (for the current model)
 *   - fieldMetadata:   { fieldId: { numeric, data_type, format_sub_type,
 *                                   available_formats, break_suffixes, units } }
 *
 * Seeded from the server's react_form_data response on load.
 * Updated by FieldPicker whenever the user changes the model.
 */
export const FieldMetadataContext = createContext<FieldMetadataContextValue>({
  availableFields: [],
  fieldMetadata: {},
  setFieldData: () => {},
});

export const useFieldMetadata = (): FieldMetadataContextValue => useContext(FieldMetadataContext);

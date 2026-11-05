import { createContext, useContext } from 'react';
import type { FieldMetadataContextValue } from './report-editor-types';

// Ephemeral field-lookup data that should not live in DDF form state.
// Seeded from form_data on load; updated by FieldPicker when the model changes.
export const FieldMetadataContext = createContext<FieldMetadataContextValue>({
  availableFields: [],
  fieldMetadata: {},
  setFieldData: () => {},
});

export const useFieldMetadata = (): FieldMetadataContextValue => useContext(FieldMetadataContext);

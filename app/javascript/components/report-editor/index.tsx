import {
  useState, useEffect, useRef, useMemo, useCallback,
} from 'react';
import { Loading, InlineNotification } from '@carbon/react';
import MiqFormRenderer, { FormSpy } from '@@ddf';
import defaultComponentMapper from '../../forms/mappers/componentMapper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import createSchema from './report-editor.schema';
import FieldPicker from './field-picker';
import ColumnFormattingTable from './column-formatting-table';
import FilterTab from './tabs/filter-tab';
import SummaryTab from './tabs/summary-tab';
import ChartsTab from './tabs/charts-tab';
import StylingTab from './tabs/styling-tab';
import PreviewTab from './tabs/preview-tab';
import TrendColumnsTab from './tabs/trend-columns-tab';
import { FieldMetadataContext } from './field-metadata-context';
import { modelToReportType } from './utils';
import { buildInitialValues, buildReportData } from './report-form-values';
import { validateReportForm } from './validation';
import type {
  FormData,
  FieldMetadataContextValue,
  AvailableField,
  FieldMetadata,
  ReportFormValues,
  ReportType,
} from './report-editor-types';

const componentMapper = {
  ...defaultComponentMapper,
  'report-field-picker': FieldPicker,
  'report-column-formatting-table': ColumnFormattingTable,
  'report-filter-tab': FilterTab,
  'report-summary-tab': SummaryTab,
  'report-charts-tab': ChartsTab,
  'report-styling-tab': StylingTab,
  'report-preview-tab': PreviewTab,
  'report-trend-columns-tab': TrendColumnsTab,
};

const REDIRECT_URL = '/report/explorer';

type ReportEditorProps = {
  recordId?: string | number;
  copyFrom?: string | number | null;
};

type EditorState = {
  isLoading: boolean;
  formData: FormData | null;
  loadError: string | null;
};

type FieldMetadataState = {
  availableFields: AvailableField[];
  fieldMetadata: FieldMetadata;
};

// The tab set depends on the report type, which is derived from the selected model.
const ReportEditor = ({ recordId = 'new', copyFrom = null }: ReportEditorProps) => {
  const [{ isLoading, formData, loadError }, setState] = useState<EditorState>({
    isLoading: true,
    formData: null,
    loadError: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [showResetNotice, setShowResetNotice] = useState(false);
  // Bumped on reset to remount the form: the expression editors copy their value into local state on mount.
  const [resetCount, setResetCount] = useState(0);
  const [reportType, setReportType] = useState<ReportType>('standard');

  const [fieldMetadataState, setFieldMetadataState] = useState<FieldMetadataState>({
    availableFields: [],
    fieldMetadata: {},
  });

  // A ref (not state): only compared, never rendered.
  const prevModelRef = useRef<string | null>(null);
  const isNew = !recordId || recordId === 'new';

  useEffect(() => {
    let url = isNew ? '/report/form_data/new' : `/report/form_data/${recordId}`;
    if (isNew && copyFrom) {
      url += `?copy_from=${encodeURIComponent(String(copyFrom))}`;
    }

    http.get<FormData>(url)
      .then((data) => {
        setState({ isLoading: false, formData: data, loadError: null });
        setReportType(data.report_type || 'standard');
        prevModelRef.current = (data.report || {}).model || '';
        setFieldMetadataState({
          availableFields: [],
          fieldMetadata: data.field_metadata || {},
        });
      })
      .catch(() => {
        setState({
          isLoading: false,
          formData: null,
          loadError: __('Failed to load report data. Please try again.'),
        });
      });
  }, [recordId, copyFrom, isNew]);

  const setFieldData = useCallback(({ availableFields, fieldMetadata }: FieldMetadataState) => {
    setFieldMetadataState({ availableFields, fieldMetadata });
  }, []);

  const fieldMetadataContextValue = useMemo<FieldMetadataContextValue>(
    () => ({ ...fieldMetadataState, setFieldData }),
    [fieldMetadataState, setFieldData],
  );

  const initialValues = useMemo<ReportFormValues>(
    () => (formData ? buildInitialValues(formData) : {}),
    [formData],
  );

  // Runs on every form change. Only a different model matters: it can switch the report
  // type and with it the tab set (see modelToReportType, which mirrors the server rule).
  const handleFormChange = ({ values }: { values: ReportFormValues }) => {
    const model = values.model ?? '';
    if (model !== prevModelRef.current) {
      prevModelRef.current = model;
      const next = modelToReportType(model || null);
      setReportType(next);
    }
  };

  const onSubmit = (values: ReportFormValues) => {
    if (isSubmitting) {
      return;
    }
    setFlashError(null);
    setShowResetNotice(false);
    setIsSubmitting(true);

    const reportData = buildReportData(values, fieldMetadataState.fieldMetadata);

    const url = isNew ? '/report/save/new' : `/report/save/${recordId}`;
    http.post<{ success: boolean; message?: string }>(url, { report_data: reportData })
      .then((response) => {
        if (response.success) {
          const message = response.message || __('Report was saved');
          miqRedirectBack(message, 'success', REDIRECT_URL);
        } else {
          setIsSubmitting(false);
          setFlashError(response.message || __('An error occurred while saving'));
        }
      })
      .catch((error: { data?: { message?: string }; message?: string }) => {
        setIsSubmitting(false);
        setFlashError(error.data?.message || error.message || __('An error occurred while saving'));
      });
  };

  const onReset = () => {
    setFlashError(null);
    setShowResetNotice(true);
    setResetCount((count) => count + 1);
  };

  const onCancel = () => {
    const message = isNew
      ? __('Add of new Report was cancelled by the user')
      : sprintf(__('Edit of Report "%s" was cancelled by the user'), formData?.report?.name || '');
    miqRedirectBack(message, 'warning', REDIRECT_URL);
  };

  // Editing: nothing to save until something changed. Adding/copying: a prefilled form can be saved as is.
  let disableSubmit = isNew ? ['invalid'] : ['pristine', 'invalid'];
  if (isSubmitting) {
    disableSubmit = ['submitting'];
  }

  if (isLoading) {
    return <Loading active withOverlay={false} />;
  }

  if (!formData) {
    return (
      <InlineNotification
        kind="error"
        role="alert"
        title={loadError || __('Failed to load report data. Please try again.')}
        lowContrast
        hideCloseButton
      />
    );
  }

  return (
    <FieldMetadataContext.Provider value={fieldMetadataContextValue}>
      <div className="report-editor">
        {formData.unavailable_fields_warning && (
          <InlineNotification
            kind="warning"
            role="status"
            title={formData.unavailable_fields_warning}
            lowContrast
            hideCloseButton
          />
        )}
        {flashError && (
          <InlineNotification
            kind="error"
            role="alert"
            title={flashError}
            lowContrast
            onCloseButtonClick={() => setFlashError(null)}
          />
        )}
        {showResetNotice && (
          <InlineNotification
            kind="warning"
            role="status"
            title={__('All changes have been reset')}
            lowContrast
            onCloseButtonClick={() => setShowResetNotice(false)}
          />
        )}
        <MiqFormRenderer
          key={resetCount}
          componentMapper={componentMapper}
          schema={createSchema({ ...formData, report_type: reportType })}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onReset={onReset}
          validate={validateReportForm}
          disableSubmit={disableSubmit}
          canReset={!isNew}
          buttonsLabels={{ submitLabel: isNew ? __('Add') : __('Save') }}
        >
          <FormSpy subscription={{ values: true }} onChange={handleFormChange as Parameters<typeof FormSpy>[0]['onChange']} />
        </MiqFormRenderer>
      </div>
    </FieldMetadataContext.Provider>
  );
};

export default ReportEditor;

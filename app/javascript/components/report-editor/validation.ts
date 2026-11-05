import type { ReportFormValues } from './report-editor-types';
import { modelToReportType, NOTHING } from './utils';

export const MAX_COLUMNS = 100;
export const WARN_COLUMNS = 80;

export const validateReportForm = (values: ReportFormValues): Record<string, string> => {
  const errors: Record<string, string> = {};

  const name = typeof values.name === 'string' ? values.name.trim() : '';
  if (!name) {
    errors.name = __('Required');
  } else if (name.length > 40) {
    errors.name = sprintf(__('Menu name cannot exceed %s characters'), 40);
  }

  const title = typeof values.title === 'string' ? values.title.trim() : '';
  if (!title) {
    errors.title = __('Required');
  } else if (title.length > 60) {
    errors.title = sprintf(__('Title cannot exceed %s characters'), 60);
  }

  const model = values.model || '';

  if (!model) {
    errors.model = __('Required');
  }

  const reportType = modelToReportType(model || null);

  if (reportType === 'trend') {
    if (!values.trend_col) {
      errors.trend_col = __('Trending for is required');
    }
    const limitCol = values.trend_limit_col;
    const limitVal = values.trend_limit_val;
    const limitValStr = limitVal != null ? String(limitVal).trim() : '';

    if (!limitCol && !limitValStr) {
      errors.trend_limit_val = __('Trend Target Limit must be configured');
    } else if (limitValStr && Number.isNaN(Number(limitValStr))) {
      errors.trend_limit_val = __('Trend Target Limit must be numeric');
    }
  } else {
    const colOrder = values.col_order || [];
    if (!Array.isArray(colOrder) || colOrder.length === 0) {
      errors.col_order = __('At least one field must be selected');
    } else if (colOrder.length > MAX_COLUMNS) {
      errors.col_order = sprintf(__('Maximum %s columns allowed'), MAX_COLUMNS);
    }
  }

  if (reportType === 'chargeback') {
    const showTyp = values.cb_show_typ;
    if (!showTyp) {
      errors.cb_show_typ = __('Show Costs by must be selected');
    } else if (showTyp === 'owner') {
      if (!values.cb_owner_id) {
        errors.cb_owner_id = __('An Owner must be selected');
      }
    } else if (showTyp === 'tenant') {
      if (!values.cb_tenant_id) {
        errors.cb_tenant_id = __('A Tenant Category must be selected');
      }
    } else if (showTyp === 'tag') {
      if (!values.cb_tag_cat) {
        errors.cb_tag_cat = __('A Tag Category must be selected');
      } else {
        const tagVals = values.cb_tag_value;
        let tagCount = 0;
        if (Array.isArray(tagVals)) {
          tagCount = tagVals.length;
        } else if (tagVals) {
          tagCount = 1;
        }
        if (tagCount === 0) {
          errors.cb_tag_value = __('A Tag must be selected');
        }
      }
    } else if (showTyp === 'entity') {
      if (!values.cb_provider_id) {
        errors.cb_provider_id = __('A Provider must be selected');
      } else if (!values.cb_entity_id) {
        errors.cb_entity_id = __('A specific Entity or all must be selected');
      }
    }

    if (values.cb_groupby === 'tag') {
      const groupTags = values.cb_groupby_tag;
      let groupTagCount = 0;
      if (Array.isArray(groupTags)) {
        groupTagCount = groupTags.length;
      } else if (groupTags) {
        groupTagCount = 1;
      }
      if (groupTagCount === 0) {
        errors.cb_groupby_tag = __('A Group by Tag must be selected');
      }
    } else if (values.cb_groupby === 'label') {
      if (!values.cb_groupby_label) {
        errors.cb_groupby_label = __('A Group by Label must be selected');
      } else {
        const colOrder = values.col_order || [];
        const hasCustomAttr = colOrder.some((col) => col.includes('custom_attributes') || col.includes('managed_'));
        if (hasCustomAttr) {
          errors.cb_groupby_label = __('Can not add label columns when grouping by label');
        }
      }
    }
  }

  if (values.graph_type) {
    const primarySort = (values.sortby || [])[0];
    if (!primarySort || primarySort === NOTHING || primarySort === '') {
      errors.graph_type = __('A sort field is required when a chart type is configured');
    }
    if (values.graph_mode === 'values' && !values.graph_column) {
      errors.graph_column = __('Data column must be selected when chart mode is set to "Values"');
    }
  }

  return errors;
};

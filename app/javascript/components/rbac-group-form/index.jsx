import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loading, InlineNotification } from '@carbon/react';
import MiqFormRenderer from '@@ddf';
import { API, http } from '../../http_api';
import mapper from '../../forms/mappers/componentMapper';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import createSchema from './rbac-group-form.schema';
import FilterTabs from './filter-tabs';

const componentMapper = { ...mapper, 'filter-tabs': FilterTabs };

const buildManagedFilters = (flatPaths) => {
  const byCategory = {};
  flatPaths.forEach((p) => {
    const cat = p.split('/')[2];
    if (cat) {
      (byCategory[cat] = byCategory[cat] || []).push(p);
    }
  });
  return Object.values(byCategory);
};

// Convert assigned tags (from TaggingEditor) back to tag paths (/managed/category/value)
const assignedTagsToPaths = (assignedTags) => {
  const paths = [];
  assignedTags.forEach((tag) => {
    (tag.values || []).forEach((value) => {
      paths.push(`/managed/${tag.id}/${value.id}`);
    });
  });
  return paths;
};

// Remove tag paths from managed filters, returning only non-tag managed filters
const removeTagPathsFromManaged = (managedFilters) => {
  const allFilters = managedFilters.flat();
  return allFilters.filter((f) => !f.startsWith('/managed/'));
};

const RbacGroupForm = ({
  groupId = undefined,
  readOnly = false,
  currentTenantName = undefined,
  superAdminUser = false,
}) => {
  const isNew = !groupId || groupId === 'new';

  const [state, setState] = useState({
    isLoading: true,
    isSubmitting: false,
    flashError: null,
    resetNotice: false,
    initialValues: {},
    roles: [],
    tenants: [],
    treeData: null,
    deletedBelongstoFilters: [],
  });

  const {
    isLoading,
    isSubmitting,
    flashError,
    resetNotice,
    initialValues,
    roles,
    tenants,
    treeData,
    deletedBelongstoFilters,
  } = state;

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const groupUrl = isNew
      ? null
      : `/api/groups/${groupId}?attributes=entitlement,miq_user_role,tenant`;
    const rolesUrl = '/api/roles?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending';
    const tenantsUrl = '/api/tenants?expand=resources&attributes=id,name,divisible,ancestry&sort_by=name&sort_order=ascending';
    const formDataUrl = `/ops/group_form_data/${groupId || 'new'}${readOnly ? '?read_only=true' : ''}`;

    const promises = [
      API.get(rolesUrl),
      API.get(tenantsUrl),
      http.get(formDataUrl),
    ];
    if (groupUrl) {
      promises.unshift(API.get(groupUrl));
    }

    Promise.all(promises)
      .then((results) => {
        let groupData = null;
        let rolesData;
        let tenantsData;
        let formData;

        if (groupUrl) {
          [groupData, rolesData, tenantsData, formData] = results;
        } else {
          [rolesData, tenantsData, formData] = results;
        }

        const roleOptions = (rolesData.resources || []).map((r) => ({
          label: r.name,
          value: String(r.id),
        }));

        // Build the full ancestry path (e.g. "My Company/Tenant/Project") and group into Projects and Tenants
        const tenantResources = tenantsData.resources || [];
        const tenantNamesById = tenantResources.reduce((acc, t) => ({ ...acc, [t.id]: t.name }), {});
        const toOption = (t) => ({
          label: [...(t.ancestry ? t.ancestry.split('/') : []), t.id]
            .map((id) => tenantNamesById[id])
            .filter(Boolean)
            .join('/'),
          value: String(t.id),
        });
        const sortedOptions = (divisible) => tenantResources
          .filter((t) => !!t.divisible === divisible)
          .map(toOption)
          .sort((a, b) => a.label.localeCompare(b.label));
        const projectOptions = sortedOptions(false);
        const divisibleTenantOptions = sortedOptions(true);
        const tenantOptions = [
          ...(projectOptions.length ? [{ label: __('Projects'), options: projectOptions }] : []),
          ...(divisibleTenantOptions.length ? [{ label: __('Tenants'), options: divisibleTenantOptions }] : []),
        ];

        let calculatedInitialValues = {};
        if (groupData) {
          const ent = groupData.entitlement || {};
          const filters = ent.filters || {};
          const hasExpression = ent.filter_expression !== null && ent.filter_expression !== undefined;
          const flatManaged = (filters.managed || []).flat();

          const resolvedExpression = hasExpression
            ? ent.filter_expression.exp || ent.filter_expression
            : null;

          const hacPathMap = formData.hac_paths || {};
          const vatPathMap = formData.vat_paths || {};
          const currentBelongsto = filters.belongsto || [];

          const matchesAnyBelongsto = (path) => currentBelongsto.some(
            (saved) => path === saved || path.startsWith(`${saved}/`)
          );

          const belongstoChecked = [...new Set([
            ...Object.entries(hacPathMap)
              .filter(([, path]) => matchesAnyBelongsto(path))
              .map(([key]) => key),
            ...Object.entries(vatPathMap)
              .filter(([, path]) => matchesAnyBelongsto(path))
              .map(([key]) => key),
          ])];

          const roleId = groupData.miq_user_role
            ? String(groupData.miq_user_role.id)
            : String(ent.miq_user_role_id || '');
          const tenantId = groupData.tenant
            ? String(groupData.tenant.id)
            : String(groupData.tenant_id || '');

          calculatedInitialValues = {
            description: groupData.description || '',
            detailed_description: groupData.detailed_description || '',
            role_id: roleId,
            tenant_id: tenantId,
            filters: {
              useFilterExpression: hasExpression,
              filterExpression: resolvedExpression,
              managedFilters: flatManaged,
              assignedTags: formData.tags?.assignedTags || [],
              belongstoChecked,
            },
          };
        } else {
          calculatedInitialValues = {
            description: '',
            detailed_description: '',
            filters: {
              useFilterExpression: false,
              filterExpression: null,
              managedFilters: [],
              assignedTags: [],
              belongstoChecked: [],
            },
          };
        }

        setState((prev) => ({
          ...prev,
          roles: roleOptions,
          tenants: tenantOptions,
          treeData: formData,
          initialValues: calculatedInitialValues,
          deletedBelongstoFilters: formData.deleted_belongsto_filters || [],
          isLoading: false,
        }));
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          flashError: String(err?.data?.message || err?.message || err),
          isLoading: false,
        }));
      });
  // readOnly is included so switching between view/edit mode (same groupId) re-fetches form data.
  }, [groupId, readOnly]);

  const onSubmit = (values) => {
    if (isSubmitting) {
      return;
    }
    setState((prev) => ({ ...prev, isSubmitting: true, flashError: null }));

    const {
      useFilterExpression,
      filterExpression,
      expressionHasErrors = false,
      managedFilters = [],
      assignedTags = [],
      belongstoChecked = [],
    } = values.filters || {};

    if (expressionHasErrors) {
      setState((prev) => ({ ...prev, isSubmitting: false }));
      return;
    }

    const hacPaths = treeData?.hac_paths || {};
    const vatPaths = treeData?.vat_paths || {};
    // Map each checked key through its own path map.
    const belongsto = [...new Set([
      ...belongstoChecked.map((k) => hacPaths[k] || vatPaths[k]),
    ].filter(Boolean))];

    const resource = {
      description: values.description,
      detailed_description: values.detailed_description || null,
      role: { href: `${window.location.origin}/api/roles/${values.role_id}` },
      tenant: { href: `${window.location.origin}/api/tenants/${values.tenant_id}` },
    };

    if (useFilterExpression) {
      // filterExpression is stored as raw RQB query — convert to MIQ format now
      const miqExpression = filterExpression ? rqbToMiq(filterExpression) : null;
      resource.filter_expression = miqExpression ? { exp: miqExpression } : null;
      resource.filters = belongsto.length > 0 ? { belongsto, managed: [] } : {};
    } else {
      resource.filter_expression = null;
      const tagPaths = assignedTagsToPaths(assignedTags);
      const otherManaged = removeTagPathsFromManaged(managedFilters);
      const managed = buildManagedFilters([...otherManaged, ...tagPaths]);
      resource.filters = (belongsto.length > 0 || managed.length > 0)
        ? { belongsto, managed }
        : {};
    }

    const apiCall = isNew
      ? API.post('/api/groups', resource)
      : API.post(`/api/groups/${groupId}`, { action: 'edit', resource });

    apiCall
      .then(() => {
        const msg = isNew
          ? sprintf(__('Group "%s" was added'), values.description)
          : sprintf(__('Group "%s" was saved'), values.description);
        miqRedirectBack(msg, 'success', '/ops/explorer');
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          flashError: err?.data?.error?.message || err?.data?.message || String(err),
        }));
      });
  };

  const onReset = () => {
    setState((prev) => ({ ...prev, flashError: null, resetNotice: true }));
  };

  const onCancel = () => {
    const msg = isNew
      ? __('Add of new Group was cancelled by the user')
      : sprintf(__('Edit of Group "%s" was cancelled by the user'), initialValues.description);
    miqRedirectBack(msg, 'warning', '/ops/explorer');
  };

  if (isLoading) {
    return <Loading active small withOverlay={false} />;
  }

  return (
    <div className="rbac-group-form">
      {(deletedBelongstoFilters.length > 0) && (
        <InlineNotification
          kind="warning"
          title={__(
            'These outdated filters need review as it affects their visibility.'
            + ' We suggest editing and saving the group to delete these outdated filters.'
          )}
          hideCloseButton
          lowContrast
        >
          <ul className="rbac-group-form__deleted-filters">
            <li>
              <strong>{__('Clusters, Datastores, Hosts, Managers & Providers')}</strong>
              <ul>
                {deletedBelongstoFilters.map((filter) => (
                  <li key={filter}><strong>{filter}</strong></li>
                ))}
              </ul>
            </li>
          </ul>
        </InlineNotification>
      )}
      {resetNotice && (
        <InlineNotification
          kind="warning"
          title={__('All changes have been reset')}
          onCloseButtonClick={() => setState((prev) => ({ ...prev, resetNotice: false }))}
          lowContrast
        />
      )}
      {flashError && (
        <InlineNotification
          kind="error"
          title={flashError}
          onCloseButtonClick={() => setState((prev) => ({ ...prev, flashError: null }))}
          lowContrast
        />
      )}

      <MiqFormRenderer
        componentMapper={componentMapper}
        schema={createSchema({
          roles,
          tenants,
          readOnly,
          currentTenantName,
          tags: treeData?.tags || { tags: [], assignedTags: [], affectedItems: [] },
          hacTree: treeData?.hac_tree,
          vatTree: treeData?.vat_tree,
          hacPaths: treeData?.hac_paths,
          vatPaths: treeData?.vat_paths,
          superAdminUser,
        })}
        initialValues={initialValues}
        onSubmit={readOnly ? undefined : onSubmit}
        onCancel={readOnly ? undefined : onCancel}
        onReset={onReset}
        canReset={!isNew && !readOnly}
        disableSubmit={isSubmitting ? ['submitting'] : ['pristine', 'invalid']}
        buttonsLabels={{ submitLabel: isNew ? __('Add') : __('Save') }}
        showFormControls={!readOnly}
      />
    </div>
  );
};

RbacGroupForm.propTypes = {
  groupId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  readOnly: PropTypes.bool,
  currentTenantName: PropTypes.string,
  superAdminUser: PropTypes.bool,
};

export default RbacGroupForm;

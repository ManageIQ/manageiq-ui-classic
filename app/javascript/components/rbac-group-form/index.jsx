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
  groupId,
  readOnly,
  currentTenantName,
  superAdminUser,
  deletedBelongstoFilters = [],
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
  } = state;

  useEffect(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const groupUrl = isNew
      ? null
      : `/api/groups/${groupId}?attributes=entitlement,miq_user_role,tenant`;
    const rolesUrl = '/api/roles?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending';
    const tenantsUrl = '/api/tenants?expand=resources&attributes=id,name,divisible&sort_by=name&sort_order=ascending';
    const formDataUrl = `/ops/group_form_data/${groupId || 'new'}`;

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

        const tenantOptions = (tenantsData.resources || []).map((t) => ({
          label: `${t.divisible ? '[T]' : '[P]'} ${t.name}`,
          value: String(t.id),
        }));

        let calculatedInitialValues = {};
        if (groupData) {
          const ent = groupData.entitlement || {};
          const filters = ent.filters || {};
          const hasExpression = ent.filter_expression !== null && ent.filter_expression !== undefined;
          const flatManaged = (filters.managed || []).flat();

          const resolvedExpression = hasExpression
            ? ent.filter_expression.exp || ent.filter_expression
            : null;

          // Pre-populate checked trees from belongsto paths via pathMap
          const allPaths = formData.hac_paths || {};
          const vatPaths = formData.vat_paths || {};
          const currentBelongsto = filters.belongsto || [];

          const hacKeys = Object.entries(allPaths)
            .filter(([, path]) => currentBelongsto.includes(path))
            .map(([key]) => key);
          const vatKeys = Object.entries(vatPaths)
            .filter(([, path]) => currentBelongsto.includes(path))
            .map(([key]) => key);

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
              hacChecked: hacKeys,
              vatChecked: vatKeys,
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
              hacChecked: [],
              vatChecked: [],
            },
          };
        }

        setState((prev) => ({
          ...prev,
          roles: roleOptions,
          tenants: tenantOptions,
          treeData: formData,
          initialValues: calculatedInitialValues,
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
  }, [groupId, readOnly]);

  const onSubmit = (values) => {
    if (isSubmitting) {
      return;
    }
    setState((prev) => ({ ...prev, isSubmitting: true, flashError: null }));

    const {
      useFilterExpression,
      filterExpression,
      managedFilters = [],
      assignedTags = [],
      hacChecked = [],
      vatChecked = [],
    } = values.filters || {};

    const allPaths = { ...(treeData?.hac_paths || {}), ...(treeData?.vat_paths || {}) };
    const belongsto = [...hacChecked, ...vatChecked]
      .map((k) => allPaths[k])
      .filter(Boolean);

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
      if (belongsto.length > 0 || managed.length > 0) {
        resource.filters = { belongsto, managed };
      }
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

  const canLookupLdap = treeData?.can_lookup_ldap || false;
  const authModeName = treeData?.auth_mode_name || '';

  return (
    <div className="rbac-group-form">
      {(deletedBelongstoFilters.length > 0) && (
        <InlineNotification
          kind="warning"
          title={__(
            'These outdated filters need review as it affects their visibility.'
            + ' We suggest editing and saving the group to delete these outdated filters.'
          )}
          subtitle={deletedBelongstoFilters.join(', ')}
          hideCloseButton
        />
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
          canLookupLdap,
          authModeName,
          readOnly,
          currentTenantName,
          tags: treeData?.tags || { tags: [], assignedTags: [], affectedItems: [] },
          hacTree: treeData?.hac_tree,
          vatTree: treeData?.vat_tree,
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
  deletedBelongstoFilters: PropTypes.arrayOf(PropTypes.string),
};

export default RbacGroupForm;

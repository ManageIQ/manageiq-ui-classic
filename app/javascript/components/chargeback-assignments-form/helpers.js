export const deduplicateBy = (items, getKey) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const normalizeAssignments = (nextAssignments = {}) => Object.entries(nextAssignments).reduce((acc, [key, value]) => ({
  ...acc,
  [String(key)]: value ? String(value) : value,
}), {});

export const buildTenantHierarchy = (tenants) => {
  const tenantMap = {};
  const rootTenants = [];

  tenants.forEach((tenant) => {
    tenantMap[tenant.id] = { ...tenant, children: [] };
  });

  tenants.forEach((tenant) => {
    if (tenant.ancestry) {
      const ancestorIds = tenant.ancestry.split('/').filter((id) => id);
      if (ancestorIds.length === 0) {
        rootTenants.push(tenantMap[tenant.id]);
        return;
      }
      const parentId = ancestorIds[ancestorIds.length - 1];
      if (tenantMap[parentId]) {
        tenantMap[parentId].children.push(tenantMap[tenant.id]);
      } else {
        rootTenants.push(tenantMap[tenant.id]);
      }
    } else {
      rootTenants.push(tenantMap[tenant.id]);
    }
  });

  return rootTenants;
};

export const flattenTenantTree = (tenants) => {
  const flattened = [];
  const flatten = (tenant) => {
    flattened.push(tenant);
    if (tenant.children && tenant.children.length > 0) {
      tenant.children.forEach(flatten);
    }
  };
  tenants.forEach(flatten);
  return flattened;
};

export const flattenTenants = (tenantList, expandedNodes, level = 0, parentId = null) => {
  const result = [];
  tenantList.forEach((tenant) => {
    result.push({
      id: tenant.id.toString(),
      name: tenant.name,
      level,
      parentId,
      hasChildren: tenant.children && tenant.children.length > 0,
      children: tenant.children || [],
    });
    if (tenant.children && tenant.children.length > 0 && expandedNodes.has(tenant.id.toString())) {
      result.push(...flattenTenants(tenant.children, expandedNodes, level + 1, tenant.id.toString()));
    }
  });
  return result;
};

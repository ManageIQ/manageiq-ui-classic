import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Loading, Dropdown, Button, InlineNotification,
} from '@carbon/react';
import SimpleList from './simple-list';
import TenantTree from './tenant-tree';
import TagSelection from './tag-selection';
import LabelSelection from './label-selection';

const deduplicateBy = (items, getKey) => {
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

const normalizeAssignments = (nextAssignments = {}) => Object.entries(nextAssignments).reduce((acc, [key, value]) => ({
  ...acc,
  [String(key)]: value ? String(value) : value,
}), {});

const ChargebackAssignmentsForm = ({ rateType }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [assignmentType, setAssignmentType] = useState('');
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [rates, setRates] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [savedAssignmentsData, setSavedAssignmentsData] = useState([]); // Structured saved assignments for display
  const [savedAssignmentsByType, setSavedAssignmentsByType] = useState({});
  const [labelMetadata, setLabelMetadata] = useState({}); // Store container_image_id for labels
  const [enterpriseId, setEnterpriseId] = useState(null); // Store the actual enterprise ID
  const [initializedAssignmentType, setInitializedAssignmentType] = useState('');
  const [notification, setNotification] = useState(null); // { kind, title }

  // Fetch initial data and check for existing assignments
  const loadData = useCallback(async() => {
    try {
      setLoading(true);

      // Fetch rates with their assignments
      // Note: API doesn't support filter by rate_type, so we filter client-side
      const ratesResponse = await API.get(
        '/api/chargebacks?expand=resources&attributes=assigned_to'
      );
      const allRates = ratesResponse.resources || [];
      // Filter by rate_type client-side
      const ratesData = allRates.filter((rate) => rate.rate_type === rateType);

      // Transform rates for dropdown
      const rateOptions = [
        { label: __('<None>'), value: 'nil' },
        ...ratesData.map((rate) => ({
          label: rate.description,
          value: rate.id.toString(),
        })),
      ];
      setRates(rateOptions);

      // Define assignment types based on rate type
      const types = [];
      if (rateType === 'Compute') {
        types.push(
          { label: __('The Enterprise'), value: 'enterprise' },
          { label: __('Selected Providers'), value: 'ems' },
          { label: __('Selected Clusters'), value: 'ems_cluster' },
          { label: __('Tagged VMs and Instances'), value: 'vm-tags' },
          { label: __('Tagged Configured Systems'), value: 'configured_system-tags' },
          { label: __('Tagged Container Images'), value: 'container_image-tags' },
          { label: __('Labeled Container Images'), value: 'container_image-labels' },
          { label: __('Tenants'), value: 'tenant' }
        );
      } else if (rateType === 'Storage') {
        types.push(
          { label: __('The Enterprise'), value: 'enterprise' },
          { label: __('Selected Datastores'), value: 'storage' },
          { label: __('Tagged Datastores'), value: 'storage-tags' },
          { label: __('Tenants'), value: 'tenant' }
        );
      }
      setAssignmentTypes(types);

      // Check for existing assignments and auto-select assignment type
      let foundAssignmentType = null;
      const savedAssignments = {};
      const savedAssignmentsForDisplay = [];
      const savedAssignmentsByTypeData = {};
      const savedAssignmentKeys = new Set();

      const storeAssignmentForType = (type, key, value) => {
        if (!savedAssignmentsByTypeData[type]) {
          savedAssignmentsByTypeData[type] = {};
        }
        savedAssignmentsByTypeData[type][String(key)] = String(value);
      };

      ratesData.forEach((rate) => {
        if (rate.assigned_to && rate.assigned_to.length > 0) {
          rate.assigned_to.forEach((assignment) => {
            if (assignment.tag) {
              // Tag-based assignment
              const assignmentPrefix = assignment.tag.assignment_prefix;
              const currentAssignmentType = `${assignmentPrefix}-tags`;

              if (!foundAssignmentType) {
                foundAssignmentType = currentAssignmentType;
              }

              // Store structured data for display in TagSelection
              const tagId = String(assignment.tag.id || assignment.tag.href.split('/').pop());
              const savedAssignmentKey = `tag-${currentAssignmentType}-${tagId}`;

              if (!savedAssignmentKeys.has(savedAssignmentKey)) {
                savedAssignmentKeys.add(savedAssignmentKey);
                savedAssignmentsForDisplay.push({
                  type: 'tag',
                  assignmentType: currentAssignmentType,
                  id: tagId,
                  tagId,
                  tagHref: assignment.tag.href,
                  tagName: assignment.tag.name || assignment.tag.description,
                  tagDescription: assignment.tag.description,
                  tagCategory: assignment.tag.category,
                  assignmentPrefix,
                  rateId: rate.id.toString(),
                  rateDescription: rate.description,
                });
              }

              // Only store the assignment for pre-population if it matches the found type
              storeAssignmentForType(currentAssignmentType, tagId, rate.id.toString());

              if (currentAssignmentType === foundAssignmentType) {
                savedAssignments[tagId] = rate.id.toString();
              }
            } else if (assignment.resource) {
              // Resource-based assignment
              const resourceName = assignment.resource.name;
              const resourceHref = assignment.resource.href;
              const hrefParts = resourceHref.split('/');
              const resourceType = hrefParts[hrefParts.length - 2];
              const resourceId = String(hrefParts[hrefParts.length - 1]);
              const parentResourceType = hrefParts[hrefParts.length - 4];
              const parentResourceId = hrefParts[hrefParts.length - 3];

              if (resourceName === 'Enterprise') {
                if (!foundAssignmentType) {
                  foundAssignmentType = 'enterprise';
                }
                // For enterprise, use 'enterprise' as the key
                storeAssignmentForType('enterprise', 'enterprise', rate.id.toString());
                savedAssignments.enterprise = rate.id.toString();
              } else if (parentResourceType === 'container_images' && resourceType === 'custom_attributes') {
                if (!foundAssignmentType) {
                  foundAssignmentType = 'container_image-labels';
                }

                storeAssignmentForType('container_image-labels', resourceId, rate.id.toString());
                savedAssignments[resourceId] = rate.id.toString();
                setLabelMetadata((currentMetadata) => ({
                  ...currentMetadata,
                  [resourceId]: String(parentResourceId),
                }));

                const savedAssignmentKey = `label-${resourceId}`;
                if (!savedAssignmentKeys.has(savedAssignmentKey)) {
                  savedAssignmentKeys.add(savedAssignmentKey);
                  savedAssignmentsForDisplay.push({
                    type: 'label',
                    assignmentType: 'container_image-labels',
                    id: resourceId,
                    labelId: resourceId,
                    labelHref: resourceHref,
                    labelName: resourceName,
                    labelValue: assignment.resource.value,
                    containerImageId: String(parentResourceId),
                    rateId: rate.id.toString(),
                    rateDescription: rate.description,
                  });
                }
              } else {
                // Determine type from href
                // href format: /api/{resource_type}/{id}
                if (!foundAssignmentType) {
                  if (resourceType === 'clusters') {
                    foundAssignmentType = 'ems_cluster';
                  } else if (resourceType === 'providers') {
                    foundAssignmentType = 'ems';
                  } else if (resourceType === 'data_stores') {
                    foundAssignmentType = 'storage';
                  } else if (resourceType === 'tenants') {
                    foundAssignmentType = 'tenant';
                  }
                }

                // Store the assignment (can have multiple resources assigned to same or different rates)
                if (resourceType === 'clusters') {
                  storeAssignmentForType('ems_cluster', resourceId, rate.id.toString());
                } else if (resourceType === 'providers') {
                  storeAssignmentForType('ems', resourceId, rate.id.toString());
                } else if (resourceType === 'data_stores') {
                  storeAssignmentForType('storage', resourceId, rate.id.toString());
                } else if (resourceType === 'tenants') {
                  storeAssignmentForType('tenant', resourceId, rate.id.toString());
                }

                savedAssignments[resourceId] = rate.id.toString();
              }
            }
          });
        }
      });

      // Auto-select the found assignment type and pre-populate assignments
      if (foundAssignmentType) {
        setAssignmentType(foundAssignmentType);
        setInitializedAssignmentType(foundAssignmentType);
        setAssignments(normalizeAssignments(savedAssignments));
      } else {
        setInitializedAssignmentType('');
        setAssignments({});
      }

      // Store structured saved assignments for child components
      setSavedAssignmentsData(savedAssignmentsForDisplay);
      setSavedAssignmentsByType(savedAssignmentsByTypeData);

      setLoading(false);
    } catch (error) {
      const message = error.data?.error?.message || __('Failed to load chargeback data');
      setNotification({ kind: 'error', title: message });
      setLoading(false);
    }
  }, [rateType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper function to build tenant hierarchy
  const buildTenantHierarchy = (tenants) => {
    const tenantMap = {};
    const rootTenants = [];

    // First pass: create a map of all tenants
    tenants.forEach((tenant) => {
      tenantMap[tenant.id] = { ...tenant, children: [] };
    });

    // Second pass: build the hierarchy
    tenants.forEach((tenant) => {
      if (tenant.ancestry) {
        // Has a parent - find it and add as child
        const ancestorIds = tenant.ancestry.split('/').filter((id) => id);
        if (ancestorIds.length === 0) {
          rootTenants.push(tenantMap[tenant.id]);
          return;
        }
        const parentId = ancestorIds[ancestorIds.length - 1];
        if (tenantMap[parentId]) {
          tenantMap[parentId].children.push(tenantMap[tenant.id]);
        } else {
          // Parent not found, treat as root
          rootTenants.push(tenantMap[tenant.id]);
        }
      } else {
        // No ancestry means it's a root tenant
        rootTenants.push(tenantMap[tenant.id]);
      }
    });

    return rootTenants;
  };

  // Helper function to flatten tenant tree for submission
  const flattenTenantTree = (tenants) => {
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

  // Pre-populate assignments when assignment type changes
  useEffect(() => {
    if (assignmentType) {
      const savedAssignmentsForType = normalizeAssignments(savedAssignmentsByType[assignmentType] || {});
      const shouldPreloadSavedAssignments = assignmentType === initializedAssignmentType;

      setAssignments(shouldPreloadSavedAssignments ? savedAssignmentsForType : {});
    }
  }, [assignmentType, initializedAssignmentType, savedAssignmentsByType]);

  // Fetch resources when assignment type changes
  useEffect(() => {
    const fetchResources = async() => {
      if (!assignmentType || assignmentType.endsWith('-tags') || assignmentType.endsWith('-labels')) {
        setResources([]);
        setLoadingResources(false);
        return;
      }

      try {
        setLoadingResources(true);
        let endpoint = '';
        let resourceKey = '';

        switch (assignmentType) {
          case 'enterprise':
            endpoint = '/api/enterprises?expand=resources';
            resourceKey = 'resources';
            break;
          case 'ems':
            endpoint = '/api/providers?expand=resources';
            resourceKey = 'resources';
            break;
          case 'ems_cluster':
            endpoint = '/api/clusters?expand=resources';
            resourceKey = 'resources';
            break;
          case 'storage':
            endpoint = '/api/data_stores?expand=resources';
            resourceKey = 'resources';
            break;
          case 'tenant':
            endpoint = '/api/tenants?expand=resources';
            resourceKey = 'resources';
            break;
          default:
            setResources([]);
            setLoadingResources(false);
            return;
        }

        const response = await API.get(endpoint);
        let resourcesData = deduplicateBy(response[resourceKey] || [], (resource) => String(resource.id));

        // For enterprise, store the ID
        if (assignmentType === 'enterprise' && resourcesData.length > 0) {
          setEnterpriseId(resourcesData[0].id.toString());
        }

        // For tenants, build hierarchy
        if (assignmentType === 'tenant') {
          resourcesData = buildTenantHierarchy(resourcesData);
        }

        setResources(resourcesData);
        setLoadingResources(false);
      } catch (error) {
        const message = error.data?.error?.message || __('Failed to load resources');
        setNotification({ kind: 'error', title: message });
        setResources([]);
        setLoadingResources(false);
      }
    };

    fetchResources();
  }, [assignmentType]); // Only re-run when assignmentType changes, not when savedAssignmentsByType updates

  const handleRateChange = (resourceId, rateValue, containerImageId = null) => {
    setAssignments({
      ...assignments,
      [String(resourceId)]: String(rateValue),
    });

    // Store container image ID for label assignments
    if (containerImageId) {
      setLabelMetadata({
        ...labelMetadata,
        [resourceId]: containerImageId,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSubmitting(true);

    const assignmentsArray = [];

    // For tag-based assignments, we need to clear assignments from OTHER tag types
    // to prevent cross-contamination (e.g., vm-tags showing up in container_image-tags)
    if (assignmentType.endsWith('-tags')) {
      const currentPrefix = assignmentType.split('-')[0];

      // Find all existing tag assignments that DON'T match the current type
      savedAssignmentsData.forEach((saved) => {
        if (saved.type === 'tag' && saved.assignmentPrefix !== currentPrefix) {
          // Send assignment with nil rate to remove it
          assignmentsArray.push({
            chargeback: { id: 'nil' },
            tag: {
              href: saved.tagHref,
              assignment_prefix: saved.assignmentPrefix,
            },
          });
        }
      });
    }

    // Build assignments array based on type
    if (assignmentType === 'enterprise') {
      const rateValue = assignments.enterprise;
      if (rateValue && rateValue !== 'nil') {
        if (!enterpriseId) {
          setNotification({ kind: 'error', title: __('Enterprise ID not found') });
          setSubmitting(false);
          return;
        }
        assignmentsArray.push({
          chargeback: { id: rateValue },
          resource: { href: `/api/enterprises/${enterpriseId}` },
        });
      }
    } else if (assignmentType.endsWith('-tags')) {
      // Handle tag assignments (vm-tags, storage-tags, etc.)
      // Per API reference: tag assignments use "tag" key with assignment_prefix
      const assignmentPrefix = assignmentType.split('-')[0];
      Object.keys(assignments).forEach((tagId) => {
        const rateValue = assignments[tagId];
        if (rateValue && rateValue !== 'nil') {
          assignmentsArray.push({
            chargeback: { id: rateValue },
            tag: {
              href: `/api/tags/${tagId}`,
              assignment_prefix: assignmentPrefix,
            },
          });
        }
      });
    } else if (assignmentType.endsWith('-labels')) {
      // Handle label assignments (container_image-labels)
      // Per API reference: labels need full path including container_image ID
      // Format: /api/container_images/{image_id}/custom_attributes/{label_id}
      Object.keys(assignments).forEach((labelId) => {
        const rateValue = assignments[labelId];
        if (rateValue && rateValue !== 'nil') {
          const containerImageId = labelMetadata[labelId];
          if (!containerImageId) {
            return;
          }
          // Use full path with container_image_id
          const href = `/api/container_images/${containerImageId}/custom_attributes/${labelId}`;
          assignmentsArray.push({
            chargeback: { id: rateValue },
            resource: { href },
          });
        }
      });
    } else {
      // Handle resource-based assignments
      let resourcesToProcess = resources;

      // For tenants, flatten the tree to include all nested tenants
      if (assignmentType === 'tenant') {
        resourcesToProcess = flattenTenantTree(resources);
      }

      resourcesToProcess.forEach((resource) => {
        const rateValue = assignments[resource.id];
        if (rateValue && rateValue !== 'nil') {
          let resourceType;
          if (assignmentType === 'ems') {
            resourceType = 'providers';
          } else if (assignmentType === 'ems_cluster') {
            resourceType = 'clusters';
          } else if (assignmentType === 'storage') {
            resourceType = 'data_stores';
          } else if (assignmentType === 'tenant') {
            resourceType = 'tenants';
          } else {
            resourceType = assignmentType;
          }

          assignmentsArray.push({
            chargeback: { id: rateValue },
            resource: { href: `/api/${resourceType}/${resource.id}` },
          });
        }
      });
    }

    // Validate that at least one assignment was made
    if (assignmentsArray.length === 0) {
      setNotification({ kind: 'warning', title: __('Please assign at least one rate') });
      setSubmitting(false);
      return;
    }

    // Submit assignments using the correct API format
    // Per API reference: .bob/apiref.md lines 635-647
    const payload = {
      action: 'assign',
      assignments: assignmentsArray,
    };

    API.post('/api/chargebacks', payload)
      .then(() => {
        setNotification({ kind: 'success', title: __('Chargeback assignments saved successfully') });
        setSubmitting(false);
        loadData();
      })
      .catch((error) => {
        const message = error.data?.error?.message || error.message || __('Failed to save chargeback assignments');
        setNotification({ kind: 'error', title: message });
        setSubmitting(false);
      });
  };

  const handleCancel = () => {
    setAssignments({});
    setAssignmentType('');
  };

  if (loading) {
    return (
      <div className="chargeback-assignments-loading">
        <Loading description={__('Loading chargeback data...')} withOverlay={false} />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="chargeback-assignments-loading">
        <Loading description={__('Saving chargeback assignments...')} withOverlay={false} />
      </div>
    );
  }

  return (
    <div className="chargeback-assignments-form">
      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.title}
          lowContrast
          onCloseButtonClick={() => setNotification(null)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-field">
            <Dropdown
              id={`assignment-type-${rateType.toLowerCase()}`}
              titleText={__('Assign To')}
              label={__('Choose Assignment Type')}
              items={assignmentTypes}
              selectedItem={assignmentTypes.find((t) => t.value === assignmentType)}
              itemToString={(item) => item?.label || ''}
              onChange={({ selectedItem }) => setAssignmentType(selectedItem?.value || '')}
            />
          </div>
        </div>

        {loadingResources && (
          <div className="chargeback-assignments-loading">
            <Loading description={__('Loading resources...')} withOverlay={false} />
          </div>
        )}

        {!loadingResources && assignmentType === 'enterprise' && (
          <SimpleList
            resources={[{ id: 'enterprise', name: __('Enterprise') }]}
            rates={rates}
            assignments={assignments}
            onRateChange={handleRateChange}
          />
        )}

        {!loadingResources && resources.length > 0 && assignmentType === 'tenant' && (
          <TenantTree
            tenants={resources}
            rates={rates}
            assignments={assignments}
            onRateChange={handleRateChange}
          />
        )}

        {!loadingResources
          && resources.length > 0
          && assignmentType !== 'tenant'
          && assignmentType !== 'enterprise'
          && !assignmentType.endsWith('-tags')
          && !assignmentType.endsWith('-labels') && (
          <SimpleList
            resources={resources}
            rates={rates}
            assignments={assignments}
            onRateChange={handleRateChange}
          />
        )}

        {!loadingResources && assignmentType && assignmentType.endsWith('-tags') && (
          <TagSelection
            key={`${assignmentType}-${assignmentType === initializedAssignmentType}`}
            rates={rates}
            assignments={assignments}
            savedAssignments={savedAssignmentsData.filter((a) => a.type === 'tag' && a.assignmentType === assignmentType)}
            onRateChange={handleRateChange}
            assignmentType={assignmentType}
            dropdownId={`tag-category-${rateType.toLowerCase()}`}
          />
        )}

        {!loadingResources && assignmentType && assignmentType.endsWith('-labels') && (
          <LabelSelection
            rates={rates}
            assignments={assignments}
            savedAssignments={savedAssignmentsData.filter((a) => a.type === 'label')}
            onRateChange={handleRateChange}
            dropdownId={`label-key-${rateType.toLowerCase()}`}
          />
        )}

        {assignmentType && (
          <div className="form-buttons">
            <Button type="submit" kind="primary">
              {__('Save')}
            </Button>
            <Button type="button" kind="secondary" onClick={handleCancel}>
              {__('Cancel')}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

ChargebackAssignmentsForm.propTypes = {
  rateType: PropTypes.string.isRequired,
};

export default ChargebackAssignmentsForm;

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Loading, Dropdown, Button, InlineNotification,
} from '@carbon/react';
import SimpleList from './simple-list';
import TenantTree from './tenant-tree';
import TagSelection from './tag-selection';
import LabelSelection from './label-selection';
import {
  deduplicateBy, normalizeAssignments, buildTenantHierarchy, flattenTenantTree,
} from './helpers';

const ChargebackAssignmentsForm = ({ rateType }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [assignmentType, setAssignmentType] = useState('');
  const [assignmentTypes, setAssignmentTypes] = useState([]);
  const [rates, setRates] = useState([]);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [savedAssignmentsData, setSavedAssignmentsData] = useState([]);
  const [savedAssignmentsByType, setSavedAssignmentsByType] = useState({});
  const [labelMetadata, setLabelMetadata] = useState({});
  const [enterpriseId, setEnterpriseId] = useState(null);
  const [initializedAssignmentType, setInitializedAssignmentType] = useState('');
  const [notification, setNotification] = useState(null);

  const loadData = useCallback(async() => {
    try {
      setLoading(true);

      const ratesResponse = await API.get(
        '/api/chargebacks?expand=resources&attributes=assigned_to'
      );
      const allRates = ratesResponse.resources || [];
      const ratesData = allRates.filter((rate) => rate.rate_type === rateType);

      const rateOptions = [
        { label: __('<None>'), value: 'nil' },
        ...ratesData.map((rate) => ({
          label: rate.description,
          value: rate.id.toString(),
        })),
      ];
      setRates(rateOptions);

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
              const assignmentPrefix = assignment.tag.assignment_prefix;
              const currentAssignmentType = `${assignmentPrefix}-tags`;

              if (!foundAssignmentType) {
                foundAssignmentType = currentAssignmentType;
              }

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

              storeAssignmentForType(currentAssignmentType, tagId, rate.id.toString());

              if (currentAssignmentType === foundAssignmentType) {
                savedAssignments[tagId] = rate.id.toString();
              }
            } else if (assignment.resource) {
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

      if (foundAssignmentType) {
        setAssignmentType(foundAssignmentType);
        setInitializedAssignmentType(foundAssignmentType);
        setAssignments(normalizeAssignments(savedAssignments));
      } else {
        setInitializedAssignmentType('');
        setAssignments({});
      }

      setSavedAssignmentsData(savedAssignmentsForDisplay);
      setSavedAssignmentsByType(savedAssignmentsByTypeData);

      setLoading(false);
    } catch (error) {
      const message = error.data?.error?.message || __('Failed to load chargeback data');
      setNotification({ kind: 'error', title: message });
      setLoading(false);
    }
  }, [rateType]);

  // Initial data load: fetch all chargeback rates and reconstruct any existing assignments.
  useEffect(() => {
    loadData();
  }, [loadData]);

  // When the user switches assignment type, restore the previously saved assignments for that type
  // (so edits already persisted are visible again), or clear to an empty slate for a fresh type.
  useEffect(() => {
    if (assignmentType) {
      const savedAssignmentsForType = normalizeAssignments(savedAssignmentsByType[assignmentType] || {});
      const shouldPreloadSavedAssignments = assignmentType === initializedAssignmentType;

      setAssignments(shouldPreloadSavedAssignments ? savedAssignmentsForType : {});
    }
  }, [assignmentType, initializedAssignmentType, savedAssignmentsByType]);

  // Fetch the list of assignable resources whenever the assignment type changes.
  // Tag- and label-based types do not need a resource list (their child components
  // load their own data), so those cases clear the list and bail out early.
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

        if (assignmentType === 'enterprise' && resourcesData.length > 0) {
          setEnterpriseId(resourcesData[0].id.toString());
        }

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
  }, [assignmentType]);

  const handleRateChange = (resourceId, rateValue, containerImageId = null) => {
    setAssignments({
      ...assignments,
      [String(resourceId)]: String(rateValue),
    });

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

    if (assignmentType.endsWith('-tags')) {
      const currentPrefix = assignmentType.split('-')[0];

      // The API uses a single bulk "assign" action that replaces all assignments for the
      // submitted tags.  If the user is editing one tag-based type (e.g. "vm-tags") while
      // other tag-based types already have saved assignments (e.g. "storage-tags"), those
      // other assignments would be silently wiped unless we re-submit them here.
      // Sending { chargeback: { id: 'nil' } } for a tag tells the API to keep the
      // existing assignment for that tag unchanged, preserving cross-type data.
      savedAssignmentsData.forEach((saved) => {
        if (saved.type === 'tag' && saved.assignmentPrefix !== currentPrefix) {
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
      Object.keys(assignments).forEach((labelId) => {
        const rateValue = assignments[labelId];
        if (rateValue && rateValue !== 'nil') {
          const containerImageId = labelMetadata[labelId];
          if (!containerImageId) {
            return;
          }
          const href = `/api/container_images/${containerImageId}/custom_attributes/${labelId}`;
          assignmentsArray.push({
            chargeback: { id: rateValue },
            resource: { href },
          });
        }
      });
    } else {
      let resourcesToProcess = resources;

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

    if (assignmentsArray.length === 0) {
      setNotification({ kind: 'warning', title: __('Please assign at least one rate') });
      setSubmitting(false);
      return;
    }

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
            onError={(message) => setNotification({ kind: 'error', title: message })}
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
            onError={(message) => setNotification({ kind: 'error', title: message })}
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

import { useFieldApi } from '@@ddf';
import PropTypes from 'prop-types';
import {
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@carbon/react';
import CustomerTagsTab from './customer-tags-tab';
import BelongsToTab from './belongs-to-tab';

const FilterTabs = ({
  currentTenantName = undefined,
  tags,
  hacTree = undefined,
  vatTree = undefined,
  hacPaths = {},
  vatPaths = {},
  readOnly = false,
  superAdminUser = false,
  ...props
}) => {
  const {
    input: { value, onChange },
  } = useFieldApi(props);

  const {
    assignedTags = [],
    belongstoChecked = [],
    useFilterExpression = false,
    filterExpression = null,
  } = value || {};

  const update = (patch) => onChange({ ...value, ...patch });

  // Keys owned exclusively by each tree (by path map membership).
  // When a tree fires onCheckedChange, replace only its own keys in the shared array.
  const hacKeys = new Set(Object.keys(hacPaths));
  const vatKeys = new Set(Object.keys(vatPaths));

  // Shared keys (e.g. provider root nodes) are owned by HAC; VAT only
  // gets keys that are exclusively in vatPaths.
  const hacChecked = belongstoChecked.filter((k) => hacKeys.has(k));
  const vatChecked = belongstoChecked.filter((k) => vatKeys.has(k) && !hacKeys.has(k));

  const onHacChange = (newHacChecked) => {
    const vatOnly = belongstoChecked.filter((k) => vatKeys.has(k) && !hacKeys.has(k));
    update({ belongstoChecked: [...newHacChecked, ...vatOnly] });
  };

  const onVatChange = (newVatChecked) => {
    const hacOnly = belongstoChecked.filter((k) => hacKeys.has(k));
    update({ belongstoChecked: [...hacOnly, ...newVatChecked] });
  };

  return (
    <div className="rbac-group-filter-tabs">
      <hr />
      <h3>{readOnly ? __('Assigned Filters (read only)') : __('Assign Filters')}</h3>
      <Tabs>
        <TabList aria-label={__('Filter tabs')}>
          <Tab>{sprintf(__('%s Tags'), currentTenantName || __('My Company'))}</Tab>
          <Tab>{__('Clusters, Datastores, Hosts, Managers & Providers')}</Tab>
          <Tab>{__('VMs & Templates')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CustomerTagsTab
              tags={tags}
              assignedTags={assignedTags}
              onAssignedTagsChange={(v) => update({ assignedTags: v })}
              useFilterExpression={useFilterExpression}
              onToggle={(v) => {
                if (v) {
                  update({ useFilterExpression: true, assignedTags: [], filterExpression: null });
                } else {
                  update({ useFilterExpression: false, filterExpression: null });
                }
              }}
              filterExpression={filterExpression}
              onExpressionChange={(exp, errors) => {
                update({
                  filterExpression: errors.length === 0 ? exp : filterExpression,
                  expressionHasErrors: errors.length > 0,
                });
              }}
              readOnly={readOnly}
            />
          </TabPanel>
          <TabPanel>
            <BelongsToTab
              bsTree={hacTree}
              checked={hacChecked}
              onCheckedChange={onHacChange}
              readOnly={readOnly}
              superAdminUser={superAdminUser}
              limitedMessage={__('This user is limited to the selected items and their children.')}
            />
          </TabPanel>
          <TabPanel>
            <BelongsToTab
              bsTree={vatTree}
              checked={vatChecked}
              onCheckedChange={onVatChange}
              readOnly={readOnly}
              superAdminUser={superAdminUser}
              limitedMessage={__('This user is limited to the selected folders and their children.')}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

FilterTabs.propTypes = {
  currentTenantName: PropTypes.string,
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    assignedTags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    affectedItems: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  hacTree: PropTypes.string,
  vatTree: PropTypes.string,
  hacPaths: PropTypes.objectOf(PropTypes.string),
  vatPaths: PropTypes.objectOf(PropTypes.string),
  readOnly: PropTypes.bool,
  superAdminUser: PropTypes.bool,
};

export default FilterTabs;

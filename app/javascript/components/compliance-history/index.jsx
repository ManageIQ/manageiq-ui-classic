import { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  TreeView,
  TreeNode,
  InlineNotification,
  Button,
} from '@carbon/react';
import {
  CheckmarkFilled,
  Misuse,
  AddAlt,
  SubtractAlt,
} from '@carbon/react/icons';

const statusIcon = (compliant) => (
  compliant
    ? <CheckmarkFilled className="compliance-icon compliance-icon--ok" />
    : <Misuse className="compliance-icon compliance-icon--error" />
);

// Collect all parent node IDs from the data so we can expand/collapse all.
const allParentIds = (checks) => {
  const ids = new Set();
  checks.forEach((check) => {
    ids.add(`ch-${check.id}`);
    check.policies.forEach((policy) => ids.add(`ch-${check.id}-p-${policy.id}`));
  });
  return ids;
};

const ComplianceHistory = ({ checks }) => {
  const parsed = useMemo(
    () => (typeof checks === 'string' ? JSON.parse(checks) : checks),
    [checks],
  );

  const isStatusPage = parsed && parsed.length === 1;
  const parentIds = useMemo(() => (parsed ? allParentIds(parsed) : new Set()), [parsed]);

  // Set of node IDs that are currently expanded.
  const [expandedIds, setExpandedIds] = useState(() => {
    if (!parsed || parsed.length === 0) {
      return new Set();
    }
    // Status page: expand everything by default.
    if (parsed.length === 1) {
      return allParentIds(parsed);
    }
    return new Set();
  });

  const toggleNode = useCallback((nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setExpandedIds(new Set(parentIds)), [parentIds]);
  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  if (!parsed || parsed.length === 0) {
    return (
      <InlineNotification
        kind="warning"
        title={__('No compliance history found')}
        subtitle={__('A compliance check for this resource has not been run yet.')}
        lowContrast
        hideCloseButton
      />
    );
  }

  const allExpanded = parentIds.size > 0 && [...parentIds].every((id) => expandedIds.has(id));

  return (
    <div className="compliance-history">
      {!isStatusPage && (
        <div className="compliance-history__toolbar">
          <Button
            kind="ghost"
            size="md"
            renderIcon={allExpanded ? SubtractAlt : AddAlt}
            iconDescription={allExpanded ? __('Collapse All') : __('Expand All')}
            onClick={allExpanded ? collapseAll : expandAll}
          >
            {allExpanded ? __('Collapse All') : __('Expand All')}
          </Button>
        </div>
      )}
      <TreeView label={__('Compliance History')} hideLabel>
        {parsed.map((check) => {
          const checkId = `ch-${check.id}`;
          const checkLabel = (
            <span className="compliance-history__check-label">
              {statusIcon(check.compliant)}
              <strong>
                {__('Compliance Check on')}
                :
              </strong>
              {` ${check.timestamp}`}
            </span>
          );

          return (
            <TreeNode
              key={check.id}
              id={checkId}
              label={checkLabel}
              value={String(check.id)}
              isExpanded={expandedIds.has(checkId)}
              onClick={() => toggleNode(checkId)}
            >
              {check.policies.length === 0 ? (
                <TreeNode
                  key={`${check.id}-nopol`}
                  id={`ch-${check.id}-nopol`}
                  label={__('No Compliance Policies Found')}
                  value={`${check.id}-nopol`}
                />
              ) : (
                check.policies.map((policy) => {
                  const policyId = `ch-${check.id}-p-${policy.id}`;
                  const policyLabel = (
                    <span className="compliance-history__policy-label">
                      {statusIcon(policy.result)}
                      <strong>
                        {__('Policy')}
                        :
                      </strong>
                      {` ${policy.name}`}
                    </span>
                  );

                  return (
                    <TreeNode
                      key={`${check.id}-p-${policy.id}`}
                      id={policyId}
                      label={policyLabel}
                      value={`${check.id}-p-${policy.id}`}
                      isExpanded={expandedIds.has(policyId)}
                      onClick={() => toggleNode(policyId)}
                    >
                      {policy.conditions.map((condition) => {
                        const conditionLabel = (
                          <span className="compliance-history__condition-label">
                            {statusIcon(condition.result)}
                            {condition.description}
                          </span>
                        );
                        return (
                          <TreeNode
                            key={`${check.id}-p-${policy.id}-c-${condition.id}`}
                            id={`ch-${check.id}-p-${policy.id}-c-${condition.id}`}
                            label={conditionLabel}
                            value={`${check.id}-p-${policy.id}-c-${condition.id}`}
                          />
                        );
                      })}
                    </TreeNode>
                  );
                })
              )}
            </TreeNode>
          );
        })}
      </TreeView>
    </div>
  );
};

ComplianceHistory.propTypes = {
  checks: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      compliant: PropTypes.bool.isRequired,
      policies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        result: PropTypes.bool.isRequired,
        conditions: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.number.isRequired,
          description: PropTypes.string.isRequired,
          result: PropTypes.bool.isRequired,
        })).isRequired,
      })).isRequired,
    })),
  ]).isRequired,
};

export default ComplianceHistory;

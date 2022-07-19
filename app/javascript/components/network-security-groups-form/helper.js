// Get the current and deleted firewall rules
export const getFirewallRules = (initialValues, values, securityGroupId) => {
  const oldFirewallRuleIds = [];
  const temp = { firewall_rules: [], firewall_rules_delete: false };

  if (values.firewall_rules.length > 0 || initialValues.firewall_rules.length > 0) {
    // Get current firewall rules
    if (values.firewall_rules.length > 0) {
      values.firewall_rules.forEach((rule) => {
        if (rule && rule.id) {
          if (rule.source_security_group_id === undefined || rule.source_security_group_id === null) {
            rule.source_security_group_id = null;
          } else {
            rule.source_ip_range = '';
          }
          temp.firewall_rules.push(rule);
          oldFirewallRuleIds.push(rule.id);
        } else if (rule) {
          rule.id = null;
          rule.ems_ref = null;
          rule.resource_id = securityGroupId;
          rule.resource_type = 'SecurityGroup';
          if (rule.direction === undefined) {
            rule.direction = null;
          }
          if (rule.network_protocol === undefined) {
            rule.network_protocol = null;
          }
          if (rule.host_protocol === undefined) {
            rule.host_protocol = null;
          }
          if (rule.source_security_group_id === undefined || rule.source_security_group_id === null) {
            rule.source_security_group_id = null;
          } else {
            rule.source_ip_range = '';
          }
          if (rule.source_ip_range === undefined) {
            rule.source_ip_range = null;
          }
          if (rule.port === undefined) {
            rule.port = null;
          }
          if (rule.end_port === undefined) {
            rule.end_port = null;
          }
          temp.firewall_rules.push(rule);
        }
      });
    }

    // Check if any fire wall rules deleted and add them to temp array
    if (initialValues.firewall_rules.length > 0) {
      initialValues.firewall_rules.forEach((rule) => {
        if (rule && rule.id && oldFirewallRuleIds.includes(rule.id) === false) {
          temp.firewall_rules_delete = true;
          rule.deleted = true;
          temp.firewall_rules.push(rule);
        }
      });
    }
  }
  return temp;
};

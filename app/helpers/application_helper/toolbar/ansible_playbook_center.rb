class ApplicationHelper::Toolbar::AnsiblePlaybookCenter < ApplicationHelper::Toolbar::Basic
  button_group('ansible_playbooks_policy', [
                 select(
                   :ansible_playbooks_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :embedded_configuration_script_payload_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Ansible Playbook'),
                       N_('Edit Tags'),
                     ),
                   ]
                 )
               ])
end

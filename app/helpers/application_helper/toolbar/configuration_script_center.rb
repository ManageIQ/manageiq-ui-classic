class ApplicationHelper::Toolbar::ConfigurationScriptCenter < ApplicationHelper::Toolbar::Basic
  button_group('configuration_script_vmdb', [
                 select(
                   :configuration_script_vmdb_choice,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :configuration_script_service_dialog,
                       'pficon pficon-add-circle-o fa-lg',
                       t = N_('Create Service Dialog from this Template'),
                       t,
                       :url => "/configuration_script_service_dialog"
                     ),
                   ]
                 ),
                 select(
                   :configuration_script_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => true,
                   :items   => [
                     button(
                       :configuration_script_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Template'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
end

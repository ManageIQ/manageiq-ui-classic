class ApplicationHelper::Toolbar::ConfigurationScriptsCenter < ApplicationHelper::Toolbar::Basic
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
                       :url          => "/configuration_script_service_dialog",
                       :url_parms    => "main_div",
                       :onwhen       => '1',
                       :send_checked => true
                     ),
                   ]
                 )
               ])
  button_group('configuration_script_policy', [
                 select(
                   :configuration_script_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :configuration_script_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for the selected Templates'),
                       N_('Edit Tags'),
                       :url_parms    => "main_div",
                       :send_checked => true,
                       :enabled      => false,
                       :onwhen       => "1+"
                     ),
                   ]
                 )
               ])
end

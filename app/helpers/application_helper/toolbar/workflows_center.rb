class ApplicationHelper::Toolbar::WorkflowsCenter < ApplicationHelper::Toolbar::Basic
  button_group('workflows_policy', [
                 select(
                   :workflows_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :enabled => false,
                   :onwhen  => "1+",
                   :items   => [
                     button(
                       :embedded_configuration_script_payload_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for the selected Workflows'),
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

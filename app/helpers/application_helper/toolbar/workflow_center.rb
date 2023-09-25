class ApplicationHelper::Toolbar::WorkflowCenter < ApplicationHelper::Toolbar::Basic
  button_group('workflows_policy', [
                 select(
                   :workflow_configuration,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :embedded_configuration_script_payload_map_credentials,
                       'pficon pficon-edit fa-lg',
                       t = N_('Map Credentials to this Workflow'),
                       t,
                       :klass => ApplicationHelper::Button::EmbeddedWorkflow,
                       :url   => "/map_credentials"
                     ),
                   ]
                 ),
                 select(
                   :workflows_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items => [
                     button(
                       :embedded_configuration_script_payload_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Workflow'),
                       N_('Edit Tags')
                     ),
                   ]
                 )
               ])
end

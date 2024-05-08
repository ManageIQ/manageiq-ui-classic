class ApplicationHelper::Toolbar::WorkflowRepositoryCenter < ApplicationHelper::Toolbar::Basic
  button_group('workflow_repositories_reloading', [
                 button(
                   :workflow_repository_reload,
                   'fa fa-refresh fa-lg',
                   N_('Refresh this page'),
                   N_(''),
                   :url_parms    => "main_div",
                   :send_checked => true,
                   :klass        => ApplicationHelper::Button::ButtonWithoutRbacCheck
                 ),
               ])
  button_group('workflow_repository', [
                 select(
                   :workflow_repository_configuration,
                   nil,
                   t = N_('Configuration'),
                   t,
                   :items => [
                     button(
                       :embedded_configuration_script_source_refresh,
                       'fa fa-refresh fa-lg',
                       N_('Refresh this Repository'),
                       N_('Refresh this Repository'),
                       :klass   => ApplicationHelper::Button::EmbeddedWorkflow,
                       :confirm => N_("Refresh this Repository?"),
                       :enabled => true,
                     ),
                     separator,
                     button(
                       :embedded_configuration_script_source_edit,
                       'pficon pficon-edit fa-lg',
                       t = N_('Edit this Repository'),
                       t,
                       :klass => ApplicationHelper::Button::EmbeddedWorkflow,
                       :url   => "/edit"
                     ),
                     button(
                       :embedded_configuration_script_source_delete,
                       'pficon pficon-delete fa-lg',
                       t = N_('Remove this Repository from Inventory'),
                       t,
                       :klass => ApplicationHelper::Button::EmbeddedWorkflow,
                       :data  => {'function'      => 'sendDataWithRx',
                                  'function-data' => {:controller     => 'provider_dialogs',
                                                      :modal_title    => N_('Delete Repository'),
                                                      :modal_text     => N_('Are you sure you want to delete the following repository?'),
                                                      :api_url        => 'configuration_script_sources',
                                                      :async_delete   => true,
                                                      :redirect_url   => '/workflow_repository/show_list',
                                                      :component_name => 'RemoveGenericItemModal'}}
                     ),
                   ]
                 ),
               ])
  button_group('workflow_repositories_policy', [
                 select(
                   :ansible_repositories_policy_choice,
                   nil,
                   t = N_('Policy'),
                   t,
                   :items =>
                             [
                               button(
                                 :embedded_configuration_script_source_tag,
                                 'pficon pficon-edit fa-lg',
                                 N_('Edit Tags for this Workflow Repository'),
                                 N_('Edit Tags')
                               ),
                             ]
                 )
               ])
end

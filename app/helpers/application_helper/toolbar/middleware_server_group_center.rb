class ApplicationHelper::Toolbar::MiddlewareServerGroupCenter < ApplicationHelper::Toolbar::Basic
  button_group('middleware_server_group_policy', [
                 select(
                   :middleware_server_group_policy_choice,
                   'fa fa-shield fa-lg',
                   t = N_('Policy'),
                   t,
                   :enabled => "false",
                   :items   => [
                     button(
                       :middleware_server_group_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Middleware Server Group'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
  button_group('middleware_server_deployments', [
                 select(
                   :middleware_server_deployments_choice,
                   'pficon pficon-save fa-lg',
                   t = N_('Deployments'),
                   t,
                   :items => [
                     button(
                       :middleware_group_deployment_add,
                       'pficon pficon-add-circle-o fa-lg',
                       N_('Add a new Deployment'),
                       N_('Add Deployment'),
                       :data => {'toggle'        => 'modal',
                                 'target'        => '#modal_d_div',
                                 'function'      => 'miqCallAngular',
                                 'function-data' => '{"name": "showDeployListener", "args": []}'}
                     )
                   ]
                 ),
               ])
end

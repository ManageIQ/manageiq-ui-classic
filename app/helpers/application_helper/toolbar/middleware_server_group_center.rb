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
  button_group('middleware_server_operations', [
                 select(
                   :middleware_server_power_choice,
                   'fa fa-power-off fa-lg',
                   t = N_('Power'),
                   t,
                   :items => [
                     button(
                       :middleware_server_group_restart,
                       nil,
                       N_('Restart Servers in this Server Group'),
                       N_('Restart Server Group'),
                       :image   => 'restart',
                       :confirm => N_('Do you want to restart this server group?'),
                     ),
                     separator,
                     button(
                       :middleware_server_group_stop,
                       nil,
                       N_('Stop Servers in this Server Group'),
                       N_('Stop Server Group'),
                       :image => 'power_off',
                       :data  => {'toggle'        => 'modal',
                                  'target'        => '#modal_param_div',
                                  'function'      => 'sendDataWithRx',
                                  'function-data' => '{"type": "mwServerOps", "operation": "stop", "timeout": 10}'},
                     ),
                     button(
                       :middleware_server_group_suspend,
                       nil,
                       N_('Suspend Server in this Server Group'),
                       N_('Suspend Server Group'),
                       :image => 'suspend',
                       :data  => {'toggle'        => 'modal',
                                  'target'        => '#modal_param_div',
                                  'function'      => 'sendDataWithRx',
                                  'function-data' => '{"type": "mwServerOps", "operation": "suspend", "timeout": 10}'},
                     ),
                     button(
                       :middleware_server_group_resume,
                       nil,
                       N_('Resume Servers in this Server Group'),
                       N_('Resume Server Group'),
                       :image   => 'resume',
                       :confirm => N_('Do you want to resume this server group?'),
                     ),
                     button(
                       :middleware_server_group_reload,
                       nil,
                       N_('Reload Servers in this Server Group'),
                       N_('Reload Server Group'),
                       :confirm => N_('Do you want to trigger a reload of this server group?'),
                       :image   => 'guest_restart',
                     ),
                     button(
                       :middleware_server_group_start,
                       nil,
                       N_('Start Servers in this Server Group'),
                       N_('Start Server Group'),
                       :image   => 'start',
                       :confirm => N_('Do you want to trigger a start of this server group?'),
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

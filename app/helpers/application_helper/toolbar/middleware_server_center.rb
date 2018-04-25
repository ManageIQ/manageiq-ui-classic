# noinspection RubyArgCount
class ApplicationHelper::Toolbar::MiddlewareServerCenter < ApplicationHelper::Toolbar::Basic
  button_group('middleware_server_monitoring', [
    select(
      :middleware_server_monitoring_choice,
      'ff ff-monitoring fa-lg',
      t = N_('Monitoring'),
      t,
      :items => [
        button(
          :middleware_server_perf,
          'ff ff-monitoring fa-lg',
          N_('Show Capacity & Utilization data for this Server'),
          N_('Utilization'),
          :url       => "/show",
          :url_parms => "?display=performance")
      ]
    ),
  ])
  button_group('middleware_server_policy', [
    select(
      :middleware_server_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => "false",
      :items   => [
        button(
          :middleware_server_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for this Middleware Server'),
          N_('Manage Policies')),
        button(
          :middleware_server_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Middleware Server'),
          N_('Edit Tags')),
        button(
          :middleware_server_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for this Middleware Server'),
          N_('Check Compliance of Last Known Configuration'),
          :confirm => N_("Initiate Check Compliance of the last known configuration for this item?")),
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
          :middleware_server_shutdown,
          nil,
          N_('Gracefully shut this server down'),
          N_('Gracefully shutdown Server'),
          :icon  => "pficon pficon-off fa-lg",
          :data  => {'toggle'        => 'modal',
                     'target'        => '#modal_param_div',
                     'function'      => 'sendDataWithRx',
                     'function-data' => '{"type": "mwServerOps", "operation": "shutdown", "timeout": 0}'},
          :klass => ApplicationHelper::Button::MiddlewareStandaloneServerAction),
        button(
          :middleware_server_restart,
          nil,
          N_('Restart this server'),
          N_('Restart Server'),
          :icon    => "pficon pficon-restart fa-lg",
          :confirm => N_('Do you want to restart this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareStandaloneServerAction),
        separator,
        button(
          :middleware_server_stop,
          nil,
          N_('Stop this Middleware Server'),
          N_('Stop Server'),
          :icon    => "fa fa-stop fa-lg",
          :confirm => N_('Do you want to stop this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareStandaloneServerAction),
        button(
          :middleware_server_suspend,
          nil,
          N_('Suspend this server'),
          N_('Suspend Server'),
          :icon  => "fa fa-pause fa-lg",
          :data  => {'toggle'        => 'modal',
                     'target'        => '#modal_param_div',
                     'function'      => 'sendDataWithRx',
                     'function-data' => '{"type": "mwServerOps",
                                          "operation": "suspend", "timeout": 10}'},
          :klass => ApplicationHelper::Button::MiddlewareDomainServerAction),
        button(
          :middleware_server_resume,
          nil,
          N_('Resume this server'),
          N_('Resume Server'),
          :icon    => 'fa fa-play fa-lg',
          :confirm => N_('Do you want to resume this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareServerAction),
        button(
          :middleware_server_reload,
          nil,
          N_('Reload this server'),
          N_('Reload Server'),
          :confirm => N_('Do you want to trigger a reload of this server?'),
          :icon    => "pficon pficon-restart fa-lg",
          :klass   => ApplicationHelper::Button::MiddlewareServerAction),
        button(
          :middleware_domain_server_start,
          nil,
          N_('Start this server'),
          N_('Start Server'),
          :icon    => 'fa fa-play fa-lg',
          :confirm => N_('Do you want to trigger a start of this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareDomainServerAction),
        button(
          :middleware_domain_server_stop,
          nil,
          N_('Stop this server'),
          N_('Stop Server'),
          :icon    => "fa fa-stop fa-lg",
          :confirm => N_('Do you want to trigger a stop of this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareDomainServerAction),
        button(
          :middleware_domain_server_restart,
          nil,
          N_('Restart this server'),
          N_('Restart Server'),
          :icon    => 'pficon pficon-restart fa-lg',
          :confirm => N_('Do you want to trigger a restart of this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareDomainServerAction),
        button(
          :middleware_domain_server_kill,
          nil,
          N_('Kill this server'),
          N_('Kill Server'),
          :icon    => "pficon pficon-off fa-lg",
          :confirm => N_('Do you want to trigger a kill of this server?'),
          :klass   => ApplicationHelper::Button::MiddlewareDomainServerAction),
      ]
    ),
    select(
      :middleware_server_deployments_choice,
      'pficon pficon-save fa-lg',
      t = N_('Deployments'),
      t,
      :items => [
        button(
          :middleware_deployment_add,
          'pficon pficon-add-circle-o fa-lg',
          N_('Add a new Middleware Deployment'),
          N_('Add Deployment'),
          :data => {'toggle'        => 'modal',
                    'target'        => '#modal_d_div',
                    'function'      => 'sendDataWithRx',
                    'function-data' => '{"name": "showDeployListener", "controller": "middlewareServerController"}'},
          :klass => ApplicationHelper::Button::MiddlewareStandaloneServerAction)
      ]
    ),
    button(
      :middleware_dr_generate,
      'pficon pficon-import fa-lg',
      N_('Enqueue generation of new JDR report'),
      N_('Generate JDR')
    )
  ])
end

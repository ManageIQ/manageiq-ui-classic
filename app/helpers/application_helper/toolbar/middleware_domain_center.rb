class ApplicationHelper::Toolbar::MiddlewareDomainCenter < ApplicationHelper::Toolbar::Basic
  button_group('middleware_domain_policy', [
                 select(
                   :middleware_domain_policy_choice,
                   'fa fa-shield fa-lg',
                   t = N_('Policy'),
                   t,
                   :enabled => "false",
                   :items   => [
                     button(
                       :middleware_domain_tag,
                       'pficon pficon-edit fa-lg',
                       N_('Edit Tags for this Middleware Domain'),
                       N_('Edit Tags')
                     ),
                   ]
                 ),
               ])
  button_group('middleware_domain_operations', [
                 select(
                   :middleware_server_power_choice,
                   'fa fa-power-off fa-lg',
                   t = N_('Power'),
                   t,
                   :items => [
                     button(
                       :middleware_domain_stop,
                       nil,
                       N_('Stop this Domain'),
                       N_('Stop Domain'),
                       :image   => 'power_off',
                       :confirm => N_('Do you want to stop this domain?')
                     )
                   ]
                 ),
               ])
end

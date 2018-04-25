# noinspection ALL
class ApplicationHelper::Toolbar::MiddlewareServersCenter < ApplicationHelper::Toolbar::Basic
  button_group('middleware_server_policy', [
    select(
      :middleware_server_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :middleware_server_protect,
          'pficon pficon-edit fa-lg',
          N_('Manage Policies for these Middleware Servers'),
          N_('Manage Policies'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => "false",
          :onwhen       => "1+"),
        button(
          :middleware_server_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for these Middleware Servers'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :middleware_server_check_compliance,
          'fa fa-search fa-lg',
          N_('Check Compliance of the last known configuration for these Middleware Servers'),
          N_('Check Compliance of Last Known Configuration'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Initiate Check Compliance of the last known configuration for the selected items?"),
          :enabled      => "false",
          :onwhen       => "1+")
      ]
    ),
  ])
  button_group('middleware_server_operations', [
    select(
      :middleware_server_power_choice,
      'fa fa-power-off fa-lg',
      t = N_('Power'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :middleware_server_reload,
          nil,
          N_('Reload these Middleware Servers'),
          N_('Reload Server'),
          :icon         => "pficon pficon-restart fa-lg",
          :url_parms    => 'main_div',
          :send_checked => true,
          :confirm      => N_('Do you want to reload selected servers?'),
          :klass        => ApplicationHelper::Button::MiddlewareServerAction,
          :enabled      => false,
          :onwhen       => '1+'),
      ]
    ),
  ])
end

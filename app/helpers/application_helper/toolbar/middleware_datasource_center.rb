class ApplicationHelper::Toolbar::MiddlewareDatasourceCenter < ApplicationHelper::Toolbar::Basic
  button_group('middleware_datasource_policy', [
    select(
      :middleware_datasource_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => "false",
      :items   => [
        button(
          :middleware_datasource_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Middleware Datasource'),
          N_('Edit Tags')),
      ]
    ),
  ])
  button_group(
    'middleware_datasource_operations', [
      select(
        :middleware_datasource_operations_choice,
        'fa fa-play-circle-o fa-lg',
        t = N_('Operations'),
        t,
        :items => [
          button(
            :middleware_datasource_remove,
            'pficon pficon-delete fa-lg',
            N_('Remove Middleware Datasource from Inventory'),
            N_('Remove'),
            :confirm => N_('Do you want to remove this Datasource? Some Applications could be using this '\
 +                             'Datasource and may malfunction if it is deleted.'),
            :klass   => ApplicationHelper::Button::MiddlewareStandaloneServerAction)
        ]
      ),
    ])
end

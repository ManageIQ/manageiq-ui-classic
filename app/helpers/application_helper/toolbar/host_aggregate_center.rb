class ApplicationHelper::Toolbar::HostAggregateCenter < ApplicationHelper::Toolbar::Basic
  button_group('host_aggregate_vmdb', [
    select(
      :host_aggregate_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :host_aggregate_edit,
          'pficon pficon-edit fa-lg',
          N_('Select this Host Aggregate'),
          N_('Edit Host Aggregate'),
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options      => {:feature => :update}
        ),
        button(
          :host_aggregate_add_host,
          'pficon pficon-container-node fa-lg',
          N_('Select this Host Aggregate'),
          N_('Add Host to Host Aggregate'),
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options      => {:feature => :add_host}
        ),
        button(
          :host_aggregate_remove_host,
          'pficon pficon-container-node fa-lg',
          N_('Select this Host Aggregate'),
          N_('Remove Host from Host Aggregate'),
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options      => {:feature => :remove_host}
        ),
        button(
          :host_aggregate_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Host Aggregates'),
          N_('Delete Host Aggregates'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: The selected Host Aggregates will be permanently deleted!"),
          :klass        => ApplicationHelper::Button::GenericFeatureButtonWithDisable,
          :options      => {:feature => :delete}
        ),
      ]
    ),
  ])
  button_group('host_aggregate_policy', [
    select(
      :host_aggregate_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :host_aggregate_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Host Aggregate'),
          N_('Edit Tags')),
      ]
    ),
  ])
end

class ApplicationHelper::Toolbar::ChargebackRateCenter < ApplicationHelper::Toolbar::Basic
  button_group('chargeback_rate_vmdb', [
    select(
      :chargeback_rate_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :chargeback_rates_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Chargeback Rate'),
          t,
          :url          => '/edit',
          :send_checked => true,
          :klass        => ApplicationHelper::Button::ChargebackRateEdit),
        button(
          :chargeback_rates_copy,
          'fa fa-files-o fa-lg',
          t = N_('Copy this Chargeback Rate'),
          t,
          :klass        => ApplicationHelper::Button::ChargebackRates,
          :url          => '/copy',
          :send_checked => true),
        button(
          :chargeback_rates_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Chargeback Rate from the VMDB'),
          N_('Remove from the VMDB'),
          :url          => 'delete',
          :send_checked => true,
          :confirm      => N_("Warning: This Chargeback Rate will be permanently removed!"),
          :klass        => ApplicationHelper::Button::ChargebackRateRemove),
      ]
    ),
  ])
end

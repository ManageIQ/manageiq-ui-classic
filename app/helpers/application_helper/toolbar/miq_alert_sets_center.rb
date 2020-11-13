class ApplicationHelper::Toolbar::MiqAlertSetsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_alert_set_vmdb', [
    select(
      :miq_alert_set_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_alert_set_new,
          'pficon pficon-add-circle-o fa-lg',
          t = proc do
            _('Add a New %{alert_profile_type} Alert Profile') % {:alert_profile_type => ui_lookup(:model => @sb[:folder])}
          end,
          t,
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
      ]
    ),
  ])
end

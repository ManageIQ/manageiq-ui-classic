class ApplicationHelper::Toolbar::MiqEventCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_event_vmdb', [
    select(
      :miq_event_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :miq_event_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Actions for this Policy Event'),
          t,
          :url_parms    => "main_div",
          :send_checked => true,
          :klass        => ApplicationHelper::Button::MiqActionModify),
      ]
    ),
  ])
end

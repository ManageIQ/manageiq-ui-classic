class ApplicationHelper::Toolbar::MiqWidgetSetsCenter < ApplicationHelper::Toolbar::Basic
  button_group('db_vmdb', [
    select(
      :db_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :db_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Dashboard'),
          t,
          :klass => ApplicationHelper::Button::DbNew),
        separator,
        button(
          :db_seq_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit Sequence of Dashboards'),
          t,
          :klass => ApplicationHelper::Button::DbSeqEdit),
      ]
    ),
  ])
end

class ApplicationHelper::Toolbar::CatalogitemButtonCenter < ApplicationHelper::Toolbar::Basic
  button_group('catalogitem_button_vmdb', [
    select(
      :catalogitem_button_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :ab_button_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Button'),
          t,
          :klass        => ApplicationHelper::Button::CatalogItemButton,
          :url_parms    => "main_div",
          :send_checked => true),
        button(
          :ab_button_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Button'),
          t,
          :klass        => ApplicationHelper::Button::CatalogItemButton,
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Warning: This Button will be permanently removed from the Virtual Management Database!")),
        separator,
        button(
          :ab_button_simulate,
          'fa fa-play-circle-o fa-lg',
          N_('Simulate using Button details'),
          N_('Simulate'),
          :keepSpinner => true,
          :klass       => ApplicationHelper::Button::CatalogItemButton,
          :url         => "resolve",
          :url_parms   => "?button=simulate"),
      ]
    ),
  ])
end

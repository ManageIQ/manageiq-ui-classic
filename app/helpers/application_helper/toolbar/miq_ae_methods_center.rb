class ApplicationHelper::Toolbar::MiqAeMethodsCenter < ApplicationHelper::Toolbar::Basic
  button_group('miq_ae_method_vmdb', [
    select(
      :miq_ae_method_vmdb_choice,
      nil,
      N_('Configuration'),
      :items => [
        button(
          :miq_ae_class_edit,
          'pficon pficon-edit fa-lg',
          N_('Edit this Class'),
          :klass => ApplicationHelper::Button::MiqAeDefault),
        button(
          :miq_ae_class_copy,
          'fa fa-files-o fa-lg',
          N_('Copy this Class'),
          :klass => ApplicationHelper::Button::MiqAeClassCopy),
        button(
          :miq_ae_class_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove this Class'),
          :url_parms => "&refresh=y",
          :confirm   => N_("Are you sure you want to remove this Class?"),
          :klass     => ApplicationHelper::Button::MiqAeDefault),
        separator,
        button(
          :miq_ae_method_new,
          'pficon pficon-add-circle-o fa-lg',
          N_('Add a New Method'),
          :klass => ApplicationHelper::Button::MiqAeNew),
        button(
          :miq_ae_method_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Method to edit'),
          N_('Edit Selected Method'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1",
          :klass        => ApplicationHelper::Button::MiqAeDefault),
        button(
          :miq_ae_method_copy,
          'fa fa-files-o fa-lg',
          N_('Select Methods to copy'),
          N_('Copy selected Methods'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :klass        => ApplicationHelper::Button::MiqAeInstanceCopy),
        button(
          :miq_ae_method_delete,
          'pficon pficon-delete fa-lg',
          N_('Remove selected Methods'),
          N_('Remove Methods'),
          :url_parms    => "main_div",
          :send_checked => true,
          :confirm      => N_("Are you sure you want to remove the selected Methods?"),
          :enabled      => false,
          :onwhen       => "1+",
          :klass        => ApplicationHelper::Button::MiqAeDefault),
      ]
    ),
  ])
end

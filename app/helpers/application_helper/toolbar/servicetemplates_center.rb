class ApplicationHelper::Toolbar::ServicetemplatesCenter < ApplicationHelper::Toolbar::Basic
  button_group('catalogitem_vmdb', [
    select(
      :catalogitem_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :atomic_catalogitem_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Catalog Item'),
          t,
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :catalogitem_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a New Catalog Bundle'),
          t,
          :klass => ApplicationHelper::Button::ButtonNewDiscover),
        button(
          :catalogitem_edit,
          'pficon pficon-edit fa-lg',
          N_('Select a single Item to edit'),
          N_('Edit Selected Item'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"),
        button(
          :catalogitem_copy,
          'pficon pficon-edit fa-lg',
          N_('Select a single Item to copy'),
          N_('Copy Selected Item'),
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1"
        ),
        button(
          :catalogitem_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete selected Catalog Items'),
          N_('Delete Catalog Items'),
          :enabled      => false,
          :onwhen       => "1+",
          :data         => {'function'      => 'sendDataWithRx',
                            'function-data' => {:controller     => 'provider_dialogs',
                                                :modal_title    => N_('Delete Catalog Items'),
                                                :component_name => 'RemoveCatalogItemModal'}.to_json}),
        separator,
        button(
          :catalogitem_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for the selected Catalog Item'),
          N_('Set Ownership'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
  button_group('catalogitem_policy', [
    select(
      :catalogitem_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :catalogitem_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected Items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end

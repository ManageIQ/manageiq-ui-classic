class ApplicationHelper::Toolbar::ServicetemplateCenter < ApplicationHelper::Toolbar::Basic
  button_group('catalogitem_vmdb', [
    select(
      :catalogitem_vmdb_choice,
      'fa fa-cog fa-lg',
      t = N_('Configuration'),
      t,
      :items  => [
        button(
          :ab_group_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button Group'),
          t,
          :klass => ApplicationHelper::Button::CatalogItemButtonNew,
        ),
        button(
          :ab_button_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Button'),
          t,
          :klass => ApplicationHelper::Button::CatalogItemButtonNew,
        ),
        button(
          :ab_group_reorder,
          'pficon pficon-edit fa-lg',
          t = N_('Reorder Custom Buttons and Groups'),
          t,
          :klass => ApplicationHelper::Button::CatalogItemButtonReorder),
        button(
          :catalogitem_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Item'),
          t,
          :url_parms    => "main_div",
          :send_checked => true),
        button(
          :catalogitem_copy,
          'pficon pficon-edit fa-lg',
          N_('This Item cannot be copied'),
          N_('Copy Selected Item'),
          :send_checked => true,
          :klass        => ApplicationHelper::Button::CatalogItemCopyButton
        ),
        button(
          :catalogitem_delete,
          'pficon pficon-delete fa-lg',
          N_('Delete this Catalog Item'),
          N_('Delete Catalog Item'),
          :data => {'function'      => 'sendDataWithRx',
                    'function-data' => {:controller     => 'provider_dialogs',
                                        :modal_title    => N_('Delete Catalog Item'),
                                        :component_name => 'RemoveCatalogItemModal'}.to_json}
        ),
        separator,
        button(
          :catalogitem_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for this Catalog Item'),
          N_('Set Ownership'))
      ]
    ),
  ])
  button_group('catalogitem_policy', [
    select(
      :catalogitem_policy_choice,
      'fa fa-shield fa-lg',
      t = N_('Policy'),
      t,
      :items => [
        button(
          :catalogitem_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Catalog Item'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true),
      ]
    ),
  ])
end

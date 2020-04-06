class ApplicationHelper::Toolbar::AuthKeyPairCloudsCenter < ApplicationHelper::Toolbar::Basic
  button_group('auth_key_pair_cloud_vmdb', [
    select(
      :auth_key_pair_cloud_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :auth_key_pair_cloud_new,
          'pficon pficon-add-circle-o fa-lg',
          t = N_('Add a new Key Pair'),
          t,
          :klass => ApplicationHelper::Button::AuthKeyPairCloudCreate),
        separator,
        button(
          :auth_key_pair_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for the selected items'),
          N_('Set Ownership'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
        button(
          :auth_key_pair_cloud_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove selected Key Pairs from Inventory'),
          t,
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+",
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Key Pair'),
                                         :modal_text     => N_('Are you sure you want to delete the following Key Pairs?'),
                                         :api_url        => 'auth_key_pairs',
                                         :async_delete   => true,
                                         :redirect_url   => '/auth_key_pair_cloud/show_list',
                                         :component_name => 'RemoveGenericItemModal'}}),
      ]
    ),
  ])
  button_group('auth_key_pair_cloud_policy', [
    select(
      :auth_key_pair_cloud_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :enabled => false,
      :onwhen  => "1+",
      :items   => [
        button(
          :auth_key_pair_cloud_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for the selected items'),
          N_('Edit Tags'),
          :url_parms    => "main_div",
          :send_checked => true,
          :enabled      => false,
          :onwhen       => "1+"),
      ]
    ),
  ])
end

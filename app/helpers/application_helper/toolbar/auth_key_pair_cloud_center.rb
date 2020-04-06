class ApplicationHelper::Toolbar::AuthKeyPairCloudCenter < ApplicationHelper::Toolbar::Basic
  button_group('auth_key_pair_cloud_vmdb', [
    select(
      :auth_key_pair_cloud_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :auth_key_pair_cloud_delete,
          'pficon pficon-delete fa-lg',
          t = N_('Remove this Key Pair from Inventory'),
          t,
          :data  => {'function'      => 'sendDataWithRx',
                     'function-data' => {:controller     => 'provider_dialogs',
                                         :modal_title    => N_('Delete Key Pair'),
                                         :modal_text     => N_('Are you sure you want to delete the following Key Pair?'),
                                         :api_url        => 'auth_key_pairs',
                                         :async_delete   => true,
                                         :redirect_url   => '/auth_key_pair_cloud/show_list',
                                         :component_name => 'RemoveGenericItemModal'}}),
       button(
          :auth_key_pair_ownership,
          'pficon pficon-user fa-lg',
          N_('Set Ownership for the selected items'),
          N_('Set Ownership'),
          :klass => ApplicationHelper::Button::SetOwnership),
        button(
          :auth_key_pair_cloud_download,
          'pficon pficon-save fa-lg',
          t = N_('Download private key'),
          t,
          :url => "/download_private_key",
          :klass => ApplicationHelper::Button::AuthKeyPairCloudDownload),
      ]
    ),
  ])
  button_group('auth_key_pair_cloud_policy', [
    select(
      :auth_key_pair_cloud_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :auth_key_pair_cloud_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit tags for this Key Pair'),
          N_('Edit Tags')),
      ]
    ),
  ])
end

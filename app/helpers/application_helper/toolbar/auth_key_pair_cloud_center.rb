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
          :url_parms => "&refresh=y",
          :confirm   => N_("Warning: The selected Key Pair and ALL of its components will be permanently removed!")),
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

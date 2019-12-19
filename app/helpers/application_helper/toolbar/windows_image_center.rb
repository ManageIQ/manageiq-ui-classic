class ApplicationHelper::Toolbar::WindowsImageCenter < ApplicationHelper::Toolbar::Basic
  button_group('pxe_wimg_vmdb', [
    select(
      :pxe_wimg_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :pxe_wimg_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this Windows Image'),
          t),
      ]
    ),
  ])
  button_group('windows_image_policy', [
    select(
      :windows_image_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :windows_image_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Windows Image'),
          N_('Edit Tags')),
      ]
    ),
  ])
end

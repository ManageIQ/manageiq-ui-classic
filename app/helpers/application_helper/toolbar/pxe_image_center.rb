class ApplicationHelper::Toolbar::PxeImageCenter < ApplicationHelper::Toolbar::Basic
  button_group('pxe_image_vmdb', [
    select(
      :pxe_image_vmdb_choice,
      nil,
      t = N_('Configuration'),
      t,
      :items => [
        button(
          :pxe_image_edit,
          'pficon pficon-edit fa-lg',
          t = N_('Edit this PXE Image'),
          t),
      ]
    ),
  ])
  button_group('pxe_image_policy', [
    select(
      :pxe_image_policy_choice,
      nil,
      t = N_('Policy'),
      t,
      :items => [
        button(
          :pxe_image_tag,
          'pficon pficon-edit fa-lg',
          N_('Edit Tags for this Pxe Image'),
          N_('Edit Tags')),
      ]
    ),
  ])
end

class ApplicationHelper::Toolbar::XVmVmtreeCenter < ApplicationHelper::Toolbar::Basic
  button_group('vmtree_tasks', [
    button(
      :vm_tag,
      'pficon pficon-edit fa-lg',
      N_('Edit Tags for this VM'),
      nil),
    button(
      :vm_compare,
      'ff ff-compare-same fa-lg',
      N_('Compare selected VMs'),
      nil,
      :url_parms    => "main_div",
      :send_checked => true,
      :enabled      => false,
      :onwhen       => "2+"),
  ])
end

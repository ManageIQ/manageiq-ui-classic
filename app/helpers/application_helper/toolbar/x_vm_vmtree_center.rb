class ApplicationHelper::Toolbar::XVmVmtreeCenter < ApplicationHelper::Toolbar::Basic
  button_group('vmtree_tasks', [
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

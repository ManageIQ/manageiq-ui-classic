class ManageIQ::Providers::AnsibleTower::AutomationManager::PlaybookDecorator < Draper::Decorator
  delegate_all

  def fonticon
    nil
  end

  def listicon_image
    'svg/vendor-ansible_tower_automation.svg'
  end
end

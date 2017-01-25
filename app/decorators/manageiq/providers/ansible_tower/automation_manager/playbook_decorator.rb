module ManageIQ::Providers::AnsibleTower::AutomationManager
  class PlaybookDecorator < MiqDecorator
    def fonticon
      nil
    end

    def listicon_image
      'svg/vendor-ansible_tower_automation.svg'
    end
  end
end

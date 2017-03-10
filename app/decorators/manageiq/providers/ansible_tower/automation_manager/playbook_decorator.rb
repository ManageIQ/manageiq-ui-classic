module ManageIQ::Providers::AnsibleTower
  class AutomationManager::PlaybookDecorator < MiqDecorator
    def fonticon
      nil
    end

    def listicon_image
      'svg/vendor-ansible.svg'
    end
  end
end

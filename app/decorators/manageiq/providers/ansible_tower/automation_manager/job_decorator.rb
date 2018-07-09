module ManageIQ::Providers::AnsibleTower
  class AutomationManager::JobDecorator < MiqDecorator
    def self.fonticon
      'ff ff-stack'
    end

    def single_quad
      {
        :fonticon => fonticon
      }
    end
  end
end

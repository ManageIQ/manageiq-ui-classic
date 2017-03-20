module ManageIQ::Providers::AnsibleTower
  class AutomationManager::JobDecorator < MiqDecorator
    def self.fonticon
      'product product-orchestration_stack'
    end

    def self.fileicon
      '100/orchestration_stack.png'
    end
  end
end

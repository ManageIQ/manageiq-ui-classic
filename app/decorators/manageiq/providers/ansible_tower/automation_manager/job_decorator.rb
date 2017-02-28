module ManageIQ::Providers::AnsibleTower
  class AutomationManager::JobDecorator < MiqDecorator
    def fonticon
      'product product-orchestration_stack'
    end

    def listicon_image
      '100/orchestration_stack.png'
    end
  end
end

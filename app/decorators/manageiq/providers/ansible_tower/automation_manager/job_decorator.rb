module ManageIQ::Providers::AnsibleTower::AutomationManager
  class JobDecorator < MiqDecorator
    def fonticon
      'product product-orchestration_stack'
    end

    def listicon_image
      '100/orchestration_stack.png'
    end
  end
end

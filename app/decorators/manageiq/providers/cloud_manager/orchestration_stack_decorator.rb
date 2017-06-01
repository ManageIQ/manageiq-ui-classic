module ManageIQ::Providers
  class CloudManager::OrchestrationStackDecorator < MiqDecorator
    def self.fonticon
      'ff ff-stack'
    end

    def self.fileicon
      "100/orchestration_stack.png"
    end
  end
end

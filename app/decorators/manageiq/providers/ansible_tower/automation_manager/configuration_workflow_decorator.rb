module ManageIQ::Providers::AnsibleTower
  class AutomationManager::ConfigurationWorkflowDecorator < MiqDecorator
    def self.fonticon
      'pficon pficon-template'
    end

    def self.fileicon
      '100/configuration_script.png'
    end
  end
end

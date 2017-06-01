module ManageIQ::Providers::AnsibleTower
  class AutomationManager::ConfigurationScriptDecorator < MiqDecorator
    def self.fonticon
      'ff ff-template'
    end

    def self.fileicon
      '100/configuration_script.png'
    end
  end
end

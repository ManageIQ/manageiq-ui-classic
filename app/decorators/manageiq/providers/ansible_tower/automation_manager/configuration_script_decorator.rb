module ManageIQ::Providers::AnsibleTower
  class AutomationManager::ConfigurationScriptDecorator < MiqDecorator
    def self.fonticon
      'product product-template'
    end

    def self.fileicon
      '100/configuration_script.png'
    end
  end
end

module ManageIQ::Providers::AnsibleTower
  class AutomationManager::ConfigurationScriptDecorator < MiqDecorator
    def fonticon
      'product product-template'
    end

    def listicon_image
      '100/configuration_script.png'
    end
  end
end

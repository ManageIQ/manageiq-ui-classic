module ManageIQ::Providers::AnsibleTower::AutomationManager
  class ConfigurationScriptDecorator < MiqDecorator
    def fonticon
      'product product-template'
    end

    def listicon_image
      '100/configuration_script.png'
    end
  end
end

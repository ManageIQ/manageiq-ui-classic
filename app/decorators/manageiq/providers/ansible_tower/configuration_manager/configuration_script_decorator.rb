class ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScriptDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'product product-template'.freeze
  end

  def listicon_image
    '100/configuration_script.png'
  end
end

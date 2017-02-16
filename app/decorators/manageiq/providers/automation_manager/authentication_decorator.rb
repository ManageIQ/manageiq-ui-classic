class ManageIQ::Providers::AutomationManager::AuthenticationDecorator < Draper::Decorator
  delegate_all

  def fonticon
    nil
  end

  def listicon_image
    '100/authentication.png'
  end
end

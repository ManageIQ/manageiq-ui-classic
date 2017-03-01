class ManageIQ::Providers::AutomationManager::AuthenticationDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'fa fa-lock'
  end

  def listicon_image
    '100/authentication.png'
  end
end

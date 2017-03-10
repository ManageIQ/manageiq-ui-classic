module ManageIQ::Providers
  class AutomationManager::AuthenticationDecorator < MiqDecorator
    def fonticon
      'fa fa-lock'
    end

    def listicon_image
      '100/authentication.png'
    end
  end
end

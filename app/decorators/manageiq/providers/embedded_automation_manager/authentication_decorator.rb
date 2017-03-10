module ManageIQ::Providers
  class EmbeddedAutomationManager::AuthenticationDecorator < MiqDecorator
    def self.fonticon
      'fa fa-lock'
    end

    def listicon_image
      '100/authentication.png'
    end
  end
end

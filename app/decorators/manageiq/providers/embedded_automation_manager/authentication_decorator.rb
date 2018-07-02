module ManageIQ::Providers
  class EmbeddedAutomationManager::AuthenticationDecorator < MiqDecorator
    def self.fonticon
      'pficon pficon-locked'
    end

    def single_quad
      {
        :fonticon => fonticon
      }
    end
  end
end

module ManageIQ::Providers
  class EmbeddedAutomationManager::ConfigurationScriptSourceDecorator < MiqDecorator
    def self.fonticon
      "pficon pficon-repository"
    end

    def single_quad
      {
        :fonticon => fonticon
      }
    end
  end
end

module ManageIQ::Providers
  class CloudManager::AuthKeyPairDecorator < MiqDecorator
    def self.fileicon
      '100/auth_key_pair.png'
    end

    def single_quad
      {
        :fileicon => fileicon
      }
    end
  end
end

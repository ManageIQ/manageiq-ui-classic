class AuthPrivateKeyDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-keys'
  end

  def self.fileicon
    "100/auth_key_pair.png"
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

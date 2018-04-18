class AuthPrivateKeyDecorator < MiqDecorator
  def self.fonticon
    'ff ff-cloud-keys'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

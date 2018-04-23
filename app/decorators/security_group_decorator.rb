class SecurityGroupDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-cloud-security'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

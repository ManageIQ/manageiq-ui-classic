class SecurityGroupDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-cloud-security'
  end

  def self.fileicon
    '100/security_group.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

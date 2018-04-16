class FloatingIpDecorator < MiqDecorator
  def self.fonticon
    'ff ff-floating-ip'
  end

  def self.fileicon
    '100/floating_ip.png'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

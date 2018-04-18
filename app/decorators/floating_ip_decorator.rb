class FloatingIpDecorator < MiqDecorator
  def self.fonticon
    'ff ff-floating-ip'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

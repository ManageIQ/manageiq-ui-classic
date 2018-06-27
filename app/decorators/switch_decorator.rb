class SwitchDecorator < MiqDecorator
  def self.fonticon
    'ff ff-network-switch'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

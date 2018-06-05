class ConfiguredSystemDecorator < MiqDecorator
  def self.fonticon
    'ff ff-configured-system'
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

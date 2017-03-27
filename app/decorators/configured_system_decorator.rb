class ConfiguredSystemDecorator < MiqDecorator
  def self.fonticon
    'product product-configured_system'
  end

  def fileicon
    "100/#{image_name.downcase}.png"
  end
end

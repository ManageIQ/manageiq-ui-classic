class ConfiguredSystemDecorator < MiqDecorator
  def fonticon
    'product product-configured_system'
  end

  def listicon_image
    "100/#{image_name.downcase}.png"
  end
end

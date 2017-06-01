class ConfiguredSystemDecorator < MiqDecorator
  def self.fonticon
    'ff ff-configured-system'
  end

  def fileicon
    "100/#{image_name.downcase}.png"
  end
end

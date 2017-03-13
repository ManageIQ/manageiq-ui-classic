class RegistryItemDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def listicon_image
    "100/#{image_name.downcase}.png"
  end
end

class RegistryItemDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def fileicon
    "100/#{image_name.downcase}.png"
  end
end

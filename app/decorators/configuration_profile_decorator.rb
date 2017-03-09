class ConfigurationProfileDecorator < MiqDecorator
  def fonticon
    if id.nil?
      'pficon pficon-folder-close'
    else
      'fa fa-list-ul'
    end
  end

  def listicon_image
    if id.nil?
      "100/folder.png"
    else
      "100/#{image_name.downcase}.png"
    end
  end
end

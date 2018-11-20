class GenericObjectDefinitionDecorator < MiqDecorator
  def self.fonticon
    'fa fa-file-text-o'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : nil
  end

  def quadicon
    {
      :fileicon => fileicon,
      :fonticon => fileicon ? nil : fonticon
    }
  end
end

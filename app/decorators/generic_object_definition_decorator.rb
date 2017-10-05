class GenericObjectDefinitionDecorator < MiqDecorator
  def self.fonticon
    'fa fa-file-text-o'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : "100/generic_object_definition.png"
  end
end

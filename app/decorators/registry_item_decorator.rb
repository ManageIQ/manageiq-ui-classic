class RegistryItemDecorator < MiqDecorator
  def fonticon
    image_name == 'registry_string_items' ? 'ff ff-file-txt-o' : 'ff ff-file-bin-o'
  end
end

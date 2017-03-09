class CustomButtonSetDecorator < MiqDecorator
  def fonticon
    set_data && set_data[:button_image] ? "product product-custom-#{set_data[:button_image]}" : 'pficon pficon-folder-close'
  end
end

class CustomButtonSetDecorator < MiqDecorator
  def fonticon
    set_data && set_data[:button_image] ? "miq-custom-button-#{set_data[:button_image]}" : 'pficon pficon-folder-close'
  end
end

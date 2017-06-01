class CustomButtonDecorator < MiqDecorator
  def fonticon
    options && options[:button_image] ? "miq-custom-button-#{options[:button_image]}" : 'fa fa-file-o'
  end
end

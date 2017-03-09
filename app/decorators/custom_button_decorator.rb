class CustomButtonDecorator < MiqDecorator
  def fonticon
    options && options[:button_image] ? "product product-custom-#{options[:button_image]}" : 'fa fa-file-o'
  end
end

class CustomButtonDecorator < MiqDecorator
  def fonticon
    options && options[:button_icon] ? options[:button_icon] : 'fa fa-file-o'
  end
end

class CustomButtonSetDecorator < MiqDecorator
  def fonticon
    set_data && set_data[:button_icon] ? set_data[:button_icon] : 'pficon pficon-folder-close'
  end
end

class ConfigurationProfileDecorator < MiqDecorator
  def fonticon
    if id.nil?
      'pficon pficon-folder-close'
    else
      'fa fa-list-ul'
    end
  end

  def single_quad
    {
      :fonticon => fonticon
    }
  end
end

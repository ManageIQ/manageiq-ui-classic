class ServiceDecorator < MiqDecorator
  def fonticon
    'pficon pficon-service'
  end

  def listicon_image
    try(:picture) ? "/pictures/#{picture.basename}" : "100/service.png"
  end
end

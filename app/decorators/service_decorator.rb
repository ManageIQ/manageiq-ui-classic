class ServiceDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-service'
  end

  def listicon_image
    try(:picture) ? "/pictures/#{picture.basename}" : "100/service.png"
  end
end

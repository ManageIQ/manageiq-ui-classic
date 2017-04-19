class ServiceTemplateDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cube'
  end

  def fonticon
    atomic? ? super : 'fa fa-cubes'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : "100/service_template.png"
  end
end

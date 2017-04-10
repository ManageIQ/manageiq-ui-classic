class ServiceTemplateAnsibleTowerDecorator < MiqDecorator
  def self.fonticon
    'product product-template'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : "100/service_template.png"
  end
end

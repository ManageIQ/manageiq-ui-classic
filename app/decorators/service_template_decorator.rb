class ServiceTemplateDecorator < MiqDecorator
  def self.fonticon
    'fa fa-cube'
  end

  def fonticon
    atomic? ? super : 'fa fa-cubes'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : nil
  end

  def single_quad
    fileicon ? {:fileicon => fileicon} : {:fonticon => fonticon}
  end
end

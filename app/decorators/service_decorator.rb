class ServiceDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-service'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : nil
  end

  def single_quad
    fileicon ? {:fileicon => fileicon} : {:fonticon => fonticon}
  end
end

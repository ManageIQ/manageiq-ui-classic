class GenericObjectDecorator < MiqDecorator
  def self.fonticon
    'ff ff-generic-object'
  end

  def fileicon
    try(:picture) ? "/pictures/#{picture.basename}" : nil
  end
end

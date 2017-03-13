class ClassificationDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-folder-close'
  end

  def fonticon
    category? ? 'pficon pficon-folder-close' : 'fa fa-tag'
  end
end

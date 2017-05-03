class ClassificationDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-folder-close'
  end

  def fonticon
    category? ? super : 'fa fa-tag'
  end
end

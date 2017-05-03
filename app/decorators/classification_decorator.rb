class ClassificationDecorator < MiqDecorator
  def self.fonticon
    super
  end

  def fonticon
    category? ? 'pficon pficon-folder-close' : 'fa fa-tag'
  end
end

class MiqAeNamespaceDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'pficon pficon-folder-close'
  end
end

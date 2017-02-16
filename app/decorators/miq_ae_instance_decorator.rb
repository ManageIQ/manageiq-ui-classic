class MiqAeInstanceDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'fa fa-file-text-o'
  end
end

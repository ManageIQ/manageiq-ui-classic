class MiqAeClassDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'product product-ae_class'
  end
end

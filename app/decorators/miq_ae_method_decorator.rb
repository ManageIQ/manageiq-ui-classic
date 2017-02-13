class MiqAeMethodDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'product product-ae_method'
  end
end

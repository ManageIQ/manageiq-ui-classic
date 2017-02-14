class MiqAeMethodDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'product product-method'
  end
end

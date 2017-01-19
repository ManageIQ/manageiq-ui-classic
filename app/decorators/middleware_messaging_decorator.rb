class MiddlewareMessagingDecorator < Draper::Decorator
  delegate_all
  include MiddlewareDecoratorMixin

  def fonticon
    'fa fa-exchange'.freeze
  end

  def listicon_image
    '100/middleware_messaging.png'
  end
end

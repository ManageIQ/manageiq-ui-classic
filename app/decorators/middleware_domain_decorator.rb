class MiddlewareDomainDecorator < Draper::Decorator
  delegate_all
  include MiddlewareDecoratorMixin

  def fonticon
    'pficon-domain'.freeze
  end

  def listicon_image
    '100/middleware_domain.png'
  end
end

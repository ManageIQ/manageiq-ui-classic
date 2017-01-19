class MiddlewareDomainDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'pficon-domain'.freeze
  end

  def listicon_image
    '100/middleware_domain.png'
  end
end

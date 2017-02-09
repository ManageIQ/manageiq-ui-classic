class MiddlewareServerGroupDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'pficon-server-group'.freeze
  end

  def listicon_image
    '100/middleware_server_group.png'
  end
end

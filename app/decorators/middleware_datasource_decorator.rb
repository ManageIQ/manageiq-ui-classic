class MiddlewareDatasourceDecorator < Draper::Decorator
  delegate_all

  def fonticon
    'fa fa-database'.freeze
  end

  def listicon_image
    '100/middleware_datasource.png'
  end
end

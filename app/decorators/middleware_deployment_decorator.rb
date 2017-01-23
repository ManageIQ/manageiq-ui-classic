class MiddlewareDeploymentDecorator < Draper::Decorator
  delegate_all

  def fonticon
    if name.end_with? '.ear'
      'product-file-ear-o'
    elsif name.end_with? '.war'
      'product-file-war-o'
    else
      'product-report'
    end
  end

  def listicon_image
    if name.end_with? '.ear'
      '100/middleware_deployment_ear.png'
    elsif name.end_with? '.war'
      '100/middleware_deployment_war.png'
    else
      '100/middleware_deployment.png'
    end
  end
end

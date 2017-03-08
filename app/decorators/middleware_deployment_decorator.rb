class MiddlewareDeploymentDecorator < MiqDecorator
  def self.fonticon
    if name.end_with? '.ear'
      'product product-file-ear-o'
    elsif name.end_with? '.war'
      'product product-file-war-o'
    else
      'fa fa-file-text-o'
    end
  end

  def fonticon
    if name.end_with? '.ear'
      'product product-file-ear-o'
    elsif name.end_with? '.war'
      'product product-file-war-o'
    else
      'fa fa-file-text-o'
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

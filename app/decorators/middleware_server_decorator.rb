class MiddlewareServerDecorator < MiqDecorator
  def fonticon
    nil
  end

  def listicon_image
    case product
    when 'Hawkular'
      'svg/vendor-hawkular.svg'
    when 'JBoss EAP'
      'svg/vendor-jboss-eap.svg'
    else
      'svg/vendor-wildfly.svg'
    end
  end
end

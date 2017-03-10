class MiddlewareServerDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def listicon_image
    case product
    when 'Hawkular'
      'svg/vendor-hawkular.svg'
    when /EAP$/
      'svg/vendor-jboss-eap.svg'
    else
      'svg/vendor-wildfly.svg'
    end
  end
end

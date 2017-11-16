class MiddlewareServerDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-middleware'
  end

  def fileicon
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

class MiddlewareServerDecorator < MiqDecorator
  def self.fonticon
    nil
  end

  def fileicon
    case product
    when 'Hawkular'
      '/assets/svg/vendor-hawkular.svg'
    when /EAP$/
      '/assets/svg/vendor-jboss-eap.svg'
    else
      '/assets/svg/vendor-wildfly.svg'
    end
  end
end

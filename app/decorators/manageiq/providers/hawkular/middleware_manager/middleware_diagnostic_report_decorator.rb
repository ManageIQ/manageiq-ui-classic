module ManageIQ
  module Providers
    module Hawkular
      class MiddlewareManager::MiddlewareDiagnosticReportDecorator < MiqDecorator
        def fonticon
          case status
          when "Error"
            "pficon pficon-error-circle-o"
          when "Ready"
            "pficon pficon-ok"
          else
            "fa fa-lg fa-play-circle-o"
          end
        end
      end
    end
  end
end

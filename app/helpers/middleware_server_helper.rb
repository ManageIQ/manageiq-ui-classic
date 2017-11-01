module MiddlewareServerHelper
  include MiddlewareSummaryHelper
  include_concern 'ComplianceSummaryHelper'
  include_concern 'TextualSummary'
end

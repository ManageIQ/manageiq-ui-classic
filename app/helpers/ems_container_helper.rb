module EmsContainerHelper
  include ContainerSummaryHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'
end

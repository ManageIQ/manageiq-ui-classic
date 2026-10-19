module Mixins
  module ComplianceHistoryMixin
    def serialize_compliance_history(record, count = 10)
      record.compliances.order(:timestamp => :desc).limit(count).map do |check|
        policies_by_id = check.compliance_details
                              .order(:miq_policy_desc, :condition_desc)
                              .group_by(&:miq_policy_id)

        policies = policies_by_id.map do |policy_id, details|
          first = details.first
          {
            :id         => policy_id,
            :name       => first.miq_policy_desc,
            :result     => details.any?(&:miq_policy_result),
            :conditions => details.map do |d|
              {
                :id          => d.id,
                :description => d.condition_desc,
                :result      => d.condition_result,
              }
            end,
          }
        end

        {
          :id        => check.id,
          :timestamp => format_timezone(check.timestamp, Time.zone, 'gtl'),
          :compliant => check.compliant,
          :policies  => policies,
        }
      end
    end
  end
end

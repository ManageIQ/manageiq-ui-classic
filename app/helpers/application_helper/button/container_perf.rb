class ApplicationHelper::Button::ContainerPerf < ApplicationHelper::Button::Basic
  needs(:@record)

  def initialize(view_context, view_binding, instance_data, props)
    super
    @entity = props[:options][:entity] || N_('Entity')
  end

  def disabled?
    unless @record.has_perf_data?
      @error_message = _('No Capacity & Utilization data has been collected for this %{entity}') %
                       {:entity => _(@entity)}
    end

    @error_message.present?
  end
end

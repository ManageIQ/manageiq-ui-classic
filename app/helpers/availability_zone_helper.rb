module AvailabilityZoneHelper
  include TextualSummary

  def accessible_select_event_types
    [[_('Management Events'), 'timeline']]
  end
end

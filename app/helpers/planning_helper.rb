module PlanningHelper
  # Source pulldown in VM Options
  PLANNING_VM_MODES = {
    :allocated => N_("Allocation"),
    :reserved  => N_("Reservation"),
    :used      => N_("Usage"),
    :manual    => N_("Manual Input")
  }.freeze
end

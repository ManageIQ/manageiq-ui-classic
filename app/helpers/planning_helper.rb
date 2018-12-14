module PlanningHelper
  # Choices for Target options show pulldown
  TARGET_TYPE_CHOICES = {
    "EmsCluster" => N_("Clusters"),
    "Host"       => N_("Hosts")
  }.freeze

  # Source pulldown in VM Options
  PLANNING_VM_MODES = {
    :allocated => N_("Allocation"),
    :reserved  => N_("Reservation"),
    :used      => N_("Usage"),
    :manual    => N_("Manual Input")
  }.freeze

  # Choices for the trend limit percent pulldowns
  TREND_LIMIT_PERCENTS = {
    "200%" => 200,
    "190%" => 190,
    "180%" => 180,
    "170%" => 170,
    "160%" => 160,
    "150%" => 150,
    "140%" => 140,
    "130%" => 130,
    "120%" => 120,
    "110%" => 110,
    "100%" => 100,
    "95%"  => 95,
    "90%"  => 90,
    "85%"  => 85,
    "80%"  => 80,
    "75%"  => 75,
    "70%"  => 70,
    "65%"  => 65,
    "60%"  => 60,
    "55%"  => 55,
    "50%"  => 50,
  }.freeze
end

module UiConstants
  # dac - Changed to allow up to 255 characters for all text fields on 1/11/07

  # Choices for Target options show pulldown
  TARGET_TYPE_CHOICES = {
    "EmsCluster" => N_("Clusters"),
    "Host"       => N_("Hosts")
  }

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
  }

  # Report Controller constants
  NOTHING_STRING = "<<< Nothing >>>"
  MAX_REPORT_COLUMNS = 100      # Default maximum number of columns in a report
  GRAPH_MAX_COUNT = 10

  TREND_MODEL = "VimPerformanceTrend"   # Performance trend model name requiring special processing

  # Source pulldown in VM Options
  PLANNING_VM_MODES = {
    :allocated => N_("Allocation"),
    :reserved  => N_("Reservation"),
    :used      => N_("Usage"),
    :manual    => N_("Manual Input")
  }
  VALID_PLANNING_VM_MODES = PLANNING_VM_MODES.keys.index_by(&:to_s)

  TASK_TIME_PERIODS = {
    0 => N_("Today"),
    1 => N_("1 Day Ago"),
    2 => N_("2 Days Ago"),
    3 => N_("3 Days Ago"),
    4 => N_("4 Days Ago"),
    5 => N_("5 Days Ago"),
    6 => N_("6 Days Ago")
  }
  TASK_STATES = [[N_("Initializing"), "initializing"],
                 [N_("Cancelling"), "Cancelling"], [N_("Aborting"), "Aborting"], [N_("Finished"), "Finished"],
                 [N_("Snapshot Create"), "Snapshot_create"], [N_("Scanning"), "Scanning"],
                 [N_("Snapshot Delete"), "Snapshot_delete"], [N_("Synchronizing"), "Synchronizing"],
                 [N_("Deploy Smartproxy"), "Deploy_smartproxy"],
                 [N_("Initialized"), "Initialized"], [N_("Queued"), "Queued"], [N_("Active"), "Active"]].freeze

  PROV_STATES = {
    "pending_approval" => N_("Pending Approval"),
    "approved"         => N_("Approved"),
    "denied"           => N_("Denied")
  }
  PROV_TIME_PERIODS = {
    1  => N_("Last 24 Hours"),
    7  => N_("Last 7 Days"),
    30 => N_("Last 30 Days")
  }

  ALL_TIMEZONES = ActiveSupport::TimeZone.all.collect { |tz| ["(GMT#{tz.formatted_offset}) #{tz.name}", tz.name] }
  # Following line does not include timezones with partial hour offsets
  # ALL_TIMEZONES = ActiveSupport::TimeZone.all.collect{|tz| tz.utc_offset % 3600 == 0 ? ["(GMT#{tz.formatted_offset}) #{tz.name}",tz.name] : nil}.compact

  CATEGORY_CHOICES = {}
  CATEGORY_CHOICES["services"] = N_("Services")
  CATEGORY_CHOICES["software"] = N_("Software")
  CATEGORY_CHOICES["system"] = N_("System")
  CATEGORY_CHOICES["accounts"] = N_("User Accounts")
  CATEGORY_CHOICES["vmconfig"] = N_("VM Configuration")
  # CATEGORY_CHOICES["vmevents"] = "VM Events"

  # Assignment choices
  ASSIGN_TOS = {}

  # This set of assignments was created for miq_alerts
  ASSIGN_TOS["ExtManagementSystem"] = {
    "enterprise"                 => N_("The Enterprise"),
    "ext_management_system"      => N_("Selected Providers"),
    "ext_management_system-tags" => N_("Tagged Providers")
  }
  ASSIGN_TOS["EmsCluster"] = {
    "ems_cluster"      => N_("Selected Cluster / Deployment Roles"),
    "ems_cluster-tags" => N_("Tagged Cluster / Deployment Roles"),
  }.merge(ASSIGN_TOS["ExtManagementSystem"])
  ASSIGN_TOS["Host"] = {
    "host"      => N_("Selected Host / Nodes"),
    "host-tags" => N_("Tagged Host / Nodes")
  }.merge(ASSIGN_TOS["EmsCluster"])
  ASSIGN_TOS["Vm"] = {
    "ems_folder"         => N_("Selected Folders"),
    "resource_pool"      => N_("Selected Resource Pools"),
    "resource_pool-tags" => N_("Tagged Resource Pools"),
    "vm-tags"            => N_("Tagged VMs and Instances")
  }.merge(ASSIGN_TOS["Host"])
  ASSIGN_TOS["Storage"] = {
    "enterprise"   => N_("The Enterprise"),
    "storage"      => N_("Selected Datastores"),
    "storage-tags" => N_("Tagged Datastores"),
    "tenant"       => N_("Tenants")
  }
  ASSIGN_TOS["MiqServer"] = {
    "miq_server" => N_("Selected Servers"),
  }
  ASSIGN_TOS["MiddlewareServer"] = {
    "enterprise"        => N_("The Enterprise"),
    "middleware_server" => N_("Selected Middleware Servers")
  }
  ASSIGN_TOS["ContainerNode"] = {
    "enterprise" => N_("The Enterprise"),
  }


  # This set of assignments was created for chargeback_rates
  ASSIGN_TOS[:chargeback_storage] = ASSIGN_TOS["Storage"]
  ASSIGN_TOS[:chargeback_compute] = {
    "enterprise"             => N_("The Enterprise"),
    "ext_management_system"  => N_("Selected Providers"),
    "ems_cluster"            => N_("Selected Cluster / Deployment Roles"),
    "ems_container"          => N_("Selected Containers Providers"),
    "vm-tags"                => N_("Tagged VMs and Instances"),
    "container_image-tags"   => N_("Tagged Container Images"),
    "container_image-labels" => N_("Labeled Container Images"),
    "tenant"                 => N_("Tenants")
  }

  EXP_COUNT_TYPE = [N_("Count of"), "count"].freeze  # Selection for count based filters
  EXP_FIND_TYPE = [N_("Find"), "find"].freeze        # Selection for find/check filters
  EXP_TYPES = [                           # All normal filters
    [N_("Field"), "field"],
    EXP_COUNT_TYPE,
    [N_("Tag"), "tag"],
    EXP_FIND_TYPE
  ]
  VM_EXP_TYPES = [                        # Special VM registry filter
    [N_("Registry"), "regkey"]
  ]

  # Snapshot ages for delete_snapshots_by_age action type
  SNAPSHOT_AGES = {}
  (1..23).each { |a| SNAPSHOT_AGES[a.hours.to_i] = (a.to_s + (a < 2 ? _(" Hour") : _(" Hours"))) }
  (1..6).each { |a| SNAPSHOT_AGES[a.days.to_i] = (a.to_s + (a < 2 ? _(" Day") : _(" Days"))) }
  (1..4).each { |a| SNAPSHOT_AGES[a.weeks.to_i] = (a.to_s + (a < 2 ? _(" Week") : _(" Weeks"))) }

  # Expression constants
  EXP_TODAY = "Today"
  EXP_FROM = "FROM"
  EXP_IS = "IS"

  # FROM Date/Time expression atom selectors
  FROM_HOURS = [
    N_('This Hour'),
    N_('Last Hour'),
    N_('2 Hours Ago'),
    N_('3 Hours Ago'),
    N_('4 Hours Ago'),
    N_('5 Hours Ago'),
    N_('6 Hours Ago'),
    N_('7 Hours Ago'),
    N_('8 Hours Ago'),
    N_('9 Hours Ago'),
    N_('10 Hours Ago'),
    N_('11 Hours Ago'),
    N_('12 Hours Ago'),
    N_('13 Hours Ago'),
    N_('14 Hours Ago'),
    N_('15 Hours Ago'),
    N_('16 Hours Ago'),
    N_('17 Hours Ago'),
    N_('18 Hours Ago'),
    N_('19 Hours Ago'),
    N_('20 Hours Ago'),
    N_('21 Hours Ago'),
    N_('22 Hours Ago'),
    N_('23 Hours Ago')
  ]
  FROM_DAYS = [
    N_('Today'),
    N_('Yesterday'),
    N_('2 Days Ago'),
    N_('3 Days Ago'),
    N_('4 Days Ago'),
    N_('5 Days Ago'),
    N_('6 Days Ago'),
    N_('7 Days Ago'),
    N_('14 Days Ago')
  ]
  FROM_WEEKS = [
    N_('This Week'),
    N_('Last Week'),
    N_('2 Weeks Ago'),
    N_('3 Weeks Ago'),
    N_('4 Weeks Ago')
  ]
  FROM_MONTHS = [
    N_('This Month'),
    N_('Last Month'),
    N_('2 Months Ago'),
    N_('3 Months Ago'),
    N_('4 Months Ago'),
    N_('6 Months Ago')
  ]
  FROM_QUARTERS = [
    N_('This Quarter'),
    N_('Last Quarter'),
    N_('2 Quarters Ago'),
    N_('3 Quarters Ago'),
    N_('4 Quarters Ago')
  ]
  FROM_YEARS = [
    N_('This Year'),
    N_('Last Year'),
    N_('2 Years Ago'),
    N_('3 Years Ago'),
    N_('4 Years Ago')
  ]

  # Need this for display purpose to map with id
  WIDGET_TYPES = {
    "r"  => N_('Reports'),
    "c"  => N_('Charts'),
    "rf" => N_('RSS Feeds'),
    "m"  => N_('Menus')
  }

  SINGULAR_WIDGET_TYPES = {
    "r"  => N_('Report'),
    "c"  => N_('Chart'),
    "rf" => N_('RSS Feed'),
    "m"  => N_('Menu')
  }
  # Need this for mapping with MiqWidget record content_type field
  WIDGET_CONTENT_TYPE = {
    "r"  => "report",
    "c"  => "chart",
    "rf" => "rss",
    "m"  => "menu"
  }

  VALID_PERF_PARENTS = {
    "EmsCluster" => :ems_cluster,
    "Host"       => :host
  }

  MIQ_AE_COPY_ACTIONS = %w(miq_ae_class_copy miq_ae_instance_copy miq_ae_method_copy)

  UTF_16BE_BOM = [254, 255].freeze
  UTF_16LE_BOM = [255, 254].freeze

  CHAREGEBACK_ALLOCATED_METHODS = {}
  CHAREGEBACK_ALLOCATED_METHODS[:max] = N_('Maximum')
  CHAREGEBACK_ALLOCATED_METHODS[:avg] = N_('Average')
end

# Make these constants globally available
include UiConstants

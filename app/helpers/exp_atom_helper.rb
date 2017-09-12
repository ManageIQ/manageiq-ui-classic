module ExpAtomHelper
  # Selection for count based filters
  EXP_COUNT_TYPE = [N_("Count of"), "count"].freeze

  # Selection for find/check filters
  EXP_FIND_TYPE = [N_("Find"), "find"].freeze

  # All normal filters
  EXP_TYPES = [
    [N_("Field"), "field"],
    EXP_COUNT_TYPE,
    [N_("Tag"), "tag"],
    EXP_FIND_TYPE
  ].freeze

  # Special VM registry filter
  VM_EXP_TYPES = [
    [N_("Registry"), "regkey"]
  ].freeze
end

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

  def self.expression_types_for_secondary_filter(edit_expkey)
    opts = []
    opts.push([_('Field'), 'field']) if edit_expkey[:exp_available_fields].present?
    opts.push([_('Tag'), 'tag']) if edit_expkey.tags_for_display_filters.present?
    opts
  end

  def self.expression_types_for_primary_filter(model, only_tag = false)
    return [[_('Tag'), 'tags']] if only_tag
    return [[_('Field'), 'field']] if model == 'AuditEvent'

    expression_types = EXP_TYPES.map { |x| [_(x[0]), x[1]] }

    if MiqExpression.miq_adv_search_lists(model, :exp_available_finds).empty?
      expression_types -= [[_(EXP_FIND_TYPE[0]), EXP_FIND_TYPE[1]]]
    end

    if MiqExpression.miq_adv_search_lists(model, :exp_available_counts).empty?
      expression_types -= [[_(EXP_COUNT_TYPE[0]), EXP_COUNT_TYPE[1]]]
    end

    expression_types += VM_EXP_TYPES.map { |x| [_(x[0]), x[1]] } if model == 'Vm'
    expression_types
  end
end

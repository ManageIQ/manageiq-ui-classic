module TreeBuilderFiltersMixin
  GLOBAL_FILTERS = {
    :id         => "global",
    :text       => _("Global Filters"),
    :icon       => "pficon pficon-folder-close",
    :tip        => _("Global Shared Filters"),
    :selectable => false
  }.freeze

  MY_FILTERS = {
    :id         => "my",
    :text       => _("My Filters"),
    :icon       => "pficon pficon-folder-close",
    :tip        => _("My Personal Filters"),
    :selectable => false
  }.freeze

  FILTERS = {
    'global' => GLOBAL_FILTERS,
    'my'     => MY_FILTERS
  }.freeze

  private

  def count_only_or_filter_kids(klass, object, count_only)
    # Do not try to load filters with invalid types
    return unless FILTERS.key?(object.try(:[], :id))

    objects = MiqSearch.where(:db => klass).filters_by_type(object[:id])
    count_only_or_objects(count_only, objects, 'description')
  end
end

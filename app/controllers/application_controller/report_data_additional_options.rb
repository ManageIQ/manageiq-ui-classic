class ApplicationController
  ReportDataAdditionalOptions = Struct.new(
    :named_scope,
    :gtl_dbname,
    :model,
    :match_via_descendants,
    :parent_id,
    :parent_method,
    :association,
    :view_suffix
  ) do
    def self.from_options(options)
      additional_options = new()
      additional_options.named_scope = options[:named_scope]
      additional_options.gtl_dbname = options[:gtl_dbname]
      additional_options.model = with_model(options[:model]) if options[:model]
      additional_options.match_via_descendants = options[:match_via_descendants]
      additional_options.parent_id = options[:parent].id if options[:parent]
      additional_options.association = options[:association]
      additional_options.view_suffix = options[:view_suffix]
      additional_options.parent_method = options[:parent_method]
      additional_options
    end

    def with_model(curr_model)
      (curr_model.kind_of? String) ? curr_model : curr_model.name
    end
  end
end

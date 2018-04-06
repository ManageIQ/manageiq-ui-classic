class ApplicationController
  ReportDataAdditionalOptions = Struct.new(
    :named_scope,
    :gtl_dbname,
    :model,
    :match_via_descendants,
    :parent_id,
    :parent_class_name,
    :parent_method,
    :association,
    :view_suffix,

    :row_button,
    :menu_click,
    :sb_controller,

    :listicon,
    :embedded,
    :showlinks,
    :policy_sim,
    :in_a_form,
    :lastaction,
    :display,
    :gtl_type,
    :supported_features_filter,
    :clickable,
    :no_checkboxes,
  ) do
    def self.from_options(options)
      additional_options = new
      additional_options.named_scope = options[:named_scope]
      additional_options.gtl_dbname = options[:gtl_dbname]
      additional_options.with_model(options[:model]) if options[:model]
      additional_options.match_via_descendants = options[:match_via_descendants]
      additional_options.parent_id = options[:parent].id if options[:parent]
      additional_options.parent_class_name = options[:parent].class.name if options[:parent]
      additional_options.association = options[:association]
      additional_options.view_suffix = options[:view_suffix]
      additional_options.parent_method = options[:parent_method]
      additional_options.supported_features_filter = options[:supported_features_filter]
      additional_options.clickable = options[:clickable]
      additional_options
    end

    def with_quadicon_options(options)
      self.listicon   = options[:listicon]
      self.embedded   = options[:embedded]
      self.showlinks  = options[:showlinks]
      self.policy_sim = options[:policy_sim]
      self.lastaction = options[:lastaction]
      self.in_a_form  = options[:in_a_form]
      self.display    = options[:display]
    end

    def with_row_button(row_button)
      self.row_button = row_button
    end

    def with_gtl_type(gtl_type)
      self.gtl_type = gtl_type
    end

    def with_menu_click(menu_click)
      self.menu_click = menu_click
    end

    def with_sb_controller(sb_controller)
      self.sb_controller = sb_controller
    end

    def with_model(curr_model)
      self.model = curr_model.kind_of?(String) ? curr_model : curr_model.name
    end

    def with_no_checkboxes(no_checkboxes)
      self.no_checkboxes = no_checkboxes
    end
  end
end

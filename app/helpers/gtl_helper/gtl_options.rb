module GtlHelper
  GtlOptions = Struct.new(
    :model_name,
    :no_flash_div,
    :gtl_type_string,
    :active_tree,
    :parent_id,
    :selected_records,
    :display,
    :sort_col,
    :sort_dir,
    :explorer,
    :view,
    :db,
    :parent,
    :report_data_additional_options,
    :url
  ) do

    def self.from_hash(opts)
      new(*opts.values_at(*GtlOptions.members))
    end

    def transform_to_settings
      {
        :additionl_opitons => report_data_additional_options,
        :model_name        => model_name,
        :active_tree       => active_tree.to_s,
        :gtl_type          => gtl_type_string,
        :parent_id         => (parent_id.to_s unless display.nil?),
        :sort_col_idx      => sort_col.to_s,
        :sort_dir          => sort_dir,
        :is_explorer       => explorer,
        :records           => !selected_records.nil? ? selected_records : '',
        :hide_select       => selected_records.kind_of?(Array),
        :show_url          => url
      }
    end
  end
end

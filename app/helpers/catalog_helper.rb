module CatalogHelper
  include_concern 'TextualSummary'

  def miq_catalog_resource(resources)
    headers = ["", _("Name"), _("Description"), _("Action Order"), _("Provision Order"), _("Action Start"), _("Action Stop"), _("Delay (mins) Start"), _("Delay (mins) Stop")]
    data = {:rows => [], :headers => headers}
    prev_group = 0
    resources.sort_by { |rsc| [rsc.group_idx, rsc.resource_name.downcase] }.each_with_index do |r, i|
      col_span = 10
      if prev_group != r.group_idx && i < resources.length
        prev_group = r.group_idx
      end

      cells = []
      cells.push(:icon => "pficon pficon-template")
      keys = %w[resource_name resource_description group_idx provision_index start_action stop_action start_delay stop_delay]
      keys.each do |key|
        if %w[start_delay stop_delay].include?(key)
          cells.push({:text => r.send(key) / 60})
        else
          idx = %w[group_idx provision_index].include?(key) ? r.send(key).to_i + 1 : r.send(key)
          cells.push({:text => idx})
        end
      end
      row = {
        :id        => i.to_s,
        :title     => _("Click to this Catalog Item"),
        :onclick   => remote_function(:loading  => "miqSparkle(true);",
                                      :complete => "miqSparkle(false);",
                                      :url      => "/catalog/x_show/#{r.resource_id}"),
        :cells     => cells,
        :clickable => true
      }
      data[:rows].push(row)
    end
    data
  end
end

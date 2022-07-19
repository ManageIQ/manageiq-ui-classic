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

  def service_catalog_summary(record, sb_data)
    data = {:title => _('Basic Info'), :mode => "miq_report_service_catalog_summary"}
    image = record.picture ? {:image => "#{record.picture.url_path}?#{rand(99_999_999)}"} : {:icon => "fa fa-cube fa-4x"}
    data[:rows] = [
      {:cells => image},
      row_data(_('Name'), record.name),
      row_data(_('Description'), record.description),
      row_data(_('Long Description'), record.long_description),
      row_data(_('Dialog'), sb_data[:dialog_label]),
    ]
    if record.currency && record.price
      data[:rows].push(row_data(_('Price / Month (in %{currency})') % {:currency => record.currency.code}, record.price.to_s))
    end
    disable = !record.template_valid?
    action = disable ? '' : "miqOrderService(#{record.id});"
    data[:rows].push({:cells => {:button => {:name => _("Order"), :action => action, :disabled => disable}}})
    miq_structured_list(data)
  end

  private

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end

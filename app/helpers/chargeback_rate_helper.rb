module ChargebackRateHelper
  def rate_detail_group(rd_group)
    rd_groups = {
      'cpu'       => _('CPU'),
      'cpu_cores' => _('CPU Cores'),
      'disk_io'   => _('Disk I/O'),
      'fixed'     => _('Fixed'),
      'memory'    => _('Memory'),
      'net_io'    => _('Network I/O'),
      'storage'   => _('Storage')
    }
    rd_groups[rd_group] || rd_group.titleize
  end

  def ranges_and_rates(num_tiers, tiers, detail, first_tier)
    range_rate = {
      :start      => [first_tier.start || 0],
      :finish     => [first_tier.finish == Float::INFINITY ? _('Infinity') : first_tier.finish],
      :fixed_rate => [first_tier.fixed_rate || 0.0],
      :group      => [detail[:group] == 'fixed' && first_tier.variable_rate.zero? ? '-' : first_tier.variable_rate]
    }
    (1..num_tiers.to_i - 1).each do |tier_index|
      tier = tiers.to_a[tier_index]
      range_rate[:start].push(tier.start)
      range_rate[:finish].push(tier.finish == Float::INFINITY ? _('Infinity') : tier.finish)
      range_rate[:fixed_rate].push(tier.fixed_rate)
      range_rate[:group].push(detail.chargeable_field[:group] == 'fixed' && tier.variable_rate.zero? ? '-' : tier.variable_rate)
    end
    @range_rate = range_rate
  end

  def rate_summary(data, optional)
    rows = []
    data.to_a.sort_by { |rd| [rd.chargeable_field[:group].downcase, rd.chargeable_field[:description].downcase, rd[:sub_metric].to_s.downcase] }.each_with_index do |detail, detail_index|
      cells = []
      tiers = detail.chargeback_tiers.order(:start)
      @cur_group = detail.chargeable_field[:group] if @cur_group.nil?
      if @cur_group != detail.chargeable_field[:group]
        @cur_group = detail.chargeable_field[:group]
      end
      num_tiers = detail.chargeback_tiers.to_a.blank? ? "1" : tiers.to_a.length.to_s
      cells.push({:text => rate_detail_group(detail.chargeable_field[:group])})
      cells.push({:text => [
                   _(detail.chargeable_field[:description]),
                   Dictionary.gettext(detail.chargeable_field.metric_key, :type => :column, :notfound => :titleize)
                 ]})
      if optional && detail.sub_metrics.present?
        cells.push({:text => detail.sub_metric_human})
      end
      ranges_and_rates(num_tiers, tiers, detail, tiers.first)
      cells.push({:text => @range_rate[:start]})
      cells.push({:text => @range_rate[:finish]})
      cells.push({:text => @range_rate[:fixed_rate]})
      cells.push({:text => @range_rate[:group]})
      cells.push({:text => detail.show_rates})
      rows.push({:id => detail_index.to_s, :clickable => false, :cells => cells})
    end
    @initial_data = rows
  end
end

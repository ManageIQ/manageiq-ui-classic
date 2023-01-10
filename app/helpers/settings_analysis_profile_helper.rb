module SettingsAnalysisProfileHelper
  private

  def settings_analysis_profile_summary(selected_scan, categories, files, file_stats, registry, nteventlog)
    summary = [settings_analysis_basic_info(selected_scan)]
    summary.push(settings_analysis_categories(categories)) if categories && selected_scan.mode != "Host"
    summary.push(settings_analysis_files(files, file_stats)) if files
    summary.push(settings_analysis_registry_items(registry)) if registry && selected_scan.mode != "Host"
    summary.push(settings_analysis_event_log_items(nteventlog)) if nteventlog
    safe_join(summary)
  end

  def settings_analysis_basic_info(selected_scan)
    data = {
      :title => _('Basic Information'),
      :mode  => "settings_analysis_basic_info",
      :rows  => [
        row_data(_('Name'), selected_scan.name),
        row_data(_('Description'), selected_scan.description),
        row_data(_('Type'), selected_scan.mode),
        row_data(_('Type'), selected_scan.mode),
      ]
    }
    miq_structured_list(data)
  end

  def settings_analysis_categories(categories)
    data = {
      :title => _('Categories'),
      :mode  => "settings_analysis_catrgories",
      :rows  => categories.sort.map do |category|
        {:cells => [{:value => category}]}
      end
    }
    miq_structured_list(data)
  end

  def settings_analysis_files(files, file_stats)
    data = {
      :title   => _("File Items"),
      :mode    => "settings_analysis_files bordered-list simple_table",
      :headers => [_("Name"), _("Collect Contents?")],
      :rows    => files.sort.map do |file|
        {:cells => [{:value => file}, {:value => file_stats[file.to_s]}]}
      end
    }
    miq_structured_list(data)
  end

  def settings_analysis_registry_items(registry)
    data = {
      :title   => _("Registry Items"),
      :mode    => "settings_analysis_registry_items bordered-list simple_table",
      :headers => [_("Registry Keys"), _("Registry Values")],
      :rows    => registry.sort_by { |r| r["key"] }.map do |k|
        {:cells => [{:value => "#{k['hive']}\\#{k['key']}"}, {:value => k["value"]}]}
      end
    }
    miq_structured_list(data)
  end

  def settings_analysis_event_log_items(nteventlog)
    data = {
      :title => _('Event Log Items'),
      :mode  => "settings_analysis_event_log_items",
      :rows  => nteventlog.sort_by { |l| l[:name] }.map do |k|
        {:cells => [{:value => k[:name]}]}
      end
    }
    miq_structured_list(data)
  end
end

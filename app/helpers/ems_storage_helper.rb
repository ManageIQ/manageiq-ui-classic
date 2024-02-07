module EmsStorageHelper
  include TextualSummary

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_storages_path : ems_storages_path(ems)
  end
end

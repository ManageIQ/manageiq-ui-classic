module EmsStorageHelper
  include_concern 'TextualSummary'

  def edit_redirect_path(lastaction, ems)
    lastaction == 'show_list' ? ems_block_storage_path : ems_block_storage_path(ems)
  end
end

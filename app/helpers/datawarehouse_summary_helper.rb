module DatawarehouseSummaryHelper
  include TextualMixins::TextualName

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_nativeid
    @record.nativeid
  end

  def textual_group_smart_management
    %i(tags)
  end

  def textual_datawarehouse_shards
    textual_link(@ems.datawarehouse_shards)
  end

  def textual_datawarehouse_indices
    textual_link(@ems.datawarehouse_indices)
  end

  def textual_datawarehouse_nodes
    textual_link(@ems.datawarehouse_nodes)
  end
end

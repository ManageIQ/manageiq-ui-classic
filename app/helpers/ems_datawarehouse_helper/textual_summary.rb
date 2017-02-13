module EmsDatawarehouseHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
    %i(name type hostname port cluster_name active_shards elastic_version lucene_version)
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    %i(ems datawarehouse_nodes)
  end

  def textual_group_status
    %i(refresh_status cluster_status)
  end

  def textual_group_smart_management
    %i(tags)
  end

  #
  # Items
  #

  def textual_name
    @record.name
  end

  def textual_type
    @record.emstype_description
  end

  def textual_hostname
    @record.hostname
  end

  def textual_port
    @record.supports_port? ? @record.port : nil
  end

  def textual_cluster_status
    @ems.cluster_attributes.find_by(:name => "health-status").value
  end

  def textual_lucene_version
    @ems.cluster_attributes.find_by(:name => "version-lucene_version").value
  end

  def textual_elastic_version
    @ems.cluster_attributes.find_by(:name => "version-number").value
  end

  def textual_cluster_name
    @ems.cluster_attributes.find_by(:name => "version-cluster_name").value
  end

  def textual_active_shards
    @ems.cluster_attributes.find_by(:name => "health-active_shards").value
  end
end

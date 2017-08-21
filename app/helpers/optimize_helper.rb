module OptimizeHelper
  # Parse a tree node and set the @nodetype and @record vars
  def get_nodetype_and_record(treenodeid)
    # @nodetype, nodeid = treenodeid.split("-").last.split("_")
    @nodetype, nodeid = treenodeid.split("-")
    node_ids = {}
    treenodeid.split("-").each do |p|
      node_ids[p.split("_").first] = p.split("_").last # Create a hash of all record ids represented by the selected tree node
    end
    @sb[:node_ids] ||= {}
    @sb[:node_ids][x_active_tree] = node_ids
    case @nodetype
    when "root"
      @record = MiqEnterprise.my_enterprise
    when "mr" # Region
      @record = MiqRegion.find_by(:id => from_cid(nodeid))
    when "e"  # Mgmt Sys
      @record = ExtManagementSystem.find_by(:id => from_cid(nodeid))
    when "c"  # Cluster
      @record = EmsCluster.find_by(:id => from_cid(nodeid))
    when "h"  # Host
      @record = Host.find_by(:id => from_cid(nodeid))
    when "ds" # Storage
      @record = Storage.find_by(:id => from_cid(nodeid))
    end
  end
end

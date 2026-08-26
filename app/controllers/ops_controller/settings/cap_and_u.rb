module OpsController::Settings::CapAndU
  extend ActiveSupport::Concern

  def cu_collection_update
    assert_privileges("region_edit")

    cu_build_collection_data

    cu_collection_get_form_vars

    if @edit[:new][:all_clusters] != @edit[:current][:all_clusters]
      Metric::Targets.perf_capture_always = {
        :host_and_cluster => @edit[:new][:all_clusters]
      }
    end

    if @edit[:new][:all_storages] != @edit[:current][:all_storages]
      Metric::Targets.perf_capture_always = {
        :storage => @edit[:new][:all_storages]
      }
    end

    set_perf_collection_for_clusters if @edit[:new] != @edit[:current]

    if @edit[:new][:non_cl_hosts].present?
      # Match by ID to avoid relying on positional ordering — the DB query in
      # cu_build_collection_data does not guarantee the same order between the
      # fetch and update requests.
      new_nc_hosts_by_id = @edit[:new][:non_cl_hosts].index_by { |h| h[:id] }
      @edit[:current][:non_cl_hosts].each do |h_id|
        new_capture = new_nc_hosts_by_id.dig(h_id[:id], :capture)
        next if new_capture.nil?

        h = Host.find(h_id[:id])
        h.perf_capture_enabled = new_capture
      end
    end

    all_storages_turned_off = @edit[:current][:all_storages] && !@edit[:new][:all_storages]
    if all_storages_turned_off || @edit[:new][:storages] != @edit[:current][:storages]
      @edit[:new][:storages].each_value do |s|
        storage = Storage.find(s[:id])
        storage.perf_capture_enabled = s[:capture]
      end
    end

    render :json => {:success => true, :message => _("Capacity and Utilization Collection settings saved")}
  rescue MiqException::RbacPrivilegeException
    raise
  rescue => e
    render :json => {:success => false, :message => e.message}, :status => 422
  end

  def cu_collection_fetch
    assert_privileges("region_edit")

    cu_build_collection_data

    # Cluster hosts are stored under their cluster's integer ID key in @edit[:current].
    # Iterate numeric keys to collect all per-cluster host arrays.
    hosts = @edit[:current].each_with_object([]) do |(key, value), arr|
      next unless key.kind_of?(Numeric)

      value.each { |host| arr << host }
    end

    render :json => {
      :hosts          => hosts,
      :datastores     => @edit[:current][:storages].values,
      :all_clusters   => @edit[:current][:all_clusters],
      :all_datastores => @edit[:current][:all_storages]
    }
  end

  private

  def cu_build_edit_screen
    cu_build_collection_data
  end

  def cu_build_collection_data
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "cu_edit__collection"
    @edit[:current][:all_clusters] = Metric::Targets.perf_capture_always[:host_and_cluster]
    @edit[:current][:all_storages] = Metric::Targets.perf_capture_always[:storage]
    @edit[:current][:clusters] = []
    @cl_hash = EmsCluster.get_perf_collection_object_list
    @cl_hash.each_with_index do |h, j|
      _cid, cl_hash = h
      c = cl_hash[:cl_rec]
      enabled = cl_hash[:ho_enabled]
      enabled_host_ids = enabled.collect(&:id)
      hosts = (cl_hash[:ho_enabled] + cl_hash[:ho_disabled]).sort_by { |ho| ho.name.downcase }
      cl_enabled = enabled_host_ids.length == hosts.length
      en_flg = cl_enabled && !enabled.empty?
      @edit[:current][:clusters].push(:id => c.id, :capture => en_flg)
      @edit[:current][c.id] = []
      hosts.each do |host|
        host_capture = enabled_host_ids.include?(host.id.to_i)
        @edit[:current][c.id].push(:id => host.id, :capture => host_capture)
      end
      flg = true
      count = 0
      @edit[:current][c.id].each do |host|
        unless host[:capture]
          count += 1 # if all hosts are unchecked, cluster capture is false; partial = "undefined"
          flg = count == @edit[:current][c.id].length ? false : "undefined"
        end
        @edit[:current][:clusters][j][:capture] = flg
      end
    end
    @edit[:current][:clusters].sort_by! { |c| c[:name] }

    # Non-clustered hosts
    @edit[:current][:non_cl_hosts] = []
    ExtManagementSystem.in_my_region.each do |e|
      e.non_clustered_hosts.each do |h|
        @edit[:current][:non_cl_hosts] << {:id => h.id, :capture => h.perf_capture_enabled?}
      end
    end

    if @edit[:current][:clusters].present?
      @cluster_tree = TreeBuilderClusters.new(:cluster_tree, @sb, true, :root => @cl_hash)
    end

    @edit[:current][:storages] = {}
    Storage.in_my_region.includes(:taggings, :tags, :hosts).select(:id, :name, :location).sort_by { |s| s.name.downcase }.each do |s|
      @edit[:current][:storages][s.id] = {:id => s.id, :capture => s.perf_capture_enabled?}
    end

    if @edit[:current][:storages].present?
      @datastore_tree = TreeBuilderDatastores.new(:datastore_tree, @sb, true, :root => @edit[:current][:storages])
    end

    @edit[:new] = copy_hash(@edit[:current])
  end

  def set_perf_collection_for_clusters
    cluster_ids = @edit[:new][:clusters].map { |c| c[:id] }.uniq
    clusters = EmsCluster.where(:id => cluster_ids).includes(:hosts)

    clusters.each do |cl|
      enabled_hosts = @edit[:new][cl.id].select { |h| h[:capture] }
      enabled_host_ids = enabled_hosts.collect { |h| h[:id] }.uniq
      cl.perf_capture_enabled_host_ids = enabled_host_ids
    end
  end

  def cu_collection_get_form_vars
    # React sends typed JSON booleans; coerce defensively in case form-encoding
    # sends strings so that the != comparisons with @edit[:current] stay type-consistent.
    @edit[:new][:all_clusters] = ActiveModel::Type::Boolean.new.cast(params[:all_clusters])
    @edit[:new][:all_storages] = ActiveModel::Type::Boolean.new.cast(params[:all_datastores])

    Array(params[:clusters_checked]).each do |cluster|
      model, node_id, _ = TreeBuilder.extract_node_model_and_id(cluster[:id])
      cluster_tree_settings(model, node_id, cluster)
    end
    Array(params[:datastores_checked]).each do |storage|
      _, node_id, _ = TreeBuilder.extract_node_model_and_id(storage[:id])
      @edit[:new][:storages][node_id.to_i][:capture] = storage[:capture]
    end
    Array(params[:hosts_checked]).each do |host|
      model, node_id, _ = TreeBuilder.extract_node_model_and_id(host[:id])
      cluster_tree_settings(model, node_id, host)
    end
  end

  def cluster_tree_settings(model, node_id, cluster_or_host)
    # Coerce capture to a genuine boolean — React sends true/false via JSON but
    # form-encoding or middleware could deliver "true"/"false" strings, which are
    # truthy in Ruby regardless of value.
    capture = ActiveModel::Type::Boolean.new.cast(cluster_or_host[:capture])

    if node_id == "NonCluster" # Clicked on all non-clustered hosts
      @edit[:new][:non_cl_hosts].each { |c| c[:capture] = capture }
    elsif model == "EmsCluster" # Clicked on a cluster
      @edit[:new][node_id.to_i].each { |h| h[:capture] = capture }
    elsif model == "Host" # Clicked on a host
      nc_host = @edit[:new][:non_cl_hosts].find { |x| x[:id] == node_id.to_i }
      # The host is among the non-clustered ones
      return nc_host[:capture] = capture if nc_host

      # The host is under a cluster, find it and change it
      @edit[:new][:clusters].find do |cl|
        @edit[:new][cl[:id]].find do |h|
          found = h[:id] == node_id.to_i
          h[:capture] = capture if found
          found
        end
      end
    end
  end
end

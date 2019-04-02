class HawkularProxyService
  TENANT_LABEL_MAX_LEN = 25
  TENANT_LABEL_SPECIAL_CASES = {
    "_system"                      => _("System"),
    "_ops"                         => _("Operations"),
    "default"                      => _("Default"),
    "admin"                        => _("Admin"),
    "openshift-infra"              => _("OpenShift Infra"),
    "kubernetes-nodes"             => _("Kubernetes Nodes"),
    "kubernetes-apiservers"        => _("Kubernetes API servers"),
    "kubernetes-cadvisor"          => _("Kubernetes cAdvisor"),
    "kubernetes-service-endpoints" => _("Kubernetes Service"),
  }.freeze

  def initialize(provider_id, controller)
    @db_name = "Hawkular"
    @provider_id = provider_id
    @controller = controller

    @params = controller.params
    @ems = ExtManagementSystem.find(@provider_id.to_i) if @provider_id.present?
    @tenant = @params['tenant'] || '_system'

    @cli = ManageIQ::Providers::Kubernetes::ContainerManager::MetricsCapture::HawkularClient.new(@ems, @tenant)
  end

  def client(type = nil)
    clients = {
      :counter => @cli.hawkular_client.counters,
      :gauge   => @cli.hawkular_client.gauges
    }
    client_type = type || @params['type'] || :gauge

    clients[client_type.to_sym]
  end

  def data(query)
    params = _params

    case query
    when 'metric_definitions'
      data = metric_definitions(params)

      items = data.count
      page = params[:page].to_i
      items_per_page = params[:items_per_page].to_i
      pages = (items.to_f / items_per_page.to_f).ceil
      start_index = items_per_page * (page - 1)
      end_index = start_index + items_per_page

      metrics = add_last_readings(data[start_index...end_index])

      {
        :page               => page,
        :items              => items,
        :items_per_page     => items_per_page,
        :pages              => pages,
        :limit              => params[:limit].to_i,
        :metric_definitions => metrics
      }
    when 'metric_tags'
      {
        :metric_tags => metric_tags(params)
      }
    when 'get_data'
      data = get_data(params[:metric_id], params).compact
      limit = params[:limit].to_i

      {
        :data => data[0..limit]
      }
    when 'get_tenants'
      {
        :tenants => tenants(params[:limit].to_i)
      }
    else
      {
        :error => "Bad query"
      }
    end
  rescue StandardError => e
    msg = _("(Please check your %{type} server)") % {:type => @db_name}
    {
      :parameters => params,
      :error      => ActionView::Base.full_sanitizer.sanitize(e.to_s) + " " + msg
    }
  end

  def metric_definitions(params)
    limit = params[:limit].to_i
    list = _metric_definitions(params).map { |m| m.json if m.json }

    list.sort { |a, b| a["id"].downcase <=> b["id"].downcase }[0...limit]
  end

  def metric_tags(params)
    definitions = metric_definitions(params)
    tags = definitions.map do |x|
      x["tags"]&.keys
    end

    tags.compact.flatten.uniq.sort.map do |tag|
      {:tag => tag, :options => metric_tags_options(tag, definitions)}
    end
  end

  def get_data(id, params, type = nil)
    client(type).get_data(id,
                          :limit          => params[:limit].to_i,
                          :starts         => params[:starts].to_i,
                          :ends           => params[:ends].to_i,
                          :bucketDuration => params[:bucketDuration] || nil,
                          :order          => params[:order] || 'ASC')
  end

  def tenant_id(id)
    id.split(':')[0] if id
  end

  def tenants(limit)
    tenants = @cli.hawkular_client.http_get('/tenants')

    if @params['include'].blank?
      tenants.map! { |x| {:label => labelize(x["id"]), :value => tenant_id(x["id"])} }
    else
      tenants.map! { |x| {:label => labelize(x["id"]), :value => tenant_id(x["id"])} if x["id"].include?(@params['include']) }
    end

    tenants.compact[0...limit]
  end

  private

  def get_raw_data(ids, type)
    starts = 7.days.ago.utc.to_i * 1000
    ends = DateTime.now.utc.to_i * 1000
    limit = 12

    data = client(type).raw_data(ids,
                                 :starts => starts,
                                 :ends   => ends,
                                 :limit  => limit)

    data.map { |m| [type.to_s + m["id"], m["data"]] }.to_h
  end

  def add_last_readings(metrics)
    return metrics unless @db_name == "Hawkular"

    ids = metrics.map { |m| m["id"] if m["type"] == "gauge" }.compact
    gauges_data = get_raw_data(ids, "gauge") if ids.any?

    ids = metrics.map { |m| m["id"] if m["type"] == "counter" }.compact
    counters_data = get_raw_data(ids, "counter") if ids.any?

    data = (gauges_data || {}).merge(counters_data || {})
    metrics.map { |m| m.merge(:data => data[m["type"] + m["id"]]) }
  end

  def metric_tags_options(tag, definitions)
    options = definitions.map do |x|
      x["tags"][tag] if x["tags"] && x["tags"].keys.include?(tag)
    end

    options.compact.flatten.uniq.sort
  end

  def labelize(id)
    id = tenant_id(id)

    tenant_labels = TENANT_LABEL_SPECIAL_CASES.symbolize_keys
    if Settings.hawkular_tenant_labels
      tenant_labels.merge!(Settings.hawkular_tenant_labels.to_hash)
    end

    tenant_labels.fetch(id.to_sym, id.truncate(TENANT_LABEL_MAX_LEN))
  end

  def _metric_definitions(params)
    tags, type = params[:tags], params[:type]
    if type.blank?
      client(:counter).query(tags).compact +
        client(:gauge).query(tags).compact
    else
      client.query(tags).compact
    end
  end

  def _params
    ends = @params['ends'] || (DateTime.now.utc.to_i * 1000)
    starts = @params['starts'].presence || ends.to_i - 8 * 60 * 60 * 1000

    {
      :type           => @params['type'],
      :metric_id      => @params['metric_id'],
      :tags           => parse_tags,
      :page           => @params['page'] || 1,
      :items_per_page => @params['items_per_page'] || 15,
      :limit          => @params['limit'] || 10_000,
      :ends           => ends.to_i,
      :starts         => starts.to_i,
      :bucketDuration => @params['bucket_duration'],
      :order          => @params['order']
    }
  end

  def parse_tags
    tags = @params['tags'].blank? ? nil : JSON.parse(@params['tags'])

    tags == {} ? nil : tags
  end
end

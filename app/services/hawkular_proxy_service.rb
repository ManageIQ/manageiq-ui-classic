class HawkularProxyService
  include UiServiceMixin

  TENANT_LABEL_MAX_LEN = 25
  TENANT_LABEL_SPECIAL_CASES = {
    "_system"         => "System",
    "_ops"            => "Operations",
    "default"         => "Default",
    "admin"           => "Admin",
    "openshift-infra" => "OpenShift Infra"
  }.freeze

  def initialize(provider_id, controller)
    @provider_id = provider_id
    @controller = controller

    @params = controller.params
    @ems = ManageIQ::Providers::ContainerManager.find(@provider_id) unless @provider_id.blank?
    @tenant = @params['tenant'] || '_system'

    @cli = ManageIQ::Providers::Kubernetes::ContainerManager::MetricsCapture::HawkularClient.new(@ems, @tenant)
  end

  def client
    if @params['type'] == "counter"
      @cli.hawkular_client.counters
    else
      @cli.hawkular_client.gauges
    end
  end

  def data(query)
    params = {
      :type           => @params['type'],
      :metric_id      => @params['metric_id'],
      :tags           => _tags,
      :page           => @params['page'] || 1,
      :items_per_page => @params['items_per_page'] || 15,
      :limit          => @params['limit'] || 10_000,
      :ends           => @params['ends'] || (DateTime.now.to_i * 1000),
      :starts         => @params['starts'],
      :bucketDuration => @params['bucket_duration'],
      :order          => @params['order']
    }

    params[:starts] = (params[:ends] - 8 * 60 * 60 * 1000) if params[:starts].blank?

    case query
    when 'metric_definitions'
      data = metric_definitions(params[:tags], params[:limit].to_i, params[:type])

      items = data.count
      page = params[:page].to_i
      items_per_page = params[:items_per_page].to_i
      pages = (items.to_f / items_per_page.to_f).ceil
      start_index = items_per_page * (page - 1)
      end_index = start_index + items_per_page

      {
        :page               => page,
        :items              => items,
        :items_per_page     => items_per_page,
        :pages              => pages,
        :limit              => params[:limit].to_i,
        :metric_definitions => data[start_index...end_index]
      }
    when 'metric_tags'
      {
        :metric_tags => metric_tags(params[:tags], params[:limit].to_i, params[:type])
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
    {
      :parameters => params,
      :error      => ActionView::Base.full_sanitizer.sanitize(e.message)
    }
  end

  def metric_definitions(tags, limit, type)
    list = _metric_definitions(tags, type).map { |m| m.json if m.json }

    list.sort { |a, b| a["id"].downcase <=> b["id"].downcase }[0...limit]
  end

  def metric_tags(tags, limit, type)
    definitions = metric_definitions(tags, limit, type)
    tags = definitions.map do |x|
      x["tags"].keys if x["tags"]
    end

    tags.compact.flatten.uniq.sort
  end

  def get_data(id, params)
    client.get_data(id,
                    :limit          => params[:limit].to_i,
                    :starts         => params[:starts].to_i,
                    :ends           => params[:ends].to_i,
                    :bucketDuration => params[:bucketDuration] || nil,
                    :order          => params[:order] || 'ASC')
  end

  def tenants(limit)
    tenants = @cli.hawkular_client.http_get('/tenants')

    if @params['include'].blank?
      tenants.map! { |x| {:label => labelize(x["id"]), :value => x["id"]} }
    else
      tenants.map! { |x| {:label => labelize(x["id"]), :value => x["id"]} if x["id"].include?(@params['include']) }
    end

    tenants.compact[0...limit]
  end

  private

  def labelize(id)
    TENANT_LABEL_SPECIAL_CASES.fetch(id, id.truncate(TENANT_LABEL_MAX_LEN))
  end

  def _metric_definitions(tags, type)
    if type.blank?
      @cli.hawkular_client.counters.query(tags).compact +
        @cli.hawkular_client.gauges.query(tags).compact
    else
      client.query(tags).compact
    end
  end

  def _tags
    tags = @params['tags'].blank? ? nil : JSON.parse(@params['tags'])

    tags == {} ? nil : tags
  end
end

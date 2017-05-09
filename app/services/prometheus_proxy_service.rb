class PrometheusProxyService < HawkularProxyService
  require 'faraday'

  TAGS = %w(__name__ container_name id image instance name namespace pod_name scope type).freeze
  SPECIAL_TAGS = %w(descriptor_name units metric_type type_id).freeze

  def initialize(provider_id, controller)
    @db_name = "Prometheus"
    @provider_id = provider_id
    @controller = controller
    @ems = ExtManagementSystem.find(@provider_id.to_i) unless @provider_id.blank?
    @hostname = @ems.hostname

    @params = controller.params
    @tenant = @params['tenant'] || 'kubernetes-nodes'

    @conn = Faraday.new(
      :url     => "http://#{prometheus_uri}",
      :request => {
        :open_timeout => 2, # opening a connection
        :timeout      => 5  # waiting for response
      }
    )
  end

  def metric_definitions(params)
    tags = params[:tags]
    tags_str = if tags.present?
                 tags.map { |x, y| ",#{x}=~\"#{y}\"" }.join
               else
                 ""
               end
    limit = params[:limit].to_i

    response = @conn.get(
      "/api/v1/query_range",
      :query => "{job=\"#{@tenant}\"#{tags_str}}",
      :start => params[:ends] / 1000 - 10 * 12 * 60,
      :end   => params[:ends] / 1000,
      :step  => "600s"
    )

    list = JSON.parse(response.body)["data"]["result"]

    list = list.map do |o|
      metric = o['metric']
      values = o['values']

      metric['descriptor_name'] = metric['__name__']
      metric['units'] = 'bytes' if metric['__name__'].include?('_bytes')
      metric['units'] = 'seconds' if metric['__name__'].include?('_seconds')
      metric['units'] = 'milliseconds' if metric['__name__'].include?('_milliseconds')
      metric['metric_type'] = metric['type']

      if metric['container_name'].nil?
        metric['type'] = 'machine'
        metric['type_id'] = metric['instance']
      elsif metric['container_name'] == "POD"
        metric['type'] = 'pod'
        metric['type_id'] = metric['pod_name']
      else
        metric['type'] = 'container'
        metric['type_id'] = metric['container_name']
      end

      {
        "id"   => "/#{metric['type']}/#{metric['type_id']}/#{metric['__name__']}/#{metric['id']}",
        "type" => "gauge",
        "tags" => metric,
        "data" => values.map { |v| { :timestamp => v[0] * 1000, :value => v[1] } }
      }
    end

    list.sort { |a, b| a["id"].downcase <=> b["id"].downcase }[0...limit]
  end

  def metric_tags(_params)
    TAGS.map do |tag|
      {:tag => tag, :options => metric_tags_options(tag)}
    end
  end

  def get_data(_id, params)
    tags = params[:tags]
    tags_str = if tags.present?
                 tags.delete("type")
                 tags["type"] = tags["metric_type"] if tags["metric_type"]
                 tags.except(*SPECIAL_TAGS).map { |x, y| ",#{x}=\"#{y}\"" }.join
               else
                 ""
               end

    response = @conn.get(
      "/api/v1/query_range",
      :query => "{job=\"#{@tenant}\"#{tags_str}}",
      :start => params[:starts] / 1000,
      :end   => params[:ends] / 1000,
      :step  => params[:bucketDuration]
    )
    result = JSON.parse(response.body)["data"]["result"]

    data = if result.length == 1
             result[0]['values'].map { |v| { :start => v[0] * 1000, :avg => v[1], :empty => "false" } }
           else
             []
           end
    data << { :start => params[:starts] - 1, :empty => "true" }
    data << { :start => params[:ends] + 1, :empty => "true" }

    data
  end

  def tenants(_limit)
    [
      { :label => "Kubernetes Nodes", :value => "kubernetes-nodes" },
      { :label => "Kubernetes API server", :value => "kubernetes-apiserver" },
      { :label => "Kubernetes Service", :value => "kubernetes-service-endpoints" }
    ]
  end

  def add_last_readings(metrics)
    metrics
  end

  def metric_tags_options(tag)
    timestamp = DateTime.now.utc.to_i
    response = @conn.get("/api/v1/label/#{tag}/values", :_ => timestamp)

    options = JSON.parse(response.body)["data"]
    options.sort
  end

  # may be nil
  def prometheus_endpoint
    @ems.connection_configurations.prometheus.try(:endpoint)
  end

  def prometheus_uri
    prometheus_endpoint_empty = prometheus_endpoint.try(:hostname).blank?
    prometheus_endpoint_empty ? @ems.hostname : prometheus_endpoint.hostname
  end
end

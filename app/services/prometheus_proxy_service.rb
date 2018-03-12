class PrometheusProxyService < HawkularProxyService
  def initialize(provider_id, controller)
    @db_name = "Prometheus"
    @provider_id = provider_id
    @controller = controller
    @ems = ExtManagementSystem.find(@provider_id.to_i) unless @provider_id.blank?
    @hostname = @ems.hostname

    @params = controller.params
    @tenant = @params['tenant'] || 'kubernetes-cadvisor'

    cli = ManageIQ::Providers::Kubernetes::ContainerManager::MetricsCapture::PrometheusClient.new(@ems, @tenant)
    @conn = cli.prometheus_client
  end

  def metric_definitions(params, no_data = false)
    tags = params[:tags]

    tags_str = if tags.present?
                 tags.map { |x, y| "#{x}=~\"#{y}\"" }.join(",")
               else
                 "job=~\".+\""
               end
    limit = params[:limit].to_i

    response = if no_data
                 @conn.get("query", :query => "{#{tags_str}}")
               else
                 @conn.get(
                   "query_range",
                   :query => "{#{tags_str}}",
                   :start => time_to_timestamp("-15m"),
                   :end   => Time.now.getutc.to_i,
                   :step  => 30
                 )
               end

    list = parse_result(response)

    list = list.each_with_index.map do |o, i|
      metric = o['metric']
      values = if no_data
                 [o['value']]
               else
                 o['values']
               end

      {
        "id"   => "#{metric['__name__']}/#{metric['instance']}/#{metric['pod_name']}/#{metric['contianer_name']}[#{i}]",
        "type" => "gauge",
        "tags" => metric,
        "data" => values.map { |v| { :timestamp => v[0] * 1000, :value => v[1] } }
      }
    end

    list.sort { |a, b| a["id"].downcase <=> b["id"].downcase }[0...limit]
  end

  def metric_tags(params)
    definitions = metric_definitions(params, true)
    tags = definitions.map { |x| x["tags"].keys }.flatten.uniq

    tags.map do |tag|
      { :tag => tag, :options => metric_tags_options(tag) }
    end
  end

  def get_data(_id, params)
    tags = params[:tags]
    tags_str = if tags.present?
                 tags.map { |x, y| "#{x}=\"#{y}\"" }.join(",")
               else
                 "job=\"NONE\""
               end

    response = @conn.get(
      "query_range",
      :query => "{#{tags_str}}",
      :start => time_to_timestamp(params[:starts]),
      :end   => Time.now.getutc.to_i,
      :step  => params[:bucketDuration][0..-2]
    )
    result = parse_result(response)

    data = if result.length == 1
             result[0]['values'].map { |v| { :start => v[0] * 1000, :avg => v[1], :empty => "false" } }
           else
             []
           end

    data
  end

  def tenants(_limit)
    # prometheus has no tenancy
    [{:label => "lable", :value => "value"}]
  end

  def time_to_timestamp(t_str)
    now = Time.now.getutc.to_i
    postfix = t_str[-1]
    value = t_str[1..-2].to_i

    case postfix
    when "m"
      now - value * 60
    when "h"
      now - value * 60 * 60
    when "d"
      now - value * 60 * 60 * 24
    else
      now
    end
  end

  def metric_tags_options(tag)
    timestamp = DateTime.now.utc.to_i
    response = @conn.get("label/#{tag}/values", :_ => timestamp)

    options = JSON.parse(response.body)["data"]
    options.sort
  end

  def parse_result(response)
    JSON.parse(response.body)["data"]["result"]
  rescue StandardError
    return []
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

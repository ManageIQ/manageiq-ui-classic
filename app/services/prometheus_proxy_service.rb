class PrometheusProxyService < HawkularProxyService
  SPECIAL_TAGS = %w(descriptor_name units metric_type type_id).freeze

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

  def replace_hawkular_tags(tags)
    if tags && tags["type"] == "node" && tags["hostname"]
      tags["id"] = "/"
      tags["instance"] = tags["hostname"]

      tags.delete("type")
      tags.delete("hostname")
    end

    tags
  end

  def metric_definitions(params, no_data = false)
    tags = params[:tags]

    # check for hawkular style type / hostname tags and replace if needed
    tags = replace_hawkular_tags(tags)

    tags_str = if tags.present?
                 tags.map { |x, y| ",#{x}=~\"#{y}\"" }.join
               else
                 ""
               end
    limit = params[:limit].to_i

    response = if no_data
                 @conn.get("query", :query => "{job=\"#{@tenant}\"#{tags_str}}")
               else
                 @conn.get(
                   "query_range",
                   :query => "{job=\"#{@tenant}\"#{tags_str}}",
                   :start => params[:ends] / 1000 - 10 * 12 * 60,
                   :end   => params[:ends] / 1000,
                   :step  => "600s"
                 )
               end

    list = JSON.parse(response.body)["data"]["result"]

    list = list.each_with_index.map do |o, i|
      metric = o['metric']
      values = if no_data
                 [o['value']]
               else
                 o['values']
               end

      unless no_data
        # if we are in list view ( we need data )
        # set the descriptor_name and units for the display title in list view.
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
      end

      # users should not have access to the job tag
      metric.delete("job")

      {
        "id"   => "#{metric['__name__']}/#{metric['type_id']}[#{i}]",
        "type" => "gauge",
        "tags" => metric,
        "data" => values.map { |v| { :timestamp => v[0] * 1000, :value => v[1] } }
      }
    end

    list.sort { |a, b| a["id"].downcase <=> b["id"].downcase }[0...limit]
  end

  def metric_tags(params)
    definitions = metric_definitions(params.merge(:tags => {:job => @tenant}), true)
    tags = definitions.map { |x| x["tags"].keys }.flatten.uniq

    tags.map do |tag|
      { :tag => tag, :options => metric_tags_options(tag) }
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
      "query_range",
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
    jobs = metric_tags_options("job")

    jobs.map { |id| { :label => labelize(id), :value => id } }
  end

  def metric_tags_options(tag)
    timestamp = DateTime.now.utc.to_i
    response = @conn.get("label/#{tag}/values", :_ => timestamp)

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

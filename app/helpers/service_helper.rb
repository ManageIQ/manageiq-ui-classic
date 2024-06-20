module ServiceHelper
  include TextualSummary

  def child_service_summary(child_services)
    rows = []
    data = {:title => _("Child Services"), :mode => "miq_child_services"}
    child_services.sort_by { |o| o.name.downcase }.each do |service|
      rows.push(
        {
          :cells   => [{:icon => 'pficon pficon-service', :value => service.name}],
          :title   => _("View this Service"),
          :onclick => {:url => "/service/show/#{service.id}"},
        }
      )
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end

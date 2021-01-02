require 'routing/shared_examples'

describe 'routes for MiqAlertSetController' do
  let(:controller_name) { 'miq_alert_set' }

  get_routes = %w[
    edit
    edit_assignment
    new
    show
    show_list
  ]

  post_routes = %w[
    alert_profile_assign_changed
    alert_profile_field_changed
    edit
    edit_assignment
    new
    show
    show_list
  ]

  describe 'GET routes' do
    get_routes.each do |route|
      it "##{route}" do
        expect(get("/#{controller_name}/#{route}")).to route_to("#{controller_name}##{route}")
      end
    end
  end

  describe 'POST routes' do
    post_routes.each do |route|
      it "##{route}" do
        expect(post("/#{controller_name}/#{route}")).to route_to("#{controller_name}##{route}")
      end
    end
  end
end

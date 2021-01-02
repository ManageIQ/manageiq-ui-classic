require 'routing/shared_examples'

describe 'routes for MiqPolicySetController' do
  let(:controller_name) { 'miq_policy_set' }

  get_routes = %w[
    edit
    new
    show
    show_list
  ]

  post_routes = %w[
    button
    edit
    form_field_changed
    reload
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

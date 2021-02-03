require 'routing/shared_examples'

describe 'routes for MiqPolicyController' do
  let(:controller_name) { 'miq_policy' }

  it_behaves_like 'A controller that has advanced search routes'

  get_routes = %w[
    copy
    edit
    miq_event_edit
    miq_policy_edit_conditions
    miq_policy_edit_events
    new
    show
    show_list
  ]

  post_routes = %w[
    edit
    event_build_action_values
    miq_event_edit
    miq_policy_edit
    miq_policy_edit_conditions
    miq_policy_edit_events
    policy_field_changed
    quick_search
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

test_specific_controller = ENV['TEST_CONTROLLER']
warn "Running with routes test for #{test_specific_controller.inspect}" if test_specific_controller.present?

routes = Rails.application.routes.routes.each_with_object({}) do |route, obj|
  controller, action = route.defaults.values_at(:controller, :action)

  next if controller.nil? || controller.starts_with?('api/') || controller.starts_with?('rails/')

  klass = "#{controller}_controller".camelize.constantize
  next if test_specific_controller.present? && !controller.starts_with?(test_specific_controller)

  obj[klass] ||= []
  obj[klass] << action
end

pending_routes = YAML.safe_load(ManageIQ::UI::Classic.root.join('spec', 'config', 'routes.pending.yml').read)

describe 'Application routes' do
  before(:all) { MiqProductFeature.seed_features }
  after(:all)  { MiqProductFeature.destroy_all }

  def error_message
    <<~ERROR
      This route probably does not have an RBAC check enforced on itself. This is could be because of:
      * a missing feature that should be defined in the "\#{controller}_\#{action}" format
      * a missing `feature_for_actions` mapping in the controller between the action and a feature
      * missing explicit call(s) to assert_privileges in the action's method in the controller
      * the route is not available without a session variable that is being set in an enforced route (FP)
      * the route is a redirect to another route that has RBAC enforcement (FP)
      * the route is checked properly, but the test is somehow not detecting it (FP)
      * the route should be exposed to any logged in user without a role check (FP)

      The routes marked with (FP) should be treated as false positives and can be added into the
      `spec/config/routes.pending.yml` file. Please note that if the action is not available under any
      other controller, there is a high chance that it is not a false positive and it should not be
      added into this file without an explanation.
    ERROR
  end

  def fp_message
    <<~ERROR
      This route has been marked as a false positive. It might produce a red result, which means that it
      has RBAC enforcement and it should no longer be on the list of false positives. If this happens
      please remove it from the `spec/config/routes.pending.yml` file.
    ERROR
  end

  routes.each do |controller, actions|
    describe controller do
      actions.uniq.each do |action|
        describe "##{action}" do
          it 'method defined' do
            expect(subject.respond_to?(action)).to be_truthy
          end

          describe 'RBAC check' do
            before do
              allow(PrivilegeCheckerService).to receive(:new).and_return(check_service)
              allow(check_service).to receive(:valid_session?).and_return(true)
              allow(subject).to receive(:session)
              allow(subject).to receive(:current_user)
              allow(subject).to receive(:params).and_return({})
              allow(subject).to receive(:request).and_return(request)
              allow(request).to receive(:xml_http_request?).and_return(false)
            end

            let(:check_service) { double(PrivilegeCheckerService) }

            let(:request) { double }

            it 'is enforced' do
              # Check if the test is not marked as a false positive
              fp = pending_routes[controller.to_s]&.include?(action)
              pending(fp_message) if fp

              # Mock the controller's action name as it's not available implicitly
              allow(subject).to receive(:action_name).and_return(action)
              # The check_privileges redirects instead of raising an exception, so mock it to ease the testing
              allow(subject).to receive(:redirect_to).with(:controller => 'dashboard', :action => 'auth_error').and_raise(MiqException::RbacPrivilegeException)
              allow(subject).to receive(:add_flash).with("The user is not authorized for this task or item.", :error).and_raise(MiqException::RbacPrivilegeException)

              begin
                expect do
                  subject.send(:check_privileges)
                  subject.send(action)
                end.to raise_error(MiqException::RbacPrivilegeException)
              rescue RSpec::Expectations::ExpectationNotMetError => err
                raise if fp

                # Reraise but with a custom error message
                raise err.class, "#{err.message} \n\n#{error_message}"
              end
            end
          end
        end
      end
    end
  end
end

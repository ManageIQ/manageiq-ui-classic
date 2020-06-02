routes = Rails.application.routes.routes.each_with_object({}) do |route, obj|
  controller, action = route.defaults.values_at(:controller, :action)

  next if controller.nil? || controller.starts_with?('api/') || controller.starts_with?('rails/')

  klass = "#{controller}_controller".camelize.constantize

  obj[klass] ||= []
  obj[klass] << action
end

pending_routes = YAML.safe_load(ManageIQ::UI::Classic.root.join('spec', 'config', 'routes.pending.yml').read)

describe 'Application routes' do
  before(:all) { MiqProductFeature.seed_features }

  routes.each do |controller, actions|
    describe controller do
      actions.uniq.each do |action|
        describe "##{action}" do
          it 'method defined' do
            expect(subject.respond_to?(action)).to be_truthy
          end

          describe 'RBAC' do
            before do
              allow(PrivilegeCheckerService).to receive(:new).and_return(check_service)
              allow(check_service).to receive(:valid_session?).and_return(true)
              allow(subject).to receive(:session)
              allow(subject).to receive(:current_user)
              allow(subject).to receive(:params).and_return({})
            end

            let(:check_service) { double(PrivilegeCheckerService) }

            it 'is enforced' do
              pending('ignored') if pending_routes[controller.to_s]&.include?(action)

              # Mock the controller's action name as it's not available implicitly
              allow(subject).to receive(:action_name).and_return(action)
              # The check_privileges redirects instead of raising an exception, so mock it to ease the testing
              allow(subject).to receive(:redirect_to).with(:controller => 'dashboard', :action => 'auth_error').and_raise(MiqException::RbacPrivilegeException)
              allow(subject).to receive(:add_flash).with("The user is not authorized for this task or item.", :error).and_raise(MiqException::RbacPrivilegeException)

              expect do
                subject.send(:check_privileges)
                subject.send(action)
              rescue MiqException::RbacPrivilegeException
                raise
              rescue => ex
                # NOP: we don't care if any other exception happens
              end.to raise_error(MiqException::RbacPrivilegeException)
            end
          end
        end
      end
    end
  end
end

routes = Rails.application.routes.routes.each_with_object({}) do |route, obj|
  controller, action = route.defaults.values_at(:controller, :action)

  next if controller.nil? || controller.starts_with?('api/') || controller.starts_with?('rails/')

  klass = "#{controller}_controller".camelize.constantize

  obj[klass] ||= []
  obj[klass] << action
end

describe 'Application routes' do
  routes.each do |controller, actions|
    describe controller do
      actions.uniq.each do |action|
        describe "##{action}" do
          it 'method defined' do
            expect(subject.respond_to?(action)).to be_truthy
          end
        end
      end
    end
  end
end

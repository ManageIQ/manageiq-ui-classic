describe Mixins::GenericShowMixin do
  class GenericShowMixinTestController < ActionController::Base
    include Mixins::GenericShowMixin
  end

  describe '#nested_list' do
    context 'displaying Service Templates thru Tenant textual summary' do
      let(:controller) { OpsController.new }
      let(:opts) do
        {
          :association   => :nested_service_templates,
          :parent        => tenant,
          :no_checkboxes => true
        }
      end
      let(:tenant) { FactoryBot.create(:tenant) }

      before do
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:show_link)
        allow(controller).to receive(:session).and_return(:view => nil)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@record, tenant)
        controller.params = {}
      end

      it 'updates view_options also with :no_checkboxes' do
        expect(controller).to receive(:get_view).with(ServiceTemplate, opts)
        controller.send(:nested_list, ServiceTemplate, opts.merge(:breadcrumb_title => 'Catalog Items and Bundles'))
      end
    end
  end
end

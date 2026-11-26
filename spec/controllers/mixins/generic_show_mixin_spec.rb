describe Mixins::GenericShowMixin do
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

  describe '.display_models' do
    it 'defaults to the model names derived from display_methods' do
      expect(HostController.display_models).to include('Storage', 'ResourcePool', 'CloudNetwork')
    end

    it 'can be overridden by the controller' do
      controller_class = Class.new(HostController) do
        def self.display_models
          %w[Storage]
        end
      end
      controller = controller_class.new
      expect(controller).not_to receive(:nested_list)
      expect { controller.send(:display_nested_generic, 'vms') }.to raise_error(NameError)
    end
  end

  describe '#display_nested_generic' do
    let(:controller) { HostController.new }

    it 'lists the nested model when the display is in display_methods' do
      expect(controller).to receive(:nested_list).with(Storage)
      controller.send(:display_nested_generic, 'storages')
    end

    it 'does not list anything when the display is not in display_methods' do
      expect(controller).not_to receive(:nested_list)
      controller.send(:display_nested_generic, 'kernels')
    end

    it 'does not resolve a class that is not listed in display_methods' do
      expect(controller).not_to receive(:nested_list)
      expect { controller.send(:display_nested_generic, 'Kernel') }.not_to raise_error
    end
  end
end

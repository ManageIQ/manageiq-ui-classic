describe ApplicationController do
  context "#custom_buttons" do
    let(:resource_action) { FactoryBot.create(:resource_action, :dialog_id => 1) }
    let(:button)          { FactoryBot.create(:custom_button, :applies_to_class => "Vm", :resource_action => resource_action) }
    let(:host)            { FactoryBot.create(:host_vmware) }
    let(:vm)              { FactoryBot.create(:vm_vmware) }
    let(:service)         { FactoryBot.create(:service) }

    context "with a resource_action dialog" do
      it "Vm button" do
        controller.params = {:id => vm.id, :button_id => button.id}
        expect(controller).to receive(:dialog_initialize) do |action, options|
          expect(action).to eq(resource_action)
          expect(options[:target_id]).to eq(vm.id)
          expect(options[:target_kls]).to eq(vm.class.name)
        end

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end

      it "Host button" do
        button.applies_to = host
        button.save
        controller.params = {:id => host.id, :button_id => button.id}

        expect(controller).to receive(:dialog_initialize) do |action, options|
          expect(action).to eq(resource_action)
          expect(options[:target_id]).to eq(host.id)
          expect(options[:target_kls]).to eq(host.class.name)
        end

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(host.name)
        expect(controller.instance_variable_get(:@explorer)).to be_falsy
      end
    end

    it "Host button with a subclass, not base_class in applies_to_class" do
      button.update(:applies_to_class => host.class.name)
      controller.params = {:id => host.id, :button_id => button.id}
      expect { controller.send(:custom_buttons) }.to raise_error(ArgumentError)
    end

    context "with a button with open_url" do
      before do
        resource_action.update_attribute(:dialog_id, nil)
        button.update(:options => {:open_url => true})
        expect(controller).to receive(:render)
      end

      it "Vm button" do
        task = MiqTask.create
        controller.params = {:id => vm.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke_async).with(vm, 'UI').and_return(task.id)

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end
    end

    context "without a resource_action dialog" do
      before do
        resource_action.update_attribute(:dialog_id, nil)
        expect(controller).to receive(:render)
      end

      it "Vm button" do
        controller.params = {:id => vm.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(vm, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end

      it "Host button" do
        button.applies_to = host
        button.save
        controller.params = {:id => host.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(host, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(host.name)
        expect(controller.instance_variable_get(:@explorer)).to be_falsy
      end

      it "ServiceTemplate button" do
        button.applies_to = ServiceTemplate
        button.save
        controller.params = {:id => service.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(service, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(service.name)
        expect(controller.instance_variable_get(:@explorer)).to be_falsy
      end
    end
  end
end

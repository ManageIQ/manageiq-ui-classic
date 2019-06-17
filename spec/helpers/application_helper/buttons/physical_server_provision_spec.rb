describe ApplicationHelper::Button::PhysicalServerProvision do
  describe '#disabled?' do
    context "button should not be disabled" do
      before do
        ems = FactoryBot.create(:ems_physical_infra)
        @record = FactoryBot.create(:physical_server, :ems_id => ems.id)
      end

      it "does not disable the Provision button" do
        allow_any_instance_of(EmsPhysicalInfra).to receive(:supports_provisioning?).and_return(true)
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {}, {})
        expect(button.disabled?).to be_falsey
      end
    end

    context "button should be disabled when there are no Physical infrastructure providers" do
      it "disable the Provision button" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {}, {})
        expect(button.disabled?).to be_truthy
      end
    end

    context "button should be disabled when there are no Physical Servers" do
      before do
        FactoryBot.create(:ems_physical_infra)
      end

      it "disable the Provision button" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {}, {})
        expect(button.disabled?).to be_truthy
      end
    end

    context "button should be disabled when there are no Physical infrastructure providers that support VM Provisioning" do
      before do
        ems = FactoryBot.create(:ems_physical_infra)
        @record = FactoryBot.create(:physical_server, :ems_id => ems.id)
      end

      it "disable the Provision button" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {}, {})
        expect(button.disabled?).to be_truthy
      end
    end
  end
end

describe ApplicationHelper::Button::SmartStateScan do
  before (:each) do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe '#disabled?' do
    context "when only SmartProxy role is set" do
      before do
        SSAButtonHelper.create_server_role(MiqServer.my_server, 'SmartProxy')
        @record = FactoryGirl.create(:container_image)
      end

      it "will not be disabled" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {'record' => @record}, {})
        expect(button.disabled?).to be_truthy
      end
    end

    context "when only SmartState role is set" do
      before do
        SSAButtonHelper.create_server_role(MiqServer.my_server, 'SmartState')
        @record = FactoryGirl.create(:container_image)
      end

      it "will not be disabled" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {'record' => @record}, {})
        expect(button.disabled?).to be_truthy
      end
    end

    context "when both proxy roles are set" do
      before do
        SSAButtonHelper.create_server_smart_roles
        @record = FactoryGirl.create(:container_image)
      end

      it "will not be disabled" do
        view_context = setup_view_context_with_sandbox({})
        button = described_class.new(view_context, {}, {'record' => @record}, {})
        expect(button.disabled?).to be_falsey
      end
    end
  end
end

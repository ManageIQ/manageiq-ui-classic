describe ApplicationHelper::Button::MiqRequestApproval do
  describe '#visible?' do
    let(:button) do
      described_class.new(
        view_context,
        {},
        {'record' => @record, 'showtype' => @showtype, 'request_tab' => @request_tab},
        {:options => {:feature => 'miq_request_approval'}}
      )
    end

    let(:view_context) { setup_view_context_with_sandbox({}) }
    let(:user) { FactoryBot.create(:user) }
    let(:request) { "SomeRequest" }
    let(:username) { user.name }
    let(:state) { "xx" }

    %w[MiqProvisionRequest VmReconfigureRequest VmCloudReconfigureRequest
       VmMigrateRequest AutomationRequest ServiceTemplateProvisionRequest].each do |cls|
      context "id = miq_request_approval" do
        before do
          @record = cls.constantize.new
          allow(@record).to receive_messages(:resource_type  => request,
                                             :approval_state => state,
                                             :requester_name => username)
          allow(button).to receive(:role_allows_feature?).and_return(true)
          allow(button).to receive(:current_user).and_return(user)
          button.instance_variable_set(:@showtype, "prase")
          button.instance_variable_set(:@request_tab, "service")
        end

        context "resource_type = AutomationRequest" do
          let(:request) { "AutomationRequest" }

          it "and resource_type = AutomationRequest" do
            expect(button.skipped?).to be_falsey
          end
        end

        context "approval_state = approved" do
          let(:state) { "approved" }

          it "and approval_state = approved" do
            expect(button.skipped?).to be_truthy
          end
        end

        it "and showtype = miq_provisions" do
          button.instance_variable_set(:@showtype, "miq_provisions")
          expect(button.skipped?).to be_truthy
        end

        it "and approval_state != approved and showtype != miq_provisions" do
          expect(button.skipped?).to be_falsey
        end
      end

      let(:button) do
        described_class.new(
          view_context,
          {},
          {'record' => @record, 'showtype' => @showtype},
          {:options => {:feature => 'miq_request_approval'}}
        )
      end

      context 'id = miq_request_deny' do
        before do
          @record = cls.constantize.new
          allow(@record).to receive_messages(:resource_type  => request,
                                             :approval_state => state,
                                             :requester_name => username)
          allow(button).to receive(:role_allows_feature?).and_return(true)
          allow(button).to receive(:current_user).and_return(user)
          button.instance_variable_set(:@showtype, "prase")
          button.instance_variable_set(:@request_tab, "service")
        end

        context "resource_type = AutomationRequest" do
          let(:request) { "AutomationRequest" }

          it "and resource_type = AutomationRequest" do
            expect(button.skipped?).to be_falsey
          end
        end

        context "approval_state = approved" do
          let(:state) { "approved" }

          it "and approval_state = approved" do
            expect(button.skipped?).to be_truthy
          end
        end

        context "approval_state = denied" do
          let(:state) { "denied" }

          it "and approval_state = denied" do
            expect(button.skipped?).to be_truthy
          end
        end

        it "and showtype = miq_provisions" do
          button.instance_variable_set(:@showtype, "miq_provisions")
          expect(button.skipped?).to be_truthy
        end

        it "and approval_state != approved|denied and showtype != miq_provisions" do
          expect(button.skipped?).to be_falsey
        end
      end
    end
  end
end

describe MiqPolicyController do
  context "::Events" do
    context "#miq_event_edit" do
      before do
        stub_user(:features => :all)
        @action = FactoryBot.create(:miq_action, :name => "compliance_failed")
        @event = FactoryBot.create(:miq_event_definition, :name => "vm_compliance_check")
        @policy = FactoryBot.create(:miq_policy, :name => "Foo")
        controller.instance_variable_set(:@lastaction, "show")
      end

      it "saves Policy Event with an action" do
        new_hash = {
          :name          => "New Name",
          :description   => "New Description",
          :event_id      => @event.id,
          :policy_id     => @policy.id,
          :actions_true  => [[@action.name, true, @action.id]],
          :actions_false => []
        }
        edit = {
          :new     => new_hash,
          :current => new_hash,
          :key     => "event_edit__#{@event.id}"
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.params = {:id => @event.id.to_s, :button => "save"}
        expect(controller).to receive(:javascript_redirect).with(:action    => 'show',
                                                                 :flash_msg => _("Actions for Policy Event \"%{name}\" were saved") % {:name => @event.description},
                                                                 :id        => @event.id.to_s)
        controller.miq_event_edit
      end

      it "does not allow to save Policy Event without an action" do
        new_hash = {
          :name          => "New Name",
          :description   => "New Description",
          :policy_id     => @policy.id,
          :event_id      => @event.id,
          :actions_true  => [],
          :actions_false => []
        }
        edit = {
          :new     => new_hash,
          :current => new_hash,
          :key     => "event_edit__#{@event.id}"
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.params = {:id => @event.id.to_s, :button => "save"}
        expect(controller).to receive(:render)
        controller.miq_event_edit
        expect(assigns(:flash_array).first[:message]).to include("At least one action must be selected to save this Policy Event")
      end
    end

    context "#event_build_edit_screen" do
      before do
        stub_user(:features => :all)
        FactoryBot.create(:miq_action, :name => 'check_compliance', :description => 'Check Host or Vm Compliance')
        FactoryBot.create(:miq_action, :name => "compliance_failed")
        @event = FactoryBot.create(:miq_event_definition, :name => "vm_compliance_check")
        @policy = FactoryBot.create(:miq_policy, :name => "Foo", :mode => 'compliance')
        MiqPolicyContent.create(:miq_policy => @policy, :miq_event_definition => @event)
      end

      it 'will execute for compliance policy' do
        controller.params = {:id => @policy.id}
        controller.send(:event_build_edit_screen)
        edit = assigns(:edit)
        expect(edit[:choices_true].count).to eq(1)
        expect(edit[:choices_false].count).to eq(1)
      end

      it 'will execute for control policy' do
        @policy.update(:mode => 'control')
        controller.params = {:id => @policy.id}
        controller.send(:event_build_edit_screen)
        edit = assigns(:edit)
        expect(edit[:choices_true].count).to eq(2)
        expect(edit[:choices_false].count).to eq(2)
      end
    end
  end
end

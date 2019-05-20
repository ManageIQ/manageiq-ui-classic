describe MiqPolicyController do
  context "::Events" do
    context "#event_edit" do
      before do
        stub_user(:features => :all)
        @action = MiqAction.find_by(:name => "compliance_failed")
        @event = MiqEventDefinition.find_by(:name => "vm_compliance_check")
        @policy = FactoryBot.create(:miq_policy, :name => "Foo")

        controller.instance_variable_set(:@sb,
                                         :node_ids    => {
                                           :policy_tree => {"p" => @policy.id}
                                         },
                                         :active_tree => :policy_tree)
        allow(controller).to receive(:replace_right_cell)
      end

      it "saves Policy Event with an action" do
        new_hash = {
          :name          => "New Name",
          :description   => "New Description",
          :actions_true  => [[@action.name, true, @action.id]],
          :actions_false => []
        }
        edit = {
          :new      => new_hash,
          :current  => new_hash,
          :key      => "event_edit__#{@event.id}",
          :event_id => @event.id
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.params = {:id => @event.id.to_s, :button => "save"}
        controller.event_edit
        expect(@policy.actions_for_event(@event, :success)).to include(@action)
      end

      it "does not allow to save Policy Event without an action" do
        new_hash = {
          :name          => "New Name",
          :description   => "New Description",
          :actions_true  => [],
          :actions_false => []
        }
        edit = {
          :new      => new_hash,
          :current  => new_hash,
          :key      => "event_edit__#{@event.id}",
          :event_id => @event.id
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.params = {:id => @event.id.to_s, :button => "save"}
        expect(controller).to receive(:render)
        controller.event_edit
        expect(assigns(:flash_array).first[:message]).to include("At least one action must be selected to save this Policy Event")
      end
    end
  end
end

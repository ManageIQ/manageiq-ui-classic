describe MiqPolicyController do
  context "::AlertProfiles" do
    before do
      login_as user_with_feature(%w(alert_profile_assign alert_profile_edit))
    end

    context "#alert_profile_assign" do
      before do
        @ap = FactoryBot.create(:miq_alert_set)
        controller.instance_variable_set(:@sb, :trees => {:alert_profile_tree => {:active_node => "xx-Vm_ap-#{@ap.id}"}}, :active_tree => :alert_profile_tree)
        allow(controller).to receive(:replace_right_cell)
      end

      it "first time in" do
        expect(controller).to receive(:alert_profile_build_assign_screen)
        controller.alert_profile_assign
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "Test reset button" do
        controller.params = {:id => @ap.id, :button => "reset"}
        expect(controller).to receive(:alert_profile_build_assign_screen)
        controller.alert_profile_assign
        expect(assigns(:flash_array).first[:message]).to include("reset")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "Test cancel button" do
        controller.params = {:id => @ap.id, :button => "cancel"}
        controller.alert_profile_assign
        expect(assigns(:flash_array).first[:message]).to include("cancelled")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "Test save button without selecting category" do
        controller.params = {:id => @ap.id, :button => "save"}
        controller.instance_variable_set(:@sb, :trees => {:alert_profile_tree => {:active_node => "xx-Vm_ap-#{@ap.id}"}}, :active_tree => :alert_profile_tree,
                                                :assign => {:alert_profile => @ap, :new => {:assign_to => "Vm-tags", :objects => ["10000000000001"]}})
        controller.alert_profile_assign
        expect(assigns(:flash_array).first[:message]).not_to include("saved")
        expect(controller.send(:flash_errors?)).to be_truthy
      end

      it "Test save button with no errors" do
        controller.params = {:id => @ap.id, :button => "save"}
        controller.instance_variable_set(:@sb, :trees => {:alert_profile_tree => {:active_node => "xx-Vm_ap-#{@ap.id}"}}, :active_tree => :alert_profile_tree,
                                                :assign => {:alert_profile => @ap, :new => {:assign_to => "Vm-tags", :cat => "10000000000001", :objects => ["10000000000001"]}})
        controller.alert_profile_assign
        expect(assigns(:flash_array).first[:message]).to include("saved")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    context "#alert_profile_edit" do
      before do
        controller.instance_variable_set(:@sb,
                                         :trees       => {
                                           :alert_profile_tree => {:active_node => "xx-Vm"}
                                         },
                                         :active_tree => :alert_profile_tree)
        allow(controller).to receive(:replace_right_cell)
        edit = {
          :key => "alert_profile_edit__new"
        }
        session[:edit] = edit
      end

      it "Test cancel button" do
        controller.params = {:id => 'new', :button => "cancel"}
        controller.alert_profile_edit
        expect(assigns(:flash_array).first[:message]).to include("Add of new Alert Profile was cancelled by the user")
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    context '#alert_profile_field_changed' do
      before do
        @ap = FactoryBot.create(:miq_alert_set)
        allow(controller).to receive(:send_button_changes)
        edit = {
          :key => "alert_profile_edit__#{@ap.id}",
          :new => {:name => "foo", :description => "foo description"}
        }
        session[:edit] = edit
      end

      it 'Edit of notes field does not reset value of description field' do
        controller.params = {:id => @ap.id, :notes => 'foo note'}
        controller.alert_profile_field_changed
        edit_new = assigns(:edit)[:new]
        expect((edit_new)[:description]).to eq("foo description")
        expect((edit_new)[:notes]).to eq("foo note")
      end
    end

    context "#alert_profile_assign_changed" do
      before do
        alert_profile_set = FactoryBot.create(:miq_alert_set, :set_type => "MiqAlertSet", :mode => "MiqServer")
        assign = {
          :new            => {:assign_to => "miq_server", :objects => [10]},
          "alert_profile" => alert_profile_set,
        }
        controller.instance_variable_set(:@sb, :assign => assign)
      end

      it "Changing Assign Tos drop down value, initializes the tree" do
        controller.params = {:chosen_assign_to => "miq_server"}
        expect(controller).to receive(:render)
        controller.alert_profile_assign_changed
        expect(assigns(:assign)[:obj_tree]).not_to be_nil
      end

      it "does not throw an error when selecting items in the servers tree" do
        controller.params = {:check => "1", :id => "svr-1"}
        expect(controller).to receive(:render)
        controller.alert_profile_assign_changed
        expect(assigns(:assign)[:new][:objects]).to eq([1, 10])
      end
    end
  end
end

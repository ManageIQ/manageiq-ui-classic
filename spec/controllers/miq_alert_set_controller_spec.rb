describe MiqAlertSetController do
  before do
    login_as user_with_feature(%w[miq_alert_set_assign miq_alert_set_edit])
  end

  context "#miq_alert_set_assign" do
    before do
      @ap = FactoryBot.create(:miq_alert_set)
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@lastaction, 'show')
    end

    it "first time in" do
      expect(controller).to receive(:alert_profile_build_assign_screen)
      controller.miq_alert_set_assign
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test reset button" do
      controller.params = {:button => "reset", :id => @ap.id}
      expect(controller).to receive(:javascript_redirect).with(:action        => 'edit_assignment',
                                                               :id            => @ap.id,
                                                               :flash_msg     => _("All changes have been reset"),
                                                               :flash_warning => true)
      controller.send(:edit_assignment)
    end

    it "Test cancel button" do
      controller.params = {:button => "cancel", :id => @ap.id}
      expect(controller).to receive(:javascript_redirect).with(:action    => "show",
                                                               :flash_msg => _("Edit Alert Profile assignments cancelled by user"),
                                                               :id        => @ap.id)
      controller.send(:edit_assignment)
    end

    it "Test save button without selecting category" do
      assign = {:alert_profile => @ap, :new => {:assign_to => "Vm-tags", :objects => ["10000000000001"]}}
      controller.instance_variable_set(:@assign, assign)
      controller.instance_variable_set(:@sb, {:assign => assign})
      controller.params = {:id => @ap.id, :button => "save"}
      expect(controller).to receive(:javascript_flash)
      controller.edit_assignment
    end

    it "Test save button with no errors" do
      assign = {:alert_profile => @ap, :new => {:assign_to => "Vm-tags", :cat => "10000000000001", :objects => ["10000000000001"]}}
      controller.instance_variable_set(:@assign, assign)
      controller.instance_variable_set(:@sb, {:assign => assign})
      controller.params = {:id => @ap.id, :button => "save"}
      expect(controller).to receive(:javascript_redirect).with(:action     => 'show',
                                                               :controller => "miq_alert_set",
                                                               :flash_msg  => _("Alert Profile \"%{name}\" assignments successfully saved") % {:name => @ap.description},
                                                               :id         => @ap.id)
      controller.edit_assignment
    end
  end

  context "#miq_alert_set_edit" do
    before do
      edit = {
        :key => "alert_profile_edit__new"
      }
      session[:edit] = edit
      controller.instance_variable_set(:@lastaction, "show")
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
      expect(edit_new[:description]).to eq("foo description")
      expect(edit_new[:notes]).to eq("foo note")
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

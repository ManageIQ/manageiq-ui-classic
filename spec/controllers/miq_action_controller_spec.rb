describe MiqActionController do
  before do
    login_as user_with_feature(%w[miq_action_edit miq_action_new])
  end

  context "#action_edit" do
    before do
      @action = FactoryBot.create(:miq_action, :name => "Test_Action")
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:replace_right_cell)
      allow(controller).to receive(:action_build_cat_tree)
      allow(controller).to receive(:get_node_info)
      allow(controller).to receive(:action_get_info)
    end

    it "first time in" do
      controller.miq_action_edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test reset button" do
      controller.params = {:id => @action.id, :button => "reset"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).to include("reset")
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test cancel button" do
      controller.instance_variable_set(:@sb, :trees => {:action_tree => {:active_node => "a-#{@action.id}"}}, :active_tree => :action_tree)
      controller.params = {:id => @action.id, :button => "cancel"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).to include("cancelled")
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test saving an action without selecting a Tag" do
      controller.params = {:id => @action.id}
      controller.miq_action_edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
      edit = controller.instance_variable_get(:@edit)
      edit[:new][:action_type] = "tag"
      session[:edit] = assigns(:edit)
      controller.params = {:id => @action.id, :button => "save"}
      expect(controller).to receive(:render)
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).to include("At least one Tag")
      expect(assigns(:flash_array).first[:message]).not_to include("saved")
      expect(controller.send(:flash_errors?)).to be_truthy
    end

    it "Test saving an action after selecting a Tag" do
      controller.params = {:id => @action.id}
      controller.miq_action_edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
      edit = controller.instance_variable_get(:@edit)
      edit[:new][:action_type] = "tag"
      edit[:new][:options] = {}
      edit[:new][:options][:tags] = "Some Tag"
      session[:edit] = assigns(:edit)
      controller.params = {:id => @action.id, :button => "save"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).not_to include("At least one Tag")
      expect(assigns(:flash_array).first[:message]).to include("saved")
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "can edit an Ansible playbook action" do
      controller.params = {:id => @action.id}
      controller.miq_action_edit
      edit = controller.instance_variable_get(:@edit)
      edit[:new][:action_type] = "run_ansible_playbook"
      edit[:new][:inventory_type] = 'manual'
      edit[:new][:options][:hosts] = 'host1, host2'
      edit[:new][:options][:service_template_id] = '01'
      session[:edit] = assigns(:edit)
      controller.params = {:id => @action.id, :button => "save"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).not_to include("At least one Playbook")
      expect(assigns(:flash_array).first[:message]).to include("saved")
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "displays an error if no Ansible playbook is selected" do
      allow(controller).to receive(:javascript_flash)
      controller.params = {:id => @action.id}
      controller.miq_action_edit
      edit = controller.instance_variable_get(:@edit)
      edit[:new][:action_type] = "run_ansible_playbook"
      edit[:new][:inventory_type] = 'event_target'
      edit[:new][:options][:use_event_target] = true
      edit[:new][:options][:use_event_localhost] = false
      session[:edit] = assigns(:edit)
      controller.params = {:id => @action.id, :button => "save"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).to include("An Ansible Playbook must be selected")
      expect(controller.send(:flash_errors?)).to be_truthy
    end

    it "displays an error if no hosts are slected for an Ansible playbook with 'manual' inventory" do
      allow(controller).to receive(:javascript_flash)
      controller.params = {:id => @action.id}
      controller.miq_action_edit
      edit = controller.instance_variable_get(:@edit)
      edit[:new][:action_type] = "run_ansible_playbook"
      edit[:new][:inventory_type] = 'manual'
      edit[:new][:options][:service_template_id] = '01'
      session[:edit] = assigns(:edit)
      controller.params = {:id => @action.id, :button => "save"}
      controller.miq_action_edit
      expect(assigns(:flash_array).first[:message]).to include("At least one host must be specified for manual mode")
      expect(controller.send(:flash_errors?)).to be_truthy
    end
  end

  context "#action_field_changed" do
    before do
      options = {:ae_hash => {"a1" => "v1", "a2" => "v2", "a3" => "v3", "a4" => "v4", "a5" => "v5"}}
      @action = FactoryBot.create(:miq_action, :name => "Test_Action", :options => options)
      attrs   = [["a1", "v1"], ["a2", "v2"], ["a3", "v3"], ["a4", "v4"], ["a5", "v5"]]
      edit = {
        :rec_id => @action.id,
        :key    => "action_edit__#{@action.id}",
        :new    => {:description => "foo", :options => options, :attrs => attrs}
      }
      edit[:current] = copy_hash(edit[:new])
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
    end

    it 'replaces attr/value in `edit[:new][:attrs]` instead of adding' do
      controller.params = {"id" => @action.id, "value_3" => "v6", "attribute_3" => "a6"}
      allow(controller).to receive(:render)
      controller.send(:action_field_changed)
      edit = assigns(:edit)
      expect(edit[:new][:attrs].count).to eq(edit[:current][:attrs].count)
      expect(edit[:new][:attrs][2]).to eq(["a6", "v6"])
    end

    it 'deletes attr/value in `edit[:new][:attrs]` that is cleared out' do
      controller.params = {"id" => @action.id, "value_3" => "", "attribute_3" => ""}
      allow(controller).to receive(:render)
      controller.send(:action_field_changed)
      ae_hash_original = @action[:options][:ae_hash]
      controller.send(:action_set_record_vars, @action)
      expect(@action[:options][:ae_hash]).to_not eq(ae_hash_original)
    end

    it 'save change in `edit[:new]` when description is edited' do
      controller.params = {"description" => "FooBar", "id" => @action.id}
      allow(controller).to receive(:render)
      controller.send(:action_field_changed)
      edit = assigns(:edit)
      expect(edit[:new][:description]).to_not eq(edit[:current][:description])
    end
  end

  describe "#action_get_info" do
    let(:cat1) { FactoryBot.create(:classification, :description => res.first) }
    let(:cat2) { FactoryBot.create(:classification, :description => res.second) }

    before do
      controller.instance_variable_set(:@sb, :active_tree => :action_tree)
    end

    let(:res) { %w(test1 test2) }
    let(:action) do
      FactoryBot.create(:miq_action,
                        :action_type => 'inherit_parent_tags',
                        :options     => {:cats => [cat1.name, cat2.name]})
    end

    it "joins classification tags" do
      controller.send(:action_get_info, action)
      expect(controller.instance_variable_get(:@cats)).to eq(res.join(' | '))
    end
  end
end

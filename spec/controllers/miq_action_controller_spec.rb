describe MiqActionController do
  before { stub_user(:features => :all) }

  describe "#show_list" do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  context "#action_edit" do
    before do
      @action = FactoryBot.create(:miq_action, :name => "Test_Action")
      controller.instance_variable_set(:@lastaction, "show")
    end

    it "first time in" do
      controller.edit
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "Test reset button" do
      controller.params = {:button => "reset", :id => @action.id}
      expect(controller).to receive(:javascript_redirect).with(:action        => 'edit',
                                                               :id            => @action.id,
                                                               :flash_msg     => _("All changes have been reset"),
                                                               :flash_warning => true)
      controller.send(:edit)
    end
  end
  context "#action_field_changed" do
    before do
      options = {:ae_hash => {"a1" => "v1", "a2" => "v2", "a3" => "v3", "a4" => "v4", "a5" => "v5"}}
      @action = FactoryBot.create(:miq_action, :name => "Test_Action", :options => options)
      attrs   = [["a1", "v1"], ["a2", "v2"], ["a3", "v3"], ["a4", "v4"], ["a5", "v5"]]
      edit = {
        :rec_id => @action.id,
        :key    => "miq_action_edit__#{@action.id}",
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

  describe "#show" do
    let(:cat1) { FactoryBot.create(:classification, :description => res.first) }
    let(:cat2) { FactoryBot.create(:classification, :description => res.second) }

    let(:res) { %w[test1 test2] }
    let(:action) do
      FactoryBot.create(:miq_action,
                        :action_type => 'inherit_parent_tags',
                        :options     => {:cats => [cat1.name, cat2.name]})
    end

    it "render show" do
      get(:show, :params => {:id => action.id})

      expect(response.status).to eq(200)
      expect(controller.instance_variable_get(:@cats)).to eq(res.join(' | '))
    end
  end
end

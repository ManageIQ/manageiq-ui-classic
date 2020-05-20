describe ChargebackAssignmentController do
  before { stub_user(:features => :all) }

  context "returns current rate assignments or set them to blank if category/tag is deleted" do
    let(:category) { FactoryBot.create(:classification) }
    let(:tag)      { FactoryBot.create(:classification, :parent_id => category.id) }
    let(:entry)    { FactoryBot.create(:classification, :parent_id => tag.id) }

    describe "#get_tags_all" do
      before { entry }

      it "returns the classification entry record" do
        controller.instance_variable_set(:@edit, :cb_assign => {:tags => {}})
        controller.send(:get_tags_all)

        result = {category.id => {tag.id.to_s => tag.description}, tag.id => { entry.id.to_s => entry.description}, entry.id => {}}

        expect(assigns(:edit)[:cb_assign][:tags]).to eq(result)
      end
    end

    describe "#set_form_vars" do
      before do
        cbr = FactoryBot.create(:chargeback_rate, :rate_type => "Storage")
        ChargebackRate.set_assignments(:Storage, [{:cb_rate => cbr, :tag => [tag, "vm"]}])
        controller.params = {:id => "Storage"}
      end

      it "returns tag for current assignments" do
        controller.send(:set_form_vars)
        expect(assigns(:edit)[:current_assignment][0][:tag][0]['parent_id']).to eq(category.id)
      end

      it "returns empty array for current_assignment when tag/category is not found" do
        tag.destroy
        controller.send(:set_form_vars)
        expect(assigns(:edit)[:current_assignment]).to eq([])
      end
    end

    describe '#get_form_vars' do
      before do
        controller.params = {:cblabel_key => 'null'}
        controller.instance_variable_set(:@edit, :new => {:cbshow_typ => '-labels'}, :cb_assign => {})
      end

      it "returns tag for current assignments" do
        expect { controller.send(:get_form_vars) }.not_to raise_error
      end

      it "initializes hash when data are no available(params[:cblabel_key] == null)" do
        controller.send(:get_form_vars)
        docker_label_values = controller.instance_variable_get(:@edit)[:cb_assign][:docker_label_values]
        expect(docker_label_values).to eq({})
      end

      it "initializes hash when data are no available (params[:cblabel_key] == nil)" do
        controller.params = {:cblabel_key => nil}
        controller.send(:get_form_vars)
        docker_label_values = controller.instance_variable_get(:@edit)[:cb_assign][:docker_label_values]
        expect(docker_label_values).to eq({})
      end
    end
  end

  describe "#index" do
    render_views

    it "can be rendered" do
      EvmSpecHelper.create_guid_miq_server_zone
      get :index
      expect(response.status).to eq(200)
      expect(response).to render_template('show')
    end
  end

  describe "#get_cis_all" do
    let!(:storage) { FactoryBot.create(:storage) }
    let!(:miq_enterprise) { FactoryBot.create(:miq_enterprise) }

    it "returns names of instances of enterprise" do
      names_miqent = {}
      MiqEnterprise.all.each do |instance|
        names_miqent[instance.id] = instance.name
      end
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => "enterprise"}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq(names_miqent)
    end

    it "returns names of instances of storage" do
      names_storage = {}
      element = "storage"
      element.classify.constantize.all.each do |instance|
        names_storage[instance.id] = instance.name
      end
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => element}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq(names_storage)
    end

    it "returns a ArgumentError when element not in whitelist" do
      controller.instance_variable_set(:@edit, :new => {:cbshow_typ => "None"}, :cb_assign => {})
      expect { controller.send(:get_cis_all) }.to raise_error(ArgumentError)
    end

    it "doesn't names of instances when nothing is selected" do
      controller.instance_variable_set(:@edit,
                                       :new => {:cbshow_typ => described_class::NOTHING_FORM_VALUE}, :cb_assign => {})
      controller.send(:get_cis_all)
      expect(assigns(:edit)[:cb_assign][:cis]).to eq({})
    end
  end

  describe '#form_field_changed' do
    let(:edit) do
      {
        :cb_assign => {
          :cats => {
            '1' => 'Category1',
            '2' => 'Category2'
          },
          :tags => {
            1 => {
              '2' => 'Tag1',
              '3' => 'Tag2',
              '4' => 'Tag3'
            },
            2 => {}
          }
        },
        :current   => {
          :cbshow_typ       => 'storage-tags',
          :cbtag_cat        => '1',
          'storage-tags__2' => '3',
          :type             => 'Storage'
        },
        :new       => {
          :cbshow_typ       => 'storage-tags',
          :cbtag_cat        => '1',
          'storage-tags__2' => '3',
          :type             => 'Storage'
        }
      }
    end

    before do
      allow(controller).to receive(:load_edit).and_return(true)
      controller.instance_variable_set(:@edit, edit)
    end

    context 'changing Tag Category for assignments' do
      it 'hides buttons as no change has been made' do
        post :form_field_changed, :params => {:cbtag_cat => '2'}
        expect(response.body).to include("miqButtons('hide');")
      end
    end

    context 'changing Assigned To, for assignments' do
      it 'hides buttons as no change has been made' do
        post :form_field_changed, :params => {:cbshow_typ => 'storage'}
        expect(response.body).to include("miqButtons('hide');")
      end
    end

    context 'changing item under Selections, for assignments' do
      it 'shows buttons as a change in Selections has been made' do
        post :form_field_changed, :params => {'storage-tags__3' => '4'}
        expect(response.body).to include("miqButtons('show');")
      end
    end
  end
end

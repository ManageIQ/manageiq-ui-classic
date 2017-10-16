describe GenericObjectController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      generic_obj_defn = FactoryGirl.create(:generic_object_definition)
      generic_obj = FactoryGirl.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      get :show, :params => {:id => generic_obj.id}
    end
    it { expect(response.status).to eq(200) }

    it 'displays Generic Object association in the nested display list' do
      generic_obj_defn = FactoryGirl.create(
        :generic_object_definition,
        :name       => "test_definition",
        :properties => {
          :attributes   => {
            :flag       => "boolean",
            :data_read  => "float",
            :max_number => "integer",
            :server     => "string",
            :s_time     => "datetime"
          },
          :associations => {"cp" => "ManageIQ::Providers::CloudManager", "vms" => "Vm"},
          :methods      => %w(some_method)
        }
      )
      generic_obj = FactoryGirl.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      
      get :show, :params => { :display => "cp", :id => generic_obj.id }
      expect(response.status).to eq(200)

      get :show, :params => { :display => "vms", :id => generic_obj.id }
      expect(response.status).to eq(200)
    end
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      generic_obj_defn = FactoryGirl.create(:generic_object_definition)
      FactoryGirl.create(:generic_object, :generic_object_definition_id => generic_obj_defn.id)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end
end

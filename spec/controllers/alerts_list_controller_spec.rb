describe AlertsListController do
  let(:user) { FactoryGirl.create(:user, :role => "super_administrator") }

  before(:each) do
    EvmSpecHelper.create_guid_miq_server_zone
    MiqRegion.seed
    login_as user
  end

  describe "#class_icons" do
    it "returns a json response of the class icons" do
      get :class_icons, :format => :json
      response_body = JSON.parse(response.body)
      
      expect(response.status).to eq(200)

      {
        "ManageIQ::Providers::Kubernetes::ContainerManager"                => /^\/assets\/svg\/vendor-kubernetes.*\.svg/,
        "ManageIQ::Providers::Kubernetes::ContainerManager::ContainerNode" => /^\/assets\/svg\/container_node.*\.svg/, 
        "ManageIQ::Providers::Openshift::ContainerManager"                 => /^\/assets\/svg\/vendor-openshift.*\.svg/,
      }.each do |klass_key, image_match|
        expect(response_body[klass_key]).to match(image_match)
      end
    end
  end
end

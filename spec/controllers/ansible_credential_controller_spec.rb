describe AnsibleCredentialController do
	include CompressedIds
	before do
		EvmSpecHelper.create_guid_miq_server_zone
    	@repository = FactoryGirl.create(:ansible_credential)
    	login_as FactoryGirl.create(:user_admin)
		binding.pry
	end

	context "show" do
		subject do
			get :show, :params => {:id => @repository.id}
     end

     	it "render specific repostitory" do
			is_expected.to have_http_status 200
     	end
	end

	context "showList" do
		subject do
			get :show_list
     	end

     	it "render list of repositories" do
			is_expected.to have_http_status 200
			is_expected.to render_template(:partial => "pxe_server_details", :locals => {:action_url => "pxe_server_list"})
     	end
	end
end

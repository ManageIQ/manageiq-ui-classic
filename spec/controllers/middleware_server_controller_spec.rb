describe MiddlewareServerController do
  let(:server) { FactoryGirl.create(:hawkular_middleware_server, :properties => {}, :middleware_server_group => nil) }

  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    let(:deployment) { FactoryGirl.create(:middleware_deployment, :middleware_server => server) }
    let(:datasource) { FactoryGirl.create(:middleware_datasource, :middleware_server => server) }
    let(:jms_queue) do
      FactoryGirl.create(:hawkular_middleware_messaging_initialized_queue,
                         :middleware_server => server)
    end

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :params => {:id => server.id} }

    context 'render' do
      render_views

      it 'display textual groups' do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end

      it 'display listnav partial' do
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_server')
      end

      it 'display other specific partials' do
        is_expected.to render_template(:partial => 'middleware_shared/_ops_params')
        is_expected.to render_template(:partial => 'middleware_server/_deploy')
        is_expected.to render_template(:partial => 'middleware_server/_add_jdbc_driver')
        is_expected.to render_template(:partial => 'middleware_server/_add_datasource')
      end
    end

    it 'show associated server entities' do
      assert_nested_list(server, [deployment], 'middleware_deployments', 'All Middleware Deployments')
      assert_nested_list(server, [datasource], 'middleware_datasources', 'All Middleware Datasources')
      assert_nested_list(server, [jms_queue], 'middleware_messagings', 'All Middleware Messagings')
    end
  end

  context '#tags_edit' do
    let!(:user) { stub_user(:features => :all) }
    let(:classification) { FactoryGirl.create(:classification, :name => 'department', :description => 'Department') }
    let(:tag1) { FactoryGirl.create(:classification_tag, :name   => 'tag1', :parent => classification) }
    let(:tag2) { FactoryGirl.create(:classification_tag, :name   => 'tag2', :parent => classification) }

    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      allow(server).to receive(:tagged_with).with(:cat => user.userid).and_return('my tags')
      allow(Classification).to receive(:find_assigned_entries).with(server).and_return([tag1, tag2])
      session[:tag_db] = 'MiddlewareServer'
      edit = {
        :key        => "MiddlewareServer_edit_tags__#{server.id}",
        :tagging    => 'MiddlewareServer',
        :object_ids => [server.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it 'builds tagging screen' do
      post :button, :params => { :pressed => 'middleware_server_tag', :format => :js, :id => server.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it 'cancels tags edit' do
      session[:breadcrumbs] = [{:url => "middleware_server/show/#{server.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => 'cancel', :format => :js, :id => server.id }
      expect(assigns(:flash_array).first[:message]).to include('was cancelled by the user')
      expect(assigns(:edit)).to be_nil
    end

    it 'save tags' do
      session[:breadcrumbs] = [{:url => "middleware_server/show/#{server.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => 'save', :format => :js, :id => server.id }
      expect(assigns(:flash_array).first[:message]).to include('Tag edits were successfully saved')
      expect(assigns(:edit)).to be_nil
    end
  end
end

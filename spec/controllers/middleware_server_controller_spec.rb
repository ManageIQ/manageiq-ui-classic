describe MiddlewareServerController do
  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  describe '#button' do
    include_examples :ems_common_button_examples
  end

  it 'renders index' do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  describe '#show' do
    let(:server) { FactoryGirl.create(:hawkular_middleware_server, :properties => {}, :middleware_server_group => nil) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :params => {:id => server.id} }

    context 'render' do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_server')
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end
    end
  end

  # FIXME: should test for nested entities: %w(middleware_datasources middleware_deployments middleware_messagings)
  describe '#show' do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:server) { FactoryGirl.create(:middleware_server) }
    let(:deployment) { FactoryGirl.create(:middleware_deployment, :middleware_server => server) }

    it "show associated server groups" do
      assert_nested_list(server, [deployment], 'middleware_deployments', 'All Middleware Deployments')
    end
  end
end

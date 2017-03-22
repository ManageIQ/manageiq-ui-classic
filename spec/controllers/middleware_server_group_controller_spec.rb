describe MiddlewareServerGroupController do
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
    let(:group) { FactoryGirl.create(:hawkular_middleware_server_group, :properties => {}, :middleware_domain => nil) }
    let(:server) { FactoryGirl.create(:hawkular_middleware_server, :properties => {},
                                      :middleware_server_group => group) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :id => group.id }

    context 'render' do
      render_views

      it 'display textual groups' do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end

      it 'display listnav partial' do
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_server_group')
      end

      it 'display other specific partials' do
        is_expected.to render_template(:partial => 'middleware_shared/_ops_params')
        is_expected.to render_template(:partial => 'middleware_server_group/_deploy')
      end
    end

    it 'show associated servers' do
      assert_nested_list(group, [server], 'middleware_servers', 'All Middleware Servers')
    end

  end
end

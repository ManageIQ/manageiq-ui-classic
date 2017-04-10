describe MiddlewareDomainController do
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
    let(:domain) { FactoryGirl.create(:hawkular_middleware_domain, :properties => {}) }
    let(:server_group) do
      FactoryGirl.create(:hawkular_middleware_server_group, :properties        => {},
                                                            :middleware_domain => domain)
    end

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
    end

    subject { get :show, :params => { :id => domain.id } }

    context 'render' do
      render_views

      it 'display textual groups' do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      end

      it 'display listnav partial' do
        is_expected.to render_template(:partial => 'layouts/listnav/_middleware_domain')
      end

      it 'show associated server_group entities' do
        assert_nested_list(domain, [server_group], 'middleware_server_groups', 'All Middleware Server Groups')
      end
    end
  end
end

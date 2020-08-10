describe EmsContainerController do
  before do
    stub_user(:features => :all)
  end

  it "#new" do
    controller.instance_variable_set(:@breadcrumbs, [])
    get :new

    expect(response.status).to eq(200)
  end

  describe "#show" do
    before do
      session[:settings] = {:views => {}}
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      @container = FactoryBot.create(:ems_kubernetes)
    end

    context "render" do
      subject { get :show, :params => { :id => @container.id } }
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'ems_container/_show_dashboard')
      end

      it "renders timeline" do
        get :show, :params => { :id => @container.id, :display => 'timeline' }
        expect(response.status).to eq(200)
      end

      it "renders topology view" do
        get :show, :params => { :id => @container.id, :display => 'topology' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('container_topology/show')
      end

      it "renders ad hoc view" do
        get :show, :params => { :id => @container.id, :display => 'ad_hoc_metrics' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
      end
    end

    context "render dashboard" do
      subject { get :show, :params => { :id => @container.id, :display => 'dashboard' } }
      render_views

      it 'never render template show' do
        is_expected.not_to render_template('shared/views/ems_common/show')
      end

      it 'uses its own template' do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "ems_container/show_dashboard")
      end
    end
  end

  include_examples '#download_summary_pdf', :ems_kubernetes
  %w(container_projects container_nodes container_images container_volumes
     container_templates).each do |custom_button_class|
    include_examples "relationship table screen with custom buttons", custom_button_class
  end
end

describe "layouts/listnav/_show_list.html.haml" do
  let(:search) { FactoryBot.create(:miq_search) }

  before do
    set_controller_for_view('host')
    assign(:def_searches, [search])
    assign(:panels, {})
    assign(:view, FactoryBot.create(:miq_report_filesystem, :db => 'Host'))
  end

  it 'creates a link for a regular filter in accordion' do
    render :partial => 'layouts/listnav/show_list'
    expect(response).to include("<a data-method=\"post\" title=\"Apply this filter\" onclick=\"return miqCheckForChanges()\" data-remote=\"true\" href=\"/host/listnav_search_selected/#{search.id}?button=apply\">#{search.description}</a>")
  end

  it 'sets filter as inactive in accordion' do
    render :partial => 'layouts/listnav/show_list'
    expect(response).to include("<li class=''>")
  end

  context 'default filter' do
    before do
      assign(:edit, :expression => {:exp_model => 'Host'})
      assign(:expkey, :expression)
      assign(:settings, :default_search => {:AvailabilityZone => 123})
      search.id = 0
    end

    it 'updates name of a default filter and creates a link for it' do
      render :partial => 'layouts/listnav/show_list'
      expect(response).to include("<a data-method=\"post\" title=\"Apply this filter\" onclick=\"return miqCheckForChanges()\" data-remote=\"true\" href=\"/host/listnav_search_selected/#{search.id}?button=apply\">#{search.description} (Default)</a>")
    end

    it 'sets filter as active in accordion' do
      render :partial => 'layouts/listnav/show_list'
      expect(response).to include("<li class='active'>")
    end

    context 'default filter already set' do
      before { assign(:default_search, search) }

      it 'updates name of a default filter and creates a link for it' do
        render :partial => 'layouts/listnav/show_list'
        expect(response).to include("<a data-method=\"post\" title=\"Apply this filter\" onclick=\"return miqCheckForChanges()\" data-remote=\"true\" href=\"/host/listnav_search_selected/#{search.id}?button=apply\">#{search.description} (Default)</a>")
      end
    end

    context '@edit[:expression][:selected] set' do
      before { assign(:edit, :expression => {:exp_model => 'Host', :selected => {:id => 0}}) }

      it 'sets filter as active in accordion' do
        render :partial => 'layouts/listnav/show_list'
        expect(response).to include("<li class='active'>")
      end

      context '@edit[:expression][:selected][:name] set' do
        before { assign(:edit, :expression => {:exp_model => 'Host', :selected => {:id => 123, :name => search.name}}) }

        it 'sets filter as active in accordion' do
          render :partial => 'layouts/listnav/show_list'
          expect(response).to include("<li class='active'>")
        end
      end
    end
  end

  context 'displaying nested list of VMs and not setting @edit' do
    before do
      assign(:settings, :default_search => {:AvailabilityZone => 123})
      search.id = 0
    end

    it 'does not set filter as default' do
      render :partial => 'layouts/listnav/show_list'
      expect(response).not_to include("(Default)")
    end
  end

  context 'My Filters' do
    before do
      set_controller_for_view('host')
      assign(:def_searches, nil)
      assign(:expkey, :expression)
      assign(:my_searches, [search])
      assign(:panels, {})
      assign(:settings, {})
      assign(:view, FactoryBot.create(:miq_report_filesystem, :db => 'Host'))
    end

    it 'creates a link for a regular filter in accordion' do
      render :partial => 'layouts/listnav/show_list'
      expect(response).to include("<a data-method=\"post\" title=\"Apply this filter\" onclick=\"return miqCheckForChanges()\" data-remote=\"true\" href=\"/host/listnav_search_selected/#{search.id}?button=apply\">#{search.description}</a>")
    end

    it 'sets filter as inactive in accordion' do
      render :partial => 'layouts/listnav/show_list'
      expect(response).to include("<li class=''>")
    end

    context '@edit[:expression][:selected][:name] set' do
      before { assign(:edit, :expression => {:exp_model => 'Host', :selected => {:id => 123, :name => search.name}}) }

      it 'sets filter as active in accordion' do
        render :partial => 'layouts/listnav/show_list'
        expect(response).to include("<li class='active'>")
      end
    end

    context 'default filter set' do
      before do
        assign(:default_search, search)
        assign(:edit, :expression => {:exp_model => 'Host', :selected => {:id => search.id}})
      end

      it 'sets filter as active in accordion' do
        render :partial => 'layouts/listnav/show_list'
        expect(response).to include("<li class='active'>")
      end
    end
  end
end

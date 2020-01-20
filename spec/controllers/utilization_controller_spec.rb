describe UtilizationController do
  describe '#get_node_info' do
    it 'sets correct right cell headers' do
      mr = FactoryBot.create(:miq_region, :description => "My Region")
      e = FactoryBot.create(:ems_vmware, :name => "My Management System")
      cl = FactoryBot.create(:ems_cluster, :name => "My Cluster")
      host = FactoryBot.create(:host, :name => "My Host")
      ds = FactoryBot.create(:storage_vmware, :name => "My Datastore")
      title_suffix = "Utilization Trend Summary"
      tree_nodes = {:region => {:active_node  => "mr-#{mr.id}",
                                :title_prefix => "Region",
                                :title        => mr.description},
                    :e      => {:active_node  => "e-#{e.id}",
                                :title_prefix => "Provider",
                                :title        => e.name},
                    :cl     => {:active_node  => "c-#{cl.id}",
                                :title_prefix => "Cluster / Deployment Role",
                                :title        => cl.name},
                    :host   => {:active_node  => "h-#{host.id}",
                                :title_prefix => "Host / Node",
                                :title        => host.name},
                    :ds     => {:active_node  => "ds-#{ds.id}",
                                :title_prefix => "Datastore",
                                :title        => ds.name}}
      tree_nodes.each do |_key, node|
        controller.instance_variable_set(:@sb, :trees       => {
                                           :utilization_tree => {:active_node => node[:active_node]},
                                         },
                                               :active_tree => :utilization_tree,
                                               :options     => {})
        expect(controller).not_to receive(:render)
        controller.send(:get_node_info, node[:active_node])
        expect(assigns(:right_cell_text)).to eq("#{node[:title_prefix]} \"#{node[:title]}\" #{title_suffix}")
      end
    end
  end

  describe "breadcrumbs" do
    it "display breadcrumbs" do
      get :index

      expect(controller.data_for_breadcrumbs).to eq([{:title=>"Overview"}, {:title=>"Utilization"}])
    end
  end

  describe "report_download" do
    before do
      stub_user(:features => :all)
      setup_zone
    end

    it "generates the HTML report for PDF export" do
      session[:sandboxes] = {controller.controller_name => {:title => 'test report'}}
      expect(controller).to receive(:summ_hashes).and_return(
        [
          {"section" => _("Basic Info"), "item" => "neco",   "value" => "1"},
          {"section" => _("CPU"),        "item" => "jinyho", "value" => "1"},
          {"section" => _("Memory"),     "item" => "tady",   "value" => "2"},
          {"section" => _("Disk"),       "item" => "bude",   "value" => "3"},
        ]
      )

      get :report_download, :params => {:typ => 'pdf'}
      expect(response.status).to eq(200)
    end
  end
end

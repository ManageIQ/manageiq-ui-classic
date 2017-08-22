describe BottlenecksController do
  context do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      stub_user(:features => :all)
      FactoryGirl.create(:miq_enterprise)
      FactoryGirl.create(:miq_region, :description => "My Region")
    end

    describe '#index' do
      it 'renders the page' do
        seed_session_trees('miq_capacity', :bottlenecks_tree, 'foobar')
        expect(controller).to receive(:get_node_info)
        # render fails but it's not needed for this test
        expect(controller).to receive(:render)
        controller.index
      end
    end

    describe '#reload' do
      it 'reloads tree with active node' do
        seed_session_trees('miq_capacity', :bottlenecks_tree, 'foobar')
        expect(controller).to receive(:tree_select).once.and_call_original
        expect(controller).to receive(:get_node_info).once
        post :reload
      end
    end
  end

  describe '#get_node_info' do
    it 'sets correct right cell headers' do
      mr = FactoryGirl.create(:miq_region, :description => "My Region")
      e = FactoryGirl.create(:ems_vmware, :name => "My Management System")
      cl = FactoryGirl.create(:ems_cluster, :name => "My Cluster")
      host = FactoryGirl.create(:host, :name => "My Host")
      ds = FactoryGirl.create(:storage_vmware, :name => "My Datastore")
      title_suffix = 'Bottlenecks Summary'
      tree_nodes = {:region => {:active_node  => "mr-#{MiqRegion.compress_id(mr.id)}",
                                :title_prefix => "Region",
                                :title        => mr.description},
                    :e      => {:active_node  => "e-#{MiqRegion.compress_id(e.id)}",
                                :title_prefix => "Provider",
                                :title        => e.name},
                    :cl     => {:active_node  => "c-#{MiqRegion.compress_id(cl.id)}",
                                :title_prefix => "Cluster / Deployment Role",
                                :title        => cl.name},
                    :host   => {:active_node  => "h-#{MiqRegion.compress_id(host.id)}",
                                :title_prefix => "Host / Node",
                                :title        => host.name},
                    :ds     => {:active_node  => "ds-#{MiqRegion.compress_id(ds.id)}",
                                :title_prefix => "Datastore",
                                :title        => ds.name}}
      tree_nodes.each do |_key, node|
        controller.instance_variable_set(:@sb, :trees       => {
                                           :bottlenecks_tree => {:active_node => node[:active_node]}
                                         },
                                               :active_tree => :bottlenecks_tree,
                                               :options     => {},)
        expect(controller).not_to receive(:render)
        controller.send(:get_node_info, node[:active_node])
        expect(assigns(:right_cell_text)).to eq("#{node[:title_prefix]} \"#{node[:title]}\" #{title_suffix}")
      end
    end
  end
end

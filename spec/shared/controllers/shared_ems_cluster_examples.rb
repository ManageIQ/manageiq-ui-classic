shared_examples :ems_cluster_button_examples do
  let(:ems_cluster_1) { FactoryGirl.create(:ems_cluster) }
  let(:ems_cluster_2) { FactoryGirl.create(:ems_cluster) }

  let(:checked_clusters) do
    [ems_cluster_1.id, ems_cluster_2.id].map{ |id| ApplicationRecord.compress_id(id) }.join(",")
  end

  it "handles ems_cluster_compare" do
    expect(controller).to receive(:comparemiq).and_call_original
    post :button, :params => { :pressed => "ems_cluster_compare", :miq_grid_checks => checked_clusters }
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles ems_cluster_delete" do
    expect(controller).to receive(:deleteclusters)
    post :button, :params => { :pressed => "ems_cluster_delete", :id => ems_cluster_1.id }
  end

  it 'handles ems_cluster_scan' do
    expect(controller).to receive(:scanclusters)
    post :button, :params => { :pressed => "ems_cluster_scan", :id => ems_cluster_1.id }
  end

  it 'handles ems_cluster_tag' do
    expect(controller).to receive(:tag).with(EmsCluster).and_call_original
    post :button, :params => { :pressed => "ems_cluster_tag" }
    expect(assigns(:flash_array)).to be_nil
    expect(response.status).to eq(200)
  end

  it "handles ems_cluster_protect" do
    if controller.send(:handled_buttons).include?("ems_cluster_protect")
      expect(controller).to receive(:assign_policies).with(EmsCluster).and_call_original
      post :button, :params => { :pressed => "ems_cluster_protect", :id => ems_cluster_1.id }
      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end
  end
end

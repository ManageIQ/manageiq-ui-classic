# storage_refresh
# storage_scan
# storage_delete

shared_examples :storage_button_examples do
  it "handles storage_refresh" do
    expect(controller).to receive(:refreshstorage)
    post :button, :params => { :pressed => "storage_refresh", :format => :js }
  end

  it "handles storage_scan" do
    expect(controller).to receive(:scanstorage)
    post :button, :params => { :pressed => "storage_scan", :format => :js }
  end

  it "handles storage_delete" do
    expect(controller).to receive(:deletestorages)
    post :button, :params => { :pressed => "storage_delete", :format => :js }
  end
end

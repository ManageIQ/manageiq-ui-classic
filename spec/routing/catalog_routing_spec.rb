require 'routing/shared_examples'

describe 'routes for CatalogController' do
  let(:controller_name) { 'catalog' }

  it_behaves_like 'A controller that has download_data routes'
  it_behaves_like 'A controller that has explorer routes'

  %w(
    download_data
    explorer
    ot_edit
    show
  ).each do |path|
    describe "##{path}" do
      it "routes with GET" do
        expect(get("/#{controller_name}/#{path}")).to route_to("#{controller_name}##{path}")
      end
    end
  end

  %w(
    ab_group_reorder
    accordion_select
    ae_tree_select
    ae_tree_select_discard
    ae_tree_select_toggle
    atomic_form_field_changed
    atomic_st_edit
    automate_button_field_changed
    button_create
    button_update
    explorer
    group_create
    group_form_field_changed
    group_reorder_field_changed
    group_update
    identify_catalog
    ot_tags_edit
    prov_field_changed
    reload
    resolve
    resource_delete
    servicetemplate_edit
    sort_ds_grid
    sort_host_grid
    sort_iso_img_grid
    sort_pxe_img_grid
    sort_vc_grid
    sort_vm_grid
    st_catalog_edit
    st_edit
    st_form_field_changed
    st_tags_edit
    st_upload_image
    tree_autoload
    tree_select
    x_button
    x_history
    x_show
  ).each do |path|
    describe "##{path}" do
      it "routes with POST" do
        expect(post("/#{controller_name}/#{path}")).to route_to("#{controller_name}##{path}")
      end
    end
  end
end

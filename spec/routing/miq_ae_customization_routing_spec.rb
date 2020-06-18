require "routing/shared_examples"

describe MiqAeCustomizationController do
  let(:controller_name) { 'miq_ae_customization' }

  %w(
    explorer
    export_service_dialogs
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
    automate_button_field_changed
    button_create
    button_update
    change_tab
    dialog_copy_editor
    dialog_list
    explorer
    group_create
    group_form_field_changed
    group_reorder_field_changed
    group_update
    import_service_dialogs
    old_dialogs_form_field_changed
    old_dialogs_list
    old_dialogs_update
    reload
    resolve
    tree_autoload
    tree_select
    upload_import_file
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

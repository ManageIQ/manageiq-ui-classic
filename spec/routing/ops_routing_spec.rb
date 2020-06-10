require "routing/shared_examples"

describe "routing for OpsController" do
  let(:controller_name) { "ops" }

  %w(
    explorer
    fetch_audit_log
    fetch_log
    fetch_production_log
    log_collection_form_fields
    log_protocol_changed
    schedule_form_fields
  ).each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w(
    accordion_select
    apply_imports
    ap_ce_delete
    ap_ce_select
    ap_edit
    ap_form_field_changed
    ap_set_active_tab
    aps_list
    category_delete
    category_edit
    category_field_changed
    ce_accept
    ce_delete
    ce_new_cat
    ce_select
    change_tab
    cu_collection_field_changed
    cu_collection_update
    cu_repair
    cu_repair_field_changed
    db_backup
    db_backup_form_field_changed
    db_gc_collection
    diagnostics_server_list
    diagnostics_tree_select
    edit_rhn
    explorer
    forest_accept
    forest_delete
    forest_form_field_changed
    forest_select
    label_tag_mapping_delete
    label_tag_mapping_edit
    label_tag_mapping_update
    label_tag_mapping_field_changed
    log_depot_edit
    log_depot_validate
    orphaned_records_delete
    perf_chart_chooser
    rbac_group_edit
    rbac_group_field_changed
    rbac_group_seq_edit
    rbac_group_user_lookup
    rbac_groups_list
    rbac_role_edit
    rbac_role_field_changed
    rbac_roles_list
    rbac_tags_edit
    rbac_tenants_list
    rbac_user_edit
    rbac_user_field_changed
    rbac_users_list
    region_edit
    repo_default_name
    restart_server
    rhn_buttons
    rhn_default_server
    rhn_validate
    schedule_edit
    schedule_form_filter_type_field_changed
    schedules_list
    settings_form_field_changed
    settings_update
    show
    smartproxy_affinity_field_changed
    tag_edit_form_field_changed
    tl_chooser
    tree_autoload
    tree_select
    upload_csv
    upload_form_field_changed
    upload_login_logo
    upload_logo
    wait_for_task
    x_button
    zone_edit
    zone_field_changed
  ).each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end

describe 'layouts/_compare_sections.html.haml' do
  before do
    set_controller_for_view("host")
    @sb = {
      "compare_db"      => "Host",
      "miq_temp_params" => "all",
      "trees"           => {
        "all_sections_tree" => {
          "tree"         => :all_sections_tree,
          "klass_name"   => "TreeBuilderSections",
          "open_nodes"   => [],
          "full_ids"     => true,
          "checkboxes"   => true,
          "three_checks" => true,
          "oncheck"      => "miqOnCheckSections",
          "check_url"    => "/host/sections_field_changed/",
          "active_node"  => "xx-group_Properties"
        }
      }
    }
    MiqReport.seed
    rpt = MiqReport.find_by(:filename => "hosts.yaml", :template_type => "compare")
    @sections_tree = TreeBuilderSections.new(:all_sections_tree,
                                             @sb,
                                             true,
                                             :data            => MiqCompare.new({:ids=>[1, 2]}, rpt),
                                             :controller_name => "host",
                                             :current_tenant  => "manageiq")
  end

  it 'Apply button is enabled' do
    allow(view).to receive(:session).and_return(:selected_sections => [:_model_])
    render :partial => 'layouts/listnav/compare_sections'
    apply_buttons_on = "<div id='buttons_on' style='display:display;'>"
    apply_button_off = "<div id='buttons_off' style='display:none;'>"
    expect(response).to include(apply_buttons_on)
    expect(response).to include(apply_button_off)
  end

  it 'Apply button is disabled' do
    allow(view).to receive(:session).and_return(:selected_sections => [])
    render :partial => 'layouts/listnav/compare_sections'
    apply_buttons_on = "<div id='buttons_on' style='display:none;'>"
    apply_button_off = "<div id='buttons_off' style='display:display;'>"
    expect(response).to include(apply_buttons_on)
    expect(response).to include(apply_button_off)
  end
end

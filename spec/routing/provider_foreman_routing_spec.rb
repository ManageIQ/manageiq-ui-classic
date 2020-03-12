require 'routing/shared_examples'

describe 'routes for ConfigurationManager' do
  let(:controller_name) { 'configuration_manager' }

  it_behaves_like 'A controller that has advanced search routes'
  it_behaves_like 'A controller that has download_data routes'

  %w(
    download_data
    explorer
    form_fields
    tagging_edit
    show
    show_list
  ).each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w(
    accordion_select
    authentication_validate
    button
    change_tab
    delete
    edit
    explorer
    exp_button
    exp_changed
    exp_token_pressed
    form_field_changed
    new
    provision
    quick_search
    refresh
    reload
    show
    show_list
    tagging
    tagging_edit
    tag_edit_form_field_changed
    tree_autoload
    tree_select
    users
    wait_for_task
    x_button
    x_history
    x_search_by_name
    x_show
  ).each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end

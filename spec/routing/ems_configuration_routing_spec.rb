require 'routing/shared_examples'

describe 'routes for EmsConfiguration' do
  let(:controller_name) { 'ems_configuration' }

  it_behaves_like 'A controller that has advanced search routes'
  it_behaves_like 'A controller that has download_data routes'

  %w(
    button
    download_data
    download_summary_pdf
    edit
    form_fields
    new
    show
    show_list
    tagging_edit
  ).each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w(
    authentication_validate
    button
    change_tab
    delete
    edit
    form_field_changed
    new
    quick_search
    refresh
    reload
    show
    show_list
    tagging
    tagging_edit
    tag_edit_form_field_changed
    wait_for_task
  ).each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end

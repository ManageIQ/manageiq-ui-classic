describe AnsibleRepositoryHelper do
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription

  all_methods = %i(textual_group_properties
                   textual_group_relationships
                   textual_group_options
                   textual_group_smart_management
                   textual_created
                   textual_updated
                   textual_status
                   textual_provider
                   textual_playbooks
                   textual_credential
                   textual_scm_type
                   textual_scm_url
                   textual_scm_branch
                   textual_scm_clean
                   textual_scm_delete_on_update
                   textual_scm_update_on_launch)

  include_examples "method_exists", all_methods

  describe "textual methods return correct value" do
    before { @record = FactoryGirl.create(:embedded_ansible_configuration_script_source) }

    it "#textual_create" do
      allow(@record).to receive(:created_at).and_return(Date.new(2015, 11, 0o1).in_time_zone('UTC'))
      expect(textual_created).to eq(:label => _("Created On"), :value => "Sun, 01 Nov 2015 00:00:00 +0000")
    end

    include_examples "#textual_group_properties", [:name, :description, :created, :updated, :status]
    include_examples "#textual_group_relationships", [:provider, :playbooks, :credential]
    include_examples "#textual_group_options", "Repository", [:scm_type,
                                                              :scm_url,
                                                              :scm_branch,
                                                              :scm_clean,
                                                              :scm_delete_on_update,
                                                              :scm_update_on_launch]
    include_examples "#textual_group_smart_management", [:tags]
  end
end

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
end

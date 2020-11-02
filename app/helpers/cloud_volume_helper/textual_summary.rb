module CloudVolumeHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents

  # old name for backward-compatibility
  def textual_group_list
    textual_summary do
      textual_big_group do
        textual_group "Properties" do
          function_textual_field :name
          textual_field :label => _("Size"), :value => number_to_human_size(@record.size, :precision => 2)
          textual_field :label => _('Bootable'), :value => @record.bootable.to_s
          function_textual_field :description
          textual_field :label => _('Status'), :value => @record.status.to_s
        end

        textual_group "Relationships" do
          hash_textual_field do
            textual_link(
                @record.ext_management_system.try(:parent_manager),
                :label => _("Parent Cloud Provider")
            )
          end
          hash_textual_field { textual_link(@record.ext_management_system) }

          textual_field(
              :label => _('Availability Zone'),
              :icon => "pficon pficon-zone",
              :value => (@record.availability_zone.nil? ? _("None") : @record.availability_zone.name)
          ) do
            textual_field_link(
                :title => _("Show this Volume's Availability Zone"),
                :link => url_for_only_path(:controller => 'availability_zone', :action => 'show', :id => @record.availability_zone),
                :condition => @record.availability_zone && role_allows?(:feature => "availability_zone_show")
            )
          end
          textual_field(
              :label => _('Cloud Tenants'),
              :icon => "pficon pficon-cloud-tenant",
              :value => (@record.cloud_tenant.nil? ? _("None") : @record.cloud_tenant.name)
          ) do
            textual_field_link(
                :link => url_for_only_path(:controller => 'cloud_tenant', :action => 'show', :id => @record.cloud_tenant),
                :title => _("Show this Volume's Cloud Tenants"),
                :condition => @record.cloud_tenant && role_allows?(:feature => "cloud_tenant_show")
            )
          end


          textual_field(
              :label => _('Base Snapshot'),
              :icon => "fa fa-camera",
              :value => @record.respond_to?(:base_snapshot) ? @record.base_snapshot : _("None")
          ) do
            textual_field_link :condition => @record.respond_to?(:base_snapshot) && @record.base_snapshot.present? && role_allows?(:feature => "cloud_volume_snapshot_show") do
              link url_for_only_path(:controller => 'cloud_volume_snapshot', :action => 'show', :id => @record.base_snapshot)
              title _("Show this Volume's Base Snapshot")
            end

          end

          textual_field :label => _('Cloud Volume Backups'),
                        :value => @record.number_of(:cloud_volume_backups),
                        :icon => "pficon pficon-volume" do
            textual_field_link :condition => @record.number_of(:cloud_volume_backups) > 0 && role_allows?(:feature => "cloud_volume_backup_show_list") do
              link url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volume_backups')
              title _("Show all Cloud Volume Backups")
            end

          end

          textual_field :label => _('Cloud Volume Snapshots'), :icon => "fa fa-camera", :value => @record.number_of(:cloud_volume_snapshots) do
            textual_field_link :condition => @record.number_of(:cloud_volume_snapshots) > 0 && role_allows?(:feature => "cloud_volume_snapshot_show_list") do
              link url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volume_snapshots')
              title _("Show all Cloud Volume Snapshots")
            end

          end

          textual_field :label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => @record.number_of(:attachments) do
            textual_field_link :condition => @record.number_of(:attachments) > 0 && role_allows?(:feature => "vm_show_list") do
              title _("Show all attached Instances")
              link url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
            end
          end
          function_textual_field :custom_button_events

        end
      end
      textual_big_group { function_textual_group :tags }
    end
  end

end

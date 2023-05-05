module DiagnosticsOrphanedDataTabHelper
  private

  def orphaned_data_headers
    [
      {:header => _("Username"), :key => 'username'},
      {:header => _("Count"), :key => 'count'},
      {:header => _("Actions"), :key => 'actions'},
    ]
  end

  def orphaned_data_rows(orphaned_records)
    orphaned_records.map do |orphaned_record|
      {
        :id    => orphaned_record[:userid].to_s,
        :cells => [
          {:text => orphaned_record[:userid]},
          {:text => orphaned_record[:count]},
          orphaned_data_delete_button(orphaned_record)
        ]
      }
    end
  end

  def diagnostics_orphaned_data_list(orphaned_records)
    {
      :headers   => orphaned_data_headers,
      :rows      => orphaned_data_rows(orphaned_records),
      :pageTitle => _("Report Results by User")
    }
  end

  def orphaned_data_delete_button(orphaned_record)
    {
      :alt             => _('Click to delete Orphaned Records for this user'),
      :is_button       => true,
      :onclick         => delete_orphaned_record_link(orphaned_record),
      :text            => _("Delete"),
      :kind            => 'danger',
      :buttonClassName => 'delete_orphaned_record'
    }
  end

  # This method can be removed when we change the logic in miq-table-cell.jsx's cellButton function
  def delete_orphaned_record_link(orphaned_record)
    remote_function(:url     => {
                      :action => 'orphaned_records_delete',
                      :id     => orphaned_record[:userid]
                    },
                    :confirm => _("Are you sure you want to delete orphaned records for user '%{user}'?") % {:user => orphaned_record[:userid]})
  end
end

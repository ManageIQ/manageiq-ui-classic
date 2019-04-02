module TextualMixins::TextualFilesystems
  def textual_filesystems
    num = @record.number_of(:filesystems)
    h = {:label => _("Files"), :icon => "fa fa-file-o", :value => num}
    if num.positive?
      h[:title] = n_("Show the File installed on this VM", "Show the Files installed on this VM", num)
      h[:explorer] = true
      h[:link] = url_for_only_path(:controller => controller.controller_name, :action => 'filesystems', :id => @record)
    end
    h
  end
end

module OpsController::Settings::Upload
  extend ActiveSupport::Concern

  logo_dir = File.expand_path(File.join(Rails.root, "public/upload"))
  Dir.mkdir logo_dir unless File.exist?(logo_dir)
  @@logo_file = File.join(logo_dir, "custom_logo.png")
  @@login_logo_file = File.join(logo_dir, "custom_login_logo.png")
  def upload_logo
    upload_logos("custom")
  end

  def upload_login_logo
    upload_logos("login")
  end

  def upload_logos(typ)
    fld = typ == 'custom' ? params[:upload] : params[:login]
    if fld && fld[:logo] && fld[:logo].respond_to?(:read)
      if fld[:logo].original_filename.split(".").last.downcase != "png"
        add_flash(
          typ == "custom" ? _("Custom logo image must be a .png file") : _("Custom login image must be a .png file"),
          :error
        )
      else
        File.open(typ == "custom" ? @@logo_file : @@login_logo_file, "wb") { |f| f.write(fld[:logo].read) }
        msg = typ == "custom" ? _('Custom logo file "%{name}" uploaded') : _('Custom login file "%{name}" uploaded')
        add_flash(msg % {:name => fld[:logo].original_filename})
      end
    else
      add_flash(_("Use the Choose file button to locate .png image file"), :error)
    end
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def upload_form_field_changed
    return unless load_edit("settings_#{params[:id]}_edit__#{@sb[:selected_server_id]}", "replace_cell__explorer")
    @edit[:new][:upload_type] = !params[:upload_type].nil? && params[:upload_type] != "" ? params[:upload_type] : nil
    if !params[:upload_type].blank?
      msg = _("Locate and upload a file to start the import process")
    else
      msg = _("Choose the type of custom variables to be imported")
    end
    add_flash(msg, :info)
    @sb[:good] = nil
    render :update do |page|
      page << javascript_prologue
      page.replace_html("settings_import", :partial => "settings_import_tab")
    end
  end

  def upload_csv
    return unless load_edit("#{@sb[:active_tab]}_edit__#{@sb[:selected_server_id]}", "replace_cell__explorer")
    @flash_array = []
    if params[:upload] && params[:upload][:file] && params[:upload][:file].respond_to?(:read)
      begin
        require 'miq_bulk_import'
        case params[:typ]
        when "tag"
          imp = ClassificationImport.upload(params[:upload][:file])
        when "asset_tag"
          case @edit[:new][:upload_type]
          when "host"
            imp = AssetTagImport.upload('Host', params[:upload][:file])
          when "vm"
            imp = AssetTagImport.upload('VmOrTemplate', params[:upload][:file])
          end
        end
      rescue => bang
        add_flash(_("Error during 'upload': %{message}") % {:message => bang.message}, :error)
      else
        imp.errors.each_value { |msg| add_flash(msg, :error) }
        add_flash(_("Import validation complete: %{good_record}, %{bad_record}") % {
          :good_record => n_("%{num} good record", "%{num} good records", imp.stats[:good]) % {:num => imp.stats[:good]},
          :bad_record  => n_("%{num} bad record", "%{num} bad records", imp.stats[:bad]) % {:num => imp.stats[:bad]}
        }, :warning)
        if imp.stats[:good] == 0
          add_flash(_("No valid import records were found, please upload another file"), :error)
        else
          add_flash(_("Press the Apply button to import the good records into the %{product} database") % {:product => Vmdb::Appliance.PRODUCT_NAME})
          @sb[:good] = imp.stats[:good]
          @sb[:imports] = imp
        end
      end
    else
      add_flash(_("Use the Choose file button to locate CSV file"), :error)
    end
    @sb[:show_button] = (@sb[:good] && @sb[:good] > 0)
    flash_to_session
    session[:flash_msgs] = @flash_array.dup if @flash_array
    redirect_to(:action => 'explorer', :no_refresh => true)
  end
end

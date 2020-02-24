module OpsController::Settings::Upload
  extend ActiveSupport::Concern

  def upload_logo
    logo_file = File.join(logo_dir, "custom_logo.png")
    upload_logos(logo_file, params[:upload], _('Custom logo image'), "png")
  end

  def upload_login_logo
    login_logo_file = File.join(logo_dir, "custom_login_logo.png")
    upload_logos(login_logo_file, params[:login], _('Custom login image'), "png")
  end

  def upload_login_brand
    login_logo_file = File.join(logo_dir, "custom_brand.png")
    upload_logos(login_logo_file, params[:brand], _('Custom brand'), "png")
  end

  def upload_favicon
    logo_file = File.join(logo_dir, "custom_favicon.ico")
    upload_logos(logo_file, params[:favicon], _('Custom favicon'), "ico")
  end

  def upload_logos(file, field, text, type)
    if field && field[:logo] && field[:logo].respond_to?(:read)
      if field[:logo].original_filename.split(".").last.downcase != type
        add_flash("%{image} must be a .#{type} file" % {:image => text}, :error)
      else
        File.open(file, "wb") { |f| f.write(field[:logo].read) }
        add_flash(_("%{image} \"%{name}\" uploaded") % {:image => text, :name => field[:logo].original_filename})
      end
    else
      add_flash(_("Use the Choose file button to locate .%{image_type} image file") % {:image_type => type}, :error)
    end
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  def upload_form_field_changed
    return unless load_edit("settings_#{params[:id]}_edit__#{@sb[:selected_server_id]}", "replace_cell__explorer")

    @edit[:new][:upload_type] = !params[:upload_type].nil? && params[:upload_type] != "" ? params[:upload_type] : nil
    msg = if params[:upload_type].present?
            _("Locate and upload a file to start the import process")
          else
            _("Choose the type of custom variables to be imported")
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
        imp.errors.each { |_field, msg| add_flash(msg, :error) }
        add_flash(_("Import validation complete: %{good_record}, %{bad_record}") % {
          :good_record => n_("%{num} good record", "%{num} good records", imp.stats[:good]) % {:num => imp.stats[:good]},
          :bad_record  => n_("%{num} bad record", "%{num} bad records", imp.stats[:bad]) % {:num => imp.stats[:bad]}
        }, :warning)
        if imp.stats[:good].zero?
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
    @sb[:show_button] = @sb[:good].try(:positive?)
    flash_to_session
    session[:flash_msgs] = @flash_array.dup if @flash_array
    redirect_to(:action => 'explorer', :no_refresh => true)
  end

  private

  def logo_dir
    dir = Rails.root.join('public', 'upload').expand_path
    Dir.mkdir(dir) unless dir.exist?
    dir.to_s
  end
end

class AutomateImportJsonSerializerService
  def serialize(import_file_upload)
    ae_import = nil
    Tempfile.open(['automate_temporary_zip', '.zip']) do |temp_file|
      temp_file.binmode
      temp_file.write(import_file_upload.binary_blob.binary)
      temp_file.close
      ae_import = MiqAeImport.new("*", "zip_file" => temp_file.path)
    end

    domains = ae_import.domain_entries("*")

    domain_array = domains.collect do |domain|
      {
        :text       => File.dirname(domain),
        :key        => File.dirname(domain),
        :icon       => 'fa fa-globe',
        :nodes      => children(ae_import, File.dirname(domain)),
        :selectable => false
      }
    end

    domain_array.to_json
  end

  private

  def children(ae_import, domain)
    build_namespace_list(ae_import, domain) + build_class_list(ae_import, domain)
  end

  def build_namespace_list(ae_import, domain_or_namespace_name)
    ae_import.namespace_files(domain_or_namespace_name).collect do |namespace|
      namespace_name = File.dirname(namespace)
      {
        :text       => namespace_name.split("/").last,
        :key        => namespace_name.split("/")[1..].join("/"),
        :icon       => 'pficon pficon-folder-close',
        :nodes      => children(ae_import, namespace_name),
        :selectable => false
      }
    end
  end

  def build_class_list(ae_import, domain_or_namespace_name)
    ae_import.class_files(domain_or_namespace_name).collect do |klass|
      class_name = File.dirname(klass)
      {
        :text       => class_name.split("/").last,
        :key        => class_name.split("/")[1..].join("/"),
        :icon       => 'ff ff-class',
        :selectable => false
      }
    end
  end
end

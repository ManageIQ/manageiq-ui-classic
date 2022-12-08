module DataTableHelper
  REPORT_LABELS = {
    :striped_hover => "table table-striped table-bordered table-hover",
    :striped       => "table table-striped table-bordered",
    :carbon        => "bx--data-table bx--data-table--normal bx--data-table--no-border miq-data-table",
    :clickable     => "clickable",
    :blank         => "No records found"
  }.freeze

  # Method to replace the old table classname to react carbon class name.
  def update_content(content, type, from)
    if label(content, type)
      return content.gsub!(REPORT_LABELS[type], carbon_class(content, from))
    end

    content
  end

  private

  # Method to find if content has a string specified in REPORT_LABELS.
  def label(content, type)
    content.include?(REPORT_LABELS[type])
  end

  # Method which returns a clickable carbon class if data exists.
  def carbon_class(content, from)
    label(content, :blank) ? REPORT_LABELS[:carbon] : [REPORT_LABELS[:carbon], REPORT_LABELS[:clickable], "miq_#{from}"].join(' ')
  end
end

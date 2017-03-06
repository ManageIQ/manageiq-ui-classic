module ReportFormatter
  class ReportHTML < Ruport::Formatter
    renders :html, :for => ReportRenderer

    def build_html_title
      mri = options.mri
      mri.html_title = ''
      mri.html_title << " <div style='height: 10px;'></div>"
      mri.html_title << "<ul id='tab'>"
      mri.html_title << "<li class='active'><a class='active'>"
      mri.html_title << " #{mri.title}" unless mri.title.nil?
      mri.html_title << "</a></li></ul>"
      mri.html_title << '<div class="clr"></div><div class="clr"></div><div class="b"><div class="b"><div class="b"></div></div></div>'
      mri.html_title << '<div id="element-box"><div class="t"><div class="t"><div class="t"></div></div></div><div class="m">'
    end

    def pad(str, len)
      return "".ljust(len) if str.nil?
      str = str.slice(0, len) # truncate long strings
      str.ljust(len) # pad with whitespace
    end

    def build_document_header
      build_html_title
    end

    def build_document_body
      mri = options.mri
      output << "<table class='table table-striped table-bordered'>"
      output << "<thead>"
      output << "<tr>"

      # table heading
      unless mri.headers.nil?
        mri.headers.each do |h|
          output << "<th>" << CGI.escapeHTML(h.to_s) << "</th>"
        end
        output << "</tr>"
        output << "</thead>"
      end
      output << '<tbody>'

      build_html_rows(mri, output)

      output << '</tbody>'
    end

    def build_html_rows(mri, output)
      # This is similar to MiqReport.build_html_rows, needs to be unified
      tz = mri.get_time_zone(Time.zone.name)
      row = 0
      in_a_widget = mri.rpt_options[:in_a_widget] || false

      unless mri.table.nil?
        row_limit = mri.rpt_options && mri.rpt_options[:row_limit] ? mri.rpt_options[:row_limit] : 0
        save_val = :_undefined_                                 # Hang on to the current group value
        break_label = mri.col_options.fetch_path(mri.sortby[0], :break_label) unless mri.sortby.nil? || mri.col_options.nil? || in_a_widget
        group_text = nil                                        # Optionally override what gets displayed for the group (i.e. Chargeback)
        use_table = mri.sub_table ? mri.sub_table : mri.table
        use_table.data.each_with_index do |d, d_idx|
          break if row_limit != 0 && d_idx > row_limit - 1
          if ["y", "c"].include?(mri.group) && !mri.sortby.nil? && save_val != d.data[mri.sortby[0]].to_s
            unless d_idx == 0                       # If not the first row, we are at a group break
              output << build_group_html_rows(save_val, mri.col_order.length, break_label, group_text).join
            end
            save_val = d.data[mri.sortby[0]].to_s
            # Chargeback, sort by date, but show range
            group_text = d.data["display_range"] if Chargeback.db_is_chargeback?(db) && mri.sortby[0] == "start_date"
          end

          if row == 0
            output << '<tr class="row0 no-hover">'
            row = 1
          else
            output << '<tr class="row1 no-hover">'
            row = 0
          end
          mri.col_formats ||= []                 # Backward compat - create empty array for formats
          mri.col_order.each_with_index do |c, c_idx|
            mri.build_html_col(output, c, mri.col_formats[c_idx], d.data)
          end

          output << "</tr>"
        end
      end

      if ["y", "c"].include?(mri.group) && !mri.sortby.nil?
        output << build_group_html_rows(save_val, mri.col_order.length, break_label, group_text).join
        output << build_group_html_rows(:_total_, mri.col_order.length).join
      end
    end
    private :build_html_rows

    def build_document_footer
      mri = options.mri
      output << "<tfoot>"
      output << "<td colspan='15'>"
      output << "<del class='container'>"
      output << "</del>"
      output << "</td>"
      output << "</tfoot>"
      output << "</table>"

      if mri.filter_summary
        output << mri.filter_summary.to_s
      end
    end

    def finalize_document
      output
    end
  end
end

class ApplicationHelper::Toolbar::SummaryCenterRestful < ApplicationHelper::Toolbar::Basic
  button_group('record_summary', [
                 button(
                   :show_summary,
                   'fa fa-arrow-left fa-lg',
                   proc do
                     _('Show %{object_name} Summary') % {:object_name => @record.name}
                   end,
                   nil,
                   :url       => "/",
                   :url_parms => proc { "?id=#{@record.id}" },
                   :klass     => ApplicationHelper::Button::ShowSummary
                 ),
               ])
end

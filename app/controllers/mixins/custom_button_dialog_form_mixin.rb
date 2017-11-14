module Mixins
  module CustomButtonDialogFormMixin
    def set_custom_button_dialog_presenter
      presenter ||= ExplorerPresenter.new(
        :active_tree => x_active_tree,
      )
      presenter.show(:default_left_cell).hide(:custom_left_cell)
      presenter.update(:main_div, r[:partial => "shared/dialogs/dialog_provision"])
      if @record.try(:dialog_fields)
        @record.dialog_fields.each do |field|
          next unless %w(DialogFieldDateControl DialogFieldDateTimeControl).include?(field.type)
          presenter[:build_calendar] = {
            :date_from => field.show_past_dates ? nil : Time.zone.now,
          }
        end
      end
      presenter.update(:form_buttons_div, r[
        :partial => 'layouts/x_dialog_buttons',
        :locals  => {
          :action_url => "dialog_form_button_pressed",
          :record_id  => @edit[:rec_id],
        }
      ])
      presenter.show(:form_buttons_div)
      presenter[:right_cell_text] = @right_cell_text
      presenter.set_visibility(false, :toolbar)
      presenter.set_visibility(false, :adv_searchbox_div)
      presenter[:lock_sidebar] = true
      presenter
    end
  end
end

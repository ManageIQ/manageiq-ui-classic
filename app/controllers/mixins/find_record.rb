module Mixins
  module FindRecord
    def find_record(model, id)
      raise _("Invalid input") unless is_integer?(id)
      begin
        record = Rbac.filtered(model.where(:id => id)).first
      rescue ActiveRecord::RecordNotFound, StandardError => ex
        if @explorer
          self.x_node = "root"
          add_flash(ex.message, :error, true)
          flash_to_session
        end
      end
      record
    end
  end
end

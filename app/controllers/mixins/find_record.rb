module Mixins
  module FindRecord
    def find_record(model, id)
      raise _("Invalid input") unless is_integer?(id)

      begin
        record = Rbac.filtered(model.where(:id => id)).first
      rescue ActiveRecord::RecordNotFound, StandardError => ex
        if @explorer
          self.x_node = "root"
          flash_to_session(ex.message, :error, true)
        end
      end
      record
    end
  end
end

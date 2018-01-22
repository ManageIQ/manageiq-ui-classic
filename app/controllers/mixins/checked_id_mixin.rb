module Mixins
  module CheckedIdMixin
    def checked_item_id(hash = params)
      return hash[:id] if hash[:id]

      checked_items = find_checked_items
      checked_items[0] if checked_items.length == 1
    end

    # Common routine to find checked items on a page (checkbox ids are
    # "check_xxx" where xxx is the item id or index)
    def find_checked_items(prefix = nil)
      if params[:miq_grid_checks].present?
        params[:miq_grid_checks].split(",").collect(&:to_i)
      else
        prefix = "check" if prefix.nil?
        params.each_with_object([]) do |(var, val), items|
          vars = var.to_s.split("_")
          if vars[0] == prefix && val == "1"
            ids = vars[1..-1]
            items << ids.join("_")
          end
        end
      end
    end

    # !============================================!
    # PLEASE PREFER find_records_with_rbac OVER THIS
    # !============================================!
    #
    # Test RBAC on every item checked
    # Params:
    #   klass - class of accessed objects
    # Returns:
    #   array of checked items. If user does not have rigts for it,
    #   raises exception
    def find_checked_ids_with_rbac(klass, prefix = nil)
      items = find_checked_items(prefix)
      assert_rbac(klass, items)
      items
    end

    # !============================================!
    # PLEASE PREFER find_records_with_rbac OVER THIS
    # !============================================!
    #
    # Test RBAC on every item checked
    # Params:
    #   klass - class of accessed objects
    # Returns:
    #   array of records. If user does not have rigts for it,
    #   raises exception
    def find_checked_records_with_rbac(klass, ids = nil)
      ids ||= find_checked_items
      filtered = Rbac.filtered(klass.where(:id => ids))
      raise _("Can't access selected records") unless ids.length == filtered.length
      filtered
    end

    # !============================================!
    # PLEASE PREFER find_records_with_rbac OVER THIS
    # !============================================!
    #
    # Test RBAC in case there is only one record
    # Params:
    #   klass - class of accessed object
    #   id    - accessed object id
    # Returns:
    #   id of checked item. If user does not have rights for it,
    #   raises an exception
    def find_id_with_rbac(klass, id)
      assert_rbac(klass, Array.wrap(id))
      id
    end

    def find_id_with_rbac_no_exception(klass, id)
      record = Rbac.filtered(klass.where(:id => id))
      record.present? ? id : nil
    end

    # !============================================!
    # PLEASE PREFER checked_or_params OVER THIS
    # !============================================!
    #
    # Tries to load a single checked item on from params.
    # If there's none, takes the id sent in params[:id].
    #
    # Returns:
    #   id of the item as a Fixnum
    #
    def checked_or_params_id
      objs = find_checked_items
      obj = objs.blank? && params[:id].present? ? params[:id] : objs[0]
      obj
    end

    # Find a record by model and id and test it with RBAC
    #
    # Wrapper for find_records_with_rbac method for case when only a single
    # record is required
    #
    # Params:
    #   klass   - class of accessed object
    #   id      - accessed object id
    #   options - additional options
    #
    # Returns:
    #   Instance of selected item
    #
    def find_record_with_rbac(klass, id, options = {})
      find_records_with_rbac(klass, Array.wrap(id), options).first
    end

    # Find records by model and id and test it with RBAC
    # Params:
    #   klass   - class or scope of accessed objects
    #   ids     - accessed object ids
    #   options - :named_scope :
    #
    # Returns:
    #   Array of selected class instances. If user does not have rights for it,
    #   either sets flash or raises exception
    #
    def find_records_with_rbac(klass, ids, options = {})
      raise(ActiveRecord::RecordNotFound, _("Can't access records without an id")) if ids.include?(nil) || ids.empty?
      filtered = Rbac.filtered(klass.where(:id => ids), :named_scope => options[:named_scope])
      raise(ActiveRecord::RecordNotFound, _("Can't access selected records")) unless ids.length == filtered.length
      filtered
    end

    # Tries to load checked items from params.
    # If there are none, takes the id sent in params[:id]
    #
    # Returns:
    #   Array of ids of the items as a Fixnum
    #
    def checked_or_params
      (checked = find_checked_items).blank? && params[:id].present? ? Array(params[:id]) : checked
    end

    # Either creates a new instance or loads the one passed in 'ids'.
    #
    # Params:
    #   klass - class of requested object
    #   id    - id of requested object
    #
    # 'id' can be an array (then the first item is taken) or a single value.
    #
    # Returns:
    #   instance of 'klass'
    #
    def find_or_new(klass, id)
      if params[:typ] == "new"
        klass.new
      else
        Rbac.filtered(Array(id), :class => klass).first
      end
    end
  end
end

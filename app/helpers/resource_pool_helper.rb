module ResourcePoolHelper
  include TextualSummary

  def calculate_rp_config(db_record)
    rp_config = []
    unless db_record.memory_reserve.nil?
      rp_config.push(:field       => _("Memory Reserve"),
                     :description => db_record.memory_reserve)
    end
    unless db_record.memory_reserve_expand.nil?
      rp_config.push(:field       => _("Memory Reserve Expand"),
                     :description => db_record.memory_reserve_expand)
    end
    unless db_record.memory_limit.nil?
      mem_limit = db_record.memory_limit
      mem_limit = "Unlimited" if db_record.memory_limit == -1
      rp_config.push(:field       => _("Memory Limit"),
                     :description => mem_limit)
    end
    unless db_record.memory_shares.nil?
      rp_config.push(:field       => _("Memory Shares"),
                     :description => db_record.memory_shares)
    end
    unless db_record.memory_shares_level.nil?
      rp_config.push(:field       => _("Memory Shares Level"),
                     :description => db_record.memory_shares_level)
    end
    unless db_record.cpu_reserve.nil?
      rp_config.push(:field       => _("CPU Reserve"),
                     :description => db_record.cpu_reserve)
    end
    unless db_record.cpu_reserve_expand.nil?
      rp_config.push(:field       => _("CPU Reserve Expand"),
                     :description => db_record.cpu_reserve_expand)
    end
    unless db_record.cpu_limit.nil?
      cpu_limit = db_record.cpu_limit
      cpu_limit = "Unlimited" if db_record.cpu_limit == -1
      rp_config.push(:field       => _("CPU Limit"),
                     :description => cpu_limit)
    end
    unless db_record.cpu_shares.nil?
      rp_config.push(:field       => _("CPU Shares"),
                     :description => db_record.cpu_shares)
    end
    unless db_record.cpu_shares_level.nil?
      rp_config.push(:field       => _("CPU Shares Level"),
                     :description => db_record.cpu_shares_level)
    end

    rp_config
  end
end

module ApplicationController::Timelines
  SELECT_EVENT_TYPE = [[N_('Management Events'), 'timeline'], [N_('Policy Events'), 'policy_timeline']].freeze

  DateOptions = Struct.new(
    :end_date,
    :days,
    :end,
    :start,
    :typ
  ) do
    def update_from_params(params)
      self.typ = params[:tl_typ] if params[:tl_typ]
      self.days = params[:tl_days] if params[:tl_days]
      self.end_date = params[:miq_date_1] || params[:miq_date]
    end

    def update_start_end(sdate, edate)
      if !sdate.nil? && !edate.nil?
        self.start = [sdate.year.to_s, (sdate.month - 1).to_s, sdate.day.to_s].join(", ")
        self.end = [edate.year.to_s, (edate.month - 1).to_s, edate.day.to_s].join(", ")
        self.end_date ||= [edate.month, edate.day, edate.year].join("/")
      else
        self.start = self.end = nil
      end
      self.days ||= "7"
    end
  end

  ManagementEventsOptions = Struct.new(
    :levels,
    :categories
  ) do
    def update_from_params(params)
      self.levels = params[:tl_levels]&.map(&:to_sym) || group_levels
      self.categories = {}
      params.fetch(:tl_categories, []).each do |category_display_name|
        group_data = event_groups[events[category_display_name]]
        category = {
          :display_name => category_display_name,
          :include_set  => [],
          :exclude_set  => [],
          :regexes      => []
        }

        group_levels.each do |lvl|
          next unless group_data[lvl]

          strings, regexes = group_data[lvl].partition { |typ| typ.kind_of?(String) }
          if levels.include?(lvl)
            category[:include_set].push(*strings)
            category[:regexes].push(*regexes)
          else
            category[:exclude_set].push(*strings)
          end
        end
        next if category[:include_set].empty? && category[:regexes].empty?

        categories[events[category_display_name]] = category
      end
    end

    def events
      @events ||= event_groups.each_with_object({}) do |egroup, hash|
        gname, list = egroup
        hash[list[:name].to_s] = gname
      end
    end

    def drop_cache
      @events = @event_groups = @lvl_text_value = nil
    end

    def levels_text_and_value
      @lvl_text_value ||= group_levels.map { |level| [level.to_s.titleize, level] }
    end

    private

    def event_groups
      @event_groups ||= EmsEvent.event_groups
    end

    def group_levels
      EmsEvent::GROUP_LEVELS
    end
  end

  PolicyEventsOptions = Struct.new(
    :categories,
    :result
  ) do
    def update_from_params(params)
      self.result = params[:tl_result] || "success"
      self.categories = {}
      params.fetch(:tl_categories, []).each do |category|
        categories[category] = {
          :display_name => category,
          :include_set  => events[category],
          :exclude_set  => [],
          :regexes      => []
        }
      end
    end

    def events
      @events ||= MiqEventDefinitionSet.all.each_with_object({}) do |event, hash|
        hash[event.description] = event.members.collect(&:name)
      end
    end

    def drop_cache
      @events = @fltr_cache = nil
    end
  end

  Options = Struct.new(
    :date,
    :model,
    :management,
    :policy,
    :tl_show
  ) do
    def initialize(*args)
      super
      self.date       = DateOptions.new
      self.management = ManagementEventsOptions.new
      self.policy     = PolicyEventsOptions.new
    end

    def management_events?
      tl_show == 'timeline'
    end

    def policy_events?
      tl_show == 'policy_timeline'
    end

    def evt_type
      management_events? ? :event_streams : :policy_events
    end

    def categories
      (policy_events? ? policy : management).categories
    end

    def get_set(name)
      categories.values.flat_map { |v| v[name] }
    end

    def drop_cache
      [policy, management].each(&:drop_cache)
    end
  end
end

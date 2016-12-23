module Mixins::MiddlewareDeploymentsMixin
  extend ActiveSupport::Concern

  def add_deployment
    prepare_properties
    continue = check_if_existing_deployment
    return unless continue
    set_params
    operation = operation_name
    if !@klass.try(:operations).nil? && @klass.operations.key?(operation)
      run_it(operation)
    end
  end

  private

  def find_existing_deployment
    if @is_server
      MiddlewareDeployment.find_by(:name => @deployment_name, :server_id => @entity_id)
    else
      MiddlewareDeployment.find_by(:name => @deployment_name, :server_group_id => @entity_id)
    end
  end

  def operation_name
    @is_server ? :middleware_add_deployment : :middleware_server_group_add_deployment
  end

  def set_params
    params[:file] = {
      :file         => params['file'],
      :enabled      => params['enabled'],
      :force_deploy => params['forceDeploy'],
      :runtime_name => params['runtimeName']
    }
    unless @is_server
      server_group = MiddlewareServerGroup.find(@entity_id)
      params[:file][:server_groups] = server_group.name
    end
  end

  def parent_entity_name
    @is_server ? 'server.' : 'server group.'
  end

  def prepare_properties
    @entity_id = identify_selected_entities
    @klass = self.class
    @is_server = @klass == MiddlewareServerController
    @deployment_name = params['runtimeName']
  end

  def check_if_existing_deployment
    if params['forceDeploy'] == 'false'
      existing_deployment = find_existing_deployment
      unless existing_deployment.nil?
        msg = 'Deployment "%s" already exists on this ' + parent_entity_name
        render :json => {
          :status => :warn,
          :msg    => _(msg) % @deployment_name
        }
        return false
      end
    end
    true
  end

  def run_it(operation)
    run_specific_operation(@klass.operations.fetch(operation), @entity_id)
    msg = 'Deployment "%s" has been initiated on this ' + parent_entity_name
    render :json => {
      :status => :success,
      :msg    => _(msg) % @deployment_name
    }
  end
end

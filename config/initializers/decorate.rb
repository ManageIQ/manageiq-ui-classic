# extending all model instances and classes to have a `decorate` method
ApplicationRecord.send(:extend, MiqDecorator::Klass)
ApplicationRecord.send(:include, MiqDecorator::Instance)

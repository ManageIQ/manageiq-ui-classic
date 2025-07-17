class ApplicationHelper::Button::VmDetachVolume < ApplicationHelper::Button::Basic
    needs :@record
    def visible?
        @record.kind_of?(ManageIQ::Providers::Kubevirt::InfraManager::Vm)
    end
end

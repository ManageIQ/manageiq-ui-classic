import {Component} from '@angular/core';

@Component({
  selector: 'miq-app-root',
  template: `
<div class="row">
  <div class="col-md7">
    <h1>
      <span>Edit ManageIQ Server Relationship for Instance "{{instanceName}}"</span>
    </h1>
  </div>
</div>
  <!-- We insert our tag here -->
  <miq-evm-relationship evmRelationshipFormId="{{evmFormId}}"></miq-evm-relationship> 
`
})
export class AppComponent {
  instanceName = "dave.lab.example.com";
  evmFormId = "10000000001855";
}

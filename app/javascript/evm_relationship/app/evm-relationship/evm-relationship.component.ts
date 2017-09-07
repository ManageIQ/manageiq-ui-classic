import {Component, DoCheck, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {IServerItem, IServers, ServerId} from '../miq-types';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {MiqAppState} from '../reducer/reducer';
import {
  ChangeSelectedServerIdAction, EvmDataLoadAction, EvmRelationshipDataSaveAction,
  EvmRelationshipServerLoadAction
} from '../action/evm-relationship.actions';
import {Observable} from 'rxjs/Observable';
import {WindowService} from "../common/window-service";

@Component({
  selector: 'miq-evm-relationship',
  encapsulation: ViewEncapsulation.None,
  template: `
  <form [formGroup]="formGroup" class="form-horizontal">
  <h3>Servers</h3>
  <div class="form-horizontal">
    <div class="form-group">
      <label class="col-md-2,control-label" for="serverName">Select Server:</label>
      <div class="col-md8">
        <select [formControlName]="'serverName'" id="serverName" class="form-control">
          <option value="">&lt;Not a Server&gt;</option>
          <option *ngFor="let server of servers?.resources" [value]="server.id">{{server.name}} ({{server.id}})</option>
        </select>
      </div>
    </div>
    <div class="pull-right">
      <button type="button" (click)="save()" [disabled]="serverIdIsOriginal" class="btn btn-primary">Save</button>
      <button type="button" (click)="reset()" [disabled]="serverIdIsOriginal" class="btn btn-default">Reset</button>
      <button type="button" (click)="cancel()" class="btn btn-default">Cancel</button>
    </div>
  </div>
</form>
`
})
export class EvmRelationshipComponent implements OnInit, OnDestroy {
  @Input() evmRelationshipFormId;
  originalServerId: ServerId = '';
  loading$: Observable<boolean>; // not currently used
  servers: IServers;
  serverId: ServerId = '';
  formGroup: FormGroup;
  serverIdIsOriginal = true;
  private cancelServersSubscription;
  private cancelSelectedIdSubscription;
  private cancelOriginalServerIdSubscription;
  private cancelServerNameSubscription;
  private cancelEvmDataSubscription;

  constructor(private _store: Store<MiqAppState>, private window: WindowService ) {
    this.createForm();
    this.loading$ = _store.select('app', 'loading');
    this.cancelServersSubscription = this._store.select('app', 'servers')
      .subscribe(servers => {
        console.log('select servers: ', servers);
        this.servers = servers;
        this.serverName.setValue(this.originalServerId);
      });
    this.cancelSelectedIdSubscription = this._store.select('app', 'selectedServerId')
      .subscribe(selectedServerId => {
        if(selectedServerId){
          this.serverId = selectedServerId.selectedServerId;
          console.log(`selectedServerId changed: ${selectedServerId.selectedServerId}`);
        }
      });
    this.cancelOriginalServerIdSubscription = this._store.select('app', 'originalServerId')
      .subscribe(originalServerId => {
        if(originalServerId){
          this.originalServerId = originalServerId;
          console.log(`originalServerId changed: ${originalServerId}`);
        }
      });
    this.cancelEvmDataSubscription = this._store.select('app', 'evmData')
      .subscribe(evmData => {
        if (evmData) {
          this._store.dispatch(new EvmRelationshipServerLoadAction(evmData.cloud_tenant_id));
          this.originalServerId = evmData.cloud_tenant_id;
        }
      });
    this._store.subscribe(state => {
      console.log('State Change Notification: ', state);
      this.serverIdIsOriginal = this.hasSelectionChanged();
    });
    this.cancelServerNameSubscription = this.serverName.valueChanges.subscribe((value: any) => {
      console.log(`valueChanges: ${value}`);
      this._store.dispatch(new ChangeSelectedServerIdAction(value));
      this.serverId = value;
      console.log(`selectedServerId: ${this.serverId} original: ${this.originalServerId}`);
      console.log(`serverIdIsOriginal: ${this.serverIdIsOriginal}`);
    });
  }

  hasSelectionChanged(){
    return (this.originalServerId === this.serverId);
  }

  get serverName() {
    return this.formGroup.get('serverName');
  }

  ngOnInit() {
    console.log(`initializing with originalServerId: ${this.evmRelationshipFormId}`);
    this._store.dispatch(new EvmDataLoadAction(this.evmRelationshipFormId));
  }

  ngOnDestroy() {
    this.cancelSelectedIdSubscription();
    this.cancelServersSubscription();
    this.cancelServerNameSubscription();
    this.cancelEvmDataSubscription();
    this.cancelOriginalServerIdSubscription();
  }

  private createForm() {
    this.formGroup = new FormGroup({
      serverName: new FormControl()
    });
  }

  save() {
    console.log(`save pressed, evmFormId: ${this.evmRelationshipFormId}, changing serverId to: ${this.serverId}`);
    this._store.dispatch(new EvmRelationshipDataSaveAction(this.evmRelationshipFormId));
  }

  reset() {
    console.log(`reset pressed: resetting ${this.serverId} to ${this.originalServerId}`);
    this._store.dispatch(new ChangeSelectedServerIdAction(this.originalServerId));
    this.serverName.setValue(this.originalServerId);
  }

  cancel() {
    console.log('cancel pressed');
    this.window.nativeWindow.location.href = `/vm_cloud/explorer`;
  }
}

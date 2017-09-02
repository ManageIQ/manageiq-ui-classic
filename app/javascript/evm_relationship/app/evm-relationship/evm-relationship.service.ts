import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {IServers} from '../miq-types';

@Injectable()
export class EvmRelationshipService {
  constructor(private _http: Http) {
  }

  getEvmData(id): Observable<IServers> {
    const URL = `/api/vms/${id}/?attributes=miq_server`;
    return this._http.get(URL)
      .map(response => response.json());
  }

  getServersList(): Observable<IServers> {
    const URL = '/api/servers/?expand=resources&attributes=id,name&sort_by=name&sort_order=ascending';
    return this._http.get(URL)
      .map(response => response.json());
  }

  saveEvmServerRelationship(emsId, miqServerId) {
    const URL = `/api/vms/${emsId}`;
    return this._http.post(URL, {miq_server: miqServerId})
      .map(response => response.json());
  }
}

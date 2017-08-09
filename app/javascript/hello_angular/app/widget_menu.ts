import { Component, ElementRef } from '@angular/core';

import { Http, Response } from '@angular/http';

const __ = (<any> window).__;

@Component({
  selector: 'widget-menu',
  template: `
    <div class="mc" id="{{div_id}}">
      <table class="table table-hover">
        <tbody>
          <div *ngIf="shortcutsMissing()">
            ${__('No shortcuts are authorized for this user, contact your Administrator')}
          </div>  
            <tr *ngFor="let shortcut of widgetMenuModel.shortcuts">
              <td>
                <a title="${__("Click to go this location")}" href="{{shortcut.href}}">
                  {{shortcut.description}}
                </a>
              </td>
            </tr>
        </tbody>
      </table>
    </div>
  `
})
export class WidgetMenu {
  widgetMenuModel = {shortcuts: [], minimized: false};
  div_id: string;
  id: string;

  constructor(private http:Http, public elementRef: ElementRef) {
  }

  shortcutsMissing() {
    return this.widgetMenuModel.shortcuts.length === 0;
  };

  ngOnInit() {
    this.id = this.elementRef.nativeElement.getAttribute("id");
    this.http.get('/dashboard/widget_menu_data/' + this.id).subscribe((data => {
      this.widgetMenuModel = data.json();
    }).bind(this));
    this.div_id = 'dd_w' + this.id + '_box';
  }
}

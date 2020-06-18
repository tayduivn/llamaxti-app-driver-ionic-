import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-page',
  templateUrl: './header-page.component.html',
  styleUrls: ['./header-page.component.scss'],
})
export class HeaderPageComponent implements OnInit {

  // tslint:disable-next-line: no-input-rename
  @Input( 'title' ) titlePage: string;


  constructor( ) { }

  ngOnInit() {
  }


}

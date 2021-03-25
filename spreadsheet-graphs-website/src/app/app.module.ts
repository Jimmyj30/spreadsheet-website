import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HotTableModule } from '@handsontable/angular';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';

@NgModule({
  declarations: [AppComponent, DataTablesComponent],
  imports: [BrowserModule, HotTableModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

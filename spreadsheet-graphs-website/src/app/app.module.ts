import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { HotTableModule } from '@handsontable/angular';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';

@NgModule({
  declarations: [AppComponent, DataTablesComponent],
  imports: [BrowserModule, HotTableModule.forRoot(), HttpClientModule],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

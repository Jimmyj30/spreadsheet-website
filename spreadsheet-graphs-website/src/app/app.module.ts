import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotTableModule } from '@handsontable/angular';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';
import { GraphsComponent } from './data-tables/graphs/graphs.component';

@NgModule({
  declarations: [AppComponent, DataTablesComponent, GraphsComponent],
  imports: [
    BrowserModule,
    HotTableModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

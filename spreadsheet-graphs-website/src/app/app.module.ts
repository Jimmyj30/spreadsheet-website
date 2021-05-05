import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotTableModule } from '@handsontable/angular';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';
import { GraphsComponent } from './data-tables/graphs/graphs.component';

// adding the plotly.js module to the Angular library
PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [AppComponent, DataTablesComponent, GraphsComponent],
  imports: [
    BrowserModule,
    HotTableModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PlotlyModule,
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

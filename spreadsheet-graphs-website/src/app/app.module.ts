import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HotTableModule } from '@handsontable/angular';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';
import { GraphsComponent } from './data-tables/graphs/graphs.component';
import { HeaderComponent } from './header/header.component';
import { HelpComponent } from './help/help.component';

const appRoutes: Routes = [
  { path: '', component: DataTablesComponent },
  { path: 'help', component: HelpComponent },
  { path: '**', component: DataTablesComponent },
];

// adding the plotly.js module to the Angular library
PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    DataTablesComponent,
    GraphsComponent,
    HeaderComponent,
    HelpComponent,
  ],
  imports: [
    BrowserModule,
    HotTableModule.forRoot(),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    PlotlyModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HotTableModule } from '@handsontable/angular';
import * as PlotlyJS from 'plotly.js-basic-dist-min';
import { PlotlyModule } from 'angular-plotly.js';

import { AppComponent } from './app.component';
import { DataTablesComponent } from './data-tables/data-tables.component';
import { GraphsComponent } from './data-tables/graphs/graphs.component';
import { HeaderComponent } from './header/header.component';
import { HelpComponent } from './help/help.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { DataTableFormComponent } from './data-tables/data-table-form/data-table-form.component';
import { DataTableComponent } from './data-tables/data-table/data-table.component';

const appRoutes: Routes = [
  { path: '', component: DataTablesComponent, canActivate: [AuthGuard] },
  { path: 'help', component: HelpComponent },
  { path: 'auth', component: AuthComponent },
  { path: '**', redirectTo: '/' },
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
    AuthComponent,
    DataTableFormComponent,
    DataTableComponent,
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

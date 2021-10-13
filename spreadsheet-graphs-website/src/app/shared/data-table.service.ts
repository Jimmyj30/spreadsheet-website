import { Injectable } from '@angular/core';

import { DataTable } from '../data-tables/models/data-table.model';
import { DataStorageService } from './data-storage.service';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  constructor(private api: DataStorageService) {}

  createDataTable(dataTable: DataTable) {
    return this.api.createDataTable(dataTable);
  }

  updateDataTable(dataTable: DataTable) {
    return this.api.updateDataTable(dataTable);
  }

  deleteDataTable(dataTable: DataTable) {
    return this.api.deleteDataTable(dataTable);
  }

  getDataTableFromLoggedInUser() {
    return this.api.getDataTableByFirebaseUid();
  }
}

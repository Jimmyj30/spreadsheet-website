import { Injectable } from '@angular/core';

import { DataTable } from '../data-tables/data-table.model';
import { DataStorageService } from './data-storage.service';

@Injectable({ providedIn: 'root' })
export class DataTableService {
  constructor(private api: DataStorageService) {}
}

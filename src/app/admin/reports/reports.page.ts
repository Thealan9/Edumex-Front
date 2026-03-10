import { Component, OnInit } from '@angular/core';
import { AdminReports, InventoryReportItem } from '../services/admin-reports';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone:false
})
export class ReportsPage implements OnInit {reportData: InventoryReportItem[] = [];
  periodo: string = '';
  loading: boolean = false;

  // Filtros iniciales: mes y año actual
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  constructor(private reportsService: AdminReports) {}

  ngOnInit() {
    this.loadReport();
  }

  loadReport() {
    this.loading = true;
    this.reportsService.getInventoryReport(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (res) => {
          this.reportData = res.data;
          this.periodo = res.periodo;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onFilterChange() {
    this.loadReport();
  }
}

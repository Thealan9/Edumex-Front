import { Component, OnInit } from '@angular/core';
import { AdminReports, InventoryReportItem, FinancialReportItem } from '../services/admin-reports';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false
})
export class ReportsPage implements OnInit {
  reportData: InventoryReportItem[] = [];
  financialData: FinancialReportItem[] = [];
  totalesFinancieros: any = null;

  activeTab: string = 'inventory';
  periodo: string = '';
  loading: boolean = false;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  constructor(private reportsService: AdminReports) {}

  ngOnInit() {
    this.loadCurrentTab();
  }

  loadCurrentTab() {
    if (this.activeTab === 'inventory') {
      this.loadInventoryReport();
    } else {
      this.loadFinancialReport();
    }
  }

  loadInventoryReport() {
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

  loadFinancialReport() {
    this.loading = true;
    this.reportsService.getFinancialReport(this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (res) => {
          this.financialData = res.data;
          this.totalesFinancieros = res.totales;
          this.periodo = res.periodo;
          this.loading = false;
        },
        error: () => this.loading = false
      });
  }

  onFilterChange() {
    this.loadCurrentTab();
  }

  segmentChanged(event: any) {
    this.activeTab = event.detail.value;
    this.loadCurrentTab();
  }
}

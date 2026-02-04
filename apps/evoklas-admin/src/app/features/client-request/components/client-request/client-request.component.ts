import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { DataService } from '../../../../core/http/services/data.service';

@Component({
  selector: 'app-client-request',
  templateUrl: './client-request.component.html',
  styleUrls: ['./client-request.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ChartModule,
    RippleModule,
    SelectModule,
    TableModule,
    TabsModule,
    ToastModule,
    ToolbarModule,
  ],
})
export class ClientRequestComponent implements OnInit {
  activeIndex = 0;
  clientRequests: any = [];
  filteredData: any = [];

  years = ['2021', '2022', '2023', '2024', '2025'];
  selectedYear = new Date().getFullYear().toString();
  chartData: any = { labels: [], datasets: [] };
  statusChartData: any = { labels: [], datasets: [] };
  basicOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#225361',
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#225361',
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: 'rgba(34, 83, 97, 0.12)'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#225361',
          precision: 0
        },
        grid: {
          color: 'rgba(34, 83, 97, 0.08)'
        }
      }
    }
  };
  statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#225361',
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        intersect: false
      }
    }
  };

  private readonly monthLabels = [
    'Ianuarie',
    'Februarie',
    'Martie',
    'Aprilie',
    'Mai',
    'Iunie',
    'Iulie',
    'August',
    'Septembrie',
    'Octombrie',
    'Noiembrie',
    'Decembrie'
  ];
  private readonly producerColors = [
    '#2A9D8F',
    '#4C6FFF',
    '#E76F51',
    '#F4A261',
    '#6C5CE7',
    '#06D6A0',
    '#118AB2',
    '#EF476F',
    '#8AB17D',
    '#5E60CE'
  ];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.getClientRequest();
  }

  getClientRequest(): void {
    this.dataService.getClientRequest().subscribe((res) => {
      this.clientRequests = res;

      this.filteredData = this.clientRequests.filter((request: any) =>
        new Date(request.createdAt).getFullYear().toString() === this.selectedYear
      );

      this.updateCharts();
    });
  }

  onYearChange(year: string): void {
    this.selectedYear = year;
    this.filteredData = this.clientRequests.filter((request: any) =>
      new Date(request.createdAt).getFullYear().toString() === this.selectedYear
    );
    this.updateCharts();
  }

  getMonthFromDate(date: any): any {
    return new Date(date.toString()).getMonth() + 1;
  }

  goToSupport(): void {
    this.router.navigate(['/support']);
  }

  private updateCharts(): void {
    this.chartData = this.buildProducerChartData(this.filteredData);
    this.statusChartData = this.buildStatusChartData(this.filteredData);
  }

  private buildProducerChartData(requests: any[]): any {
    const grouped = this.groupBy(requests, (request) =>
      this.normalizeLabel(request.producer, 'Unknown Producer')
    );
    const producerNames = Object.keys(grouped).sort();

    const datasets = producerNames.map((producer, index) => {
      const items = grouped[producer].map((request: any) => ({
        ...request,
        monthNumber: this.getMonthFromDate(request.createdAt)
      }));
      const groupedByMonth = this.groupBy(items, (request) => request.monthNumber);
      const data = Array.from({ length: 12 }, (_, idx) =>
        groupedByMonth[idx + 1] ? groupedByMonth[idx + 1].length : 0
      );
      const color = this.producerColors[index % this.producerColors.length];

      return {
        label: producer,
        data,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1
      };
    });

    return {
      labels: this.monthLabels,
      datasets
    };
  }

  private buildStatusChartData(requests: any[]): any {
    const grouped = this.groupBy(requests, (request) =>
      this.normalizeLabel(request.status, 'Unknown')
    );
    const statusLabels = Object.keys(grouped);
    const statusPalette: Record<string, string> = {
      ACTIVE: '#22c55e',
      PENDING: '#f59e0b',
      COMPLETED: '#3b82f6',
      UNKNOWN: '#94a3b8'
    };
    const data = statusLabels.map((status) => grouped[status].length);
    const backgroundColor = statusLabels.map(
      (status) => statusPalette[status.toUpperCase()] || '#94a3b8'
    );

    return {
      labels: statusLabels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 0
        }
      ]
    };
  }

  private groupBy(items: any[], keyGetter: (item: any) => string | number): Record<string, any[]> {
    return items.reduce((accumulator, item) => {
      const key = keyGetter(item);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    }, {} as Record<string, any[]>);
  }

  private normalizeLabel(value: any, fallback: string): string {
    if (value === null || value === undefined) {
      return fallback;
    }
    const label = String(value).trim();
    return label.length > 0 ? label : fallback;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../../../../core/http/services/data.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    RippleModule,
    TabsModule,
    TableModule,
    ToastModule,
    ToolbarModule,
  ],
})
export class PackagesComponent implements OnInit {
  activeIndex = 0;
  selectedPackage: any = {
    title: '',
    description: '',
    nr_requests: null,
    price: null
  };
  packages = [];
  packageDialog = false;
  save = true;

  constructor(
    private dataService: DataService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getPackages();
  }

  getPackages(): void {
    this.dataService.getPackages().subscribe((res: any) => {
      this.packages = res;
    });
  }

  editPackage(packageData: any): void {
    this.save = false;
    this.selectedPackage = {
      ...packageData
    };
    this.packageDialog = true;
  }

  savePackage(): void {
    this.dataService
      .savePackage(this.selectedPackage)
      .pipe(switchMap(() => this.dataService.getPackages()))
      .subscribe(
        (res: any) => {
          this.packages = res;
          this.confirmation('Package saved succesfully!', false);
        },
        (err) => {
          if (typeof err.error.message === 'undefined') {
            this.confirmation(err.error.message, true);
          } else {
            this.confirmation(err.message, true);
          }
        }
      );
  }

  doEditPackage(): void {
    this.dataService.editPackage(this.selectedPackage).subscribe(
      (res) => {
        this.save = true;
        console.log(res);
        this.getPackages();
        this.confirmation(res.message, false);
      },
      (err) => {
        console.log(err);
        if (typeof err.error.message === 'undefined') {
          this.confirmation(err.error.message, true);
        } else {
          this.confirmation(err.message, true);
        }
      }
    );
    this.packageDialog = false;
  }

  deletePackage(packageData: any): void {
    this.dataService.deletePackage(packageData).subscribe(
      () => {
        this.getPackages();
        this.confirmation('Package deleted', false);
      },
      (err) => {
        if (typeof err.error.message === 'undefined') {
          this.confirmation(err.error.message, true);
        } else {
          this.confirmation(err.message, true);
        }
      }
    );
  }

  addPackage(): void {
    this.save = true;
    this.packageDialog = true;
  }

  hidePackageDialog(): void {
    this.save = true;
    this.packageDialog = false;
  }

  confirmation(message: string, err: boolean): void {
    let severity = 'success';
    let summary = 'Successful';
    if (err) {
      severity = 'error';
      summary = 'Error';
    }
    this.messageService.add({
      severity,
      summary,
      detail: message,
      life: 3000,
    });
  }

  goToSupport(): void {
    this.router.navigate(['/support']);
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import * as FileSaver from 'file-saver';
import { DataService } from '../../../../core/http/services/data.service';
import { LayoutService } from '../../../../core/layout/layout.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    RippleModule,
    SelectModule,
    TableModule,
    TabsModule,
    ToastModule,
    ToolbarModule,
    TooltipModule,
  ],
})
export class UserAdminComponent implements OnInit {
  activeIndex = 0;

  user: any = {
    id: '',
    email: '',
    fullName: '',
    password: '',
    role: '',
    active: ''
  };
  users: any[] = [];

  activeOptions: any[] = [];
  roles: any[] = [];
  selectedRole: any = null;
  selectedActive: any = null;
  userDialog = false;
  save = true;

  // reset Pass
  // tslint:disable-next-line:quotemark
  possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";
  lengthOfCode = 8;

  constructor(
    private dataService: DataService,
    private messageService: MessageService,
    private layoutService: LayoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.layoutService.subscribeToLayoutChanges().subscribe(() => {});
    this.getRoles();
    this.getUsers();
    this.getActiveOption();
  }

  getUsers(): void {
    this.dataService.getUsers().subscribe(res => {
      this.users = res;
    });
  }

  addUser(): void {
    this.save = true;
    this.userDialog = true;
  }

  hideUserDialog(): void {
    this.save = true;
    this.userDialog = false;
  }

  setUpDataForSave(): void {
    if (this.selectedRole) {
      this.user.role = this.selectedRole.name;
    } else {
      this.user.role = this.roles[0].name;
    }
    this.user.password = this.makeRandom(this.lengthOfCode, this.possible);
  }

  saveUser(): void {
    this.setUpDataForSave();
    this.dataService.saveU(this.user).subscribe(res => {
      this.userDialog = false;
      this.user = null;
      this.getUsers();
      this.confirmation(res.message, false);
    }, err => {
      console.log(err);
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
  }

  confirmation(message: string, err: boolean): void {
    let severity = 'success';
    let summary = 'Successful';
    if (err) {
      severity = 'error';
      summary = 'Error';
    }
    this.messageService.add({ severity, summary, detail: message, life: 3000 });
  }

  editUser(user: any): void {
    this.save = false;
    this.user.id = user.id;
    this.user.fullName = user.fullName;
    this.user.email = user.email;
    this.user.role = user.role;
    this.user.password = user.password;
    this.userDialog = true;
  }

  setUpDataForEdit(): void {
    if (this.selectedRole) {
      this.user.role = this.selectedRole.name;
    } else {
      this.user.role = this.roles[0].name;
    }

    if (this.selectedActive) {
      this.user.active = this.selectedActive.value;
    } else {
      this.user.active = this.activeOptions[0].value;
    }
  }


  doEditUser(): void {
    this.setUpDataForEdit();
    this.dataService.editUser(this.user).subscribe(res => {
      this.save = true;
      this.getUsers();
      this.confirmation(res.message, false);
    }, err => {
      console.log(err);
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
    this.userDialog = false;
  }

  resetPass(): void {
    this.user.password = this.makeRandom(this.lengthOfCode, this.possible);
    this.dataService.resetPass(this.user).subscribe(res => {
      this.save = true;
      this.confirmation(res.message, false);
    }, err => {
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
    this.userDialog = false;
  }

  deleteUser(user: any): void {
    if (user.active === 0) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Acest utilizator este deja Inactiv!Pentru a face stergere toatala va rog sa contactati echipa de suport!', life: 3000 });
    } else {
      this.dataService.deleteUser(user).subscribe(res => {
        this.getUsers();
        this.confirmation(res.message, false);
      }, err => {
        if (typeof err.error.message === 'undefined') {
          this.confirmation(err.error.message, true);
        } else {
          this.confirmation(err.message, true);
        }
      });
    }
  }

  getRoles(): void {
    this.roles = [
      { name: 'DEALER', code: 'D' },
      { name: 'ADMIN', code: 'A' },
      { name: 'USER', code: 'U' }
    ];
  }

  getActiveOption(): void {
    this.activeOptions = [
      { name: 'Active', value: 1 },
      { name: 'Inactive', value: 0 }
    ];
  }

  makeRandom(lengthOfCode: number, possible: string): string {
    let text = '';
    for (let i = 0; i < lengthOfCode; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  exportExcel(): void {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(this.users);

      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'users');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }

  goToSupport(): void {
    this.router.navigate(['/support']);
  }
}

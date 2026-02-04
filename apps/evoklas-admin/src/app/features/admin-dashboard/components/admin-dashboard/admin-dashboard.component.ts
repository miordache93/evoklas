import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import readXlsxFile from 'read-excel-file';
import { throwError } from 'rxjs';
import * as FileSaver from 'file-saver';
import { APP_ENV } from '../../../../core/config/environment.tokens';
import { DRIVE_TYPES } from '../../../../core/config/drive-types';
import { ENGINE_TRANSMISION } from '../../../../core/config/engine-transmision';
import { FUEL_TYPES } from '../../../../core/config/fuel-types';
import { FileService } from '../../../../core/http/services/file.service';
import { DataService } from '../../../../core/http/services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
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
export class AdminDashboardComponent implements OnInit {
  private readonly env = inject(APP_ENV);
  producer: any = {
    id: '',
    name: '',
    icon: null,
    image: null
  };

  car: any = {
    name: '',
    icon: null,
    producerId: null,
    description: '',
  };

  version: any = {
    name: '',
    icon: null,
    car: null,
    carId: '',
  };

  engine: any = {
    name: '',
    power: '',
    fuel: '',
    transmision: '',
    driveType: '',
    price: null,
    carId: null,
    versionId: null,
  };

  producers: any = [];
  cars: any = [];
  carsByProducer = [];
  versionsByCar = [];
  versions: any = [];
  engines = [];

  engineTransmisions = ENGINE_TRANSMISION;
  fuelTypes = FUEL_TYPES;
  driveTypes = DRIVE_TYPES;

  activeIndex = 0;
  save = true;
  engineDialog = false;
  producerDialog = false;
  modelDialog = false;
  versionDialog = false;

  constructor(
    private dataService: DataService,
    private fileService: FileService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getProducersData();
    this.getCarVersion();
    this.getEngines();
  }

  getCarVersion(): void {
    this.dataService.getCarVersions().subscribe(res => {
      this.versions = res.map((version: any) => {
        version.icon = version.icon ? this.fileService.convertImage(version.icon.data) : null;
        return version;
      });
    });
  }

  getCars(): void {
    this.dataService.getCars().subscribe(res => {
      this.cars = res.map((car: any) => {
        car.icon = car.icon ? this.fileService.convertImage(car.icon.data) : null;
        car.producerName = this.producers.find((producer: any) => producer.id === car.producerId)?.name || 'N/A';
        return car;
      }).sort((a: any, b: any) => a.name.localeCompare(b.name));
    });
  }
  getProducersData(): void {
    this.dataService.getProducers().subscribe(res => {
      this.producers = res.map((producer: any) => {
        producer.icon = `${this.env.apiUrl}/${producer.icon}`;
        return producer;
      });

      this.getCars();
    });
  }

  getEngines(): void {
    this.dataService.getEngines().subscribe(res => {
      this.engines = res;
    });
  }

  onFileSelect($event: any, dataType: string): void {
    if (dataType === 'producer') {
      this.producer.icon = $event.target.files[0];
    } else if (dataType === 'car-model') {
      this.car.icon = $event.target.files[0];
    } else if (dataType === 'version') {
      this.version.icon = $event.target.files[0];
    }
  }

  getCarsbyProducer(producerId: number): void {
    const id = producerId ?? this.car.producer.id;

    this.dataService.getCarsByProducer(id).subscribe(res => {
      if (producerId) {
        this.carsByProducer = res;
      } else {
        this.cars = res;
      }
    });
  }

  getVersionsByCarId(carId: number): void {
    const id = carId ?? this.version.car.id;

    this.dataService.getVersionsByCar(id).subscribe(res => {
      if (carId) {
        this.versionsByCar = res;
      } else {
        this.versionsByCar = res;
      }
    });
  }

  addNewProducer(): void {
    this.producerDialog = true;
  }

  hideProducerDialog(): void {
    this.save = true;
    this.producerDialog = false;
  }

  saveProducer(): void {
    this.dataService.saveProducer(this.producer).subscribe(res => {
      this.producerDialog = false;
      this.producer = {
        id: '',
        name: '',
        icon: null,
        image: null
      };
      this.confirmation(res.message, false);
      this.getProducersData();
    }, err => {
      console.log(err);
      this.getProducersData();
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      }
      else {
        this.confirmation(err.message, true);
      }
    });
  }

  editProducer(producer: any): void {
    this.save = false;
    this.producer.id = producer.id;
    this.producer.name = producer.name;

    this.producer.icon = producer.icon;
    this.producerDialog = true;
  }

  doEditProducer(): void {
    this.dataService.editProducer(this.producer).subscribe(res => {
      this.save = true;
      this.getProducersData();
      this.confirmation(res.message, false);
    }, err => {
      console.log(err);
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
    this.producerDialog = false;
  }

  deleteProduct(producer: any): void {
    this.dataService.deleteProducer(producer.id).subscribe(res => {
      this.getProducersData();
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

  addNewModel(): void {
    this.save = true;
    this.modelDialog = true;

    this.car = {
      name: '',
      icon: null,
      producerId: null,
      description: '',
    };
  }

  hideModelDialog(): void {
    this.save = true;
    this.modelDialog = false;
    this.car = {
      name: '',
      icon: null,
      producerId: null,
      description: ''
    };
  }


  saveCarModel(): void {
    if (!this.car.name ||
      !this.car.producerId) {
      console.log('Please complete all fileds in car form');
      return;
    } else {
      this.dataService.saveCarModel(this.car).subscribe(res => {
        this.modelDialog = false;
        this.confirmation(res.message, false);
        this.getCars();
      }, err => {
        if (typeof err.error.message === 'undefined') {
          this.confirmation(err.error.message, true);
        } else {
          this.confirmation(err.message, true);
        }
      });
    }
  }

  editModel(car: any): void {
    this.save = false;
    this.car.id = car.id;
    this.car.name = car.name;
    this.car.icon = car.icon;
    this.car.producerId = car.producerId;
    this.car.description = car.description;
    this.modelDialog = true;
  }

  doEditModel(): void {
    this.dataService.editCars(this.car).subscribe(res => {
      this.save = true;
      this.hideModelDialog();
      this.getCars();
      this.confirmation(res.message, false);
    }, err => {
      console.log(err);
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
    this.producerDialog = false;
  }

  deleteModel(model: any): void {
    this.dataService.deleteCars(model.id).subscribe(res => {
      this.getCars();
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

  addNewVersion(): void {
    this.save = true;
    this.versionDialog = true;
    this.car.producerId = null;
    this.version = {
      name: '',
      icon: null,
      car: null
    };
    this.carsByProducer = this.cars;
  }

  hideVersionDialog(): void {
    this.save = true;
    this.versionDialog = false;
    this.version = {
      name: '',
      icon: null,
      car: null
    };
  }

  saveCarVersion(): void {
    if (!this.version.name ||
      !this.version.carId) {
      console.error('Please complete all fileds in car form');
      return;
    } else {
      this.dataService.saveCarVersion(this.version).subscribe(res => {
        this.versionDialog = false;
        this.getCarVersion();
        this.hideVersionDialog();
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
  }

  editVersion(version: any): void {
    this.save = false;
    this.version.id = version.id;
    this.version.name = version.name;
    this.version.icon = version.icon;
    this.version.carId = version.carId;
    this.versionDialog = true;
    this.carsByProducer = this.cars;
    this.car.producerId = this.cars.find((c: any) => c.id === version.carId)?.producerId;
  }


  doEditVersion(): void {
    this.dataService.editCarVersion(this.version).subscribe(res => {
      this.save = true;
      this.hideVersionDialog();
      this.getCarVersion();
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

  deleteVersion(version: any): void {
    this.dataService.deleteCarVersions(version.id).subscribe(res => {
      this.save = true;
      this.getCarVersion();
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

  addNewEngine(): void {
    this.engine = {
      name: '',
      power: '',
      fuel: '',
      transmision: '',
      driveType: '',
      carId: null,
      price: null
    };

    this.versionsByCar = this.versions;

    this.save = true;
    this.engineDialog = true;
  }

  hideEngineDialog(): void {
    this.save = true;
    this.engineDialog = false;
    this.engine = {
      name: '',
      power: '',
      fuel: '',
      transmision: '',
      driveType: '',
      carId: null,
      price: null,
      versionId: null,
    };
  }

  saveEngineModel(): void {
    this.dataService.saveEngineModel(this.engine).subscribe(res => {
      this.getEngines();
      this.hideEngineDialog();
      this.confirmation(res.message, false);
    }, err => {
      if (typeof err.error.message === 'undefined') {
        this.confirmation(err.error.message, true);
      } else {
        this.confirmation(err.message, true);
      }
    });
  }


  editEngine(engine: any): void {
    this.save = false;
    this.engine.id = engine.id;
    this.engine.name = engine.name;
    this.engine.power = engine.power;
    this.engine.fuel = engine.fuel;
    this.engine.transmision = engine.transmision;
    this.engine.driveType = engine.driveType;
    this.engine.carId = engine.carId;
    this.engine.price = engine.price;
    this.engine.versionId = engine.versionId;
    this.engineDialog = true;

    this.versionsByCar = this.versions;
  }


  doEditEngine(): void {
    this.dataService.editEngines(this.engine).subscribe(res => {
      this.save = true;
      this.hideEngineDialog();
      this.getEngines();
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


  deleteEngine(version: any): void {
    this.dataService.deleteEngines(version.id).subscribe(res => {
      this.save = true;
      this.getEngines();
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


  goToSupport(): void {
    this.router.navigate(['/support']);
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


  /** Optional Importing data */

  onExcelImport($event: any, importType: string): void {
    let schema = {};
    switch (importType) {
      case 'models':
        schema = {
          'Model name': {
            prop: 'name',
            type: String,
            required: true
          },
          'Model description': {
            prop: 'description',
            type: String
          },
          'Producer Id': {
            prop: 'producerId',
            type: Number
          }
        };
        break;
      case 'versions':
        schema = {
          'Version name': {
            prop: 'name',
            type: String,
            required: true
          },
          'Car modelId': {
            prop: 'carModelId',
            type: Number,
            required: true
          }
        };
        break;
      case 'engines':
        schema = {
          'Engine ID': {
            prop: 'id',
            type: String,
            required: false
          },
          'Engine name': {
            prop: 'name',
            type: String,
            required: false
          },
          'Car ID': {
            prop: 'carId',
            type: Number,
            required: false
          },
          'Version ID': {
            prop: 'versionId',
            type: Number,
            required: false
          },
          'Model Price': {
            prop: 'price',
            type: Number,
            required: false
          },
          'Engine Fuel': {
            prop: 'fuel',
            type: (val: string): any => {
              if (FUEL_TYPES.map(a => a.name.toLowerCase()).indexOf(val.toLowerCase()) > -1) {
                return val;
              } else {
                throwError('Invalid type provided for Engine fuel');
              }
            },
            required: false
          },
          'Engine Power': {
            prop: 'power',
            type: String,
            required: false
          },
          Transmision: {
            prop: 'transmision',
            type: String,
            required: false
          },
          'Drive Type': {
            prop: 'driveType',
            type: String,
            required: false
          },
        };
        break;
      default:
        throwError('No matching import type provided');
        break;
    }


    readXlsxFile($event.target.files[0], { schema }).then((data: any) => {
      if (!data.errors?.length) {
        const filteredData = data.rows.map((row: any) => {
          const filteredRow: any = {};
          for (const key in row) {
              if (Object.prototype.hasOwnProperty.call(row, key)) {
                  const value = (row as any)[key];
                  if (value !== undefined && value !== '') {
                      filteredRow[key] = value;
                  }
              }
          }
          return filteredRow;
      });

        // currently this is set only for engines
        this.dataService.handleMultipleRequests(filteredData).subscribe(res => {
          this.getEngines();
        }, (err) => {
          console.log('err', err);
        });
      }
    }, (error: unknown) => {
      console.log(error);
    });
  }

  exportExcel(exportType: string): void {

    import('xlsx').then(xlsx => {
      let exportJsData = null;
      switch (exportType) {
        case 'producers':
          exportJsData = this.producers.map((p: any) => ({ id: p.id, name: p.name }));
          break;
        case 'models':
          exportJsData = this.cars.map((c: any) => ({
            id: c.id,
            name: c.name,
            producerId: c.producerId,
            producerName: c.producerName
          }));
          break;
        case 'versions':
          exportJsData = this.versions;
          break;
        case 'engines':
          exportJsData = this.engines;
          break;
        case 'master':
          this.exportMasterData();
          return;
        default:
          break;
      }

      if (!exportJsData) {
        throwError('Cannot export data');
        return;
      }

      const worksheet = xlsx.utils.json_to_sheet(exportJsData);

      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, exportType);
    });
  }

  async exportExcelProducer(producer: any): Promise<any> {
    const sheetRows: any[] = [];

    const producerCars = this.cars.filter((car: any) => car.producerId === producer.id);

    producerCars.forEach((car: any) => {
        const versions = this.versions.filter((version: any) => version.carId === car.id);

        if (versions.length === 0) {
            sheetRows.push({
                'Producer Id': producer.id,
                'Producer Name': producer.name,
                'Car Id': car.id,
                'Car Name': car.name,
                'Version Id': '',
                'Version Name': '',
                'Engine Id': '',
                'Engine Name': ''
            });
        }

        versions.forEach((version: any) => {
            const engines = this.engines.filter((engine: any) => engine.versionId === version.id);

            if (engines.length === 0) {
              sheetRows.push({
                  'Producer Id': producer.id,
                  'Producer Name': producer.name,
                  'Car Id': car.id,
                  'Car Name': car.name,
                  'Version Id': version.id,
                  'Version Name': version.name,
                  'Engine Id': '',
                  'Engine Name': ''
              });
          }  

            engines.forEach((engine: any) => {
                sheetRows.push({
                    'Producer Id': producer.id,
                    'Producer Name': producer.name,
                    'Car Id': car.id,
                    'Car Name': car.name,
                    'Version Id': version.id,
                    'Version Name': version.name,
                    'Engine Id': engine.id,
                    'Engine Name': engine.name
                });
            });
        });
    });

    import('xlsx').then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(sheetRows);

        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, producer.name);
    });
  }

  exportMasterData(): void {
    const sheetRows: any[] = [];

    this.producers.forEach((producer: any) => {
      const producerCars = this.cars.filter((car: any) => car.producerId === producer.id);

      if (producerCars.length === 0) {
        sheetRows.push({
          'Producer Id': producer.id,
          'Producer Name': producer.name,
          'Car Id': '',
          'Car Name': '',
          'Version Id': '',
          'Version Name': '',
          'Engine Id': '',
          'Engine Name': '',
          'Engine Power': '',
          'Engine Fuel': '',
          'Engine Transmision': '',
          'Drive Type': '',
          'Price': ''
        });
      }

      producerCars.forEach((car: any) => {
        const versions = this.versions.filter((version: any) => version.carId === car.id);

        if (versions.length === 0) {
          sheetRows.push({
            'Producer Id': producer.id,
            'Producer Name': producer.name,
            'Car Id': car.id,
            'Car Name': car.name,
            'Version Id': '',
            'Version Name': '',
            'Engine Id': '',
            'Engine Name': '',
            'Engine Power': '',
            'Engine Fuel': '',
            'Engine Transmision': '',
            'Drive Type': '',
            'Price': ''
          });
        }

        versions.forEach((version: any) => {
          const engines = this.engines.filter((engine: any) => engine.versionId === version.id);

          if (engines.length === 0) {
            sheetRows.push({
              'Producer Id': producer.id,
              'Producer Name': producer.name,
              'Car Id': car.id,
              'Car Name': car.name,
              'Version Id': version.id,
              'Version Name': version.name,
              'Engine Id': '',
              'Engine Name': '',
              'Engine Power': '',
              'Engine Fuel': '',
              'Engine Transmision': '',
              'Drive Type': '',
              'Price': ''
            });
          }

          engines.forEach((engine: any) => {
            sheetRows.push({
              'Producer Id': producer.id,
              'Producer Name': producer.name,
              'Car Id': car.id,
              'Car Name': car.name,
              'Version Id': version.id,
              'Version Name': version.name,
              'Engine Id': engine.id,
              'Engine Name': engine.name,
              'Engine Power': engine.power,
              'Engine Fuel': engine.fuel,
              'Engine Transmision': engine.transmision,
              'Drive Type': engine.driveType,
              'Price': engine.price
            });
          });
        });
      });
    });

    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(sheetRows);

      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'master_export');
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
}

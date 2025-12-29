import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { ListboxModule } from 'primeng/listbox';

import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
// import { CAR_COLORS } from 'src/app/constants/car-colors';
// import { CurrencySeparatorFormatterPipe } from '../../services/pipes/CurrencyPipe';
import { CarDataService } from '../services/car-data.service';
import { RequestsDataService } from '../../requests/services/requests.service';
import { HttpClientService } from '../../../core/http/services/http-client.service';
import { FUEL_TYPES } from '../../../core/config/fuel-types';
import { AuthService } from '../../../core/auth/services/auth.service';
import { FileService } from '../../../core/http/services/file.service';
import { CAR_COLORS } from '../../../core/config/car-colors';
import { CurrencySeparatorFormatterPipe } from '../../../core/pipes/currency-separator-formatter.pipe';

@Component({
  selector: 'app-car-selector',
  templateUrl: './car-selector.component.html',
  styleUrls: ['./car-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    CardModule,
    ProgressBarModule,
    MultiSelectModule,
    DialogModule,
    ListboxModule,
    CurrencySeparatorFormatterPipe,
  ],
})
export class CarSelectorComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('listbox') listbox: ElementRef | undefined;

  clientRequest: any = {
    producer: null,
    carModel: null,
    version: null,
    fuel: '',
    engine: null,
    color: '',
  };

  producerLogo = null;
  unavailableProducer = false; // -> producer without dealer corespondend
  popupTimout: any = null;
  stocOption = false;

  selectedCarModel = null;
  selectedProducer = null;
  selectedCities: any = [];
  selectedColor = null;

  currentUser: any = null;

  stepIndex = 1;

  queryParams: any = {};

  producers: any = [];
  cities: any = [];
  cars: any = [];
  versions: any = [];
  enginesData: any = {
    engines: [],
    carModelName: '',
    producerName: '',
  };
  fuels: any[] = [];
  // fuels: any = FUEL_TYPES.map((fuel: any) => {
  //   fuel.icon = `./assets/images/fuelTypes/${fuel.id}.svg`;
  //   return fuel;
  // });
  colors = CAR_COLORS;

  constructor(
    private carDataService: CarDataService,
    private requestsDataService: RequestsDataService,
    private httpClientDataService: HttpClientService,
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FileService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.queryParams = Object.assign({}, this.route.snapshot.queryParams);

    if (this.route.snapshot.data) {
      this.producers = this.route.snapshot.data['carSelectorData'].producers;
      this.cities = this.route.snapshot.data['carSelectorData'].cities;
    }

    this.processQueryParams();

    this.authService.currentUser.subscribe((data: any) => {
      this.currentUser = data;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  processQueryParams(): void {
    const { producer, carModel, version, fuelType, engine, color, regions } =
      this.queryParams;

    if (producer) {
      this.clientRequest.producer = this.selectedProducer = this.producers.find(
        (p: any) => p.name === producer
      );
      this.getCarsByProducer().subscribe(() => {
        this.advanceStep();
        if (carModel) {
          this.clientRequest.carModel = this.selectedCarModel = this.cars.find(
            (c: any) => c.name === decodeURI(carModel)
          );
          this.getCarVersions().subscribe(() => {
            this.advanceStep();
            if (version) {
              const decodedVersion = decodeURIComponent(version);
              this.clientRequest.version = this.versions.find(
                (v: any) => v.name === decodedVersion
              );
              if (!this.clientRequest.version) {
                return;
              }
              this.getEnginesByCarVersion().subscribe((res: any) => {
                this.fuels = FUEL_TYPES.filter((obj1) =>
                  res.engines
                    .map((engine: any) => engine.fuel)
                    .includes(obj1.id)
                ).map((fuel: any) => {
                  fuel.icon = `./assets/images/fuelTypes/${fuel.id}.svg`;
                  return fuel;
                });
                this.advanceStep();
                if (fuelType) {
                  this.clientRequest.fuel = this.fuels.find(
                    (f: any) => f.name === fuelType
                  ).id;
                  this.getEnginesByCarAndFuelType().subscribe(() => {
                    this.advanceStep();
                    if (engine) {
                      this.clientRequest.engine = this.enginesData.engines.find(
                        (e: any) => e.name === decodeURI(engine)
                      );
                      this.advanceStep();
                      if (color) {
                        this.clientRequest.color = this.selectedColor = color;
                        this.advanceStep();
                        if (regions) {
                          this.selectedCities = this.cities.filter(
                            (city: any) =>
                              decodeURI(regions).indexOf(city.name) > -1
                          );
                          this.clientRequest.regions = this.selectedCities
                            ?.map((r: any) => ' ' + r.name)
                            .toString();
                          this.advanceStep();
                        }
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  nextStep(data: any): void {
    // TODO: Add it back
    // if (this.stepIndex === 1 && (data && data.disabled || data === null)) {
    //   this.unavailableProducer = true;
    //   this.popupTimout = setTimeout(() => {
    //     this.unavailableProducer = false;
    //   }, 3000);
    //   return;
    // }

    if (data === null) {
      this.advanceStep();
      return;
    }
    switch (this.stepIndex) {
      case 1:
        this.setClientRequest(data, 'producer');
        this.clientRequest.producer = data;
        this.selectedProducer = data;
        this.getCarsByProducer().subscribe(() => {
          this.storeQueryParams('producer', this.clientRequest.producer.name);
          this.advanceStep();
        });
        break;
      case 2:
        this.setClientRequest(data, 'carModel');
        this.selectedCarModel = data;
        this.getCarVersions().subscribe(() => {
          this.storeQueryParams('carModel', this.clientRequest.carModel.name);
          this.advanceStep();
        });
        break;
      case 3:
        this.setClientRequest(data, 'version');
        this.storeQueryParams('version', this.clientRequest.version.name);
        this.getEnginesByCarVersion().subscribe((res: any) => {
          this.fuels = FUEL_TYPES.filter((obj1) =>
            res.engines.map((engine: any) => engine.fuel).includes(obj1.id)
          ).map((fuel: any) => {
            fuel.icon = `./assets/images/fuelTypes/${fuel.id}.svg`;
            return fuel;
          });
          this.advanceStep();
        });
        break;
      case 4:
        this.setClientRequest(data, 'fuel');
        this.getEnginesByCarAndFuelType().subscribe(() => {
          this.storeQueryParams('fuelType', this.clientRequest.fuel);
          this.advanceStep();
        });
        break;
      case 5:
        this.setClientRequest(data, 'engine');
        this.storeQueryParams('engine', this.clientRequest.engine.name);
        this.advanceStep();
        break;
      case 6:
        this.setClientRequest(data, 'color');
        this.selectedColor = data;
        this.storeQueryParams('color', this.clientRequest.color);
        this.advanceStep();
        break;
      case 7:
        const regions = data.map((r: any) => ' ' + r.name).toString();
        this.setClientRequest(regions, 'regions');
        this.selectedCities = data;
        this.storeQueryParams('regions', regions.replace(/\s/g, ''));
        this.advanceStep();
        break;
      default:
        break;
    }
  }

  setClientRequest(data: any, stepKey: string): void {
    this.clientRequest[stepKey] = data;
    this.resetQueryParams(stepKey);
  }

  private advanceStep(): void {
    this.stepIndex++;
    this.cdr.markForCheck();
  }

  resetQueryParams(key: string): void {
    const currentQueryPrams = Object.assign(
      {},
      this.route.snapshot.queryParams
    );
    if (key === 'producer') {
      delete currentQueryPrams['carModel'];
      delete currentQueryPrams['version'];
      delete currentQueryPrams['fuelType'];
      delete currentQueryPrams['engine'];

      this.clientRequest.carModel = null;
      this.clientRequest.version = null;
      this.clientRequest.fuelType = null;
      this.clientRequest.engine = null;
    } else if (key === 'carModel') {
      delete currentQueryPrams['version'];
      delete currentQueryPrams['fuelType'];
      delete currentQueryPrams['engine'];

      this.clientRequest.version = null;
      this.clientRequest.fuel = null;
      this.clientRequest.engine = null;
    } else if (key === 'version') {
      delete currentQueryPrams['fuelType'];
      delete currentQueryPrams['engine'];

      this.clientRequest.fuel = null;
      this.clientRequest.engine = null;
    } else if (key === 'fuel') {
      delete currentQueryPrams['engine'];
      this.clientRequest.engine = null;
    } else if (key === 'engine') {
    }

    this.router.navigate([], {
      queryParams: {
        ...currentQueryPrams,
      },
    });
  }

  getCarsByProducer(): any {
    return this.carDataService
      .getCarsByProducer(this.clientRequest.producer.id)
      .pipe(
        map((res: any) => {
          this.cars = res.map((car: any) => {
            car.icon = './assets/images/model-default.svg'; // car.icon?.data ? this.fileService.convertImage(car.icon.data)
            return car;
          });
        })
      );
  }

  getCarVersions(): any {
    return this.carDataService
      .getVersionsByCar(this.clientRequest.carModel.id)
      .pipe(
        map((res) => {
          this.versions = res.map((version: any) => {
            version.icon = './assets/images/version-default.png'; // version.icon?.data ? this.fileService.convertImage(version.icon.data);
            return version;
          });
        })
      );
  }

  getEnginesByCarAndFuelType(): any {
    return this.carDataService
      .getEnginesByCarAndFuelType(
        this.clientRequest.carModel.id,
        this.clientRequest.version.id,
        this.clientRequest.fuel
      )
      .pipe(
        map((res) => {
          this.enginesData = res;
        })
      );
  }

  getEnginesByCarVersion(): any {
    return this.carDataService.getEnginesByCarVersion(
      this.clientRequest.carModel.id,
      this.clientRequest.version.id
    );
  }

  storeQueryParams(query: string, value: string): void {
    let currentQueryPrams = Object.assign({}, this.route.snapshot.queryParams);
    if (currentQueryPrams) {
      currentQueryPrams[query] = value;
    } else {
      currentQueryPrams = {
        [query]: value,
      };
    }
    this.router.navigate([], {
      queryParams: {
        ...currentQueryPrams,
      },
    });
  }

  sendRequest(): void {
    if (!this.currentUser) {
      this.router.navigate(['login'], {
        queryParams: { returnUrl: this.router.routerState.snapshot.url },
      });
    } else {
      this.httpClientDataService.updateProgressBarValue(true);
      const name =
        `${this.clientRequest.producer.name} ${this.clientRequest.carModel.name} ` +
        `${this.clientRequest.version.name} ${this.clientRequest.fuel} ${this.clientRequest.engine.name}` +
        `${this.clientRequest.color} ${this.clientRequest.regions}`;
      const regionsArr = this.clientRequest.regions
        .replaceAll(' ', '')
        .split(',');

      const regions = this.cities
        .filter((city: any) => regionsArr.indexOf(city.name) > -1)
        .map((r: any) => r.id);

      this.requestsDataService
        .sendRequest({
          producer: this.clientRequest.producer,
          carModel: this.clientRequest.carModel.name,
          version: this.clientRequest.version.name,
          fuel: this.clientRequest.fuel,
          engine: this.clientRequest.engine.name,
          color: this.clientRequest.color,
          regions,
          name,
          stocOption: this.stocOption,
        })
        .subscribe(
          (res) => {
            this.clientRequest = {
              producer: null,
              carModel: null,
              version: null,
              fuel: '',
              engine: null,
              color: '',
            };
            this.httpClientDataService.updateProgressBarValue(false);
            this.router.navigate(['/request-success']);
          },
          (err) => {
            this.httpClientDataService.updateProgressBarValue(false);
            console.log(err);
          }
        );
    }
  }

  onDialogHide() {
    if (this.popupTimout) {
      clearTimeout(this.popupTimout);
    }
  }

  ngOnDestroy(): void {
    this.clientRequest = null;
    if (this.popupTimout) {
      clearTimeout(this.popupTimout);
    }
  }

  fuelMap(fuelName: string): string {
    return (
      FUEL_TYPES.find((fuel) => fuel.name === fuelName)?.displayValue || ''
    );
  }
}

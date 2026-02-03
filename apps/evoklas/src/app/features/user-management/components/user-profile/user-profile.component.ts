import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';

import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'apps/evoklas/src/app/core/auth/services/auth.service';
import SubscriptionService from '../../../subscription/services/subscription.service';
import { HttpClientService } from 'apps/evoklas/src/app/core/http/services/http-client.service';
import { CarDataService } from '../../../car-selection/services/car-data.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    CardModule,
    AvatarModule,
    FileUploadModule,
    ConfirmDialogModule,
    MultiSelectModule,
    TabsModule,
    TableModule,
  ],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  brands: any = [];
  cities: any = [];
  orders: any = [];
  msgs: any[] = [];

  userData: any = {};
  billingData: any = {};
  hasBillingInfo = false;

  currentUser: any = null;

  userProfileForm: FormGroup = new FormGroup({});
  billingForm: FormGroup = new FormGroup({});

  editMode = true;

  currentViewIndex = 0;
  tabValue: string | number = 0;
  menuItems = [
    {
      id: 0,
      labelKey: 'APP.PAGES.USER_PROFILE.LOGOUT_BTN',
      iconClass: 'fas fa-sign-out-alt',
      event: () => {
        this.authService.logout();
      },
    },
  ];
  credits$ = new Observable();

  constructor(
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private httpClientDataService: HttpClientService,
    private carDataService: CarDataService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initUserProfileForm();
    this.initBillingInfoForm();
    this.credits$ = this.subscriptionService.creditsObs$;
    this.currentUser = this.authService.currentUserValue;
    if (this.route.snapshot.paramMap.get('tabIndex')) {
      this.tabValue = this.route.snapshot.paramMap.get('tabIndex') ?? 0;
    }

    if (this.currentUser.role === 'DEALER') {
      this.subscriptionService.getTransactions().subscribe((orders: any) => {
        this.orders = orders;
      });
    }

    this.httpClientDataService
      .getCities()
      .pipe(
        switchMap((cities) => {
          this.cities = cities;
          return this.carDataService.getProducers();
        })
      )
      .subscribe(
        (producers) => {
          this.brands = producers;
          this.fetchUserData();
        },
        (err) => {
          console.error(err);
        }
      );
  }

  initUserProfileForm(): void {
    this.userProfileForm = this.formBuilder.group({
      name: [{ value: '', disabled: false }, [Validators.required]],
      surname: [{ value: '', disabled: false }, Validators.required],
      phone: [{ value: '', disabled: false }, Validators.required],
      city: [{ value: '', disabled: false }, Validators.required],
      email: [
        { value: '', disabled: false },
        [Validators.email, Validators.required],
      ],
    });
  }

  initBillingInfoForm(): void {
    this.billingForm = this.formBuilder.group({
      companyName: [{ value: '', disabled: false }, [Validators.required]],
      address: [{ value: '', disabled: false }, Validators.required],
      fiscalCode: [{ value: '', disabled: false }, Validators.required],
      no_reg: [{ value: '', disabled: false }, Validators.required],
      iban: [{ value: '', disabled: false }, [Validators.required]],
      bankName: [{ value: '', disabled: false }, [Validators.required]],
    });
  }

  fetchUserData(): void {
    this.httpClientDataService.getUserData().subscribe((userData) => {
      this.userData = userData;
      if (this.currentUser) {
        if (this.currentUser.role === 'DEALER') {
          userData.dealerBrands = userData.dealerBrands.map(
            (brandId: any) => +brandId
          );
          this.menuItems.unshift({
            id: 0,
            labelKey: 'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT_BTN',
            iconClass: 'fas fa-trash',
            event: () => {
              this.deleteAccount();
            },
          });

          this.menuItems.unshift({
            id: 0,
            labelKey: 'APP.PAGES.USER_PROFILE.ORDERS_HISTORY',
            iconClass: 'fas fa-layer-group',
            event: () => {
              this.currentViewIndex = 1;
            },
          });
          this.getBillingInfoData();
        }
        this.setFormFieldsData();
        this.cdr.detectChanges();
      }
    });
  }

  getBillingInfoData(): void {
    this.httpClientDataService.getDealerInfo().subscribe(
      (res) => {
        const valid = res && this.checkBillingInfo(res);
        this.hasBillingInfo = !!valid;

        if (valid) {
          this.billingData = res;
          this.setBillingFormFieldsData();
          this.cdr.detectChanges();
        } else {
          this.cdr.detectChanges();
        }
      },
      () => {
        this.hasBillingInfo = false;
        this.messageService.add({
          severity: 'error',
          summary:
            this.translate.instant('APP.ERRORS.0.title') || 'Eroare la datele de facturare',
          detail:
            this.translate.instant('APP.ERRORS.0.message') ||
            'Nu am putut încărca datele de facturare.',
        });
        this.cdr.detectChanges();
      }
    );
  }

  checkBillingInfo(data: any): boolean {
    return (
      !!data.address &&
      !!data.company_name &&
      !!data.bank_name &&
      !!data.iban_code &&
      !!data.registration_number &&
      !!data.vat_number
    );
  }

  setBillingFormFieldsData(): void {
    this.companyName.setValue(this.billingData.company_name);
    this.no_reg.setValue(this.billingData.registration_number);
    this.iban.setValue(this.billingData.iban_code);
    this.fiscalCode.setValue(this.billingData.vat_number);
    this.bankName.setValue(this.billingData.bank_name);
    this.address.setValue(this.billingData.address);
  }

  deleteAccount(): void {
    const confirmationMessage: any = {
      text: this.translate.instant(
        'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.TEXT'
      ),
      header: this.translate.instant(
        'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.HEADER'
      ),
      accept: {
        summary: this.translate.instant(
          'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.ACCEPT.SUMMARY'
        ),
        detail: this.translate.instant(
          'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.ACCEPT.DETAIL'
        ),
      },
      reject: {
        summay: this.translate.instant(
          'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.REJECT.SUMMARY'
        ),
        details: this.translate.instant(
          'APP.PAGES.USER_PROFILE.DELETE_ACCOUNT.REJECT.DETAIL'
        ),
      },
    };

    this.confirmationService.confirm({
      message: confirmationMessage.text,
      header: confirmationMessage.header,
      acceptLabel: this.translate.instant(
        'APP.PAGES.USER_PROFILE.CONFIRMATION_DIALOG.ACCEPT'
      ),
      rejectLabel: this.translate.instant(
        'APP.PAGES.USER_PROFILE.CONFIRMATION_DIALOG.REJECT'
      ),
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.msgs = [
          {
            severity: 'info',
            summary: confirmationMessage.accept.summary,
            detail: confirmationMessage.accept.detail,
          },
        ];
        this.httpClientDataService.deleteUser().subscribe(
          () => {
            this.messageService.add({
              severity: 'success',
              summary:
                this.translate.instant('APP.SUCCESS.DELETE_ACCOUNT') ||
                'Contul a fost șters',
            });
            this.authService.logout();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary:
                this.translate.instant('APP.ERRORS.GENERIC_TITLE') ||
                'Eroare',
              detail:
                error?.error?.message ||
                this.translate.instant('APP.ERRORS.GENERIC_MESSAGE') ||
                'Nu am putut șterge contul.',
            });
          }
        );
      },
      reject: () => {
        this.msgs = [
          {
            severity: 'info',
            summary: confirmationMessage.reject.summary,
            detail: confirmationMessage.reject.summary,
          },
        ];
      },
    });
  }

  setFormFieldsData(): void {
    this.name.setValue(this.userData.name);
    this.surname.setValue(this.userData.surname);
    this.email.setValue(this.userData.email);
    this.phone.setValue(this.userData.phone);

    const cityData = this.cities.find(
      (c: any) => c.id === this.userData.region
    )?.name;
    this.city.setValue(cityData);

    if (this.currentUser.role === 'DEALER') {
      const dealerBrands: any = [];
      this.userData.dealerBrands.forEach((dealerBrandId: any) => {
        const match = this.brands.find(
          (brand: any) => brand.id === dealerBrandId
        );
        if (match) {
          dealerBrands.push(match.name);
        }
      });

      this.userProfileForm.addControl(
        'dealerBrands',
        new FormControl({ value: dealerBrands, disabled: false }, Validators.required)
      );
    } else {
      if (this.userProfileForm.get('dealerBrands')) {
        this.userProfileForm.removeControl('dealerBrands');
      }
    }

    this.userProfileForm.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userProfileForm.pristine) {
      return;
    }
    if (!this.userProfileForm.valid) {
      this.setFieldErrors();
    } else {
      this.confirmationService.confirm({
        message: this.translate.instant(
          'APP.PAGES.USER_PROFILE.UPDATE_CONFIRMATION.TEXT'
        ),
        header: this.translate.instant(
          'APP.PAGES.USER_PROFILE.UPDATE_CONFIRMATION.HEADER'
        ),
        acceptLabel: this.translate.instant(
          'APP.PAGES.USER_PROFILE.CONFIRMATION_DIALOG.ACCEPT'
        ),
        rejectLabel: this.translate.instant(
          'APP.PAGES.USER_PROFILE.CONFIRMATION_DIALOG.REJECT'
        ),
        accept: () => this.submitProfileUpdate(),
      });
    }
  }

  private submitProfileUpdate(): void {
      // Format dealerBrands to insert only IDs
      const formData = this.userProfileForm.value;

      if (this.dealerBrands.value && this.currentUser.role === 'DEALER') {
        const dealerBrandsIds: any = [];

        this.brands.forEach((brand: any) => {
          if (this.dealerBrands.value.indexOf(brand.name) > -1) {
            dealerBrandsIds.push(brand.id);
          }
        });
        formData.dealerBrands = dealerBrandsIds;
      }
      const data = {
        ...formData,
        region: this.cities.find((c: any) => c.name === formData.city).id,
      };

    this.httpClientDataService
      .editUser(data)
      .pipe(switchMap((res) => this.httpClientDataService.getUserData()))
      .subscribe(
        (userData: any) => {
          this.userData = userData;
          const { name, surname, email } = userData;
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('APP.SUCCESS.EDIT_USER'),
          });
          this.authService.updateEditedUser({
            name,
            surname,
            email,
          });
          this.cdr.detectChanges();
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('APP.ERRORS.GENERIC_TITLE') || 'Eroare',
            detail:
              error?.error?.message ||
              this.translate.instant('APP.ERRORS.GENERIC_MESSAGE') ||
              'A apărut o eroare la actualizare.',
          });
        }
      );
  }

  onBillingFormSubmit(): void {
    if (this.billingForm.pristine) {
      return;
    }
    if (this.billingForm.invalid) {
      this.setBillingFieldErrors();
    } else {
      this.httpClientDataService
        .setDealerInfo({
          company_name: this.companyName.value,
          registration_number: this.no_reg.value,
          iban_code: this.iban.value,
          bank_name: this.bankName.value,
          vat_number: this.fiscalCode.value,
          address: this.address.value,
        })
        .subscribe(
          (res) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant(
                'APP.SUCCESS.EDIT_BILLING_DETAILS'
              ),
            });
            this.hasBillingInfo = true;
            this.cdr.detectChanges();
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('APP.ERRORS.GENERIC_TITLE') || 'Eroare',
              detail:
                error?.error?.message ||
                this.translate.instant('APP.ERRORS.GENERIC_MESSAGE') ||
                'A apărut o eroare la actualizare.',
            });
          }
        );
    }
  }


  setBillingFieldErrors(): void {
    if (!this.companyName.value) {
      this.companyName.setErrors({ invalid: true });
    }

    if (!this.address.value) {
      this.address.setErrors({ invalid: true });
    }

    if (!this.iban.value) {
      this.iban.setErrors({ invalid: true });
    }

    if (!this.no_reg.value) {
      this.no_reg.setErrors({ invalid: true });
    }

    if (!this.bankName.value) {
      this.bankName.setErrors({ invalid: true });
    }

    if (!this.fiscalCode.value) {
      this.fiscalCode.setErrors({ invalid: true });
    }
  }


  setFieldErrors(): void {
    this.userProfileForm.setErrors(Validators.required);
  }

  // Billing form getters
  get companyName(): any {
    return this.billingForm.get('companyName');
  }

  get address(): any {
    return this.billingForm.get('address');
  }

  get fiscalCode(): any {
    return this.billingForm.get('fiscalCode');
  }

  get iban(): any {
    return this.billingForm.get('iban');
  }

  get bankName(): any {
    return this.billingForm.get('bankName');
  }

  get no_reg(): any {
    return this.billingForm.get('no_reg');
  }

  // Personal details getters

  get name(): any {
    return this.userProfileForm.get('name');
  }

  get surname(): any {
    return this.userProfileForm.get('surname');
  }

  get dealerBrands(): any {
    return this.userProfileForm.get('dealerBrands');
  }

  get city(): any {
    return this.userProfileForm.get('city');
  }

  get phone(): any {
    return this.userProfileForm.get('phone');
  }

  get email(): any {
    return this.userProfileForm.get('email');
  }

  get password(): any {
    return this.userProfileForm.get('password');
  }

  get password2(): any {
    return this.userProfileForm.get('password2');
  }

  ngOnDestroy(): void {}
}

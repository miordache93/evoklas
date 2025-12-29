// src/app/helpers/validators.ts
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// Reuse your MustMatch (kept here for clarity)
export function MustMatch(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const group = formGroup as FormGroup;
    const control = group.controls[controlName];
    const matchingControl = group.controls[matchingControlName];

    if (!control || !matchingControl) return null;

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }

    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}

// Romania phone (mobile + landline) — pragmatic pattern
// Accepts: 07xxxxxxxx, +407xxxxxxxx, 02/03 landlines (9–10 total digits with prefix)
export const RO_PHONE_PATTERN =
  /^((?:\+?40|0)?7\d{8}|(?:\+?40|0)?[23]\d{8,9})$/;

// Simple letters + diacritics, spaces, hyphen, apostrophe; 2–50 chars
export const NAME_PATTERN =
  /^[A-Za-zÀ-žăâîșțĂÂÎȘȚ'’ -]{2,50}$/;

// Password strength: min 8, 1 upper, 1 lower, 1 number, 1 special
export function passwordStrength(): ValidatorFn {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    return value ? (regex.test(value) ? null : { weakPassword: true }) : { required: true };
  };
}

// Require at least N items in an array FormControl (for p-multiSelect)
export function minSelected(min = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const count = Array.isArray(value) ? value.length : 0;
    return count >= min ? null : { minSelected: { required: min, actual: count } };
  };
}

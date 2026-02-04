import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-support-team',
  templateUrl: './support-team.component.html',
  styleUrls: ['./support-team.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
    ToastModule,
  ],
})
export class SupportTeamComponent implements OnInit {
  supportForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.supportForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (!this.supportForm.valid) {
      console.log(this.supportForm.valid);
    } else {
      const { name, email, subject, message } = this.supportForm.value;
      console.log(this.supportForm.valid);
      this.confirmation();
      this.supportForm.reset();
    }
  }

  get name() {
    return this.supportForm.get('name');
  }

  get email() {
    return this.supportForm.get('email');
  }

  get subject() {
    return this.supportForm.get('subject');
  }

  get message() {
    return this.supportForm.get('message');
  }


  confirmation() {
    let severity = 'success';
    this.messageService.add({
      severity: severity,
      summary: 'Support Team',
      detail:
        'We apologize for the inconvenience. We will return with a solution as soon as possible.',
      life: 3000,
    });
  }
}

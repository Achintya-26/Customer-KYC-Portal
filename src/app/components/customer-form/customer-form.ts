import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion'; 
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-form',
  imports: [FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatExpansionModule,
    MatStepperModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss'
})
export class CustomerForm {
  currentStep = 0;
  totalSteps = 4;
  
  customerInfoForm: FormGroup;
  addressForm: FormGroup;
  
  uploadedFiles: any[] = [
    { name: 'Document 1.pdf', id: 1 },
    { name: 'Document 2.pdf', id: 2 },
    { name: 'Document 3.pdf', id: 3 },
    { name: 'Document 4.pdf', id: 4 }
  ];
  
  panels = [
    { id: 'customerInfo', title: 'Customer Information', expanded: true },
    { id: 'address', title: 'Address', expanded: false },
    { id: 'agentReview', title: 'Agent Review', expanded: false },
    { id: 'kycDocuments', title: 'KYC Documents', expanded: false }
  ];

  constructor(private fb: FormBuilder) {
    this.customerInfoForm = this.fb.group({
      surname: ['', Validators.required],
      firstName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      idCardNo: ['', Validators.required],
      occupation: ['', Validators.required],
      telephone: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.addressForm = this.fb.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });
  }

  togglePanel(panelId: string) {
    this.panels.forEach(panel => {
      if (panel.id === panelId) {
        panel.expanded = !panel.expanded;
      }
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.updatePanelVisibility();
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updatePanelVisibility();
    }
  }

  updatePanelVisibility() {
    this.panels.forEach((panel, index) => {
      panel.expanded = index === this.currentStep;
    });
  }

  removeFile(file: any) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    // Handle file upload logic
  }

  uploadDocument() {
    // Handle document upload
  }

  viewFile(file: any) {
    // Handle file view
  }

  clearSignature() {
    // Handle clear signature
  }

  saveSignature() {
    // Handle save signature
  }
}

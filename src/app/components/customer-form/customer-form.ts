import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { findIndex } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
}

interface UserInfoResponse {
  responseType: string;
  responseBody: {
    id: string;
    customerCode: string;
    userName: string;
    firstName: string;
    lastName: string;
    middleName: string;
    title: string;
    passportNo: string;
    dateOfBirth: string;
    mobileNumber: string;
    identityNo: string;
    email: string;
    occupation: string;
    country: string;
    address1: string;
    address2: string;
    address3: string;
    bankName: string;
    accountNo: string;
    gender: string;
    [key: string]: any;
  };
}

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
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.scss'
})
export class CustomerForm {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  currentStep = 0;
  totalSteps = 4;
  isLoadingUserInfo = false;
  
  customerInfoForm: FormGroup;
  addressForm: FormGroup;
  
  uploadedFiles: UploadedFile[] = [];
  
  isDragOver = false;
  selectedFile: UploadedFile | null = null;
  
  panels = [
    { id: 'customerInfo', title: 'Customer Information', expanded: true },
    { id: 'address', title: 'Address', expanded: false },
    { id: 'agentReview', title: 'Agent Review', expanded: false },
    { id: 'kycDocuments', title: 'KYC Documents', expanded: false }
  ];

  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
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

    // Listen for changes to idCardNo field
    this.customerInfoForm.get('idCardNo')?.valueChanges
      .pipe(
        debounceTime(500), // Wait for 500ms after user stops typing
        distinctUntilChanged() // Only emit when the value actually changes
      )
      .subscribe(idCardNo => {
        if (idCardNo && idCardNo.trim().length >= 3) { // Minimum 3 characters
          this.fetchUserInfo(idCardNo.trim());
        }
      });
  }

  togglePanel(panelId: string) {
    this.currentStep = this.panels.findIndex(panel => panel.id === panelId);
    this.panels.forEach(panel => {
      if (panel.id === panelId) {
        panel.expanded = !panel.expanded;
      }
    });
    // console.log(`Toggled! ${panelId}`);
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

  // Drag and Drop functionality
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  browseFiles() {
    this.fileInput.nativeElement.click();
  }

  private handleFiles(files: FileList) {
    Array.from(files).forEach(file => {
      if (this.isValidFile(file)) {
        this.addFile(file);
      }
    });
  }

  private isValidFile(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload PDF, Word, or image files.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 10MB.');
      return false;
    }
    
    return true;
  }

  private addFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const uploadedFile: UploadedFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: e.target?.result as string,
        file: file
      };
      
      this.uploadedFiles.push(uploadedFile);
    };
    
    reader.readAsDataURL(file);
  }

  removeFile(file: UploadedFile) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== file.id);
  }

  uploadDocument() {
    // Handle document upload to server
    console.log('Uploading documents:', this.uploadedFiles);
  }

  viewFile(file: UploadedFile) {
    this.selectedFile = file;
  }

  closePreview() {
    this.selectedFile = null;
  }

  downloadFile(file: UploadedFile) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('word')) return 'description';
    return 'description';
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  clearSignature() {
    // Handle clear signature
  }

  saveSignature() {
    // Handle save signature
  }

  fetchUserInfo(idCardNo: string) {
    const apiUrl = `https://gipasdmssvr.nicl.mu:8050/NICGeneralServices/userinfo?userId=${idCardNo}`;
    
    this.isLoadingUserInfo = true;
    
    this.http.get<UserInfoResponse>(apiUrl).subscribe({
      next: (response) => {
        this.isLoadingUserInfo = false;
        if (response.responseType === 'SUCCESS') {
          this.autoFillFormFields(response.responseBody);
          this.snackBar.open('User information loaded successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        } else {
          this.snackBar.open('User not found', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      },
      error: (error) => {
        this.isLoadingUserInfo = false;
        console.error('Error fetching user info:', error);
        this.snackBar.open('Failed to fetch user information', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  private autoFillFormFields(userData: any) {
    try {
      // Decode base64 encoded fields
      const decodedData = {
        firstName: this.decodeBase64(userData.firstName),
        lastName: this.decodeBase64(userData.lastName),
        email: this.decodeBase64(userData.email),
        mobileNumber: this.decodeBase64(userData.mobileNumber),
        address1: this.decodeBase64(userData.address1),
        address2: this.decodeBase64(userData.address2),
        address3: this.decodeBase64(userData.address3),
        bankName: this.decodeBase64(userData.bankName),
        accountNo: this.decodeBase64(userData.accountNo)
      };

      // Auto-fill customer info form
      this.customerInfoForm.patchValue({
        firstName: decodedData.firstName || '',
        surname: decodedData.lastName || '',
        email: decodedData.email || '',
        mobile: decodedData.mobileNumber || '',
        dateOfBirth: this.formatDateOfBirth(userData.dateOfBirth),
        occupation: userData.occupation || '',
        telephone: '' // Not provided in API response
      });

      // Auto-fill address form
      const fullAddress = [decodedData.address1, decodedData.address2, decodedData.address3]
        .filter(addr => addr && addr.trim())
        .join(', ');

      this.addressForm.patchValue({
        streetAddress: fullAddress || '',
        // Note: The API doesn't provide separate city, state, postal code
        // You might need to parse the address or make additional API calls
        city: '',
        state: '',
        postalCode: '',
        country: this.getCountryName(userData.country)
      });

    } catch (error) {
      console.error('Error auto-filling form fields:', error);
    }
  }

  private decodeBase64(encodedValue: string): string {
    if (!encodedValue) return '';
    try {
      return atob(encodedValue);
    } catch (error) {
      console.error('Error decoding base64:', error);
      return encodedValue; // Return original value if decoding fails
    }
  }

  private formatDateOfBirth(dateString: string): string {
    if (!dateString) return '';
    try {
      // Convert DD-MM-YYYY to YYYY-MM-DD for HTML date input
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dateString;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }

  private getCountryName(countryCode: string): string {
    // Map country codes to names - extend as needed
    const countryMap: { [key: string]: string } = {
      '4090': 'mauritius',
      '1001': 'india',
      '1002': 'usa',
      '1003': 'uk',
      // Add more country mappings as needed
    };
    return countryMap[countryCode] || '';
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

interface CustomerKYC {
  id: number;
  id_card_no: string;
  surname: string;
  first_name: string;
  full_name: string;
  date_of_birth: string;
  occupation: string;
  mobile: string;
  email: string;
  city: string;
  country: string;
  status: string;
  submission_date: string;
  created_at: string;
  has_signature: boolean;
}

interface ProfileDetailsResponse {
  responseType: string;
  responseBody: {
    totalUsers: number;
    users: any[];
  };
}

@Component({
  selector: 'app-dashboard',
  imports: [
    HttpClientModule,
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}
  
  // Dashboard statistics
  contactedCustomersCount = 0;
  assignedCustomersCount = 0;
  isLoadingStats = false;
  isLoadingTable = false;
  
  dataSource: CustomerKYC[] = [];
  
  displayedColumns: string[] = ['full_name', 'date_of_birth', 'id_card_no', 'occupation', 'mobile', 'email', 'city', 'country', 'status', 'submission_date'];

  ngOnInit() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoadingStats = true;
    this.isLoadingTable = true;

    try {
      // Load data in parallel
      await Promise.all([
        this.loadContactedCustomersCount(),
        this.loadAssignedCustomersCount(),
        this.loadCustomerKYCTable()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.snackBar.open('Failed to load dashboard data', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    } finally {
      this.isLoadingStats = false;
      this.isLoadingTable = false;
    }
  }

  // Load number of contacted customers from customer_kyc table
  private async loadContactedCustomersCount() {
    try {
      const response = await this.http.get<any>('http://localhost:3000/api/customer-kyc?limit=1').toPromise();
      if (response.success && response.pagination) {
        this.contactedCustomersCount = response.pagination.total;
      }
    } catch (error) {
      console.error('Error loading contacted customers count:', error);
      this.contactedCustomersCount = 0;
    }
  }

  // Load total number of assigned customers from master API
  private async loadAssignedCustomersCount() {
    try {
      const response = await this.http.get<ProfileDetailsResponse>('https://gipasdmssvr.nicl.mu:8050/NICGeneralServices/getProfileDetails').toPromise();
      if (response && response.responseType === 'SUCCESS' && response.responseBody) {
        this.assignedCustomersCount = response.responseBody.totalUsers || response.responseBody.users?.length || 0;
      }
    } catch (error) {
      console.error('Error loading assigned customers count:', error);
      this.assignedCustomersCount = 0;
    }
  }

  // Load customer KYC table data
  private async loadCustomerKYCTable() {
    try {
      const response = await this.http.get<any>('http://localhost:3000/api/customer-kyc?limit=100').toPromise();
      if (response.success && response.data) {
        // console.log(response.data[0]);
        this.dataSource = response.data.map((customer: any) => ({
          ...customer,
          // full_name: `${customer.first_name} ${customer.surname}`.trim(),
          date_of_birth: this.formatDate(customer.date_of_birth),
          submission_date: this.formatDate(customer.submission_date || customer.created_at)
        }));
      }
    } catch (error) {
      console.error('Error loading customer KYC table:', error);
      this.dataSource = [];
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    } catch (error) {
      return dateString;
    }
  }

  refreshData() {
    this.loadDashboardData();
  }

  navigateToCustomerForm() {
    this.router.navigate(['/customer-form']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  selector: 'app-dashboard',
  imports: [
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
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  constructor(private router: Router) {}
  
  dataSource = [
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    },
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    },
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    },
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    },
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    },
    {
      firstName: 'EsKay',
      dob: '21/07/1994',
      idCardNo: 'IN00801',
      occupation: 'Designer',
      mobile: '9790886675',
      email: 'sample@azentio.com',
      city: 'Chennai',
      state: 'Tamilnadu',
      country: 'India'
    }
  ];
  
  displayedColumns: string[] = ['firstName', 'dob', 'idCardNo', 'occupation', 'mobile', 'email', 'city', 'state', 'country'];

  navigateToCustomerForm() {
    this.router.navigate(['/customer-form']);
  }
}

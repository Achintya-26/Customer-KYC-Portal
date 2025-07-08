import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CustomerForm } from './components/customer-form/customer-form';

export const routes: Routes = [
    {
        path: 'customer-form',
        component: CustomerForm
    },
    {
        path: '',
        component: Dashboard    
    }
];

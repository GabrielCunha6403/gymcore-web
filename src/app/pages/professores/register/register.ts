import { Component } from '@angular/core';

import { Breadcrumb } from '../../../components/breadcrumb/breadcrumb';
import {Wizard} from '../../../components/wizard/wizard';

@Component({
  selector: 'app-professor-register',
  imports: [Breadcrumb, Wizard],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {}

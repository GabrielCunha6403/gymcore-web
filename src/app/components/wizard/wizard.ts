import { Component } from '@angular/core';

@Component({
  selector: 'app-wizard',
  imports: [],
  templateUrl: './wizard.html',
  styleUrl: './wizard.scss',
})
export class Wizard {
  public steps = [ //input.required<WizardStep[]>(),
    {
      label: 'Dados Pessoais',
      description: 'Preencha os dados pessoais do professor',
      icon: 'pi pi-user',
      completed: false,
    },
    {
      label: 'Dados da Unidade',
      description: 'Preencha os dados da unidade do professor',
    }

  ]
}

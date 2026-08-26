import { Component, input } from '@angular/core';
import { FormControl, ValidationErrors } from '@angular/forms';

type ControlErrorMessages = Partial<Record<string, string>>;

@Component({
  selector: 'app-error-message-control',
  imports: [],
  templateUrl: './error-message-control.html',
  styleUrl: './error-message-control.scss',
})
export class ErrorMessageControl {
  public readonly control = input.required<FormControl>();
  public readonly message = input('* Campo inválido');
  public readonly messages = input<ControlErrorMessages>({});

  protected currentMessage(): string {
    const errors = this.control().errors;

    if (!errors) {
      return this.message();
    }

    const errorName = this.findErrorName(errors);

    return this.messages()[errorName] ?? this.defaultMessage(errorName, errors) ?? this.message();
  }

  private findErrorName(errors: ValidationErrors): string {
    const priorityErrors = ['required', 'invalidCpf', 'email', 'pattern', 'maxlength', 'minlength'];

    return priorityErrors.find((errorName) => errors[errorName]) ?? Object.keys(errors)[0];
  }

  private defaultMessage(errorName: string, errors: ValidationErrors): string | undefined {
    if (errorName === 'required') {
      return '* Campo obrigatório';
    }

    if (errorName === 'email') {
      return '* Email inválido';
    }

    if (errorName === 'maxlength') {
      return `* Máximo de ${errors['maxlength']?.requiredLength} caracteres`;
    }

    if (errorName === 'minlength') {
      return `* Mínimo de ${errors['minlength']?.requiredLength} caracteres`;
    }

    if (errorName === 'pattern') {
      return '* Campo inválido';
    }

    return undefined;
  }
}

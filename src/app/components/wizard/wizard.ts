import { Component, Directive, HostBinding, computed, contentChildren, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, ControlContainer } from '@angular/forms';
import {WizardStep} from './types/types';

@Directive({
  selector: '[appWizardStep]',
})
export class WizardStepContent {
  private readonly controlContainer = inject(ControlContainer, { optional: true, self: true });

  @HostBinding('class.wizard-projected-step')
  protected readonly contentClass = true;

  @HostBinding('attr.hidden')
  protected get hidden(): '' | null {
    return this.active ? null : '';
  }

  private active = false;

  public setActive(active: boolean): void {
    this.active = active;
  }

  public get control(): AbstractControl | null {
    return this.controlContainer?.control ?? null;
  }

  public isValid(): boolean {
    return this.control?.valid ?? true;
  }

  public markAllAsTouched(): void {
    this.control?.markAllAsTouched();
  }
}

@Component({
  selector: 'app-wizard',
  imports: [],
  templateUrl: './wizard.html',
  styleUrl: './wizard.scss',
})
export class Wizard {
  public readonly steps = input.required<WizardStep[]>();

  protected readonly currentStepIndex = signal(0);
  protected readonly currentStep = computed(() => this.steps()[this.currentStepIndex()]);

  private readonly stepContents = contentChildren(WizardStepContent);

  constructor() {
    effect(() => {
      const currentIndex = this.currentStepIndex();

      this.stepContents().forEach((content, index) => {
        content.setActive(index === currentIndex);
      });
    });
  }

  protected goToStep(index: number): void {
    if (index < 0 || index >= this.steps().length) {
      return;
    }

    if (!this.canGoToStep(index)) {
      this.currentStepContent()?.markAllAsTouched();
      return;
    }

    this.currentStepIndex.set(index);
  }

  protected goToPreviousStep(): void {
    this.goToStep(this.currentStepIndex() - 1);
  }

  protected goToNextStep(): void {
    if (!this.canAdvanceFromCurrentStep()) {
      this.currentStepContent()?.markAllAsTouched();
      return;
    }

    this.goToStep(this.currentStepIndex() + 1);
  }

  protected isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }

  protected isLastStep(): boolean {
    return this.currentStepIndex() >= this.steps().length - 1;
  }

  protected canAdvanceFromCurrentStep(): boolean {
    return this.currentStepContent()?.isValid() ?? true;
  }

  protected canGoToStep(index: number): boolean {
    if (index <= this.currentStepIndex()) {
      return true;
    }

    return this.stepContents()
      .slice(0, index)
      .every((content) => content.isValid());
  }

  private currentStepContent(): WizardStepContent | undefined {
    return this.stepContents()[this.currentStepIndex()];
  }
}

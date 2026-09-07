import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstOrDefault',
})
export class FirstOrDefaultPipe implements PipeTransform {
  transform<T>(value: readonly T[] | null | undefined, fallback: T): T {
    return value?.length ? value[0] : fallback;
  }
}

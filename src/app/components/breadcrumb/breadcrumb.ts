import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, startWith } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.breadcrumbs.set(this.buildBreadcrumbs(this.router.routerState.snapshot.root));
      });
  }

  private buildBreadcrumbs(route: ActivatedRouteSnapshot): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentRoute: ActivatedRouteSnapshot | null = route;
    let currentUrl = '';

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
      const activeRoute = currentRoute;
      const routeSegments = activeRoute.url.map((segment) => segment.path).filter(Boolean);

      routeSegments.forEach((segment, index) => {
        currentUrl += `/${segment}`;

        const label = this.resolveLabel(activeRoute, segment, currentUrl, index === routeSegments.length - 1);

        if (!label || currentUrl === '/home') {
          return;
        }

        breadcrumbs.push({
          label,
          url: currentUrl,
        });
      });
    }

    return breadcrumbs;
  }

  private resolveLabel(
    route: ActivatedRouteSnapshot,
    routeSegment: string,
    currentUrl: string,
    isLastSegment: boolean,
  ): string {
    if (isLastSegment) {
      const routeDataLabel = route.data['breadcrumb'];

      if (typeof routeDataLabel === 'string' && routeDataLabel.trim()) {
        return routeDataLabel;
      }
    }

    const configuredLabel = this.findConfiguredLabel(currentUrl);

    if (configuredLabel) {
      return configuredLabel;
    }

    return this.formatLabel(routeSegment);
  }

  private findConfiguredLabel(url: string): string | undefined {
    const normalizedPath = url.replace(/^\//, '');
    const matchingRoute = this.router.config.find((route) => route.path === normalizedPath);

    if (!matchingRoute) {
      return undefined;
    }

    const configuredLabel = matchingRoute.data?.['breadcrumb'];

    return typeof configuredLabel === 'string' && configuredLabel.trim()
      ? configuredLabel
      : undefined;
  }

  private formatLabel(segment: string): string {
    return segment
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
import {Injectable} from '@angular/core';


export const CustomBreakpointNames = {
  phone: 'phone',
  phoneLandscape: 'phoneLandscape',
  tablet: 'tablet',
  tabletLandscape:'tabletLandscape',
  desktop:'desktop',
  desktopLarge: 'desktopLarge',
  desktopExtraLarge:'desktopExtraLarge'
};

@Injectable({
  providedIn: 'root'
})
export class BreakpointsService {
  breakpoints: any = {
    '(max-width: 320px)': CustomBreakpointNames.phone,
    '(max-width: 568px)': CustomBreakpointNames.phoneLandscape,
    '(max-width: 768px)': CustomBreakpointNames.tablet,
    '(max-width: 1024px)': CustomBreakpointNames.tabletLandscape,
    '(max-width: 1366px)': CustomBreakpointNames.desktop,
    '(max-width: 1919px)': CustomBreakpointNames.desktopLarge,
    '(max-width: 5000px)': CustomBreakpointNames.desktopExtraLarge
  };

  getBreakpoints(): string[] {
    return Object.keys(this.breakpoints);
  }

  getBreakpointName(breakpointValue : any): string {
    return this.breakpoints[breakpointValue];
  }
}
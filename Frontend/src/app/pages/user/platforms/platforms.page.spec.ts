import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { PlatformsPage } from './platforms.page';
import { UserService } from 'src/app/services/user.service';
import { LoaderService } from 'src/app/services/loader.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { AlertService } from 'src/app/services/alert.service';

describe('PlatformsPage', () => {
  let component: PlatformsPage;
  let fixture: ComponentFixture<PlatformsPage>;
  let presentToastSpy: jasmine.Spy;
  let isLoadingNextSpy: jasmine.Spy;
  let getPlatformsSpy: jasmine.Spy;
  let updatePlatformSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;
  let setPlatformSpy: jasmine.Spy;

  const allPlatforms = {
    codechef: null,
    codeforces: null,
    leetcode: null,
    atcoder: null
  };

  beforeEach(waitForAsync(() => {
    isLoadingNextSpy = jasmine.createSpy('next');
    presentToastSpy = jasmine.createSpy('presentToast').and.returnValue(Promise.resolve());
    getPlatformsSpy = jasmine.createSpy('getPlatforms').and.returnValue(of({ platformData: { platform: allPlatforms } }));
    updatePlatformSpy = jasmine.createSpy('updatePlatform').and.returnValue(of({ msg: 'Platform updated', name: 'testuser' }));
    navigateSpy = jasmine.createSpy('navigate');
    setPlatformSpy = jasmine.createSpy('setPlatform');

    TestBed.configureTestingModule({
      declarations: [PlatformsPage],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: { getPlatforms: getPlatformsSpy, updatePlatform: updatePlatformSpy } },
        { provide: LoaderService, useValue: { isLoading: { next: isLoadingNextSpy } } },
        { provide: AlertService, useValue: { presentToast: presentToastSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ActivatedRoute, useValue: {} },
        { provide: LocalStorageService, useValue: { setPlatform: setPlatformSpy } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose only CodeChef, Codeforces, LeetCode and AtCoder in the platform list', () => {
    expect(component.platformEntries.map(p => p.key)).toEqual(['codechef', 'codeforces', 'leetcode', 'atcoder']);
  });

  it('should mark platformEntry when a supported platform is registered', () => {
    component.platformEntry = false;
    component.platforms = { codechef: 'cc-user', codeforces: null, leetcode: null, atcoder: null };
    component.getUserPlatformData();
    expect(component.platformEntry).toBe(true);
  });

  it('should navigate to a supported platform profile', () => {
    component.platforms = { codechef: 'cc-user', codeforces: null, leetcode: null, atcoder: null };
    component.navigateTo('codechef');
    expect(setPlatformSpy).toHaveBeenCalledWith({ codechef: 'cc-user' });
    expect(navigateSpy).toHaveBeenCalled();
    expect(navigateSpy.calls.mostRecent().args[0]).toEqual(['codechef']);
  });
});

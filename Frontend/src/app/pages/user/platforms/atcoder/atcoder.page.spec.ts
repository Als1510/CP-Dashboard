import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { EMPTY, of, Subject } from 'rxjs';

import { AtcoderPage } from './atcoder.page';
import { UserService } from 'src/app/services/user.service';
import { LocalStorageService } from 'src/app/services/localStorage.service';
import { LoaderService } from 'src/app/services/loader.service';
import { AlertService } from 'src/app/services/alert.service';

describe('AtcoderPage', () => {
  let component: AtcoderPage;
  let fixture: ComponentFixture<AtcoderPage>;
  let getUserDetailsSpy: jasmine.Spy;
  let presentToastSpy: jasmine.Spy;
  let isLoadingNextSpy: jasmine.Spy;
  let getPlatformSpy: jasmine.Spy;
  let refreshUserDetailsSpy: jasmine.Spy;

  const okPayload = {
    status: 'OK',
    username: 'testuser',
    rating: '2000',
    highest_rating: '2200',
    rank: '9',
    level: '12',
  };

  const naPayload = {
    status: 'OK',
    username: 'newuser',
    rating: 'NA',
    highest_rating: 'NA',
    rank: 'NA',
    level: 'NA',
  };

  const failPayload = { status: 'Failed', details: 'Upstream access failure' };
  const failNoDetailsPayload = { status: 'Failed' };
  const freshPayload = {
    status: 'OK',
    username: 'testuser',
    rating: '2100',
    highest_rating: '2300',
    rank: '5',
    level: '14',
  };

  beforeEach(waitForAsync(() => {
    isLoadingNextSpy = jasmine.createSpy('next');
    presentToastSpy = jasmine.createSpy('presentToast').and.returnValue(Promise.resolve());
    getPlatformSpy = jasmine.createSpy('getPlatform').and.returnValue({ atcoder: 'testuser' });
    getUserDetailsSpy = jasmine.createSpy('getUserDetails').and.returnValue(of(okPayload));
    refreshUserDetailsSpy = jasmine.createSpy('refreshUserDetails').and.returnValue(of(okPayload));

    TestBed.configureTestingModule({
      declarations: [AtcoderPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UserService, useValue: { getUserDetails: getUserDetailsSpy, refreshUserDetails: refreshUserDetailsSpy } },
        { provide: LocalStorageService, useValue: { getPlatform: getPlatformSpy } },
        { provide: LoaderService, useValue: { isLoading: { next: isLoadingNextSpy } } },
        { provide: AlertService, useValue: { presentToast: presentToastSpy } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AtcoderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

    it('should assign canonical profile data on a successful OK response', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));
    component.userData = null;
    component.getUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.userData.username).toBe('testuser');
    expect(component.userData.rating).toBe('2000');
    expect(component.userData.highest_rating).toBe('2200');
    expect(component.userData.rank).toBe('9');
    expect(component.userData.level).toBe('12');
    expect(component.userData.other).toBeUndefined();
    expect(component.loaded).toBe(true);
    expect(presentToastSpy).not.toHaveBeenCalled();
  });

    it('should not assign the Failed payload as profile data and show details', () => {
    getUserDetailsSpy.and.returnValue(of(failPayload));

    component.userData = null;
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(component.loaded).toBe(true);
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
    expect(presentToastSpy).toHaveBeenCalledWith('Upstream access failure', 'danger');
  });

    it('should show fallback message on a Failed response without details', () => {
    getUserDetailsSpy.and.returnValue(of(failNoDetailsPayload));

    component.userData = null;
    component.getUserData();
    expect(component.userData).toBeNull();
    expect(isLoadingNextSpy).toHaveBeenCalledWith(false);
    expect(presentToastSpy).toHaveBeenCalledWith(
      'Could not fetch profile. Please try again later.',
      'danger'
    );
  });

  it('should handle NA values safely without crashing', () => {
    getUserDetailsSpy.and.returnValue(of(naPayload));
    component.userData = null;
    component.getUserData();
    expect(component.userData).toBeTruthy();
    expect(component.userData.rating).toBe('NA');
    expect(component.userData.highest_rating).toBe('NA');
    expect(component.userData.rank).toBe('NA');
    expect(component.userData.level).toBe('NA');
    expect(component.loaded).toBe(true);
  });

  it('should not crash when the payload has no other object', () => {
    getUserDetailsSpy.and.returnValue(of(okPayload));
    component.userData = null;
    component.getUserData();
    expect(component.userData).toBeTruthy();
    expect(component.userData.username).toBe('testuser');
    expect(component.userData.rating).toBe('2000');
    // Safe hasOwnProperty replacement: other may be undefined; do not call hasOwnProperty on undefined
    expect(typeof component.userData.other === 'undefined' || component.userData.other === null || typeof component.userData.other === 'object').toBe(true);
    expect(component.loaded).toBe(true);
    expect(presentToastSpy).not.toHaveBeenCalled();
  });

  it('should replace the profile with fresh data on a successful refresh', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(freshPayload));

    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledWith('atcoder', 'testuser');
    expect(component.userData).toBe(freshPayload);
    expect(component.userData.rating).toBe('2100');
    expect(component.userData.highest_rating).toBe('2300');
    expect(component.isRefreshing).toBe(false);
  });

  it('should keep the existing profile and show an error when refresh returns Failed', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(of(failPayload));

    component.refreshUserData();
    expect(component.userData).toBe(okPayload);
    expect(presentToastSpy).toHaveBeenCalledWith('Upstream access failure', 'danger');
    expect(component.isRefreshing).toBe(false);
  });

  it('should keep the existing profile and stop refreshing when the request completes without data', () => {
    component.userData = okPayload;
    refreshUserDetailsSpy.and.returnValue(EMPTY);

    component.refreshUserData();
    expect(component.userData).toBe(okPayload);
    expect(component.isRefreshing).toBe(false);
  });

  it('should not start a second refresh while one is in progress', () => {
    const pending = new Subject<any>();
    refreshUserDetailsSpy.and.returnValue(pending);
    component.userData = okPayload;

    component.refreshUserData();
    expect(component.isRefreshing).toBe(true);
    component.refreshUserData();
    expect(refreshUserDetailsSpy).toHaveBeenCalledTimes(1);

    pending.next(freshPayload);
    pending.complete();
    expect(component.isRefreshing).toBe(false);
    expect(component.userData).toBe(freshPayload);
  });
});

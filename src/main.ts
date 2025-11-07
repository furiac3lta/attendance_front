import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { LoaderInterceptor } from './app/core/interceptors/loader.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers!,

    // ✅ JWT FUNCIONANDO
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // ✅ LoaderInterceptor clásico
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
  ],
}).catch(err => console.error(err));

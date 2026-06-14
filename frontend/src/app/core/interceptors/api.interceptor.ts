import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar request — en futuro se puede agregar auth token aquí
  const clonedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  return next(clonedReq);
};

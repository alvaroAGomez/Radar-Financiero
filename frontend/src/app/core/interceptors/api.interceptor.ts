import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo agregar Content-Type en requests con body (POST, PUT, PATCH).
  // Los GET no deben llevar Content-Type ya que no tienen body.
  const needsContentType = ['POST', 'PUT', 'PATCH'].includes(req.method);

  const clonedReq = req.clone({
    setHeaders: {
      ...(needsContentType ? { 'Content-Type': 'application/json' } : {}),
      'Accept': 'application/json',
    },
  });

  return next(clonedReq);
};

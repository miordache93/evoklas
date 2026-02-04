import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  saveProducer({ name, icon }: any): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', icon);

    return this.http.post('/api/admin/producers', formData);
  }

  saveU({ fullName, email, role, password }: any): Observable<any> {
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('password', password);
    return this.http.post('/api/users', formData);
  }

  editProducer({ id, name, icon }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('file', icon);
    return this.http.put(`/api/admin/producers/${id}`, formData);
  }

  editUser({ id, fullName, email, role, password, active }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('password', password);
    formData.append('active', active);
    return this.http.put(`/api/users/${id}`, formData);
  }


  resetPass({ id, password }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('password', password);
    return this.http.put(`/api/users/resetPass/${id}`, formData);
  }

  deleteUser({ id }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    return this.http.put(`/api/users/delete/${id}`, formData);
  }

  deletePackage({ id }: any): Observable<any> {
    return this.http.delete(`/api/admin/packages/${id}`);
  }

  editCars({ id, name, icon, producerId, description }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('file', icon);
    formData.append('producerId', producerId);

    if (description) {
      formData.append('description', description);
    }

    return this.http.put(`/api/admin/cars/${id}`, formData);
  }

  editCarVersion({ id, name, icon, carId }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('carId', carId);
    formData.append('file', icon);

    return this.http.put(`/api/cars/versions/${id}`, formData);
  }

  editEngines({ id, name, power, fuel, price,  driveType, transmision, carId, engine }: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('name', name);
    formData.append('power', power);
    formData.append('fuel', fuel);
    formData.append('carId', carId);
    formData.append('price', price);
    formData.append('driveType', driveType);
    formData.append('transmision', transmision);
    formData.append('engine', engine);

    return this.http.put(`/api/cars/engines/${id}`, formData);
  }

  deleteProducer(id: any): Observable<any> {
    return this.http.delete(`/api/producers/${id}`);
  }

  deleteCars(id: any): Observable<any> {
    return this.http.delete(`/api/cars/${id}`);
  }

  deleteCarVersions(id: any): Observable<any> {
    return this.http.delete(`/api/cars/versions/${id}`);
  }

  deleteEngines(id: any): Observable<any> {
    return this.http.delete(`/api/cars/engines/${id}`);
  }

  saveCarModel(carModel: any): Observable<any> {
    const {
      name,
      icon,
      description,
      producerId } = carModel;

    const formData = new FormData();
    formData.append('name', name);


    if (icon) {
      formData.append('file', icon);
    }

    if (description) {
      formData.append('description', description);
    }
    formData.append('producerId', producerId);

    return this.http.post('/api/admin/cars', formData);
  }

  saveCarVersion(carVersion: any): Observable<any> {
    const {
      name,
      icon,
      carId } = carVersion;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', icon);
    formData.append('carId', carId);
    return this.http.post('/api/admin/cars/versions', formData);
  }

  saveEngineModel(engineData: any): Observable<any> {
    return this.http.post('/api/cars/engines', engineData);
  }

  getProducers(): Observable<any> {
    return this.http.get('/api/producers');
  }

  getClientRequest(): Observable<any> {
    return this.http.get('/api/requests/admin');
  }

  getCarsByProducer(producerId: number): Observable<any> {
    return this.http.get(`/api/cars/${producerId}`);
  }

  getCars(): Observable<any> {
    return this.http.get('/api/cars/');
  }

  getCarVersions(): Observable<any> {
    return this.http.get('/api/cars/versions');
  }

  getEngines(): Observable<any> {
    return this.http.get('/api/cars/engines');
  }

  getVersionsByCar(carId: number): Observable<any> {
    return this.http.get(`/api/cars/versions/${carId}`);
  }

  getUsers(): Observable<any> {
    return this.http.get('/api/admin/users');
  }

  savePackage(packageData: any): Observable<any> {
    return this.http.post('/api/admin/packages', packageData);
  }

  getPackages(): Observable<any> {
    return this.http.get('/api/packages');
  }

  editPackage({id, title, description, price, nr_requests}: any): Observable<any> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('nr_requests', nr_requests);
    return this.http.put(`/api/admin/packages/${id}`, formData);
  }

  exportProducerData(producerId: number): Observable<any> {
    return this.http.get(`/api/admin/producers/${producerId}/export`);
  }

  handleMultipleRequests(requests: any[]): Observable<any[]> {
    const observables = requests.map(request => {
      if (!request.id) {
        if (!request.versionId || !request.carId) {
            return throwError('Invalid row data provided');
        }
      }

      if (request.id) {
        return this.editEngines(request);
      } else {
        return this.saveEngineModel(request);
      }
    });

    return forkJoin(observables);
  }
}

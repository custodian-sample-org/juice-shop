/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private readonly hostServer = environment.hostServer
  private readonly host = '/rest/admin' + this.hostServer

  constructor (private readonly http: HttpClient) { }

  getApplicationVersion () {
    return this.http.get('/application-version' + this.host).pipe(
      map((response: any) => response.version),
      catchError((error: Error) => { throw error })
    )
  }
}

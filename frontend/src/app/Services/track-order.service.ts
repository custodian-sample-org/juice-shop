/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class TrackOrderService {
  private readonly hostServer = environment.hostServer
  private readonly host = '/rest/track-order' + this.hostServer

  constructor (private readonly http: HttpClient) { }

  find (params: string) {
    params = encodeURIComponent(params)
    return this.http.get(`${this.host}/${params}`).pipe(map((response: any) => response), catchError((error) => { throw error }))
  }
}

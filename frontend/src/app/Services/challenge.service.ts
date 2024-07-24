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
export class ChallengeService {
  private readonly hostServer = environment.hostServer
  private readonly host = '/api/Challenges' + this.hostServer
  constructor (private readonly http: HttpClient) { }

  find (params?: any) {
    return this.http.get('/' + this.host, { params: params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  repeatNotification (challengeName: string) {
    return this.http.get('/rest/repeat-notification' + this.hostServer, { params: { challenge: challengeName } }).pipe(catchError((err) => { throw err }))
  }

  continueCode () {
    return this.http.get('/rest/continue-code' + this.hostServer).pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFindIt () {
    return this.http.get('/rest/continue-code-findIt' + this.hostServer).pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFixIt () {
    return this.http.get('/rest/continue-code-fixIt' + this.hostServer).pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  restoreProgress (continueCode: string) {
    return this.http.put(continueCode + '/rest/continue-code/apply/' + this.hostServer, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFindIt (continueCode: string) {
    return this.http.put(continueCode + '/rest/continue-code-findIt/apply/' + this.hostServer, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFixIt (continueCode: string) {
    return this.http.put(continueCode + '/rest/continue-code-fixIt/apply/' + this.hostServer, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}

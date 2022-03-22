import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';
import { request, gql } from "graphql-request";

const query1 = gql`
query getRecentSubmissionList($username: String!, $limit: Int) {
    recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
        __typename
    }
}`;


const query2 = gql`
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
        starRating
        userAvatar
      }
    }
  }`;
  
const requestHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:8100',
  'Access-Control-Allow-Credentials': 'true'
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  constructor(
    private _http: HttpClient,
    private _env: EnvService
  ) { }

  getPlatforms() {
    return this._http.get(this._env.Mongo_API_URL+'/platform/details', this.httpOptions)
  }

  updatePlatform(platformName, username) {
    return this._http.put(this._env.Mongo_API_URL+'/platform/updateplatform', {platformName, username}, this.httpOptions)
  }

  getUserDetails1(platform, username) {
    return this._http.get(this._env.User_API_URL1+`/${platform}/${username}`, this.httpOptions)
  }
  
  getUserDetails2(platform, username) {
    return this._http.get(this._env.User_API_URL2+`/${platform}/${username}`, this.httpOptions)
  }

  getLeetCodeSubmissionStats = async (username: any): Promise<any> =>
    await request("https://obscure-escarpment-76911.herokuapp.com/https://leetcode.com/graphql", query1, { username }, requestHeaders).catch(()=>{
      return null
    });

  getLeetCodeRecentSubmission = async (username): Promise<any> => await request("https://obscure-escarpment-76911.herokuapp.com/https://leetcode.com/graphql", query2, { username }, requestHeaders).catch(()=>{
    return null
  });
}

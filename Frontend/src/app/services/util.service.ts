import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  extractPlatforms(data, platformArray) {
    let newData = [];
    if(platformArray.length > 0) {
      data.forEach(event => {
        platformArray.forEach(platform => {
          if (event.url.includes(platform)) {
            newData.push(event)
          }
        })
      })
      return newData;
    } else {
      return data;
    }
  }

  extractTime(data, time) {
    if(time.length > 0) {
      let newData = [];
      let dateToCalculate = new Date(new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))
      if(time == 'today') {
        dateToCalculate = new Date(+new Date().setHours(23, 59, 59, 59))
      }
      else if(time == 'tomorrow') {
        dateToCalculate = new Date(+new Date().setHours(23, 59, 59, 59) + 1*86400000)
      }
      else if(time == 'weak') {
        dateToCalculate = new Date(+new Date().setHours(23, 59, 59, 59) + 7*86400000)
      }
      else if(time == 'month') {
        dateToCalculate = new Date(dateToCalculate.getFullYear(), dateToCalculate.getMonth()+1, 1, 0, 0, -1);
      }

      data.forEach(event => {
        let eventDate = new Date(new Date(event.start_time).toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))
        if((dateToCalculate.valueOf() - eventDate.valueOf()) > 0) {
          newData.push(event);
        } 
      })

      return newData;
    } else {
      return data;
    }
  }

  calculateTime(duration) {
    let totalD = Math.abs(Math.floor(duration / 1000));
    let years = Math.floor(totalD / (365 * 60 * 60 * 24));
    let months = Math.floor((totalD - years * 365 * 60 * 60 * 24) / (30 * 60 * 60 * 24));
    let days = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24) / (60 * 60 * 24));
    let hours = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24) / (60 * 60));
    let minutes = Math.floor((totalD - years * 365 * 60 * 60 * 24 - months * 30 * 60 * 60 * 24 - days * 60 * 60 * 24 - hours * 60 * 60) / (60));
    
    let startIn = '';
    
    if (days > 0) {
      if(days == 1) 
        startIn += days + ' day '
      else 
        startIn += days + ' days '
    }
    if (hours > 0) {
      startIn += hours + ' hours '
    }
    if (minutes > 0) {
      startIn += minutes + ' minutes'
    }

    return startIn
  }

  convertDateinIST(events) {
    let newEvent = []
    events.forEach(event => {
      let today = new Date(new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))
      let eventDate = new Date(new Date(event.start_time).toLocaleString("en-US", { timeZone: 'Asia/Kolkata' }))
      if (today <= eventDate) {
        let total = (eventDate.valueOf() - today.valueOf());
        event['startIn'] = this.calculateTime(total)
        let duration = Math.abs(new Date(event['start_time']).valueOf() - new Date(event['end_time']).valueOf())
        event['duration'] = this.calculateTime(duration)
        newEvent.push(event)
      }
    })
    return newEvent
  }
}

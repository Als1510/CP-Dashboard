import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.page.html',
  styleUrls: ['./resources.page.scss'],
})
export class ResourcesPage implements OnInit {

  constructor() { }

  platforms = [
    { name: 'Hackerrank', url: 'https://www.hackerrank.com', img: 'hackerrank.png' },
    { name: 'Hackerearth', url: 'https://www.hackerearth.com', img: 'hackerearth.png' },
    { name: 'Codechef', url: 'https://www.codechef.com', img: 'codechef.png' },
    { name: 'Codeforces', url: 'https://www.codeforces.com', img: 'codeforces.png' },
    { name: 'Leetcode', url: 'https://www.leetcode.com', img: 'leetcode.png' },
    { name: 'SPOJ', url: 'https://www.spoj.com/', img: 'spoj.png' },
    { name: 'Atcoder', url: 'https://www.atcoder.com/', img: 'atcoder.png' },
    { name: 'Topcoder', url: 'https://www.topcoder.com/', img: 'topcoder.png' },
    { name: 'Google', url: 'https://codingcompetitions.withgoogle.com/', img: 'google.png' },
    { name: 'FB Hackercup', url: 'https://www.facebook.com/hackercup/', img: 'fbhackercup.jpg' },
    { name: 'Project Euler', url: 'https://projecteuler.net/', img: 'projecteuler.png' },
    { name: 'GeeksForGeeks', url: 'https://geeksforgeeks.org/', img: 'geeksforgeeks.png' },
    { name: 'Newtons School', url: 'https://my.newtonschool.co/', img: 'newtonschool.png' },
    { name: 'ICPC', url: 'https://icpc.global/', img: 'icpc.png' },
    { name: 'Algoge', url: 'http://algoge.com/', img: 'algoge.png' },
    { name: 'Lightoj', url: 'https://lightoj.com/', img: 'lightoj.png' },
    { name: 'Codility', url: 'https://codility.com/', img: 'codility.png' },
  ]

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.page.html',
  styleUrls: ['./resources.page.scss'],
})
export class ResourcesPage implements OnInit {

  constructor() { }

  platforms = [
    { name: 'Hackerrank', url: 'https://www.hackerrank.com', img:'hackerrank.png' },
    { name: 'Hackerearth', url: 'https://www.hackerearth.com', img:'hackerearth.png' },
    { name: 'Codechef', url: 'https://www.codechef.com',img:'codechef.png' },
    { name: 'Codeforces', url: 'https://www.codeforces.com',img:'codeforces.png' },
    { name: 'Leetcode', url: 'https://www.leetcode.com',img:'leetcode.png' },
    { name: 'SPOJ', url: 'https://www.spoj.com/', img:'spoj.png' },
    { name: 'Atcoder', url: 'https://www.atcoder.com/', img:'atcoder.png' },
  ]

  ngOnInit() {
  }

}

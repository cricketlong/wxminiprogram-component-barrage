
Component({
  properties: {
    text: {
      type: String,
      value: "text"
    }
  },

  data: {
    bullets: [],
    left: 0,
    pace: 5,
    windowWidth: 0,
    length: 20,
    interval: 200
  },

  methods: {
    moveBullet: function() {
      var thisPage = this;
      var timer = setInterval(()=> {
        var bullets = this.data.bullets;
        for (var i = 0;i < bullets.length;i++) {
          if(-bullets[i].left < bullets[i].width) {
            bullets[i].left -= thisPage.data.pace;
            console.log("move left");
          } else {
            bullets[i].left = thisPage.data.windowWidth;
            console.log("reset");
          }
        }

        // update all bullets
        thisPage.setData({
          bullets: bullets
        });

      }, thisPage.data.interval);

      thisPage.setData({
        timer: timer
      });
    },

    pushBackBullet(text, left, top) {
      this.data.bullets.push({"text": text, "left": left, "top": top, "width": text.length*10});
    }
  },

  ready() {
    this.setData({
      left: wx.getSystemInfoSync().windowWidth,
      windowWidth: wx.getSystemInfoSync().windowWidth
    });

    this.pushBackBullet("biubiubiu", this.data.windowWidth, 0);
    this.pushBackBullet("aabbcc", this.data.windowWidth, 50);

    this.moveBullet();
  },
})

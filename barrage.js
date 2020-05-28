
Component({
  properties: {
    text: {
      type: String,
      value: "text"
    }
  },

  data: {
    bullets: [],
    bulletsPool: [],
    windowSize: 2,
    nextBulletIndex: -1,
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
            console.log("left");
          } else {
            bullets[i].left = this.data.windowWidth;
            if (thisPage.hasNextBullet()) {
              bullets[i].displaying = false;
              bullets[i] = thisPage.getNextBullet();
              bullets[i].displaying = true;
              console.log("next");
            }
            else {
              console.log("reset");
            }
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

    addBulletToPool(text, left, top) {
      this.data.bulletsPool.push({"text": text,
                                  "left": left,
                                  "top": top,
                                  "width": text.length*10,
                                  "displaying": false});
    },

    /*
    emplaceFrontBullet(text, left, top) {
      this.pushFrontBullet({"text": text, "left": left, "top": top, "width": text.length*10});
    },

    emplaceBackBullet(text, left, top) {
      this.pushBackBullet({"text": text, "left": left, "top": top, "width": text.length*10});
    },

    pushFrontBullet(obj) {
      this.data.bullets.unshift(obj);
    },

    pushBackBullet(obj) {
      this.data.bullets.push(obj);
    },

    popFrontBullet() {
      this.data.bullets.shift();
    },*/

    popBackBullet() {
      this.data.bullets.pop();
    },

    initBullets() {
      if (this.data.windowSize > 0) {
        for (var i = 0;i < this.data.windowSize;i++) {
          this.data.bullets.push(this.data.bulletsPool[i]);
          this.data.bullets[i].displaying = true;
        }
        this.data.nextBulletIndex = this.data.windowSize;
      }
    },

    getNextBullet() {
      var b = this.data.bulletsPool[this.data.nextBulletIndex++];

      // loop maximally this.data.bulletsPool.length times.
      for (var n = 0;n < this.data.bulletsPool.length;n++) {
        if (this.data.nextBulletIndex >= this.data.bulletsPool.length) {
          this.data.nextBulletIndex = 0;
        }

        if (this.data.bulletsPool[this.data.nextBulletIndex].displaying == true) {
          this.data.nextBulletIndex++;
        }
      }

      console.log("nextIndex: " + this.data.nextBulletIndex);

      return b;
    },

    hasNextBullet() {
      return this.data.nextBulletIndex >= 0;
    },
  },

  ready() {
    this.setData({
      left: wx.getSystemInfoSync().windowWidth,
      windowWidth: wx.getSystemInfoSync().windowWidth
    });

    // fill pool
    this.addBulletToPool("biubiubiubiubiubiu", this.data.windowWidth, 0);
    this.addBulletToPool("a", this.data.windowWidth, 15);
    this.addBulletToPool("112233", this.data.windowWidth, 30);
    //this.addBulletToPool("^_^", this.data.windowWidth, 45);
    //this.addBulletToPool("<=====>", this.data.windowWidth, 60);

    this.initBullets();

    this.moveBullet();
  },
})

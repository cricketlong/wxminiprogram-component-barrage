
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
    numLanes: 2,
    laneHeight: 8,
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
          } else {
            // try to get new bullet
            bullets[i].left = this.data.windowWidth;
            if (thisPage.hasNextBullet()) {
              bullets[i].displaying = false;
              var top = bullets[i].top;
              bullets[i] = thisPage.getNextBullet();
              bullets[i].displaying = true;
              bullets[i].top = top;
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

    addBulletToPool(text, left) {
      this.data.bulletsPool.push({"text": text,
                                  "left": left,
                                  "top": 0,
                                  "width": text.length*10,
                                  "displaying": false});
    },

    initBullets() {
      if (this.data.numLanes > 0) {
        var nBullets = this.data.numLanes < this.data.bulletsPool.length ?
                       this.data.numLanes : this.data.bulletsPool.length;
        for (var i = 0;i < nBullets;i++) {
          this.data.bullets.push(this.data.bulletsPool[i]);
          this.data.bullets[i].displaying = true;
          this.data.bullets[i].top = i*this.data.laneHeight;
        }
        this.data.nextBulletIndex = this.data.numLanes;
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

    var lanes = [];
    for (var i = 0;i < this.data.numLanes;i++) {
      lanes[i] = false;
    }

    // fill pool
    this.addBulletToPool("biubiubiubiubiubiu", this.data.windowWidth);
    this.addBulletToPool("a", this.data.windowWidth);
    this.addBulletToPool("112233", this.data.windowWidth);
    this.addBulletToPool("^_^", this.data.windowWidth);
    this.addBulletToPool("<=====>", this.data.windowWidth);

    this.initBullets();

    this.moveBullet();
  },
})

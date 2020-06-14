
Component({
  properties: {
    width: {
      type: Number,
      value: 0
    },
    bgImage: {
      type: String,
      value: ""
    },
    bgImageWidth: {
      type: Number,
      value: 0
    },
    bgImageHeight: {
      type: Number,
      value: 0
    },
    bulletsUrls: {
      type: String,
      value: ""
    },
    bulletsPerUrl: {
      type: Number,
      value: 0
    }
  },

  data: {
    bullets: [],          // displaying bullets
    bulletsPool: [],      // bullets pool
    bulletsPoolSize: 10,  // bullets pool capacity
    bulletsBuffer: [],    // buffer of bullets that are ready to put into pool, e.g. bullets got from url
    bulletsPerUrl: 0,     // buffer capacity
    numLanes: 3,
    laneHeight: 15,
    nextBulletIndex: -1,
    left: 0,
    pace: 5,
    charWidth: 14,        // Width in pixel of a character.
    counter: 0,
    interval: 200
  },

  methods: {
    moveBullet: function() {
      var thisPage = this;
      var timer = setInterval(()=> {
        if ((thisPage.data.bullets.length == 0) && (thisPage.data.bulletsBuffer.length > 0)) {
          for (var i = 0;i < thisPage.data.bulletsBuffer.length;i++) {
            var newBulletText = thisPage.data.bulletsBuffer[i];
            thisPage.addBulletToPool(newBulletText, thisPage.data.width);
          }
          thisPage.data.bulletsBuffer = [];
          thisPage.updateBulletsFromPool();
        }

        var bullets = thisPage.data.bullets;
        for (var i = 0;i < bullets.length;i++) {
          if(-bullets[i].left < bullets[i].width) {
            bullets[i].left -= thisPage.data.pace;
          } else {
            thisPage.data.counter++;
            if (thisPage.data.counter >= thisPage.data.bulletsPoolSize) {
              thisPage.data.counter = 0;
              thisPage.getBulletsFromUrls();
            }

            bullets[i].left = this.data.width;
            // try to get new bullet
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
                                  "width": text.length * this.data.charWidth,
                                  "displaying": false});
    },

    updateBulletsFromPool() {
      var nBullets = this.data.numLanes < this.data.bulletsPool.length ?
                     this.data.numLanes : this.data.bulletsPool.length;

      for (var i = 0;i < nBullets;i++) {
        this.data.bullets.push(this.data.bulletsPool[i]);
        this.data.bullets[i].displaying = true;
        this.data.bullets[i].top = i*this.data.laneHeight;
      }
      this.data.nextBulletIndex = this.data.numLanes < this.data.bulletsPool.length ?
                                  this.data.numLanes : 0;
    },

    initBullets() {
      if (this.data.numLanes > 0) {
        if (this.data.bullets.length > 0) {
          this.updateBulletsFromPool();
        }
        else{
          this.getBulletsFromUrls();
        }
      }
      else {
        console.log("No available lane.");
      }
    },

    getNextBullet() {
      // We check bulletsBuffer first then bulletsPool.

      var b;
      if (this.data.bulletsBuffer.length > 0) {
        var newBulletText = this.data.bulletsBuffer.pop();
        if (this.data.bulletsPool.length < this.data.bulletsPoolSize) {
          // Add new bullet to pool
          this.addBulletToPool(newBulletText, newBulletText * this.data.charWidth);
          this.data.nextBulletIndex = this.data.bulletsPool.length - 1;
          b = this.data.bulletsPool[this.data.nextBulletIndex++];
        }
        else {
          // replace a bullet in pool with new bullet
          b = this.data.bulletsPool[this.data.nextBulletIndex++];
          b.text = newBulletText;
          b.width = newBulletText.length * this.data.charWidth;
        }
      }
      else {
        // Get next bullet in pool
        b = this.data.bulletsPool[this.data.nextBulletIndex++];
      }

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

    getBulletsFromUrlSync(url) {
      var thisPage = this;
      return new Promise((resolve, reject) => {
        wx.request({
          url: url,
          success: function(res) {
            if (res.data.length > thisPage.data.bulletsPerUrl) {
              resolve(res.data.slice(0, thisPage.data.bulletsPerUrl));
            }
            else {
              resolve(res.data);
            }
          }
        });
      });
    },

    async getBulletsFromUrls() {
      if ((this.data.bulletsUrls.length > 0) && (this.data.bulletsPerUrl > 0)) {
        var urls = this.data.bulletsUrls.split('|');
        this.data.bulletsBuffer = [];
        for (var i = 0;i < urls.length;i++) {
          var newBulletTexts = await this.getBulletsFromUrlSync(urls[i]);
          this.data.bulletsBuffer.push(...newBulletTexts);
        }
      }
    },
  },

  ready() {
    if (this.data.bgImage) {
      this.setData({
        bgImage: this.data.bgImage,
        bgImageWidth: this.data.bgImageWidth,
        bgImageHeight: this.data.bgImageHeight
      });
    }

    // fill pool
    /*
    this.addBulletToPool("biubiubiubiubiubiu", this.data.width);
    this.addBulletToPool("a", this.data.width);
    this.addBulletToPool("112233", this.data.width);
    this.addBulletToPool("^_^", this.data.width);
    this.addBulletToPool("<=====>", this.data.width);
    */

    this.initBullets();
    this.moveBullet();
  }
})

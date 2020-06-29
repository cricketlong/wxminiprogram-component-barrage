
Component({
  properties: {
    width: {
      type: Number,
      value: 0
    },
    numLanes: {
      type: Number,
      value: 0
    },
    laneHeight: {
      type: Number,
      value: 0
    },
    bgImage: {
      type: String,
      value: ""
    },
    bgImageWidth: {
      type: String,
      value: "0px"
    },
    bgImageHeight: {
      type: String,
      value: "0px"
    },
    bulletsUrls: {
      type: String,
      value: ""
    },
    bulletsPerUrl: {
      type: Number,
      value: 0
    },
    displayBullets: {
      type: Boolean,
      value: false
    }
  },

  data: {
    bullets: [],          // displaying bullets
    bulletsPool: [],      // bullets pool
    bulletsPoolSize: 0,   // bullets pool capacity, will be set to bulletsPerUrl*numUrls
    bulletsBuffer: [],    // buffer of bullets that are ready to put into pool, e.g. bullets got from url
    bulletsPerUrl: 0,     // bullets per url
    numLanes: 5,
    laneHeight: 15,
    nextBulletIndex: -1,
    left: 0,
    minPace: 2,
    maxPace: 4,
    charWidth: 16,        // Width in pixel of a character.
    counter: 0,
    interval: 80
  },

  methods: {
    moveBullet: function() {
      var thisPage = this;
      var timer = setInterval(()=> {
        var bullets = [];
        if (thisPage.data.displayBullets == true) {
          if (thisPage.data.bullets.length == 0) {
            if (thisPage.data.bulletsBuffer.length == 0) {
              thisPage.getBulletsFromUrls();
            }
            else {
              for (var i = 0;i < thisPage.data.bulletsBuffer.length;i++) {
                var newBulletText = thisPage.data.bulletsBuffer[i];
                thisPage.addBulletToPool(newBulletText, thisPage.data.width);
              }
              thisPage.data.bulletsBuffer = [];
              thisPage.updateBulletsFromPool();
            }
          }

          bullets = thisPage.data.bullets;
          for (var i = 0;i < bullets.length;i++) {
            if(bullets[i].left > -bullets[i].width) {
              bullets[i].left -= bullets[i].pace;
            } else {
              thisPage.data.counter++;
              if (thisPage.data.counter > thisPage.data.bulletsPoolSize) {
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
                bullets[i].pace = thisPage.getRandomPace();
              }
            }
          }
        }
        else {
          // clear bullets buffer and pool
          thisPage.setData({
            bulletsBuffer: [],
            bulletsPool: []
          });
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
        this.data.bullets[i].pace = this.getRandomPace();
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

    getBulletsFromUrls() {
      var thisPage = this;
      return new Promise(async (resolve, reject) => {
        if ((thisPage.data.bulletsUrls.length > 0) && (thisPage.data.bulletsPerUrl > 0)) {
          var urls = thisPage.getBulletsUrls();
          thisPage.data.bulletsBuffer = [];
          for (var i = 0;i < urls.length;i++) {
            var newBulletTexts = await thisPage.getBulletsFromUrlSync(urls[i]);
            thisPage.data.bulletsBuffer.push(...newBulletTexts);
          }
        }
        resolve("");
      });
    },

    getBulletsUrls() {
      return this.data.bulletsUrls.split('|');
    },

    getRandomPace() {
      var diff = this.data.maxPace - this.data.minPace;
      if (diff > 0) {
        return this.data.minPace + Math.random() % (diff + 1);
      }

      return 1;
    }
  },

  ready() {
    if (this.data.bgImage) {
      this.setData({
        bgImage: this.data.bgImage,
        bgImageWidth: this.data.bgImageWidth,
        bgImageHeight: this.data.bgImageHeight
      });
    }

    if (this.data.numLanes < 1) {
      this.setData({
        numLanes: 5  // default value of numLanes if not set.
      });
    }

    if (this.data.laneHeight < 1) {
      this.setData({
        laneHeight: 15  // default value of laneHeight if not set.
      });
    }

    this.setData({
      counter: this.data.numLanes,
      bulletsPoolSize: this.data.bulletsPerUrl * this.getBulletsUrls().length
    });

    this.initBullets();
    this.moveBullet();
  }
})

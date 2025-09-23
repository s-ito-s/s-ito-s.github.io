// 定数
const SCALE_HEIGHT = 80
const MARGIN_Y = 60
const TIMELINE_HEIGHT = 40
const SCALE_TIME_PER_PIX = [
  {scale: 'msec', timePerPix: 0.001},
  {scale: 'sec', timePerPix: 6},
  {scale: 'min', timePerPix: 240},
  {scale: 'hour', timePerPix: 18000},
  {scale: 'day', timePerPix: 600001}
]

class TimelineViewer {

  // Dom
  dom = null
  canvas = null

  // タイムライン
  timelines = []

  // 時間
  startTimeMs = new Date().getTime()
  timeMsPerPix = 50 // 1 ピクセル当たりミリ秒
  minTimeMsPerPix = 0.005 // 最小のピクセル当たりミリ秒
  maxTimeMsPerPix = 1500000 // 最大のピクセル当たりミリ秒

  // マウス操作
  isMouseDown = false
  mousePosX = 0

  // 当たり判定
  renderedRects = []
  selectedEvent = null

  // コールバック
  onChangeScale = null

  initialize(dom) {
    this.canvas = document.createElement("canvas");
  
    this.canvas.addEventListener("mousedown", (e) => {
      this.isMouseDown = true
      this.mousePosX = e.clientX
      
      this.selectedEvent = null
      for (let i = 0; i < this.renderedRects.length; ++i) {
        const rect = this.renderedRects[i]
        if (isInsideRect(rect, e.offsetX, e.offsetY)) {
          this.selectedEvent = {
            timelineIndex: rect.timelineIndex,
            eventIndex: rect.eventIndex,
          }
          break
        }        
      }

      this.draw()
    })
  
    this.canvas.addEventListener("mouseup", (e) => {
      this.isMouseDown = false
    })
  
    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown) {
        return
      }
      const diffX = e.clientX - this.mousePosX
      this.startTimeMs -= diffX * this.timeMsPerPix
      this.mousePosX = e.clientX
      this.draw();
    })
  
    this.canvas.addEventListener("wheel", (e) => {
      const prevTimePerPix = this.timeMsPerPix
      const diff = e.deltaY
      let nextTimePerPix = 0
      if (diff > 0) {
        nextTimePerPix = this.timeMsPerPix * 1.1
      } else {
        nextTimePerPix = this.timeMsPerPix * 0.9
      }
      const prevScale = this.getScale()
      this.timeMsPerPix = Math.max(this.minTimeMsPerPix, Math.min(this.maxTimeMsPerPix, nextTimePerPix)) 
      this.startTimeMs += (prevTimePerPix - this.timeMsPerPix) * e.offsetX
      const newScale = this.getScale()
      if (prevScale !== newScale && this.onChangeScale) {
        this.onChangeScale(newScale)
      }
      this.draw();
    })
  
    window.addEventListener('resize', () => {
      this.resize()
    })
  
    this.dom = dom
    this.dom.appendChild(this.canvas);
  
    this.resize();
  }

  finalize() {
    this.dom.removeChild(this.canvas);
    this.dom = null
    this.canvas = null
    this.timelines = []
    window.removeEventListener('resize')
  }

  setTimelines(timelines) {
    this.timelines = timelines.map( (timeline) => {
      const events = timeline.events.map( (event) => {
        return {
          start: toMsTime(event.startTime),
          end: toMsTime(event.endTime),
          comment: event.comment
        }
      })
      return {
        name: timeline.name,
        events
      } 
    })
    this.resize()
  }

  setStartTime(startTime) {
    this.startTimeMs = toMsTime(startTime)
    this.draw()
  }

  setStartTimeMs(startTimeMs) {
    this.startTimeMs = startTimeMs
    this.draw()
  }

  getStratTimeMs() {
    return this.startTimeMs
  }

  setTimePerPix(timePerPix) {
    const startTimePerPix = this.timeMsPerPix
    const targetTimePerPix = Math.max(this.minTimeMsPerPix, Math.min(this.maxTimeMsPerPix, timePerPix))
    const startTime = new Date().getTime()
    const endTime = startTime + 500
    const focusedTime = this.canvas.width / 2 * startTimePerPix + this.startTimeMs
    const animation = () => {
      setTimeout( () => {
        const now = new Date().getTime()
        const progress = Math.max(Math.min((now - startTime) / (endTime - startTime), 1), 0)
        this.timeMsPerPix = startTimePerPix + (targetTimePerPix - startTimePerPix) * progress
        this.startTimeMs = focusedTime - this.timeMsPerPix * (this.canvas.width / 2)
        this.draw()
        if (progress < 1) {
          animation()
        }
      },10)
    }
    animation()
  }

  getTimePerPix() {
    return this.timeMsPerPix
  }

  setScale(scale) {
    const s = SCALE_TIME_PER_PIX.find(e => e.scale === scale) 
    if (s) {
      this.setTimePerPix(s.timePerPix)
    }
  }

  getScale() {
    for (let i = SCALE_TIME_PER_PIX.length - 1; i >= 0; --i) {
      if (SCALE_TIME_PER_PIX[i].timePerPix <= this.timeMsPerPix) {
        return SCALE_TIME_PER_PIX[i].scale
      }
    }
    return 'msec'
  }  

  resize() {
    this.canvas.width = this.dom.clientWidth;
    this.canvas.height = SCALE_HEIGHT + 
      (MARGIN_Y + TIMELINE_HEIGHT) * this.timelines.length + MARGIN_Y + 20
    this.canvas.style.width = this.canvas.width + "px"
    this.canvas.style.height = this.canvas.height + "px"
    this.draw()
  }
  
  draw() {
    this.drawFrame();
    this.drawTimelines();
    this.drawScale();
    this.drawSelectedEventInfo();
  }

  ///////////////////////////////////////////////////////////////////
  // Private Methods

  drawFrame() {
    const ctx = this.canvas.getContext("2d");
    const width = this.canvas.width
    const height = this.canvas.height
    drawRect(ctx, 0, 0, width, height, "rgb(240, 240, 240)");
    drawRect(ctx, 0, 0, width, SCALE_HEIGHT, "rgb(30, 30, 30)");
  }
  
  drawScale() {
    const ctx = this.canvas.getContext("2d")
  
    const scaleIntervalMs = this.getScaleIntervalMs()
    const scaleTextType = this.getScaleTextType()
    const endTimeMs = this.startTimeMs + this.canvas.width * this.timeMsPerPix
    let scaleTimeMs = this.startTimeMs - (this.startTimeMs % scaleIntervalMs)
    while(1) {
      if (scaleTimeMs > endTimeMs) {
        break
      }
  
      // 目盛りを描画する
      const posX = this.time2Pos(scaleTimeMs)
      drawLine(ctx, posX, SCALE_HEIGHT * 0.7, posX, this.canvas.height, "rgb(200, 200, 200)")
  
      // 目盛りに描画するテキストを調整
      const date = new Date(scaleTimeMs)
      const month = String(date.getUTCMonth() + 1)
      const day = String(date.getUTCDate())
      const hour = String(date.getUTCHours())
      const min = String(date.getUTCMinutes()).padStart(2, '0')
      const sec = String(date.getUTCSeconds()).padStart(2, '0')
      let text = ''
      if (scaleTextType === 'day') {
        text = month + '/' + day
      }else if (scaleTextType === 'min') {      
        text = hour + ':' + min
      }else if (scaleTextType === 'sec' || scaleTextType === 'msec'){
        text = hour + ':' + min + ':' + sec
      }
  
      // 日時を描画する
      const textWidth = ctx.measureText(text).width
      if (scaleTextType === 'msec') {
        drawText(ctx, posX - textWidth / 2, SCALE_HEIGHT * 0.3, text, "rgb(200, 200, 200)", 16)
        const msec = '.' + String(date.getUTCMilliseconds()).padStart(3, '0')
        const msecTextWidth = ctx.measureText(msec).width
        drawText(ctx, posX - msecTextWidth / 2, SCALE_HEIGHT * 0.6, msec, "rgb(200, 200, 200)", 16)
      } else {
        drawText(ctx, posX - textWidth / 2, SCALE_HEIGHT * 0.6, text, "rgb(200, 200, 200)", 16)
      }
      
      // 0:00:00 の場合は日付も描画する
      if (
        (scaleTextType === 'min' && hour === '0' && min === '00') || 
        (scaleTextType === 'sec' && hour === '0' && min === '00' && sec === '00')
      ) {
        const dateText = month + '/' + day
        const dateTextWidth = ctx.measureText(dateText).width
        drawText(ctx, posX - dateTextWidth / 2, SCALE_HEIGHT * 0.3, dateText, "rgb(200, 200, 200)", 16)      
      }
  
      // デバッグ用にスケールの時間を描画
      // drawText(ctx, 10, 20, this.timeMsPerPix, "rgb(200, 200, 200)", 15)
      
      scaleTimeMs += scaleIntervalMs
    }
  }
  
  drawTimelines() {
    const ctx = this.canvas.getContext('2d');

    this.renderedRects = []
  
    const endTimeMs = this.startTimeMs + this.canvas.width * this.timeMsPerPix
    for (let i = 0; i < this.timelines.length; i++) {
      const timelinePosY = SCALE_HEIGHT + MARGIN_Y * (i + 1) + TIMELINE_HEIGHT * i
      const events = this.timelines[i].events
      const name = this.timelines[i].name
      drawText(ctx, 5, timelinePosY - 5, name, "rgb(20, 20, 20)", 16)      
      drawRect(ctx, 0, timelinePosY, this.canvas.width, TIMELINE_HEIGHT, 'rgb(200, 200, 200)')

      for (let j = 0; j < events.length; ++j) {
        const timelineStartTimeMs = events[j].start
        const timelineEndTimeMs = events[j].end
        
        // タイムラインが現在表示している範囲外の場合は描画しない
        if (timelineEndTimeMs < this.startTimeMs || endTimeMs < timelineStartTimeMs) {
          continue
        }
  
        // タイムラインを描画範囲を計算
        let x = this.time2Pos(timelineStartTimeMs)
        let width = this.time2Pos(timelineEndTimeMs) - this.time2Pos(timelineStartTimeMs)
  
        // タイムラインの開始位置が表示範囲より前の場合の描画位置補正
        if (timelineStartTimeMs < this.startTimeMs && timelineEndTimeMs < endTimeMs) {
          x = 0
          width = this.time2Pos(timelineEndTimeMs) - this.time2Pos(this.startTimeMs)
        }
  
        // タイムラインの終了位置が表示範囲より後の場合の描画位置補正
        if (this.startTimeMs < timelineStartTimeMs && endTimeMs < timelineEndTimeMs ) {
          x = this.time2Pos(timelineStartTimeMs)
          width = this.canvas.width - x
        }
  
        // 消えてしまわないように最低限の幅を確保
        width = Math.max(1, width)
  
        // タイムラインを描画
        drawRect(ctx, x, timelinePosY, width, TIMELINE_HEIGHT, 'rgb(20, 200, 20)')
        strokeRect(ctx, x, timelinePosY, width, TIMELINE_HEIGHT, 'rgb(20, 100, 20)', 2)

        // 当たり判定用の矩形を保存
        this.renderedRects.push({
          x: x,
          y: timelinePosY,
          width: width,
          height: TIMELINE_HEIGHT,
          timelineIndex: i,
          eventIndex: j
        })
      }
    }

    if (this.selectedEvent) {
      const timeline = this.timelines[this.selectedEvent.timelineIndex]
      const event = timeline.events[this.selectedEvent.eventIndex]
      const x = this.time2Pos(event.start)
      const timelinePosY = SCALE_HEIGHT + MARGIN_Y * (this.selectedEvent.timelineIndex + 1) + TIMELINE_HEIGHT * this.selectedEvent.timelineIndex
      const width = this.time2Pos(event.end) - this.time2Pos(event.start)
      strokeRect(ctx, x, timelinePosY, width, TIMELINE_HEIGHT, 'rgb(250, 20, 20)', 2)    
    }
  }

  drawSelectedEventInfo() {
    if (!this.selectedEvent) {
      return
    }

    const ctx = this.canvas.getContext('2d');
    const timeline = this.timelines[this.selectedEvent.timelineIndex]
    const event = timeline.events[this.selectedEvent.eventIndex]
    const startTime = timeToString(event.start)
    const endTime = timeToString(event.end)
    const elapsedTime = event.end - event.start
    const timeText =  elapsedTime + '[msec] (' + startTime + ' - ' + endTime + ')'
    const posY = this.canvas.height - 5
    drawText(ctx, 5, posY, timeText, "rgb(20, 20, 20)", 15)
    let taskText = timeline.name
    if (event.comment !== '') {
      taskText += ' : ' + event.comment
    }
    drawText(ctx, 5, posY - 20, taskText, "rgb(20, 20, 20)", 15)
  }
    
  getScaleIntervalMs() {
    const map = [
      { timePerPix:0.014,interval:1 },
      { timePerPix:0.04, interval:5 },
      { timePerPix:0.12, interval:10 },
      { timePerPix:0.36, interval:50 },
      { timePerPix:1.2, interval:100 },
      { timePerPix:6, interval:500 },
      { timePerPix:12, interval:1000 },
      { timePerPix:50, interval:1000*5 },
      { timePerPix:120, interval:1000*10 },
      { timePerPix:240, interval:1000*30 },
      { timePerPix:1000, interval:1000*60 },
      { timePerPix:1000*4, interval:1000*60*5 },
      { timePerPix:1000*8, interval:1000*60*10 },
      { timePerPix:1000*18, interval:1000*60*30 },
      { timePerPix:1000*60, interval:1000*60*60 },
      { timePerPix:1000*150, interval:1000*60*60*3 },
      { timePerPix:1000*300, interval:1000*60*60*6 },
      { timePerPix:1000*600, interval:1000*60*60*12 },
    ]
  
    for (const m of map) {
      if(m.timePerPix > this.timeMsPerPix) {
        return m.interval
      }
    }
  
    return 1000*60*60*24
  }
  
  getScaleTextType() {
    if (this.timeMsPerPix < 6) {
      return 'msec'
    }
  
    if (this.timeMsPerPix < 240) {
      return 'sec'
    }
  
    if (this.timeMsPerPix > 1000 * 600) {
      return 'day'
    }
  
    return 'min'
  }
  
  time2Pos (time) {
    return (time - this.startTimeMs) / this.timeMsPerPix
  }
}

function drawLine(ctx, x1, y1, x2, y2, color) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function strokeRect(ctx, x, y, w, h, color, width) {
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.strokeRect(x, y, w, h);
}

function drawText(ctx, x, y, text, color, size) {
  ctx.font = size + "px serif";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function toMsTime (time) {
  const date = new Date()
  date.setUTCFullYear(time.year)
  date.setUTCMonth(time.month - 1)
  date.setUTCDate(time.day)
  date.setUTCHours(time.hour)
  date.setUTCMinutes(time.min)
  date.setUTCSeconds(time.sec)
  date.setUTCMilliseconds(time.msec)
  return date.getTime()
}

function timeToString (time) {
  const date = new Date(time)
  const year = String(date.getUTCFullYear())
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  const min = String(date.getUTCMinutes()).padStart(2, '0')
  const sec = String(date.getUTCSeconds()).padStart(2, '0')
  const msec = String(date.getUTCMilliseconds()).padStart(3, '0')
  return year + '/' + month + '/' + day + ' ' + hour + ':' + min + ':' + sec + '.' + msec
}

function isInsideRect(rect, x, y) {
  return rect.x <= x && x <= rect.x + rect.width && rect.y <= y && y <= rect.y + rect.height
}
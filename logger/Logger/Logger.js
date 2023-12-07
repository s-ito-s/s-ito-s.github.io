class Logger {
  constructor() {
    this.logs = {};
    this.count = 0;
  }

  start(taskName, comment) {
    const logId = this.count;
    this.logs[logId] = {
      taskName,
      comment: comment || '',
      start: new Date(),
      end: null
    };
    ++this.count;
    return logId
  }

  stop(logId, comment) {
    if (logId in this.logs) {
      this.logs[logId].end = new Date();
      if (comment) {
        this.logs[logId].comment = comment;
      }
    }
  }

  output () {
    const logData = []

    for (let key in this.logs) {
      const log = this.logs[key]
      const taskData = logData.find( (e) => {
        return e.name === log.taskName
      })
      if (taskData) {
        taskData.events.push({
          comment: log.comment,
          startTime: toDate(log.start),
          endTime: toDate(log.end),
        })
      }else{
        logData.push({
          name: log.taskName,
          events: [ 
            {
              comment: log.comment,
              startTime: toDate(log.start),
              endTime: toDate(log.end),
            }
          ]
        })
      }
    }

    return logData
  }
}

function toDate(time) {
  return {
    year: time.getFullYear(),
    month: time.getMonth() - 1,
    day: time.getDate(),
    hour: time.getHours(),
    min: time.getMinutes(),
    sec: time.getSeconds(),
    msec: time.getMilliseconds()
  }
}
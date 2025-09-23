class Logger {
  constructor() {
    this.logs = {};
    this.messages = [];
    this.count = 0;
    this.socket = new WebSocket("ws://localhost:3001");

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
    };    

    this.socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
  }

  start(taskName, comment) {
    const logId = this.count;
    this.logs[logId] = {
      taskName,
      comment: comment || '',
      start: toDate(new Date()),
      end: null
    };
    ++this.count;
    return logId
  }

  stop(logId, comment, send = true) {
    if (logId in this.logs) {
      this.logs[logId].end = toDate(new Date());
      if (comment) {
        this.logs[logId].comment = comment;
      }
      const data = {
        type: "log",
        log: this.logs[logId]
      };
      if (send && this.socket.readyState === WebSocket.OPEN){
        this.socket.send(JSON.stringify(data));
      }
    }
  }

  sendMessage(message) {
    if (this.socket.readyState !== WebSocket.OPEN){
      return
    }

    const data = {
      type: "message",
      message,
      time: toDate(new Date())
    };
    this.socket.send(JSON.stringify(data));

    this.messages.push({message: data.message, time: data.time});
  }

  output () {
    const logs = []

    for (let key in this.logs) {
      const log = this.logs[key]
      if (log.end === null) {
        continue;
      }

      const taskData = logs.find( (e) => {
        return e.name === log.taskName
      })
      if (taskData) {
        taskData.events.push({
          comment: log.comment,
          startTime: log.start,
          endTime: log.end,
        })
      }else{
        logs.push({
          name: log.taskName,
          events: [ 
            {
              comment: log.comment,
              startTime: log.start,
              endTime: log.end,
            }
          ]
        })
      }
    }

    return {
      logs: logs,
      messages: this.messages,
    }
  }  
}

function toDate(time) {
  return {
    year: time.getFullYear(),
    month: time.getMonth() + 1,
    day: time.getDate(),
    hour: time.getHours(),
    min: time.getMinutes(),
    sec: time.getSeconds(),
    msec: time.getMilliseconds()
  }
}